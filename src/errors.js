export class GateFloError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'GateFloError';
        this.code = code;
    }
}

export class ValidationError extends GateFloError {
    constructor(message) {
        super(message, 'VALIDATION_ERROR');
    }
}

export class NetworkError extends GateFloError {
    constructor(message) {
        super(message, 'NETWORK_ERROR');
    }
}

export class InitializationError extends GateFloError {
    constructor(message) {
        super(message, 'INITIALIZATION_ERROR');
    }
}
