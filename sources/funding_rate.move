module cresca::funding_rate {
    use std::signer;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_INVALID_FUNDING_RATE: u64 = 2;
    const E_TOO_SOON: u64 = 3;

    /// Funding period in seconds (1 hour)
    const FUNDING_PERIOD: u64 = 3600;

    /// Maximum funding rate per period (1% = 100 basis points)
    const MAX_FUNDING_RATE: u64 = 100;

    /// Precision for calculations (10000 = 100.00%)
    const PRECISION: u64 = 10000;

    /// Global funding state
    struct FundingState has key {
        long_open_interest: u64,      // Total long positions size
        short_open_interest: u64,     // Total short positions size
        last_funding_time: u64,       // Last funding payment timestamp
        cumulative_funding_long: u64,  // Cumulative funding paid by longs
        cumulative_funding_short: u64, // Cumulative funding paid by shorts
        current_funding_rate: u64,    // Current funding rate in basis points
    }

    /// Position funding info
    struct PositionFunding has store {
        last_funding_index: u64,
        accrued_funding: u64,
        is_long: bool,
    }

    /// Initialize funding state (call once per basket/market)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, FundingState {
            long_open_interest: 0,
            short_open_interest: 0,
            last_funding_time: timestamp::now_seconds(),
            cumulative_funding_long: 0,
            cumulative_funding_short: 0,
            current_funding_rate: 0,
        });
    }

    /// Calculate funding rate based on open interest imbalance
    /// Returns: (funding_rate, longs_pay)
    /// - funding_rate: basis points (100 = 1%)
    /// - longs_pay: true if longs pay shorts, false if shorts pay longs
    public fun calculate_funding_rate(
        long_oi: u64,
        short_oi: u64,
    ): (u64, bool) {
        let total_oi = long_oi + short_oi;
        
        // If no open interest, no funding
        if (total_oi == 0) {
            return (0, true)
        };

        // Calculate imbalance percentage
        // Imbalance = (Long - Short) / Total * 100
        let imbalance = if (long_oi > short_oi) {
            ((long_oi - short_oi) * PRECISION) / total_oi
        } else {
            ((short_oi - long_oi) * PRECISION) / total_oi
        };

        // Funding rate = imbalance * 0.01% (capped at 1%)
        // Formula: rate = imbalance / 100 (in basis points)
        let funding_rate = imbalance / 100;
        
        // Cap at maximum funding rate
        if (funding_rate > MAX_FUNDING_RATE) {
            funding_rate = MAX_FUNDING_RATE;
        };

        // Determine who pays: if more longs, longs pay shorts
        let longs_pay = long_oi > short_oi;

        (funding_rate, longs_pay)
    }

    /// Apply funding payment to a position
    /// Returns: (payment_amount, should_receive)
    /// - payment_amount: Amount to pay or receive
    /// - should_receive: true if receiving, false if paying
    public fun apply_funding_payment(
        position_size: u64,
        is_long: bool,
        funding_rate: u64,
        longs_pay: bool,
    ): (u64, bool) {
        // Calculate payment: position_size * funding_rate / 10000
        let payment = (position_size * funding_rate) / PRECISION;

        // Determine if this position pays or receives
        let should_receive = if (is_long) {
            // Long position receives if shorts pay (longs_pay = false)
            !longs_pay
        } else {
            // Short position receives if longs pay (longs_pay = true)
            longs_pay
        };

        (payment, should_receive)
    }

    /// Update funding state with new open interest
    public entry fun update_open_interest(
        admin: &signer,
        long_oi: u64,
        short_oi: u64,
    ) acquires FundingState {
        let admin_addr = signer::address_of(admin);
        assert!(exists<FundingState>(admin_addr), E_NOT_INITIALIZED);

        let state = borrow_global_mut<FundingState>(admin_addr);
        state.long_open_interest = long_oi;
        state.short_open_interest = short_oi;

        // Calculate new funding rate
        let (funding_rate, longs_pay) = calculate_funding_rate(long_oi, short_oi);
        state.current_funding_rate = funding_rate;

        // Update cumulative funding
        if (longs_pay) {
            state.cumulative_funding_long = state.cumulative_funding_long + funding_rate;
        } else {
            state.cumulative_funding_short = state.cumulative_funding_short + funding_rate;
        };
    }

    /// Execute funding payments (called periodically by keeper)
    public entry fun execute_funding(
        admin: &signer,
    ) acquires FundingState {
        let admin_addr = signer::address_of(admin);
        assert!(exists<FundingState>(admin_addr), E_NOT_INITIALIZED);

        let state = borrow_global_mut<FundingState>(admin_addr);
        let current_time = timestamp::now_seconds();

        // Check if funding period has elapsed
        assert!(current_time >= state.last_funding_time + FUNDING_PERIOD, E_TOO_SOON);

        // Update last funding time
        state.last_funding_time = current_time;

        // Funding payments are applied when positions are updated
        // This function just marks the funding period
    }

    /// View function: Get current funding rate
    #[view]
    public fun get_current_funding_rate(state_addr: address): (u64, bool) acquires FundingState {
        assert!(exists<FundingState>(state_addr), E_NOT_INITIALIZED);
        let state = borrow_global<FundingState>(state_addr);
        
        let (rate, longs_pay) = calculate_funding_rate(
            state.long_open_interest,
            state.short_open_interest
        );
        
        (rate, longs_pay)
    }

    /// View function: Get funding state
    #[view]
    public fun get_funding_state(state_addr: address): (u64, u64, u64, u64) acquires FundingState {
        assert!(exists<FundingState>(state_addr), E_NOT_INITIALIZED);
        let state = borrow_global<FundingState>(state_addr);
        
        (
            state.long_open_interest,
            state.short_open_interest,
            state.cumulative_funding_long,
            state.cumulative_funding_short
        )
    }

    /// View function: Calculate time until next funding
    #[view]
    public fun time_until_next_funding(state_addr: address): u64 acquires FundingState {
        assert!(exists<FundingState>(state_addr), E_NOT_INITIALIZED);
        let state = borrow_global<FundingState>(state_addr);
        let current_time = timestamp::now_seconds();
        
        let next_funding_time = state.last_funding_time + FUNDING_PERIOD;
        
        if (current_time >= next_funding_time) {
            0 // Funding is due
        } else {
            next_funding_time - current_time
        }
    }

    /// Calculate estimated funding payment for a position
    #[view]
    public fun estimate_funding_payment(
        state_addr: address,
        position_size: u64,
        is_long: bool,
    ): (u64, bool) acquires FundingState {
        let (funding_rate, longs_pay) = get_current_funding_rate(state_addr);
        apply_funding_payment(position_size, is_long, funding_rate, longs_pay)
    }

    /// Calculate funding payment for specific rate
    public fun calculate_payment(
        position_size: u64,
        funding_rate: u64,
    ): u64 {
        (position_size * funding_rate) / PRECISION
    }

    /// Get funding rate as APR (annualized percentage rate)
    public fun get_funding_apr(hourly_rate: u64): u64 {
        // APR = hourly_rate * 24 * 365
        hourly_rate * 8760 // 24 * 365 = 8760 hours per year
    }
}
