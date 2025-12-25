#[test_only]
module cresca::test_simple_wallet {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::account;
    use cresca::simple_wallet;

    #[test(aptos_framework = @0x1, sender = @0x123, recipient = @0x456)]
    public fun test_send_coins(
        aptos_framework: &signer,
        sender: &signer,
        recipient: &signer
    ) {
        // Initialize aptos coin and accounts
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        account::create_account_for_test(signer::address_of(sender));
        account::create_account_for_test(signer::address_of(recipient));
        
        // Register both accounts for AptosCoin
        coin::register<AptosCoin>(sender);
        coin::register<AptosCoin>(recipient);
        
        // Mint 100 coins to sender
        let coins = coin::mint<AptosCoin>(100, &mint_cap);
        coin::deposit(signer::address_of(sender), coins);
        
        // Send 30 coins from sender to recipient
        simple_wallet::send(sender, signer::address_of(recipient), 30);
        
        // Verify balances
        assert!(coin::balance<AptosCoin>(signer::address_of(sender)) == 70, 0);
        assert!(coin::balance<AptosCoin>(signer::address_of(recipient)) == 30, 1);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, sender = @0x123)]
    public fun test_get_balance(
        aptos_framework: &signer,
        sender: &signer
    ) {
        // Initialize
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        account::create_account_for_test(signer::address_of(sender));
        coin::register<AptosCoin>(sender);
        
        // Mint coins
        let coins = coin::mint<AptosCoin>(500, &mint_cap);
        coin::deposit(signer::address_of(sender), coins);
        
        // Check balance using view function
        let balance = simple_wallet::get_balance(signer::address_of(sender));
        assert!(balance == 500, 0);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, sender = @0x123, r1 = @0x456, r2 = @0x789)]
    public fun test_batch_send(
        aptos_framework: &signer,
        sender: &signer,
        r1: &signer,
        r2: &signer
    ) {
        // Initialize
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        account::create_account_for_test(signer::address_of(sender));
        account::create_account_for_test(signer::address_of(r1));
        account::create_account_for_test(signer::address_of(r2));
        
        coin::register<AptosCoin>(sender);
        coin::register<AptosCoin>(r1);
        coin::register<AptosCoin>(r2);
        
        // Mint 1000 coins to sender
        let coins = coin::mint<AptosCoin>(1000, &mint_cap);
        coin::deposit(signer::address_of(sender), coins);
        
        // Batch send to 2 recipients
        let recipients = std::vector::empty<address>();
        std::vector::push_back(&mut recipients, signer::address_of(r1));
        std::vector::push_back(&mut recipients, signer::address_of(r2));
        
        let amounts = std::vector::empty<u64>();
        std::vector::push_back(&mut amounts, 200);
        std::vector::push_back(&mut amounts, 300);
        
        simple_wallet::send_batch(sender, recipients, amounts);
        
        // Verify balances
        assert!(coin::balance<AptosCoin>(signer::address_of(sender)) == 500, 0);
        assert!(coin::balance<AptosCoin>(signer::address_of(r1)) == 200, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(r2)) == 300, 2);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
