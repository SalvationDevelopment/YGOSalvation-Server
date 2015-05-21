(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined' && object.buffer instanceof ArrayBuffer) {
    return fromTypedArray(that, object)
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = String(string)

  if (string.length === 0) return 0

  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      return string.length
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return string.length * 2
    case 'hex':
      return string.length >>> 1
    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(string).length
    case 'base64':
      return base64ToBytes(string).length
    default:
      return string.length
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function toString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":2,"ieee754":3,"is-array":4}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],8:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],9:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":8,"_process":7,"inherits":6}],10:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"base64-js":11,"dup":1,"ieee754":12,"is-array":13}],11:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],12:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],13:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],14:[function(require,module,exports){
(function (Buffer){
/*jslint node:true*/
module.exports = function makeCTOS(command, message) {
    'use strict';
    //https://github.com/Fluorohydride/ygopro/blob/25bdab4c6d0000f841aee80c11cbf2e95ee54047/gframe/network.h
    // [len, len, CTOS_PLAYER_INFO, U, S ,E, R, N, A, M, E]
    // [len, len] is two bytes... read backwards totaled. 
    //[0, 2] = 2 "", [ 3, 2] = 26 "8 * 8 + 2"
    var say = {};

    say.CTOS_LEAVE_GAME = function () {
        var ctos = new Buffer([0x13]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_PlayerInfo = function (message) {
        var ctos = new Buffer([0x10]),
            name = Array.apply(null, new Array(40)).map(Number.prototype.valueOf, 0),
            username = new Buffer(message, 'utf16le'),
            usernamef = new Buffer(name),
            x = username.copy(usernamef),
            len = usernamef.length + 1,
            proto = new Buffer(2);
        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, usernamef]);
        //console.log(proto);
        return proto;
    };
    say.CTOS_JoinGame = function (roompass) {
        var ctos = new Buffer([0x12]),
            name = Array.apply(null, new Array(60)).map(Number.prototype.valueOf, 0),
            version = new Buffer([0x32, 0x13]),
            gameid = new Buffer([75, 144, 0, 0, 0, 0]),
            pass = new Buffer(roompass, 'utf16le'),
            rpass = new Buffer(name),
            x = pass.copy(rpass),
            len = ctos.length + version.length + gameid.length + 60,
            proto = new Buffer(2);
        //unknownDataStructure = new Buffer([0,0,0,0,254,255,255,255,230,110,238,118]);
        proto.writeUInt16LE(len, 0);

        proto = Buffer.concat([proto, ctos, version, gameid, rpass]);
        //console.log(proto);
        //console.log(rpass.toString('utf16le'));
        return proto;

    };
    say.CTOS_UPDATE_DECK = function (message) {
        //total len (excluding this)
        //ctos
        //extradeck count
        //side count
        //deck cards
        //edtra cards
        //side cards

        // (toduelist)
        // this message
        // ready message
        var ctos = new Buffer([0x2]),
            emptydeck,
            deck = new Buffer(0),
            decklist = [].concat(message.main).concat(message.extra).concat(message.side),
            decksize = new Buffer(8),
            len,
            proto = new Buffer(2),
            readposition = 0,
            card,
            x,
            q;


        for (readposition; decklist.length > 1; readposition = readposition + 2) {
            card = new Buffer(4);
            card.writeUInt32LE(decklist[0], 0);
            //console.log(decklist[0], (JSON.stringify(card)));
            deck = Buffer.concat([deck, card]);
            decklist.shift();
        }

        decksize.writeUInt16LE((message.main.length + message.extra.length), 0);
        decksize.writeUInt16LE(message.side.length, 4);
        q = new Array(1024 - 8 - deck.length);
        emptydeck = Array.apply(null, q.map(Number.prototype.valueOf, 0));
        x = new Buffer(emptydeck);
        len = ctos.length + decksize.length + deck.length;
        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, decksize, deck]);


        //console.log(proto.length, len);
        //console.log(proto, JSON.stringify(proto));
        return proto;
    };

    say.CTOS_HS_READY = function () {
        var ctos = new Buffer([0x22]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_TODUELIST = function () {
        var ctos = new Buffer([0x20]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_NOTREADY = function () {
        var ctos = new Buffer([0x23]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_SURRENDER = function () {
        var ctos = new Buffer([0x14]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_START = function () {
        var ctos = new Buffer([0x25]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_HS_KICK = function (id) {
        var ctos = new Buffer([0x21]),
            csk = new Buffer(id),
            len = ctos.length + csk.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, csk]);
        return proto;
    };

    say.CTOS_HAND_RESULT = function (id) {
        var ctos = new Buffer([0x3]),
            cshr = new Buffer([id]),
            len = 2,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, cshr]);
        console.log('sending result', proto);
        return proto;
    };

    say.CTOS_TP_RESULT = function (id) {
        var ctos = new Buffer([0x04]),
            cstr = new Buffer([id]),
            len = ctos.length + cstr.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, cstr]);
        return proto;
    };

    say.CTOS_RESPONSE = function (response) {
        // response should already be a buffer.
        var ctos = new Buffer([0x01]),
            len = ctos.length + response.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, response]);
        return proto;
    };

    say.CTOS_HS_TOOBSERVER = function () {
        var ctos = new Buffer([0x25]),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos]);
        return proto;
    };

    say.CTOS_CHAT = function (message) {
        // be sure to add \0 at the end.
        var ctos = new Buffer([0x16]),
            chat = new Buffer(message, 'utf16le'),
            len = ctos.length,
            proto = new Buffer(2);

        proto.writeUInt16LE(len, 0);
        proto = Buffer.concat([proto, ctos, chat]);
        return proto;
    };

    return say[command](message);
};

}).call(this,require("buffer").Buffer)
},{"buffer":1}],15:[function(require,module,exports){
/*jslint bitwise: true*/

var enums = enums || require('../../libs/enums.js');
function makeCard(buffer, start, controller) {
    'use strict';
    if (buffer.length < 4) {
        return {
            card: {
                Code: 'nocard'
            },
            readposition: start
        };
    }
    var flag = buffer.readUInt32LE(start);

    if (!flag) {
        return {
            card: {
                Code: 'cover',
                Position: 'FaceDownAttack'
            },
            readposition: start + 9
        };
    }
    var card = {
        Code: 'cover',
        Position: 'FaceDownAttack'
    };

    //console.log('flag:', flag);
    var readposition = start + 4;

    if (flag & enums.query.Code) {
        card.Code = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Position) {
        card.Controller = buffer[readposition];
        card.Position = enums.Positions[buffer[readposition + 3]];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Alias) {
        card.Alias = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Type) {
        card.Type = enums.cardTypes[buffer.readUInt32LE(readposition)];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Level) {
        card.Level = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Rank) {
        card.Rank = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Attribute) {
        card.Attribute = enums.cardAttributes[buffer.readUInt32LE(readposition)];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Race) {
        card.Race = enums.race[buffer.readUInt32LE(readposition)];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Attack) {
        card.Attack = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Defense) {
        card.Defense = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.BaseAttack) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.BaseDefense) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Reason) {
        card.Attribute = buffer.readUInt16LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.ReasonCard) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.EquipCard) {
        card.EquipCard = {
            c: buffer[readposition],
            l: buffer[readposition + 1],
            s: buffer[readposition + 2]
        };
        readposition = readposition + 4;
    }
    if (flag & enums.query.TargetCard) {
        card.TargetCard = [];
        for (var i = 0; i < buffer.readUInt32LE(readposition); ++i) {
            card.TargetCard.push({
                c: buffer[readposition + 0],
                l: buffer[readposition + 1],
                s: buffer[readposition + 2]
            });
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.OverlayCard) {
        card.OverlayCard = [];
        for (var ii = 0; ii < buffer.readUInt32LE(readposition); ++ii) {
            card.OverlayCard.push(buffer.readUInt32LE(readposition));
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.Counters) {
        card.Counters = [];
        for (var iii = 0; iii < buffer.readUInt32LE(readposition); ++iii) {
            card.Counters.push({
                counterType: buffer.readUInt16LE(readposition),
                amount: buffer.readUInt16LE(readposition + 2)
            });
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.Owner) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.IsDisabled) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.IsPublic) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.LScale) {
        card.lscale = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.RScale) {
        card.rscale = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    return {
        card: card,
        readposition: readposition
    };


}

