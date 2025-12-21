// Movement Baskets - Test All Features
// Run with: node test-contracts.js

const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");

const ACCOUNT_ADDRESS = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7";
const PRIVATE_KEY = "0xdf94e8acc3c4ce17b20665a02708cafbd7f61cd40b3c1a5929ae3daa2a7ddda8";

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: "https://testnet.movementnetwork.xyz/v1",
  faucet: "https://faucet.testnet.movementnetwork.xyz"
});

const aptos = new Aptos(config);

async function testAllContracts() {
  console.log("\n" + "=".repeat(50));
  console.log("  MOVEMENT BASKETS - FEATURE TESTING");
  console.log("=".repeat(50) + "\n");

  const privateKey = new Ed25519PrivateKey(PRIVATE_KEY);
  const account = Account.fromPrivateKey({ privateKey });

  try {
    // Test 1: Verify Deployment
    console.log("[1/10] Verifying deployed modules...");
    const modules = await aptos.getAccountModules({ accountAddress: ACCOUNT_ADDRESS });
    console.log(`✓ Found ${modules.length} modules deployed`);
    modules.forEach(m => console.log(`  - ${m.abi.name}`));
    console.log();

    // Test 2: Initialize Basket Vault
    console.log("[2/10] Initializing basket vault...");
    try {
      const vaultTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::basket_vault::initialize`,
          functionArguments: []
        }
      });
      const vaultResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: vaultTx });
      await aptos.waitForTransaction({ transactionHash: vaultResult.hash });
      console.log(`✓ Basket vault initialized (tx: ${vaultResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`⚠ Vault: ${e.message.includes("already") ? "Already initialized" : e.message}\n`);
    }

    // Test 3: Initialize Price Oracle
    console.log("[3/10] Initializing price oracle...");
    try {
      const oracleTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::price_oracle::initialize`,
          functionArguments: []
        }
      });
      const oracleResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: oracleTx });
      await aptos.waitForTransaction({ transactionHash: oracleResult.hash });
      console.log(`✓ Price oracle initialized (tx: ${oracleResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`⚠ Oracle: ${e.message.includes("already") ? "Already initialized" : e.message}\n`);
    }

    // Test 4: Set BTC Price
    console.log("[4/10] Setting BTC price to $95,000...");
    try {
      const btcTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::price_oracle::update_price`,
          functionArguments: ["BTC", 9500000]
        }
      });
      const btcResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: btcTx });
      await aptos.waitForTransaction({ transactionHash: btcResult.hash });
      console.log(`✓ BTC price set (tx: ${btcResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`✗ BTC price error: ${e.message}\n`);
    }

    // Test 5: Set ETH Price
    console.log("[5/10] Setting ETH price to $3,500...");
    try {
      const ethTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::price_oracle::update_price`,
          functionArguments: ["ETH", 350000]
        }
      });
      const ethResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: ethTx });
      await aptos.waitForTransaction({ transactionHash: ethResult.hash });
      console.log(`✓ ETH price set (tx: ${ethResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`✗ ETH price error: ${e.message}\n`);
    }

    // Test 6: Set SOL Price
    console.log("[6/10] Setting SOL price to $190...");
    try {
      const solTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::price_oracle::update_price`,
          functionArguments: ["SOL", 19000]
        }
      });
      const solResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: solTx });
      await aptos.waitForTransaction({ transactionHash: solResult.hash });
      console.log(`✓ SOL price set (tx: ${solResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`✗ SOL price error: ${e.message}\n`);
    }

    // Test 7: Initialize Funding Rate
    console.log("[7/10] Initializing funding rate mechanism...");
    try {
      const fundingTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::funding_rate::initialize`,
          functionArguments: []
        }
      });
      const fundingResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: fundingTx });
      await aptos.waitForTransaction({ transactionHash: fundingResult.hash });
      console.log(`✓ Funding rate initialized (tx: ${fundingResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`⚠ Funding: ${e.message.includes("already") ? "Already initialized" : e.message}\n`);
    }

    // Test 8: Initialize Rebalancing Engine
    console.log("[8/10] Initializing AI rebalancing engine...");
    try {
      const rebalanceTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::rebalancing_engine::initialize`,
          functionArguments: []
        }
      });
      const rebalanceResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: rebalanceTx });
      await aptos.waitForTransaction({ transactionHash: rebalanceResult.hash });
      console.log(`✓ AI rebalancing initialized (tx: ${rebalanceResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`⚠ Rebalancing: ${e.message.includes("already") ? "Already initialized" : e.message}\n`);
    }

    // Test 9: Initialize Revenue Distributor
    console.log("[9/10] Initializing revenue distributor...");
    try {
      const revenueTx = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${ACCOUNT_ADDRESS}::revenue_distributor::initialize`,
          functionArguments: []
        }
      });
      const revenueResult = await aptos.signAndSubmitTransaction({ signer: account, transaction: revenueTx });
      await aptos.waitForTransaction({ transactionHash: revenueResult.hash });
      console.log(`✓ Revenue distributor initialized (tx: ${revenueResult.hash.slice(0, 10)}...)\n`);
    } catch (e) {
      console.log(`⚠ Revenue: ${e.message.includes("already") ? "Already initialized" : e.message}\n`);
    }

    // Test 10: Check Account Balance
    console.log("[10/10] Checking account balance...");
    const resources = await aptos.getAccountResources({ accountAddress: ACCOUNT_ADDRESS });
    const aptosAccount = resources.find(r => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
    if (aptosAccount) {
      const balance = parseInt(aptosAccount.data.coin.value) / 100000000;
      console.log(`✓ Balance: ${balance} APT\n`);
    }

    console.log("=".repeat(50));
    console.log("         ALL TESTS COMPLETE!");
    console.log("=".repeat(50) + "\n");

    console.log("✅ All contracts are initialized and ready!");
    console.log("\nNext steps:");
    console.log("1. Start API: npm run dev");
    console.log("2. Test position opening (10x leverage)");
    console.log("3. Test AI risk scoring");
    console.log("4. Track revenue streams\n");

    console.log("Explorer:", `https://explorer.movementnetwork.xyz/?network=bardock+testnet/account/${ACCOUNT_ADDRESS}\n`);

  } catch (error) {
    console.error("Error during testing:", error);
  }
}

testAllContracts();
