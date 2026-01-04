module cresca::wallet {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use std::vector;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_UNAUTHORIZED: u64 = 5;
    const E_PAYMENT_NOT_DUE: u64 = 6;
    const E_BASKET_NOT_FOUND: u64 = 7;

    /// Wallet resource stored under user's account
    struct Wallet has key {
        balance: u64,
        transaction_count: u64,
        created_at: u64,
        transaction_events: EventHandle<TransactionEvent>,
        scheduled_payment_events: EventHandle<ScheduledPaymentEvent>,
    }

    /// Scheduled payment for automatic transactions
    struct ScheduledPayment has store, copy, drop {
        id: u64,
        recipient: address,
        amount: u64,
        execution_time: u64,
        interval: u64, // 0 for one-time, > 0 for recurring (in seconds)
        executed: bool,
        created_at: u64,
    }

    /// Scheduled payments storage
    struct ScheduledPayments has key {
        payments: vector<ScheduledPayment>,
        next_payment_id: u64,
    }

    /// Basket for perpetual trading
    struct Basket has store, copy, drop {
        id: u64,
        name: vector<u8>,
        total_value: u64,
        created_at: u64,
        owner: address,
    }

    /// Basket storage
    struct Baskets has key {
        owned_baskets: vector<Basket>,
        next_basket_id: u64,
    }

    /// Transaction event
    struct TransactionEvent has store, drop {
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
        transaction_type: u8, // 0: send, 1: receive, 2: basket, 3: scheduled
    }

    /// Scheduled payment event
    struct ScheduledPaymentEvent has store, drop {
        payment_id: u64,
        recipient: address,
        amount: u64,
        execution_time: u64,
        status: u8, // 0: created, 1: executed, 2: cancelled
    }

    /// Initialize wallet for user
    public entry fun initialize_wallet(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<Wallet>(account_addr), E_ALREADY_INITIALIZED);

        // Register for AptosCoin if not already registered
        if (!coin::is_account_registered<AptosCoin>(account_addr)) {
            coin::register<AptosCoin>(account);
        };

        let wallet = Wallet {
            balance: 0,
            transaction_count: 0,
            created_at: timestamp::now_seconds(),
            transaction_events: account::new_event_handle<TransactionEvent>(account),
            scheduled_payment_events: account::new_event_handle<ScheduledPaymentEvent>(account),
        };
        move_to(account, wallet);

        // Initialize scheduled payments
        let scheduled_payments = ScheduledPayments {
            payments: vector::empty<ScheduledPayment>(),
            next_payment_id: 0,
        };
        move_to(account, scheduled_payments);

        // Initialize baskets
        let baskets = Baskets {
            owned_baskets: vector::empty<Basket>(),
            next_basket_id: 0,
        };
        move_to(account, baskets);
    }

    /// Send coins to recipient
    public entry fun send_coins(
        sender: &signer,
        recipient: address,
        amount: u64
    ) acquires Wallet {
        let sender_addr = signer::address_of(sender);
        assert!(exists<Wallet>(sender_addr), E_NOT_INITIALIZED);
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Transfer coins using Aptos framework
        coin::transfer<AptosCoin>(sender, recipient, amount);

        // Update sender wallet
        let sender_wallet = borrow_global_mut<Wallet>(sender_addr);
        sender_wallet.transaction_count = sender_wallet.transaction_count + 1;

        // Emit transaction event
        event::emit_event(
            &mut sender_wallet.transaction_events,
            TransactionEvent {
                from: sender_addr,
                to: recipient,
                amount,
                timestamp: timestamp::now_seconds(),
                transaction_type: 0,
            }
        );

        // Update recipient wallet if exists
        if (exists<Wallet>(recipient)) {
            let recipient_wallet = borrow_global_mut<Wallet>(recipient);
            recipient_wallet.transaction_count = recipient_wallet.transaction_count + 1;
            
            event::emit_event(
                &mut recipient_wallet.transaction_events,
                TransactionEvent {
                    from: sender_addr,
                    to: recipient,
                    amount,
                    timestamp: timestamp::now_seconds(),
                    transaction_type: 1,
                }
            );
        };
    }

    /// Get wallet balance
    public fun get_balance(account_addr: address): u64 {
        coin::balance<AptosCoin>(account_addr)
    }

    /// Get transaction count
    public fun get_transaction_count(account_addr: address): u64 acquires Wallet {
        assert!(exists<Wallet>(account_addr), E_NOT_INITIALIZED);
        let wallet = borrow_global<Wallet>(account_addr);
        wallet.transaction_count
    }

    /// Schedule a payment
    public entry fun schedule_payment(
        account: &signer,
        recipient: address,
        amount: u64,
        execution_time: u64,
        interval: u64
    ) acquires ScheduledPayments, Wallet {
        let account_addr = signer::address_of(account);
        assert!(exists<Wallet>(account_addr), E_NOT_INITIALIZED);
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(execution_time > timestamp::now_seconds(), E_PAYMENT_NOT_DUE);

        let scheduled_payments = borrow_global_mut<ScheduledPayments>(account_addr);
        let payment_id = scheduled_payments.next_payment_id;

        let payment = ScheduledPayment {
            id: payment_id,
            recipient,
            amount,
            execution_time,
            interval,
            executed: false,
            created_at: timestamp::now_seconds(),
        };

        vector::push_back(&mut scheduled_payments.payments, payment);
        scheduled_payments.next_payment_id = payment_id + 1;

        // Emit scheduled payment event
        let wallet = borrow_global_mut<Wallet>(account_addr);
        event::emit_event(
            &mut wallet.scheduled_payment_events,
            ScheduledPaymentEvent {
                payment_id,
                recipient,
                amount,
                execution_time,
                status: 0,
            }
        );
    }

    /// Execute scheduled payment
    public entry fun execute_scheduled_payment(
        account: &signer,
        payment_id: u64
    ) acquires ScheduledPayments, Wallet {
        let account_addr = signer::address_of(account);
        assert!(exists<Wallet>(account_addr), E_NOT_INITIALIZED);

        let scheduled_payments = borrow_global_mut<ScheduledPayments>(account_addr);
        let len = vector::length(&scheduled_payments.payments);
        let i = 0;
        let found = false;
        let payment_copy = ScheduledPayment {
            id: 0,
            recipient: @0x0,
            amount: 0,
            execution_time: 0,
            interval: 0,
            executed: false,
            created_at: 0,
        };

        while (i < len) {
            let payment = vector::borrow_mut(&mut scheduled_payments.payments, i);
            if (payment.id == payment_id) {
                assert!(!payment.executed, E_UNAUTHORIZED);
                assert!(timestamp::now_seconds() >= payment.execution_time, E_PAYMENT_NOT_DUE);
                
                payment_copy = *payment;
                payment.executed = true;
                found = true;
                break
            };
            i = i + 1;
        };

        assert!(found, E_BASKET_NOT_FOUND);

        // Execute the payment
        send_coins(account, payment_copy.recipient, payment_copy.amount);

        // Emit event
        let wallet = borrow_global_mut<Wallet>(account_addr);
        event::emit_event(
            &mut wallet.scheduled_payment_events,
            ScheduledPaymentEvent {
                payment_id,
                recipient: payment_copy.recipient,
                amount: payment_copy.amount,
                execution_time: payment_copy.execution_time,
                status: 1,
            }
        );

        // If recurring, schedule next payment
        if (payment_copy.interval > 0) {
            schedule_payment(
                account,
                payment_copy.recipient,
                payment_copy.amount,
                payment_copy.execution_time + payment_copy.interval,
                payment_copy.interval
            );
        };
    }

    /// Create a basket
    public entry fun create_basket(
        account: &signer,
        name: vector<u8>,
        initial_value: u64
    ) acquires Baskets, Wallet {
        let account_addr = signer::address_of(account);
        assert!(exists<Wallet>(account_addr), E_NOT_INITIALIZED);
        assert!(initial_value > 0, E_INVALID_AMOUNT);

        // Lock funds for basket
        let balance = get_balance(account_addr);
        assert!(balance >= initial_value, E_INSUFFICIENT_BALANCE);

        let baskets = borrow_global_mut<Baskets>(account_addr);
        let basket_id = baskets.next_basket_id;

        let basket = Basket {
            id: basket_id,
            name,
            total_value: initial_value,
            created_at: timestamp::now_seconds(),
            owner: account_addr,
        };

        vector::push_back(&mut baskets.owned_baskets, basket);
        baskets.next_basket_id = basket_id + 1;

        // Update wallet
        let wallet = borrow_global_mut<Wallet>(account_addr);
        event::emit_event(
            &mut wallet.transaction_events,
            TransactionEvent {
                from: account_addr,
                to: account_addr,
                amount: initial_value,
                timestamp: timestamp::now_seconds(),
                transaction_type: 2,
            }
        );
    }

    /// Get basket count
    public fun get_basket_count(account_addr: address): u64 acquires Baskets {
        if (!exists<Baskets>(account_addr)) {
            return 0
        };
        let baskets = borrow_global<Baskets>(account_addr);
        vector::length(&baskets.owned_baskets)
    }

    /// Get scheduled payment count
    public fun get_scheduled_payment_count(account_addr: address): u64 acquires ScheduledPayments {
        if (!exists<ScheduledPayments>(account_addr)) {
            return 0
        };
        let scheduled_payments = borrow_global<ScheduledPayments>(account_addr);
        vector::length(&scheduled_payments.payments)
    }

    #[view]
    public fun is_wallet_initialized(account_addr: address): bool {
        exists<Wallet>(account_addr)
    }
}