module.exports = makeCard;
},{"../../libs/enums.js":16}],16:[function(require,module,exports){
/*jslint node:true*/

module.exports = {
    locations: {
        0x01: 'DECK',
        0x02: 'HAND',
        0x04: 'MONSTERZONE',
        0x08: 'SPELLZONE',
        0x10: 'GRAVE',
        0x20: 'REMOVED',
        0x40: 'EXTRA',
        0x80: 'OVERLAY'
    },
    race: {
        0x1: 'Warrior',
        0x2: 'SpellCaster',
        0x4: 'Fairy',
        0x8: 'Fiend',
        0x10: 'Zombie',
        0x20: 'Machine',
        0x40: 'Aqua',
        0x80: 'Pyro',
        0x100: 'Rock',
        0x200: 'WindBeast',
        0x400: 'Plant',
        0x800: 'Insect',
        0x1000: 'Thunder',
        0x2000: 'Dragon',
        0x4000: 'Beast',
        0x8000: 'BestWarrior',
        0x10000: 'Dinosaur',
        0x20000: 'Fish',
        0x40000: 'SeaSerpent',
        0x80000: 'Reptile',
        0x100000: 'Psychic',
        0x200000: 'DivineBeast'
    },
    RPS: {
        0x01: 'Rock',
        0x02: 'Scissors',
        0x04: 'Paper'
    },
    query: {
        Code: 0x01,
        Position: 0x02,
        Alias: 0x04,
        Type: 0x08,
        Level: 0x10,
        Rank: 0x20,
        Attribute: 0x40,
        Race: 0x80,
        Attack: 0x100,
        Defence: 0x200,
        BaseAttack: 0x400,
        BaseDefence: 0x800,
        Reason: 0x1000,
        ReasonCard: 0x2000,
        EquipCard: 0x4000,
        TargetCard: 0x8000,
        OverlayCard: 0x10000,
        Counters: 0x20000,
        Owner: 0x40000,
        IsDisabled: 0x80000,
        IsPublic: 0x100000,
        LScale: 0x200000,
        RScale: 0x400000
    },
    cardAttributes: {
        0x01: 'Earth',
        0x02: 'Water',
        0x04: 'Fire',
        0x08: 'Wind',
        0x10: 'Light',
        0x20: 'Dark',
        0x40: 'Divine'
    },
    phase: {
        1: 'Draw Phase',
        2: 'Standby Phase',
        3: 'Main Phase 1',
        4: 'Battle Phase',
        5: 'Battle Phase: Damage',
        6: 'Battle Phase: Damage Calculation',
        7: 'Main Phase 2',
        8: 'End Phase'
    },
    Positions: {
        0x1: 'FaceUpAttack',
        0x2: 'FaceDownAttack',
        0x4: 'FaceUpDefence',
        0x8: 'FaceDownDefence',
        0x5: 'FaceUp',
        0xA: 'FaceDown',
        0x3: 'Attack',
        0xC: 'Defence'
    },
    cardTypes: {
        0x1: 'Monster',
        0x2: 'Spell',
        0x4: 'Trap',
        0x10: 'Normal',
        0x20: 'Effect',
        0x40: 'Fusion',
        0x80: 'Ritual',
        0x100: 'TrapMonster',
        0x200: 'Spirit',
        0x400: 'Union',
        0x800: 'Dual',
        0x1000: 'Tuner',
        0x2000: 'Synchro',
        0x4000: 'Token',
        0x10000: 'QuickPlay',
        0x20000: 'Continuous',
        0x40000: 'Equip',
        0x80000: 'Field',
        0x100000: 'Counter',
        0x200000: 'Flip',
        0x400000: 'Toon',
        0x800000: 'Xyz'
    },
    lobbyStates: {
        0x8: 'Observe',
        0x9: 'Ready',
        0xA: 'NotReady',
        0xB: 'Leave'

    }
};
module.exports.STOC = {
    0x0: "STOC_UNKNOWN",
    0x1: "STOC_GAME_MSG",
    0x2: "STOC_ERROR_MSG",
    0x3: "STOC_SELECT_HAND",
    0x4: "STOC_SELECT_TP",
    0x5: "STOC_HAND_RESULT",
    0x6: "STOC_TP_RESULT",
    0x7: "STOC_CHANGE_SIDE",
    0x8: "STOC_WAITING_SIDE",
    0x11: "STOC_CREATE_GAME",
    0x12: "STOC_JOIN_GAME",
    0x13: "STOC_TYPE_CHANGE",
    0x14: "STOC_LEAVE_GAME",
    0x15: "STOC_DUEL_START",
    0x16: "STOC_DUEL_END",
    0x17: "STOC_REPLAY",
    0x18: "STOC_TIME_LIMIT",
    0x19: "STOC_CHAT",
    0x20: "STOC_HS_PLAYER_ENTER",
    0x21: "STOC_HS_PLAYER_CHANGE",
    0x22: "STOC_HS_WATCH_CHANGE",
    STOC_GAME_MSG: {
        1: "MSG_RETRY",
        2: "MSG_HINT",
        3: "MSG_WAITING",
        4: "MSG_START",
        5: "MSG_WIN",
        6: "MSG_UPDATE_DATA",
        7: "MSG_UPDATE_CARD",
        8: "MSG_REQUEST_DECK",
        10: "MSG_SELECT_BATTLECMD",
        11: "MSG_SELECT_IDLECMD",
        12: "MSG_SELECT_EFFECTYN",
        13: "MSG_SELECT_YESNO",
        14: "MSG_SELECT_OPTION",
        15: "MSG_SELECT_CARD",
        16: "MSG_SELECT_CHAIN",
        18: "MSG_SELECT_PLACE",
        19: "MSG_SELECT_POSITION",
        20: "MSG_SELECT_TRIBUTE",
        21: "MSG_SORT_CHAIN",
        22: "MSG_SELECT_COUNTER",
        23: "MSG_SELECT_SUM",
        24: "MSG_SELECT_DISFIELD",
        25: "MSG_SORT_CARD",
        30: "MSG_CONFIRM_DECKTOP",
        31: "MSG_CONFIRM_CARDS",
        32: "MSG_SHUFFLE_DECK",
        33: "MSG_SHUFFLE_HAND",
        34: "MSG_REFRESH_DECK",
        35: "MSG_SWAP_GRAVE_DECK",
        36: "MSG_SHUFFLE_SET_CARD",
        37: "MSG_REVERSE_DECK",
        38: "MSG_DECK_TOP",
        40: "MSG_NEW_TURN",
        41: "MSG_NEW_PHASE",
        50: "MSG_MOVE",
        53: "MSG_POS_CHANGE",
        54: "MSG_SET",
        55: "MSG_SWAP",
        56: "MSG_FIELD_DISABLED",
        60: "MSG_SUMMONING",
        61: "MSG_SUMMONED",
        62: "MSG_SPSUMMONING",
        63: "MSG_SPSUMMONED",
        64: "MSG_FLIPSUMMONING",
        65: "MSG_FLIPSUMMONED",
        70: "MSG_CHAINING",
        71: "MSG_CHAINED",
        72: "MSG_CHAIN_SOLVING",
        73: "MSG_CHAIN_SOLVED",
        74: "MSG_CHAIN_END",
        75: "MSG_CHAIN_NEGATED",
        76: "MSG_CHAIN_DISABLED",
        80: "MSG_CARD_SELECTED",
        81: "MSG_RANDOM_SELECTED",
        83: "MSG_BECOME_TARGET",
        90: "MSG_DRAW",
        91: "MSG_DAMAGE",
        92: "MSG_RECOVER",
        93: "MSG_EQUIP",
        94: "MSG_LPUPDATE",
        95: "MSG_UNEQUIP",
        96: "MSG_CARD_TARGET",
        97: "MSG_CANCEL_TARGET",
        100: "MSG_PAY_LPCOST",
        101: "MSG_ADD_COUNTER",
        102: "MSG_REMOVE_COUNTER",
        110: "MSG_ATTACK",
        111: "MSG_BATTLE",
        112: "MSG_ATTACK_DISABLED",
        113: "MSG_DAMAGE_STEP_START",
        114: "MSG_DAMAGE_STEP_END",
        120: "MSG_MISSED_EFFECT",
        121: "MSG_BE_CHAIN_TARGET",
        122: "MSG_CREATE_RELATION",
        123: "MSG_RELEASE_RELATION",
        130: "MSG_TOSS_COIN",
        131: "MSG_TOSS_DICE",
        140: "MSG_ANNOUNCE_RACE",
        141: "MSG_ANNOUNCE_ATTRIB",
        142: "MSG_ANNOUNCE_CARD",
        143: "MSG_ANNOUNCE_NUMBER",
        160: "MSG_CARD_HINT",
        161: "MSG_TAG_SWAP",
        162: "MSG_RELOAD_FIELD",
        163: "MSG_AI_NAME",
        164: "MSG_SHOW_HINT",
        170: "MSG_MATCH_KILL",
        180: "MSG_CUSTOM_MSG",
        MSG_HINT: {
            1: "HINT_EVENT",
            2: "HINT_MESSAGE",
            3: "HINT_SELECTMSG",
            4: "HINT_OPSELECTED",
            5: "HINT_EFFECT",
            6: "HINT_RACE",
            7: "HINT_ATTRIB",
            8: "HINT_CODE",
            9: "HINT_NUMBER",
            10: "HINT_CARD"

        },
        MSG_NEW_PHASE: {
            0x01: "PHASE_DRAW",
            0x02: "PHASE_STANDBY",
            0x04: "PHASE_MAIN1",
            0x08: "PHASE_BATTLE",
            0x10: "PHASE_DAMAGE",
            0x20: "PHASE_DAMAGE_CAL",
            0x40: "PHASE_MAIN2",
            0x80: "PHASE_END"
        }

    },
    STOC_ERROR_MSG: {
        0x1: "ERRMSG_JOINERROR",
        0x2: "ERRMSG_DECKERROR",
        0x3: "ERRMSG_SIDEERROR",
        0x4: "ERRMSG_VERERROR",
        ERRMSG_DECKERROR: [
            "Can't join host",
            "Password is incorrect.",
            "The host refused the connection."
        ]
    }
};
module.exports.CTOS = {
    0x1: "CTOS_RESPONSE",
    0x2: "CTOS_UPDATE_DECK",
    0x3: "CTOS_HAND_RESULT",
    0x4: "CTOS_TP_RESULT",
    0x10: "CTOS_PLAYER_INFO",
    0x11: "CTOS_CREATE_GAME",
    0x12: "CTOS_JOIN_GAME",
    0x13: "CTOS_LEAVE_GAME",
    0x14: "CTOS_SURRENDER",
    0x15: "CTOS_TIME_COMFIRM",
    0x16: "CTOS_CHAT",
    0x20: "CTOS_HS_TODUELIST",
    0x21: "CTOS_HS_TOOBSERVER", //to observer
    0x22: "CTOS_HS_READY",
    0x23: "CTOS_HS_NOTREADY",
    0x24: "CTOS_HS_KICK",
    0x25: "CTOS_HS_START"
    //defunc 0x26: "DEVPRO_GAME_INFO"

};

function makeCheck(target) {
    'use strict';
    var destination = target + 'Check',
        value;
    module.exports[destination] = {};
    for (value in module.exports[target]) {
        if (module.exports[target].hasOwnProperty(value)) {
            module.exports[destination][value] = false;
        }
    }
}
makeCheck('STOC');
makeCheck('CTOS');
},{}],17:[function(require,module,exports){
(function (Buffer){
/*jslint node : true*/
var util         = require("util");
var EventEmitter = require("events").EventEmitter;

module.exports = function () {
    "use strict";
    var memory = new Buffer([]);

    this.input = function (buffer) {
        var x = true,
            output = [];
        //console.log('before', memory.length, 'bytes in memory');
        memory = Buffer.concat([memory, buffer]);
        //console.log('concated', memory.length);
        while (x === true && memory.length > 2) {
            var frame_length = memory[0] + memory[1];
            //console.log('read', frame_length, '(+2) of', memory.length, 'bytes');
            if ((memory.length - 2) < frame_length) {
                //console.log('not enough');
                x = false;
            } else {
                var recordOfBuffer = memory.slice(2).toJSON();
                output.push(recordOfBuffer);
                if (memory.length === (frame_length + 2)) {
                    memory = new Buffer([]);
                    x = false;
                } else {
                    memory = memory.slice((frame_length + 2));
                }
                //console.log('after', memory.length);
            }
        }
        //console.log('----',output);
        return output;
    };
    return this;
};
}).call(this,require("buffer").Buffer)
},{"buffer":1,"events":5,"util":9}],18:[function(require,module,exports){
/*jslint node: true, bitwise: true, plusplus:true*/
var enums = require('./enums.js');

module.exports = function recieveSTOC(packet) {
    'use strict';
    var task = Object.create(enums.STOCCheck),
        makeCard = require('../http/js/card.js'),
        command,
        bitreader = 0,
        iter = 0;

    task[packet.STOC] = true;
    task.command = '';
    //console.log(packet);
    switch (packet.STOC) {
    case ("STOC_UNKNOWN"):
        break;

    case ("STOC_GAME_MSG"):
        command = enums.STOC.STOC_GAME_MSG[packet.message[0]];
        task.command = command;
        bitreader++;
        switch (command) {
        case ('MSG_START'):
            task.playertype = packet.message[1];
            task.lifepoints1 = packet.message.readUInt16LE(2);
            task.lifepoints2 = packet.message.readUInt16LE(6);
            task.player1decksize = packet.message.readUInt8(10);
            task.player1extrasize = packet.message.readUInt8(12);
            task.player2decksize = packet.message.readUInt8(14);
            task.player2extrasize = packet.message.readUInt8(16);
            break;

        case ('MSG_HINT'):
            //console.log('MSG_HINT', packet);
            task.hintplayer = packet.message[1];
            task.hintcont = packet.message[2];
            task.hintspeccount = packet.message[3];
            task.hintforce = packet.message[4];
                //whole case system that goes here....
                //todo...
            break;

        case ('MSG_NEW_TURN'):
            task.player = packet.message[1];
            break;

        case ('MSG_WIN'):
            task.win = packet.message[1];
            //need to double check for more variables
            break;

        case ('MSG_NEW_PHASE'):
            task.phase = packet.message[1];
            break;

        case ('MSG_DRAW'):
            task.drawplayer = packet.message[1];
            task.draw = packet.message[2];
            task.cardslist = [];
            task.drawReadposition = 3;
            break;
                
        case ('MSG_SHUFFLE_DECK'):
            task.shuffle = packet.message[1];
            break;

        case ('MSG_SHUFFLE_HAND'):
            task.layout = packet.message[1];
            break;
                
        case ('MSG_CHAINING'):
            break; //
        case ('MSG_CHAINED'):
            task.ct = packet.message[1];
            break;
                
        case ('MSG_CHAIN_SOLVING'):
            task.ct = packet.message[1];
            break;

        case ('MSG_CHAIN_SOLVED'):
            break;
                
        case ('MSG_CHAIN_END'):
            break; // remove any liggering chain parts
                
        case ('MSG_CHAIN_NEGATED'):
            break; //graphical and trigger only for replay
                
        case ('MSG_CHAIN_DISABLED'):
            break; //graphical and trigger only for replay

        case ('MSG_CARD_SELECTED'):
            /*  player = packet.message[1];*/
            task.count = packet.message[2];
            break;

        case ('MSG_PAY_LPCOST'):
            task.player = packet.message[1];
            task.lpcost = packet.message.readUInt16LE(2);
            break;

        case ('MSG_DAMAGE'):
            task.player = packet.message[1];
            task.damage = packet.message.readUInt16LE(2);
            break;
                
        case ('MSG_SUMMONING '):
            //ignoring
            break;
                
        case ('MSG_SELECT_IDLECMD'):
//            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
//            console.log(task.command);
            task.command = 'MSG_SELECT_IDLECMD';
            //https://github.com/Fluorohydride/ygopro/blob/d9450dbb35676db3d5b7c2a5241a54d7f2c21e98/ocgcore/playerop.cpp#L69
            task.idleplayer = packet.message[1];
            iter = 0;
            bitreader++;
            task.summonable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.summonable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.spsummonable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.spsummonable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.repositionable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.repositionable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.msetable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.msetable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.select_chains = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.select_chains.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.ssetable_cards = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.ssetable_cards.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            iter = 0;
            bitreader++;
            task.select_chains = [];
            for (iter; packet.message[bitreader] > iter; iter++) {
                task.select_chains.push({
                    code : packet.message.readUInt16LE(bitreader + 1),
                    controller : packet.message[bitreader + 5],
                    location : packet.message[bitreader + 6],
                    sequence : packet.message[bitreader + 7]
                });
                bitreader = bitreader + 7;
            }
            task.bp = packet.message[bitreader];
            task.ep = packet.message[bitreader + 1];
            task.shufflecount = packet.message[bitreader + 2];
            //https://github.com/Fluorohydride/ygopro/blob/d9450dbb35676db3d5b7c2a5241a54d7f2c21e98/ocgcore/playerop.cpp#L147
            //something is gonna go wrong;
            break;

        case ('MSG_MOVE'):
            task.code = packet.message.readUInt16LE(1);
            task.pc = packet.message[5]; // original controller
            task.pl = packet.message[6]; // original cLocation
            task.ps = packet.message[7]; // original sequence (index)
            task.pp = packet.message[8]; // padding??
            task.cc = packet.message[9]; // current controller
            task.cl = packet.message[10]; // current cLocation
            task.cs = packet.message[11]; // current sequence (index)
            task.cp = packet.message[12]; // current position
            task.reason = packet.message.readUInt16LE[12]; //debug data??
            break;

        case ('MSG_POS_CHANGE'):
            task.code = packet.message.readUInt16LE(1);
            task.cc = packet.message[5]; // current controller
            task.cl = packet.message[6]; // current cLocation
            task.cs = packet.message[7]; // current sequence (index)
            task.pp = packet.message[8]; // padding??
            task.cp = packet.message[9]; // current position
            break;

        case ('MSG_SET'):
            //check for variables
            break;
                
        case ('MSG_SWAP'):
            //check for variables
            break;
                
            
        case ('MSG_SUMMONING'):
            task.code = packet.message.readUInt16LE(1);
            //check for variables
            break;
                
        case ('MSG_SPSUMMONING'):
            task.code = packet.message.readUInt16LE(1);
            break;
                
        case ('MSG_SUMMONED'):
            break; //graphical only
                
        case ('MSG_SPSUMMONED'):
            break; //graphical only
                
        case ('MSG_FLIPSUMMONED'):
            break; //graphical only
                
        case ('MSG_FLIPSUMMONING'):
            // notice pp is missing, and everything is upshifted; not repeating code.
            task.code = packet.message.readUInt16LE(1);
            task.cc = packet.message[5]; // current controller
            task.cl = packet.message[6]; // current cLocation
            task.cs = packet.message[7]; // current sequence (index)
            task.cp = packet.message[8]; // current position
            break;

        case ('MSG_UPDATE_DATA'):
        
            task.player = packet.message[1];
            task.fieldlocation = packet.message[2];
            task.fieldmodel = enums.locations[task.fieldlocation];
            task.message = packet.message;
            break;

        case ('MSG_UPDATE_CARD'):
            task.udplayer = packet.message[1];
            task.udfieldlocation = packet.message[2];
            task.udindex = packet.message[3];
            task.udcard = makeCard(packet.message, 8, task.udplayer).card;
            break;
        
        case ('MSG_WAITING'):
            break;
        
        default:
            console.log('bad', command, packet, task);
            break;
        }
        return task;
    
            
    case ("STOC_ERROR_MSG"):
        command = enums.STOC.STOC_ERROR_MSG[packet.message[0]];
        switch (command) {
        case (null):
            break;
        default:
        
        }
        break;

    case ("STOC_SELECT_HAND"):
        //visual only trigger
        break;

    case ("STOC_SELECT_TP"):
        //prompt turn player trigger
        break;

    case ("STOC_HAND_RESULT"):
        task.showcardcode = (packet.message[0] - 1) + ((packet.message[1] - 1) << 16);
		task.showcarddif = 50;
		task.showcardp = 0;
		task.showcard = 100;
        task.res1 = packet.message[0];
        task.res2 = packet.message[1];
        break;

    case ("STOC_TP_RESULT"):
        break;

    case ("STOC_CHANGE_SIDE"):
        break;

    case ("STOC_WAITING_SIDE"):
        break;

    case ("STOC_CREATE_GAME"):
        break;

    case ("STOC_JOIN_GAME"):
            
        break;

    case ("STOC_TYPE_CHANGE"):
        task.typec = packet.message[0];
        task.pos = task.typec & 0xF;
        task.ishost = ((task.typec >> 4) & 0xF) !== 0;
        break;

    case ("STOC_LEAVE_GAME"):
        break;

    case ("STOC_DUEL_START"):
        //trigger to start duel, nothing more.
        break;

    case ("STOC_DUEL_END"):
        //trigger to close the duel, nothing more.
        break;

    case ("STOC_REPLAY"):
        break;

    case ("STOC_TIME_LIMIT"):
        task.player = packet.message[0];
        task.time = packet.message[1] + packet.message[2];
        break;

    case ("STOC_CHAT"):
        task.from = packet.message[0] + packet.message[1];
        task.chat = packet.message.toString('utf16le', 2).replace(/\0/g, '');
        task.len = task.chat.length;
        break;

    case ("STOC_HS_PLAYER_ENTER"):
        task.person = packet.message.toString('utf16le', 0, 39).replace(/\0/g, '');
        task.messagelen = task.person.length;
        task.person = task.person.replace("\u0000", "");
        break;

    case ("STOC_HS_PLAYER_CHANGE"):
        task.change = packet.message[0];
        task.changepos = (task.change >> 4) & 0xF;
        task.state = task.change & 0xF;
            
        break;

    case ("STOC_HS_WATCH_CHANGE"):
        task.spectators = packet.message[0];
        break;

    }
    //console.log(task.command);
    return task;
};

},{"../http/js/card.js":15,"./enums.js":16}],19:[function(require,module,exports){
//Define all the globals you are going to use. Avoid using to many globals. All Globals should be databases of sorts.
// ReadInt32() = readUInt16LE()
/*jslint node: true, bitwise:true*/
/*globals $, WebSocket*/
/*jslint browser : true, plusplus:true*/
'use strict';



var game = {
    images: 'http://ygopro.us/http/ygopro/pics/'
};




var Framemaker = require('../../../server/libs/parseframes.js');
var enums = require('../../../server/libs/enums.js');
var recieveSTOC = require('../../../server/libs/recieveSTOC.js');
var makeCTOS = require('../../ai/responseGenerator.js');
var Buffer = require('buffer/').Buffer,
    events = require('events'),
    makeCard = require('./card.js');


function CommandParser() {
    

    // OK!!!! HARD PART!!!!
    // recieveSTOC.js should have created obejects with all the parameters as properites, fire the functions.
    // Dont try to pull data out of a packet here, should have been done already.
    // its done here because we might need to pass in STATE to the functions also.
    // again if you are fiddling with a packet you are doing it wrong!!!
    // data decode and command execution are different conserns.
    // if a COMMAND results in a response, save it as RESPONSE, else return the function false.

    var protoResponse = [],
        responseRequired = false,
        output = {};

    output.event = new events.EventEmitter();

    output.input = function (input) {
        //console.log(input);
        if (input.STOC_GAME_MSG) {
            output.event.emit(input.command, input);
        }
        if (input.STOC_UNKNOWN) {
            output.event.emit('STOC_UNKNOWN', input);
        }
        if (input.STOC_SELECT_HAND) {
            output.event.emit('STOC_SELECT_HAND', input);
        }
        if (input.STOC_JOIN_GAME) {
            output.event.emit('STOC_JOIN_GAME', input);
        }
        if (input.STOC_SELECT_TP) {
            output.event.emit('STOC_SELECT_TP', input);
        }
        if (input.STOC_HAND_RESULT) {
            output.event.emit('STOC_HAND_RESULT', input);
        }
        if (input.STOC_TP_RESULT) {
            output.event.emit('STOC_TP_RESULT', input);
        }
        if (input.STOC_CHANGE_SIDE) {
            output.event.emit('STOC_CHANGE_SIDE', input);
        }
        if (input.STOC_WAITING_SIDE) {
            output.event.emit('STOC_WAITING_SIDE', input);
        }
        if (input.STOC_CREATE_GAME) {
            output.event.emit('STOC_CREATE_GAME', input);
        }
        if (input.STOC_TYPE_CHANGE) {
            output.event.emit('STOC_TYPE_CHANGE', input);
        }
        if (input.STOC_LEAVE_GAME) {
            output.event.emit('STOC_LEAVE_GAME', input);
        }
        if (input.STOC_DUEL_START) {
            output.event.emit('STOC_DUEL_START', input);
        }
        if (input.STOC_DUEL_END) {
            output.event.emit('STOC_DUEL_END', input);
        }
        if (input.STOC_REPLAY) {
            output.event.emit('STOC_REPLAY', input);
        }
        if (input.STOC_TIME_LIMIT) {
            output.event.emit('STOC_TIME_LIMIT', input);
        }
        if (input.STOC_CHAT) {
            output.event.emit('STOC_CHAT', input);
        }
        if (input.STOC_HS_PLAYER_ENTER) {
            output.event.emit('STOC_HS_PLAYER_ENTER', input);
        }

        if (input.STOC_HS_PLAYER_CHANGE) {
            output.event.emit('STOC_HS_PLAYER_CHANGE', input);
        }
        if (input.STOC_HS_WATCH_CHANGE) {
            output.event.emit('STOC_HS_WATCH_CHANGE', input);
        }
    };
    return output;
}

function processTask(task, socket) {
   
    var i = 0,
        l = 0,
        output = [],
        RESPONSE = false;
    for (i; task.length > i; i++) {
        output.push(recieveSTOC(task[i]));
    }

    return output;
}
//Functions used by the websocket object




game.UpdateTime = function (player, time) {
    $('.p' + player + 'time').val(time);
};

game.LoadField = function () {
    console.log('GAME INITIATE!');
    $('#duelzone').css('display', 'block').get(0).scrollIntoView();
    $('img.card').attr('class', 'card none undefined i0').attr('src', game.images + 'cover.jpg');

    $('#phases').css('display', 'block');
    console.log('Starting Duel!');
};

function cardmargin(player, deck) {
    var size = $('.card.' + player + '.' + deck).length;
    $('.card.p' + player + '.' + deck).each(function (i) {

        $(this).css('z-index', i).attr('style', '')
            .css('-webkit-transform', 'translate3d(0,0,' + i + 'px)');


    });
}

function layouthand(player) {
    var count = $('.p' + player + '.HAND').length,
        f = 75 / 0.8,
        xCoord,
        sequence;
    //    console.log(count,f,xCoord);
    for (sequence = 0; sequence < count; sequence++) {
        if (count < 6) {
            xCoord = (5.5 * f - 0.8 * f * count) / 2 + 1.55 * f + sequence * 0.8 * f;
        } else {
            xCoord = 1.9 * f + sequence * 4.0 * f / (count - 1);
        }
        // console.log('.'+player+'.Hand.i'+sequence);
        //console.log(xCoord);
        if (player === 0) {
            $('.p' + player + '.HAND.i' + sequence).css('left', String() + xCoord + 'px');
        } else {
            $('.p' + player + '.HAND.i' + sequence).css('left', String() + xCoord + 'px');
        }
    }
}

//    
//    if (count <= 6)
//    t->X = (5.5f - 0.8f * count) / 2 + 1.55f + sequence * 0.8f;
//   else
//    t->X = 1.9f + sequence * 4.0f / (count - 1);

game.StartDuel = function (player1StartLP, player2StartLP, OneDeck, TwoDeck, OneExtra, TwoExtra) { // Interface signalled the game has started

    game.DOMWriter(OneDeck, 'DECK', 0);
    game.DOMWriter(TwoDeck, 'DECK', 1);
    game.DOMWriter(OneExtra, 'EXTRA', 0);
    game.DOMWriter(TwoExtra, 'EXTRA', 1);
    cardmargin(0, 'DECK');
    cardmargin(1, 'DECK');
    cardmargin(0, 'EXTRA');
    cardmargin(1, 'EXTRA');
    layouthand(0);
    layouthand(1);
    $('.p0lp').val(player1StartLP);
    $('.p1lp').val(player2StartLP);
    //return [cardCollections(0), cardCollections(1)];
};

game.DOMWriter = function (size, movelocation, player) {
    var field = $('.fieldimage'),
        i;
    $(field).detach();
    for (i = 0; i < size; i++) {
        $(field).append('<img class="card p' + player + ' ' + movelocation + ' i' + i + ' o" src="' + game.images + 'cover.jpg" data-position="FaceDown" />');
    }
    $(field).appendTo('.fieldcontainer');
};
game.updatelifepoints = function (player, multiplier, lp) {
    var lifepoints = +$('.p' + player + 'lp').eq(0).val() + (lp * multiplier);
    if (lifepoints < 0) {
        lifepoints = 0;
    }
    $('.p' + player + 'lp').val(lifepoints);
};
game.UpdateCards = function (player, clocation, data) { //YGOPro is constantly sending data about game state, this function stores and records that information to allow access to a properly understood gamestate for reference. 
    var i, deadcard, deadzone, index, animateState;

    for (i = 0; data.length > i; i++) {
        if (data[i].Code !== 'nocard') {
            console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i, data[i].Code);
            $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).not('.overlayunit')
                .attr('src', game.images + data[i].Code + '.jpg')
                .attr('data-position', data[i].Position);
            return;
        } else {
            deadcard = $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + i).length;
            deadzone = (enums.locations[clocation] + '.i' + i === 'SPELLZONE.i6' ||
                enums.locations[clocation] + '.i' + i === 'SPELLZONE.i7'
            ) ? 'EXTRA' : 'GRAVE';
            if (deadcard) {
                index = $('.p' + player + '.' + deadzone).length - 1;
                animateState(player, clocation, i, player, 0x10, index, 'AttackFaceUp');
                //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
            }
        }
    }
};
game.UpdateCard = function (player, clocation, index, data) {
    if (data.Code !== 'nocard') {
        console.log('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index);
        $('.card.p' + player + '.' + enums.locations[clocation] + '.i' + index).attr('src', game.images + data.Code + '.jpg')
            .attr('data-position', data.Position);
    }
};
function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {
    isBecomingCard = (isBecomingCard) ? 'card overlayunit' : 'card';
    overlayindex = (overlayindex === undefined) ? '' : 0;
    var isCard = (overlayindex === undefined) ? '.card' : '.card.overlayunit',
        
        searchindex = (index === 'ignore') ? '' : ".i" + index,
        searchplayer = (player === 'ignore') ? '' : ".p" + player,
        origin = isCard + searchplayer + "." + enums.locations[clocation] + searchindex,
        destination = isBecomingCard + " p" + moveplayer + " " + enums.locations[movelocation] + " i" + movezone,
        card = $(origin).attr({
            'style': '',
            'data-position': moveposition,
            'data-overlayunit': overlayindex,
            'class': destination
        });
    //   });


    console.log(origin, 'changed to', destination);
    if (enums.locations[clocation] === 'DECK' ||
            enums.locations[clocation] === 'EXTRA' ||
            enums.locations[clocation] === 'GRAVE' ||
            enums.locations[clocation] === 'REMOVED') {
        cardmargin(player, enums.locations[clocation]);
    }
    if (enums.locations[movelocation] === 'DECK' ||
            enums.locations[movelocation] === 'EXTRA' ||
            enums.locations[movelocation] === 'GRAVE' ||
            enums.locations[movelocation] === 'REMOVED') {
        cardmargin(moveplayer, enums.locations[movelocation]);
    }

    $('.card.p0.HAND').each(function (sequence) {
        $(this).attr('class', 'card p0 HAND i' + sequence);
    });
    $('.card.p1.HAND').each(function (sequence) {
        $(this).attr('class', 'card p1 HAND i' + sequence);
    });

    layouthand(0);
    layouthand(1);
    return card;
}

game.MoveCard = function (code, pc, pl, ps, pp, cc, cl, cs, cp) {

    console.log(code, pc, pl, ps, pp, cc, cl, cs, cp);
    var newcard, query;
    if (pl === 0) {
        newcard = '<img class="card p' + cc + ' ' + enums.locations[cl] + ' i' + cs + '" data-position="">';
        $('.fieldimage').append(newcard);
        return;
    } else if (cl === 0) {
        query = '.card.p' + pc + '.' + enums.locations[pl] + '.i' + ps;
        $(query).detach();
        return;
    } else {

        if (!(pl & 0x80) && !(cl & 0x80)) { //duelclient line 1885
            console.log(pl);
            animateState(pc, pl, ps, cc, cl, cs, cp);
            //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
        } else if (!(pl & 0x80)) {
            console.log('targeting a card to become a xyz unit....');
            $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                $(this).attr('data-overlayunit', (i));
            });
            animateState(pc, pl, ps, cc, (cl & 0x7f), cs, cp, undefined, true);


        } else if (!(cl & 0x80)) {
            console.log('turning an xyz unit into a normal card....');
            animateState(pc, (pl & 0x7f), ps, cc, cl, cs, cp, pp);
            $('.overlayunit.p' + pc + '.i' + ps).each(function (i) {
                $(this).attr('data-overlayunit', (i));
            });
            console.log('turning something into a xyz unit....');
        } else {
            console.log('move one xyz unit to become the xyz unit of something else....');
            $('.overlayunit.p' + cc + '.i' + cs).each(function (i) {
                $(this).attr('data-overlayunit', (i));
            });
            animateState(pc, (pl & 0x7f), ps, cc, (cl & 0x7f), cs, cp, pp, true);
            $('.overlayunit.p' + pc + '.OVERLAY.i' + ps).each(function (i) {
                $(this).attr('data-overlayunit', true);
            });


        }
    }
};
game.ChangeCardPosition = function (code, cc, cl, cs, cp) {
    animateState(cc, cl, cs, cc, cl, cs, cp);
    //var query = '.card.p' + cc + '.' + enums.locations[cl] + '.i' + cs;
    //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition)
};

