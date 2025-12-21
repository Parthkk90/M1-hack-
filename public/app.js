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
        <div class="basket-card long">
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

        <div class="basket-card short">
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

        <div class="basket-card long">
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

// Initialize on load
window.addEventListener('load', () => {
    // Check if coming from wallet connect
    if (window.location.hash === '#dashboard') {
        showDashboard();
    }
});
