class NimHandler {
    constructor(address, hubEndpoint = 'https://hub.nimiq.com') {
        this.address = address;
        this.hubEndpoint = hubEndpoint;
        this.appName = 'GateFlo';
        this.client = null;
    }

    async initialize() {
        if (typeof HubApi === 'undefined') {
            throw new Error('Hub API not loaded');
        }

        try {
            this.client = new HubApi(this.hubEndpoint);
            console.log('NimHandler: Hub client initialized');
            return this.client;
        } catch (error) {
            throw new Error(`Hub initialization failed: ${error.message}`);
        }
    }

    async createPayment(amount) {
        try {
            // Ensure client is initialized
            if (!this.client) {
                await this.initialize();
            }

            // Convert amount to Luna (smallest NIM unit, 100000 Luna = 1 NIM)
            const value = Math.floor(amount * 100000);
            
            // Prepare checkout request
            const request = {
                appName: this.appName,
                recipient: this.address,
                value: value,
                returnURL: window.location.href
            };

            // Open Hub checkout
            const result = await this.client.checkout(request);
            
            if (!result || !result.hash) {
                throw new Error('Invalid checkout response from Hub');
            }

            return {
                success: true,
                transactionHash: result.hash,
                amount: amount,
                currency: 'NIM'
            };
        } catch (error) {
            console.error('NIM payment failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to create Nimiq payment'
            };
        }
    }

    getPaymentDetails(amount) {
        return {
            currency: 'NIM',
            amount: amount,
            address: this.address,
            network: 'Nimiq',
            paymentMethod: 'Nimiq Hub'
        };
    }
}

export default NimHandler;