game.DrawCard = function (player, numberOfCards, cards) {
    var currenthand = $('.p' + player + '.HAND').length, i, topcard, query;

    for (i = 0; i < numberOfCards; i++) {
        topcard = $('.p' + player + '.DECK').length - 1;
        animateState(player, 1, topcard, player, 2, currenthand + i, 'FaceUp');
        //animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition){
        query = '.p' + player + '.HAND' + '.i' + (currenthand + i);
        console.log(query + ' changed to ' + game.images + cards[i] + '.jpg');
        $(query).attr('src', game.images + cards[i] + '.jpg');

    }

    layouthand(player);
    //console.log("p" + player + " drew " + numberOfCards + " card(s)");
};

game.NewPhase = function (phase) {
    console.log('it is now' + enums.phase[phase]);
    $('#phases .phase').text(enums.phase[phase]);


};
var turn = 0;
var turnplayer = 0;
game.NewTurn = function (turnx) {
    turnx = +turnx;
    console.log("It is now p" + turnx + "'s turn.");
    $('#phases .player').text('Player ' + (1 + turnx) + ':');
    turnplayer = turnx;
};



game.OnWin = function (result) {
    console.log("Function OnWin: " + result);
};

game.SelectCards = function (cards, min, max, cancelable) {
    var debugObject = {
        cards: cards,
        min: min,
        max: max,
        cancelable: cancelable
    };
    console.log('Function SelectCards:' + JSON.stringify(debugObject));
};

