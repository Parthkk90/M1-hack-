#!/bin/bash

# Cresca Basket DeFi - Complete Setup Script

echo "=== Cresca Basket DeFi Setup ==="
echo ""

# Create directory structure
echo "Creating directory structure..."
mkdir -p sources scripts tests backend/src mobile

# Create Move modules
echo "Creating Move smart contract modules..."

cat > sources/basket_vault.move << 'EOF'
module cresca::basket_vault {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;

    const E_INSUFFICIENT_COLLATERAL: u64 = 1;
    const E_INVALID_LEVERAGE: u64 = 2;
    const E_POSITION_NOT_FOUND: u64 = 3;
    const E_INVALID_WEIGHTS: u64 = 4;

    struct BasketPosition has key, store {
        collateral_amount: u64,
        leverage_multiplier: u64,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
        entry_timestamp: u64,
        entry_value: u64,
    }

    struct PositionStore has key {
        positions: vector<BasketPosition>,
        collateral: Coin<AptosCoin>,
    }

    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<PositionStore>(account_addr)) {
            move_to(account, PositionStore {
                positions: vector::empty<BasketPosition>(),
                collateral: coin::zero<AptosCoin>(),
            });
        };
    }

    public entry fun open_position(
        account: &signer,
        collateral_amount: u64,
        leverage_multiplier: u64,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
    ) acquires PositionStore {
        let account_addr = signer::address_of(account);
        
        assert!(leverage_multiplier >= 1 && leverage_multiplier <= 10, E_INVALID_LEVERAGE);
        assert!(btc_weight + eth_weight + sol_weight == 100, E_INVALID_WEIGHTS);
        assert!(collateral_amount >= 1000000, E_INSUFFICIENT_COLLATERAL);

        if (!exists<PositionStore>(account_addr)) {
            initialize(account);
        };

        let collateral_coin = coin::withdraw<AptosCoin>(account, collateral_amount);
        
        let store = borrow_global_mut<PositionStore>(account_addr);
        coin::merge(&mut store.collateral, collateral_coin);

        let entry_value = collateral_amount * leverage_multiplier;

        let position = BasketPosition {
            collateral_amount,
            leverage_multiplier,
            btc_weight,
            eth_weight,
            sol_weight,
            entry_timestamp: timestamp::now_seconds(),
            entry_value,
        };

        vector::push_back(&mut store.positions, position);
    }

    public entry fun close_position(
        account: &signer,
        position_index: u64,
    ) acquires PositionStore {
        let account_addr = signer::address_of(account);
        assert!(exists<PositionStore>(account_addr), E_POSITION_NOT_FOUND);

        let store = borrow_global_mut<PositionStore>(account_addr);
        assert!(vector::length(&store.positions) > position_index, E_POSITION_NOT_FOUND);

        let position = vector::remove(&mut store.positions, position_index);
        let BasketPosition { 
            collateral_amount, 
            leverage_multiplier: _, 
            btc_weight: _, 
            eth_weight: _, 
            sol_weight: _,
            entry_timestamp: _,
            entry_value: _,
        } = position;

        let return_coin = coin::extract(&mut store.collateral, collateral_amount);
        coin::deposit(account_addr, return_coin);
    }

    #[view]
    public fun get_position_count(account_addr: address): u64 acquires PositionStore {
        if (!exists<PositionStore>(account_addr)) {
            return 0
        };
        let store = borrow_global<PositionStore>(account_addr);
        vector::length(&store.positions)
    }

    #[view]
    public fun get_position_details(account_addr: address, position_index: u64): (u64, u64, u64, u64, u64, u64, u64) acquires PositionStore {
        assert!(exists<PositionStore>(account_addr), E_POSITION_NOT_FOUND);
        let store = borrow_global<PositionStore>(account_addr);
        assert!(vector::length(&store.positions) > position_index, E_POSITION_NOT_FOUND);
        
        let position = vector::borrow(&store.positions, position_index);
        (
            position.collateral_amount,
            position.leverage_multiplier,
            position.btc_weight,
            position.eth_weight,
            position.sol_weight,
            position.entry_timestamp,
            position.entry_value
        )
    }
}
EOF

cat > sources/price_oracle.move << 'EOF'
module cresca::price_oracle {
    use std::signer;

    const E_NOT_AUTHORIZED: u64 = 1;
    const E_ORACLE_NOT_INITIALIZED: u64 = 2;

