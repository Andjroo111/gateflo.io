# GateFlo Working State Documentation

This document captures the current working state of GateFlo's production-ready implementation.

## Core Functionality

### Price Conversion
- NIM conversion rate: 956 NIM for $1.00 (at 0.0010456 USD/NIM)
- Price sources:
  1. CoinGecko (primary)
  2. KuCoin (fallback)
  3. 5-minute cache as last resort

### Payment Methods
1. NIM
   - Direct browser-to-blockchain via Nimiq Hub
   - Working transaction flow
   - Correct amount calculation

2. BTC
   - QR code generation
   - Address display
   - Amount conversion

3. USDC/USDT
   - Polygon network support
   - 1:1 USD conversion
   - Address validation

## Critical Dependencies
```json
{
  "@nimiq/hub-api": "^1.5.8",
  "@nimiq/style": "^0.8.5",
  "qrcode": "^1.5.3",
  "web3": "^4.0.3"
}
```

## Key Components

### PriceManager
- Manages multiple price sources
- Handles source failover
- Implements caching
- Validates price changes (15% threshold)

### Payment Handlers
- NimHandler: Manages Nimiq Hub integration
- BtcHandler: Handles BTC payments and QR codes
- PolygonHandler: Manages USDC/USDT on Polygon

### Style System
- CSS variables for customization
- Auto-detection of merchant styles
- Mobile responsiveness
- Dark mode support

## Working Test Cases

1. Price Conversion
```javascript
// $1.00 USD conversions
NIM: 956 NIM (0.0010456 USD/NIM)
BTC: 0.0000233 BTC (43,000 USD/BTC)
USDC: 1.00 USDC
USDT: 1.00 USDT
```

2. Payment Flow
- NIM: Working Hub integration
- BTC: Working QR generation
- USDC/USDT: Working address display

3. Error Handling
- Price source failover working
- Cache system functioning
- Invalid address detection working
- Payment timeout handling working

## Known Working Features
- [x] Real-time price conversion
- [x] Multiple currency support
- [x] Automatic style detection
- [x] Mobile responsive design
- [x] Dark mode support
- [x] Error handling
- [x] Price caching
- [x] Source failover

## Test Environment
- Local development server
- Test addresses:
  - NIM: NQ07 0000 0000 0000 0000 0000 0000 0000 0000
  - BTC: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
  - Polygon: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e

## Production State
- Main branch contains stable, production-ready code
- All styling improvements implemented and tested
- Mobile responsiveness verified
- Dark mode fully supported
- Price conversion system validated

## Integration Examples
```javascript
// Basic integration
const gateflo = new GateFlo({
    amount: 1.00,
    currency: 'USD',
    onSuccess: (tx) => console.log('Payment received:', tx),
    onError: (error) => console.error('Payment failed:', error)
});

// With style detection
const gateflo = new GateFlo({
    amount: 1.00,
    currency: 'USD',
    detectStyle: true,
    theme: 'auto' // or 'light'/'dark'
});
```

## Performance Metrics
- Price API response time: ~200ms
- Style detection: ~50ms
- Payment modal load: ~100ms
- QR code generation: ~150ms
