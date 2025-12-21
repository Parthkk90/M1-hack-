module cresca::revenue_distributor {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_UNAUTHORIZED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_INVALID_FEE: u64 = 4;

    /// Fee structure for Movement Baskets
    struct FeeConfig has key {
        admin: address,
        
        // Trading fees (basis points)
        trading_fee_bps: u64,  // 10 = 0.1%
        
        // Performance fees (basis points)  
        performance_fee_bps: u64,  // 200 = 2%
        
        // Liquidation fees (basis points)
        liquidation_fee_bps: u64,  // 50 = 0.5%
        
        // Subscription tiers
        basic_subscription: u64,  // 0 (free)
        premium_subscription: u64,  // 10 APT/month ($500)
        
        // Accumulated fees
        total_trading_fees: u64,
        total_performance_fees: u64,
        total_liquidation_fees: u64,
        total_subscription_fees: u64,
    }

    /// User subscription record
    struct Subscription has key {
        user: address,
        tier: u8,  // 0 = basic (free), 1 = premium
        start_time: u64,
        expiry_time: u64,
        is_active: bool,
    }

    /// Revenue vault for collected fees
    struct RevenueVault has key {
        balance: u64,
        last_withdrawal: u64,
    }

    /// Initialize the revenue distribution system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, FeeConfig {
            admin: admin_addr,
            trading_fee_bps: 10,  // 0.1%
            performance_fee_bps: 200,  // 2%
            liquidation_fee_bps: 50,  // 0.5%
            basic_subscription: 0,
            premium_subscription: 10_00000000,  // 10 APT
            total_trading_fees: 0,
            total_performance_fees: 0,
            total_liquidation_fees: 0,
            total_subscription_fees: 0,
        });

        move_to(admin, RevenueVault {
            balance: 0,
            last_withdrawal: timestamp::now_seconds(),
        });
    }

    /// Collect trading fee from a position
    public entry fun collect_trading_fee(
        user: &signer,
        fee_collector: address,
        position_size: u64,
    ) acquires FeeConfig, RevenueVault {
        let config = borrow_global_mut<FeeConfig>(fee_collector);
        
        // Calculate fee
        let fee_amount = (position_size * config.trading_fee_bps) / 10000;
        
        // Transfer fee from user
        let fee_coin = coin::withdraw<AptosCoin>(user, fee_amount);
        coin::deposit(fee_collector, fee_coin);
        
        // Update stats
        config.total_trading_fees = config.total_trading_fees + fee_amount;
        
        let vault = borrow_global_mut<RevenueVault>(fee_collector);
        vault.balance = vault.balance + fee_amount;
    }

    /// Collect performance fee on profitable AI baskets
    public entry fun collect_performance_fee(
        user: &signer,
        fee_collector: address,
        profit_amount: u64,
    ) acquires FeeConfig, RevenueVault {
        let config = borrow_global_mut<FeeConfig>(fee_collector);
        
        // Calculate 2% performance fee
        let fee_amount = (profit_amount * config.performance_fee_bps) / 10000;
        
        // Transfer fee
        let fee_coin = coin::withdraw<AptosCoin>(user, fee_amount);
        coin::deposit(fee_collector, fee_coin);
        
        // Update stats
        config.total_performance_fees = config.total_performance_fees + fee_amount;
        
        let vault = borrow_global_mut<RevenueVault>(fee_collector);
        vault.balance = vault.balance + fee_amount;
    }

    /// Collect liquidation fee
    public entry fun collect_liquidation_fee(
        liquidator: &signer,
        fee_collector: address,
        liquidated_amount: u64,
    ) acquires FeeConfig, RevenueVault {
        let config = borrow_global_mut<FeeConfig>(fee_collector);
        
        // Calculate 0.5% liquidation fee
        let fee_amount = (liquidated_amount * config.liquidation_fee_bps) / 10000;
        
        // Transfer fee
        let fee_coin = coin::withdraw<AptosCoin>(liquidator, fee_amount);
        coin::deposit(fee_collector, fee_coin);
        
        // Update stats
        config.total_liquidation_fees = config.total_liquidation_fees + fee_amount;
        
        let vault = borrow_global_mut<RevenueVault>(fee_collector);
        vault.balance = vault.balance + fee_amount;
    }

    /// Subscribe to premium tier
    public entry fun subscribe_premium(
        user: &signer,
        fee_collector: address,
        duration_months: u64,
    ) acquires FeeConfig, RevenueVault, Subscription {
        let user_addr = signer::address_of(user);
        let config = borrow_global_mut<FeeConfig>(fee_collector);
        
        // Calculate subscription cost (10 APT per month)
        let subscription_cost = config.premium_subscription * duration_months;
        
        // Transfer payment
        let payment = coin::withdraw<AptosCoin>(user, subscription_cost);
        coin::deposit(fee_collector, payment);
        
        // Update stats
        config.total_subscription_fees = config.total_subscription_fees + subscription_cost;
        
        let vault = borrow_global_mut<RevenueVault>(fee_collector);
        vault.balance = vault.balance + subscription_cost;
        
        // Create or update subscription
        let current_time = timestamp::now_seconds();
        let expiry_time = current_time + (duration_months * 30 * 24 * 3600);
        
        if (exists<Subscription>(user_addr)) {
            let sub = borrow_global_mut<Subscription>(user_addr);
            sub.tier = 1;
            sub.expiry_time = expiry_time;
            sub.is_active = true;
        } else {
            move_to(user, Subscription {
                user: user_addr,
                tier: 1,
                start_time: current_time,
                expiry_time,
                is_active: true,
            });
        };
    }

    /// Check if user has premium subscription
    public fun has_premium_subscription(user_addr: address): bool acquires Subscription {
        if (!exists<Subscription>(user_addr)) {
            return false
        };
        
        let sub = borrow_global<Subscription>(user_addr);
        let current_time = timestamp::now_seconds();
        
        sub.is_active && sub.tier == 1 && sub.expiry_time > current_time
    }

    /// Withdraw collected fees (admin only)
    public entry fun withdraw_fees(
        admin: &signer,
        fee_collector: address,
        amount: u64,
    ) acquires FeeConfig, RevenueVault {
        let admin_addr = signer::address_of(admin);
        let config = borrow_global<FeeConfig>(fee_collector);
        
        assert!(config.admin == admin_addr, E_UNAUTHORIZED);
        
        let vault = borrow_global_mut<RevenueVault>(fee_collector);
        assert!(vault.balance >= amount, E_INSUFFICIENT_BALANCE);
        
        // Transfer fees to admin
        let fee_coin = coin::withdraw<AptosCoin>(admin, amount);
        coin::deposit(admin_addr, fee_coin);
        
        vault.balance = vault.balance - amount;
        vault.last_withdrawal = timestamp::now_seconds();
    }

    /// View function: Get total revenue collected
    #[view]
    public fun get_total_revenue(fee_collector: address): (u64, u64, u64, u64) acquires FeeConfig {
        let config = borrow_global<FeeConfig>(fee_collector);
        (
            config.total_trading_fees,
            config.total_performance_fees,
            config.total_liquidation_fees,
            config.total_subscription_fees,
        )
    }

    /// View function: Get revenue vault balance
    #[view]
    public fun get_vault_balance(fee_collector: address): u64 acquires RevenueVault {
        let vault = borrow_global<RevenueVault>(fee_collector);
        vault.balance
    }

    /// View function: Get fee configuration
    #[view]
    public fun get_fee_config(fee_collector: address): (u64, u64, u64) acquires FeeConfig {
        let config = borrow_global<FeeConfig>(fee_collector);
        (
            config.trading_fee_bps,
            config.performance_fee_bps,
            config.liquidation_fee_bps,
        )
    }

    /// View function: Check subscription status
    #[view]
    public fun get_subscription(user_addr: address): (u8, u64, bool) acquires Subscription {
        if (!exists<Subscription>(user_addr)) {
            return (0, 0, false)
        };
        
        let sub = borrow_global<Subscription>(user_addr);
        (sub.tier, sub.expiry_time, sub.is_active)
    }
}
