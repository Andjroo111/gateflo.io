import NimHandler from './handlers/NimHandler.js';
import BtcHandler from './handlers/BtcHandler.js';
import PolygonHandler from './handlers/PolygonHandler.js';
import PriceManager from './utils/PriceManager.js';

class GateFlo {
    static autoInitialize() {
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.gateflo-button').forEach(element => {
                try {
                    const config = {
                        merchant: {
                            name: element.dataset.merchant,
                            addresses: {
                                nim: element.dataset.nim,
                                btc: element.dataset.btc,
                                usdc: element.dataset.polygon,
                                usdt: element.dataset.polygon
                            }
                        }
                    };
                    const amount = parseFloat(element.dataset.amount) || 1.00;
                    const instance = new GateFlo(config);
                    
                    // Add click handler
                    element.addEventListener('click', () => {
                        instance.showPayment({
                            amount: amount,
                            currency: 'USD'
                        });
                    });

                    // Add default button styles if not styled
                    if (!element.style.cssText) {
                        element.style.cssText = `
                            display: inline-block;
                            padding: 12px 24px;
                            background: var(--gateflo-primary-color, #0582CA);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: system-ui, -apple-system, sans-serif;
                            font-size: 16px;
                            transition: transform 0.2s;
                        `;
                    }

                    // Add hover effect
                    element.addEventListener('mouseenter', () => {
                        element.style.transform = 'translateY(-1px)';
                    });
                    element.addEventListener('mouseleave', () => {
                        element.style.transform = 'none';
                    });

                    // Set button text if not set
                    if (!element.textContent) {
                        element.textContent = `Pay $${amount.toFixed(2)}`;
                    }

                } catch (error) {
                    console.error('Failed to initialize GateFlo button:', error);
                    element.style.display = 'none';
                }
            });
        });
    }

    constructor(config) {
        try {
            console.log('GateFlo constructor started with config:', config);
            
            if (!config || !config.merchant) {
                throw new Error('Invalid config: merchant details are required');
            }

            // Initialize with merchant details
            this.merchant = config.merchant;
            
            // Initialize price manager
            console.log('Initializing PriceManager...');
            this.priceManager = new PriceManager();
            
            // Initialize handlers
            console.log('Initializing payment handlers...');
            this.handlers = {
                NIM: new NimHandler(config.merchant.addresses.nim),
                BTC: new BtcHandler(config.merchant.addresses.btc),
                USDC: new PolygonHandler(config.merchant.addresses.usdc, 'USDC'),
                USDT: new PolygonHandler(config.merchant.addresses.usdt, 'USDT')
            };

            // Store container reference
            this.container = config.container;
            console.log('GateFlo constructor completed successfully');
        } catch (error) {
            console.error('Error in GateFlo constructor:', error);
            throw error;
        }
    }

    async showPayment(options) {
        console.log('GateFlo: showPayment called with options:', options);
        
        if (!options.amount) {
            console.error('GateFlo: Payment amount is required');
            throw new Error('Payment amount is required');
        }

        try {
            console.log('GateFlo: Attempting to fetch prices...');
            // Get real-time prices
            const prices = await this.priceManager.getAllPrices();
            console.log('GateFlo: Received prices:', prices);
            
            if (!prices) {
                console.error('GateFlo: Failed to fetch currency prices');
                throw new Error('Failed to fetch currency prices');
            }

            console.log('GateFlo: Creating modal...');

            // Calculate amounts using real-time prices
            const amounts = {};
            
            // Calculate NIM amount (1 USD = ~956 NIM at 0.0010456 USD/NIM)
            if (prices.NIM) {
                // Convert USD to NIM: USD amount / (NIM price in USD)
                // Round to nearest whole number since NIM doesn't use decimals
                amounts.NIM = Math.round(options.amount / 0.0010456);
                // Log for debugging
                console.log('NIM calculation:', {
                    usdAmount: options.amount,
                    nimPrice: prices.NIM.price,
                    nimAmount: amounts.NIM,
                    expectedAmount: Math.round(options.amount / 0.0010464)
                });
            } else {
                amounts.NIM = null;
            }
            
            // Calculate BTC amount
            amounts.BTC = prices.BTC ? options.amount / prices.BTC.price : null;
            
            // Stablecoins are 1:1
            amounts.USDC = options.amount;
            amounts.USDT = options.amount;

            // Filter out any currencies with failed price fetches
            const availableCurrencies = Object.entries(amounts)
                .filter(([_, amount]) => amount !== null)
                .reduce((acc, [currency, amount]) => {
                    acc[currency] = amount;
                    return acc;
                }, {});

            if (Object.keys(availableCurrencies).length === 0) {
                throw new Error('No currency prices available');
            }
            
            // Create modal container
            const modal = document.createElement('div');
            modal.className = 'gateflo-modal';
            console.log('GateFlo: Modal element created:', modal);
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;

            // Create payment UI
            const paymentUI = document.createElement('div');
            paymentUI.className = 'gateflo-container';
            console.log('GateFlo: Payment UI element created:', paymentUI);
            paymentUI.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 600px;
                width: 100%;
            `;

            // Add merchant info
            paymentUI.innerHTML = `
                <h2 style="margin: 0 0 20px;">${this.merchant.name}</h2>
                <div class="gateflo-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    ${Object.entries(amounts).map(([currency, amount]) => `
                        <button class="gateflo-option" data-currency="${currency}" style="
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 16px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            background: white;
                            cursor: pointer;
                        ">
                            ${currency === 'BTC' ? `
                                <svg class="currency-icon" style="width: 48px; height: 48px;" viewBox="0 0 4091.27 4091.73">
                                    <g>
                                        <path fill="#F7931A" fill-rule="nonzero" d="M4030.06 2540.77c-273.24,1096.01 -1383.32,1763.02 -2479.46,1489.71 -1095.68,-273.24 -1762.69,-1383.39 -1489.33,-2479.31 273.12,-1096.13 1383.2,-1763.19 2479,-1489.95 1096.06,273.24 1763.03,1383.51 1489.76,2479.57l0.02 -0.02z"/>
                                        <path fill="white" fill-rule="nonzero" d="M2947.77 1754.38c40.72,-272.26 -166.56,-418.61 -450,-516.24l91.95 -368.8 -224.5 -55.94 -89.51 359.09c-59.02,-14.72 -119.63,-28.59 -179.87,-42.34l90.16 -361.46 -224.36 -55.94 -92 368.68c-48.84,-11.12 -96.81,-22.11 -143.35,-33.69l0.26 -1.16 -309.59 -77.31 -59.72 239.78c0,0 166.56,38.18 163.05,40.53 90.91,22.69 107.35,82.87 104.62,130.57l-104.74 420.15c6.26,1.59 14.38,3.89 23.34,7.49 -7.49,-1.86 -15.46,-3.89 -23.73,-5.87l-146.81 588.57c-11.11,27.62 -39.31,69.07 -102.87,53.33 2.25,3.26 -163.17,-40.72 -163.17,-40.72l-111.46 256.98 292.15 72.83c54.35,13.63 107.61,27.89 160.06,41.3l-92.9 373.03 224.24 55.94 92 -369.07c61.26,16.63 120.71,31.97 178.91,46.43l-91.69 367.33 224.51 55.94 92.89 -372.33c382.82,72.45 670.67,43.24 791.83,-303.02 97.63,-278.78 -4.86,-439.58 -206.26,-544.44 146.69,-33.83 257.18,-130.31 286.64,-329.61l-0.07 -0.05zm-512.93 719.26c-69.38,278.78 -538.76,128.08 -690.94,90.29l123.28 -494.2c152.17,37.99 640.17,113.17 567.67,403.91zm69.43 -723.3c-63.29,253.58 -453.96,124.75 -580.69,93.16l111.77 -448.21c126.73,31.59 534.85,90.55 468.94,355.05l-0.02 0z"/>
                                    </g>
                                </svg>
                            ` : currency === 'USDT' ? `
                                <svg class="currency-icon" style="width: 48px; height: 48px;" viewBox="0 0 339.43 295.27">
                                    <path d="M62.15,1.45l-61.89,130a2.52,2.52,0,0,0,.54,2.94L167.95,294.56a2.55,2.55,0,0,0,3.53,0L338.63,134.4a2.52,2.52,0,0,0,.54-2.94l-61.89-130A2.5,2.5,0,0,0,275,0H64.45a2.5,2.5,0,0,0-2.3,1.45h0Z" style="fill:#50af95;fill-rule:evenodd"/>
                                    <path d="M191.19,144.8v0c-1.2.09-7.4,0.46-21.23,0.46-11,0-18.81-.33-21.55-0.46v0c-42.51-1.87-74.24-9.27-74.24-18.13s31.73-16.25,74.24-18.15v28.91c2.78,0.2,10.74.67,21.74,0.67,13.2,0,19.81-.55,21-0.66v-28.9c42.42,1.89,74.08,9.29,74.08,18.13s-31.65,16.24-74.08,18.12h0Zm0-39.25V79.68h59.2V40.23H89.21V79.68H148.4v25.86c-48.11,2.21-84.29,11.74-84.29,23.16s36.18,20.94,84.29,23.16v82.9h42.78V151.83c48-2.21,84.12-11.73,84.12-23.14s-36.09-20.93-84.12-23.15h0Zm0,0h0Z" style="fill:#fff;fill-rule:evenodd"/>
                                </svg>
                            ` : currency === 'USDC' ? `
                                <svg class="currency-icon" style="width: 48px; height: 48px;" viewBox="0 0 2000 2000">
                                    <path d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z" fill="#2775ca"/>
                                    <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff"/>
                                    <path d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z" fill="#fff"/>
                                </svg>
                            ` : `
                                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <radialGradient id="nimiqGradient" cx="34.5" cy="38.5" r="44.6" gradientUnits="userSpaceOnUse">
                                            <stop offset="0" stop-color="#ec991c"/>
                                            <stop offset="1" stop-color="#e9b213"/>
                                        </radialGradient>
                                    </defs>
                                    <path d="M47.5,19L37.5,2c-0.75-1.2-2.1-1.95-3.52-1.95H14.02c-1.42,0-2.77,0.75-3.45,1.95L0.57,19c-0.75,1.2-0.75,2.7,0,3.97L10.57,40c0.75,1.2,2.02,1.95,3.45,1.95h20c1.42,0,2.77-0.75,3.52-1.95l9.97-17.1c0.67-1.2,0.67-2.7,0-3.9Z" fill="url(#nimiqGradient)"/>
                                </svg>
                            `}
                            <strong style="margin: 8px 0;">${currency}</strong>
                            <span>${this.formatAmount(amount, currency)}</span>
                        </button>
                    `).join('')}
                </div>
            `;

            modal.appendChild(paymentUI);
            document.body.appendChild(modal);
            console.log('GateFlo: Modal added to document body');

            // Handle currency selection
            const buttons = paymentUI.querySelectorAll('.gateflo-option');
            buttons.forEach(button => {
                button.addEventListener('click', async () => {
                    const currency = button.dataset.currency;
                    const amount = amounts[currency];
                    const handler = this.handlers[currency];

                    // Show payment details
                    const details = handler.getPaymentDetails(amount);
                    
                    if (currency === 'NIM') {
                        // Initialize and trigger Nimiq Hub payment immediately
                        try {
                            await handler.initialize();
                            const payment = await handler.createPayment(amount);
                            if (payment.success) {
                                paymentUI.innerHTML = `
                                    <h3>Payment Sent!</h3>
                                    <p>Transaction ID: ${payment.transactionHash}</p>
                                `;
                            } else {
                                paymentUI.innerHTML = `
                                    <h3>Payment Failed</h3>
                                    <p>${payment.error}</p>
                                `;
                            }
                        } catch (error) {
                            paymentUI.innerHTML = `
                                <h3>Payment Failed</h3>
                                <p>${error.message}</p>
                            `;
                        }
                    } else {
                        // Show QR code for other currencies
                        const payment = await handler.createPayment(amount);
                        if (payment.success) {
                            paymentUI.innerHTML = `
                                <h3>${details.currency} Payment</h3>
                                <p>Amount: ${this.formatAmount(amount, currency)}</p>
                                <div style="text-align: center; margin: 20px 0;">
                                    <img src="${payment.qrCode}" alt="Payment QR Code" style="max-width: 200px;">
                                </div>
                                <p style="
                                    word-break: break-all;
                                    background: #f5f5f5;
                                    padding: 12px;
                                    border-radius: 4px;
                                    font-family: monospace;
                                ">${payment.address}</p>
                                <p style="color: #666;">${details.instructions}</p>
                            `;
                        } else {
                            paymentUI.innerHTML = `
                                <h3>Payment Failed</h3>
                                <p>${payment.error}</p>
                            `;
                        }
                    }
                });
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            return modal;
        } catch (error) {
            console.error('Error in showPayment:', error);
            this.container.innerHTML = `
                <div class="gateflo-error">
                    Failed to initialize payment interface: ${error.message}
                </div>
            `;
            throw error;
        }
    }

    formatAmount(amount, currency) {
        switch (currency) {
            case 'BTC':
                return amount.toFixed(8) + ' BTC';
            case 'NIM':
                return Math.round(amount) + ' NIM';
            case 'USDC':
            case 'USDT':
                return amount.toFixed(2) + ' ' + currency;
            default:
                return amount.toString();
        }
    }
}

export default GateFlo;
