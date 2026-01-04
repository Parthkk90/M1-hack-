// Move module for Cresca Bucket Protocol
module cresca::bucket_protocol {
    use std::vector;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::account;
    use std::error;

    /// Events
    struct BucketCreatedEvent has drop, store {
        bucket_id: u64,
        owner: address,
        assets: vector<address>,
        weights: vector<u64>,
        leverage: u8,
    }

    struct PositionOpenedEvent has drop, store {
        position_id: u64,
        bucket_id: u64,
        owner: address,
        is_long: bool,
        margin: u64,
        entry_price: u64,
    }

    struct PositionClosedEvent has drop, store {
        position_id: u64,
        owner: address,
        pnl: u128, // Changed from i64
        is_profit: bool, // Track if profit or loss
    }

    struct BucketRebalancedEvent has drop, store {
        bucket_id: u64,
        new_weights: vector<u64>,
    }

    struct LiquidationEvent has drop, store {
        position_id: u64,
        owner: address,
        reason: vector<u8>,
    }

    /// Core Structs
    struct Bucket has store, drop {
        assets: vector<address>,
        weights: vector<u64>,
        leverage: u8,
        owner: address,
    }

    struct Position has store, drop {
        bucket_id: u64,
        is_long: bool,
        margin: u64,
        entry_price: u64,
        owner: address,
        is_active: bool,
    }

    struct Collateral has store, drop {
        owner: address,
        balance: u64,
    }

    /// Mock Oracle for price simulation
    struct MockOracle has store, drop {
        prices: vector<u64>, // price per asset
        funding_rates: vector<u64>, // funding rate per asset
    }

    /// Storage
    struct Buckets has key {
        buckets: vector<Bucket>,
    }

    struct Positions has key {
        positions: vector<Position>,
    }

    struct Collaterals has key {
        collaterals: vector<Collateral>,
    }

    struct Oracles has key {
        oracle: MockOracle,
    }

    /// Event Handles
    struct EventHandles has key {
        bucket_created_events: event::EventHandle<BucketCreatedEvent>,
        position_opened_events: event::EventHandle<PositionOpenedEvent>,
        position_closed_events: event::EventHandle<PositionClosedEvent>,
        bucket_rebalanced_events: event::EventHandle<BucketRebalancedEvent>,
        liquidation_events: event::EventHandle<LiquidationEvent>,
    }

    /// Initialize storage and event handles
    public entry fun init(owner: &signer) {
        let addr = signer::address_of(owner);
        assert!(!exists<Buckets>(addr), error::already_exists(1));
        move_to(owner, Buckets { buckets: vector::empty<Bucket>() });
        move_to(owner, Positions { positions: vector::empty<Position>() });
        move_to(owner, Collaterals { collaterals: vector::empty<Collateral>() });
        move_to(owner, Oracles { oracle: MockOracle { prices: vector::empty<u64>(), funding_rates: vector::empty<u64>() } });
        move_to(owner, EventHandles {
            bucket_created_events: account::new_event_handle<BucketCreatedEvent>(owner),
            position_opened_events: account::new_event_handle<PositionOpenedEvent>(owner),
            position_closed_events: account::new_event_handle<PositionClosedEvent>(owner),
            bucket_rebalanced_events: account::new_event_handle<BucketRebalancedEvent>(owner),
            liquidation_events: account::new_event_handle<LiquidationEvent>(owner),
        });
    }

    /// Create a new bucket
    public entry fun create_bucket(owner: &signer, assets: vector<address>, weights: vector<u64>, leverage: u8) acquires Buckets, EventHandles {
        let addr = signer::address_of(owner);
        assert!(vector::length(&assets) == vector::length(&weights), error::invalid_argument(2));
        assert!(leverage > 0 && leverage <= 20, error::invalid_argument(3)); // leverage cap
        let buckets = borrow_global_mut<Buckets>(addr);
        let bucket_id = vector::length(&buckets.buckets);
        let bucket = Bucket { assets, weights, leverage, owner: addr };
        vector::push_back(&mut buckets.buckets, bucket);
        let handles = borrow_global_mut<EventHandles>(addr);
        let created_bucket = vector::borrow(&buckets.buckets, bucket_id);
        event::emit_event(&mut handles.bucket_created_events, BucketCreatedEvent {
            bucket_id: (bucket_id as u64),
            owner: addr,
            assets: *&created_bucket.assets,
            weights: *&created_bucket.weights,
            leverage: created_bucket.leverage,
        });
    }

