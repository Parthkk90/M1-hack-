# ✅ Cresca - Complete Testing Checklist

## 🎯 Test All Screens & Navigation

### Pre-Test Setup
- [ ] Server running on `http://localhost:8080`
- [ ] Browser DevTools console open (F12)
- [ ] Check for any JavaScript errors

---

## 📱 Screen-by-Screen Testing

### 1. Landing Page 🏠
**URL**: `http://localhost:8080/index.html`

#### Visual Tests
- [ ] Logo displays correctly (🎯 Cresca)
- [ ] Network badge shows "Movement"
- [ ] Hero title "Trade Diversified Crypto, One Position"
- [ ] Feature card with basket icon (🧺)
- [ ] Two wallet connect buttons visible

#### Interaction Tests
- [ ] Click "Connect MetaMask" → Goes to Dashboard
- [ ] Click "Connect Wallet" → Goes to Dashboard
- [ ] Page is responsive (resize browser)

---

### 2. Dashboard 📊
**Navigation**: After connecting wallet

#### Visual Tests
- [ ] Total equity displays: $18,450.75
- [ ] Equity chart visible
- [ ] Bottom navigation visible (4 icons)
- [ ] "Create Position" button prominent
- [ ] Sample baskets grid displays

#### Interaction Tests
- [ ] Click "Create Position" → Opens Basket Builder
- [ ] Click basket card → Opens Basket Builder
- [ ] Click Market icon (bottom nav) → Goes to Market Page
- [ ] Click Wallet icon (bottom nav) → Goes to Wallet Page
- [ ] Click Settings icon (bottom nav) → Goes to Settings Page
- [ ] Click Home icon (bottom nav) → Stays on Dashboard

#### Data Tests
- [ ] Check equity value format ($ with commas)
- [ ] Chart renders without errors
- [ ] Sample baskets show:
  * Basket name
  * Asset composition
  * PnL value
  * Badge (LONG/SHORT)

---

### 3. Market Page 🏪
**Navigation**: Bottom Nav → Market icon

#### Visual Tests
- [ ] Search bar with 🔍 icon
- [ ] 4 filter chips: All (active), Long, Short, New
- [ ] 3 market stat cards:
  * Total Value Locked: $342M
  * 24h Volume: $89M
  * Active Traders: 12.4K
- [ ] Trending baskets grid displays
- [ ] Bottom nav shows Market as active (purple)

#### Interaction Tests
- [ ] Click All filter → Chip becomes active (purple gradient)
- [ ] Click Long filter → Chip becomes active
- [ ] Click Short filter → Chip becomes active
- [ ] Click New filter → Chip becomes active
- [ ] Click basket card → Opens Basket Builder
- [ ] Type in search bar → Cursor focuses
- [ ] Click Home icon → Returns to Dashboard
- [ ] Click Wallet icon → Goes to Wallet Page
- [ ] Click Settings icon → Goes to Settings Page

#### Data Tests
- [ ] 4 baskets display:
  1. Mega Cap Index (LONG badge - green)
  2. DeFi Leaders (LONG badge - green)
  3. Layer 1 Mix (LONG badge - green)
  4. Metaverse Shorts (SHORT badge - red)
- [ ] Each basket shows:
  * Name and description
  * Asset composition chips
  * TVL, 24h Vol, APY
  * Hover effect (card lifts)

---

### 4. Wallet Page 💰
**Navigation**: Bottom Nav → Wallet icon

#### Visual Tests
- [ ] Balance card (purple gradient): $18,450.75
- [ ] Wallet address displays (shortened)
- [ ] Copy button next to address
- [ ] 4 action buttons in grid:
  * Deposit ⬇️
  * Withdraw ⬆️
  * Swap 🔄
  * History 📜
- [ ] Asset list section
- [ ] Recent transactions section
- [ ] Bottom nav shows Wallet as active (purple)