game.DuelEnd = function () {
    console.log('Duel has ended.');
};

game.SelectYn = function (description) {
    console.log("Function SelectYn :" + description);
};

game.IdleCommands = function (main) {
    var update = JSON.parse(main);
    console.log('IdleCommands', update);
};

game.SelectPosition = function (positions) {
    var debugObject = JSON.Strigify(positions);
    console.log(debugObject);
};

game.SelectOption = function (options) {
    var debugObject = JSON.Strigify(options);
    console.log(debugObject);
};

game.AnnounceCard = function () {
    //Select a card from all known cards.
    console.log('AnnounceCard');
};

function animateChaining(player, clocation, index) {
    $(player + '.' + clocation + '.i' + index).addClass('chainable');
}

function animateRemoveChaining() {
    $('.chainable').removeClass('chainable');
}

game.OnChaining = function (cards, desc, forced) {
    var cardIDs = JSON.parse(cards), i;

    for (i = 0; i < cardIDs.length; i++) {
        animateChaining(('p' + cardIDs[i].Player), enums.locations[cardIDs[i].location], cardIDs[i].Index);
    }

    //auto say no
    if (forced) {

        animateRemoveChaining();
    } else {

        animateRemoveChaining();
    }
    console.log('chaining', cardIDs, desc);

};

