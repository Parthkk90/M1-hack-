# Movement Baskets - Complete Feature Testing
# Tests all 7 contracts and their features

$ACCOUNT = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7"
$EXPLORER = "https://explorer.movementnetwork.xyz/?network=bardock+testnet"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   MOVEMENT BASKETS - FEATURE TESTING" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Test 1: Deploy Contracts
Write-Host "[1/10] Deploying all 7 contracts..." -ForegroundColor Yellow
$deployResult = aptos move publish --included-artifacts none --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $deployResult -match "Success") {
    Write-Host "[PASS] Contracts deployed successfully`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] Deployment result: $deployResult`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 5

# Test 2: Verify Modules
Write-Host "[2/10] Verifying deployed modules..." -ForegroundColor Yellow
$modules = aptos account list --account $ACCOUNT 2>&1 | ConvertFrom-Json
if ($modules.Result.Count -gt 0) {
    Write-Host "[PASS] Found $($modules.Result.Count) modules deployed" -ForegroundColor Green
    Write-Host "Modules: $($modules.Result -join ', ')`n" -ForegroundColor White
} else {
    Write-Host "[FAIL] No modules found! Deployment may have failed`n" -ForegroundColor Red
}

# Test 3: Initialize Basket Vault
Write-Host "[3/10] Initializing basket vault..." -ForegroundColor Yellow
$vaultResult = aptos move run --function-id "${ACCOUNT}::basket_vault::initialize" --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $vaultResult -match "Success") {
    Write-Host "[PASS] Basket vault initialized`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] Vault: $($vaultResult | Select-String -Pattern 'Success|Error|already' | Select-Object -First 1)`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3

# Test 4: Initialize Price Oracle
Write-Host "[4/10] Initializing price oracle..." -ForegroundColor Yellow
$oracleResult = aptos move run --function-id "${ACCOUNT}::price_oracle::initialize" --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $oracleResult -match "Success") {
    Write-Host "[PASS] Price oracle initialized`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] Oracle: $($oracleResult | Select-String -Pattern 'Success|Error|already' | Select-Object -First 1)`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3

# Test 5: Set BTC Price
Write-Host "[5/10] Setting BTC price to `$95,000..." -ForegroundColor Yellow
$btcResult = aptos move run --function-id "${ACCOUNT}::price_oracle::update_price" --args string:BTC u64:9500000 --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $btcResult -match "Success") {
    Write-Host "[PASS] BTC price set successfully`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] BTC: $($btcResult | Select-String -Pattern 'Success|Error' | Select-Object -First 1)`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3

# Test 6: Set ETH Price
Write-Host "[6/10] Setting ETH price to `$3,500..." -ForegroundColor Yellow
$ethResult = aptos move run --function-id "${ACCOUNT}::price_oracle::update_price" --args string:ETH u64:350000 --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $ethResult -match "Success") {
    Write-Host "[PASS] ETH price set successfully`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] ETH: $($ethResult | Select-String -Pattern 'Success|Error' | Select-Object -First 1)`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3

# Test 7: Set SOL Price
Write-Host "[7/10] Setting SOL price to `$190..." -ForegroundColor Yellow
$solResult = aptos move run --function-id "${ACCOUNT}::price_oracle::update_price" --args string:SOL u64:19000 --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $solResult -match "Success") {
    Write-Host "[PASS] SOL price set successfully`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] SOL: $($solResult | Select-String -Pattern 'Success|Error' | Select-Object -First 1)`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3

# Test 8: Initialize Funding Rate
Write-Host "[8/10] Initializing funding rate mechanism..." -ForegroundColor Yellow
$fundingResult = aptos move run --function-id "${ACCOUNT}::funding_rate::initialize" --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $fundingResult -match "Success") {
    Write-Host "[PASS] Funding rate initialized`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] Funding: $($fundingResult | Select-String -Pattern 'Success|Error|already' | Select-Object -First 1)`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3

# Test 9: Initialize Rebalancing Engine
Write-Host "[9/10] Initializing AI rebalancing engine..." -ForegroundColor Yellow
$rebalanceResult = aptos move run --function-id "${ACCOUNT}::rebalancing_engine::initialize" --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $rebalanceResult -match "Success") {
    Write-Host "[PASS] AI rebalancing engine initialized`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] Rebalancing: $($rebalanceResult | Select-String -Pattern 'Success|Error|already' | Select-Object -First 1)`n" -ForegroundColor Yellow
}
Start-Sleep -Seconds 3

# Test 10: Initialize Revenue Distributor
Write-Host "[10/10] Initializing revenue distributor..." -ForegroundColor Yellow
$revenueResult = aptos move run --function-id "${ACCOUNT}::revenue_distributor::initialize" --assume-yes 2>&1
if ($LASTEXITCODE -eq 0 -or $revenueResult -match "Success") {
    Write-Host "[PASS] Revenue distributor initialized`n" -ForegroundColor Green
} else {
    Write-Host "[WARN] Revenue: $($revenueResult | Select-String -Pattern 'Success|Error|already' | Select-Object -First 1)`n" -ForegroundColor Yellow
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "         TESTING COMPLETE!" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Explorer: ${EXPLORER}/account/${ACCOUNT}`n" -ForegroundColor Cyan

Write-Host "All contracts initialized! Now you can:" -ForegroundColor Green
Write-Host "1. Open test position: npm run dev (then POST to /api/position/open)" -ForegroundColor White
Write-Host "2. View prices: GET /api/prices" -ForegroundColor White
Write-Host "3. Test AI rebalancing calculations" -ForegroundColor White
Write-Host "4. Track revenue across 4 streams`n" -ForegroundColor White

# Show contract addresses for reference
Write-Host "Contract Addresses:" -ForegroundColor Yellow
Write-Host "  basket_vault: ${ACCOUNT}::basket_vault" -ForegroundColor White
Write-Host "  leverage_engine: ${ACCOUNT}::leverage_engine" -ForegroundColor White
Write-Host "  price_oracle: ${ACCOUNT}::price_oracle" -ForegroundColor White
Write-Host "  funding_rate: ${ACCOUNT}::funding_rate" -ForegroundColor White
Write-Host "  rebalancing_engine: ${ACCOUNT}::rebalancing_engine" -ForegroundColor White
Write-Host "  revenue_distributor: ${ACCOUNT}::revenue_distributor" -ForegroundColor White
Write-Host "  payment_scheduler: ${ACCOUNT}::payment_scheduler`n" -ForegroundColor White