#### Interaction Tests
- [ ] Click copy button → Shows alert "✓ Address copied!"
- [ ] Click Deposit button → Opens Deposit Modal
- [ ] Click Withdraw button → Opens Withdraw Modal
- [ ] Click Swap button → Opens Swap Modal
- [ ] Click History button → Goes to History Page
- [ ] Click Home icon → Returns to Dashboard
- [ ] Click Market icon → Goes to Market Page
- [ ] Click Settings icon → Goes to Settings Page

#### Data Tests
- [ ] 4 assets display:
  1. Aptos (APT) - 14.52 / $167.50
  2. USD Coin (USDC) - 5,240.00 / $5,240.00
  3. Tether (USDT) - 2,100.00 / $2,100.00
  4. Ethereum (ETH) - 0.85 / $1,785.00
- [ ] Each asset shows icon, name, ticker, amount, USD value
- [ ] 3 recent transactions display:
  * Position Opened (-$2,000) - red
  * Deposit (+$5,000) - green
  * Position Closed (+$1,240) - green
- [ ] Transaction amounts have correct colors (red for negative, green for positive)

---

### 5. Settings Page ⚙️
**Navigation**: Bottom Nav → Settings icon

#### Visual Tests
- [ ] 5 sections display:
  1. Account
  2. Notifications
  3. Display
  4. Trading
  5. About
- [ ] Each section has white card background
- [ ] Settings icon in bottom nav is active (purple)

#### Section 1: Account
- [ ] Connected address displays
- [ ] Disconnect Wallet button (red)

#### Section 2: Notifications
- [ ] Position Updates toggle (ON by default)
- [ ] Price Alerts toggle (OFF by default)
- [ ] Marketing Emails toggle (OFF by default)
- [ ] Toggle switches have purple gradient when ON

#### Section 3: Display
- [ ] Theme dropdown (Light selected)
- [ ] Currency dropdown (USD selected)
- [ ] Dropdowns have arrow icons

#### Section 4: Trading
- [ ] Slippage Tolerance: 1.0%
- [ ] Expert Mode toggle (OFF by default)

#### Section 5: About
- [ ] Version: 1.0.0
- [ ] Documentation link
- [ ] Support link

#### Interaction Tests
- [ ] Toggle Position Updates → Switches state
- [ ] Toggle Price Alerts → Switches state
- [ ] Toggle Marketing Emails → Switches state
- [ ] Toggle Expert Mode → Switches state
- [ ] Click Theme dropdown → Shows Light/Dark options
- [ ] Click Currency dropdown → Shows USD/EUR/BTC options
- [ ] Click Disconnect Wallet → Shows confirmation → Goes to Landing
- [ ] Click Home icon → Returns to Dashboard
- [ ] Click Market icon → Goes to Market Page
- [ ] Click Wallet icon → Goes to Wallet Page

---

### 6. History Page 📜
**Navigation**: Wallet Page → History quick action

#### Visual Tests
- [ ] Back button with ← arrow
- [ ] Page title "Transaction History"
- [ ] 5 filter chips: All (active), Opened, Closed, Margin, Liquidated
- [ ] Export button (📥 Export CSV)
- [ ] History list container
- [ ] Bottom navigation still visible

#### Interaction Tests
- [ ] Click Back button → Returns to Wallet Page
- [ ] Click All filter → Chip becomes active
- [ ] Click Opened filter → Chip becomes active
- [ ] Click Closed filter → Chip becomes active
- [ ] Click Margin filter → Chip becomes active
- [ ] Click Liquidated filter → Chip becomes active
- [ ] Click Export CSV → Shows alert "📥 Exporting..."

#### Data Tests
- [ ] 3 history items display:
  1. Position Opened - $10,000 - Active
  2. Margin Added - +$500 - Completed
  3. Position Closed - +$1,240.50 - Completed
- [ ] Each item shows:
  * Type and date
  * Amount (with + or -)
  * Basket name
  * Leverage
  * Status badge

---

### 7. Basket Builder 🧺
**Navigation**: Dashboard → Create Position / Market → Basket card

#### Visual Tests
- [ ] Back button visible
- [ ] Page title "Build Your Basket"
- [ ] 3 asset cards (BTC, ETH, SOL)
- [ ] Each card has:
  * Asset icon and name
  * Weight slider (0-100%)
  * Weight percentage display