    /// Deposit collateral for trading
    public entry fun deposit_collateral(owner: &signer, amount: u64) acquires Collaterals {
        let addr = signer::address_of(owner);
        let collaterals = borrow_global_mut<Collaterals>(addr);
        let found = false;
        let len = vector::length(&collaterals.collaterals);
        let i = 0;
        while (i < len) {
            let c = vector::borrow_mut(&mut collaterals.collaterals, i);
            if (c.owner == addr) {
                c.balance = c.balance + amount;
                found = true;
                break
            };
            i = i + 1;
        };
        if (!found) {
            vector::push_back(&mut collaterals.collaterals, Collateral { owner: addr, balance: amount });
        }
    }

    /// Liquidation threshold: health factor below this value triggers liquidation
    /// Health factor = 1.0 represented as 100 (percentage)
    const LIQUIDATION_THRESHOLD: u64 = 100;
    
    /// Minimum collateralization ratio (150% = 150)
    const MIN_COLLATERAL_RATIO: u64 = 150;

    /// Calculate weighted average price for a bucket based on asset prices and weights
    fun calculate_bucket_price(bucket: &Bucket, prices: &vector<u64>): u64 {
        let total_weight: u64 = 0;
        let weighted_price: u128 = 0;
        let i = 0;
        let len = vector::length(&bucket.assets);
        
        // Calculate total weight
        while (i < len) {
            let weight = *vector::borrow(&bucket.weights, i);
            total_weight = total_weight + weight;
            i = i + 1;
        };
        
        // If total weight is 0, return fallback price
        if (total_weight == 0) {
            return 1000
        };
        
        // Calculate weighted average price
        i = 0;
        while (i < len) {
            let weight = *vector::borrow(&bucket.weights, i);
            // Use asset address index to get price
            // For now, we'll use sequential indices since we don't have asset-to-index mapping
            let price = if (i < vector::length(prices)) {
                *vector::borrow(prices, i)
            } else {
                1000 // fallback price if price not available
            };
            weighted_price = weighted_price + ((price as u128) * (weight as u128));
            i = i + 1;
        };
        
        // Return weighted average: sum(price * weight) / total_weight
        ((weighted_price / (total_weight as u128)) as u64)
    }

    /// Calculate health factor for a position
    /// Health factor = (margin * 100) / (position_value_change_risk)
    /// Returns: health factor as percentage (100 = 1.0, 150 = 1.5, etc.)
    /// Lower health factor = higher liquidation risk
    fun calculate_health_factor(position: &Position, current_price: u64, leverage: u64): u64 {
        // Position value at entry
        let entry_value = (position.margin as u128) * (leverage as u128);
        
        // Current position value based on price movement
        let price_change_ratio = if (position.entry_price > 0) {
            ((current_price as u128) * 100) / (position.entry_price as u128)
        } else {
            100 // No change if entry price is 0
        };
        
        // Calculate unrealized P&L impact
        let current_value = if (position.is_long) {
            // Long position: profits when price increases
            (entry_value * price_change_ratio) / 100
        } else {
            // Short position: profits when price decreases
            (entry_value * (200 - price_change_ratio)) / 100
        };
        
        // Required margin based on leverage (position_value / leverage)
        let required_margin = current_value / (leverage as u128);
        
        // Health factor = actual_margin / required_margin * 100
        if (required_margin == 0) {
            return 10000 // Very healthy if no margin required
        };
        
        let health = ((position.margin as u128) * 100) / required_margin;
        
        // Cap at u64 max to prevent overflow
        if (health > (18446744073709551615 as u128)) {
            10000 // Cap at 100x (10000%)
        } else {
            (health as u64)
        }
    }

