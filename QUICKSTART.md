# 🎯 Movement Baskets - Quick Start Guide

## ✅ Current Status
- ✅ All 7 smart contracts deployed on Movement testnet
- ✅ API server running at http://localhost:3000
- ✅ Frontend UI complete with 3 screens
- ✅ Wallet integration ready

## 🚀 Launch the App

### 1. Start the Server (if not running)
```powershell
npm run dev
```

### 2. Open the App
Open your browser to: **http://localhost:3000**

## 📱 App Features

### **Landing Page**
- Beautiful hero section
- Wallet connect buttons (MetaMask/WalletConnect)
- Feature showcase with basket illustration

### **Dashboard**
- Portfolio value with growth chart
- Quick actions (Deposit, Withdraw, Swap, History)
- Active baskets list showing:
  - Mega Cap Index (LONG 5x) +24.5%
  - Solana Eco (SHORT 10x) -4.2%
  - DeFi 2.0 (LONG 2x) +0.8%
- Real-time PnL tracking

### **Basket Builder**
- Asset composition sliders (BTC 50%, ETH 30%, SOL 20%)
- Leverage selector (1x - 20x)
- Live price feeds
- One-click position opening

## 🧪 Test the App

### Test Flow:
1. **Click "Connect MetaMask"** or skip to dashboard
2. **View Dashboard** - See sample positions
3. **Click "Create New Basket"**
4. **Adjust sliders** - Change BTC/ETH/SOL weights
5. **Select leverage** - Choose 5x, 10x, or 20x
6. **Click "Open Position"** - Executes on Movement testnet

### Test with PowerShell:
```powershell
.\test-api.ps1
```

## 🎨 UI Screens

### Screen 1: Landing
- Logo + Network badge
- Hero title with gradient
- Basket feature card
- Wallet connection options

### Screen 2: Dashboard
- User greeting
- Total equity ($14,250.45)
- Equity chart
- 4 quick action buttons
- Active baskets list (3 sample positions)
- Create basket button
- Bottom navigation

### Screen 3: Builder
- Composition weight progress bar
- 3 asset cards with sliders
- 6 leverage options
- Open position button

## 🔗 API Endpoints

All working at `http://localhost:3000/api`:

- `GET /health` - Server status
- `GET /prices` - BTC/ETH/SOL prices
- `POST /position/open` - Open new basket
- `GET /position/:id` - Get position details
- `GET /account` - Get account info

## 📊 Contract Features

All deployed and tested:
- ✅ **basket_vault** - Position management (20x max)
- ✅ **leverage_engine** - 4-tier liquidation
- ✅ **price_oracle** - Real-time prices
- ✅ **funding_rate** - Hourly payments
- ✅ **rebalancing_engine** - AI risk scoring
- ✅ **revenue_distributor** - 4 revenue streams
- ✅ **payment_scheduler** - Recurring payments

## 🌐 Live Links

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Explorer**: https://explorer.movementnetwork.xyz/?network=bardock+testnet/account/0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7

## 🏆 Hackathon Ready!

**What's Complete:**
1. ✅ Smart contracts deployed
2. ✅ API fully functional
3. ✅ Beautiful responsive UI
4. ✅ Wallet integration
5. ✅ Real-time position opening
6. ✅ Sample data for demo

**Demo Flow (30 seconds):**
1. Open app → Landing page
2. Connect wallet → Dashboard
3. View sample positions
4. Create new basket → Builder
5. Adjust 50/30/20 weights + 10x leverage
6. Open position → See TX hash

**Ready for video recording!** 🎥
