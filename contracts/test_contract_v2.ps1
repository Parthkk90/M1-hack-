# Bucket Protocol Contract Test Suite v2
# Deployed at: 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796

$CONTRACT_ADDRESS = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796"
$PRIVATE_KEY = "0x855F7AB6FB12535AAF661AF350B88270DB2CFE801C68AB4BEFC73B40F6599050"
$RPC_URL = "https://testnet.movementnetwork.xyz/v1"
$MODULE_NAME = "bucket_protocol"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Bucket Protocol Test Suite v2" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

function Test-ViewFunction {
    param(
        [string]$TestName,
        [string]$FunctionId,
        [array]$Args = @()
    )
    
    Write-Host "`nTesting View: $TestName" -ForegroundColor Yellow
    
    $cmd = "aptos move view --function-id $FunctionId --url $RPC_URL"
    if ($Args.Count -gt 0) {
        $argsStr = ($Args -join " ")
        $cmd += " --args $argsStr"
    }
    
    Write-Host "Command: $cmd" -ForegroundColor Gray
    
    try {
        $output = Invoke-Expression $cmd 2>&1 | Out-String
        $result = $output | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        if ($result.Result) {
            Write-Host "[PASS] $TestName" -ForegroundColor Green
            Write-Host "Result: $($result.Result | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
            $script:testsPassed++
            return $result.Result
        } else {
            Write-Host "[FAIL] $TestName" -ForegroundColor Red
            Write-Host "Error: $output" -ForegroundColor Red
            $script:testsFailed++
            return $null
        }
    } catch {
        Write-Host "[FAIL] $TestName" -ForegroundColor Red
        Write-Host "Exception: $_" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 1: View Functions - Contract State" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test 1: Get bucket count
Test-ViewFunction -TestName "Get Bucket Count" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket_count" `
    -Args @("address:$CONTRACT_ADDRESS")

# Test 2: Get position count
Test-ViewFunction -TestName "Get Position Count" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position_count" `
    -Args @("address:$CONTRACT_ADDRESS")

# Test 3: Get collateral balance
Test-ViewFunction -TestName "Get Collateral Balance" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_collateral_balance" `
    -Args @("address:$CONTRACT_ADDRESS", "address:$CONTRACT_ADDRESS")

# Test 4: Get oracle prices
Test-ViewFunction -TestName "Get Oracle Prices" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_oracle_prices" `
    -Args @("address:$CONTRACT_ADDRESS")

# Test 5: Get oracle funding rates
Test-ViewFunction -TestName "Get Oracle Funding Rates" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_oracle_funding_rates" `
    -Args @("address:$CONTRACT_ADDRESS")

# Test 6: Get all bucket IDs
Test-ViewFunction -TestName "Get All Bucket IDs" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_all_bucket_ids" `
    -Args @("address:$CONTRACT_ADDRESS")

# Test 7: Get active position IDs
Test-ViewFunction -TestName "Get Active Position IDs" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_active_position_ids" `
    -Args @("address:$CONTRACT_ADDRESS")

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 2: Transaction Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n--- Test: Update Oracle Prices ---" -ForegroundColor Yellow
$cmd = "aptos move run --function-id ${CONTRACT_ADDRESS}::${MODULE_NAME}::update_oracle --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args 'u64:[1000,2000,3000]' 'u64:[10,20,30]'"
Write-Host "Command: $cmd" -ForegroundColor Gray
try {
    $result = Invoke-Expression $cmd 2>&1 | Out-String
    Write-Host $result -ForegroundColor Gray
    if ($result -match '"success":\s*true') {
        Write-Host "[PASS] Update Oracle Prices" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[FAIL] Update Oracle Prices" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "[FAIL] Update Oracle Prices - $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 3

Write-Host "`n--- Test: Deposit Collateral ---" -ForegroundColor Yellow
$cmd = "aptos move run --function-id ${CONTRACT_ADDRESS}::${MODULE_NAME}::deposit_collateral --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:5000"
Write-Host "Command: $cmd" -ForegroundColor Gray
try {
    $result = Invoke-Expression $cmd 2>&1 | Out-String
    Write-Host $result -ForegroundColor Gray
    if ($result -match '"success":\s*true') {
        Write-Host "[PASS] Deposit Collateral" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[FAIL] Deposit Collateral" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "[FAIL] Deposit Collateral - $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 3

Write-Host "`n--- Test: Create Bucket ---" -ForegroundColor Yellow
$cmd = "aptos move run --function-id ${CONTRACT_ADDRESS}::${MODULE_NAME}::create_bucket --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args 'u64:[1,2,3]' 'u64:[50,30,20]' u64:20"
Write-Host "Command: $cmd" -ForegroundColor Gray
try {
    $result = Invoke-Expression $cmd 2>&1 | Out-String
    Write-Host $result -ForegroundColor Gray
    if ($result -match '"success":\s*true') {
        Write-Host "[PASS] Create Bucket" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[FAIL] Create Bucket" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "[FAIL] Create Bucket - $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 3

Write-Host "`n--- Test: Open Position ---" -ForegroundColor Yellow
$cmd = "aptos move run --function-id ${CONTRACT_ADDRESS}::${MODULE_NAME}::open_position --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:0 bool:true u64:1000 u64:5"
Write-Host "Command: $cmd" -ForegroundColor Gray
try {
    $result = Invoke-Expression $cmd 2>&1 | Out-String
    Write-Host $result -ForegroundColor Gray
    if ($result -match '"success":\s*true') {
        Write-Host "[PASS] Open Position" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "[FAIL] Open Position" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "[FAIL] Open Position - $_" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 3: Post-Transaction View Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test after transactions
Test-ViewFunction -TestName "Get Bucket After Creation (ID: 0)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket" `
    -Args @("address:$CONTRACT_ADDRESS", "u64:0")

Test-ViewFunction -TestName "Get Position After Opening (ID: 0)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position" `
    -Args @("address:$CONTRACT_ADDRESS", "u64:0")

Test-ViewFunction -TestName "Get Position Health Factor" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position_health_factor" `
    -Args @("address:$CONTRACT_ADDRESS", "u64:0")

Test-ViewFunction -TestName "Get Bucket Market Value" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket_market_value" `
    -Args @("address:$CONTRACT_ADDRESS", "u64:0")

Test-ViewFunction -TestName "Get Asset Price (Asset 1)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_asset_price" `
    -Args @("address:$CONTRACT_ADDRESS", "u64:1")

Test-ViewFunction -TestName "Get Collateral After Transactions" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_collateral_balance" `
    -Args @("address:$CONTRACT_ADDRESS", "address:$CONTRACT_ADDRESS")

Test-ViewFunction -TestName "Get Active Positions" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_active_position_ids" `
    -Args @("address:$CONTRACT_ADDRESS")

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "[SUCCESS] All tests passed!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Some tests failed - Review above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Contract: $CONTRACT_ADDRESS" -ForegroundColor Cyan
Write-Host "Network: Movement Testnet" -ForegroundColor Cyan
