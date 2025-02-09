import PriceSource from './PriceSource.js';

class CoinGeckoSource extends PriceSource {
    constructor() {
        super('CoinGecko');
        this.baseUrl = 'https://api.coingecko.com/api/v3';
        this.currencyMap = {
            'BTC': 'bitcoin',
            'NIM': 'nimiq',
            'USDC': 'usd-coin',
            'USDT': 'tether'
        };
    }

    async fetchPrice(currency) {
        // Return 1:1 for stablecoins to avoid unnecessary API calls
        if (currency === 'USDC' || currency === 'USDT') {
            return {
                price: 1.0,
                timestamp: Date.now(),
                source: this.name
            };
        }

        const coinId = this.currencyMap[currency];
        if (!coinId) {
            throw new Error(`Unsupported currency: ${currency}`);
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`,
                {
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data[coinId] || !data[coinId].usd) {
                throw new Error(`Invalid response format for ${currency}`);
            }

            return {
                price: data[coinId].usd,
                timestamp: Date.now(),
                source: this.name
            };
        } catch (error) {
            console.error(`CoinGecko price fetch failed for ${currency}:`, error);
            
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

export default CoinGeckoSource;
