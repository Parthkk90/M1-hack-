module cresca::payment_scheduler {
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_INVALID_EXECUTION_TIME: u64 = 2;
    const E_INVALID_AMOUNT: u64 = 3;
    const E_ALREADY_CANCELLED: u64 = 4;
    const E_NOT_FOUND: u64 = 5;
    const E_NOT_OWNER: u64 = 6;

    /// Schedule types
    const SCHEDULE_ONE_TIME: u8 = 0;
    const SCHEDULE_RECURRING: u8 = 1;

    /// Recurrence intervals (in seconds)
    const INTERVAL_DAILY: u64 = 86400;        // 24 hours
    const INTERVAL_WEEKLY: u64 = 604800;      // 7 days
    const INTERVAL_MONTHLY: u64 = 2592000;    // 30 days
    const INTERVAL_YEARLY: u64 = 31536000;    // 365 days

    /// Scheduled payment structure
    struct ScheduledPayment has store, drop, copy {
        id: u64,
        sender: address,
        recipient: address,
        amount: u64,
        schedule_type: u8,
        execution_time: u64,
        interval: u64,
        remaining_executions: u64,
        last_executed: u64,
        is_active: bool,
    }

    /// Payment scheduler storage
    struct PaymentScheduler has key {
        schedules: vector<ScheduledPayment>,
        next_schedule_id: u64,
        total_locked_funds: u64,
    }

    /// Initialize payment scheduler
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<PaymentScheduler>(account_addr)) {
            move_to(account, PaymentScheduler {
                schedules: vector::empty<ScheduledPayment>(),
                next_schedule_id: 0,
                total_locked_funds: 0,
            });
        };
    }

    /// Schedule one-time payment
    public entry fun schedule_one_time_payment(
        sender: &signer,
        recipient: address,
        amount: u64,
        execution_timestamp: u64,
    ) acquires PaymentScheduler {
        let sender_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();

        assert!(execution_timestamp > current_time, E_INVALID_EXECUTION_TIME);
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Lock collateral
        let collateral = coin::withdraw<AptosCoin>(sender, amount);
        
        if (!exists<PaymentScheduler>(sender_addr)) {
            initialize(sender);
        };

        let scheduler = borrow_global_mut<PaymentScheduler>(sender_addr);
        let schedule_id = scheduler.next_schedule_id;

        let payment = ScheduledPayment {
            id: schedule_id,
            sender: sender_addr,
            recipient,
            amount,
            schedule_type: SCHEDULE_ONE_TIME,
            execution_time: execution_timestamp,
            interval: 0,
            remaining_executions: 1,
            last_executed: 0,
            is_active: true,
        };

        vector::push_back(&mut scheduler.schedules, payment);
        scheduler.total_locked_funds = scheduler.total_locked_funds + amount;
        scheduler.next_schedule_id = schedule_id + 1;

        // Deposit locked funds back (in production, use escrow)
        coin::deposit(sender_addr, collateral);
    }

    /// Schedule recurring payment
    public entry fun schedule_recurring_payment(
        sender: &signer,
        recipient: address,
        amount: u64,
        first_execution: u64,
        interval_type: u64,
        execution_count: u64,
    ) acquires PaymentScheduler {
        let sender_addr = signer::address_of(sender);
        let current_time = timestamp::now_seconds();

        assert!(first_execution > current_time, E_INVALID_EXECUTION_TIME);
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Calculate interval
        let interval = if (interval_type == 0) {
            INTERVAL_DAILY
        } else if (interval_type == 1) {
            INTERVAL_WEEKLY
        } else if (interval_type == 2) {
            INTERVAL_MONTHLY
        } else {
            INTERVAL_YEARLY
        };

        // Lock collateral for first payment
        let collateral = coin::withdraw<AptosCoin>(sender, amount);
        
        if (!exists<PaymentScheduler>(sender_addr)) {
            initialize(sender);
        };

        let scheduler = borrow_global_mut<PaymentScheduler>(sender_addr);
        let schedule_id = scheduler.next_schedule_id;

        let payment = ScheduledPayment {
            id: schedule_id,
            sender: sender_addr,
            recipient,
            amount,
            schedule_type: SCHEDULE_RECURRING,
            execution_time: first_execution,
            interval,
            remaining_executions: execution_count,
            last_executed: 0,
            is_active: true,
        };

        vector::push_back(&mut scheduler.schedules, payment);
        scheduler.total_locked_funds = scheduler.total_locked_funds + amount;
        scheduler.next_schedule_id = schedule_id + 1;

        coin::deposit(sender_addr, collateral);
    }

    /// Execute pending payments (keeper function)
    public entry fun execute_pending_payments(
        executor: &signer,
        scheduler_addr: address,
    ) acquires PaymentScheduler {
        assert!(exists<PaymentScheduler>(scheduler_addr), E_NOT_INITIALIZED);
        
        let current_time = timestamp::now_seconds();
        let scheduler = borrow_global_mut<PaymentScheduler>(scheduler_addr);

        let i = 0;
        let len = vector::length(&scheduler.schedules);
        while (i < len) {
            let payment = vector::borrow_mut(&mut scheduler.schedules, i);
            
            if (payment.is_active && current_time >= payment.execution_time) {
                // Execute payment
                let payment_coin = coin::withdraw<AptosCoin>(executor, payment.amount);
                coin::deposit(payment.recipient, payment_coin);

                payment.last_executed = current_time;

                if (payment.schedule_type == SCHEDULE_ONE_TIME) {
                    payment.is_active = false;
                    payment.remaining_executions = 0;
                } else {
                    // Recurring payment
                    if (payment.remaining_executions > 0) {
                        payment.remaining_executions = payment.remaining_executions - 1;
                        if (payment.remaining_executions == 0) {
                            payment.is_active = false;
                        };
                    };
                    payment.execution_time = current_time + payment.interval;
                };

                scheduler.total_locked_funds = scheduler.total_locked_funds - payment.amount;
            };

            i = i + 1;
        };
    }

    /// Cancel scheduled payment
    public entry fun cancel_schedule(
        sender: &signer,
        schedule_id: u64,
    ) acquires PaymentScheduler {
        let sender_addr = signer::address_of(sender);
        assert!(exists<PaymentScheduler>(sender_addr), E_NOT_INITIALIZED);

        let scheduler = borrow_global_mut<PaymentScheduler>(sender_addr);
        
        let i = 0;
        let len = vector::length(&scheduler.schedules);
        while (i < len) {
            let payment = vector::borrow_mut(&mut scheduler.schedules, i);
            if (payment.id == schedule_id && payment.sender == sender_addr) {
                assert!(payment.is_active, E_ALREADY_CANCELLED);
                
                payment.is_active = false;
                scheduler.total_locked_funds = scheduler.total_locked_funds - payment.amount;

                // Return locked funds
                let refund = coin::withdraw<AptosCoin>(sender, payment.amount);
                coin::deposit(sender_addr, refund);
                
                break
            };
            i = i + 1;
        };
    }

    /// View: Get user's scheduled payments
    #[view]
    public fun get_user_schedules(user_addr: address): vector<ScheduledPayment> acquires PaymentScheduler {
        if (!exists<PaymentScheduler>(user_addr)) {
            return vector::empty<ScheduledPayment>()
        };
        
        let scheduler = borrow_global<PaymentScheduler>(user_addr);
        scheduler.schedules
    }

    /// View: Get active schedules count
    #[view]
    public fun get_active_schedules_count(user_addr: address): u64 acquires PaymentScheduler {
        if (!exists<PaymentScheduler>(user_addr)) {
            return 0
        };
        
        let scheduler = borrow_global<PaymentScheduler>(user_addr);
        let count = 0;
        let i = 0;
        let len = vector::length(&scheduler.schedules);
        
        while (i < len) {
            let payment = vector::borrow(&scheduler.schedules, i);
            if (payment.is_active) {
                count = count + 1;
            };
            i = i + 1;
        };
        
        count
    }

    /// View: Get total locked funds
    #[view]
    public fun get_total_locked_funds(user_addr: address): u64 acquires PaymentScheduler {
        if (!exists<PaymentScheduler>(user_addr)) {
            return 0
        };
        
        borrow_global<PaymentScheduler>(user_addr).total_locked_funds
    }

    /// View: Get specific schedule
    #[view]
    public fun get_schedule(user_addr: address, schedule_id: u64): (address, address, u64, u8, u64, u64, u64, bool) acquires PaymentScheduler {
        assert!(exists<PaymentScheduler>(user_addr), E_NOT_INITIALIZED);
        
        let scheduler = borrow_global<PaymentScheduler>(user_addr);
        let i = 0;
        let len = vector::length(&scheduler.schedules);
        
        while (i < len) {
            let payment = vector::borrow(&scheduler.schedules, i);
            if (payment.id == schedule_id) {
                return (
                    payment.sender,
                    payment.recipient,
                    payment.amount,
                    payment.schedule_type,
                    payment.execution_time,
                    payment.interval,
                    payment.remaining_executions,
                    payment.is_active
                )
            };
            i = i + 1;
        };

        abort E_NOT_FOUND
    }
}