- [ ] Total weight indicator (100%)
- [ ] Leverage selector (2x, 5x, 10x, 20x)
- [ ] Position type toggle (LONG/SHORT)
- [ ] Investment amount input
- [ ] "Review Position" button

#### Interaction Tests
- [ ] Click Back button → Returns to Dashboard
- [ ] Drag BTC slider → Weight updates
- [ ] Drag ETH slider → Weight updates
- [ ] Drag SOL slider → Weight updates
- [ ] Verify total weight stays at 100%
- [ ] Click 2x leverage → Highlights
- [ ] Click 5x leverage → Highlights
- [ ] Click 10x leverage → Highlights
- [ ] Click 20x leverage → Highlights
- [ ] Toggle LONG/SHORT → Changes state
- [ ] Type in investment amount → Value updates
- [ ] Click "Review Position" → Opens Review Modal

#### Data Tests
- [ ] Default weights: BTC 50%, ETH 30%, SOL 20%
- [ ] Weight sliders are smooth
- [ ] Total weight calculation is correct
- [ ] Leverage selection highlights properly

---

### 8. Review Modal ✓
**Navigation**: Basket Builder → Review Position

#### Visual Tests
- [ ] Modal appears centered
- [ ] Backdrop blur visible
- [ ] Close button (X) in top right
- [ ] Modal title "Review Your Position"
- [ ] Position summary section:
  * Investment amount
  * Leverage
  * Total exposure
  * Entry price
  * Liquidation price
- [ ] Composition chart
- [ ] Risk metrics (APY estimate)
- [ ] "Slide to Confirm" button at bottom

#### Interaction Tests
- [ ] Click X button → Closes modal
- [ ] Click outside modal → Closes modal
- [ ] Drag slider to right → Confirms position
- [ ] After confirm → Opens Position Details page

#### Data Tests
- [ ] Investment matches input amount
- [ ] Leverage matches selection
- [ ] Total exposure = Investment × Leverage
- [ ] Entry price displays
- [ ] Liquidation price displays
- [ ] Composition chart renders
- [ ] APY estimate shows

---

### 9. Position Details 📈
**Navigation**: After confirming position / Dashboard → Position card

#### Visual Tests
- [ ] Back button visible
- [ ] Position header:
  * Basket name
  * Leverage (e.g., "5x")
  * Position type badge (LONG/SHORT)
- [ ] 4 metric cards:
  * Entry Price
  * Current Price
  * Liquidation Price
  * PnL
- [ ] Equity chart over time
- [ ] Composition breakdown section
- [ ] 2 action buttons:
  * Add Margin
  * Close Position

#### Interaction Tests
- [ ] Click Back button → Returns to Dashboard
- [ ] Click Add Margin → (Future feature - could show alert)
- [ ] Click Close Position → Opens Close Position Modal
- [ ] Chart is interactive (hover shows data)

#### Data Tests
- [ ] Entry price displays with $
- [ ] Current price displays with $
- [ ] PnL shows both $ and % (with +/- sign)
- [ ] PnL has correct color (green for positive, red for negative)
- [ ] Liquidation price displays
- [ ] Chart renders without errors
- [ ] Composition breakdown shows asset percentages

---

### 10. Close Position Modal 🔒
**Navigation**: Position Details → Close Position

#### Visual Tests
- [ ] Modal appears centered
- [ ] Close button (X) in top right
- [ ] Modal title "Close Position"
- [ ] Position summary section
- [ ] Return breakdown:
  * Initial Investment
  * Total Return
  * Net Profit
- [ ] Fee calculation
- [ ] Expected amount display
- [ ] "Slide to Close" button at bottom

#### Interaction Tests
- [ ] Click X button → Closes modal
- [ ] Click outside modal → Closes modal
- [ ] Drag slider to right → Closes position
- [ ] After close → Opens Success Modal

#### Data Tests
- [ ] Entry price matches position
- [ ] Current price matches position
- [ ] PnL calculation is correct
- [ ] Initial investment displays
- [ ] Total return = Investment + Profit
- [ ] Net profit = Total return - Investment
- [ ] Fee displays (network fee)
- [ ] Expected amount = Total return - Fee

