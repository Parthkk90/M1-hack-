module cresca::rebalancing_engine {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    
    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_UNAUTHORIZED: u64 = 2;
    const E_INVALID_WEIGHTS: u64 = 3;
    const E_REBALANCE_TOO_SOON: u64 = 4;
    const E_VOLATILITY_TOO_HIGH: u64 = 5;

    /// Minimum time between rebalances (6 hours = 21600 seconds)
    const MIN_REBALANCE_INTERVAL: u64 = 21600;

    /// Maximum volatility threshold (30% = 3000 basis points)
    const MAX_VOLATILITY_THRESHOLD: u64 = 3000;

    /// Rebalancing strategy configuration
    struct RebalanceStrategy has key, store {
        basket_id: u64,
        owner: address,
        target_weights: vector<u64>,  // Basis points (total = 10000)
        asset_symbols: vector<vector<u8>>,  // ["BTC", "ETH", "MOVE"]
        volatility_tolerance: u64,  // Basis points
        last_rebalance_time: u64,
        rebalance_threshold: u64,  // Min deviation to trigger (basis points)
        is_ai_managed: bool,  // AI auto-rebalancing enabled
    }

    /// AI rebalancing state
    struct AIRebalancer has key {
        admin: address,
        total_strategies: u64,
        performance_fee_bps: u64,  // 200 = 2%
        accumulated_fees: u64,
    }

    /// Risk scoring for positions
    struct RiskScore has store, drop, copy {
        volatility_score: u64,  // 0-100
        leverage_score: u64,    // 0-100
        concentration_score: u64,  // 0-100
        overall_risk: u64,      // 0-100 (weighted average)
    }

    /// Initialize the AI rebalancing system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, AIRebalancer {
            admin: admin_addr,
            total_strategies: 0,
            performance_fee_bps: 200,  // 2% performance fee
            accumulated_fees: 0,
        });
    }

    /// Create a rebalancing strategy for a basket
    public entry fun create_strategy(
        user: &signer,
        basket_id: u64,
        target_weights: vector<u64>,
        asset_symbols: vector<vector<u8>>,
        volatility_tolerance: u64,
        rebalance_threshold: u64,
        is_ai_managed: bool,
    ) {
        let user_addr = signer::address_of(user);
        
        // Validate weights sum to 100%
        let total_weight = 0u64;
        let i = 0;
        while (i < vector::length(&target_weights)) {
            total_weight = total_weight + *vector::borrow(&target_weights, i);
            i = i + 1;
        };
        assert!(total_weight == 10000, E_INVALID_WEIGHTS);
        
        move_to(user, RebalanceStrategy {
            basket_id,
            owner: user_addr,
            target_weights,
            asset_symbols,
            volatility_tolerance,
            last_rebalance_time: timestamp::now_seconds(),
            rebalance_threshold,
            is_ai_managed,
        });
    }

    /// Calculate risk score for a basket position
    public fun calculate_risk_score(
        leverage: u64,
        volatility: u64,  // Recent 30-day volatility in basis points
        largest_weight: u64,  // Largest single asset weight in basis points
    ): RiskScore {
        // Volatility score: 0-100 (higher = riskier)
        let volatility_score = if (volatility > 5000) { 100 } 
                               else { (volatility * 100) / 5000 };

        // Leverage score: 0-100 (higher = riskier)
        let leverage_score = if (leverage > 20) { 100 }
                            else { (leverage * 100) / 20 };

        // Concentration score: 0-100 (higher = more concentrated)
        let concentration_score = if (largest_weight > 5000) { 100 }
                                 else { (largest_weight * 100) / 5000 };

        // Overall risk: weighted average
        let overall_risk = (volatility_score * 40 + leverage_score * 40 + concentration_score * 20) / 100;

        RiskScore {
            volatility_score,
            leverage_score,
            concentration_score,
            overall_risk,
        }
    }

    /// Calculate optimal weights using mean-variance optimization (simplified)
    /// Returns new target weights based on volatility and correlation
    public fun calculate_optimal_weights(
        current_weights: vector<u64>,
        volatilities: vector<u64>,  // 30-day volatility for each asset
        risk_tolerance: u64,  // User's risk tolerance (0-100)
    ): vector<u64> {
        let num_assets = vector::length(&current_weights);
        let optimal_weights = vector::empty<u64>();
        
        // Simple equal-risk weighting adjusted for volatility
        let total_inv_vol = 0u64;
        let i = 0;
        
        // Calculate sum of inverse volatilities
        while (i < num_assets) {
            let vol = *vector::borrow(&volatilities, i);
            if (vol > 0) {
                total_inv_vol = total_inv_vol + (10000 / vol);
            };
            i = i + 1;
        };
        
        // Assign weights proportional to inverse volatility
        i = 0;
        while (i < num_assets) {
            let vol = *vector::borrow(&volatilities, i);
            let weight = if (vol > 0 && total_inv_vol > 0) {
                ((10000 / vol) * 10000) / total_inv_vol
            } else {
                10000 / num_assets  // Equal weight if vol is 0
            };
            vector::push_back(&mut optimal_weights, weight);
            i = i + 1;
        };
        
        optimal_weights
    }

    /// Check if rebalancing is needed based on threshold
    public fun should_rebalance(
        strategy_addr: address,
        current_weights: vector<u64>,
    ): bool acquires RebalanceStrategy {
        let strategy = borrow_global<RebalanceStrategy>(strategy_addr);
        
        // Check time constraint
        let current_time = timestamp::now_seconds();
        if (current_time - strategy.last_rebalance_time < MIN_REBALANCE_INTERVAL) {
            return false
        };
        
        // Check weight deviation
        let max_deviation = 0u64;
        let i = 0;
        while (i < vector::length(&strategy.target_weights)) {
            let target = *vector::borrow(&strategy.target_weights, i);
            let current = *vector::borrow(&current_weights, i);
            
            let deviation = if (current > target) {
                current - target
            } else {
                target - current
            };
            
            if (deviation > max_deviation) {
                max_deviation = deviation;
            };
            i = i + 1;
        };
        
        max_deviation >= strategy.rebalance_threshold
    }

    /// Execute rebalancing (updates last rebalance time)
    public entry fun execute_rebalance(
        user: &signer,
        new_weights: vector<u64>,
    ) acquires RebalanceStrategy {
        let user_addr = signer::address_of(user);
        let strategy = borrow_global_mut<RebalanceStrategy>(user_addr);
        
        assert!(strategy.owner == user_addr, E_UNAUTHORIZED);
        
        // Validate weights
        let total_weight = 0u64;
        let i = 0;
        while (i < vector::length(&new_weights)) {
            total_weight = total_weight + *vector::borrow(&new_weights, i);
            i = i + 1;
        };
        assert!(total_weight == 10000, E_INVALID_WEIGHTS);
        
        // Update strategy
        strategy.target_weights = new_weights;
        strategy.last_rebalance_time = timestamp::now_seconds();
    }

    /// Get recommended leverage based on risk score
    public fun get_recommended_leverage(risk_score: u64): u64 {
        if (risk_score <= 20) {
            20  // Low risk: max leverage
        } else if (risk_score <= 40) {
            15  // Moderate risk: 15x
        } else if (risk_score <= 60) {
            10  // High risk: 10x
        } else if (risk_score <= 80) {
            5   // Very high risk: 5x
        } else {
            3   // Extreme risk: 3x only
        }
    }

    /// View function: Get strategy details
    #[view]
    public fun get_strategy(strategy_addr: address): (
        u64,  // basket_id
        vector<u64>,  // target_weights
        u64,  // last_rebalance_time
        bool,  // is_ai_managed
    ) acquires RebalanceStrategy {
        let strategy = borrow_global<RebalanceStrategy>(strategy_addr);
        (
            strategy.basket_id,
            strategy.target_weights,
            strategy.last_rebalance_time,
            strategy.is_ai_managed,
        )
    }

    /// View function: Get AI rebalancer stats
    #[view]
    public fun get_ai_stats(admin_addr: address): (u64, u64, u64) acquires AIRebalancer {
        let rebalancer = borrow_global<AIRebalancer>(admin_addr);
        (
            rebalancer.total_strategies,
            rebalancer.performance_fee_bps,
            rebalancer.accumulated_fees,
        )
    }
}
