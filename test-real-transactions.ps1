# Real Transaction Test Script
# Run this to test actual token transfers on Movement Testnet

Write-Host "`n=== Movement Testnet Transaction Tests ===" -ForegroundColor Cyan
Write-Host "Network: Movement Bardock Testnet (Chain ID: 250)`n" -ForegroundColor Green

# Test Addresses
$SENDER = "0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306"
$RECEIVER = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7"

Write-Host "Sender (Test Wallet): $SENDER" -ForegroundColor Yellow
Write-Host "Receiver (Contracts): $RECEIVER`n" -ForegroundColor Yellow

# Check balances
Write-Host "=== Checking Balances ===" -ForegroundColor Cyan
Write-Host "Sender balance:" -ForegroundColor White
aptos account list --profile test-wallet | Select-String -Pattern "value"

Write-Host "`nReceiver balance:" -ForegroundColor White
aptos account list --account $RECEIVER | Select-String -Pattern "value"

# Perform transfer
Write-Host "`n=== Sending 0.1 MOVE ===" -ForegroundColor Cyan
$result = aptos account transfer `
  --profile test-wallet `
  --account $RECEIVER `
  --amount 10000000 `
  --assume-yes 2>&1 | ConvertFrom-Json

if ($result.Result.success) {
    $txHash = $result.Result.transaction_hash
    $gasUsed = $result.Result.gas_used
    $version = $result.Result.version
    
    Write-Host "`n✅ Transaction Successful!" -ForegroundColor Green
    Write-Host "Transaction Hash: $txHash" -ForegroundColor White
    Write-Host "Gas Used: $gasUsed units" -ForegroundColor White
    Write-Host "Version: $version`n" -ForegroundColor White
    
    # Explorer links
    Write-Host "=== Explorer Links ===" -ForegroundColor Cyan
    Write-Host "Transaction: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
    Write-Host "Sender: https://explorer.movementnetwork.xyz/account/$SENDER/transactions" -ForegroundColor Blue
    Write-Host "Receiver: https://explorer.movementnetwork.xyz/account/$RECEIVER/transactions" -ForegroundColor Blue
    
    # Show updated balances
    Write-Host "`n=== Updated Balances ===" -ForegroundColor Cyan
    $senderBalance = ($result.Result.balance_changes.$SENDER.coin.value / 100000000)
    Write-Host "Sender: $senderBalance MOVE" -ForegroundColor White
    
    $receiverKey = $RECEIVER.TrimStart('0x')
    $receiverBalance = ($result.Result.balance_changes.$receiverKey.coin.value / 100000000)
    Write-Host "Receiver: $receiverBalance MOVE" -ForegroundColor White
} else {
    Write-Host "`n❌ Transaction Failed" -ForegroundColor Red
    Write-Host $result.Error -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===`n" -ForegroundColor Cyan
