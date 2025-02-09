# GateFlo.io Documentation

## Getting Started
1. Include the Nimiq Hub API script
```html
<script src="https://cdn.jsdelivr.net/npm/@nimiq/hub-api@v1.2.3/dist/standalone/HubApi.standalone.umd.js"></script>
```

2. Initialize and use GateFlo
```javascript
const gateflo = new GateFlo();
await gateflo.init();

const result = await gateflo.pay({
    recipient: 'NQ03 XXXX XXXX XXXX',
    amount: 10,
    currency: 'NIM'
});
```

## API Reference
See [API.md](./API.md) for detailed documentation.

## Error Handling
```javascript
try {
    const result = await gateflo.pay({...});
} catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
        // Handle validation errors
    } else if (error.code === 'NETWORK_ERROR') {
        // Handle network errors
    }
}
