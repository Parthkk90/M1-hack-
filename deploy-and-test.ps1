# Complete Contract Deployment and Testing
# Run: .\deploy-and-test.ps1

$ACCOUNT = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7"

Write-Host "`nSTEP 1: DEPLOYING CONTRACTS..." -ForegroundColor Cyan
aptos move publish --included-artifacts none --assume-yes

Write-Host "`nWaiting for deployment to confirm (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`nSTEP 2: VERIFYING DEPLOYMENT..." -ForegroundColor Cyan
aptos account list --account $ACCOUNT

Write-Host "`nSTEP 3: INITIALIZING CONTRACTS..." -ForegroundColor Cyan

Write-Host "Initializing basket vault..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::basket_vault::initialize" --assume-yes
Start-Sleep -Seconds 3

Write-Host "Initializing price oracle..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::price_oracle::initialize" --assume-yes
Start-Sleep -Seconds 3

Write-Host "Setting BTC price..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::price_oracle::update_price" --args string:BTC u64:9500000 --assume-yes
Start-Sleep -Seconds 3

Write-Host "Setting ETH price..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::price_oracle::update_price" --args string:ETH u64:350000 --assume-yes
Start-Sleep -Seconds 3

Write-Host "Setting SOL price..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::price_oracle::update_price" --args string:SOL u64:19000 --assume-yes
Start-Sleep -Seconds 3

Write-Host "Initializing funding rate..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::funding_rate::initialize" --assume-yes
Start-Sleep -Seconds 3

Write-Host "Initializing AI rebalancing..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::rebalancing_engine::initialize" --assume-yes
Start-Sleep -Seconds 3

Write-Host "Initializing revenue distributor..." -ForegroundColor Yellow
aptos move run --function-id "${ACCOUNT}::revenue_distributor::initialize" --assume-yes

Write-Host "`nSTEP 4: VERIFYING ALL FEATURES..." -ForegroundColor Cyan
.\check-contracts.ps1

Write-Host "`nALL TESTING COMPLETE!" -ForegroundColor Green
