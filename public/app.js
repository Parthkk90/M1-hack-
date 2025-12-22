// API Configuration
const API_URL = 'http://localhost:3000';

// State
let weights = { btc: 50, eth: 30, sol: 20 };
let selectedLeverage = 5;
let account = null;

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showDashboard() {
    showPage('dashboard-page');
    loadDashboard();
}

function showBasketBuilder() {
    showPage('basket-builder-page');
}

// Wallet Connect
async function connectMetaMask() {
    try {
        // Check if Petra or Martian wallet is available
        if (window.aptos || window.martian) {
            const wallet = window.aptos || window.martian;
            await wallet.connect();
            account = await wallet.account();
            showDashboard();
        } else {
            alert('Please install Petra or Martian wallet to continue');
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        // For demo, proceed anyway
        showDashboard();
    }
}

async function connectWallet() {
    // For demo purposes
    showDashboard();
}

// Dashboard
async function loadDashboard() {
    try {
        // Load account info
        const accountResponse = await fetch(`${API_URL}/api/account`);
        const accountData = await accountResponse.json();
        
        // Load prices
        const pricesResponse = await fetch(`${API_URL}/api/prices`);
        const pricesData = await pricesResponse.json();
        
        // Load sample baskets
        renderBaskets();
        
        // Draw equity chart
        drawEquityChart();
    } catch (error) {
        console.error('Dashboard load error:', error);
        renderSampleBaskets();
    }
}

function renderSampleBaskets() {
    const basketsList = document.getElementById('baskets-list');
    basketsList.innerHTML = `
        <div class="basket-card long" onclick="showPositionDetails('1')" style="cursor: pointer;">
            <div class="basket-header">
                <div>
                    <div class="basket-name">Mega Cap Index</div>
                    <span class="basket-type long">LONG 5x</span>
                </div>
                <div class="basket-pnl">
                    <div class="pnl-percent" style="color: #10b981">+24.5%</div>
                    <div class="pnl-amount" style="color: #10b981">+$420.00</div>
                </div>
            </div>
            <div class="basket-icons">
                <div class="token-icon" style="background: #f7931a">₿</div>
                <div class="token-icon" style="background: #627eea; margin-left: -8px">Ξ</div>
            </div>
            <div class="basket-details">
                <div class="detail-item">
                    <span class="detail-label">ENTRY</span>
                    <span class="detail-value">$42,105</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">MARK</span>
                    <span class="detail-value">$44,250</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">LIQ. PRICE</span>
                    <span class="detail-value" style="color: #f97316">$38,400</span>
                </div>
            </div>
        </div>

        <div class="basket-card short" onclick="showPositionDetails('2')" style="cursor: pointer;">
            <div class="basket-header">
                <div>
                    <div class="basket-name">Solana Eco</div>
                    <span class="basket-type short">SHORT 10x</span>
                </div>
                <div class="basket-pnl">
                    <div class="pnl-percent" style="color: #ef4444">-4.2%</div>
                    <div class="pnl-amount" style="color: #ef4444">-$120.50</div>
                </div>
            </div>
            <div class="basket-icons">
                <div class="token-icon" style="background: #00ffa3">◎</div>
                <div class="token-icon" style="background: #14f195; margin-left: -8px">J</div>
                <div class="token-icon" style="background: #9945ff; margin-left: -8px">R</div>
            </div>
            <div class="basket-details">
                <div class="detail-item">
                    <span class="detail-label">ENTRY</span>
                    <span class="detail-value">$105.20</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">MARK</span>
                    <span class="detail-value">$108.40</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">LIQ. PRICE</span>
                    <span class="detail-value" style="color: #f97316">$115.00</span>
                </div>
            </div>
        </div>

        <div class="basket-card long" onclick="showPositionDetails('3')" style="cursor: pointer;">
            <div class="basket-header">
                <div>
                    <div class="basket-name">DeFi 2.0</div>
                    <span class="basket-type long">LONG 2x</span>
                </div>
                <div class="basket-pnl">
                    <div class="pnl-percent" style="color: #10b981">+0.8%</div>
                    <div class="pnl-amount" style="color: #10b981">+$12.30</div>
                </div>
            </div>
            <div class="basket-icons">
                <div class="token-icon" style="background: #ff007a">U</div>
                <div class="token-icon" style="background: #2775ca; margin-left: -8px">A</div>
            </div>
            <div class="basket-details">
                <div class="detail-item">
                    <span class="detail-label">ENTRY</span>
                    <span class="detail-value">$5.24</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">MARK</span>
                    <span class="detail-value">$5.28</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">LIQ. PRICE</span>
                    <span class="detail-value" style="color: #f97316">$3.10</span>
                </div>
            </div>
        </div>
    `;
}

function renderBaskets() {
    renderSampleBaskets();
}

function drawEquityChart() {
    const canvas = document.getElementById('equity-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = 200;
    
    // Sample data
    const data = [100, 105, 103, 110, 115, 112, 120, 118, 125, 130];
    const max = Math.max(...data);
    const min = Math.min(...data);
    
    // Draw gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.2)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    data.forEach((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / (max - min)) * height * 0.8 - height * 0.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw line
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    data.forEach((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / (max - min)) * height * 0.8 - height * 0.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
}

// Basket Builder
function updateWeight(slider, asset) {
    weights[asset] = parseInt(slider.value);
    slider.previousElementSibling.textContent = weights[asset] + '%';
    
    // Update total
    const total = weights.btc + weights.eth + weights.sol;
    document.getElementById('total-weight').textContent = total;
    document.getElementById('progress').style.width = total + '%';
    
    // Change color based on total
    const progress = document.getElementById('progress');
    if (total === 100) {
        progress.style.background = 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)';
    } else if (total > 100) {
        progress.style.background = '#ef4444';
    } else {
        progress.style.background = '#f59e0b';
    }
}

function selectLeverage(leverage) {
    selectedLeverage = leverage;
    document.querySelectorAll('.leverage-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    document.querySelector('.leverage-value').textContent = leverage + '.0x';
}

async function openPosition() {
    const total = weights.btc + weights.eth + weights.sol;
    
    if (total !== 100) {
        alert('Asset weights must total 100%');
        return;
    }
    
    const button = event.target;
    button.textContent = 'Opening Position...';
    button.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/api/position/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collateral: 100000000, // 1 APT
                leverage: selectedLeverage,
                btc_weight: weights.btc,
                eth_weight: weights.eth,
                sol_weight: weights.sol
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Position opened successfully! TX: ' + data.txHash);
            showDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Position open error:', error);
        alert('Error opening position. Check console for details.');
    } finally {
        button.textContent = 'Open Position →';
        button.disabled = false;
    }
}

// Review Transaction Modal
function openPosition() {
    const totalWeight = weights.btc + weights.eth + weights.sol;
    
    if (totalWeight !== 100) {
        alert(`Total weight must be 100%. Current: ${totalWeight}%`);
        return;
    }

    // Open review modal
    document.getElementById('review-modal').classList.add('active');
    
    // Update modal with values
    document.getElementById('preview-btc').textContent = `BTC ${weights.btc}%`;
    document.getElementById('preview-eth').textContent = `ETH ${weights.eth}%`;
    document.getElementById('preview-sol').textContent = `SOL ${weights.sol}%`;
    document.getElementById('review-leverage').textContent = `${selectedLeverage}.0x`;
    
    // Calculate position size (example: $2000 collateral * leverage)
    const collateral = 2000;
    const positionSize = collateral * selectedLeverage;
    document.getElementById('review-size').textContent = `$${positionSize.toLocaleString()}`;
    document.getElementById('review-collateral').textContent = `$${collateral.toLocaleString()}`;
    
    // Calculate liquidation price (simplified)
    const currentPrice = 1784.42;
    const liqPrice = currentPrice * (1 - (0.8 / selectedLeverage));
    document.getElementById('review-liq').textContent = `$${liqPrice.toFixed(0).toLocaleString()}`;
    document.getElementById('review-entry').textContent = `$${currentPrice.toLocaleString()}`;
}

function closeModal() {
    document.getElementById('review-modal').classList.remove('active');
}

async function confirmTransaction() {
    const button = document.querySelector('.slide-to-confirm');
    button.textContent = '⏳ Processing...';
    button.disabled = true;

    try {
        const response = await fetch(`${API_URL}/api/position/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collateral: 2000,
                leverage: selectedLeverage,
                weights: weights
            })
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            alert('✅ Position opened successfully!');
            showPositionDetails(result.positionId || '1');
        } else {
            throw new Error(result.error || 'Transaction failed');
        }
    } catch (error) {
        console.error('Transaction error:', error);
        alert('❌ Transaction failed: ' + error.message);
    } finally {
        button.textContent = 'Slide to Confirm';
        button.disabled = false;
    }
}

// Position Details Page
function showPositionDetails(positionId) {
    showPage('position-details-page');
    drawCompositionChart();
    
    // Simulate live data updates
    setInterval(updatePositionData, 5000);
}

function drawCompositionChart() {
    const canvas = document.getElementById('compositionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = 60;
    const centerY = 60;
    const radius = 50;
    const innerRadius = 35;
    
    const data = [
        { percentage: 0.40, color: '#7c3aed' }, // BTC 40%
        { percentage: 0.30, color: '#a855f7' }, // ETH 30%
        { percentage: 0.30, color: '#c084fc' }  // SOL 30%
    ];
    
    let startAngle = -Math.PI / 2;
    
    data.forEach(item => {
        const endAngle = startAngle + (item.percentage * 2 * Math.PI);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        startAngle = endAngle;
    });
}

function updatePositionData() {
    // Simulate small price changes
    const baseValue = 14203.44;
    const change = (Math.random() - 0.5) * 200;
    const newValue = baseValue + change;
    const pnl = newValue - 11803.44;
    const pnlPercent = (pnl / 11803.44) * 100;
    
    document.getElementById('net-value').textContent = `$${newValue.toFixed(2).toLocaleString()}`;
    document.getElementById('net-change').textContent = 
        `📈 ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent > 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`;
    
    // Update health score
    const healthScore = 1.85 + (Math.random() - 0.5) * 0.1;
    document.getElementById('health-score').textContent = healthScore.toFixed(2);
    
    // Update funding rate
    const funding = -0.012 + (Math.random() - 0.5) * 0.004;
    document.getElementById('pos-funding').textContent = `${funding.toFixed(4)}%`;
}

// Close Position Modal Functions
function openClosePositionModal() {
    document.getElementById('close-position-modal').classList.add('active');
    
    // Calculate current position data
    const entryPrice = 1850.00;
    const currentPrice = 2100.00;
    const leverage = 5;
    const collateral = 4734.00; // From position details
    
    const pnl = (currentPrice - entryPrice) / entryPrice * 100;
    const pnlAmount = collateral * (pnl / 100) * leverage;
    
    // Update modal values
    document.getElementById('close-pnl-amount').textContent = `+$${pnlAmount.toFixed(2)}`;
    document.getElementById('close-pnl-percent').textContent = `📈 ${pnl.toFixed(1)}%`;
    document.getElementById('close-entry-price').textContent = `$${entryPrice.toLocaleString()}`;
    document.getElementById('close-mark-price').textContent = `$${currentPrice.toLocaleString()}`;
    
    const payoutETH = (collateral + pnlAmount) / currentPrice;
    document.getElementById('close-payout').textContent = `• ${payoutETH.toFixed(3)} ETH`;
}

function closeClosePositionModal() {
    document.getElementById('close-position-modal').classList.remove('active');
}

async function executeClosePosition() {
    const button = document.querySelector('.slide-to-close');
    button.textContent = '⏳ Closing Position...';
    button.disabled = true;

    try {
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Close the confirmation modal
        closeClosePositionModal();
        
        // Show success modal
        setTimeout(() => {
            showCloseSuccessModal();
        }, 300);

    } catch (error) {
        console.error('Close position error:', error);
        alert('❌ Failed to close position: ' + error.message);
        button.textContent = 'Slide to Close Position';
        button.disabled = false;
    }
}

function showCloseSuccessModal() {
    const modal = document.getElementById('close-success-modal');
    modal.classList.add('active');
    
    // Update success modal values
    const pnlAmount = 1240.50;
    const closingPrice = 2098.45;
    const basketValue = 4.205;
    const txHash = '0x3f' + Math.random().toString(36).substring(2, 8) + '8a91';
    const newBalance = 14.52;
    
    document.getElementById('success-pnl').textContent = `+$${pnlAmount.toFixed(2)}`;
    document.getElementById('success-closing-price').textContent = `$${closingPrice.toLocaleString()}`;
    document.getElementById('success-basket-value').textContent = `${basketValue} ETH`;
    document.getElementById('success-tx-hash').innerHTML = `
        ${txHash.slice(0, 6)}...${txHash.slice(-4)}
        <span class="copy-icon" onclick="copyTxHash('${txHash}')">📋</span>
    `;
    document.getElementById('success-balance').textContent = `${newBalance} ETH`;
}

function copyTxHash(hash) {
    const fullHash = hash || '0x3f7e8a91234567890abcdef';
    navigator.clipboard.writeText(fullHash);
    alert('✓ Transaction hash copied!');
}

function copyBalance() {
    const balance = document.getElementById('success-balance').textContent;
    navigator.clipboard.writeText(balance);
    alert('✓ Balance copied!');
}

function backToPortfolio() {
    document.getElementById('close-success-modal').classList.remove('active');
    showDashboard();
}

function viewInExplorer() {
    const explorerUrl = 'https://explorer.movementnetwork.xyz/?network=bardock+testnet';
    window.open(explorerUrl, '_blank');
}

// Initialize on load
window.addEventListener('load', () => {
    // Check if coming from wallet connect
    if (window.location.hash === '#dashboard') {
        showDashboard();
    }
});