function shuffle(player, deck) {
    player = 'p' + player;
    var orientation = (player === 'p0') ? ({
        x: 'left',
        y: 'bottom',
        direction: 1
    }) : ({
        x: 'right',
        y: 'top',
        direction: -1
    }),
        fix;
    cardmargin(player, deck);
    $($('.card.' + player + '.' + deck).get().reverse()).each(function (i) {
        var cache = $(this).css(orientation.x),
            spatical = Math.floor((Math.random() * 150) - 75);
        $(this).css(orientation.x, '-=' + spatical + 'px');
    });
    fix = setTimeout(function () {
        cardmargin(player, deck);
    }, 50);
}

game.ShuffleDeck = function (player) {
    console.log(player);
    shuffle(player, 'DECK');
};



var shuffler, fix;




// Animation functions






function complete(player, deck) {
    var started = Date.now(),
        interval = setInterval(function () {

        // for 1.5 seconds
            if (Date.now() - started > 500) {

                // and then pause it
                clearInterval(interval);

            } else {

                // the thing to do every 100ms
                shuffle(player, deck);
                cardmargin(player, deck);

            }
        }, 100); // every 100 milliseconds
}

function parsePackets(command, message) {
    var task = [],
        packet = {
            message: message.slice(1)
        };
    
    packet[command] = enums[command][message[0]];


    task.push(packet);
    return task;
}

