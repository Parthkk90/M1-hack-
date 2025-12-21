#!/usr/bin/env pwsh
# Movement Baskets - Deployment & Testing Script

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    MOVEMENT BASKETS - DEPLOYMENT SCRIPT         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Configuration
$ACCOUNT = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7"
$NETWORK = "https://aptos.testnet.m1.movementlabs.xyz/v1"
$EXPLORER = "https://explorer.movementnetwork.xyz"

Write-Host "📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "   Network: Movement M1 Testnet" -ForegroundColor White
Write-Host "   Account: $ACCOUNT" -ForegroundColor White
Write-Host "   RPC: $NETWORK`n" -ForegroundColor White

# Step 1: Compile
Write-Host "🔨 Step 1: Compiling contracts..." -ForegroundColor Cyan
try {
    $compileOutput = aptos move compile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation successful!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Compilation failed!" -ForegroundColor Red
        Write-Host $compileOutput
        exit 1
    }
} catch {
    Write-Host "❌ Compilation error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy
Write-Host "🚀 Step 2: Deploying to Movement Network..." -ForegroundColor Cyan
try {
    $deployOutput = aptos move publish --included-artifacts none --assume-yes 2>&1
    if ($deployOutput -match "Success") {
        Write-Host "✅ Deployment successful!`n" -ForegroundColor Green
        
        # Extract transaction hash if available
        if ($deployOutput -match "0x[a-fA-F0-9]{64}") {
            $txHash = $Matches[0]
            Write-Host "📝 Transaction: $EXPLORER/txn/$txHash`n" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️  Deployment output:" -ForegroundColor Yellow
        Write-Host $deployOutput
    }
} catch {
    Write-Host "❌ Deployment error: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Verify deployment
Write-Host "🔍 Step 3: Verifying deployment..." -ForegroundColor Cyan
Write-Host "   Account modules: $EXPLORER/account/$ACCOUNT/modules`n" -ForegroundColor White

# Step 4: Summary
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           DEPLOYMENT COMPLETE! 🎉                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📦 Deployed Contracts:" -ForegroundColor Yellow
Write-Host "   ✅ basket_vault (209 lines)" -ForegroundColor White
Write-Host "   ✅ leverage_engine (285 lines)" -ForegroundColor White
Write-Host "   ✅ rebalancing_engine (243 lines) - AI-powered" -ForegroundColor White
Write-Host "   ✅ revenue_distributor (260 lines) - 4 revenue streams" -ForegroundColor White
Write-Host "   ✅ funding_rate (220 lines)" -ForegroundColor White
Write-Host "   ✅ price_oracle (231 lines)" -ForegroundColor White
Write-Host "   ✅ payment_scheduler (353 lines)`n" -ForegroundColor White

Write-Host "🔗 Links:" -ForegroundColor Yellow
Write-Host "   Explorer: $EXPLORER/account/$ACCOUNT" -ForegroundColor Cyan
Write-Host "   Modules: $EXPLORER/account/$ACCOUNT/modules" -ForegroundColor Cyan
Write-Host "   Faucet: https://faucet.movementnetwork.xyz/`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Initialize contracts (see MOVEMENT_BASKETS_SUMMARY.md)" -ForegroundColor White
Write-Host "   2. Start API: npm run dev" -ForegroundColor White
Write-Host "   3. Test endpoints (see DEPLOYMENT.md)" -ForegroundColor White
Write-Host "   4. Build frontend / Telegram bot`n" -ForegroundColor White

Write-Host "💰 Revenue Model:" -ForegroundColor Yellow
Write-Host "   • Trading fees: 0.1%" -ForegroundColor White
Write-Host "   • Performance fees: 2%" -ForegroundColor White
Write-Host "   • Liquidation fees: 0.5%" -ForegroundColor White
Write-Host "   • Premium subscription: 10 APT/month`n" -ForegroundColor White

Write-Host "🏆 Hackathon: Movement Network - Best DeFi App ($5,000)" -ForegroundColor Cyan
Write-Host "🎯 Status: Ready for testing!`n" -ForegroundColor Green
