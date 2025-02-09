class PolygonHandler {
    constructor(address, currency, rpcUrl = 'https://polygon-rpc.com') {
        if (!window.Web3) {
            throw new Error('Web3 is required');
        }

        this.address = address;
        this.currency = currency;
        
        // Initialize Web3 with the RPC URL
        try {
            this.web3 = new window.Web3(new window.Web3.providers.HttpProvider(rpcUrl));
        } catch (error) {
            console.error('Failed to initialize Web3:', error);
            throw new Error('Failed to initialize Web3 provider');
        }
        
        this.validateAddress(address);
        
        // Get token contract
        const contractAddress = TOKEN_CONTRACTS[currency];
        if (!contractAddress) {
            throw new Error(`Unsupported currency: ${currency}`);
        }
        
        try {
            this.contract = new this.web3.eth.Contract(ERC20_ABI, contractAddress);
        } catch (error) {
            console.error('Failed to initialize contract:', error);
            throw new Error('Failed to initialize token contract');
        }
        
        this.decimals = null; // Will be fetched on first use
    }

    validateAddress(address) {
        try {
            if (!this.web3.utils.isAddress(address)) {
                throw new Error('Invalid Polygon address format');
            }
        } catch (error) {
            console.error('Address validation failed:', error);
            throw new Error('Invalid Polygon address format');
        }
    }

    async getDecimals() {
        if (this.decimals === null) {
            try {
                this.decimals = await this.contract.methods.decimals().call();
            } catch (error) {
                console.error('Failed to get decimals:', error);
                throw new Error('Failed to get token decimals');
            }
        }
        return this.decimals;
    }

    async createPayment(amount, options = {}) {
        let amountInSmallestUnit;
        
        try {
            const decimals = await this.getDecimals();
            console.log('Token decimals:', decimals);
            
            // Validate amount
            if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || amount > 1000000) {
                throw new Error(`Invalid amount: ${amount}. Amount must be between 0 and 1,000,000 USD`);
            }
            console.log('Input amount:', amount);

            // Convert to string with 2 decimal places (like in GateFlo.formatAmount)
            const amountStr = amount.toFixed(2);
            console.log('Amount string:', amountStr);

            // Remove decimal point and pad with remaining zeros for 6 decimals
            const [whole, fraction = '00'] = amountStr.split('.');
            const paddedAmount = whole + fraction.padEnd(6, '0');
            console.log('Padded amount:', paddedAmount);

            // Convert to smallest unit without using BN
            amountInSmallestUnit = paddedAmount;
            console.log('Final amount in smallest unit:', amountInSmallestUnit);
            
            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            // Generate payment data for QR code
            const paymentData = {
                address: this.address,
                amount: amountInSmallestUnit,
                currency: this.currency,
                network: 'Polygon'
            };
            console.log('Payment data:', paymentData);

            // Generate QR code with payment data
            const paymentDataString = JSON.stringify(paymentData);
            console.log('Payment data string:', paymentDataString);
            
            // Generate QR code with payment data
            console.log('Starting QR code generation');
            let qrData;
            try {
                qrData = await this.generateQrCode(paymentDataString);
                if (!qrData) {
                    throw new Error('QR code generation returned empty result');
                }
                console.log('QR code generated successfully');
            } catch (error) {
                console.error('QR code generation error:', error);
                throw new Error(`Failed to generate QR code: ${error.message}`);
            }

            return {
                success: true,
                address: this.address,
                amount: amount,
                amountInSmallestUnit: amountInSmallestUnit,
                currency: this.currency,
                network: 'Polygon',
                qrCode: qrData,
                timestamp: Date.now()
            };
        } catch (error) {
            const errorMessage = error.message || 'Unknown error occurred';
            console.error('Polygon payment creation failed:', errorMessage);
            return {
                success: false,
                error: errorMessage,
                details: error.stack,
                timestamp: Date.now()
            };
        }
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

    async checkPaymentStatus(txHash) {
        try {
            const receipt = await this.web3.eth.getTransactionReceipt(txHash);
            
            if (!receipt) {
                return {
                    status: 'pending',
                    confirmations: 0,
                    timestamp: Date.now()
                };
            }

            const currentBlock = await this.web3.eth.getBlockNumber();
            const confirmations = currentBlock - receipt.blockNumber;

            return {
                status: receipt.status ? 'confirmed' : 'failed',
                confirmations: confirmations,
                timestamp: Date.now(),
                transactionUrl: `https://polygonscan.com/tx/${txHash}`
            };
        } catch (error) {
            console.error('Polygon payment status check failed:', error);
            return {
                status: 'error',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    getPaymentDetails(amount) {
        return {
            currency: this.currency,
            amount: amount,
            address: this.address,
            network: 'Polygon',
            paymentMethod: `${this.currency} on Polygon`,
            instructions: `Send exactly ${amount} ${this.currency} to the address below using your Polygon wallet`
        };
    }

    // Monitor address for incoming transactions
    async monitorAddress(callback, expectedAmount) {
        let lastChecked = Date.now();
        
        // Convert expected amount to string with 2 decimal places
        const amountStr = expectedAmount.toFixed(2);
        const [whole, fraction = '00'] = amountStr.split('.');
        const expectedAmountInSmallestUnit = whole + fraction.padEnd(6, '0');

        // Create event filter
        const filter = {
            fromBlock: 'latest',
            address: TOKEN_CONTRACTS[this.currency],
            topics: [
                this.web3.utils.sha3('Transfer(address,address,uint256)'),
                null,
                this.web3.utils.padLeft(this.address.toLowerCase(), 64)
            ]
        };

        // Subscribe to Transfer events
        const subscription = this.web3.eth.subscribe('logs', filter, (error, event) => {
            if (error) {
                console.error('Event subscription error:', error);
                return;
            }

            try {
                // Decode transfer event
                const decodedData = this.web3.eth.abi.decodeParameters(
                    ['uint256'],
                    event.data
                );
                const receivedAmount = decodedData[0];

                // Check if amount matches expected amount
                if (receivedAmount === expectedAmountInSmallestUnit) {
                    callback({
                        txHash: event.transactionHash,
                        amount: expectedAmount,
                        timestamp: Date.now(),
                        status: 'received'
                    });
                }
            } catch (error) {
                console.error('Error processing transfer event:', error);
            }
        });

        // Return cleanup function
        return () => subscription.unsubscribe();
    }
}

// ERC20 ABI for token interactions
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
];

// Token contract addresses on Polygon
const TOKEN_CONTRACTS = {
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
};

export default PolygonHandler;
