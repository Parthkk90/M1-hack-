# Cresca Basket - Movement Network Hackathon

Mobile-first basket perpetual protocol on Movement Network.

## Project Structure

```
movement_hack/
├── Move.toml
├── sources/
│   ├── basket_vault.move
│   ├── price_oracle.move
│   └── leverage_engine.move
├── scripts/
└── tests/
```

## Setup

1. Install Movement CLI
2. Run `movement move compile`
3. Deploy with `movement move publish`

## Features

- Custom basket creation (BTC/ETH/SOL)
- Leverage up to 10x
- Real-time P&L tracking
- Mobile-first interface
