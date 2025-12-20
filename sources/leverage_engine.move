module cresca::leverage_engine {
    use std::signer;
    use cresca::price_oracle;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_POSITION_NOT_FOUND: u64 = 2;
    const E_INVALID_CALCULATION: u64 = 3;
    const E_LIQUIDATION_THRESHOLD_REACHED: u64 = 4;

    /// Liquidation threshold (80% of collateral value)
    const LIQUIDATION_THRESHOLD: u64 = 80;

    /// Precision for percentage calculations
    const PERCENTAGE_PRECISION: u64 = 100;

    /// Position value calculation result
    struct PositionValue has drop {
        current_value: u64,
        profit_loss: u64,
        is_profit: bool,
        liquidation_price: u64,
        health_factor: u64,
    }

    /// Calculate position value based on oracle prices and basket weights
    public fun calculate_position_value(
        oracle_addr: address,
        collateral_amount: u64,
        leverage_multiplier: u64,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
        entry_value: u64,
    ): (u64, u64, bool) {
        // Get current prices from oracle
        let (btc_price, eth_price, sol_price) = price_oracle::get_all_prices(oracle_addr);

        // Calculate weighted position value
        // Formula: (btc_weight * btc_price + eth_weight * eth_price + sol_weight * sol_price) / 100
        let weighted_price = (btc_weight * btc_price + eth_weight * eth_price + sol_weight * sol_price) / 100;
        
        // Calculate current position value with leverage
        let current_value = (collateral_amount * leverage_multiplier * weighted_price) / 100000000; // Adjust for price precision

        // Calculate P&L
        let (profit_loss, is_profit) = if (current_value >= entry_value) {
            (current_value - entry_value, true)
        } else {
            (entry_value - current_value, false)
        };

        (current_value, profit_loss, is_profit)
    }

    /// Check if position should be liquidated
    public fun should_liquidate(
        current_value: u64,
        collateral_amount: u64,
        leverage_multiplier: u64,
    ): bool {
        // Calculate minimum position value (80% of collateral * leverage)
        let min_value = (collateral_amount * leverage_multiplier * LIQUIDATION_THRESHOLD) / PERCENTAGE_PRECISION;
        
        current_value < min_value
    }

    /// Calculate health factor (higher is safer)
    public fun calculate_health_factor(
        current_value: u64,
        collateral_amount: u64,
        leverage_multiplier: u64,
    ): u64 {
        let required_value = (collateral_amount * leverage_multiplier * LIQUIDATION_THRESHOLD) / PERCENTAGE_PRECISION;
        
        if (required_value == 0) {
            return 100
        };

        // Health factor as percentage (100 = at liquidation threshold, >100 = safe)
        (current_value * 100) / required_value
    }

    /// Calculate liquidation price for entire basket
    public fun calculate_liquidation_price(
        collateral_amount: u64,
        leverage_multiplier: u64,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
    ): u64 {
        // Simplified: liquidation occurs at 80% of entry value
        let entry_collateral_value = collateral_amount * leverage_multiplier;
        (entry_collateral_value * LIQUIDATION_THRESHOLD) / PERCENTAGE_PRECISION
    }

    /// Calculate profit/loss percentage
    public fun calculate_pnl_percentage(
        current_value: u64,
        entry_value: u64,
    ): (u64, bool) {
        if (entry_value == 0) {
            return (0, true)
        };

        if (current_value >= entry_value) {
            let profit = current_value - entry_value;
            let percentage = (profit * 100) / entry_value;
            (percentage, true)
        } else {
            let loss = entry_value - current_value;
            let percentage = (loss * 100) / entry_value;
            (percentage, false)
        }
    }

    /// Calculate effective leverage after price movements
    public fun calculate_effective_leverage(
        position_value: u64,
        collateral_amount: u64,
    ): u64 {
        if (collateral_amount == 0) {
            return 0
        };

        position_value / collateral_amount
    }

    /// Calculate required collateral for desired position
    public fun calculate_required_collateral(
        desired_position_value: u64,
        leverage_multiplier: u64,
    ): u64 {
        if (leverage_multiplier == 0) {
            return desired_position_value
        };

        desired_position_value / leverage_multiplier
    }

    /// View function: Get comprehensive position metrics
    public fun get_position_metrics(
        oracle_addr: address,
        collateral_amount: u64,
        leverage_multiplier: u64,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
        entry_value: u64,
    ): (u64, u64, bool, u64, bool) {
        // Calculate current value and P&L
        let (current_value, profit_loss, is_profit) = calculate_position_value(
            oracle_addr,
            collateral_amount,
            leverage_multiplier,
            btc_weight,
            eth_weight,
            sol_weight,
            entry_value,
        );

        // Calculate health factor
        let health_factor = calculate_health_factor(
            current_value,
            collateral_amount,
            leverage_multiplier,
        );

        // Check liquidation status
        let should_liquidate = should_liquidate(
            current_value,
            collateral_amount,
            leverage_multiplier,
        );

        (current_value, profit_loss, is_profit, health_factor, should_liquidate)
    }

    /// Calculate maximum leverage based on collateral
    public fun calculate_max_leverage(
        collateral_amount: u64,
        min_collateral: u64,
    ): u64 {
        if (collateral_amount < min_collateral) {
            return 1
        };

        // Allow up to 10x leverage
        10
    }

    /// Calculate total basket value in USD
    public fun calculate_basket_usd_value(
        oracle_addr: address,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
        position_size: u64,
    ): u64 {
        let (btc_price, eth_price, sol_price) = price_oracle::get_all_prices(oracle_addr);

        // Calculate weighted average price
        let weighted_price = (btc_weight * btc_price + eth_weight * eth_price + sol_weight * sol_price) / 100;

        // Return total value
        (position_size * weighted_price) / 100000000 // Adjust for price precision
    }
}
