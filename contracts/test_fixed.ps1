# Bucket Protocol - Fixed Test Suite
# Contract Address: 0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796

$CONTRACT_ADDRESS = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796"
$PRIVATE_KEY = "0x855F7AB6FB12535AAF661AF350B88270DB2CFE801C68AB4BEFC73B40F6599050"
$RPC_URL = "https://testnet.movementnetwork.xyz/v1"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Bucket Protocol - Fixed Test Suite" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract: $CONTRACT_ADDRESS" -ForegroundColor Green
Write-Host "Network: Movement Testnet" -ForegroundColor Green
Write-Host ""

$passed = 0
$failed = 0

function Run-Test {
    param(
        [string]$TestName,
        [string]$Command
    )
    
    Write-Host ""
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    Write-Host "Command: $Command" -ForegroundColor DarkGray
    
    try {
        $result = Invoke-Expression $Command 2>&1 | Out-String
        
        if ($result -match '"success":\s*true' -or $result -match 'Executed successfully') {
            Write-Host "[PASS] $TestName" -ForegroundColor Green
            
            # Extract transaction hash if present
            if ($result -match '"transaction_hash":\s*"([^"]+)"') {
                Write-Host "  TX: $($Matches[1])" -ForegroundColor DarkGray
            }
            
            # Extract gas used if present
            if ($result -match '"gas_used":\s*(\d+)') {
                Write-Host "  Gas: $($Matches[1])" -ForegroundColor DarkGray
            }
            
            $script:passed++
            return $true
        } else {
            Write-Host "[FAIL] $TestName" -ForegroundColor Red
            
            # Show error details
            if ($result -match '"Error":\s*"([^"]+)"') {
                Write-Host "  Error: $($Matches[1])" -ForegroundColor Red
            } elseif ($result -match 'Move abort.*:\s*(.+)') {
                Write-Host "  Error: $($Matches[1])" -ForegroundColor Red
            } else {
                Write-Host "  Full output: $result" -ForegroundColor Red
            }
            
            $script:failed++
            return $false
        }
    } catch {
        Write-Host "[FAIL] $TestName - Exception: $_" -ForegroundColor Red
        $script:failed++
        return $false
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 1: Verify Initialization" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Skipping init() - contract already initialized during deployment" -ForegroundColor Yellow
Write-Host "  Deployment TX: 0xa6b979d12a4518a4ec9040c2c56ab7700ce54a5d0f15d2ce9159c8e623acc8f5" -ForegroundColor DarkGray

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 2: Oracle & Collateral Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test 1: Update Oracle Prices (JSON array format)
$success = Run-Test -TestName "Update Oracle Prices" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::update_oracle --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args 'u64:[1000,2000,3000]' 'u64:[10,20,30]'"

if ($success) { Start-Sleep -Seconds 3 }

# Test 2: Deposit Collateral
$success = Run-Test -TestName "Deposit Collateral (5000 units)" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::deposit_collateral --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:5000"

if ($success) { Start-Sleep -Seconds 3 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 3: Bucket Creation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test 3: Create Bucket (JSON array format)
$success = Run-Test -TestName "Create Multi-Asset Bucket" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::create_bucket --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args 'u64:[1,2,3]' 'u64:[50,30,20]' u64:20"

if ($success) { Start-Sleep -Seconds 3 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 4: Position Management" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test 4: Open LONG position
$success = Run-Test -TestName "Open LONG Position (1000 margin, 5x leverage)" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::open_position --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:0 bool:true u64:1000 u64:5"

if ($success) { Start-Sleep -Seconds 3 }

# Test 5: Open SHORT position
$success = Run-Test -TestName "Open SHORT Position (500 margin, 3x leverage)" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::open_position --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:0 bool:false u64:500 u64:3"

if ($success) { Start-Sleep -Seconds 3 }

# Test 6: Close position
$success = Run-Test -TestName "Close Position (position 1)" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::close_position --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:1"

if ($success) { Start-Sleep -Seconds 3 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 5: Advanced Features" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test 7: Rebalance bucket
$success = Run-Test -TestName "Rebalance Bucket Weights" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::rebalance_bucket --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:0 'u64:[40,35,25]'"

if ($success) { Start-Sleep -Seconds 3 }

# Test 8: Update oracle (price drop simulation)
$success = Run-Test -TestName "Update Oracle (Simulate Price Drop)" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::update_oracle --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args 'u64:[500,1000,1500]' 'u64:[5,10,15]'"

if ($success) { Start-Sleep -Seconds 3 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Phase 6: Liquidation Test" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Test 9: Open high-risk position
$success = Run-Test -TestName "Open High-Risk Position (20x leverage)" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::open_position --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:0 bool:true u64:200 u64:20"

if ($success) { Start-Sleep -Seconds 3 }

# Test 10: Liquidate position
$success = Run-Test -TestName "Liquidate Unhealthy Position" `
    -Command "aptos move run --function-id ${CONTRACT_ADDRESS}::bucket_protocol::liquidate_position --private-key $PRIVATE_KEY --url $RPC_URL --assume-yes --args u64:2 'string:b`"Health factor below threshold`"'"

if ($success) { Start-Sleep -Seconds 3 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests Passed: $passed" -ForegroundColor Green
Write-Host "Tests Failed: $failed" -ForegroundColor Red
Write-Host "Total Tests: $($passed + $failed)" -ForegroundColor White
Write-Host ""

if ($failed -eq 0) {
    Write-Host "[SUCCESS] All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contract is fully operational with:" -ForegroundColor Cyan
    Write-Host "  - Multi-asset buckets" -ForegroundColor White
    Write-Host "  - Long/short positions" -ForegroundColor White
    Write-Host "  - Up to 20x leverage" -ForegroundColor White
    Write-Host "  - Dynamic rebalancing" -ForegroundColor White
    Write-Host "  - Health-based liquidation" -ForegroundColor White
} else {
    Write-Host "[INCOMPLETE] $failed test(s) failed" -ForegroundColor Yellow
    Write-Host "Review errors above for details" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Contract Address: $CONTRACT_ADDRESS" -ForegroundColor Cyan
Write-Host "Network: Movement Testnet" -ForegroundColor Cyan
Write-Host "Explorer: https://explorer.movementnetwork.xyz/account/$CONTRACT_ADDRESS" -ForegroundColor Cyan
