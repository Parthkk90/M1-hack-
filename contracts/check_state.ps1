# Contract State Checker
# Verifies the current state of the deployed contract

$CONTRACT_ADDRESS = "0x3aa36fb1c8226096d5216f0c5b45bd24b3b37cc55a7e68cdfd2762c5f82e3796"
$RPC_URL = "https://testnet.movementnetwork.xyz/v1"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Contract State Diagnostic" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract: $CONTRACT_ADDRESS" -ForegroundColor Green
Write-Host ""

Write-Host "Checking if contract resources exist..." -ForegroundColor Yellow
Write-Host ""

# Check account resources
Write-Host "Querying account resources..." -ForegroundColor White
$url = "$RPC_URL/accounts/$CONTRACT_ADDRESS/resources"

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    
    Write-Host "[SUCCESS] Contract account found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resources found:" -ForegroundColor Cyan
    
    $hasModules = $false
    $hasBuckets = $false
    $hasPositions = $false
    $hasOracles = $false
    $hasCollaterals = $false
    
    foreach ($resource in $response) {
        $resourceType = $resource.type
        Write-Host "  - $resourceType" -ForegroundColor White
        
        if ($resourceType -match "Buckets") { $hasBuckets = $true }
        if ($resourceType -match "Positions") { $hasPositions = $true }
        if ($resourceType -match "Oracles") { $hasOracles = $true }
        if ($resourceType -match "Collaterals") { $hasCollaterals = $true }
    }
    
    Write-Host ""
    Write-Host "Contract Status:" -ForegroundColor Cyan
    Write-Host "  Buckets Resource: $(if($hasBuckets){'[INITIALIZED]' -f 'Green'}else{'[NOT FOUND]' -f 'Red'})" -ForegroundColor $(if($hasBuckets){'Green'}else{'Red'})
    Write-Host "  Positions Resource: $(if($hasPositions){'[INITIALIZED]'}else{'[NOT FOUND]'})" -ForegroundColor $(if($hasPositions){'Green'}else{'Red'})
    Write-Host "  Oracles Resource: $(if($hasOracles){'[INITIALIZED]'}else{'[NOT FOUND]'})" -ForegroundColor $(if($hasOracles){'Green'}else{'Red'})
    Write-Host "  Collaterals Resource: $(if($hasCollaterals){'[INITIALIZED]'}else{'[NOT FOUND]'})" -ForegroundColor $(if($hasCollaterals){'Green'}else{'Red'})
    
    Write-Host ""
    if ($hasBuckets -and $hasPositions -and $hasOracles -and $hasCollaterals) {
        Write-Host "[READY] Contract is initialized and ready for testing!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next step: Run test_fixed.ps1 to test all features" -ForegroundColor Cyan
    } else {
        Write-Host "[WARNING] Some resources are missing" -ForegroundColor Yellow
        Write-Host "The init() function may need to be called" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "[ERROR] Failed to query contract state" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  1. Contract not deployed to this address" -ForegroundColor White
    Write-Host "  2. Network connectivity issues" -ForegroundColor White
    Write-Host "  3. RPC endpoint unreachable" -ForegroundColor White
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Deployment Information" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment TX: 0xa6b979d12a4518a4ec9040c2c56ab7700ce54a5d0f15d2ce9159c8e623acc8f5" -ForegroundColor White
Write-Host "Package Size: 19,225 bytes" -ForegroundColor White
Write-Host "Gas Used: 2,228" -ForegroundColor White
Write-Host "Status: SUCCESS" -ForegroundColor Green
