import PriceSource from './PriceSource.js';

class KuCoinSource extends PriceSource {
    constructor() {
        super('KuCoin');
        this.baseUrl = 'https://api.kucoin.com';
        this.currencyMap = {
            'BTC': 'BTC-USDT',
            'NIM': 'NIM-USDT'
        };
    }

    async fetchPrice(currency) {
        // Return 1:1 for stablecoins
        if (currency === 'USDC' || currency === 'USDT') {
            return {
                price: 1.0,
                timestamp: Date.now(),
                source: this.name
            };
        }

        const symbol = this.currencyMap[currency];
        if (!symbol) {
            throw new Error(`Unsupported currency: ${currency}`);
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/api/v1/market/orderbook/level1?symbol=${symbol}`,
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.data || !data.data.price) {
                throw new Error(`Invalid response format for ${currency}`);
            }

            const price = parseFloat(data.data.price);
            console.log(`KuCoin raw price for ${currency}:`, {
                rawPrice: data.data.price,
                parsedPrice: price,
                symbol: symbol
            });
            const priceData = {
                price: price,
                timestamp: Date.now(),
                source: this.name
            };

            // Update cache
            this.updateCache(currency, priceData);

            return priceData;
        } catch (error) {
            console.error(`KuCoin price fetch failed for ${currency}:`, error);
            
            // Return cached price if available
            const cachedPrice = this.cache.get(currency);
            if (cachedPrice) {
                console.log(`Using cached price for ${currency}`);
                return cachedPrice;
            }
            
            throw error;
        }
    }

    // Initialize polling for price updates
    async initializePolling() {
        // Poll every minute for price updates
        const pollInterval = setInterval(async () => {
            for (const currency of Object.keys(this.currencyMap)) {
                if (currency === 'USDC' || currency === 'USDT') continue; // Skip stablecoins
                try {
                    const priceData = await this.fetchPrice(currency);
                    this.updateCache(currency, priceData);
                } catch (error) {
                    console.error(`Polling update failed for ${currency}:`, error);
                }
            }
        }, 60000); // 1 minute interval

        // Return cleanup function
        return () => clearInterval(pollInterval);
    }
}

export default KuCoinSource;
