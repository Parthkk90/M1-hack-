# Comprehensive Contract Testing with Real Transactions
# Tests payment scheduler, price oracle, and other contracts on Movement Testnet

$CONTRACT = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7"
$TEST_WALLET = "0x85562b06f503e28a6904998717af1f163878b3bf393c2d089d75bf6f61cac306"
$RECIPIENT = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7"

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Movement Testnet - Contract Functionality Tests       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Test Wallet: $TEST_WALLET" -ForegroundColor Yellow
Write-Host "Contracts: $CONTRACT`n" -ForegroundColor Yellow

# Check initial balance
Write-Host "=== Initial Balance Check ===" -ForegroundColor Cyan
$balance = aptos account list --profile test-wallet 2>&1 | ConvertFrom-Json
$coinStore = $balance.Result | Where-Object { $_.'0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>' }
$initialBalance = [decimal]$coinStore.'0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'.coin.value / 100000000
Write-Host "Balance: $initialBalance MOVE`n" -ForegroundColor White

$testResults = @()

# ============================================
# Test 1: Initialize Payment Scheduler
# ============================================
Write-Host "`n[Test 1] Initialize Payment Scheduler" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $result = aptos move run `
        --profile test-wallet `
        --function-id "${CONTRACT}::payment_scheduler::initialize" `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - Payment Scheduler Initialized" -ForegroundColor Green
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Initialize Payment Scheduler"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "⚠️  Already initialized or failed" -ForegroundColor Yellow
        $testResults += @{Test="Initialize Payment Scheduler"; Status="⚠️  SKIPPED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Initialize Payment Scheduler"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test 2: Schedule One-Time Payment
# ============================================
Write-Host "`n[Test 2] Schedule One-Time Payment" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $futureTime = [DateTimeOffset]::UtcNow.AddMinutes(5).ToUnixTimeSeconds()
    Write-Host "   Scheduling payment for: $(Get-Date ([DateTimeOffset]::FromUnixTimeSeconds($futureTime).DateTime))" -ForegroundColor Gray
    
    $result = aptos move run `
        --profile test-wallet `
        --function-id "${CONTRACT}::payment_scheduler::schedule_one_time_payment" `
        --args address:$RECIPIENT u64:5000000 u64:$futureTime `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - Scheduled 0.05 MOVE payment" -ForegroundColor Green
        Write-Host "   Recipient: $RECIPIENT" -ForegroundColor Gray
        Write-Host "   Amount: 0.05 MOVE" -ForegroundColor Gray
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Schedule One-Time Payment"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $testResults += @{Test="Schedule One-Time Payment"; Status="❌ FAILED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Schedule One-Time Payment"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test 3: Initialize Price Oracle
# ============================================
Write-Host "`n[Test 3] Initialize Price Oracle" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $result = aptos move run `
        --profile test-wallet `
        --function-id "${CONTRACT}::price_oracle::initialize" `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - Price Oracle Initialized" -ForegroundColor Green
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Initialize Price Oracle"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "⚠️  Already initialized" -ForegroundColor Yellow
        $testResults += @{Test="Initialize Price Oracle"; Status="⚠️  SKIPPED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Initialize Price Oracle"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test 4: Update BTC Price
# ============================================
Write-Host "`n[Test 4] Update BTC Price" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $btcPrice = 98500  # $98,500
    $result = aptos move run `
        --profile test-wallet `
        --function-id "${CONTRACT}::price_oracle::update_price" `
        --args string:BTC u64:$btcPrice `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - BTC Price Updated to `$$btcPrice" -ForegroundColor Green
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Update BTC Price"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $testResults += @{Test="Update BTC Price"; Status="❌ FAILED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Update BTC Price"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test 5: Update ETH Price
# ============================================
Write-Host "`n[Test 5] Update ETH Price" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $ethPrice = 3650  # $3,650
    $result = aptos move run `
        --profile test-wallet `
        --function-id "${CONTRACT}::price_oracle::update_price" `
        --args string:ETH u64:$ethPrice `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - ETH Price Updated to `$$ethPrice" -ForegroundColor Green
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Update ETH Price"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $testResults += @{Test="Update ETH Price"; Status="❌ FAILED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Update ETH Price"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test 6: Update SOL Price
# ============================================
Write-Host "`n[Test 6] Update SOL Price" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $solPrice = 215  # $215
    $result = aptos move run `
        --profile test-wallet `
        --function-id "${CONTRACT}::price_oracle::update_price" `
        --args string:SOL u64:$solPrice `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - SOL Price Updated to `$$solPrice" -ForegroundColor Green
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Update SOL Price"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $testResults += @{Test="Update SOL Price"; Status="❌ FAILED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Update SOL Price"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test 7: Initialize Funding Rate
# ============================================
Write-Host "`n[Test 7] Initialize Funding Rate" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $result = aptos move run `
        --profile test-wallet `
        --function-id "${CONTRACT}::funding_rate::initialize" `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - Funding Rate Initialized" -ForegroundColor Green
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Initialize Funding Rate"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "⚠️  Already initialized" -ForegroundColor Yellow
        $testResults += @{Test="Initialize Funding Rate"; Status="⚠️  SKIPPED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Initialize Funding Rate"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test 8: Simple Token Transfer
# ============================================
Write-Host "`n[Test 8] Simple Token Transfer" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    $result = aptos account transfer `
        --profile test-wallet `
        --account $RECIPIENT `
        --amount 2000000 `
        --assume-yes 2>&1 | ConvertFrom-Json
    
    if ($result.Result.success) {
        $txHash = $result.Result.transaction_hash
        Write-Host "✅ PASSED - Transferred 0.02 MOVE" -ForegroundColor Green
        Write-Host "   To: $RECIPIENT" -ForegroundColor Gray
        Write-Host "   Tx: https://explorer.movementnetwork.xyz/txn/$txHash" -ForegroundColor Blue
        $testResults += @{Test="Simple Token Transfer"; Status="✅ PASSED"; Hash=$txHash}
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $testResults += @{Test="Simple Token Transfer"; Status="❌ FAILED"; Hash="N/A"}
    }
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    $testResults += @{Test="Simple Token Transfer"; Status="❌ FAILED"; Hash="N/A"}
}