    /// Open a position on a bucket
    public entry fun open_position(owner: &signer, bucket_id: u64, is_long: bool, margin: u64) acquires Buckets, Collaterals, Oracles, Positions, EventHandles {
        let addr = signer::address_of(owner);
        let buckets = borrow_global<Buckets>(addr);
        assert!((bucket_id as u64) < (vector::length(&buckets.buckets) as u64), error::not_found(4));
        let bucket = vector::borrow(&buckets.buckets, (bucket_id as u64));
        let collaterals = borrow_global_mut<Collaterals>(addr);
        let i = 0;
        let found = false;
        let len = vector::length(&collaterals.collaterals);
        while (i < len) {
            let c = vector::borrow_mut(&mut collaterals.collaterals, i);
            if (c.owner == addr) {
                assert!(c.balance >= margin, error::invalid_argument(5));
                c.balance = c.balance - margin;
                found = true;
                break
            };
            i = i + 1;
        };
        assert!(found, error::not_found(6));
        let oracles = borrow_global<Oracles>(addr);
        let entry_price = if (vector::length(&oracles.oracle.prices) > 0) {
            calculate_bucket_price(bucket, &oracles.oracle.prices)
        } else {
            1000 // mock price
        };
        let positions = borrow_global_mut<Positions>(addr);
        let position_id = vector::length(&positions.positions);
        let position = Position {
            bucket_id,
            is_long,
            margin,
            entry_price,
            owner: addr,
            is_active: true,
            
        };
        vector::push_back(&mut positions.positions, position);
        let handles = borrow_global_mut<EventHandles>(addr);
        event::emit_event(&mut handles.position_opened_events, PositionOpenedEvent {
            position_id: (position_id as u64),
            bucket_id,
            owner: addr,
            is_long,
            margin,
            entry_price,
        });
    }

    /// Rebalance bucket weights (only owner)
    public entry fun rebalance_bucket(owner: &signer, bucket_id: u64, new_weights: vector<u64>) acquires Buckets, EventHandles {
        let addr = signer::address_of(owner);
        let buckets = borrow_global_mut<Buckets>(addr);
        assert!((bucket_id as u64) < (vector::length(&buckets.buckets) as u64), error::not_found(7));
        let bucket = vector::borrow_mut(&mut buckets.buckets, (bucket_id as u64));
        assert!(bucket.owner == addr, error::permission_denied(8));
        assert!(vector::length(&bucket.assets) == vector::length(&new_weights), error::invalid_argument(9));
        bucket.weights = new_weights;
        let handles = borrow_global_mut<EventHandles>(addr);
        event::emit_event(&mut handles.bucket_rebalanced_events, BucketRebalancedEvent {
            bucket_id,
            new_weights: *&bucket.weights,
        });
    }

    /// Close a position and return P&L (mock calculation)
    public entry fun close_position(owner: &signer, position_id: u64) acquires Positions, Oracles, Collaterals, EventHandles, Buckets {
        let addr = signer::address_of(owner);
        let positions = borrow_global_mut<Positions>(addr);
        assert!((position_id as u64) < (vector::length(&positions.positions) as u64), error::not_found(10));
        let position = vector::borrow_mut(&mut positions.positions, (position_id as u64));
        assert!(position.owner == addr, error::permission_denied(11));
        assert!(position.is_active, error::invalid_state(16)); // Check if position is active
        
        let buckets = borrow_global<Buckets>(addr);
        let bucket = vector::borrow(&buckets.buckets, position.bucket_id);
        let oracles = borrow_global<Oracles>(addr);
        let exit_price = if (vector::length(&oracles.oracle.prices) > 0) {
            calculate_bucket_price(bucket, &oracles.oracle.prices)
        } else {
            1000 // mock price
        };
        
        // Calculate P&L using u128 to avoid overflow
        let pnl: u128;
        let is_profit: bool;
        if (position.is_long) {
            if (exit_price > position.entry_price) {
                pnl = (((exit_price - position.entry_price) as u128) * (position.margin as u128)) / (position.entry_price as u128);
                is_profit = true;
            } else {
                pnl = (((position.entry_price - exit_price) as u128) * (position.margin as u128)) / (position.entry_price as u128);
                is_profit = false;
            }
        } else {
            if (position.entry_price > exit_price) {
                pnl = (((position.entry_price - exit_price) as u128) * (position.margin as u128)) / (position.entry_price as u128);
                is_profit = true;
            } else {
                pnl = (((exit_price - position.entry_price) as u128) * (position.margin as u128)) / (position.entry_price as u128);
                is_profit = false;
            }
        };
        
        // Save margin before clearing
        let returned_margin = position.margin;
        // Close position by marking inactive and clearing margin
        position.margin = 0;
        position.is_active = false;
        let collaterals = borrow_global_mut<Collaterals>(addr);
        let i = 0;
        let len = vector::length(&collaterals.collaterals);
        while (i < len) {
            let c = vector::borrow_mut(&mut collaterals.collaterals, i);
            if (c.owner == addr) {
                if (is_profit && pnl <= (18446744073709551615 as u128)) { // u64 max
                    c.balance = c.balance + returned_margin + (pnl as u64);
                } else if (!is_profit && (pnl as u64) < returned_margin) {
                    c.balance = c.balance + returned_margin - (pnl as u64);
                } else if (!is_profit) {
                    c.balance = c.balance; // Total loss
                } else {
                    c.balance = c.balance + returned_margin; // Overflow protection
                };
                break
            };
            i = i + 1;
        };
        let handles = borrow_global_mut<EventHandles>(addr);
        event::emit_event(&mut handles.position_closed_events, PositionClosedEvent {
            position_id,
            owner: addr,
            pnl,
            is_profit,
        });
    }

