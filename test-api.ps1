# Test All Contract Features

$BASE_URL = "http://localhost:3000"

Write-Host "`n=== TESTING MOVEMENT BASKETS API ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[TEST 1] Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$BASE_URL/health"
Write-Host "Status: $($health.status)" -ForegroundColor Green
Write-Host "Message: $($health.message)" -ForegroundColor White

# Test 2: Get Prices
Write-Host "`n[TEST 2] Getting Prices..." -ForegroundColor Yellow
try {
    $prices = Invoke-RestMethod -Uri "$BASE_URL/api/prices"
    if ($prices.success) {
        Write-Host "BTC: `$$($prices.prices.BTC)" -ForegroundColor Green
        Write-Host "ETH: `$$($prices.prices.ETH)" -ForegroundColor Green
        Write-Host "SOL: `$$($prices.prices.SOL)" -ForegroundColor Green
    } else {
        Write-Host "Error: $($prices.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error fetching prices: $_" -ForegroundColor Red
}

# Test 3: Open Position (10x leverage)
Write-Host "`n[TEST 3] Opening Position (10x leverage, 50% BTC, 30% ETH, 20% SOL)..." -ForegroundColor Yellow
try {
    $body = @{
        collateral = 100000000
        leverage = 10
        btc_weight = 50
        eth_weight = 30
        sol_weight = 20
    } | ConvertTo-Json

    $position = Invoke-RestMethod -Uri "$BASE_URL/api/position/open" -Method Post -Body $body -ContentType "application/json"
    
    if ($position.success) {
        Write-Host "Position opened successfully!" -ForegroundColor Green
        Write-Host "Transaction: $($position.txHash)" -ForegroundColor Cyan
        Write-Host "Position ID: $($position.positionId)" -ForegroundColor White
    } else {
        Write-Host "Error: $($position.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error opening position: $_" -ForegroundColor Red
}

# Test 4: Get Position Details
Write-Host "`n[TEST 4] Getting Position Details..." -ForegroundColor Yellow
try {
    $positionDetails = Invoke-RestMethod -Uri "$BASE_URL/api/position/0"
    if ($positionDetails.success) {
        Write-Host "Position found!" -ForegroundColor Green
        Write-Host ($positionDetails.position | ConvertTo-Json -Depth 3)
    } else {
        Write-Host "Error: $($positionDetails.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error fetching position: $_" -ForegroundColor Red
}

# Test 5: Get Account
Write-Host "`n[TEST 5] Getting Account Info..." -ForegroundColor Yellow
try {
    $account = Invoke-RestMethod -Uri "$BASE_URL/api/account"
    if ($account.success) {
        Write-Host "Account: $($account.account.accountAddress)" -ForegroundColor Green
        Write-Host "Public Key: $($account.account.publicKey)" -ForegroundColor White
    } else {
        Write-Host "Error: $($account.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error fetching account: $_" -ForegroundColor Red
}

Write-Host "`n=== TESTING COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nServer is running at: $BASE_URL" -ForegroundColor Green
Write-Host "Explorer: https://explorer.movementnetwork.xyz/?network=bardock+testnet/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7`n" -ForegroundColor Cyan
