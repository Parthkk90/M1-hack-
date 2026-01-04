# Simple Contract Test - Entry Functions Only
# Tests the deployed bucket protocol contract

$CONTRACT_ADDRESS = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796"
$PRIVATE_KEY = "0x855F7AB6FB12535AAF661AF350B88270DB2CFE801C68AB4BEFC73B40F6599050"
$RPC_URL = "https://testnet.movementnetwork.xyz/v1"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Bucket Protocol Simple Test" -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract: $CONTRACT_ADDRESS" -ForegroundColor Green
Write-Host ""

Write-Host "Test 1: Update Oracle Prices" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::update_oracle" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args 'u64:[1000,2000,3000]' 'u64:[10,20,30]'

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 2: Deposit Collateral (5000 units)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::deposit_collateral" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args u64:5000

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 3: Create Bucket (3 assets: weights 50/30/20, max leverage 20x)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::create_bucket" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args 'u64:[1,2,3]' 'u64:[50,30,20]' u64:20

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 4: Open LONG Position (bucket 0, 1000 margin, 5x leverage)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::open_position" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args u64:0 bool:true u64:1000 u64:5

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 5: Open SHORT Position (bucket 0, 500 margin, 3x leverage)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::open_position" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args u64:0 bool:false u64:500 u64:3

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 6: Close Position (position ID 1)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::close_position" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args u64:1

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 7: Rebalance Bucket (new weights 40/35/25)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::rebalance_bucket" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args u64:0 'u64:[40,35,25]'

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 8: Update Oracle (Simulate price drop)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::update_oracle" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args 'u64:[500,1000,1500]' 'u64:[5,10,15]'

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 9: Open High-Risk Position (for liquidation test)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::open_position" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args u64:0 bool:true u64:200 u64:20

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Test 10: Attempt Liquidation (position 2)" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Gray
aptos move run `
    --function-id "${CONTRACT_ADDRESS}::bucket_protocol::liquidate_position" `
    --private-key $PRIVATE_KEY `
    --url $RPC_URL `
    --assume-yes `
    --args u64:2 'string:b"Health factor below threshold"'

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   All Tests Completed" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Address: $CONTRACT_ADDRESS" -ForegroundColor Green
Write-Host "Network: Movement Testnet" -ForegroundColor Green
Write-Host ""
Write-Host "Note: View functions are not available in the current deployment." -ForegroundColor Yellow
Write-Host "To test view functions, the contract needs to be redeployed." -ForegroundColor Yellow