var duel = {};
window.ws = {};
function GameState() {
    var AIPlayerID = 0,
        OppPlayerID = 1,
        turnPlayer = 0,
        phase = 0,
        state = {
            0: {
                Lifepoints: 8000,
                MonsterZones: [],
                SpellTrapZones: [],
                Graveyard: [],
                Banished: [],
                Hand: [],
                ExtraDeck: [],
                MainDeck: []
            },
            1: {
                LifePoints: 8000,
                MonsterZones: [],
                SpellTrapZones: [],
                Graveyard: [],
                Banished: [],
                Hand: [],
                ExtraDeck: [],
                MainDeck: []
            }
        };

    function start(lp1, lp2, OneDeck, TwoDeck, OneExtra, TwoExtra) {
        //            game.DOMWriter(OneDeck, 'DECK', 0);
        //            game.DOMWriter(TwoDeck, 'DECK', 1);
        //            game.DOMWriter(OneExtra, 'EXTRA', 0);
        //            game.DOMWriter(TwoExtra, 'EXTRA', 1);

        state[0].LifePoints = lp1;
        state[1].LifePoints = lp2;
    }

    function update(player, clocation, index, data) {
        if (index !== 'mass') {
            state[player][clocation] = data;
        } else {
            state[player][clocation][index] = data;
        }
    }

    function updateLifepoints(player, multiplier, lp) {
        var lifepoints = +state[player].Lifepoints + (lp * multiplier);
        if (lifepoints < 0) {
            lifepoints = 0;
        }
        state[player].Lifepoints = lifepoints;
    }

    function move(player, clocation, index, moveplayer, movelocation, movezone, moveposition, overlayindex, isBecomingCard) {

        //enums.locations[clocation] === 'DECK/EXTRA/REMOVED
        state[moveplayer][movelocation][moveposition] = state[player][clocation][index];
        state[player][clocation][index] = undefined;
        //if grave
        //if banished
        //if hand
        //if extraDeck
        //if maindeck
        //if above, reshuffle;
        state[player][clocation] = state[player][clocation].filter(function (element) {
            return element !== undefined;
        });


        return;
    }

    function newphase(turnx) {
        turnx = +state.phase;
    }

    function setAI_Opp(newID) {
        AIPlayerID = newID;
        OppPlayerID = (AIPlayerID === 0) ? 1 : 0;
    }

    function loadDeck(player, deck, cardList) {

    }
    return {
        move: move,
        update: update,
        loadDeck: loadDeck,
        setAI_Opp: setAI_Opp,
        GetOppMonsterZones: function () {
            return state[OppPlayerID].MonsterZones;
        },
        GetAIMonsterZones: function () {
            return state[AIPlayerID].MonsterZones;
        },
        GetOppSpellTrapZones: function () {
            return state[OppPlayerID].SpellTrapZones;
        },

        GetAISpellTrapZones: function () {
            return state[AIPlayerID].SpellTrapZones;
        },
        GetOppGraveyard: function () {
            return state[OppPlayerID].Graveyard;
        },
        GetAIGraveyard: function () {
            return state[AIPlayerID].Graveyard;
        },
        GetOppBanished: function () {
            return state[OppPlayerID].Banished;
        },
        GetAIBanished: function () {
            return state[AIPlayerID].Banished;
        },
        GetOppHand: function () {
            return state[OppPlayerID].Hand;
        },
        GetAIHand: function () {
            return state[AIPlayerID].Hand;
        },
        GetOppExtraDeck: function () {
            return state[OppPlayerID].ExtraDeck;
        },
        GetAIExtraDeck: function () {
            return state[AIPlayerID].ExtraDeck;
        },
        GetOppMainDeck: function () {
            return state[OppPlayerID].MainDeck;
        },
        GetAIMainDeck: function () {
            return state[AIPlayerID].MainDeck;
        },
        lobby: {
            ready : [0, 0],
            duelist : [],
            totalplayers: 0
        },
        time : [0, 0],
        fieldside : 0,
        state : state,
        start : start
    };

}


