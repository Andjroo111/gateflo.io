// Base class for price sources
class PriceSource {
    constructor(name) {
        this.name = name;
        this.lastUpdate = null;
        this.cache = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    async getPrice(currency) {
        if (this.isCacheValid(currency)) {
            return this.cache.get(currency);
        }
        const price = await this.fetchPrice(currency);
        this.updateCache(currency, price);
        return price;
    }

    isCacheValid(currency) {
        if (!this.cache.has(currency) || !this.lastUpdate) return false;
        const elapsed = Date.now() - this.lastUpdate;
        return elapsed < this.CACHE_DURATION;
    }

    updateCache(currency, price) {
        this.cache.set(currency, price);
        this.lastUpdate = Date.now();
    }

    // To be implemented by specific sources
    async fetchPrice(currency) {
        throw new Error('fetchPrice must be implemented by price sources');
    }
}

export default PriceSource;
