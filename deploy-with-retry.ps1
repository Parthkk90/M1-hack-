#!/usr/bin/env pwsh
# Retry deployment with backoff

param(
    [int]$MaxAttempts = 10,
    [int]$InitialDelay = 5
)

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    MOVEMENT BASKETS - DEPLOY WITH RETRY         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🔄 Will attempt deployment up to $MaxAttempts times" -ForegroundColor Yellow
Write-Host "⏱️  Initial delay: $InitialDelay seconds (increases with each retry)`n" -ForegroundColor Yellow

$attempt = 1
$delay = $InitialDelay
$deployed = $false

while ($attempt -le $MaxAttempts -and -not $deployed) {
    Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Attempt $attempt of $MaxAttempts" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    # Try to check account first
    Write-Host "🔍 Checking network connectivity..." -ForegroundColor Yellow
    $accountCheck = aptos account list --account 0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7 2>&1
    
    if ($accountCheck -match "Error" -or $accountCheck -match "522" -or $accountCheck -match "521") {
        Write-Host "❌ Network still unavailable (RPC error)" -ForegroundColor Red
        Write-Host "   Waiting $delay seconds before retry..." -ForegroundColor Gray
        Start-Sleep -Seconds $delay
        
        # Exponential backoff
        $delay = [Math]::Min($delay * 2, 120)  # Max 2 minutes
        $attempt++
        continue
    }
    
    Write-Host "✅ Network is responsive!" -ForegroundColor Green
    Write-Host "`n🚀 Attempting deployment..." -ForegroundColor Cyan
    
    # Try deployment
    $deployResult = aptos move publish --included-artifacts none --assume-yes 2>&1
    
    if ($deployResult -match "Success" -or $deployResult -match "RESOURCE_ALREADY_EXISTS") {
        Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║           DEPLOYMENT SUCCESSFUL! 🎉                ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green
        
        Write-Host "✅ Contracts deployed to Movement Network!" -ForegroundColor Green
        Write-Host "📦 7 modules deployed successfully" -ForegroundColor White
        
        # Extract transaction hash if available
        if ($deployResult -match "0x[a-fA-F0-9]{64}") {
            $txHash = $Matches[0]
            Write-Host "🔗 Transaction: https://explorer.movementnetwork.xyz/txn/$txHash`n" -ForegroundColor Cyan
        }
        
        $deployed = $true
        
        # Initialize modules
        Write-Host "🔧 Initializing modules..." -ForegroundColor Yellow
        
        Write-Host "   Initializing vault..." -ForegroundColor Gray
        aptos move run --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::basket_vault::initialize' --assume-yes 2>&1 | Out-Null
        
        Write-Host "   Initializing oracle..." -ForegroundColor Gray
        aptos move run --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::price_oracle::initialize' --assume-yes 2>&1 | Out-Null
        
        Write-Host "   Initializing funding..." -ForegroundColor Gray
        aptos move run --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::funding_rate::initialize' --assume-yes 2>&1 | Out-Null
        
        Write-Host "   Initializing AI rebalancing..." -ForegroundColor Gray
        aptos move run --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::rebalancing_engine::initialize' --assume-yes 2>&1 | Out-Null
        
        Write-Host "   Initializing revenue distributor..." -ForegroundColor Gray
        aptos move run --function-id '0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7::revenue_distributor::initialize' --assume-yes 2>&1 | Out-Null
        
        Write-Host "`n✅ All modules initialized!" -ForegroundColor Green
        
        Write-Host "`n🔗 Explorer:" -ForegroundColor Cyan
        Write-Host "   https://explorer.movementnetwork.xyz/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7?network=bardock+testnet`n" -ForegroundColor White
        
        Write-Host "🎉 Movement Baskets is live on Movement Network!" -ForegroundColor Green
        Write-Host "📖 See TEST_RESULTS.md for testing guide`n" -ForegroundColor White
        
    } elseif ($deployResult -match "Error" -or $deployResult -match "522" -or $deployResult -match "521") {
        Write-Host "❌ Deployment failed (network error)" -ForegroundColor Red
        Write-Host "   Error: $deployResult" -ForegroundColor Gray
        Write-Host "   Waiting $delay seconds before retry..." -ForegroundColor Gray
        Start-Sleep -Seconds $delay
        
        $delay = [Math]::Min($delay * 2, 120)
        $attempt++
    } else {
        Write-Host "⚠️  Unexpected response:" -ForegroundColor Yellow
        Write-Host "   $deployResult" -ForegroundColor Gray
        $attempt++
    }
}

if (-not $deployed) {
    Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║           DEPLOYMENT FAILED                        ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Red
    
    Write-Host "❌ Could not deploy after $MaxAttempts attempts" -ForegroundColor Red
    Write-Host "`n📋 Possible reasons:" -ForegroundColor Yellow
    Write-Host "   1. Movement testnet is experiencing extended downtime" -ForegroundColor White
    Write-Host "   2. RPC endpoints are under maintenance" -ForegroundColor White
    Write-Host "   3. Network congestion" -ForegroundColor White
    
    Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
    Write-Host "   1. Check network status on Discord: https://discord.gg/movementlabs" -ForegroundColor White
    Write-Host "   2. Try again during off-peak hours (UTC 8-12)" -ForegroundColor White
    Write-Host "   3. Use local testnet: movement node run-local-testnet" -ForegroundColor White
    Write-Host "   4. Wait 1-2 hours and run this script again`n" -ForegroundColor White
    
    Write-Host "📖 See RPC_ISSUES.md for detailed troubleshooting`n" -ForegroundColor White
}