duel.gameState = new GameState();
function startgame(roompass) {
    duel.commandParser = new CommandParser();
    window.ws = new WebSocket("ws://ygopro.us:8080", "duel");
    window.ws.binaryType = 'arraybuffer';
    var framer = new Framemaker();
    duel.commandParser = new CommandParser();
    window.ws.onconnect = function () {
        
       
    };
    window.ws.onclose = function () {
        console.log('Websocket died');
    };
    window.ws.onmessage = function (data) {
        var q = new Buffer(new Uint8Array(data.data)),
            frame,
            task,
            newframes = 0,
            commands,
            l = 0,
            reply;

        
        frame = framer.input(q);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            //console.log('!', task);
            commands = processTask(task);
            // process AI
            //console.log(task);
            l = 0;
            for (l; commands.length > l; l++) {
                duel.commandParser.input(commands[l]);
            }
            

        }
        frame = [];
        

        
        
    };
    window.ws.onopen = function () {
        console.log('Send Game request for', roompass);
        var name = makeCTOS('CTOS_PlayerInfo', 'Spectator'),
            join = makeCTOS('CTOS_JoinGame', roompass),
            tosend = Buffer.concat([name, join]);
        window.ws.send(tosend);
    };
    duel.commandParser.event.on('STOC_JOIN_GAME', function (input) {

    });
    duel.commandParser.event.on('STOC_HS_PLAYER_CHANGE', function (input) {
        if (input.pos > 3) {
            return;
        }
        if (input.state > 8) {
            duel.gameState.lobby.ready[input.changepos] = input.state;
        }
        console.log(duel.gameState.lobby.ready[0], duel.gameState.lobby.ready[1]);
        if ((duel.gameState.lobby.ready[0] + duel.gameState.lobby.ready[0]) === 18) {
            duel.server.write(makeCTOS('CTOS_START'));
        }
    });
    duel.commandParser.event.on('STOC_HS_PLAYER_CHANGE', function (input) {

    });
    duel.commandParser.event.on('STOC_SELECT_TP', function (input) {

    });
    duel.commandParser.event.on('MSG_START', function (input) {
        duel.gameState.start(input.ifepoints1, input.lifepoints2, input.player1decksize, input.player2decksize, input.player1extrasize, input.player2extrasize);
        duel.gameState.fieldside =  input.playertype;
        
        console.log(input);
    });
    duel.commandParser.event.on('MSG_UPDATE_DATA', function (input) {
        console.log('.');
        var field = duel.gameState.state[input.player],
            output = [],
            readposition = 3,
            failed = false,
            player = input.player,
            clocation = input.clocation,
            buffer = input.message,
            i = 0,
            count,
            len,
            result;

        if (field[input.fieldmodel] !== undefined) {
            while (!failed) {
                try {
                    len = buffer.readUInt8(readposition);
                    readposition = readposition + 4;
                    if (len > 8) {
                        result = makeCard(buffer, readposition, player);
                        output.push(result.card);
                        readposition = readposition + len - 4;

                    } else {
                        output.push({
                            Code: 'nocard'
                        });
                    }
                } catch (e) {
                    console.log('overshot', e);
                    failed = true;
                    game.additional = {
                        player: player,
                        clocation: clocation,
                        buffer: buffer
                    };
                }
            }
           
            //console.log(output);

            game.UpdateCards(player, clocation, output);
        }
        duel.gameState.state[input.player][input.fieldmodel] = output;
        console.log(output);
    });
    duel.commandParser.event.on('STOC_TIME_LIMIT', function (input) {

    });
}

window.startgame = startgame;
window.duel = duel;

},{"../../../server/libs/enums.js":16,"../../../server/libs/parseframes.js":17,"../../../server/libs/recieveSTOC.js":18,"../../ai/responseGenerator.js":14,"./card.js":15,"buffer/":10,"events":5}]},{},[19]);
