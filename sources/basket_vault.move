module cresca::basket_vault {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INVALID_LEVERAGE: u64 = 3;
    const E_INVALID_WEIGHTS: u64 = 4;
    const E_INSUFFICIENT_COLLATERAL: u64 = 5;
    const E_POSITION_NOT_FOUND: u64 = 6;
    const E_NOT_POSITION_OWNER: u64 = 7;
    const E_POSITION_SIZE_TOO_SMALL: u64 = 8;

    /// Maximum leverage allowed (150x - Merkle Trade standard)
    const MAX_LEVERAGE: u64 = 150;

    /// Minimum collateral in octas (0.1 APT)
    const MIN_COLLATERAL: u64 = 10000000;

    /// Minimum position size ($2 equivalent in octas, ~0.002 APT at $10/APT)
    const MIN_POSITION_SIZE: u64 = 200000;

    /// Basket position structure (Isolated Margin)
    struct BasketPosition has key, store {
        owner: address,
        collateral_amount: u64,      // Isolated collateral for this position
        leverage_multiplier: u64,     // 1-150x
        btc_weight: u64,              // Percentage (0-100)
        eth_weight: u64,              // Percentage (0-100)
        sol_weight: u64,              // Percentage (0-100)
        entry_timestamp: u64,
        entry_value: u64,
        is_active: bool,
        is_long: bool,                // Long (true) or Short (false)
        maintenance_margin: u64,      // Minimum to avoid liquidation
        liquidation_price: u64,       // Auto-liquidation price
    }

    /// Global vault storage
    struct Vault has key {
        positions: vector<BasketPosition>,
        total_collateral: u64,
        next_position_id: u64,
    }

    /// Position holder resource
    struct PositionHolder has key {
        position_id: u64,
    }

    /// Initialize the vault (call once)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Vault>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, Vault {
            positions: vector::empty<BasketPosition>(),
            total_collateral: 0,
            next_position_id: 0,
        });
    }

    /// Open a new basket position with isolated margin (up to 150x)
    public entry fun open_position(
        user: &signer,
        vault_addr: address,
        collateral_amount: u64,
        leverage_multiplier: u64,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
        is_long: bool,
    ) acquires Vault, PositionHolder {
        // Validations
        assert!(exists<Vault>(vault_addr), E_NOT_INITIALIZED);
        assert!(leverage_multiplier >= 1 && leverage_multiplier <= MAX_LEVERAGE, E_INVALID_LEVERAGE);
        assert!(btc_weight + eth_weight + sol_weight == 100, E_INVALID_WEIGHTS);
        assert!(collateral_amount >= MIN_COLLATERAL, E_INSUFFICIENT_COLLATERAL);

        let user_addr = signer::address_of(user);
        
        // Calculate position size
        let position_size = collateral_amount * leverage_multiplier;
        assert!(position_size >= MIN_POSITION_SIZE, E_POSITION_SIZE_TOO_SMALL);
        
        // Transfer collateral from user to vault (isolated margin)
        let collateral = coin::withdraw<AptosCoin>(user, collateral_amount);
        coin::deposit(vault_addr, collateral);

        // Get current timestamp
        let current_time = timestamp::now_seconds();

        // Calculate entry value and maintenance margin
        let entry_value = position_size;
        let maintenance_margin = position_size / leverage_multiplier + (position_size * 50) / 10000; // 0.5%
        
        // Calculate liquidation price (simplified - will use weighted basket price)
        let liquidation_price = if (is_long) {
            (entry_value * (10000 - (10000 / leverage_multiplier))) / 10000
        } else {
            (entry_value * (10000 + (10000 / leverage_multiplier))) / 10000
        };

        // Create isolated margin position
        let position = BasketPosition {
            owner: user_addr,
            collateral_amount,
            leverage_multiplier,
            btc_weight,
            eth_weight,
            sol_weight,
            entry_timestamp: current_time,
            entry_value,
            is_active: true,
            is_long,
            maintenance_margin,
            liquidation_price,
        };

        // Store position in vault
        let vault = borrow_global_mut<Vault>(vault_addr);
        let position_id = vault.next_position_id;
        vector::push_back(&mut vault.positions, position);
        vault.total_collateral = vault.total_collateral + collateral_amount;
        vault.next_position_id = position_id + 1;

        // Create position holder for user
        if (exists<PositionHolder>(user_addr)) {
            let holder = borrow_global_mut<PositionHolder>(user_addr);
            holder.position_id = position_id;
        } else {
            move_to(user, PositionHolder {
                position_id,
            });
        };
    }

    /// Close a basket position
    public entry fun close_position(
        user: &signer,
        vault_addr: address,
        position_id: u64,
    ) acquires Vault, PositionHolder {
        assert!(exists<Vault>(vault_addr), E_NOT_INITIALIZED);
        
        let user_addr = signer::address_of(user);
        assert!(exists<PositionHolder>(user_addr), E_POSITION_NOT_FOUND);

        let vault = borrow_global_mut<Vault>(vault_addr);
        assert!(position_id < vector::length(&vault.positions), E_POSITION_NOT_FOUND);

        let position = vector::borrow_mut(&mut vault.positions, position_id);
        assert!(position.owner == user_addr, E_NOT_POSITION_OWNER);
        assert!(position.is_active, E_POSITION_NOT_FOUND);

        // Mark position as inactive
        position.is_active = false;

        // Return collateral to user (simplified - in production would calculate P&L)
        let return_amount = position.collateral_amount;
        vault.total_collateral = vault.total_collateral - return_amount;

        // Transfer collateral back to user
        let collateral = coin::withdraw<AptosCoin>(user, return_amount);
        coin::deposit(user_addr, collateral);
    }

    /// View function: Get position details (with isolated margin info)
    #[view]
    public fun get_position(vault_addr: address, position_id: u64): (address, u64, u64, u64, u64, u64, bool, bool, u64, u64) acquires Vault {
        assert!(exists<Vault>(vault_addr), E_NOT_INITIALIZED);
        
        let vault = borrow_global<Vault>(vault_addr);
        assert!(position_id < vector::length(&vault.positions), E_POSITION_NOT_FOUND);

        let position = vector::borrow(&vault.positions, position_id);
        (
            position.owner,
            position.collateral_amount,
            position.leverage_multiplier,
            position.btc_weight,
            position.eth_weight,
            position.sol_weight,
            position.is_active,
            position.is_long,
            position.maintenance_margin,
            position.liquidation_price
        )
    }

    /// View function: Get total collateral in vault
    #[view]
    public fun get_total_collateral(vault_addr: address): u64 acquires Vault {
        assert!(exists<Vault>(vault_addr), E_NOT_INITIALIZED);
        borrow_global<Vault>(vault_addr).total_collateral
    }

    /// View function: Get user's position ID
    #[view]
    public fun get_user_position_id(user_addr: address): u64 acquires PositionHolder {
        assert!(exists<PositionHolder>(user_addr), E_POSITION_NOT_FOUND);
        borrow_global<PositionHolder>(user_addr).position_id
    }
}
