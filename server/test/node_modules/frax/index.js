
var events = require('events');
var util = require('util');


function Frax(fhLen) {
    switch (fhLen) {
        case 1: case 4:
            this._fhLen = fhLen;
            break;
        default:
            this._fhLen = 2;
    }

    // Define getter 'headerSize'
    this.__defineGetter__("headerSize", function() {
        return this._fhLen;
    });

    // Reset internal state.
    this.reset();
}

util.inherits(Frax, events.EventEmitter);

Frax.prototype.reset = function reset() {
    this._iBufs = [];
    this._iBufLen = 0; // total buffer (content) size
    this._iOffs = 0;   // offset for the first input buffer
    this._oBuf = null; // output buffer
    this._oOffs = 0;   // offset for the output buffer
};

Frax.prototype.input = function input(buf) {
    if (!Buffer.isBuffer(buf)) {
        throw new Error('Incompatible input data type');
    }
    if (buf.length === 0) {
        return;
    }
    this._iBufs.push(buf);
    this._iBufLen += buf.length;
    this._extract();
};

/** @deprecated */
Frax.prototype.frameHeaderSize = function frameHeaderSize() {
    return this._fhLen;
};

/** @private */
Frax.prototype._extract = function _extract() {
    var i, len, len2;
    while (true) {
        if (!this._oBuf) {
            // Check if we have a full size header.
            if (this._iBufLen < this._fhLen) {
                return; // nothing to do.
            }
            
            len = 0;
            for (i = 0; i < this._fhLen; ++i) {
                len += (this._iBufs[0][this._iOffs] * Math.pow(0x100, this._fhLen - i - 1));
                this._iOffs++;
                this._iBufLen--;
                if (this._iBufs[0].length === this._iOffs) {
                    this._iBufs.shift();
                    this._iOffs = 0;
                }
            }

            this._oBuf = new Buffer(len);
            this._oOffs = 0;
        }

        while (this._oOffs < this._oBuf.length) {
            if (this._iBufs.length === 0) {
                return;
            }
            len = this._oBuf.length - this._oOffs;
            len2 = this._iBufs[0].length - this._iOffs;
            if (len >= len2) {
                len = len2;
            }
            this._iBufs[0].copy(this._oBuf, this._oOffs, this._iOffs, this._iOffs + len);
            this._iOffs += len;
            this._oOffs += len;
            this._iBufLen -= len;

            if (this._iOffs === this._iBufs[0].length) {
                this._iOffs = 0;
                this._iBufs.shift();
            }
        }

        this.emit('data', this._oBuf);
        this._oBuf = null;
    }
};

exports.create = function create(fhLen) {
    return new Frax(fhLen);
};
