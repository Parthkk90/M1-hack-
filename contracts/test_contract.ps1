# Bucket Protocol Contract Test Suite
# Deployed at: 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796
# Transaction: 0xa6b979d12a4518a4ec9040c2c56ab7700ce54a5d0f15d2ce9159c8e623acc8f5

$CONTRACT_ADDRESS = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796"
$PRIVATE_KEY = "0x855F7AB6FB12535AAF661AF350B88270DB2CFE801C68AB4BEFC73B40F6599050"
$RPC_URL = "https://testnet.movementnetwork.xyz/v1"
$MODULE_NAME = "bucket_protocol"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Bucket Protocol Contract Test Suite" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Address: $CONTRACT_ADDRESS" -ForegroundColor Green
Write-Host "Network: Movement Testnet" -ForegroundColor Green
Write-Host ""

# Test counter
$testsPassed = 0
$testsFailed = 0

function Test-Transaction {
    param(
        [string]$TestName,
        [string]$FunctionId,
        [string]$Args = ""
    )
    
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    
    $cmd = "aptos move run --function-id ${FunctionId} --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes"
    if ($Args -ne "") {
        $cmd += " --args $Args"
    }
    
    $result = Invoke-Expression $cmd 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
    
    if ($result.Result.success -eq $true) {
        Write-Host "[PASS] $TestName" -ForegroundColor Green
        Write-Host "  Gas Used: $($result.Result.gas_used)" -ForegroundColor Gray
        Write-Host "  TX Hash: $($result.Result.transaction_hash)" -ForegroundColor Gray
        $script:testsPassed++
        return $result
    } else {
        Write-Host "[FAIL] $TestName" -ForegroundColor Red
        Write-Host "  Error: $($result.Error)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

function Test-ViewFunction {
    param(
        [string]$TestName,
        [string]$FunctionId,
        [string]$Args = ""
    )
    
    Write-Host "Testing View: $TestName" -ForegroundColor Yellow
    
    $cmd = "aptos move view --function-id ${FunctionId} --url $RPC_URL"
    if ($Args -ne "") {
        $cmd += " --args $Args"
    }
    
    $result = Invoke-Expression $cmd 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
    
    if ($result.Result) {
        Write-Host "[PASS] $TestName" -ForegroundColor Green
        Write-Host "  Result: $($result.Result | ConvertTo-Json -Compress)" -ForegroundColor Gray
        $script:testsPassed++
        return $result.Result
    } else {
        Write-Host "[FAIL] $TestName" -ForegroundColor Red
        Write-Host "  Error: $($result.Error)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 1: Initialization Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Initialize the contract
Test-Transaction -TestName "Initialize Contract" -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::init"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 2: Bucket Creation Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 2: Create a bucket with multiple assets
# Args: assets (vector<u64>), weights (vector<u64>), max_leverage (u64)
Test-Transaction -TestName "Create Multi-Asset Bucket" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::create_bucket" `
    -Args "u64:[1,2,3] u64:[50,30,20] u64:20"

Start-Sleep -Seconds 2

# Test 3: View bucket count
Test-ViewFunction -TestName "Get Bucket Count" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket_count" `
    -Args "address:$CONTRACT_ADDRESS"

# Test 4: View bucket details
Test-ViewFunction -TestName "Get Bucket Details (ID: 0)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket" `
    -Args "address:$CONTRACT_ADDRESS u64:0"

# Test 5: View all bucket IDs
Test-ViewFunction -TestName "Get All Bucket IDs" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_all_bucket_ids" `
    -Args "address:$CONTRACT_ADDRESS"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 3: Oracle & Collateral Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 6: Update oracle prices
# Args: prices (vector<u64>), funding_rates (vector<u64>)
Test-Transaction -TestName "Update Oracle Prices" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::update_oracle" `
    -Args "u64:[1000,2000,3000] u64:[10,20,30]"

Start-Sleep -Seconds 2

# Test 7: Deposit collateral
# Args: amount (u64)
Test-Transaction -TestName "Deposit Collateral (10000 units)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::deposit_collateral" `
    -Args "u64:10000"

Start-Sleep -Seconds 2

# Test 8: View collateral balance
Test-ViewFunction -TestName "Get Collateral Balance" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_collateral_balance" `
    -Args "address:$CONTRACT_ADDRESS address:$CONTRACT_ADDRESS"

# Test 9: View oracle prices
Test-ViewFunction -TestName "Get Oracle Prices" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_oracle_prices" `
    -Args "address:$CONTRACT_ADDRESS"

# Test 10: View oracle funding rates
Test-ViewFunction -TestName "Get Oracle Funding Rates" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_oracle_funding_rates" `
    -Args "address:$CONTRACT_ADDRESS"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 4: Position Management Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 11: Open a LONG position
# Args: bucket_id (u64), is_long (bool), margin (u64), leverage (u64)
Test-Transaction -TestName "Open LONG Position (Bucket 0, 1000 margin, 10x leverage)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::open_position" `
    -Args "u64:0 bool:true u64:1000 u64:10"

Start-Sleep -Seconds 2

# Test 12: View position count
Test-ViewFunction -TestName "Get Position Count" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position_count" `
    -Args "address:$CONTRACT_ADDRESS"

# Test 13: View position details
Test-ViewFunction -TestName "Get Position Details (ID: 0)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position" `
    -Args "address:$CONTRACT_ADDRESS u64:0"

# Test 14: View active position IDs
Test-ViewFunction -TestName "Get Active Position IDs" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_active_position_ids" `
    -Args "address:$CONTRACT_ADDRESS"

# Test 15: Calculate bucket market value
Test-ViewFunction -TestName "Get Bucket Market Value (ID: 0)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket_market_value" `
    -Args "address:$CONTRACT_ADDRESS u64:0"

# Test 16: Get position health factor
Test-ViewFunction -TestName "Get Position Health Factor (ID: 0)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position_health_factor" `
    -Args "address:$CONTRACT_ADDRESS u64:0"

# Test 17: Get specific asset price
Test-ViewFunction -TestName "Get Asset Price (Asset ID: 1)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_asset_price" `
    -Args "address:$CONTRACT_ADDRESS u64:1"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 5: Position Closure Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 18: Open another position for testing
Test-Transaction -TestName "Open SHORT Position (for closure test)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::open_position" `
    -Args "u64:0 bool:false u64:500 u64:5"

Start-Sleep -Seconds 2

# Test 19: Close position
# Args: position_id (u64)
Test-Transaction -TestName "Close Position (ID: 1)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::close_position" `
    -Args "u64:1"

Start-Sleep -Seconds 2

# Test 20: Verify position is closed
Test-ViewFunction -TestName "Verify Closed Position (ID: 1)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position" `
    -Args "address:$CONTRACT_ADDRESS u64:1"

# Test 21: View active positions after closure
Test-ViewFunction -TestName "Get Active Positions After Closure" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_active_position_ids" `
    -Args "address:$CONTRACT_ADDRESS"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 6: Bucket Rebalancing Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 22: Rebalance bucket weights
# Args: bucket_id (u64), new_weights (vector<u64>)
Test-Transaction -TestName "Rebalance Bucket Weights" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::rebalance_bucket" `
    -Args "u64:0 u64:[40,35,25]"

Start-Sleep -Seconds 2

# Test 23: Verify bucket weights after rebalancing
Test-ViewFunction -TestName "Get Bucket After Rebalancing" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket" `
    -Args "address:$CONTRACT_ADDRESS u64:0"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 7: Liquidation Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 24: Open high-risk position for liquidation test
Test-Transaction -TestName "Open High-Risk Position (20x leverage)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::open_position" `
    -Args "u64:0 bool:true u64:200 u64:20"

Start-Sleep -Seconds 2

# Test 25: Update oracle to create liquidation scenario
Test-Transaction -TestName "Update Oracle to Drop Prices (simulate loss)" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::update_oracle" `
    -Args "u64:[500,1000,1500] u64:[5,10,15]"

Start-Sleep -Seconds 2

# Test 26: Check health factor before liquidation
$latestPositionId = Test-ViewFunction -TestName "Get Latest Position Count" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position_count" `
    -Args "address:$CONTRACT_ADDRESS"

if ($latestPositionId) {
    $posId = [int]$latestPositionId - 1
    Test-ViewFunction -TestName "Get Health Factor Before Liquidation (ID: $posId)" `
        -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position_health_factor" `
        -Args "address:$CONTRACT_ADDRESS u64:$posId"
}

# Test 27: Attempt liquidation
Test-Transaction -TestName "Liquidate Unhealthy Position" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::liquidate_position" `
    -Args "u64:2 string:b\"Health factor below threshold\""

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 8: Final State Verification" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 28: Final collateral balance check
Test-ViewFunction -TestName "Final Collateral Balance" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_collateral_balance" `
    -Args "address:$CONTRACT_ADDRESS address:$CONTRACT_ADDRESS"

# Test 29: Final position count
Test-ViewFunction -TestName "Final Position Count" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_position_count" `
    -Args "address:$CONTRACT_ADDRESS"

# Test 30: Final active positions
Test-ViewFunction -TestName "Final Active Positions" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_active_position_ids" `
    -Args "address:$CONTRACT_ADDRESS"

# Test 31: Final bucket state
Test-ViewFunction -TestName "Final Bucket State" `
    -FunctionId "${CONTRACT_ADDRESS}::${MODULE_NAME}::get_bucket" `
    -Args "address:$CONTRACT_ADDRESS u64:0"

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
    Write-Host "[PASS] All tests passed successfully!" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Some tests failed. Please review the output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Contract deployed at: $CONTRACT_ADDRESS" -ForegroundColor Cyan
Write-Host "View on Explorer: https://explorer.movementnetwork.xyz/account/$CONTRACT_ADDRESS" -ForegroundColor Cyan
