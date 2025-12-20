module cresca::leverage_engine {
    use std::signer;
    use cresca::price_oracle;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_POSITION_NOT_FOUND: u64 = 2;
    const E_INVALID_CALCULATION: u64 = 3;
    const E_LIQUIDATION_THRESHOLD_REACHED: u64 = 4;
    const E_LEVERAGE_TOO_HIGH: u64 = 5;

    /// Maximum leverage (Merkle Trade-style: 150x)
    const MAX_LEVERAGE: u64 = 150;

    /// Minimum position size ($2 in octas, assuming 1 APT = $10)
    const MIN_POSITION_SIZE: u64 = 200000; // 0.002 APT

    /// Base liquidation threshold (99.3% for 150x positions)
    const BASE_LIQUIDATION_THRESHOLD: u64 = 993;

    /// Precision for percentage calculations (basis points)
    const PERCENTAGE_PRECISION: u64 = 10000;

    /// Maintenance margin rate (0.5% for isolated positions)
    const MAINTENANCE_MARGIN_RATE: u64 = 50; // 0.5% in basis points

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

    /// Calculate dynamic liquidation threshold based on leverage
    /// Higher leverage = tighter liquidation (closer to 100%)
    public fun calculate_liquidation_threshold(leverage: u64): u64 {
        if (leverage <= 10) {
            8000 // 80% for low leverage (1-10x)
        } else if (leverage <= 50) {
            9500 // 95% for medium leverage (11-50x)
        } else if (leverage <= 100) {
            9800 // 98% for high leverage (51-100x)
        } else {
            9930 // 99.3% for extreme leverage (101-150x)
        }
    }

    /// Check if position should be liquidated (isolated margin)
    public fun should_liquidate(
        current_value: u64,
        collateral_amount: u64,
        leverage_multiplier: u64,
    ): bool {
        let liquidation_threshold = calculate_liquidation_threshold(leverage_multiplier);
        // Calculate minimum position value with dynamic threshold
        let min_value = (collateral_amount * leverage_multiplier * liquidation_threshold) / PERCENTAGE_PRECISION;
        
        current_value < min_value
    }

    /// Calculate health factor for isolated margin (higher is safer)
    /// Returns percentage: 100 = at liquidation, 200 = 2x safety margin
    public fun calculate_health_factor(
        current_value: u64,
        collateral_amount: u64,
        leverage_multiplier: u64,
    ): u64 {
        let liquidation_threshold = calculate_liquidation_threshold(leverage_multiplier);
        let required_value = (collateral_amount * leverage_multiplier * liquidation_threshold) / PERCENTAGE_PRECISION;
        
        if (required_value == 0) {
            return 200 // Maximum safety
        };

        // Health factor: 100 = liquidation point, >100 = safe
        (current_value * 100) / required_value
    }

    /// Calculate maintenance margin requirement
    public fun calculate_maintenance_margin(
        position_size: u64,
        leverage: u64,
    ): u64 {
        // Maintenance margin = position_size * (1/leverage + 0.5%)
        let base_margin = position_size / leverage;
        let maintenance_fee = (position_size * MAINTENANCE_MARGIN_RATE) / PERCENTAGE_PRECISION;
        base_margin + maintenance_fee
    }

    /// Calculate dynamic liquidation price for basket
    /// For isolated margin: liquidation at (1/leverage)% adverse price move
    public fun calculate_liquidation_price(
        entry_price: u64,
        leverage_multiplier: u64,
        is_long: bool,
    ): u64 {
        // Liquidation distance in basis points = 10000 / leverage
        // Example: 150x -> 66 bps (0.66%), 10x -> 1000 bps (10%)
        let liquidation_distance = PERCENTAGE_PRECISION / leverage_multiplier;
        
        if (is_long) {
            // Long position: liquidates if price drops
            entry_price * (PERCENTAGE_PRECISION - liquidation_distance) / PERCENTAGE_PRECISION
        } else {
            // Short position: liquidates if price rises
            entry_price * (PERCENTAGE_PRECISION + liquidation_distance) / PERCENTAGE_PRECISION
        }
    }

    /// Calculate liquidation price for basket (weighted)
    public fun calculate_basket_liquidation_price(
        collateral_amount: u64,
        leverage_multiplier: u64,
        btc_weight: u64,
        eth_weight: u64,
        sol_weight: u64,
        entry_value: u64,
    ): u64 {
        let liquidation_threshold = calculate_liquidation_threshold(leverage_multiplier);
        let entry_collateral_value = collateral_amount * leverage_multiplier;
        (entry_collateral_value * liquidation_threshold) / PERCENTAGE_PRECISION
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

    /// Calculate maximum leverage based on collateral (Merkle-style: 150x)
    public fun calculate_max_leverage(
        collateral_amount: u64,
        min_collateral: u64,
    ): u64 {
        if (collateral_amount < min_collateral) {
            return 1
        };

        // Allow up to 150x leverage (Merkle Trade standard)
        MAX_LEVERAGE
    }

    /// Validate leverage is within bounds
    public fun validate_leverage(leverage: u64): bool {
        leverage >= 1 && leverage <= MAX_LEVERAGE
    }

    /// Calculate initial margin requirement
    public fun calculate_initial_margin(
        position_size: u64,
        leverage: u64,
    ): u64 {
        // Initial margin = position_size / leverage
        if (leverage == 0) {
            return position_size
        };
        position_size / leverage
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
