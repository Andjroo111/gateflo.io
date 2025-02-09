# GateFlo Integration Guide

This guide explains how to integrate GateFlo into your website to accept cryptocurrency payments.

## Prerequisites

You'll need:
1. Your cryptocurrency wallet addresses for:
   - NIM (Nimiq address)
   - BTC (Bitcoin address)
   - USDC/USDT (Polygon network address)
2. A static website or web application

## Installation

### 1. Include Required Dependencies

Add these scripts to your HTML file:

```html
<!-- Nimiq Hub API for NIM payments -->
<script
    src="https://cdn.jsdelivr.net/npm/@nimiq/hub-api@v1.2.3/dist/standalone/HubApi.standalone.umd.js"
    integrity="sha256-5X6zryCUAPOnfjLU8tEtJrLdcslA2UI27RsUWnLAxHs="
    crossorigin="anonymous"></script>

<!-- Web3.js for USDC/USDT on Polygon -->
<script src="https://cdn.jsdelivr.net/npm/web3@4.0.3/dist/web3.min.js"></script>

<!-- QR Code generation for BTC -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

<!-- GateFlo bundle -->
<script src="path/to/gateflo.min.js"></script>
```

### 2. Initialize GateFlo

Create a GateFlo instance with your merchant details:

```javascript
const gateflo = new GateFlo({
    merchant: {
        name: 'Your Store Name',
        addresses: {
            nim: 'NQ07 XXXX XXXX XXXX', // Your NIM address
            btc: '1XXXX...XXXX',        // Your BTC address
            usdc: '0xXXXX...XXXX',      // Your Polygon address
            usdt: '0xXXXX...XXXX'       // Your Polygon address (can be same as USDC)
        }
    }
});
```

### 3. Show Payment Modal

Add a payment button or trigger:

```html
<button onclick="handlePayment()">Pay Now</button>
```

Handle the payment:

```javascript
async function handlePayment() {
    try {
        await gateflo.showPayment({
            amount: 10.00,  // Amount in USD
            currency: 'USD'
        });
    } catch (error) {
        console.error('Payment failed:', error);
    }
}
```

## Price Conversion

GateFlo automatically handles price conversion:
1. Uses CoinGecko as primary price source
2. Falls back to KuCoin if CoinGecko fails
3. Caches prices for 5 minutes
4. Updates prices in real-time during payment

## Styling System

GateFlo is designed to automatically match your website's style while providing extensive customization options through CSS variables.

### Automatic Style Detection

GateFlo automatically detects and uses:
- Your website's primary colors
- Font family
- Border radius style
- Shadow styles
- Spacing patterns

### Basic Customization

```css
:root {
    /* Colors */
    --gateflo-primary-color: #0582CA;
    --gateflo-text-color: #1F2348;
    --gateflo-secondary-color: #757575;
    --gateflo-background-color: #FFFFFF;
    --gateflo-border-color: #E5E5E5;

    /* Typography */
    --gateflo-font-family: 'Mulish', sans-serif;
    --gateflo-heading-size: 1.5em;
    --gateflo-heading-weight: 700;

    /* Layout */
    --gateflo-border-radius: 8px;
    --gateflo-box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    --gateflo-padding: 24px;
    --gateflo-margin: 24px;
}
```

### Advanced Customization

```css
:root {
    /* RGB Values for Opacity */
    --gateflo-primary-color-rgb: 5, 130, 202;
    --gateflo-secondary-color-rgb: 117, 117, 117;

    /* Transitions */
    --gateflo-transition: all 0.2s ease;

    /* Modal Backdrop */
    --gateflo-backdrop-blur: 4px;
    --gateflo-backdrop-opacity: 0.5;
}
```

### Component Styling

#### Modal Container
```css
.gateflo-modal {
    /* Override modal styles */
    max-width: 600px;
    border-radius: 16px 16px 0 0;
}
```

