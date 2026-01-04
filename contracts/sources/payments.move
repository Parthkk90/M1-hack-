module cresca::payments {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    // ============================================
    // ERROR CODES
    // ============================================
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INVALID_AMOUNT: u64 = 3;
    const E_INVALID_RECIPIENT: u64 = 4;
    const E_TRANSFER_FAILED: u64 = 5;
    const E_LENGTH_MISMATCH: u64 = 6;

    // ============================================
    // STRUCTS
    // ============================================

    struct Payment has store, copy, drop {
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
        memo: String,
        completed: bool,
    }

    struct PaymentHistory has key {
        sent_payments: vector<Payment>,
        received_payments: vector<Payment>,
        total_sent: u64,
        total_received: u64,
        payment_count: u64,
        send_events: EventHandle<PaymentSentEvent>,
        receive_events: EventHandle<PaymentReceivedEvent>,
        tap_to_pay_events: EventHandle<TapToPayEvent>,
    }

    // ============================================
    // EVENTS
    // ============================================

    struct PaymentSentEvent has drop, store {
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
        memo: String,
    }

    struct PaymentReceivedEvent has drop, store {
        from: address,
        to: address,
        amount: u64,
        timestamp: u64,
    }

    struct TapToPayEvent has drop, store {
        sender: address,
        receiver: address,
        amount: u64,
        timestamp: u64,
    }

    // ============================================
    // CORE FUNCTIONS
    // ============================================

    /**
     * Initialize payment history for an account
     */
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<PaymentHistory>(addr), E_ALREADY_INITIALIZED);

        move_to(account, PaymentHistory {
            sent_payments: vector::empty(),
            received_payments: vector::empty(),
            total_sent: 0,
            total_received: 0,
            payment_count: 0,
            send_events: account::new_event_handle<PaymentSentEvent>(account),
            receive_events: account::new_event_handle<PaymentReceivedEvent>(account),
            tap_to_pay_events: account::new_event_handle<TapToPayEvent>(account),
        });
    }

    /**
     * Send payment with optional memo
     */
    public entry fun send_payment(
        sender: &signer,
        recipient: address,
        amount: u64,
        memo: vector<u8>
    ) acquires PaymentHistory {
        let sender_addr = signer::address_of(sender);
        
        // Validate inputs
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(recipient != @0x0, E_INVALID_RECIPIENT);

        // Initialize if needed
        if (!exists<PaymentHistory>(sender_addr)) {
            initialize(sender);
        };

        // Create payment record
        let memo_string = string::utf8(memo);
        let payment = Payment {
            from: sender_addr,
            to: recipient,
            amount,
            timestamp: timestamp::now_seconds(),
            memo: memo_string,
            completed: true,
        };

        // Transfer coins
        coin::transfer<AptosCoin>(sender, recipient, amount);

        // Update sender history
        let sender_history = borrow_global_mut<PaymentHistory>(sender_addr);
        vector::push_back(&mut sender_history.sent_payments, payment);
        sender_history.total_sent = sender_history.total_sent + amount;
        sender_history.payment_count = sender_history.payment_count + 1;

        // Emit event
        event::emit_event(&mut sender_history.send_events, PaymentSentEvent {
            from: sender_addr,
            to: recipient,
            amount,
            timestamp: timestamp::now_seconds(),
            memo: memo_string,
        });

        // Update recipient history if initialized
        if (exists<PaymentHistory>(recipient)) {
            let recipient_history = borrow_global_mut<PaymentHistory>(recipient);
            vector::push_back(&mut recipient_history.received_payments, payment);
            recipient_history.total_received = recipient_history.total_received + amount;
            
            event::emit_event(&mut recipient_history.receive_events, PaymentReceivedEvent {
                from: sender_addr,
                to: recipient,
                amount,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /**
     * Quick send without memo (tap-to-pay)
     */
    public entry fun tap_to_pay(
        sender: &signer,
        recipient: address,
        amount: u64
    ) acquires PaymentHistory {
        let sender_addr = signer::address_of(sender);
        
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(recipient != @0x0, E_INVALID_RECIPIENT);

        // Initialize if needed
        if (!exists<PaymentHistory>(sender_addr)) {
            initialize(sender);
        };

        let payment = Payment {
            from: sender_addr,
            to: recipient,
            amount,
            timestamp: timestamp::now_seconds(),
            memo: string::utf8(b"Tap to Pay"),
            completed: true,
        };

        // Transfer coins
        coin::transfer<AptosCoin>(sender, recipient, amount);

        // Update sender history
        let sender_history = borrow_global_mut<PaymentHistory>(sender_addr);
        vector::push_back(&mut sender_history.sent_payments, payment);
        sender_history.total_sent = sender_history.total_sent + amount;
        sender_history.payment_count = sender_history.payment_count + 1;

        // Emit tap-to-pay event
        event::emit_event(&mut sender_history.tap_to_pay_events, TapToPayEvent {
            sender: sender_addr,
            receiver: recipient,
            amount,
            timestamp: timestamp::now_seconds(),
        });

        // Update recipient history if initialized
        if (exists<PaymentHistory>(recipient)) {
            let recipient_history = borrow_global_mut<PaymentHistory>(recipient);
            vector::push_back(&mut recipient_history.received_payments, payment);
            recipient_history.total_received = recipient_history.total_received + amount;
        };
    }

    /**
     * Batch send to multiple recipients
     */
    public entry fun batch_send(
        sender: &signer,
        recipients: vector<address>,
        amounts: vector<u64>
    ) acquires PaymentHistory {
        let sender_addr = signer::address_of(sender);
        let len = vector::length(&recipients);
        
        assert!(len == vector::length(&amounts), E_LENGTH_MISMATCH);

        // Initialize if needed
        if (!exists<PaymentHistory>(sender_addr)) {
            initialize(sender);
        };

        let i = 0;
        while (i < len) {
            let recipient = *vector::borrow(&recipients, i);
            let amount = *vector::borrow(&amounts, i);
            
            if (amount > 0 && recipient != @0x0) {
                let payment = Payment {
                    from: sender_addr,
                    to: recipient,
                    amount,
                    timestamp: timestamp::now_seconds(),
                    memo: string::utf8(b"Batch Payment"),
                    completed: true,
                };

                // Transfer coins
                coin::transfer<AptosCoin>(sender, recipient, amount);

                // Update sender history
                let sender_history = borrow_global_mut<PaymentHistory>(sender_addr);
                vector::push_back(&mut sender_history.sent_payments, payment);
                sender_history.total_sent = sender_history.total_sent + amount;
                sender_history.payment_count = sender_history.payment_count + 1;

                // Update recipient history if initialized
                if (exists<PaymentHistory>(recipient)) {
                    let recipient_history = borrow_global_mut<PaymentHistory>(recipient);
                    vector::push_back(&mut recipient_history.received_payments, payment);
                    recipient_history.total_received = recipient_history.total_received + amount;
                };
            };

            i = i + 1;
        };
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    #[view]
    public fun is_initialized(addr: address): bool {
        exists<PaymentHistory>(addr)
    }

    #[view]
    public fun get_payment_count(addr: address): (u64, u64) acquires PaymentHistory {
        if (!exists<PaymentHistory>(addr)) {
            return (0, 0)
        };
        let history = borrow_global<PaymentHistory>(addr);
        (vector::length(&history.sent_payments), vector::length(&history.received_payments))
    }

    #[view]
    public fun get_total_volume(addr: address): (u64, u64) acquires PaymentHistory {
        if (!exists<PaymentHistory>(addr)) {
            return (0, 0)
        };
        let history = borrow_global<PaymentHistory>(addr);
        (history.total_sent, history.total_received)
    }

    #[view]
    public fun get_sent_payments_count(addr: address): u64 acquires PaymentHistory {
        if (!exists<PaymentHistory>(addr)) {
            return 0
        };
        let history = borrow_global<PaymentHistory>(addr);
        vector::length(&history.sent_payments)
    }

    #[view]
    public fun get_received_payments_count(addr: address): u64 acquires PaymentHistory {
        if (!exists<PaymentHistory>(addr)) {
            return 0
        };
        let history = borrow_global<PaymentHistory>(addr);
        vector::length(&history.received_payments)
    }
}
