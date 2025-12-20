# Plan: Cresca Basket DeFi Roadmap (Smart Contracts → UI/UX)

Build a minimum viable basket perpetual protocol for Movement Network hackathon, progressing from core smart contracts through mobile interface. Leverage Movement's Uniswap V2 kit for DeFi patterns and React Native Privy Template for wallet-connected mobile app.

## Phase 1: Smart Contract Foundation (12-16 hours)

1. **Initialize workspace with Movement Hello Blockchain Starter** — Clone as base, provides Move module structure and deployment scripts, establishes testing framework

2. **Build core basket_vault module** — Define `BasketPosition` resource (collateral amount, leverage multiplier, asset weights), implement `open_position()` and `close_position()` entry functions, manage collateral deposits/withdrawals

3. **Create price_oracle module** — Define `PriceData` resource with hardcoded feeds (BTC/ETH/SOL), implement `get_price()` view function returning u64 prices, add `update_prices()` for demo price manipulation

4. **Implement leverage_engine module** — Calculate position value from basket weights × oracle prices × leverage, implement liquidation logic (if position_value < collateral × 0.8), add P&L calculation functions

5. **Reference Movement Uniswap V2 contracts** — Study liquidity pool patterns for collateral management, adapt coin handling and math utilities, reuse error handling patterns

6. **Deploy to Movement testnet** — Use Movement CLI to compile and deploy all modules, verify on Movement explorer, test entry functions via CLI

## Phase 2: Backend Integration Layer (4-6 hours)

7. **Set up Movement TypeScript SDK** — Initialize Node.js project with Movement SDK, create helper functions wrapping contract calls (openPosition, closePosition, getPositionValue)

8. **Build API service layer** — Create REST endpoints or direct SDK calls for mobile consumption, implement transaction building and signing flow, add error handling for failed transactions

## Phase 3: UI/UX Mobile Interface (10-14 hours)

9. **Clone Movement React Native Privy Template** — Provides wallet connection, user authentication, transaction signing UI, saves 6-8 hours of boilerplate

10. **Design and build Dashboard screen** — Display total portfolio value, active positions list, connection status indicator, "Create Basket" CTA button

11. **Build BasketBuilder screen** — Three sliders for BTC/ETH/SOL allocation percentages (totaling 100%), leverage selector (1x-10x), collateral amount input, real-time preview of potential position size

12. **Create PositionDetail screen** — Show basket composition pie chart, current value vs entry value, unrealized P&L percentage, "Close Position" button with confirmation modal

13. **Integrate contract calls** — Connect BasketBuilder "Open" button to SDK openPosition function, wire PositionDetail refresh to getPositionValue queries, implement transaction status toasts

## Phase 4: Demo & Deployment (4-6 hours)

14. **Create scripted demo flow** — Pre-fund test wallet with Movement testnet tokens, script opens 10x basket → waits 30s → updates oracle +5% → shows profit → closes position

15. **Record demo video** — 2-minute screen capture showing mobile app executing full flow, emphasize speed and mobile UX, highlight basket customization feature

16. **Package hackathon submission** — Write README with contract addresses and "Try It" steps, prepare 5-minute pitch deck emphasizing "only mobile basket perpetuals platform", submit to "Best New DeFi App" track

## Further Considerations

1. **Use Movement Vesting Contract patterns for time-locked positions?** Could add "auto-close after 24hr" feature, demonstrates advanced Move capabilities, adds 2-3 hours but strengthens technical depth

2. **Integrate Document Management Module for trade receipts?** Store immutable trade records on-chain, provides "verifiable history" differentiator, requires additional 3-4 hours—worth it if timeline allows

3. **Fallback if Movement testnet unstable?** Keep contracts Movement-compatible but demo on Aptos testnet, emphasize "portable Move code", requires maintaining dual deployment scripts (add 2 hours buffer)


### Rules - Stick to Movement Network's best practices for Move development. Use their SDKs and templates to maximize efficiency. Prioritize a smooth mobile user experience to stand out in the hackathon focused on DeFi innovation.
Always test each component thoroughly before moving to the next phase to ensure stability and functionality.
And make sure after updates to the oracle prices, the position values reflect accurately in the UI.
and push commits frequently with clear messages in commit only using 5 to 6 words for each development milestone.