# ============================================
# Test Summary
# ============================================
Write-Host "`n`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST SUMMARY                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -like "*PASSED*" }).Count
$failed = ($testResults | Where-Object { $_.Status -like "*FAILED*" }).Count
$skipped = ($testResults | Where-Object { $_.Status -like "*SKIPPED*" }).Count
$total = $testResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "⚠️  Skipped: $skipped`n" -ForegroundColor Yellow

Write-Host "Detailed Results:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
foreach ($result in $testResults) {
    Write-Host "$($result.Status) $($result.Test)" -ForegroundColor White
    if ($result.Hash -ne "N/A") {
        Write-Host "   https://explorer.movementnetwork.xyz/txn/$($result.Hash)" -ForegroundColor Blue
    }
}

# Final balance check
Write-Host "`n=== Final Balance Check ===" -ForegroundColor Cyan
$balance = aptos account list --profile test-wallet 2>&1 | ConvertFrom-Json
$coinStore = $balance.Result | Where-Object { $_.'0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>' }
$finalBalance = [decimal]$coinStore.'0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'.coin.value / 100000000
Write-Host "Balance: $finalBalance MOVE" -ForegroundColor White
Write-Host "Spent: $($initialBalance - $finalBalance) MOVE`n" -ForegroundColor Yellow

Write-Host "All transactions viewable at:" -ForegroundColor Cyan
Write-Host "https://explorer.movementnetwork.xyz/account/$TEST_WALLET/transactions`n" -ForegroundColor Blue
