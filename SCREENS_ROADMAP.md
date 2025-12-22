# 📋 Movement Baskets - Complete Screen Roadmap

## ✅ **Screens Already Built** (5/9 Complete)

### 1. **Landing Page** ✅
- Hero section with gradient title
- Feature card with basket icon
- Wallet connect buttons (MetaMask/WalletConnect)
- Network badge (Movement)
- **Status:** Complete & Live

### 2. **Dashboard Page** ✅
- User welcome header with avatar
- Total equity card with chart
- Quick actions (Deposit/Withdraw/Swap/History)
- Active baskets list (3 sample positions)
- Bottom navigation bar
- **Status:** Complete & Live

### 3. **Basket Builder Page** ✅
- Asset weight sliders (BTC/ETH/SOL)
- Real-time weight percentage display
- Composition progress bar (must equal 100%)
- Leverage selector (1x - 20x)
- Open position button
- **Status:** Complete & Live

### 4. **Review Transaction Modal** ✅
- Basket preview with icon
- LONG/SHORT badge
- Asset composition tags
- Signature required section
- Position details (leverage, size, collateral, liq. price)
- Transaction breakdown
- Slide to Confirm button
- Security footer
- **Status:** Complete & Live

### 5. **Position Details Page** ✅
- Net position value with live updates
- Health Factor card with gradient bar
- Position metrics grid (entry, leverage, collateral, funding)
- Donut chart for basket composition
- Individual asset performance
- Position history timeline
- Action buttons (Adjust Margin, Close Position)
- **Status:** Complete & Live

---

## 🚧 **Screens To Build** (4 Remaining)

### 6. **Market Page** ⏳
**Priority:** High (Referenced in bottom nav)

**Features Needed:**
- List of available baskets to trade
- Popular indices (Mega Cap, DeFi, Layer 1, NFT, etc.)
- Each basket card shows:
  - Name and description
  - Asset composition
  - 24h performance
  - Total TVL
  - Available leverage options
- Search and filter functionality
- Trending baskets section
- "Trade Now" button on each card

**UI Components:**
- Grid of basket cards
- Search bar at top
- Filter chips (All/Long/Short/New)
- TVL and 24h volume stats

---

### 7. **Wallet Page** ⏳
**Priority:** High (Referenced in bottom nav)

**Features Needed:**
- Wallet balance display
- Asset breakdown (APT, USDC, etc.)
- Transaction history
- Deposit button → shows deposit modal
- Withdraw button → shows withdraw modal
- QR code for receiving
- Connected wallet address (truncated with copy button)
- Network indicator

**UI Components:**
- Balance card (large display)
- Asset list with icons
- Transaction list (scrollable)
- Action buttons row

---

### 8. **Settings Page** ⏳
**Priority:** Medium (Referenced in bottom nav)

**Features Needed:**
- Account settings
  - Change wallet
  - Disconnect wallet
- Notification preferences
  - Position alerts
  - Price alerts
  - Liquidation warnings
- Display settings
  - Theme (light/dark)
  - Currency (USD/EUR/etc.)
  - Language
- Advanced settings
  - Slippage tolerance
  - Transaction deadline
  - Expert mode toggle
- About section
  - Version number
  - Documentation link
  - Support/Discord link

**UI Components:**
- Grouped settings sections
- Toggle switches
- Dropdown selectors
- Action buttons

---

### 9. **Transaction History Page** ⏳
**Priority:** Medium (Quick action button exists)

**Features Needed:**
- Complete transaction history
- Filter by type:
  - Position Opened
  - Position Closed
  - Margin Added
  - Margin Removed
  - Liquidations
- Date range selector
- Export CSV functionality
- Transaction details:
  - Timestamp
  - Action type
  - Amount
  - Transaction hash (link to explorer)
  - Status (success/pending/failed)

**UI Components:**
- Filter bar at top
- List of transaction cards
- Expandable details
- Pagination

---

## 🎯 **Additional Features to Enhance**

### 10. **Deposit Modal** (Quick Action) ⏳
- QR code for wallet address
- Copy address button
- Supported assets list
- Minimum deposit amounts
- Network confirmation

### 11. **Withdraw Modal** (Quick Action) ⏳
- Destination address input
- Amount selector with max button
- Available balance display
- Gas fee estimate
- Confirm withdrawal button

### 12. **Swap Modal** (Quick Action) ⏳
- Token selector (from/to)
- Amount input
- Exchange rate display
- Price impact warning
- Slippage settings
- Swap button

---

## 📅 **Recommended Build Order**

### Phase 1: Navigation Complete (Priority)
1. **Market Page** - Users need to discover baskets
2. **Wallet Page** - Users need to see their balance
3. **Settings Page** - Users need basic configuration

### Phase 2: Enhanced Features
4. **Transaction History Page** - Better tracking
5. **Deposit/Withdraw Modals** - Better UX
6. **Swap Modal** - Complete quick actions

---

## 📊 **Progress Summary**

| Category | Built | Remaining | Total | Progress |
|----------|-------|-----------|-------|----------|
| Core Pages | 5 | 4 | 9 | 56% |
| Modals | 1 | 3 | 4 | 25% |
| **Total** | **6** | **7** | **13** | **46%** |

---

## 🚀 **Next Steps to Complete**

### Immediate Actions (Next 2-3 hours):
1. **Build Market Page** - Show available baskets
2. **Build Wallet Page** - Display user balance
3. **Build Settings Page** - Basic configuration
4. **Connect bottom nav** - Make buttons functional

### After Core Pages (Next 1-2 hours):
5. **Build History Page** - Transaction list
6. **Build Deposit/Withdraw Modals** - Quick actions
7. **Build Swap Modal** - Complete features

### Polish & Testing (Final hour):
8. **Test all navigation flows**
9. **Ensure responsive design works**
10. **Add loading states**
11. **Add error handling**
12. **Record demo video**

---

## 💡 **Technical Considerations**

**Files to Modify:**
- `public/index.html` - Add 4 new page sections
- `public/styles.css` - Add styles for new pages
- `public/app.js` - Add navigation functions

**Estimated Lines of Code:**
- HTML: ~500 lines
- CSS: ~800 lines
- JavaScript: ~400 lines

**Time Estimate:**
- Market Page: 45 minutes
- Wallet Page: 45 minutes
- Settings Page: 30 minutes
- History Page: 45 minutes
- Modals (3): 60 minutes
- **Total: ~4 hours**

---

## ✨ **Hackathon Readiness**

**Current State:**
- ✅ Can demo position opening flow
- ✅ Can show review and confirmation
- ✅ Can show live position monitoring
- ✅ All smart contracts deployed
- ✅ API fully functional

**To Maximize Score:**
- 🚧 Add Market page (shows platform scope)
- 🚧 Add Wallet page (shows user management)
- 🚧 Add Settings page (shows configurability)
- ✅ All existing features are polished

**Demo Flow Priority:**
1. Landing → Connect wallet ✅
2. Dashboard → View active positions ✅
3. **Market → Browse baskets** 🚧
4. Builder → Configure basket ✅
5. Review → Confirm transaction ✅
6. Position Details → Monitor live ✅
7. **Wallet → Check balance** 🚧

---

**Want me to build the remaining screens now?** 🚀
