module cresca::price_oracle {
    use std::signer;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_ADMIN: u64 = 3;
    const E_INVALID_PRICE: u64 = 4;

    /// Price precision (8 decimals)
    const PRICE_PRECISION: u64 = 100000000;

    /// Price data structure for each asset
    struct PriceData has store, copy, drop {
        price: u64,           // Price in USD with 8 decimals (e.g., 95000_00000000 = $95,000)
        last_update: u64,     // Timestamp of last update
    }

    /// Oracle storage
    struct Oracle has key {
        admin: address,
        btc_price: PriceData,
        eth_price: PriceData,
        sol_price: PriceData,
    }

    /// Initialize oracle with hardcoded prices for demo
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Oracle>(admin_addr), E_ALREADY_INITIALIZED);

        let current_time = timestamp::now_seconds();

        // Hardcoded demo prices
        // BTC: $95,000
        // ETH: $3,500
        // SOL: $190
        move_to(admin, Oracle {
            admin: admin_addr,
            btc_price: PriceData {
                price: 9500000000000,  // $95,000 with 8 decimals
                last_update: current_time,
            },
            eth_price: PriceData {
                price: 350000000000,   // $3,500 with 8 decimals
                last_update: current_time,
            },
            sol_price: PriceData {
                price: 19000000000,    // $190 with 8 decimals
                last_update: current_time,
            },
        });
    }

    /// Update oracle prices (admin only, for demo manipulation)
    public entry fun update_prices(
        admin: &signer,
        oracle_addr: address,
        btc_price: u64,
        eth_price: u64,
        sol_price: u64,
    ) acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        
        let admin_addr = signer::address_of(admin);
        let oracle = borrow_global_mut<Oracle>(oracle_addr);
        
        assert!(oracle.admin == admin_addr, E_NOT_ADMIN);
        assert!(btc_price > 0 && eth_price > 0 && sol_price > 0, E_INVALID_PRICE);

        let current_time = timestamp::now_seconds();

        oracle.btc_price = PriceData {
            price: btc_price,
            last_update: current_time,
        };
        oracle.eth_price = PriceData {
            price: eth_price,
            last_update: current_time,
        };
        oracle.sol_price = PriceData {
            price: sol_price,
            last_update: current_time,
        };
    }

    /// Update BTC price only
    public entry fun update_btc_price(
        admin: &signer,
        oracle_addr: address,
        new_price: u64,
    ) acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        
        let admin_addr = signer::address_of(admin);
        let oracle = borrow_global_mut<Oracle>(oracle_addr);
        
        assert!(oracle.admin == admin_addr, E_NOT_ADMIN);
        assert!(new_price > 0, E_INVALID_PRICE);

        oracle.btc_price = PriceData {
            price: new_price,
            last_update: timestamp::now_seconds(),
        };
    }

    /// Update ETH price only
    public entry fun update_eth_price(
        admin: &signer,
        oracle_addr: address,
        new_price: u64,
    ) acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        
        let admin_addr = signer::address_of(admin);
        let oracle = borrow_global_mut<Oracle>(oracle_addr);
        
        assert!(oracle.admin == admin_addr, E_NOT_ADMIN);
        assert!(new_price > 0, E_INVALID_PRICE);

        oracle.eth_price = PriceData {
            price: new_price,
            last_update: timestamp::now_seconds(),
        };
    }

    /// Update SOL price only
    public entry fun update_sol_price(
        admin: &signer,
        oracle_addr: address,
        new_price: u64,
    ) acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        
        let admin_addr = signer::address_of(admin);
        let oracle = borrow_global_mut<Oracle>(oracle_addr);
        
        assert!(oracle.admin == admin_addr, E_NOT_ADMIN);
        assert!(new_price > 0, E_INVALID_PRICE);

        oracle.sol_price = PriceData {
            price: new_price,
            last_update: timestamp::now_seconds(),
        };
    }

    /// Simulate price movement (for demo) - increases all prices by percentage
    public entry fun simulate_price_movement(
        admin: &signer,
        oracle_addr: address,
        percentage_change: u64,  // 100 = 1%, 500 = 5%
    ) acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        
        let admin_addr = signer::address_of(admin);
        let oracle = borrow_global_mut<Oracle>(oracle_addr);
        
        assert!(oracle.admin == admin_addr, E_NOT_ADMIN);

        let current_time = timestamp::now_seconds();

        // Apply percentage change
        let btc_new = oracle.btc_price.price + (oracle.btc_price.price * percentage_change / 10000);
        let eth_new = oracle.eth_price.price + (oracle.eth_price.price * percentage_change / 10000);
        let sol_new = oracle.sol_price.price + (oracle.sol_price.price * percentage_change / 10000);

        oracle.btc_price = PriceData {
            price: btc_new,
            last_update: current_time,
        };
        oracle.eth_price = PriceData {
            price: eth_new,
            last_update: current_time,
        };
        oracle.sol_price = PriceData {
            price: sol_new,
            last_update: current_time,
        };
    }

    /// View function: Get BTC price
    #[view]
    public fun get_btc_price(oracle_addr: address): u64 acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        borrow_global<Oracle>(oracle_addr).btc_price.price
    }

    /// View function: Get ETH price
    #[view]
    public fun get_eth_price(oracle_addr: address): u64 acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        borrow_global<Oracle>(oracle_addr).eth_price.price
    }

    /// View function: Get SOL price
    #[view]
    public fun get_sol_price(oracle_addr: address): u64 acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        borrow_global<Oracle>(oracle_addr).sol_price.price
    }

    /// View function: Get all prices
    #[view]
    public fun get_all_prices(oracle_addr: address): (u64, u64, u64) acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        let oracle = borrow_global<Oracle>(oracle_addr);
        (
            oracle.btc_price.price,
            oracle.eth_price.price,
            oracle.sol_price.price
        )
    }

    /// View function: Get price with timestamp
    #[view]
    public fun get_price_with_timestamp(oracle_addr: address, asset: vector<u8>): (u64, u64) acquires Oracle {
        assert!(exists<Oracle>(oracle_addr), E_NOT_INITIALIZED);
        let oracle = borrow_global<Oracle>(oracle_addr);
        
        // Simple asset identification (0 = BTC, 1 = ETH, 2 = SOL)
        if (vector::length(&asset) == 0) {
            (oracle.btc_price.price, oracle.btc_price.last_update)
        } else if (vector::length(&asset) == 1) {
            (oracle.eth_price.price, oracle.eth_price.last_update)
        } else {
            (oracle.sol_price.price, oracle.sol_price.last_update)
        }
    }
}
