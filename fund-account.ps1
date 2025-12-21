#!/usr/bin/env pwsh
# Movement Network - Faucet Funding Script

param(
    [string]$Address = "0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7",
    [int]$Amount = 100000000  # 1 APT = 100,000,000 Octos
)

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    MOVEMENT NETWORK - FAUCET FUNDING            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📍 Account: $Address" -ForegroundColor White
Write-Host "💰 Requesting: $($Amount / 100000000) APT`n" -ForegroundColor White

# Function to request funds from Movement faucet
function Request-MovementFaucet {
    param(
        [string]$AccountAddress,
        [int]$AmountOctos
    )
    
    Write-Host "🚰 Requesting funds from Movement M1 Testnet faucet..." -ForegroundColor Yellow
    
    try {
        # Movement M1 Testnet Faucet
        $faucetUrl = "https://faucet.testnet.movementnetwork.xyz/mint?amount=$AmountOctos&address=$AccountAddress"
        
        Write-Host "   URL: $faucetUrl" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $faucetUrl -Method Post -ContentType "application/json" -TimeoutSec 30
        
        if ($response) {
            Write-Host "✅ Faucet request successful!" -ForegroundColor Green
            Write-Host "   Response: $response" -ForegroundColor White
            return $true
        }
    }
    catch {
        Write-Host "⚠️  Faucet request failed: $($_.Exception.Message)" -ForegroundColor Yellow
        
        # Try alternative method using Aptos CLI
        Write-Host "`n🔄 Trying alternative method (Aptos CLI)..." -ForegroundColor Yellow
        
        try {
            $cliResult = aptos account fund-with-faucet --account $AccountAddress 2>&1
            
            if ($cliResult -match "Success" -or $cliResult -match "funded") {
                Write-Host "✅ CLI funding successful!" -ForegroundColor Green
                return $true
            } else {
                Write-Host "   CLI Response: $cliResult" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "❌ CLI funding also failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        return $false
    }
}

# Function to check account balance
function Get-AccountBalance {
    param([string]$AccountAddress)
    
    Write-Host "`n💳 Checking account balance..." -ForegroundColor Yellow
    
    try {
        $balance = aptos account list --account $AccountAddress 2>&1
        
        if ($balance -match "(\d+)") {
            $octos = $Matches[1]
            $apt = [math]::Round($octos / 100000000, 4)
            
            Write-Host "✅ Current Balance: $apt APT ($octos Octos)" -ForegroundColor Green
            return $apt
        } else {
            Write-Host "⚠️  Could not parse balance" -ForegroundColor Yellow
            Write-Host "   Raw output: $balance" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Failed to check balance: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    return 0
}

# Main execution
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 1: Request Funds" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$funded = Request-MovementFaucet -AccountAddress $Address -AmountOctos $Amount

Start-Sleep -Seconds 3

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 2: Verify Balance" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$balance = Get-AccountBalance -AccountAddress $Address

# Additional faucet options
Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Alternative Faucet Options" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "🌐 Web Faucets:" -ForegroundColor Cyan
Write-Host "   1. Movement Web Faucet: https://faucet.movementnetwork.xyz/" -ForegroundColor White
Write-Host "      - Visit and paste your address" -ForegroundColor Gray
Write-Host "      - Receive 1 APT instantly" -ForegroundColor Gray

Write-Host "`n   2. Discord Faucet (Movement Labs):" -ForegroundColor White
Write-Host "      - Join: https://discord.gg/movementlabs" -ForegroundColor Gray
Write-Host "      - Use: /faucet <address>" -ForegroundColor Gray

Write-Host "`n💻 CLI Commands:" -ForegroundColor Cyan
Write-Host "   aptos account fund-with-faucet --account $Address" -ForegroundColor White

Write-Host "`n📡 Direct API Call:" -ForegroundColor Cyan
Write-Host "   curl -X POST 'https://faucet.testnet.movementnetwork.xyz/mint?amount=$Amount&address=$Address'" -ForegroundColor White

# Summary
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              FUNDING SUMMARY                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green

if ($funded) {
    Write-Host "✅ Faucet request successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  Faucet request had issues (check alternative options above)" -ForegroundColor Yellow
}

if ($balance -gt 0) {
    Write-Host "✅ Account has balance: $balance APT" -ForegroundColor Green
    Write-Host "✅ Ready for contract deployment!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Account balance not detected" -ForegroundColor Yellow
    Write-Host "   Try the alternative faucet options listed above" -ForegroundColor Gray
}

Write-Host "`n🔗 Explorer:" -ForegroundColor Cyan
Write-Host "   https://explorer.movementnetwork.xyz/account/$Address`n" -ForegroundColor White

Write-Host "📊 Network Info:" -ForegroundColor Cyan
Write-Host "   Network: Movement M1 Testnet" -ForegroundColor White
Write-Host "   RPC: https://aptos.testnet.m1.movementlabs.xyz/v1" -ForegroundColor White
Write-Host "   Faucet: https://faucet.testnet.movementnetwork.xyz/" -ForegroundColor White
Write-Host ""
