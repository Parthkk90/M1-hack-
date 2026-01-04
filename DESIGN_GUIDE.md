# Cresca Wallet - Modernized UI Design

## Design Overview

The Cresca wallet has been redesigned with a modern, clean interface inspired by leading wallet applications. The new design features:

### Color Scheme
- **Primary Purple**: `#6366F1` - Main brand color for key actions and active states
- **Success Green**: `#10B981` - For positive transactions and confirmations
- **Error Red**: `#EF4444` - For negative transactions and warnings
- **Clean White Background**: `#FFFFFF` - Modern, spacious feel
- **Subtle Grays**: `#6B7280`, `#9CA3AF` - Secondary text and borders

### Key Features

#### 1. **Home Screen**
- **Profile Header**: Shows user avatar, app name "Cresca Wallet", and network status badge (Movement Testnet)
- **Balance Display**: 
  - Large USD amount prominently displayed
  - MOVE token balance below
  - Live percentage change indicator with trending icon
  - Toggle visibility for privacy
- **Quick Actions**: Three circular gradient buttons
  - **Send**: Arrow up icon
  - **Receive**: Arrow down icon
  - **Swap**: Swap horizontal icon
- **Transaction History**: 
  - Filter tabs: Latest, Oldest, This Week
  - Detailed transaction cards with:
    - Type icon (sent/received)
    - Transaction type and memo
    - Date and time
    - Wallet address
    - Amount with color coding
    - Status indicator (confirmed/pending)

#### 2. **Bottom Navigation**
Inspired by Riga Wallet with 5 tabs:
- **Home**: Main wallet view (home icon)
- **Markets**: Price charts and market data (chart-line icon)
- **Bundles**: Trading baskets and DeFi features (lightning-bolt icon)
- **Schedule**: Scheduled payments and automation (calendar icon)
- **Profile**: Settings and account management (account icon)

### Design Principles

1. **Clean & Minimal**: White background with ample spacing
2. **Purple Accent**: Consistent use of primary purple for CTAs and active states
3. **Clear Hierarchy**: Typography and spacing create clear information architecture
4. **Status Indicators**: Visual feedback for network status, transaction states
5. **Touch-Friendly**: Large tap targets (64px action buttons)
6. **Readable**: High contrast text, appropriate font sizes

### Typography
- **Balance Amount**: 48pt, bold, tight letter-spacing
- **Section Titles**: 18pt, bold
- **Body Text**: 14-16pt, medium weight
- **Secondary Text**: 12pt, regular weight
- **Monospace**: For addresses and technical data

### Spacing System
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

### Border Radius
- **Small**: 8px (filters, tags)
- **Medium**: 12px (cards)
- **Large**: 16px (modals)
- **XL**: 24px (sheets)
- **Full**: 9999px (buttons, avatars)

## Components

### Custom Components
1. **BottomNavigationBar.tsx** - Custom bottom navigation with smooth transitions
2. **NetworkBadge** - Shows active network with status dot
3. **BalanceCard** - Main balance display with USD and token amounts
4. **ActionButton** - Circular gradient button for main actions
5. **TransactionItem** - Detailed transaction list item
6. **FilterTabs** - Horizontal scrolling filter options

### Reusable Elements
- Gradient backgrounds for CTAs
- Icon containers with colored backgrounds
- Status badges (success/error/pending)
- Percentage change indicators

## Integration with Movement Network

The design seamlessly displays:
- **Movement Testnet** status in header
- **MOVE token** balance and transactions
- **Transaction history** from Movement blockchain
- **Contract address** formatting (0x...)
- **Gas fees** and transaction costs
- **Network latency** indicators

## Accessibility

- High contrast text (WCAG AA compliant)
- Touch targets minimum 44x44pt
- Screen reader support
- Clear status indicators
- Error messaging

## Implementation Notes

### Files Updated
1. `src/core/theme/theme.ts` - Updated color palette
2. `src/features/wallet/presentation/screens/HomeScreen.tsx` - Complete redesign
3. `src/navigation/AppNavigator.tsx` - Updated bottom tabs
4. `src/components/BottomNavigationBar.tsx` - New custom component

### Dependencies
- `react-native-vector-icons` - MaterialCommunityIcons
- `react-native-linear-gradient` - Gradient backgrounds
- `@react-navigation/bottom-tabs` - Tab navigation
- `@react-navigation/stack` - Stack navigation

### Next Steps
1. Implement Markets screen (price charts)
2. Add dark mode support
3. Implement Swap functionality
4. Add animations and transitions
5. Integrate real-time price feeds
6. Add biometric authentication UI
7. Implement QR code scanner for addresses

## Screenshots Comparison

**Before**: Dark theme with card-based layout
**After**: Clean white theme with prominent balance display, inspired by Riga Wallet

## Performance Considerations

- Optimized list rendering for transactions
- Lazy loading for transaction history
- Image optimization for icons and avatars
- Smooth animations using Animated API
- Efficient state management with Redux

## Branding

The design maintains the Cresca brand identity while adopting modern UI patterns:
- Purple as primary brand color
- Clean, trustworthy appearance
- Professional yet approachable
- Focus on clarity and usability
