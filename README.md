# Cresca Basket - Movement Network Hackathon

**Mobile-first basket perpetual trading protocol on Movement Network**

---

## 🎯 Unique Value Proposition

**Cresca is the only platform offering customizable basket perpetuals with leverage.**

- Traditional platforms (GMX, dYdX) = Single-asset positions only
- Cresca = Create custom crypto baskets (e.g., 50% BTC, 30% ETH, 20% SOL) with up to 10x leverage
- Mobile-first interface for on-the-go trading
- Powered by Movement Network's parallel execution

---

## 🏗️ Architecture

### Smart Contracts (Move Language)
- **basket_vault.move**: Position management, collateral handling
- **price_oracle.move**: Price feeds for demo (BTC/ETH/SOL)
- **leverage_engine.move**: P&L calculations, liquidation logic

### Backend (TypeScript + Express)
- Movement SDK integration
- REST API for mobile app
- Real-time position metrics

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start API server
npm run dev

# Run automated demo
npm run demo
```

---

## 📝 API Endpoints

**Trading**:
- `POST /api/account/create` - Create new account
- `GET /api/prices` - Get current oracle prices
- `POST /api/position/open` - Open basket position
- `POST /api/position/close` - Close position
- `POST /api/position/metrics` - Calculate P&L

**Payment Scheduling** 🆕:
- `POST /api/schedule/one-time` - Schedule one-time payment
- `POST /api/schedule/recurring` - Schedule recurring payment
- `GET /api/schedule/list/:address` - Get user's schedules
- `POST /api/schedule/cancel` - Cancel schedule
- `POST /api/schedule/execute` - Execute pending payments (keeper)

---

## 🛠️ Project Structure

```
movement_hack/
├── sources/           # Move smart contracts
├── src/               # TypeScript backend
│   ├── sdk.ts         # Movement SDK wrapper
│   ├── index.ts       # Express API
│   └── demo.ts        # Demo script
├── Move.toml
├── package.json
└── README.md
```

---

## 🏆 Hackathon Submission

**Track**: Best New DeFi App

**Innovation**: First customizable basket perpetuals platform

**Technical Highlights**:
- Move smart contracts for Movement Network
- TypeScript SDK integration
- Mobile-first architecture
- Real-time P&L tracking

---

**Built for Movement Network Hackathon 2025** 🚀