---

### 11. Success Modal 🎉
**Navigation**: After closing position

#### Visual Tests
- [ ] Modal appears centered
- [ ] Large checkmark (✓) visible
- [ ] Success message: "Position Closed Successfully!"
- [ ] Transaction details:
  * Amount Received
  * Profit Made ($ and %)
  * Transaction ID
- [ ] "Return to Dashboard" button

#### Interaction Tests
- [ ] Modal auto-appears after close
- [ ] Click "Return to Dashboard" → Goes to Dashboard
- [ ] Modal auto-dismisses after 5 seconds (verify)

#### Data Tests
- [ ] Amount received displays correctly
- [ ] Profit shows with + sign and %
- [ ] Transaction ID displays (or mock ID)
- [ ] Values match close position modal

---

### 12. Deposit Modal 💳
**Navigation**: Wallet Page → Deposit quick action

#### Visual Tests
- [ ] Modal appears centered
- [ ] Close button (X) in top right
- [ ] Modal title "Deposit Funds"
- [ ] QR code section (200x200 placeholder with 📱)
- [ ] Full wallet address displayed
- [ ] Copy Address button
- [ ] Supported assets chips: APT, USDC, USDT, ETH
- [ ] Warning banner (yellow):
  * ⚠️ Minimum deposit: 0.01 APT
  * Only send Movement Network assets

#### Interaction Tests
- [ ] Click X button → Closes modal
- [ ] Click outside modal → Closes modal
- [ ] Click Copy Address → Shows alert "✓ Address copied to clipboard!"
- [ ] Verify copied text is full address

#### Data Tests
- [ ] Full address displays:
  `0x9291fd7e660da4d4a49821392202d34111e26dfa73b630ce1a8d713ec068e5a7`
- [ ] QR code placeholder visible
- [ ] 4 asset chips display (APT, USDC, USDT, ETH)
- [ ] Warning text is clear and visible

---

### 13. Withdraw Modal 💸
**Navigation**: Wallet Page → Withdraw quick action

#### Visual Tests
- [ ] Modal appears centered
- [ ] Close button (X) in top right
- [ ] Modal title "Withdraw Funds"
- [ ] Asset selector dropdown
- [ ] Available balance display
- [ ] MAX button next to balance
- [ ] Amount input field
- [ ] Destination address input field
- [ ] Fee estimate section:
  * Network Fee
  * You will receive
- [ ] "Confirm Withdrawal" button

#### Interaction Tests
- [ ] Click X button → Closes modal
- [ ] Click outside modal → Closes modal
- [ ] Click asset dropdown → Shows APT, USDC, USDT, ETH options
- [ ] Click MAX button → Fills amount with (balance - fee)
- [ ] Type in amount field → Value updates
- [ ] Type in address field → Address updates
- [ ] Click "Confirm Withdrawal" → Shows processing
  * Button text changes to "⏳ Processing..."
  * Button disabled during process
  * After 2 seconds → Shows success alert
  * Modal closes
  * Wallet page data refreshes

#### Data Tests
- [ ] Available balance displays correctly
- [ ] MAX calculation: balance - 0.005
- [ ] Network fee shows: 0.005 APT
- [ ] "You will receive" = amount - fee
- [ ] Validation: shows error if amount > balance
- [ ] Validation: shows error if address is empty

---

### 14. Swap Modal 🔄
**Navigation**: Wallet Page → Swap quick action

#### Visual Tests
- [ ] Modal appears centered
- [ ] Close button (X) in top right
- [ ] Modal title "Swap Tokens"
- [ ] From token section:
  * Amount input
  * Token selector (APT)
  * Balance display
- [ ] Swap arrow button (⇅) in center
- [ ] To token section:
  * Calculated amount (readonly)
  * Token selector (USDC)
- [ ] Exchange rate: 1 APT = 11.50 USDC
- [ ] Price Impact: < 0.1%
- [ ] Slippage Tolerance: 1.0%
- [ ] "Swap" button at bottom