    /// Mock: Update oracle prices
    public entry fun update_oracle(owner: &signer, prices: vector<u64>, funding_rates: vector<u64>) acquires Oracles {
        let addr = signer::address_of(owner);
        let oracles = borrow_global_mut<Oracles>(addr);
        oracles.oracle.prices = prices;
        oracles.oracle.funding_rates = funding_rates;
    }

    /// Liquidate a position if health factor is below threshold
    public entry fun liquidate_position(owner: &signer, position_id: u64, reason: vector<u8>) acquires Positions, EventHandles, Buckets, Oracles {
        let addr = signer::address_of(owner);
        let positions = borrow_global_mut<Positions>(addr);
        assert!((position_id as u64) < (vector::length(&positions.positions) as u64), error::not_found(12));
        let position = vector::borrow_mut(&mut positions.positions, (position_id as u64));
        
        // Only liquidate active positions
        if (!position.is_active) {
            return
        };
        
        // Get current market price for the bucket
        let buckets = borrow_global<Buckets>(addr);
        let bucket = vector::borrow(&buckets.buckets, position.bucket_id);
        let oracles = borrow_global<Oracles>(addr);
        let current_price = if (vector::length(&oracles.oracle.prices) > 0) {
            calculate_bucket_price(bucket, &oracles.oracle.prices)
        } else {
            position.entry_price // Use entry price if no oracle data
        };
        
        // Calculate leverage from bucket (assume max leverage of 20x for now)
        // In production, this should be stored per position or bucket
        let leverage: u64 = 20;
        
        // Calculate health factor
        let health_factor = calculate_health_factor(position, current_price, leverage);
        
        // Check if position is eligible for liquidation
        // Position can be liquidated if health factor < liquidation threshold
        if (health_factor < LIQUIDATION_THRESHOLD) {
            position.margin = 0;
            position.is_active = false;
            let handles = borrow_global_mut<EventHandles>(addr);
            event::emit_event(&mut handles.liquidation_events, LiquidationEvent {
                position_id,
                owner: addr,
                reason,
            });
        };
    }

    // ===== View Functions =====

    #[view]
    /// Get total number of buckets for a user
    public fun get_bucket_count(user: address): u64 acquires Buckets {
        if (!exists<Buckets>(user)) {
            return 0
        };
        let buckets = borrow_global<Buckets>(user);
        vector::length(&buckets.buckets)
    }

    #[view]
    /// Get bucket details by ID
    public fun get_bucket(user: address, bucket_id: u64): (vector<address>, vector<u64>, u8, address) acquires Buckets {
        let buckets = borrow_global<Buckets>(user);
        assert!(bucket_id < vector::length(&buckets.buckets), error::not_found(13));
        let bucket = vector::borrow(&buckets.buckets, bucket_id);
        (*&bucket.assets, *&bucket.weights, bucket.leverage, bucket.owner)
    }

    #[view]
    /// Get all buckets for a user (returns bucket IDs only for gas efficiency)
    public fun get_all_bucket_ids(user: address): vector<u64> acquires Buckets {
        if (!exists<Buckets>(user)) {
            return vector::empty<u64>()
        };
        let buckets = borrow_global<Buckets>(user);
        let len = vector::length(&buckets.buckets);
        let result = vector::empty<u64>();
        let i = 0;
        while (i < len) {
            vector::push_back(&mut result, i);
            i = i + 1;
        };
        result
    }

    #[view]
    /// Get total number of positions for a user
    public fun get_position_count(user: address): u64 acquires Positions {
        if (!exists<Positions>(user)) {
            return 0
        };
        let positions = borrow_global<Positions>(user);
        vector::length(&positions.positions)
    }

