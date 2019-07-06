let WebSocket = require('./ws');

const {
    TvOfflineError,
    PairFailedError
} = require('../errors');

module.exports = class WebSocketSecure extends WebSocket {
    constructor(device) {
        super(device);

        this.port   = device.config.port || 8002;
        this.remote = `wss://${this.ip}:${this.port}/api/v2/channels/samsung.remote.control?name=${this._encodeName()}`;
    }

    async pair() {
        console.log('Check pairing, token:', this._getToken());

        if (this._getToken()) {
            return Promise.resolve();
        }

        this._closeSocket();

        console.log('Try pairing', this.device.uuid);

        try {
            await this._delay(1000);

            if (!await this.isActive()) {
                throw new TvOfflineError();
            }

            await super._openSocket();
        } catch(error) {
            this.device.debug(error.message);

            throw new PairFailedError();
        }
    }

    _getToken() {
        return this.token || this.device.storage.token;
    }

    _openSocket() {
        return super._openSocket(`${this.remote}&token=${this._getToken()}`);
    }
}