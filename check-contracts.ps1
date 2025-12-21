# Movement Baskets - Simple Feature Testing

$ACCOUNT = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7"
$RPC = "https://testnet.movementnetwork.xyz/v1"
$EXPLORER = "https://explorer.movementnetwork.xyz/?network=bardock+testnet"

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "    MOVEMENT BASKETS - FEATURE TESTING" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

# Test 1: Check Deployed Modules
Write-Host "[TEST 1] Checking deployed modules..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$RPC/accounts/$ACCOUNT/modules" -Method Get
    Write-Host "[PASS] Deployed modules:" -ForegroundColor Green
    $response | ForEach-Object { Write-Host "  * $($_.abi.name)" -ForegroundColor White }
    Write-Host ""
} catch {
    Write-Host "[FAIL] Could not fetch modules" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Check Account Balance
Write-Host "[TEST 2] Checking account balance..." -ForegroundColor Yellow
try {
    $resources = Invoke-RestMethod -Uri "$RPC/accounts/$ACCOUNT/resources" -Method Get
    $coinStore = $resources | Where-Object { $_.type -eq "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>" }
    if ($coinStore) {
        $balance = [double]$coinStore.data.coin.value / 100000000
        Write-Host "[PASS] Balance: $balance APT`n" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Coin store not found`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[FAIL] Could not fetch balance" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Check if Basket Vault is Initialized
Write-Host "[TEST 3] Checking basket vault initialization..." -ForegroundColor Yellow
try {
    $vaultResource = Invoke-RestMethod -Uri "$RPC/accounts/$ACCOUNT/resource/${ACCOUNT}::basket_vault::VaultState" -Method Get
    Write-Host "[PASS] Basket vault is initialized!" -ForegroundColor Green
    Write-Host "  - Total collateral: $($vaultResource.data.total_collateral)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[PENDING] Basket vault not initialized yet" -ForegroundColor Yellow
    Write-Host ""
}

# Test 4: Check if Price Oracle is Initialized
Write-Host "[TEST 4] Checking price oracle initialization..." -ForegroundColor Yellow
try {
    $oracleResource = Invoke-RestMethod -Uri "$RPC/accounts/$ACCOUNT/resource/${ACCOUNT}::price_oracle::PriceOracle" -Method Get
    Write-Host "[PASS] Price oracle is initialized!" -ForegroundColor Green
    Write-Host "  - BTC: $($oracleResource.data.btc_price)" -ForegroundColor White
    Write-Host "  - ETH: $($oracleResource.data.eth_price)" -ForegroundColor White
    Write-Host "  - SOL: $($oracleResource.data.sol_price)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[PENDING] Price oracle not initialized yet" -ForegroundColor Yellow
    Write-Host ""
}

# Test 5: Check if Funding Rate is Initialized
Write-Host "[TEST 5] Checking funding rate initialization..." -ForegroundColor Yellow
try {
    $fundingResource = Invoke-RestMethod -Uri "$RPC/accounts/$ACCOUNT/resource/${ACCOUNT}::funding_rate::FundingState" -Method Get
    Write-Host "[PASS] Funding rate is initialized!" -ForegroundColor Green
    Write-Host "  - Current rate: $($fundingResource.data.current_rate)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[PENDING] Funding rate not initialized yet" -ForegroundColor Yellow
    Write-Host ""
}

# Test 6: Check if Rebalancing Engine is Initialized
Write-Host "[TEST 6] Checking AI rebalancing engine initialization..." -ForegroundColor Yellow
try {
    $rebalanceResource = Invoke-RestMethod -Uri "$RPC/accounts/$ACCOUNT/resource/${ACCOUNT}::rebalancing_engine::RebalancingState" -Method Get
    Write-Host "[PASS] AI rebalancing engine is initialized!" -ForegroundColor Green
    Write-Host "  - Total rebalances: $($rebalanceResource.data.total_rebalances)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[PENDING] Rebalancing engine not initialized yet" -ForegroundColor Yellow
    Write-Host ""
}

# Test 7: Check if Revenue Distributor is Initialized
Write-Host "[TEST 7] Checking revenue distributor initialization..." -ForegroundColor Yellow
try {
    $revenueResource = Invoke-RestMethod -Uri "$RPC/accounts/$ACCOUNT/resource/${ACCOUNT}::revenue_distributor::RevenueVault" -Method Get
    Write-Host "[PASS] Revenue distributor is initialized!" -ForegroundColor Green
    Write-Host "  - Trading fees: $($revenueResource.data.trading_fees)" -ForegroundColor White
    Write-Host "  - Performance fees: $($revenueResource.data.performance_fees)" -ForegroundColor White
    Write-Host "  - Liquidation fees: $($revenueResource.data.liquidation_fees)" -ForegroundColor White
    Write-Host "  - Subscriptions: $($revenueResource.data.subscription_revenue)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "[PENDING] Revenue distributor not initialized yet" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "          TESTING SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Contracts are deployed on Movement testnet!" -ForegroundColor Green
Write-Host "`nExplorer: $EXPLORER/account/$ACCOUNT" -ForegroundColor Cyan

Write-Host "`nContract Features:" -ForegroundColor Yellow
Write-Host "  * basket_vault - 20x max leverage, isolated margin" -ForegroundColor White
Write-Host "  * leverage_engine - 4-tier liquidation system" -ForegroundColor White
Write-Host "  * price_oracle - BTC/ETH/SOL price feeds" -ForegroundColor White
Write-Host "  * funding_rate - Hourly funding payments" -ForegroundColor White
Write-Host "  * rebalancing_engine - AI-powered optimization" -ForegroundColor White
Write-Host "  * revenue_distributor - 4 revenue streams" -ForegroundColor White
Write-Host "  * payment_scheduler - Recurring payments`n" -ForegroundColor White
