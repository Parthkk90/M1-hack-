#[test_only]
module cresca::simple_tests {
    use aptos_framework::timestamp;
    use cresca::basket_vault;
    use cresca::price_oracle;
    use cresca::payment_scheduler;
    use cresca::funding_rate;
    use cresca::rebalancing_engine;
    use cresca::revenue_distributor;

    // Real Movement Testnet Addresses:
    // Test Wallet: 0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306
    // Contract Address: 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7
    // 
    // Explorer Links:
    // Test Wallet: https://explorer.movementnetwork.xyz/account/0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306
    // Contracts: https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7
    //
    // Sample Transaction (0.5 MOVE transfer):
    // https://explorer.movementnetwork.xyz/txn/0x02575231a125e73ed802d4bd63238599ff4f27df3e1f302302a1f4320a806c92

    // Basket Vault Tests
    #[test(admin = @cresca)]
    public fun test_basket_vault_initialize(admin: &signer) {
        basket_vault::initialize(admin);
        // Test passes if no error - initialization successful
        // When deployed, admin = 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7
    }

    // Price Oracle Tests
    #[test(admin = @cresca, aptos_framework = @0x1)]
    public fun test_price_oracle_initialize(admin: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        price_oracle::initialize(admin);
        // Test passes if no error - oracle initialized
        // Deployed contract can be called via:
        // aptos move run --function-id '0x9291...::price_oracle::update_price' --args string:BTC u64:95000
    }

    // Payment Scheduler Tests
    #[test(user = @cresca)]
    public fun test_payment_scheduler_initialize(user: &signer) {
        payment_scheduler::initialize(user);
        // Test passes if no error - scheduler initialized
        // Real users can schedule payments on testnet
    }

    // Funding Rate Tests
    #[test(admin = @cresca, aptos_framework = @0x1)]
    public fun test_funding_rate_initialize(admin: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        funding_rate::initialize(admin);
        // Test passes if no error - funding rate initialized
        // Deployed at: 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7
    }

    // Rebalancing Engine Tests
    #[test(admin = @cresca)]
    public fun test_rebalancing_engine_initialize(admin: &signer) {
        rebalancing_engine::initialize(admin);
        // Test passes if no error - rebalancing engine initialized
        // AI-powered portfolio optimization available on testnet
    }

    // Revenue Distributor Tests
    #[test(admin = @cresca, aptos_framework = @0x1)]
    public fun test_revenue_distributor_initialize(admin: &signer, aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        revenue_distributor::initialize(admin);
        // Test passes if no error - revenue distributor initialized
        // Fee collection system ready on testnet
    }
}