#### Interaction Tests
- [ ] Click X button → Closes modal
- [ ] Click outside modal → Closes modal
- [ ] Type in from amount → To amount auto-calculates
- [ ] Click swap arrow (⇅) → Tokens reverse
  * From becomes To
  * To becomes From
- [ ] Click from token selector → Shows token options
- [ ] Click to token selector → Shows token options
- [ ] Click "Swap" button → Shows processing
  * Button text changes to "⏳ Swapping..."
  * Button disabled during process
  * After 2 seconds → Shows success alert
  * Modal closes
  * Wallet page data refreshes

#### Data Tests
- [ ] Exchange rate displays: 1 APT = 11.50 USDC
- [ ] Calculation: To amount = From amount × 11.50
- [ ] Balance displays for From token
- [ ] Validation: shows error if amount > balance
- [ ] Validation: shows error if amount ≤ 0
- [ ] Price impact updates based on amount
- [ ] Slippage tolerance is editable

---

## 🧭 Complete Navigation Flow Testing

### Flow 1: Full Position Lifecycle
1. [ ] Landing → Connect → Dashboard
2. [ ] Dashboard → Create Position → Builder
3. [ ] Builder → Adjust weights → Select leverage
4. [ ] Builder → Review Position → Review Modal
5. [ ] Review Modal → Slide to Confirm → Position Details
6. [ ] Position Details → Monitor PnL → Charts update
7. [ ] Position Details → Close Position → Close Modal
8. [ ] Close Modal → Slide to Close → Success Modal
9. [ ] Success Modal → Return to Dashboard → Dashboard

### Flow 2: Market Exploration
1. [ ] Dashboard → Market (bottom nav) → Market Page
2. [ ] Market Page → Browse baskets → View details
3. [ ] Market Page → Filter by Long → See filtered
4. [ ] Market Page → Click basket → Builder
5. [ ] Builder → Back → Dashboard

### Flow 3: Wallet Management
1. [ ] Dashboard → Wallet (bottom nav) → Wallet Page
2. [ ] Wallet Page → View balance → See $18,450.75
3. [ ] Wallet Page → Copy address → Alert shows
4. [ ] Wallet Page → Deposit → Deposit Modal
5. [ ] Deposit Modal → Copy address → Close
6. [ ] Wallet Page → Withdraw → Withdraw Modal
7. [ ] Withdraw Modal → MAX → Fill amount → Close
8. [ ] Wallet Page → Swap → Swap Modal
9. [ ] Swap Modal → Input amount → Calculate → Close
10. [ ] Wallet Page → History → History Page
11. [ ] History Page → Filter → Export → Back

### Flow 4: Settings Configuration
1. [ ] Dashboard → Settings (bottom nav) → Settings Page
2. [ ] Settings Page → Toggle notifications → See state change
3. [ ] Settings Page → Change theme → See dropdown
4. [ ] Settings Page → Adjust slippage → See value
5. [ ] Settings Page → Disconnect → Confirm → Landing

### Flow 5: Bottom Navigation Loop
1. [ ] Dashboard → Market → See active state (purple)
2. [ ] Market → Wallet → See active state
3. [ ] Wallet → Settings → See active state
4. [ ] Settings → Home → See active state
5. [ ] Verify smooth transitions between all pages

---

## 🎨 Visual & Responsive Testing

### Desktop (1920x1080)
- [ ] All pages display correctly
- [ ] Bottom nav is fixed at bottom
- [ ] Cards are properly sized
- [ ] Charts are visible and interactive
- [ ] Modals are centered
- [ ] Text is readable

### Tablet (768x1024)
- [ ] Layout adjusts properly
- [ ] Bottom nav still visible
- [ ] Cards stack correctly
- [ ] Modals fit screen
- [ ] Touch interactions work

### Mobile (375x667)
- [ ] All content visible
- [ ] Bottom nav accessible
- [ ] Cards are full width
- [ ] Modals are scrollable
- [ ] Text size is readable
- [ ] Buttons are tappable

### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## ⚡ Performance Testing