    struct PriceData has key {
        btc_price: u64,
        eth_price: u64,
        sol_price: u64,
        admin: address,
    }

    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<PriceData>(account_addr)) {
            move_to(account, PriceData {
                btc_price: 45000_000000,
                eth_price: 2500_000000,
                sol_price: 100_000000,
                admin: account_addr,
            });
        };
    }

    public entry fun update_prices(
        account: &signer,
        btc_price: u64,
        eth_price: u64,
        sol_price: u64,
    ) acquires PriceData {
        let account_addr = signer::address_of(account);
        assert!(exists<PriceData>(account_addr), E_ORACLE_NOT_INITIALIZED);
        
        let price_data = borrow_global_mut<PriceData>(account_addr);
        assert!(price_data.admin == account_addr, E_NOT_AUTHORIZED);
        
        price_data.btc_price = btc_price;
        price_data.eth_price = eth_price;
        price_data.sol_price = sol_price;
    }

    #[view]
    public fun get_btc_price(oracle_addr: address): u64 acquires PriceData {
        assert!(exists<PriceData>(oracle_addr), E_ORACLE_NOT_INITIALIZED);
        borrow_global<PriceData>(oracle_addr).btc_price
    }

    #[view]
    public fun get_eth_price(oracle_addr: address): u64 acquires PriceData {
        assert!(exists<PriceData>(oracle_addr), E_ORACLE_NOT_INITIALIZED);
        borrow_global<PriceData>(oracle_addr).eth_price
    }

    #[view]
    public fun get_sol_price(oracle_addr: address): u64 acquires PriceData {
        assert!(exists<PriceData>(oracle_addr), E_ORACLE_NOT_INITIALIZED);
        borrow_global<PriceData>(oracle_addr).sol_price
    }

    #[view]
    public fun get_all_prices(oracle_addr: address): (u64, u64, u64) acquires PriceData {
        assert!(exists<PriceData>(oracle_addr), E_ORACLE_NOT_INITIALIZED);
        let price_data = borrow_global<PriceData>(oracle_addr);
        (price_data.btc_price, price_data.eth_price, price_data.sol_price)
    }
}
EOF

cat > sources/leverage_engine.move << 'EOF'
module cresca::leverage_engine {
    use cresca::basket_vault;
    use cresca::price_oracle;

    const E_POSITION_NOT_FOUND: u64 = 1;
    const E_LIQUIDATION_THRESHOLD: u64 = 2;

    const LIQUIDATION_RATIO: u64 = 80;
    const PERCENTAGE_PRECISION: u64 = 100;
    const PRICE_PRECISION: u64 = 1000000;

    #[view]
    public fun calculate_position_value(
        account_addr: address,
        position_index: u64,
        oracle_addr: address,
    ): u64 {
        let (
            collateral_amount,
            leverage_multiplier,
            btc_weight,
            eth_weight,
            sol_weight,
            _entry_timestamp,
            _entry_value
        ) = basket_vault::get_position_details(account_addr, position_index);

        let (btc_price, eth_price, sol_price) = price_oracle::get_all_prices(oracle_addr);

        let total_value = (
            (btc_price * btc_weight) +
            (eth_price * eth_weight) +
            (sol_price * sol_weight)
        ) / PERCENTAGE_PRECISION;

        let position_size = collateral_amount * leverage_multiplier;
        (position_size * total_value) / PRICE_PRECISION
    }

    #[view]
    public fun calculate_pnl(
        account_addr: address,
        position_index: u64,
        oracle_addr: address,
    ): (u64, bool) {
        let (
            _collateral_amount,
            _leverage_multiplier,
            _btc_weight,
            _eth_weight,
            _sol_weight,
            _entry_timestamp,
            entry_value
        ) = basket_vault::get_position_details(account_addr, position_index);

        let current_value = calculate_position_value(account_addr, position_index, oracle_addr);

        if (current_value >= entry_value) {
            let profit = current_value - entry_value;
            (profit, true)
        } else {
            let loss = entry_value - current_value;
            (loss, false)
        }
    }

    #[view]
    public fun calculate_pnl_percentage(
        account_addr: address,
        position_index: u64,
        oracle_addr: address,
    ): (u64, bool) {
        let (
            _collateral_amount,
            _leverage_multiplier,
            _btc_weight,
            _eth_weight,
            _sol_weight,
            _entry_timestamp,
            entry_value
        ) = basket_vault::get_position_details(account_addr, position_index);

        let current_value = calculate_position_value(account_addr, position_index, oracle_addr);

        if (current_value >= entry_value) {
            let profit_pct = ((current_value - entry_value) * 10000) / entry_value;
            (profit_pct, true)
        } else {
            let loss_pct = ((entry_value - current_value) * 10000) / entry_value;
            (loss_pct, false)
        }
    }

    #[view]
    public fun check_liquidation(
        account_addr: address,
        position_index: u64,
        oracle_addr: address,
    ): bool {
        let (
            collateral_amount,
            _leverage_multiplier,
            _btc_weight,
            _eth_weight,
            _sol_weight,
            _entry_timestamp,
            _entry_value
        ) = basket_vault::get_position_details(account_addr, position_index);

        let current_value = calculate_position_value(account_addr, position_index, oracle_addr);
        let liquidation_threshold = (collateral_amount * LIQUIDATION_RATIO) / PERCENTAGE_PRECISION;

        current_value < liquidation_threshold
    }
}
EOF

echo "✓ Move modules created"

# Initialize git
echo "Initializing git repository..."
git init
git add .
git commit -m "Initialize Move project structure"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Install Movement CLI: https://docs.movementlabs.xyz/"
echo "2. Compile contracts: movement move compile"
echo "3. Deploy to testnet: movement move publish"
echo ""
