module cresca::simple_wallet {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    /// Transfer coins from sender to recipient
    public entry fun send(
        sender: &signer,
        recipient: address,
        amount: u64
    ) {
        coin::transfer<AptosCoin>(sender, recipient, amount);
    }

    /// Batch transfer to multiple recipients
    public entry fun send_batch(
        sender: &signer,
        recipients: vector<address>,
        amounts: vector<u64>
    ) {
        let len = std::vector::length(&recipients);
        assert!(len == std::vector::length(&amounts), 1); // Lengths must match
        
        let i = 0;
        while (i < len) {
            let recipient = *std::vector::borrow(&recipients, i);
            let amount = *std::vector::borrow(&amounts, i);
            coin::transfer<AptosCoin>(sender, recipient, amount);
            i = i + 1;
        };
    }

    /// View function: Get account balance
    #[view]
    public fun get_balance(account: address): u64 {
        coin::balance<AptosCoin>(account)
    }

    /// View function: Check if account exists
    #[view]
    public fun account_exists(account: address): bool {
        coin::is_account_registered<AptosCoin>(account)
    }

    /// Register account to receive coins (if not already registered)
    public entry fun register(account: &signer) {
        if (!coin::is_account_registered<AptosCoin>(signer::address_of(account))) {
            coin::register<AptosCoin>(account);
        };
    }
}