### Load Times
- [ ] Landing page loads < 2 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Page transitions < 500ms
- [ ] Modal opens < 300ms
- [ ] Charts render < 1 second

### Interactions
- [ ] Button clicks are instant
- [ ] Slider drag is smooth
- [ ] Toggle switch is immediate
- [ ] Modal close is instant
- [ ] Navigation is seamless

### Console Errors
- [ ] No JavaScript errors
- [ ] No CSS warnings
- [ ] No 404s for assets
- [ ] No CORS errors

---

## 🐛 Known Issues & Edge Cases

### Test Edge Cases
- [ ] Enter 0 in investment amount → Should show error
- [ ] Set all asset weights to 0 → Should show error
- [ ] Try to withdraw more than balance → Should show error
- [ ] Try to swap 0 amount → Should show error
- [ ] Disconnect wallet while on Dashboard → Should return to Landing
- [ ] Rapidly click buttons → Should not cause errors
- [ ] Open multiple modals → Should only show one
- [ ] Resize window while modal open → Should stay centered

### Accessibility
- [ ] Tab navigation works through all elements
- [ ] Focus states are visible
- [ ] Buttons have proper labels
- [ ] Form inputs have labels
- [ ] Color contrast is sufficient

---

## ✅ Final Checklist Before Demo

### Functionality
- [ ] All 12 screens load without errors
- [ ] All navigation buttons work
- [ ] All modals open and close properly
- [ ] All forms accept input
- [ ] All buttons trigger correct actions
- [ ] All data displays correctly
- [ ] All charts render properly

### Design
- [ ] Purple theme is consistent
- [ ] Gradients display properly
- [ ] Shadows are subtle and correct
- [ ] Border radius is consistent
- [ ] Spacing is uniform
- [ ] Typography is clear
- [ ] Icons are visible

### Data
- [ ] Sample data displays
- [ ] Calculations are correct
- [ ] Formatting is consistent ($ with commas)
- [ ] Percentages show with % sign
- [ ] Dates format consistently
- [ ] Transaction IDs display

### Ready for Demo
- [ ] Server running on localhost:8080
- [ ] Browser window maximized
- [ ] DevTools closed (or console only)
- [ ] No errors in console
- [ ] Demo script prepared
- [ ] Screen recording software ready

---

## 🎬 Demo Recording Checklist

### Pre-Recording
- [ ] Clear browser cache
- [ ] Close unnecessary tabs
- [ ] Full screen browser (F11)
- [ ] Mouse cursor visible
- [ ] Audio recording enabled
- [ ] Test recording 10 seconds

### During Recording
- [ ] Start with Landing page
- [ ] Speak clearly about each feature
- [ ] Move mouse slowly
- [ ] Pause between actions
- [ ] Show each screen completely
- [ ] Highlight key features
- [ ] Complete full position lifecycle

### Post-Recording
- [ ] Review recording for errors
- [ ] Check audio quality
- [ ] Verify all features shown
- [ ] Edit if necessary
- [ ] Export in high quality (1080p)
- [ ] Upload to YouTube (unlisted)
- [ ] Add to hackathon submission

---

## 🏆 Submission Checklist

### Required Files
- [ ] README.md (with screenshots)
- [ ] Smart contract code (all 7 files)
- [ ] Frontend code (HTML, CSS, JS)
- [ ] API code (if separate)
- [ ] Demo video link
- [ ] Deployment link (if live)

### Documentation
- [ ] Project description
- [ ] Feature list
- [ ] Setup instructions
- [ ] Smart contract addresses
- [ ] Tech stack details
- [ ] Team information

### Links
- [ ] GitHub repository (public)
- [ ] Live demo (Vercel/Netlify)
- [ ] Video demo (YouTube)
- [ ] Contract explorer link
- [ ] Documentation site (if any)

---

**🎯 Testing Status**: Ready to Begin
**📋 Total Tests**: 350+ checkboxes
**⏱️ Estimated Time**: 2-3 hours for complete testing
**🎥 Demo Recording**: 4 minutes
**🚀 Submission**: Ready after testing complete

Good luck with testing! 🚀
