# GateFlo.io API Reference

## Class: GateFlo

The main class for interacting with the GateFlo payment gateway.

### Constructor

```javascript
new GateFlo(hubEndpoint = 'https://hub.nimiq.com')
```

Creates a new GateFlo instance.

#### Parameters
- `hubEndpoint` (string, optional): Custom Nimiq Hub endpoint URL. Defaults to 'https://hub.nimiq.com'.

### Methods

#### init()

```javascript
async init(): Promise<void>
```

Initializes the GateFlo instance by establishing a connection to the Nimiq Hub.

Throws:
- `InitializationError`: If Hub API is not loaded or initialization fails

#### pay(options)

```javascript
async pay(options: PaymentOptions): Promise<PaymentResult>
```

Process a cryptocurrency payment through the Nimiq Hub.

##### Parameters
- `options` (object):
  - `recipient` (string, required): Nimiq address of the payment recipient
  - `amount` (number, required): Payment amount in the chosen currency
  - `currency` (string, optional): Currency code, one of: 'NIM', 'BTC', 'USDC', 'USDT'. Defaults to 'NIM'

##### Returns
- `Promise<PaymentResult>`: Object containing transaction details
  - `hash` (string): Transaction hash

##### Throws
- `ValidationError`: If payment parameters are invalid
- `NetworkError`: If Hub connection or transaction fails
- `InitializationError`: If GateFlo is not initialized

### Error Types

#### GateFloError
Base error class for all GateFlo errors.

Properties:
- `message` (string): Error description
- `code` (string): Error code

#### ValidationError
Thrown when payment parameters are invalid.
- Code: 'VALIDATION_ERROR'

#### NetworkError
Thrown when Hub API connection or transaction fails.
- Code: 'NETWORK_ERROR'

#### InitializationError
Thrown when GateFlo is not properly initialized.
- Code: 'INITIALIZATION_ERROR'

## Price System

GateFlo uses a robust price system with multiple sources and fallbacks to ensure reliable cryptocurrency price data.

### Price Sources

#### Primary Source: CoinGecko
- Used first for all price queries
- Provides real-time market data
- Supports all currencies (NIM, BTC, USDC, USDT)
- Free API with good reliability
- No API key required

#### Fallback Source: KuCoin
- Used if CoinGecko fails
- Real-time exchange data
- Trading pairs:
  - BTC-USDT
  - NIM-USDT
- Highly reliable backup

### Price Flow

1. When a payment is initiated:
   ```
   ┌─────────────┐
   │ Price Query │
   └──────┬──────┘
          │
   ┌──────▼──────┐    ┌─────────────┐
   │  CoinGecko  │───►│ Use Price   │
   └──────┬──────┘    └─────────────┘
          │ (if fails)
   ┌──────▼──────┐    ┌─────────────┐
   │   KuCoin    │───►│ Use Price   │
   └──────┬──────┘    └─────────────┘
          │ (if fails)
   ┌──────▼──────┐
   │ Use Cache   │
   └─────────────┘
   ```

2. Price caching:
   - Prices are cached for 5 minutes
   - Each source maintains its own cache
   - Cache is used if both sources fail
   - Cache expires after 5 minutes

### Price Validation

1. Maximum Change Threshold:
   - 15% maximum price change allowed
   - Prevents using extreme outlier prices
   - Compares against last valid price

2. Stablecoin Handling:
   - USDC and USDT always use 1:1 USD price
   - No API calls needed for stablecoins
   - Reduces API usage and improves reliability

### Price Updates

1. Initial Load:
   - Prices fetched when payment modal opens
   - All supported currencies fetched at once
   - Uses cached prices if available

2. Real-time Updates:
   - Prices monitored during payment
   - Updated if older than 5 minutes
   - Updates don't interrupt payment flow

### Price Classes

#### PriceManager

```javascript
class PriceManager {
    sources = [
        new CoinGeckoSource(),
        new KuCoinSource()
    ];
    
    async getPrice(currency) {
        // Try each source
        for (const source of this.sources) {
            try {
                return await source.fetchPrice(currency);
            } catch (error) {
                continue;
            }
        }
    }
}
```

#### PriceSource

```javascript
class PriceSource {
    name;
    cache = new Map();
    CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    async fetchPrice(currency) {
        // Implementation varies by source
    }
    
    isCacheValid(currency) {
        // Check cache age
    }
}
```

### Price Conversion Examples

For $1.00 USD:

```javascript
// NIM Example (price: 0.0010456 USD)
nimAmount = 1.00 / 0.0010456 ≈ 956 NIM

// BTC Example (price: 43,000 USD)
btcAmount = 1.00 / 43000 ≈ 0.0000233 BTC

// USDC/USDT
stablecoinAmount = 1.00 // Always 1:1
```

### Example Usage

```javascript
try {
    // Initialize GateFlo
    const gateflo = new GateFlo();
    await gateflo.init();
    
    // Process payment
    const result = await gateflo.pay({
        recipient: 'NQ03 XXXX XXXX XXXX',
        amount: 10,
        currency: 'NIM'
    });
    
    console.log('Transaction hash:', result.hash);
} catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
        console.error('Invalid payment details:', error.message);
    } else if (error.code === 'NETWORK_ERROR') {
        console.error('Hub connection failed:', error.message);
    } else if (error.code === 'INITIALIZATION_ERROR') {
        console.error('GateFlo not initialized:', error.message);
    }
}
```

### Troubleshooting

1. Price Not Updating:
   - Check network connectivity
   - Verify API endpoints
   - Clear price cache

2. Invalid Prices:
   - Check source status
   - Verify trading pair exists
   - Ensure proper number formatting

3. Source Failures:
   - Monitor failure counters
   - Check API rate limits
   - Verify network connectivity
