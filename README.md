# GateFlo.io

A lightweight, frontend-only cryptocurrency payment gateway that enables seamless crypto payments without requiring any backend infrastructure. Supports multiple cryptocurrencies with automatic price conversion and style detection.

## Features

- 🔒 Secure, browser-based cryptocurrency payments
- 💸 Multiple cryptocurrencies (NIM, BTC, USDC, USDT)
- 🎯 Real-time price conversion with CoinGecko and KuCoin
- 🌐 No backend required - works with any static website
- 🎨 Automatic style detection to match your website
- ⚡ Fast integration with minimal setup
- 📱 Mobile-responsive design

## Quick Start

1. Include the required dependencies:
```html
<!-- Required external dependencies -->
<script src="https://cdn.jsdelivr.net/npm/@nimiq/hub-api@v1.2.3/dist/standalone/HubApi.standalone.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/web3@4.0.3/dist/web3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<!-- GateFlo bundle -->
<script src="path/to/gateflo.min.js"></script>
```

2. Initialize GateFlo with your merchant details:
```javascript
const gateflo = new GateFlo({
    merchant: {
        name: 'Your Store Name',
        addresses: {
            nim: 'YOUR-NIM-ADDRESS',
            btc: 'YOUR-BTC-ADDRESS',
            usdc: 'YOUR-POLYGON-ADDRESS',
            usdt: 'YOUR-POLYGON-ADDRESS'
        }
    }
});
```

3. Show the payment modal:
```javascript
// On checkout button click
gateflo.showPayment({
    amount: 10.00,  // Amount in USD
    currency: 'USD'
});
```

## How It Works

1. **Price Conversion**: GateFlo automatically fetches real-time prices from:
   - CoinGecko (primary source)
   - KuCoin (fallback source)
   - 5-minute price caching for reliability

2. **Payment Methods**:
   - NIM: Direct browser-to-blockchain via Nimiq Hub
   - BTC: QR code + address monitoring
   - USDC/USDT: Polygon network support

3. **Style Integration**:
   - Automatically matches your website's colors
   - Customizable through CSS variables
   - Mobile-responsive design

## Documentation

- [Integration Guide](docs/INTEGRATION.md) - Complete setup and styling guide
- [API Reference](docs/API.md) - API documentation and price system details

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](.github/CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

GateFlo.io is based on [Nimipay](https://nimipay.com) by Gie Katon. See [ATTRIBUTION.md](ATTRIBUTION.md) for details.
