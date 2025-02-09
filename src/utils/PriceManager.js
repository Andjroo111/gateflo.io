import CoinGeckoSource from './CoinGeckoSource.js';
import KuCoinSource from './KuCoinSource.js';

class PriceManager {
    constructor() {
        // Initialize price sources in order of preference
        this.sources = [
            new CoinGeckoSource(),
            new KuCoinSource()
        ];

        // Keep track of failed attempts per source
        this.sourceFailures = new Map();
        this.failureThreshold = 3; // Switch source after 3 failures
        
        this.supportedCurrencies = ['BTC', 'NIM', 'USDC', 'USDT'];
        this.priceSubscribers = new Set();
        this.initialize();
    }

    async initialize() {
        console.log('PriceManager: Starting initialization...');
        console.log('PriceManager: Available sources:', this.sources.map(s => s.name));
        
        // Initialize polling for each source
        for (const source of this.sources) {
            try {
                console.log(`PriceManager: Initializing ${source.name}...`);
                if (source instanceof KuCoinSource) {
                    await source.initializePolling();
                    console.log(`PriceManager: ${source.name} polling initialized`);
                } else {
                    // CoinGecko uses polling by default
                    console.log(`PriceManager: Testing ${source.name} connection with BTC price fetch`);
                    const price = await source.fetchPrice('BTC'); // Initial fetch to validate connection
                    console.log(`PriceManager: ${source.name} test fetch successful:`, price);
                }
            } catch (error) {
                console.error(`PriceManager: Failed to initialize ${source.name}:`, error);
            }
        }
        console.log('PriceManager: Initialization complete');
    }

    async getPrice(currency) {
        console.log(`PriceManager: Getting price for ${currency}...`);
        if (!this.supportedCurrencies.includes(currency)) {
            console.error(`PriceManager: Unsupported currency: ${currency}`);
            throw new Error(`Unsupported currency: ${currency}`);
        }

        // For stablecoins, return 1:1 immediately
        if (currency === 'USDC' || currency === 'USDT') {
            console.log(`PriceManager: Using 1:1 price for stablecoin ${currency}`);
            return {
                price: 1.0,
                timestamp: Date.now(),
                source: 'default'
            };
        }

        let lastError = null;
        let lastValidPrice = null;

        // Try each source in order until we get a valid price
        for (const source of this.sources) {
            // Skip source if it has failed too many times
            const failures = this.sourceFailures.get(source.name) || 0;
            if (failures >= this.failureThreshold) {
                console.warn(`Skipping ${source.name} due to too many failures`);
                continue;
            }

            try {
                const priceData = await source.getPrice(currency);
                console.log(`Price data from ${source.name} for ${currency}:`, {
                    price: priceData.price,
                    timestamp: priceData.timestamp,
                    source: priceData.source,
                    expectedNimAmount: currency === 'NIM' ? Math.round(1.00 / priceData.price) : null
                });
                
                // Validate price against previous if available
                if (lastValidPrice && !this.validatePrice(currency, priceData.price, lastValidPrice.price)) {
                    throw new Error('Price validation failed');
                }

                // Reset failure count on success
                this.sourceFailures.set(source.name, 0);
                
                // Cache the valid price
                lastValidPrice = priceData;
                
                this.notifySubscribers(currency, priceData);
                return {
                    price: priceData.price,
                    timestamp: priceData.timestamp,
                    source: priceData.source
                };
            } catch (error) {
                console.error(`Price fetch failed from ${source.name}:`, error);
                
                // Increment failure count
                const currentFailures = this.sourceFailures.get(source.name) || 0;
                this.sourceFailures.set(source.name, currentFailures + 1);
                
                lastError = error;

                // Try to get cached price from this source
                const cachedPrice = source.cache.get(currency);
                if (cachedPrice && this.getPriceAge(currency) < 5 * 60 * 1000) { // Use cache if less than 5 minutes old
                    console.log(`Using cached price for ${currency} from ${source.name}`);
                    return cachedPrice;
                }
                
                continue;
            }
        }

        // If we have a cached price from any source, use it as last resort
        for (const source of this.sources) {
            const cachedPrice = source.cache.get(currency);
            if (cachedPrice) {
                console.warn(`Using outdated cache for ${currency} from ${source.name}`);
                return cachedPrice;
            }
        }

        // If all sources failed and no cache available, throw the last error
        throw new Error(`Failed to fetch price for ${currency} from all sources: ${lastError.message}`);
    }

    // Get prices for all supported currencies
    async getAllPrices() {
        console.log('Fetching all prices...');
        const prices = {};
        for (const currency of this.supportedCurrencies) {
            console.log(`Fetching price for ${currency}...`);
            try {
                const priceData = await this.getPrice(currency);
                console.log(`Price for ${currency}:`, priceData);
                prices[currency] = {
                    price: priceData.price,
                    timestamp: priceData.timestamp,
                    source: priceData.source
                };
            } catch (error) {
                console.error(`Failed to fetch price for ${currency}:`, error);
                console.error(`Failed to fetch price for ${currency}:`, error);
                // Set a default price for stablecoins
                if (currency === 'USDC' || currency === 'USDT') {
                    prices[currency] = {
                        price: 1.0,
                        timestamp: Date.now(),
                        source: 'default'
                    };
                    console.log(`Using default price for ${currency}:`, prices[currency]);
                } else {
                    prices[currency] = null;
                    console.log(`No price available for ${currency}`);
                }
            }
        }
        return prices;
    }

    // Subscribe to price updates
    subscribe(callback) {
        this.priceSubscribers.add(callback);
        return () => this.priceSubscribers.delete(callback); // Return unsubscribe function
    }

    // Notify subscribers of price updates
    notifySubscribers(currency, priceData) {
        for (const subscriber of this.priceSubscribers) {
            try {
                subscriber(currency, priceData);
            } catch (error) {
                console.error('Error in price update subscriber:', error);
            }
        }
    }

    // Validate price is within acceptable range (prevent extreme outliers)
    validatePrice(currency, price, previousPrice) {
        if (!previousPrice) return true;
        
        const maxChange = 0.15; // 15% maximum change threshold
        const priceChange = Math.abs(price - previousPrice) / previousPrice;
        
        if (priceChange > maxChange) {
            console.warn(`Suspicious price change detected for ${currency}: ${priceChange * 100}%`);
            return false;
        }
        
        return true;
    }

    // Get the age of the most recent price
    getPriceAge(currency) {
        let mostRecentTimestamp = 0;
        
        for (const source of this.sources) {
            const cachedPrice = source.cache.get(currency);
            if (cachedPrice && cachedPrice.timestamp > mostRecentTimestamp) {
                mostRecentTimestamp = cachedPrice.timestamp;
            }
        }
        
        return mostRecentTimestamp ? Date.now() - mostRecentTimestamp : Infinity;
    }

    // Check if a price needs updating
    needsUpdate(currency) {
        const MAX_AGE = 5 * 60 * 1000; // 5 minutes
        return this.getPriceAge(currency) > MAX_AGE;
    }
}

export default PriceManager;