    #[view]
    /// Get position details by ID
    public fun get_position(user: address, position_id: u64): (u64, bool, u64, u64, address, bool) acquires Positions {
        let positions = borrow_global<Positions>(user);
        assert!(position_id < vector::length(&positions.positions), error::not_found(14));
        let position = vector::borrow(&positions.positions, position_id);
        (position.bucket_id, position.is_long, position.margin, position.entry_price, position.owner, position.is_active)
    }

    #[view]
    /// Get all active position IDs (positions with margin > 0 and is_active = true)
    public fun get_active_position_ids(user: address): vector<u64> acquires Positions {
        if (!exists<Positions>(user)) {
            return vector::empty<u64>()
        };
        let positions = borrow_global<Positions>(user);
        let len = vector::length(&positions.positions);
        let result = vector::empty<u64>();
        let i = 0;
        while (i < len) {
            let position = vector::borrow(&positions.positions, i);
            if (position.is_active) {
                vector::push_back(&mut result, i);
            };
            i = i + 1;
        };
        result
    }

    #[view]
    /// Get collateral balance for a user
    public fun get_collateral_balance(user: address, owner: address): u64 acquires Collaterals {
        if (!exists<Collaterals>(user)) {
            return 0
        };
        let collaterals = borrow_global<Collaterals>(user);
        let len = vector::length(&collaterals.collaterals);
        let i = 0;
        while (i < len) {
            let c = vector::borrow(&collaterals.collaterals, i);
            if (c.owner == owner) {
                return c.balance
            };
            i = i + 1;
        };
        0
    }

    #[view]
    /// Get current oracle prices
    public fun get_oracle_prices(user: address): vector<u64> acquires Oracles {
        if (!exists<Oracles>(user)) {
            return vector::empty<u64>()
        };
        let oracles = borrow_global<Oracles>(user);
        *&oracles.oracle.prices
    }

    #[view]
    /// Get current oracle funding rates
    public fun get_oracle_funding_rates(user: address): vector<u64> acquires Oracles {
        if (!exists<Oracles>(user)) {
            return vector::empty<u64>()
        };
        let oracles = borrow_global<Oracles>(user);
        *&oracles.oracle.funding_rates
    }

    #[view]
    /// Get specific oracle price by index
    public fun get_asset_price(user: address, asset_index: u64): u64 acquires Oracles {
        let oracles = borrow_global<Oracles>(user);
        assert!(asset_index < vector::length(&oracles.oracle.prices), error::not_found(15));
        *vector::borrow(&oracles.oracle.prices, asset_index)
    }

    #[view]
    /// Get current market value (weighted price) of a bucket
    public fun get_bucket_market_value(user: address, bucket_id: u64): u64 acquires Buckets, Oracles {
        let buckets = borrow_global<Buckets>(user);
        assert!(bucket_id < vector::length(&buckets.buckets), error::not_found(17));
        let bucket = vector::borrow(&buckets.buckets, bucket_id);
        
        if (!exists<Oracles>(user)) {
            return 1000 // fallback price
        };
        
        let oracles = borrow_global<Oracles>(user);
        if (vector::length(&oracles.oracle.prices) == 0) {
            return 1000 // fallback price
        };
        
        calculate_bucket_price(bucket, &oracles.oracle.prices)
    }

    #[view]
    /// Get health factor for a position
    /// Returns health factor as percentage (100 = 1.0x = liquidation threshold)
    /// Higher values are healthier. Below 100 means position is liquidatable.
    public fun get_position_health_factor(user: address, position_id: u64, leverage: u64): u64 acquires Positions, Buckets, Oracles {
        let positions = borrow_global<Positions>(user);
        assert!(position_id < vector::length(&positions.positions), error::not_found(18));
        let position = vector::borrow(&positions.positions, position_id);
        
        if (!position.is_active) {
            return 0 // Closed positions have no health factor
        };
        
        // Get current market price
        let buckets = borrow_global<Buckets>(user);
        let bucket = vector::borrow(&buckets.buckets, position.bucket_id);
        let oracles = borrow_global<Oracles>(user);
        let current_price = if (vector::length(&oracles.oracle.prices) > 0) {
            calculate_bucket_price(bucket, &oracles.oracle.prices)
        } else {
            position.entry_price
        };
        
        calculate_health_factor(position, current_price, leverage)
    }
}
