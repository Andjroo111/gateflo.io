class BtcHandler {
    constructor(address) {
        this.address = address;
        this.validateAddress(address);
    }

    validateAddress(address) {
        // Basic BTC address validation
        const regex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
        if (!regex.test(address)) {
            throw new Error('Invalid Bitcoin address format');
        }
    }

    async createPayment(amount, options = {}) {
        try {
            // Generate payment URI (BIP21)
            const paymentUri = this.generatePaymentUri(amount, options);
            
            // Generate QR code data
            const qrData = await this.generateQrCode(paymentUri);

            return {
                success: true,
                paymentUri,
                qrCode: qrData,
                address: this.address,
                amount,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('BTC payment creation failed:', error);
            return {
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    generatePaymentUri(amount, options = {}) {
        const params = new URLSearchParams();
        if (amount) {
            params.append('amount', amount.toFixed(8));
        }
        if (options.label) {
            params.append('label', options.label);
        }
        if (options.message) {
            params.append('message', options.message);
        }

        const queryString = params.toString();
        return `bitcoin:${this.address}${queryString ? '?' + queryString : ''}`;
    }

    async generateQrCode(data) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Checking QRCode availability:', typeof window.QRCode);
                if (typeof window.QRCode === 'undefined') {
                    throw new Error('QRCode library is required');
                }

                // Create a temporary container
                const container = document.createElement('div');
                console.log('Container created:', container);
                
                try {
                    // Create QR code
                    console.log('Creating QR code with data:', data);
                    const qr = new window.QRCode(container, {
                        text: data,
                        width: 300,
                        height: 300,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: window.QRCode.CorrectLevel.H
                    });
                    console.log('QR code created:', qr);

                    // QRCode library adds an img element to the container
                    const img = container.querySelector('img');
                    console.log('Found img element:', img);
                    
                    if (!img) {
                        throw new Error('Failed to generate QR code image');
                    }

                    // Wait for the image to load
                    img.onload = () => {
                        console.log('Image loaded successfully');
                        resolve(img.src);
                    };

                    img.onerror = (e) => {
                        console.error('Image load error:', e);
                        reject(new Error('Failed to load QR code image'));
                    };
                } catch (qrError) {
                    console.error('QR code creation error:', qrError);
                    throw qrError;
                }
            } catch (error) {
                console.error('QR code generation failed:', error);
                console.error('Error stack:', error.stack);
                reject(new Error(`Failed to generate QR code: ${error.message}`));
            }
        });
    }

    async checkPaymentStatus(txid) {
        try {
            // Use BlockCypher API to check transaction status
            const response = await fetch(
                `https://api.blockcypher.com/v1/btc/main/txs/${txid}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                status: data.confirmations > 0 ? 'confirmed' : 'pending',
                confirmations: data.confirmations,
                timestamp: Date.now(),
                transactionUrl: `https://blockstream.info/tx/${txid}`
            };
        } catch (error) {
            console.error('BTC payment status check failed:', error);
            return {
                status: 'error',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    getPaymentDetails(amount) {
        return {
            currency: 'BTC',
            amount: amount,
            address: this.address,
            paymentMethod: 'Bitcoin',
            instructions: 'Send exactly the specified amount to the Bitcoin address shown below or scan the QR code with your wallet'
        };
    }

    // Monitor address for incoming transactions
    async monitorAddress(callback) {
        let lastChecked = Date.now();
        
        // Poll for new transactions every 30 seconds
        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `https://api.blockcypher.com/v1/btc/main/addrs/${this.address}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Check for new transactions
                const newTxs = data.txrefs?.filter(tx => 
                    tx.confirmed > lastChecked / 1000
                ) || [];

                for (const tx of newTxs) {
                    callback({
                        txid: tx.tx_hash,
                        amount: tx.value / 1e8, // Convert satoshis to BTC
                        confirmations: tx.confirmations,
                        timestamp: tx.confirmed
                    });
                }

                lastChecked = Date.now();
            } catch (error) {
                console.error('BTC address monitoring failed:', error);
            }
        }, 30000);

        // Return cleanup function
        return () => clearInterval(interval);
    }
}

export default BtcHandler;