#### Currency Options
```css
.gateflo-currency-option {
    /* Style currency selection buttons */
    border: 2px solid var(--gateflo-border-color);
    padding: 20px;
}

.gateflo-currency-option:hover {
    /* Hover state */
    transform: translateY(-2px);
    border-color: var(--gateflo-primary-color);
}

.gateflo-currency-option.active {
    /* Selected state */
    background: rgba(var(--gateflo-primary-color-rgb), 0.05);
}
```

#### Payment Details
```css
.gateflo-payment-info {
    /* Style payment information section */
    text-align: center;
    padding: 24px;
}

.gateflo-amount {
    /* Style amount display */
    font-size: 1.5em;
    font-weight: 600;
}

.gateflo-qr {
    /* Style QR code container */
    background: white;
    padding: 16px;
    box-shadow: var(--gateflo-box-shadow);
}
```

#### Status Messages
```css
.gateflo-status {
    /* Style status messages */
    margin-top: 20px;
    padding: 16px;
    border-radius: var(--gateflo-border-radius);
}

.gateflo-status-pending {
    background: rgba(var(--gateflo-primary-color-rgb), 0.1);
}

.gateflo-status-confirmed {
    background: rgba(25, 135, 84, 0.1);
    color: #198754;
}

.gateflo-status-failed {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}
```

### Animations

#### Modal Transitions
```css
.gateflo-modal {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gateflo-modal.active {
    transform: translateX(-50%) translateY(0);
}
```

#### Loading Spinner
```css
.gateflo-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(var(--gateflo-primary-color-rgb), 0.1);
    border-top-color: var(--gateflo-primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

### Mobile Responsiveness

```css
@media (max-width: 480px) {
    .gateflo-container {
        margin: 0;
        border-radius: 0;
        padding: 16px;
    }

    .gateflo-currencies {
        grid-template-columns: 1fr;
    }

    .gateflo-qr img {
        width: 160px;
        height: 160px;
    }
}
```

### Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
    :root {
        --gateflo-background-color: #1a1a1a;
        --gateflo-text-color: #ffffff;
        --gateflo-border-color: #333333;
        --gateflo-box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    }

    .gateflo-qr {
        background: #ffffff;
    }
}
```

### Style Examples

#### Modern Style
```css
:root {
    --gateflo-primary-color: #6366f1;
    --gateflo-border-radius: 12px;
    --gateflo-font-family: 'Inter', sans-serif;
    --gateflo-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

#### Minimal Style
```css
:root {
    --gateflo-primary-color: #000000;
    --gateflo-border-radius: 4px;
    --gateflo-box-shadow: none;
    --gateflo-border-color: #000000;
}
```

#### Playful Style
```css
:root {
    --gateflo-primary-color: #FF6B6B;
    --gateflo-border-radius: 20px;
    --gateflo-font-family: 'Quicksand', sans-serif;
    --gateflo-box-shadow: 0 12px 36px rgba(255, 107, 107, 0.2);
}
```

## Payment Flow

1. Customer clicks payment button
2. GateFlo modal opens showing supported cryptocurrencies
3. Real-time price conversion is displayed
4. Customer selects preferred currency:
   - NIM: Opens Nimiq Hub for direct payment
   - BTC: Shows QR code and address
   - USDC/USDT: Shows Polygon network details
5. Payment status is tracked and displayed
6. Modal closes on successful payment

## Error Handling

GateFlo provides built-in error handling:
- Price fetch failures (automatic fallback)
- Network issues (retry mechanisms)
- Invalid addresses (validation)
- Payment timeouts (status updates)

## Testing

Test your integration with these addresses:
- NIM: `NQ07 0000 0000 0000 0000 0000 0000 0000 0000`
- BTC: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
- USDC/USDT: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`

## Support

For issues or questions:
1. Check the [documentation](./README.md)
2. Open an issue on GitHub
3. Contact support@gateflo.io
