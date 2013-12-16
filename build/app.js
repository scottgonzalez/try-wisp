;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
{
    var _ns_ = {
            id: 'try-wisp.main',
            doc: void 0
        };
    var codemirrorActivine = require('codemirror-activine');
    var activine = codemirrorActivine;
    var codemirrorPersist = require('codemirror-persist');
    var persist = codemirrorPersist;
    var wisp_engine_browser = require('wisp/engine/browser');
    var wisp_sequence = require('wisp/sequence');
    var rest = wisp_sequence.rest;
    var cons = wisp_sequence.cons;
    var vec = wisp_sequence.vec;
    var wisp_runtime = require('wisp/runtime');
    var str = wisp_runtime.str;
    var wisp_reader = require('wisp/reader');
    var read_ = wisp_reader.read_;
    var wisp_compiler = require('wisp/compiler');
    var compile = wisp_compiler.compile;
}
persist(CodeMirror);
var throttle = exports.throttle = function throttle(lambda, ms) {
        return function () {
            var idø1 = 0;
            return function throttled() {
                var params = Array.prototype.slice.call(arguments, 0);
                clearTimeout(idø1, throttled);
                return idø1 = setTimeout.apply(window, vec(cons(lambda, cons(ms, params))));
            };
        }.call(this);
    };
var tooglePreview = exports.tooglePreview = function tooglePreview() {
        return function () {
            var outputø1 = document.getElementById('output');
            var inputø1 = document.getElementById('input');
            outputø1.hidden = !outputø1.hidden;
            return inputø1.style.width = outputø1.hidden ? '100%' : '50%';
        }.call(this);
    };
var _errorMarker_ = exports._errorMarker_ = function () {
        var viewø1 = document.createElement('span');
        viewø1.textContent = '\u25CF';
        viewø1.style.color = 'black';
        viewø1.style.opacity = '0.5';
        return viewø1;
    }.call(this);
var updatePreview = exports.updatePreview = throttle(function (editor) {
        editor.clearGutter('error-gutter');
        return function () {
            var codeø1 = editor.getValue();
            var resultø1 = compile(codeø1, { 'source-uri': 'scratch' });
            var errorø1 = (resultø1 || 0)['error'];
            localStorage.buffer = codeø1;
            return errorø1 ? (function () {
                localStorage.buffer = codeø1;
                _errorMarker_.setAttribute('title', errorø1.message);
                return editor.setGutterMarker(errorø1.line || 0, 'error-gutter', _errorMarker_);
            })() : output.setValue((resultø1 || 0)['code']);
        }.call(this);
    }, 200);
var input = exports.input = CodeMirror(document.getElementById('input'), {
        'lineNumbers': true,
        'matchBrackets': true,
        'electricChars': true,
        'persist': true,
        'styleActiveLine': true,
        'autofocus': true,
        'value': document.getElementById('examples').innerHTML,
        'theme': 'solarized dark',
        'mode': 'clojure',
        'autoClearEmptyLines': true,
        'fixedGutter': true,
        'gutters': ['error-gutter'],
        'extraKeys': { 'Tab': 'indentSelection' },
        'onChange': updatePreview,
        'onGutterClick': tooglePreview
    });
input.on('change', updatePreview);
input.on('gutterClick', tooglePreview);
updatePreview(input);
var output = exports.output = CodeMirror(document.getElementById('output'), {
        'lineNumbers': true,
        'fixedGutter': true,
        'matchBrackets': true,
        'mode': 'javascript',
        'theme': 'solarized dark',
        'readOnly': true
    });
},{"codemirror-activine":6,"codemirror-persist":7,"wisp/compiler":12,"wisp/engine/browser":13,"wisp/reader":32,"wisp/runtime":33,"wisp/sequence":34}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"PcZj9L":[function(require,module,exports){
var TA = require('typedarray')
var xDataView = typeof DataView === 'undefined'
  ? TA.DataView : DataView
var xArrayBuffer = typeof ArrayBuffer === 'undefined'
  ? TA.ArrayBuffer : ArrayBuffer
var xUint8Array = typeof Uint8Array === 'undefined'
  ? TA.Uint8Array : Uint8Array

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

var browserSupport

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
 *
 * Firefox is a special case because it doesn't allow augmenting "native" object
 * instances. See `ProxyBuffer` below for more details.
 */
function Buffer (subject, encoding) {
  var type = typeof subject

  // Work-around: node's base64 implementation
  // allows for non-padded strings while base64-js
  // does not..
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // Assume object is an array
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf = augment(new xUint8Array(length))
  if (Buffer.isBuffer(subject)) {
    // Speed optimization -- use set if we're copying from a Uint8Array
    buf.set(subject)
  } else if (isArrayIsh(subject)) {
    // Treat array-ish objects as a byte array.
    for (var i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function(encoding) {
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true

    default:
      return false
  }
}

Buffer.isBuffer = function isBuffer (b) {
  return b && b._isBuffer
}

Buffer.byteLength = function (str, encoding) {
  switch (encoding || 'utf8') {
    case 'hex':
      return str.length / 2

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length

    case 'ascii':
    case 'binary':
      return str.length

    case 'base64':
      return base64ToBytes(str).length

    default:
      throw new Error('Unknown encoding')
  }
}

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error('Usage: Buffer.concat(list, [totalLength])\n' +
        'list should be an Array.')
  }

  var i
  var buf

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      buf = list[i]
      totalLength += buf.length
    }
  }

  var buffer = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    buf = list[i]
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

// INSTANCE METHODS
// ================

function _hexWrite (buf, string, offset, length) {
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
  if (strLen % 2 !== 0) {
    throw new Error('Invalid hex string')
  }
  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var bytes, pos
  return Buffer._charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
}

function _asciiWrite (buf, string, offset, length) {
  var bytes, pos
  return Buffer._charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var bytes, pos
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
}

function BufferWrite (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  switch (encoding) {
    case 'hex':
      return _hexWrite(this, string, offset, length)

    case 'utf8':
    case 'utf-8':
      return _utf8Write(this, string, offset, length)

    case 'ascii':
      return _asciiWrite(this, string, offset, length)

    case 'binary':
      return _binaryWrite(this, string, offset, length)

    case 'base64':
      return _base64Write(this, string, offset, length)

    default:
      throw new Error('Unknown encoding')
  }
}

function BufferToString (encoding, start, end) {
  var self = (this instanceof ProxyBuffer)
    ? this._proxy
    : this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  switch (encoding) {
    case 'hex':
      return _hexSlice(self, start, end)

    case 'utf8':
    case 'utf-8':
      return _utf8Slice(self, start, end)

    case 'ascii':
      return _asciiSlice(self, start, end)

    case 'binary':
      return _binarySlice(self, start, end)

    case 'base64':
      return _base64Slice(self, start, end)

    default:
      throw new Error('Unknown encoding')
  }
}

function BufferToJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
function BufferCopy (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start)
    throw new Error('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new Error('targetStart out of bounds')
  if (start < 0 || start >= source.length)
    throw new Error('sourceStart out of bounds')
  if (end < 0 || end > source.length)
    throw new Error('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  // copy!
  for (var i = 0; i < end - start; i++)
    target[i + target_start] = this[i + start]
}

function _base64Slice (buf, start, end) {
  var bytes = buf.slice(start, end)
  return require('base64-js').fromByteArray(bytes)
}

function _utf8Slice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  var tmp = ''
  var i = 0
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i])
      tmp = ''
    } else {
      tmp += '%' + bytes[i].toString(16)
    }

    i++
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var ret = ''
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

// TODO: add test that modifying the new buffer slice will modify memory in the
// original buffer! Use code from:
// http://nodejs.org/api/buffer.html#buffer_buf_slice_start_end
function BufferSlice (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)
  return augment(this.subarray(start, end)) // Uint8Array built-in method
}

function BufferReadUInt8 (offset, noAssert) {
  var buf = this
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < buf.length, 'Trying to read beyond buffer length')
  }

  if (offset >= buf.length)
    return

  return buf[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 1 === len) {
    var dv = new xDataView(new xArrayBuffer(2))
    dv.setUint8(0, buf[len - 1])
    return dv.getUint16(0, littleEndian)
  } else {
    return buf._dataview.getUint16(offset, littleEndian)
  }
}

function BufferReadUInt16LE (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

function BufferReadUInt16BE (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 3 >= len) {
    var dv = new xDataView(new xArrayBuffer(4))
    for (var i = 0; i + offset < len; i++) {
      dv.setUint8(i, buf[i + offset])
    }
    return dv.getUint32(0, littleEndian)
  } else {
    return buf._dataview.getUint32(offset, littleEndian)
  }
}

function BufferReadUInt32LE (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

function BufferReadUInt32BE (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

function BufferReadInt8 (offset, noAssert) {
  var buf = this
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < buf.length, 'Trying to read beyond buffer length')
  }

  if (offset >= buf.length)
    return

  return buf._dataview.getInt8(offset)
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 1 === len) {
    var dv = new xDataView(new xArrayBuffer(2))
    dv.setUint8(0, buf[len - 1])
    return dv.getInt16(0, littleEndian)
  } else {
    return buf._dataview.getInt16(offset, littleEndian)
  }
}

function BufferReadInt16LE (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

function BufferReadInt16BE (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 3 >= len) {
    var dv = new xDataView(new xArrayBuffer(4))
    for (var i = 0; i + offset < len; i++) {
      dv.setUint8(i, buf[i + offset])
    }
    return dv.getInt32(0, littleEndian)
  } else {
    return buf._dataview.getInt32(offset, littleEndian)
  }
}

function BufferReadInt32LE (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

function BufferReadInt32BE (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return buf._dataview.getFloat32(offset, littleEndian)
}

function BufferReadFloatLE (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

function BufferReadFloatBE (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return buf._dataview.getFloat64(offset, littleEndian)
}

function BufferReadDoubleLE (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

function BufferReadDoubleBE (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

function BufferWriteUInt8 (value, offset, noAssert) {
  var buf = this
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= buf.length) return

  buf[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 1 === len) {
    var dv = new xDataView(new xArrayBuffer(2))
    dv.setUint16(0, value, littleEndian)
    buf[offset] = dv.getUint8(0)
  } else {
    buf._dataview.setUint16(offset, value, littleEndian)
  }
}

function BufferWriteUInt16LE (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

function BufferWriteUInt16BE (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 3 >= len) {
    var dv = new xDataView(new xArrayBuffer(4))
    dv.setUint32(0, value, littleEndian)
    for (var i = 0; i + offset < len; i++) {
      buf[i + offset] = dv.getUint8(i)
    }
  } else {
    buf._dataview.setUint32(offset, value, littleEndian)
  }
}

function BufferWriteUInt32LE (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

function BufferWriteUInt32BE (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

function BufferWriteInt8 (value, offset, noAssert) {
  var buf = this
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= buf.length) return

  buf._dataview.setInt8(offset, value)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 1 === len) {
    var dv = new xDataView(new xArrayBuffer(2))
    dv.setInt16(0, value, littleEndian)
    buf[offset] = dv.getUint8(0)
  } else {
    buf._dataview.setInt16(offset, value, littleEndian)
  }
}

function BufferWriteInt16LE (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

function BufferWriteInt16BE (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 3 >= len) {
    var dv = new xDataView(new xArrayBuffer(4))
    dv.setInt32(0, value, littleEndian)
    for (var i = 0; i + offset < len; i++) {
      buf[i + offset] = dv.getUint8(i)
    }
  } else {
    buf._dataview.setInt32(offset, value, littleEndian)
  }
}

function BufferWriteInt32LE (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

function BufferWriteInt32BE (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 3 >= len) {
    var dv = new xDataView(new xArrayBuffer(4))
    dv.setFloat32(0, value, littleEndian)
    for (var i = 0; i + offset < len; i++) {
      buf[i + offset] = dv.getUint8(i)
    }
  } else {
    buf._dataview.setFloat32(offset, value, littleEndian)
  }
}

function BufferWriteFloatLE (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

function BufferWriteFloatBE (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof (littleEndian) === 'boolean',
        'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len) {
    return
  } else if (offset + 7 >= len) {
    var dv = new xDataView(new xArrayBuffer(8))
    dv.setFloat64(0, value, littleEndian)
    for (var i = 0; i + offset < len; i++) {
      buf[i + offset] = dv.getUint8(i)
    }
  } else {
    buf._dataview.setFloat64(offset, value, littleEndian)
  }
}

function BufferWriteDoubleLE (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

function BufferWriteDoubleBE (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
function BufferFill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('value is not a number')
  }

  if (end < start) throw new Error('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds')
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds')
  }

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

function BufferInspect () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

// Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
// Added in Node 0.12.
function BufferToArrayBuffer () {
  return (new Buffer(this)).buffer
}


// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

/**
 * Check to see if the browser supports augmenting a `Uint8Array` instance.
 * @return {boolean}
 */
function _browserSupport () {
  var arr = new xUint8Array(0)
  arr.foo = function () { return 42 }

  try {
    return (42 === arr.foo())
  } catch (e) {
    return false
  }
}

/**
 * Class: ProxyBuffer
 * ==================
 *
 * Only used in Firefox, since Firefox does not allow augmenting "native"
 * objects (like Uint8Array instances) with new properties for some unknown
 * (probably silly) reason. So we'll use an ES6 Proxy (supported since
 * Firefox 18) to wrap the Uint8Array instance without actually adding any
 * properties to it.
 *
 * Instances of this "fake" Buffer class are the "target" of the
 * ES6 Proxy (see `augment` function).
 *
 * We couldn't just use the `Uint8Array` as the target of the `Proxy` because
 * Proxies have an important limitation on trapping the `toString` method.
 * `Object.prototype.toString.call(proxy)` gets called whenever something is
 * implicitly cast to a String. Unfortunately, with a `Proxy` this
 * unconditionally returns `Object.prototype.toString.call(target)` which would
 * always return "[object Uint8Array]" if we used the `Uint8Array` instance as
 * the target. And, remember, in Firefox we cannot redefine the `Uint8Array`
 * instance's `toString` method.
 *
 * So, we use this `ProxyBuffer` class as the proxy's "target". Since this class
 * has its own custom `toString` method, it will get called whenever `toString`
 * gets called, implicitly or explicitly, on the `Proxy` instance.
 *
 * We also have to define the Uint8Array methods `subarray` and `set` on
 * `ProxyBuffer` because if we didn't then `proxy.subarray(0)` would have its
 * `this` set to `proxy` (a `Proxy` instance) which throws an exception in
 * Firefox which expects it to be a `TypedArray` instance.
 */
function ProxyBuffer (arr) {
  this._arr = arr

  if (arr.byteLength !== 0)
    this._dataview = new xDataView(arr.buffer, arr.byteOffset, arr.byteLength)
}

ProxyBuffer.prototype.write = BufferWrite
ProxyBuffer.prototype.toString = BufferToString
ProxyBuffer.prototype.toLocaleString = BufferToString
ProxyBuffer.prototype.toJSON = BufferToJSON
ProxyBuffer.prototype.copy = BufferCopy
ProxyBuffer.prototype.slice = BufferSlice
ProxyBuffer.prototype.readUInt8 = BufferReadUInt8
ProxyBuffer.prototype.readUInt16LE = BufferReadUInt16LE
ProxyBuffer.prototype.readUInt16BE = BufferReadUInt16BE
ProxyBuffer.prototype.readUInt32LE = BufferReadUInt32LE
ProxyBuffer.prototype.readUInt32BE = BufferReadUInt32BE
ProxyBuffer.prototype.readInt8 = BufferReadInt8
ProxyBuffer.prototype.readInt16LE = BufferReadInt16LE
ProxyBuffer.prototype.readInt16BE = BufferReadInt16BE
ProxyBuffer.prototype.readInt32LE = BufferReadInt32LE
ProxyBuffer.prototype.readInt32BE = BufferReadInt32BE
ProxyBuffer.prototype.readFloatLE = BufferReadFloatLE
ProxyBuffer.prototype.readFloatBE = BufferReadFloatBE
ProxyBuffer.prototype.readDoubleLE = BufferReadDoubleLE
ProxyBuffer.prototype.readDoubleBE = BufferReadDoubleBE
ProxyBuffer.prototype.writeUInt8 = BufferWriteUInt8
ProxyBuffer.prototype.writeUInt16LE = BufferWriteUInt16LE
ProxyBuffer.prototype.writeUInt16BE = BufferWriteUInt16BE
ProxyBuffer.prototype.writeUInt32LE = BufferWriteUInt32LE
ProxyBuffer.prototype.writeUInt32BE = BufferWriteUInt32BE
ProxyBuffer.prototype.writeInt8 = BufferWriteInt8
ProxyBuffer.prototype.writeInt16LE = BufferWriteInt16LE
ProxyBuffer.prototype.writeInt16BE = BufferWriteInt16BE
ProxyBuffer.prototype.writeInt32LE = BufferWriteInt32LE
ProxyBuffer.prototype.writeInt32BE = BufferWriteInt32BE
ProxyBuffer.prototype.writeFloatLE = BufferWriteFloatLE
ProxyBuffer.prototype.writeFloatBE = BufferWriteFloatBE
ProxyBuffer.prototype.writeDoubleLE = BufferWriteDoubleLE
ProxyBuffer.prototype.writeDoubleBE = BufferWriteDoubleBE
ProxyBuffer.prototype.fill = BufferFill
ProxyBuffer.prototype.inspect = BufferInspect
ProxyBuffer.prototype.toArrayBuffer = BufferToArrayBuffer
ProxyBuffer.prototype._isBuffer = true
ProxyBuffer.prototype.subarray = function () {
  return this._arr.subarray.apply(this._arr, arguments)
}
ProxyBuffer.prototype.set = function () {
  return this._arr.set.apply(this._arr, arguments)
}

var ProxyHandler = {
  get: function (target, name) {
    if (name in target) return target[name]
    else return target._arr[name]
  },
  set: function (target, name, value) {
    target._arr[name] = value
  }
}

function augment (arr) {
  if (browserSupport === undefined) {
    browserSupport = _browserSupport()
  }

  if (browserSupport) {
    // Augment the Uint8Array *instance* (not the class!) with Buffer methods
    arr.write = BufferWrite
    arr.toString = BufferToString
    arr.toLocaleString = BufferToString
    arr.toJSON = BufferToJSON
    arr.copy = BufferCopy
    arr.slice = BufferSlice
    arr.readUInt8 = BufferReadUInt8
    arr.readUInt16LE = BufferReadUInt16LE
    arr.readUInt16BE = BufferReadUInt16BE
    arr.readUInt32LE = BufferReadUInt32LE
    arr.readUInt32BE = BufferReadUInt32BE
    arr.readInt8 = BufferReadInt8
    arr.readInt16LE = BufferReadInt16LE
    arr.readInt16BE = BufferReadInt16BE
    arr.readInt32LE = BufferReadInt32LE
    arr.readInt32BE = BufferReadInt32BE
    arr.readFloatLE = BufferReadFloatLE
    arr.readFloatBE = BufferReadFloatBE
    arr.readDoubleLE = BufferReadDoubleLE
    arr.readDoubleBE = BufferReadDoubleBE
    arr.writeUInt8 = BufferWriteUInt8
    arr.writeUInt16LE = BufferWriteUInt16LE
    arr.writeUInt16BE = BufferWriteUInt16BE
    arr.writeUInt32LE = BufferWriteUInt32LE
    arr.writeUInt32BE = BufferWriteUInt32BE
    arr.writeInt8 = BufferWriteInt8
    arr.writeInt16LE = BufferWriteInt16LE
    arr.writeInt16BE = BufferWriteInt16BE
    arr.writeInt32LE = BufferWriteInt32LE
    arr.writeInt32BE = BufferWriteInt32BE
    arr.writeFloatLE = BufferWriteFloatLE
    arr.writeFloatBE = BufferWriteFloatBE
    arr.writeDoubleLE = BufferWriteDoubleLE
    arr.writeDoubleBE = BufferWriteDoubleBE
    arr.fill = BufferFill
    arr.inspect = BufferInspect
    arr.toArrayBuffer = BufferToArrayBuffer
    arr._isBuffer = true

    if (arr.byteLength !== 0)
      arr._dataview = new xDataView(arr.buffer, arr.byteOffset, arr.byteLength)

    return arr

  } else {
    // This is a browser that doesn't support augmenting the `Uint8Array`
    // instance (*ahem* Firefox) so use an ES6 `Proxy`.
    var proxyBuffer = new ProxyBuffer(arr)
    var proxy = new Proxy(proxyBuffer, ProxyHandler)
    proxyBuffer._proxy = proxy
    return proxy
  }
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArrayIsh (subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }

  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }

  return byteArray
}

function base64ToBytes (str) {
  return require('base64-js').toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos, i = 0
  while (i < length) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break

    dst[i + offset] = src[i]
    i++
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

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint (value, max) {
  assert(typeof (value) == 'number', 'cannot write a non-number as a number')
  assert(value >= 0,
      'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert(typeof (value) == 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754(value, max, min) {
  assert(typeof (value) == 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":3,"typedarray":4}],"native-buffer-browserify":[function(require,module,exports){
module.exports=require('PcZj9L');
},{}],3:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],4:[function(require,module,exports){
var undefined = (void 0); // Paranoia

// Beyond this value, index getters/setters (i.e. array[0], array[1]) are so slow to
// create, and consume so much memory, that the browser appears frozen.
var MAX_ARRAY_LENGTH = 1e5;

// Approximations of internal ECMAScript conversion functions
var ECMAScript = (function() {
  // Stash a copy in case other scripts modify these
  var opts = Object.prototype.toString,
      ophop = Object.prototype.hasOwnProperty;

  return {
    // Class returns internal [[Class]] property, used to avoid cross-frame instanceof issues:
    Class: function(v) { return opts.call(v).replace(/^\[object *|\]$/g, ''); },
    HasProperty: function(o, p) { return p in o; },
    HasOwnProperty: function(o, p) { return ophop.call(o, p); },
    IsCallable: function(o) { return typeof o === 'function'; },
    ToInt32: function(v) { return v >> 0; },
    ToUint32: function(v) { return v >>> 0; }
  };
}());

// Snapshot intrinsics
var LN2 = Math.LN2,
    abs = Math.abs,
    floor = Math.floor,
    log = Math.log,
    min = Math.min,
    pow = Math.pow,
    round = Math.round;

// ES5: lock down object properties
function configureProperties(obj) {
  if (getOwnPropertyNames && defineProperty) {
    var props = getOwnPropertyNames(obj), i;
    for (i = 0; i < props.length; i += 1) {
      defineProperty(obj, props[i], {
        value: obj[props[i]],
        writable: false,
        enumerable: false,
        configurable: false
      });
    }
  }
}

// emulate ES5 getter/setter API using legacy APIs
// http://blogs.msdn.com/b/ie/archive/2010/09/07/transitioning-existing-code-to-the-es5-getter-setter-apis.aspx
// (second clause tests for Object.defineProperty() in IE<9 that only supports extending DOM prototypes, but
// note that IE<9 does not support __defineGetter__ or __defineSetter__ so it just renders the method harmless)
var defineProperty = Object.defineProperty || function(o, p, desc) {
  if (!o === Object(o)) throw new TypeError("Object.defineProperty called on non-object");
  if (ECMAScript.HasProperty(desc, 'get') && Object.prototype.__defineGetter__) { Object.prototype.__defineGetter__.call(o, p, desc.get); }
  if (ECMAScript.HasProperty(desc, 'set') && Object.prototype.__defineSetter__) { Object.prototype.__defineSetter__.call(o, p, desc.set); }
  if (ECMAScript.HasProperty(desc, 'value')) { o[p] = desc.value; }
  return o;
};

var getOwnPropertyNames = Object.getOwnPropertyNames || function getOwnPropertyNames(o) {
  if (o !== Object(o)) throw new TypeError("Object.getOwnPropertyNames called on non-object");
  var props = [], p;
  for (p in o) {
    if (ECMAScript.HasOwnProperty(o, p)) {
      props.push(p);
    }
  }
  return props;
};

// ES5: Make obj[index] an alias for obj._getter(index)/obj._setter(index, value)
// for index in 0 ... obj.length
function makeArrayAccessors(obj) {
  if (!defineProperty) { return; }

  if (obj.length > MAX_ARRAY_LENGTH) throw new RangeError("Array too large for polyfill");

  function makeArrayAccessor(index) {
    defineProperty(obj, index, {
      'get': function() { return obj._getter(index); },
      'set': function(v) { obj._setter(index, v); },
      enumerable: true,
      configurable: false
    });
  }

  var i;
  for (i = 0; i < obj.length; i += 1) {
    makeArrayAccessor(i);
  }
}

// Internal conversion functions:
//    pack<Type>()   - take a number (interpreted as Type), output a byte array
//    unpack<Type>() - take a byte array, output a Type-like number

function as_signed(value, bits) { var s = 32 - bits; return (value << s) >> s; }
function as_unsigned(value, bits) { var s = 32 - bits; return (value << s) >>> s; }

function packI8(n) { return [n & 0xff]; }
function unpackI8(bytes) { return as_signed(bytes[0], 8); }

function packU8(n) { return [n & 0xff]; }
function unpackU8(bytes) { return as_unsigned(bytes[0], 8); }

function packU8Clamped(n) { n = round(Number(n)); return [n < 0 ? 0 : n > 0xff ? 0xff : n & 0xff]; }

function packI16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
function unpackI16(bytes) { return as_signed(bytes[0] << 8 | bytes[1], 16); }

function packU16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
function unpackU16(bytes) { return as_unsigned(bytes[0] << 8 | bytes[1], 16); }

function packI32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
function unpackI32(bytes) { return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }

function packU32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
function unpackU32(bytes) { return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }

function packIEEE754(v, ebits, fbits) {

  var bias = (1 << (ebits - 1)) - 1,
      s, e, f, ln,
      i, bits, str, bytes;

  function roundToEven(n) {
    var w = floor(n), f = n - w;
    if (f < 0.5)
      return w;
    if (f > 0.5)
      return w + 1;
    return w % 2 ? w + 1 : w;
  }

  // Compute sign, exponent, fraction
  if (v !== v) {
    // NaN
    // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
    e = (1 << ebits) - 1; f = pow(2, fbits - 1); s = 0;
  } else if (v === Infinity || v === -Infinity) {
    e = (1 << ebits) - 1; f = 0; s = (v < 0) ? 1 : 0;
  } else if (v === 0) {
    e = 0; f = 0; s = (1 / v === -Infinity) ? 1 : 0;
  } else {
    s = v < 0;
    v = abs(v);

    if (v >= pow(2, 1 - bias)) {
      e = min(floor(log(v) / LN2), 1023);
      f = roundToEven(v / pow(2, e) * pow(2, fbits));
      if (f / pow(2, fbits) >= 2) {
        e = e + 1;
        f = 1;
      }
      if (e > bias) {
        // Overflow
        e = (1 << ebits) - 1;
        f = 0;
      } else {
        // Normalized
        e = e + bias;
        f = f - pow(2, fbits);
      }
    } else {
      // Denormalized
      e = 0;
      f = roundToEven(v / pow(2, 1 - bias - fbits));
    }
  }

  // Pack sign, exponent, fraction
  bits = [];
  for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = floor(f / 2); }
  for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = floor(e / 2); }
  bits.push(s ? 1 : 0);
  bits.reverse();
  str = bits.join('');

  // Bits to bytes
  bytes = [];
  while (str.length) {
    bytes.push(parseInt(str.substring(0, 8), 2));
    str = str.substring(8);
  }
  return bytes;
}

function unpackIEEE754(bytes, ebits, fbits) {

  // Bytes to bits
  var bits = [], i, j, b, str,
      bias, s, e, f;

  for (i = bytes.length; i; i -= 1) {
    b = bytes[i - 1];
    for (j = 8; j; j -= 1) {
      bits.push(b % 2 ? 1 : 0); b = b >> 1;
    }
  }
  bits.reverse();
  str = bits.join('');

  // Unpack sign, exponent, fraction
  bias = (1 << (ebits - 1)) - 1;
  s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
  e = parseInt(str.substring(1, 1 + ebits), 2);
  f = parseInt(str.substring(1 + ebits), 2);

  // Produce number
  if (e === (1 << ebits) - 1) {
    return f !== 0 ? NaN : s * Infinity;
  } else if (e > 0) {
    // Normalized
    return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
  } else if (f !== 0) {
    // Denormalized
    return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
  } else {
    return s < 0 ? -0 : 0;
  }
}

function unpackF64(b) { return unpackIEEE754(b, 11, 52); }
function packF64(v) { return packIEEE754(v, 11, 52); }
function unpackF32(b) { return unpackIEEE754(b, 8, 23); }
function packF32(v) { return packIEEE754(v, 8, 23); }


//
// 3 The ArrayBuffer Type
//

(function() {

  /** @constructor */
  var ArrayBuffer = function ArrayBuffer(length) {
    length = ECMAScript.ToInt32(length);
    if (length < 0) throw new RangeError('ArrayBuffer size is not a small enough positive integer');

    this.byteLength = length;
    this._bytes = [];
    this._bytes.length = length;

    var i;
    for (i = 0; i < this.byteLength; i += 1) {
      this._bytes[i] = 0;
    }

    configureProperties(this);
  };

  exports.ArrayBuffer = exports.ArrayBuffer || ArrayBuffer;

  //
  // 4 The ArrayBufferView Type
  //

  // NOTE: this constructor is not exported
  /** @constructor */
  var ArrayBufferView = function ArrayBufferView() {
    //this.buffer = null;
    //this.byteOffset = 0;
    //this.byteLength = 0;
  };

  //
  // 5 The Typed Array View Types
  //

  function makeConstructor(bytesPerElement, pack, unpack) {
    // Each TypedArray type requires a distinct constructor instance with
    // identical logic, which this produces.

    var ctor;
    ctor = function(buffer, byteOffset, length) {
      var array, sequence, i, s;

      if (!arguments.length || typeof arguments[0] === 'number') {
        // Constructor(unsigned long length)
        this.length = ECMAScript.ToInt32(arguments[0]);
        if (length < 0) throw new RangeError('ArrayBufferView size is not a small enough positive integer');

        this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        this.buffer = new ArrayBuffer(this.byteLength);
        this.byteOffset = 0;
      } else if (typeof arguments[0] === 'object' && arguments[0].constructor === ctor) {
        // Constructor(TypedArray array)
        array = arguments[0];

        this.length = array.length;
        this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        this.buffer = new ArrayBuffer(this.byteLength);
        this.byteOffset = 0;

        for (i = 0; i < this.length; i += 1) {
          this._setter(i, array._getter(i));
        }
      } else if (typeof arguments[0] === 'object' &&
                 !(arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')) {
        // Constructor(sequence<type> array)
        sequence = arguments[0];

        this.length = ECMAScript.ToUint32(sequence.length);
        this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        this.buffer = new ArrayBuffer(this.byteLength);
        this.byteOffset = 0;

        for (i = 0; i < this.length; i += 1) {
          s = sequence[i];
          this._setter(i, Number(s));
        }
      } else if (typeof arguments[0] === 'object' &&
                 (arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')) {
        // Constructor(ArrayBuffer buffer,
        //             optional unsigned long byteOffset, optional unsigned long length)
        this.buffer = buffer;

        this.byteOffset = ECMAScript.ToUint32(byteOffset);
        if (this.byteOffset > this.buffer.byteLength) {
          throw new RangeError("byteOffset out of range");
        }

        if (this.byteOffset % this.BYTES_PER_ELEMENT) {
          // The given byteOffset must be a multiple of the element
          // size of the specific type, otherwise an exception is raised.
          throw new RangeError("ArrayBuffer length minus the byteOffset is not a multiple of the element size.");
        }

        if (arguments.length < 3) {
          this.byteLength = this.buffer.byteLength - this.byteOffset;

          if (this.byteLength % this.BYTES_PER_ELEMENT) {
            throw new RangeError("length of buffer minus byteOffset not a multiple of the element size");
          }
          this.length = this.byteLength / this.BYTES_PER_ELEMENT;
        } else {
          this.length = ECMAScript.ToUint32(length);
          this.byteLength = this.length * this.BYTES_PER_ELEMENT;
        }

        if ((this.byteOffset + this.byteLength) > this.buffer.byteLength) {
          throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
        }
      } else {
        throw new TypeError("Unexpected argument type(s)");
      }

      this.constructor = ctor;

      configureProperties(this);
      makeArrayAccessors(this);
    };

    ctor.prototype = new ArrayBufferView();
    ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement;
    ctor.prototype._pack = pack;
    ctor.prototype._unpack = unpack;
    ctor.BYTES_PER_ELEMENT = bytesPerElement;

    // getter type (unsigned long index);
    ctor.prototype._getter = function(index) {
      if (arguments.length < 1) throw new SyntaxError("Not enough arguments");

      index = ECMAScript.ToUint32(index);
      if (index >= this.length) {
        return undefined;
      }

      var bytes = [], i, o;
      for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
           i < this.BYTES_PER_ELEMENT;
           i += 1, o += 1) {
        bytes.push(this.buffer._bytes[o]);
      }
      return this._unpack(bytes);
    };

    // NONSTANDARD: convenience alias for getter: type get(unsigned long index);
    ctor.prototype.get = ctor.prototype._getter;

    // setter void (unsigned long index, type value);
    ctor.prototype._setter = function(index, value) {
      if (arguments.length < 2) throw new SyntaxError("Not enough arguments");

      index = ECMAScript.ToUint32(index);
      if (index >= this.length) {
        return undefined;
      }

      var bytes = this._pack(value), i, o;
      for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
           i < this.BYTES_PER_ELEMENT;
           i += 1, o += 1) {
        this.buffer._bytes[o] = bytes[i];
      }
    };

    // void set(TypedArray array, optional unsigned long offset);
    // void set(sequence<type> array, optional unsigned long offset);
    ctor.prototype.set = function(index, value) {
      if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
      var array, sequence, offset, len,
          i, s, d,
          byteOffset, byteLength, tmp;

      if (typeof arguments[0] === 'object' && arguments[0].constructor === this.constructor) {
        // void set(TypedArray array, optional unsigned long offset);
        array = arguments[0];
        offset = ECMAScript.ToUint32(arguments[1]);

        if (offset + array.length > this.length) {
          throw new RangeError("Offset plus length of array is out of range");
        }

        byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
        byteLength = array.length * this.BYTES_PER_ELEMENT;

        if (array.buffer === this.buffer) {
          tmp = [];
          for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
            tmp[i] = array.buffer._bytes[s];
          }
          for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
            this.buffer._bytes[d] = tmp[i];
          }
        } else {
          for (i = 0, s = array.byteOffset, d = byteOffset;
               i < byteLength; i += 1, s += 1, d += 1) {
            this.buffer._bytes[d] = array.buffer._bytes[s];
          }
        }
      } else if (typeof arguments[0] === 'object' && typeof arguments[0].length !== 'undefined') {
        // void set(sequence<type> array, optional unsigned long offset);
        sequence = arguments[0];
        len = ECMAScript.ToUint32(sequence.length);
        offset = ECMAScript.ToUint32(arguments[1]);

        if (offset + len > this.length) {
          throw new RangeError("Offset plus length of array is out of range");
        }

        for (i = 0; i < len; i += 1) {
          s = sequence[i];
          this._setter(offset + i, Number(s));
        }
      } else {
        throw new TypeError("Unexpected argument type(s)");
      }
    };

    // TypedArray subarray(long begin, optional long end);
    ctor.prototype.subarray = function(start, end) {
      function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

      start = ECMAScript.ToInt32(start);
      end = ECMAScript.ToInt32(end);

      if (arguments.length < 1) { start = 0; }
      if (arguments.length < 2) { end = this.length; }

      if (start < 0) { start = this.length + start; }
      if (end < 0) { end = this.length + end; }

      start = clamp(start, 0, this.length);
      end = clamp(end, 0, this.length);

      var len = end - start;
      if (len < 0) {
        len = 0;
      }

      return new this.constructor(
        this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len);
    };

    return ctor;
  }

  var Int8Array = makeConstructor(1, packI8, unpackI8);
  var Uint8Array = makeConstructor(1, packU8, unpackU8);
  var Uint8ClampedArray = makeConstructor(1, packU8Clamped, unpackU8);
  var Int16Array = makeConstructor(2, packI16, unpackI16);
  var Uint16Array = makeConstructor(2, packU16, unpackU16);
  var Int32Array = makeConstructor(4, packI32, unpackI32);
  var Uint32Array = makeConstructor(4, packU32, unpackU32);
  var Float32Array = makeConstructor(4, packF32, unpackF32);
  var Float64Array = makeConstructor(8, packF64, unpackF64);

  exports.Int8Array = exports.Int8Array || Int8Array;
  exports.Uint8Array = exports.Uint8Array || Uint8Array;
  exports.Uint8ClampedArray = exports.Uint8ClampedArray || Uint8ClampedArray;
  exports.Int16Array = exports.Int16Array || Int16Array;
  exports.Uint16Array = exports.Uint16Array || Uint16Array;
  exports.Int32Array = exports.Int32Array || Int32Array;
  exports.Uint32Array = exports.Uint32Array || Uint32Array;
  exports.Float32Array = exports.Float32Array || Float32Array;
  exports.Float64Array = exports.Float64Array || Float64Array;
}());

//
// 6 The DataView View Type
//

(function() {
  function r(array, index) {
    return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index];
  }

  var IS_BIG_ENDIAN = (function() {
    var u16array = new(exports.Uint16Array)([0x1234]),
        u8array = new(exports.Uint8Array)(u16array.buffer);
    return r(u8array, 0) === 0x12;
  }());

  // Constructor(ArrayBuffer buffer,
  //             optional unsigned long byteOffset,
  //             optional unsigned long byteLength)
  /** @constructor */
  var DataView = function DataView(buffer, byteOffset, byteLength) {
    if (arguments.length === 0) {
      buffer = new ArrayBuffer(0);
    } else if (!(buffer instanceof ArrayBuffer || ECMAScript.Class(buffer) === 'ArrayBuffer')) {
      throw new TypeError("TypeError");
    }

    this.buffer = buffer || new ArrayBuffer(0);

    this.byteOffset = ECMAScript.ToUint32(byteOffset);
    if (this.byteOffset > this.buffer.byteLength) {
      throw new RangeError("byteOffset out of range");
    }

    if (arguments.length < 3) {
      this.byteLength = this.buffer.byteLength - this.byteOffset;
    } else {
      this.byteLength = ECMAScript.ToUint32(byteLength);
    }

    if ((this.byteOffset + this.byteLength) > this.buffer.byteLength) {
      throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
    }

    configureProperties(this);
  };

  function makeGetter(arrayType) {
    return function(byteOffset, littleEndian) {

      byteOffset = ECMAScript.ToUint32(byteOffset);

      if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
        throw new RangeError("Array index out of range");
      }
      byteOffset += this.byteOffset;

      var uint8Array = new Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT),
          bytes = [], i;
      for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
        bytes.push(r(uint8Array, i));
      }

      if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
        bytes.reverse();
      }

      return r(new arrayType(new Uint8Array(bytes).buffer), 0);
    };
  }

  DataView.prototype.getUint8 = makeGetter(exports.Uint8Array);
  DataView.prototype.getInt8 = makeGetter(exports.Int8Array);
  DataView.prototype.getUint16 = makeGetter(exports.Uint16Array);
  DataView.prototype.getInt16 = makeGetter(exports.Int16Array);
  DataView.prototype.getUint32 = makeGetter(exports.Uint32Array);
  DataView.prototype.getInt32 = makeGetter(exports.Int32Array);
  DataView.prototype.getFloat32 = makeGetter(exports.Float32Array);
  DataView.prototype.getFloat64 = makeGetter(exports.Float64Array);

  function makeSetter(arrayType) {
    return function(byteOffset, value, littleEndian) {

      byteOffset = ECMAScript.ToUint32(byteOffset);
      if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
        throw new RangeError("Array index out of range");
      }

      // Get bytes
      var typeArray = new arrayType([value]),
          byteArray = new Uint8Array(typeArray.buffer),
          bytes = [], i, byteView;

      for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
        bytes.push(r(byteArray, i));
      }

      // Flip if necessary
      if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
        bytes.reverse();
      }

      // Write them
      byteView = new Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT);
      byteView.set(bytes);
    };
  }

  DataView.prototype.setUint8 = makeSetter(exports.Uint8Array);
  DataView.prototype.setInt8 = makeSetter(exports.Int8Array);
  DataView.prototype.setUint16 = makeSetter(exports.Uint16Array);
  DataView.prototype.setInt16 = makeSetter(exports.Int16Array);
  DataView.prototype.setUint32 = makeSetter(exports.Uint32Array);
  DataView.prototype.setInt32 = makeSetter(exports.Int32Array);
  DataView.prototype.setFloat32 = makeSetter(exports.Float32Array);
  DataView.prototype.setFloat64 = makeSetter(exports.Float64Array);

  exports.DataView = exports.DataView || DataView;

}());

},{}]},{},[])
;;module.exports=require("native-buffer-browserify").Buffer

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
var process=require("__browserify_process");// Copyright Joyent, Inc. and other Node contributors.
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

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

},{"__browserify_process":4}],6:[function(require,module,exports){
"use strict";

var activeLine = "line@activine"

function onCursorActivity(editor) {
  var line = editor.getLineHandle(editor.getCursor().line)
  var active = editor[activeLine]
  if (line != active) {
    editor.removeLineClass(active, "background", "activeline")
    editor[activeLine] = editor.addLineClass(line, "background", "activeline")
  }
}

function setup(editor, value) {
  /**
  Takes editor and enables persists changes to the buffer across the sessions.
  **/
  if (value) {
    editor[activeLine] = editor.addLineClass(0, "background", "activeline")
    editor.on("cursorActivity", onCursorActivity)
    onCursorActivity(editor)
  } else if (activeLine in editor) {
    editor.removeLineClass(editor[activeLine], "background", "activeline")
    delete editor[activeLine]
    editor.off("cursorActivity", onCursorActivity)
  }
}

function plugin(CodeMirror) {
  CodeMirror.defineOption("activeLine", false, setup)
}

module.exports = plugin

},{}],7:[function(require,module,exports){
"use strict";

function onChange(editor) {
  localStorage[window.location.href.split("#")[0]] = editor.getValue()
}

function setup(editor, value) {
  /**
  Takes editor and enables persists changes to the buffer across the sessions.
  **/
  if (value) {
    var address = window.location.href.split("#")[0]
    var persisted = localStorage[address] || editor.getValue()
    editor.setValue(persisted)
    editor.on("change", onChange)
  } else {
    editor.off("change", onChange)
  }
}

function plugin(CodeMirror) {
  CodeMirror.defineOption("persist", false, setup)
}

module.exports = plugin

},{}],8:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.analyzer',
            doc: void 0
        };
    var wisp_ast = require('./ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var isKeyword = wisp_ast.isKeyword;
    var isQuote = wisp_ast.isQuote;
    var symbol = wisp_ast.symbol;
    var namespace = wisp_ast.namespace;
    var name = wisp_ast.name;
    var prStr = wisp_ast.prStr;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var wisp_sequence = require('./sequence');
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var conj = wisp_sequence.conj;
    var partition = wisp_sequence.partition;
    var seq = wisp_sequence.seq;
    var isEmpty = wisp_sequence.isEmpty;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var isEvery = wisp_sequence.isEvery;
    var concat = wisp_sequence.concat;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var last = wisp_sequence.last;
    var butlast = wisp_sequence.butlast;
    var interleave = wisp_sequence.interleave;
    var cons = wisp_sequence.cons;
    var count = wisp_sequence.count;
    var some = wisp_sequence.some;
    var assoc = wisp_sequence.assoc;
    var reduce = wisp_sequence.reduce;
    var filter = wisp_sequence.filter;
    var isSeq = wisp_sequence.isSeq;
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isDictionary = wisp_runtime.isDictionary;
    var isVector = wisp_runtime.isVector;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isBoolean = wisp_runtime.isBoolean;
    var isDate = wisp_runtime.isDate;
    var isRePattern = wisp_runtime.isRePattern;
    var isEven = wisp_runtime.isEven;
    var isEqual = wisp_runtime.isEqual;
    var max = wisp_runtime.max;
    var dec = wisp_runtime.dec;
    var dictionary = wisp_runtime.dictionary;
    var subs = wisp_runtime.subs;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var wisp_expander = require('./expander');
    var macroexpand = wisp_expander.macroexpand;
    var wisp_string = require('./string');
    var split = wisp_string.split;
    var join = wisp_string.join;
}
var syntaxError = exports.syntaxError = function syntaxError(message, form) {
        return function () {
            var metadataø1 = meta(form);
            var lineø1 = ((metadataø1 || 0)['start'] || 0)['line'];
            var uriø1 = (metadataø1 || 0)['uri'];
            var columnø1 = ((metadataø1 || 0)['start'] || 0)['column'];
            var errorø1 = SyntaxError('' + message + '\n' + 'Form: ' + prStr(form) + '\n' + 'URI: ' + uriø1 + '\n' + 'Line: ' + lineø1 + '\n' + 'Column: ' + columnø1);
            errorø1.lineNumber = lineø1;
            errorø1.line = lineø1;
            errorø1.columnNumber = columnø1;
            errorø1.column = columnø1;
            errorø1.fileName = uriø1;
            errorø1.uri = uriø1;
            return (function () {
                throw errorø1;
            })();
        }.call(this);
    };
var analyzeKeyword = exports.analyzeKeyword = function analyzeKeyword(env, form) {
        return {
            'op': 'constant',
            'form': form
        };
    };
var __specials__ = exports.__specials__ = {};
var installSpecial = exports.installSpecial = function installSpecial(op, analyzer) {
        return (__specials__ || 0)[name(op)] = analyzer;
    };
var analyzeSpecial = exports.analyzeSpecial = function analyzeSpecial(analyzer, env, form) {
        return function () {
            var metadataø1 = meta(form);
            var astø1 = analyzer(env, form);
            return conj({
                'start': (metadataø1 || 0)['start'],
                'end': (metadataø1 || 0)['end']
            }, astø1);
        }.call(this);
    };
var analyzeIf = exports.analyzeIf = function analyzeIf(env, form) {
        return function () {
            var formsø1 = rest(form);
            var testø1 = analyze(env, first(formsø1));
            var consequentø1 = analyze(env, second(formsø1));
            var alternateø1 = analyze(env, third(formsø1));
            count(formsø1) < 2 ? syntaxError('Malformed if expression, too few operands', form) : void 0;
            return {
                'op': 'if',
                'form': form,
                'test': testø1,
                'consequent': consequentø1,
                'alternate': alternateø1
            };
        }.call(this);
    };
installSpecial('if', analyzeIf);
var analyzeThrow = exports.analyzeThrow = function analyzeThrow(env, form) {
        return function () {
            var expressionø1 = analyze(env, second(form));
            return {
                'op': 'throw',
                'form': form,
                'throw': expressionø1
            };
        }.call(this);
    };
installSpecial('throw', analyzeThrow);
var analyzeTry = exports.analyzeTry = function analyzeTry(env, form) {
        return function () {
            var formsø1 = vec(rest(form));
            var tailø1 = last(formsø1);
            var finalizerFormø1 = isList(tailø1) && isEqual(symbol(void 0, 'finally'), first(tailø1)) ? rest(tailø1) : void 0;
            var finalizerø1 = finalizerFormø1 ? analyzeBlock(env, finalizerFormø1) : void 0;
            var bodyFormø1 = finalizerø1 ? butlast(formsø1) : formsø1;
            var tailø2 = last(bodyFormø1);
            var handlerFormø1 = isList(tailø2) && isEqual(symbol(void 0, 'catch'), first(tailø2)) ? rest(tailø2) : void 0;
            var handlerø1 = handlerFormø1 ? conj({ 'name': analyze(env, first(handlerFormø1)) }, analyzeBlock(env, rest(handlerFormø1))) : void 0;
            var bodyø1 = handlerFormø1 ? analyzeBlock(env, butlast(bodyFormø1)) : analyzeBlock(env, bodyFormø1);
            return {
                'op': 'try',
                'form': form,
                'body': bodyø1,
                'handler': handlerø1,
                'finalizer': finalizerø1
            };
        }.call(this);
    };
installSpecial('try', analyzeTry);
var analyzeSet = exports.analyzeSet = function analyzeSet(env, form) {
        return function () {
            var bodyø1 = rest(form);
            var leftø1 = first(bodyø1);
            var rightø1 = second(bodyø1);
            var targetø1 = isSymbol(leftø1) ? analyzeSymbol(env, leftø1) : isList(leftø1) ? analyzeList(env, leftø1) : 'else' ? leftø1 : void 0;
            var valueø1 = analyze(env, rightø1);
            return {
                'op': 'set!',
                'target': targetø1,
                'value': valueø1,
                'form': form
            };
        }.call(this);
    };
installSpecial('set!', analyzeSet);
var analyzeNew = exports.analyzeNew = function analyzeNew(env, form) {
        return function () {
            var bodyø1 = rest(form);
            var constructorø1 = analyze(env, first(bodyø1));
            var paramsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, rest(bodyø1)));
            return {
                'op': 'new',
                'constructor': constructorø1,
                'form': form,
                'params': paramsø1
            };
        }.call(this);
    };
installSpecial('new', analyzeNew);
var analyzeAget = exports.analyzeAget = function analyzeAget(env, form) {
        return function () {
            var bodyø1 = rest(form);
            var targetø1 = analyze(env, first(bodyø1));
            var attributeø1 = second(bodyø1);
            var fieldø1 = isQuote(attributeø1) && isSymbol(second(attributeø1)) && second(attributeø1);
            return isNil(attributeø1) ? syntaxError('Malformed aget expression expected (aget object member)', form) : {
                'op': 'member-expression',
                'computed': !fieldø1,
                'form': form,
                'target': targetø1,
                'property': fieldø1 ? conj(analyzeSpecial(analyzeIdentifier, env, fieldø1), { 'binding': void 0 }) : analyze(env, attributeø1)
            };
        }.call(this);
    };
installSpecial('aget', analyzeAget);
var parseDef = exports.parseDef = function parseDef() {
        switch (arguments.length) {
        case 1:
            var id = arguments[0];
            return { 'id': id };
        case 2:
            var id = arguments[0];
            var init = arguments[1];
            return {
                'id': id,
                'init': init
            };
        case 3:
            var id = arguments[0];
            var doc = arguments[1];
            var init = arguments[2];
            return {
                'id': id,
                'doc': doc,
                'init': init
            };
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var analyzeDef = exports.analyzeDef = function analyzeDef(env, form) {
        return function () {
            var paramsø1 = parseDef.apply(void 0, vec(rest(form)));
            var idø1 = (paramsø1 || 0)['id'];
            var metadataø1 = meta(idø1);
            var bindingø1 = analyzeSpecial(analyzeDeclaration, env, idø1);
            var initø1 = analyze(env, (paramsø1 || 0)['init']);
            var docø1 = (paramsø1 || 0)['doc'] || (metadataø1 || 0)['doc'];
            return {
                'op': 'def',
                'doc': docø1,
                'id': bindingø1,
                'init': initø1,
                'export': (env || 0)['top'] && !(metadataø1 || 0)['private'],
                'form': form
            };
        }.call(this);
    };
installSpecial('def', analyzeDef);
var analyzeDo = exports.analyzeDo = function analyzeDo(env, form) {
        return function () {
            var expressionsø1 = rest(form);
            var bodyø1 = analyzeBlock(env, expressionsø1);
            return conj(bodyø1, {
                'op': 'do',
                'form': form
            });
        }.call(this);
    };
installSpecial('do', analyzeDo);
var analyzeSymbol = exports.analyzeSymbol = function analyzeSymbol(env, form) {
        return function () {
            var formsø1 = split(name(form), '.');
            var metadataø1 = meta(form);
            var startø1 = (metadataø1 || 0)['start'];
            var endø1 = (metadataø1 || 0)['end'];
            var expansionø1 = count(formsø1) > 1 ? list(symbol(void 0, 'aget'), withMeta(symbol(first(formsø1)), conj(metadataø1, {
                    'start': startø1,
                    'end': {
                        'line': (endø1 || 0)['line'],
                        'column': 1 + (startø1 || 0)['column'] + count(first(formsø1))
                    }
                })), list(symbol(void 0, 'quote'), withMeta(symbol(join('.', rest(formsø1))), conj(metadataø1, {
                    'end': endø1,
                    'start': {
                        'line': (startø1 || 0)['line'],
                        'column': 1 + (startø1 || 0)['column'] + count(first(formsø1))
                    }
                })))) : void 0;
            return expansionø1 ? analyze(env, withMeta(expansionø1, meta(form))) : analyzeSpecial(analyzeIdentifier, env, form);
        }.call(this);
    };
var analyzeIdentifier = exports.analyzeIdentifier = function analyzeIdentifier(env, form) {
        return {
            'op': 'var',
            'type': 'identifier',
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end'],
            'binding': resolveBinding(env, form)
        };
    };
var unresolvedBinding = exports.unresolvedBinding = function unresolvedBinding(env, form) {
        return {
            'op': 'unresolved-binding',
            'type': 'unresolved-binding',
            'identifier': {
                'type': 'identifier',
                'form': symbol(namespace(form), name(form))
            },
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        };
    };
var resolveBinding = exports.resolveBinding = function resolveBinding(env, form) {
        return ((env || 0)['locals'] || 0)[name(form)] || ((env || 0)['enclosed'] || 0)[name(form)] || unresolvedBinding(env, form);
    };
var analyzeShadow = exports.analyzeShadow = function analyzeShadow(env, id) {
        return function () {
            var bindingø1 = resolveBinding(env, id);
            return {
                'depth': inc((bindingø1 || 0)['depth'] || 0),
                'shadow': bindingø1
            };
        }.call(this);
    };
var analyzeBinding = exports.analyzeBinding = function analyzeBinding(env, form) {
        return function () {
            var idø1 = first(form);
            var bodyø1 = second(form);
            return conj(analyzeShadow(env, idø1), {
                'op': 'binding',
                'type': 'binding',
                'id': idø1,
                'init': analyze(env, bodyø1),
                'form': form
            });
        }.call(this);
    };
var analyzeDeclaration = exports.analyzeDeclaration = function analyzeDeclaration(env, form) {
        !!(namespace(form) || 1 < count(split('.', '' + form))) ? (function () {
            throw Error('' + 'Assert failed: ' + '' + '(not (or (namespace form) (< 1 (count (split "." (str form))))))');
        })() : void 0;
        return conj(analyzeShadow(env, form), {
            'op': 'var',
            'type': 'identifier',
            'depth': 0,
            'id': form,
            'form': form
        });
    };
var analyzeParam = exports.analyzeParam = function analyzeParam(env, form) {
        return conj(analyzeShadow(env, form), {
            'op': 'param',
            'type': 'parameter',
            'id': form,
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        });
    };
var withBinding = exports.withBinding = function withBinding(env, form) {
        return conj(env, {
            'locals': assoc((env || 0)['locals'], name((form || 0)['id']), form),
            'bindings': conj((env || 0)['bindings'], form)
        });
    };
var withParam = exports.withParam = function withParam(env, form) {
        return conj(withBinding(env, form), { 'params': conj((env || 0)['params'], form) });
    };
var subEnv = exports.subEnv = function subEnv(env) {
        return {
            'enclosed': conj({}, (env || 0)['enclosed'], (env || 0)['locals']),
            'locals': {},
            'bindings': [],
            'params': (env || 0)['params'] || []
        };
    };
var analyzeLet_ = exports.analyzeLet_ = function analyzeLet_(env, form, isLoop) {
        return function () {
            var expressionsø1 = rest(form);
            var bindingsø1 = first(expressionsø1);
            var bodyø1 = rest(expressionsø1);
            var isValidBindingsø1 = isVector(bindingsø1) && isEven(count(bindingsø1));
            var _ø1 = !isValidBindingsø1 ? (function () {
                    throw Error('' + 'Assert failed: ' + 'bindings must be vector of even number of elements' + 'valid-bindings?');
                })() : void 0;
            var scopeø1 = reduce(function ($1, $2) {
                    return withBinding($1, analyzeBinding($1, $2));
                }, subEnv(env), partition(2, bindingsø1));
            var bindingsø2 = (scopeø1 || 0)['bindings'];
            var expressionsø2 = analyzeBlock(isLoop ? conj(scopeø1, { 'params': bindingsø2 }) : scopeø1, bodyø1);
            return {
                'op': 'let',
                'form': form,
                'start': (meta(form) || 0)['start'],
                'end': (meta(form) || 0)['end'],
                'bindings': bindingsø2,
                'statements': (expressionsø2 || 0)['statements'],
                'result': (expressionsø2 || 0)['result']
            };
        }.call(this);
    };
var analyzeLet = exports.analyzeLet = function analyzeLet(env, form) {
        return analyzeLet_(env, form, false);
    };
installSpecial('let', analyzeLet);
var analyzeLoop = exports.analyzeLoop = function analyzeLoop(env, form) {
        return conj(analyzeLet_(env, form, true), { 'op': 'loop' });
    };
installSpecial('loop', analyzeLoop);
var analyzeRecur = exports.analyzeRecur = function analyzeRecur(env, form) {
        return function () {
            var paramsø1 = (env || 0)['params'];
            var formsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, rest(form)));
            return isEqual(count(paramsø1), count(formsø1)) ? {
                'op': 'recur',
                'form': form,
                'params': formsø1
            } : syntaxError('Recurs with wrong number of arguments', form);
        }.call(this);
    };
installSpecial('recur', analyzeRecur);
var analyzeQuotedList = exports.analyzeQuotedList = function analyzeQuotedList(form) {
        return {
            'op': 'list',
            'items': map(analyzeQuoted, vec(form)),
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        };
    };
var analyzeQuotedVector = exports.analyzeQuotedVector = function analyzeQuotedVector(form) {
        return {
            'op': 'vector',
            'items': map(analyzeQuoted, form),
            'form': form,
            'start': (meta(form) || 0)['start'],
            'end': (meta(form) || 0)['end']
        };
    };
var analyzeQuotedDictionary = exports.analyzeQuotedDictionary = function analyzeQuotedDictionary(form) {
        return function () {
            var namesø1 = vec(map(analyzeQuoted, keys(form)));
            var valuesø1 = vec(map(analyzeQuoted, vals(form)));
            return {
                'op': 'dictionary',
                'form': form,
                'keys': namesø1,
                'values': valuesø1,
                'start': (meta(form) || 0)['start'],
                'end': (meta(form) || 0)['end']
            };
        }.call(this);
    };
var analyzeQuotedSymbol = exports.analyzeQuotedSymbol = function analyzeQuotedSymbol(form) {
        return {
            'op': 'symbol',
            'name': name(form),
            'namespace': namespace(form),
            'form': form
        };
    };
var analyzeQuotedKeyword = exports.analyzeQuotedKeyword = function analyzeQuotedKeyword(form) {
        return {
            'op': 'keyword',
            'name': name(form),
            'namespace': namespace(form),
            'form': form
        };
    };
var analyzeQuoted = exports.analyzeQuoted = function analyzeQuoted(form) {
        return isSymbol(form) ? analyzeQuotedSymbol(form) : isKeyword(form) ? analyzeQuotedKeyword(form) : isList(form) ? analyzeQuotedList(form) : isVector(form) ? analyzeQuotedVector(form) : isDictionary(form) ? analyzeQuotedDictionary(form) : 'else' ? {
            'op': 'constant',
            'form': form
        } : void 0;
    };
var analyzeQuote = exports.analyzeQuote = function analyzeQuote(env, form) {
        return analyzeQuoted(second(form));
    };
installSpecial('quote', analyzeQuote);
var analyzeStatement = exports.analyzeStatement = function analyzeStatement(env, form) {
        return function () {
            var statementsø1 = (env || 0)['statements'] || [];
            var bindingsø1 = (env || 0)['bindings'] || [];
            var statementø1 = analyze(env, form);
            var opø1 = (statementø1 || 0)['op'];
            var defsø1 = isEqual(opø1, 'def') ? [(statementø1 || 0)['var']] : 'else' ? void 0 : void 0;
            return conj(env, {
                'statements': conj(statementsø1, statementø1),
                'bindings': concat(bindingsø1, defsø1)
            });
        }.call(this);
    };
var analyzeBlock = exports.analyzeBlock = function analyzeBlock(env, form) {
        return function () {
            var bodyø1 = count(form) > 1 ? reduce(analyzeStatement, env, butlast(form)) : void 0;
            var resultø1 = analyze(bodyø1 || env, last(form));
            return {
                'statements': (bodyø1 || 0)['statements'],
                'result': resultø1
            };
        }.call(this);
    };
var analyzeFnMethod = exports.analyzeFnMethod = function analyzeFnMethod(env, form) {
        return function () {
            var signatureø1 = isList(form) && isVector(first(form)) ? first(form) : syntaxError('Malformed fn overload form', form);
            var bodyø1 = rest(form);
            var variadicø1 = some(function ($1) {
                    return isEqual(symbol(void 0, '&'), $1);
                }, signatureø1);
            var paramsø1 = variadicø1 ? filter(function ($1) {
                    return !isEqual(symbol(void 0, '&'), $1);
                }, signatureø1) : signatureø1;
            var arityø1 = variadicø1 ? dec(count(paramsø1)) : count(paramsø1);
            var scopeø1 = reduce(function ($1, $2) {
                    return withParam($1, analyzeParam($1, $2));
                }, conj(env, { 'params': [] }), paramsø1);
            return conj(analyzeBlock(scopeø1, bodyø1), {
                'op': 'overload',
                'variadic': variadicø1,
                'arity': arityø1,
                'params': (scopeø1 || 0)['params'],
                'form': form
            });
        }.call(this);
    };
var analyzeFn = exports.analyzeFn = function analyzeFn(env, form) {
        return function () {
            var formsø1 = rest(form);
            var formsø2 = isSymbol(first(formsø1)) ? formsø1 : cons(void 0, formsø1);
            var idø1 = first(formsø2);
            var bindingø1 = idø1 ? analyzeSpecial(analyzeDeclaration, env, idø1) : void 0;
            var bodyø1 = rest(formsø2);
            var overloadsø1 = isVector(first(bodyø1)) ? list(bodyø1) : isList(first(bodyø1)) && isVector(first(first(bodyø1))) ? bodyø1 : 'else' ? syntaxError('' + 'Malformed fn expression, ' + 'parameter declaration (' + prStr(first(bodyø1)) + ') must be a vector', form) : void 0;
            var scopeø1 = bindingø1 ? withBinding(subEnv(env), bindingø1) : subEnv(env);
            var methodsø1 = map(function ($1) {
                    return analyzeFnMethod(scopeø1, $1);
                }, vec(overloadsø1));
            var arityø1 = max.apply(void 0, map(function ($1) {
                    return ($1 || 0)['arity'];
                }, methodsø1));
            var variadicø1 = some(function ($1) {
                    return ($1 || 0)['variadic'];
                }, methodsø1);
            return {
                'op': 'fn',
                'type': 'function',
                'id': bindingø1,
                'variadic': variadicø1,
                'methods': methodsø1,
                'form': form
            };
        }.call(this);
    };
installSpecial('fn', analyzeFn);
var parseReferences = exports.parseReferences = function parseReferences(forms) {
        return reduce(function (references, form) {
            return isSeq(form) ? assoc(references, name(first(form)), vec(rest(form))) : references;
        }, {}, forms);
    };
var parseRequire = exports.parseRequire = function parseRequire(form) {
        return function () {
            var requirementø1 = isSymbol(form) ? [form] : vec(form);
            var idø1 = first(requirementø1);
            var paramsø1 = dictionary.apply(void 0, rest(requirementø1));
            var renamesø1 = (paramsø1 || 0)['\uA789rename'];
            var namesø1 = (paramsø1 || 0)['\uA789refer'];
            var aliasø1 = (paramsø1 || 0)['\uA789as'];
            var referencesø1 = !isEmpty(namesø1) ? reduce(function (refers, reference) {
                    return conj(refers, {
                        'op': 'refer',
                        'form': reference,
                        'name': reference,
                        'rename': (renamesø1 || 0)[reference] || (renamesø1 || 0)[name(reference)],
                        'ns': idø1
                    });
                }, [], namesø1) : void 0;
            return {
                'op': 'require',
                'alias': aliasø1,
                'ns': idø1,
                'refer': referencesø1,
                'form': form
            };
        }.call(this);
    };
var analyzeNs = exports.analyzeNs = function analyzeNs(env, form) {
        return function () {
            var formsø1 = rest(form);
            var nameø1 = first(formsø1);
            var bodyø1 = rest(formsø1);
            var docø1 = isString(first(bodyø1)) ? first(bodyø1) : void 0;
            var referencesø1 = parseReferences(docø1 ? rest(bodyø1) : bodyø1);
            var requirementsø1 = (referencesø1 || 0)['require'] ? map(parseRequire, (referencesø1 || 0)['require']) : void 0;
            return {
                'op': 'ns',
                'name': nameø1,
                'doc': docø1,
                'require': requirementsø1 ? vec(requirementsø1) : void 0,
                'form': form
            };
        }.call(this);
    };
installSpecial('ns', analyzeNs);
var analyzeList = exports.analyzeList = function analyzeList(env, form) {
        return function () {
            var expansionø1 = macroexpand(form);
            var operatorø1 = first(form);
            var analyzerø1 = isSymbol(operatorø1) && (__specials__ || 0)[name(operatorø1)];
            return !(expansionø1 === form) ? analyze(env, expansionø1) : analyzerø1 ? analyzeSpecial(analyzerø1, env, expansionø1) : 'else' ? analyzeInvoke(env, expansionø1) : void 0;
        }.call(this);
    };
var analyzeVector = exports.analyzeVector = function analyzeVector(env, form) {
        return function () {
            var itemsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, form));
            return {
                'op': 'vector',
                'form': form,
                'items': itemsø1
            };
        }.call(this);
    };
var analyzeDictionary = exports.analyzeDictionary = function analyzeDictionary(env, form) {
        return function () {
            var namesø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, keys(form)));
            var valuesø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, vals(form)));
            return {
                'op': 'dictionary',
                'keys': namesø1,
                'values': valuesø1,
                'form': form
            };
        }.call(this);
    };
var analyzeInvoke = exports.analyzeInvoke = function analyzeInvoke(env, form) {
        return function () {
            var calleeø1 = analyze(env, first(form));
            var paramsø1 = vec(map(function ($1) {
                    return analyze(env, $1);
                }, rest(form)));
            return {
                'op': 'invoke',
                'callee': calleeø1,
                'params': paramsø1,
                'form': form
            };
        }.call(this);
    };
var analyzeConstant = exports.analyzeConstant = function analyzeConstant(env, form) {
        return {
            'op': 'constant',
            'form': form
        };
    };
var analyze = exports.analyze = function analyze() {
        switch (arguments.length) {
        case 1:
            var form = arguments[0];
            return analyze({
                'locals': {},
                'bindings': [],
                'top': true
            }, form);
        case 2:
            var env = arguments[0];
            var form = arguments[1];
            return isNil(form) ? analyzeConstant(env, form) : isSymbol(form) ? analyzeSymbol(env, form) : isList(form) ? isEmpty(form) ? analyzeQuoted(form) : analyzeList(env, form) : isDictionary(form) ? analyzeDictionary(env, form) : isVector(form) ? analyzeVector(env, form) : isKeyword(form) ? analyzeKeyword(env, form) : 'else' ? analyzeConstant(env, form) : void 0;
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvYW5hbHl6ZXIud2lzcCJdLCJuYW1lcyI6WyJtZXRhIiwid2l0aE1ldGEiLCJpc1N5bWJvbCIsImlzS2V5d29yZCIsImlzUXVvdGUiLCJzeW1ib2wiLCJuYW1lc3BhY2UiLCJuYW1lIiwicHJTdHIiLCJpc1VucXVvdGUiLCJpc1VucXVvdGVTcGxpY2luZyIsImlzTGlzdCIsImxpc3QiLCJjb25qIiwicGFydGl0aW9uIiwic2VxIiwiaXNFbXB0eSIsIm1hcCIsInZlYyIsImlzRXZlcnkiLCJjb25jYXQiLCJmaXJzdCIsInNlY29uZCIsInRoaXJkIiwicmVzdCIsImxhc3QiLCJidXRsYXN0IiwiaW50ZXJsZWF2ZSIsImNvbnMiLCJjb3VudCIsInNvbWUiLCJhc3NvYyIsInJlZHVjZSIsImZpbHRlciIsImlzU2VxIiwiaXNOaWwiLCJpc0RpY3Rpb25hcnkiLCJpc1ZlY3RvciIsImtleXMiLCJ2YWxzIiwiaXNTdHJpbmciLCJpc051bWJlciIsImlzQm9vbGVhbiIsImlzRGF0ZSIsImlzUmVQYXR0ZXJuIiwiaXNFdmVuIiwiaXNFcXVhbCIsIm1heCIsImRlYyIsImRpY3Rpb25hcnkiLCJzdWJzIiwiaW5jIiwibWFjcm9leHBhbmQiLCJzcGxpdCIsImpvaW4iLCJzeW50YXhFcnJvciIsIm1lc3NhZ2UiLCJmb3JtIiwibWV0YWRhdGHDuDEiLCJsaW5lw7gxIiwidXJpw7gxIiwiY29sdW1uw7gxIiwiZXJyb3LDuDEiLCJTeW50YXhFcnJvciIsImxpbmVOdW1iZXIiLCJsaW5lIiwiY29sdW1uTnVtYmVyIiwiY29sdW1uIiwiZmlsZU5hbWUiLCJ1cmkiLCJhbmFseXplS2V5d29yZCIsImVudiIsIl9fc3BlY2lhbHNfXyIsImluc3RhbGxTcGVjaWFsIiwib3AiLCJhbmFseXplciIsImFuYWx5emVTcGVjaWFsIiwiYXN0w7gxIiwiYW5hbHl6ZUlmIiwiZm9ybXPDuDEiLCJ0ZXN0w7gxIiwiYW5hbHl6ZSIsImNvbnNlcXVlbnTDuDEiLCJhbHRlcm5hdGXDuDEiLCJhbmFseXplVGhyb3ciLCJleHByZXNzaW9uw7gxIiwiYW5hbHl6ZVRyeSIsInRhaWzDuDEiLCJmaW5hbGl6ZXJGb3Jtw7gxIiwiZmluYWxpemVyw7gxIiwiYW5hbHl6ZUJsb2NrIiwiYm9keUZvcm3DuDEiLCJ0YWlsw7gyIiwiaGFuZGxlckZvcm3DuDEiLCJoYW5kbGVyw7gxIiwiYm9kecO4MSIsImFuYWx5emVTZXQiLCJsZWZ0w7gxIiwicmlnaHTDuDEiLCJ0YXJnZXTDuDEiLCJhbmFseXplU3ltYm9sIiwiYW5hbHl6ZUxpc3QiLCJ2YWx1ZcO4MSIsImFuYWx5emVOZXciLCJjb25zdHJ1Y3RvcsO4MSIsInBhcmFtc8O4MSIsIiQxIiwiYW5hbHl6ZUFnZXQiLCJhdHRyaWJ1dGXDuDEiLCJmaWVsZMO4MSIsImFuYWx5emVJZGVudGlmaWVyIiwicGFyc2VEZWYiLCJpZCIsImluaXQiLCJkb2MiLCJhbmFseXplRGVmIiwiaWTDuDEiLCJiaW5kaW5nw7gxIiwiYW5hbHl6ZURlY2xhcmF0aW9uIiwiaW5pdMO4MSIsImRvY8O4MSIsImFuYWx5emVEbyIsImV4cHJlc3Npb25zw7gxIiwic3RhcnTDuDEiLCJlbmTDuDEiLCJleHBhbnNpb27DuDEiLCJyZXNvbHZlQmluZGluZyIsInVucmVzb2x2ZWRCaW5kaW5nIiwiYW5hbHl6ZVNoYWRvdyIsImFuYWx5emVCaW5kaW5nIiwiYW5hbHl6ZVBhcmFtIiwid2l0aEJpbmRpbmciLCJ3aXRoUGFyYW0iLCJzdWJFbnYiLCJhbmFseXplTGV0XyIsImlzTG9vcCIsImJpbmRpbmdzw7gxIiwiaXNWYWxpZEJpbmRpbmdzw7gxIiwiX8O4MSIsInNjb3Blw7gxIiwiJDIiLCJiaW5kaW5nc8O4MiIsImV4cHJlc3Npb25zw7gyIiwiYW5hbHl6ZUxldCIsImFuYWx5emVMb29wIiwiYW5hbHl6ZVJlY3VyIiwiYW5hbHl6ZVF1b3RlZExpc3QiLCJhbmFseXplUXVvdGVkIiwiYW5hbHl6ZVF1b3RlZFZlY3RvciIsImFuYWx5emVRdW90ZWREaWN0aW9uYXJ5IiwibmFtZXPDuDEiLCJ2YWx1ZXPDuDEiLCJhbmFseXplUXVvdGVkU3ltYm9sIiwiYW5hbHl6ZVF1b3RlZEtleXdvcmQiLCJhbmFseXplUXVvdGUiLCJhbmFseXplU3RhdGVtZW50Iiwic3RhdGVtZW50c8O4MSIsInN0YXRlbWVudMO4MSIsIm9ww7gxIiwiZGVmc8O4MSIsInJlc3VsdMO4MSIsImFuYWx5emVGbk1ldGhvZCIsInNpZ25hdHVyZcO4MSIsInZhcmlhZGljw7gxIiwiYXJpdHnDuDEiLCJhbmFseXplRm4iLCJmb3Jtc8O4MiIsIm92ZXJsb2Fkc8O4MSIsIm1ldGhvZHPDuDEiLCJwYXJzZVJlZmVyZW5jZXMiLCJmb3JtcyIsInJlZmVyZW5jZXMiLCJwYXJzZVJlcXVpcmUiLCJyZXF1aXJlbWVudMO4MSIsInJlbmFtZXPDuDEiLCJhbGlhc8O4MSIsInJlZmVyZW5jZXPDuDEiLCJyZWZlcnMiLCJyZWZlcmVuY2UiLCJhbmFseXplTnMiLCJuYW1lw7gxIiwicmVxdWlyZW1lbnRzw7gxIiwib3BlcmF0b3LDuDEiLCJhbmFseXplcsO4MSIsImFuYWx5emVJbnZva2UiLCJhbmFseXplVmVjdG9yIiwiaXRlbXPDuDEiLCJhbmFseXplRGljdGlvbmFyeSIsImNhbGxlZcO4MSIsImFuYWx5emVDb25zdGFudCJdLCJtYXBwaW5ncyI6IkFBQUE7STs7O1VBQUE7SSxnQ0FBQTtJLElBQzhCQSxJQUFBLEcsU0FBQUEsSSxDQUQ5QjtJLElBQ21DQyxRQUFBLEcsU0FBQUEsUSxDQURuQztJLElBQzZDQyxRQUFBLEcsU0FBQUEsUSxDQUQ3QztJLElBQ3FEQyxTQUFBLEcsU0FBQUEsUyxDQURyRDtJLElBRThCQyxPQUFBLEcsU0FBQUEsTyxDQUY5QjtJLElBRXFDQyxNQUFBLEcsU0FBQUEsTSxDQUZyQztJLElBRTRDQyxTQUFBLEcsU0FBQUEsUyxDQUY1QztJLElBRXNEQyxJQUFBLEcsU0FBQUEsSSxDQUZ0RDtJLElBRTJEQyxLQUFBLEcsU0FBQUEsSyxDQUYzRDtJLElBRzhCQyxTQUFBLEcsU0FBQUEsUyxDQUg5QjtJLElBR3VDQyxpQkFBQSxH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b0JkLElBQXBCLEMsR0FDZDlDLE1BQUQsQ0FBTzhDLElBQVAsQyxHQUFrQnpDLE9BQUQsQ0FBUXlDLElBQVIsQ0FBSixHQUNHMEYsYUFBRCxDQUFnQjFGLElBQWhCLENBREYsR0FFRzRDLFdBQUQsQ0FBYzlCLEdBQWQsRUFBa0JkLElBQWxCLEMsR0FDZHJCLFlBQUQsQ0FBYXFCLElBQWIsQyxHQUFvQmtJLGlCQUFELENBQW9CcEgsR0FBcEIsRUFBd0JkLElBQXhCLEMsR0FDbEJwQixRQUFELENBQVNvQixJQUFULEMsR0FBZ0JnSSxhQUFELENBQWdCbEgsR0FBaEIsRUFBb0JkLElBQXBCLEMsR0FFZHRELFNBQUQsQ0FBVXNELElBQVYsQyxHQUFpQmEsY0FBRCxDQUFpQkMsR0FBakIsRUFBcUJkLElBQXJCLEMsWUFDVG9JLGVBQUQsQ0FBa0J0SCxHQUFsQixFQUFzQmQsSUFBdEIsQyxTQVRaLEM7Ozs7S0F0QkgiLCJzb3VyY2VzQ29udGVudCI6WyIobnMgd2lzcC5hbmFseXplclxuICAoOnJlcXVpcmUgW3dpc3AuYXN0IDpyZWZlciBbbWV0YSB3aXRoLW1ldGEgc3ltYm9sPyBrZXl3b3JkP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVvdGU/IHN5bWJvbCBuYW1lc3BhY2UgbmFtZSBwci1zdHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVucXVvdGU/IHVucXVvdGUtc3BsaWNpbmc/XV1cbiAgICAgICAgICAgIFt3aXNwLnNlcXVlbmNlIDpyZWZlciBbbGlzdD8gbGlzdCBjb25qIHBhcnRpdGlvbiBzZXFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHk/IG1hcCB2ZWMgZXZlcnk/IGNvbmNhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCBzZWNvbmQgdGhpcmQgcmVzdCBsYXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1dGxhc3QgaW50ZXJsZWF2ZSBjb25zIGNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbWUgYXNzb2MgcmVkdWNlIGZpbHRlciBzZXE/XV1cbiAgICAgICAgICAgIFt3aXNwLnJ1bnRpbWUgOnJlZmVyIFtuaWw/IGRpY3Rpb25hcnk/IHZlY3Rvcj8ga2V5c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHMgc3RyaW5nPyBudW1iZXI/IGJvb2xlYW4/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZT8gcmUtcGF0dGVybj8gZXZlbj8gPSBtYXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWMgZGljdGlvbmFyeSBzdWJzIGluYyBkZWNdXVxuICAgICAgICAgICAgW3dpc3AuZXhwYW5kZXIgOnJlZmVyIFttYWNyb2V4cGFuZF1dXG4gICAgICAgICAgICBbd2lzcC5zdHJpbmcgOnJlZmVyIFtzcGxpdCBqb2luXV0pKVxuXG4oZGVmbiBzeW50YXgtZXJyb3JcbiAgW21lc3NhZ2UgZm9ybV1cbiAgKGxldCBbbWV0YWRhdGEgKG1ldGEgZm9ybSlcbiAgICAgICAgbGluZSAoOmxpbmUgKDpzdGFydCBtZXRhZGF0YSkpXG4gICAgICAgIHVyaSAoOnVyaSBtZXRhZGF0YSlcbiAgICAgICAgY29sdW1uICg6Y29sdW1uICg6c3RhcnQgbWV0YWRhdGEpKVxuICAgICAgICBlcnJvciAoU3ludGF4RXJyb3IgKHN0ciBtZXNzYWdlIFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJGb3JtOiBcIiAocHItc3RyIGZvcm0pIFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJVUkk6IFwiIHVyaSBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTGluZTogXCIgbGluZSBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQ29sdW1uOiBcIiBjb2x1bW4pKV1cbiAgICAoc2V0ISBlcnJvci5saW5lTnVtYmVyIGxpbmUpXG4gICAgKHNldCEgZXJyb3IubGluZSBsaW5lKVxuICAgIChzZXQhIGVycm9yLmNvbHVtbk51bWJlciBjb2x1bW4pXG4gICAgKHNldCEgZXJyb3IuY29sdW1uIGNvbHVtbilcbiAgICAoc2V0ISBlcnJvci5maWxlTmFtZSB1cmkpXG4gICAgKHNldCEgZXJyb3IudXJpIHVyaSlcbiAgICAodGhyb3cgZXJyb3IpKSlcblxuXG4oZGVmbiBhbmFseXplLWtleXdvcmRcbiAgXCJFeGFtcGxlOlxuICAoYW5hbHl6ZS1rZXl3b3JkIHt9IDpmb28pID0+IHs6b3AgOmNvbnN0YW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICc6Zm9vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDplbnYge319XCJcbiAgW2VudiBmb3JtXVxuICB7Om9wIDpjb25zdGFudFxuICAgOmZvcm0gZm9ybX0pXG5cbihkZWYgKipzcGVjaWFscyoqIHt9KVxuXG4oZGVmbiBpbnN0YWxsLXNwZWNpYWwhXG4gIFtvcCBhbmFseXplcl1cbiAgKHNldCEgKGdldCAqKnNwZWNpYWxzKiogKG5hbWUgb3ApKSBhbmFseXplcikpXG5cbihkZWZuIGFuYWx5emUtc3BlY2lhbFxuICBbYW5hbHl6ZXIgZW52IGZvcm1dXG4gIChsZXQgW21ldGFkYXRhIChtZXRhIGZvcm0pXG4gICAgICAgIGFzdCAoYW5hbHl6ZXIgZW52IGZvcm0pXVxuICAgIChjb25qIHs6c3RhcnQgKDpzdGFydCBtZXRhZGF0YSlcbiAgICAgICAgICAgOmVuZCAoOmVuZCBtZXRhZGF0YSl9XG4gICAgICAgICAgYXN0KSkpXG5cbihkZWZuIGFuYWx5emUtaWZcbiAgXCJFeGFtcGxlOlxuICAoYW5hbHl6ZS1pZiB7fSAnKGlmIG1vbmRheT8gOnllcCA6bm9wZSkpID0+IHs6b3AgOmlmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICcoaWYgbW9uZGF5PyA6eWVwIDpub3BlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ZW52IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp0ZXN0IHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJ21vbmRheT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDppbmZvIG5pbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7fX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmNvbnNlcXVlbnQgezpvcCA6Y29uc3RhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICc6eWVwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6dHlwZSA6a2V5d29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7fX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmFsdGVybmF0ZSB7Om9wIDpjb25zdGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAnOm5vcGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnR5cGUgOmtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7fX19XCJcbiAgW2VudiBmb3JtXVxuICAobGV0IFtmb3JtcyAocmVzdCBmb3JtKVxuICAgICAgICB0ZXN0IChhbmFseXplIGVudiAoZmlyc3QgZm9ybXMpKVxuICAgICAgICBjb25zZXF1ZW50IChhbmFseXplIGVudiAoc2Vjb25kIGZvcm1zKSlcbiAgICAgICAgYWx0ZXJuYXRlIChhbmFseXplIGVudiAodGhpcmQgZm9ybXMpKV1cbiAgICAoaWYgKDwgKGNvdW50IGZvcm1zKSAyKVxuICAgICAgKHN5bnRheC1lcnJvciBcIk1hbGZvcm1lZCBpZiBleHByZXNzaW9uLCB0b28gZmV3IG9wZXJhbmRzXCIgZm9ybSkpXG4gICAgezpvcCA6aWZcbiAgICAgOmZvcm0gZm9ybVxuICAgICA6dGVzdCB0ZXN0XG4gICAgIDpjb25zZXF1ZW50IGNvbnNlcXVlbnRcbiAgICAgOmFsdGVybmF0ZSBhbHRlcm5hdGV9KSlcblxuKGluc3RhbGwtc3BlY2lhbCEgOmlmIGFuYWx5emUtaWYpXG5cbihkZWZuIGFuYWx5emUtdGhyb3dcbiAgXCJFeGFtcGxlOlxuICAoYW5hbHl6ZS10aHJvdyB7fSAnKHRocm93IChFcnJvciA6Ym9vbSkpKSA9PiB7Om9wIDp0aHJvd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJyh0aHJvdyAoRXJyb3IgOmJvb20pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnRocm93IHs6b3AgOmludm9rZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Y2FsbGVlIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAnRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmluZm8gbmlsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDplbnYge319XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpwYXJhbXMgW3s6b3AgOmNvbnN0YW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6dHlwZSA6a2V5d29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJzpib29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ZW52IHt9fV19fVwiXG4gIFtlbnYgZm9ybV1cbiAgKGxldCBbZXhwcmVzc2lvbiAoYW5hbHl6ZSBlbnYgKHNlY29uZCBmb3JtKSldXG4gICAgezpvcCA6dGhyb3dcbiAgICAgOmZvcm0gZm9ybVxuICAgICA6dGhyb3cgZXhwcmVzc2lvbn0pKVxuXG4oaW5zdGFsbC1zcGVjaWFsISA6dGhyb3cgYW5hbHl6ZS10aHJvdylcblxuKGRlZm4gYW5hbHl6ZS10cnlcbiAgW2VudiBmb3JtXVxuICAobGV0IFtmb3JtcyAodmVjIChyZXN0IGZvcm0pKVxuXG4gICAgICAgIDs7IEZpbmFsbHlcbiAgICAgICAgdGFpbCAobGFzdCBmb3JtcylcbiAgICAgICAgZmluYWxpemVyLWZvcm0gKGlmIChhbmQgKGxpc3Q/IHRhaWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICg9ICdmaW5hbGx5IChmaXJzdCB0YWlsKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3QgdGFpbCkpXG4gICAgICAgIGZpbmFsaXplciAoaWYgZmluYWxpemVyLWZvcm1cbiAgICAgICAgICAgICAgICAgICAgKGFuYWx5emUtYmxvY2sgZW52IGZpbmFsaXplci1mb3JtKSlcblxuICAgICAgICA7OyBjYXRjaFxuICAgICAgICBib2R5LWZvcm0gKGlmIGZpbmFsaXplclxuICAgICAgICAgICAgICAgICAgICAoYnV0bGFzdCBmb3JtcylcbiAgICAgICAgICAgICAgICAgICAgZm9ybXMpXG5cbiAgICAgICAgdGFpbCAobGFzdCBib2R5LWZvcm0pXG4gICAgICAgIGhhbmRsZXItZm9ybSAoaWYgKGFuZCAobGlzdD8gdGFpbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICg9ICdjYXRjaCAoZmlyc3QgdGFpbCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAocmVzdCB0YWlsKSlcbiAgICAgICAgaGFuZGxlciAoaWYgaGFuZGxlci1mb3JtXG4gICAgICAgICAgICAgICAgICAoY29uaiB7Om5hbWUgKGFuYWx5emUgZW52IChmaXJzdCBoYW5kbGVyLWZvcm0pKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIChhbmFseXplLWJsb2NrIGVudiAocmVzdCBoYW5kbGVyLWZvcm0pKSkpXG5cbiAgICAgICAgOzsgVHJ5XG4gICAgICAgIGJvZHkgKGlmIGhhbmRsZXItZm9ybVxuICAgICAgICAgICAgICAgKGFuYWx5emUtYmxvY2sgZW52IChidXRsYXN0IGJvZHktZm9ybSkpXG4gICAgICAgICAgICAgICAoYW5hbHl6ZS1ibG9jayBlbnYgYm9keS1mb3JtKSldXG4gICAgezpvcCA6dHJ5XG4gICAgIDpmb3JtIGZvcm1cbiAgICAgOmJvZHkgYm9keVxuICAgICA6aGFuZGxlciBoYW5kbGVyXG4gICAgIDpmaW5hbGl6ZXIgZmluYWxpemVyfSkpXG5cbihpbnN0YWxsLXNwZWNpYWwhIDp0cnkgYW5hbHl6ZS10cnkpXG5cbihkZWZuIGFuYWx5emUtc2V0IVxuICBbZW52IGZvcm1dXG4gIChsZXQgW2JvZHkgKHJlc3QgZm9ybSlcbiAgICAgICAgbGVmdCAoZmlyc3QgYm9keSlcbiAgICAgICAgcmlnaHQgKHNlY29uZCBib2R5KVxuICAgICAgICB0YXJnZXQgKGNvbmQgKHN5bWJvbD8gbGVmdCkgKGFuYWx5emUtc3ltYm9sIGVudiBsZWZ0KVxuICAgICAgICAgICAgICAgICAgICAgKGxpc3Q/IGxlZnQpIChhbmFseXplLWxpc3QgZW52IGxlZnQpXG4gICAgICAgICAgICAgICAgICAgICA6ZWxzZSBsZWZ0KVxuICAgICAgICB2YWx1ZSAoYW5hbHl6ZSBlbnYgcmlnaHQpXVxuICAgIHs6b3AgOnNldCFcbiAgICAgOnRhcmdldCB0YXJnZXRcbiAgICAgOnZhbHVlIHZhbHVlXG4gICAgIDpmb3JtIGZvcm19KSlcbihpbnN0YWxsLXNwZWNpYWwhIDpzZXQhIGFuYWx5emUtc2V0ISlcblxuKGRlZm4gYW5hbHl6ZS1uZXdcbiAgW2VudiBmb3JtXVxuICAobGV0IFtib2R5IChyZXN0IGZvcm0pXG4gICAgICAgIGNvbnN0cnVjdG9yIChhbmFseXplIGVudiAoZmlyc3QgYm9keSkpXG4gICAgICAgIHBhcmFtcyAodmVjIChtYXAgIyhhbmFseXplIGVudiAlKSAocmVzdCBib2R5KSkpXVxuICAgIHs6b3AgOm5ld1xuICAgICA6Y29uc3RydWN0b3IgY29uc3RydWN0b3JcbiAgICAgOmZvcm0gZm9ybVxuICAgICA6cGFyYW1zIHBhcmFtc30pKVxuKGluc3RhbGwtc3BlY2lhbCEgOm5ldyBhbmFseXplLW5ldylcblxuKGRlZm4gYW5hbHl6ZS1hZ2V0XG4gIFtlbnYgZm9ybV1cbiAgKGxldCBbYm9keSAocmVzdCBmb3JtKVxuICAgICAgICB0YXJnZXQgKGFuYWx5emUgZW52IChmaXJzdCBib2R5KSlcbiAgICAgICAgYXR0cmlidXRlIChzZWNvbmQgYm9keSlcbiAgICAgICAgZmllbGQgKGFuZCAocXVvdGU/IGF0dHJpYnV0ZSlcbiAgICAgICAgICAgICAgICAgICAoc3ltYm9sPyAoc2Vjb25kIGF0dHJpYnV0ZSkpXG4gICAgICAgICAgICAgICAgICAgKHNlY29uZCBhdHRyaWJ1dGUpKV1cbiAgICAoaWYgKG5pbD8gYXR0cmlidXRlKVxuICAgICAgKHN5bnRheC1lcnJvciBcIk1hbGZvcm1lZCBhZ2V0IGV4cHJlc3Npb24gZXhwZWN0ZWQgKGFnZXQgb2JqZWN0IG1lbWJlcilcIlxuICAgICAgICAgICAgICAgICAgICBmb3JtKVxuICAgICAgezpvcCA6bWVtYmVyLWV4cHJlc3Npb25cbiAgICAgICA6Y29tcHV0ZWQgKG5vdCBmaWVsZClcbiAgICAgICA6Zm9ybSBmb3JtXG4gICAgICAgOnRhcmdldCB0YXJnZXRcbiAgICAgICA7OyBJZiBmaWVsZCBpcyBhIHF1b3RlZCBzeW1ib2wgdGhlcmUncyBubyBuZWVkIHRvIHJlc29sdmVcbiAgICAgICA7OyBpdCBmb3IgaW5mb1xuICAgICAgIDpwcm9wZXJ0eSAoaWYgZmllbGRcbiAgICAgICAgICAgICAgICAgICAoY29uaiAoYW5hbHl6ZS1zcGVjaWFsIGFuYWx5emUtaWRlbnRpZmllciBlbnYgZmllbGQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgezpiaW5kaW5nIG5pbH0pXG4gICAgICAgICAgICAgICAgICAgKGFuYWx5emUgZW52IGF0dHJpYnV0ZSkpfSkpKVxuKGluc3RhbGwtc3BlY2lhbCEgOmFnZXQgYW5hbHl6ZS1hZ2V0KVxuXG4oZGVmbiBwYXJzZS1kZWZcbiAgKFtpZF0gezppZCBpZH0pXG4gIChbaWQgaW5pdF0gezppZCBpZCA6aW5pdCBpbml0fSlcbiAgKFtpZCBkb2MgaW5pdF0gezppZCBpZCA6ZG9jIGRvYyA6aW5pdCBpbml0fSkpXG5cbihkZWZuIGFuYWx5emUtZGVmXG4gIFtlbnYgZm9ybV1cbiAgKGxldCBbcGFyYW1zIChhcHBseSBwYXJzZS1kZWYgKHZlYyAocmVzdCBmb3JtKSkpXG4gICAgICAgIGlkICg6aWQgcGFyYW1zKVxuICAgICAgICBtZXRhZGF0YSAobWV0YSBpZClcblxuICAgICAgICBiaW5kaW5nIChhbmFseXplLXNwZWNpYWwgYW5hbHl6ZS1kZWNsYXJhdGlvbiBlbnYgaWQpXG5cbiAgICAgICAgaW5pdCAoYW5hbHl6ZSBlbnYgKDppbml0IHBhcmFtcykpXG5cbiAgICAgICAgZG9jIChvciAoOmRvYyBwYXJhbXMpXG4gICAgICAgICAgICAgICAgKDpkb2MgbWV0YWRhdGEpKV1cbiAgICB7Om9wIDpkZWZcbiAgICAgOmRvYyBkb2NcbiAgICAgOmlkIGJpbmRpbmdcbiAgICAgOmluaXQgaW5pdFxuICAgICA6ZXhwb3J0IChhbmQgKDp0b3AgZW52KVxuICAgICAgICAgICAgICAgICAgKG5vdCAoOnByaXZhdGUgbWV0YWRhdGEpKSlcbiAgICAgOmZvcm0gZm9ybX0pKVxuKGluc3RhbGwtc3BlY2lhbCEgOmRlZiBhbmFseXplLWRlZilcblxuKGRlZm4gYW5hbHl6ZS1kb1xuICBbZW52IGZvcm1dXG4gIChsZXQgW2V4cHJlc3Npb25zIChyZXN0IGZvcm0pXG4gICAgICAgIGJvZHkgKGFuYWx5emUtYmxvY2sgZW52IGV4cHJlc3Npb25zKV1cbiAgICAoY29uaiBib2R5IHs6b3AgOmRvXG4gICAgICAgICAgICAgICAgOmZvcm0gZm9ybX0pKSlcbihpbnN0YWxsLXNwZWNpYWwhIDpkbyBhbmFseXplLWRvKVxuXG4oZGVmbiBhbmFseXplLXN5bWJvbFxuICBcIlN5bWJvbCBhbmFseXplciBhbHNvIGRvZXMgc3ludGF4IGRlc3VnYXJpbmcgZm9yIHRoZSBzeW1ib2xzXG4gIGxpa2UgZm9vLmJhci5iYXogcHJvZHVjaW5nIChhZ2V0IGZvbyAnYmFyLmJheikgZm9ybS4gVGhpcyBlbmFibGVzXG4gIHJlbmFtaW5nIG9mIHNoYWRvd2VkIHN5bWJvbHMuXCJcbiAgW2VudiBmb3JtXVxuICAobGV0IFtmb3JtcyAoc3BsaXQgKG5hbWUgZm9ybSkgXFwuKVxuICAgICAgICBtZXRhZGF0YSAobWV0YSBmb3JtKVxuICAgICAgICBzdGFydCAoOnN0YXJ0IG1ldGFkYXRhKVxuICAgICAgICBlbmQgKDplbmQgbWV0YWRhdGEpXG4gICAgICAgIGV4cGFuc2lvbiAoaWYgKD4gKGNvdW50IGZvcm1zKSAxKVxuICAgICAgICAgICAgICAgICAgIChsaXN0ICdhZ2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgKHdpdGgtbWV0YSAoc3ltYm9sIChmaXJzdCBmb3JtcykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoY29uaiBtZXRhZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgezpzdGFydCBzdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDplbmQgezpsaW5lICg6bGluZSBlbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmNvbHVtbiAoKyAxICg6Y29sdW1uIHN0YXJ0KSAoY291bnQgKGZpcnN0IGZvcm1zKSkpfX0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0ICdxdW90ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh3aXRoLW1ldGEgKHN5bWJvbCAoam9pbiBcXC4gKHJlc3QgZm9ybXMpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb25qIG1ldGFkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7OmVuZCBlbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6c3RhcnQgezpsaW5lICg6bGluZSBzdGFydClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpjb2x1bW4gKCsgMSAoOmNvbHVtbiBzdGFydCkgKGNvdW50IChmaXJzdCBmb3JtcykpKX19KSkpKSldXG4gICAgKGlmIGV4cGFuc2lvblxuICAgICAgKGFuYWx5emUgZW52ICh3aXRoLW1ldGEgZXhwYW5zaW9uIChtZXRhIGZvcm0pKSlcbiAgICAgIChhbmFseXplLXNwZWNpYWwgYW5hbHl6ZS1pZGVudGlmaWVyIGVudiBmb3JtKSkpKVxuXG4oZGVmbiBhbmFseXplLWlkZW50aWZpZXJcbiAgW2VudiBmb3JtXVxuICB7Om9wIDp2YXJcbiAgIDp0eXBlIDppZGVudGlmaWVyXG4gICA6Zm9ybSBmb3JtXG4gICA6c3RhcnQgKDpzdGFydCAobWV0YSBmb3JtKSlcbiAgIDplbmQgKDplbmQgKG1ldGEgZm9ybSkpXG4gICA6YmluZGluZyAocmVzb2x2ZS1iaW5kaW5nIGVudiBmb3JtKX0pXG5cbihkZWZuIHVucmVzb2x2ZWQtYmluZGluZ1xuICBbZW52IGZvcm1dXG4gIHs6b3AgOnVucmVzb2x2ZWQtYmluZGluZ1xuICAgOnR5cGUgOnVucmVzb2x2ZWQtYmluZGluZ1xuICAgOmlkZW50aWZpZXIgezp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgOmZvcm0gKHN5bWJvbCAobmFtZXNwYWNlIGZvcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobmFtZSBmb3JtKSl9XG4gICA6c3RhcnQgKDpzdGFydCAobWV0YSBmb3JtKSlcbiAgIDplbmQgKDplbmQgKG1ldGEgZm9ybSkpfSlcblxuKGRlZm4gcmVzb2x2ZS1iaW5kaW5nXG4gIFtlbnYgZm9ybV1cbiAgKG9yIChnZXQgKDpsb2NhbHMgZW52KSAobmFtZSBmb3JtKSlcbiAgICAgIChnZXQgKDplbmNsb3NlZCBlbnYpIChuYW1lIGZvcm0pKVxuICAgICAgKHVucmVzb2x2ZWQtYmluZGluZyBlbnYgZm9ybSkpKVxuXG4oZGVmbiBhbmFseXplLXNoYWRvd1xuICBbZW52IGlkXVxuICAobGV0IFtiaW5kaW5nIChyZXNvbHZlLWJpbmRpbmcgZW52IGlkKV1cbiAgICB7OmRlcHRoIChpbmMgKG9yICg6ZGVwdGggYmluZGluZykgMCkpXG4gICAgIDpzaGFkb3cgYmluZGluZ30pKVxuXG4oZGVmbiBhbmFseXplLWJpbmRpbmdcbiAgW2VudiBmb3JtXVxuICAobGV0IFtpZCAoZmlyc3QgZm9ybSlcbiAgICAgICAgYm9keSAoc2Vjb25kIGZvcm0pXVxuICAgIChjb25qIChhbmFseXplLXNoYWRvdyBlbnYgaWQpXG4gICAgICAgICAgezpvcCA6YmluZGluZ1xuICAgICAgICAgICA6dHlwZSA6YmluZGluZ1xuICAgICAgICAgICA6aWQgaWRcbiAgICAgICAgICAgOmluaXQgKGFuYWx5emUgZW52IGJvZHkpXG4gICAgICAgICAgIDpmb3JtIGZvcm19KSkpXG5cbihkZWZuIGFuYWx5emUtZGVjbGFyYXRpb25cbiAgW2VudiBmb3JtXVxuICAoYXNzZXJ0IChub3QgKG9yIChuYW1lc3BhY2UgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAoPCAxIChjb3VudCAoc3BsaXQgXFwuIChzdHIgZm9ybSkpKSkpKSlcbiAgKGNvbmogKGFuYWx5emUtc2hhZG93IGVudiBmb3JtKVxuICAgICAgICB7Om9wIDp2YXJcbiAgICAgICAgIDp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICA6ZGVwdGggMFxuICAgICAgICAgOmlkIGZvcm1cbiAgICAgICAgIDpmb3JtIGZvcm19KSlcblxuKGRlZm4gYW5hbHl6ZS1wYXJhbVxuICBbZW52IGZvcm1dXG4gIChjb25qIChhbmFseXplLXNoYWRvdyBlbnYgZm9ybSlcbiAgICAgICAgezpvcCA6cGFyYW1cbiAgICAgICAgIDp0eXBlIDpwYXJhbWV0ZXJcbiAgICAgICAgIDppZCBmb3JtXG4gICAgICAgICA6Zm9ybSBmb3JtXG4gICAgICAgICA6c3RhcnQgKDpzdGFydCAobWV0YSBmb3JtKSlcbiAgICAgICAgIDplbmQgKDplbmQgKG1ldGEgZm9ybSkpfSkpXG5cbihkZWZuIHdpdGgtYmluZGluZ1xuICBcIlJldHVybnMgZW5oYW5jZWQgZW52aXJvbm1lbnQgd2l0aCBhZGRpdGlvbmFsIGJpbmRpbmcgYWRkZWRcbiAgdG8gdGhlIDpiaW5kaW5ncyBhbmQgOnNjb3BlXCJcbiAgW2VudiBmb3JtXVxuICAoY29uaiBlbnYgezpsb2NhbHMgKGFzc29jICg6bG9jYWxzIGVudikgKG5hbWUgKDppZCBmb3JtKSkgZm9ybSlcbiAgICAgICAgICAgICA6YmluZGluZ3MgKGNvbmogKDpiaW5kaW5ncyBlbnYpIGZvcm0pfSkpXG5cbihkZWZuIHdpdGgtcGFyYW1cbiAgW2VudiBmb3JtXVxuICAoY29uaiAod2l0aC1iaW5kaW5nIGVudiBmb3JtKVxuICAgICAgICB7OnBhcmFtcyAoY29uaiAoOnBhcmFtcyBlbnYpIGZvcm0pfSkpXG5cbihkZWZuIHN1Yi1lbnZcbiAgW2Vudl1cbiAgezplbmNsb3NlZCAoY29uaiB7fVxuICAgICAgICAgICAgICAgICAgICg6ZW5jbG9zZWQgZW52KVxuICAgICAgICAgICAgICAgICAgICg6bG9jYWxzIGVudikpXG4gICA6bG9jYWxzIHt9XG4gICA6YmluZGluZ3MgW11cbiAgIDpwYXJhbXMgKG9yICg6cGFyYW1zIGVudikgW10pfSlcblxuXG4oZGVmbiBhbmFseXplLWxldCpcbiAgXCJUYWtlcyBsZXQgZm9ybSBhbmQgZW5oYW5jZXMgaXQncyBtZXRhZGF0YSB2aWEgYW5hbHl6ZWRcbiAgaW5mb1wiXG4gIFtlbnYgZm9ybSBpcy1sb29wXVxuICAobGV0IFtleHByZXNzaW9ucyAocmVzdCBmb3JtKVxuICAgICAgICBiaW5kaW5ncyAoZmlyc3QgZXhwcmVzc2lvbnMpXG4gICAgICAgIGJvZHkgKHJlc3QgZXhwcmVzc2lvbnMpXG5cbiAgICAgICAgdmFsaWQtYmluZGluZ3M/IChhbmQgKHZlY3Rvcj8gYmluZGluZ3MpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIChldmVuPyAoY291bnQgYmluZGluZ3MpKSlcblxuICAgICAgICBfIChhc3NlcnQgdmFsaWQtYmluZGluZ3M/XG4gICAgICAgICAgICAgICAgICBcImJpbmRpbmdzIG11c3QgYmUgdmVjdG9yIG9mIGV2ZW4gbnVtYmVyIG9mIGVsZW1lbnRzXCIpXG5cbiAgICAgICAgc2NvcGUgKHJlZHVjZSAjKHdpdGgtYmluZGluZyAlMSAoYW5hbHl6ZS1iaW5kaW5nICUxICUyKSlcbiAgICAgICAgICAgICAgICAgICAgICAoc3ViLWVudiBlbnYpXG4gICAgICAgICAgICAgICAgICAgICAgKHBhcnRpdGlvbiAyIGJpbmRpbmdzKSlcblxuICAgICAgICBiaW5kaW5ncyAoOmJpbmRpbmdzIHNjb3BlKVxuXG4gICAgICAgIGV4cHJlc3Npb25zIChhbmFseXplLWJsb2NrIChpZiBpcy1sb29wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvbmogc2NvcGUgezpwYXJhbXMgYmluZGluZ3N9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5KV1cblxuICAgIHs6b3AgOmxldFxuICAgICA6Zm9ybSBmb3JtXG4gICAgIDpzdGFydCAoOnN0YXJ0IChtZXRhIGZvcm0pKVxuICAgICA6ZW5kICg6ZW5kIChtZXRhIGZvcm0pKVxuICAgICA6YmluZGluZ3MgYmluZGluZ3NcbiAgICAgOnN0YXRlbWVudHMgKDpzdGF0ZW1lbnRzIGV4cHJlc3Npb25zKVxuICAgICA6cmVzdWx0ICg6cmVzdWx0IGV4cHJlc3Npb25zKX0pKVxuXG4oZGVmbiBhbmFseXplLWxldFxuICBbZW52IGZvcm1dXG4gIChhbmFseXplLWxldCogZW52IGZvcm0gZmFsc2UpKVxuKGluc3RhbGwtc3BlY2lhbCEgOmxldCBhbmFseXplLWxldClcblxuKGRlZm4gYW5hbHl6ZS1sb29wXG4gIFtlbnYgZm9ybV1cbiAgKGNvbmogKGFuYWx5emUtbGV0KiBlbnYgZm9ybSB0cnVlKSB7Om9wIDpsb29wfSkpXG4oaW5zdGFsbC1zcGVjaWFsISA6bG9vcCBhbmFseXplLWxvb3ApXG5cblxuKGRlZm4gYW5hbHl6ZS1yZWN1clxuICBbZW52IGZvcm1dXG4gIChsZXQgW3BhcmFtcyAoOnBhcmFtcyBlbnYpXG4gICAgICAgIGZvcm1zICh2ZWMgKG1hcCAjKGFuYWx5emUgZW52ICUpIChyZXN0IGZvcm0pKSldXG5cbiAgICAoaWYgKD0gKGNvdW50IHBhcmFtcylcbiAgICAgICAgICAgKGNvdW50IGZvcm1zKSlcbiAgICAgIHs6b3AgOnJlY3VyXG4gICAgICAgOmZvcm0gZm9ybVxuICAgICAgIDpwYXJhbXMgZm9ybXN9XG4gICAgICAoc3ludGF4LWVycm9yIFwiUmVjdXJzIHdpdGggd3JvbmcgbnVtYmVyIG9mIGFyZ3VtZW50c1wiXG4gICAgICAgICAgICAgICAgICAgIGZvcm0pKSkpXG4oaW5zdGFsbC1zcGVjaWFsISA6cmVjdXIgYW5hbHl6ZS1yZWN1cilcblxuKGRlZm4gYW5hbHl6ZS1xdW90ZWQtbGlzdFxuICBbZm9ybV1cbiAgezpvcCA6bGlzdFxuICAgOml0ZW1zIChtYXAgYW5hbHl6ZS1xdW90ZWQgKHZlYyBmb3JtKSlcbiAgIDpmb3JtIGZvcm1cbiAgIDpzdGFydCAoOnN0YXJ0IChtZXRhIGZvcm0pKVxuICAgOmVuZCAoOmVuZCAobWV0YSBmb3JtKSl9KVxuXG4oZGVmbiBhbmFseXplLXF1b3RlZC12ZWN0b3JcbiAgW2Zvcm1dXG4gIHs6b3AgOnZlY3RvclxuICAgOml0ZW1zIChtYXAgYW5hbHl6ZS1xdW90ZWQgZm9ybSlcbiAgIDpmb3JtIGZvcm1cbiAgIDpzdGFydCAoOnN0YXJ0IChtZXRhIGZvcm0pKVxuICAgOmVuZCAoOmVuZCAobWV0YSBmb3JtKSl9KVxuXG4oZGVmbiBhbmFseXplLXF1b3RlZC1kaWN0aW9uYXJ5XG4gIFtmb3JtXVxuICAobGV0IFtuYW1lcyAodmVjIChtYXAgYW5hbHl6ZS1xdW90ZWQgKGtleXMgZm9ybSkpKVxuICAgICAgICB2YWx1ZXMgKHZlYyAobWFwIGFuYWx5emUtcXVvdGVkICh2YWxzIGZvcm0pKSldXG4gICAgezpvcCA6ZGljdGlvbmFyeVxuICAgICA6Zm9ybSBmb3JtXG4gICAgIDprZXlzIG5hbWVzXG4gICAgIDp2YWx1ZXMgdmFsdWVzXG4gICAgIDpzdGFydCAoOnN0YXJ0IChtZXRhIGZvcm0pKVxuICAgICA6ZW5kICg6ZW5kIChtZXRhIGZvcm0pKX0pKVxuXG4oZGVmbiBhbmFseXplLXF1b3RlZC1zeW1ib2xcbiAgW2Zvcm1dXG4gIHs6b3AgOnN5bWJvbFxuICAgOm5hbWUgKG5hbWUgZm9ybSlcbiAgIDpuYW1lc3BhY2UgKG5hbWVzcGFjZSBmb3JtKVxuICAgOmZvcm0gZm9ybX0pXG5cbihkZWZuIGFuYWx5emUtcXVvdGVkLWtleXdvcmRcbiBbZm9ybV1cbiAgezpvcCA6a2V5d29yZFxuICAgOm5hbWUgKG5hbWUgZm9ybSlcbiAgIDpuYW1lc3BhY2UgKG5hbWVzcGFjZSBmb3JtKVxuICAgOmZvcm0gZm9ybX0pXG5cbihkZWZuIGFuYWx5emUtcXVvdGVkXG4gIFtmb3JtXVxuICAoY29uZCAoc3ltYm9sPyBmb3JtKSAoYW5hbHl6ZS1xdW90ZWQtc3ltYm9sIGZvcm0pXG4gICAgICAgIChrZXl3b3JkPyBmb3JtKSAoYW5hbHl6ZS1xdW90ZWQta2V5d29yZCBmb3JtKVxuICAgICAgICAobGlzdD8gZm9ybSkgKGFuYWx5emUtcXVvdGVkLWxpc3QgZm9ybSlcbiAgICAgICAgKHZlY3Rvcj8gZm9ybSkgKGFuYWx5emUtcXVvdGVkLXZlY3RvciBmb3JtKVxuICAgICAgICAoZGljdGlvbmFyeT8gZm9ybSkgKGFuYWx5emUtcXVvdGVkLWRpY3Rpb25hcnkgZm9ybSlcbiAgICAgICAgOmVsc2UgezpvcCA6Y29uc3RhbnRcbiAgICAgICAgICAgICAgIDpmb3JtIGZvcm19KSlcblxuKGRlZm4gYW5hbHl6ZS1xdW90ZVxuICBcIkV4YW1wbGVzOlxuICAgKGFuYWx5emUtcXVvdGUge30gJyhxdW90ZSBmb28pKSA9PiB7Om9wIDpjb25zdGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJ2Zvb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiBlbnZ9XCJcbiAgW2VudiBmb3JtXVxuICAoYW5hbHl6ZS1xdW90ZWQgKHNlY29uZCBmb3JtKSkpXG4oaW5zdGFsbC1zcGVjaWFsISA6cXVvdGUgYW5hbHl6ZS1xdW90ZSlcblxuKGRlZm4gYW5hbHl6ZS1zdGF0ZW1lbnRcbiAgW2VudiBmb3JtXVxuICAobGV0IFtzdGF0ZW1lbnRzIChvciAoOnN0YXRlbWVudHMgZW52KSBbXSlcbiAgICAgICAgYmluZGluZ3MgKG9yICg6YmluZGluZ3MgZW52KSBbXSlcbiAgICAgICAgc3RhdGVtZW50IChhbmFseXplIGVudiBmb3JtKVxuICAgICAgICBvcCAoOm9wIHN0YXRlbWVudClcblxuICAgICAgICBkZWZzIChjb25kICg9IG9wIDpkZWYpIFsoOnZhciBzdGF0ZW1lbnQpXVxuICAgICAgICAgICAgICAgICAgIDs7ICg9IG9wIDpucykgKDpyZXF1aXJlbWVudCBub2RlKVxuICAgICAgICAgICAgICAgICAgIDplbHNlIG5pbCldXG5cbiAgICAoY29uaiBlbnYgezpzdGF0ZW1lbnRzIChjb25qIHN0YXRlbWVudHMgc3RhdGVtZW50KVxuICAgICAgICAgICAgICAgOmJpbmRpbmdzIChjb25jYXQgYmluZGluZ3MgZGVmcyl9KSkpXG5cbihkZWZuIGFuYWx5emUtYmxvY2tcbiAgXCJFeGFtcGxlczpcbiAgKGFuYWx5emUtYmxvY2sge30gJygoZm9vIGJhcikpKSA9PiB7OnN0YXRlbWVudHMgbmlsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpyZXN1bHQgezpvcCA6aW52b2tlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICcoZm9vIGJhcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Y2FsbGVlIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAnZm9vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDppbmZvIG5pbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ZW52IHt9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6cGFyYW1zIFt7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICdiYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDppbmZvIG5pbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7fX1dfVxuICAoYW5hbHl6ZS1ibG9jayB7fSAnKChiZWVwIGJ6KVxuICAgICAgICAgICAgICAgICAgICAgIChmb28gYmFyKSkpID0+IHs6c3RhdGVtZW50cyBbezpvcCA6aW52b2tlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJyhiZWVwIGJ6KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDplbnYge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Y2FsbGVlIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICdiZWVwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmluZm8gbmlsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7fX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6cGFyYW1zIFt7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJ2J6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDppbmZvIG5pbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ZW52IHt9fV19XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6cmVzdWx0IHs6b3AgOmludm9rZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAnKGZvbyBiYXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDplbnYge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmNhbGxlZSB7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJ2Zvb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6aW5mbyBuaWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7fX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnBhcmFtcyBbezpvcCA6dmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAnYmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6aW5mbyBuaWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDplbnYge319XX1cIlxuICBbZW52IGZvcm1dXG4gIChsZXQgW2JvZHkgKGlmICg+IChjb3VudCBmb3JtKSAxKVxuICAgICAgICAgICAgICAgKHJlZHVjZSBhbmFseXplLXN0YXRlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICBlbnZcbiAgICAgICAgICAgICAgICAgICAgICAgKGJ1dGxhc3QgZm9ybSkpKVxuICAgICAgICByZXN1bHQgKGFuYWx5emUgKG9yIGJvZHkgZW52KSAobGFzdCBmb3JtKSldXG4gICAgezpzdGF0ZW1lbnRzICg6c3RhdGVtZW50cyBib2R5KVxuICAgICA6cmVzdWx0IHJlc3VsdH0pKVxuXG4oZGVmbiBhbmFseXplLWZuLW1ldGhvZFxuICBcIlxuICB7fSAtPiAnKFt4IHldICgrIHggeSkpIC0+IHs6ZW52IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICcoW3ggeV0gKCsgeCB5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnZhcmlhZGljIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDphcml0eSAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpwYXJhbXMgW3s6b3AgOnZhciA6Zm9ybSAneH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgezpvcCA6dmFyIDpmb3JtICd5fV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnN0YXRlbWVudHMgW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnJldHVybiB7Om9wIDppbnZva2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmNhbGxlZSB7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVudiB7OnBhcmVudCB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6bG9jYWxzIHt4IHs6bmFtZSAneFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6c2hhZG93IG5pbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6bG9jYWwgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6dGFnIG5pbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeSB7Om5hbWUgJ3lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnNoYWRvdyBuaWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmxvY2FsIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnRhZyBuaWx9fX19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpwYXJhbXMgW3s6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJ3hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDppbmZvIG5pbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnRhZyBuaWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJ3lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDppbmZvIG5pbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnRhZyBuaWx9XX19XCJcbiAgW2VudiBmb3JtXVxuICAobGV0IFtzaWduYXR1cmUgKGlmIChhbmQgKGxpc3Q/IGZvcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAodmVjdG9yPyAoZmlyc3QgZm9ybSkpKVxuICAgICAgICAgICAgICAgICAgICAoZmlyc3QgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgKHN5bnRheC1lcnJvciBcIk1hbGZvcm1lZCBmbiBvdmVybG9hZCBmb3JtXCIgZm9ybSkpXG4gICAgICAgIGJvZHkgKHJlc3QgZm9ybSlcbiAgICAgICAgOzsgSWYgcGFyYW0gc2lnbmF0dXJlIGNvbnRhaW5zICYgZm4gaXMgdmFyaWFkaWMuXG4gICAgICAgIHZhcmlhZGljIChzb21lICMoPSAnJiAlKSBzaWduYXR1cmUpXG5cbiAgICAgICAgOzsgQWxsIG5hbWVkIHBhcmFtcyBvZiB0aGUgZm4uXG4gICAgICAgIHBhcmFtcyAoaWYgdmFyaWFkaWNcbiAgICAgICAgICAgICAgICAgKGZpbHRlciAjKG5vdCAoPSAnJiAlKSkgc2lnbmF0dXJlKVxuICAgICAgICAgICAgICAgICBzaWduYXR1cmUpXG5cbiAgICAgICAgOzsgTnVtYmVyIG9mIHBhcmFtZXRlcnMgZml4ZWQgcGFyYW1ldGVycyBmbiB0YWtlcy5cbiAgICAgICAgYXJpdHkgKGlmIHZhcmlhZGljXG4gICAgICAgICAgICAgICAgKGRlYyAoY291bnQgcGFyYW1zKSlcbiAgICAgICAgICAgICAgICAoY291bnQgcGFyYW1zKSlcblxuICAgICAgICA7OyBBbmFseXplIHBhcmFtZXRlcnMgaW4gY29ycmVzcG9uZGVuY2UgdG8gZW52aXJvbm1lbnRcbiAgICAgICAgOzsgbG9jYWxzIHRvIGlkZW50aWZ5IGJpbmRpbmcgc2hhZG93aW5nLlxuICAgICAgICBzY29wZSAocmVkdWNlICMod2l0aC1wYXJhbSAlMSAoYW5hbHl6ZS1wYXJhbSAlMSAlMikpXG4gICAgICAgICAgICAgICAgICAgICAgKGNvbmogZW52IHs6cGFyYW1zIFtdfSlcbiAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMpXVxuICAgIChjb25qIChhbmFseXplLWJsb2NrIHNjb3BlIGJvZHkpXG4gICAgICAgICAgezpvcCA6b3ZlcmxvYWRcbiAgICAgICAgICAgOnZhcmlhZGljIHZhcmlhZGljXG4gICAgICAgICAgIDphcml0eSBhcml0eVxuICAgICAgICAgICA6cGFyYW1zICg6cGFyYW1zIHNjb3BlKVxuICAgICAgICAgICA6Zm9ybSBmb3JtfSkpKVxuXG5cbihkZWZuIGFuYWx5emUtZm5cbiAgW2VudiBmb3JtXVxuICAobGV0IFtmb3JtcyAocmVzdCBmb3JtKVxuICAgICAgICA7OyBOb3JtYWxpemUgZm4gZm9ybSBzbyB0aGF0IGl0IGNvbnRhaW5zIG5hbWVcbiAgICAgICAgOzsgJyhmbiBbeF0geCkgLT4gJyhmbiBuaWwgW3hdIHgpXG4gICAgICAgIGZvcm1zIChpZiAoc3ltYm9sPyAoZmlyc3QgZm9ybXMpKVxuICAgICAgICAgICAgICAgIGZvcm1zXG4gICAgICAgICAgICAgICAgKGNvbnMgbmlsIGZvcm1zKSlcblxuICAgICAgICBpZCAoZmlyc3QgZm9ybXMpXG4gICAgICAgIGJpbmRpbmcgKGlmIGlkIChhbmFseXplLXNwZWNpYWwgYW5hbHl6ZS1kZWNsYXJhdGlvbiBlbnYgaWQpKVxuXG4gICAgICAgIGJvZHkgKHJlc3QgZm9ybXMpXG5cbiAgICAgICAgOzsgTWFrZSBzdXJlIHRoYXQgZm4gZGVmaW5pdGlvbiBpcyBzdHJ1Y3V0ZXJlZFxuICAgICAgICA7OyBpbiBtZXRob2Qgb3ZlcmxvYWQgc3R5bGU6XG4gICAgICAgIDs7IChmbiBhIFt4XSB5KSAtPiAoKFt4XSB5KSlcbiAgICAgICAgOzsgKGZuIGEgKFt4XSB5KSkgLT4gKChbeF0geSkpXG4gICAgICAgIG92ZXJsb2FkcyAoY29uZCAodmVjdG9yPyAoZmlyc3QgYm9keSkpIChsaXN0IGJvZHkpXG4gICAgICAgICAgICAgICAgICAgICAgICAoYW5kIChsaXN0PyAoZmlyc3QgYm9keSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2ZWN0b3I/IChmaXJzdCAoZmlyc3QgYm9keSkpKSkgYm9keVxuICAgICAgICAgICAgICAgICAgICAgICAgOmVsc2UgKHN5bnRheC1lcnJvciAoc3RyIFwiTWFsZm9ybWVkIGZuIGV4cHJlc3Npb24sIFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbWV0ZXIgZGVjbGFyYXRpb24gKFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByLXN0ciAoZmlyc3QgYm9keSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIpIG11c3QgYmUgYSB2ZWN0b3JcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybSkpXG5cbiAgICAgICAgc2NvcGUgKGlmIGJpbmRpbmdcbiAgICAgICAgICAgICAgICAod2l0aC1iaW5kaW5nIChzdWItZW52IGVudikgYmluZGluZylcbiAgICAgICAgICAgICAgICAoc3ViLWVudiBlbnYpKVxuXG4gICAgICAgIG1ldGhvZHMgKG1hcCAjKGFuYWx5emUtZm4tbWV0aG9kIHNjb3BlICUpXG4gICAgICAgICAgICAgICAgICAgICAodmVjIG92ZXJsb2FkcykpXG5cbiAgICAgICAgYXJpdHkgKGFwcGx5IG1heCAobWFwICMoOmFyaXR5ICUpIG1ldGhvZHMpKVxuICAgICAgICB2YXJpYWRpYyAoc29tZSAjKDp2YXJpYWRpYyAlKSBtZXRob2RzKV1cbiAgICB7Om9wIDpmblxuICAgICA6dHlwZSA6ZnVuY3Rpb25cbiAgICAgOmlkIGJpbmRpbmdcbiAgICAgOnZhcmlhZGljIHZhcmlhZGljXG4gICAgIDptZXRob2RzIG1ldGhvZHNcbiAgICAgOmZvcm0gZm9ybX0pKVxuKGluc3RhbGwtc3BlY2lhbCEgOmZuIGFuYWx5emUtZm4pXG5cbihkZWZuIHBhcnNlLXJlZmVyZW5jZXNcbiAgXCJUYWtlcyBwYXJ0IG9mIG5hbWVzcGFjZSBkaWZpbml0aW9uIGFuZCBjcmVhdGVzIGhhc2hcbiAgb2YgcmVmZXJlbmNlIGZvcm1zXCJcbiAgW2Zvcm1zXVxuICAocmVkdWNlIChmbiBbcmVmZXJlbmNlcyBmb3JtXVxuICAgICAgICAgICAgOzsgSWYgbm90IGEgdmVjdG9yIHRoYW4gaXQncyBub3QgYSByZWZlcmVuY2VcbiAgICAgICAgICAgIDs7IGZvcm0gdGhhdCB3aXNwIHVuZGVyc3RhbmRzIHNvIGp1c3Qgc2tpcCBpdC5cbiAgICAgICAgICAgIChpZiAoc2VxPyBmb3JtKVxuICAgICAgICAgICAgICAoYXNzb2MgcmVmZXJlbmNlc1xuICAgICAgICAgICAgICAgIChuYW1lIChmaXJzdCBmb3JtKSlcbiAgICAgICAgICAgICAgICAodmVjIChyZXN0IGZvcm0pKSlcbiAgICAgICAgICAgICAgcmVmZXJlbmNlcykpXG4gICAgICAgICAge31cbiAgICAgICAgICBmb3JtcykpXG5cbihkZWZuIHBhcnNlLXJlcXVpcmVcbiAgW2Zvcm1dXG4gIChsZXQgWzs7IHJlcXVpcmUgZm9ybSBtYXkgYmUgZWl0aGVyIHZlY3RvciB3aXRoIGlkIGluIHRoZVxuICAgICAgICA7OyBoZWFkIG9yIGp1c3QgYW4gaWQgc3ltYm9sLiBub3JtYWxpemluZyB0byBhIHZlY3RvclxuICAgICAgICByZXF1aXJlbWVudCAoaWYgKHN5bWJvbD8gZm9ybSkgW2Zvcm1dICh2ZWMgZm9ybSkpXG4gICAgICAgIGlkIChmaXJzdCByZXF1aXJlbWVudClcbiAgICAgICAgOzsgYnVuY2ggb2YgZGlyZWN0aXZlcyBtYXkgZm9sbG93IHJlcXVpcmUgZm9ybSBidXQgdGhleVxuICAgICAgICA7OyBhbGwgY29tZSBpbiBwYWlycy4gd2lzcCBzdXBwb3J0cyBmb2xsb3dpbmcgcGFpcnM6XG4gICAgICAgIDs7IDphcyBmb29cbiAgICAgICAgOzsgOnJlZmVyIFtmb28gYmFyXVxuICAgICAgICA7OyA6cmVuYW1lIHtmb28gYmFyfVxuICAgICAgICA7OyBqb2luIHRoZXNlIHBhaXJzIGluIGEgaGFzaCBmb3Iga2V5IGJhc2VkIGFjY2Vzcy5cbiAgICAgICAgcGFyYW1zIChhcHBseSBkaWN0aW9uYXJ5IChyZXN0IHJlcXVpcmVtZW50KSlcbiAgICAgICAgcmVuYW1lcyAoZ2V0IHBhcmFtcyAnOnJlbmFtZSlcbiAgICAgICAgbmFtZXMgKGdldCBwYXJhbXMgJzpyZWZlcilcbiAgICAgICAgYWxpYXMgKGdldCBwYXJhbXMgJzphcylcbiAgICAgICAgcmVmZXJlbmNlcyAoaWYgKG5vdCAoZW1wdHk/IG5hbWVzKSlcbiAgICAgICAgICAgICAgICAgICAgIChyZWR1Y2UgKGZuIFtyZWZlcnMgcmVmZXJlbmNlXVxuICAgICAgICAgICAgICAgICAgICAgIChjb25qIHJlZmVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHs6b3AgOnJlZmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtIHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6bmFtZSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOzsgTG9vayB1cCBieSByZWZlcmVuY2Ugc3ltYm9sIGFuZCBieSBzeW1ib2xcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7OyBiaXQgaW4gYSBmdXp6IHJpZ2h0IG5vdy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnJlbmFtZSAob3IgKGdldCByZW5hbWVzIHJlZmVyZW5jZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGdldCByZW5hbWVzIChuYW1lIHJlZmVyZW5jZSkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6bnMgaWR9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXMpKV1cbiAgICB7Om9wIDpyZXF1aXJlXG4gICAgIDphbGlhcyBhbGlhc1xuICAgICA6bnMgaWRcbiAgICAgOnJlZmVyIHJlZmVyZW5jZXNcbiAgICAgOmZvcm0gZm9ybX0pKVxuXG4oZGVmbiBhbmFseXplLW5zXG4gIFtlbnYgZm9ybV1cbiAgKGxldCBbZm9ybXMgKHJlc3QgZm9ybSlcbiAgICAgICAgbmFtZSAoZmlyc3QgZm9ybXMpXG4gICAgICAgIGJvZHkgKHJlc3QgZm9ybXMpXG4gICAgICAgIDs7IE9wdGlvbmFsIGRvY3N0cmluZyB0aGF0IGZvbGxvd3MgbmFtZSBzeW1ib2xcbiAgICAgICAgZG9jIChpZiAoc3RyaW5nPyAoZmlyc3QgYm9keSkpIChmaXJzdCBib2R5KSlcbiAgICAgICAgOzsgSWYgc2Vjb25kIGZvcm0gaXMgbm90IGEgc3RyaW5nIHRoYW4gdHJlYXQgaXRcbiAgICAgICAgOzsgYXMgcmVndWxhciByZWZlcmVuY2UgZm9ybVxuICAgICAgICByZWZlcmVuY2VzIChwYXJzZS1yZWZlcmVuY2VzIChpZiBkb2NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXN0IGJvZHkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5KSlcbiAgICAgICAgcmVxdWlyZW1lbnRzIChpZiAoOnJlcXVpcmUgcmVmZXJlbmNlcylcbiAgICAgICAgICAgICAgICAgICAgICAgKG1hcCBwYXJzZS1yZXF1aXJlICg6cmVxdWlyZSByZWZlcmVuY2VzKSkpXVxuICAgIHs6b3AgOm5zXG4gICAgIDpuYW1lIG5hbWVcbiAgICAgOmRvYyBkb2NcbiAgICAgOnJlcXVpcmUgKGlmIHJlcXVpcmVtZW50c1xuICAgICAgICAgICAgICAgICh2ZWMgcmVxdWlyZW1lbnRzKSlcbiAgICAgOmZvcm0gZm9ybX0pKVxuKGluc3RhbGwtc3BlY2lhbCEgOm5zIGFuYWx5emUtbnMpXG5cblxuKGRlZm4gYW5hbHl6ZS1saXN0XG4gIFwiVGFrZXMgZm9ybSBvZiBsaXN0IHR5cGUgYW5kIHBlcmZvcm1zIGEgbWFjcm9leHBhbnNpb25zIHVudGlsXG4gIGZ1bGx5IGV4cGFuZGVkLiBJZiBleHBhbnNpb24gaXMgZGlmZmVyZW50IGZyb20gYSBnaXZlbiBmb3JtIHRoZW5cbiAgZXhwYW5kZWQgZm9ybSBpcyBoYW5kZWQgYmFjayB0byBhbmFseXplci4gSWYgZm9ybSBpcyBzcGVjaWFsIGxpa2VcbiAgZGVmLCBmbiwgbGV0Li4uIHRoYW4gYXNzb2NpYXRlZCBpcyBkaXNwYXRjaGVkLCBvdGhlcndpc2UgZm9ybSBpc1xuICBhbmFseXplZCBhcyBpbnZva2UgZXhwcmVzc2lvbi5cIlxuICBbZW52IGZvcm1dXG4gIChsZXQgW2V4cGFuc2lvbiAobWFjcm9leHBhbmQgZm9ybSlcbiAgICAgICAgOzsgU3BlY2lhbCBvcGVyYXRvcnMgbXVzdCBiZSBzeW1ib2xzIGFuZCBzdG9yZWQgaW4gdGhlXG4gICAgICAgIDs7ICoqc3BlY2lhbHMqKiBoYXNoIGJ5IG9wZXJhdG9yIG5hbWUuXG4gICAgICAgIG9wZXJhdG9yIChmaXJzdCBmb3JtKVxuICAgICAgICBhbmFseXplciAoYW5kIChzeW1ib2w/IG9wZXJhdG9yKVxuICAgICAgICAgICAgICAgICAgICAgIChnZXQgKipzcGVjaWFscyoqIChuYW1lIG9wZXJhdG9yKSkpXVxuICAgIDs7IElmIGZvcm0gaXMgZXhwYW5kZWQgcGFzcyBpdCBiYWNrIHRvIGFuYWx5emUgc2luY2UgaXQgbWF5IG5vXG4gICAgOzsgbG9uZ2VyIGJlIGEgbGlzdC4gT3RoZXJ3aXNlIGVpdGhlciBhbmFseXplIGFzIGEgc3BlY2lhbCBmb3JtXG4gICAgOzsgKGlmIGl0J3Mgc3VjaCkgb3IgYXMgZnVuY3Rpb24gaW52b2thdGlvbiBmb3JtLlxuICAgIChjb25kIChub3QgKGlkZW50aWNhbD8gZXhwYW5zaW9uIGZvcm0pKSAoYW5hbHl6ZSBlbnYgZXhwYW5zaW9uKVxuICAgICAgICAgIGFuYWx5emVyIChhbmFseXplLXNwZWNpYWwgYW5hbHl6ZXIgZW52IGV4cGFuc2lvbilcbiAgICAgICAgICA6ZWxzZSAoYW5hbHl6ZS1pbnZva2UgZW52IGV4cGFuc2lvbikpKSlcblxuKGRlZm4gYW5hbHl6ZS12ZWN0b3JcbiAgW2VudiBmb3JtXVxuICAobGV0IFtpdGVtcyAodmVjIChtYXAgIyhhbmFseXplIGVudiAlKSBmb3JtKSldXG4gICAgezpvcCA6dmVjdG9yXG4gICAgIDpmb3JtIGZvcm1cbiAgICAgOml0ZW1zIGl0ZW1zfSkpXG5cbihkZWZuIGFuYWx5emUtZGljdGlvbmFyeVxuICBbZW52IGZvcm1dXG4gIChsZXQgW25hbWVzICh2ZWMgKG1hcCAjKGFuYWx5emUgZW52ICUpIChrZXlzIGZvcm0pKSlcbiAgICAgICAgdmFsdWVzICh2ZWMgKG1hcCAjKGFuYWx5emUgZW52ICUpICh2YWxzIGZvcm0pKSldXG4gICAgezpvcCA6ZGljdGlvbmFyeVxuICAgICA6a2V5cyBuYW1lc1xuICAgICA6dmFsdWVzIHZhbHVlc1xuICAgICA6Zm9ybSBmb3JtfSkpXG5cbihkZWZuIGFuYWx5emUtaW52b2tlXG4gIFwiUmV0dXJucyBub2RlIG9mIDppbnZva2UgdHlwZSwgcmVwcmVzZW50aW5nIGEgZnVuY3Rpb24gY2FsbC4gSW5cbiAgYWRkaXRpb24gdG8gcmVndWxhciBwcm9wZXJ0aWVzIHRoaXMgbm9kZSBjb250YWlucyA6Y2FsbGVlIG1hcHBlZFxuICB0byBhIG5vZGUgdGhhdCBpcyBiZWluZyBpbnZva2VkIGFuZCA6cGFyYW1zIHRoYXQgaXMgYW4gdmVjdG9yIG9mXG4gIHBhcmFtdGVyIGV4cHJlc3Npb25zIHRoYXQgOmNhbGxlZSBpcyBpbnZva2VkIHdpdGguXCJcbiAgW2VudiBmb3JtXVxuICAobGV0IFtjYWxsZWUgKGFuYWx5emUgZW52IChmaXJzdCBmb3JtKSlcbiAgICAgICAgcGFyYW1zICh2ZWMgKG1hcCAjKGFuYWx5emUgZW52ICUpIChyZXN0IGZvcm0pKSldXG4gICAgezpvcCA6aW52b2tlXG4gICAgIDpjYWxsZWUgY2FsbGVlXG4gICAgIDpwYXJhbXMgcGFyYW1zXG4gICAgIDpmb3JtIGZvcm19KSlcblxuKGRlZm4gYW5hbHl6ZS1jb25zdGFudFxuICBcIlJldHVybnMgYSBub2RlIHJlcHJlc2VudGluZyBhIGNvbnRzdGFudCB2YWx1ZSB3aGljaCBpc1xuICBtb3N0IGNlcnRhaW5seSBhIHByaW1pdGl2ZSB2YWx1ZSBsaXRlcmFsIHRoaXMgZm9ybSBjYW50YWluc1xuICBubyBleHRyYSBpbmZvcm1hdGlvbi5cIlxuICBbZW52IGZvcm1dXG4gIHs6b3AgOmNvbnN0YW50XG4gICA6Zm9ybSBmb3JtfSlcblxuKGRlZm4gYW5hbHl6ZVxuICBcIlRha2VzIGEgaGFzaCByZXByZXNlbnRpbmcgYSBnaXZlbiBlbnZpcm9ubWVudCBhbmQgYGZvcm1gIHRvIGJlXG4gIGFuYWx5emVkLiBFbnZpcm9ubWVudCBtYXkgY29udGFpbiBmb2xsb3dpbmcgZW50cmllczpcblxuICA6bG9jYWxzICAtIEhhc2ggb2YgdGhlIGdpdmVuIGVudmlyb25tZW50cyBiaW5kaW5ncyBtYXBwZWR5IGJ5IGJpbmRpbmcgbmFtZS5cbiAgOmNvbnRleHQgLSBPbmUgb2YgdGhlIGZvbGxvd2luZyA6c3RhdGVtZW50LCA6ZXhwcmVzc2lvbiwgOnJldHVybi4gVGhhdFxuICAgICAgICAgICAgIGluZm9ybWF0aW9uIGlzIGluY2x1ZGVkIGluIHJlc3VsdGluZyBub2RlcyBhbmQgaXMgbWVhbnQgZm9yXG4gICAgICAgICAgICAgd3JpdGVyIHRoYXQgbWF5IG91dHB1dCBkaWZmZXJlbnQgZm9ybXMgYmFzZWQgb24gY29udGV4dC5cbiAgOm5zICAgICAgLSBOYW1lc3BhY2Ugb2YgdGhlIGZvcm1zIGJlaW5nIGFuYWxpemVkLlxuXG4gIEFuYWx5emVyIHBlcmZvcm1zIGFsbCB0aGUgbWFjcm8gJiBzeW50YXggZXhwYW5zaW9ucyBhbmQgdHJhbnNmb3JtcyBmb3JtXG4gIGludG8gQVNUIG5vZGUgb2YgYW4gZXhwcmVzc2lvbi4gRWFjaCBzdWNoIG5vZGUgY29udGFpbnMgYXQgbGVhc3QgZm9sbG93aW5nXG4gIHByb3BlcnRpZXM6XG5cbiAgOm9wICAgLSBPcGVyYXRpb24gdHlwZSBvZiB0aGUgZXhwcmVzc2lvbi5cbiAgOmZvcm0gLSBHaXZlbiBmb3JtLlxuXG4gIEJhc2VkIG9uIDpvcCBub2RlIG1heSBjb250YWluIGRpZmZlcmVudCBzZXQgb2YgcHJvcGVydGllcy5cIlxuICAoW2Zvcm1dIChhbmFseXplIHs6bG9jYWxzIHt9XG4gICAgICAgICAgICAgICAgICAgIDpiaW5kaW5ncyBbXVxuICAgICAgICAgICAgICAgICAgICA6dG9wIHRydWV9IGZvcm0pKVxuICAoW2VudiBmb3JtXVxuICAgKGNvbmQgKG5pbD8gZm9ybSkgKGFuYWx5emUtY29uc3RhbnQgZW52IGZvcm0pXG4gICAgICAgICAoc3ltYm9sPyBmb3JtKSAoYW5hbHl6ZS1zeW1ib2wgZW52IGZvcm0pXG4gICAgICAgICAobGlzdD8gZm9ybSkgKGlmIChlbXB0eT8gZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgIChhbmFseXplLXF1b3RlZCBmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgKGFuYWx5emUtbGlzdCBlbnYgZm9ybSkpXG4gICAgICAgICAoZGljdGlvbmFyeT8gZm9ybSkgKGFuYWx5emUtZGljdGlvbmFyeSBlbnYgZm9ybSlcbiAgICAgICAgICh2ZWN0b3I/IGZvcm0pIChhbmFseXplLXZlY3RvciBlbnYgZm9ybSlcbiAgICAgICAgIDsoc2V0PyBmb3JtKSAoYW5hbHl6ZS1zZXQgZW52IGZvcm0gbmFtZSlcbiAgICAgICAgIChrZXl3b3JkPyBmb3JtKSAoYW5hbHl6ZS1rZXl3b3JkIGVudiBmb3JtKVxuICAgICAgICAgOmVsc2UgKGFuYWx5emUtY29uc3RhbnQgZW52IGZvcm0pKSkpXG4iXX0=

},{"./ast":9,"./expander":14,"./runtime":33,"./sequence":34,"./string":35}],9:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.ast',
            doc: void 0
        };
    var wisp_sequence = require('./sequence');
    var isList = wisp_sequence.isList;
    var isSequential = wisp_sequence.isSequential;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var count = wisp_sequence.count;
    var last = wisp_sequence.last;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var repeat = wisp_sequence.repeat;
    var wisp_string = require('./string');
    var split = wisp_string.split;
    var join = wisp_string.join;
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isVector = wisp_runtime.isVector;
    var isNumber = wisp_runtime.isNumber;
    var isString = wisp_runtime.isString;
    var isBoolean = wisp_runtime.isBoolean;
    var isObject = wisp_runtime.isObject;
    var isDate = wisp_runtime.isDate;
    var isRePattern = wisp_runtime.isRePattern;
    var isDictionary = wisp_runtime.isDictionary;
    var str = wisp_runtime.str;
    var inc = wisp_runtime.inc;
    var subs = wisp_runtime.subs;
    var isEqual = wisp_runtime.isEqual;
}
var withMeta = exports.withMeta = function withMeta(value, metadata) {
        Object.defineProperty(value, 'metadata', {
            'value': metadata,
            'configurable': true
        });
        return value;
    };
var meta = exports.meta = function meta(value) {
        return isNil(value) ? void 0 : value.metadata;
    };
var __nsSeparator__ = exports.__nsSeparator__ = '\u2044';
var Symbol = function Symbol(namespace, name) {
    this.namespace = namespace;
    this.name = name;
    return this;
};
Symbol.type = 'wisp.symbol';
Symbol.prototype.type = Symbol.type;
Symbol.prototype.toString = function () {
    return function () {
        var prefixø1 = '' + '\uFEFF' + '\'';
        var nsø1 = namespace(this);
        return nsø1 ? '' + prefixø1 + nsø1 + '/' + name(this) : '' + prefixø1 + name(this);
    }.call(this);
};
var symbol = exports.symbol = function symbol(ns, id) {
        return isSymbol(ns) ? ns : isKeyword(ns) ? new Symbol(namespace(ns), name(ns)) : isNil(id) ? new Symbol(void 0, ns) : 'else' ? new Symbol(ns, id) : void 0;
    };
var isSymbol = exports.isSymbol = function isSymbol(x) {
        return isString(x) && '\uFEFF' === x[0] && '\'' === x[1] || x && Symbol.type === x.type;
    };
var isKeyword = exports.isKeyword = function isKeyword(x) {
        return isString(x) && count(x) > 1 && first(x) === '\uA789';
    };
var keyword = exports.keyword = function keyword(ns, id) {
        return isKeyword(ns) ? ns : isSymbol(ns) ? '' + '\uA789' + name(ns) : isNil(id) ? '' + '\uA789' + ns : isNil(ns) ? '' + '\uA789' + id : 'else' ? '' + '\uA789' + ns + __nsSeparator__ + id : void 0;
    };
var keywordName = function keywordName(value) {
    return last(split(subs(value, 1), __nsSeparator__));
};
var symbolName = function symbolName(value) {
    return value.name || last(split(subs(value, 2), __nsSeparator__));
};
var name = exports.name = function name(value) {
        return isSymbol(value) ? symbolName(value) : isKeyword(value) ? keywordName(value) : isString(value) ? value : 'else' ? (function () {
            throw new TypeError('' + 'Doesn\'t support name: ' + value);
        })() : void 0;
    };
var keywordNamespace = function keywordNamespace(x) {
    return function () {
        var partsø1 = split(subs(x, 1), __nsSeparator__);
        return count(partsø1) > 1 ? partsø1[0] : void 0;
    }.call(this);
};
var symbolNamespace = function symbolNamespace(x) {
    return function () {
        var partsø1 = isString(x) ? split(subs(x, 1), __nsSeparator__) : [
                x.namespace,
                x.name
            ];
        return count(partsø1) > 1 ? partsø1[0] : void 0;
    }.call(this);
};
var namespace = exports.namespace = function namespace(x) {
        return isSymbol(x) ? symbolNamespace(x) : isKeyword(x) ? keywordNamespace(x) : 'else' ? (function () {
            throw new TypeError('' + 'Doesn\'t supports namespace: ' + x);
        })() : void 0;
    };
var gensym = exports.gensym = function gensym(prefix) {
        return symbol('' + (isNil(prefix) ? 'G__' : prefix) + (gensym.base = gensym.base + 1));
    };
gensym.base = 0;
var isUnquote = exports.isUnquote = function isUnquote(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'unquote'));
    };
var isUnquoteSplicing = exports.isUnquoteSplicing = function isUnquoteSplicing(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'unquote-splicing'));
    };
var isQuote = exports.isQuote = function isQuote(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'quote'));
    };
var isSyntaxQuote = exports.isSyntaxQuote = function isSyntaxQuote(form) {
        return isList(form) && isEqual(first(form), symbol(void 0, 'syntax-quote'));
    };
var normalize = function normalize(n, len) {
    return function loop() {
        var recur = loop;
        var nsø1 = '' + n;
        do {
            recur = count(nsø1) < len ? (loop[0] = '' + '0' + nsø1, loop) : nsø1;
        } while (nsø1 = loop[0], recur === loop);
        return recur;
    }.call(this);
};
var quoteString = exports.quoteString = function quoteString(s) {
        s = join('\\"', split(s, '"'));
        s = join('\\\\', split(s, '\\'));
        s = join('\\b', split(s, '\b'));
        s = join('\\f', split(s, '\f'));
        s = join('\\n', split(s, '\n'));
        s = join('\\r', split(s, '\r'));
        s = join('\\t', split(s, '\t'));
        return '' + '"' + s + '"';
    };
var prStr = exports.prStr = function prStr(x, offset) {
        return function () {
            var offsetø2 = offset || 0;
            return isNil(x) ? 'nil' : isKeyword(x) ? namespace(x) ? '' + ':' + namespace(x) + '/' + name(x) : '' + ':' + name(x) : isSymbol(x) ? namespace(x) ? '' + namespace(x) + '/' + name(x) : name(x) : isString(x) ? quoteString(x) : isDate(x) ? '' + '#inst "' + x.getUTCFullYear() + '-' + normalize(inc(x.getUTCMonth()), 2) + '-' + normalize(x.getUTCDate(), 2) + 'T' + normalize(x.getUTCHours(), 2) + ':' + normalize(x.getUTCMinutes(), 2) + ':' + normalize(x.getUTCSeconds(), 2) + '.' + normalize(x.getUTCMilliseconds(), 3) + '-' + '00:00"' : isVector(x) ? '' + '[' + join('' + '\n ' + join(repeat(inc(offsetø2), ' ')), map(function ($1) {
                return prStr($1, inc(offsetø2));
            }, vec(x))) + ']' : isDictionary(x) ? '' + '{' + join('' + ',\n' + join(repeat(inc(offsetø2), ' ')), map(function (pair) {
                return function () {
                    var indentø1 = join(repeat(offsetø2, ' '));
                    var keyø1 = prStr(first(pair), inc(offsetø2));
                    var valueø1 = prStr(second(pair), 2 + offsetø2 + count(keyø1));
                    return '' + keyø1 + ' ' + valueø1;
                }.call(this);
            }, x)) + '}' : isSequential(x) ? '' + '(' + join(' ', map(function ($1) {
                return prStr($1, inc(offsetø2));
            }, vec(x))) + ')' : isRePattern(x) ? '' + '#"' + join('\\/', split(x.source, '/')) + '"' : 'else' ? '' + x : void 0;
        }.call(this);
    };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvYXN0Lndpc3AiXSwibmFtZXMiOlsiaXNMaXN0IiwiaXNTZXF1ZW50aWFsIiwiZmlyc3QiLCJzZWNvbmQiLCJjb3VudCIsImxhc3QiLCJtYXAiLCJ2ZWMiLCJyZXBlYXQiLCJzcGxpdCIsImpvaW4iLCJpc05pbCIsImlzVmVjdG9yIiwiaXNOdW1iZXIiLCJpc1N0cmluZyIsImlzQm9vbGVhbiIsImlzT2JqZWN0IiwiaXNEYXRlIiwiaXNSZVBhdHRlcm4iLCJpc0RpY3Rpb25hcnkiLCJzdHIiLCJpbmMiLCJzdWJzIiwiaXNFcXVhbCIsIndpdGhNZXRhIiwidmFsdWUiLCJtZXRhZGF0YSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwibWV0YSIsIl9fbnNTZXBhcmF0b3JfXyIsIlN5bWJvbCIsIm5hbWVzcGFjZSIsIm5hbWUiLCJ0aGlzIiwidHlwZSIsInByb3RvdHlwZS50eXBlIiwicHJvdG90eXBlLnRvU3RyaW5nIiwicHJlZml4w7gxIiwibnPDuDEiLCJzeW1ib2wiLCJucyIsImlkIiwiaXNTeW1ib2wiLCJpc0tleXdvcmQiLCJ4Iiwia2V5d29yZCIsImtleXdvcmROYW1lIiwic3ltYm9sTmFtZSIsImtleXdvcmROYW1lc3BhY2UiLCJwYXJ0c8O4MSIsInN5bWJvbE5hbWVzcGFjZSIsImdlbnN5bSIsInByZWZpeCIsImJhc2UiLCJpc1VucXVvdGUiLCJmb3JtIiwiaXNVbnF1b3RlU3BsaWNpbmciLCJpc1F1b3RlIiwiaXNTeW50YXhRdW90ZSIsIm5vcm1hbGl6ZSIsIm4iLCJsZW4iLCJxdW90ZVN0cmluZyIsInMiLCJwclN0ciIsIm9mZnNldCIsIm9mZnNldMO4MiIsImdldFVUQ0Z1bGxZZWFyIiwiZ2V0VVRDTW9udGgiLCJnZXRVVENEYXRlIiwiZ2V0VVRDSG91cnMiLCJnZXRVVENNaW51dGVzIiwiZ2V0VVRDU2Vjb25kcyIsImdldFVUQ01pbGxpc2Vjb25kcyIsIiQxIiwicGFpciIsImluZGVudMO4MSIsImtlecO4MSIsInZhbHVlw7gxIiwi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Y0FBMEJuQyxJQUFELEMsR0FBQSxFQUFXSixHQUFELENBQUssVUFBU3FFLEVBQVQsRTt1QkFBRVYsSyxDQUFPVSxFLEVBQUd0RCxHQUFELENBQUs4QyxRQUFMLEM7YUFBaEIsRUFDTTVELEdBQUQsQ0FBS3NDLENBQUwsQ0FETCxDQUFWLENBQVQsRyxNQUVmM0IsV0FBRCxDQUFhMkIsQ0FBYixDLGVBQTRCbkMsSUFBRCxDLEtBQUEsRUFBYUQsS0FBRCxDQUFpQm9DLENBQVYsQ0FBR21DLE1BQVYsRSxHQUFBLENBQVosQ0FBWCxHLGlCQUNWLEdBQUtuQyxDLFNBbkNqQixDO2NBREYsQyxJQUFBLEU7S0FGRiIsInNvdXJjZXNDb250ZW50IjpbIihucyB3aXNwLmFzdFxuICAoOnJlcXVpcmUgW3dpc3Auc2VxdWVuY2UgOnJlZmVyIFtsaXN0PyBzZXF1ZW50aWFsPyBmaXJzdCBzZWNvbmQgY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCBtYXAgdmVjIHJlcGVhdF1dXG4gICAgICAgICAgICBbd2lzcC5zdHJpbmcgOnJlZmVyIFtzcGxpdCBqb2luXV1cbiAgICAgICAgICAgIFt3aXNwLnJ1bnRpbWUgOnJlZmVyIFtuaWw/IHZlY3Rvcj8gbnVtYmVyPyBzdHJpbmc/IGJvb2xlYW4/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0PyBkYXRlPyByZS1wYXR0ZXJuPyBkaWN0aW9uYXJ5P1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ciBpbmMgc3VicyA9XV0pKVxuXG4oZGVmbiB3aXRoLW1ldGFcbiAgXCJSZXR1cm5zIGlkZW50aWNhbCB2YWx1ZSB3aXRoIGdpdmVuIG1ldGFkYXRhIGFzc29jaWF0ZWQgdG8gaXQuXCJcbiAgW3ZhbHVlIG1ldGFkYXRhXVxuICAoLmRlZmluZVByb3BlcnR5IE9iamVjdCB2YWx1ZSBcIm1ldGFkYXRhXCIgezp2YWx1ZSBtZXRhZGF0YSA6Y29uZmlndXJhYmxlIHRydWV9KVxuICB2YWx1ZSlcblxuKGRlZm4gbWV0YVxuICBcIlJldHVybnMgdGhlIG1ldGFkYXRhIG9mIHRoZSBnaXZlbiB2YWx1ZSBvciBuaWwgaWYgdGhlcmUgaXMgbm8gbWV0YWRhdGEuXCJcbiAgW3ZhbHVlXVxuICAoaWYgKG5pbD8gdmFsdWUpIG5pbCAoLi1tZXRhZGF0YSB2YWx1ZSkpKVxuXG4oZGVmICoqbnMtc2VwYXJhdG9yKiogXCJcXHUyMDQ0XCIpXG5cbihkZWZuLSBTeW1ib2xcbiAgXCJUeXBlIGZvciB0aGUgc3ltYm9sc1wiXG4gIFtuYW1lc3BhY2UgbmFtZV1cbiAgKHNldCEgKC4tbmFtZXNwYWNlIHRoaXMpIG5hbWVzcGFjZSlcbiAgKHNldCEgKC4tbmFtZSB0aGlzKSBuYW1lKVxuICB0aGlzKVxuKHNldCEgU3ltYm9sLnR5cGUgXCJ3aXNwLnN5bWJvbFwiKVxuKHNldCEgU3ltYm9sLnByb3RvdHlwZS50eXBlIFN5bWJvbC50eXBlKVxuKHNldCEgU3ltYm9sLnByb3RvdHlwZS50by1zdHJpbmdcbiAgICAgIChmbiBbXVxuICAgICAgICAobGV0IFtwcmVmaXggKHN0ciBcIlxcdUZFRkZcIiBcIidcIilcbiAgICAgICAgICAgICAgbnMgKG5hbWVzcGFjZSB0aGlzKV1cbiAgICAgICAgICAoaWYgbnNcbiAgICAgICAgICAgIChzdHIgcHJlZml4IG5zIFwiL1wiIChuYW1lIHRoaXMpKVxuICAgICAgICAgICAgKHN0ciBwcmVmaXggKG5hbWUgdGhpcykpKSkpKVxuXG4oZGVmbiBzeW1ib2xcbiAgXCJSZXR1cm5zIGEgU3ltYm9sIHdpdGggdGhlIGdpdmVuIG5hbWVzcGFjZSBhbmQgbmFtZS5cIlxuICBbbnMgaWRdXG4gIChjb25kXG4gICAoc3ltYm9sPyBucykgbnNcbiAgIChrZXl3b3JkPyBucykgKFN5bWJvbC4gKG5hbWVzcGFjZSBucykgKG5hbWUgbnMpKVxuICAgKG5pbD8gaWQpIChTeW1ib2wuIG5pbCBucylcbiAgIDplbHNlIChTeW1ib2wuIG5zIGlkKSkpXG5cbihkZWZuIF5ib29sZWFuIHN5bWJvbD8gW3hdXG4gIChvciAoYW5kIChzdHJpbmc/IHgpXG4gICAgICAgICAgIChpZGVudGljYWw/IFwiXFx1RkVGRlwiIChhZ2V0IHggMCkpXG4gICAgICAgICAgIChpZGVudGljYWw/IFwiJ1wiIChhZ2V0IHggMSkpKVxuICAgICAgKGFuZCB4XG4gICAgICAgICAgIChpZGVudGljYWw/IFN5bWJvbC50eXBlIHgudHlwZSkpKSlcblxuKGRlZm4gXmJvb2xlYW4ga2V5d29yZD8gW3hdXG4gIChhbmQgKHN0cmluZz8geClcbiAgICAgICAoPiAoY291bnQgeCkgMSlcbiAgICAgICAoaWRlbnRpY2FsPyAoZmlyc3QgeCkgXCJcXHVBNzg5XCIpKSlcblxuKGRlZm4ga2V5d29yZFxuICBcIlJldHVybnMgYSBLZXl3b3JkIHdpdGggdGhlIGdpdmVuIG5hbWVzcGFjZSBhbmQgbmFtZS4gRG8gbm90IHVzZSA6XG4gIGluIHRoZSBrZXl3b3JkIHN0cmluZ3MsIGl0IHdpbGwgYmUgYWRkZWQgYXV0b21hdGljYWxseS5cIlxuICBbbnMgaWRdXG4gIChjb25kIChrZXl3b3JkPyBucykgbnNcbiAgICAgICAgKHN5bWJvbD8gbnMpIChzdHIgXCJcXHVBNzg5XCIgKG5hbWUgbnMpKVxuICAgICAgICAobmlsPyBpZCkgKHN0ciBcIlxcdUE3ODlcIiBucylcbiAgICAgICAgKG5pbD8gbnMpIChzdHIgXCJcXHVBNzg5XCIgaWQpXG4gICAgICAgIDplbHNlIChzdHIgXCJcXHVBNzg5XCIgbnMgKipucy1zZXBhcmF0b3IqKiBpZCkpKVxuXG4oZGVmbi0ga2V5d29yZC1uYW1lXG4gIFt2YWx1ZV1cbiAgKGxhc3QgKHNwbGl0IChzdWJzIHZhbHVlIDEpICoqbnMtc2VwYXJhdG9yKiopKSlcblxuKGRlZm4tIHN5bWJvbC1uYW1lXG4gIFt2YWx1ZV1cbiAgKG9yICguLW5hbWUgdmFsdWUpXG4gICAgICAobGFzdCAoc3BsaXQgKHN1YnMgdmFsdWUgMikgKipucy1zZXBhcmF0b3IqKikpKSlcblxuKGRlZm4gbmFtZVxuICBcIlJldHVybnMgdGhlIG5hbWUgU3RyaW5nIG9mIGEgc3RyaW5nLCBzeW1ib2wgb3Iga2V5d29yZC5cIlxuICBbdmFsdWVdXG4gIChjb25kIChzeW1ib2w/IHZhbHVlKSAoc3ltYm9sLW5hbWUgdmFsdWUpXG4gICAgICAgIChrZXl3b3JkPyB2YWx1ZSkgKGtleXdvcmQtbmFtZSB2YWx1ZSlcbiAgICAgICAgKHN0cmluZz8gdmFsdWUpIHZhbHVlXG4gICAgICAgIDplbHNlICh0aHJvdyAoVHlwZUVycm9yLiAoc3RyIFwiRG9lc24ndCBzdXBwb3J0IG5hbWU6IFwiIHZhbHVlKSkpKSlcblxuKGRlZm4tIGtleXdvcmQtbmFtZXNwYWNlXG4gIFt4XVxuICAobGV0IFtwYXJ0cyAoc3BsaXQgKHN1YnMgeCAxKSAqKm5zLXNlcGFyYXRvcioqKV1cbiAgICAoaWYgKD4gKGNvdW50IHBhcnRzKSAxKSAoYWdldCBwYXJ0cyAwKSkpKVxuXG4oZGVmbi0gc3ltYm9sLW5hbWVzcGFjZVxuICBbeF1cbiAgKGxldCBbcGFydHMgKGlmIChzdHJpbmc/IHgpXG4gICAgICAgICAgICAgICAgKHNwbGl0IChzdWJzIHggMSkgKipucy1zZXBhcmF0b3IqKilcbiAgICAgICAgICAgICAgICBbKC4tbmFtZXNwYWNlIHgpICguLW5hbWUgeCldKV1cbiAgICAoaWYgKD4gKGNvdW50IHBhcnRzKSAxKSAoYWdldCBwYXJ0cyAwKSkpKVxuXG4oZGVmbiBuYW1lc3BhY2VcbiAgXCJSZXR1cm5zIHRoZSBuYW1lc3BhY2UgU3RyaW5nIG9mIGEgc3ltYm9sIG9yIGtleXdvcmQsIG9yIG5pbCBpZiBub3QgcHJlc2VudC5cIlxuICBbeF1cbiAgKGNvbmQgKHN5bWJvbD8geCkgKHN5bWJvbC1uYW1lc3BhY2UgeClcbiAgICAgICAgKGtleXdvcmQ/IHgpIChrZXl3b3JkLW5hbWVzcGFjZSB4KVxuICAgICAgICA6ZWxzZSAodGhyb3cgKFR5cGVFcnJvci4gKHN0ciBcIkRvZXNuJ3Qgc3VwcG9ydHMgbmFtZXNwYWNlOiBcIiB4KSkpKSlcblxuKGRlZm4gZ2Vuc3ltXG4gIFwiUmV0dXJucyBhIG5ldyBzeW1ib2wgd2l0aCBhIHVuaXF1ZSBuYW1lLiBJZiBhIHByZWZpeCBzdHJpbmcgaXNcbiAgc3VwcGxpZWQsIHRoZSBuYW1lIGlzIHByZWZpeCMgd2hlcmUgIyBpcyBzb21lIHVuaXF1ZSBudW1iZXIuIElmXG4gIHByZWZpeCBpcyBub3Qgc3VwcGxpZWQsIHRoZSBwcmVmaXggaXMgJ0dfXycuXCJcbiAgW3ByZWZpeF1cbiAgKHN5bWJvbCAoc3RyIChpZiAobmlsPyBwcmVmaXgpIFwiR19fXCIgcHJlZml4KVxuICAgICAgICAgICAgICAgKHNldCEgZ2Vuc3ltLmJhc2UgKCsgZ2Vuc3ltLmJhc2UgMSkpKSkpXG4oc2V0ISBnZW5zeW0uYmFzZSAwKVxuXG5cbihkZWZuIF5ib29sZWFuIHVucXVvdGU/XG4gIFwiUmV0dXJucyB0cnVlIGlmIGl0J3MgdW5xdW90ZSBmb3JtOiB+Zm9vXCJcbiAgW2Zvcm1dXG4gIChhbmQgKGxpc3Q/IGZvcm0pICg9IChmaXJzdCBmb3JtKSAndW5xdW90ZSkpKVxuXG4oZGVmbiBeYm9vbGVhbiB1bnF1b3RlLXNwbGljaW5nP1xuICBcIlJldHVybnMgdHJ1ZSBpZiBpdCdzIHVucXVvdGUtc3BsaWNpbmcgZm9ybTogfkBmb29cIlxuICBbZm9ybV1cbiAgKGFuZCAobGlzdD8gZm9ybSkgKD0gKGZpcnN0IGZvcm0pICd1bnF1b3RlLXNwbGljaW5nKSkpXG5cbihkZWZuIF5ib29sZWFuIHF1b3RlP1xuICBcIlJldHVybnMgdHJ1ZSBpZiBpdCdzIHF1b3RlIGZvcm06ICdmb28gJyhmb28pXCJcbiAgW2Zvcm1dXG4gIChhbmQgKGxpc3Q/IGZvcm0pICg9IChmaXJzdCBmb3JtKSAncXVvdGUpKSlcblxuKGRlZm4gXmJvb2xlYW4gc3ludGF4LXF1b3RlP1xuICBcIlJldHVybnMgdHJ1ZSBpZiBpdCdzIHN5bnRheCBxdW90ZSBmb3JtOiBgZm9vIGAoZm9vKVwiXG4gIFtmb3JtXVxuICAoYW5kIChsaXN0PyBmb3JtKSAoPSAoZmlyc3QgZm9ybSkgJ3N5bnRheC1xdW90ZSkpKVxuXG4oZGVmbi0gbm9ybWFsaXplIFtuIGxlbl1cbiAgKGxvb3AgW25zIChzdHIgbildXG4gICAgKGlmICg8IChjb3VudCBucykgbGVuKVxuICAgICAgKHJlY3VyIChzdHIgXCIwXCIgbnMpKVxuICAgICAgbnMpKSlcblxuKGRlZm4gcXVvdGUtc3RyaW5nXG4gIFtzXVxuICAoc2V0ISBzIChqb2luIFwiXFxcXFxcXCJcIiAoc3BsaXQgcyBcIlxcXCJcIikpKVxuICAoc2V0ISBzIChqb2luIFwiXFxcXFxcXFxcIiAoc3BsaXQgcyBcIlxcXFxcIikpKVxuICAoc2V0ISBzIChqb2luIFwiXFxcXGJcIiAoc3BsaXQgcyBcIlxcYlwiKSkpXG4gIChzZXQhIHMgKGpvaW4gXCJcXFxcZlwiIChzcGxpdCBzIFwiXFxmXCIpKSlcbiAgKHNldCEgcyAoam9pbiBcIlxcXFxuXCIgKHNwbGl0IHMgXCJcXG5cIikpKVxuICAoc2V0ISBzIChqb2luIFwiXFxcXHJcIiAoc3BsaXQgcyBcIlxcclwiKSkpXG4gIChzZXQhIHMgKGpvaW4gXCJcXFxcdFwiIChzcGxpdCBzIFwiXFx0XCIpKSlcbiAgKHN0ciBcIlxcXCJcIiBzIFwiXFxcIlwiKSlcblxuKGRlZm4gXnN0cmluZyBwci1zdHJcbiAgW3ggb2Zmc2V0XVxuICAobGV0IFtvZmZzZXQgKG9yIG9mZnNldCAwKV1cbiAgICAoY29uZCAobmlsPyB4KSBcIm5pbFwiXG4gICAgICAgICAgKGtleXdvcmQ/IHgpIChpZiAobmFtZXNwYWNlIHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKHN0ciBcIjpcIiAobmFtZXNwYWNlIHgpIFwiL1wiIChuYW1lIHgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIChzdHIgXCI6XCIgKG5hbWUgeCkpKVxuICAgICAgICAgIChzeW1ib2w/IHgpIChpZiAobmFtZXNwYWNlIHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAoc3RyIChuYW1lc3BhY2UgeCkgXCIvXCIgKG5hbWUgeCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAobmFtZSB4KSlcbiAgICAgICAgICAoc3RyaW5nPyB4KSAocXVvdGUtc3RyaW5nIHgpXG4gICAgICAgICAgKGRhdGU/IHgpIChzdHIgXCIjaW5zdCBcXFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAoLmdldFVUQ0Z1bGxZZWFyIHgpIFwiLVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbGl6ZSAoaW5jICguZ2V0VVRDTW9udGggeCkpIDIpIFwiLVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbGl6ZSAoLmdldFVUQ0RhdGUgeCkgMikgXCJUXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsaXplICguZ2V0VVRDSG91cnMgeCkgMikgXCI6XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsaXplICguZ2V0VVRDTWludXRlcyB4KSAyKSBcIjpcIlxuICAgICAgICAgICAgICAgICAgICAgICAgIChub3JtYWxpemUgKC5nZXRVVENTZWNvbmRzIHgpIDIpIFwiLlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbGl6ZSAoLmdldFVUQ01pbGxpc2Vjb25kcyB4KSAzKSBcIi1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgIFwiMDA6MDBcXFwiXCIpXG4gICAgICAgICAgKHZlY3Rvcj8geCkgKHN0ciBcIltcIiAoam9pbiAoc3RyIFwiXFxuIFwiIChqb2luIChyZXBlYXQgKGluYyBvZmZzZXQpIFwiIFwiKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKG1hcCAjKHByLXN0ciAlIChpbmMgb2Zmc2V0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2ZWMgeCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJdXCIpXG4gICAgICAgICAgKGRpY3Rpb25hcnk/IHgpIChzdHIgXCJ7XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoam9pbiAoc3RyIFwiLFxcblwiIChqb2luIChyZXBlYXQgKGluYyBvZmZzZXQpIFwiIFwiKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKG1hcCAoZm4gW3BhaXJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsZXQgW2luZGVudCAoam9pbiAocmVwZWF0IG9mZnNldCBcIiBcIikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSAocHItc3RyIChmaXJzdCBwYWlyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW5jIG9mZnNldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIChwci1zdHIgKHNlY29uZCBwYWlyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgrIDIgb2Zmc2V0IChjb3VudCBrZXkpKSldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHN0ciBrZXkgXCIgXCIgdmFsdWUpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKVxuICAgICAgICAgIChzZXF1ZW50aWFsPyB4KSAoc3RyIFwiKFwiIChqb2luIFwiIFwiIChtYXAgIyhwci1zdHIgJSAoaW5jIG9mZnNldCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2ZWMgeCkpKSBcIilcIilcbiAgICAgICAgICAocmUtcGF0dGVybj8geCkgKHN0ciBcIiNcXFwiXCIgKGpvaW4gXCJcXFxcL1wiIChzcGxpdCAoLi1zb3VyY2UgeCkgXCIvXCIpKSBcIlxcXCJcIilcbiAgICAgICAgICA6ZWxzZSAoc3RyIHgpKSkpXG4iXX0=

},{"./runtime":33,"./sequence":34,"./string":35}],10:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.backend.escodegen.compiler',
            doc: void 0
        };
    var wisp_reader = require('./../../reader');
    var readString = wisp_reader.readFromString;
    var read_ = wisp_reader.read_;
    var wisp_ast = require('./../../ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var symbol = wisp_ast.symbol;
    var isKeyword = wisp_ast.isKeyword;
    var keyword = wisp_ast.keyword;
    var namespace = wisp_ast.namespace;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var isQuote = wisp_ast.isQuote;
    var isSyntaxQuote = wisp_ast.isSyntaxQuote;
    var name = wisp_ast.name;
    var gensym = wisp_ast.gensym;
    var prStr = wisp_ast.prStr;
    var wisp_sequence = require('./../../sequence');
    var isEmpty = wisp_sequence.isEmpty;
    var count = wisp_sequence.count;
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var cons = wisp_sequence.cons;
    var conj = wisp_sequence.conj;
    var butlast = wisp_sequence.butlast;
    var reverse = wisp_sequence.reverse;
    var reduce = wisp_sequence.reduce;
    var vec = wisp_sequence.vec;
    var last = wisp_sequence.last;
    var map = wisp_sequence.map;
    var filter = wisp_sequence.filter;
    var take = wisp_sequence.take;
    var concat = wisp_sequence.concat;
    var partition = wisp_sequence.partition;
    var repeat = wisp_sequence.repeat;
    var interleave = wisp_sequence.interleave;
    var wisp_runtime = require('./../../runtime');
    var isOdd = wisp_runtime.isOdd;
    var isDictionary = wisp_runtime.isDictionary;
    var dictionary = wisp_runtime.dictionary;
    var merge = wisp_runtime.merge;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isContainsVector = wisp_runtime.isContainsVector;
    var mapDictionary = wisp_runtime.mapDictionary;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isVector = wisp_runtime.isVector;
    var isBoolean = wisp_runtime.isBoolean;
    var subs = wisp_runtime.subs;
    var reFind = wisp_runtime.reFind;
    var isTrue = wisp_runtime.isTrue;
    var isFalse = wisp_runtime.isFalse;
    var isNil = wisp_runtime.isNil;
    var isRePattern = wisp_runtime.isRePattern;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var str = wisp_runtime.str;
    var char = wisp_runtime.char;
    var int = wisp_runtime.int;
    var isEqual = wisp_runtime.isEqual;
    var isStrictEqual = wisp_runtime.isStrictEqual;
    var wisp_string = require('./../../string');
    var split = wisp_string.split;
    var join = wisp_string.join;
    var upperCase = wisp_string.upperCase;
    var replace = wisp_string.replace;
    var wisp_expander = require('./../../expander');
    var installMacro = wisp_expander.installMacro;
    var wisp_analyzer = require('./../../analyzer');
    var emptyEnv = wisp_analyzer.emptyEnv;
    var analyze = wisp_analyzer.analyze;
    var analyze_ = wisp_analyzer.analyze_;
    var wisp_backend_escodegen_writer = require('./writer');
    var write = wisp_backend_escodegen_writer.write;
    var compile = wisp_backend_escodegen_writer.compile;
    var write_ = wisp_backend_escodegen_writer.write_;
    var escodegen = require('escodegen');
    var generate_ = escodegen.generate;
    var base64Encode = require('base64-encode');
    var btoa = base64Encode;
    var fs = require('fs');
    var readFileSync = fs.readFileSync;
    var writeFileSync = fs.writeFileSync;
    var path = require('path');
    var basename = path.basename;
    var dirname = path.dirname;
    var joinPath = path.join;
}
var generate = exports.generate = function generate(options) {
        var nodes = Array.prototype.slice.call(arguments, 1);
        return function () {
            var astø1 = write_.apply(void 0, nodes);
            var outputø1 = generate_(astø1, {
                    'file': (options || 0)['output-uri'],
                    'sourceContent': (options || 0)['source'],
                    'sourceMap': (options || 0)['source-uri'],
                    'sourceMapRoot': (options || 0)['source-root'],
                    'sourceMapWithCode': true
                });
            (outputø1 || 0)['map'].setSourceContent((options || 0)['source-uri'], (options || 0)['source']);
            return {
                'code': (options || 0)['no-map'] ? (outputø1 || 0)['code'] : '' + (outputø1 || 0)['code'] + '\n//# sourceMappingURL=' + 'data:application/json;base64,' + btoa('' + (outputø1 || 0)['map']) + '\n',
                'source-map': (outputø1 || 0)['map'],
                'js-ast': astø1
            };
        }.call(this);
    };
var expandDefmacro = exports.expandDefmacro = function expandDefmacro(andForm, id) {
        var body = Array.prototype.slice.call(arguments, 2);
        return function () {
            var fnø1 = withMeta(list.apply(void 0, [symbol(void 0, 'defn')].concat([id], vec(body))), meta(andForm));
            var formø1 = list.apply(void 0, [symbol(void 0, 'do')].concat([fnø1], [id]));
            var astø1 = analyze(formø1);
            var codeø1 = compile(astø1);
            var macroø1 = eval(codeø1);
            installMacro(id, macroø1);
            return void 0;
        }.call(this);
    };
installMacro(symbol(void 0, 'defmacro'), withMeta(expandDefmacro, { 'implicit': ['&form'] }));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvYmFja2VuZC9lc2NvZGVnZW4vZ2VuZXJhdG9yLndpc3AiXSwibmFtZXMiOlsicmVhZFN0cmluZyIsInJlYWRGcm9tU3RyaW5nIiwicmVhZF8iLCJtZXRhIiwid2l0aE1ldGEiLCJpc1N5bWJvbCIsInN5bWJvbCIsImlzS2V5d29yZCIsImtleXdvcmQiLCJuYW1lc3BhY2UiLCJpc1VucXVvdGUiLCJpc1VucXVvdGVTcGxpY2luZyIsImlzUXVvdGUiLCJpc1N5bnRheFF1b3RlIiwibmFtZSIsImdlbnN5bSIsInByU3RyIiwiaXNFbXB0eSIsImNvdW50IiwiaXNMaXN0IiwibGlzdCIsImZpcnN0Iiwic2Vjb25kIiwidGhpcmQiLCJyZXN0IiwiY29ucyIsImNvbmoiLCJidXRsYXN0IiwicmV2ZXJzZSIsInJlZHVjZSIsInZlYyIsImxhc3QiLCJtYXAiLCJmaWx0ZXIiLCJ0YWtlIiwiY29uY2F0IiwicGFydGl0aW9uIiwicmVwZWF0IiwiaW50ZXJsZWF2ZSIsImlzT2RkIiwiaXNEaWN0aW9uYXJ5IiwiZGljdGlvbmFyeSIsIm1lcmdlIiwia2V5cyIsInZhbHMiLCJpc0NvbnRhaW5zVmVjdG9yIiwibWFwRGljdGlvbmFyeSIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc1ZlY3RvciIsImlzQm9vbGVhbiIsInN1YnMiLCJyZUZpbmQiLCJpc1RydWUiLCJpc0ZhbHNlIiwiaXNOaWwiLCJpc1JlUGF0dGVybiIsImluYyIsImRlYyIsInN0ciIsImNoYXIiLCJpbnQiLCJpc0VxdWFsIiwiaXNTdHJpY3RFcXVhbCIsInNwbGl0Iiwiam9pbiIsInVwcGVyQ2FzZSIsInJlcGxhY2UiLCJpbnN0YWxsTWFjcm8iLCJlbXB0eUVudiIsImFuYWx5emUiLCJhbmFseXplXyIsIndyaXRlIiwiY29tcGlsZSIsIndyaXRlXyIsImdlbmVyYXRlXyIsImdlbmVyYXRlIiwicmVhZEZpbGVTeW5jIiwid3JpdGVGaWxlU3luYyIsImJhc2VuYW1lIiwiZGlybmFtZSIsImpvaW5QYXRoIiwib3B0aW9ucyIsIm5vZGVzIiwiYXN0w7gxIiwib3V0cHV0w7gxIiwic2V0U291cmNlQ29udGVudCIsImJ0b2EiLCJleHBhbmREZWZtYWNybyIsImFuZEZvcm0iLCJpZCIsImJvZHkiLCJmbsO4MSIsImZvcm3DuDEiLCJjb2Rlw7gxIiwibWFjcm/DuDEiLCJldmFsIl0sIm1hcHBpbmdzIjoiQUFBQTtJOzs7VUFBQTtJLDRDQUFBO0ksSUFFbURBLFVBQUEsRyxZQURsQkMsYyxDQURqQztJLElBQ2tEQyxLQUFBLEcsWUFBQUEsSyxDQURsRDtJLHNDQUFBO0ksSUFHOEJDLElBQUEsRyxTQUFBQSxJLENBSDlCO0ksSUFHbUNDLFFBQUEsRyxTQUFBQSxRLENBSG5DO0ksSUFHNkNDLFFBQUEsRyxTQUFBQSxRLENBSDdDO0ksSUFHcURDLE1BQUEsRyxTQUFBQSxNLENBSHJEO0ksSUFHNERDLFNBQUEsRyxTQUFBQSxTLENBSDVEO0ksSUFHcUVDLE9BQUEsRyxTQUFBQSxPLENBSHJFO0ksSUFJOEJDLFNBQUEsRyxTQUFBQSxTLENBSjlCO0ksSUFJd0NDLFNBQUEsRyxTQUFBQSxTLENBSnhDO0ksSUFJaURDLGlCQUFBLEcsU0FBQUEsaUIsQ0FKakQ7SSxJQUltRUMsT0FBQSxHLFNBQUFBLE8sQ0FKbkU7SSxJQUs4QkMsYUFBQSxHLFNBQUFBLGEsQ0FMOUI7SSxJQUs0Q0MsSUFBQSxHLFNBQUFBLEksQ0FMNUM7SSxJQUtpREMsTUFBQSxHLFNBQUFBLE0sQ0FMakQ7SSxJQUt3REMsS0FBQSxHLFNBQUFBLEssQ0FMeEQ7SSxnREFBQTtJLElBTW1DQyxPQUFBLEcsY0FBQUEsTyxDQU5uQztJLElBTTBDQyxLQUFBLEcsY0FBQUEsSyxDQU4xQztJLElBTWdEQyxNQUFBLEcsY0FBQUEsTSxDQU5oRDtJLElBTXNEQyxJQUFBLEcsY0FBQUEsSSxDQU50RDtJLElBTTJEQyxLQUFBLEcsY0FBQUEsSyxDQU4zRDtJLElBTWlFQyxNQUFBLEcsY0FBQUEsTSxDQU5qRTtJLElBTXdFQyxLQUFBLEcsY0FBQUEsSyxDQU54RTtJLElB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VUFBSUQsSSxJQUFJRixFLEVBQVYsQ0FBTCxDO1lBQ0EsSUFBQU4sSyxHQUFLZCxPQUFELENBQVN1QixNQUFULENBQUosQztZQUNBLElBQUFDLE0sR0FBTXJCLE9BQUQsQ0FBU1csS0FBVCxDQUFMLEM7WUFDQSxJQUFBVyxPLEdBQU9DLElBQUQsQ0FBTUYsTUFBTixDQUFOLEM7WUFDSDFCLFlBQUQsQ0FBZ0JzQixFQUFoQixFQUFtQkssT0FBbkIsQzs7Y0FMRixDLElBQUEsRTtLQUxGLEM7QUFZQzNCLFlBQUQsQyxNQUFpQixDLE1BQUEsRSxVQUFBLENBQWpCLEVBQTJCaEUsUUFBRCxDQUFXb0YsY0FBWCxFQUEyQixFLFlBQVcsQyxPQUFBLENBQVgsRUFBM0IsQ0FBMUIsQyIsInNvdXJjZXNDb250ZW50IjpbIihucyB3aXNwLmJhY2tlbmQuZXNjb2RlZ2VuLmNvbXBpbGVyXG4gICg6cmVxdWlyZSBbd2lzcC5yZWFkZXIgOnJlZmVyIFtyZWFkLWZyb20tc3RyaW5nIHJlYWQqXVxuICAgICAgICAgICAgICAgICAgICAgICAgIDpyZW5hbWUge3JlYWQtZnJvbS1zdHJpbmcgcmVhZC1zdHJpbmd9XVxuICAgICAgICAgICAgW3dpc3AuYXN0IDpyZWZlciBbbWV0YSB3aXRoLW1ldGEgc3ltYm9sPyBzeW1ib2wga2V5d29yZD8ga2V5d29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlIHVucXVvdGU/IHVucXVvdGUtc3BsaWNpbmc/IHF1b3RlP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ludGF4LXF1b3RlPyBuYW1lIGdlbnN5bSBwci1zdHJdXVxuICAgICAgICAgICAgW3dpc3Auc2VxdWVuY2UgOnJlZmVyIFtlbXB0eT8gY291bnQgbGlzdD8gbGlzdCBmaXJzdCBzZWNvbmQgdGhpcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdCBjb25zIGNvbmogYnV0bGFzdCByZXZlcnNlIHJlZHVjZSB2ZWNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCBtYXAgZmlsdGVyIHRha2UgY29uY2F0IHBhcnRpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBlYXQgaW50ZXJsZWF2ZV1dXG4gICAgICAgICAgICBbd2lzcC5ydW50aW1lIDpyZWZlciBbb2RkPyBkaWN0aW9uYXJ5PyBkaWN0aW9uYXJ5IG1lcmdlIGtleXMgdmFsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5zLXZlY3Rvcj8gbWFwLWRpY3Rpb25hcnkgc3RyaW5nP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlcj8gdmVjdG9yPyBib29sZWFuPyBzdWJzIHJlLWZpbmQgdHJ1ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZT8gbmlsPyByZS1wYXR0ZXJuPyBpbmMgZGVjIHN0ciBjaGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ID0gPT1dXVxuICAgICAgICAgICAgW3dpc3Auc3RyaW5nIDpyZWZlciBbc3BsaXQgam9pbiB1cHBlci1jYXNlIHJlcGxhY2VdXVxuICAgICAgICAgICAgW3dpc3AuZXhwYW5kZXIgOnJlZmVyIFtpbnN0YWxsLW1hY3JvIV1dXG4gICAgICAgICAgICBbd2lzcC5hbmFseXplciA6cmVmZXIgW2VtcHR5LWVudiBhbmFseXplIGFuYWx5emUqXV1cbiAgICAgICAgICAgIFt3aXNwLmJhY2tlbmQuZXNjb2RlZ2VuLndyaXRlciA6cmVmZXIgW3dyaXRlIGNvbXBpbGUgd3JpdGUqXV1cblxuICAgICAgICAgICAgW2VzY29kZWdlbiA6cmVmZXIgW2dlbmVyYXRlXSA6cmVuYW1lIHtnZW5lcmF0ZSBnZW5lcmF0ZSp9XVxuICAgICAgICAgICAgW2Jhc2U2NC1lbmNvZGUgOmFzIGJ0b2FdXG4gICAgICAgICAgICBbZnMgOnJlZmVyIFtyZWFkLWZpbGUtc3luYyB3cml0ZS1maWxlLXN5bmNdXVxuICAgICAgICAgICAgW3BhdGggOnJlZmVyIFtiYXNlbmFtZSBkaXJuYW1lIGpvaW5dXG4gICAgICAgICAgICAgICAgICA6cmVuYW1lIHtqb2luIGpvaW4tcGF0aH1dKSlcblxuKGRlZm4gZ2VuZXJhdGVcbiAgW29wdGlvbnMgJiBub2Rlc11cbiAgKGxldCBbYXN0IChhcHBseSB3cml0ZSogbm9kZXMpXG5cbiAgICAgICAgb3V0cHV0IChnZW5lcmF0ZSogYXN0IHs6ZmlsZSAoOm91dHB1dC11cmkgb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6c291cmNlQ29udGVudCAoOnNvdXJjZSBvcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpzb3VyY2VNYXAgKDpzb3VyY2UtdXJpIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnNvdXJjZU1hcFJvb3QgKDpzb3VyY2Utcm9vdCBvcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpzb3VyY2VNYXBXaXRoQ29kZSB0cnVlfSldXG5cbiAgICA7OyBXb3JrYXJvdW5kIHRoZSBmYWN0IHRoYXQgZXNjb2RlZ2VuIGRvZXMgbm90IHlldCBpbmNsdWRlcyBzb3VyY2VcbiAgICAoLnNldFNvdXJjZUNvbnRlbnQgKDptYXAgb3V0cHV0KVxuICAgICAgICAgICAgICAgICAgICAgICAoOnNvdXJjZS11cmkgb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgKDpzb3VyY2Ugb3B0aW9ucykpXG5cbiAgICB7OmNvZGUgKGlmICg6bm8tbWFwIG9wdGlvbnMpXG4gICAgICAgICAgICAgKDpjb2RlIG91dHB1dClcbiAgICAgICAgICAgICAoc3RyICg6Y29kZSBvdXRwdXQpXG4gICAgICAgICAgICAgICAgICBcIlxcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVwiXG4gICAgICAgICAgICAgICAgICBcImRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCJcbiAgICAgICAgICAgICAgICAgIChidG9hIChzdHIgKDptYXAgb3V0cHV0KSkpXG4gICAgICAgICAgICAgICAgICBcIlxcblwiKSlcbiAgICAgOnNvdXJjZS1tYXAgKDptYXAgb3V0cHV0KVxuICAgICA6anMtYXN0IGFzdH0pKVxuXG5cbihkZWZuIGV4cGFuZC1kZWZtYWNyb1xuICBcIkxpa2UgZGVmbiwgYnV0IHRoZSByZXN1bHRpbmcgZnVuY3Rpb24gbmFtZSBpcyBkZWNsYXJlZCBhcyBhXG4gIG1hY3JvIGFuZCB3aWxsIGJlIHVzZWQgYXMgYSBtYWNybyBieSB0aGUgY29tcGlsZXIgd2hlbiBpdCBpc1xuICBjYWxsZWQuXCJcbiAgWyZmb3JtIGlkICYgYm9keV1cbiAgKGxldCBbZm4gKHdpdGgtbWV0YSBgKGRlZm4gfmlkIH5AYm9keSkgKG1ldGEgJmZvcm0pKVxuICAgICAgICBmb3JtIGAoZG8gfmZuIH5pZClcbiAgICAgICAgYXN0IChhbmFseXplIGZvcm0pXG4gICAgICAgIGNvZGUgKGNvbXBpbGUgYXN0KVxuICAgICAgICBtYWNybyAoZXZhbCBjb2RlKV1cbiAgICAoaW5zdGFsbC1tYWNybyEgaWQgbWFjcm8pXG4gICAgbmlsKSlcbihpbnN0YWxsLW1hY3JvISAnZGVmbWFjcm8gKHdpdGgtbWV0YSBleHBhbmQtZGVmbWFjcm8gezppbXBsaWNpdCBbOiZmb3JtXX0pKVxuIl19

},{"./../../analyzer":8,"./../../ast":9,"./../../expander":14,"./../../reader":32,"./../../runtime":33,"./../../sequence":34,"./../../string":35,"./writer":11,"base64-encode":15,"escodegen":16,"fs":2,"path":5}],11:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.backend.escodegen.writer',
            doc: void 0
        };
    var wisp_reader = require('./../../reader');
    var readFromString = wisp_reader.readFromString;
    var wisp_ast = require('./../../ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var symbol = wisp_ast.symbol;
    var isKeyword = wisp_ast.isKeyword;
    var keyword = wisp_ast.keyword;
    var namespace = wisp_ast.namespace;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var isQuote = wisp_ast.isQuote;
    var isSyntaxQuote = wisp_ast.isSyntaxQuote;
    var name = wisp_ast.name;
    var gensym = wisp_ast.gensym;
    var prStr = wisp_ast.prStr;
    var wisp_sequence = require('./../../sequence');
    var isEmpty = wisp_sequence.isEmpty;
    var count = wisp_sequence.count;
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var cons = wisp_sequence.cons;
    var conj = wisp_sequence.conj;
    var butlast = wisp_sequence.butlast;
    var reverse = wisp_sequence.reverse;
    var reduce = wisp_sequence.reduce;
    var vec = wisp_sequence.vec;
    var last = wisp_sequence.last;
    var map = wisp_sequence.map;
    var filter = wisp_sequence.filter;
    var take = wisp_sequence.take;
    var concat = wisp_sequence.concat;
    var partition = wisp_sequence.partition;
    var repeat = wisp_sequence.repeat;
    var interleave = wisp_sequence.interleave;
    var wisp_runtime = require('./../../runtime');
    var isOdd = wisp_runtime.isOdd;
    var isDictionary = wisp_runtime.isDictionary;
    var dictionary = wisp_runtime.dictionary;
    var merge = wisp_runtime.merge;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isContainsVector = wisp_runtime.isContainsVector;
    var mapDictionary = wisp_runtime.mapDictionary;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isVector = wisp_runtime.isVector;
    var isBoolean = wisp_runtime.isBoolean;
    var subs = wisp_runtime.subs;
    var reFind = wisp_runtime.reFind;
    var isTrue = wisp_runtime.isTrue;
    var isFalse = wisp_runtime.isFalse;
    var isNil = wisp_runtime.isNil;
    var isRePattern = wisp_runtime.isRePattern;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var str = wisp_runtime.str;
    var char = wisp_runtime.char;
    var int = wisp_runtime.int;
    var isEqual = wisp_runtime.isEqual;
    var isStrictEqual = wisp_runtime.isStrictEqual;
    var wisp_string = require('./../../string');
    var split = wisp_string.split;
    var join = wisp_string.join;
    var upperCase = wisp_string.upperCase;
    var replace = wisp_string.replace;
    var wisp_expander = require('./../../expander');
    var installMacro = wisp_expander.installMacro;
    var escodegen = require('escodegen');
    var generate = escodegen.generate;
}
var __uniqueChar__ = exports.__uniqueChar__ = '\xF8';
var toCamelJoin = exports.toCamelJoin = function toCamelJoin(prefix, key) {
        return '' + prefix + (!isEmpty(prefix) && !isEmpty(key) ? '' + upperCase((key || 0)[0]) + subs(key, 1) : key);
    };
var translateIdentifierWord = exports.translateIdentifierWord = function translateIdentifierWord(form) {
        var id = name(form);
        id = id === '*' ? 'multiply' : id === '/' ? 'divide' : id === '+' ? 'sum' : id === '-' ? 'subtract' : id === '=' ? 'equal?' : id === '==' ? 'strict-equal?' : id === '<=' ? 'not-greater-than' : id === '>=' ? 'not-less-than' : id === '>' ? 'greater-than' : id === '<' ? 'less-than' : 'else' ? id : void 0;
        id = join('_', split(id, '*'));
        id = join('-to-', split(id, '->'));
        id = join(split(id, '!'));
        id = join('$', split(id, '%'));
        id = join('-equal-', split(id, '='));
        id = join('-plus-', split(id, '+'));
        id = join('-and-', split(id, '&'));
        id = last(id) === '?' ? '' + 'is-' + subs(id, 0, dec(count(id))) : id;
        id = reduce(toCamelJoin, '', split(id, '-'));
        return id;
    };
var translateIdentifier = exports.translateIdentifier = function translateIdentifier(form) {
        return join('.', map(translateIdentifierWord, split(name(form), '.')));
    };
var errorArgCount = exports.errorArgCount = function errorArgCount(callee, n) {
        return (function () {
            throw SyntaxError('' + 'Wrong number of arguments (' + n + ') passed to: ' + callee);
        })();
    };
var inheritLocation = exports.inheritLocation = function inheritLocation(body) {
        return function () {
            var startø1 = ((first(body) || 0)['loc'] || 0)['start'];
            var endø1 = ((last(body) || 0)['loc'] || 0)['end'];
            return !(isNil(startø1) || isNil(endø1)) ? {
                'start': startø1,
                'end': endø1
            } : void 0;
        }.call(this);
    };
var writeLocation = exports.writeLocation = function writeLocation(form, original) {
        return function () {
            var dataø1 = meta(form);
            var inheritedø1 = meta(original);
            var startø1 = (form || 0)['start'] || (dataø1 || 0)['start'] || (inheritedø1 || 0)['start'];
            var endø1 = (form || 0)['end'] || (dataø1 || 0)['end'] || (inheritedø1 || 0)['end'];
            return !isNil(startø1) ? {
                'loc': {
                    'start': {
                        'line': inc((startø1 || 0)['line']),
                        'column': (startø1 || 0)['column']
                    },
                    'end': {
                        'line': inc((endø1 || 0)['line']),
                        'column': (endø1 || 0)['column']
                    }
                }
            } : {};
        }.call(this);
    };
var __writers__ = exports.__writers__ = {};
var installWriter = exports.installWriter = function installWriter(op, writer) {
        return (__writers__ || 0)[op] = writer;
    };
var writeOp = exports.writeOp = function writeOp(op, form) {
        return function () {
            var writerø1 = (__writers__ || 0)[op];
            !writerø1 ? (function () {
                throw Error('' + 'Assert failed: ' + ('' + 'Unsupported operation: ' + op) + 'writer');
            })() : void 0;
            return conj(writeLocation((form || 0)['form'], (form || 0)['original-form']), writerø1(form));
        }.call(this);
    };
var __specials__ = exports.__specials__ = {};
var installSpecial = exports.installSpecial = function installSpecial(op, writer) {
        return (__specials__ || 0)[name(op)] = writer;
    };
var writeSpecial = exports.writeSpecial = function writeSpecial(writer, form) {
        return conj(writeLocation((form || 0)['form'], (form || 0)['original-form']), writer.apply(void 0, (form || 0)['params']));
    };
var writeNil = exports.writeNil = function writeNil(form) {
        console.warn(form);
        return {
            'type': 'UnaryExpression',
            'operator': 'void',
            'argument': conj(writeLocation((form || 0)['form'], (form || 0)['original-form']), {
                'type': 'Literal',
                'value': 0
            }),
            'prefix': true
        };
    };
installWriter('nil', writeNil);
var writeLiteral = exports.writeLiteral = function writeLiteral(form) {
        return {
            'type': 'Literal',
            'value': form
        };
    };
var writeList = exports.writeList = function writeList(form) {
        return {
            'type': 'CallExpression',
            'callee': write({
                'op': 'var',
                'form': symbol(void 0, 'list')
            }),
            'arguments': map(write, (form || 0)['items'])
        };
    };
installWriter('list', writeList);
var writeSymbol = exports.writeSymbol = function writeSymbol(form) {
        return {
            'type': 'CallExpression',
            'callee': write({
                'op': 'var',
                'form': symbol(void 0, 'symbol')
            }),
            'arguments': [
                writeConstant((form || 0)['namespace']),
                writeConstant((form || 0)['name'])
            ]
        };
    };
installWriter('symbol', writeSymbol);
var writeConstant = exports.writeConstant = function writeConstant(form) {
        return isNil(form) ? writeNil(form) : isKeyword(form) ? writeLiteral(name(form)) : isNumber(form) ? writeNumber(form.valueOf()) : isString(form) ? writeString(form) : 'else' ? writeLiteral(form) : void 0;
    };
installWriter('constant', function ($1) {
    return writeConstant(($1 || 0)['form']);
});
var writeString = exports.writeString = function writeString(form) {
        return {
            'type': 'Literal',
            'value': '' + form
        };
    };
var writeNumber = exports.writeNumber = function writeNumber(form) {
        return form < 0 ? {
            'type': 'UnaryExpression',
            'operator': '-',
            'prefix': true,
            'argument': writeNumber(form * -1)
        } : writeLiteral(form);
    };
var writeKeyword = exports.writeKeyword = function writeKeyword(form) {
        return {
            'type': 'Literal',
            'value': (form || 0)['form']
        };
    };
installWriter('keyword', writeKeyword);
var toIdentifier = exports.toIdentifier = function toIdentifier(form) {
        return {
            'type': 'Identifier',
            'name': translateIdentifier(form)
        };
    };
var writeBindingVar = exports.writeBindingVar = function writeBindingVar(form) {
        return function () {
            var idø1 = name((form || 0)['id']);
            return conj(toIdentifier((form || 0)['shadow'] ? '' + translateIdentifier(idø1) + __uniqueChar__ + (form || 0)['depth'] : idø1), writeLocation((form || 0)['id']));
        }.call(this);
    };
var writeVar = exports.writeVar = function writeVar(node) {
        return isEqual('binding', ((node || 0)['binding'] || 0)['type']) ? conj(writeBindingVar((node || 0)['binding']), writeLocation((node || 0)['form'])) : conj(writeLocation((node || 0)['form']), toIdentifier(name((node || 0)['form'])));
    };
installWriter('var', writeVar);
installWriter('param', writeVar);
var writeInvoke = exports.writeInvoke = function writeInvoke(form) {
        return {
            'type': 'CallExpression',
            'callee': write((form || 0)['callee']),
            'arguments': map(write, (form || 0)['params'])
        };
    };
installWriter('invoke', writeInvoke);
var writeVector = exports.writeVector = function writeVector(form) {
        return {
            'type': 'ArrayExpression',
            'elements': map(write, (form || 0)['items'])
        };
    };
installWriter('vector', writeVector);
var writeDictionary = exports.writeDictionary = function writeDictionary(form) {
        return function () {
            var propertiesø1 = partition(2, interleave((form || 0)['keys'], (form || 0)['values']));
            return {
                'type': 'ObjectExpression',
                'properties': map(function (pair) {
                    return function () {
                        var keyø1 = first(pair);
                        var valueø1 = second(pair);
                        return {
                            'kind': 'init',
                            'type': 'Property',
                            'key': isEqual('symbol', (keyø1 || 0)['op']) ? writeConstant('' + (keyø1 || 0)['form']) : write(keyø1),
                            'value': write(valueø1)
                        };
                    }.call(this);
                }, propertiesø1)
            };
        }.call(this);
    };
installWriter('dictionary', writeDictionary);
var writeExport = exports.writeExport = function writeExport(form) {
        return write({
            'op': 'set!',
            'target': {
                'op': 'member-expression',
                'computed': false,
                'target': {
                    'op': 'var',
                    'form': withMeta(symbol(void 0, 'exports'), meta(((form || 0)['id'] || 0)['form']))
                },
                'property': (form || 0)['id'],
                'form': ((form || 0)['id'] || 0)['form']
            },
            'value': (form || 0)['init'],
            'form': ((form || 0)['id'] || 0)['form']
        });
    };
var writeDef = exports.writeDef = function writeDef(form) {
        return conj({
            'type': 'VariableDeclaration',
            'kind': 'var',
            'declarations': [conj({
                    'type': 'VariableDeclarator',
                    'id': write((form || 0)['id']),
                    'init': conj((form || 0)['export'] ? writeExport(form) : write((form || 0)['init'] || withMeta(list(symbol(void 0, 'void'), 0), meta((form || 0)['id']))))
                }, writeLocation(((form || 0)['id'] || 0)['form']))]
        }, writeLocation((form || 0)['form'], (form || 0)['original-form']));
    };
installWriter('def', writeDef);
var writeBinding = exports.writeBinding = function writeBinding(form) {
        return function () {
            var idø1 = writeBindingVar(form);
            var initø1 = write((form || 0)['init']);
            return {
                'type': 'VariableDeclaration',
                'kind': 'var',
                'loc': inheritLocation([
                    idø1,
                    initø1
                ]),
                'declarations': [{
                        'type': 'VariableDeclarator',
                        'id': idø1,
                        'init': initø1
                    }]
            };
        }.call(this);
    };
installWriter('binding', writeBinding);
var writeThrow = exports.writeThrow = function writeThrow(form) {
        return toExpression(conj({
            'type': 'ThrowStatement',
            'argument': write((form || 0)['throw'])
        }, writeLocation((form || 0)['form'], (form || 0)['original-form'])));
    };
installWriter('throw', writeThrow);
var writeNew = exports.writeNew = function writeNew(form) {
        return {
            'type': 'NewExpression',
            'callee': write((form || 0)['constructor']),
            'arguments': map(write, (form || 0)['params'])
        };
    };
installWriter('new', writeNew);
var writeSet = exports.writeSet = function writeSet(form) {
        return {
            'type': 'AssignmentExpression',
            'operator': '=',
            'left': write((form || 0)['target']),
            'right': write((form || 0)['value'])
        };
    };
installWriter('set!', writeSet);
var writeAget = exports.writeAget = function writeAget(form) {
        return {
            'type': 'MemberExpression',
            'computed': (form || 0)['computed'],
            'object': write((form || 0)['target']),
            'property': write((form || 0)['property'])
        };
    };
installWriter('member-expression', writeAget);
var __statements__ = exports.__statements__ = {
        'EmptyStatement': true,
        'BlockStatement': true,
        'ExpressionStatement': true,
        'IfStatement': true,
        'LabeledStatement': true,
        'BreakStatement': true,
        'ContinueStatement': true,
        'SwitchStatement': true,
        'ReturnStatement': true,
        'ThrowStatement': true,
        'TryStatement': true,
        'WhileStatement': true,
        'DoWhileStatement': true,
        'ForStatement': true,
        'ForInStatement': true,
        'ForOfStatement': true,
        'LetStatement': true,
        'VariableDeclaration': true,
        'FunctionDeclaration': true
    };
var writeStatement = exports.writeStatement = function writeStatement(form) {
        return toStatement(write(form));
    };
var toStatement = exports.toStatement = function toStatement(node) {
        return (__statements__ || 0)[(node || 0)['type']] ? node : {
            'type': 'ExpressionStatement',
            'expression': node,
            'loc': (node || 0)['loc']
        };
    };
var toReturn = exports.toReturn = function toReturn(form) {
        return conj({
            'type': 'ReturnStatement',
            'argument': write(form)
        }, writeLocation((form || 0)['form'], (form || 0)['original-form']));
    };
var writeBody = exports.writeBody = function writeBody(form) {
        return function () {
            var statementsø1 = map(writeStatement, (form || 0)['statements'] || []);
            var resultø1 = (form || 0)['result'] ? toReturn((form || 0)['result']) : void 0;
            return resultø1 ? conj(statementsø1, resultø1) : statementsø1;
        }.call(this);
    };
var toBlock = exports.toBlock = function toBlock(body) {
        return isVector(body) ? {
            'type': 'BlockStatement',
            'body': body,
            'loc': inheritLocation(body)
        } : {
            'type': 'BlockStatement',
            'body': [body],
            'loc': (body || 0)['loc']
        };
    };
var toExpression = exports.toExpression = function toExpression() {
        var body = Array.prototype.slice.call(arguments, 0);
        return {
            'type': 'CallExpression',
            'arguments': [],
            'loc': inheritLocation(body),
            'callee': toSequence([{
                    'type': 'FunctionExpression',
                    'id': void 0,
                    'params': [],
                    'defaults': [],
                    'expression': false,
                    'generator': false,
                    'rest': void 0,
                    'body': toBlock(body)
                }])
        };
    };
var writeDo = exports.writeDo = function writeDo(form) {
        return toExpression.apply(void 0, writeBody(form));
    };
installWriter('do', writeDo);
var writeIf = exports.writeIf = function writeIf(form) {
        return {
            'type': 'ConditionalExpression',
            'test': write((form || 0)['test']),
            'consequent': write((form || 0)['consequent']),
            'alternate': write((form || 0)['alternate'])
        };
    };
installWriter('if', writeIf);
var writeTry = exports.writeTry = function writeTry(form) {
        return function () {
            var handlerø1 = (form || 0)['handler'];
            var finalizerø1 = (form || 0)['finalizer'];
            return toExpression(conj({
                'type': 'TryStatement',
                'guardedHandlers': [],
                'block': toBlock(writeBody((form || 0)['body'])),
                'handlers': handlerø1 ? [{
                        'type': 'CatchClause',
                        'param': write((handlerø1 || 0)['name']),
                        'body': toBlock(writeBody(handlerø1))
                    }] : [],
                'finalizer': finalizerø1 ? toBlock(writeBody(finalizerø1)) : !handlerø1 ? toBlock([]) : 'else' ? void 0 : void 0
            }, writeLocation((form || 0)['form'], (form || 0)['original-form'])));
        }.call(this);
    };
installWriter('try', writeTry);
var writeBindingValue = function writeBindingValue(form) {
    return write((form || 0)['init']);
};
var writeBindingParam = function writeBindingParam(form) {
    return writeVar({ 'form': (form || 0)['name'] });
};
var writeBinding = exports.writeBinding = function writeBinding(form) {
        return write({
            'op': 'def',
            'var': form,
            'init': (form || 0)['init'],
            'form': form
        });
    };
var writeLet = exports.writeLet = function writeLet(form) {
        return function () {
            var bodyø1 = conj(form, { 'statements': vec(concat((form || 0)['bindings'], (form || 0)['statements'])) });
            return toIife(toBlock(writeBody(bodyø1)));
        }.call(this);
    };
installWriter('let', writeLet);
var toRebind = exports.toRebind = function toRebind(form) {
        return function loop() {
            var recur = loop;
            var resultø1 = [];
            var bindingsø1 = (form || 0)['bindings'];
            do {
                recur = isEmpty(bindingsø1) ? resultø1 : (loop[0] = conj(resultø1, {
                    'type': 'AssignmentExpression',
                    'operator': '=',
                    'left': writeBindingVar(first(bindingsø1)),
                    'right': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'loop'
                        },
                        'property': {
                            'type': 'Literal',
                            'value': count(resultø1)
                        }
                    }
                }), loop[1] = rest(bindingsø1), loop);
            } while (resultø1 = loop[0], bindingsø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var toSequence = exports.toSequence = function toSequence(expressions) {
        return {
            'type': 'SequenceExpression',
            'expressions': expressions
        };
    };
var toIife = exports.toIife = function toIife(body, id) {
        return {
            'type': 'CallExpression',
            'arguments': [{ 'type': 'ThisExpression' }],
            'callee': {
                'type': 'MemberExpression',
                'computed': false,
                'object': {
                    'type': 'FunctionExpression',
                    'id': id,
                    'params': [],
                    'defaults': [],
                    'expression': false,
                    'generator': false,
                    'rest': void 0,
                    'body': body
                },
                'property': {
                    'type': 'Identifier',
                    'name': 'call'
                }
            }
        };
    };
var toLoopInit = exports.toLoopInit = function toLoopInit() {
        return {
            'type': 'VariableDeclaration',
            'kind': 'var',
            'declarations': [{
                    'type': 'VariableDeclarator',
                    'id': {
                        'type': 'Identifier',
                        'name': 'recur'
                    },
                    'init': {
                        'type': 'Identifier',
                        'name': 'loop'
                    }
                }]
        };
    };
var toDoWhile = exports.toDoWhile = function toDoWhile(body, test) {
        return {
            'type': 'DoWhileStatement',
            'body': body,
            'test': test
        };
    };
var toSetRecur = exports.toSetRecur = function toSetRecur(form) {
        return {
            'type': 'AssignmentExpression',
            'operator': '=',
            'left': {
                'type': 'Identifier',
                'name': 'recur'
            },
            'right': write(form)
        };
    };
var toLoop = exports.toLoop = function toLoop(form) {
        return toSequence(conj(toRebind(form), {
            'type': 'BinaryExpression',
            'operator': '===',
            'left': {
                'type': 'Identifier',
                'name': 'recur'
            },
            'right': {
                'type': 'Identifier',
                'name': 'loop'
            }
        }));
    };
var writeLoop = exports.writeLoop = function writeLoop(form) {
        return function () {
            var statementsø1 = (form || 0)['statements'];
            var resultø1 = (form || 0)['result'];
            var bindingsø1 = (form || 0)['bindings'];
            var loopBodyø1 = conj(map(writeStatement, statementsø1), toStatement(toSetRecur(resultø1)));
            var bodyø1 = concat([toLoopInit()], map(write, bindingsø1), [toDoWhile(toBlock(vec(loopBodyø1)), toLoop(form))], [{
                        'type': 'ReturnStatement',
                        'argument': {
                            'type': 'Identifier',
                            'name': 'recur'
                        }
                    }]);
            return toIife(toBlock(vec(bodyø1)), symbol(void 0, 'loop'));
        }.call(this);
    };
installWriter('loop', writeLoop);
var toRecur = exports.toRecur = function toRecur(form) {
        return function loop() {
            var recur = loop;
            var resultø1 = [];
            var paramsø1 = (form || 0)['params'];
            do {
                recur = isEmpty(paramsø1) ? resultø1 : (loop[0] = conj(resultø1, {
                    'type': 'AssignmentExpression',
                    'operator': '=',
                    'right': write(first(paramsø1)),
                    'left': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                            'type': 'Identifier',
                            'name': 'loop'
                        },
                        'property': {
                            'type': 'Literal',
                            'value': count(resultø1)
                        }
                    }
                }), loop[1] = rest(paramsø1), loop);
            } while (resultø1 = loop[0], paramsø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var writeRecur = exports.writeRecur = function writeRecur(form) {
        return toSequence(conj(toRecur(form), {
            'type': 'Identifier',
            'name': 'loop'
        }));
    };
installWriter('recur', writeRecur);
var fallbackOverload = exports.fallbackOverload = function fallbackOverload() {
        return {
            'type': 'SwitchCase',
            'test': void 0,
            'consequent': [{
                    'type': 'ThrowStatement',
                    'argument': {
                        'type': 'CallExpression',
                        'callee': {
                            'type': 'Identifier',
                            'name': 'RangeError'
                        },
                        'arguments': [{
                                'type': 'Literal',
                                'value': 'Wrong number of arguments passed'
                            }]
                    }
                }]
        };
    };
var spliceBinding = exports.spliceBinding = function spliceBinding(form) {
        return {
            'op': 'def',
            'id': last((form || 0)['params']),
            'init': {
                'op': 'invoke',
                'callee': {
                    'op': 'var',
                    'form': symbol(void 0, 'Array.prototype.slice.call')
                },
                'params': [
                    {
                        'op': 'var',
                        'form': symbol(void 0, 'arguments')
                    },
                    {
                        'op': 'constant',
                        'form': (form || 0)['arity'],
                        'type': 'number'
                    }
                ]
            }
        };
    };
var writeOverloadingParams = exports.writeOverloadingParams = function writeOverloadingParams(params) {
        return reduce(function (forms, param) {
            return conj(forms, {
                'op': 'def',
                'id': param,
                'init': {
                    'op': 'member-expression',
                    'computed': true,
                    'target': {
                        'op': 'var',
                        'form': symbol(void 0, 'arguments')
                    },
                    'property': {
                        'op': 'constant',
                        'type': 'number',
                        'form': count(forms)
                    }
                }
            });
        }, [], params);
    };
var writeOverloadingFn = exports.writeOverloadingFn = function writeOverloadingFn(form) {
        return function () {
            var overloadsø1 = map(writeFnOverload, (form || 0)['methods']);
            return {
                'params': [],
                'body': toBlock({
                    'type': 'SwitchStatement',
                    'discriminant': {
                        'type': 'MemberExpression',
                        'computed': false,
                        'object': {
                            'type': 'Identifier',
                            'name': 'arguments'
                        },
                        'property': {
                            'type': 'Identifier',
                            'name': 'length'
                        }
                    },
                    'cases': (form || 0)['variadic'] ? overloadsø1 : conj(overloadsø1, fallbackOverload())
                })
            };
        }.call(this);
    };
var writeFnOverload = exports.writeFnOverload = function writeFnOverload(form) {
        return function () {
            var paramsø1 = (form || 0)['params'];
            var bindingsø1 = (form || 0)['variadic'] ? conj(writeOverloadingParams(butlast(paramsø1)), spliceBinding(form)) : writeOverloadingParams(paramsø1);
            var statementsø1 = vec(concat(bindingsø1, (form || 0)['statements']));
            return {
                'type': 'SwitchCase',
                'test': !(form || 0)['variadic'] ? {
                    'type': 'Literal',
                    'value': (form || 0)['arity']
                } : void 0,
                'consequent': writeBody(conj(form, { 'statements': statementsø1 }))
            };
        }.call(this);
    };
var writeSimpleFn = exports.writeSimpleFn = function writeSimpleFn(form) {
        return function () {
            var methodø1 = first((form || 0)['methods']);
            var paramsø1 = (methodø1 || 0)['variadic'] ? butlast((methodø1 || 0)['params']) : (methodø1 || 0)['params'];
            var bodyø1 = (methodø1 || 0)['variadic'] ? conj(methodø1, { 'statements': vec(cons(spliceBinding(methodø1), (methodø1 || 0)['statements'])) }) : methodø1;
            return {
                'params': map(writeVar, paramsø1),
                'body': toBlock(writeBody(bodyø1))
            };
        }.call(this);
    };
var resolve = exports.resolve = function resolve(from, to) {
        return function () {
            var requirerø1 = split(name(from), '.');
            var requirementø1 = split(name(to), '.');
            var isRelativeø1 = !(name(from) === name(to)) && first(requirerø1) === first(requirementø1);
            return isRelativeø1 ? function loop() {
                var recur = loop;
                var fromø2 = requirerø1;
                var toø2 = requirementø1;
                do {
                    recur = first(fromø2) === first(toø2) ? (loop[0] = rest(fromø2), loop[1] = rest(toø2), loop) : join('/', concat(['.'], repeat(dec(count(fromø2)), '..'), toø2));
                } while (fromø2 = loop[0], toø2 = loop[1], recur === loop);
                return recur;
            }.call(this) : join('/', requirementø1);
        }.call(this);
    };
var idToNs = exports.idToNs = function idToNs(id) {
        return symbol(void 0, join('*', split(name(id), '.')));
    };
var writeRequire = exports.writeRequire = function writeRequire(form, requirer) {
        return function () {
            var nsBindingø1 = {
                    'op': 'def',
                    'id': {
                        'op': 'var',
                        'type': 'identifier',
                        'form': idToNs((form || 0)['ns'])
                    },
                    'init': {
                        'op': 'invoke',
                        'callee': {
                            'op': 'var',
                            'type': 'identifier',
                            'form': symbol(void 0, 'require')
                        },
                        'params': [{
                                'op': 'constant',
                                'form': resolve(requirer, (form || 0)['ns'])
                            }]
                    }
                };
            var nsAliasø1 = (form || 0)['alias'] ? {
                    'op': 'def',
                    'id': {
                        'op': 'var',
                        'type': 'identifier',
                        'form': idToNs((form || 0)['alias'])
                    },
                    'init': (nsBindingø1 || 0)['id']
                } : void 0;
            var referencesø1 = reduce(function (references, form) {
                    return conj(references, {
                        'op': 'def',
                        'id': {
                            'op': 'var',
                            'type': 'identifier',
                            'form': (form || 0)['rename'] || (form || 0)['name']
                        },
                        'init': {
                            'op': 'member-expression',
                            'computed': false,
                            'target': (nsBindingø1 || 0)['id'],
                            'property': {
                                'op': 'var',
                                'type': 'identifier',
                                'form': (form || 0)['name']
                            }
                        }
                    });
                }, [], (form || 0)['refer']);
            return vec(cons(nsBindingø1, nsAliasø1 ? cons(nsAliasø1, referencesø1) : referencesø1));
        }.call(this);
    };
var writeNs = exports.writeNs = function writeNs(form) {
        return function () {
            var nodeø1 = (form || 0)['form'];
            var requirerø1 = (form || 0)['name'];
            var nsBindingø1 = {
                    'op': 'def',
                    'original-form': nodeø1,
                    'id': {
                        'op': 'var',
                        'type': 'identifier',
                        'original-form': first(nodeø1),
                        'form': symbol(void 0, '*ns*')
                    },
                    'init': {
                        'op': 'dictionary',
                        'form': nodeø1,
                        'keys': [
                            {
                                'op': 'var',
                                'type': 'identifier',
                                'original-form': nodeø1,
                                'form': symbol(void 0, 'id')
                            },
                            {
                                'op': 'var',
                                'type': 'identifier',
                                'original-form': nodeø1,
                                'form': symbol(void 0, 'doc')
                            }
                        ],
                        'values': [
                            {
                                'op': 'constant',
                                'type': 'identifier',
                                'original-form': (form || 0)['name'],
                                'form': name((form || 0)['name'])
                            },
                            {
                                'op': 'constant',
                                'original-form': nodeø1,
                                'form': (form || 0)['doc']
                            }
                        ]
                    }
                };
            var requirementsø1 = vec(concat.apply(void 0, map(function ($1) {
                    return writeRequire($1, requirerø1);
                }, (form || 0)['require'])));
            return toBlock(map(write, vec(cons(nsBindingø1, requirementsø1))));
        }.call(this);
    };
installWriter('ns', writeNs);
var writeFn = exports.writeFn = function writeFn(form) {
        return function () {
            var baseø1 = count((form || 0)['methods']) > 1 ? writeOverloadingFn(form) : writeSimpleFn(form);
            return conj(baseø1, {
                'type': 'FunctionExpression',
                'id': (form || 0)['id'] ? writeVar((form || 0)['id']) : void 0,
                'defaults': void 0,
                'rest': void 0,
                'generator': false,
                'expression': false
            });
        }.call(this);
    };
installWriter('fn', writeFn);
var write = exports.write = function write(form) {
        return function () {
            var opø1 = (form || 0)['op'];
            var writerø1 = isEqual('invoke', (form || 0)['op']) && isEqual('var', ((form || 0)['callee'] || 0)['op']) && (__specials__ || 0)[name(((form || 0)['callee'] || 0)['form'])];
            return writerø1 ? writeSpecial(writerø1, form) : writeOp((form || 0)['op'], form);
        }.call(this);
    };
var write_ = exports.write_ = function write_() {
        var forms = Array.prototype.slice.call(arguments, 0);
        return function () {
            var bodyø1 = map(writeStatement, forms);
            return {
                'type': 'Program',
                'body': bodyø1,
                'loc': inheritLocation(bodyø1)
            };
        }.call(this);
    };
var compile = exports.compile = function compile() {
        switch (arguments.length) {
        case 1:
            var form = arguments[0];
            return compile({}, form);
        default:
            var options = arguments[0];
            var forms = Array.prototype.slice.call(arguments, 1);
            return generate(write_.apply(void 0, forms), options);
        }
    };
var getMacro = exports.getMacro = function getMacro(target, property) {
        return list.apply(void 0, [symbol(void 0, 'aget')].concat([list.apply(void 0, [symbol(void 0, 'or')].concat([target], [0]))], [property]));
    };
installMacro('get', getMacro);
var installLogicalOperator = exports.installLogicalOperator = function installLogicalOperator(callee, operator, fallback) {
        var writeLogicalOperator = function writeLogicalOperator() {
            var operands = Array.prototype.slice.call(arguments, 0);
            return function () {
                var nø1 = count(operands);
                return isEqual(nø1, 0) ? writeConstant(fallback) : isEqual(nø1, 1) ? write(first(operands)) : 'else' ? reduce(function (left, right) {
                    return {
                        'type': 'LogicalExpression',
                        'operator': operator,
                        'left': left,
                        'right': write(right)
                    };
                }, write(first(operands)), rest(operands)) : void 0;
            }.call(this);
        };
        return installSpecial(callee, writeLogicalOperator);
    };
installLogicalOperator('or', '||', void 0);
installLogicalOperator('and', '&&', true);
var installUnaryOperator = exports.installUnaryOperator = function installUnaryOperator(callee, operator, isPrefix) {
        var writeUnaryOperator = function writeUnaryOperator() {
            var params = Array.prototype.slice.call(arguments, 0);
            return count(params) === 1 ? {
                'type': 'UnaryExpression',
                'operator': operator,
                'argument': write(first(params)),
                'prefix': isPrefix
            } : errorArgCount(callee, count(params));
        };
        return installSpecial(callee, writeUnaryOperator);
    };
installUnaryOperator('not', '!');
installUnaryOperator('bit-not', '~');
var installBinaryOperator = exports.installBinaryOperator = function installBinaryOperator(callee, operator) {
        var writeBinaryOperator = function writeBinaryOperator() {
            var params = Array.prototype.slice.call(arguments, 0);
            return count(params) < 2 ? errorArgCount(callee, count(params)) : reduce(function (left, right) {
                return {
                    'type': 'BinaryExpression',
                    'operator': operator,
                    'left': left,
                    'right': write(right)
                };
            }, write(first(params)), rest(params));
        };
        return installSpecial(callee, writeBinaryOperator);
    };
installBinaryOperator('bit-and', '&');
installBinaryOperator('bit-or', '|');
installBinaryOperator('bit-xor', '^');
installBinaryOperator('bit-shift-left', '<<');
installBinaryOperator('bit-shift-right', '>>');
installBinaryOperator('bit-shift-right-zero-fil', '>>>');
var installArithmeticOperator = exports.installArithmeticOperator = function installArithmeticOperator(callee, operator, isValid, fallback) {
        var writeBinaryOperator = function writeBinaryOperator(left, right) {
            return {
                'type': 'BinaryExpression',
                'operator': name(operator),
                'left': left,
                'right': write(right)
            };
        };
        var writeArithmeticOperator = function writeArithmeticOperator() {
            var params = Array.prototype.slice.call(arguments, 0);
            return function () {
                var nø1 = count(params);
                return isValid && !isValid(nø1) ? errorArgCount(name(callee), nø1) : nø1 == 0 ? writeLiteral(fallback) : nø1 == 1 ? reduce(writeBinaryOperator, writeLiteral(fallback), params) : 'else' ? reduce(writeBinaryOperator, write(first(params)), rest(params)) : void 0;
            }.call(this);
        };
        return installSpecial(callee, writeArithmeticOperator);
    };
installArithmeticOperator('+', '+', void 0, 0);
installArithmeticOperator('-', '-', function ($1) {
    return $1 >= 1;
}, 0);
installArithmeticOperator('*', '*', void 0, 1);
installArithmeticOperator(keyword('/'), keyword('/'), function ($1) {
    return $1 >= 1;
}, 1);
installArithmeticOperator('mod', keyword('%'), function ($1) {
    return $1 == 2;
}, 1);
var installComparisonOperator = exports.installComparisonOperator = function installComparisonOperator(callee, operator, fallback) {
        var writeComparisonOperator = function writeComparisonOperator() {
            switch (arguments.length) {
            case 0:
                return errorArgCount(callee, 0);
            case 1:
                var form = arguments[0];
                return toSequence([
                    write(form),
                    writeLiteral(fallback)
                ]);
            case 2:
                var left = arguments[0];
                var right = arguments[1];
                return {
                    'type': 'BinaryExpression',
                    'operator': operator,
                    'left': write(left),
                    'right': write(right)
                };
            default:
                var left = arguments[0];
                var right = arguments[1];
                var more = Array.prototype.slice.call(arguments, 2);
                return reduce(function (left, right) {
                    return {
                        'type': 'LogicalExpression',
                        'operator': '&&',
                        'left': left,
                        'right': {
                            'type': 'BinaryExpression',
                            'operator': operator,
                            'left': isEqual('LogicalExpression', (left || 0)['type']) ? ((left || 0)['right'] || 0)['right'] : (left || 0)['right'],
                            'right': write(right)
                        }
                    };
                }, writeComparisonOperator(left, right), more);
            }
        };
        return installSpecial(callee, writeComparisonOperator);
    };
installComparisonOperator('==', '==', true);
installComparisonOperator('>', '>', true);
installComparisonOperator('>=', '>=', true);
installComparisonOperator('<', '<', true);
installComparisonOperator('<=', '<=', true);
var isWriteIdentical = exports.isWriteIdentical = function isWriteIdentical() {
        var params = Array.prototype.slice.call(arguments, 0);
        return count(params) === 2 ? {
            'type': 'BinaryExpression',
            'operator': '===',
            'left': write(first(params)),
            'right': write(second(params))
        } : errorArgCount('identical?', count(params));
    };
installSpecial('identical?', isWriteIdentical);
var isWriteInstance = exports.isWriteInstance = function isWriteInstance() {
        var params = Array.prototype.slice.call(arguments, 0);
        return function () {
            var constructorø1 = first(params);
            var instanceø1 = second(params);
            return count(params) < 1 ? errorArgCount('instance?', count(params)) : {
                'type': 'BinaryExpression',
                'operator': 'instanceof',
                'left': instanceø1 ? write(instanceø1) : writeConstant(instanceø1),
                'right': write(constructorø1)
            };
        }.call(this);
    };
installSpecial('instance?', isWriteInstance);
var expandApply = exports.expandApply = function expandApply(f) {
        var params = Array.prototype.slice.call(arguments, 1);
        return function () {
            var prefixø1 = vec(butlast(params));
            return isEmpty(prefixø1) ? list.apply(void 0, [symbol(void 0, '.apply')].concat([f], [void 0], vec(params))) : list.apply(void 0, [symbol(void 0, '.apply')].concat([f], [void 0], [list.apply(void 0, [symbol(void 0, '.concat')].concat([prefixø1], [last(params)]))]));
        }.call(this);
    };
installMacro('apply', expandApply);
var expandPrint = exports.expandPrint = function expandPrint(andForm) {
        var more = Array.prototype.slice.call(arguments, 1);
        'Prints the object(s) to the output for human consumption.';
        return function () {
            var opø1 = withMeta(symbol(void 0, 'console.log'), meta(andForm));
            return list.apply(void 0, [opø1].concat(vec(more)));
        }.call(this);
    };
installMacro('print', withMeta(expandPrint, { 'implicit': ['&form'] }));
var expandStr = exports.expandStr = function expandStr() {
        var forms = Array.prototype.slice.call(arguments, 0);
        return list.apply(void 0, [symbol(void 0, '+')].concat([''], vec(forms)));
    };
installMacro('str', expandStr);
var expandDebug = exports.expandDebug = function expandDebug() {
        return symbol(void 0, 'debugger');
    };
installMacro('debugger!', expandDebug);
var expandAssert = exports.expandAssert = function expandAssert() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return expandAssert(x, '');
        case 2:
            var x = arguments[0];
            var message = arguments[1];
            return function () {
                var formø1 = prStr(x);
                return list.apply(void 0, [symbol(void 0, 'if')].concat([list.apply(void 0, [symbol(void 0, 'not')].concat([x]))], [list.apply(void 0, [symbol(void 0, 'throw')].concat([list.apply(void 0, [symbol(void 0, 'Error')].concat([list.apply(void 0, [symbol(void 0, 'str')].concat(['Assert failed: '], [message], [formø1]))]))]))]));
            }.call(this);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
installMacro('assert', expandAssert);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvYmFja2VuZC9lc2NvZGVnZW4vd3JpdGVyLndpc3AiXSwibmFtZXMiOlsicmVhZEZyb21TdHJpbmciLCJtZXRhIiwid2l0aE1ldGEiLCJpc1N5bWJvbCIsInN5bWJvbCIsImlzS2V5d29yZCIsImtleXdvcmQiLCJuYW1lc3BhY2UiLCJpc1VucXVvdGUiLCJpc1VucXVvdGVTcGxpY2luZyIsImlzUXVvdGUiLCJpc1N5bnRheFF1b3RlIiwibmFtZSIsImdlbnN5bSIsInByU3RyIiwiaXNFbXB0eSIsImNvdW50IiwiaXNMaXN0IiwibGlzdCIsImZpcnN0Iiwic2Vjb25kIiwidGhpcmQiLCJyZXN0IiwiY29ucyIsImNvbmoiLCJidXRsYXN0IiwicmV2ZXJzZSIsInJlZHVjZSIsInZlYyIsImxhc3QiLCJtYXAiLCJmaWx0ZXIiLCJ0YWtlIiwiY29uY2F0IiwicGFydGl0aW9uIiwicmVwZWF0IiwiaW50ZXJsZWF2ZSIsImlzT2RkIiwiaXNEaWN0aW9uYXJ5IiwiZGljdGlvbmFyeSIsIm1lcmdlIiwia2V5cyIsInZhbHMiLCJpc0NvbnRhaW5zVmVjdG9yIiwibWFwRGljdGlvbmFyeSIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc1ZlY3RvciIsImlzQm9vbGVhbiIsInN1YnMiLCJyZUZpbmQiLCJpc1RydWUiLCJpc0ZhbHNlIiwiaXNOaWwiLCJpc1JlUGF0dGVybiIsImluYyIsImRlYyIsInN0ciIsImNoYXIiLCJpbnQiLCJpc0VxdWFsIiwiaXNTdHJpY3RFcXVhbCIsInNwbGl0Iiwiam9pbiIsInVwcGVyQ2FzZSIsInJlcGxhY2UiLCJpbnN0YWxsTWFjcm8iLCJnZW5lcmF0ZSIsIl9fdW5pcXVlQ2hhcl9fIiwidG9DYW1lbEpvaW4iLCJwcmVmaXgiLCJrZXkiLCJ0cmFuc2xhdGVJZGVudGlmaWVyV29yZCIsImZvcm0iLCJpZCIsInRyYW5zbGF0ZUlkZW50aWZpZXIiLCJlcnJvckFyZ0NvdW50IiwiY2FsbGVlIiwibiIsIlN5bnRheEVycm9yIiwiaW5oZXJpdExvY2F0aW9uIiwiYm9keSIsInN0YXJ0w7gxIiwiZW5kw7gxIiwid3JpdGVMb2NhdGlvbiIsIm9yaWdpbmFsIiwiZGF0YcO4MSIsImluaGVyaXRlZMO4MSIsIl9fd3JpdGVyc19fIiwiaW5zdGFsbFdyaXRlciIsIm9wIiwid3JpdGVyIiwid3JpdGVPcCIsIndyaXRlcsO4MSIsIl9fc3BlY2lhbHNfXyIsImluc3RhbGxTcGVjaWFsIiwid3JpdGVTcGVjaWFsIiwid3JpdGVOaWwiLCJjb25zb2xlIiwid2FybiIsIndyaXRlTGl0ZXJhbCIsIndyaXRlTGlzdCIsIndyaXRlIiwid3JpdGVTeW1ib2wiLCJ3cml0ZUNvbnN0YW50Iiwid3JpdGVOdW1iZXIiLCJ2YWx1ZU9mIiwid3JpdGVTdHJpbmciLCIkMSIsIndyaXRlS2V5d29yZCIsInRvSWRlbnRpZmllciIsIndyaXRlQmluZGluZ1ZhciIsImlkw7gxIiwid3JpdGVWYXIiLCJub2RlIiwid3JpdGVJbnZva2UiLCJ3cml0ZVZlY3RvciIsIndyaXRlRGljdGlvbmFyeSIsInByb3BlcnRpZXPDuDEiLCJwYWlyIiwia2V5w7gxIiwidmFsdWXDuDEiLCJ3cml0ZUV4cG9ydCIsIndyaXRlRGVmIiwid3JpdGVCaW5kaW5nIiwiaW5pdMO4MSIsIndyaXRlVGhyb3ciLCJ0b0V4cHJlc3Npb24iLCJ3cml0ZU5ldyIsIndyaXRlU2V0Iiwid3JpdGVBZ2V0IiwiX19zdGF0ZW1lbnRzX18iLCJ3cml0ZVN0YXRlbWVudCIsInRvU3RhdGVtZW50IiwidG9SZXR1cm4iLCJ3cml0ZUJvZHkiLCJzdGF0ZW1lbnRzw7gxIiwicmVzdWx0w7gxIiwidG9CbG9jayIsInRvU2VxdWVuY2UiLCJ3cml0ZURvIiwid3JpdGVJZiIsIndyaXRlVHJ5IiwiaGFuZGxlcsO4MSIsImZpbmFsaXplcsO4MSIsIndyaXRlQmluZGluZ1ZhbHVlIiwid3JpdGVCaW5kaW5nUGFyYW0iLCJ3cml0ZUxldCIsImJvZHnDuDEiLCJ0b0lpZmUiLCJ0b1JlYmluZCIsImJpbmRpbmdzw7gxIiwiZXhwcmVzc2lvbnMiLCJ0b0xvb3BJbml0IiwidG9Eb1doaWxlIiwidGVzdCIsInRvU2V0UmVjdXIiLCJ0b0xvb3AiLCJ3cml0ZUxvb3AiLCJsb29wQm9kecO4MSIsInRvUmVjdXIiLCJwYXJhbXPDuDEiLCJ3cml0ZVJlY3VyIiwiZmFsbGJhY2tPdmVybG9hZCIsInNwbGljZUJpbmRpbmciLCJ3cml0ZU92ZXJsb2FkaW5nUGFyYW1zIiwicGFyYW1zIiwiZm9ybXMiLCJwYXJhbSIsIndyaXRlT3ZlcmxvYWRpbmdGbiIsIm92ZXJsb2Fkc8O4MSIsIndyaXRlRm5PdmVybG9hZCIsIndyaXRlU2ltcGxlRm4iLCJtZXRob2TDuDEiLCJyZXNvbHZlIiwiZnJvbSIsInRvIiwicmVxdWlyZXLDuDEiLCJyZXF1aXJlbWVudMO4MSIsImlzUmVsYXRpdmXDuDEiLCJmcm9tw7gyIiwidG/DuDIiLCJpZFRvTnMiLCJ3cml0ZVJlcXVpcmUiLCJyZXF1aXJlciIsIm5zQmluZGluZ8O4MSIsIm5zQWxpYXPDuDEiLCJyZWZlcmVuY2Vzw7gxIiwicmVmZXJlbmNlcyIsIndyaXRlTnMiLCJub2Rlw7gxIiwicmVxdWlyZW1lbnRzw7gxIiwid3JpdGVGbiIsImJhc2XDuDEiLCJvcMO4MSIsIndyaXRlXyIsImNvbXBpbGUiLCJvcHRpb25zIiwiZ2V0TWFjcm8iLCJ0YXJnZXQiLCJwcm9wZXJ0eSIsImluc3RhbGxMb2dpY2FsT3BlcmF0b3IiLCJvcGVyYXRvciIsImZhbGxiYWNrIiwid3JpdGVMb2dpY2FsT3BlcmF0b3IiLCJvcGVyYW5kcyIsIm7DuDEiLCJsZWZ0IiwicmlnaHQiLCJpbnN0YWxsVW5hcnlPcGVyYXRvciIsImlzUHJlZml4Iiwid3JpdGVVbmFyeU9wZXJhdG9yIiwiaW5zdGFsbEJpbmFyeU9wZXJhdG9yIiwid3JpdGVCaW5hcnlPcGVyYXRvciIsImluc3RhbGxBcml0aG1ldGljT3BlcmF0b3IiLCJpc1ZhbGlkIiwid3JpdGVBcml0aG1ldGljT3BlcmF0b3IiLCJpbnN0YWxsQ29tcGFyaXNvbk9wZXJhdG9yIiwid3JpdGVDb21wYXJpc29uT3BlcmF0b3IiLCJtb3JlIiwiaXNXcml0ZUlkZW50aWNhbCIsImlzV3JpdGVJbnN0YW5jZSIsImNvbnN0cnVjdG9yw7gxIiwiaW5zdGFuY2XDuDEiLCJleHBhbmRBcHBseSIsImYiLCJwcmVmaXjDuDEiLCJleHBhbmRQcmludCIsImFuZEZvcm0iLCJleHBhbmRTdHIiLCJleHBhbmREZWJ1ZyIsImV4cGFuZEFzc2VydCIsIngiLCJtZXNzYWdlIiwiZm9ybcO4MSJdLCJtYXBwaW5ncyI6IkFBQUE7STs7O1VBQUE7SSw0Q0FBQTtJLElBQ2lDQSxjQUFBLEcsWUFBQUEsYyxDQURqQztJLHNDQUFBO0ksSUFFOEJDLElBQUEsRyxTQUFBQSxJLENBRjlCO0ksSUFFbUNDLFFBQUEsRyxTQUFBQSxRLENBRm5DO0ksSUFFNkNDLFFBQUEsRyxTQUFBQSxRLENBRjdDO0ksSUFFcURDLE1BQUEsRyxTQUFBQSxNLENBRnJEO0ksSUFFNERDLFNBQUEsRyxTQUFBQSxTLENBRjVEO0ksSUFFcUVDLE9BQUEsRyxTQUFBQSxPLENBRnJFO0ksSUFHOEJDLFNBQUEsRyxTQUFBQSxTLENBSDlCO0ksSUFHd0NDLFNBQUEsRyxTQUFBQSxTLENBSHhDO0ksSUFHaURDLGlCQUFBLEcsU0FBQUEsaUIsQ0FIakQ7SSxJQUdtRUMsT0FBQSxHLFNBQUFBLE8sQ0FIbkU7SSxJQUk4QkMsYUFBQSxHLFNBQUFBLGEsQ0FKOUI7SSxJQUk0Q0MsSUFBQSxHLFNBQUFBLEksQ0FKNUM7SSxJQUlpREMsTUFBQSxHLFNBQUFBLE0sQ0FKakQ7SSxJQUl3REMsS0FBQSxHLFNBQUFBLEssQ0FKeEQ7SSxnREFBQTtJLElBS21DQyxPQUFBLEcsY0FBQUEsTyxDQUxuQztJLElBSzBDQyxLQUFBLEcsY0FBQUEsSyxDQUwxQztJLElBS2dEQyxNQUFBLEcsY0FBQUEsTSxDQUxoRDtJLElBS3NEQyxJQUFBLEcsY0FBQUEsSSxDQUx0RDtJLElBSzJEQyxLQUFBLEcsY0FBQUEsSyxDQUwzRDtJLElBS2lFQyxNQUFBLEcsY0FBQUEsTSxDQUxqRTtJLElBS3dFQyxL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LEM7QUFHQ3BLLFlBQUQsQyxXQUFBLEVBQTJCb0ssV0FBM0IsQztBQUVBLElBQU1DLFlBQUEsRyxRQUFBQSxZLEdBQU4sU0FBTUEsWUFBTixHOzs7Z0JBR0lDLENBQUEsRztZQUFHLE9BQUNELFlBQUQsQ0FBZUMsQ0FBZixFLEVBQUEsRTs7Z0JBQ0hBLENBQUEsRztnQkFBRUMsT0FBQSxHO1lBQVMsTztnQkFBTSxJQUFBQyxNLEdBQU01TixLQUFELENBQVEwTixDQUFSLENBQUwsQztnQkFDSixPLFVBQUEsQyxNQUFBLEUsT0FBRSxDLE1BQUEsRSxJQUFBLEMsb0NBQUksQyxNQUFBLEUsS0FBQSxDLFVBQUtBLEMsaUNBQ1AsQyxNQUFBLEUsT0FBQSxDLG9DQUFPLEMsTUFBQSxFLE9BQUEsQyxvQ0FBTyxDLE1BQUEsRSxLQUFBLEMsK0JBQ0tDLE8sSUFDQUMsTSxXQUh2QixFO2tCQURGLEMsSUFBQSxFOzs7O0tBSmYsQztBQVNDeEssWUFBRCxDLFFBQUEsRUFBd0JxSyxZQUF4QixDIiwic291cmNlc0NvbnRlbnQiOlsiKG5zIHdpc3AuYmFja2VuZC5lc2NvZGVnZW4ud3JpdGVyXG4gICg6cmVxdWlyZSBbd2lzcC5yZWFkZXIgOnJlZmVyIFtyZWFkLWZyb20tc3RyaW5nXV1cbiAgICAgICAgICAgIFt3aXNwLmFzdCA6cmVmZXIgW21ldGEgd2l0aC1tZXRhIHN5bWJvbD8gc3ltYm9sIGtleXdvcmQ/IGtleXdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZSB1bnF1b3RlPyB1bnF1b3RlLXNwbGljaW5nPyBxdW90ZT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bnRheC1xdW90ZT8gbmFtZSBnZW5zeW0gcHItc3RyXV1cbiAgICAgICAgICAgIFt3aXNwLnNlcXVlbmNlIDpyZWZlciBbZW1wdHk/IGNvdW50IGxpc3Q/IGxpc3QgZmlyc3Qgc2Vjb25kIHRoaXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3QgY29ucyBjb25qIGJ1dGxhc3QgcmV2ZXJzZSByZWR1Y2UgdmVjXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgbWFwIGZpbHRlciB0YWtlIGNvbmNhdCBwYXJ0aXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwZWF0IGludGVybGVhdmVdXVxuICAgICAgICAgICAgW3dpc3AucnVudGltZSA6cmVmZXIgW29kZD8gZGljdGlvbmFyeT8gZGljdGlvbmFyeSBtZXJnZSBrZXlzIHZhbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWlucy12ZWN0b3I/IG1hcC1kaWN0aW9uYXJ5IHN0cmluZz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1iZXI/IHZlY3Rvcj8gYm9vbGVhbj8gc3VicyByZS1maW5kIHRydWU/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2U/IG5pbD8gcmUtcGF0dGVybj8gaW5jIGRlYyBzdHIgY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCA9ID09XV1cbiAgICAgICAgICAgIFt3aXNwLnN0cmluZyA6cmVmZXIgW3NwbGl0IGpvaW4gdXBwZXItY2FzZSByZXBsYWNlXV1cbiAgICAgICAgICAgIFt3aXNwLmV4cGFuZGVyIDpyZWZlciBbaW5zdGFsbC1tYWNybyFdXVxuICAgICAgICAgICAgW2VzY29kZWdlbiA6cmVmZXIgW2dlbmVyYXRlXV0pKVxuXG5cbjs7IERlZmluZSBjaGFyYWN0ZXIgdGhhdCBpcyB2YWxpZCBKUyBpZGVudGlmaWVyIHRoYXQgd2lsbFxuOzsgYmUgdXNlZCBpbiBnZW5lcmF0ZWQgc3ltYm9scyB0byBhdm9pZCBjb25mbGljdHNcbjs7IGh0dHA6Ly93d3cuZmlsZWZvcm1hdC5pbmZvL2luZm8vdW5pY29kZS9jaGFyL2Y4L2luZGV4Lmh0bVxuKGRlZiAqKnVuaXF1ZS1jaGFyKiogXCJcXHUwMEY4XCIpXG5cbihkZWZuIC0+Y2FtZWwtam9pblxuICBbcHJlZml4IGtleV1cbiAgKHN0ciBwcmVmaXhcbiAgICAgICAoaWYgKGFuZCAobm90IChlbXB0eT8gcHJlZml4KSlcbiAgICAgICAgICAgICAgICAobm90IChlbXB0eT8ga2V5KSkpXG4gICAgICAgICAoc3RyICh1cHBlci1jYXNlIChnZXQga2V5IDApKSAoc3VicyBrZXkgMSkpXG4gICAgICAgICBrZXkpKSlcblxuKGRlZm4gdHJhbnNsYXRlLWlkZW50aWZpZXItd29yZFxuICBcIlRyYW5zbGF0ZXMgcmVmZXJlbmNlcyBmcm9tIGNsb2p1cmUgY29udmVudGlvbiB0byBKUzpcblxuICAqKm1hY3JvcyoqICAgICAgX19tYWNyb3NfX1xuICBsaXN0LT52ZWN0b3IgICAgbGlzdFRvVmVjdG9yXG4gIHNldCEgICAgICAgICAgICBzZXRcbiAgZm9vX2JhciAgICAgICAgIGZvb19iYXJcbiAgbnVtYmVyPyAgICAgICAgIGlzTnVtYmVyXG4gIHJlZD0gICAgICAgICAgICByZWRFcXVhbFxuICBjcmVhdGUtc2VydmVyICAgY3JlYXRlU2VydmVyXCJcbiAgW2Zvcm1dXG4gIChkZWYgaWQgKG5hbWUgZm9ybSkpXG4gIChzZXQhIGlkIChjb25kIChpZGVudGljYWw/IGlkICBcIipcIikgXCJtdWx0aXBseVwiXG4gICAgICAgICAgICAgICAgIChpZGVudGljYWw/IGlkIFwiL1wiKSBcImRpdmlkZVwiXG4gICAgICAgICAgICAgICAgIChpZGVudGljYWw/IGlkIFwiK1wiKSBcInN1bVwiXG4gICAgICAgICAgICAgICAgIChpZGVudGljYWw/IGlkIFwiLVwiKSBcInN1YnRyYWN0XCJcbiAgICAgICAgICAgICAgICAgKGlkZW50aWNhbD8gaWQgXCI9XCIpIFwiZXF1YWw/XCJcbiAgICAgICAgICAgICAgICAgKGlkZW50aWNhbD8gaWQgXCI9PVwiKSBcInN0cmljdC1lcXVhbD9cIlxuICAgICAgICAgICAgICAgICAoaWRlbnRpY2FsPyBpZCBcIjw9XCIpIFwibm90LWdyZWF0ZXItdGhhblwiXG4gICAgICAgICAgICAgICAgIChpZGVudGljYWw/IGlkIFwiPj1cIikgXCJub3QtbGVzcy10aGFuXCJcbiAgICAgICAgICAgICAgICAgKGlkZW50aWNhbD8gaWQgXCI+XCIpIFwiZ3JlYXRlci10aGFuXCJcbiAgICAgICAgICAgICAgICAgKGlkZW50aWNhbD8gaWQgXCI8XCIpIFwibGVzcy10aGFuXCJcbiAgICAgICAgICAgICAgICAgOmVsc2UgaWQpKVxuXG4gIDs7ICoqbWFjcm9zKiogLT4gIF9fbWFjcm9zX19cbiAgKHNldCEgaWQgKGpvaW4gXCJfXCIgKHNwbGl0IGlkIFwiKlwiKSkpXG4gIDs7IGxpc3QtPnZlY3RvciAtPiAgbGlzdFRvVmVjdG9yXG4gIChzZXQhIGlkIChqb2luIFwiLXRvLVwiIChzcGxpdCBpZCBcIi0+XCIpKSlcbiAgOzsgc2V0ISAtPiAgc2V0XG4gIChzZXQhIGlkIChqb2luIChzcGxpdCBpZCBcIiFcIikpKVxuICAoc2V0ISBpZCAoam9pbiBcIiRcIiAoc3BsaXQgaWQgXCIlXCIpKSlcbiAgKHNldCEgaWQgKGpvaW4gXCItZXF1YWwtXCIgKHNwbGl0IGlkIFwiPVwiKSkpXG4gIDs7IGZvbz0gLT4gZm9vRXF1YWxcbiAgOyhzZXQhIGlkIChqb2luIFwiLWVxdWFsLVwiIChzcGxpdCBpZCBcIj1cIikpXG4gIDs7IGZvbytiYXIgLT4gZm9vUGx1c0JhclxuICAoc2V0ISBpZCAoam9pbiBcIi1wbHVzLVwiIChzcGxpdCBpZCBcIitcIikpKVxuICAoc2V0ISBpZCAoam9pbiBcIi1hbmQtXCIgKHNwbGl0IGlkIFwiJlwiKSkpXG4gIDs7IG51bWJlcj8gLT4gaXNOdW1iZXJcbiAgKHNldCEgaWQgKGlmIChpZGVudGljYWw/IChsYXN0IGlkKSBcIj9cIilcbiAgICAgICAgICAgICAoc3RyIFwiaXMtXCIgKHN1YnMgaWQgMCAoZGVjIChjb3VudCBpZCkpKSlcbiAgICAgICAgICAgICBpZCkpXG4gIDs7IGNyZWF0ZS1zZXJ2ZXIgLT4gY3JlYXRlU2VydmVyXG4gIChzZXQhIGlkIChyZWR1Y2UgLT5jYW1lbC1qb2luIFwiXCIgKHNwbGl0IGlkIFwiLVwiKSkpXG4gIGlkKVxuXG4oZGVmbiB0cmFuc2xhdGUtaWRlbnRpZmllclxuICBbZm9ybV1cbiAgKGpvaW4gXFwuIChtYXAgdHJhbnNsYXRlLWlkZW50aWZpZXItd29yZCAoc3BsaXQgKG5hbWUgZm9ybSkgXFwuKSkpKVxuXG4oZGVmbiBlcnJvci1hcmctY291bnRcbiAgW2NhbGxlZSBuXVxuICAodGhyb3cgKFN5bnRheEVycm9yIChzdHIgXCJXcm9uZyBudW1iZXIgb2YgYXJndW1lbnRzIChcIiBuIFwiKSBwYXNzZWQgdG86IFwiIGNhbGxlZSkpKSlcblxuKGRlZm4gaW5oZXJpdC1sb2NhdGlvblxuICBbYm9keV1cbiAgKGxldCBbc3RhcnQgKDpzdGFydCAoOmxvYyAoZmlyc3QgYm9keSkpKVxuICAgICAgICBlbmQgKDplbmQgKDpsb2MgKGxhc3QgYm9keSkpKV1cbiAgICAoaWYgKG5vdCAob3IgKG5pbD8gc3RhcnQpIChuaWw/IGVuZCkpKVxuICAgICAgezpzdGFydCBzdGFydCA6ZW5kIGVuZH0pKSlcblxuXG4oZGVmbiB3cml0ZS1sb2NhdGlvblxuICBbZm9ybSBvcmlnaW5hbF1cbiAgKGxldCBbZGF0YSAobWV0YSBmb3JtKVxuICAgICAgICBpbmhlcml0ZWQgKG1ldGEgb3JpZ2luYWwpXG4gICAgICAgIHN0YXJ0IChvciAoOnN0YXJ0IGZvcm0pICg6c3RhcnQgZGF0YSkgKDpzdGFydCBpbmhlcml0ZWQpKVxuICAgICAgICBlbmQgKG9yICg6ZW5kIGZvcm0pICg6ZW5kIGRhdGEpICg6ZW5kIGluaGVyaXRlZCkpXVxuICAgIChpZiAobm90IChuaWw/IHN0YXJ0KSlcbiAgICAgIHs6bG9jIHs6c3RhcnQgezpsaW5lIChpbmMgKDpsaW5lIHN0YXJ0IC0xKSlcbiAgICAgICAgICAgICAgICAgICAgIDpjb2x1bW4gKDpjb2x1bW4gc3RhcnQgLTEpfVxuICAgICAgICAgICAgIDplbmQgezpsaW5lIChpbmMgKDpsaW5lIGVuZCAtMSkpXG4gICAgICAgICAgICAgICAgICAgOmNvbHVtbiAoOmNvbHVtbiBlbmQgLTEpfX19XG4gICAgICB7fSkpKVxuXG4oZGVmICoqd3JpdGVycyoqIHt9KVxuKGRlZm4gaW5zdGFsbC13cml0ZXIhXG4gIFtvcCB3cml0ZXJdXG4gIChzZXQhIChnZXQgKip3cml0ZXJzKiogb3ApIHdyaXRlcikpXG5cbihkZWZuIHdyaXRlLW9wXG4gIFtvcCBmb3JtXVxuICAobGV0IFt3cml0ZXIgKGdldCAqKndyaXRlcnMqKiBvcCldXG4gICAgKGFzc2VydCB3cml0ZXIgKHN0ciBcIlVuc3VwcG9ydGVkIG9wZXJhdGlvbjogXCIgb3ApKVxuICAgIChjb25qICh3cml0ZS1sb2NhdGlvbiAoOmZvcm0gZm9ybSkgKDpvcmlnaW5hbC1mb3JtIGZvcm0pKVxuICAgICAgICAgICh3cml0ZXIgZm9ybSkpKSlcblxuKGRlZiAqKnNwZWNpYWxzKioge30pXG4oZGVmbiBpbnN0YWxsLXNwZWNpYWwhXG4gIFtvcCB3cml0ZXJdXG4gIChzZXQhIChnZXQgKipzcGVjaWFscyoqIChuYW1lIG9wKSkgd3JpdGVyKSlcblxuKGRlZm4gd3JpdGUtc3BlY2lhbFxuICBbd3JpdGVyIGZvcm1dXG4gIChjb25qICh3cml0ZS1sb2NhdGlvbiAoOmZvcm0gZm9ybSkgKDpvcmlnaW5hbC1mb3JtIGZvcm0pKVxuICAgICAgICAoYXBwbHkgd3JpdGVyICg6cGFyYW1zIGZvcm0pKSkpXG5cblxuKGRlZm4gd3JpdGUtbmlsXG4gIFtmb3JtXVxuICAoY29uc29sZS53YXJuIGZvcm0pXG4gIHs6dHlwZSA6VW5hcnlFeHByZXNzaW9uXG4gICA6b3BlcmF0b3IgOnZvaWRcbiAgIDphcmd1bWVudCAoY29uaiAod3JpdGUtbG9jYXRpb24gKDpmb3JtIGZvcm0pICg6b3JpZ2luYWwtZm9ybSBmb3JtKSlcbiAgICAgICAgICAgICAgICAgICB7OnR5cGUgOkxpdGVyYWxcbiAgICAgICAgICAgICAgICAgICAgOnZhbHVlIDB9KVxuICAgOnByZWZpeCB0cnVlfSlcbihpbnN0YWxsLXdyaXRlciEgOm5pbCB3cml0ZS1uaWwpXG5cbihkZWZuIHdyaXRlLWxpdGVyYWxcbiAgW2Zvcm1dXG4gIHs6dHlwZSA6TGl0ZXJhbFxuICAgOnZhbHVlIGZvcm19KVxuXG4oZGVmbiB3cml0ZS1saXN0XG4gIFtmb3JtXVxuICB7OnR5cGUgOkNhbGxFeHByZXNzaW9uXG4gICA6Y2FsbGVlICh3cml0ZSB7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICA6Zm9ybSAnbGlzdH0pXG4gICA6YXJndW1lbnRzIChtYXAgd3JpdGUgKDppdGVtcyBmb3JtKSl9KVxuKGluc3RhbGwtd3JpdGVyISA6bGlzdCB3cml0ZS1saXN0KVxuXG4oZGVmbiB3cml0ZS1zeW1ib2xcbiAgW2Zvcm1dXG4gIHs6dHlwZSA6Q2FsbEV4cHJlc3Npb25cbiAgIDpjYWxsZWUgKHdyaXRlIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgIDpmb3JtICdzeW1ib2x9KVxuICAgOmFyZ3VtZW50cyBbKHdyaXRlLWNvbnN0YW50ICg6bmFtZXNwYWNlIGZvcm0pKVxuICAgICAgICAgICAgICAgKHdyaXRlLWNvbnN0YW50ICg6bmFtZSBmb3JtKSldfSlcbihpbnN0YWxsLXdyaXRlciEgOnN5bWJvbCB3cml0ZS1zeW1ib2wpXG5cbihkZWZuIHdyaXRlLWNvbnN0YW50XG4gIFtmb3JtXVxuICAoY29uZCAobmlsPyBmb3JtKSAod3JpdGUtbmlsIGZvcm0pXG4gICAgICAgIChrZXl3b3JkPyBmb3JtKSAod3JpdGUtbGl0ZXJhbCAobmFtZSBmb3JtKSlcbiAgICAgICAgKG51bWJlcj8gZm9ybSkgKHdyaXRlLW51bWJlciAoLnZhbHVlT2YgZm9ybSkpXG4gICAgICAgIChzdHJpbmc/IGZvcm0pICh3cml0ZS1zdHJpbmcgZm9ybSlcbiAgICAgICAgOmVsc2UgKHdyaXRlLWxpdGVyYWwgZm9ybSkpKVxuKGluc3RhbGwtd3JpdGVyISA6Y29uc3RhbnQgIyh3cml0ZS1jb25zdGFudCAoOmZvcm0gJSkpKVxuXG4oZGVmbiB3cml0ZS1zdHJpbmdcbiAgW2Zvcm1dXG4gIHs6dHlwZSA6TGl0ZXJhbFxuICAgOnZhbHVlIChzdHIgZm9ybSl9KVxuXG4oZGVmbiB3cml0ZS1udW1iZXJcbiAgW2Zvcm1dXG4gIChpZiAoPCBmb3JtIDApXG4gICAgezp0eXBlIDpVbmFyeUV4cHJlc3Npb25cbiAgICAgOm9wZXJhdG9yIDotXG4gICAgIDpwcmVmaXggdHJ1ZVxuICAgICA6YXJndW1lbnQgKHdyaXRlLW51bWJlciAoKiBmb3JtIC0xKSl9XG4gICAgKHdyaXRlLWxpdGVyYWwgZm9ybSkpKVxuXG4oZGVmbiB3cml0ZS1rZXl3b3JkXG4gIFtmb3JtXVxuICB7OnR5cGUgOkxpdGVyYWxcbiAgIDp2YWx1ZSAoOmZvcm0gZm9ybSl9KVxuKGluc3RhbGwtd3JpdGVyISA6a2V5d29yZCB3cml0ZS1rZXl3b3JkKVxuXG4oZGVmbiAtPmlkZW50aWZpZXJcbiAgW2Zvcm1dXG4gIHs6dHlwZSA6SWRlbnRpZmllclxuICAgOm5hbWUgKHRyYW5zbGF0ZS1pZGVudGlmaWVyIGZvcm0pfSlcblxuKGRlZm4gd3JpdGUtYmluZGluZy12YXJcbiAgW2Zvcm1dXG4gIChsZXQgW2lkIChuYW1lICg6aWQgZm9ybSkpXVxuICAgIDs7IElmIGlkZW50aWZpZXJzIGJpbmRpbmcgc2hhZG93cyBvdGhlciBiaW5kaW5nIHJlbmFtZSBpdCBhY2NvcmRpbmdcbiAgICA7OyB0byBzaGFkb3dpbmcgZGVwdGguIFRoaXMgYWxsb3dzIGJpbmRpbmdzIGluaXRpYWxpemVyIHNhZmVseVxuICAgIDs7IGFjY2VzcyBiaW5kaW5nIGJlZm9yZSBzaGFkb3dpbmcgaXQuXG4gICAgKGNvbmogKC0+aWRlbnRpZmllciAoaWYgKDpzaGFkb3cgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHN0ciAodHJhbnNsYXRlLWlkZW50aWZpZXIgaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKip1bmlxdWUtY2hhcioqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDpkZXB0aCBmb3JtKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQpKVxuICAgICAgICAgICh3cml0ZS1sb2NhdGlvbiAoOmlkIGZvcm0pKSkpKVxuXG4oZGVmbiB3cml0ZS12YXJcbiAgXCJoYW5kbGVyIGZvciB7Om9wIDp2YXJ9IHR5cGUgZm9ybXMuIFN1Y2ggZm9ybXMgbWF5XG4gIHJlcHJlc2VudCByZWZlcmVuY2VzIGluIHdoaWNoIGNhc2UgdGhleSBoYXZlIDppbmZvXG4gIHBvaW50aW5nIHRvIGEgZGVjbGFyYXRpb24gOnZhciB3aGljaCB3YXkgYmUgZWl0aGVyXG4gIGZ1bmN0aW9uIHBhcmFtZXRlciAoaGFzIDpwYXJhbSB0cnVlKSBvciBsb2NhbFxuICBiaW5kaW5nIGRlY2xhcmF0aW9uIChoYXMgOmJpbmRpbmcgdHJ1ZSkgbGlrZSBvbmVzIGRlZmluZWRcbiAgYnkgbGV0IGFuZCBsb29wIGZvcm1zIGluIGxhdGVyIGNhc2UgZm9ybSB3aWxsIGFsc28gaGF2ZVxuICA6c2hhZG93IHBvaW50aW5nIHRvIGEgZGVjbGFyYXRpb24gbm9kZSBpdCBzaGFkb3dzIGFuZFxuICA6ZGVwdGggcHJvcGVydHkgd2l0aCBhIGRlcHRoIG9mIHNoYWRvd2luZywgdGhhdCBpcyB1c2VkXG4gIHRvIGZvciByZW5hbWluZyBsb2dpYyB0byBhdm9pZCBuYW1lIGNvbGxpc2lvbnMgaW4gZm9ybXNcbiAgbGlrZSBsZXQgdGhhdCBhbGxvdyBzYW1lIG5hbWVkIGJpbmRpbmdzLlwiXG4gIFtub2RlXVxuICAoaWYgKD0gOmJpbmRpbmcgKDp0eXBlICg6YmluZGluZyBub2RlKSkpXG4gICAgKGNvbmogKHdyaXRlLWJpbmRpbmctdmFyICg6YmluZGluZyBub2RlKSlcbiAgICAgICAgICAod3JpdGUtbG9jYXRpb24gKDpmb3JtIG5vZGUpKSlcbiAgICAoY29uaiAod3JpdGUtbG9jYXRpb24gKDpmb3JtIG5vZGUpKVxuICAgICAgICAgICgtPmlkZW50aWZpZXIgKG5hbWUgKDpmb3JtIG5vZGUpKSkpKSlcbihpbnN0YWxsLXdyaXRlciEgOnZhciB3cml0ZS12YXIpXG4oaW5zdGFsbC13cml0ZXIhIDpwYXJhbSB3cml0ZS12YXIpXG5cbihkZWZuIHdyaXRlLWludm9rZVxuICBbZm9ybV1cbiAgezp0eXBlIDpDYWxsRXhwcmVzc2lvblxuICAgOmNhbGxlZSAod3JpdGUgKDpjYWxsZWUgZm9ybSkpXG4gICA6YXJndW1lbnRzIChtYXAgd3JpdGUgKDpwYXJhbXMgZm9ybSkpfSlcbihpbnN0YWxsLXdyaXRlciEgOmludm9rZSB3cml0ZS1pbnZva2UpXG5cbihkZWZuIHdyaXRlLXZlY3RvclxuICBbZm9ybV1cbiAgezp0eXBlIDpBcnJheUV4cHJlc3Npb25cbiAgIDplbGVtZW50cyAobWFwIHdyaXRlICg6aXRlbXMgZm9ybSkpfSlcbihpbnN0YWxsLXdyaXRlciEgOnZlY3RvciB3cml0ZS12ZWN0b3IpXG5cbihkZWZuIHdyaXRlLWRpY3Rpb25hcnlcbiAgW2Zvcm1dXG4gIChsZXQgW3Byb3BlcnRpZXMgKHBhcnRpdGlvbiAyIChpbnRlcmxlYXZlICg6a2V5cyBmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoOnZhbHVlcyBmb3JtKSkpXVxuICAgIHs6dHlwZSA6T2JqZWN0RXhwcmVzc2lvblxuICAgICA6cHJvcGVydGllcyAobWFwIChmbiBbcGFpcl1cbiAgICAgICAgICAgICAgICAgICAgICAgIChsZXQgW2tleSAoZmlyc3QgcGFpcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIChzZWNvbmQgcGFpcildXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHs6a2luZCA6aW5pdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgOnR5cGUgOlByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5IChpZiAoPSA6c3ltYm9sICg6b3Aga2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAod3JpdGUtY29uc3RhbnQgKHN0ciAoOmZvcm0ga2V5KSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdyaXRlIGtleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA6dmFsdWUgKHdyaXRlIHZhbHVlKX0pKVxuICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXMpfSkpXG4oaW5zdGFsbC13cml0ZXIhIDpkaWN0aW9uYXJ5IHdyaXRlLWRpY3Rpb25hcnkpXG5cbihkZWZuIHdyaXRlLWV4cG9ydFxuICBbZm9ybV1cbiAgKHdyaXRlIHs6b3AgOnNldCFcbiAgICAgICAgICA6dGFyZ2V0IHs6b3AgOm1lbWJlci1leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgOmNvbXB1dGVkIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgOnRhcmdldCB7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAod2l0aC1tZXRhICdleHBvcnRzIChtZXRhICg6Zm9ybSAoOmlkIGZvcm0pKSkpfVxuICAgICAgICAgICAgICAgICAgIDpwcm9wZXJ0eSAoOmlkIGZvcm0pXG4gICAgICAgICAgICAgICAgICAgOmZvcm0gKDpmb3JtICg6aWQgZm9ybSkpfVxuICAgICAgICAgIDp2YWx1ZSAoOmluaXQgZm9ybSlcbiAgICAgICAgICA6Zm9ybSAoOmZvcm0gKDppZCBmb3JtKSl9KSlcblxuKGRlZm4gd3JpdGUtZGVmXG4gIFtmb3JtXVxuICAoY29uaiB7OnR5cGUgOlZhcmlhYmxlRGVjbGFyYXRpb25cbiAgICAgICAgIDpraW5kIDp2YXJcbiAgICAgICAgIDpkZWNsYXJhdGlvbnMgWyhjb25qIHs6dHlwZSA6VmFyaWFibGVEZWNsYXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmlkICh3cml0ZSAoOmlkIGZvcm0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDppbml0IChjb25qIChpZiAoOmV4cG9ydCBmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdyaXRlLWV4cG9ydCBmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdyaXRlIChvciAoOmluaXQgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHdpdGgtbWV0YSAnKHZvaWQgMCkgKG1ldGEgKDppZCBmb3JtKSkpKSkpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh3cml0ZS1sb2NhdGlvbiAoOmZvcm0gKDppZCBmb3JtKSkpKV19XG4gICAgICAgICh3cml0ZS1sb2NhdGlvbiAoOmZvcm0gZm9ybSkgKDpvcmlnaW5hbC1mb3JtIGZvcm0pKSkpXG4oaW5zdGFsbC13cml0ZXIhIDpkZWYgd3JpdGUtZGVmKVxuXG4oZGVmbiB3cml0ZS1iaW5kaW5nXG4gIFtmb3JtXVxuICAobGV0IFtpZCAod3JpdGUtYmluZGluZy12YXIgZm9ybSlcbiAgICAgICAgaW5pdCAod3JpdGUgKDppbml0IGZvcm0pKV1cbiAgICB7OnR5cGUgOlZhcmlhYmxlRGVjbGFyYXRpb25cbiAgICAgOmtpbmQgOnZhclxuICAgICA6bG9jIChpbmhlcml0LWxvY2F0aW9uIFtpZCBpbml0XSlcbiAgICAgOmRlY2xhcmF0aW9ucyBbezp0eXBlIDpWYXJpYWJsZURlY2xhcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgIDppZCBpZFxuICAgICAgICAgICAgICAgICAgICAgOmluaXQgaW5pdH1dfSkpXG4oaW5zdGFsbC13cml0ZXIhIDpiaW5kaW5nIHdyaXRlLWJpbmRpbmcpXG5cbihkZWZuIHdyaXRlLXRocm93XG4gIFtmb3JtXVxuICAoLT5leHByZXNzaW9uIChjb25qIHs6dHlwZSA6VGhyb3dTdGF0ZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgOmFyZ3VtZW50ICh3cml0ZSAoOnRocm93IGZvcm0pKX1cbiAgICAgICAgICAgICAgICAgICAgICAod3JpdGUtbG9jYXRpb24gKDpmb3JtIGZvcm0pICg6b3JpZ2luYWwtZm9ybSBmb3JtKSkpKSlcbihpbnN0YWxsLXdyaXRlciEgOnRocm93IHdyaXRlLXRocm93KVxuXG4oZGVmbiB3cml0ZS1uZXdcbiAgW2Zvcm1dXG4gIHs6dHlwZSA6TmV3RXhwcmVzc2lvblxuICAgOmNhbGxlZSAod3JpdGUgKDpjb25zdHJ1Y3RvciBmb3JtKSlcbiAgIDphcmd1bWVudHMgKG1hcCB3cml0ZSAoOnBhcmFtcyBmb3JtKSl9KVxuKGluc3RhbGwtd3JpdGVyISA6bmV3IHdyaXRlLW5ldylcblxuKGRlZm4gd3JpdGUtc2V0IVxuICBbZm9ybV1cbiAgezp0eXBlIDpBc3NpZ25tZW50RXhwcmVzc2lvblxuICAgOm9wZXJhdG9yIDo9XG4gICA6bGVmdCAod3JpdGUgKDp0YXJnZXQgZm9ybSkpXG4gICA6cmlnaHQgKHdyaXRlICg6dmFsdWUgZm9ybSkpfSlcbihpbnN0YWxsLXdyaXRlciEgOnNldCEgd3JpdGUtc2V0ISlcblxuKGRlZm4gd3JpdGUtYWdldFxuICBbZm9ybV1cbiAgezp0eXBlIDpNZW1iZXJFeHByZXNzaW9uXG4gICA6Y29tcHV0ZWQgKDpjb21wdXRlZCBmb3JtKVxuICAgOm9iamVjdCAod3JpdGUgKDp0YXJnZXQgZm9ybSkpXG4gICA6cHJvcGVydHkgKHdyaXRlICg6cHJvcGVydHkgZm9ybSkpfSlcbihpbnN0YWxsLXdyaXRlciEgOm1lbWJlci1leHByZXNzaW9uIHdyaXRlLWFnZXQpXG5cbjs7IE1hcCBvZiBzdGF0ZW1lbnQgQVNUIG5vZGUgdGhhdCBhcmUgZ2VuZXJhdGVkXG47OyBieSBhIHdyaXRlci4gVXNlZCB0byBkZWNldCB3ZWF0aGVyIG5vZGUgaXNcbjs7IHN0YXRlbWVudCBvciBleHByZXNzaW9uLlxuKGRlZiAqKnN0YXRlbWVudHMqKiB7OkVtcHR5U3RhdGVtZW50IHRydWUgOkJsb2NrU3RhdGVtZW50IHRydWVcbiAgICAgICAgICAgICAgICAgICAgIDpFeHByZXNzaW9uU3RhdGVtZW50IHRydWUgOklmU3RhdGVtZW50IHRydWVcbiAgICAgICAgICAgICAgICAgICAgIDpMYWJlbGVkU3RhdGVtZW50IHRydWUgOkJyZWFrU3RhdGVtZW50IHRydWVcbiAgICAgICAgICAgICAgICAgICAgIDpDb250aW51ZVN0YXRlbWVudCB0cnVlIDpTd2l0Y2hTdGF0ZW1lbnQgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgOlJldHVyblN0YXRlbWVudCB0cnVlIDpUaHJvd1N0YXRlbWVudCB0cnVlXG4gICAgICAgICAgICAgICAgICAgICA6VHJ5U3RhdGVtZW50IHRydWUgOldoaWxlU3RhdGVtZW50IHRydWVcbiAgICAgICAgICAgICAgICAgICAgIDpEb1doaWxlU3RhdGVtZW50IHRydWUgOkZvclN0YXRlbWVudCB0cnVlXG4gICAgICAgICAgICAgICAgICAgICA6Rm9ySW5TdGF0ZW1lbnQgdHJ1ZSA6Rm9yT2ZTdGF0ZW1lbnQgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgOkxldFN0YXRlbWVudCB0cnVlIDpWYXJpYWJsZURlY2xhcmF0aW9uIHRydWVcbiAgICAgICAgICAgICAgICAgICAgIDpGdW5jdGlvbkRlY2xhcmF0aW9uIHRydWV9KVxuXG4oZGVmbiB3cml0ZS1zdGF0ZW1lbnRcbiAgXCJXcmFwcyBleHByZXNzaW9uIHRoYXQgY2FuJ3QgYmUgaW4gYSBibG9jayBzdGF0ZW1lbnRcbiAgYm9keSBpbnRvIDpFeHByZXNzaW9uU3RhdGVtZW50IG90aGVyd2lzZSByZXR1cm5zIGJhY2tcbiAgZXhwcmVzc2lvbi5cIlxuICBbZm9ybV1cbiAgKC0+c3RhdGVtZW50ICh3cml0ZSBmb3JtKSkpXG5cbihkZWZuIC0+c3RhdGVtZW50XG4gIFtub2RlXVxuICAoaWYgKGdldCAqKnN0YXRlbWVudHMqKiAoOnR5cGUgbm9kZSkpXG4gICAgbm9kZVxuICAgIHs6dHlwZSA6RXhwcmVzc2lvblN0YXRlbWVudFxuICAgICA6ZXhwcmVzc2lvbiBub2RlXG4gICAgIDpsb2MgKDpsb2Mgbm9kZSlcbiAgICAgfSkpXG5cbihkZWZuIC0+cmV0dXJuXG4gIFtmb3JtXVxuICAoY29uaiB7OnR5cGUgOlJldHVyblN0YXRlbWVudFxuICAgICAgICAgOmFyZ3VtZW50ICh3cml0ZSBmb3JtKX1cbiAgICAgICAgKHdyaXRlLWxvY2F0aW9uICg6Zm9ybSBmb3JtKSAoOm9yaWdpbmFsLWZvcm0gZm9ybSkpKSlcblxuKGRlZm4gd3JpdGUtYm9keVxuICBcIlRha2VzIGZvcm0gdGhhdCBtYXkgY29udGFpbiBgOnN0YXRlbWVudHNgIHZlY3RvclxuICBvciBgOnJlc3VsdGAgZm9ybSAgYW5kIHJldHVybnMgdmVjdG9yIGV4cHJlc3Npb25cbiAgbm9kZXMgdGhhdCBjYW4gYmUgdXNlZCBpbiBhbnkgYmxvY2suIElmIGA6cmVzdWx0YFxuICBpcyBwcmVzZW50IGl0IHdpbGwgYmUgYSBsYXN0IGluIHZlY3RvciBhbmQgb2YgYVxuICBgOlJldHVyblN0YXRlbWVudGAgdHlwZS5cbiAgRXhhbXBsZXM6XG5cblxuICAod3JpdGUtYm9keSB7OnN0YXRlbWVudHMgbmlsXG4gICAgICAgICAgICAgICA6cmVzdWx0IHs6b3AgOmNvbnN0YW50XG4gICAgICAgICAgICAgICAgICAgICAgICA6dHlwZSA6bnVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAzfX0pXG4gIDs7ID0+XG4gIFt7OnR5cGUgOlJldHVyblN0YXRlbWVudFxuICAgIDphcmd1bWVudCB7OnR5cGUgOkxpdGVyYWwgOnZhbHVlIDN9fV1cblxuICAod3JpdGUtYm9keSB7OnN0YXRlbWVudHMgW3s6b3AgOnNldCFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnRhcmdldCB7Om9wIDp2YXIgOmZvcm0gJ3h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp2YWx1ZSB7Om9wIDp2YXIgOmZvcm0gJ3l9fV1cbiAgICAgICAgICAgICAgIDpyZXN1bHQgezpvcCA6dmFyIDpmb3JtICd4fX0pXG4gIDs7ID0+XG4gIFt7OnR5cGUgOkV4cHJlc3Npb25TdGF0ZW1lbnRcbiAgICA6ZXhwcmVzc2lvbiB7OnR5cGUgOkFzc2lnbm1lbnRFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgIDpvcGVyYXRvciA6PVxuICAgICAgICAgICAgICAgICA6bGVmdCB7OnR5cGUgOklkZW50aWZpZXIgOm5hbWUgOnh9XG4gICAgICAgICAgICAgICAgIDpyaWdodCB7OnR5cGUgOklkZW50aWZpZXIgOm5hbWUgOnl9fX1cbiAgIHs6dHlwZSA6UmV0dXJuU3RhdGVtZW50XG4gICAgOmFyZ3VtZW50IHs6dHlwZSA6SWRlbnRpZmllciA6bmFtZSA6eH19XVwiXG4gIFtmb3JtXVxuICAobGV0IFtzdGF0ZW1lbnRzIChtYXAgd3JpdGUtc3RhdGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAob3IgKDpzdGF0ZW1lbnRzIGZvcm0pIFtdKSlcbiAgICAgICAgcmVzdWx0IChpZiAoOnJlc3VsdCBmb3JtKVxuICAgICAgICAgICAgICAgICAoLT5yZXR1cm4gKDpyZXN1bHQgZm9ybSkpKV1cblxuICAgIChpZiByZXN1bHRcbiAgICAgIChjb25qIHN0YXRlbWVudHMgcmVzdWx0KVxuICAgICAgc3RhdGVtZW50cykpKVxuXG4oZGVmbiAtPmJsb2NrXG4gIFtib2R5XVxuICAoaWYgKHZlY3Rvcj8gYm9keSlcbiAgICB7OnR5cGUgOkJsb2NrU3RhdGVtZW50XG4gICAgIDpib2R5IGJvZHlcbiAgICAgOmxvYyAoaW5oZXJpdC1sb2NhdGlvbiBib2R5KX1cbiAgICB7OnR5cGUgOkJsb2NrU3RhdGVtZW50XG4gICAgIDpib2R5IFtib2R5XVxuICAgICA6bG9jICg6bG9jIGJvZHkpfSkpXG5cbihkZWZuIC0+ZXhwcmVzc2lvblxuICBbJiBib2R5XVxuICB7OnR5cGUgOkNhbGxFeHByZXNzaW9uXG4gICA6YXJndW1lbnRzIFtdXG4gICA6bG9jIChpbmhlcml0LWxvY2F0aW9uIGJvZHkpXG4gICA6Y2FsbGVlICgtPnNlcXVlbmNlIFt7OnR5cGUgOkZ1bmN0aW9uRXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgIDppZCBuaWxcbiAgICAgICAgICAgICAgICAgICAgICAgICA6cGFyYW1zIFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgOmRlZmF1bHRzIFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgOmV4cHJlc3Npb24gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICA6Z2VuZXJhdG9yIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgOnJlc3QgbmlsXG4gICAgICAgICAgICAgICAgICAgICAgICAgOmJvZHkgKC0+YmxvY2sgYm9keSl9XSl9KVxuXG4oZGVmbiB3cml0ZS1kb1xuICBbZm9ybV1cbiAgKGFwcGx5IC0+ZXhwcmVzc2lvbiAod3JpdGUtYm9keSBmb3JtKSkpXG4oaW5zdGFsbC13cml0ZXIhIDpkbyB3cml0ZS1kbylcblxuKGRlZm4gd3JpdGUtaWZcbiAgW2Zvcm1dXG4gIHs6dHlwZSA6Q29uZGl0aW9uYWxFeHByZXNzaW9uXG4gICA6dGVzdCAod3JpdGUgKDp0ZXN0IGZvcm0pKVxuICAgOmNvbnNlcXVlbnQgKHdyaXRlICg6Y29uc2VxdWVudCBmb3JtKSlcbiAgIDphbHRlcm5hdGUgKHdyaXRlICg6YWx0ZXJuYXRlIGZvcm0pKX0pXG4oaW5zdGFsbC13cml0ZXIhIDppZiB3cml0ZS1pZilcblxuKGRlZm4gd3JpdGUtdHJ5XG4gIFtmb3JtXVxuICAobGV0IFtoYW5kbGVyICg6aGFuZGxlciBmb3JtKVxuICAgICAgICBmaW5hbGl6ZXIgKDpmaW5hbGl6ZXIgZm9ybSldXG4gICAgKC0+ZXhwcmVzc2lvbiAoY29uaiB7OnR5cGUgOlRyeVN0YXRlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgIDpndWFyZGVkSGFuZGxlcnMgW11cbiAgICAgICAgICAgICAgICAgICAgICAgICA6YmxvY2sgKC0+YmxvY2sgKHdyaXRlLWJvZHkgKDpib2R5IGZvcm0pKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICA6aGFuZGxlcnMgKGlmIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbezp0eXBlIDpDYXRjaENsYXVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnBhcmFtICh3cml0ZSAoOm5hbWUgaGFuZGxlcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Ym9keSAoLT5ibG9jayAod3JpdGUtYm9keSBoYW5kbGVyKSl9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdKVxuICAgICAgICAgICAgICAgICAgICAgICAgIDpmaW5hbGl6ZXIgKGNvbmQgZmluYWxpemVyICgtPmJsb2NrICh3cml0ZS1ib2R5IGZpbmFsaXplcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobm90IGhhbmRsZXIpICgtPmJsb2NrIFtdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmVsc2UgbmlsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICh3cml0ZS1sb2NhdGlvbiAoOmZvcm0gZm9ybSkgKDpvcmlnaW5hbC1mb3JtIGZvcm0pKSkpKSlcbihpbnN0YWxsLXdyaXRlciEgOnRyeSB3cml0ZS10cnkpXG5cbihkZWZuLSB3cml0ZS1iaW5kaW5nLXZhbHVlXG4gIFtmb3JtXVxuICAod3JpdGUgKDppbml0IGZvcm0pKSlcblxuKGRlZm4tIHdyaXRlLWJpbmRpbmctcGFyYW1cbiAgW2Zvcm1dXG4gICh3cml0ZS12YXIgezpmb3JtICg6bmFtZSBmb3JtKX0pKVxuXG4oZGVmbiB3cml0ZS1iaW5kaW5nXG4gIFtmb3JtXVxuICAod3JpdGUgezpvcCA6ZGVmXG4gICAgICAgICAgOnZhciBmb3JtXG4gICAgICAgICAgOmluaXQgKDppbml0IGZvcm0pXG4gICAgICAgICAgOmZvcm0gZm9ybX0pKVxuXG4oZGVmbiB3cml0ZS1sZXRcbiAgW2Zvcm1dXG4gIChsZXQgW2JvZHkgKGNvbmogZm9ybVxuICAgICAgICAgICAgICAgICAgIHs6c3RhdGVtZW50cyAodmVjIChjb25jYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDpiaW5kaW5ncyBmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoOnN0YXRlbWVudHMgZm9ybSkpKX0pXVxuICAgICgtPmlpZmUgKC0+YmxvY2sgKHdyaXRlLWJvZHkgYm9keSkpKSkpXG4oaW5zdGFsbC13cml0ZXIhIDpsZXQgd3JpdGUtbGV0KVxuXG4oZGVmbiAtPnJlYmluZFxuICBbZm9ybV1cbiAgKGxvb3AgW3Jlc3VsdCBbXVxuICAgICAgICAgYmluZGluZ3MgKDpiaW5kaW5ncyBmb3JtKV1cbiAgICAoaWYgKGVtcHR5PyBiaW5kaW5ncylcbiAgICAgIHJlc3VsdFxuICAgICAgKHJlY3VyIChjb25qIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgIHs6dHlwZSA6QXNzaWdubWVudEV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgOm9wZXJhdG9yIDo9XG4gICAgICAgICAgICAgICAgICAgIDpsZWZ0ICh3cml0ZS1iaW5kaW5nLXZhciAoZmlyc3QgYmluZGluZ3MpKVxuICAgICAgICAgICAgICAgICAgICA6cmlnaHQgezp0eXBlIDpNZW1iZXJFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOmNvbXB1dGVkIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6b2JqZWN0IHs6dHlwZSA6SWRlbnRpZmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpuYW1lIDpsb29wfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpwcm9wZXJ0eSB7OnR5cGUgOkxpdGVyYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp2YWx1ZSAoY291bnQgcmVzdWx0KX19fSlcbiAgICAgICAgICAgICAocmVzdCBiaW5kaW5ncykpKSkpXG5cbihkZWZuIC0+c2VxdWVuY2VcbiAgW2V4cHJlc3Npb25zXVxuICB7OnR5cGUgOlNlcXVlbmNlRXhwcmVzc2lvblxuICAgOmV4cHJlc3Npb25zIGV4cHJlc3Npb25zfSlcblxuKGRlZm4gLT5paWZlXG4gIFtib2R5IGlkXVxuICB7OnR5cGUgOkNhbGxFeHByZXNzaW9uXG4gICA6YXJndW1lbnRzIFt7OnR5cGUgOlRoaXNFeHByZXNzaW9ufV1cbiAgIDpjYWxsZWUgezp0eXBlIDpNZW1iZXJFeHByZXNzaW9uXG4gICAgICAgICAgICA6Y29tcHV0ZWQgZmFsc2VcbiAgICAgICAgICAgIDpvYmplY3Qgezp0eXBlIDpGdW5jdGlvbkV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgIDppZCBpZFxuICAgICAgICAgICAgICAgICAgICAgOnBhcmFtcyBbXVxuICAgICAgICAgICAgICAgICAgICAgOmRlZmF1bHRzIFtdXG4gICAgICAgICAgICAgICAgICAgICA6ZXhwcmVzc2lvbiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgOmdlbmVyYXRvciBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgOnJlc3QgbmlsXG4gICAgICAgICAgICAgICAgICAgICA6Ym9keSBib2R5fVxuICAgICAgICAgICAgOnByb3BlcnR5IHs6dHlwZSA6SWRlbnRpZmllclxuICAgICAgICAgICAgICAgICAgICAgICA6bmFtZSA6Y2FsbH19fSlcblxuKGRlZm4gLT5sb29wLWluaXRcbiAgW11cbiAgezp0eXBlIDpWYXJpYWJsZURlY2xhcmF0aW9uXG4gICA6a2luZCA6dmFyXG4gICA6ZGVjbGFyYXRpb25zIFt7OnR5cGUgOlZhcmlhYmxlRGVjbGFyYXRvclxuICAgICAgICAgICAgICAgICAgIDppZCB7OnR5cGUgOklkZW50aWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIDpuYW1lIDpyZWN1cn1cbiAgICAgICAgICAgICAgICAgICA6aW5pdCB7OnR5cGUgOklkZW50aWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOm5hbWUgOmxvb3B9fV19KVxuXG4oZGVmbiAtPmRvLXdoaWxlXG4gW2JvZHkgdGVzdF1cbiB7OnR5cGUgOkRvV2hpbGVTdGF0ZW1lbnRcbiAgOmJvZHkgYm9keVxuICA6dGVzdCB0ZXN0fSlcblxuKGRlZm4gLT5zZXQhLXJlY3VyXG4gIFtmb3JtXVxuICB7OnR5cGUgOkFzc2lnbm1lbnRFeHByZXNzaW9uXG4gICA6b3BlcmF0b3IgOj1cbiAgIDpsZWZ0IHs6dHlwZSA6SWRlbnRpZmllciA6bmFtZSA6cmVjdXJ9XG4gICA6cmlnaHQgKHdyaXRlIGZvcm0pfSlcblxuKGRlZm4gLT5sb29wXG4gIFtmb3JtXVxuICAoLT5zZXF1ZW5jZSAoY29uaiAoLT5yZWJpbmQgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgezp0eXBlIDpCaW5hcnlFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICA6b3BlcmF0b3IgOj09PVxuICAgICAgICAgICAgICAgICAgICAgOmxlZnQgezp0eXBlIDpJZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOm5hbWUgOnJlY3VyfVxuICAgICAgICAgICAgICAgICAgICAgOnJpZ2h0IHs6dHlwZSA6SWRlbnRpZmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6bmFtZSA6bG9vcH19KSkpXG5cblxuKGRlZm4gd3JpdGUtbG9vcFxuICBbZm9ybV1cbiAgKGxldCBbc3RhdGVtZW50cyAoOnN0YXRlbWVudHMgZm9ybSlcbiAgICAgICAgcmVzdWx0ICg6cmVzdWx0IGZvcm0pXG4gICAgICAgIGJpbmRpbmdzICg6YmluZGluZ3MgZm9ybSlcblxuICAgICAgICBsb29wLWJvZHkgKGNvbmogKG1hcCB3cml0ZS1zdGF0ZW1lbnQgc3RhdGVtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICgtPnN0YXRlbWVudCAoLT5zZXQhLXJlY3VyIHJlc3VsdCkpKVxuICAgICAgICBib2R5IChjb25jYXQgWyhcbiAgICAgICAgICAgICAgICAgICAgICAgLT5sb29wLWluaXQpXVxuICAgICAgICAgICAgICAgICAgICAgKG1hcCB3cml0ZSBiaW5kaW5ncylcbiAgICAgICAgICAgICAgICAgICAgIFsoLT5kby13aGlsZSAoLT5ibG9jayAodmVjIGxvb3AtYm9keSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKC0+bG9vcCBmb3JtKSldXG4gICAgICAgICAgICAgICAgICAgICBbezp0eXBlIDpSZXR1cm5TdGF0ZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgOmFyZ3VtZW50IHs6dHlwZSA6SWRlbnRpZmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpuYW1lIDpyZWN1cn19XSldXG4gICAgKC0+aWlmZSAoLT5ibG9jayAodmVjIGJvZHkpKSAnbG9vcCkpKVxuKGluc3RhbGwtd3JpdGVyISA6bG9vcCB3cml0ZS1sb29wKVxuXG4oZGVmbiAtPnJlY3VyXG4gIFtmb3JtXVxuICAobG9vcCBbcmVzdWx0IFtdXG4gICAgICAgICBwYXJhbXMgKDpwYXJhbXMgZm9ybSldXG4gICAgKGlmIChlbXB0eT8gcGFyYW1zKVxuICAgICAgcmVzdWx0XG4gICAgICAocmVjdXIgKGNvbmogcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgezp0eXBlIDpBc3NpZ25tZW50RXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICA6b3BlcmF0b3IgOj1cbiAgICAgICAgICAgICAgICAgICAgOnJpZ2h0ICh3cml0ZSAoZmlyc3QgcGFyYW1zKSlcbiAgICAgICAgICAgICAgICAgICAgOmxlZnQgezp0eXBlIDpNZW1iZXJFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA6Y29tcHV0ZWQgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgOm9iamVjdCB7OnR5cGUgOklkZW50aWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpuYW1lIDpsb29wfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgOnByb3BlcnR5IHs6dHlwZSA6TGl0ZXJhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6dmFsdWUgKGNvdW50IHJlc3VsdCl9fX0pXG4gICAgICAgICAgICAgKHJlc3QgcGFyYW1zKSkpKSlcblxuKGRlZm4gd3JpdGUtcmVjdXJcbiAgW2Zvcm1dXG4gICgtPnNlcXVlbmNlIChjb25qICgtPnJlY3VyIGZvcm0pXG4gICAgICAgICAgICAgICAgICAgIHs6dHlwZSA6SWRlbnRpZmllclxuICAgICAgICAgICAgICAgICAgICAgOm5hbWUgOmxvb3B9KSkpXG4oaW5zdGFsbC13cml0ZXIhIDpyZWN1ciB3cml0ZS1yZWN1cilcblxuKGRlZm4gZmFsbGJhY2stb3ZlcmxvYWRcbiAgW11cbiAgezp0eXBlIDpTd2l0Y2hDYXNlXG4gICA6dGVzdCBuaWxcbiAgIDpjb25zZXF1ZW50IFt7OnR5cGUgOlRocm93U3RhdGVtZW50XG4gICAgICAgICAgICAgICAgIDphcmd1bWVudCB7OnR5cGUgOkNhbGxFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOmNhbGxlZSB7OnR5cGUgOklkZW50aWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6bmFtZSA6UmFuZ2VFcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6YXJndW1lbnRzIFt7OnR5cGUgOkxpdGVyYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnZhbHVlIFwiV3JvbmcgbnVtYmVyIG9mIGFyZ3VtZW50cyBwYXNzZWRcIn1dfX1dfSlcblxuKGRlZm4gc3BsaWNlLWJpbmRpbmdcbiAgW2Zvcm1dXG4gIHs6b3AgOmRlZlxuICAgOmlkIChsYXN0ICg6cGFyYW1zIGZvcm0pKVxuICAgOmluaXQgezpvcCA6aW52b2tlXG4gICAgICAgICAgOmNhbGxlZSB7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICA6Zm9ybSAnQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGx9XG4gICAgICAgICAgOnBhcmFtcyBbezpvcCA6dmFyXG4gICAgICAgICAgICAgICAgICAgIDpmb3JtICdhcmd1bWVudHN9XG4gICAgICAgICAgICAgICAgICAgezpvcCA6Y29uc3RhbnRcbiAgICAgICAgICAgICAgICAgICAgOmZvcm0gKDphcml0eSBmb3JtKVxuICAgICAgICAgICAgICAgICAgICA6dHlwZSA6bnVtYmVyfV19fSlcblxuKGRlZm4gd3JpdGUtb3ZlcmxvYWRpbmctcGFyYW1zXG4gIFtwYXJhbXNdXG4gIChyZWR1Y2UgKGZuIFtmb3JtcyBwYXJhbV1cbiAgICAgICAgICAgIChjb25qIGZvcm1zIHs6b3AgOmRlZlxuICAgICAgICAgICAgICAgICAgICAgICAgIDppZCBwYXJhbVxuICAgICAgICAgICAgICAgICAgICAgICAgIDppbml0IHs6b3AgOm1lbWJlci1leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpjb21wdXRlZCB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp0YXJnZXQgezpvcCA6dmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICdhcmd1bWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpwcm9wZXJ0eSB7Om9wIDpjb25zdGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp0eXBlIDpudW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAoY291bnQgZm9ybXMpfX19KSlcbiAgICAgICAgICBbXVxuICAgICAgICAgIHBhcmFtcykpXG5cbihkZWZuIHdyaXRlLW92ZXJsb2FkaW5nLWZuXG4gIFtmb3JtXVxuICAobGV0IFtvdmVybG9hZHMgKG1hcCB3cml0ZS1mbi1vdmVybG9hZCAoOm1ldGhvZHMgZm9ybSkpXVxuICAgIHs6cGFyYW1zIFtdXG4gICAgIDpib2R5ICgtPmJsb2NrIHs6dHlwZSA6U3dpdGNoU3RhdGVtZW50XG4gICAgICAgICAgICAgICAgICAgICA6ZGlzY3JpbWluYW50IHs6dHlwZSA6TWVtYmVyRXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmNvbXB1dGVkIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6b2JqZWN0IHs6dHlwZSA6SWRlbnRpZmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOm5hbWUgOmFyZ3VtZW50c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpwcm9wZXJ0eSB7OnR5cGUgOklkZW50aWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOm5hbWUgOmxlbmd0aH19XG4gICAgICAgICAgICAgICAgICAgICA6Y2FzZXMgKGlmICg6dmFyaWFkaWMgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsb2Fkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvbmogb3ZlcmxvYWRzIChmYWxsYmFjay1vdmVybG9hZCkpKX0pfSkpXG5cbihkZWZuIHdyaXRlLWZuLW92ZXJsb2FkXG4gIFtmb3JtXVxuICAobGV0IFtwYXJhbXMgKDpwYXJhbXMgZm9ybSlcbiAgICAgICAgYmluZGluZ3MgKGlmICg6dmFyaWFkaWMgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAoY29uaiAod3JpdGUtb3ZlcmxvYWRpbmctcGFyYW1zIChidXRsYXN0IHBhcmFtcykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgKHNwbGljZS1iaW5kaW5nIGZvcm0pKVxuICAgICAgICAgICAgICAgICAgICh3cml0ZS1vdmVybG9hZGluZy1wYXJhbXMgcGFyYW1zKSlcbiAgICAgICAgc3RhdGVtZW50cyAodmVjIChjb25jYXQgYmluZGluZ3MgKDpzdGF0ZW1lbnRzIGZvcm0pKSldXG4gICAgezp0eXBlIDpTd2l0Y2hDYXNlXG4gICAgIDp0ZXN0IChpZiAobm90ICg6dmFyaWFkaWMgZm9ybSkpXG4gICAgICAgICAgICAgezp0eXBlIDpMaXRlcmFsXG4gICAgICAgICAgICAgIDp2YWx1ZSAoOmFyaXR5IGZvcm0pfSlcbiAgICAgOmNvbnNlcXVlbnQgKHdyaXRlLWJvZHkgKGNvbmogZm9ybSB7OnN0YXRlbWVudHMgc3RhdGVtZW50c30pKX0pKVxuXG4oZGVmbiB3cml0ZS1zaW1wbGUtZm5cbiAgW2Zvcm1dXG4gIChsZXQgW21ldGhvZCAoZmlyc3QgKDptZXRob2RzIGZvcm0pKVxuICAgICAgICBwYXJhbXMgKGlmICg6dmFyaWFkaWMgbWV0aG9kKVxuICAgICAgICAgICAgICAgICAoYnV0bGFzdCAoOnBhcmFtcyBtZXRob2QpKVxuICAgICAgICAgICAgICAgICAoOnBhcmFtcyBtZXRob2QpKVxuICAgICAgICBib2R5IChpZiAoOnZhcmlhZGljIG1ldGhvZClcbiAgICAgICAgICAgICAgIChjb25qIG1ldGhvZFxuICAgICAgICAgICAgICAgICAgICAgezpzdGF0ZW1lbnRzICh2ZWMgKGNvbnMgKHNwbGljZS1iaW5kaW5nIG1ldGhvZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICg6c3RhdGVtZW50cyBtZXRob2QpKSl9KVxuICAgICAgICAgICAgICAgbWV0aG9kKV1cbiAgICB7OnBhcmFtcyAobWFwIHdyaXRlLXZhciBwYXJhbXMpXG4gICAgIDpib2R5ICgtPmJsb2NrICh3cml0ZS1ib2R5IGJvZHkpKX0pKVxuXG4oZGVmbiByZXNvbHZlXG4gIFtmcm9tIHRvXVxuICAobGV0IFtyZXF1aXJlciAoc3BsaXQgKG5hbWUgZnJvbSkgXFwuKVxuICAgICAgICByZXF1aXJlbWVudCAoc3BsaXQgKG5hbWUgdG8pIFxcLilcbiAgICAgICAgcmVsYXRpdmU/IChhbmQgKG5vdCAoaWRlbnRpY2FsPyAobmFtZSBmcm9tKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChuYW1lIHRvKSkpXG4gICAgICAgICAgICAgICAgICAgICAgIChpZGVudGljYWw/IChmaXJzdCByZXF1aXJlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGZpcnN0IHJlcXVpcmVtZW50KSkpXVxuICAgIChpZiByZWxhdGl2ZT9cbiAgICAgIChsb29wIFtmcm9tIHJlcXVpcmVyXG4gICAgICAgICAgICAgdG8gcmVxdWlyZW1lbnRdXG4gICAgICAgIChpZiAoaWRlbnRpY2FsPyAoZmlyc3QgZnJvbSlcbiAgICAgICAgICAgICAgICAgICAgICAgIChmaXJzdCB0bykpXG4gICAgICAgICAgKHJlY3VyIChyZXN0IGZyb20pIChyZXN0IHRvKSlcbiAgICAgICAgICAoam9pbiBcXC9cbiAgICAgICAgICAgICAgICAoY29uY2F0IFtcXC5dXG4gICAgICAgICAgICAgICAgICAgICAgICAocmVwZWF0IChkZWMgKGNvdW50IGZyb20pKSBcIi4uXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB0bykpKSlcbiAgICAgIChqb2luIFxcLyByZXF1aXJlbWVudCkpKSlcblxuKGRlZm4gaWQtPm5zXG4gIFwiVGFrZXMgbmFtZXNwYWNlIGlkZW50aWZpZXIgc3ltYm9sIGFuZCB0cmFuc2xhdGVzIHRvIG5ld1xuICBzaW1ib2wgd2l0aG91dCAuIHNwZWNpYWwgY2hhcmFjdGVyc1xuICB3aXNwLmNvcmUgLT4gd2lzcCpjb3JlXCJcbiAgW2lkXVxuICAoc3ltYm9sIG5pbCAoam9pbiBcXCogKHNwbGl0IChuYW1lIGlkKSBcXC4pKSkpXG5cblxuKGRlZm4gd3JpdGUtcmVxdWlyZVxuICBbZm9ybSByZXF1aXJlcl1cbiAgKGxldCBbbnMtYmluZGluZyB7Om9wIDpkZWZcbiAgICAgICAgICAgICAgICAgICAgOmlkIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgIDp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gKGlkLT5ucyAoOm5zIGZvcm0pKX1cbiAgICAgICAgICAgICAgICAgICAgOmluaXQgezpvcCA6aW52b2tlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA6Y2FsbGVlIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnR5cGUgOmlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICdyZXF1aXJlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgOnBhcmFtcyBbezpvcCA6Y29uc3RhbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAocmVzb2x2ZSByZXF1aXJlciAoOm5zIGZvcm0pKX1dfX1cbiAgICAgICAgbnMtYWxpYXMgKGlmICg6YWxpYXMgZm9ybSlcbiAgICAgICAgICAgICAgICAgICB7Om9wIDpkZWZcbiAgICAgICAgICAgICAgICAgICAgOmlkIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgIDp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gKGlkLT5ucyAoOmFsaWFzIGZvcm0pKX1cbiAgICAgICAgICAgICAgICAgICAgOmluaXQgKDppZCBucy1iaW5kaW5nKX0pXG5cbiAgICAgICAgcmVmZXJlbmNlcyAocmVkdWNlIChmbiBbcmVmZXJlbmNlcyBmb3JtXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY29uaiByZWZlcmVuY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHs6b3AgOmRlZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmlkIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6dHlwZSA6aWRlbnRpZmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAob3IgKDpyZW5hbWUgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICg6bmFtZSBmb3JtKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6aW5pdCB7Om9wIDptZW1iZXItZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpjb21wdXRlZCBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp0YXJnZXQgKDppZCBucy1iaW5kaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpwcm9wZXJ0eSB7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAoOm5hbWUgZm9ybSl9fX0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICg6cmVmZXIgZm9ybSkpXVxuICAgICh2ZWMgKGNvbnMgbnMtYmluZGluZ1xuICAgICAgICAgICAgICAgKGlmIG5zLWFsaWFzXG4gICAgICAgICAgICAgICAgIChjb25zIG5zLWFsaWFzIHJlZmVyZW5jZXMpXG4gICAgICAgICAgICAgICAgIHJlZmVyZW5jZXMpKSkpKVxuXG4oZGVmbiB3cml0ZS1uc1xuICBbZm9ybV1cbiAgKGxldCBbbm9kZSAoOmZvcm0gZm9ybSlcbiAgICAgICAgcmVxdWlyZXIgKDpuYW1lIGZvcm0pXG4gICAgICAgIG5zLWJpbmRpbmcgezpvcCA6ZGVmXG4gICAgICAgICAgICAgICAgICAgIDpvcmlnaW5hbC1mb3JtIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgOmlkIHs6b3AgOnZhclxuICAgICAgICAgICAgICAgICAgICAgICAgIDp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgOm9yaWdpbmFsLWZvcm0gKGZpcnN0IG5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJypucyp9XG4gICAgICAgICAgICAgICAgICAgIDppbml0IHs6b3AgOmRpY3Rpb25hcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDprZXlzIFt7Om9wIDp2YXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnR5cGUgOmlkZW50aWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOm9yaWdpbmFsLWZvcm0gbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Zm9ybSAnaWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgezpvcCA6dmFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpvcmlnaW5hbC1mb3JtIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gJ2RvY31dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA6dmFsdWVzIFt7Om9wIDpjb25zdGFudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp0eXBlIDppZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOm9yaWdpbmFsLWZvcm0gKDpuYW1lIGZvcm0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOmZvcm0gKG5hbWUgKDpuYW1lIGZvcm0pKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHs6b3AgOmNvbnN0YW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOm9yaWdpbmFsLWZvcm0gbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpmb3JtICg6ZG9jIGZvcm0pfV19fVxuICAgICAgICByZXF1aXJlbWVudHMgKHZlYyAoYXBwbHkgY29uY2F0IChtYXAgIyh3cml0ZS1yZXF1aXJlICUgcmVxdWlyZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoOnJlcXVpcmUgZm9ybSkpKSldXG4gICAgKC0+YmxvY2sgKG1hcCB3cml0ZSAodmVjIChjb25zIG5zLWJpbmRpbmcgcmVxdWlyZW1lbnRzKSkpKSkpXG4oaW5zdGFsbC13cml0ZXIhIDpucyB3cml0ZS1ucylcblxuKGRlZm4gd3JpdGUtZm5cbiAgW2Zvcm1dXG4gIChsZXQgW2Jhc2UgKGlmICg+IChjb3VudCAoOm1ldGhvZHMgZm9ybSkpIDEpXG4gICAgICAgICAgICAgICAod3JpdGUtb3ZlcmxvYWRpbmctZm4gZm9ybSlcbiAgICAgICAgICAgICAgICh3cml0ZS1zaW1wbGUtZm4gZm9ybSkpXVxuICAgIChjb25qIGJhc2VcbiAgICAgICAgICB7OnR5cGUgOkZ1bmN0aW9uRXhwcmVzc2lvblxuICAgICAgICAgICA6aWQgKGlmICg6aWQgZm9ybSkgKHdyaXRlLXZhciAoOmlkIGZvcm0pKSlcbiAgICAgICAgICAgOmRlZmF1bHRzIG5pbFxuICAgICAgICAgICA6cmVzdCBuaWxcbiAgICAgICAgICAgOmdlbmVyYXRvciBmYWxzZVxuICAgICAgICAgICA6ZXhwcmVzc2lvbiBmYWxzZX0pKSlcbihpbnN0YWxsLXdyaXRlciEgOmZuIHdyaXRlLWZuKVxuXG4oZGVmbiB3cml0ZVxuICBbZm9ybV1cbiAgKGxldCBbb3AgKDpvcCBmb3JtKVxuICAgICAgICB3cml0ZXIgKGFuZCAoPSA6aW52b2tlICg6b3AgZm9ybSkpXG4gICAgICAgICAgICAgICAgICAgICg9IDp2YXIgKDpvcCAoOmNhbGxlZSBmb3JtKSkpXG4gICAgICAgICAgICAgICAgICAgIChnZXQgKipzcGVjaWFscyoqIChuYW1lICg6Zm9ybSAoOmNhbGxlZSBmb3JtKSkpKSldXG4gICAgKGlmIHdyaXRlclxuICAgICAgKHdyaXRlLXNwZWNpYWwgd3JpdGVyIGZvcm0pXG4gICAgICAod3JpdGUtb3AgKDpvcCBmb3JtKSBmb3JtKSkpKVxuXG4oZGVmbiB3cml0ZSpcbiAgWyYgZm9ybXNdXG4gIChsZXQgW2JvZHkgKG1hcCB3cml0ZS1zdGF0ZW1lbnQgZm9ybXMpXVxuICAgIHs6dHlwZSA6UHJvZ3JhbVxuICAgICA6Ym9keSBib2R5XG4gICAgIDpsb2MgKGluaGVyaXQtbG9jYXRpb24gYm9keSl9KSlcblxuXG4oZGVmbiBjb21waWxlXG4gIChbZm9ybV0gKGNvbXBpbGUge30gZm9ybSkpXG4gIChbb3B0aW9ucyAmIGZvcm1zXSAoZ2VuZXJhdGUgKGFwcGx5IHdyaXRlKiBmb3Jtcykgb3B0aW9ucykpKVxuXG5cbihkZWZuIGdldC1tYWNyb1xuICBbdGFyZ2V0IHByb3BlcnR5XVxuICBgKGFnZXQgKG9yIH50YXJnZXQgMClcbiAgICAgICAgIH5wcm9wZXJ0eSkpXG4oaW5zdGFsbC1tYWNybyEgOmdldCBnZXQtbWFjcm8pXG5cbjs7IExvZ2ljYWwgb3BlcmF0b3JzXG5cbihkZWZuIGluc3RhbGwtbG9naWNhbC1vcGVyYXRvciFcbiAgW2NhbGxlZSBvcGVyYXRvciBmYWxsYmFja11cbiAgKGRlZm4gd3JpdGUtbG9naWNhbC1vcGVyYXRvclxuICAgIFsmIG9wZXJhbmRzXVxuICAgIChsZXQgW24gKGNvdW50IG9wZXJhbmRzKV1cbiAgICAgIChjb25kICg9IG4gMCkgKHdyaXRlLWNvbnN0YW50IGZhbGxiYWNrKVxuICAgICAgICAgICAgKD0gbiAxKSAod3JpdGUgKGZpcnN0IG9wZXJhbmRzKSlcbiAgICAgICAgICAgIDplbHNlIChyZWR1Y2UgKGZuIFtsZWZ0IHJpZ2h0XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHs6dHlwZSA6TG9naWNhbEV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOm9wZXJhdG9yIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpsZWZ0IGxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOnJpZ2h0ICh3cml0ZSByaWdodCl9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAod3JpdGUgKGZpcnN0IG9wZXJhbmRzKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHJlc3Qgb3BlcmFuZHMpKSkpKVxuICAoaW5zdGFsbC1zcGVjaWFsISBjYWxsZWUgd3JpdGUtbG9naWNhbC1vcGVyYXRvcikpXG4oaW5zdGFsbC1sb2dpY2FsLW9wZXJhdG9yISA6b3IgOnx8IG5pbClcbihpbnN0YWxsLWxvZ2ljYWwtb3BlcmF0b3IhIDphbmQgOiYmIHRydWUpXG5cbihkZWZuIGluc3RhbGwtdW5hcnktb3BlcmF0b3IhXG4gIFtjYWxsZWUgb3BlcmF0b3IgcHJlZml4P11cbiAgKGRlZm4gd3JpdGUtdW5hcnktb3BlcmF0b3JcbiAgICBbJiBwYXJhbXNdXG4gICAgKGlmIChpZGVudGljYWw/IChjb3VudCBwYXJhbXMpIDEpXG4gICAgICB7OnR5cGUgOlVuYXJ5RXhwcmVzc2lvblxuICAgICAgIDpvcGVyYXRvciBvcGVyYXRvclxuICAgICAgIDphcmd1bWVudCAod3JpdGUgKGZpcnN0IHBhcmFtcykpXG4gICAgICAgOnByZWZpeCBwcmVmaXg/fVxuICAgICAgKGVycm9yLWFyZy1jb3VudCBjYWxsZWUgKGNvdW50IHBhcmFtcykpKSlcbiAgKGluc3RhbGwtc3BlY2lhbCEgY2FsbGVlIHdyaXRlLXVuYXJ5LW9wZXJhdG9yKSlcbihpbnN0YWxsLXVuYXJ5LW9wZXJhdG9yISA6bm90IDohKVxuXG47OyBCaXR3aXNlIE9wZXJhdG9yc1xuXG4oaW5zdGFsbC11bmFyeS1vcGVyYXRvciEgOmJpdC1ub3QgOn4pXG5cbihkZWZuIGluc3RhbGwtYmluYXJ5LW9wZXJhdG9yIVxuICBbY2FsbGVlIG9wZXJhdG9yXVxuICAoZGVmbiB3cml0ZS1iaW5hcnktb3BlcmF0b3JcbiAgICBbJiBwYXJhbXNdXG4gICAgKGlmICg8IChjb3VudCBwYXJhbXMpIDIpXG4gICAgICAoZXJyb3ItYXJnLWNvdW50IGNhbGxlZSAoY291bnQgcGFyYW1zKSlcbiAgICAgIChyZWR1Y2UgKGZuIFtsZWZ0IHJpZ2h0XVxuICAgICAgICAgICAgICAgIHs6dHlwZSA6QmluYXJ5RXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICA6b3BlcmF0b3Igb3BlcmF0b3JcbiAgICAgICAgICAgICAgICAgOmxlZnQgbGVmdFxuICAgICAgICAgICAgICAgICA6cmlnaHQgKHdyaXRlIHJpZ2h0KX0pXG4gICAgICAgICAgICAgICh3cml0ZSAoZmlyc3QgcGFyYW1zKSlcbiAgICAgICAgICAgICAgKHJlc3QgcGFyYW1zKSkpKVxuICAoaW5zdGFsbC1zcGVjaWFsISBjYWxsZWUgd3JpdGUtYmluYXJ5LW9wZXJhdG9yKSlcbihpbnN0YWxsLWJpbmFyeS1vcGVyYXRvciEgOmJpdC1hbmQgOiYpXG4oaW5zdGFsbC1iaW5hcnktb3BlcmF0b3IhIDpiaXQtb3IgOnwpXG4oaW5zdGFsbC1iaW5hcnktb3BlcmF0b3IhIDpiaXQteG9yIDpeKVxuKGluc3RhbGwtYmluYXJ5LW9wZXJhdG9yISA6Yml0LXNoaWZ0LWxlZnQgOjw8KVxuKGluc3RhbGwtYmluYXJ5LW9wZXJhdG9yISA6Yml0LXNoaWZ0LXJpZ2h0IDo+PilcbihpbnN0YWxsLWJpbmFyeS1vcGVyYXRvciEgOmJpdC1zaGlmdC1yaWdodC16ZXJvLWZpbCA6Pj4+KVxuXG47OyBBcml0aG1ldGljIG9wZXJhdG9yc1xuXG4oZGVmbiBpbnN0YWxsLWFyaXRobWV0aWMtb3BlcmF0b3IhXG4gIFtjYWxsZWUgb3BlcmF0b3IgdmFsaWQ/IGZhbGxiYWNrXVxuXG4gIChkZWZuIHdyaXRlLWJpbmFyeS1vcGVyYXRvclxuICAgIFtsZWZ0IHJpZ2h0XVxuICAgIHs6dHlwZSA6QmluYXJ5RXhwcmVzc2lvblxuICAgICA6b3BlcmF0b3IgKG5hbWUgb3BlcmF0b3IpXG4gICAgIDpsZWZ0IGxlZnRcbiAgICAgOnJpZ2h0ICh3cml0ZSByaWdodCl9KVxuXG4gIChkZWZuIHdyaXRlLWFyaXRobWV0aWMtb3BlcmF0b3JcbiAgICBbJiBwYXJhbXNdXG4gICAgKGxldCBbbiAoY291bnQgcGFyYW1zKV1cbiAgICAgIChjb25kIChhbmQgdmFsaWQ/IChub3QgKHZhbGlkPyBuKSkpIChlcnJvci1hcmctY291bnQgKG5hbWUgY2FsbGVlKSBuKVxuICAgICAgICAgICAgKD09IG4gMCkgKHdyaXRlLWxpdGVyYWwgZmFsbGJhY2spXG4gICAgICAgICAgICAoPT0gbiAxKSAocmVkdWNlIHdyaXRlLWJpbmFyeS1vcGVyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAod3JpdGUtbGl0ZXJhbCBmYWxsYmFjaylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zKVxuICAgICAgICAgICAgOmVsc2UgKHJlZHVjZSB3cml0ZS1iaW5hcnktb3BlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKHdyaXRlIChmaXJzdCBwYXJhbXMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAocmVzdCBwYXJhbXMpKSkpKVxuXG5cbiAgKGluc3RhbGwtc3BlY2lhbCEgY2FsbGVlIHdyaXRlLWFyaXRobWV0aWMtb3BlcmF0b3IpKVxuXG4oaW5zdGFsbC1hcml0aG1ldGljLW9wZXJhdG9yISA6KyA6KyBuaWwgMClcbihpbnN0YWxsLWFyaXRobWV0aWMtb3BlcmF0b3IhIDotIDotICMoPj0gJSAxKSAwKVxuKGluc3RhbGwtYXJpdGhtZXRpYy1vcGVyYXRvciEgOiogOiogbmlsIDEpXG4oaW5zdGFsbC1hcml0aG1ldGljLW9wZXJhdG9yISAoa2V5d29yZCBcXC8pIChrZXl3b3JkIFxcLykgIyg+PSAlIDEpIDEpXG4oaW5zdGFsbC1hcml0aG1ldGljLW9wZXJhdG9yISA6bW9kIChrZXl3b3JkIFxcJSkgIyg9PSAlIDIpIDEpXG5cblxuOzsgQ29tcGFyaXNvbiBvcGVyYXRvcnNcblxuKGRlZm4gaW5zdGFsbC1jb21wYXJpc29uLW9wZXJhdG9yIVxuICBcIkdlbmVyYXRlcyBjb21wYXJpc29uIG9wZXJhdG9yIHdyaXRlciB0aGF0IGdpdmVuIG9uZVxuICBwYXJhbWV0ZXIgd3JpdGVzIGBmYWxsYmFja2AgZ2l2ZW4gdHdvIHBhcmFtZXRlcnMgd3JpdGVzXG4gIGJpbmFyeSBleHByZXNzaW9uIGFuZCBnaXZlbiBtb3JlIHBhcmFtZXRlcnMgd3JpdGVzIGJpbmFyeVxuICBleHByZXNzaW9ucyBqb2luZWQgYnkgbG9naWNhbCBhbmQuXCJcbiAgW2NhbGxlZSBvcGVyYXRvciBmYWxsYmFja11cblxuICA7OyBUT0RPICM1NFxuICA7OyBDb21wYXJpc29uIG9wZXJhdG9ycyBtdXN0IHVzZSB0ZW1wb3JhcnkgdmFyaWFibGUgdG8gc3RvcmVcbiAgOzsgZXhwcmVzc2lvbiBub24gbGl0ZXJhbCBhbmQgbm9uLWlkZW50aWZpZXJzLlxuICAoZGVmbiB3cml0ZS1jb21wYXJpc29uLW9wZXJhdG9yXG4gICAgKFtdIChlcnJvci1hcmctY291bnQgY2FsbGVlIDApKVxuICAgIChbZm9ybV0gKC0+c2VxdWVuY2UgWyh3cml0ZSBmb3JtKVxuICAgICAgICAgICAgICAgICAgICAgICAgICh3cml0ZS1saXRlcmFsIGZhbGxiYWNrKV0pKVxuICAgIChbbGVmdCByaWdodF1cbiAgICAgezp0eXBlIDpCaW5hcnlFeHByZXNzaW9uXG4gICAgICA6b3BlcmF0b3Igb3BlcmF0b3JcbiAgICAgIDpsZWZ0ICh3cml0ZSBsZWZ0KVxuICAgICAgOnJpZ2h0ICh3cml0ZSByaWdodCl9KVxuICAgIChbbGVmdCByaWdodCAmIG1vcmVdXG4gICAgIChyZWR1Y2UgKGZuIFtsZWZ0IHJpZ2h0XVxuICAgICAgICAgICAgICAgezp0eXBlIDpMb2dpY2FsRXhwcmVzc2lvblxuICAgICAgICAgICAgICAgIDpvcGVyYXRvciA6JiZcbiAgICAgICAgICAgICAgICA6bGVmdCBsZWZ0XG4gICAgICAgICAgICAgICAgOnJpZ2h0IHs6dHlwZSA6QmluYXJ5RXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgOm9wZXJhdG9yIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICA6bGVmdCAoaWYgKD0gOkxvZ2ljYWxFeHByZXNzaW9uICg6dHlwZSBsZWZ0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDpyaWdodCAoOnJpZ2h0IGxlZnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoOnJpZ2h0IGxlZnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgOnJpZ2h0ICh3cml0ZSByaWdodCl9fSlcbiAgICAgICAgICAgICAod3JpdGUtY29tcGFyaXNvbi1vcGVyYXRvciBsZWZ0IHJpZ2h0KVxuICAgICAgICAgICAgIG1vcmUpKSlcblxuICAoaW5zdGFsbC1zcGVjaWFsISBjYWxsZWUgd3JpdGUtY29tcGFyaXNvbi1vcGVyYXRvcikpXG5cbihpbnN0YWxsLWNvbXBhcmlzb24tb3BlcmF0b3IhIDo9PSA6PT0gdHJ1ZSlcbihpbnN0YWxsLWNvbXBhcmlzb24tb3BlcmF0b3IhIDo+IDo+IHRydWUpXG4oaW5zdGFsbC1jb21wYXJpc29uLW9wZXJhdG9yISA6Pj0gOj49IHRydWUpXG4oaW5zdGFsbC1jb21wYXJpc29uLW9wZXJhdG9yISA6PCA6PCB0cnVlKVxuKGluc3RhbGwtY29tcGFyaXNvbi1vcGVyYXRvciEgOjw9IDo8PSB0cnVlKVxuXG5cbihkZWZuIHdyaXRlLWlkZW50aWNhbD9cbiAgWyYgcGFyYW1zXVxuICA7OyBUT0RPOiBTdWJtaXQgYSBidWcgZm9yIGNsb2p1cmUgdG8gYWxsb3cgdmFyaWFkaWNcbiAgOzsgbnVtYmVyIG9mIHBhcmFtcyBqb2luZWQgYnkgbG9naWNhbCBhbmQuXG4gIChpZiAoaWRlbnRpY2FsPyAoY291bnQgcGFyYW1zKSAyKVxuICAgIHs6dHlwZSA6QmluYXJ5RXhwcmVzc2lvblxuICAgICA6b3BlcmF0b3IgOj09PVxuICAgICA6bGVmdCAod3JpdGUgKGZpcnN0IHBhcmFtcykpXG4gICAgIDpyaWdodCAod3JpdGUgKHNlY29uZCBwYXJhbXMpKX1cbiAgICAoZXJyb3ItYXJnLWNvdW50IDppZGVudGljYWw/IChjb3VudCBwYXJhbXMpKSkpXG4oaW5zdGFsbC1zcGVjaWFsISA6aWRlbnRpY2FsPyB3cml0ZS1pZGVudGljYWw/KVxuXG4oZGVmbiB3cml0ZS1pbnN0YW5jZT9cbiAgWyYgcGFyYW1zXVxuICA7OyBUT0RPOiBTdWJtaXQgYSBidWcgZm9yIGNsb2p1cmUgdG8gbWFrZSBzdXJlIHRoYXRcbiAgOzsgaW5zdGFuY2U/IGVpdGhlciBhY2NlcHRzIG9ubHkgdHdvIGFyZ3Mgb3IgcmV0dXJuc1xuICA7OyB0cnVlIG9ubHkgaWYgYWxsIHRoZSBwYXJhbXMgYXJlIGluc3RhbmNlIG9mIHRoZVxuICA7OyBnaXZlbiB0eXBlLlxuXG4gIChsZXQgW2NvbnN0cnVjdG9yIChmaXJzdCBwYXJhbXMpXG4gICAgICAgIGluc3RhbmNlIChzZWNvbmQgcGFyYW1zKV1cbiAgICAoaWYgKDwgKGNvdW50IHBhcmFtcykgMSlcbiAgICAgIChlcnJvci1hcmctY291bnQgOmluc3RhbmNlPyAoY291bnQgcGFyYW1zKSlcbiAgICAgIHs6dHlwZSA6QmluYXJ5RXhwcmVzc2lvblxuICAgICAgIDpvcGVyYXRvciA6aW5zdGFuY2VvZlxuICAgICAgIDpsZWZ0IChpZiBpbnN0YW5jZVxuICAgICAgICAgICAgICAgKHdyaXRlIGluc3RhbmNlKVxuICAgICAgICAgICAgICAgKHdyaXRlLWNvbnN0YW50IGluc3RhbmNlKSlcbiAgICAgICA6cmlnaHQgKHdyaXRlIGNvbnN0cnVjdG9yKX0pKSlcbihpbnN0YWxsLXNwZWNpYWwhIDppbnN0YW5jZT8gd3JpdGUtaW5zdGFuY2U/KVxuXG5cbihkZWZuIGV4cGFuZC1hcHBseVxuICBbZiAmIHBhcmFtc11cbiAgKGxldCBbcHJlZml4ICh2ZWMgKGJ1dGxhc3QgcGFyYW1zKSldXG4gICAgKGlmIChlbXB0eT8gcHJlZml4KVxuICAgICAgYCguYXBwbHkgfmYgbmlsIH5AcGFyYW1zKVxuICAgICAgYCguYXBwbHkgfmYgbmlsICguY29uY2F0IH5wcmVmaXggfihsYXN0IHBhcmFtcykpKSkpKVxuKGluc3RhbGwtbWFjcm8hIDphcHBseSBleHBhbmQtYXBwbHkpXG5cblxuKGRlZm4gZXhwYW5kLXByaW50XG4gIFsmZm9ybSAmIG1vcmVdXG4gIFwiUHJpbnRzIHRoZSBvYmplY3QocykgdG8gdGhlIG91dHB1dCBmb3IgaHVtYW4gY29uc3VtcHRpb24uXCJcbiAgKGxldCBbb3AgKHdpdGgtbWV0YSAnY29uc29sZS5sb2cgKG1ldGEgJmZvcm0pKV1cbiAgICBgKH5vcCB+QG1vcmUpKSlcbihpbnN0YWxsLW1hY3JvISA6cHJpbnQgKHdpdGgtbWV0YSBleHBhbmQtcHJpbnQgezppbXBsaWNpdCBbOiZmb3JtXX0pKVxuXG4oZGVmbiBleHBhbmQtc3RyXG4gIFwic3RyIGlubGluaW5nIGFuZCBvcHRpbWl6YXRpb24gdmlhIG1hY3Jvc1wiXG4gIFsmIGZvcm1zXVxuICBgKCsgXCJcIiB+QGZvcm1zKSlcbihpbnN0YWxsLW1hY3JvISA6c3RyIGV4cGFuZC1zdHIpXG5cbihkZWZuIGV4cGFuZC1kZWJ1Z1xuICBbXVxuICAnZGVidWdnZXIpXG4oaW5zdGFsbC1tYWNybyEgOmRlYnVnZ2VyISBleHBhbmQtZGVidWcpXG5cbihkZWZuIGV4cGFuZC1hc3NlcnRcbiAgXns6ZG9jIFwiRXZhbHVhdGVzIGV4cHIgYW5kIHRocm93cyBhbiBleGNlcHRpb24gaWYgaXQgZG9lcyBub3QgZXZhbHVhdGUgdG9cbiAgICBsb2dpY2FsIHRydWUuXCJ9XG4gIChbeF0gKGV4cGFuZC1hc3NlcnQgeCBcIlwiKSlcbiAgKFt4IG1lc3NhZ2VdIChsZXQgW2Zvcm0gKHByLXN0ciB4KV1cbiAgICAgICAgICAgICAgICAgYChpZiAobm90IH54KVxuICAgICAgICAgICAgICAgICAgICAodGhyb3cgKEVycm9yIChzdHIgXCJBc3NlcnQgZmFpbGVkOiBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH5mb3JtKSkpKSkpKVxuKGluc3RhbGwtbWFjcm8hIDphc3NlcnQgZXhwYW5kLWFzc2VydClcblxuIl19

},{"./../../ast":9,"./../../expander":14,"./../../reader":32,"./../../runtime":33,"./../../sequence":34,"./../../string":35,"escodegen":16}],12:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.compiler',
            doc: void 0
        };
    var wisp_analyzer = require('./analyzer');
    var analyze = wisp_analyzer.analyze;
    var wisp_reader = require('./reader');
    var read_ = wisp_reader.read_;
    var read = wisp_reader.read;
    var pushBackReader = wisp_reader.pushBackReader;
    var wisp_string = require('./string');
    var replace = wisp_string.replace;
    var wisp_sequence = require('./sequence');
    var map = wisp_sequence.map;
    var conj = wisp_sequence.conj;
    var cons = wisp_sequence.cons;
    var vec = wisp_sequence.vec;
    var first = wisp_sequence.first;
    var rest = wisp_sequence.rest;
    var isEmpty = wisp_sequence.isEmpty;
    var count = wisp_sequence.count;
    var wisp_runtime = require('./runtime');
    var isError = wisp_runtime.isError;
    var wisp_ast = require('./ast');
    var name = wisp_ast.name;
    var wisp_backend_escodegen_generator = require('./backend/escodegen/generator');
    var generateJs = wisp_backend_escodegen_generator.generate;
    var base64Encode = require('base64-encode');
    var btoa = base64Encode;
}
var generate = exports.generate = generateJs;
var readForm = exports.readForm = function readForm(reader, eof) {
        return (function () {
            try {
                return read(reader, false, eof, false);
            } catch (error) {
                return error;
            }
        })();
    };
var readForms = exports.readForms = function readForms(source, uri) {
        return function () {
            var readerø1 = pushBackReader(source, uri);
            var eofø1 = {};
            return function loop() {
                var recur = loop;
                var formsø1 = [];
                var formø1 = readForm(readerø1, eofø1);
                do {
                    recur = isError(formø1) ? {
                        'forms': formsø1,
                        'error': formø1
                    } : formø1 === eofø1 ? { 'forms': formsø1 } : 'else' ? (loop[0] = conj(formsø1, formø1), loop[1] = readForm(readerø1, eofø1), loop) : void 0;
                } while (formsø1 = loop[0], formø1 = loop[1], recur === loop);
                return recur;
            }.call(this);
        }.call(this);
    };
var analyzeForm = exports.analyzeForm = function analyzeForm(form) {
        return (function () {
            try {
                return analyze(form);
            } catch (error) {
                return error;
            }
        })();
    };
var analyzeForms = exports.analyzeForms = function analyzeForms(forms) {
        return function loop() {
            var recur = loop;
            var nodesø1 = [];
            var formsø2 = forms;
            do {
                recur = function () {
                    var nodeø1 = analyzeForm(first(formsø2));
                    return isError(nodeø1) ? {
                        'ast': nodesø1,
                        'error': nodeø1
                    } : count(formsø2) <= 1 ? { 'ast': conj(nodesø1, nodeø1) } : 'else' ? (loop[0] = conj(nodesø1, nodeø1), loop[1] = rest(formsø2), loop) : void 0;
                }.call(this);
            } while (nodesø1 = loop[0], formsø2 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var compile = exports.compile = function compile() {
        switch (arguments.length) {
        case 1:
            var source = arguments[0];
            return compile(source, {});
        case 2:
            var source = arguments[0];
            var options = arguments[1];
            return function () {
                var sourceUriø1 = (options || 0)['source-uri'] || name('anonymous.wisp');
                var formsø1 = readForms(source, sourceUriø1);
                var astø1 = (formsø1 || 0)['error'] ? formsø1 : analyzeForms((formsø1 || 0)['forms']);
                var outputø1 = (astø1 || 0)['error'] ? astø1 : (function () {
                        try {
                            return generate.apply(void 0, vec(cons(conj(options, {
                                'source': source,
                                'source-uri': sourceUriø1
                            }), (astø1 || 0)['ast'])));
                        } catch (error) {
                            return { 'error': error };
                        }
                    })();
                var resultø1 = {
                        'source-uri': sourceUriø1,
                        'ast': (astø1 || 0)['ast'],
                        'forms': (formsø1 || 0)['forms']
                    };
                return conj(options, outputø1, resultø1);
            }.call(this);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var evaluate = exports.evaluate = function evaluate(source) {
        return function () {
            var outputø1 = compile(source);
            return (outputø1 || 0)['error'] ? (function () {
                throw (outputø1 || 0)['error'];
            })() : eval((outputø1 || 0)['code']);
        }.call(this);
    };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvY29tcGlsZXIud2lzcCJdLCJuYW1lcyI6WyJhbmFseXplIiwicmVhZF8iLCJyZWFkIiwicHVzaEJhY2tSZWFkZXIiLCJyZXBsYWNlIiwibWFwIiwiY29uaiIsImNvbnMiLCJ2ZWMiLCJmaXJzdCIsInJlc3QiLCJpc0VtcHR5IiwiY291bnQiLCJpc0Vycm9yIiwibmFtZSIsImdlbmVyYXRlSnMiLCJnZW5lcmF0ZSIsInJlYWRGb3JtIiwicmVhZGVyIiwiZW9mIiwiZXJyb3IiLCJyZWFkRm9ybXMiLCJzb3VyY2UiLCJ1cmkiLCJyZWFkZXLDuDEiLCJlb2bDuDEiLCJmb3Jtc8O4MSIsImZvcm3DuDEiLCJhbmFseXplRm9ybSIsImZvcm0iLCJhbmFseXplRm9ybXMiLCJmb3JtcyIsIm5vZGVzw7gxIiwiZm9ybXPDuDIiLCJub2Rlw7gxIiwiY29tcGlsZSIsIm9wdGlvbnMiLCJzb3VyY2VVcmnDuDEiLCJhc3TDuDEiLCJvdXRwdXTDuDEiLCJyZXN1bHTDuDEiLCJldmFsdWF0ZSIsImV2YWwiXSwibWFwcGluZ3MiOiJBQUFBO0k7OztVQUFBO0ksMENBQUE7SSxJQUNtQ0EsT0FBQSxHLGNBQUFBLE8sQ0FEbkM7SSxzQ0FBQTtJLElBRWlDQyxLQUFBLEcsWUFBQUEsSyxDQUZqQztJLElBRXVDQyxJQUFBLEcsWUFBQUEsSSxDQUZ2QztJLElBRTRDQyxjQUFBLEcsWUFBQUEsYyxDQUY1QztJLHNDQUFBO0ksSUFHaUNDLE9BQUEsRyxZQUFBQSxPLENBSGpDO0ksMENBQUE7SSxJQUltQ0MsR0FBQSxHLGNBQUFBLEcsQ0FKbkM7SSxJQUl1Q0MsSUFBQSxHLGNBQUFBLEksQ0FKdkM7SSxJQUk0Q0MsSUFBQSxHLGNBQUFBLEksQ0FKNUM7SSxJQUlpREMsR0FBQSxHLGNBQUFBLEcsQ0FKakQ7SSxJQUlxREMsS0FBQSxHLGNBQUFBLEssQ0FKckQ7SSxJQUkyREMsSUFBQSxHLGNBQUFBLEksQ0FKM0Q7SSxJQUlnRUMsT0FBQSxHLGNBQUFBLE8sQ0FKaEU7SSxJQUl1RUMs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LE9BQUEsQ0FBSixHQUNFQSxPQURGLEdBRUdJLFlBQUQsQyxDQUF1QkosTyxNQUFSLEMsT0FBQSxDQUFmLENBRk4sQztnQkFJQSxJQUFBYSxRLElBQW1CRCxLLE1BQVIsQyxPQUFBLENBQUosR0FDRUEsS0FERixHOzs0QkFJSSxPQUFPdEIsUSxNQUFQLEMsTUFBQSxFQUFpQlIsR0FBRCxDQUFNRCxJQUFELENBQU9ELElBQUQsQ0FBTThCLE9BQU4sRUFDTTtnQyxVQUFTZCxNQUFUO2dDLGNBQ2FlLFdBRGI7NkJBRE4sQ0FBTixFLENBR1lDLEssTUFBTixDLEtBQUEsQ0FITixDQUFMLENBQWhCLEU7aUNBSU9sQixLOzRCQUFNLFMsU0FBUUEsS0FBUixHOztzQkFOZixFQUZULEM7Z0JBVUEsSUFBQW9CLFEsR0FBTzt3QixjQUFhSCxXQUFiO3dCLFFBQ1lDLEssTUFBTixDLEtBQUEsQ0FETjt3QixVQUVnQlosTyxNQUFSLEMsT0FBQSxDQUZSO3FCQUFQLEM7Z0JBR0osT0FBQ3BCLElBQUQsQ0FBTThCLE9BQU4sRUFBY0csUUFBZCxFQUFxQkMsUUFBckIsRTtrQkFwQkYsQyxJQUFBLEU7Ozs7S0F4QkgsQztBQThDQSxJQUFNQyxRQUFBLEcsUUFBQUEsUSxHQUFOLFNBQU1BLFFBQU4sQ0FDR25CLE1BREgsRTtRQUVFLE87WUFBTSxJQUFBaUIsUSxHQUFRSixPQUFELENBQVNiLE1BQVQsQ0FBUCxDO1lBQ0osTyxDQUFZaUIsUSxNQUFSLEMsT0FBQSxDQUFKLEc7dUJBQ2lCQSxRLE1BQVIsQyxPQUFBLEM7Y0FBUCxFQURGLEdBRUdHLElBQUQsQyxDQUFhSCxRLE1BQVAsQyxNQUFBLENBQU4sQ0FGRixDO2NBREYsQyxJQUFBLEU7S0FGRiIsInNvdXJjZXNDb250ZW50IjpbIihucyB3aXNwLmNvbXBpbGVyXG4gICg6cmVxdWlyZSBbd2lzcC5hbmFseXplciA6cmVmZXIgW2FuYWx5emVdXVxuICAgICAgICAgICAgW3dpc3AucmVhZGVyIDpyZWZlciBbcmVhZCogcmVhZCBwdXNoLWJhY2stcmVhZGVyXV1cbiAgICAgICAgICAgIFt3aXNwLnN0cmluZyA6cmVmZXIgW3JlcGxhY2VdXVxuICAgICAgICAgICAgW3dpc3Auc2VxdWVuY2UgOnJlZmVyIFttYXAgY29uaiBjb25zIHZlYyBmaXJzdCByZXN0IGVtcHR5PyBjb3VudF1dXG4gICAgICAgICAgICBbd2lzcC5ydW50aW1lIDpyZWZlciBbZXJyb3I/XV1cbiAgICAgICAgICAgIFt3aXNwLmFzdCA6cmVmZXIgW25hbWVdXVxuXG4gICAgICAgICAgICBbd2lzcC5iYWNrZW5kLmVzY29kZWdlbi5nZW5lcmF0b3IgOnJlZmVyIFtnZW5lcmF0ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6cmVuYW1lIHtnZW5lcmF0ZSBnZW5lcmF0ZS1qc31dXG4gICAgICAgICAgICBbYmFzZTY0LWVuY29kZSA6YXMgYnRvYV0pKVxuXG4oZGVmIGdlbmVyYXRlIGdlbmVyYXRlLWpzKVxuXG4oZGVmbiByZWFkLWZvcm1cbiAgW3JlYWRlciBlb2ZdXG4gICh0cnkgKHJlYWQgcmVhZGVyIGZhbHNlIGVvZiBmYWxzZSlcbiAgICAoY2F0Y2ggZXJyb3IgZXJyb3IpKSlcblxuKGRlZm4gcmVhZC1mb3Jtc1xuICBbc291cmNlIHVyaV1cbiAgKGxldCBbcmVhZGVyIChwdXNoLWJhY2stcmVhZGVyIHNvdXJjZSB1cmkpXG4gICAgICAgIGVvZiB7fV1cbiAgICAobG9vcCBbZm9ybXMgW11cbiAgICAgICAgICAgZm9ybSAocmVhZC1mb3JtIHJlYWRlciBlb2YpXVxuICAgICAgKGNvbmQgKGVycm9yPyBmb3JtKSB7OmZvcm1zIGZvcm1zIDplcnJvciBmb3JtfVxuICAgICAgICAgICAgKGlkZW50aWNhbD8gZm9ybSBlb2YpIHs6Zm9ybXMgZm9ybXN9XG4gICAgICAgICAgICA6ZWxzZSAocmVjdXIgKGNvbmogZm9ybXMgZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAocmVhZC1mb3JtIHJlYWRlciBlb2YpKSkpKSlcblxuKGRlZm4gYW5hbHl6ZS1mb3JtXG4gIFtmb3JtXVxuICAodHJ5IChhbmFseXplIGZvcm0pIChjYXRjaCBlcnJvciBlcnJvcikpKVxuXG4oZGVmbiBhbmFseXplLWZvcm1zXG4gIFtmb3Jtc11cbiAgKGxvb3AgW25vZGVzIFtdXG4gICAgICAgICBmb3JtcyBmb3Jtc11cbiAgICAobGV0IFtub2RlIChhbmFseXplLWZvcm0gKGZpcnN0IGZvcm1zKSldXG4gICAgICAoY29uZCAoZXJyb3I/IG5vZGUpIHs6YXN0IG5vZGVzIDplcnJvciBub2RlfVxuICAgICAgICAgICAgKDw9IChjb3VudCBmb3JtcykgMSkgezphc3QgKGNvbmogbm9kZXMgbm9kZSl9XG4gICAgICAgICAgICA6ZWxzZSAocmVjdXIgKGNvbmogbm9kZXMgbm9kZSkgKHJlc3QgZm9ybXMpKSkpKSlcblxuKGRlZm4gY29tcGlsZVxuICBcIkNvbXBpbGVyIHRha2VzIHdpc3AgY29kZSBpbiBmb3JtIG9mIHN0cmluZyBhbmQgcmV0dXJucyBhIGhhc2hcbiAgY29udGFpbmluZyBgOnNvdXJjZWAgcmVwcmVzZW50aW5nIGNvbXBpbGF0aW9uIHJlc3VsdC4gSWZcbiAgYCg6c291cmNlLW1hcCBvcHRpb25zKWAgaXMgYHRydWVgIHRoZW4gYDpzb3VyY2UtbWFwYCBvZiB0aGUgcmV0dXJuZWRcbiAgaGFzaCB3aWxsIGNvbnRhaW4gc291cmNlIG1hcCBmb3IgaXQuXG4gIDpvdXRwdXQtdXJpXG4gIDpzb3VyY2UtbWFwLXVyaVxuXG4gIFJldHVybnMgaGFzaCB3aXRoIGZvbGxvd2luZyBmaWVsZHM6XG5cbiAgOmNvZGUgLSBHZW5lcmF0ZWQgY29kZS5cblxuICA6c291cmNlLW1hcCAtIEdlbmVyYXRlZCBzb3VyY2UgbWFwLiBPbmx5IGlmICg6c291cmNlLW1hcCBvcHRpb25zKVxuICAgICAgICAgICAgICAgIHdhcyB0cnVlLlxuXG4gIDpvdXRwdXQtdXJpIC0gUmV0dXJucyBiYWNrICg6b3V0cHV0LXVyaSBvcHRpb25zKSBpZiB3YXMgcGFzc2VkIGluLFxuICAgICAgICAgICAgICAgIG90aGVyd2lzZSBjb21wdXRlcyBvbmUgZnJvbSAoOnNvdXJjZS11cmkgb3B0aW9ucykgYnlcbiAgICAgICAgICAgICAgICBjaGFuZ2luZyBmaWxlIGV4dGVuc2lvbi5cblxuICA6c291cmNlLW1hcC11cmkgLSBSZXR1cm5zIGJhY2sgKDpzb3VyY2UtbWFwLXVyaSBvcHRpb25zKSBpZiB3YXMgcGFzc2VkXG4gICAgICAgICAgICAgICAgICAgIGluLCBvdGhlcndpc2UgY29tcHV0ZXMgb25lIGZyb20gKDpzb3VyY2UtdXJpIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgIGJ5IGFkZGluZyBgLm1hcGAgZmlsZSBleHRlbnNpb24uXCJcbiAgKFtzb3VyY2VdIChjb21waWxlIHNvdXJjZSB7fSkpXG4gIChbc291cmNlIG9wdGlvbnNdXG4gICAobGV0IFtzb3VyY2UtdXJpIChvciAoOnNvdXJjZS11cmkgb3B0aW9ucykgKG5hbWUgOmFub255bW91cy53aXNwKSkgOzsgSEFDSzogV29ya2Fyb3VuZCBmb3Igc2VnZmF1bHQgIzY2OTFcbiAgICAgICAgIGZvcm1zIChyZWFkLWZvcm1zIHNvdXJjZSBzb3VyY2UtdXJpKVxuXG4gICAgICAgICBhc3QgKGlmICg6ZXJyb3IgZm9ybXMpXG4gICAgICAgICAgICAgICBmb3Jtc1xuICAgICAgICAgICAgICAgKGFuYWx5emUtZm9ybXMgKDpmb3JtcyBmb3JtcykpKVxuXG4gICAgICAgICBvdXRwdXQgKGlmICg6ZXJyb3IgYXN0KVxuICAgICAgICAgICAgICAgICAgYXN0XG4gICAgICAgICAgICAgICAgICAodHJ5ICAgICAgICAgICAgICA7OyBUT0RPOiBSZW1vdmUgdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOzsgT2xkIGNvbXBpbGVyIGhhcyBpbmNvcnJlY3QgYXBwbHkuXG4gICAgICAgICAgICAgICAgICAgIChhcHBseSBnZW5lcmF0ZSAodmVjIChjb25zIChjb25qIG9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgezpzb3VyY2Ugc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6c291cmNlLXVyaSBzb3VyY2UtdXJpfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDphc3QgYXN0KSkpKVxuICAgICAgICAgICAgICAgICAgICAoY2F0Y2ggZXJyb3IgezplcnJvciBlcnJvcn0pKSlcblxuICAgICAgICAgcmVzdWx0IHs6c291cmNlLXVyaSBzb3VyY2UtdXJpXG4gICAgICAgICAgICAgICAgIDphc3QgKDphc3QgYXN0KVxuICAgICAgICAgICAgICAgICA6Zm9ybXMgKDpmb3JtcyBmb3Jtcyl9XVxuICAgICAoY29uaiBvcHRpb25zIG91dHB1dCByZXN1bHQpKSkpXG5cbihkZWZuIGV2YWx1YXRlXG4gIFtzb3VyY2VdXG4gIChsZXQgW291dHB1dCAoY29tcGlsZSBzb3VyY2UpXVxuICAgIChpZiAoOmVycm9yIG91dHB1dClcbiAgICAgICh0aHJvdyAoOmVycm9yIG91dHB1dCkpXG4gICAgICAoZXZhbCAoOmNvZGUgb3V0cHV0KSkpKSlcbiJdfQ==

},{"./analyzer":8,"./ast":9,"./backend/escodegen/generator":10,"./reader":32,"./runtime":33,"./sequence":34,"./string":35,"base64-encode":15}],13:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.engine.browser',
            doc: void 0
        };
    var wisp_runtime = require('./../runtime');
    var str = wisp_runtime.str;
    var wisp_sequence = require('./../sequence');
    var rest = wisp_sequence.rest;
    var wisp_reader = require('./../reader');
    var readFromString = wisp_reader.readFromString;
    var wisp_compiler = require('./../compiler');
    var compile_ = wisp_compiler.compile_;
}
var evaluate = exports.evaluate = function evaluate(code, url) {
        return eval(compile_(read_(code, url)));
    };
var run = exports.run = function run(code, url) {
        return Function(compile_(read_(code, url)))();
    };
var load = exports.load = function load(url, callback) {
        var request = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        request.open('GET', url, true);
        request.overrideMimeType ? request.overrideMimeType('application/wisp') : void 0;
        request.onreadystatechange = function () {
            return request.readyState === 4 ? request.status === 0 || request.status === 200 ? callback(run(request.responseText, url)) : callback('Could not load') : void 0;
        };
        return request.send(null);
    };
var runScripts = exports.runScripts = function runScripts() {
        var scripts = Array.prototype.filter.call(document.getElementsByTagName('script'), function (script) {
                return script.type === 'application/wisp';
            });
        var next = function next() {
            return scripts.length ? function () {
                var scriptø1 = scripts.shift();
                return scriptø1.src ? load(scriptø1.src, next) : next(run(scriptø1.innerHTML));
            }.call(this) : void 0;
        };
        return next();
    };
document.readyState === 'complete' || document.readyState === 'interactive' ? runScripts() : window.addEventListener ? window.addEventListener('DOMContentLoaded', runScripts, false) : window.attachEvent('onload', runScripts);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvZW5naW5lL2Jyb3dzZXIud2lzcCJdLCJuYW1lcyI6WyJzdHIiLCJyZXN0IiwicmVhZEZyb21TdHJpbmciLCJjb21waWxlXyIsImV2YWx1YXRlIiwiY29kZSIsInVybCIsImV2YWwiLCJyZWFkXyIsInJ1biIsIkZ1bmN0aW9uIiwibG9hZCIsImNhbGxiYWNrIiwicmVxdWVzdCIsIndpbmRvdyIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsIm92ZXJyaWRlTWltZVR5cGUiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwicmVzcG9uc2VUZXh0Iiwic2VuZCIsIm51bGwiLCJydW5TY3JpcHRzIiwic2NyaXB0cyIsIkFycmF5IiwicHJvdG90eXBlLmZpbHRlci5jYWxsIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInNjcmlwdCIsInR5cGUiLCJuZXh0IiwibGVuZ3RoIiwic2NyaXB0w7gxIiwic2hpZnQiLCJzcmMiLCJpbm5lckhUTUwiLCJhZGRFdmVudExpc3RlbmVyIiwiYXR0YWNoRXZlbnQiXSwibWFwcGluZ3MiOiJBQUFBO0k7OztVQUFBO0ksMkNBQUE7SSxJQUNrQ0EsR0FBQSxHLGFBQUFBLEcsQ0FEbEM7SSw2Q0FBQTtJLElBRW1DQyxJQUFBLEcsY0FBQUEsSSxDQUZuQztJLHlDQUFBO0ksSUFHaUNDLGNBQUEsRyxZQUFBQSxjLENBSGpDO0ksNkNBQUE7SSxJQUltQ0MsUUFBQSxHLGNBQUFBLFEsQ0FKbkM7QztBQU1BLElBQU1DLFFBQUEsRyxRQUFBQSxRLEdBQU4sU0FBTUEsUUFBTixDQUNHQyxJQURILEVBQ1FDLEdBRFIsRTtRQUNhLE9BQUNDLElBQUQsQ0FBT0osUUFBRCxDQUFXSyxLQUFELENBQU9ILElBQVAsRUFBWUMsR0FBWixDQUFWLENBQU4sRTtLQURiLEM7QUFJQSxJQUFNRyxHQUFBLEcsUUFBQUEsRyxHQUFOLFNBQU1BLEdBQU4sQ0FDR0osSUFESCxFQUNRQyxHQURSLEU7UUFFRSxPQUFFSSxRQUFELENBQVdQLFFBQUQsQ0FBV0ssS0FBRCxDQUFPSCxJQUFQLEVBQVlDLEdBQVosQ0FBVixDQUFWLENBQUQsRztLQUZGLEM7QUFRQSxJQUFNSyxJQUFBLEcsUUFBQUEsSSxHQUFOLFNBQU1BLElBQU4sQ0FDR0wsR0FESCxFQUNPTSxRQURQLEU7UUFFRSxJQUFLQyxPQUFBLEdBQ0NDLE1BQUEsQ0FBT0MsY0FBWCxHQUNFLEksY0FBQSxFQURGLEdBRUUsSSxhQUFBLEMsbUJBQUEsQ0FISixDO1FBS09GLE9BQU4sQ0FBQ0csSUFBRixDLEtBQUEsRUFBb0JWLEdBQXBCLEUsSUFBQSxDO1FBRUlPLE9BQUEsQ0FBUUksZ0JBQVosR0FDdUJKLE9BQXBCLENBQUNJLGdCQUFGLEMsa0JBQUEsQ0FERixHO1FBR01KLE9BQUEsQ0FBUUssa0JBQWQsR0FDTSxZO1lBQ0UsT0FBZ0JMLE9BQUEsQ0FBUU0sVUFBcEIsSyxDQUFKLEdBQ3NCTixPQUFBLENBQVFPLE1BQXBCLEssQ0FBSixJQUNnQlAsT0FBQSxDQUFRTyxNQUFwQixLLEdBRFIsR0FFR1IsUUFBRCxDQUFXSCxHQUFELENBQUtJLE9BQUEsQ0FBUVEsWUFBYixFQUEyQmYsR0FBM0IsQ0FBVixDQUZGLEdBR0dNLFFBQUQsQyxnQkFBQSxDQUpKLEcsTUFBQSxDOztRQU1SLE9BQU9DLE9BQU4sQ0FBQ1MsSUFBRixDQUFlQyxJQUFmLEU7S0FwQkYsQztBQXlCQSxJQUFNQyxVQUFBLEcsUUFBQUEsVSxHQUFOLFNBQU1BLFVBQU4sRztRQUdFLElBQUtDLE9BQUEsR0FDRkMsS0FBQSxDQUFNQyxxQkFBUCxDQUNFQyxRQUFBLENBQVNDLG9CQUFWLEMsUUFBQSxDQURELEVBRUMsVUFBS0MsTUFBTCxFO2dCQUFhLE9BQVlBLE1BQUEsQ0FBT0MsSUFBbkIsSyxrQkFBQSxDO2FBRmQsQ0FERixDO1FBS0EsSUFBTUMsSUFBQSxHQUFOLFNBQU1BLElBQU4sRztZQUNFLE9BQUlQLE9BQUEsQ0FBUVEsTUFBWixHO2dCQUNRLElBQUFDLFEsR0FBZVQsT0FBUCxDQUFDVSxLQUFGLEVBQVAsQztnQkFDSixPQUFJRCxRQUFBLENBQU9FLEdBQVgsR0FDR3pCLElBQUQsQ0FBTXVCLFFBQUEsQ0FBT0UsR0FBYixFQUFpQkosSUFBakIsQ0FERixHQUVHQSxJQUFELENBQU92QixHQUFELENBQUt5QixRQUFBLENBQU9HLFNBQVosQ0FBTixDQUZGLEM7a0JBREYsQyxJQUFBLENBREYsRyxNQUFBLEM7U0FERixDO1FBT0EsT0FBQ0wsSUFBRCxHO0tBZkYsQztBQWtCb0JKLFFBQUEsQ0FBU1QsVUFBckIsSyxVQUFKLElBQ2dCUyxRQUFBLENBQVNULFVBQXJCLEssYUFEUixHQUVHSyxVQUFELEVBRkYsR0FHTVYsTUFBQSxDQUFPd0IsZ0JBQVgsR0FDdUJ4QixNQUFwQixDQUFDd0IsZ0JBQUYsQyxrQkFBQSxFQUE4Q2QsVUFBOUMsRSxLQUFBLENBREYsR0FFaUJWLE1BQWQsQ0FBQ3lCLFdBQUYsQyxRQUFBLEVBQThCZixVQUE5QixDIiwic291cmNlc0NvbnRlbnQiOlsiKG5zIHdpc3AuZW5naW5lLmJyb3dzZXJcbiAgKDpyZXF1aXJlIFt3aXNwLnJ1bnRpbWUgOnJlZmVyIFtzdHJdXVxuICAgICAgICAgICAgW3dpc3Auc2VxdWVuY2UgOnJlZmVyIFtyZXN0XV1cbiAgICAgICAgICAgIFt3aXNwLnJlYWRlciA6cmVmZXIgW3JlYWQtZnJvbS1zdHJpbmddXVxuICAgICAgICAgICAgW3dpc3AuY29tcGlsZXIgOnJlZmVyIFtjb21waWxlKl1dKSlcblxuKGRlZm4gZXZhbHVhdGVcbiAgW2NvZGUgdXJsXSAoZXZhbCAoY29tcGlsZSogKHJlYWQqIGNvZGUgdXJsKSkpKVxuXG47OyBSdW5uaW5nIGNvZGUgZG9lcyBub3QgcHJvdmlkZSBhY2Nlc3MgdG8gdGhpcyBzY29wZS5cbihkZWZuIHJ1blxuICBbY29kZSB1cmxdXG4gICgoRnVuY3Rpb24gKGNvbXBpbGUqIChyZWFkKiBjb2RlIHVybCkpKSkpXG5cbjs7IElmIHdlJ3JlIG5vdCBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQsIHdlJ3JlIGZpbmlzaGVkIHdpdGggdGhlIHB1YmxpYyBBUEkuXG47OyByZXR1cm4gdW5sZXNzIHdpbmRvdz9cbjs7XG47OyBMb2FkIGEgcmVtb3RlIHNjcmlwdCBmcm9tIHRoZSBjdXJyZW50IGRvbWFpbiB2aWEgWEhSLlxuKGRlZm4gbG9hZFxuICBbdXJsIGNhbGxiYWNrXVxuICAoZGVmIHJlcXVlc3RcbiAgICAoaWYgd2luZG93LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAoWE1MSHR0cFJlcXVlc3QuKVxuICAgICAgKEFjdGl2ZVhPYmplY3QuIFwiTWljcm9zb2Z0LlhNTEhUVFBcIikpKVxuXG4gICgub3BlbiByZXF1ZXN0IDpHRVQgdXJsIHRydWUpXG5cbiAgKGlmIHJlcXVlc3Qub3ZlcnJpZGUtbWltZS10eXBlXG4gICAgKC5vdmVycmlkZS1taW1lLXR5cGUgcmVxdWVzdCBcImFwcGxpY2F0aW9uL3dpc3BcIikpXG5cbiAgKHNldCEgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2VcbiAgICAgICAgKGZuIFtdXG4gICAgICAgICAgKGlmIChpZGVudGljYWw/IHJlcXVlc3QucmVhZHktc3RhdGUgNClcbiAgICAgICAgICAgIChpZiAob3IgKGlkZW50aWNhbD8gcmVxdWVzdC5zdGF0dXMgMClcbiAgICAgICAgICAgICAgICAgICAgKGlkZW50aWNhbD8gcmVxdWVzdC5zdGF0dXMgMjAwKSlcbiAgICAgICAgICAgICAgKGNhbGxiYWNrIChydW4gcmVxdWVzdC5yZXNwb25zZS10ZXh0IHVybCkpXG4gICAgICAgICAgICAgIChjYWxsYmFjayBcIkNvdWxkIG5vdCBsb2FkXCIpKSkpKVxuXG4gICguc2VuZCByZXF1ZXN0IG51bGwpKVxuXG47OyBBY3RpdmF0ZSBMaXNweVNjcmlwdCBpbiB0aGUgYnJvd3NlciBieSBoYXZpbmcgaXQgY29tcGlsZSBhbmQgZXZhbHVhdGVcbjs7IGFsbCBzY3JpcHQgdGFncyB3aXRoIGEgY29udGVudC10eXBlIG9mIGBhcHBsaWNhdGlvbi93aXNwYC5cbjs7IFRoaXMgaGFwcGVucyBvbiBwYWdlIGxvYWQuXG4oZGVmbiBydW4tc2NyaXB0c1xuICBcIkNvbXBpbGVzIGFuZCBleGVjdHVlcyBhbGwgc2NyaXB0cyB0aGF0IGhhdmUgdHlwZSBhcHBsaWNhdGlvbi93aXNwIHR5cGVcIlxuICBbXVxuICAoZGVmIHNjcmlwdHNcbiAgICAoQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsXG4gICAgIChkb2N1bWVudC5nZXQtZWxlbWVudHMtYnktdGFnLW5hbWUgOnNjcmlwdClcbiAgICAgKGZuIFtzY3JpcHRdIChpZGVudGljYWw/IHNjcmlwdC50eXBlIFwiYXBwbGljYXRpb24vd2lzcFwiKSkpKVxuXG4gIChkZWZuIG5leHQgW11cbiAgICAoaWYgc2NyaXB0cy5sZW5ndGhcbiAgICAgIChsZXQgW3NjcmlwdCAoLnNoaWZ0IHNjcmlwdHMpXVxuICAgICAgICAoaWYgc2NyaXB0LnNyY1xuICAgICAgICAgIChsb2FkIHNjcmlwdC5zcmMgbmV4dClcbiAgICAgICAgICAobmV4dCAocnVuIHNjcmlwdC5pbm5lckhUTUwpKSkpKSlcblxuICAobmV4dCkpXG5cbjs7IExpc3RlbiBmb3Igd2luZG93IGxvYWQsIGJvdGggaW4gYnJvd3NlcnMgYW5kIGluIElFLlxuKGlmIChvciAoaWRlbnRpY2FsPyBkb2N1bWVudC5yZWFkeS1zdGF0ZSA6Y29tcGxldGUpXG4gICAgICAgIChpZGVudGljYWw/IGRvY3VtZW50LnJlYWR5LXN0YXRlIDppbnRlcmFjdGl2ZSkpXG4gIChydW4tc2NyaXB0cylcbiAgKGlmIHdpbmRvdy5hZGQtZXZlbnQtbGlzdGVuZXJcbiAgICAoLmFkZC1ldmVudC1saXN0ZW5lciB3aW5kb3cgOkRPTUNvbnRlbnRMb2FkZWQgcnVuLXNjcmlwdHMgZmFsc2UpXG4gICAgKC5hdHRhY2gtZXZlbnQgd2luZG93IDpvbmxvYWQgcnVuLXNjcmlwdHMpKSlcbiJdfQ==

},{"./../compiler":12,"./../reader":32,"./../runtime":33,"./../sequence":34}],14:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.expander',
            doc: 'wisp syntax and macro expander module'
        };
    var wisp_ast = require('./ast');
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var isSymbol = wisp_ast.isSymbol;
    var isKeyword = wisp_ast.isKeyword;
    var isQuote = wisp_ast.isQuote;
    var symbol = wisp_ast.symbol;
    var namespace = wisp_ast.namespace;
    var name = wisp_ast.name;
    var isUnquote = wisp_ast.isUnquote;
    var isUnquoteSplicing = wisp_ast.isUnquoteSplicing;
    var wisp_sequence = require('./sequence');
    var isList = wisp_sequence.isList;
    var list = wisp_sequence.list;
    var conj = wisp_sequence.conj;
    var partition = wisp_sequence.partition;
    var seq = wisp_sequence.seq;
    var isEmpty = wisp_sequence.isEmpty;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var isEvery = wisp_sequence.isEvery;
    var concat = wisp_sequence.concat;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var last = wisp_sequence.last;
    var butlast = wisp_sequence.butlast;
    var interleave = wisp_sequence.interleave;
    var cons = wisp_sequence.cons;
    var count = wisp_sequence.count;
    var some = wisp_sequence.some;
    var assoc = wisp_sequence.assoc;
    var reduce = wisp_sequence.reduce;
    var filter = wisp_sequence.filter;
    var isSeq = wisp_sequence.isSeq;
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isDictionary = wisp_runtime.isDictionary;
    var isVector = wisp_runtime.isVector;
    var keys = wisp_runtime.keys;
    var vals = wisp_runtime.vals;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isBoolean = wisp_runtime.isBoolean;
    var isDate = wisp_runtime.isDate;
    var isRePattern = wisp_runtime.isRePattern;
    var isEven = wisp_runtime.isEven;
    var isEqual = wisp_runtime.isEqual;
    var max = wisp_runtime.max;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var dictionary = wisp_runtime.dictionary;
    var subs = wisp_runtime.subs;
    var wisp_string = require('./string');
    var split = wisp_string.split;
}
var __macros__ = exports.__macros__ = {};
var expand = function expand(expander, form, env) {
    return function () {
        var metadataø1 = meta(form) || {};
        var parmasø1 = rest(form);
        var implicitø1 = map(function ($1) {
                return isEqual('&form', $1) ? form : isEqual('&env', $1) ? env : 'else' ? $1 : void 0;
            }, (meta(expander) || 0)['implicit'] || []);
        var paramsø1 = vec(concat(implicitø1, vec(rest(form))));
        var expansionø1 = expander.apply(void 0, paramsø1);
        return expansionø1 ? withMeta(expansionø1, conj(metadataø1, meta(expansionø1))) : expansionø1;
    }.call(this);
};
var installMacro = exports.installMacro = function installMacro(op, expander) {
        return (__macros__ || 0)[name(op)] = expander;
    };
var macro = function macro(op) {
    return isSymbol(op) && (__macros__ || 0)[name(op)];
};
var isMethodSyntax = exports.isMethodSyntax = function isMethodSyntax(op) {
        return function () {
            var idø1 = isSymbol(op) && name(op);
            return idø1 && '.' === first(idø1) && !('-' === second(idø1)) && !('.' === idø1);
        }.call(this);
    };
var isFieldSyntax = exports.isFieldSyntax = function isFieldSyntax(op) {
        return function () {
            var idø1 = isSymbol(op) && name(op);
            return idø1 && '.' === first(idø1) && '-' === second(idø1);
        }.call(this);
    };
var isNewSyntax = exports.isNewSyntax = function isNewSyntax(op) {
        return function () {
            var idø1 = isSymbol(op) && name(op);
            return idø1 && '.' === last(idø1) && !('.' === idø1);
        }.call(this);
    };
var methodSyntax = exports.methodSyntax = function methodSyntax(op, target) {
        var params = Array.prototype.slice.call(arguments, 2);
        return function () {
            var opMetaø1 = meta(op);
            var formStartø1 = (opMetaø1 || 0)['start'];
            var targetMetaø1 = meta(target);
            var memberø1 = withMeta(symbol(subs(name(op), 1)), conj(opMetaø1, {
                    'start': {
                        'line': (formStartø1 || 0)['line'],
                        'column': inc((formStartø1 || 0)['column'])
                    }
                }));
            var agetø1 = withMeta(symbol(void 0, 'aget'), conj(opMetaø1, {
                    'end': {
                        'line': (formStartø1 || 0)['line'],
                        'column': inc((formStartø1 || 0)['column'])
                    }
                }));
            var methodø1 = withMeta(list.apply(void 0, [agetø1].concat([target], [list.apply(void 0, [symbol(void 0, 'quote')].concat([memberø1]))])), conj(opMetaø1, { 'end': (meta(target) || 0)['end'] }));
            return isNil(target) ? (function () {
                throw Error('Malformed method expression, expecting (.method object ...)');
            })() : list.apply(void 0, [methodø1].concat(vec(params)));
        }.call(this);
    };
var fieldSyntax = exports.fieldSyntax = function fieldSyntax(field, target) {
        var more = Array.prototype.slice.call(arguments, 2);
        return function () {
            var metadataø1 = meta(field);
            var startø1 = (metadataø1 || 0)['start'];
            var endø1 = (metadataø1 || 0)['end'];
            var memberø1 = withMeta(symbol(subs(name(field), 2)), conj(metadataø1, {
                    'start': {
                        'line': (startø1 || 0)['line'],
                        'column': (startø1 || 0)['column'] + 2
                    }
                }));
            return isNil(target) || count(more) ? (function () {
                throw Error('Malformed member expression, expecting (.-member target)');
            })() : list.apply(void 0, [symbol(void 0, 'aget')].concat([target], [list.apply(void 0, [symbol(void 0, 'quote')].concat([memberø1]))]));
        }.call(this);
    };
var newSyntax = exports.newSyntax = function newSyntax(op) {
        var params = Array.prototype.slice.call(arguments, 1);
        return function () {
            var idø1 = name(op);
            var idMetaø1 = (idø1 || 0)['meta'];
            var renameø1 = subs(idø1, 0, dec(count(idø1)));
            var constructorø1 = withMeta(symbol(renameø1), conj(idMetaø1, {
                    'end': {
                        'line': ((idMetaø1 || 0)['end'] || 0)['line'],
                        'column': dec(((idMetaø1 || 0)['end'] || 0)['column'])
                    }
                }));
            var operatorø1 = withMeta(symbol(void 0, 'new'), conj(idMetaø1, {
                    'start': {
                        'line': ((idMetaø1 || 0)['end'] || 0)['line'],
                        'column': dec(((idMetaø1 || 0)['end'] || 0)['column'])
                    }
                }));
            return list.apply(void 0, [symbol(void 0, 'new')].concat([constructorø1], vec(params)));
        }.call(this);
    };
var keywordInvoke = exports.keywordInvoke = function keywordInvoke(keyword, target) {
        return list.apply(void 0, [symbol(void 0, 'get')].concat([target], [keyword]));
    };
var desugar = function desugar(expander, form) {
    return function () {
        var desugaredø1 = expander.apply(void 0, vec(form));
        var metadataø1 = conj({}, meta(form), meta(desugaredø1));
        return withMeta(desugaredø1, metadataø1);
    }.call(this);
};
var macroexpand1 = exports.macroexpand1 = function macroexpand1(form) {
        return function () {
            var opø1 = isList(form) && first(form);
            var expanderø1 = macro(opø1);
            return expanderø1 ? expand(expanderø1, form) : isKeyword(opø1) ? desugar(keywordInvoke, form) : isFieldSyntax(opø1) ? desugar(fieldSyntax, form) : isMethodSyntax(opø1) ? desugar(methodSyntax, form) : isNewSyntax(opø1) ? desugar(newSyntax, form) : 'else' ? form : void 0;
        }.call(this);
    };
var macroexpand = exports.macroexpand = function macroexpand(form) {
        return function loop() {
            var recur = loop;
            var originalø1 = form;
            var expandedø1 = macroexpand1(form);
            do {
                recur = originalø1 === expandedø1 ? originalø1 : (loop[0] = expandedø1, loop[1] = macroexpand1(expandedø1), loop);
            } while (originalø1 = loop[0], expandedø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var syntaxQuote = exports.syntaxQuote = function syntaxQuote(form) {
        return isSymbol(form) ? list(symbol(void 0, 'quote'), form) : isKeyword(form) ? list(symbol(void 0, 'quote'), form) : isNumber(form) || isString(form) || isBoolean(form) || isNil(form) || isRePattern(form) ? form : isUnquote(form) ? second(form) : isUnquoteSplicing(form) ? readerError('Illegal use of `~@` expression, can only be present in a list') : isEmpty(form) ? form : isDictionary(form) ? list(symbol(void 0, 'apply'), symbol(void 0, 'dictionary'), cons(symbol(void 0, '.concat'), sequenceExpand(concat.apply(void 0, seq(form))))) : isVector(form) ? cons(symbol(void 0, '.concat'), sequenceExpand(form)) : isList(form) ? isEmpty(form) ? cons(symbol(void 0, 'list'), void 0) : list(symbol(void 0, 'apply'), symbol(void 0, 'list'), cons(symbol(void 0, '.concat'), sequenceExpand(form))) : 'else' ? readerError('Unknown Collection type') : void 0;
    };
var syntaxQuoteExpand = exports.syntaxQuoteExpand = syntaxQuote;
var unquoteSplicingExpand = exports.unquoteSplicingExpand = function unquoteSplicingExpand(form) {
        return isVector(form) ? form : list(symbol(void 0, 'vec'), form);
    };
var sequenceExpand = exports.sequenceExpand = function sequenceExpand(forms) {
        return map(function (form) {
            return isUnquote(form) ? [second(form)] : isUnquoteSplicing(form) ? unquoteSplicingExpand(second(form)) : 'else' ? [syntaxQuoteExpand(form)] : void 0;
        }, forms);
    };
installMacro('syntax-quote', syntaxQuote);
var notEqual = exports.notEqual = function notEqual() {
        var body = Array.prototype.slice.call(arguments, 0);
        return list.apply(void 0, [symbol(void 0, 'not')].concat([list.apply(void 0, [symbol(void 0, '=')].concat(vec(body)))]));
    };
installMacro('not=', notEqual);
var expandCond = exports.expandCond = function expandCond() {
        var clauses = Array.prototype.slice.call(arguments, 0);
        return !isEmpty(clauses) ? list(symbol(void 0, 'if'), first(clauses), isEmpty(rest(clauses)) ? (function () {
            throw Error('cond requires an even number of forms');
        })() : second(clauses), cons(symbol(void 0, 'cond'), rest(rest(clauses)))) : void 0;
    };
installMacro('cond', expandCond);
var expandDefn = exports.expandDefn = function expandDefn(andForm, name) {
        var docPlusMetaPlusBody = Array.prototype.slice.call(arguments, 2);
        return function () {
            var docø1 = isString(first(docPlusMetaPlusBody)) ? first(docPlusMetaPlusBody) : void 0;
            var metaPlusBodyø1 = docø1 ? rest(docPlusMetaPlusBody) : docPlusMetaPlusBody;
            var metadataø1 = isDictionary(first(metaPlusBodyø1)) ? conj({ 'doc': docø1 }, first(metaPlusBodyø1)) : void 0;
            var bodyø1 = metadataø1 ? rest(metaPlusBodyø1) : metaPlusBodyø1;
            var idø1 = withMeta(name, conj(meta(name) || {}, metadataø1));
            var fnø1 = withMeta(list.apply(void 0, [symbol(void 0, 'fn')].concat([idø1], vec(bodyø1))), meta(andForm));
            return list.apply(void 0, [symbol(void 0, 'def')].concat([idø1], [fnø1]));
        }.call(this);
    };
installMacro('defn', withMeta(expandDefn, { 'implicit': ['&form'] }));
var expandPrivateDefn = exports.expandPrivateDefn = function expandPrivateDefn(name) {
        var body = Array.prototype.slice.call(arguments, 1);
        return function () {
            var metadataø1 = conj(meta(name) || {}, { 'private': true });
            var idø1 = withMeta(name, metadataø1);
            return list.apply(void 0, [symbol(void 0, 'defn')].concat([idø1], vec(body)));
        }.call(this);
    };
installMacro('defn-', expandPrivateDefn);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvZXhwYW5kZXIud2lzcCJdLCJuYW1lcyI6WyJtZXRhIiwid2l0aE1ldGEiLCJpc1N5bWJvbCIsImlzS2V5d29yZCIsImlzUXVvdGUiLCJzeW1ib2wiLCJuYW1lc3BhY2UiLCJuYW1lIiwiaXNVbnF1b3RlIiwiaXNVbnF1b3RlU3BsaWNpbmciLCJpc0xpc3QiLCJsaXN0IiwiY29uaiIsInBhcnRpdGlvbiIsInNlcSIsImlzRW1wdHkiLCJtYXAiLCJ2ZWMiLCJpc0V2ZXJ5IiwiY29uY2F0IiwiZmlyc3QiLCJzZWNvbmQiLCJ0aGlyZCIsInJlc3QiLCJsYXN0IiwiYnV0bGFzdCIsImludGVybGVhdmUiLCJjb25zIiwiY291bnQiLCJzb21lIiwiYXNzb2MiLCJyZWR1Y2UiLCJmaWx0ZXIiLCJpc1NlcSIsImlzTmlsIiwiaXNEaWN0aW9uYXJ5IiwiaXNWZWN0b3IiLCJrZXlzIiwidmFscyIsImlzU3RyaW5nIiwiaXNOdW1iZXIiLCJpc0Jvb2xlYW4iLCJpc0RhdGUiLCJpc1JlUGF0dGVybiIsImlzRXZlbiIsImlzRXF1YWwiLCJtYXgiLCJpbmMiLCJkZWMiLCJkaWN0aW9uYXJ5Iiwic3VicyIsInNwbGl0IiwiX19tYWNyb3NfXyIsImV4cGFuZCIsImV4cGFuZGVyIiwiZm9ybSIsImVudiIsIm1ldGFkYXRhw7gxIiwicGFybWFzw7gxIiwiaW1wbGljaXTDuDEiLCIkMSIsInBhcmFtc8O4MSIsImV4cGFuc2lvbsO4MSIsImluc3RhbGxNYWNybyIsIm9wIiwibWFjcm8iLCJpc01ldGhvZFN5bnRheCIsImlkw7gxIiwiaXNGaWVsZFN5bnRheCIsImlzTmV3U3ludGF4IiwibWV0aG9kU3ludGF4IiwidGFyZ2V0IiwicGFyYW1zIiwib3BNZXRhw7gxIiwiZm9ybVN0YXJ0w7gxIiwidGFyZ2V0TWV0YcO4MSIsIm1lbWJlcsO4MSIsImFnZXTDuDEiLCJtZXRob2TDuDEiLCJFcnJvciIsImZpZWxkU3ludGF4IiwiZmllbGQiLCJtb3JlIiwic3RhcnTDuDEiLCJlbmTDuDEiLCJuZXdTeW50YXgiLCJpZE1ldGHDuDEiLCJyZW5hbWXDuDEiLCJjb25zdHJ1Y3RvcsO4MSIsIm9wZXJhdG9yw7gxIiwia2V5d29yZEludm9rZSIsImtleXdvcmQiLCJkZXN1Z2FyIiwiZGVzdWdhcmVkw7gxIiwibWFjcm9leHBhbmQxIiwib3DDuDEiLCJleHBhbmRlcsO4MSIsIm1hY3JvZXhwYW5kIiwib3JpZ2luYWzDuDEiLCJleHBhbmRlZMO4MSIsInN5bnRheFF1b3RlIiwicmVhZGVyRXJyb3IiLCJzZXF1ZW5jZUV4cGFuZCIsInN5bnRheFF1b3RlRXhwYW5kIiwidW5xdW90ZVNwbGljaW5nRXhwYW5kIiwiZm9ybXMiLCJub3RFcXVhbCIsImJvZHkiLCJleHBhbmRDb25kIiwiY2xhdXNlcyIsImV4cGFuZERlZm4iLCJhbmRGb3JtIiwiZG9jUGx1c01ldGFQbHVzQm9keSIsImRvY8O4MSIsIm1ldGFQbHVzQm9kecO4MSIsImJvZHnDuDEiLCJmbsO4MSIsImV4cGFuZFByaXZhdGVEZWZuIl0sIm1hcHBpbmdzIjoiQUFBQTtJOzs7VUFBQTtJLGdDQUFBO0ksSUFFOEJBLElBQUEsRyxTQUFBQSxJLENBRjlCO0ksSUFFbUNDLFFBQUEsRyxTQUFBQSxRLENBRm5DO0ksSUFFNkNDLFFBQUEsRyxTQUFBQSxRLENBRjdDO0ksSUFFcURDLFNBQUEsRyxTQUFBQSxTLENBRnJEO0ksSUFHOEJDLE9BQUEsRyxTQUFBQSxPLENBSDlCO0ksSUFHcUNDLE1BQUEsRyxTQUFBQSxNLENBSHJDO0ksSUFHNENDLFNBQUEsRyxTQUFBQSxTLENBSDVDO0ksSUFHc0RDLElBQUEsRyxTQUFBQSxJLENBSHREO0ksSUFJOEJDLFNBQUEsRyxTQUFBQSxTLENBSjlCO0ksSUFJdUNDLGlCQUFBLEcsU0FBQUEsaUIsQ0FKdkM7SSwwQ0FBQTtJLElBS21DQyxNQUFBLEcsY0FBQUEsTSxDQUxuQztJLElBS3lDQyxJQUFBLEcsY0FBQUEsSSxDQUx6QztJLElBSzhDQyxJQUFBLEcsY0FBQUEsSSxDQUw5QztJLElBS21EQyxTQUFBLEcs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TixDQUFULEM7WUFFQSxJQUFBNEQsSSxHQUFJbEUsUUFBRCxDQUFXTSxJQUFYLEVBQWdCa0QsVUFBaEIsQ0FBSCxDO1lBQ0osTyxVQUFBLEMsTUFBQSxFLE9BQUUsQyxNQUFBLEUsTUFBQSxDLFVBQU1VLEksT0FBS3dDLEksRUFBYixFO2NBSEYsQyxJQUFBLEU7S0FMRixDO0FBU0M1QyxZQUFELEMsT0FBQSxFQUFzQnNELGlCQUF0QixDIiwic291cmNlc0NvbnRlbnQiOlsiKG5zIHdpc3AuZXhwYW5kZXJcbiAgXCJ3aXNwIHN5bnRheCBhbmQgbWFjcm8gZXhwYW5kZXIgbW9kdWxlXCJcbiAgKDpyZXF1aXJlIFt3aXNwLmFzdCA6cmVmZXIgW21ldGEgd2l0aC1tZXRhIHN5bWJvbD8ga2V5d29yZD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1b3RlPyBzeW1ib2wgbmFtZXNwYWNlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVucXVvdGU/IHVucXVvdGUtc3BsaWNpbmc/XV1cbiAgICAgICAgICAgIFt3aXNwLnNlcXVlbmNlIDpyZWZlciBbbGlzdD8gbGlzdCBjb25qIHBhcnRpdGlvbiBzZXFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1wdHk/IG1hcCB2ZWMgZXZlcnk/IGNvbmNhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCBzZWNvbmQgdGhpcmQgcmVzdCBsYXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1dGxhc3QgaW50ZXJsZWF2ZSBjb25zIGNvdW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbWUgYXNzb2MgcmVkdWNlIGZpbHRlciBzZXE/XV1cbiAgICAgICAgICAgIFt3aXNwLnJ1bnRpbWUgOnJlZmVyIFtuaWw/IGRpY3Rpb25hcnk/IHZlY3Rvcj8ga2V5c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHMgc3RyaW5nPyBudW1iZXI/IGJvb2xlYW4/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZT8gcmUtcGF0dGVybj8gZXZlbj8gPSBtYXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmMgZGVjIGRpY3Rpb25hcnkgc3Vic11dXG4gICAgICAgICAgICBbd2lzcC5zdHJpbmcgOnJlZmVyIFtzcGxpdF1dKSlcblxuXG4oZGVmICoqbWFjcm9zKioge30pXG5cbihkZWZuLSBleHBhbmRcbiAgXCJBcHBsaWVzIG1hY3JvIHJlZ2lzdGVyZWQgd2l0aCBnaXZlbiBgbmFtZWAgdG8gYSBnaXZlbiBgZm9ybWBcIlxuICBbZXhwYW5kZXIgZm9ybSBlbnZdXG4gIChsZXQgW21ldGFkYXRhIChvciAobWV0YSBmb3JtKSB7fSlcbiAgICAgICAgcGFybWFzIChyZXN0IGZvcm0pXG4gICAgICAgIGltcGxpY2l0IChtYXAgIyhjb25kICg9IDomZm9ybSAlKSBmb3JtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICg9IDomZW52ICUpIGVudlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ZWxzZSAlKVxuICAgICAgICAgICAgICAgICAgICAgIChvciAoOmltcGxpY2l0IChtZXRhIGV4cGFuZGVyKSkgW10pKVxuICAgICAgICBwYXJhbXMgKHZlYyAoY29uY2F0IGltcGxpY2l0ICh2ZWMgKHJlc3QgZm9ybSkpKSlcblxuICAgICAgICBleHBhbnNpb24gKGFwcGx5IGV4cGFuZGVyIHBhcmFtcyldXG4gICAgKGlmIGV4cGFuc2lvblxuICAgICAgKHdpdGgtbWV0YSBleHBhbnNpb24gKGNvbmogbWV0YWRhdGEgKG1ldGEgZXhwYW5zaW9uKSkpXG4gICAgICBleHBhbnNpb24pKSlcblxuKGRlZm4gaW5zdGFsbC1tYWNybyFcbiAgXCJSZWdpc3RlcnMgZ2l2ZW4gYG1hY3JvYCB3aXRoIGEgZ2l2ZW4gYG5hbWVgXCJcbiAgW29wIGV4cGFuZGVyXVxuICAoc2V0ISAoZ2V0ICoqbWFjcm9zKiogKG5hbWUgb3ApKSBleHBhbmRlcikpXG5cbihkZWZuLSBtYWNyb1xuICBcIlJldHVybnMgdHJ1ZSBpZiBtYWNybyB3aXRoIGEgZ2l2ZW4gbmFtZSBpcyByZWdpc3RlcmVkXCJcbiAgW29wXVxuICAoYW5kIChzeW1ib2w/IG9wKVxuICAgICAgIChnZXQgKiptYWNyb3MqKiAobmFtZSBvcCkpKSlcblxuXG4oZGVmbiBtZXRob2Qtc3ludGF4P1xuICBbb3BdXG4gIChsZXQgW2lkIChhbmQgKHN5bWJvbD8gb3ApIChuYW1lIG9wKSldXG4gICAgKGFuZCBpZFxuICAgICAgICAgKGlkZW50aWNhbD8gXFwuIChmaXJzdCBpZCkpXG4gICAgICAgICAobm90IChpZGVudGljYWw/IFxcLSAoc2Vjb25kIGlkKSkpXG4gICAgICAgICAobm90IChpZGVudGljYWw/IFxcLiBpZCkpKSkpXG5cbihkZWZuIGZpZWxkLXN5bnRheD9cbiAgW29wXVxuICAobGV0IFtpZCAoYW5kIChzeW1ib2w/IG9wKSAobmFtZSBvcCkpXVxuICAgIChhbmQgaWRcbiAgICAgICAgIChpZGVudGljYWw/IFxcLiAoZmlyc3QgaWQpKVxuICAgICAgICAgKGlkZW50aWNhbD8gXFwtIChzZWNvbmQgaWQpKSkpKVxuXG4oZGVmbiBuZXctc3ludGF4P1xuICBbb3BdXG4gIChsZXQgW2lkIChhbmQgKHN5bWJvbD8gb3ApIChuYW1lIG9wKSldXG4gICAgKGFuZCBpZFxuICAgICAgICAgKGlkZW50aWNhbD8gXFwuIChsYXN0IGlkKSlcbiAgICAgICAgIChub3QgKGlkZW50aWNhbD8gXFwuIGlkKSkpKSlcblxuKGRlZm4gbWV0aG9kLXN5bnRheFxuICBcIkV4YW1wbGU6XG4gICcoLnN1YnN0cmluZyBzdHJpbmcgMiA1KSA9PiAnKChhZ2V0IHN0cmluZyAnc3Vic3RyaW5nKSAyIDUpXCJcbiAgW29wIHRhcmdldCAmIHBhcmFtc11cbiAgKGxldCBbb3AtbWV0YSAobWV0YSBvcClcbiAgICAgICAgZm9ybS1zdGFydCAoOnN0YXJ0IG9wLW1ldGEpXG4gICAgICAgIHRhcmdldC1tZXRhIChtZXRhIHRhcmdldClcbiAgICAgICAgbWVtYmVyICh3aXRoLW1ldGEgKHN5bWJvbCAoc3VicyAobmFtZSBvcCkgMSkpXG4gICAgICAgICAgICAgICAgIDs7IEluY2x1ZGUgbWV0YWRhdCBmcm9tIHRoZSBvcmlnaW5hbCBzeW1ib2wganVzdFxuICAgICAgICAgICAgICAgICAoY29uaiBvcC1tZXRhXG4gICAgICAgICAgICAgICAgICAgICAgIHs6c3RhcnQgezpsaW5lICg6bGluZSBmb3JtLXN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6Y29sdW1uIChpbmMgKDpjb2x1bW4gZm9ybS1zdGFydCkpfX0pKVxuICAgICAgICA7OyBBZGQgbWV0YWRhdGEgdG8gYWdldCBzeW1ib2wgdGhhdCB3aWxsIG1hcCB0byB0aGUgZmlyc3QgYC5gXG4gICAgICAgIDs7IGNoYXJhY3RlciBvZiB0aGUgbWV0aG9kIG5hbWUuXG4gICAgICAgIGFnZXQgKHdpdGgtbWV0YSAnYWdldFxuICAgICAgICAgICAgICAgKGNvbmogb3AtbWV0YVxuICAgICAgICAgICAgICAgICAgICAgezplbmQgezpsaW5lICg6bGluZSBmb3JtLXN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpjb2x1bW4gKGluYyAoOmNvbHVtbiBmb3JtLXN0YXJ0KSl9fSkpXG5cbiAgICAgICAgOzsgRmlyc3QgdHdvIGZvcm1zICguc3Vic3RyaW5nIHN0cmluZyAuLi4pIGV4cGFuZCB0b1xuICAgICAgICA7OyAoKGFnZXQgc3RyaW5nICdzdWJzdHJpbmcpIC4uLikgdGhlcmUgZm9yIGV4cGFuc2lvbiBnZXRzXG4gICAgICAgIDs7IHBvc2l0aW9uIG1ldGFkYXRhIGZyb20gc3RhcnQgb2YgdGhlIGZpcnN0IGAuc3Vic3RyaW5nYCBmb3JtXG4gICAgICAgIDs7IHRvIHRoZSBlbmQgb2YgdGhlIGBzdHJpbmdgIGZvcm0uXG4gICAgICAgIG1ldGhvZCAod2l0aC1tZXRhIGAofmFnZXQgfnRhcmdldCAocXVvdGUgfm1lbWJlcikpXG4gICAgICAgICAgICAgICAgIChjb25qIG9wLW1ldGFcbiAgICAgICAgICAgICAgICAgICAgICAgezplbmQgKDplbmQgKG1ldGEgdGFyZ2V0KSl9KSldXG4gICAgKGlmIChuaWw/IHRhcmdldClcbiAgICAgICh0aHJvdyAoRXJyb3IgXCJNYWxmb3JtZWQgbWV0aG9kIGV4cHJlc3Npb24sIGV4cGVjdGluZyAoLm1ldGhvZCBvYmplY3QgLi4uKVwiKSlcbiAgICAgIGAofm1ldGhvZCB+QHBhcmFtcykpKSlcblxuKGRlZm4gZmllbGQtc3ludGF4XG4gIFwiRXhhbXBsZTpcbiAgJyguLWZpZWxkIG9iamVjdCkgPT4gJyhhZ2V0IG9iamVjdCAnZmllbGQpXCJcbiAgW2ZpZWxkIHRhcmdldCAmIG1vcmVdXG4gIChsZXQgW21ldGFkYXRhIChtZXRhIGZpZWxkKVxuICAgICAgICBzdGFydCAoOnN0YXJ0IG1ldGFkYXRhKVxuICAgICAgICBlbmQgKDplbmQgbWV0YWRhdGEpXG4gICAgICAgIG1lbWJlciAod2l0aC1tZXRhIChzeW1ib2wgKHN1YnMgKG5hbWUgZmllbGQpIDIpKVxuICAgICAgICAgICAgICAgICAoY29uaiBtZXRhZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICB7OnN0YXJ0IHs6bGluZSAoOmxpbmUgc3RhcnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpjb2x1bW4gKCsgKDpjb2x1bW4gc3RhcnQpIDIpfX0pKV1cbiAgICAoaWYgKG9yIChuaWw/IHRhcmdldClcbiAgICAgICAgICAgIChjb3VudCBtb3JlKSlcbiAgICAgICh0aHJvdyAoRXJyb3IgXCJNYWxmb3JtZWQgbWVtYmVyIGV4cHJlc3Npb24sIGV4cGVjdGluZyAoLi1tZW1iZXIgdGFyZ2V0KVwiKSlcbiAgICAgIGAoYWdldCB+dGFyZ2V0IChxdW90ZSB+bWVtYmVyKSkpKSlcblxuKGRlZm4gbmV3LXN5bnRheFxuICBcIkV4YW1wbGU6XG4gICcoUG9pbnQuIHggeSkgPT4gJyhuZXcgUG9pbnQgeCB5KVwiXG4gIFtvcCAmIHBhcmFtc11cbiAgKGxldCBbaWQgKG5hbWUgb3ApXG4gICAgICAgIGlkLW1ldGEgKDptZXRhIGlkKVxuICAgICAgICByZW5hbWUgKHN1YnMgaWQgMCAoZGVjIChjb3VudCBpZCkpKVxuICAgICAgICA7OyBjb25zdHJ1Y3R1ciBzeW1ib2wgaW5oZXJpdHMgbWV0YWRhIGZyb20gdGhlIGZpcnN0IGBvcGAgZm9ybVxuICAgICAgICA7OyBpdCdzIGp1c3QgaXQncyBlbmQgY29sdW1uIGluZm8gaXMgdXBkYXRlZCB0byByZWZsZWN0IHN1YnRyYWN0aW9uXG4gICAgICAgIDs7IG9mIGAuYCBjaGFyYWN0ZXIuXG4gICAgICAgIGNvbnN0cnVjdG9yICh3aXRoLW1ldGEgKHN5bWJvbCByZW5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgKGNvbmogaWQtbWV0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHs6ZW5kIHs6bGluZSAoOmxpbmUgKDplbmQgaWQtbWV0YSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpjb2x1bW4gKGRlYyAoOmNvbHVtbiAoOmVuZCBpZC1tZXRhKSkpfX0pKVxuICAgICAgICBvcGVyYXRvciAod2l0aC1tZXRhICduZXdcbiAgICAgICAgICAgICAgICAgICAoY29uaiBpZC1tZXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgezpzdGFydCB7OmxpbmUgKDpsaW5lICg6ZW5kIGlkLW1ldGEpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDpjb2x1bW4gKGRlYyAoOmNvbHVtbiAoOmVuZCBpZC1tZXRhKSkpfX0pKV1cbiAgICBgKG5ldyB+Y29uc3RydWN0b3IgfkBwYXJhbXMpKSlcblxuKGRlZm4ga2V5d29yZC1pbnZva2VcbiAgXCJDYWxsaW5nIGEga2V5d29yZCBkZXN1Z2FycyB0byBwcm9wZXJ0eSBhY2Nlc3Mgd2l0aCB0aGF0XG4gIGtleXdvcmQgbmFtZSBvbiB0aGUgZ2l2ZW4gYXJndW1lbnQ6XG4gICcoOmZvbyBiYXIpID0+ICcoZ2V0IGJhciA6Zm9vKVwiXG4gIFtrZXl3b3JkIHRhcmdldF1cbiAgYChnZXQgfnRhcmdldCB+a2V5d29yZCkpXG5cbihkZWZuLSBkZXN1Z2FyXG4gIFtleHBhbmRlciBmb3JtXVxuICAobGV0IFtkZXN1Z2FyZWQgKGFwcGx5IGV4cGFuZGVyICh2ZWMgZm9ybSkpXG4gICAgICAgIG1ldGFkYXRhIChjb25qIHt9IChtZXRhIGZvcm0pIChtZXRhIGRlc3VnYXJlZCkpXVxuICAgICh3aXRoLW1ldGEgZGVzdWdhcmVkIG1ldGFkYXRhKSkpXG5cbihkZWZuIG1hY3JvZXhwYW5kLTFcbiAgXCJJZiBmb3JtIHJlcHJlc2VudHMgYSBtYWNybyBmb3JtLCByZXR1cm5zIGl0cyBleHBhbnNpb24sXG4gIGVsc2UgcmV0dXJucyBmb3JtLlwiXG4gIFtmb3JtXVxuICAobGV0IFtvcCAoYW5kIChsaXN0PyBmb3JtKVxuICAgICAgICAgICAgICAgIChmaXJzdCBmb3JtKSlcbiAgICAgICAgZXhwYW5kZXIgKG1hY3JvIG9wKV1cbiAgICAoY29uZCBleHBhbmRlciAoZXhwYW5kIGV4cGFuZGVyIGZvcm0pXG4gICAgICAgICAgOzsgQ2FsbGluZyBhIGtleXdvcmQgY29tcGlsZXMgdG8gZ2V0dGluZyB2YWx1ZSBmcm9tIGdpdmVuXG4gICAgICAgICAgOzsgb2JqZWN0IGFzc29jaXRlZCB3aXRoIHRoYXQga2V5OlxuICAgICAgICAgIDs7ICcoOmZvbyBiYXIpID0+ICcoZ2V0IGJhciA6Zm9vKVxuICAgICAgICAgIChrZXl3b3JkPyBvcCkgKGRlc3VnYXIga2V5d29yZC1pbnZva2UgZm9ybSlcbiAgICAgICAgICA7OyAnKC4tZmllbGQgb2JqZWN0KSA9PiAoYWdldCBvYmplY3QgJ2ZpZWxkKVxuICAgICAgICAgIChmaWVsZC1zeW50YXg/IG9wKSAoZGVzdWdhciBmaWVsZC1zeW50YXggZm9ybSlcbiAgICAgICAgICA7OyAnKC5zdWJzdHJpbmcgc3RyaW5nIDIgNSkgPT4gJygoYWdldCBzdHJpbmcgJ3N1YnN0cmluZykgMiA1KVxuICAgICAgICAgIChtZXRob2Qtc3ludGF4PyBvcCkgKGRlc3VnYXIgbWV0aG9kLXN5bnRheCBmb3JtKVxuICAgICAgICAgIDs7ICcoUG9pbnQuIHggeSkgPT4gJyhuZXcgUG9pbnQgeCB5KVxuICAgICAgICAgIChuZXctc3ludGF4PyBvcCkgKGRlc3VnYXIgbmV3LXN5bnRheCBmb3JtKVxuICAgICAgICAgIDplbHNlIGZvcm0pKSlcblxuKGRlZm4gbWFjcm9leHBhbmRcbiAgXCJSZXBlYXRlZGx5IGNhbGxzIG1hY3JvZXhwYW5kLTEgb24gZm9ybSB1bnRpbCBpdCBubyBsb25nZXJcbiAgcmVwcmVzZW50cyBhIG1hY3JvIGZvcm0sIHRoZW4gcmV0dXJucyBpdC5cIlxuICBbZm9ybV1cbiAgKGxvb3AgW29yaWdpbmFsIGZvcm1cbiAgICAgICAgIGV4cGFuZGVkIChtYWNyb2V4cGFuZC0xIGZvcm0pXVxuICAgIChpZiAoaWRlbnRpY2FsPyBvcmlnaW5hbCBleHBhbmRlZClcbiAgICAgIG9yaWdpbmFsXG4gICAgICAocmVjdXIgZXhwYW5kZWQgKG1hY3JvZXhwYW5kLTEgZXhwYW5kZWQpKSkpKVxuXG5cbjs7IERlZmluZSBjb3JlIG1hY3Jvc1xuXG5cbjs7IFRPRE8gbWFrZSB0aGlzIGxhbmd1YWdlIGluZGVwZW5kZW50XG5cbihkZWZuIHN5bnRheC1xdW90ZSBbZm9ybV1cbiAgKGNvbmQgKHN5bWJvbD8gZm9ybSkgKGxpc3QgJ3F1b3RlIGZvcm0pXG4gICAgICAgIChrZXl3b3JkPyBmb3JtKSAobGlzdCAncXVvdGUgZm9ybSlcbiAgICAgICAgKG9yIChudW1iZXI/IGZvcm0pXG4gICAgICAgICAgICAoc3RyaW5nPyBmb3JtKVxuICAgICAgICAgICAgKGJvb2xlYW4/IGZvcm0pXG4gICAgICAgICAgICAobmlsPyBmb3JtKVxuICAgICAgICAgICAgKHJlLXBhdHRlcm4/IGZvcm0pKSBmb3JtXG5cbiAgICAgICAgKHVucXVvdGU/IGZvcm0pIChzZWNvbmQgZm9ybSlcbiAgICAgICAgKHVucXVvdGUtc3BsaWNpbmc/IGZvcm0pIChyZWFkZXItZXJyb3IgXCJJbGxlZ2FsIHVzZSBvZiBgfkBgIGV4cHJlc3Npb24sIGNhbiBvbmx5IGJlIHByZXNlbnQgaW4gYSBsaXN0XCIpXG5cbiAgICAgICAgKGVtcHR5PyBmb3JtKSBmb3JtXG5cbiAgICAgICAgOztcbiAgICAgICAgKGRpY3Rpb25hcnk/IGZvcm0pIChsaXN0ICdhcHBseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpY3Rpb25hcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb25zICcuY29uY2F0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoc2VxdWVuY2UtZXhwYW5kIChhcHBseSBjb25jYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzZXEgZm9ybSkpKSkpXG4gICAgICAgIDs7IElmIGEgdmVjdG9yIGZvcm0gZXhwYW5kIGFsbCBzdWItZm9ybXMgYW5kIGNvbmNhdGluYXRlXG4gICAgICAgIDs7IHRoZW0gdG9nYXRoZXI6XG4gICAgICAgIDs7XG4gICAgICAgIDs7IFt+YSBiIH5AY10gLT4gKC5jb25jYXQgW2FdIFsocXVvdGUgYildIGMpXG4gICAgICAgICh2ZWN0b3I/IGZvcm0pIChjb25zICcuY29uY2F0IChzZXF1ZW5jZS1leHBhbmQgZm9ybSkpXG5cbiAgICAgICAgOzsgSWYgYSBsaXN0IGZvcm0gZXhwYW5kIGFsbCB0aGUgc3ViLWZvcm1zIGFuZCBhcHBseVxuICAgICAgICA7OyBjb25jYXRpb25hdGlvbiB0byBhIGxpc3QgY29uc3RydWN0b3I6XG4gICAgICAgIDs7XG4gICAgICAgIDs7ICh+YSBiIH5AYykgLT4gKGFwcGx5IGxpc3QgKC5jb25jYXQgW2FdIFsocXVvdGUgYildIGMpKVxuICAgICAgICAobGlzdD8gZm9ybSkgKGlmIChlbXB0eT8gZm9ybSlcbiAgICAgICAgICAgICAgICAgICAgICAgKGNvbnMgJ2xpc3QgbmlsKVxuICAgICAgICAgICAgICAgICAgICAgICAobGlzdCAnYXBwbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvbnMgJy5jb25jYXQgKHNlcXVlbmNlLWV4cGFuZCBmb3JtKSkpKVxuXG4gICAgICAgIDplbHNlIChyZWFkZXItZXJyb3IgXCJVbmtub3duIENvbGxlY3Rpb24gdHlwZVwiKSkpXG4oZGVmIHN5bnRheC1xdW90ZS1leHBhbmQgc3ludGF4LXF1b3RlKVxuXG4oZGVmbiB1bnF1b3RlLXNwbGljaW5nLWV4cGFuZFxuICBbZm9ybV1cbiAgKGlmICh2ZWN0b3I/IGZvcm0pXG4gICAgZm9ybVxuICAgIChsaXN0ICd2ZWMgZm9ybSkpKVxuXG4oZGVmbiBzZXF1ZW5jZS1leHBhbmRcbiAgXCJUYWtlcyBzZXF1ZW5jZSBvZiBmb3JtcyBhbmQgZXhwYW5kcyB0aGVtOlxuXG4gICgodW5xdW90ZSBhKSkgLT4gKFthXSlcbiAgKCh1bnF1b3RlLXNwbGljaW5nIGEpIC0+IChhKVxuICAoYSkgLT4gKFsocXVvdGUgYildKVxuICAoKHVucXVvdGUgYSkgYiAodW5xdW90ZS1zcGxpY2luZyBhKSkgLT4gKFthXSBbKHF1b3RlIGIpXSBjKVwiXG4gIFtmb3Jtc11cbiAgKG1hcCAoZm4gW2Zvcm1dXG4gICAgICAgICAoY29uZCAodW5xdW90ZT8gZm9ybSkgWyhzZWNvbmQgZm9ybSldXG4gICAgICAgICAgICAgICAodW5xdW90ZS1zcGxpY2luZz8gZm9ybSkgKHVucXVvdGUtc3BsaWNpbmctZXhwYW5kIChzZWNvbmQgZm9ybSkpXG4gICAgICAgICAgICAgICA6ZWxzZSBbKHN5bnRheC1xdW90ZS1leHBhbmQgZm9ybSldKSlcbiAgICAgICBmb3JtcykpXG4oaW5zdGFsbC1tYWNybyEgOnN5bnRheC1xdW90ZSBzeW50YXgtcXVvdGUpXG5cbjs7IFRPRE86IE5ldyByZWFkZXIgdHJhbnNsYXRlcyBub3Q9IGNvcnJlY3RseVxuOzsgYnV0IGZvciB0aGUgdGltZSBiZWluZyB1c2Ugbm90LWVxdWFsIG5hbWVcbihkZWZuIG5vdC1lcXVhbFxuICBbJiBib2R5XVxuICBgKG5vdCAoPSB+QGJvZHkpKSlcbihpbnN0YWxsLW1hY3JvISA6bm90PSBub3QtZXF1YWwpXG5cblxuKGRlZm4gZXhwYW5kLWNvbmRcbiAgXCJUYWtlcyBhIHNldCBvZiB0ZXN0L2V4cHIgcGFpcnMuIEl0IGV2YWx1YXRlcyBlYWNoIHRlc3Qgb25lIGF0IGFcbiAgdGltZS4gIElmIGEgdGVzdCByZXR1cm5zIGxvZ2ljYWwgdHJ1ZSwgY29uZCBldmFsdWF0ZXMgYW5kIHJldHVybnNcbiAgdGhlIHZhbHVlIG9mIHRoZSBjb3JyZXNwb25kaW5nIGV4cHIgYW5kIGRvZXNuJ3QgZXZhbHVhdGUgYW55IG9mIHRoZVxuICBvdGhlciB0ZXN0cyBvciBleHBycy4gKGNvbmQpIHJldHVybnMgbmlsLlwiXG4gIFsmIGNsYXVzZXNdXG4gIChpZiAobm90IChlbXB0eT8gY2xhdXNlcykpXG4gICAgKGxpc3QgJ2lmIChmaXJzdCBjbGF1c2VzKVxuICAgICAgICAgIChpZiAoZW1wdHk/IChyZXN0IGNsYXVzZXMpKVxuICAgICAgICAgICAgKHRocm93IChFcnJvciBcImNvbmQgcmVxdWlyZXMgYW4gZXZlbiBudW1iZXIgb2YgZm9ybXNcIikpXG4gICAgICAgICAgICAoc2Vjb25kIGNsYXVzZXMpKVxuICAgICAgICAgIChjb25zICdjb25kIChyZXN0IChyZXN0IGNsYXVzZXMpKSkpKSlcbihpbnN0YWxsLW1hY3JvISA6Y29uZCBleHBhbmQtY29uZClcblxuKGRlZm4gZXhwYW5kLWRlZm5cbiAgXCJTYW1lIGFzIChkZWYgbmFtZSAoZm4gW3BhcmFtcyogXSBleHBycyopKSBvclxuICAoZGVmIG5hbWUgKGZuIChbcGFyYW1zKiBdIGV4cHJzKikrKSkgd2l0aCBhbnkgZG9jLXN0cmluZyBvciBhdHRycyBhZGRlZFxuICB0byB0aGUgdmFyIG1ldGFkYXRhXCJcbiAgWyZmb3JtIG5hbWUgJiBkb2MrbWV0YStib2R5XVxuICAobGV0IFtkb2MgKGlmIChzdHJpbmc/IChmaXJzdCBkb2MrbWV0YStib2R5KSlcbiAgICAgICAgICAgICAgKGZpcnN0IGRvYyttZXRhK2JvZHkpKVxuXG4gICAgICAgIDs7IElmIGRvY3N0cmluZyBpcyBmb3VuZCBpdCdzIG5vdCBwYXJ0IG9mIGJvZHkuXG4gICAgICAgIG1ldGErYm9keSAoaWYgZG9jIChyZXN0IGRvYyttZXRhK2JvZHkpIGRvYyttZXRhK2JvZHkpXG5cbiAgICAgICAgOzsgZGVmbiBtYXkgY29udGFpbiBhdHRyaWJ1dGUgbGlzdCBhZnRlclxuICAgICAgICA7OyBkb2NzdHJpbmcgb3IgYSBuYW1lLCBpbiB3aGljaCBjYXNlIGl0J3NcbiAgICAgICAgOzsgbWVyZ2VkIGludG8gbmFtZSBtZXRhZGF0YS5cbiAgICAgICAgbWV0YWRhdGEgKGlmIChkaWN0aW9uYXJ5PyAoZmlyc3QgbWV0YStib2R5KSlcbiAgICAgICAgICAgICAgICAgICAoY29uaiB7OmRvYyBkb2N9IChmaXJzdCBtZXRhK2JvZHkpKSlcblxuICAgICAgICA7OyBJZiBtZXRhZGF0YSBtYXAgaXMgZm91bmQgaXQncyBub3QgcGFydCBvZiBib2R5LlxuICAgICAgICBib2R5IChpZiBtZXRhZGF0YSAocmVzdCBtZXRhK2JvZHkpIG1ldGErYm9keSlcblxuICAgICAgICA7OyBDb21iaW5lIGFsbCB0aGUgbWV0YWRhdGEgYW5kIGFkZCB0byBhIG5hbWUuXG4gICAgICAgIGlkICh3aXRoLW1ldGEgbmFtZSAoY29uaiAob3IgKG1ldGEgbmFtZSkge30pIG1ldGFkYXRhKSlcblxuICAgICAgICBmbiAod2l0aC1tZXRhIGAoZm4gfmlkIH5AYm9keSkgKG1ldGEgJmZvcm0pKV1cbiAgICBgKGRlZiB+aWQgfmZuKSkpXG4oaW5zdGFsbC1tYWNybyEgOmRlZm4gKHdpdGgtbWV0YSBleHBhbmQtZGVmbiB7OmltcGxpY2l0IFs6JmZvcm1dfSkpXG5cblxuKGRlZm4gZXhwYW5kLXByaXZhdGUtZGVmblxuICBcIlNhbWUgYXMgKGRlZiBuYW1lIChmbiBbcGFyYW1zKiBdIGV4cHJzKikpIG9yXG4gIChkZWYgbmFtZSAoZm4gKFtwYXJhbXMqIF0gZXhwcnMqKSspKSB3aXRoIGFueSBkb2Mtc3RyaW5nIG9yIGF0dHJzIGFkZGVkXG4gIHRvIHRoZSB2YXIgbWV0YWRhdGFcIlxuICBbbmFtZSAmIGJvZHldXG4gIChsZXQgW21ldGFkYXRhIChjb25qIChvciAobWV0YSBuYW1lKSB7fSlcbiAgICAgICAgICAgICAgICAgICAgICAgezpwcml2YXRlIHRydWV9KVxuICAgICAgICBpZCAod2l0aC1tZXRhIG5hbWUgbWV0YWRhdGEpXVxuICAgIGAoZGVmbiB+aWQgfkBib2R5KSkpXG4oaW5zdGFsbC1tYWNybyA6ZGVmbi0gZXhwYW5kLXByaXZhdGUtZGVmbilcbiJdfQ==

},{"./ast":9,"./runtime":33,"./sequence":34,"./string":35}],15:[function(require,module,exports){
var Buffer=require("__browserify_Buffer");module.exports = encode;
function encode(input) {
  return new Buffer(input).toString('base64')
}
},{"__browserify_Buffer":3}],16:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
  Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
  Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*global exports:true, generateStatement:true, generateExpression:true, require:true, global:true*/
(function () {
    'use strict';

    var Syntax,
        Precedence,
        BinaryPrecedence,
        SourceNode,
        estraverse,
        esutils,
        isArray,
        base,
        indent,
        json,
        renumber,
        hexadecimal,
        quotes,
        escapeless,
        newline,
        space,
        parentheses,
        semicolons,
        safeConcatenation,
        directive,
        extra,
        parse,
        sourceMap,
        FORMAT_MINIFY,
        FORMAT_DEFAULTS;

    estraverse = require('estraverse');
    esutils = require('esutils');

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'

    };

    Precedence = {
        Sequence: 0,
        Yield: 1,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        Member: 17,
        Primary: 18
    };

    BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
    };

    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            comment: false,
            format: {
                indent: {
                    style: '    ',
                    base: 0,
                    adjustMultilineComment: false
                },
                newline: '\n',
                space: ' ',
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false
            },
            moz: {
                starlessGenerator: false,
                parenthesizedComprehensionBlock: false
            },
            sourceMap: null,
            sourceMapRoot: null,
            sourceMapWithCode: false,
            directive: false,
            verbatim: null
        };
    }

    function stringRepeat(str, num) {
        var result = '';

        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) {
                result += str;
            }
        }

        return result;
    }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    // Fallback for the non SourceMap environment
    function SourceNodeMock(line, column, filename, chunk) {
        var result = [];

        function flatten(input) {
            var i, iz;
            if (isArray(input)) {
                for (i = 0, iz = input.length; i < iz; ++i) {
                    flatten(input[i]);
                }
            } else if (input instanceof SourceNodeMock) {
                result.push(input);
            } else if (typeof input === 'string' && input) {
                result.push(input);
            }
        }

        flatten(chunk);
        this.children = result;
    }

    SourceNodeMock.prototype.toString = function toString() {
        var res = '', i, iz, node;
        for (i = 0, iz = this.children.length; i < iz; ++i) {
            node = this.children[i];
            if (node instanceof SourceNodeMock) {
                res += node.toString();
            } else {
                res += node;
            }
        }
        return res;
    };

    SourceNodeMock.prototype.replaceRight = function replaceRight(pattern, replacement) {
        var last = this.children[this.children.length - 1];
        if (last instanceof SourceNodeMock) {
            last.replaceRight(pattern, replacement);
        } else if (typeof last === 'string') {
            this.children[this.children.length - 1] = last.replace(pattern, replacement);
        } else {
            this.children.push(''.replace(pattern, replacement));
        }
        return this;
    };

    SourceNodeMock.prototype.join = function join(sep) {
        var i, iz, result;
        result = [];
        iz = this.children.length;
        if (iz > 0) {
            --iz;
            for (i = 0; i < iz; ++i) {
                result.push(this.children[i], sep);
            }
            result.push(this.children[iz]);
            this.children = result;
        }
        return this;
    };

    function hasLineTerminator(str) {
        return (/[\r\n]/g).test(str);
    }

    function endsWithLineTerminator(str) {
        var len = str.length;
        return len && esutils.code.isLineTerminator(str.charCodeAt(len - 1));
    }

    function updateDeeply(target, override) {
        var key, val;

        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    function generateNumber(value) {
        var result, point, temp, exponent, pos;

        if (value !== value) {
            throw new Error('Numeric literal whose value is NaN');
        }
        if (value < 0 || (value === 0 && 1 / value < 0)) {
            throw new Error('Numeric literal whose value is negative');
        }

        if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
        }

        result = '' + value;
        if (!renumber || result.length < 3) {
            return result;
        }

        point = result.indexOf('.');
        if (!json && result.charCodeAt(0) === 0x30  /* 0 */ && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;
        while (temp.charCodeAt(temp.length + pos - 1) === 0x30  /* 0 */) {
            --pos;
        }
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
            temp += 'e' + exponent;
        }
        if ((temp.length < result.length ||
                    (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
                +temp === value) {
            result = temp;
        }

        return result;
    }

    // Generate valid RegExp expression.
    // This function is based on https://github.com/Constellation/iv Engine

    function escapeRegExpCharacter(ch, previousIsBackslash) {
        // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
        if ((ch & ~1) === 0x2028) {
            return (previousIsBackslash ? 'u' : '\\u') + ((ch === 0x2028) ? '2028' : '2029');
        } else if (ch === 10 || ch === 13) {  // \n, \r
            return (previousIsBackslash ? '' : '\\') + ((ch === 10) ? 'n' : 'r');
        }
        return String.fromCharCode(ch);
    }

    function generateRegExp(reg) {
        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;

        result = reg.toString();

        if (reg.source) {
            // extract flag from toString result
            match = result.match(/\/([^/]*)$/);
            if (!match) {
                return result;
            }

            flags = match[1];
            result = '';

            characterInBrack = false;
            previousIsBackslash = false;
            for (i = 0, iz = reg.source.length; i < iz; ++i) {
                ch = reg.source.charCodeAt(i);

                if (!previousIsBackslash) {
                    if (characterInBrack) {
                        if (ch === 93) {  // ]
                            characterInBrack = false;
                        }
                    } else {
                        if (ch === 47) {  // /
                            result += '\\';
                        } else if (ch === 91) {  // [
                            characterInBrack = true;
                        }
                    }
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    previousIsBackslash = ch === 92;  // \
                } else {
                    // if new RegExp("\\\n') is provided, create /\n/
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    // prevent like /\\[/]/
                    previousIsBackslash = false;
                }
            }

            return '/' + result + '/' + flags;
        }

        return result;
    }

    function escapeAllowedCharacter(code, next) {
        var hex, result = '\\';

        switch (code) {
        case 0x08  /* \b */:
            result += 'b';
            break;
        case 0x0C  /* \f */:
            result += 'f';
            break;
        case 0x09  /* \t */:
            result += 't';
            break;
        default:
            hex = code.toString(16).toUpperCase();
            if (json || code > 0xFF) {
                result += 'u' + '0000'.slice(hex.length) + hex;
            } else if (code === 0x0000 && !esutils.code.isDecimalDigit(next)) {
                result += '0';
            } else if (code === 0x000B  /* \v */) { // '\v'
                result += 'x0B';
            } else {
                result += 'x' + '00'.slice(hex.length) + hex;
            }
            break;
        }

        return result;
    }

    function escapeDisallowedCharacter(code) {
        var result = '\\';
        switch (code) {
        case 0x5C  /* \ */:
            result += '\\';
            break;
        case 0x0A  /* \n */:
            result += 'n';
            break;
        case 0x0D  /* \r */:
            result += 'r';
            break;
        case 0x2028:
            result += 'u2028';
            break;
        case 0x2029:
            result += 'u2029';
            break;
        default:
            throw new Error('Incorrectly classified character');
        }

        return result;
    }

    function escapeDirective(str) {
        var i, iz, code, quote;

        quote = quotes === 'double' ? '"' : '\'';
        for (i = 0, iz = str.length; i < iz; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27  /* ' */) {
                quote = '"';
                break;
            } else if (code === 0x22  /* " */) {
                quote = '\'';
                break;
            } else if (code === 0x5C  /* \ */) {
                ++i;
            }
        }

        return quote + str + quote;
    }

    function escapeString(str) {
        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27  /* ' */) {
                ++singleQuotes;
            } else if (code === 0x22  /* " */) {
                ++doubleQuotes;
            } else if (code === 0x2F  /* / */ && json) {
                result += '\\';
            } else if (esutils.code.isLineTerminator(code) || code === 0x5C  /* \ */) {
                result += escapeDisallowedCharacter(code);
                continue;
            } else if ((json && code < 0x20  /* SP */) || !(json || escapeless || (code >= 0x20  /* SP */ && code <= 0x7E  /* ~ */))) {
                result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
                continue;
            }
            result += String.fromCharCode(code);
        }

        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
        quote = single ? '\'' : '"';

        if (!(single ? singleQuotes : doubleQuotes)) {
            return quote + result + quote;
        }

        str = result;
        result = quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if ((code === 0x27  /* ' */ && single) || (code === 0x22  /* " */ && !single)) {
                result += '\\';
            }
            result += String.fromCharCode(code);
        }

        return result + quote;
    }

    function toSourceNode(generated, node) {
        if (node == null) {
            if (generated instanceof SourceNode) {
                return generated;
            } else {
                node = {};
            }
        }
        if (node.loc == null) {
            return new SourceNode(null, null, sourceMap, generated, node.name || null);
        }
        return new SourceNode(node.loc.start.line, node.loc.start.column, (sourceMap === true ? node.loc.source || null : sourceMap), generated, node.name || null);
    }

    function noEmptySpace() {
        return (space) ? space : ' ';
    }

    function join(left, right) {
        var leftSource = toSourceNode(left).toString(),
            rightSource = toSourceNode(right).toString(),
            leftCharCode = leftSource.charCodeAt(leftSource.length - 1),
            rightCharCode = rightSource.charCodeAt(0);

        if ((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode ||
        esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode) ||
        leftCharCode === 0x2F  /* / */ && rightCharCode === 0x69  /* i */) { // infix word operators all start with `i`
            return [left, noEmptySpace(), right];
        } else if (esutils.code.isWhiteSpace(leftCharCode) || esutils.code.isLineTerminator(leftCharCode) ||
                esutils.code.isWhiteSpace(rightCharCode) || esutils.code.isLineTerminator(rightCharCode)) {
            return [left, right];
        }
        return [left, space, right];
    }

    function addIndent(stmt) {
        return [base, stmt];
    }

    function withIndent(fn) {
        var previousBase, result;
        previousBase = base;
        base += indent;
        result = fn.call(this, base);
        base = previousBase;
        return result;
    }

    function calculateSpaces(str) {
        var i;
        for (i = str.length - 1; i >= 0; --i) {
            if (esutils.code.isLineTerminator(str.charCodeAt(i))) {
                break;
            }
        }
        return (str.length - 1) - i;
    }

    function adjustMultilineComment(value, specialBase) {
        var array, i, len, line, j, spaces, previousBase;

        array = value.split(/\r\n|[\r\n]/);
        spaces = Number.MAX_VALUE;

        // first line doesn't have indentation
        for (i = 1, len = array.length; i < len; ++i) {
            line = array[i];
            j = 0;
            while (j < line.length && esutils.code.isWhiteSpace(line.charCodeAt(j))) {
                ++j;
            }
            if (spaces > j) {
                spaces = j;
            }
        }

        if (typeof specialBase !== 'undefined') {
            // pattern like
            // {
            //   var t = 20;  /*
            //                 * this is comment
            //                 */
            // }
            previousBase = base;
            if (array[1][spaces] === '*') {
                specialBase += ' ';
            }
            base = specialBase;
        } else {
            if (spaces & 1) {
                // /*
                //  *
                //  */
                // If spaces are odd number, above pattern is considered.
                // We waste 1 space.
                --spaces;
            }
            previousBase = base;
        }

        for (i = 1, len = array.length; i < len; ++i) {
            array[i] = toSourceNode(addIndent(array[i].slice(spaces))).join('');
        }

        base = previousBase;

        return array.join('\n');
    }

    function generateComment(comment, specialBase) {
        if (comment.type === 'Line') {
            if (endsWithLineTerminator(comment.value)) {
                return '//' + comment.value;
            } else {
                // Always use LineTerminator
                return '//' + comment.value + '\n';
            }
        }
        if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
            return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
        }
        return '/*' + comment.value + '*/';
    }

    function addCommentsToStatement(stmt, result) {
        var i, len, comment, save, tailingToStatement, specialBase, fragment;

        if (stmt.leadingComments && stmt.leadingComments.length > 0) {
            save = result;

            comment = stmt.leadingComments[0];
            result = [];
            if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {
                result.push('\n');
            }
            result.push(generateComment(comment));
            if (!endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push('\n');
            }

            for (i = 1, len = stmt.leadingComments.length; i < len; ++i) {
                comment = stmt.leadingComments[i];
                fragment = [generateComment(comment)];
                if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                    fragment.push('\n');
                }
                result.push(addIndent(fragment));
            }

            result.push(addIndent(save));
        }

        if (stmt.trailingComments) {
            tailingToStatement = !endsWithLineTerminator(toSourceNode(result).toString());
            specialBase = stringRepeat(' ', calculateSpaces(toSourceNode([base, result, indent]).toString()));
            for (i = 0, len = stmt.trailingComments.length; i < len; ++i) {
                comment = stmt.trailingComments[i];
                if (tailingToStatement) {
                    // We assume target like following script
                    //
                    // var t = 20;  /**
                    //               * This is comment of t
                    //               */
                    if (i === 0) {
                        // first case
                        result = [result, indent];
                    } else {
                        result = [result, specialBase];
                    }
                    result.push(generateComment(comment, specialBase));
                } else {
                    result = [result, addIndent(generateComment(comment))];
                }
                if (i !== len - 1 && !endsWithLineTerminator(toSourceNode(result).toString())) {
                    result = [result, '\n'];
                }
            }
        }

        return result;
    }

    function parenthesize(text, current, should) {
        if (current < should) {
            return ['(', text, ')'];
        }
        return text;
    }

    function maybeBlock(stmt, semicolonOptional, functionBody) {
        var result, noLeadingComment;

        noLeadingComment = !extra.comment || !stmt.leadingComments;

        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
            return [space, generateStatement(stmt, { functionBody: functionBody })];
        }

        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
            return ';';
        }

        withIndent(function () {
            result = [newline, addIndent(generateStatement(stmt, { semicolonOptional: semicolonOptional, functionBody: functionBody }))];
        });

        return result;
    }

    function maybeBlockSuffix(stmt, result) {
        var ends = endsWithLineTerminator(toSourceNode(result).toString());
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
            return [result, space];
        }
        if (ends) {
            return [result, base];
        }
        return [result, newline, base];
    }

    function generateVerbatim(expr, option) {
        var i, result;
        result = expr[extra.verbatim].split(/\r\n|\n/);
        for (i = 1; i < result.length; i++) {
            result[i] = newline + base + result[i];
        }

        result = parenthesize(result, Precedence.Sequence, option.precedence);
        return toSourceNode(result, expr);
    }

    function generateIdentifier(node) {
        return toSourceNode(node.name, node);
    }

    function generateFunctionBody(node) {
        var result, i, len, expr, arrow;

        arrow = node.type === Syntax.ArrowFunctionExpression;

        if (arrow && node.params.length === 1 && node.params[0].type === Syntax.Identifier) {
            // arg => { } case
            result = [generateIdentifier(node.params[0])];
        } else {
            result = ['('];
            for (i = 0, len = node.params.length; i < len; ++i) {
                result.push(generateIdentifier(node.params[i]));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result.push(')');
        }

        if (arrow) {
            result.push(space, '=>');
        }

        if (node.expression) {
            result.push(space);
            expr = generateExpression(node.body, {
                precedence: Precedence.Assignment,
                allowIn: true,
                allowCall: true
            });
            if (expr.toString().charAt(0) === '{') {
                expr = ['(', expr, ')'];
            }
            result.push(expr);
        } else {
            result.push(maybeBlock(node.body, false, true));
        }
        return result;
    }

    function generateExpression(expr, option) {
        var result,
            precedence,
            type,
            currentPrecedence,
            i,
            len,
            raw,
            fragment,
            multiline,
            leftCharCode,
            leftSource,
            rightCharCode,
            allowIn,
            allowCall,
            allowUnparenthesizedNew,
            property;

        precedence = option.precedence;
        allowIn = option.allowIn;
        allowCall = option.allowCall;
        type = expr.type || option.type;

        if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {
            return generateVerbatim(expr, option);
        }

        switch (type) {
        case Syntax.SequenceExpression:
            result = [];
            allowIn |= (Precedence.Sequence < precedence);
            for (i = 0, len = expr.expressions.length; i < len; ++i) {
                result.push(generateExpression(expr.expressions[i], {
                    precedence: Precedence.Assignment,
                    allowIn: allowIn,
                    allowCall: true
                }));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result = parenthesize(result, Precedence.Sequence, precedence);
            break;

        case Syntax.AssignmentExpression:
            allowIn |= (Precedence.Assignment < precedence);
            result = parenthesize(
                [
                    generateExpression(expr.left, {
                        precedence: Precedence.Call,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + expr.operator + space,
                    generateExpression(expr.right, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ],
                Precedence.Assignment,
                precedence
            );
            break;

        case Syntax.ArrowFunctionExpression:
            allowIn |= (Precedence.ArrowFunction < precedence);
            result = parenthesize(generateFunctionBody(expr), Precedence.ArrowFunction, precedence);
            break;

        case Syntax.ConditionalExpression:
            allowIn |= (Precedence.Conditional < precedence);
            result = parenthesize(
                [
                    generateExpression(expr.test, {
                        precedence: Precedence.LogicalOR,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + '?' + space,
                    generateExpression(expr.consequent, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + ':' + space,
                    generateExpression(expr.alternate, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ],
                Precedence.Conditional,
                precedence
            );
            break;

        case Syntax.LogicalExpression:
        case Syntax.BinaryExpression:
            currentPrecedence = BinaryPrecedence[expr.operator];

            allowIn |= (currentPrecedence < precedence);

            fragment = generateExpression(expr.left, {
                precedence: currentPrecedence,
                allowIn: allowIn,
                allowCall: true
            });

            leftSource = fragment.toString();

            if (leftSource.charCodeAt(leftSource.length - 1) === 0x2F /* / */ && esutils.code.isIdentifierPart(expr.operator.charCodeAt(0))) {
                result = [fragment, noEmptySpace(), expr.operator];
            } else {
                result = join(fragment, expr.operator);
            }

            fragment = generateExpression(expr.right, {
                precedence: currentPrecedence + 1,
                allowIn: allowIn,
                allowCall: true
            });

            if (expr.operator === '/' && fragment.toString().charAt(0) === '/' ||
            expr.operator.slice(-1) === '<' && fragment.toString().slice(0, 3) === '!--') {
                // If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
                result.push(noEmptySpace(), fragment);
            } else {
                result = join(result, fragment);
            }

            if (expr.operator === 'in' && !allowIn) {
                result = ['(', result, ')'];
            } else {
                result = parenthesize(result, currentPrecedence, precedence);
            }

            break;

        case Syntax.CallExpression:
            result = [generateExpression(expr.callee, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: true,
                allowUnparenthesizedNew: false
            })];

            result.push('(');
            for (i = 0, len = expr['arguments'].length; i < len; ++i) {
                result.push(generateExpression(expr['arguments'][i], {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                }));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result.push(')');

            if (!allowCall) {
                result = ['(', result, ')'];
            } else {
                result = parenthesize(result, Precedence.Call, precedence);
            }
            break;

        case Syntax.NewExpression:
            len = expr['arguments'].length;
            allowUnparenthesizedNew = option.allowUnparenthesizedNew === undefined || option.allowUnparenthesizedNew;

            result = join(
                'new',
                generateExpression(expr.callee, {
                    precedence: Precedence.New,
                    allowIn: true,
                    allowCall: false,
                    allowUnparenthesizedNew: allowUnparenthesizedNew && !parentheses && len === 0
                })
            );

            if (!allowUnparenthesizedNew || parentheses || len > 0) {
                result.push('(');
                for (i = 0; i < len; ++i) {
                    result.push(generateExpression(expr['arguments'][i], {
                        precedence: Precedence.Assignment,
                        allowIn: true,
                        allowCall: true
                    }));
                    if (i + 1 < len) {
                        result.push(',' + space);
                    }
                }
                result.push(')');
            }

            result = parenthesize(result, Precedence.New, precedence);
            break;

        case Syntax.MemberExpression:
            result = [generateExpression(expr.object, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: allowCall,
                allowUnparenthesizedNew: false
            })];

            if (expr.computed) {
                result.push('[', generateExpression(expr.property, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: allowCall
                }), ']');
            } else {
                if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                    fragment = toSourceNode(result).toString();
                    // When the following conditions are all true,
                    //   1. No floating point
                    //   2. Don't have exponents
                    //   3. The last character is a decimal digit
                    //   4. Not hexadecimal OR octal number literal
                    // we should add a floating point.
                    if (
                            fragment.indexOf('.') < 0 &&
                            !/[eExX]/.test(fragment) &&
                            esutils.code.isDecimalDigit(fragment.charCodeAt(fragment.length - 1)) &&
                            !(fragment.length >= 2 && fragment.charCodeAt(0) === 48)  // '0'
                            ) {
                        result.push('.');
                    }
                }
                result.push('.', generateIdentifier(expr.property));
            }

            result = parenthesize(result, Precedence.Member, precedence);
            break;

        case Syntax.UnaryExpression:
            fragment = generateExpression(expr.argument, {
                precedence: Precedence.Unary,
                allowIn: true,
                allowCall: true
            });

            if (space === '') {
                result = join(expr.operator, fragment);
            } else {
                result = [expr.operator];
                if (expr.operator.length > 2) {
                    // delete, void, typeof
                    // get `typeof []`, not `typeof[]`
                    result = join(result, fragment);
                } else {
                    // Prevent inserting spaces between operator and argument if it is unnecessary
                    // like, `!cond`
                    leftSource = toSourceNode(result).toString();
                    leftCharCode = leftSource.charCodeAt(leftSource.length - 1);
                    rightCharCode = fragment.toString().charCodeAt(0);

                    if (((leftCharCode === 0x2B  /* + */ || leftCharCode === 0x2D  /* - */) && leftCharCode === rightCharCode) ||
                            (esutils.code.isIdentifierPart(leftCharCode) && esutils.code.isIdentifierPart(rightCharCode))) {
                        result.push(noEmptySpace(), fragment);
                    } else {
                        result.push(fragment);
                    }
                }
            }
            result = parenthesize(result, Precedence.Unary, precedence);
            break;

        case Syntax.YieldExpression:
            if (expr.delegate) {
                result = 'yield*';
            } else {
                result = 'yield';
            }
            if (expr.argument) {
                result = join(
                    result,
                    generateExpression(expr.argument, {
                        precedence: Precedence.Yield,
                        allowIn: true,
                        allowCall: true
                    })
                );
            }
            result = parenthesize(result, Precedence.Yield, precedence);
            break;

        case Syntax.UpdateExpression:
            if (expr.prefix) {
                result = parenthesize(
                    [
                        expr.operator,
                        generateExpression(expr.argument, {
                            precedence: Precedence.Unary,
                            allowIn: true,
                            allowCall: true
                        })
                    ],
                    Precedence.Unary,
                    precedence
                );
            } else {
                result = parenthesize(
                    [
                        generateExpression(expr.argument, {
                            precedence: Precedence.Postfix,
                            allowIn: true,
                            allowCall: true
                        }),
                        expr.operator
                    ],
                    Precedence.Postfix,
                    precedence
                );
            }
            break;

        case Syntax.FunctionExpression:
            result = 'function';

            if (expr.id) {
                result = [result, noEmptySpace(),
                          generateIdentifier(expr.id),
                          generateFunctionBody(expr)];
            } else {
                result = [result + space, generateFunctionBody(expr)];
            }

            break;

        case Syntax.ArrayPattern:
        case Syntax.ArrayExpression:
            if (!expr.elements.length) {
                result = '[]';
                break;
            }
            multiline = expr.elements.length > 1;
            result = ['[', multiline ? newline : ''];
            withIndent(function (indent) {
                for (i = 0, len = expr.elements.length; i < len; ++i) {
                    if (!expr.elements[i]) {
                        if (multiline) {
                            result.push(indent);
                        }
                        if (i + 1 === len) {
                            result.push(',');
                        }
                    } else {
                        result.push(multiline ? indent : '', generateExpression(expr.elements[i], {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true
                        }));
                    }
                    if (i + 1 < len) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });
            if (multiline && !endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '', ']');
            break;

        case Syntax.Property:
            if (expr.kind === 'get' || expr.kind === 'set') {
                result = [
                    expr.kind, noEmptySpace(),
                    generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    generateFunctionBody(expr.value)
                ];
            } else {
                if (expr.shorthand) {
                    result = generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    });
                } else if (expr.method) {
                    result = [];
                    if (expr.value.generator) {
                        result.push('*');
                    }
                    result.push(generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }), generateFunctionBody(expr.value));
                } else {
                    result = [
                        generateExpression(expr.key, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true
                        }),
                        ':' + space,
                        generateExpression(expr.value, {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true
                        })
                    ];
                }
            }
            break;

        case Syntax.ObjectExpression:
            if (!expr.properties.length) {
                result = '{}';
                break;
            }
            multiline = expr.properties.length > 1;

            withIndent(function () {
                fragment = generateExpression(expr.properties[0], {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true,
                    type: Syntax.Property
                });
            });

            if (!multiline) {
                // issues 4
                // Do not transform from
                //   dejavu.Class.declare({
                //       method2: function () {}
                //   });
                // to
                //   dejavu.Class.declare({method2: function () {
                //       }});
                if (!hasLineTerminator(toSourceNode(fragment).toString())) {
                    result = [ '{', space, fragment, space, '}' ];
                    break;
                }
            }

            withIndent(function (indent) {
                result = [ '{', newline, indent, fragment ];

                if (multiline) {
                    result.push(',' + newline);
                    for (i = 1, len = expr.properties.length; i < len; ++i) {
                        result.push(indent, generateExpression(expr.properties[i], {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true,
                            type: Syntax.Property
                        }));
                        if (i + 1 < len) {
                            result.push(',' + newline);
                        }
                    }
                }
            });

            if (!endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push(newline);
            }
            result.push(base, '}');
            break;

        case Syntax.ObjectPattern:
            if (!expr.properties.length) {
                result = '{}';
                break;
            }

            multiline = false;
            if (expr.properties.length === 1) {
                property = expr.properties[0];
                if (property.value.type !== Syntax.Identifier) {
                    multiline = true;
                }
            } else {
                for (i = 0, len = expr.properties.length; i < len; ++i) {
                    property = expr.properties[i];
                    if (!property.shorthand) {
                        multiline = true;
                        break;
                    }
                }
            }
            result = ['{', multiline ? newline : '' ];

            withIndent(function (indent) {
                for (i = 0, len = expr.properties.length; i < len; ++i) {
                    result.push(multiline ? indent : '', generateExpression(expr.properties[i], {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }));
                    if (i + 1 < len) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });

            if (multiline && !endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '', '}');
            break;

        case Syntax.ThisExpression:
            result = 'this';
            break;

        case Syntax.Identifier:
            result = generateIdentifier(expr);
            break;

        case Syntax.Literal:
            if (expr.hasOwnProperty('raw') && parse) {
                try {
                    raw = parse(expr.raw).body[0].expression;
                    if (raw.type === Syntax.Literal) {
                        if (raw.value === expr.value) {
                            result = expr.raw;
                            break;
                        }
                    }
                } catch (e) {
                    // not use raw property
                }
            }

            if (expr.value === null) {
                result = 'null';
                break;
            }

            if (typeof expr.value === 'string') {
                result = escapeString(expr.value);
                break;
            }

            if (typeof expr.value === 'number') {
                result = generateNumber(expr.value);
                break;
            }

            if (typeof expr.value === 'boolean') {
                result = expr.value ? 'true' : 'false';
                break;
            }

            result = generateRegExp(expr.value);
            break;

        case Syntax.ComprehensionExpression:
            result = [
                '[',
                generateExpression(expr.body, {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                })
            ];

            if (expr.blocks) {
                for (i = 0, len = expr.blocks.length; i < len; ++i) {
                    fragment = generateExpression(expr.blocks[i], {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    });
                    result = join(result, fragment);
                }
            }

            if (expr.filter) {
                result = join(result, 'if' + space);
                fragment = generateExpression(expr.filter, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                });
                if (extra.moz.parenthesizedComprehensionBlock) {
                    result = join(result, [ '(', fragment, ')' ]);
                } else {
                    result = join(result, fragment);
                }
            }
            result.push(']');
            break;

        case Syntax.ComprehensionBlock:
            if (expr.left.type === Syntax.VariableDeclaration) {
                fragment = [
                    expr.left.kind, noEmptySpace(),
                    generateStatement(expr.left.declarations[0], {
                        allowIn: false
                    })
                ];
            } else {
                fragment = generateExpression(expr.left, {
                    precedence: Precedence.Call,
                    allowIn: true,
                    allowCall: true
                });
            }

            fragment = join(fragment, expr.of ? 'of' : 'in');
            fragment = join(fragment, generateExpression(expr.right, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }));

            if (extra.moz.parenthesizedComprehensionBlock) {
                result = [ 'for' + space + '(', fragment, ')' ];
            } else {
                result = join('for' + space, fragment);
            }
            break;

        default:
            throw new Error('Unknown expression type: ' + expr.type);
        }

        return toSourceNode(result, expr);
    }

    function generateStatement(stmt, option) {
        var i, len, result, node, allowIn, functionBody, directiveContext, fragment, semicolon;

        allowIn = true;
        semicolon = ';';
        functionBody = false;
        directiveContext = false;
        if (option) {
            allowIn = option.allowIn === undefined || option.allowIn;
            if (!semicolons && option.semicolonOptional === true) {
                semicolon = '';
            }
            functionBody = option.functionBody;
            directiveContext = option.directiveContext;
        }

        switch (stmt.type) {
        case Syntax.BlockStatement:
            result = ['{', newline];

            withIndent(function () {
                for (i = 0, len = stmt.body.length; i < len; ++i) {
                    fragment = addIndent(generateStatement(stmt.body[i], {
                        semicolonOptional: i === len - 1,
                        directiveContext: functionBody
                    }));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        result.push(newline);
                    }
                }
            });

            result.push(addIndent('}'));
            break;

        case Syntax.BreakStatement:
            if (stmt.label) {
                result = 'break ' + stmt.label.name + semicolon;
            } else {
                result = 'break' + semicolon;
            }
            break;

        case Syntax.ContinueStatement:
            if (stmt.label) {
                result = 'continue ' + stmt.label.name + semicolon;
            } else {
                result = 'continue' + semicolon;
            }
            break;

        case Syntax.DirectiveStatement:
            if (stmt.raw) {
                result = stmt.raw + semicolon;
            } else {
                result = escapeDirective(stmt.directive) + semicolon;
            }
            break;

        case Syntax.DoWhileStatement:
            // Because `do 42 while (cond)` is Syntax Error. We need semicolon.
            result = join('do', maybeBlock(stmt.body));
            result = maybeBlockSuffix(stmt.body, result);
            result = join(result, [
                'while' + space + '(',
                generateExpression(stmt.test, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }),
                ')' + semicolon
            ]);
            break;

        case Syntax.CatchClause:
            withIndent(function () {
                result = [
                    'catch' + space + '(',
                    generateExpression(stmt.param, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body));
            break;

        case Syntax.DebuggerStatement:
            result = 'debugger' + semicolon;
            break;

        case Syntax.EmptyStatement:
            result = ';';
            break;

        case Syntax.ExpressionStatement:
            result = [generateExpression(stmt.expression, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            })];
            // 12.4 '{', 'function' is not allowed in this position.
            // wrap expression with parentheses
            fragment = toSourceNode(result).toString();
            if (fragment.charAt(0) === '{' || (fragment.slice(0, 8) === 'function' && ' ('.indexOf(fragment.charAt(8)) >= 0) || (directive && directiveContext && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === 'string')) {
                result = ['(', result, ')' + semicolon];
            } else {
                result.push(semicolon);
            }
            break;

        case Syntax.VariableDeclarator:
            if (stmt.init) {
                result = [
                    generateExpression(stmt.id, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space,
                    '=',
                    space,
                    generateExpression(stmt.init, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ];
            } else {
                result = generateIdentifier(stmt.id);
            }
            break;

        case Syntax.VariableDeclaration:
            result = [stmt.kind];
            // special path for
            // var x = function () {
            // };
            if (stmt.declarations.length === 1 && stmt.declarations[0].init &&
                    stmt.declarations[0].init.type === Syntax.FunctionExpression) {
                result.push(noEmptySpace(), generateStatement(stmt.declarations[0], {
                    allowIn: allowIn
                }));
            } else {
                // VariableDeclarator is typed as Statement,
                // but joined with comma (not LineTerminator).
                // So if comment is attached to target node, we should specialize.
                withIndent(function () {
                    node = stmt.declarations[0];
                    if (extra.comment && node.leadingComments) {
                        result.push('\n', addIndent(generateStatement(node, {
                            allowIn: allowIn
                        })));
                    } else {
                        result.push(noEmptySpace(), generateStatement(node, {
                            allowIn: allowIn
                        }));
                    }

                    for (i = 1, len = stmt.declarations.length; i < len; ++i) {
                        node = stmt.declarations[i];
                        if (extra.comment && node.leadingComments) {
                            result.push(',' + newline, addIndent(generateStatement(node, {
                                allowIn: allowIn
                            })));
                        } else {
                            result.push(',' + space, generateStatement(node, {
                                allowIn: allowIn
                            }));
                        }
                    }
                });
            }
            result.push(semicolon);
            break;

        case Syntax.ThrowStatement:
            result = [join(
                'throw',
                generateExpression(stmt.argument, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                })
            ), semicolon];
            break;

        case Syntax.TryStatement:
            result = ['try', maybeBlock(stmt.block)];
            result = maybeBlockSuffix(stmt.block, result);
            if (stmt.handlers) {
                // old interface
                for (i = 0, len = stmt.handlers.length; i < len; ++i) {
                    result = join(result, generateStatement(stmt.handlers[i]));
                    if (stmt.finalizer || i + 1 !== len) {
                        result = maybeBlockSuffix(stmt.handlers[i].body, result);
                    }
                }
            } else {
                // new interface
                if (stmt.handler) {
                    result = join(result, generateStatement(stmt.handler));
                    if (stmt.finalizer || stmt.guardedHandlers.length > 0) {
                        result = maybeBlockSuffix(stmt.handler.body, result);
                    }
                }

                for (i = 0, len = stmt.guardedHandlers.length; i < len; ++i) {
                    result = join(result, generateStatement(stmt.guardedHandlers[i]));
                    if (stmt.finalizer || i + 1 !== len) {
                        result = maybeBlockSuffix(stmt.guardedHandlers[i].body, result);
                    }
                }
            }
            if (stmt.finalizer) {
                result = join(result, ['finally', maybeBlock(stmt.finalizer)]);
            }
            break;

        case Syntax.SwitchStatement:
            withIndent(function () {
                result = [
                    'switch' + space + '(',
                    generateExpression(stmt.discriminant, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')' + space + '{' + newline
                ];
            });
            if (stmt.cases) {
                for (i = 0, len = stmt.cases.length; i < len; ++i) {
                    fragment = addIndent(generateStatement(stmt.cases[i], {semicolonOptional: i === len - 1}));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        result.push(newline);
                    }
                }
            }
            result.push(addIndent('}'));
            break;

        case Syntax.SwitchCase:
            withIndent(function () {
                if (stmt.test) {
                    result = [
                        join('case', generateExpression(stmt.test, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true
                        })),
                        ':'
                    ];
                } else {
                    result = ['default:'];
                }

                i = 0;
                len = stmt.consequent.length;
                if (len && stmt.consequent[0].type === Syntax.BlockStatement) {
                    fragment = maybeBlock(stmt.consequent[0]);
                    result.push(fragment);
                    i = 1;
                }

                if (i !== len && !endsWithLineTerminator(toSourceNode(result).toString())) {
                    result.push(newline);
                }

                for (; i < len; ++i) {
                    fragment = addIndent(generateStatement(stmt.consequent[i], {semicolonOptional: i === len - 1 && semicolon === ''}));
                    result.push(fragment);
                    if (i + 1 !== len && !endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        result.push(newline);
                    }
                }
            });
            break;

        case Syntax.IfStatement:
            withIndent(function () {
                result = [
                    'if' + space + '(',
                    generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            if (stmt.alternate) {
                result.push(maybeBlock(stmt.consequent));
                result = maybeBlockSuffix(stmt.consequent, result);
                if (stmt.alternate.type === Syntax.IfStatement) {
                    result = join(result, ['else ', generateStatement(stmt.alternate, {semicolonOptional: semicolon === ''})]);
                } else {
                    result = join(result, join('else', maybeBlock(stmt.alternate, semicolon === '')));
                }
            } else {
                result.push(maybeBlock(stmt.consequent, semicolon === ''));
            }
            break;

        case Syntax.ForStatement:
            withIndent(function () {
                result = ['for' + space + '('];
                if (stmt.init) {
                    if (stmt.init.type === Syntax.VariableDeclaration) {
                        result.push(generateStatement(stmt.init, {allowIn: false}));
                    } else {
                        result.push(generateExpression(stmt.init, {
                            precedence: Precedence.Sequence,
                            allowIn: false,
                            allowCall: true
                        }), ';');
                    }
                } else {
                    result.push(';');
                }

                if (stmt.test) {
                    result.push(space, generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }), ';');
                } else {
                    result.push(';');
                }

                if (stmt.update) {
                    result.push(space, generateExpression(stmt.update, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }), ')');
                } else {
                    result.push(')');
                }
            });

            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.ForInStatement:
            result = ['for' + space + '('];
            withIndent(function () {
                if (stmt.left.type === Syntax.VariableDeclaration) {
                    withIndent(function () {
                        result.push(stmt.left.kind + noEmptySpace(), generateStatement(stmt.left.declarations[0], {
                            allowIn: false
                        }));
                    });
                } else {
                    result.push(generateExpression(stmt.left, {
                        precedence: Precedence.Call,
                        allowIn: true,
                        allowCall: true
                    }));
                }

                result = join(result, 'in');
                result = [join(
                    result,
                    generateExpression(stmt.right, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    })
                ), ')'];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.LabeledStatement:
            result = [stmt.label.name + ':', maybeBlock(stmt.body, semicolon === '')];
            break;

        case Syntax.Program:
            len = stmt.body.length;
            result = [safeConcatenation && len > 0 ? '\n' : ''];
            for (i = 0; i < len; ++i) {
                fragment = addIndent(
                    generateStatement(stmt.body[i], {
                        semicolonOptional: !safeConcatenation && i === len - 1,
                        directiveContext: true
                    })
                );
                result.push(fragment);
                if (i + 1 < len && !endsWithLineTerminator(toSourceNode(fragment).toString())) {
                    result.push(newline);
                }
            }
            break;

        case Syntax.FunctionDeclaration:
            result = [(stmt.generator && !extra.moz.starlessGenerator ? 'function* ' : 'function '),
                      generateIdentifier(stmt.id),
                      generateFunctionBody(stmt)];
            break;

        case Syntax.ReturnStatement:
            if (stmt.argument) {
                result = [join(
                    'return',
                    generateExpression(stmt.argument, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    })
                ), semicolon];
            } else {
                result = ['return' + semicolon];
            }
            break;

        case Syntax.WhileStatement:
            withIndent(function () {
                result = [
                    'while' + space + '(',
                    generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.WithStatement:
            withIndent(function () {
                result = [
                    'with' + space + '(',
                    generateExpression(stmt.object, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        default:
            throw new Error('Unknown statement type: ' + stmt.type);
        }

        // Attach comments

        if (extra.comment) {
            result = addCommentsToStatement(stmt, result);
        }

        fragment = toSourceNode(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' &&  fragment.charAt(fragment.length - 1) === '\n') {
            result = toSourceNode(result).replaceRight(/\s+$/, '');
        }

        return toSourceNode(result, stmt);
    }

    function generate(node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;

        if (options != null) {
            // Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') {
                defaultOptions.format.indent.style = options.indent;
            }
            if (typeof options.base === 'number') {
                defaultOptions.format.indent.base = options.base;
            }
            options = updateDeeply(defaultOptions, options);
            indent = options.format.indent.style;
            if (typeof options.base === 'string') {
                base = options.base;
            } else {
                base = stringRepeat(indent, options.format.indent.base);
            }
        } else {
            options = defaultOptions;
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        newline = options.format.newline;
        space = options.format.space;
        if (options.format.compact) {
            newline = space = indent = base = '';
        }
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        sourceMap = options.sourceMap;
        extra = options;

        if (sourceMap) {
            if (!exports.browser) {
                // We assume environment is node.js
                // And prevent from including source-map by browserify
                SourceNode = require('source-map').SourceNode;
            } else {
                SourceNode = global.sourceMap.SourceNode;
            }
        } else {
            SourceNode = SourceNodeMock;
        }

        switch (node.type) {
        case Syntax.BlockStatement:
        case Syntax.BreakStatement:
        case Syntax.CatchClause:
        case Syntax.ContinueStatement:
        case Syntax.DirectiveStatement:
        case Syntax.DoWhileStatement:
        case Syntax.DebuggerStatement:
        case Syntax.EmptyStatement:
        case Syntax.ExpressionStatement:
        case Syntax.ForStatement:
        case Syntax.ForInStatement:
        case Syntax.FunctionDeclaration:
        case Syntax.IfStatement:
        case Syntax.LabeledStatement:
        case Syntax.Program:
        case Syntax.ReturnStatement:
        case Syntax.SwitchStatement:
        case Syntax.SwitchCase:
        case Syntax.ThrowStatement:
        case Syntax.TryStatement:
        case Syntax.VariableDeclaration:
        case Syntax.VariableDeclarator:
        case Syntax.WhileStatement:
        case Syntax.WithStatement:
            result = generateStatement(node);
            break;

        case Syntax.AssignmentExpression:
        case Syntax.ArrayExpression:
        case Syntax.ArrayPattern:
        case Syntax.BinaryExpression:
        case Syntax.CallExpression:
        case Syntax.ConditionalExpression:
        case Syntax.FunctionExpression:
        case Syntax.Identifier:
        case Syntax.Literal:
        case Syntax.LogicalExpression:
        case Syntax.MemberExpression:
        case Syntax.NewExpression:
        case Syntax.ObjectExpression:
        case Syntax.ObjectPattern:
        case Syntax.Property:
        case Syntax.SequenceExpression:
        case Syntax.ThisExpression:
        case Syntax.UnaryExpression:
        case Syntax.UpdateExpression:
        case Syntax.YieldExpression:

            result = generateExpression(node, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            });
            break;

        default:
            throw new Error('Unknown node type: ' + node.type);
        }

        if (!sourceMap) {
            return result.toString();
        }


        pair = result.toStringWithSourceMap({
            file: options.file,
            sourceRoot: options.sourceMapRoot
        });

        if (options.sourceContent) {
            pair.map.setSourceContent(options.sourceMap,
                                      options.sourceContent);
        }

        if (options.sourceMapWithCode) {
            return pair;
        }

        return pair.map.toString();
    }

    FORMAT_MINIFY = {
        indent: {
            style: '',
            base: 0
        },
        renumber: true,
        hexadecimal: true,
        quotes: 'auto',
        escapeless: true,
        compact: true,
        parentheses: false,
        semicolons: false
    };

    FORMAT_DEFAULTS = getDefaultOptions().format;

    exports.version = require('./package.json').version;
    exports.generate = generate;
    exports.attachComments = estraverse.attachComments;
    exports.browser = false;
    exports.FORMAT_MINIFY = FORMAT_MINIFY;
    exports.FORMAT_DEFAULTS = FORMAT_DEFAULTS;
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./package.json":31,"estraverse":17,"esutils":20,"source-map":21}],17:[function(require,module,exports){
/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*jslint vars:false, bitwise:true*/
/*jshint indent:4*/
/*global exports:true, define:true*/
(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // and plain browser loading,
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.estraverse = {}));
    }
}(this, function (exports) {
    'use strict';

    var Syntax,
        isArray,
        VisitorOption,
        VisitorKeys,
        BREAK,
        SKIP;

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    function ignoreJSHintError() { }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key];
                if (typeof val === 'object' && val !== null) {
                    ret[key] = deepCopy(val);
                } else {
                    ret[key] = val;
                }
            }
        }
        return ret;
    }

    function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    ignoreJSHintError(shallowCopy);

    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License

    function upperBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    function lowerBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                i = current + 1;
                len -= diff + 1;
            } else {
                len = diff;
            }
        }
        return i;
    }
    ignoreJSHintError(lowerBound);

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: ['params', 'defaults', 'rest', 'body'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'body', 'superClass'],
        ClassExpression: ['id', 'body', 'superClass'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'defaults', 'rest', 'body'],
        FunctionExpression: ['id', 'params', 'defaults', 'rest', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MethodDefinition: ['key', 'value'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'handler', 'guardedHandlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    // unique id
    BREAK = {};
    SKIP = {};

    VisitorOption = {
        Break: BREAK,
        Skip: SKIP
    };

    function Reference(parent, key) {
        this.parent = parent;
        this.key = key;
    }

    Reference.prototype.replace = function replace(node) {
        this.parent[this.key] = node;
    };

    function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
    }

    function Controller() { }

    // API:
    // return property path array from root to current node
    Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;

        function addToPath(result, path) {
            if (isArray(path)) {
                for (j = 0, jz = path.length; j < jz; ++j) {
                    result.push(path[j]);
                }
            } else {
                result.push(path);
            }
        }

        // root node
        if (!this.__current.path) {
            return null;
        }

        // first node is sentinel, second node is root element
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
            element = this.__leavelist[i];
            addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
    };

    // API:
    // return array of parent elements
    Controller.prototype.parents = function parents() {
        var i, iz, result;

        // first node is sentinel
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
            result.push(this.__leavelist[i].node);
        }

        return result;
    };

    // API:
    // return current node
    Controller.prototype.current = function current() {
        return this.__current.node;
    };

    Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;

        result = undefined;

        previous  = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;

        return result;
    };

    // API:
    // notify control skip / break
    Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
    };

    // API:
    // skip child nodes of current node
    Controller.prototype.skip = function () {
        this.notify(SKIP);
    };

    // API:
    // break traversals
    Controller.prototype['break'] = function () {
        this.notify(BREAK);
    };

    Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
    };

    Controller.prototype.traverse = function traverse(root, visitor) {
        var worklist,
            leavelist,
            element,
            node,
            nodeType,
            ret,
            key,
            current,
            current2,
            candidates,
            candidate,
            sentinel;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                ret = this.__execute(visitor.leave, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }
                continue;
            }

            if (element.node) {

                ret = this.__execute(visitor.enter, element);

                if (this.__state === BREAK || ret === BREAK) {
                    return;
                }

                worklist.push(sentinel);
                leavelist.push(element);

                if (this.__state === SKIP || ret === SKIP) {
                    continue;
                }

                node = element.node;
                nodeType = element.wrap || node.type;
                candidates = VisitorKeys[nodeType];

                current = candidates.length;
                while ((current -= 1) >= 0) {
                    key = candidates[current];
                    candidate = node[key];
                    if (!candidate) {
                        continue;
                    }

                    if (!isArray(candidate)) {
                        worklist.push(new Element(candidate, key, null, null));
                        continue;
                    }

                    current2 = candidate.length;
                    while ((current2 -= 1) >= 0) {
                        if (!candidate[current2]) {
                            continue;
                        }
                        if ((nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === candidates[current]) {
                            element = new Element(candidate[current2], [key, current2], 'Property', null);
                        } else {
                            element = new Element(candidate[current2], [key, current2], null, null);
                        }
                        worklist.push(element);
                    }
                }
            }
        }
    };

    Controller.prototype.replace = function replace(root, visitor) {
        var worklist,
            leavelist,
            node,
            nodeType,
            target,
            element,
            current,
            current2,
            candidates,
            candidate,
            sentinel,
            outer,
            key;

        this.__initialize(root, visitor);

        sentinel = {};

        // reference
        worklist = this.__worklist;
        leavelist = this.__leavelist;

        // initialize
        outer = {
            root: root
        };
        element = new Element(root, null, null, new Reference(outer, 'root'));
        worklist.push(element);
        leavelist.push(element);

        while (worklist.length) {
            element = worklist.pop();

            if (element === sentinel) {
                element = leavelist.pop();

                target = this.__execute(visitor.leave, element);

                // node may be replaced with null,
                // so distinguish between undefined and null in this place
                if (target !== undefined && target !== BREAK && target !== SKIP) {
                    // replace
                    element.ref.replace(target);
                }

                if (this.__state === BREAK || target === BREAK) {
                    return outer.root;
                }
                continue;
            }

            target = this.__execute(visitor.enter, element);

            // node may be replaced with null,
            // so distinguish between undefined and null in this place
            if (target !== undefined && target !== BREAK && target !== SKIP) {
                // replace
                element.ref.replace(target);
                element.node = target;
            }

            if (this.__state === BREAK || target === BREAK) {
                return outer.root;
            }

            // node may be null
            node = element.node;
            if (!node) {
                continue;
            }

            worklist.push(sentinel);
            leavelist.push(element);

            if (this.__state === SKIP || target === SKIP) {
                continue;
            }

            nodeType = element.wrap || node.type;
            candidates = VisitorKeys[nodeType];

            current = candidates.length;
            while ((current -= 1) >= 0) {
                key = candidates[current];
                candidate = node[key];
                if (!candidate) {
                    continue;
                }

                if (!isArray(candidate)) {
                    worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                    continue;
                }

                current2 = candidate.length;
                while ((current2 -= 1) >= 0) {
                    if (!candidate[current2]) {
                        continue;
                    }
                    if (nodeType === Syntax.ObjectExpression && 'properties' === candidates[current]) {
                        element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                    } else {
                        element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                    }
                    worklist.push(element);
                }
            }
        }

        return outer.root;
    };

    function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
    }

    function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
    }

    function extendCommentRange(comment, tokens) {
        var target;

        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }

        target -= 1;
        if (target >= 0) {
            comment.extendedRange[0] = tokens[target].range[1];
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i, cursor;

        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for (i = 0, len = providedComments.length; i < len; i += 1) {
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (i = 0, len = providedComments.length; i < len; i += 1) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        // This is based on John Freeman's implementation.
        cursor = 0;
        traverse(tree, {
            enter: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) {
                            node.leadingComments = [];
                        }
                        node.leadingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        cursor = 0;
        traverse(tree, {
            leave: function (node) {
                var comment;

                while (cursor < comments.length) {
                    comment = comments[cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) {
                            node.trailingComments = [];
                        }
                        node.trailingComments.push(comment);
                        comments.splice(cursor, 1);
                    } else {
                        cursor += 1;
                    }
                }

                // already out of owned node
                if (cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    exports.version = '1.3.3-dev';
    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.attachComments = attachComments;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
    exports.Controller = Controller;
}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],18:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var Regex;

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };

    function isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    }

    function isHexDigit(ch) {
        return isDecimalDigit(ch) || (97 <= ch && ch <= 102) || (65 <= ch && ch <= 70);
    }

    function isOctalDigit(ch) {
        return (ch >= 48 && ch <= 55);   // 0..7
    }

    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch >= 48 && ch <= 57) ||         // 0..9
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    }

    module.exports = {
        isDecimalDigit: isDecimalDigit,
        isHexDigit: isHexDigit,
        isOctalDigit: isOctalDigit,
        isWhiteSpace: isWhiteSpace,
        isLineTerminator: isLineTerminator,
        isIdentifierStart: isIdentifierStart,
        isIdentifierPart: isIdentifierPart
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{}],19:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var code = require('./code');

    function isStrictModeReservedWordES6(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isKeywordES5(id, strict) {
        // yield should not be treated as keyword under non-strict mode.
        if (!strict && id === 'yield') {
            return false;
        }
        return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
        if (strict && isStrictModeReservedWordES6(id)) {
            return true;
        }

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    function isIdentifierName(id) {
        var i, iz, ch;

        if (id.length === 0) {
            return false;
        }

        ch = id.charCodeAt(0);
        if (!code.isIdentifierStart(ch) || ch === 92) {  // \ (backslash)
            return false;
        }

        for (i = 1, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (!code.isIdentifierPart(ch) || ch === 92) {  // \ (backslash)
                return false;
            }
        }
        return true;
    }

    module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierName: isIdentifierName
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./code":18}],20:[function(require,module,exports){
/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function () {
    'use strict';

    exports.code = require('./code');
    exports.keyword = require('./keyword');
}());
/* vim: set sw=4 ts=4 et tw=80 : */

},{"./code":18,"./keyword":19}],21:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":26,"./source-map/source-map-generator":27,"./source-map/source-node":28}],22:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":29,"amdefine":30}],23:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string.
   */
  exports.decode = function base64VLQ_decode(aStr) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    return {
      value: fromVLQSigned(result),
      rest: aStr.slice(i)
    };
  };

});

},{"./base64":24,"amdefine":30}],24:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":30}],25:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the next
    //      closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return null.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return aHaystack[mid];
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return aHaystack[mid];
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0
        ? null
        : aHaystack[aLow];
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the next lowest value checked if there is no exact hit. This is because
   * mappings between original and generated line/col pairs are single points,
   * and there is an implicit region between each of them, so a miss just means
   * that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    return aHaystack.length > 0
      ? recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
      : null;
  };

});

},{"amdefine":30}],26:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.slice()
        .sort(util.compareByGeneratedPositions);
      smc.__originalMappings = aSourceMap._mappings.slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var mappingSeparator = /^[,;]/;
      var str = aStr;
      var mapping;
      var temp;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          temp = base64VLQ.decode(str);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
            // Original source.
            temp = base64VLQ.decode(str);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            temp = base64VLQ.decode(str);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            temp = base64VLQ.decode(str);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
              // Original name.
              temp = base64VLQ.decode(str);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var mapping = this._findMapping(needle,
                                      this._generatedMappings,
                                      "generatedLine",
                                      "generatedColumn",
                                      util.compareByGeneratedPositions);

      if (mapping) {
        var source = util.getArg(mapping, 'source', null);
        if (source && this.sourceRoot) {
          source = util.join(this.sourceRoot, source);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: util.getArg(mapping, 'name', null)
        };
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mapping = this._findMapping(needle,
                                      this._originalMappings,
                                      "originalLine",
                                      "originalColumn",
                                      util.compareByOriginalPositions);

      if (mapping) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null)
        };
      }

      return {
        line: null,
        column: null
      };
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source;
        if (source && sourceRoot) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":22,"./base64-vlq":23,"./binary-search":25,"./util":29,"amdefine":30}],27:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. To create a new one, you must pass an object
   * with the following properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: An optional root for all URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    this._file = util.getArg(aArgs, 'file');
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = [];
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source) {
          newMapping.source = mapping.source;
          if (sourceRoot) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      this._validateMapping(generated, original, source, name);

      if (source && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.push({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent !== null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile) {
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (!aSourceFile) {
        aSourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "aSourceFile" relative if an absolute Url is passed.
      if (sourceRoot) {
        aSourceFile = util.relative(sourceRoot, aSourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "aSourceFile"
      this._mappings.forEach(function (mapping) {
        if (mapping.source === aSourceFile && mapping.originalLine) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source !== null) {
            // Copy mapping
            if (sourceRoot) {
              mapping.source = util.relative(sourceRoot, original.source);
            } else {
              mapping.source = original.source;
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name !== null && mapping.name !== null) {
              // Only use the identifier name if it's an identifier
              // in both SourceMaps
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          if (sourceRoot) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          orginal: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      // The mappings must be guaranteed to be in sorted order before we start
      // serializing them or else the generated line numbers (which are defined
      // via the ';' separators) will be all messed up. Note: it might be more
      // performant to maintain the sorting as we insert them, rather than as we
      // serialize them, but the big O is the same either way.
      this._mappings.sort(util.compareByGeneratedPositions);

      for (var i = 0, len = this._mappings.length; i < len; i++) {
        mapping = this._mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        file: this._file,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._sourceRoot) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":22,"./base64-vlq":23,"./util":29,"amdefine":30}],28:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine === undefined ? null : aLine;
    this.column = aColumn === undefined ? null : aColumn;
    this.source = aSource === undefined ? null : aSource;
    this.name = aName === undefined ? null : aName;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // The generated code
      // Processed fragments are removed from this array.
      var remainingLines = aGeneratedCode.split('\n');

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping === null) {
          // We add the generated code until the first mapping
          // to the SourceNode without any mapping.
          // Each line is added as separate string.
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(remainingLines.shift() + "\n");
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            var nextLine = remainingLines[0];
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[0] = nextLine.substr(mapping.generatedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
          }
        } else {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate full lines with "lastMapping"
            do {
              code += remainingLines.shift() + "\n";
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
            } while (lastGeneratedLine < mapping.generatedLine);
            // When we reached the correct line, we add code until we
            // reach the correct column too.
            if (lastGeneratedColumn < mapping.generatedColumn) {
              var nextLine = remainingLines[0];
              code += nextLine.substr(0, mapping.generatedColumn);
              remainingLines[0] = nextLine.substr(mapping.generatedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
            }
            // Create the SourceNode.
            addMappingWithCode(lastMapping, code);
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
          }
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      // Associate the remaining code in the current line with "lastMapping"
      // and add the remaining lines without any mapping
      addMappingWithCode(lastMapping, remainingLines.join("\n"));

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content) {
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  mapping.source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk instanceof SourceNode) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild instanceof SourceNode) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i] instanceof SourceNode) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      chunk.split('').forEach(function (ch) {
        if (ch === '\n') {
          generated.line++;
          generated.column = 0;
        } else {
          generated.column++;
        }
      });
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":27,"./util":29,"amdefine":30}],29:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /([\w+\-.]+):\/\/((\w+:\w+)@)?([\w.]+)?(:(\d+))?(\S+)?/;
  var dataUrlRegexp = /^data:.+\,.+/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[3],
      host: match[4],
      port: match[6],
      path: match[7]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = aParsedUrl.scheme + "://";
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + "@"
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  function join(aRoot, aPath) {
    var url;

    if (aPath.match(urlRegexp) || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    if (aPath.charAt(0) === '/' && (url = urlParse(aRoot))) {
      url.path = aPath;
      return urlGenerate(url);
    }

    return aRoot.replace(/\/$/, '') + '/' + aPath;
  }
  exports.join = join;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function relative(aRoot, aPath) {
    aRoot = aRoot.replace(/\/$/, '');

    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":30}],30:[function(require,module,exports){
var process=require("__browserify_process"),__filename="/node_modules/wisp/node_modules/escodegen/node_modules/source-map/node_modules/amdefine/amdefine.js";/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 0.1.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                process.nextTick(function () {
                    callback.apply(null, deps);
                });
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

},{"__browserify_process":4,"path":5}],31:[function(require,module,exports){
module.exports={
  "name": "escodegen",
  "description": "ECMAScript code generator",
  "homepage": "http://github.com/Constellation/escodegen",
  "main": "escodegen.js",
  "bin": {
    "esgenerate": "./bin/esgenerate.js",
    "escodegen": "./bin/escodegen.js"
  },
  "version": "1.0.2-dev",
  "engines": {
    "node": ">=0.4.0"
  },
  "maintainers": [
    {
      "name": "Yusuke Suzuki",
      "email": "utatane.tea@gmail.com",
      "url": "http://github.com/Constellation"
    }
  ],
  "repository": {
    "type": "git",
    "url": "http://github.com/Constellation/escodegen.git"
  },
  "dependencies": {
    "esprima": "~1.0.4",
    "estraverse": "~1.5.0",
    "esutils": "~1.0.0",
    "source-map": "~0.1.30"
  },
  "optionalDependencies": {
    "source-map": "~0.1.30"
  },
  "devDependencies": {
    "esprima-moz": "*",
    "commonjs-everywhere": "~0.8.0",
    "q": "*",
    "bower": "*",
    "semver": "*",
    "chai": "~1.7.2",
    "grunt-contrib-jshint": "~0.5.0",
    "grunt-cli": "~0.1.9",
    "grunt": "~0.4.1",
    "grunt-mocha-test": "~0.6.2"
  },
  "licenses": [
    {
      "type": "BSD",
      "url": "http://github.com/Constellation/escodegen/raw/master/LICENSE.BSD"
    }
  ],
  "scripts": {
    "test": "grunt travis",
    "unit-test": "grunt test",
    "lint": "grunt lint",
    "release": "node tools/release.js",
    "build-min": "./node_modules/.bin/cjsify -ma path: tools/entry-point.js > escodegen.browser.min.js",
    "build": "./node_modules/.bin/cjsify -a path: tools/entry-point.js > escodegen.browser.js"
  },
  "readme": "\n### Escodegen [![Build Status](https://secure.travis-ci.org/Constellation/escodegen.png)](http://travis-ci.org/Constellation/escodegen) [![Build Status](https://drone.io/github.com/Constellation/escodegen/status.png)](https://drone.io/github.com/Constellation/escodegen/latest)\n\nEscodegen ([escodegen](http://github.com/Constellation/escodegen)) is\n[ECMAScript](http://www.ecma-international.org/publications/standards/Ecma-262.htm)\n(also popularly known as [JavaScript](http://en.wikipedia.org/wiki/JavaScript>JavaScript))\ncode generator from [Parser API](https://developer.mozilla.org/en/SpiderMonkey/Parser_API) AST.\nSee [online generator demo](http://constellation.github.com/escodegen/demo/index.html).\n\n\n### Install\n\nEscodegen can be used in a web browser:\n\n    <script src=\"escodegen.browser.js\"></script>\n\nescodegen.browser.js is found in tagged-revision. See Tags on GitHub.\n\nOr in a Node.js application via the package manager:\n\n    npm install escodegen\n\n### Usage\n\nA simple example: the program\n\n    escodegen.generate({\n        type: 'BinaryExpression',\n        operator: '+',\n        left: { type: 'Literal', value: 40 },\n        right: { type: 'Literal', value: 2 }\n    });\n\nproduces the string `'40 + 2'`\n\nSee the [API page](https://github.com/Constellation/escodegen/wiki/API) for\noptions. To run the tests, execute `npm test` in the root directory.\n\n### License\n\n#### Escodegen\n\nCopyright (C) 2012 [Yusuke Suzuki](http://github.com/Constellation)\n (twitter: [@Constellation](http://twitter.com/Constellation)) and other contributors.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are met:\n\n  * Redistributions of source code must retain the above copyright\n    notice, this list of conditions and the following disclaimer.\n\n  * Redistributions in binary form must reproduce the above copyright\n    notice, this list of conditions and the following disclaimer in the\n    documentation and/or other materials provided with the distribution.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\"\nAND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\nIMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\nARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY\nDIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES\n(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;\nLOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND\nON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF\nTHIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\n#### source-map\n\nSourceNodeMocks has a limited interface of mozilla/source-map SourceNode implementations.\n\nCopyright (c) 2009-2011, Mozilla Foundation and contributors\nAll rights reserved.\n\nRedistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are met:\n\n* Redistributions of source code must retain the above copyright notice, this\n  list of conditions and the following disclaimer.\n\n* Redistributions in binary form must reproduce the above copyright notice,\n  this list of conditions and the following disclaimer in the documentation\n  and/or other materials provided with the distribution.\n\n* Neither the names of the Mozilla Foundation nor the names of project\n  contributors may be used to endorse or promote products derived from this\n  software without specific prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND\nANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED\nWARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE\nDISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE\nFOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL\nDAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR\nSERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER\nCAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,\nOR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n",
  "readmeFilename": "README.md",
  "bugs": {
    "url": "https://github.com/Constellation/escodegen/issues"
  },
  "_id": "escodegen@1.0.2-dev",
  "dist": {
    "shasum": "24e0bd423166af81b9eaa3ad77243ea63f1f0de0"
  },
  "_resolved": "git://github.com/Constellation/escodegen.git#efed3e21a5d2545d6050c867422ee027a0b7a9cf",
  "_from": "escodegen@git://github.com/Constellation/escodegen.git#master"
}

},{}],32:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.reader',
            doc: 'Reader module provides functions for reading text input\n  as wisp data structures'
        };
    var wisp_sequence = require('./sequence');
    var list = wisp_sequence.list;
    var isList = wisp_sequence.isList;
    var count = wisp_sequence.count;
    var isEmpty = wisp_sequence.isEmpty;
    var first = wisp_sequence.first;
    var second = wisp_sequence.second;
    var third = wisp_sequence.third;
    var rest = wisp_sequence.rest;
    var map = wisp_sequence.map;
    var vec = wisp_sequence.vec;
    var cons = wisp_sequence.cons;
    var conj = wisp_sequence.conj;
    var rest = wisp_sequence.rest;
    var concat = wisp_sequence.concat;
    var last = wisp_sequence.last;
    var butlast = wisp_sequence.butlast;
    var sort = wisp_sequence.sort;
    var lazySeq = wisp_sequence.lazySeq;
    var reduce = wisp_sequence.reduce;
    var wisp_runtime = require('./runtime');
    var isOdd = wisp_runtime.isOdd;
    var dictionary = wisp_runtime.dictionary;
    var keys = wisp_runtime.keys;
    var isNil = wisp_runtime.isNil;
    var inc = wisp_runtime.inc;
    var dec = wisp_runtime.dec;
    var isVector = wisp_runtime.isVector;
    var isString = wisp_runtime.isString;
    var isNumber = wisp_runtime.isNumber;
    var isBoolean = wisp_runtime.isBoolean;
    var isObject = wisp_runtime.isObject;
    var isDictionary = wisp_runtime.isDictionary;
    var rePattern = wisp_runtime.rePattern;
    var reMatches = wisp_runtime.reMatches;
    var reFind = wisp_runtime.reFind;
    var str = wisp_runtime.str;
    var subs = wisp_runtime.subs;
    var char = wisp_runtime.char;
    var vals = wisp_runtime.vals;
    var isEqual = wisp_runtime.isEqual;
    var wisp_ast = require('./ast');
    var isSymbol = wisp_ast.isSymbol;
    var symbol = wisp_ast.symbol;
    var isKeyword = wisp_ast.isKeyword;
    var keyword = wisp_ast.keyword;
    var meta = wisp_ast.meta;
    var withMeta = wisp_ast.withMeta;
    var name = wisp_ast.name;
    var gensym = wisp_ast.gensym;
    var wisp_string = require('./string');
    var split = wisp_string.split;
    var join = wisp_string.join;
}
var pushBackReader = exports.pushBackReader = function pushBackReader(source, uri) {
        return {
            'lines': split(source, '\n'),
            'buffer': '',
            'uri': uri,
            'column': -1,
            'line': 0
        };
    };
var peekChar = exports.peekChar = function peekChar(reader) {
        return function () {
            var lineø1 = (reader || 0)['lines'][(reader || 0)['line']];
            var columnø1 = inc((reader || 0)['column']);
            return isNil(lineø1) ? void 0 : lineø1[columnø1] || '\n';
        }.call(this);
    };
var readChar = exports.readChar = function readChar(reader) {
        return function () {
            var chø1 = peekChar(reader);
            isNewline(peekChar(reader)) ? (function () {
                (reader || 0)['line'] = inc((reader || 0)['line']);
                return (reader || 0)['column'] = -1;
            })() : (reader || 0)['column'] = inc((reader || 0)['column']);
            return chø1;
        }.call(this);
    };
var isNewline = exports.isNewline = function isNewline(ch) {
        return '\n' === ch;
    };
var isBreakingWhitespace = exports.isBreakingWhitespace = function isBreakingWhitespace(ch) {
        return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
    };
var isWhitespace = exports.isWhitespace = function isWhitespace(ch) {
        return isBreakingWhitespace(ch) || ',' === ch;
    };
var isNumeric = exports.isNumeric = function isNumeric(ch) {
        return ch === '0' || ch === '1' || ch === '2' || ch === '3' || ch === '4' || ch === '5' || ch === '6' || ch === '7' || ch === '8' || ch === '9';
    };
var isCommentPrefix = exports.isCommentPrefix = function isCommentPrefix(ch) {
        return ';' === ch;
    };
var isNumberLiteral = exports.isNumberLiteral = function isNumberLiteral(reader, initch) {
        return isNumeric(initch) || ('+' === initch || '-' === initch) && isNumeric(peekChar(reader));
    };
var readerError = exports.readerError = function readerError(reader, message) {
        return function () {
            var textø1 = '' + message + '\n' + 'line:' + (reader || 0)['line'] + '\n' + 'column:' + (reader || 0)['column'];
            var errorø1 = SyntaxError(textø1, (reader || 0)['uri']);
            errorø1.line = (reader || 0)['line'];
            errorø1.column = (reader || 0)['column'];
            errorø1.uri = (reader || 0)['uri'];
            return (function () {
                throw errorø1;
            })();
        }.call(this);
    };
var isMacroTerminating = exports.isMacroTerminating = function isMacroTerminating(ch) {
        return !(ch === '#') && !(ch === '\'') && !(ch === ':') && macros(ch);
    };
var readToken = exports.readToken = function readToken(reader, initch) {
        return function loop() {
            var recur = loop;
            var bufferø1 = initch;
            var chø1 = peekChar(reader);
            do {
                recur = isNil(chø1) || isWhitespace(chø1) || isMacroTerminating(chø1) ? bufferø1 : (loop[0] = '' + bufferø1 + readChar(reader), loop[1] = peekChar(reader), loop);
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var skipLine = exports.skipLine = function skipLine(reader, _) {
        return function loop() {
            var recur = loop;
            do {
                recur = function () {
                    var chø1 = readChar(reader);
                    return chø1 === '\n' || chø1 === '\r' || isNil(chø1) ? reader : (loop);
                }.call(this);
            } while (recur === loop);
            return recur;
        }.call(this);
    };
var intPattern = exports.intPattern = rePattern('^([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?$');
var ratioPattern = exports.ratioPattern = rePattern('([-+]?[0-9]+)/([0-9]+)');
var floatPattern = exports.floatPattern = rePattern('([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?');
var matchInt = exports.matchInt = function matchInt(s) {
        return function () {
            var groupsø1 = reFind(intPattern, s);
            var group3ø1 = groupsø1[2];
            return !(isNil(group3ø1) || count(group3ø1) < 1) ? 0 : function () {
                var negateø1 = '-' === groupsø1[1] ? -1 : 1;
                var aø1 = groupsø1[3] ? [
                        groupsø1[3],
                        10
                    ] : groupsø1[4] ? [
                        groupsø1[4],
                        16
                    ] : groupsø1[5] ? [
                        groupsø1[5],
                        8
                    ] : groupsø1[7] ? [
                        groupsø1[7],
                        parseInt(groupsø1[7])
                    ] : 'else' ? [
                        void 0,
                        void 0
                    ] : void 0;
                var nø1 = aø1[0];
                var radixø1 = aø1[1];
                return isNil(nø1) ? void 0 : negateø1 * parseInt(nø1, radixø1);
            }.call(this);
        }.call(this);
    };
var matchRatio = exports.matchRatio = function matchRatio(s) {
        return function () {
            var groupsø1 = reFind(ratioPattern, s);
            var numinatorø1 = groupsø1[1];
            var denominatorø1 = groupsø1[2];
            return parseInt(numinatorø1) / parseInt(denominatorø1);
        }.call(this);
    };
var matchFloat = exports.matchFloat = function matchFloat(s) {
        return parseFloat(s);
    };
var matchNumber = exports.matchNumber = function matchNumber(s) {
        return reMatches(intPattern, s) ? matchInt(s) : reMatches(ratioPattern, s) ? matchRatio(s) : reMatches(floatPattern, s) ? matchFloat(s) : void 0;
    };
var escapeCharMap = exports.escapeCharMap = function escapeCharMap(c) {
        return c === 't' ? '\t' : c === 'r' ? '\r' : c === 'n' ? '\n' : c === '\\' ? '\\' : c === '"' ? '"' : c === 'b' ? '\b' : c === 'f' ? '\f' : 'else' ? void 0 : void 0;
    };
var read2Chars = exports.read2Chars = function read2Chars(reader) {
        return '' + readChar(reader) + readChar(reader);
    };
var read4Chars = exports.read4Chars = function read4Chars(reader) {
        return '' + readChar(reader) + readChar(reader) + readChar(reader) + readChar(reader);
    };
var unicode2Pattern = exports.unicode2Pattern = rePattern('[0-9A-Fa-f]{2}');
var unicode4Pattern = exports.unicode4Pattern = rePattern('[0-9A-Fa-f]{4}');
var validateUnicodeEscape = exports.validateUnicodeEscape = function validateUnicodeEscape(unicodePattern, reader, escapeChar, unicodeStr) {
        return reMatches(unicodePattern, unicodeStr) ? unicodeStr : readerError(reader, '' + 'Unexpected unicode escape ' + '\\' + escapeChar + unicodeStr);
    };
var makeUnicodeChar = exports.makeUnicodeChar = function makeUnicodeChar(codeStr, base) {
        return function () {
            var baseø2 = base || 16;
            var codeø1 = parseInt(codeStr, baseø2);
            return char(codeø1);
        }.call(this);
    };
var escapeChar = exports.escapeChar = function escapeChar(buffer, reader) {
        return function () {
            var chø1 = readChar(reader);
            var mapresultø1 = escapeCharMap(chø1);
            return mapresultø1 ? mapresultø1 : chø1 === 'x' ? makeUnicodeChar(validateUnicodeEscape(unicode2Pattern, reader, chø1, read2Chars(reader))) : chø1 === 'u' ? makeUnicodeChar(validateUnicodeEscape(unicode4Pattern, reader, chø1, read4Chars(reader))) : isNumeric(chø1) ? char(chø1) : 'else' ? readerError(reader, '' + 'Unexpected unicode escape ' + '\\' + chø1) : void 0;
        }.call(this);
    };
var readPast = exports.readPast = function readPast(predicate, reader) {
        return function loop() {
            var recur = loop;
            var _ø1 = void 0;
            do {
                recur = predicate(peekChar(reader)) ? (loop[0] = readChar(reader), loop) : peekChar(reader);
            } while (_ø1 = loop[0], recur === loop);
            return recur;
        }.call(this);
    };
var readDelimitedList = exports.readDelimitedList = function readDelimitedList(delim, reader, isRecursive) {
        return function loop() {
            var recur = loop;
            var formsø1 = [];
            do {
                recur = function () {
                    var _ø1 = readPast(isWhitespace, reader);
                    var chø1 = readChar(reader);
                    !chø1 ? readerError(reader, 'EOF') : void 0;
                    return delim === chø1 ? formsø1 : function () {
                        var formø1 = readForm(reader, chø1);
                        return loop[0] = formø1 === reader ? formsø1 : conj(formsø1, formø1), loop;
                    }.call(this);
                }.call(this);
            } while (formsø1 = loop[0], recur === loop);
            return recur;
        }.call(this);
    };
var notImplemented = exports.notImplemented = function notImplemented(reader, ch) {
        return readerError(reader, '' + 'Reader for ' + ch + ' not implemented yet');
    };
var readDispatch = exports.readDispatch = function readDispatch(reader, _) {
        return function () {
            var chø1 = readChar(reader);
            var dmø1 = dispatchMacros(chø1);
            return dmø1 ? dmø1(reader, _) : function () {
                var objectø1 = maybeReadTaggedType(reader, chø1);
                return objectø1 ? objectø1 : readerError(reader, 'No dispatch macro for ', chø1);
            }.call(this);
        }.call(this);
    };
var readUnmatchedDelimiter = exports.readUnmatchedDelimiter = function readUnmatchedDelimiter(rdr, ch) {
        return readerError(rdr, 'Unmached delimiter ', ch);
    };
var readList = exports.readList = function readList(reader, _) {
        return function () {
            var formø1 = readDelimitedList(')', reader, true);
            return withMeta(list.apply(void 0, formø1), meta(formø1));
        }.call(this);
    };
var readComment = exports.readComment = function readComment(reader, _) {
        return function loop() {
            var recur = loop;
            var bufferø1 = '';
            var chø1 = readChar(reader);
            do {
                recur = isNil(chø1) || '\n' === chø1 ? reader || list(symbol(void 0, 'comment'), bufferø1) : '\\' === chø1 ? (loop[0] = '' + bufferø1 + escapeChar(bufferø1, reader), loop[1] = readChar(reader), loop) : 'else' ? (loop[0] = '' + bufferø1 + chø1, loop[1] = readChar(reader), loop) : void 0;
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readVector = exports.readVector = function readVector(reader) {
        return readDelimitedList(']', reader, true);
    };
var readMap = exports.readMap = function readMap(reader) {
        return function () {
            var formø1 = readDelimitedList('}', reader, true);
            return isOdd(count(formø1)) ? readerError(reader, 'Map literal must contain an even number of forms') : withMeta(dictionary.apply(void 0, formø1), meta(formø1));
        }.call(this);
    };
var readSet = exports.readSet = function readSet(reader, _) {
        return function () {
            var formø1 = readDelimitedList('}', reader, true);
            return withMeta(concat([symbol(void 0, 'set')], formø1), meta(formø1));
        }.call(this);
    };
var readNumber = exports.readNumber = function readNumber(reader, initch) {
        return function loop() {
            var recur = loop;
            var bufferø1 = initch;
            var chø1 = peekChar(reader);
            do {
                recur = isNil(chø1) || isWhitespace(chø1) || macros(chø1) ? (function () {
                    var match = matchNumber(bufferø1);
                    return isNil(match) ? readerError(reader, 'Invalid number format [', bufferø1, ']') : new Number(match);
                })() : (loop[0] = '' + bufferø1 + readChar(reader), loop[1] = peekChar(reader), loop);
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readString = exports.readString = function readString(reader) {
        return function loop() {
            var recur = loop;
            var bufferø1 = '';
            var chø1 = readChar(reader);
            do {
                recur = isNil(chø1) ? readerError(reader, 'EOF while reading string') : '\\' === chø1 ? (loop[0] = '' + bufferø1 + escapeChar(bufferø1, reader), loop[1] = readChar(reader), loop) : '"' === chø1 ? new String(bufferø1) : 'default' ? (loop[0] = '' + bufferø1 + chø1, loop[1] = readChar(reader), loop) : void 0;
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readCharacter = exports.readCharacter = function readCharacter(reader) {
        return new String(readChar(reader));
    };
var readUnquote = exports.readUnquote = function readUnquote(reader) {
        return function () {
            var chø1 = peekChar(reader);
            return !chø1 ? readerError(reader, 'EOF while reading character') : chø1 === '@' ? (function () {
                readChar(reader);
                return list(symbol(void 0, 'unquote-splicing'), read(reader, true, void 0, true));
            })() : list(symbol(void 0, 'unquote'), read(reader, true, void 0, true));
        }.call(this);
    };
var specialSymbols = exports.specialSymbols = function specialSymbols(text, notFound) {
        return text === 'nil' ? void 0 : text === 'true' ? true : text === 'false' ? false : 'else' ? notFound : void 0;
    };
var readSymbol = exports.readSymbol = function readSymbol(reader, initch) {
        return function () {
            var tokenø1 = readToken(reader, initch);
            var partsø1 = split(tokenø1, '/');
            var hasNsø1 = count(partsø1) > 1 && count(tokenø1) > 1;
            var nsø1 = first(partsø1);
            var nameø1 = join('/', rest(partsø1));
            return hasNsø1 ? symbol(nsø1, nameø1) : specialSymbols(tokenø1, symbol(tokenø1));
        }.call(this);
    };
var readKeyword = exports.readKeyword = function readKeyword(reader, initch) {
        return function () {
            var tokenø1 = readToken(reader, readChar(reader));
            var partsø1 = split(tokenø1, '/');
            var nameø1 = last(partsø1);
            var nsø1 = count(partsø1) > 1 ? join('/', butlast(partsø1)) : void 0;
            var issueø1 = last(nsø1) === ':' ? 'namespace can\'t ends with ":"' : last(nameø1) === ':' ? 'name can\'t end with ":"' : last(nameø1) === '/' ? 'name can\'t end with "/"' : count(split(tokenø1, '::')) > 1 ? 'name can\'t contain "::"' : void 0;
            return issueø1 ? readerError(reader, 'Invalid token (', issueø1, '): ', tokenø1) : !nsø1 && first(nameø1) === ':' ? keyword(rest(nameø1)) : keyword(nsø1, nameø1);
        }.call(this);
    };
var desugarMeta = exports.desugarMeta = function desugarMeta(form) {
        return isKeyword(form) ? dictionary(name(form), true) : isSymbol(form) ? { 'tag': form } : isString(form) ? { 'tag': form } : isDictionary(form) ? reduce(function (result, pair) {
            (result || 0)[name(first(pair))] = second(pair);
            return result;
        }, {}, form) : 'else' ? form : void 0;
    };
var wrappingReader = exports.wrappingReader = function wrappingReader(prefix) {
        return function (reader) {
            return list(prefix, read(reader, true, void 0, true));
        };
    };
var throwingReader = exports.throwingReader = function throwingReader(msg) {
        return function (reader) {
            return readerError(reader, msg);
        };
    };
var readMeta = exports.readMeta = function readMeta(reader, _) {
        return function () {
            var metadataø1 = desugarMeta(read(reader, true, void 0, true));
            !isDictionary(metadataø1) ? readerError(reader, 'Metadata must be Symbol, Keyword, String or Map') : void 0;
            return function () {
                var formø1 = read(reader, true, void 0, true);
                return isObject(formø1) ? withMeta(formø1, conj(metadataø1, meta(formø1))) : formø1;
            }.call(this);
        }.call(this);
    };
var readRegex = exports.readRegex = function readRegex(reader) {
        return function loop() {
            var recur = loop;
            var bufferø1 = '';
            var chø1 = readChar(reader);
            do {
                recur = isNil(chø1) ? readerError(reader, 'EOF while reading string') : '\\' === chø1 ? (loop[0] = '' + bufferø1 + chø1 + readChar(reader), loop[1] = readChar(reader), loop) : '"' === chø1 ? rePattern(bufferø1) : 'default' ? (loop[0] = '' + bufferø1 + chø1, loop[1] = readChar(reader), loop) : void 0;
            } while (bufferø1 = loop[0], chø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var readParam = exports.readParam = function readParam(reader, initch) {
        return function () {
            var formø1 = readSymbol(reader, initch);
            return isEqual(formø1, symbol('%')) ? symbol('%1') : formø1;
        }.call(this);
    };
var isParam = exports.isParam = function isParam(form) {
        return isSymbol(form) && '%' === first(name(form));
    };
var lambdaParamsHash = exports.lambdaParamsHash = function lambdaParamsHash(form) {
        return isParam(form) ? dictionary(form, form) : isDictionary(form) || isVector(form) || isList(form) ? conj.apply(void 0, map(lambdaParamsHash, vec(form))) : 'else' ? {} : void 0;
    };
var lambdaParams = exports.lambdaParams = function lambdaParams(body) {
        return function () {
            var namesø1 = sort(vals(lambdaParamsHash(body)));
            var variadicø1 = isEqual(first(namesø1), symbol('%&'));
            var nø1 = variadicø1 && count(namesø1) === 1 ? 0 : parseInt(rest(name(last(namesø1))));
            var paramsø1 = function loop() {
                    var recur = loop;
                    var namesø2 = [];
                    var iø1 = 1;
                    do {
                        recur = iø1 <= nø1 ? (loop[0] = conj(namesø2, symbol('' + '%' + iø1)), loop[1] = inc(iø1), loop) : namesø2;
                    } while (namesø2 = loop[0], iø1 = loop[1], recur === loop);
                    return recur;
                }.call(this);
            return variadicø1 ? conj(paramsø1, symbol(void 0, '&'), symbol(void 0, '%&')) : namesø1;
        }.call(this);
    };
var readLambda = exports.readLambda = function readLambda(reader) {
        return function () {
            var bodyø1 = readList(reader);
            return list(symbol(void 0, 'fn'), lambdaParams(bodyø1), bodyø1);
        }.call(this);
    };
var readDiscard = exports.readDiscard = function readDiscard(reader, _) {
        read(reader, true, void 0, true);
        return reader;
    };
var macros = exports.macros = function macros(c) {
        return c === '"' ? readString : c === '\\' ? readCharacter : c === ':' ? readKeyword : c === ';' ? readComment : c === '\'' ? wrappingReader(symbol(void 0, 'quote')) : c === '@' ? wrappingReader(symbol(void 0, 'deref')) : c === '^' ? readMeta : c === '`' ? wrappingReader(symbol(void 0, 'syntax-quote')) : c === '~' ? readUnquote : c === '(' ? readList : c === ')' ? readUnmatchedDelimiter : c === '[' ? readVector : c === ']' ? readUnmatchedDelimiter : c === '{' ? readMap : c === '}' ? readUnmatchedDelimiter : c === '%' ? readParam : c === '#' ? readDispatch : 'else' ? void 0 : void 0;
    };
var dispatchMacros = exports.dispatchMacros = function dispatchMacros(s) {
        return s === '{' ? readSet : s === '(' ? readLambda : s === '<' ? throwingReader('Unreadable form') : s === '"' ? readRegex : s === '!' ? readComment : s === '_' ? readDiscard : 'else' ? void 0 : void 0;
    };
var readForm = exports.readForm = function readForm(reader, ch) {
        return function () {
            var startø1 = {
                    'line': (reader || 0)['line'],
                    'column': (reader || 0)['column']
                };
            var readMacroø1 = macros(ch);
            var formø1 = readMacroø1 ? readMacroø1(reader, ch) : isNumberLiteral(reader, ch) ? readNumber(reader, ch) : 'else' ? readSymbol(reader, ch) : void 0;
            var endø1 = {
                    'line': (reader || 0)['line'],
                    'column': inc((reader || 0)['column'])
                };
            var locationø1 = {
                    'uri': (reader || 0)['uri'],
                    'start': startø1,
                    'end': endø1
                };
            return formø1 === reader ? formø1 : !(isBoolean(formø1) || isNil(formø1) || isKeyword(formø1)) ? withMeta(formø1, conj(locationø1, meta(formø1))) : 'else' ? formø1 : void 0;
        }.call(this);
    };
var read = exports.read = function read(reader, eofIsError, sentinel, isRecursive) {
        return function loop() {
            var recur = loop;
            do {
                recur = function () {
                    var chø1 = readChar(reader);
                    var formø1 = isNil(chø1) ? eofIsError ? readerError(reader, 'EOF') : sentinel : isWhitespace(chø1) ? reader : isCommentPrefix(chø1) ? read(readComment(reader, chø1), eofIsError, sentinel, isRecursive) : 'else' ? readForm(reader, chø1) : void 0;
                    return formø1 === reader ? (loop) : formø1;
                }.call(this);
            } while (recur === loop);
            return recur;
        }.call(this);
    };
var read_ = exports.read_ = function read_(source, uri) {
        return function () {
            var readerø1 = pushBackReader(source, uri);
            var eofø1 = gensym();
            return function loop() {
                var recur = loop;
                var formsø1 = [];
                var formø1 = read(readerø1, false, eofø1, false);
                do {
                    recur = formø1 === eofø1 ? formsø1 : (loop[0] = conj(formsø1, formø1), loop[1] = read(readerø1, false, eofø1, false), loop);
                } while (formsø1 = loop[0], formø1 = loop[1], recur === loop);
                return recur;
            }.call(this);
        }.call(this);
    };
var readFromString = exports.readFromString = function readFromString(source, uri) {
        return function () {
            var readerø1 = pushBackReader(source, uri);
            return read(readerø1, true, void 0, false);
        }.call(this);
    };
var readUuid = function readUuid(uuid) {
    return isString(uuid) ? list.apply(void 0, [symbol(void 0, 'UUID.')].concat([uuid])) : readerError(void 0, 'UUID literal expects a string as its representation.');
};
var readQueue = function readQueue(items) {
    return isVector(items) ? list.apply(void 0, [symbol(void 0, 'PersistentQueue.')].concat([items])) : readerError(void 0, 'Queue literal expects a vector for its elements.');
};
var __tagTable__ = exports.__tagTable__ = dictionary('uuid', readUuid, 'queue', readQueue);
var maybeReadTaggedType = exports.maybeReadTaggedType = function maybeReadTaggedType(reader, initch) {
        return function () {
            var tagø1 = readSymbol(reader, initch);
            var pfnø1 = (__tagTable__ || 0)[name(tagø1)];
            return pfnø1 ? pfnø1(read(reader, true, void 0, false)) : readerError(reader, '' + 'Could not find tag parser for ' + name(tagø1) + ' in ' + ('' + keys(__tagTable__)));
        }.call(this);
    };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvcmVhZGVyLndpc3AiXSwibmFtZXMiOlsibGlzdCIsImlzTGlzdCIsImNvdW50IiwiaXNFbXB0eSIsImZpcnN0Iiwic2Vjb25kIiwidGhpcmQiLCJyZXN0IiwibWFwIiwidmVjIiwiY29ucyIsImNvbmoiLCJjb25jYXQiLCJsYXN0IiwiYnV0bGFzdCIsInNvcnQiLCJsYXp5U2VxIiwicmVkdWNlIiwiaXNPZGQiLCJkaWN0aW9uYXJ5Iiwia2V5cyIsImlzTmlsIiwiaW5jIiwiZGVjIiwiaXNWZWN0b3IiLCJpc1N0cmluZyIsImlzTnVtYmVyIiwiaXNCb29sZWFuIiwiaXNPYmplY3QiLCJpc0RpY3Rpb25hcnkiLCJyZVBhdHRlcm4iLCJyZU1hdGNoZXMiLCJyZUZpbmQiLCJzdHIiLCJzdWJzIiwiY2hhciIsInZhbHMiLCJpc0VxdWFsIiwiaXNTeW1ib2wiLCJzeW1ib2wiLCJpc0tleXdvcmQiLCJrZXl3b3JkIiwibWV0YSIsIndpdGhNZXRhIiwibmFtZSIsImdlbnN5bSIsInNwbGl0Iiwiam9pbiIsInB1c2hCYWNrUmVhZGVyIiwic291cmNlIiwidXJpIiwicGVla0NoYXIiLCJyZWFkZXIiLCJsaW5lw7gxIiwiY29sdW1uw7gxIiwicmVhZENoYXIiLCJjaMO4MSIsImlzTmV3bGluZSIsImNoIiwiaXNCcmVha2luZ1doaXRlc3BhY2UiLCJpc1doaXRlc3BhY2UiLCJpc051bWVyaWMiLCJpc0NvbW1lbnRQcmVmaXgiLCJpc051bWJlckxpdGVyYWwiLCJpbml0Y2giLCJyZWFkZXJFcnJvciIsIm1lc3NhZ2UiLCJ0ZXh0w7gxIiwiZXJyb3LDuDEiLCJTeW50YXhFcnJvciIsImxpbmUiLCJjb2x1bW4iLCJpc01hY3JvVGVybWluYXRpbmciLCJtYWNyb3MiLCJyZWFkVG9rZW4iLCJidWZmZXLDuDEiLCJza2lwTGluZSIsIl8iLCJpbnRQYXR0ZXJuIiwicmF0aW9QYXR0ZXJuIiwiZmxvYXRQYXR0ZXJuIiwibWF0Y2hJbnQiLCJzIiwiZ3JvdXBzw7gxIiwiZ3JvdXAzw7gxIiwibmVnYXRlw7gxIiwiYcO4MSIsInBhcnNlSW50IiwibsO4MSIsInJhZGl4w7gxIiwibWF0Y2hSYXRpbyIsIm51bWluYXRvcsO4MSIsImRlbm9taW5hdG9yw7gxIiwibWF0Y2hGbG9hdCIsInBhcnNlRmxvYXQiLCJtYXRjaE51bWJlciIsImVzY2FwZUNoYXJNYXAiLCJjIiwicmVhZDJDaGFycyIsInJlYWQ0Q2hhcnMiLCJ1bmljb2RlMlBhdHRlcm4iLCJ1bmljb2RlNFBhdHRlcm4iLCJ2YWxpZGF0ZVVuaWNvZGVFc2NhcGUiLCJ1bmljb2RlUGF0dGVybiIsImVzY2FwZUNoYXIiLCJ1bmljb2RlU3RyIiwibWFrZVVuaWNvZGVDaGFyIiwiY29kZVN0ciIsImJhc2UiLCJiYXNlw7gyIiwiY29kZcO4MSIsImJ1ZmZlciIsIm1hcHJlc3VsdMO4MSIsInJlYWRQYXN0IiwicHJlZGljYXRlIiwiX8O4MSIsInJlYWREZWxpbWl0ZWRMaXN0IiwiZGVsaW0iLCJpc1JlY3Vyc2l2ZSIsImZvcm1zw7gxIiwiZm9ybcO4MSIsInJlYWRGb3JtIiwibm90SW1wbGVtZW50ZWQiLCJyZWFkRGlzcGF0Y2giLCJkbcO4MSIsImRpc3BhdGNoTWFjcm9zIiwib2JqZWN0w7gxIiwibWF5YmVSZWFkVGFnZ2VkVHlwZSIsInJlYWRVbm1hdGNoZWREZWxpbWl0ZXIiLCJyZHIiLCJyZWFkTGlzdCIsInJlYWRDb21tZW50IiwicmVhZFZlY3RvciIsInJlYWRNYXAiLCJyZWFkU2V0IiwicmVhZE51bWJlciIsIm1hdGNoIiwicmVhZFN0cmluZyIsInJlYWRDaGFyYWN0ZXIiLCJyZWFkVW5xdW90ZSIsInJlYWQiLCJzcGVjaWFsU3ltYm9scyIsInRleHQiLCJub3RGb3VuZCIsInJlYWRTeW1ib2wiLCJ0b2tlbsO4MSIsInBhcnRzw7gxIiwiaGFzTnPDuDEiLCJuc8O4MSIsIm5hbWXDuDEiLCJyZWFkS2V5d29yZCIsImlzc3Vlw7gxIiwiZGVzdWdhck1ldGEiLCJmb3JtIiwicmVzdWx0IiwicGFpciIsIndyYXBwaW5nUmVhZGVyIiwicHJlZml4IiwidGhyb3dpbmdSZWFkZXIiLCJtc2ciLCJyZWFkTWV0YSIsIm1ldGFkYXRhw7gxIiwicmVhZFJlZ2V4IiwicmVhZFBhcmFtIiwiaXNQYXJhbSIsImxhbWJkYVBhcmFtc0hhc2giLCJsYW1iZGFQYXJhbXMiLCJib2R5IiwibmFtZXPDuDEiLCJ2YXJpYWRpY8O4MSIsInBhcmFtc8O4MSIsIm5hbWVzw7gyIiwiacO4MSIsInJlYWRMYW1iZGEiLCJib2R5w7gxIiwicmVhZERpc2NhcmQiLCJzdGFydMO4MSIsInJlYWRNYWNyb8O4MSIsImVuZMO4MSIsImxvY2F0aW9uw7gxIiwiZW9mSXNFcnJvciIsInNlbnRpbmVsIiwicmVhZF8iLCJyZWFkZXLDuDEiLCJlb2bDuDEiLCJyZWFkRnJvbVN0cmluZyIsInJlYWRVdWlkIiwidXVpZCIsInJlYWRRdWV1ZSIsIml0ZW1zIiwiX190YWdUYWJsZV9fIiwidGFnw7gxIiwicGZuw7gxIl0sIm1hcHBpbmdzIjoiQUFBQTtJOzs7VUFBQTtJLDBDQUFBO0ksSUFHbUNBLElBQUEsRyxjQUFBQSxJLENBSG5DO0ksSUFHd0NDLE1BQUEsRyxjQUFBQSxNLENBSHhDO0ksSUFHOENDLEtBQUEsRyxjQUFBQSxLLENBSDlDO0ksSUFHb0RDLE9BQUEsRyxjQUFBQSxPLENBSHBEO0ksSUFHMkRDLEtBQUEsRyxjQUFBQSxLLENBSDNEO0ksSUFHaUVDLE1BQUEsRyxjQUFBQSxNLENBSGpFO0ksSUFHd0VDLEtBQUEsRyxjQUFBQSxLLENBSHhFO0ksSUFJbUNDLElBQUEsRyxjQUFBQSxJLENBSm5DO0ksSUFJd0NDLEdBQUEsRyxjQUFBQSxHLENBSnhDO0ksSUFJNENDLEdBQUEsRyxjQUFBQSxHLENBSjVDO0ksSUFJZ0RDLElBQUEsRyxjQUFBQSxJLENBSmhEO0ksSUFJcURDLElBQUEsRyxjQUFBQSxJLENBSnJEO0ksSUFJMERKLElBQUEsRyxjQUFBQSxJLENBSjFEO0ksSUFJK0RLLE1BQUEsRyxjQUFBQSxNLENBSi9EO0ksSUFJc0VDLElBQUEsRyxjQUFBQSxJLENBSnRF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QU9BLElBQWdCMkgsU0FBQSxHQUFoQixTQUFnQkEsU0FBaEIsQ0FDR0MsS0FESCxFO0lBRUUsT0FBS3JLLFFBQUQsQ0FBU3FLLEtBQVQsQ0FBSixHLFVBQ0UsQyxNQUFBLEUsT0FBRSxDLE1BQUEsRSxrQkFBQSxDLFVBQWtCQSxLLEVBQXBCLENBREYsR0FFRzVILFdBQUQsQyxNQUFBLEUsa0RBQUEsQ0FGRixDO0NBRkYsQztBQVFBLElBQUs2SCxZQUFBLEcsUUFBQUEsWSxHQUNGM0ssVUFBRCxDLE1BQUEsRUFBa0J1SyxRQUFsQixFLE9BQUEsRUFDbUJFLFNBRG5CLENBREYsQztBQUlBLElBQU03RCxtQkFBQSxHLFFBQUFBLG1CLEdBQU4sU0FBTUEsbUJBQU4sQ0FDRzNFLE1BREgsRUFDVVksTUFEVixFO1FBRUUsTztZQUFNLElBQUErSCxLLEdBQUsvQyxVQUFELENBQWE1RixNQUFiLEVBQW9CWSxNQUFwQixDQUFKLEM7WUFDQSxJQUFBZ0ksSyxJQUFTRixZLE1BQUwsQ0FBb0JsSixJQUFELENBQU1tSixLQUFOLENBQW5CLENBQUosQztZQUNKLE9BQUlDLEtBQUosR0FDR0EsS0FBRCxDQUFNcEQsSUFBRCxDQUFNeEYsTUFBTixFLElBQUEsRSxNQUFBLEUsS0FBQSxDQUFMLENBREYsR0FFR2EsV0FBRCxDQUFjYixNQUFkLEUsd0NBRW9CUixJQUFELENBQU1tSixLQUFOLEMsU0FETCxHQUdLLEMsRUFBQSxHQUFNM0ssSUFBRCxDQUFNMEssWUFBTixDQUFMLENBSm5CLENBRkYsQztjQUZGLEMsSUFBQSxFO0tBRkYiLCJzb3VyY2VzQ29udGVudCI6WyIobnMgd2lzcC5yZWFkZXJcbiAgXCJSZWFkZXIgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyBmb3IgcmVhZGluZyB0ZXh0IGlucHV0XG4gIGFzIHdpc3AgZGF0YSBzdHJ1Y3R1cmVzXCJcbiAgKDpyZXF1aXJlIFt3aXNwLnNlcXVlbmNlIDpyZWZlciBbbGlzdCBsaXN0PyBjb3VudCBlbXB0eT8gZmlyc3Qgc2Vjb25kIHRoaXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3QgbWFwIHZlYyBjb25zIGNvbmogcmVzdCBjb25jYXQgbGFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidXRsYXN0IHNvcnQgbGF6eS1zZXEgcmVkdWNlXV1cbiAgICAgICAgICAgIFt3aXNwLnJ1bnRpbWUgOnJlZmVyIFtvZGQ/IGRpY3Rpb25hcnkga2V5cyBuaWw/IGluYyBkZWMgdmVjdG9yPyBzdHJpbmc/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyPyBib29sZWFuPyBvYmplY3Q/IGRpY3Rpb25hcnk/IHJlLXBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZS1tYXRjaGVzIHJlLWZpbmQgc3RyIHN1YnMgY2hhciB2YWxzID1dXVxuICAgICAgICAgICAgW3dpc3AuYXN0IDpyZWZlciBbc3ltYm9sPyBzeW1ib2wga2V5d29yZD8ga2V5d29yZCBtZXRhIHdpdGgtbWV0YSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5zeW1dXVxuICAgICAgICAgICAgW3dpc3Auc3RyaW5nIDpyZWZlciBbc3BsaXQgam9pbl1dKSlcblxuKGRlZm4gcHVzaC1iYWNrLXJlYWRlclxuICBcIkNyZWF0ZXMgYSBTdHJpbmdQdXNoYmFja1JlYWRlciBmcm9tIGEgZ2l2ZW4gc3RyaW5nXCJcbiAgW3NvdXJjZSB1cmldXG4gIHs6bGluZXMgKHNwbGl0IHNvdXJjZSBcIlxcblwiKSA6YnVmZmVyIFwiXCJcbiAgIDp1cmkgdXJpXG4gICA6Y29sdW1uIC0xIDpsaW5lIDB9KVxuXG4oZGVmbiBwZWVrLWNoYXJcbiAgXCJSZXR1cm5zIG5leHQgY2hhciBmcm9tIHRoZSBSZWFkZXIgd2l0aG91dCByZWFkaW5nIGl0LlxuICBuaWwgaWYgdGhlIGVuZCBvZiBzdHJlYW0gaGFzIGJlaW5nIHJlYWNoZWQuXCJcbiAgW3JlYWRlcl1cbiAgKGxldCBbbGluZSAoYWdldCAoOmxpbmVzIHJlYWRlcilcbiAgICAgICAgICAgICAgICAgICAoOmxpbmUgcmVhZGVyKSlcbiAgICAgICAgY29sdW1uIChpbmMgKDpjb2x1bW4gcmVhZGVyKSldXG4gICAgKGlmIChuaWw/IGxpbmUpXG4gICAgICBuaWxcbiAgICAgIChvciAoYWdldCBsaW5lIGNvbHVtbikgXCJcXG5cIikpKSlcblxuKGRlZm4gcmVhZC1jaGFyXG4gIFwiUmV0dXJucyB0aGUgbmV4dCBjaGFyIGZyb20gdGhlIFJlYWRlciwgbmlsIGlmIHRoZSBlbmRcbiAgb2Ygc3RyZWFtIGhhcyBiZWVuIHJlYWNoZWRcIlxuICBbcmVhZGVyXVxuICAobGV0IFtjaCAocGVlay1jaGFyIHJlYWRlcildXG4gICAgOzsgVXBkYXRlIGxpbmUgY29sdW1uIGRlcGVuZGluZyBvbiB3aGF0IGhhcyBiZWluZyByZWFkLlxuICAgIChpZiAobmV3bGluZT8gKHBlZWstY2hhciByZWFkZXIpKVxuICAgICAgKGRvXG4gICAgICAgIChzZXQhICg6bGluZSByZWFkZXIpIChpbmMgKDpsaW5lIHJlYWRlcikpKVxuICAgICAgICAoc2V0ISAoOmNvbHVtbiByZWFkZXIpIC0xKSlcbiAgICAgIChzZXQhICg6Y29sdW1uIHJlYWRlcikgKGluYyAoOmNvbHVtbiByZWFkZXIpKSkpXG4gICAgY2gpKVxuXG47OyBQcmVkaWNhdGVzXG5cbihkZWZuIF5ib29sZWFuIG5ld2xpbmU/XG4gIFwiQ2hlY2tzIHdoZXRoZXIgdGhlIGNoYXJhY3RlciBpcyBhIG5ld2xpbmUuXCJcbiAgW2NoXVxuICAoaWRlbnRpY2FsPyBcIlxcblwiIGNoKSlcblxuKGRlZm4gXmJvb2xlYW4gYnJlYWtpbmctd2hpdGVzcGFjZT9cbiBcIkNoZWNrcyBpZiBhIHN0cmluZyBpcyBhbGwgYnJlYWtpbmcgd2hpdGVzcGFjZS5cIlxuIFtjaF1cbiAob3IgKGlkZW50aWNhbD8gY2ggXCIgXCIpXG4gICAgIChpZGVudGljYWw/IGNoIFwiXFx0XCIpXG4gICAgIChpZGVudGljYWw/IGNoIFwiXFxuXCIpXG4gICAgIChpZGVudGljYWw/IGNoIFwiXFxyXCIpKSlcblxuKGRlZm4gXmJvb2xlYW4gd2hpdGVzcGFjZT9cbiAgXCJDaGVja3Mgd2hldGhlciBhIGdpdmVuIGNoYXJhY3RlciBpcyB3aGl0ZXNwYWNlXCJcbiAgW2NoXVxuICAob3IgKGJyZWFraW5nLXdoaXRlc3BhY2U/IGNoKSAoaWRlbnRpY2FsPyBcIixcIiBjaCkpKVxuXG4oZGVmbiBeYm9vbGVhbiBudW1lcmljP1xuIFwiQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBjaGFyYWN0ZXIgaXMgbnVtZXJpY1wiXG4gW2NoXVxuIChvciAoaWRlbnRpY2FsPyBjaCBcXDApXG4gICAgIChpZGVudGljYWw/IGNoIFxcMSlcbiAgICAgKGlkZW50aWNhbD8gY2ggXFwyKVxuICAgICAoaWRlbnRpY2FsPyBjaCBcXDMpXG4gICAgIChpZGVudGljYWw/IGNoIFxcNClcbiAgICAgKGlkZW50aWNhbD8gY2ggXFw1KVxuICAgICAoaWRlbnRpY2FsPyBjaCBcXDYpXG4gICAgIChpZGVudGljYWw/IGNoIFxcNylcbiAgICAgKGlkZW50aWNhbD8gY2ggXFw4KVxuICAgICAoaWRlbnRpY2FsPyBjaCBcXDkpKSlcblxuKGRlZm4gXmJvb2xlYW4gY29tbWVudC1wcmVmaXg/XG4gIFwiQ2hlY2tzIHdoZXRoZXIgdGhlIGNoYXJhY3RlciBiZWdpbnMgYSBjb21tZW50LlwiXG4gIFtjaF1cbiAgKGlkZW50aWNhbD8gXCI7XCIgY2gpKVxuXG5cbihkZWZuIF5ib29sZWFuIG51bWJlci1saXRlcmFsP1xuICBcIkNoZWNrcyB3aGV0aGVyIHRoZSByZWFkZXIgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgbnVtYmVyIGxpdGVyYWxcIlxuICBbcmVhZGVyIGluaXRjaF1cbiAgKG9yIChudW1lcmljPyBpbml0Y2gpXG4gICAgICAoYW5kIChvciAoaWRlbnRpY2FsPyBcXCsgaW5pdGNoKVxuICAgICAgICAgICAgICAgKGlkZW50aWNhbD8gXFwtIGluaXRjaCkpXG4gICAgICAgICAgIChudW1lcmljPyAocGVlay1jaGFyIHJlYWRlcikpKSkpXG5cblxuXG47OyByZWFkIGhlbHBlcnNcblxuKGRlZm4gcmVhZGVyLWVycm9yXG4gIFtyZWFkZXIgbWVzc2FnZV1cbiAgKGxldCBbdGV4dCAoc3RyIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgIFwiXFxuXCIgXCJsaW5lOlwiICg6bGluZSByZWFkZXIpXG4gICAgICAgICAgICAgICAgICBcIlxcblwiIFwiY29sdW1uOlwiICg6Y29sdW1uIHJlYWRlcikpXG4gICAgICAgIGVycm9yIChTeW50YXhFcnJvciB0ZXh0ICg6dXJpIHJlYWRlcikpXVxuICAgIChzZXQhIGVycm9yLmxpbmUgKDpsaW5lIHJlYWRlcikpXG4gICAgKHNldCEgZXJyb3IuY29sdW1uICg6Y29sdW1uIHJlYWRlcikpXG4gICAgKHNldCEgZXJyb3IudXJpICg6dXJpIHJlYWRlcikpXG4gICAgKHRocm93IGVycm9yKSkpXG5cbihkZWZuIF5ib29sZWFuIG1hY3JvLXRlcm1pbmF0aW5nPyBbY2hdXG4gIChhbmQgKG5vdCAoaWRlbnRpY2FsPyBjaCBcIiNcIikpXG4gICAgICAgKG5vdCAoaWRlbnRpY2FsPyBjaCBcIidcIikpXG4gICAgICAgKG5vdCAoaWRlbnRpY2FsPyBjaCBcIjpcIikpXG4gICAgICAgKG1hY3JvcyBjaCkpKVxuXG5cbihkZWZuIHJlYWQtdG9rZW5cbiAgXCJSZWFkcyBvdXQgbmV4dCB0b2tlbiBmcm9tIHRoZSByZWFkZXIgc3RyZWFtXCJcbiAgW3JlYWRlciBpbml0Y2hdXG4gIChsb29wIFtidWZmZXIgaW5pdGNoXG4gICAgICAgICBjaCAocGVlay1jaGFyIHJlYWRlcildXG5cbiAgICAoaWYgKG9yIChuaWw/IGNoKVxuICAgICAgICAgICAgKHdoaXRlc3BhY2U/IGNoKVxuICAgICAgICAgICAgKG1hY3JvLXRlcm1pbmF0aW5nPyBjaCkpIGJ1ZmZlclxuICAgICAgICAocmVjdXIgKHN0ciBidWZmZXIgKHJlYWQtY2hhciByZWFkZXIpKVxuICAgICAgICAgICAgICAgKHBlZWstY2hhciByZWFkZXIpKSkpKVxuXG4oZGVmbiBza2lwLWxpbmVcbiAgXCJBZHZhbmNlcyB0aGUgcmVhZGVyIHRvIHRoZSBlbmQgb2YgYSBsaW5lLiBSZXR1cm5zIHRoZSByZWFkZXJcIlxuICBbcmVhZGVyIF9dXG4gIChsb29wIFtdXG4gICAgKGxldCBbY2ggKHJlYWQtY2hhciByZWFkZXIpXVxuICAgICAgKGlmIChvciAoaWRlbnRpY2FsPyBjaCBcIlxcblwiKVxuICAgICAgICAgICAgICAoaWRlbnRpY2FsPyBjaCBcIlxcclwiKVxuICAgICAgICAgICAgICAobmlsPyBjaCkpXG4gICAgICAgIHJlYWRlclxuICAgICAgICAocmVjdXIpKSkpKVxuXG5cbjs7IE5vdGU6IElucHV0IGJlZ2luIGFuZCBlbmQgbWF0Y2hlcnMgYXJlIHVzZWQgaW4gYSBwYXR0ZXJuIHNpbmNlIG90aGVyd2lzZVxuOzsgYW55dGhpbmcgYmVnaW5pbm5nIHdpdGggYDBgIHdpbGwgbWF0Y2gganVzdCBgMGAgY2F1c2UgaXQncyBsaXN0ZWQgZmlyc3QuXG4oZGVmIGludC1wYXR0ZXJuIChyZS1wYXR0ZXJuIFwiXihbLStdPykoPzooMCl8KFsxLTldWzAtOV0qKXwwW3hYXShbMC05QS1GYS1mXSspfDAoWzAtN10rKXwoWzEtOV1bMC05XT8pW3JSXShbMC05QS1aYS16XSspfDBbMC05XSspKE4pPyRcIikpXG4oZGVmIHJhdGlvLXBhdHRlcm4gKHJlLXBhdHRlcm4gXCIoWy0rXT9bMC05XSspLyhbMC05XSspXCIpKVxuKGRlZiBmbG9hdC1wYXR0ZXJuIChyZS1wYXR0ZXJuIFwiKFstK10/WzAtOV0rKFxcXFwuWzAtOV0qKT8oW2VFXVstK10/WzAtOV0rKT8pKE0pP1wiKSlcblxuKGRlZm4gbWF0Y2gtaW50XG4gIFtzXVxuICAobGV0IFtncm91cHMgKHJlLWZpbmQgaW50LXBhdHRlcm4gcylcbiAgICAgICAgZ3JvdXAzIChhZ2V0IGdyb3VwcyAyKV1cbiAgICAoaWYgKG5vdCAob3IgKG5pbD8gZ3JvdXAzKVxuICAgICAgICAgICAgICAgICAoPCAoY291bnQgZ3JvdXAzKSAxKSkpXG4gICAgICAwXG4gICAgICAobGV0IFtuZWdhdGUgKGlmIChpZGVudGljYWw/IFwiLVwiIChhZ2V0IGdyb3VwcyAxKSkgLTEgMSlcbiAgICAgICAgICAgIGEgKGNvbmRcbiAgICAgICAgICAgICAgIChhZ2V0IGdyb3VwcyAzKSBbKGFnZXQgZ3JvdXBzIDMpIDEwXVxuICAgICAgICAgICAgICAgKGFnZXQgZ3JvdXBzIDQpIFsoYWdldCBncm91cHMgNCkgMTZdXG4gICAgICAgICAgICAgICAoYWdldCBncm91cHMgNSkgWyhhZ2V0IGdyb3VwcyA1KSA4XVxuICAgICAgICAgICAgICAgKGFnZXQgZ3JvdXBzIDcpIFsoYWdldCBncm91cHMgNykgKHBhcnNlLWludCAoYWdldCBncm91cHMgNykpXVxuICAgICAgICAgICAgICAgOmVsc2UgW25pbCBuaWxdKVxuICAgICAgICAgICAgbiAoYWdldCBhIDApXG4gICAgICAgICAgICByYWRpeCAoYWdldCBhIDEpXVxuICAgICAgICAoaWYgKG5pbD8gbilcbiAgICAgICAgICBuaWxcbiAgICAgICAgICAoKiBuZWdhdGUgKHBhcnNlLWludCBuIHJhZGl4KSkpKSkpKVxuXG4oZGVmbiBtYXRjaC1yYXRpb1xuICBbc11cbiAgKGxldCBbZ3JvdXBzIChyZS1maW5kIHJhdGlvLXBhdHRlcm4gcylcbiAgICAgICAgbnVtaW5hdG9yIChhZ2V0IGdyb3VwcyAxKVxuICAgICAgICBkZW5vbWluYXRvciAoYWdldCBncm91cHMgMildXG4gICAgKC8gKHBhcnNlLWludCBudW1pbmF0b3IpIChwYXJzZS1pbnQgZGVub21pbmF0b3IpKSkpXG5cbihkZWZuIG1hdGNoLWZsb2F0XG4gIFtzXVxuICAocGFyc2UtZmxvYXQgcykpXG5cblxuKGRlZm4gbWF0Y2gtbnVtYmVyXG4gIFtzXVxuICAoY29uZFxuICAgKHJlLW1hdGNoZXMgaW50LXBhdHRlcm4gcykgKG1hdGNoLWludCBzKVxuICAgKHJlLW1hdGNoZXMgcmF0aW8tcGF0dGVybiBzKSAobWF0Y2gtcmF0aW8gcylcbiAgIChyZS1tYXRjaGVzIGZsb2F0LXBhdHRlcm4gcykgKG1hdGNoLWZsb2F0IHMpKSlcblxuKGRlZm4gZXNjYXBlLWNoYXItbWFwIFtjXVxuICAoY29uZFxuICAgKGlkZW50aWNhbD8gYyBcXHQpIFwiXFx0XCJcbiAgIChpZGVudGljYWw/IGMgXFxyKSBcIlxcclwiXG4gICAoaWRlbnRpY2FsPyBjIFxcbikgXCJcXG5cIlxuICAgKGlkZW50aWNhbD8gYyBcXFxcKSBcXFxcXG4gICAoaWRlbnRpY2FsPyBjIFwiXFxcIlwiKSBcIlxcXCJcIlxuICAgKGlkZW50aWNhbD8gYyBcXGIpIFwiXFxiXCJcbiAgIChpZGVudGljYWw/IGMgXFxmKSBcIlxcZlwiXG4gICA6ZWxzZSBuaWwpKVxuXG47OyB1bmljb2RlXG5cbihkZWZuIHJlYWQtMi1jaGFycyBbcmVhZGVyXVxuICAoc3RyIChyZWFkLWNoYXIgcmVhZGVyKVxuICAgICAgIChyZWFkLWNoYXIgcmVhZGVyKSkpXG5cbihkZWZuIHJlYWQtNC1jaGFycyBbcmVhZGVyXVxuICAoc3RyIChyZWFkLWNoYXIgcmVhZGVyKVxuICAgICAgIChyZWFkLWNoYXIgcmVhZGVyKVxuICAgICAgIChyZWFkLWNoYXIgcmVhZGVyKVxuICAgICAgIChyZWFkLWNoYXIgcmVhZGVyKSkpXG5cbihkZWYgdW5pY29kZS0yLXBhdHRlcm4gKHJlLXBhdHRlcm4gXCJbMC05QS1GYS1mXXsyfVwiKSlcbihkZWYgdW5pY29kZS00LXBhdHRlcm4gKHJlLXBhdHRlcm4gXCJbMC05QS1GYS1mXXs0fVwiKSlcblxuXG4oZGVmbiB2YWxpZGF0ZS11bmljb2RlLWVzY2FwZVxuICBcIlZhbGlkYXRlcyB1bmljb2RlIGVzY2FwZVwiXG4gIFt1bmljb2RlLXBhdHRlcm4gcmVhZGVyIGVzY2FwZS1jaGFyIHVuaWNvZGUtc3RyXVxuICAoaWYgKHJlLW1hdGNoZXMgdW5pY29kZS1wYXR0ZXJuIHVuaWNvZGUtc3RyKVxuICAgIHVuaWNvZGUtc3RyXG4gICAgKHJlYWRlci1lcnJvclxuICAgICByZWFkZXJcbiAgICAgKHN0ciBcIlVuZXhwZWN0ZWQgdW5pY29kZSBlc2NhcGUgXCIgXFxcXCBlc2NhcGUtY2hhciB1bmljb2RlLXN0cikpKSlcblxuXG4oZGVmbiBtYWtlLXVuaWNvZGUtY2hhclxuICBbY29kZS1zdHIgYmFzZV1cbiAgKGxldCBbYmFzZSAob3IgYmFzZSAxNilcbiAgICAgICAgY29kZSAocGFyc2VJbnQgY29kZS1zdHIgYmFzZSldXG4gICAgKGNoYXIgY29kZSkpKVxuXG4oZGVmbiBlc2NhcGUtY2hhclxuICBcImVzY2FwZSBjaGFyXCJcbiAgW2J1ZmZlciByZWFkZXJdXG4gIChsZXQgW2NoIChyZWFkLWNoYXIgcmVhZGVyKVxuICAgICAgICBtYXByZXN1bHQgKGVzY2FwZS1jaGFyLW1hcCBjaCldXG4gICAgKGlmIG1hcHJlc3VsdFxuICAgICAgbWFwcmVzdWx0XG4gICAgICAoY29uZFxuICAgICAgICAoaWRlbnRpY2FsPyBjaCBcXHgpIChtYWtlLXVuaWNvZGUtY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2YWxpZGF0ZS11bmljb2RlLWVzY2FwZSB1bmljb2RlLTItcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJlYWQtMi1jaGFycyByZWFkZXIpKSlcbiAgICAgICAgKGlkZW50aWNhbD8gY2ggXFx1KSAobWFrZS11bmljb2RlLWNoYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAodmFsaWRhdGUtdW5pY29kZS1lc2NhcGUgdW5pY29kZS00LXBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZWFkLTQtY2hhcnMgcmVhZGVyKSkpXG4gICAgICAgIChudW1lcmljPyBjaCkgKGNoYXIgY2gpXG4gICAgICAgIDplbHNlIChyZWFkZXItZXJyb3IgcmVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHN0ciBcIlVuZXhwZWN0ZWQgdW5pY29kZSBlc2NhcGUgXCIgXFxcXCBjaCApKSkpKSlcblxuKGRlZm4gcmVhZC1wYXN0XG4gIFwiUmVhZCB1bnRpbCBmaXJzdCBjaGFyYWN0ZXIgdGhhdCBkb2Vzbid0IG1hdGNoIHByZWQsIHJldHVybmluZ1xuICBjaGFyLlwiXG4gIFtwcmVkaWNhdGUgcmVhZGVyXVxuICAobG9vcCBbXyBuaWxdXG4gICAgKGlmIChwcmVkaWNhdGUgKHBlZWstY2hhciByZWFkZXIpKVxuICAgICAgKHJlY3VyIChyZWFkLWNoYXIgcmVhZGVyKSlcbiAgICAgIChwZWVrLWNoYXIgcmVhZGVyKSkpKVxuXG5cbjs7IFRPRE86IENvbXBsZXRlIGltcGxlbWVudGF0aW9uXG4oZGVmbiByZWFkLWRlbGltaXRlZC1saXN0XG4gIFwiUmVhZHMgb3V0IGRlbGltaXRlZCBsaXN0XCJcbiAgW2RlbGltIHJlYWRlciByZWN1cnNpdmU/XVxuICAobG9vcCBbZm9ybXMgW11dXG4gICAgKGxldCBbXyAocmVhZC1wYXN0IHdoaXRlc3BhY2U/IHJlYWRlcilcbiAgICAgICAgICBjaCAocmVhZC1jaGFyIHJlYWRlcildXG4gICAgICAoaWYgKG5vdCBjaCkgKHJlYWRlci1lcnJvciByZWFkZXIgOkVPRikpXG4gICAgICAoaWYgKGlkZW50aWNhbD8gZGVsaW0gY2gpXG4gICAgICAgIGZvcm1zXG4gICAgICAgIChsZXQgW2Zvcm0gKHJlYWQtZm9ybSByZWFkZXIgY2gpXVxuICAgICAgICAgIChyZWN1ciAoaWYgKGlkZW50aWNhbD8gZm9ybSByZWFkZXIpXG4gICAgICAgICAgICAgICAgICAgZm9ybXNcbiAgICAgICAgICAgICAgICAgICAoY29uaiBmb3JtcyBmb3JtKSkpKSkpKSlcblxuOzsgZGF0YSBzdHJ1Y3R1cmUgcmVhZGVyc1xuXG4oZGVmbiBub3QtaW1wbGVtZW50ZWRcbiAgW3JlYWRlciBjaF1cbiAgKHJlYWRlci1lcnJvciByZWFkZXIgKHN0ciBcIlJlYWRlciBmb3IgXCIgY2ggXCIgbm90IGltcGxlbWVudGVkIHlldFwiKSkpXG5cblxuKGRlZm4gcmVhZC1kaXNwYXRjaFxuICBbcmVhZGVyIF9dXG4gIChsZXQgW2NoIChyZWFkLWNoYXIgcmVhZGVyKVxuICAgICAgICBkbSAoZGlzcGF0Y2gtbWFjcm9zIGNoKV1cbiAgICAoaWYgZG1cbiAgICAgIChkbSByZWFkZXIgXylcbiAgICAgIChsZXQgW29iamVjdCAobWF5YmUtcmVhZC10YWdnZWQtdHlwZSByZWFkZXIgY2gpXVxuICAgICAgICAoaWYgb2JqZWN0XG4gICAgICAgICAgb2JqZWN0XG4gICAgICAgICAgKHJlYWRlci1lcnJvciByZWFkZXIgXCJObyBkaXNwYXRjaCBtYWNybyBmb3IgXCIgY2gpKSkpKSlcblxuKGRlZm4gcmVhZC11bm1hdGNoZWQtZGVsaW1pdGVyXG4gIFtyZHIgY2hdXG4gIChyZWFkZXItZXJyb3IgcmRyIFwiVW5tYWNoZWQgZGVsaW1pdGVyIFwiIGNoKSlcblxuKGRlZm4gcmVhZC1saXN0XG4gIFtyZWFkZXIgX11cbiAgKGxldCBbZm9ybSAocmVhZC1kZWxpbWl0ZWQtbGlzdCBcIilcIiByZWFkZXIgdHJ1ZSldXG4gICAgKHdpdGgtbWV0YSAoYXBwbHkgbGlzdCBmb3JtKSAobWV0YSBmb3JtKSkpKVxuXG4oZGVmbiByZWFkLWNvbW1lbnRcbiAgW3JlYWRlciBfXVxuICAobG9vcCBbYnVmZmVyIFwiXCJcbiAgICAgICAgIGNoIChyZWFkLWNoYXIgcmVhZGVyKV1cblxuICAgIChjb25kXG4gICAgIChvciAobmlsPyBjaClcbiAgICAgICAgIChpZGVudGljYWw/IFwiXFxuXCIgY2gpKSAob3IgcmVhZGVyIDs7IGlnbm9yZSBjb21tZW50cyBmb3Igbm93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0ICdjb21tZW50IGJ1ZmZlcikpXG4gICAgIChvciAoaWRlbnRpY2FsPyBcXFxcIGNoKSkgKHJlY3VyIChzdHIgYnVmZmVyIChlc2NhcGUtY2hhciBidWZmZXIgcmVhZGVyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZWFkLWNoYXIgcmVhZGVyKSlcbiAgICAgOmVsc2UgKHJlY3VyIChzdHIgYnVmZmVyIGNoKSAocmVhZC1jaGFyIHJlYWRlcikpKSkpXG5cbihkZWZuIHJlYWQtdmVjdG9yXG4gIFtyZWFkZXJdXG4gIChyZWFkLWRlbGltaXRlZC1saXN0IFwiXVwiIHJlYWRlciB0cnVlKSlcblxuKGRlZm4gcmVhZC1tYXBcbiAgW3JlYWRlcl1cbiAgKGxldCBbZm9ybSAocmVhZC1kZWxpbWl0ZWQtbGlzdCBcIn1cIiByZWFkZXIgdHJ1ZSldXG4gICAgKGlmIChvZGQ/IChjb3VudCBmb3JtKSlcbiAgICAgIChyZWFkZXItZXJyb3IgcmVhZGVyIFwiTWFwIGxpdGVyYWwgbXVzdCBjb250YWluIGFuIGV2ZW4gbnVtYmVyIG9mIGZvcm1zXCIpXG4gICAgICAod2l0aC1tZXRhIChhcHBseSBkaWN0aW9uYXJ5IGZvcm0pIChtZXRhIGZvcm0pKSkpKVxuXG4oZGVmbiByZWFkLXNldFxuICBbcmVhZGVyIF9dXG4gIChsZXQgW2Zvcm0gKHJlYWQtZGVsaW1pdGVkLWxpc3QgXCJ9XCIgcmVhZGVyIHRydWUpXVxuICAgICh3aXRoLW1ldGEgKGNvbmNhdCBbJ3NldF0gZm9ybSkgKG1ldGEgZm9ybSkpKSlcblxuKGRlZm4gcmVhZC1udW1iZXJcbiAgW3JlYWRlciBpbml0Y2hdXG4gIChsb29wIFtidWZmZXIgaW5pdGNoXG4gICAgICAgICBjaCAocGVlay1jaGFyIHJlYWRlcildXG5cbiAgICAoaWYgKG9yIChuaWw/IGNoKVxuICAgICAgICAgICAgKHdoaXRlc3BhY2U/IGNoKVxuICAgICAgICAgICAgKG1hY3JvcyBjaCkpXG4gICAgICAoZG9cbiAgICAgICAgKGRlZiBtYXRjaCAobWF0Y2gtbnVtYmVyIGJ1ZmZlcikpXG4gICAgICAgIChpZiAobmlsPyBtYXRjaClcbiAgICAgICAgICAgIChyZWFkZXItZXJyb3IgcmVhZGVyIFwiSW52YWxpZCBudW1iZXIgZm9ybWF0IFtcIiBidWZmZXIgXCJdXCIpXG4gICAgICAgICAgICAoTnVtYmVyLiBtYXRjaCkpKVxuICAgICAgKHJlY3VyIChzdHIgYnVmZmVyIChyZWFkLWNoYXIgcmVhZGVyKSlcbiAgICAgICAgICAgICAocGVlay1jaGFyIHJlYWRlcikpKSkpXG5cbihkZWZuIHJlYWQtc3RyaW5nXG4gIFtyZWFkZXJdXG4gIChsb29wIFtidWZmZXIgXCJcIlxuICAgICAgICAgY2ggKHJlYWQtY2hhciByZWFkZXIpXVxuXG4gICAgKGNvbmRcbiAgICAgKG5pbD8gY2gpIChyZWFkZXItZXJyb3IgcmVhZGVyIFwiRU9GIHdoaWxlIHJlYWRpbmcgc3RyaW5nXCIpXG4gICAgIChpZGVudGljYWw/IFxcXFwgY2gpIChyZWN1ciAoc3RyIGJ1ZmZlciAoZXNjYXBlLWNoYXIgYnVmZmVyIHJlYWRlcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJlYWQtY2hhciByZWFkZXIpKVxuICAgICAoaWRlbnRpY2FsPyBcIlxcXCJcIiBjaCkgKFN0cmluZy4gYnVmZmVyKVxuICAgICA6ZGVmYXVsdCAocmVjdXIgKHN0ciBidWZmZXIgY2gpIChyZWFkLWNoYXIgcmVhZGVyKSkpKSlcblxuKGRlZm4gcmVhZC1jaGFyYWN0ZXJcbiAgW3JlYWRlcl1cbiAgKFN0cmluZy4gKHJlYWQtY2hhciByZWFkZXIpKSlcblxuKGRlZm4gcmVhZC11bnF1b3RlXG4gIFwiUmVhZHMgdW5xdW90ZSBmb3JtIH5mb3JtIG9yIH4oZm9vIGJhcilcIlxuICBbcmVhZGVyXVxuICAobGV0IFtjaCAocGVlay1jaGFyIHJlYWRlcildXG4gICAgKGlmIChub3QgY2gpXG4gICAgICAocmVhZGVyLWVycm9yIHJlYWRlciBcIkVPRiB3aGlsZSByZWFkaW5nIGNoYXJhY3RlclwiKVxuICAgICAgKGlmIChpZGVudGljYWw/IGNoIFxcQClcbiAgICAgICAgKGRvIChyZWFkLWNoYXIgcmVhZGVyKVxuICAgICAgICAgICAgKGxpc3QgJ3VucXVvdGUtc3BsaWNpbmcgKHJlYWQgcmVhZGVyIHRydWUgbmlsIHRydWUpKSlcbiAgICAgICAgKGxpc3QgJ3VucXVvdGUgKHJlYWQgcmVhZGVyIHRydWUgbmlsIHRydWUpKSkpKSlcblxuXG4oZGVmbiBzcGVjaWFsLXN5bWJvbHMgW3RleHQgbm90LWZvdW5kXVxuICAoY29uZFxuICAgKGlkZW50aWNhbD8gdGV4dCBcIm5pbFwiKSBuaWxcbiAgIChpZGVudGljYWw/IHRleHQgXCJ0cnVlXCIpIHRydWVcbiAgIChpZGVudGljYWw/IHRleHQgXCJmYWxzZVwiKSBmYWxzZVxuICAgOmVsc2Ugbm90LWZvdW5kKSlcblxuXG4oZGVmbiByZWFkLXN5bWJvbFxuICBbcmVhZGVyIGluaXRjaF1cbiAgKGxldCBbdG9rZW4gKHJlYWQtdG9rZW4gcmVhZGVyIGluaXRjaClcbiAgICAgICAgcGFydHMgKHNwbGl0IHRva2VuIFwiL1wiKVxuICAgICAgICBoYXMtbnMgKGFuZCAoPiAoY291bnQgcGFydHMpIDEpXG4gICAgICAgICAgICAgICAgICAgIDs7IE1ha2Ugc3VyZSBpdCdzIG5vdCBqdXN0IGAvYFxuICAgICAgICAgICAgICAgICAgICAoPiAoY291bnQgdG9rZW4pIDEpKVxuICAgICAgICBucyAoZmlyc3QgcGFydHMpXG4gICAgICAgIG5hbWUgKGpvaW4gXCIvXCIgKHJlc3QgcGFydHMpKV1cbiAgICAoaWYgaGFzLW5zXG4gICAgICAoc3ltYm9sIG5zIG5hbWUpXG4gICAgICAoc3BlY2lhbC1zeW1ib2xzIHRva2VuIChzeW1ib2wgdG9rZW4pKSkpKVxuXG4oZGVmbiByZWFkLWtleXdvcmRcbiAgW3JlYWRlciBpbml0Y2hdXG4gIChsZXQgW3Rva2VuIChyZWFkLXRva2VuIHJlYWRlciAocmVhZC1jaGFyIHJlYWRlcikpXG4gICAgICAgIHBhcnRzIChzcGxpdCB0b2tlbiBcIi9cIilcbiAgICAgICAgbmFtZSAobGFzdCBwYXJ0cylcbiAgICAgICAgbnMgKGlmICg+IChjb3VudCBwYXJ0cykgMSkgKGpvaW4gXCIvXCIgKGJ1dGxhc3QgcGFydHMpKSlcbiAgICAgICAgaXNzdWUgKGNvbmRcbiAgICAgICAgICAgICAgIChpZGVudGljYWw/IChsYXN0IG5zKSBcXDopIFwibmFtZXNwYWNlIGNhbid0IGVuZHMgd2l0aCBcXFwiOlxcXCJcIlxuICAgICAgICAgICAgICAgKGlkZW50aWNhbD8gKGxhc3QgbmFtZSkgXFw6KSBcIm5hbWUgY2FuJ3QgZW5kIHdpdGggXFxcIjpcXFwiXCJcbiAgICAgICAgICAgICAgIChpZGVudGljYWw/IChsYXN0IG5hbWUpIFxcLykgXCJuYW1lIGNhbid0IGVuZCB3aXRoIFxcXCIvXFxcIlwiXG4gICAgICAgICAgICAgICAoPiAoY291bnQgKHNwbGl0IHRva2VuIFwiOjpcIikpIDEpIFwibmFtZSBjYW4ndCBjb250YWluIFxcXCI6OlxcXCJcIildXG4gICAgKGlmIGlzc3VlXG4gICAgICAocmVhZGVyLWVycm9yIHJlYWRlciBcIkludmFsaWQgdG9rZW4gKFwiIGlzc3VlIFwiKTogXCIgdG9rZW4pXG4gICAgICAoaWYgKGFuZCAobm90IG5zKSAoaWRlbnRpY2FsPyAoZmlyc3QgbmFtZSkgXFw6KSlcbiAgICAgICAgKGtleXdvcmQgOypucy1zeW0qXG4gICAgICAgICAgKHJlc3QgbmFtZSkpIDs7IG5hbWVzcGFjZWQga2V5d29yZCB1c2luZyBkZWZhdWx0XG4gICAgICAgIChrZXl3b3JkIG5zIG5hbWUpKSkpKVxuXG4oZGVmbiBkZXN1Z2FyLW1ldGFcbiAgW2Zvcm1dXG4gIDs7IGtleXdvcmQgc2hvdWxkIGdvIGJlZm9yZSBzdHJpbmcgc2luY2UgaXQgaXMgYSBzdHJpbmcuXG4gIChjb25kIChrZXl3b3JkPyBmb3JtKSAoZGljdGlvbmFyeSAobmFtZSBmb3JtKSB0cnVlKVxuICAgICAgICAoc3ltYm9sPyBmb3JtKSB7OnRhZyBmb3JtfVxuICAgICAgICAoc3RyaW5nPyBmb3JtKSB7OnRhZyBmb3JtfVxuICAgICAgICAoZGljdGlvbmFyeT8gZm9ybSkgKHJlZHVjZSAoZm4gW3Jlc3VsdCBwYWlyXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzZXQhIChnZXQgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobmFtZSAoZmlyc3QgcGFpcikpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzZWNvbmQgcGFpcikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtKVxuICAgICAgICA6ZWxzZSBmb3JtKSlcblxuKGRlZm4gd3JhcHBpbmctcmVhZGVyXG4gIFtwcmVmaXhdXG4gIChmbiBbcmVhZGVyXVxuICAgIChsaXN0IHByZWZpeCAocmVhZCByZWFkZXIgdHJ1ZSBuaWwgdHJ1ZSkpKSlcblxuKGRlZm4gdGhyb3dpbmctcmVhZGVyXG4gIFttc2ddXG4gIChmbiBbcmVhZGVyXVxuICAgIChyZWFkZXItZXJyb3IgcmVhZGVyIG1zZykpKVxuXG4oZGVmbiByZWFkLW1ldGFcbiAgW3JlYWRlciBfXVxuICAobGV0IFttZXRhZGF0YSAoZGVzdWdhci1tZXRhIChyZWFkIHJlYWRlciB0cnVlIG5pbCB0cnVlKSldXG4gICAgKGlmIChub3QgKGRpY3Rpb25hcnk/IG1ldGFkYXRhKSlcbiAgICAgIChyZWFkZXItZXJyb3IgcmVhZGVyIFwiTWV0YWRhdGEgbXVzdCBiZSBTeW1ib2wsIEtleXdvcmQsIFN0cmluZyBvciBNYXBcIikpXG4gICAgKGxldCBbZm9ybSAocmVhZCByZWFkZXIgdHJ1ZSBuaWwgdHJ1ZSldXG4gICAgICAoaWYgKG9iamVjdD8gZm9ybSlcbiAgICAgICAgKHdpdGgtbWV0YSBmb3JtIChjb25qIG1ldGFkYXRhIChtZXRhIGZvcm0pKSlcbiAgICAgICAgOyhyZWFkZXItZXJyb3JcbiAgICAgICAgOyByZWFkZXIgXCJNZXRhZGF0YSBjYW4gb25seSBiZSBhcHBsaWVkIHRvIElXaXRoTWV0YXNcIilcblxuICAgICAgICBmb3JtIDsgRm9yIG5vdyB3ZSBkb24ndCB0aHJvdyBlcnJvcnMgYXMgd2UgY2FuJ3QgYXBwbHkgbWV0YWRhdGEgdG9cbiAgICAgICAgICAgICA7IHN5bWJvbHMsIHNvIHdlIGp1c3QgaWdub3JlIGl0LlxuICAgICAgICApKSkpXG5cbihkZWZuIHJlYWQtcmVnZXhcbiAgW3JlYWRlcl1cbiAgKGxvb3AgW2J1ZmZlciBcIlwiXG4gICAgICAgICBjaCAocmVhZC1jaGFyIHJlYWRlcildXG5cbiAgICAoY29uZFxuICAgICAobmlsPyBjaCkgKHJlYWRlci1lcnJvciByZWFkZXIgXCJFT0Ygd2hpbGUgcmVhZGluZyBzdHJpbmdcIilcbiAgICAgKGlkZW50aWNhbD8gXFxcXCBjaCkgKHJlY3VyIChzdHIgYnVmZmVyIGNoIChyZWFkLWNoYXIgcmVhZGVyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmVhZC1jaGFyIHJlYWRlcikpXG4gICAgIChpZGVudGljYWw/IFwiXFxcIlwiIGNoKSAocmUtcGF0dGVybiBidWZmZXIpXG4gICAgIDpkZWZhdWx0IChyZWN1ciAoc3RyIGJ1ZmZlciBjaCkgKHJlYWQtY2hhciByZWFkZXIpKSkpKVxuXG4oZGVmbiByZWFkLXBhcmFtXG4gIFtyZWFkZXIgaW5pdGNoXVxuICAobGV0IFtmb3JtIChyZWFkLXN5bWJvbCByZWFkZXIgaW5pdGNoKV1cbiAgICAoaWYgKD0gZm9ybSAoc3ltYm9sIFwiJVwiKSkgKHN5bWJvbCBcIiUxXCIpIGZvcm0pKSlcblxuKGRlZm4gcGFyYW0/IFtmb3JtXVxuICAoYW5kIChzeW1ib2w/IGZvcm0pIChpZGVudGljYWw/IFxcJSAoZmlyc3QgKG5hbWUgZm9ybSkpKSkpXG5cbihkZWZuIGxhbWJkYS1wYXJhbXMtaGFzaCBbZm9ybV1cbiAgKGNvbmQgKHBhcmFtPyBmb3JtKSAoZGljdGlvbmFyeSBmb3JtIGZvcm0pXG4gICAgICAgIChvciAoZGljdGlvbmFyeT8gZm9ybSlcbiAgICAgICAgICAgICh2ZWN0b3I/IGZvcm0pXG4gICAgICAgICAgICAobGlzdD8gZm9ybSkpIChhcHBseSBjb25qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobWFwIGxhbWJkYS1wYXJhbXMtaGFzaCAodmVjIGZvcm0pKSlcbiAgICAgICAgOmVsc2Uge30pKVxuXG4oZGVmbiBsYW1iZGEtcGFyYW1zIFtib2R5XVxuICAobGV0IFtuYW1lcyAoc29ydCAodmFscyAobGFtYmRhLXBhcmFtcy1oYXNoIGJvZHkpKSlcbiAgICAgICAgdmFyaWFkaWMgKD0gKGZpcnN0IG5hbWVzKSAoc3ltYm9sIFwiJSZcIikpXG4gICAgICAgIG4gKGlmIChhbmQgdmFyaWFkaWMgKGlkZW50aWNhbD8gKGNvdW50IG5hbWVzKSAxKSlcbiAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAocGFyc2VJbnQgKHJlc3QgKG5hbWUgKGxhc3QgbmFtZXMpKSkpKVxuICAgICAgICBwYXJhbXMgKGxvb3AgW25hbWVzIFtdXG4gICAgICAgICAgICAgICAgICAgICAgaSAxXVxuICAgICAgICAgICAgICAgIChpZiAoPD0gaSBuKVxuICAgICAgICAgICAgICAgICAgKHJlY3VyIChjb25qIG5hbWVzIChzeW1ib2wgKHN0ciBcIiVcIiBpKSkpIChpbmMgaSkpXG4gICAgICAgICAgICAgICAgICBuYW1lcykpXVxuICAgIChpZiB2YXJpYWRpYyAoY29uaiBwYXJhbXMgJyYgJyUmKSBuYW1lcykpKVxuXG4oZGVmbiByZWFkLWxhbWJkYVxuICBbcmVhZGVyXVxuICAgKGxldCBbYm9keSAocmVhZC1saXN0IHJlYWRlcildXG4gICAgKGxpc3QgJ2ZuIChsYW1iZGEtcGFyYW1zIGJvZHkpIGJvZHkpKSlcblxuKGRlZm4gcmVhZC1kaXNjYXJkXG4gIFwiRGlzY2FyZHMgbmV4dCBmb3JtXCJcbiAgW3JlYWRlciBfXVxuICAocmVhZCByZWFkZXIgdHJ1ZSBuaWwgdHJ1ZSlcbiAgcmVhZGVyKVxuXG4oZGVmbiBtYWNyb3MgW2NdXG4gIChjb25kXG4gICAoaWRlbnRpY2FsPyBjIFwiXFxcIlwiKSByZWFkLXN0cmluZ1xuICAgKGlkZW50aWNhbD8gYyBcXFxcKSByZWFkLWNoYXJhY3RlclxuICAgKGlkZW50aWNhbD8gYyBcXDopIHJlYWQta2V5d29yZFxuICAgKGlkZW50aWNhbD8gYyBcIjtcIikgcmVhZC1jb21tZW50XG4gICAoaWRlbnRpY2FsPyBjIFxcJykgKHdyYXBwaW5nLXJlYWRlciAncXVvdGUpXG4gICAoaWRlbnRpY2FsPyBjIFxcQCkgKHdyYXBwaW5nLXJlYWRlciAnZGVyZWYpXG4gICAoaWRlbnRpY2FsPyBjIFxcXikgcmVhZC1tZXRhXG4gICAoaWRlbnRpY2FsPyBjIFxcYCkgKHdyYXBwaW5nLXJlYWRlciAnc3ludGF4LXF1b3RlKVxuICAgKGlkZW50aWNhbD8gYyBcXH4pIHJlYWQtdW5xdW90ZVxuICAgKGlkZW50aWNhbD8gYyBcXCgpIHJlYWQtbGlzdFxuICAgKGlkZW50aWNhbD8gYyBcXCkpIHJlYWQtdW5tYXRjaGVkLWRlbGltaXRlclxuICAgKGlkZW50aWNhbD8gYyBcXFspIHJlYWQtdmVjdG9yXG4gICAoaWRlbnRpY2FsPyBjIFxcXSkgcmVhZC11bm1hdGNoZWQtZGVsaW1pdGVyXG4gICAoaWRlbnRpY2FsPyBjIFxceykgcmVhZC1tYXBcbiAgIChpZGVudGljYWw/IGMgXFx9KSByZWFkLXVubWF0Y2hlZC1kZWxpbWl0ZXJcbiAgIChpZGVudGljYWw/IGMgXFwlKSByZWFkLXBhcmFtXG4gICAoaWRlbnRpY2FsPyBjIFxcIykgcmVhZC1kaXNwYXRjaFxuICAgOmVsc2UgbmlsKSlcblxuXG4oZGVmbiBkaXNwYXRjaC1tYWNyb3MgW3NdXG4gIChjb25kXG4gICAoaWRlbnRpY2FsPyBzIFxceykgcmVhZC1zZXRcbiAgIChpZGVudGljYWw/IHMgXFwoKSByZWFkLWxhbWJkYVxuICAgKGlkZW50aWNhbD8gcyBcXDwpICh0aHJvd2luZy1yZWFkZXIgXCJVbnJlYWRhYmxlIGZvcm1cIilcbiAgIChpZGVudGljYWw/IHMgXCJcXFwiXCIpIHJlYWQtcmVnZXhcbiAgIChpZGVudGljYWw/IHMgXFwhKSByZWFkLWNvbW1lbnRcbiAgIChpZGVudGljYWw/IHMgXFxfKSByZWFkLWRpc2NhcmRcbiAgIDplbHNlIG5pbCkpXG5cbihkZWZuIHJlYWQtZm9ybVxuICBbcmVhZGVyIGNoXVxuICAobGV0IFtzdGFydCB7OmxpbmUgKDpsaW5lIHJlYWRlcilcbiAgICAgICAgICAgICAgIDpjb2x1bW4gKDpjb2x1bW4gcmVhZGVyKX1cbiAgICAgICAgcmVhZC1tYWNybyAobWFjcm9zIGNoKVxuICAgICAgICBmb3JtIChjb25kIHJlYWQtbWFjcm8gKHJlYWQtbWFjcm8gcmVhZGVyIGNoKVxuICAgICAgICAgICAgICAgICAgIChudW1iZXItbGl0ZXJhbD8gcmVhZGVyIGNoKSAocmVhZC1udW1iZXIgcmVhZGVyIGNoKVxuICAgICAgICAgICAgICAgICAgIDplbHNlIChyZWFkLXN5bWJvbCByZWFkZXIgY2gpKVxuICAgICAgICBlbmQgezpsaW5lICg6bGluZSByZWFkZXIpXG4gICAgICAgICAgICAgOmNvbHVtbiAoaW5jICg6Y29sdW1uIHJlYWRlcikpfVxuICAgICAgICBsb2NhdGlvbiB7OnVyaSAoOnVyaSByZWFkZXIpXG4gICAgICAgICAgICAgICAgICA6c3RhcnQgc3RhcnRcbiAgICAgICAgICAgICAgICAgIDplbmQgZW5kfV1cbiAgICAoY29uZCAoaWRlbnRpY2FsPyBmb3JtIHJlYWRlcikgZm9ybVxuICAgICAgICAgIDs7IFRPRE8gY29uc2lkZXIgYm94aW5nIHByaW1pdGl2ZXMgaW50byBhc3NvY2l0YWRlXG4gICAgICAgICAgOzsgdHlwZXMgdG8gaW5jbHVkZSBtZXRhZGF0YSBvbiB0aG9zZS5cbiAgICAgICAgICAobm90IChvciAoYm9vbGVhbj8gZm9ybSlcbiAgICAgICAgICAgICAgICAgICAobmlsPyBmb3JtKVxuICAgICAgICAgICAgICAgICAgIChrZXl3b3JkPyBmb3JtKSkpICh3aXRoLW1ldGEgZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNvbmogbG9jYXRpb24gKG1ldGEgZm9ybSkpKVxuICAgICAgICAgIDplbHNlIGZvcm0pKSlcblxuKGRlZm4gcmVhZFxuICBcIlJlYWRzIHRoZSBmaXJzdCBvYmplY3QgZnJvbSBhIFB1c2hiYWNrUmVhZGVyLlxuICBSZXR1cm5zIHRoZSBvYmplY3QgcmVhZC4gSWYgRU9GLCB0aHJvd3MgaWYgZW9mLWlzLWVycm9yIGlzIHRydWUuXG4gIE90aGVyd2lzZSByZXR1cm5zIHNlbnRpbmVsLlwiXG4gIFtyZWFkZXIgZW9mLWlzLWVycm9yIHNlbnRpbmVsIGlzLXJlY3Vyc2l2ZV1cbiAgKGxvb3AgW11cbiAgICAobGV0IFtjaCAocmVhZC1jaGFyIHJlYWRlcilcbiAgICAgICAgICBmb3JtIChjb25kXG4gICAgICAgICAgICAgICAgKG5pbD8gY2gpIChpZiBlb2YtaXMtZXJyb3IgKHJlYWRlci1lcnJvciByZWFkZXIgOkVPRikgc2VudGluZWwpXG4gICAgICAgICAgICAgICAgKHdoaXRlc3BhY2U/IGNoKSByZWFkZXJcbiAgICAgICAgICAgICAgICAoY29tbWVudC1wcmVmaXg/IGNoKSAocmVhZCAocmVhZC1jb21tZW50IHJlYWRlciBjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlb2YtaXMtZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW50aW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzLXJlY3Vyc2l2ZSlcbiAgICAgICAgICAgICAgICA6ZWxzZSAocmVhZC1mb3JtIHJlYWRlciBjaCkpXVxuICAgICAgKGlmIChpZGVudGljYWw/IGZvcm0gcmVhZGVyKVxuICAgICAgICAocmVjdXIpXG4gICAgICAgIGZvcm0pKSkpXG5cbihkZWZuIHJlYWQqXG4gIFtzb3VyY2UgdXJpXVxuICAobGV0IFtyZWFkZXIgKHB1c2gtYmFjay1yZWFkZXIgc291cmNlIHVyaSlcbiAgICAgICAgZW9mIChnZW5zeW0pXVxuICAgIChsb29wIFtmb3JtcyBbXVxuICAgICAgICAgICBmb3JtIChyZWFkIHJlYWRlciBmYWxzZSBlb2YgZmFsc2UpXVxuICAgICAgKGlmIChpZGVudGljYWw/IGZvcm0gZW9mKVxuICAgICAgICBmb3Jtc1xuICAgICAgICAocmVjdXIgKGNvbmogZm9ybXMgZm9ybSlcbiAgICAgICAgICAgICAgIChyZWFkIHJlYWRlciBmYWxzZSBlb2YgZmFsc2UpKSkpKSlcblxuXG5cbihkZWZuIHJlYWQtZnJvbS1zdHJpbmdcbiAgXCJSZWFkcyBvbmUgb2JqZWN0IGZyb20gdGhlIHN0cmluZyBzXCJcbiAgW3NvdXJjZSB1cmldXG4gIChsZXQgW3JlYWRlciAocHVzaC1iYWNrLXJlYWRlciBzb3VyY2UgdXJpKV1cbiAgICAocmVhZCByZWFkZXIgdHJ1ZSBuaWwgZmFsc2UpKSlcblxuKGRlZm4gXjpwcml2YXRlIHJlYWQtdXVpZFxuICBbdXVpZF1cbiAgKGlmIChzdHJpbmc/IHV1aWQpXG4gICAgYChVVUlELiB+dXVpZClcbiAgICAocmVhZGVyLWVycm9yXG4gICAgIG5pbCBcIlVVSUQgbGl0ZXJhbCBleHBlY3RzIGEgc3RyaW5nIGFzIGl0cyByZXByZXNlbnRhdGlvbi5cIikpKVxuXG4oZGVmbiBeOnByaXZhdGUgcmVhZC1xdWV1ZVxuICBbaXRlbXNdXG4gIChpZiAodmVjdG9yPyBpdGVtcylcbiAgICBgKFBlcnNpc3RlbnRRdWV1ZS4gfml0ZW1zKVxuICAgIChyZWFkZXItZXJyb3JcbiAgICAgbmlsIFwiUXVldWUgbGl0ZXJhbCBleHBlY3RzIGEgdmVjdG9yIGZvciBpdHMgZWxlbWVudHMuXCIpKSlcblxuXG4oZGVmICoqdGFnLXRhYmxlKipcbiAgKGRpY3Rpb25hcnkgOnV1aWQgcmVhZC11dWlkXG4gICAgICAgICAgICAgIDpxdWV1ZSByZWFkLXF1ZXVlKSlcblxuKGRlZm4gbWF5YmUtcmVhZC10YWdnZWQtdHlwZVxuICBbcmVhZGVyIGluaXRjaF1cbiAgKGxldCBbdGFnIChyZWFkLXN5bWJvbCByZWFkZXIgaW5pdGNoKVxuICAgICAgICBwZm4gKGdldCAqKnRhZy10YWJsZSoqIChuYW1lIHRhZykpXVxuICAgIChpZiBwZm5cbiAgICAgIChwZm4gKHJlYWQgcmVhZGVyIHRydWUgbmlsIGZhbHNlKSlcbiAgICAgIChyZWFkZXItZXJyb3IgcmVhZGVyXG4gICAgICAgICAgICAgICAgICAgIChzdHIgXCJDb3VsZCBub3QgZmluZCB0YWcgcGFyc2VyIGZvciBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgIChuYW1lIHRhZylcbiAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpbiBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgIChzdHIgKGtleXMgKip0YWctdGFibGUqKikpKSkpKSlcbiJdfQ==

},{"./ast":9,"./runtime":33,"./sequence":34,"./string":35}],33:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.runtime',
            doc: 'Core primitives required for runtime'
        };
}
var identity = exports.identity = function identity(x) {
        return x;
    };
var isOdd = exports.isOdd = function isOdd(n) {
        return n % 2 === 1;
    };
var isEven = exports.isEven = function isEven(n) {
        return n % 2 === 0;
    };
var isDictionary = exports.isDictionary = function isDictionary(form) {
        return isObject(form) && isObject(Object.getPrototypeOf(form)) && isNil(Object.getPrototypeOf(Object.getPrototypeOf(form)));
    };
var dictionary = exports.dictionary = function dictionary() {
        var pairs = Array.prototype.slice.call(arguments, 0);
        return function loop() {
            var recur = loop;
            var keyValuesø1 = pairs;
            var resultø1 = {};
            do {
                recur = keyValuesø1.length ? (function () {
                    resultø1[keyValuesø1[0]] = keyValuesø1[1];
                    return loop[0] = keyValuesø1.slice(2), loop[1] = resultø1, loop;
                })() : resultø1;
            } while (keyValuesø1 = loop[0], resultø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var keys = exports.keys = function keys(dictionary) {
        return Object.keys(dictionary);
    };
var vals = exports.vals = function vals(dictionary) {
        return keys(dictionary).map(function (key) {
            return (dictionary || 0)[key];
        });
    };
var keyValues = exports.keyValues = function keyValues(dictionary) {
        return keys(dictionary).map(function (key) {
            return [
                key,
                (dictionary || 0)[key]
            ];
        });
    };
var merge = exports.merge = function merge() {
        return Object.create(Object.prototype, Array.prototype.slice.call(arguments).reduce(function (descriptor, dictionary) {
            isObject(dictionary) ? Object.keys(dictionary).forEach(function (key) {
                return (descriptor || 0)[key] = Object.getOwnPropertyDescriptor(dictionary, key);
            }) : void 0;
            return descriptor;
        }, Object.create(Object.prototype)));
    };
var isContainsVector = exports.isContainsVector = function isContainsVector(vector, element) {
        return vector.indexOf(element) >= 0;
    };
var mapDictionary = exports.mapDictionary = function mapDictionary(source, f) {
        return Object.keys(source).reduce(function (target, key) {
            (target || 0)[key] = f((source || 0)[key]);
            return target;
        }, {});
    };
var toString = exports.toString = Object.prototype.toString;
var isFn = exports.isFn = typeof(/./) === 'function' ? function (x) {
        return toString.call(x) === '[object Function]';
    } : function (x) {
        return typeof(x) === 'function';
    };
var isError = exports.isError = function isError(x) {
        return x instanceof Error || toString.call(x) === '[object Error]';
    };
var isString = exports.isString = function isString(x) {
        return typeof(x) === 'string' || toString.call(x) === '[object String]';
    };
var isNumber = exports.isNumber = function isNumber(x) {
        return typeof(x) === 'number' || toString.call(x) === '[object Number]';
    };
var isVector = exports.isVector = isFn(Array.isArray) ? Array.isArray : function (x) {
        return toString.call(x) === '[object Array]';
    };
var isDate = exports.isDate = function isDate(x) {
        return toString.call(x) === '[object Date]';
    };
var isBoolean = exports.isBoolean = function isBoolean(x) {
        return x === true || x === false || toString.call(x) === '[object Boolean]';
    };
var isRePattern = exports.isRePattern = function isRePattern(x) {
        return toString.call(x) === '[object RegExp]';
    };
var isObject = exports.isObject = function isObject(x) {
        return x && typeof(x) === 'object';
    };
var isNil = exports.isNil = function isNil(x) {
        return x === void 0 || x === null;
    };
var isTrue = exports.isTrue = function isTrue(x) {
        return x === true;
    };
var isFalse = exports.isFalse = function isFalse(x) {
        return x === true;
    };
var reFind = exports.reFind = function reFind(re, s) {
        return function () {
            var matchesø1 = re.exec(s);
            return !isNil(matchesø1) ? matchesø1.length === 1 ? (matchesø1 || 0)[0] : matchesø1 : void 0;
        }.call(this);
    };
var reMatches = exports.reMatches = function reMatches(pattern, source) {
        return function () {
            var matchesø1 = pattern.exec(source);
            return !isNil(matchesø1) && (matchesø1 || 0)[0] === source ? matchesø1.length === 1 ? (matchesø1 || 0)[0] : matchesø1 : void 0;
        }.call(this);
    };
var rePattern = exports.rePattern = function rePattern(s) {
        return function () {
            var matchø1 = reFind(/^(?:\(\?([idmsux]*)\))?(.*)/, s);
            return new RegExp((matchø1 || 0)[2], (matchø1 || 0)[1]);
        }.call(this);
    };
var inc = exports.inc = function inc(x) {
        return x + 1;
    };
var dec = exports.dec = function dec(x) {
        return x - 1;
    };
var str = exports.str = function str() {
        return String.prototype.concat.apply('', arguments);
    };
var char = exports.char = function char(code) {
        return String.fromCharCode(code);
    };
var int = exports.int = function int(x) {
        return isNumber(x) ? x >= 0 ? Math.floor(x) : Math.floor(x) : x.charCodeAt(0);
    };
var subs = exports.subs = function subs(string, start, end) {
        return string.substring(start, end);
    };
var isPatternEqual = function isPatternEqual(x, y) {
    return isRePattern(x) && isRePattern(y) && x.source === y.source && x.global === y.global && x.multiline === y.multiline && x.ignoreCase === y.ignoreCase;
};
var isDateEqual = function isDateEqual(x, y) {
    return isDate(x) && isDate(y) && Number(x) === Number(y);
};
var isDictionaryEqual = function isDictionaryEqual(x, y) {
    return isObject(x) && isObject(y) && function () {
        var xKeysø1 = keys(x);
        var yKeysø1 = keys(y);
        var xCountø1 = xKeysø1.length;
        var yCountø1 = yKeysø1.length;
        return xCountø1 === yCountø1 && function loop() {
            var recur = loop;
            var indexø1 = 0;
            var countø1 = xCountø1;
            var keysø1 = xKeysø1;
            do {
                recur = indexø1 < countø1 ? isEquivalent((x || 0)[(keysø1 || 0)[indexø1]], (y || 0)[(keysø1 || 0)[indexø1]]) ? (loop[0] = inc(indexø1), loop[1] = countø1, loop[2] = keysø1, loop) : false : true;
            } while (indexø1 = loop[0], countø1 = loop[1], keysø1 = loop[2], recur === loop);
            return recur;
        }.call(this);
    }.call(this);
};
var isVectorEqual = function isVectorEqual(x, y) {
    return isVector(x) && isVector(y) && x.length === y.length && function loop() {
        var recur = loop;
        var xsø1 = x;
        var ysø1 = y;
        var indexø1 = 0;
        var countø1 = x.length;
        do {
            recur = indexø1 < countø1 ? isEquivalent((xsø1 || 0)[indexø1], (ysø1 || 0)[indexø1]) ? (loop[0] = xsø1, loop[1] = ysø1, loop[2] = inc(indexø1), loop[3] = countø1, loop) : false : true;
        } while (xsø1 = loop[0], ysø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
        return recur;
    }.call(this);
};
var isEquivalent = function isEquivalent() {
    switch (arguments.length) {
    case 1:
        var x = arguments[0];
        return true;
    case 2:
        var x = arguments[0];
        var y = arguments[1];
        return x === y || (isNil(x) ? isNil(y) : isNil(y) ? isNil(x) : isString(x) ? isString(y) && x.toString() === y.toString() : isNumber(x) ? isNumber(y) && x.valueOf() === y.valueOf() : isFn(x) ? false : isBoolean(x) ? false : isDate(x) ? isDateEqual(x, y) : isVector(x) ? isVectorEqual(x, y, [], []) : isRePattern(x) ? isPatternEqual(x, y) : 'else' ? isDictionaryEqual(x, y) : void 0);
    default:
        var x = arguments[0];
        var y = arguments[1];
        var more = Array.prototype.slice.call(arguments, 2);
        return function loop() {
            var recur = loop;
            var previousø1 = x;
            var currentø1 = y;
            var indexø1 = 0;
            var countø1 = more.length;
            do {
                recur = isEquivalent(previousø1, currentø1) && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
            } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
            return recur;
        }.call(this);
    }
};
var isEqual = exports.isEqual = isEquivalent;
var isStrictEqual = exports.isStrictEqual = function isStrictEqual() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x === y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 == currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var greaterThan = exports.greaterThan = function greaterThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x > y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 > currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var notLessThan = exports.notLessThan = function notLessThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x >= y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 >= currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var lessThan = exports.lessThan = function lessThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x < y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 < currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var notGreaterThan = exports.notGreaterThan = function notGreaterThan() {
        switch (arguments.length) {
        case 1:
            var x = arguments[0];
            return true;
        case 2:
            var x = arguments[0];
            var y = arguments[1];
            return x <= y;
        default:
            var x = arguments[0];
            var y = arguments[1];
            var more = Array.prototype.slice.call(arguments, 2);
            return function loop() {
                var recur = loop;
                var previousø1 = x;
                var currentø1 = y;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = previousø1 <= currentø1 && (indexø1 < countø1 ? (loop[0] = currentø1, loop[1] = (more || 0)[indexø1], loop[2] = inc(indexø1), loop[3] = countø1, loop) : true);
                } while (previousø1 = loop[0], currentø1 = loop[1], indexø1 = loop[2], countø1 = loop[3], recur === loop);
                return recur;
            }.call(this);
        }
    };
var sum = exports.sum = function sum() {
        switch (arguments.length) {
        case 0:
            return 0;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a + b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a + b + c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a + b + c + d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a + b + c + d + e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a + b + c + d + e + f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a + b + c + d + e + f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 + (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var subtract = exports.subtract = function subtract() {
        switch (arguments.length) {
        case 0:
            return (function () {
                throw TypeError('Wrong number of args passed to: -');
            })();
        case 1:
            var a = arguments[0];
            return 0 - a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a - b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a - b - c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a - b - c - d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a - b - c - d - e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a - b - c - d - e - f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a - b - c - d - e - f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 - (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var divide = exports.divide = function divide() {
        switch (arguments.length) {
        case 0:
            return (function () {
                throw TypeError('Wrong number of args passed to: /');
            })();
        case 1:
            var a = arguments[0];
            return 1 / a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a / b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a / b / c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a / b / c / d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a / b / c / d / e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a / b / c / d / e / f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a / b / c / d / e / f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 / (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var multiply = exports.multiply = function multiply() {
        switch (arguments.length) {
        case 0:
            return 1;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a * b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a * b * c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a * b * c * d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a * b * c * d * e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a * b * c * d * e * f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a * b * c * d * e * f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 * (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var and = exports.and = function and() {
        switch (arguments.length) {
        case 0:
            return true;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a && b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a && b && c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a && b && c && d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a && b && c && d && e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a && b && c && d && e && f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a && b && c && d && e && f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 && (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var or = exports.or = function or() {
        switch (arguments.length) {
        case 0:
            return void 0;
        case 1:
            var a = arguments[0];
            return a;
        case 2:
            var a = arguments[0];
            var b = arguments[1];
            return a || b;
        case 3:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            return a || b || c;
        case 4:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            return a || b || c || d;
        case 5:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            return a || b || c || d || e;
        case 6:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            return a || b || c || d || e || f;
        default:
            var a = arguments[0];
            var b = arguments[1];
            var c = arguments[2];
            var d = arguments[3];
            var e = arguments[4];
            var f = arguments[5];
            var more = Array.prototype.slice.call(arguments, 6);
            return function loop() {
                var recur = loop;
                var valueø1 = a || b || c || d || e || f;
                var indexø1 = 0;
                var countø1 = more.length;
                do {
                    recur = indexø1 < countø1 ? (loop[0] = valueø1 || (more || 0)[indexø1], loop[1] = inc(indexø1), loop[2] = countø1, loop) : valueø1;
                } while (valueø1 = loop[0], indexø1 = loop[1], countø1 = loop[2], recur === loop);
                return recur;
            }.call(this);
        }
    };
var print = exports.print = function print() {
        var more = Array.prototype.slice.call(arguments, 0);
        return console.log.apply(void 0, more);
    };
var max = exports.max = Math.max;
var min = exports.min = Math.min;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3AvcnVudGltZS53aXNwIl0sIm5hbWVzIjpbImlkZW50aXR5IiwieCIsImlzT2RkIiwibiIsImlzRXZlbiIsImlzRGljdGlvbmFyeSIsImZvcm0iLCJpc09iamVjdCIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwiaXNOaWwiLCJkaWN0aW9uYXJ5IiwicGFpcnMiLCJrZXlWYWx1ZXPDuDEiLCJyZXN1bHTDuDEiLCJsZW5ndGgiLCJzbGljZSIsImtleXMiLCJ2YWxzIiwibWFwIiwia2V5Iiwia2V5VmFsdWVzIiwibWVyZ2UiLCJjcmVhdGUiLCJwcm90b3R5cGUiLCJBcnJheSIsInByb3RvdHlwZS5zbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJyZWR1Y2UiLCJkZXNjcmlwdG9yIiwiZm9yRWFjaCIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImlzQ29udGFpbnNWZWN0b3IiLCJ2ZWN0b3IiLCJlbGVtZW50IiwiaW5kZXhPZiIsIm1hcERpY3Rpb25hcnkiLCJzb3VyY2UiLCJmIiwidGFyZ2V0IiwidG9TdHJpbmciLCJwcm90b3R5cGUudG9TdHJpbmciLCJpc0ZuIiwidHlwZW9mIiwiaXNFcnJvciIsIkVycm9yIiwiaXNTdHJpbmciLCJpc051bWJlciIsImlzVmVjdG9yIiwiaXNBcnJheSIsImlzRGF0ZSIsImlzQm9vbGVhbiIsImlzUmVQYXR0ZXJuIiwibnVsbCIsImlzVHJ1ZSIsImlzRmFsc2UiLCJyZUZpbmQiLCJyZSIsInMiLCJtYXRjaGVzw7gxIiwiZXhlYyIsInJlTWF0Y2hlcyIsInBhdHRlcm4iLCJyZVBhdHRlcm4iLCJtYXRjaMO4MSIsIlJlZ0V4cCIsImluYyIsImRlYyIsInN0ciIsIlN0cmluZyIsInByb3RvdHlwZS5jb25jYXQiLCJhcHBseSIsImNoYXIiLCJjb2RlIiwiZnJvbUNoYXJDb2RlIiwiaW50IiwiTWF0aCIsImZsb29yIiwiY2hhckNvZGVBdCIsInN1YnMiLCJzdHJpbmciLCJzdGFydCIsImVuZCIsInN1YnN0cmluZyIsImlzUGF0dGVybkVxdWFsIiwieSIsImdsb2JhbCIsIm11bHRpbGluZSIsImlnbm9yZUNhc2UiLCJpc0RhdGVFcXVhbCIsIk51bWJlciIsImlzRGljdGlvbmFyeUVxdWFsIiwieEtleXPDuDEiLCJ5S2V5c8O4MSIsInhDb3VudMO4MSIsInlDb3VudMO4MSIsImluZGV4w7gxIiwiY291bnTDuDEiLCJrZXlzw7gxIiwiaXNFcXVpdmFsZW50IiwiaXNWZWN0b3JFcXVhbCIsInhzw7gxIiwieXPDuDEiLCJ2YWx1ZU9mIiwibW9yZSIsInByZXZpb3Vzw7gxIiwiY3VycmVudMO4MSIsImlzRXF1YWwiLCJpc1N0cmljdEVxdWFsIiwiZ3JlYXRlclRoYW4iLCJub3RMZXNzVGhhbiIsImxlc3NUaGFuIiwibm90R3JlYXRlclRoYW4iLCJzdW0iLCJhIiwiYiIsImMiLCJkIiwiZSIsInZhbHVlw7gxIiwic3VidHJhY3QiLCJUeXBlRXJyb3IiLCJkaXZpZGUiLCJtdWx0aXBseSIsImFuZCIsIm9yIiwicHJpbnQiLCJjb25zb2xlIiwibG9nIiwibWF4IiwibWluIl0sIm1hcHBpbmdzIjoiQUFBQTtJOzs7VUFBQTtDO0FBR0EsSUFBTUEsUUFBQSxHLFFBQUFBLFEsR0FBTixTQUFNQSxRQUFOLENBRUdDLENBRkgsRTtRQUVNLE9BQUFBLENBQUEsQztLQUZOLEM7QUFJQSxJQUFlQyxLQUFBLEcsUUFBQUEsSyxHQUFmLFNBQWVBLEtBQWYsQ0FBcUJDLENBQXJCLEU7UUFDRSxPQUFpQkEsQ0FBTCxHLENBQVosSyxDQUFBLEM7S0FERixDO0FBR0EsSUFBZUMsTUFBQSxHLFFBQUFBLE0sR0FBZixTQUFlQSxNQUFmLENBQXNCRCxDQUF0QixFO1FBQ0UsT0FBaUJBLENBQUwsRyxDQUFaLEssQ0FBQSxDO0tBREYsQztBQUdBLElBQWVFLFlBQUEsRyxRQUFBQSxZLEdBQWYsU0FBZUEsWUFBZixDQUVHQyxJQUZILEU7UUFHRSxPQUFNQyxRQUFELENBQVNELElBQVQsQyxJQUVDQyxRQUFELENBQTRCQyxNQUFsQixDQUFDQyxjQUFGLENB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QUEsRyxHQUFJdEQsSUFBQSxDQUFLc0QsR0FBZCIsInNvdXJjZXNDb250ZW50IjpbIihucyB3aXNwLnJ1bnRpbWVcbiAgXCJDb3JlIHByaW1pdGl2ZXMgcmVxdWlyZWQgZm9yIHJ1bnRpbWVcIilcblxuKGRlZm4gaWRlbnRpdHlcbiAgXCJSZXR1cm5zIGl0cyBhcmd1bWVudC5cIlxuICBbeF0geClcblxuKGRlZm4gXmJvb2xlYW4gb2RkPyBbbl1cbiAgKGlkZW50aWNhbD8gKG1vZCBuIDIpIDEpKVxuXG4oZGVmbiBeYm9vbGVhbiBldmVuPyBbbl1cbiAgKGlkZW50aWNhbD8gKG1vZCBuIDIpIDApKVxuXG4oZGVmbiBeYm9vbGVhbiBkaWN0aW9uYXJ5P1xuICBcIlJldHVybnMgdHJ1ZSBpZiBkaWN0aW9uYXJ5XCJcbiAgW2Zvcm1dXG4gIChhbmQgKG9iamVjdD8gZm9ybSlcbiAgICAgICA7OyBJbmhlcml0cyByaWdodCBmb3JtIE9iamVjdC5wcm90b3R5cGVcbiAgICAgICAob2JqZWN0PyAoLmdldC1wcm90b3R5cGUtb2YgT2JqZWN0IGZvcm0pKVxuICAgICAgIChuaWw/ICguZ2V0LXByb3RvdHlwZS1vZiBPYmplY3QgKC5nZXQtcHJvdG90eXBlLW9mIE9iamVjdCBmb3JtKSkpKSlcblxuKGRlZm4gZGljdGlvbmFyeVxuICBcIkNyZWF0ZXMgZGljdGlvbmFyeSBvZiBnaXZlbiBhcmd1bWVudHMuIE9kZCBpbmRleGVkIGFyZ3VtZW50c1xuICBhcmUgdXNlZCBmb3Iga2V5cyBhbmQgZXZlbnMgZm9yIHZhbHVlc1wiXG4gIFsmIHBhaXJzXVxuICA7IFRPRE86IFdlIHNob3VsZCBjb252ZXJ0IGtleXdvcmRzIHRvIG5hbWVzIHRvIG1ha2Ugc3VyZSB0aGF0IGtleXMgYXJlIG5vdFxuICA7IHVzZWQgaW4gdGhlaXIga2V5d29yZCBmb3JtLlxuICAobG9vcCBba2V5LXZhbHVlcyBwYWlyc1xuICAgICAgICAgcmVzdWx0IHt9XVxuICAgIChpZiAoLi1sZW5ndGgga2V5LXZhbHVlcylcbiAgICAgIChkb1xuICAgICAgICAoc2V0ISAoYWdldCByZXN1bHQgKGFnZXQga2V5LXZhbHVlcyAwKSlcbiAgICAgICAgICAgICAgKGFnZXQga2V5LXZhbHVlcyAxKSlcbiAgICAgICAgKHJlY3VyICguc2xpY2Uga2V5LXZhbHVlcyAyKSByZXN1bHQpKVxuICAgICAgcmVzdWx0KSkpXG5cbihkZWZuIGtleXNcbiAgXCJSZXR1cm5zIGEgc2VxdWVuY2Ugb2YgdGhlIG1hcCdzIGtleXNcIlxuICBbZGljdGlvbmFyeV1cbiAgKC5rZXlzIE9iamVjdCBkaWN0aW9uYXJ5KSlcblxuKGRlZm4gdmFsc1xuICBcIlJldHVybnMgYSBzZXF1ZW5jZSBvZiB0aGUgbWFwJ3MgdmFsdWVzLlwiXG4gIFtkaWN0aW9uYXJ5XVxuICAoLm1hcCAoa2V5cyBkaWN0aW9uYXJ5KVxuICAgICAgICAoZm4gW2tleV0gKGdldCBkaWN0aW9uYXJ5IGtleSkpKSlcblxuKGRlZm4ga2V5LXZhbHVlc1xuICBbZGljdGlvbmFyeV1cbiAgKC5tYXAgKGtleXMgZGljdGlvbmFyeSlcbiAgICAgICAgKGZuIFtrZXldIFtrZXkgKGdldCBkaWN0aW9uYXJ5IGtleSldKSkpXG5cbihkZWZuIG1lcmdlXG4gIFwiUmV0dXJucyBhIGRpY3Rpb25hcnkgdGhhdCBjb25zaXN0cyBvZiB0aGUgcmVzdCBvZiB0aGUgbWFwcyBjb25qLWVkIG9udG9cbiAgdGhlIGZpcnN0LiBJZiBhIGtleSBvY2N1cnMgaW4gbW9yZSB0aGFuIG9uZSBtYXAsIHRoZSBtYXBwaW5nIGZyb21cbiAgdGhlIGxhdHRlciAobGVmdC10by1yaWdodCkgd2lsbCBiZSB0aGUgbWFwcGluZyBpbiB0aGUgcmVzdWx0LlwiXG4gIFtdXG4gIChPYmplY3QuY3JlYXRlXG4gICBPYmplY3QucHJvdG90eXBlXG4gICAoLnJlZHVjZVxuICAgICguY2FsbCBBcnJheS5wcm90b3R5cGUuc2xpY2UgYXJndW1lbnRzKVxuICAgIChmbiBbZGVzY3JpcHRvciBkaWN0aW9uYXJ5XVxuICAgICAgKGlmIChvYmplY3Q/IGRpY3Rpb25hcnkpXG4gICAgICAgICguZm9yLWVhY2hcbiAgICAgICAgIChPYmplY3Qua2V5cyBkaWN0aW9uYXJ5KVxuICAgICAgICAgKGZuIFtrZXldXG4gICAgICAgICAgIChzZXQhXG4gICAgICAgICAgICAoZ2V0IGRlc2NyaXB0b3Iga2V5KVxuICAgICAgICAgICAgKE9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IgZGljdGlvbmFyeSBrZXkpKSkpKVxuICAgICAgZGVzY3JpcHRvcilcbiAgICAoT2JqZWN0LmNyZWF0ZSBPYmplY3QucHJvdG90eXBlKSkpKVxuXG5cbihkZWZuIF5ib29sZWFuIGNvbnRhaW5zLXZlY3Rvcj9cbiAgXCJSZXR1cm5zIHRydWUgaWYgdmVjdG9yIGNvbnRhaW5zIGdpdmVuIGVsZW1lbnRcIlxuICBbdmVjdG9yIGVsZW1lbnRdXG4gICg+PSAoLmluZGV4LW9mIHZlY3RvciBlbGVtZW50KSAwKSlcblxuXG4oZGVmbiBtYXAtZGljdGlvbmFyeVxuICBcIk1hcHMgZGljdGlvbmFyeSB2YWx1ZXMgYnkgYXBwbHlpbmcgYGZgIHRvIGVhY2ggb25lXCJcbiAgW3NvdXJjZSBmXVxuICAoLnJlZHVjZSAoLmtleXMgT2JqZWN0IHNvdXJjZSlcbiAgICAgICAgICAgKGZuIFt0YXJnZXQga2V5XVxuICAgICAgICAgICAgICAoc2V0ISAoZ2V0IHRhcmdldCBrZXkpIChmIChnZXQgc291cmNlIGtleSkpKVxuICAgICAgICAgICAgICB0YXJnZXQpIHt9KSlcblxuKGRlZiB0by1zdHJpbmcgT2JqZWN0LnByb3RvdHlwZS50by1zdHJpbmcpXG5cbihkZWZcbiAgXns6dGFnIGJvb2xlYW5cbiAgICA6ZG9jIFwiUmV0dXJucyB0cnVlIGlmIHggaXMgYSBmdW5jdGlvblwifVxuICBmbj9cbiAgKGlmIChpZGVudGljYWw/ICh0eXBlb2YgI1wiLlwiKSBcImZ1bmN0aW9uXCIpXG4gICAgKGZuXG4gICAgICBbeF1cbiAgICAgIChpZGVudGljYWw/ICguY2FsbCB0by1zdHJpbmcgeCkgXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKSlcbiAgICAoZm5cbiAgICAgIFt4XVxuICAgICAgKGlkZW50aWNhbD8gKHR5cGVvZiB4KSBcImZ1bmN0aW9uXCIpKSkpXG5cbihkZWZuIF5ib29sZWFuIGVycm9yP1xuICBcIlJldHVybnMgdHJ1ZSBpZiB4IGlzIG9mIGVycm9yIHR5cGVcIlxuICBbeF1cbiAgKG9yIChpbnN0YW5jZT8gRXJyb3IgeClcbiAgICAgIChpZGVudGljYWw/ICguY2FsbCB0by1zdHJpbmcgeCkgXCJbb2JqZWN0IEVycm9yXVwiKSkpXG5cbihkZWZuIF5ib29sZWFuIHN0cmluZz9cbiAgXCJSZXR1cm4gdHJ1ZSBpZiB4IGlzIGEgc3RyaW5nXCJcbiAgW3hdXG4gIChvciAoaWRlbnRpY2FsPyAodHlwZW9mIHgpIFwic3RyaW5nXCIpXG4gICAgICAoaWRlbnRpY2FsPyAoLmNhbGwgdG8tc3RyaW5nIHgpIFwiW29iamVjdCBTdHJpbmddXCIpKSlcblxuKGRlZm4gXmJvb2xlYW4gbnVtYmVyP1xuICBcIlJldHVybiB0cnVlIGlmIHggaXMgYSBudW1iZXJcIlxuICBbeF1cbiAgKG9yIChpZGVudGljYWw/ICh0eXBlb2YgeCkgXCJudW1iZXJcIilcbiAgICAgIChpZGVudGljYWw/ICguY2FsbCB0by1zdHJpbmcgeCkgXCJbb2JqZWN0IE51bWJlcl1cIikpKVxuXG4oZGVmXG4gIF57OnRhZyBib29sZWFuXG4gICAgOmRvYyBcIlJldHVybnMgdHJ1ZSBpZiB4IGlzIGEgdmVjdG9yXCJ9XG4gIHZlY3Rvcj9cbiAgKGlmIChmbj8gQXJyYXkuaXNBcnJheSlcbiAgICBBcnJheS5pc0FycmF5XG4gICAgKGZuIFt4XSAoaWRlbnRpY2FsPyAoLmNhbGwgdG8tc3RyaW5nIHgpIFwiW29iamVjdCBBcnJheV1cIikpKSlcblxuKGRlZm4gXmJvb2xlYW4gZGF0ZT9cbiAgXCJSZXR1cm5zIHRydWUgaWYgeCBpcyBhIGRhdGVcIlxuICBbeF1cbiAgKGlkZW50aWNhbD8gKC5jYWxsIHRvLXN0cmluZyB4KSBcIltvYmplY3QgRGF0ZV1cIikpXG5cbihkZWZuIF5ib29sZWFuIGJvb2xlYW4/XG4gIFwiUmV0dXJucyB0cnVlIGlmIHggaXMgYSBib29sZWFuXCJcbiAgW3hdXG4gIChvciAoaWRlbnRpY2FsPyB4IHRydWUpXG4gICAgICAoaWRlbnRpY2FsPyB4IGZhbHNlKVxuICAgICAgKGlkZW50aWNhbD8gKC5jYWxsIHRvLXN0cmluZyB4KSBcIltvYmplY3QgQm9vbGVhbl1cIikpKVxuXG4oZGVmbiBeYm9vbGVhbiByZS1wYXR0ZXJuP1xuICBcIlJldHVybnMgdHJ1ZSBpZiB4IGlzIGEgcmVndWxhciBleHByZXNzaW9uXCJcbiAgW3hdXG4gIChpZGVudGljYWw/ICguY2FsbCB0by1zdHJpbmcgeCkgXCJbb2JqZWN0IFJlZ0V4cF1cIikpXG5cblxuKGRlZm4gXmJvb2xlYW4gb2JqZWN0P1xuICBcIlJldHVybnMgdHJ1ZSBpZiB4IGlzIGFuIG9iamVjdFwiXG4gIFt4XVxuICAoYW5kIHggKGlkZW50aWNhbD8gKHR5cGVvZiB4KSBcIm9iamVjdFwiKSkpXG5cbihkZWZuIF5ib29sZWFuIG5pbD9cbiAgXCJSZXR1cm5zIHRydWUgaWYgeCBpcyB1bmRlZmluZWQgb3IgbnVsbFwiXG4gIFt4XVxuICAob3IgKGlkZW50aWNhbD8geCBuaWwpXG4gICAgICAoaWRlbnRpY2FsPyB4IG51bGwpKSlcblxuKGRlZm4gXmJvb2xlYW4gdHJ1ZT9cbiAgXCJSZXR1cm5zIHRydWUgaWYgeCBpcyB0cnVlXCJcbiAgW3hdXG4gIChpZGVudGljYWw/IHggdHJ1ZSkpXG5cbihkZWZuIF5ib29sZWFuIGZhbHNlP1xuICBcIlJldHVybnMgdHJ1ZSBpZiB4IGlzIHRydWVcIlxuICBbeF1cbiAgKGlkZW50aWNhbD8geCB0cnVlKSlcblxuKGRlZm4gcmUtZmluZFxuICBcIlJldHVybnMgdGhlIGZpcnN0IHJlZ2V4IG1hdGNoLCBpZiBhbnksIG9mIHMgdG8gcmUsIHVzaW5nXG4gIHJlLmV4ZWMocykuIFJldHVybnMgYSB2ZWN0b3IsIGNvbnRhaW5pbmcgZmlyc3QgdGhlIG1hdGNoaW5nXG4gIHN1YnN0cmluZywgdGhlbiBhbnkgY2FwdHVyaW5nIGdyb3VwcyBpZiB0aGUgcmVndWxhciBleHByZXNzaW9uIGNvbnRhaW5zXG4gIGNhcHR1cmluZyBncm91cHMuXCJcbiAgW3JlIHNdXG4gIChsZXQgW21hdGNoZXMgKC5leGVjIHJlIHMpXVxuICAgIChpZiAobm90IChuaWw/IG1hdGNoZXMpKVxuICAgICAgKGlmIChpZGVudGljYWw/ICguLWxlbmd0aCBtYXRjaGVzKSAxKVxuICAgICAgICAoZ2V0IG1hdGNoZXMgMClcbiAgICAgICAgbWF0Y2hlcykpKSlcblxuKGRlZm4gcmUtbWF0Y2hlc1xuICBbcGF0dGVybiBzb3VyY2VdXG4gIChsZXQgW21hdGNoZXMgKC5leGVjIHBhdHRlcm4gc291cmNlKV1cbiAgICAoaWYgKGFuZCAobm90IChuaWw/IG1hdGNoZXMpKVxuICAgICAgICAgICAgIChpZGVudGljYWw/IChnZXQgbWF0Y2hlcyAwKSBzb3VyY2UpKVxuICAgICAgKGlmIChpZGVudGljYWw/ICguLWxlbmd0aCBtYXRjaGVzKSAxKVxuICAgICAgICAoZ2V0IG1hdGNoZXMgMClcbiAgICAgICAgbWF0Y2hlcykpKSlcblxuKGRlZm4gcmUtcGF0dGVyblxuICBcIlJldHVybnMgYW4gaW5zdGFuY2Ugb2YgUmVnRXhwIHdoaWNoIGhhcyBjb21waWxlZCB0aGUgcHJvdmlkZWQgc3RyaW5nLlwiXG4gIFtzXVxuICAobGV0IFttYXRjaCAocmUtZmluZCAjXCJeKD86XFwoXFw/KFtpZG1zdXhdKilcXCkpPyguKilcIiBzKV1cbiAgICAobmV3IFJlZ0V4cCAoZ2V0IG1hdGNoIDIpIChnZXQgbWF0Y2ggMSkpKSlcblxuKGRlZm4gaW5jXG4gIFt4XVxuICAoKyB4IDEpKVxuXG4oZGVmbiBkZWNcbiAgW3hdXG4gICgtIHggMSkpXG5cbihkZWZuIHN0clxuICBcIldpdGggbm8gYXJncywgcmV0dXJucyB0aGUgZW1wdHkgc3RyaW5nLiBXaXRoIG9uZSBhcmcgeCwgcmV0dXJuc1xuICB4LnRvU3RyaW5nKCkuICAoc3RyIG5pbCkgcmV0dXJucyB0aGUgZW1wdHkgc3RyaW5nLiBXaXRoIG1vcmUgdGhhblxuICBvbmUgYXJnLCByZXR1cm5zIHRoZSBjb25jYXRlbmF0aW9uIG9mIHRoZSBzdHIgdmFsdWVzIG9mIHRoZSBhcmdzLlwiXG4gIFtdXG4gICguYXBwbHkgU3RyaW5nLnByb3RvdHlwZS5jb25jYXQgXCJcIiBhcmd1bWVudHMpKVxuXG4oZGVmbiBjaGFyXG4gIFwiQ29lcmNlIHRvIGNoYXJcIlxuICBbY29kZV1cbiAgKC5mcm9tQ2hhckNvZGUgU3RyaW5nIGNvZGUpKVxuXG5cbihkZWZuIGludFxuICBcIkNvZXJjZSB0byBpbnQgYnkgc3RyaXBwaW5nIGRlY2ltYWwgcGxhY2VzLlwiXG4gIFt4XVxuICAoaWYgKG51bWJlcj8geClcbiAgICAoaWYgKD49IHggMClcbiAgICAgICguZmxvb3IgTWF0aCB4KVxuICAgICAgKC5mbG9vciBNYXRoIHgpKVxuICAgICguY2hhckNvZGVBdCB4IDApKSlcblxuKGRlZm4gc3Vic1xuICBcIlJldHVybnMgdGhlIHN1YnN0cmluZyBvZiBzIGJlZ2lubmluZyBhdCBzdGFydCBpbmNsdXNpdmUsIGFuZCBlbmRpbmdcbiAgYXQgZW5kIChkZWZhdWx0cyB0byBsZW5ndGggb2Ygc3RyaW5nKSwgZXhjbHVzaXZlLlwiXG4gIHs6YWRkZWQgXCIxLjBcIlxuICAgOnN0YXRpYyB0cnVlfVxuICAgW3N0cmluZyBzdGFydCBlbmRdXG4gICAoLnN1YnN0cmluZyBzdHJpbmcgc3RhcnQgZW5kKSlcblxuKGRlZm4tIF5ib29sZWFuIHBhdHRlcm4tZXF1YWw/XG4gIFt4IHldXG4gIChhbmQgKHJlLXBhdHRlcm4/IHgpXG4gICAgICAgKHJlLXBhdHRlcm4/IHkpXG4gICAgICAgKGlkZW50aWNhbD8gKC4tc291cmNlIHgpICguLXNvdXJjZSB5KSlcbiAgICAgICAoaWRlbnRpY2FsPyAoLi1nbG9iYWwgeCkgKC4tZ2xvYmFsIHkpKVxuICAgICAgIChpZGVudGljYWw/ICguLW11bHRpbGluZSB4KSAoLi1tdWx0aWxpbmUgeSkpXG4gICAgICAgKGlkZW50aWNhbD8gKC4taWdub3JlQ2FzZSB4KSAoLi1pZ25vcmVDYXNlIHkpKSkpXG5cbihkZWZuLSBeYm9vbGVhbiBkYXRlLWVxdWFsP1xuICBbeCB5XVxuICAoYW5kIChkYXRlPyB4KVxuICAgICAgIChkYXRlPyB5KVxuICAgICAgIChpZGVudGljYWw/IChOdW1iZXIgeCkgKE51bWJlciB5KSkpKVxuXG5cbihkZWZuLSBeYm9vbGVhbiBkaWN0aW9uYXJ5LWVxdWFsP1xuICBbeCB5XVxuICAoYW5kIChvYmplY3Q/IHgpXG4gICAgICAgKG9iamVjdD8geSlcbiAgICAgICAobGV0IFt4LWtleXMgKGtleXMgeClcbiAgICAgICAgICAgICB5LWtleXMgKGtleXMgeSlcbiAgICAgICAgICAgICB4LWNvdW50ICguLWxlbmd0aCB4LWtleXMpXG4gICAgICAgICAgICAgeS1jb3VudCAoLi1sZW5ndGggeS1rZXlzKV1cbiAgICAgICAgIChhbmQgKGlkZW50aWNhbD8geC1jb3VudCB5LWNvdW50KVxuICAgICAgICAgICAgICAobG9vcCBbaW5kZXggMFxuICAgICAgICAgICAgICAgICAgICAgY291bnQgeC1jb3VudFxuICAgICAgICAgICAgICAgICAgICAga2V5cyB4LWtleXNdXG4gICAgICAgICAgICAgICAgKGlmICg8IGluZGV4IGNvdW50KVxuICAgICAgICAgICAgICAgICAgKGlmIChlcXVpdmFsZW50PyAoZ2V0IHggKGdldCBrZXlzIGluZGV4KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGdldCB5IChnZXQga2V5cyBpbmRleCkpKVxuICAgICAgICAgICAgICAgICAgICAocmVjdXIgKGluYyBpbmRleCkgY291bnQga2V5cylcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UpXG4gICAgICAgICAgICAgICAgICB0cnVlKSkpKSkpXG5cbihkZWZuLSBeYm9vbGVhbiB2ZWN0b3ItZXF1YWw/XG4gIFt4IHldXG4gIChhbmQgKHZlY3Rvcj8geClcbiAgICAgICAodmVjdG9yPyB5KVxuICAgICAgIChpZGVudGljYWw/ICguLWxlbmd0aCB4KSAoLi1sZW5ndGggeSkpXG4gICAgICAgKGxvb3AgW3hzIHhcbiAgICAgICAgICAgICAgeXMgeVxuICAgICAgICAgICAgICBpbmRleCAwXG4gICAgICAgICAgICAgIGNvdW50ICguLWxlbmd0aCB4KV1cbiAgICAgICAgKGlmICg8IGluZGV4IGNvdW50KVxuICAgICAgICAgIChpZiAoZXF1aXZhbGVudD8gKGdldCB4cyBpbmRleCkgKGdldCB5cyBpbmRleCkpXG4gICAgICAgICAgICAgIChyZWN1ciB4cyB5cyAoaW5jIGluZGV4KSBjb3VudClcbiAgICAgICAgICAgICAgZmFsc2UpXG4gICAgICAgICAgdHJ1ZSkpKSlcblxuKGRlZm4tIF5ib29sZWFuIGVxdWl2YWxlbnQ/XG4gIFwiRXF1YWxpdHkuIFJldHVybnMgdHJ1ZSBpZiB4IGVxdWFscyB5LCBmYWxzZSBpZiBub3QuIENvbXBhcmVzXG4gIG51bWJlcnMgYW5kIGNvbGxlY3Rpb25zIGluIGEgdHlwZS1pbmRlcGVuZGVudCBtYW5uZXIuIENsb2p1cmUnc1xuICBpbW11dGFibGUgZGF0YSBzdHJ1Y3R1cmVzIGRlZmluZSAtZXF1aXYgKGFuZCB0aHVzID0pIGFzIGEgdmFsdWUsXG4gIG5vdCBhbiBpZGVudGl0eSwgY29tcGFyaXNvbi5cIlxuICAoW3hdIHRydWUpXG4gIChbeCB5XSAob3IgKGlkZW50aWNhbD8geCB5KVxuICAgICAgICAgICAgIChjb25kIChuaWw/IHgpIChuaWw/IHkpXG4gICAgICAgICAgICAgICAgICAgKG5pbD8geSkgKG5pbD8geClcbiAgICAgICAgICAgICAgICAgICAoc3RyaW5nPyB4KSAoYW5kIChzdHJpbmc/IHkpIChpZGVudGljYWw/ICgudG9TdHJpbmcgeClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgudG9TdHJpbmcgeSkpKVxuICAgICAgICAgICAgICAgICAgIChudW1iZXI/IHgpIChhbmQgKG51bWJlcj8geSkgKGlkZW50aWNhbD8gKC52YWx1ZU9mIHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoLnZhbHVlT2YgeSkpKVxuICAgICAgICAgICAgICAgICAgIChmbj8geCkgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAoYm9vbGVhbj8geCkgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAoZGF0ZT8geCkgKGRhdGUtZXF1YWw/IHggeSlcbiAgICAgICAgICAgICAgICAgICAodmVjdG9yPyB4KSAodmVjdG9yLWVxdWFsPyB4IHkgW10gW10pXG4gICAgICAgICAgICAgICAgICAgKHJlLXBhdHRlcm4/IHgpIChwYXR0ZXJuLWVxdWFsPyB4IHkpXG4gICAgICAgICAgICAgICAgICAgOmVsc2UgKGRpY3Rpb25hcnktZXF1YWw/IHggeSkpKSlcbiAgKFt4IHkgJiBtb3JlXVxuICAgKGxvb3AgW3ByZXZpb3VzIHhcbiAgICAgICAgICBjdXJyZW50IHlcbiAgICAgICAgICBpbmRleCAwXG4gICAgICAgICAgY291bnQgKC4tbGVuZ3RoIG1vcmUpXVxuICAgIChhbmQgKGVxdWl2YWxlbnQ/IHByZXZpb3VzIGN1cnJlbnQpXG4gICAgICAgICAoaWYgKDwgaW5kZXggY291bnQpXG4gICAgICAgICAgKHJlY3VyIGN1cnJlbnRcbiAgICAgICAgICAgICAgICAgKGdldCBtb3JlIGluZGV4KVxuICAgICAgICAgICAgICAgICAoaW5jIGluZGV4KVxuICAgICAgICAgICAgICAgICBjb3VudClcbiAgICAgICAgICB0cnVlKSkpKSlcblxuKGRlZiA9IGVxdWl2YWxlbnQ/KVxuXG4oZGVmbiBeYm9vbGVhbiA9PVxuICBcIkVxdWFsaXR5LiBSZXR1cm5zIHRydWUgaWYgeCBlcXVhbHMgeSwgZmFsc2UgaWYgbm90LiBDb21wYXJlc1xuICBudW1iZXJzIGFuZCBjb2xsZWN0aW9ucyBpbiBhIHR5cGUtaW5kZXBlbmRlbnQgbWFubmVyLiBDbG9qdXJlJ3NcbiAgaW1tdXRhYmxlIGRhdGEgc3RydWN0dXJlcyBkZWZpbmUgLWVxdWl2IChhbmQgdGh1cyA9KSBhcyBhIHZhbHVlLFxuICBub3QgYW4gaWRlbnRpdHksIGNvbXBhcmlzb24uXCJcbiAgKFt4XSB0cnVlKVxuICAoW3ggeV0gKGlkZW50aWNhbD8geCB5KSlcbiAgKFt4IHkgJiBtb3JlXVxuICAgKGxvb3AgW3ByZXZpb3VzIHhcbiAgICAgICAgICBjdXJyZW50IHlcbiAgICAgICAgICBpbmRleCAwXG4gICAgICAgICAgY291bnQgKC4tbGVuZ3RoIG1vcmUpXVxuICAgIChhbmQgKD09IHByZXZpb3VzIGN1cnJlbnQpXG4gICAgICAgICAoaWYgKDwgaW5kZXggY291bnQpXG4gICAgICAgICAgKHJlY3VyIGN1cnJlbnRcbiAgICAgICAgICAgICAgICAgKGdldCBtb3JlIGluZGV4KVxuICAgICAgICAgICAgICAgICAoaW5jIGluZGV4KVxuICAgICAgICAgICAgICAgICBjb3VudClcbiAgICAgICAgICB0cnVlKSkpKSlcblxuXG4oZGVmbiBeYm9vbGVhbiA+XG4gIFwiUmV0dXJucyBub24tbmlsIGlmIG51bXMgYXJlIGluIG1vbm90b25pY2FsbHkgZGVjcmVhc2luZyBvcmRlcixcbiAgb3RoZXJ3aXNlIGZhbHNlLlwiXG4gIChbeF0gdHJ1ZSlcbiAgKFt4IHldICg+IHggeSkpXG4gIChbeCB5ICYgbW9yZV1cbiAgIChsb29wIFtwcmV2aW91cyB4XG4gICAgICAgICAgY3VycmVudCB5XG4gICAgICAgICAgaW5kZXggMFxuICAgICAgICAgIGNvdW50ICguLWxlbmd0aCBtb3JlKV1cbiAgICAoYW5kICg+IHByZXZpb3VzIGN1cnJlbnQpXG4gICAgICAgICAoaWYgKDwgaW5kZXggY291bnQpXG4gICAgICAgICAgKHJlY3VyIGN1cnJlbnRcbiAgICAgICAgICAgICAgICAgKGdldCBtb3JlIGluZGV4KVxuICAgICAgICAgICAgICAgICAoaW5jIGluZGV4KVxuICAgICAgICAgICAgICAgICBjb3VudClcbiAgICAgICAgICB0cnVlKSkpKSlcblxuKGRlZm4gXmJvb2xlYW4gPj1cbiAgXCJSZXR1cm5zIG5vbi1uaWwgaWYgbnVtcyBhcmUgaW4gbW9ub3RvbmljYWxseSBkZWNyZWFzaW5nIG9yZGVyLFxuICBvdGhlcndpc2UgZmFsc2UuXCJcbiAgKFt4XSB0cnVlKVxuICAoW3ggeV0gKD49IHggeSkpXG4gIChbeCB5ICYgbW9yZV1cbiAgIChsb29wIFtwcmV2aW91cyB4XG4gICAgICAgICAgY3VycmVudCB5XG4gICAgICAgICAgaW5kZXggMFxuICAgICAgICAgIGNvdW50ICguLWxlbmd0aCBtb3JlKV1cbiAgICAoYW5kICg+PSBwcmV2aW91cyBjdXJyZW50KVxuICAgICAgICAgKGlmICg8IGluZGV4IGNvdW50KVxuICAgICAgICAgIChyZWN1ciBjdXJyZW50XG4gICAgICAgICAgICAgICAgIChnZXQgbW9yZSBpbmRleClcbiAgICAgICAgICAgICAgICAgKGluYyBpbmRleClcbiAgICAgICAgICAgICAgICAgY291bnQpXG4gICAgICAgICAgdHJ1ZSkpKSkpXG5cblxuKGRlZm4gXmJvb2xlYW4gPFxuICBcIlJldHVybnMgbm9uLW5pbCBpZiBudW1zIGFyZSBpbiBtb25vdG9uaWNhbGx5IGRlY3JlYXNpbmcgb3JkZXIsXG4gIG90aGVyd2lzZSBmYWxzZS5cIlxuICAoW3hdIHRydWUpXG4gIChbeCB5XSAoPCB4IHkpKVxuICAoW3ggeSAmIG1vcmVdXG4gICAobG9vcCBbcHJldmlvdXMgeFxuICAgICAgICAgIGN1cnJlbnQgeVxuICAgICAgICAgIGluZGV4IDBcbiAgICAgICAgICBjb3VudCAoLi1sZW5ndGggbW9yZSldXG4gICAgKGFuZCAoPCBwcmV2aW91cyBjdXJyZW50KVxuICAgICAgICAgKGlmICg8IGluZGV4IGNvdW50KVxuICAgICAgICAgIChyZWN1ciBjdXJyZW50XG4gICAgICAgICAgICAgICAgIChnZXQgbW9yZSBpbmRleClcbiAgICAgICAgICAgICAgICAgKGluYyBpbmRleClcbiAgICAgICAgICAgICAgICAgY291bnQpXG4gICAgICAgICAgdHJ1ZSkpKSkpXG5cblxuKGRlZm4gXmJvb2xlYW4gPD1cbiAgXCJSZXR1cm5zIG5vbi1uaWwgaWYgbnVtcyBhcmUgaW4gbW9ub3RvbmljYWxseSBkZWNyZWFzaW5nIG9yZGVyLFxuICBvdGhlcndpc2UgZmFsc2UuXCJcbiAgKFt4XSB0cnVlKVxuICAoW3ggeV0gKDw9IHggeSkpXG4gIChbeCB5ICYgbW9yZV1cbiAgIChsb29wIFtwcmV2aW91cyB4XG4gICAgICAgICAgY3VycmVudCB5XG4gICAgICAgICAgaW5kZXggMFxuICAgICAgICAgIGNvdW50ICguLWxlbmd0aCBtb3JlKV1cbiAgICAoYW5kICg8PSBwcmV2aW91cyBjdXJyZW50KVxuICAgICAgICAgKGlmICg8IGluZGV4IGNvdW50KVxuICAgICAgICAgIChyZWN1ciBjdXJyZW50XG4gICAgICAgICAgICAgICAgIChnZXQgbW9yZSBpbmRleClcbiAgICAgICAgICAgICAgICAgKGluYyBpbmRleClcbiAgICAgICAgICAgICAgICAgY291bnQpXG4gICAgICAgICAgdHJ1ZSkpKSkpXG5cbihkZWZuIF5ib29sZWFuICtcbiAgKFtdIDApXG4gIChbYV0gYSlcbiAgKFthIGJdICgrIGEgYikpXG4gIChbYSBiIGNdICgrIGEgYiBjKSlcbiAgKFthIGIgYyBkXSAoKyBhIGIgYyBkKSlcbiAgKFthIGIgYyBkIGVdICgrIGEgYiBjIGQgZSkpXG4gIChbYSBiIGMgZCBlIGZdICgrIGEgYiBjIGQgZSBmKSlcbiAgKFthIGIgYyBkIGUgZiAmIG1vcmVdXG4gICAobG9vcCBbdmFsdWUgKCsgYSBiIGMgZCBlIGYpXG4gICAgICAgICAgaW5kZXggMFxuICAgICAgICAgIGNvdW50ICguLWxlbmd0aCBtb3JlKV1cbiAgICAgKGlmICg8IGluZGV4IGNvdW50KVxuICAgICAgIChyZWN1ciAoKyB2YWx1ZSAoZ2V0IG1vcmUgaW5kZXgpKVxuICAgICAgICAgICAgICAoaW5jIGluZGV4KVxuICAgICAgICAgICAgICBjb3VudClcbiAgICAgICB2YWx1ZSkpKSlcblxuKGRlZm4gXmJvb2xlYW4gLVxuICAoW10gKHRocm93IChUeXBlRXJyb3IgXCJXcm9uZyBudW1iZXIgb2YgYXJncyBwYXNzZWQgdG86IC1cIikpKVxuICAoW2FdICgtIDAgYSkpXG4gIChbYSBiXSAoLSBhIGIpKVxuICAoW2EgYiBjXSAoLSBhIGIgYykpXG4gIChbYSBiIGMgZF0gKC0gYSBiIGMgZCkpXG4gIChbYSBiIGMgZCBlXSAoLSBhIGIgYyBkIGUpKVxuICAoW2EgYiBjIGQgZSBmXSAoLSBhIGIgYyBkIGUgZikpXG4gIChbYSBiIGMgZCBlIGYgJiBtb3JlXVxuICAgKGxvb3AgW3ZhbHVlICgtIGEgYiBjIGQgZSBmKVxuICAgICAgICAgIGluZGV4IDBcbiAgICAgICAgICBjb3VudCAoLi1sZW5ndGggbW9yZSldXG4gICAgIChpZiAoPCBpbmRleCBjb3VudClcbiAgICAgICAocmVjdXIgKC0gdmFsdWUgKGdldCBtb3JlIGluZGV4KSlcbiAgICAgICAgICAgICAgKGluYyBpbmRleClcbiAgICAgICAgICAgICAgY291bnQpXG4gICAgICAgdmFsdWUpKSkpXG5cbihkZWZuIF5ib29sZWFuIC9cbiAgKFtdICh0aHJvdyAoVHlwZUVycm9yIFwiV3JvbmcgbnVtYmVyIG9mIGFyZ3MgcGFzc2VkIHRvOiAvXCIpKSlcbiAgKFthXSAoLyAxIGEpKVxuICAoW2EgYl0gKC8gYSBiKSlcbiAgKFthIGIgY10gKC8gYSBiIGMpKVxuICAoW2EgYiBjIGRdICgvIGEgYiBjIGQpKVxuICAoW2EgYiBjIGQgZV0gKC8gYSBiIGMgZCBlKSlcbiAgKFthIGIgYyBkIGUgZl0gKC8gYSBiIGMgZCBlIGYpKVxuICAoW2EgYiBjIGQgZSBmICYgbW9yZV1cbiAgIChsb29wIFt2YWx1ZSAoLyBhIGIgYyBkIGUgZilcbiAgICAgICAgICBpbmRleCAwXG4gICAgICAgICAgY291bnQgKC4tbGVuZ3RoIG1vcmUpXVxuICAgICAoaWYgKDwgaW5kZXggY291bnQpXG4gICAgICAgKHJlY3VyICgvIHZhbHVlIChnZXQgbW9yZSBpbmRleCkpXG4gICAgICAgICAgICAgIChpbmMgaW5kZXgpXG4gICAgICAgICAgICAgIGNvdW50KVxuICAgICAgIHZhbHVlKSkpKVxuXG4oZGVmbiBeYm9vbGVhbiAqXG4gIChbXSAxKVxuICAoW2FdIGEpXG4gIChbYSBiXSAoKiBhIGIpKVxuICAoW2EgYiBjXSAoKiBhIGIgYykpXG4gIChbYSBiIGMgZF0gKCogYSBiIGMgZCkpXG4gIChbYSBiIGMgZCBlXSAoKiBhIGIgYyBkIGUpKVxuICAoW2EgYiBjIGQgZSBmXSAoKiBhIGIgYyBkIGUgZikpXG4gIChbYSBiIGMgZCBlIGYgJiBtb3JlXVxuICAgKGxvb3AgW3ZhbHVlICgqIGEgYiBjIGQgZSBmKVxuICAgICAgICAgIGluZGV4IDBcbiAgICAgICAgICBjb3VudCAoLi1sZW5ndGggbW9yZSldXG4gICAgIChpZiAoPCBpbmRleCBjb3VudClcbiAgICAgICAocmVjdXIgKCogdmFsdWUgKGdldCBtb3JlIGluZGV4KSlcbiAgICAgICAgICAgICAgKGluYyBpbmRleClcbiAgICAgICAgICAgICAgY291bnQpXG4gICAgICAgdmFsdWUpKSkpXG5cbihkZWZuIF5ib29sZWFuIGFuZFxuICAoW10gdHJ1ZSlcbiAgKFthXSBhKVxuICAoW2EgYl0gKGFuZCBhIGIpKVxuICAoW2EgYiBjXSAoYW5kIGEgYiBjKSlcbiAgKFthIGIgYyBkXSAoYW5kIGEgYiBjIGQpKVxuICAoW2EgYiBjIGQgZV0gKGFuZCBhIGIgYyBkIGUpKVxuICAoW2EgYiBjIGQgZSBmXSAoYW5kIGEgYiBjIGQgZSBmKSlcbiAgKFthIGIgYyBkIGUgZiAmIG1vcmVdXG4gICAobG9vcCBbdmFsdWUgKGFuZCBhIGIgYyBkIGUgZilcbiAgICAgICAgICBpbmRleCAwXG4gICAgICAgICAgY291bnQgKC4tbGVuZ3RoIG1vcmUpXVxuICAgICAoaWYgKDwgaW5kZXggY291bnQpXG4gICAgICAgKHJlY3VyIChhbmQgdmFsdWUgKGdldCBtb3JlIGluZGV4KSlcbiAgICAgICAgICAgICAgKGluYyBpbmRleClcbiAgICAgICAgICAgICAgY291bnQpXG4gICAgICAgdmFsdWUpKSkpXG5cbihkZWZuIF5ib29sZWFuIG9yXG4gIChbXSBuaWwpXG4gIChbYV0gYSlcbiAgKFthIGJdIChvciBhIGIpKVxuICAoW2EgYiBjXSAob3IgYSBiIGMpKVxuICAoW2EgYiBjIGRdIChvciBhIGIgYyBkKSlcbiAgKFthIGIgYyBkIGVdIChvciBhIGIgYyBkIGUpKVxuICAoW2EgYiBjIGQgZSBmXSAob3IgYSBiIGMgZCBlIGYpKVxuICAoW2EgYiBjIGQgZSBmICYgbW9yZV1cbiAgIChsb29wIFt2YWx1ZSAob3IgYSBiIGMgZCBlIGYpXG4gICAgICAgICAgaW5kZXggMFxuICAgICAgICAgIGNvdW50ICguLWxlbmd0aCBtb3JlKV1cbiAgICAgKGlmICg8IGluZGV4IGNvdW50KVxuICAgICAgIChyZWN1ciAob3IgdmFsdWUgKGdldCBtb3JlIGluZGV4KSlcbiAgICAgICAgICAgICAgKGluYyBpbmRleClcbiAgICAgICAgICAgICAgY291bnQpXG4gICAgICAgdmFsdWUpKSkpXG5cbihkZWZuIHByaW50XG4gIFsmIG1vcmVdXG4gIChhcHBseSBjb25zb2xlLmxvZyBtb3JlKSlcblxuKGRlZiBtYXggTWF0aC5tYXgpXG4oZGVmIG1pbiBNYXRoLm1pbilcbiJdfQ==

},{}],34:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.sequence',
            doc: void 0
        };
    var wisp_runtime = require('./runtime');
    var isNil = wisp_runtime.isNil;
    var isVector = wisp_runtime.isVector;
    var isFn = wisp_runtime.isFn;
    var isNumber = wisp_runtime.isNumber;
    var isString = wisp_runtime.isString;
    var isDictionary = wisp_runtime.isDictionary;
    var keyValues = wisp_runtime.keyValues;
    var str = wisp_runtime.str;
    var dec = wisp_runtime.dec;
    var inc = wisp_runtime.inc;
    var merge = wisp_runtime.merge;
    var dictionary = wisp_runtime.dictionary;
}
var List = function List(head, tail) {
    this.head = head;
    this.tail = tail || list();
    this.length = inc(count(this.tail));
    return this;
};
List.prototype.length = 0;
List.type = 'wisp.list';
List.prototype.type = List.type;
List.prototype.tail = Object.create(List.prototype);
List.prototype.toString = function () {
    return function loop() {
        var recur = loop;
        var resultø1 = '';
        var listø1 = this;
        do {
            recur = isEmpty(listø1) ? '' + '(' + resultø1.substr(1) + ')' : (loop[0] = '' + resultø1 + ' ' + (isVector(first(listø1)) ? '' + '[' + first(listø1).join(' ') + ']' : isNil(first(listø1)) ? 'nil' : isString(first(listø1)) ? JSON.stringify(first(listø1)) : isNumber(first(listø1)) ? JSON.stringify(first(listø1)) : first(listø1)), loop[1] = rest(listø1), loop);
        } while (resultø1 = loop[0], listø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var lazySeqValue = function lazySeqValue(lazySeq) {
    return !lazySeq.realized ? (lazySeq.realized = true) && (lazySeq.x = lazySeq.x()) : lazySeq.x;
};
var LazySeq = function LazySeq(realized, x) {
    this.realized = realized || false;
    this.x = x;
    return this;
};
LazySeq.type = 'wisp.lazy.seq';
LazySeq.prototype.type = LazySeq.type;
var lazySeq = exports.lazySeq = function lazySeq(realized, body) {
        return new LazySeq(realized, body);
    };
var isLazySeq = exports.isLazySeq = function isLazySeq(value) {
        return value && LazySeq.type === value.type;
    };
void 0;
var isList = exports.isList = function isList(value) {
        return value && List.type === value.type;
    };
var list = exports.list = function list() {
        return arguments.length === 0 ? Object.create(List.prototype) : Array.prototype.slice.call(arguments).reduceRight(function (tail, head) {
            return cons(head, tail);
        }, list());
    };
var cons = exports.cons = function cons(head, tail) {
        return new List(head, tail);
    };
var reverseList = function reverseList(sequence) {
    return function loop() {
        var recur = loop;
        var itemsø1 = [];
        var sourceø1 = sequence;
        do {
            recur = isEmpty(sourceø1) ? list.apply(void 0, itemsø1) : (loop[0] = [first(sourceø1)].concat(itemsø1), loop[1] = rest(sourceø1), loop);
        } while (itemsø1 = loop[0], sourceø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var isSequential = exports.isSequential = function isSequential(x) {
        return isList(x) || isVector(x) || isLazySeq(x) || isDictionary(x) || isString(x);
    };
var reverse = exports.reverse = function reverse(sequence) {
        return isList(sequence) ? reverseList(sequence) : isVector(sequence) ? sequence.reverse() : isNil(sequence) ? list() : 'else' ? reverse(seq(sequence)) : void 0;
    };
var map = exports.map = function map(f, sequence) {
        return isVector(sequence) ? sequence.map(function ($1) {
            return f($1);
        }) : isList(sequence) ? mapList(f, sequence) : isNil(sequence) ? list() : 'else' ? map(f, seq(sequence)) : void 0;
    };
var mapList = function mapList(f, sequence) {
    return function loop() {
        var recur = loop;
        var resultø1 = list();
        var itemsø1 = sequence;
        do {
            recur = isEmpty(itemsø1) ? reverse(resultø1) : (loop[0] = cons(f(first(itemsø1)), resultø1), loop[1] = rest(itemsø1), loop);
        } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var filter = exports.filter = function filter(isF, sequence) {
        return isVector(sequence) ? sequence.filter(isF) : isList(sequence) ? filterList(isF, sequence) : isNil(sequence) ? list() : 'else' ? filter(isF, seq(sequence)) : void 0;
    };
var filterList = function filterList(isF, sequence) {
    return function loop() {
        var recur = loop;
        var resultø1 = list();
        var itemsø1 = sequence;
        do {
            recur = isEmpty(itemsø1) ? reverse(resultø1) : (loop[0] = isF(first(itemsø1)) ? cons(first(itemsø1), resultø1) : resultø1, loop[1] = rest(itemsø1), loop);
        } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var reduce = exports.reduce = function reduce(f) {
        var params = Array.prototype.slice.call(arguments, 1);
        return function () {
            var hasInitialø1 = count(params) >= 2;
            var initialø1 = hasInitialø1 ? first(params) : void 0;
            var sequenceø1 = hasInitialø1 ? second(params) : first(params);
            return isNil(sequenceø1) ? initialø1 : isVector(sequenceø1) ? hasInitialø1 ? sequenceø1.reduce(f, initialø1) : sequenceø1.reduce(f) : isList(sequenceø1) ? hasInitialø1 ? reduceList(f, initialø1, sequenceø1) : reduceList(f, first(sequenceø1), rest(sequenceø1)) : 'else' ? reduce(f, initialø1, seq(sequenceø1)) : void 0;
        }.call(this);
    };
var reduceList = function reduceList(f, initial, sequence) {
    return function loop() {
        var recur = loop;
        var resultø1 = initial;
        var itemsø1 = sequence;
        do {
            recur = isEmpty(itemsø1) ? resultø1 : (loop[0] = f(resultø1, first(itemsø1)), loop[1] = rest(itemsø1), loop);
        } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var count = exports.count = function count(sequence) {
        return isNil(sequence) ? 0 : seq(sequence).length;
    };
var isEmpty = exports.isEmpty = function isEmpty(sequence) {
        return count(sequence) === 0;
    };
var first = exports.first = function first(sequence) {
        return isNil(sequence) ? void 0 : isList(sequence) ? sequence.head : isVector(sequence) || isString(sequence) ? (sequence || 0)[0] : isLazySeq(sequence) ? first(lazySeqValue(sequence)) : 'else' ? first(seq(sequence)) : void 0;
    };
var second = exports.second = function second(sequence) {
        return isNil(sequence) ? void 0 : isList(sequence) ? first(rest(sequence)) : isVector(sequence) || isString(sequence) ? (sequence || 0)[1] : isLazySeq(sequence) ? second(lazySeqValue(sequence)) : 'else' ? first(rest(seq(sequence))) : void 0;
    };
var third = exports.third = function third(sequence) {
        return isNil(sequence) ? void 0 : isList(sequence) ? first(rest(rest(sequence))) : isVector(sequence) || isString(sequence) ? (sequence || 0)[2] : isLazySeq(sequence) ? third(lazySeqValue(sequence)) : 'else' ? second(rest(seq(sequence))) : void 0;
    };
var rest = exports.rest = function rest(sequence) {
        return isNil(sequence) ? list() : isList(sequence) ? sequence.tail : isVector(sequence) || isString(sequence) ? sequence.slice(1) : isLazySeq(sequence) ? rest(lazySeqValue(sequence)) : 'else' ? rest(seq(sequence)) : void 0;
    };
var lastOfList = function lastOfList(list) {
    return function loop() {
        var recur = loop;
        var itemø1 = first(list);
        var itemsø1 = rest(list);
        do {
            recur = isEmpty(itemsø1) ? itemø1 : (loop[0] = first(itemsø1), loop[1] = rest(itemsø1), loop);
        } while (itemø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var last = exports.last = function last(sequence) {
        return isVector(sequence) || isString(sequence) ? (sequence || 0)[dec(count(sequence))] : isList(sequence) ? lastOfList(sequence) : isNil(sequence) ? void 0 : isLazySeq(sequence) ? last(lazySeqValue(sequence)) : 'else' ? last(seq(sequence)) : void 0;
    };
var butlast = exports.butlast = function butlast(sequence) {
        return function () {
            var itemsø1 = isNil(sequence) ? void 0 : isString(sequence) ? subs(sequence, 0, dec(count(sequence))) : isVector(sequence) ? sequence.slice(0, dec(count(sequence))) : isList(sequence) ? list.apply(void 0, butlast(vec(sequence))) : isLazySeq(sequence) ? butlast(lazySeqValue(sequence)) : 'else' ? butlast(seq(sequence)) : void 0;
            return !(isNil(itemsø1) || isEmpty(itemsø1)) ? itemsø1 : void 0;
        }.call(this);
    };
var take = exports.take = function take(n, sequence) {
        return isNil(sequence) ? list() : isVector(sequence) ? takeFromVector(n, sequence) : isList(sequence) ? takeFromList(n, sequence) : isLazySeq(sequence) ? take(n, lazySeqValue(sequence)) : 'else' ? take(n, seq(sequence)) : void 0;
    };
var takeVectorWhile = function takeVectorWhile(predicate, vector) {
    return function loop() {
        var recur = loop;
        var resultø1 = [];
        var tailø1 = vector;
        var headø1 = first(vector);
        do {
            recur = !isEmpty(tailø1) && predicate(headø1) ? (loop[0] = conj(resultø1, headø1), loop[1] = rest(tailø1), loop[2] = first(tailø1), loop) : resultø1;
        } while (resultø1 = loop[0], tailø1 = loop[1], headø1 = loop[2], recur === loop);
        return recur;
    }.call(this);
};
var takeListWhile = function takeListWhile(predicate, items) {
    return function loop() {
        var recur = loop;
        var resultø1 = [];
        var tailø1 = items;
        var headø1 = first(items);
        do {
            recur = !isEmpty(tailø1) && isPredicate(headø1) ? (loop[0] = conj(resultø1, headø1), loop[1] = rest(tailø1), loop[2] = first(tailø1), loop) : list.apply(void 0, resultø1);
        } while (resultø1 = loop[0], tailø1 = loop[1], headø1 = loop[2], recur === loop);
        return recur;
    }.call(this);
};
var takeWhile = exports.takeWhile = function takeWhile(predicate, sequence) {
        return isNil(sequence) ? list() : isVector(sequence) ? takeVectorWhile(predicate, sequence) : isList(sequence) ? takeVectorWhile(predicate, sequence) : 'else' ? takeWhile(predicate, lazySeqValue(sequence)) : void 0;
    };
var takeFromVector = function takeFromVector(n, vector) {
    return vector.slice(0, n);
};
var takeFromList = function takeFromList(n, sequence) {
    return function loop() {
        var recur = loop;
        var takenø1 = list();
        var itemsø1 = sequence;
        var nø2 = n;
        do {
            recur = nø2 === 0 || isEmpty(itemsø1) ? reverse(takenø1) : (loop[0] = cons(first(itemsø1), takenø1), loop[1] = rest(itemsø1), loop[2] = dec(nø2), loop);
        } while (takenø1 = loop[0], itemsø1 = loop[1], nø2 = loop[2], recur === loop);
        return recur;
    }.call(this);
};
var dropFromList = function dropFromList(n, sequence) {
    return function loop() {
        var recur = loop;
        var leftø1 = n;
        var itemsø1 = sequence;
        do {
            recur = leftø1 < 1 || isEmpty(itemsø1) ? itemsø1 : (loop[0] = dec(leftø1), loop[1] = rest(itemsø1), loop);
        } while (leftø1 = loop[0], itemsø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var drop = exports.drop = function drop(n, sequence) {
        return n <= 0 ? sequence : isString(sequence) ? sequence.substr(n) : isVector(sequence) ? sequence.slice(n) : isList(sequence) ? dropFromList(n, sequence) : isNil(sequence) ? list() : isLazySeq(sequence) ? drop(n, lazySeqValue(sequence)) : 'else' ? drop(n, seq(sequence)) : void 0;
    };
var conjList = function conjList(sequence, items) {
    return reduce(function (result, item) {
        return cons(item, result);
    }, sequence, items);
};
var conj = exports.conj = function conj(sequence) {
        var items = Array.prototype.slice.call(arguments, 1);
        return isVector(sequence) ? sequence.concat(items) : isString(sequence) ? '' + sequence + str.apply(void 0, items) : isNil(sequence) ? list.apply(void 0, reverse(items)) : isList(sequence) || isLazySeq() ? conjList(sequence, items) : isDictionary(sequence) ? merge(sequence, merge.apply(void 0, items)) : 'else' ? (function () {
            throw TypeError('' + 'Type can\'t be conjoined ' + sequence);
        })() : void 0;
    };
var assoc = exports.assoc = function assoc(source) {
        var keyValues = Array.prototype.slice.call(arguments, 1);
        return conj(source, dictionary.apply(void 0, keyValues));
    };
var concat = exports.concat = function concat() {
        var sequences = Array.prototype.slice.call(arguments, 0);
        return reverse(reduce(function (result, sequence) {
            return reduce(function (result, item) {
                return cons(item, result);
            }, result, seq(sequence));
        }, list(), sequences));
    };
var seq = exports.seq = function seq(sequence) {
        return isNil(sequence) ? void 0 : isVector(sequence) || isList(sequence) || isLazySeq(sequence) ? sequence : isString(sequence) ? Array.prototype.slice.call(sequence) : isDictionary(sequence) ? keyValues(sequence) : 'default' ? (function () {
            throw TypeError('' + 'Can not seq ' + sequence);
        })() : void 0;
    };
var isSeq = exports.isSeq = function isSeq(sequence) {
        return isList(sequence) || isLazySeq(sequence);
    };
var listToVector = function listToVector(source) {
    return function loop() {
        var recur = loop;
        var resultø1 = [];
        var listø1 = source;
        do {
            recur = isEmpty(listø1) ? resultø1 : (loop[0] = (function () {
                resultø1.push(first(listø1));
                return resultø1;
            })(), loop[1] = rest(listø1), loop);
        } while (resultø1 = loop[0], listø1 = loop[1], recur === loop);
        return recur;
    }.call(this);
};
var vec = exports.vec = function vec(sequence) {
        return isNil(sequence) ? [] : isVector(sequence) ? sequence : isList(sequence) ? listToVector(sequence) : 'else' ? vec(seq(sequence)) : void 0;
    };
var sort = exports.sort = function sort(f, items) {
        return function () {
            var hasComparatorø1 = isFn(f);
            var itemsø2 = !hasComparatorø1 && isNil(items) ? f : items;
            var compareø1 = hasComparatorø1 ? function (a, b) {
                    return f(a, b) ? 0 : 1;
                } : void 0;
            return isNil(itemsø2) ? list() : isVector(itemsø2) ? itemsø2.sort(compareø1) : isList(itemsø2) ? list.apply(void 0, vec(itemsø2).sort(compareø1)) : isDictionary(itemsø2) ? seq(itemsø2).sort(compareø1) : 'else' ? sort(f, seq(itemsø2)) : void 0;
        }.call(this);
    };
var repeat = exports.repeat = function repeat(n, x) {
        return function loop() {
            var recur = loop;
            var nø2 = n;
            var resultø1 = [];
            do {
                recur = nø2 <= 0 ? resultø1 : (loop[0] = dec(nø2), loop[1] = conj(resultø1, x), loop);
            } while (nø2 = loop[0], resultø1 = loop[1], recur === loop);
            return recur;
        }.call(this);
    };
var isEvery = exports.isEvery = function isEvery(predicate, sequence) {
        return vec(sequence).every(function ($1) {
            return predicate($1);
        });
    };
var some = exports.some = function some(predicate, sequence) {
        return function loop() {
            var recur = loop;
            var itemsø1 = sequence;
            do {
                recur = isEmpty(itemsø1) ? false : predicate(first(itemsø1)) ? true : 'else' ? (loop[0] = rest(itemsø1), loop) : void 0;
            } while (itemsø1 = loop[0], recur === loop);
            return recur;
        }.call(this);
    };
var partition = exports.partition = function partition() {
        switch (arguments.length) {
        case 2:
            var n = arguments[0];
            var coll = arguments[1];
            return partition(n, n, coll);
        case 3:
            var n = arguments[0];
            var step = arguments[1];
            var coll = arguments[2];
            return partition(n, step, [], coll);
        case 4:
            var n = arguments[0];
            var step = arguments[1];
            var pad = arguments[2];
            var coll = arguments[3];
            return function loop() {
                var recur = loop;
                var resultø1 = [];
                var itemsø1 = seq(coll);
                do {
                    recur = function () {
                        var chunkø1 = take(n, itemsø1);
                        var sizeø1 = count(chunkø1);
                        return sizeø1 === n ? (loop[0] = conj(resultø1, chunkø1), loop[1] = drop(step, itemsø1), loop) : 0 === sizeø1 ? resultø1 : n > sizeø1 + count(pad) ? resultø1 : 'else' ? conj(resultø1, take(n, vec(concat(chunkø1, pad)))) : void 0;
                    }.call(this);
                } while (resultø1 = loop[0], itemsø1 = loop[1], recur === loop);
                return recur;
            }.call(this);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var interleave = exports.interleave = function interleave() {
        switch (arguments.length) {
        case 2:
            var ax = arguments[0];
            var bx = arguments[1];
            return function loop() {
                var recur = loop;
                var cxø1 = [];
                var axø2 = ax;
                var bxø2 = bx;
                do {
                    recur = isEmpty(axø2) || isEmpty(bxø2) ? seq(cxø1) : (loop[0] = conj(cxø1, first(axø2), first(bxø2)), loop[1] = rest(axø2), loop[2] = rest(bxø2), loop);
                } while (cxø1 = loop[0], axø2 = loop[1], bxø2 = loop[2], recur === loop);
                return recur;
            }.call(this);
        default:
            var sequences = Array.prototype.slice.call(arguments, 0);
            return function loop() {
                var recur = loop;
                var resultø1 = [];
                var sequencesø2 = sequences;
                do {
                    recur = some(isEmpty, sequencesø2) ? resultø1 : (loop[0] = concat(resultø1, map(first, sequencesø2)), loop[1] = map(rest, sequencesø2), loop);
                } while (resultø1 = loop[0], sequencesø2 = loop[1], recur === loop);
                return recur;
            }.call(this);
        }
    };
var nth = exports.nth = function nth(sequence, index, notFound) {
        return isNil(sequence) ? notFound : isList(sequence) ? index < count(sequence) ? first(drop(index, sequence)) : notFound : isVector(sequence) || isString(sequence) ? index < count(sequence) ? sequence[index] : notFound : isLazySeq(sequence) ? nth(lazySeqValue(sequence), index, notFound) : 'else' ? (function () {
            throw TypeError('Unsupported type');
        })() : void 0;
    };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3Avc2VxdWVuY2Uud2lzcCJdLCJuYW1lcyI6WyJpc05pbCIsImlzVmVjdG9yIiwiaXNGbiIsImlzTnVtYmVyIiwiaXNTdHJpbmciLCJpc0RpY3Rpb25hcnkiLCJrZXlWYWx1ZXMiLCJzdHIiLCJkZWMiLCJpbmMiLCJtZXJnZSIsImRpY3Rpb25hcnkiLCJMaXN0IiwiaGVhZCIsInRhaWwiLCJ0aGlzIiwibGlzdCIsImxlbmd0aCIsImNvdW50IiwicHJvdG90eXBlLmxlbmd0aCIsInR5cGUiLCJwcm90b3R5cGUudHlwZSIsInByb3RvdHlwZS50YWlsIiwiT2JqZWN0IiwiY3JlYXRlIiwicHJvdG90eXBlIiwicHJvdG90eXBlLnRvU3RyaW5nIiwicmVzdWx0w7gxIiwibGlzdMO4MSIsImlzRW1wdHkiLCJzdWJzdHIiLCJmaXJzdCIsImpvaW4iLCJKU09OIiwic3RyaW5naWZ5IiwicmVzdCIsImxhenlTZXFWYWx1ZSIsImxhenlTZXEiLCJyZWFsaXplZCIsIngiLCJMYXp5U2VxIiwiYm9keSIsImlzTGF6eVNlcSIsInZhbHVlIiwiaXNMaXN0IiwiYXJndW1lbnRzIiwiQXJyYXkiLCJwcm90b3R5cGUuc2xpY2UiLCJjYWxsIiwicmVkdWNlUmlnaHQiLCJjb25zIiwicmV2ZXJzZUxpc3QiLCJzZXF1ZW5jZSIsIml0ZW1zw7gxIiwic291cmNlw7gxIiwiY29uY2F0IiwiaXNTZXF1ZW50aWFsIiwicmV2ZXJzZSIsInNlcSIsIm1hcCIsImYiLCIkMSIsIm1hcExpc3QiLCJmaWx0ZXIiLCJpc0YiLCJmaWx0ZXJMaXN0IiwicmVkdWNlIiwicGFyYW1zIiwiaGFzSW5pdGlhbMO4MSIsImluaXRpYWzDuDEiLCJzZXF1ZW5jZcO4MSIsInNlY29uZCIsInJlZHVjZUxpc3QiLCJpbml0aWFsIiwidGhpcmQiLCJzbGljZSIsImxhc3RPZkxpc3QiLCJpdGVtw7gxIiwibGFzdCIsImJ1dGxhc3QiLCJzdWJzIiwidmVjIiwidGFrZSIsIm4iLCJ0YWtlRnJvbVZlY3RvciIsInRha2VGcm9tTGlzdCIsInRha2VWZWN0b3JXaGlsZSIsInByZWRpY2F0ZSIsInZlY3RvciIsInRhaWzDuDEiLCJoZWFkw7gxIiwiY29uaiIsInRha2VMaXN0V2hpbGUiLCJpdGVtcyIsImlzUHJlZGljYXRlIiwidGFrZVdoaWxlIiwidGFrZW7DuDEiLCJuw7gyIiwiZHJvcEZyb21MaXN0IiwibGVmdMO4MSIsImRyb3AiLCJjb25qTGlzdCIsInJlc3VsdCIsIml0ZW0iLCJUeXBlRXJyb3IiLCJhc3NvYyIsInNvdXJjZSIsInNlcXVlbmNlcyIsImlzU2VxIiwibGlzdFRvVmVjdG9yIiwicHVzaCIsInNvcnQiLCJoYXNDb21wYXJhdG9yw7gxIiwiaXRlbXPDuDIiLCJjb21wYXJlw7gxIiwiYSIsImIiLCJyZXBlYXQiLCJpc0V2ZXJ5IiwiZXZlcnkiLCJzb21lIiwicGFydGl0aW9uIiwiY29sbCIsInN0ZXAiLCJwYWQiLCJjaHVua8O4MSIsInNpemXDuDEiLCJpbnRlcmxlYXZlIiwiYXgiLCJieCIsImN4w7gxIiwiYXjDuDIiLCJieMO4MiIsInNlcXVlbmNlc8O4MiIsIm50aCIsImluZGV4Iiwibm90Rm91bmQiXSwibWFwcGluZ3MiOiJBQUFBO0k7OztVQUFBO0ksd0NBQUE7SSxJQUNrQ0EsS0FBQSxHLGFBQUFBLEssQ0FEbEM7SSxJQUN1Q0MsUUFBQSxHLGFBQUFBLFEsQ0FEdkM7SSxJQUMrQ0MsSUFBQSxHLGFBQUFBLEksQ0FEL0M7SSxJQUNtREMsUUFBQSxHLGFBQUFBLFEsQ0FEbkQ7SSxJQUMyREMsUUFBQSxHLGFBQUFBLFEsQ0FEM0Q7SSxJQUNtRUMsWUFBQSxHLGFBQUFBLFksQ0FEbkU7SSxJQUVrQ0MsU0FBQSxHLGFBQUFBLFMsQ0FGbEM7SSxJQUU2Q0MsR0FBQSxHLGFBQUFBLEcsQ0FGN0M7SSxJQUVpREMsR0FBQSxHLGFBQUFBLEcsQ0FGakQ7SSxJQUVxREMsR0FBQSxHLGFBQUFBLEcsQ0FGckQ7SSxJQUV5REMsS0FBQSxHLGFBQUFBLEssQ0FGekQ7SSxJQUUrREMsVUFBQSxHLGFBQUFBLFUsQ0FG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QUFTZ0QsUUFBVCxDLEdBQTJCbUYsS0FBSCxHQUFVckgsS0FBRCxDQUFPa0MsUUFBUCxDQUFiLEdBQ1FBLFFBQU4sQ0FBZW1GLEtBQWYsQ0FERixHQUVFQyxRLEdBQ3pCOUYsU0FBRCxDQUFXVSxRQUFYLEMsR0FBc0JrRixHQUFELENBQU1sRyxZQUFELENBQWdCZ0IsUUFBaEIsQ0FBTCxFQUErQm1GLEtBQS9CLEVBQXFDQyxRQUFyQyxDO2tCQUNQaEMsU0FBRCxDLGtCQUFBLEM7VUFBUCxFLFNBVFosQztLQUhGIiwic291cmNlc0NvbnRlbnQiOlsiKG5zIHdpc3Auc2VxdWVuY2VcbiAgKDpyZXF1aXJlIFt3aXNwLnJ1bnRpbWUgOnJlZmVyIFtuaWw/IHZlY3Rvcj8gZm4/IG51bWJlcj8gc3RyaW5nPyBkaWN0aW9uYXJ5P1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleS12YWx1ZXMgc3RyIGRlYyBpbmMgbWVyZ2UgZGljdGlvbmFyeV1dKSlcblxuOzsgSW1wbGVtZW50YXRpb24gb2YgbGlzdFxuXG4oZGVmbi0gTGlzdFxuICBcIkxpc3QgdHlwZVwiXG4gIFtoZWFkIHRhaWxdXG4gIChzZXQhIHRoaXMuaGVhZCBoZWFkKVxuICAoc2V0ISB0aGlzLnRhaWwgKG9yIHRhaWwgKGxpc3QpKSlcbiAgKHNldCEgdGhpcy5sZW5ndGggKGluYyAoY291bnQgdGhpcy50YWlsKSkpXG4gIHRoaXMpXG5cbihzZXQhIExpc3QucHJvdG90eXBlLmxlbmd0aCAwKVxuKHNldCEgTGlzdC50eXBlIFwid2lzcC5saXN0XCIpXG4oc2V0ISBMaXN0LnByb3RvdHlwZS50eXBlIExpc3QudHlwZSlcbihzZXQhIExpc3QucHJvdG90eXBlLnRhaWwgKE9iamVjdC5jcmVhdGUgTGlzdC5wcm90b3R5cGUpKVxuKHNldCEgTGlzdC5wcm90b3R5cGUudG8tc3RyaW5nXG4gICAgICAoZm4gW11cbiAgICAgICAgKGxvb3AgW3Jlc3VsdCBcIlwiXG4gICAgICAgICAgICAgICBsaXN0IHRoaXNdXG4gICAgICAgICAgKGlmIChlbXB0eT8gbGlzdClcbiAgICAgICAgICAgIChzdHIgXCIoXCIgKC5zdWJzdHIgcmVzdWx0IDEpIFwiKVwiKVxuICAgICAgICAgICAgKHJlY3VyXG4gICAgICAgICAgICAgKHN0ciByZXN1bHRcbiAgICAgICAgICAgICAgICAgIFwiIFwiXG4gICAgICAgICAgICAgICAgICAoaWYgKHZlY3Rvcj8gKGZpcnN0IGxpc3QpKVxuICAgICAgICAgICAgICAgICAgICAoc3RyIFwiW1wiICguam9pbiAoZmlyc3QgbGlzdCkgXCIgXCIpIFwiXVwiKVxuICAgICAgICAgICAgICAgICAgICAoaWYgKG5pbD8gKGZpcnN0IGxpc3QpKVxuICAgICAgICAgICAgICAgICAgICAgIFwibmlsXCJcbiAgICAgICAgICAgICAgICAgICAgICAoaWYgKHN0cmluZz8gKGZpcnN0IGxpc3QpKVxuICAgICAgICAgICAgICAgICAgICAgICAgKC5zdHJpbmdpZnkgSlNPTiAoZmlyc3QgbGlzdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgKG51bWJlcj8gKGZpcnN0IGxpc3QpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAoLnN0cmluZ2lmeSBKU09OIChmaXJzdCBsaXN0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKGZpcnN0IGxpc3QpKSkpKSlcbiAgICAgICAgICAgICAocmVzdCBsaXN0KSkpKSkpXG5cbihkZWZuLSBsYXp5LXNlcS12YWx1ZSBbbGF6eS1zZXFdXG4gIChpZiAobm90ICguLXJlYWxpemVkIGxhenktc2VxKSlcbiAgICAoYW5kIChzZXQhICguLXJlYWxpemVkIGxhenktc2VxKSB0cnVlKVxuICAgICAgICAgKHNldCEgKC4teCBsYXp5LXNlcSkgKC54IGxhenktc2VxKSkpXG4gICAgKC4teCBsYXp5LXNlcSkpKVxuXG4oZGVmbi0gTGF6eVNlcSBbcmVhbGl6ZWQgeF1cbiAgKHNldCEgKC4tcmVhbGl6ZWQgdGhpcykgKG9yIHJlYWxpemVkIGZhbHNlKSlcbiAgKHNldCEgKC4teCB0aGlzKSB4KVxuICB0aGlzKVxuKHNldCEgTGF6eVNlcS50eXBlIFwid2lzcC5sYXp5LnNlcVwiKVxuKHNldCEgTGF6eVNlcS5wcm90b3R5cGUudHlwZSBMYXp5U2VxLnR5cGUpXG5cbihkZWZuIGxhenktc2VxXG4gIFtyZWFsaXplZCBib2R5XVxuICAoTGF6eVNlcS4gcmVhbGl6ZWQgYm9keSkpXG5cbihkZWZuIGxhenktc2VxP1xuICBbdmFsdWVdXG4gIChhbmQgdmFsdWUgKGlkZW50aWNhbD8gTGF6eVNlcS50eXBlIHZhbHVlLnR5cGUpKSlcblxuKGRlZm1hY3JvIGxhenktc2VxXG4gIFwiVGFrZXMgYSBib2R5IG9mIGV4cHJlc3Npb25zIHRoYXQgcmV0dXJucyBhbiBJU2VxIG9yIG5pbCwgYW5kIHlpZWxkc1xuICBhIFNlcWFibGUgb2JqZWN0IHRoYXQgd2lsbCBpbnZva2UgdGhlIGJvZHkgb25seSB0aGUgZmlyc3QgdGltZSBzZXFcbiAgaXMgY2FsbGVkLCBhbmQgd2lsbCBjYWNoZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gaXQgb24gYWxsIHN1YnNlcXVlbnRcbiAgc2VxIGNhbGxzLiBTZWUgYWxzbyAtIHJlYWxpemVkP1wiXG4gIHs6YWRkZWQgXCIxLjBcIn1cbiAgWyYgYm9keV1cbiAgYCguY2FsbCBsYXp5LXNlcSBuaWwgZmFsc2UgKGZuIFtdIH5AYm9keSkpKVxuXG4oZGVmbiBsaXN0P1xuICBcIlJldHVybnMgdHJ1ZSBpZiBsaXN0XCJcbiAgW3ZhbHVlXVxuICAoYW5kIHZhbHVlIChpZGVudGljYWw/IExpc3QudHlwZSB2YWx1ZS50eXBlKSkpXG5cbihkZWZuIGxpc3RcbiAgXCJDcmVhdGVzIGxpc3Qgb2YgdGhlIGdpdmVuIGl0ZW1zXCJcbiAgW11cbiAgKGlmIChpZGVudGljYWw/ICguLWxlbmd0aCBhcmd1bWVudHMpIDApXG4gICAgKE9iamVjdC5jcmVhdGUgTGlzdC5wcm90b3R5cGUpXG4gICAgKC5yZWR1Y2UtcmlnaHQgKC5jYWxsIEFycmF5LnByb3RvdHlwZS5zbGljZSBhcmd1bWVudHMpXG4gICAgICAgICAgICAgICAgICAgKGZuIFt0YWlsIGhlYWRdIChjb25zIGhlYWQgdGFpbCkpXG4gICAgICAgICAgICAgICAgICAgKGxpc3QpKSkpXG5cbihkZWZuIGNvbnNcbiAgXCJDcmVhdGVzIGxpc3Qgd2l0aCBgaGVhZGAgYXMgZmlyc3QgaXRlbSBhbmQgYHRhaWxgIGFzIHJlc3RcIlxuICBbaGVhZCB0YWlsXVxuICAobmV3IExpc3QgaGVhZCB0YWlsKSlcblxuKGRlZm4tIHJldmVyc2UtbGlzdFxuICBbc2VxdWVuY2VdXG4gIChsb29wIFtpdGVtcyBbXVxuICAgICAgICAgICBzb3VyY2Ugc2VxdWVuY2VdXG4gICAgICAoaWYgKGVtcHR5PyBzb3VyY2UpXG4gICAgICAgIChhcHBseSBsaXN0IGl0ZW1zKVxuICAgICAgICAocmVjdXIgKC5jb25jYXQgWyhmaXJzdCBzb3VyY2UpXSBpdGVtcylcbiAgICAgICAgICAgICAgIChyZXN0IHNvdXJjZSkpKSkpXG5cbihkZWZuIF5ib29sZWFuIHNlcXVlbnRpYWw/XG4gIFwiUmV0dXJucyB0cnVlIGlmIGNvbGwgc2F0aXNmaWVzIElTZXF1ZW50aWFsXCJcbiAgW3hdIChvciAobGlzdD8geClcbiAgICAgICAgICAodmVjdG9yPyB4KVxuICAgICAgICAgIChsYXp5LXNlcT8geClcbiAgICAgICAgICAoZGljdGlvbmFyeT8geClcbiAgICAgICAgICAoc3RyaW5nPyB4KSkpXG5cblxuKGRlZm4gcmV2ZXJzZVxuICBcIlJldmVyc2Ugb3JkZXIgb2YgaXRlbXMgaW4gdGhlIHNlcXVlbmNlXCJcbiAgW3NlcXVlbmNlXVxuICAoY29uZCAobGlzdD8gc2VxdWVuY2UpIChyZXZlcnNlLWxpc3Qgc2VxdWVuY2UpXG4gICAgICAgICh2ZWN0b3I/IHNlcXVlbmNlKSAoLnJldmVyc2Ugc2VxdWVuY2UpXG4gICAgICAgIChuaWw/IHNlcXVlbmNlKSAnKClcbiAgICAgICAgOmVsc2UgKHJldmVyc2UgKHNlcSBzZXF1ZW5jZSkpKSlcblxuKGRlZm4gbWFwXG4gIFwiUmV0dXJucyBhIHNlcXVlbmNlIGNvbnNpc3Rpbmcgb2YgdGhlIHJlc3VsdCBvZiBhcHBseWluZyBgZmAgdG8gdGhlXG4gIGZpcnN0IGl0ZW0sIGZvbGxvd2VkIGJ5IGFwcGx5aW5nIGYgdG8gdGhlIHNlY29uZCBpdGVtcywgdW50aWwgc2VxdWVuY2UgaXNcbiAgZXhoYXVzdGVkLlwiXG4gIFtmIHNlcXVlbmNlXVxuICAoY29uZCAodmVjdG9yPyBzZXF1ZW5jZSkgKC5tYXAgc2VxdWVuY2UgIyhmICUpKVxuICAgICAgICAobGlzdD8gc2VxdWVuY2UpIChtYXAtbGlzdCBmIHNlcXVlbmNlKVxuICAgICAgICAobmlsPyBzZXF1ZW5jZSkgJygpXG4gICAgICAgIDplbHNlIChtYXAgZiAoc2VxIHNlcXVlbmNlKSkpKVxuXG4oZGVmbi0gbWFwLWxpc3RcbiAgXCJMaWtlIG1hcCBidXQgb3B0aW1pemVkIGZvciBsaXN0c1wiXG4gIFtmIHNlcXVlbmNlXVxuICAobG9vcCBbcmVzdWx0ICcoKVxuICAgICAgICAgaXRlbXMgc2VxdWVuY2VdXG4gICAgKGlmIChlbXB0eT8gaXRlbXMpXG4gICAgICAocmV2ZXJzZSByZXN1bHQpXG4gICAgICAocmVjdXIgKGNvbnMgKGYgKGZpcnN0IGl0ZW1zKSkgcmVzdWx0KSAocmVzdCBpdGVtcykpKSkpXG5cbihkZWZuIGZpbHRlclxuICBcIlJldHVybnMgYSBzZXF1ZW5jZSBvZiB0aGUgaXRlbXMgaW4gY29sbCBmb3Igd2hpY2ggKGY/IGl0ZW0pIHJldHVybnMgdHJ1ZS5cbiAgZj8gbXVzdCBiZSBmcmVlIG9mIHNpZGUtZWZmZWN0cy5cIlxuICBbZj8gc2VxdWVuY2VdXG4gIChjb25kICh2ZWN0b3I/IHNlcXVlbmNlKSAoLmZpbHRlciBzZXF1ZW5jZSBmPylcbiAgICAgICAgKGxpc3Q/IHNlcXVlbmNlKSAoZmlsdGVyLWxpc3QgZj8gc2VxdWVuY2UpXG4gICAgICAgIChuaWw/IHNlcXVlbmNlKSAnKClcbiAgICAgICAgOmVsc2UgKGZpbHRlciBmPyAoc2VxIHNlcXVlbmNlKSkpKVxuXG4oZGVmbi0gZmlsdGVyLWxpc3RcbiAgXCJMaWtlIGZpbHRlciBidXQgZm9yIGxpc3RzXCJcbiAgW2Y/IHNlcXVlbmNlXVxuICAobG9vcCBbcmVzdWx0ICcoKVxuICAgICAgICAgaXRlbXMgc2VxdWVuY2VdXG4gICAgKGlmIChlbXB0eT8gaXRlbXMpXG4gICAgICAocmV2ZXJzZSByZXN1bHQpXG4gICAgICAocmVjdXIgKGlmIChmPyAoZmlyc3QgaXRlbXMpKVxuICAgICAgICAgICAgICAoY29ucyAoZmlyc3QgaXRlbXMpIHJlc3VsdClcbiAgICAgICAgICAgICAgcmVzdWx0KVxuICAgICAgICAgICAgICAocmVzdCBpdGVtcykpKSkpXG5cbihkZWZuIHJlZHVjZVxuICBbZiAmIHBhcmFtc11cbiAgKGxldCBbaGFzLWluaXRpYWwgKD49IChjb3VudCBwYXJhbXMpIDIpXG4gICAgICAgIGluaXRpYWwgKGlmIGhhcy1pbml0aWFsIChmaXJzdCBwYXJhbXMpKVxuICAgICAgICBzZXF1ZW5jZSAoaWYgaGFzLWluaXRpYWwgKHNlY29uZCBwYXJhbXMpIChmaXJzdCBwYXJhbXMpKV1cbiAgICAoY29uZCAobmlsPyBzZXF1ZW5jZSkgaW5pdGlhbFxuICAgICAgICAgICh2ZWN0b3I/IHNlcXVlbmNlKSAoaWYgaGFzLWluaXRpYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgucmVkdWNlIHNlcXVlbmNlIGYgaW5pdGlhbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgucmVkdWNlIHNlcXVlbmNlIGYpKVxuICAgICAgICAgIChsaXN0PyBzZXF1ZW5jZSkgKGlmIGhhcy1pbml0aWFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJlZHVjZS1saXN0IGYgaW5pdGlhbCBzZXF1ZW5jZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmVkdWNlLWxpc3QgZiAoZmlyc3Qgc2VxdWVuY2UpIChyZXN0IHNlcXVlbmNlKSkpXG4gICAgICAgICAgOmVsc2UgKHJlZHVjZSBmIGluaXRpYWwgKHNlcSBzZXF1ZW5jZSkpKSkpXG5cbihkZWZuLSByZWR1Y2UtbGlzdFxuICBbZiBpbml0aWFsIHNlcXVlbmNlXVxuICAobG9vcCBbcmVzdWx0IGluaXRpYWxcbiAgICAgICAgIGl0ZW1zIHNlcXVlbmNlXVxuICAgIChpZiAoZW1wdHk/IGl0ZW1zKVxuICAgICAgcmVzdWx0XG4gICAgICAocmVjdXIgKGYgcmVzdWx0IChmaXJzdCBpdGVtcykpIChyZXN0IGl0ZW1zKSkpKSlcblxuKGRlZm4gY291bnRcbiAgXCJSZXR1cm5zIG51bWJlciBvZiBlbGVtZW50cyBpbiBsaXN0XCJcbiAgW3NlcXVlbmNlXVxuICAoaWYgKG5pbD8gc2VxdWVuY2UpXG4gICAgMFxuICAgICguLWxlbmd0aCAoc2VxIHNlcXVlbmNlKSkpKVxuXG4oZGVmbiBlbXB0eT9cbiAgXCJSZXR1cm5zIHRydWUgaWYgbGlzdCBpcyBlbXB0eVwiXG4gIFtzZXF1ZW5jZV1cbiAgKGlkZW50aWNhbD8gKGNvdW50IHNlcXVlbmNlKSAwKSlcblxuKGRlZm4gZmlyc3RcbiAgXCJSZXR1cm4gZmlyc3QgaXRlbSBpbiBhIGxpc3RcIlxuICBbc2VxdWVuY2VdXG4gIChjb25kIChuaWw/IHNlcXVlbmNlKSBuaWxcbiAgICAgICAgKGxpc3Q/IHNlcXVlbmNlKSAoLi1oZWFkIHNlcXVlbmNlKVxuICAgICAgICAob3IgKHZlY3Rvcj8gc2VxdWVuY2UpIChzdHJpbmc/IHNlcXVlbmNlKSkgKGdldCBzZXF1ZW5jZSAwKVxuICAgICAgICAobGF6eS1zZXE/IHNlcXVlbmNlKSAoZmlyc3QgKGxhenktc2VxLXZhbHVlIHNlcXVlbmNlKSlcbiAgICAgICAgOmVsc2UgKGZpcnN0IChzZXEgc2VxdWVuY2UpKSkpXG5cbihkZWZuIHNlY29uZFxuICBcIlJldHVybnMgc2Vjb25kIGl0ZW0gb2YgdGhlIGxpc3RcIlxuICBbc2VxdWVuY2VdXG4gIChjb25kIChuaWw/IHNlcXVlbmNlKSBuaWxcbiAgICAgICAgKGxpc3Q/IHNlcXVlbmNlKSAoZmlyc3QgKHJlc3Qgc2VxdWVuY2UpKVxuICAgICAgICAob3IgKHZlY3Rvcj8gc2VxdWVuY2UpIChzdHJpbmc/IHNlcXVlbmNlKSkgKGdldCBzZXF1ZW5jZSAxKVxuICAgICAgICAobGF6eS1zZXE/IHNlcXVlbmNlKSAoc2Vjb25kIChsYXp5LXNlcS12YWx1ZSBzZXF1ZW5jZSkpXG4gICAgICAgIDplbHNlIChmaXJzdCAocmVzdCAoc2VxIHNlcXVlbmNlKSkpKSlcblxuKGRlZm4gdGhpcmRcbiAgXCJSZXR1cm5zIHRoaXJkIGl0ZW0gb2YgdGhlIGxpc3RcIlxuICBbc2VxdWVuY2VdXG4gIChjb25kIChuaWw/IHNlcXVlbmNlKSBuaWxcbiAgICAgICAgKGxpc3Q/IHNlcXVlbmNlKSAoZmlyc3QgKHJlc3QgKHJlc3Qgc2VxdWVuY2UpKSlcbiAgICAgICAgKG9yICh2ZWN0b3I/IHNlcXVlbmNlKSAoc3RyaW5nPyBzZXF1ZW5jZSkpIChnZXQgc2VxdWVuY2UgMilcbiAgICAgICAgKGxhenktc2VxPyBzZXF1ZW5jZSkgKHRoaXJkIChsYXp5LXNlcS12YWx1ZSBzZXF1ZW5jZSkpXG4gICAgICAgIDplbHNlIChzZWNvbmQgKHJlc3QgKHNlcSBzZXF1ZW5jZSkpKSkpXG5cbihkZWZuIHJlc3RcbiAgXCJSZXR1cm5zIGxpc3Qgb2YgYWxsIGl0ZW1zIGV4Y2VwdCBmaXJzdCBvbmVcIlxuICBbc2VxdWVuY2VdXG4gIChjb25kIChuaWw/IHNlcXVlbmNlKSAnKClcbiAgICAgICAgKGxpc3Q/IHNlcXVlbmNlKSAoLi10YWlsIHNlcXVlbmNlKVxuICAgICAgICAob3IgKHZlY3Rvcj8gc2VxdWVuY2UpIChzdHJpbmc/IHNlcXVlbmNlKSkgKC5zbGljZSBzZXF1ZW5jZSAxKVxuICAgICAgICAobGF6eS1zZXE/IHNlcXVlbmNlKSAocmVzdCAobGF6eS1zZXEtdmFsdWUgc2VxdWVuY2UpKVxuICAgICAgICA6ZWxzZSAocmVzdCAoc2VxIHNlcXVlbmNlKSkpKVxuXG4oZGVmbi0gbGFzdC1vZi1saXN0XG4gIFtsaXN0XVxuICAobG9vcCBbaXRlbSAoZmlyc3QgbGlzdClcbiAgICAgICAgIGl0ZW1zIChyZXN0IGxpc3QpXVxuICAgIChpZiAoZW1wdHk/IGl0ZW1zKVxuICAgICAgaXRlbVxuICAgICAgKHJlY3VyIChmaXJzdCBpdGVtcykgKHJlc3QgaXRlbXMpKSkpKVxuXG4oZGVmbiBsYXN0XG4gIFwiUmV0dXJuIHRoZSBsYXN0IGl0ZW0gaW4gY29sbCwgaW4gbGluZWFyIHRpbWVcIlxuICBbc2VxdWVuY2VdXG4gIChjb25kIChvciAodmVjdG9yPyBzZXF1ZW5jZSlcbiAgICAgICAgICAgIChzdHJpbmc/IHNlcXVlbmNlKSkgKGdldCBzZXF1ZW5jZSAoZGVjIChjb3VudCBzZXF1ZW5jZSkpKVxuICAgICAgICAobGlzdD8gc2VxdWVuY2UpIChsYXN0LW9mLWxpc3Qgc2VxdWVuY2UpXG4gICAgICAgIChuaWw/IHNlcXVlbmNlKSBuaWxcbiAgICAgICAgKGxhenktc2VxPyBzZXF1ZW5jZSkgKGxhc3QgKGxhenktc2VxLXZhbHVlIHNlcXVlbmNlKSlcbiAgICAgICAgOmVsc2UgKGxhc3QgKHNlcSBzZXF1ZW5jZSkpKSlcblxuKGRlZm4gYnV0bGFzdFxuICBcIlJldHVybiBhIHNlcSBvZiBhbGwgYnV0IHRoZSBsYXN0IGl0ZW0gaW4gY29sbCwgaW4gbGluZWFyIHRpbWVcIlxuICBbc2VxdWVuY2VdXG4gIChsZXQgW2l0ZW1zIChjb25kIChuaWw/IHNlcXVlbmNlKSBuaWxcbiAgICAgICAgICAgICAgICAgICAgKHN0cmluZz8gc2VxdWVuY2UpIChzdWJzIHNlcXVlbmNlIDAgKGRlYyAoY291bnQgc2VxdWVuY2UpKSlcbiAgICAgICAgICAgICAgICAgICAgKHZlY3Rvcj8gc2VxdWVuY2UpICguc2xpY2Ugc2VxdWVuY2UgMCAoZGVjIChjb3VudCBzZXF1ZW5jZSkpKVxuICAgICAgICAgICAgICAgICAgICAobGlzdD8gc2VxdWVuY2UpIChhcHBseSBsaXN0IChidXRsYXN0ICh2ZWMgc2VxdWVuY2UpKSlcbiAgICAgICAgICAgICAgICAgICAgKGxhenktc2VxPyBzZXF1ZW5jZSkgKGJ1dGxhc3QgKGxhenktc2VxLXZhbHVlIHNlcXVlbmNlKSlcbiAgICAgICAgICAgICAgICAgICAgOmVsc2UgKGJ1dGxhc3QgKHNlcSBzZXF1ZW5jZSkpKV1cbiAgICAoaWYgKG5vdCAob3IgKG5pbD8gaXRlbXMpIChlbXB0eT8gaXRlbXMpKSlcbiAgICAgICAgaXRlbXMpKSlcblxuKGRlZm4gdGFrZVxuICBcIlJldHVybnMgYSBzZXF1ZW5jZSBvZiB0aGUgZmlyc3QgYG5gIGl0ZW1zLCBvciBhbGwgaXRlbXMgaWZcbiAgdGhlcmUgYXJlIGZld2VyIHRoYW4gYG5gLlwiXG4gIFtuIHNlcXVlbmNlXVxuICAoY29uZCAobmlsPyBzZXF1ZW5jZSkgJygpXG4gICAgICAgICh2ZWN0b3I/IHNlcXVlbmNlKSAodGFrZS1mcm9tLXZlY3RvciBuIHNlcXVlbmNlKVxuICAgICAgICAobGlzdD8gc2VxdWVuY2UpICh0YWtlLWZyb20tbGlzdCBuIHNlcXVlbmNlKVxuICAgICAgICAobGF6eS1zZXE/IHNlcXVlbmNlKSAodGFrZSBuIChsYXp5LXNlcS12YWx1ZSBzZXF1ZW5jZSkpXG4gICAgICAgIDplbHNlICh0YWtlIG4gKHNlcSBzZXF1ZW5jZSkpKSlcblxuKGRlZm4tIHRha2UtdmVjdG9yLXdoaWxlXG4gIFtwcmVkaWNhdGUgdmVjdG9yXVxuICAobG9vcCBbcmVzdWx0IFtdXG4gICAgICAgICB0YWlsIHZlY3RvclxuICAgICAgICAgaGVhZCAoZmlyc3QgdmVjdG9yKV1cbiAgICAoaWYgKGFuZCAobm90IChlbXB0eT8gdGFpbCkpXG4gICAgICAgICAgICAgKHByZWRpY2F0ZSBoZWFkKSlcbiAgICAgIChyZWN1ciAoY29uaiByZXN1bHQgaGVhZClcbiAgICAgICAgICAgICAocmVzdCB0YWlsKVxuICAgICAgICAgICAgIChmaXJzdCB0YWlsKSlcbiAgICAgIHJlc3VsdCkpKVxuXG4oZGVmbi0gdGFrZS1saXN0LXdoaWxlXG4gIFtwcmVkaWNhdGUgaXRlbXNdXG4gIChsb29wIFtyZXN1bHQgW11cbiAgICAgICAgIHRhaWwgaXRlbXNcbiAgICAgICAgIGhlYWQgKGZpcnN0IGl0ZW1zKV1cbiAgICAoaWYgKGFuZCAobm90IChlbXB0eT8gdGFpbCkpXG4gICAgICAgICAgICAgKHByZWRpY2F0ZT8gaGVhZCkpXG4gICAgICAocmVjdXIgKGNvbmogcmVzdWx0IGhlYWQpXG4gICAgICAgICAgICAgKHJlc3QgdGFpbClcbiAgICAgICAgICAgICAoZmlyc3QgdGFpbCkpXG4gICAgICAoYXBwbHkgbGlzdCByZXN1bHQpKSkpXG5cblxuKGRlZm4gdGFrZS13aGlsZVxuICBbcHJlZGljYXRlIHNlcXVlbmNlXVxuICAoY29uZCAobmlsPyBzZXF1ZW5jZSkgJygpXG4gICAgICAgICh2ZWN0b3I/IHNlcXVlbmNlKSAodGFrZS12ZWN0b3Itd2hpbGUgcHJlZGljYXRlIHNlcXVlbmNlKVxuICAgICAgICAobGlzdD8gc2VxdWVuY2UpICh0YWtlLXZlY3Rvci13aGlsZSBwcmVkaWNhdGUgc2VxdWVuY2UpXG4gICAgICAgIDplbHNlICh0YWtlLXdoaWxlIHByZWRpY2F0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAobGF6eS1zZXEtdmFsdWUgc2VxdWVuY2UpKSkpXG5cblxuKGRlZm4tIHRha2UtZnJvbS12ZWN0b3JcbiAgXCJMaWtlIHRha2UgYnV0IG9wdGltaXplZCBmb3IgdmVjdG9yc1wiXG4gIFtuIHZlY3Rvcl1cbiAgKC5zbGljZSB2ZWN0b3IgMCBuKSlcblxuKGRlZm4tIHRha2UtZnJvbS1saXN0XG4gIFwiTGlrZSB0YWtlIGJ1dCBmb3IgbGlzdHNcIlxuICBbbiBzZXF1ZW5jZV1cbiAgKGxvb3AgW3Rha2VuICcoKVxuICAgICAgICAgaXRlbXMgc2VxdWVuY2VcbiAgICAgICAgIG4gbl1cbiAgICAoaWYgKG9yIChpZGVudGljYWw/IG4gMCkgKGVtcHR5PyBpdGVtcykpXG4gICAgICAocmV2ZXJzZSB0YWtlbilcbiAgICAgIChyZWN1ciAoY29ucyAoZmlyc3QgaXRlbXMpIHRha2VuKVxuICAgICAgICAgICAgIChyZXN0IGl0ZW1zKVxuICAgICAgICAgICAgIChkZWMgbikpKSkpXG5cblxuXG5cbihkZWZuLSBkcm9wLWZyb20tbGlzdCBbbiBzZXF1ZW5jZV1cbiAgKGxvb3AgW2xlZnQgblxuICAgICAgICAgaXRlbXMgc2VxdWVuY2VdXG4gICAgKGlmIChvciAoPCBsZWZ0IDEpIChlbXB0eT8gaXRlbXMpKVxuICAgICAgaXRlbXNcbiAgICAgIChyZWN1ciAoZGVjIGxlZnQpIChyZXN0IGl0ZW1zKSkpKSlcblxuKGRlZm4gZHJvcFxuICBbbiBzZXF1ZW5jZV1cbiAgKGlmICg8PSBuIDApXG4gICAgc2VxdWVuY2VcbiAgICAoY29uZCAoc3RyaW5nPyBzZXF1ZW5jZSkgKC5zdWJzdHIgc2VxdWVuY2UgbilcbiAgICAgICAgICAodmVjdG9yPyBzZXF1ZW5jZSkgKC5zbGljZSBzZXF1ZW5jZSBuKVxuICAgICAgICAgIChsaXN0PyBzZXF1ZW5jZSkgKGRyb3AtZnJvbS1saXN0IG4gc2VxdWVuY2UpXG4gICAgICAgICAgKG5pbD8gc2VxdWVuY2UpICcoKVxuICAgICAgICAgIChsYXp5LXNlcT8gc2VxdWVuY2UpIChkcm9wIG4gKGxhenktc2VxLXZhbHVlIHNlcXVlbmNlKSlcbiAgICAgICAgICA6ZWxzZSAoZHJvcCBuIChzZXEgc2VxdWVuY2UpKSkpKVxuXG5cbihkZWZuLSBjb25qLWxpc3RcbiAgW3NlcXVlbmNlIGl0ZW1zXVxuICAocmVkdWNlIChmbiBbcmVzdWx0IGl0ZW1dIChjb25zIGl0ZW0gcmVzdWx0KSkgc2VxdWVuY2UgaXRlbXMpKVxuXG4oZGVmbiBjb25qXG4gIFtzZXF1ZW5jZSAmIGl0ZW1zXVxuICAoY29uZCAodmVjdG9yPyBzZXF1ZW5jZSkgKC5jb25jYXQgc2VxdWVuY2UgaXRlbXMpXG4gICAgICAgIChzdHJpbmc/IHNlcXVlbmNlKSAoc3RyIHNlcXVlbmNlIChhcHBseSBzdHIgaXRlbXMpKVxuICAgICAgICAobmlsPyBzZXF1ZW5jZSkgKGFwcGx5IGxpc3QgKHJldmVyc2UgaXRlbXMpKVxuICAgICAgICAob3IgKGxpc3Q/IHNlcXVlbmNlKVxuICAgICAgICAgICAgKGxhenktc2VxPykpIChjb25qLWxpc3Qgc2VxdWVuY2UgaXRlbXMpXG4gICAgICAgIChkaWN0aW9uYXJ5PyBzZXF1ZW5jZSkgKG1lcmdlIHNlcXVlbmNlIChhcHBseSBtZXJnZSBpdGVtcykpXG4gICAgICAgIDplbHNlICh0aHJvdyAoVHlwZUVycm9yIChzdHIgXCJUeXBlIGNhbid0IGJlIGNvbmpvaW5lZCBcIiBzZXF1ZW5jZSkpKSkpXG5cbihkZWZuIGFzc29jXG4gIFtzb3VyY2UgJiBrZXktdmFsdWVzXVxuICA7KGFzc2VydCAoZXZlbj8gKGNvdW50IGtleS12YWx1ZXMpKSBcIldyb25nIG51bWJlciBvZiBhcmd1bWVudHNcIilcbiAgOyhhc3NlcnQgKGFuZCAobm90IChzZXE/IHNvdXJjZSkpXG4gIDsgICAgICAgICAgICAgKG5vdCAodmVjdG9yPyBzb3VyY2UpKVxuICA7ICAgICAgICAgICAgIChvYmplY3Q/IHNvdXJjZSkpIFwiQ2FuIG9ubHkgYXNzb2Mgb24gZGljdGlvbmFyaWVzXCIpXG4gIChjb25qIHNvdXJjZSAoYXBwbHkgZGljdGlvbmFyeSBrZXktdmFsdWVzKSkpXG5cbihkZWZuIGNvbmNhdFxuICBcIlJldHVybnMgbGlzdCByZXByZXNlbnRpbmcgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlIGVsZW1lbnRzIGluIHRoZVxuICBzdXBwbGllZCBsaXN0cy5cIlxuICBbJiBzZXF1ZW5jZXNdXG4gIChyZXZlcnNlXG4gICAgKHJlZHVjZVxuICAgICAgKGZuIFtyZXN1bHQgc2VxdWVuY2VdXG4gICAgICAgIChyZWR1Y2VcbiAgICAgICAgICAoZm4gW3Jlc3VsdCBpdGVtXSAoY29ucyBpdGVtIHJlc3VsdCkpXG4gICAgICAgICAgcmVzdWx0XG4gICAgICAgICAgKHNlcSBzZXF1ZW5jZSkpKVxuICAgICAgJygpXG4gICAgICBzZXF1ZW5jZXMpKSlcblxuKGRlZm4gc2VxIFtzZXF1ZW5jZV1cbiAgKGNvbmQgKG5pbD8gc2VxdWVuY2UpIG5pbFxuICAgICAgICAob3IgKHZlY3Rvcj8gc2VxdWVuY2UpIChsaXN0PyBzZXF1ZW5jZSkgKGxhenktc2VxPyBzZXF1ZW5jZSkpIHNlcXVlbmNlXG4gICAgICAgIChzdHJpbmc/IHNlcXVlbmNlKSAoLmNhbGwgQXJyYXkucHJvdG90eXBlLnNsaWNlIHNlcXVlbmNlKVxuICAgICAgICAoZGljdGlvbmFyeT8gc2VxdWVuY2UpIChrZXktdmFsdWVzIHNlcXVlbmNlKVxuICAgICAgICA6ZGVmYXVsdCAodGhyb3cgKFR5cGVFcnJvciAoc3RyIFwiQ2FuIG5vdCBzZXEgXCIgc2VxdWVuY2UpKSkpKVxuXG4oZGVmbiBzZXE/IFtzZXF1ZW5jZV1cbiAgKG9yIChsaXN0PyBzZXF1ZW5jZSlcbiAgICAgIChsYXp5LXNlcT8gc2VxdWVuY2UpKSlcblxuKGRlZm4tIGxpc3QtPnZlY3RvciBbc291cmNlXVxuICAobG9vcCBbcmVzdWx0IFtdXG4gICAgICAgICBsaXN0IHNvdXJjZV1cbiAgICAoaWYgKGVtcHR5PyBsaXN0KVxuICAgICAgcmVzdWx0XG4gICAgICAocmVjdXJcbiAgICAgICAgKGRvICgucHVzaCByZXN1bHQgKGZpcnN0IGxpc3QpKSByZXN1bHQpXG4gICAgICAgIChyZXN0IGxpc3QpKSkpKVxuXG4oZGVmbiB2ZWNcbiAgXCJDcmVhdGVzIGEgbmV3IHZlY3RvciBjb250YWluaW5nIHRoZSBjb250ZW50cyBvZiBzZXF1ZW5jZVwiXG4gIFtzZXF1ZW5jZV1cbiAgKGNvbmQgKG5pbD8gc2VxdWVuY2UpIFtdXG4gICAgICAgICh2ZWN0b3I/IHNlcXVlbmNlKSBzZXF1ZW5jZVxuICAgICAgICAobGlzdD8gc2VxdWVuY2UpIChsaXN0LT52ZWN0b3Igc2VxdWVuY2UpXG4gICAgICAgIDplbHNlICh2ZWMgKHNlcSBzZXF1ZW5jZSkpKSlcblxuKGRlZm4gc29ydFxuICBcIlJldHVybnMgYSBzb3J0ZWQgc2VxdWVuY2Ugb2YgdGhlIGl0ZW1zIGluIGNvbGwuXG4gIElmIG5vIGNvbXBhcmF0b3IgaXMgc3VwcGxpZWQsIHVzZXMgY29tcGFyZS5cIlxuICBbZiBpdGVtc11cbiAgKGxldCBbaGFzLWNvbXBhcmF0b3IgKGZuPyBmKVxuICAgICAgICBpdGVtcyAoaWYgKGFuZCAobm90IGhhcy1jb21wYXJhdG9yKSAobmlsPyBpdGVtcykpIGYgaXRlbXMpXG4gICAgICAgIGNvbXBhcmUgKGlmIGhhcy1jb21wYXJhdG9yIChmbiBbYSBiXSAoaWYgKGYgYSBiKSAwIDEpKSldXG4gICAgKGNvbmQgKG5pbD8gaXRlbXMpICcoKVxuICAgICAgICAgICh2ZWN0b3I/IGl0ZW1zKSAoLnNvcnQgaXRlbXMgY29tcGFyZSlcbiAgICAgICAgICAobGlzdD8gaXRlbXMpIChhcHBseSBsaXN0ICguc29ydCAodmVjIGl0ZW1zKSBjb21wYXJlKSlcbiAgICAgICAgICAoZGljdGlvbmFyeT8gaXRlbXMpICguc29ydCAoc2VxIGl0ZW1zKSBjb21wYXJlKVxuICAgICAgICAgIDplbHNlIChzb3J0IGYgKHNlcSBpdGVtcykpKSkpXG5cblxuKGRlZm4gcmVwZWF0XG4gIFwiUmV0dXJucyBhIHZlY3RvciBvZiBnaXZlbiBgbmAgbGVuZ3RoIHdpdGggb2YgZ2l2ZW4gYHhgXG4gIGl0ZW1zLiBOb3QgY29tcGF0aWJsZSB3aXRoIGNsb2p1cmUgYXMgaXQncyBub3QgYSBsYXp5XG4gIGFuZCBvbmx5IGZpbml0ZSByZXBlYXRzIGFyZSBzdXBwb3J0ZWRcIlxuICBbbiB4XVxuICAobG9vcCBbbiBuXG4gICAgICAgICByZXN1bHQgW11dXG4gICAgKGlmICg8PSBuIDApXG4gICAgICByZXN1bHRcbiAgICAgIChyZWN1ciAoZGVjIG4pXG4gICAgICAgICAgICAgKGNvbmogcmVzdWx0IHgpKSkpKVxuXG4oZGVmbiBldmVyeT9cbiAgW3ByZWRpY2F0ZSBzZXF1ZW5jZV1cbiAgKC5ldmVyeSAodmVjIHNlcXVlbmNlKSAjKHByZWRpY2F0ZSAlKSkpXG5cbihkZWZuIHNvbWVcbiAgXCJSZXR1cm5zIHRoZSBmaXJzdCBsb2dpY2FsIHRydWUgdmFsdWUgb2YgKHByZWQgeCkgZm9yIGFueSB4IGluIGNvbGwsXG4gIGVsc2UgbmlsLiAgT25lIGNvbW1vbiBpZGlvbSBpcyB0byB1c2UgYSBzZXQgYXMgcHJlZCwgZm9yIGV4YW1wbGVcbiAgdGhpcyB3aWxsIHJldHVybiA6ZnJlZCBpZiA6ZnJlZCBpcyBpbiB0aGUgc2VxdWVuY2UsIG90aGVyd2lzZSBuaWw6XG4gIChzb21lIGV2ZW4/IFsxIDNdKSA9PiBmYWxzZVxuICAoc29tZSBldmVuPyBbMSAyIDMgNF0gPT4gdHJ1ZVwiXG4gIFtwcmVkaWNhdGUgc2VxdWVuY2VdXG4gIChsb29wIFtpdGVtcyBzZXF1ZW5jZV1cbiAgICAoY29uZCAoZW1wdHk/IGl0ZW1zKSBmYWxzZVxuICAgICAgICAgIChwcmVkaWNhdGUgKGZpcnN0IGl0ZW1zKSkgdHJ1ZVxuICAgICAgICAgIDplbHNlIChyZWN1ciAocmVzdCBpdGVtcykpKSkpXG5cblxuKGRlZm4gcGFydGl0aW9uXG4gIChbbiBjb2xsXSAocGFydGl0aW9uIG4gbiBjb2xsKSlcbiAgKFtuIHN0ZXAgY29sbF0gKHBhcnRpdGlvbiBuIHN0ZXAgW10gY29sbCkpXG4gIChbbiBzdGVwIHBhZCBjb2xsXVxuICAgKGxvb3AgW3Jlc3VsdCBbXVxuICAgICAgICAgIGl0ZW1zIChzZXEgY29sbCldXG4gICAgIChsZXQgW2NodW5rICh0YWtlIG4gaXRlbXMpXG4gICAgICAgICAgIHNpemUgKGNvdW50IGNodW5rKV1cbiAgICAgICAoY29uZCAoaWRlbnRpY2FsPyBzaXplIG4pIChyZWN1ciAoY29uaiByZXN1bHQgY2h1bmspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGRyb3Agc3RlcCBpdGVtcykpXG4gICAgICAgICAgICAgKGlkZW50aWNhbD8gMCBzaXplKSByZXN1bHRcbiAgICAgICAgICAgICAoPiBuICgrIHNpemUgKGNvdW50IHBhZCkpKSByZXN1bHRcbiAgICAgICAgICAgICA6ZWxzZSAoY29uaiByZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAodGFrZSBuICh2ZWMgKGNvbmNhdCBjaHVua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZCkpKSkpKSkpKVxuXG4oZGVmbiBpbnRlcmxlYXZlXG4gIChbYXggYnhdXG4gICAobG9vcCBbY3ggW11cbiAgICAgICAgICBheCBheFxuICAgICAgICAgIGJ4IGJ4XVxuICAgICAoaWYgKG9yIChlbXB0eT8gYXgpXG4gICAgICAgICAgICAgKGVtcHR5PyBieCkpXG4gICAgICAgKHNlcSBjeClcbiAgICAgICAocmVjdXIgKGNvbmogY3hcbiAgICAgICAgICAgICAgICAgICAgKGZpcnN0IGF4KVxuICAgICAgICAgICAgICAgICAgICAoZmlyc3QgYngpKVxuICAgICAgICAgICAgICAocmVzdCBheClcbiAgICAgICAgICAgICAgKHJlc3QgYngpKSkpKVxuICAoWyYgc2VxdWVuY2VzXVxuICAgKGxvb3AgW3Jlc3VsdCBbXVxuICAgICAgICAgIHNlcXVlbmNlcyBzZXF1ZW5jZXNdXG4gICAgIChpZiAoc29tZSBlbXB0eT8gc2VxdWVuY2VzKVxuICAgICAgIHJlc3VsdFxuICAgICAgIChyZWN1ciAoY29uY2F0IHJlc3VsdCAobWFwIGZpcnN0IHNlcXVlbmNlcykpXG4gICAgICAgICAgICAgIChtYXAgcmVzdCBzZXF1ZW5jZXMpKSkpKSlcblxuKGRlZm4gbnRoXG4gIFwiUmV0dXJucyBudGggaXRlbSBvZiB0aGUgc2VxdWVuY2VcIlxuICBbc2VxdWVuY2UgaW5kZXggbm90LWZvdW5kXVxuICAoY29uZCAobmlsPyBzZXF1ZW5jZSkgbm90LWZvdW5kXG4gICAgICAgIChsaXN0PyBzZXF1ZW5jZSkgKGlmICg8IGluZGV4IChjb3VudCBzZXF1ZW5jZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoZmlyc3QgKGRyb3AgaW5kZXggc2VxdWVuY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90LWZvdW5kKVxuICAgICAgICAob3IgKHZlY3Rvcj8gc2VxdWVuY2UpXG4gICAgICAgICAgICAoc3RyaW5nPyBzZXF1ZW5jZSkpIChpZiAoPCBpbmRleCAoY291bnQgc2VxdWVuY2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChhZ2V0IHNlcXVlbmNlIGluZGV4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdC1mb3VuZClcbiAgICAgICAgKGxhenktc2VxPyBzZXF1ZW5jZSkgKG50aCAobGF6eS1zZXEtdmFsdWUgc2VxdWVuY2UpIGluZGV4IG5vdC1mb3VuZClcbiAgICAgICAgOmVsc2UgKHRocm93IChUeXBlRXJyb3IgXCJVbnN1cHBvcnRlZCB0eXBlXCIpKSkpXG4iXX0=

},{"./runtime":33}],35:[function(require,module,exports){
{
    var _ns_ = {
            id: 'wisp.string',
            doc: void 0
        };
    var wisp_runtime = require('./runtime');
    var str = wisp_runtime.str;
    var subs = wisp_runtime.subs;
    var reMatches = wisp_runtime.reMatches;
    var isNil = wisp_runtime.isNil;
    var isString = wisp_runtime.isString;
    var wisp_sequence = require('./sequence');
    var vec = wisp_sequence.vec;
    var isEmpty = wisp_sequence.isEmpty;
}
var split = exports.split = function split(string, pattern, limit) {
        return string.split(pattern, limit);
    };
var join = exports.join = function join() {
        switch (arguments.length) {
        case 1:
            var coll = arguments[0];
            return str.apply(void 0, vec(coll));
        case 2:
            var separator = arguments[0];
            var coll = arguments[1];
            return vec(coll).join(separator);
        default:
            throw RangeError('Wrong number of arguments passed');
        }
    };
var upperCase = exports.upperCase = function upperCase(string) {
        return string.toUpperCase();
    };
var upperCase = exports.upperCase = function upperCase(string) {
        return string.toUpperCase();
    };
var lowerCase = exports.lowerCase = function lowerCase(string) {
        return string.toLowerCase();
    };
var capitalize = exports.capitalize = function capitalize(string) {
        return count(string) < 2 ? upperCase(string) : '' + upperCase(subs(s, 0, 1)) + lowerCase(subs(s, 1));
    };
var replace = exports.replace = function replace(string, match, replacement) {
        return string.replace(match, replacement);
    };
var __LEFTSPACES__ = exports.__LEFTSPACES__ = /^\s\s*/;
var __RIGHTSPACES__ = exports.__RIGHTSPACES__ = /\s\s*$/;
var __SPACES__ = exports.__SPACES__ = /^\s\s*$/;
var triml = exports.triml = isNil(''.trimLeft) ? function (string) {
        return string.replace(__LEFTSPACES__, '');
    } : function (string) {
        return string.trimLeft();
    };
var trimr = exports.trimr = isNil(''.trimRight) ? function (string) {
        return string.replace(__RIGHTSPACES__, '');
    } : function (string) {
        return string.trimRight();
    };
var trim = exports.trim = isNil(''.trim) ? function (string) {
        return string.replace(__LEFTSPACES__).replace(__RIGHTSPACES__);
    } : function (string) {
        return string.trim();
    };
var isBlank = exports.isBlank = function isBlank(string) {
        return isNil(string) || isEmpty(string) || reMatches(__SPACES__, string);
    };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpc3Avc3RyaW5nLndpc3AiXSwibmFtZXMiOlsic3RyIiwic3VicyIsInJlTWF0Y2hlcyIsImlzTmlsIiwiaXNTdHJpbmciLCJ2ZWMiLCJpc0VtcHR5Iiwic3BsaXQiLCJzdHJpbmciLCJwYXR0ZXJuIiwibGltaXQiLCJqb2luIiwiY29sbCIsInNlcGFyYXRvciIsInVwcGVyQ2FzZSIsInRvVXBwZXJDYXNlIiwibG93ZXJDYXNlIiwidG9Mb3dlckNhc2UiLCJjYXBpdGFsaXplIiwiY291bnQiLCJzIiwicmVwbGFjZSIsIm1hdGNoIiwicmVwbGFjZW1lbnQiLCJfX0xFRlRTUEFDRVNfXyIsIl9fUklHSFRTUEFDRVNfXyIsIl9fU1BBQ0VTX18iLCJ0cmltbCIsInRyaW1MZWZ0IiwidHJpbXIiLCJ0cmltUmlnaHQiLCJ0cmltIiwiaXNCbGFuayJdLCJtYXBwaW5ncyI6IkFBQUE7STs7O1VBQUE7SSx3Q0FBQTtJLElBQ2tDQSxHQUFBLEcsYUFBQUEsRyxDQURsQztJLElBQ3NDQyxJQUFBLEcsYUFBQUEsSSxDQUR0QztJLElBQzJDQyxTQUFBLEcsYUFBQUEsUyxDQUQzQztJLElBQ3NEQyxLQUFBLEcsYUFBQUEsSyxDQUR0RDtJLElBQzJEQyxRQUFBLEcsYUFBQUEsUSxDQUQzRDtJLDBDQUFBO0ksSUFFbUNDLEdBQUEsRyxjQUFBQSxHLENBRm5DO0ksSUFFdUNDLE9BQUEsRyxjQUFBQSxPLENBRnZDO0M7QUFJQSxJQUFNQyxLQUFBLEcsUUFBQUEsSyxHQUFOLFNBQU1BLEtBQU4sQ0FHR0MsTUFISCxFQUdVQyxPQUhWLEVBR2tCQyxLQUhsQixFO1FBSUUsT0FBUUYsTUFBUCxDQUFDRCxLQUFGLENBQWVFLE9BQWYsRUFBdUJDLEtBQXZCLEU7S0FKRixDO0FBTUEsSUFBTUMsSUFBQSxHLFFBQUFBLEksR0FBTixTQUFNQSxJQUFOLEc7OztnQkFHSUMsSUFBQSxHO1lBQ0MsT0FBT1osRyxNQUFQLEMsTUFBQSxFQUFZSyxHQUFELENBQUtPLElBQUwsQ0FBWCxFOztnQkFDREMsU0FBQSxHO2dCQUFVRCxJQUFBLEc7WUFDVCxPQUFRUCxHQUFELENBQUtPLElBQUwsQ0FBTixDQUFDRCxJQUFGLENBQWtCRSxTQUFsQixFOzs7O0tBTkwsQztBQVFBLElBQU1DLFNBQUEsRyxRQUFBQSxTLEdBQU4sU0FBTUEsU0FBTixDQUVHTixNQUZILEU7UUFHRSxPQUFjQSxNQUFiLENBQUNPLFdBQUYsRztLQUhGLEM7QUFLQSxJQUFNRCxTQUFBLEcsUUFBQUEsUyxHQUFOLFNBQU1BLFNBQU4sQ0FFR04sTUFGSCxFO1FBR0UsT0FBY0EsTUFBYixDQUFDTyxXQUFGLEc7S0FIRixDO0FBS0EsSUFBTUMsU0FBQSxHLFFBQUFBLFMsR0FBTixTQUFNQSxTQUFOLENBRUdSLE1BRkgsRTtRQUdFLE9BQWNBLE1BQWIsQ0FBQ1MsV0FBRixHO0tBSEYsQztBQUtBLElBQWNDLFVBQUEsRyxRQUFBQSxVLEdBQWQsU0FBY0EsVUFBZCxDQUdHVixNQUhILEU7UUFJRSxPQUFRVyxLQUFELENBQU9YLE1BQVAsQ0FBSCxHLENBQUosR0FDS00sU0FBRCxDQUFZTixNQUFaLENBREosRyxLQUVVTSxTQUFELENBQWFiLElBQUQsQ0FBTW1CLENBQU4sRSxDQUFBLEUsQ0FBQSxDQUFaLENBQUwsR0FDTUosU0FBRCxDQUFhZixJQUFELENBQU1tQixDQUFOLEUsQ0FBQSxDQUFaLENBSFQsQztLQUpGLEM7QUFTQSxJQUFNQyxPQUFBLEcsUUFBQUEsTyxHQUFOLFNBQU1BLE9BQU4sQ0FVR2IsTUFWSCxFQVVVYyxLQVZWLEVBVWdCQyxXQVZoQixFO1FBV0UsT0FBVWYsTUFBVCxDQUFDYSxPQUFGLENBQWlCQyxLQUFqQixFQUF1QkMsV0FBdkIsRTtLQVhGLEM7QUFzQkEsSUFBS0MsY0FBQSxHLFFBQUFBLGMsR0FBZ0IsUUFBckIsQztBQUNBLElBQUtDLGVBQUEsRyxRQUFBQSxlLEdBQWlCLFFBQXRCLEM7QUFDQSxJQUFLQyxVQUFBLEcsUUFBQUEsVSxHQUFXLFNBQWhCLEM7QUFHQSxJQUdFQyxLQUFBLEcsUUFBQUEsSyxHQUNLeEIsS0FBRCxDLEVBQU0sQ0FBR3lCLFFBQVQsQ0FBSixHQUNFLFVBQUtwQixNQUFMLEU7UUFBYSxPQUFVQSxNQUFULENBQUNhLE9BQUYsQ0FBaUJHLGNBQWpCLEUsRUFBQSxFO0tBRGYsR0FFRSxVQUFLaEIsTUFBTCxFO1FBQWEsT0FBV0EsTUFBVixDQUFDb0IsUUFBRixHO0tBTmpCLEM7QUFRQSxJQUdFQyxLQUFBLEcsUUFBQUEsSyxHQUNLMUIsS0FBRCxDLEVBQU0sQ0FBRzJCLFNBQVQsQ0FBSixHQUNFLFVBQUt0QixNQUFMLEU7UUFBYSxPQUFVQSxNQUFULENBQUNhLE9BQUYsQ0FBaUJJLGVBQWpCLEUsRUFBQSxFO0tBRGYsR0FFRSxVQUFLakIsTUFBTCxFO1FBQWEsT0FBWUEsTUFBWCxDQUFDc0IsU0FBRixHO0tBTmpCLEM7QUFRQSxJQUdFQyxJQUFBLEcsUUFBQUEsSSxHQUNLNUIsS0FBRCxDLEVBQU0sQ0FBRzRCLElBQVQsQ0FBSixHQUNFLFVBQUt2QixNQUFMLEU7UUFBYSxPQUFvQkEsTUFBVCxDQUFDYSxPQUFGLENBQWlCRyxjQUFqQixDQUFULENBQUNILE9BQUYsQ0FBNENJLGVBQTVDLEU7S0FEZixHQUVFLFVBQUtqQixNQUFMLEU7UUFBYSxPQUFPQSxNQUFOLENBQUN1QixJQUFGLEc7S0FOakIsQztBQVFBLElBQU1DLE9BQUEsRyxRQUFBQSxPLEdBQU4sU0FBTUEsT0FBTixDQUVHeEIsTUFGSCxFO1FBR0UsT0FBS0wsS0FBRCxDQUFNSyxNQUFOLEMsSUFDQ0YsT0FBRCxDQUFRRSxNQUFSLENBREosSUFFS04sU0FBRCxDQUFZd0IsVUFBWixFQUF1QmxCLE1BQXZCLENBRkosQztLQUhGIiwic291cmNlc0NvbnRlbnQiOlsiKG5zIHdpc3Auc3RyaW5nXG4gICg6cmVxdWlyZSBbd2lzcC5ydW50aW1lIDpyZWZlciBbc3RyIHN1YnMgcmUtbWF0Y2hlcyBuaWw/IHN0cmluZz9dXVxuICAgICAgICAgICAgW3dpc3Auc2VxdWVuY2UgOnJlZmVyIFt2ZWMgZW1wdHk/XV0pKVxuXG4oZGVmbiBzcGxpdFxuICBcIlNwbGl0cyBzdHJpbmcgb24gYSByZWd1bGFyIGV4cHJlc3Npb24uICBPcHRpb25hbCBhcmd1bWVudCBsaW1pdCBpc1xuICB0aGUgbWF4aW11bSBudW1iZXIgb2Ygc3BsaXRzLiBOb3QgbGF6eS4gUmV0dXJucyB2ZWN0b3Igb2YgdGhlIHNwbGl0cy5cIlxuICBbc3RyaW5nIHBhdHRlcm4gbGltaXRdXG4gICguc3BsaXQgc3RyaW5nIHBhdHRlcm4gbGltaXQpKVxuXG4oZGVmbiBqb2luXG4gIFwiUmV0dXJucyBhIHN0cmluZyBvZiBhbGwgZWxlbWVudHMgaW4gY29sbCwgYXMgcmV0dXJuZWQgYnkgKHNlcSBjb2xsKSxcbiAgIHNlcGFyYXRlZCBieSBhbiBvcHRpb25hbCBzZXBhcmF0b3IuXCJcbiAgKFtjb2xsXVxuICAgICAoYXBwbHkgc3RyICh2ZWMgY29sbCkpKVxuICAoW3NlcGFyYXRvciBjb2xsXVxuICAgICAoLmpvaW4gKHZlYyBjb2xsKSBzZXBhcmF0b3IpKSlcblxuKGRlZm4gdXBwZXItY2FzZVxuICBcIkNvbnZlcnRzIHN0cmluZyB0byBhbGwgdXBwZXItY2FzZS5cIlxuICBbc3RyaW5nXVxuICAoLnRvVXBwZXJDYXNlIHN0cmluZykpXG5cbihkZWZuIHVwcGVyLWNhc2VcbiAgXCJDb252ZXJ0cyBzdHJpbmcgdG8gYWxsIHVwcGVyLWNhc2UuXCJcbiAgW3N0cmluZ11cbiAgKC50b1VwcGVyQ2FzZSBzdHJpbmcpKVxuXG4oZGVmbiBsb3dlci1jYXNlXG4gIFwiQ29udmVydHMgc3RyaW5nIHRvIGFsbCBsb3dlci1jYXNlLlwiXG4gIFtzdHJpbmddXG4gICgudG9Mb3dlckNhc2Ugc3RyaW5nKSlcblxuKGRlZm4gXlN0cmluZyBjYXBpdGFsaXplXG4gIFwiQ29udmVydHMgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBzdHJpbmcgdG8gdXBwZXItY2FzZSwgYWxsIG90aGVyXG4gIGNoYXJhY3RlcnMgdG8gbG93ZXItY2FzZS5cIlxuICBbc3RyaW5nXVxuICAoaWYgKDwgKGNvdW50IHN0cmluZykgMilcbiAgICAgICh1cHBlci1jYXNlIHN0cmluZylcbiAgICAgIChzdHIgKHVwcGVyLWNhc2UgKHN1YnMgcyAwIDEpKVxuICAgICAgICAgICAobG93ZXItY2FzZSAoc3VicyBzIDEpKSkpKVxuXG4oZGVmbiByZXBsYWNlXG4gIFwiUmVwbGFjZXMgYWxsIGluc3RhbmNlIG9mIG1hdGNoIHdpdGggcmVwbGFjZW1lbnQgaW4gcy5cblxuICAgbWF0Y2gvcmVwbGFjZW1lbnQgY2FuIGJlOlxuXG4gICBzdHJpbmcgLyBzdHJpbmdcbiAgIGNoYXIgLyBjaGFyXG4gICBwYXR0ZXJuIC8gKHN0cmluZyBvciBmdW5jdGlvbiBvZiBtYXRjaCkuXG5cbiAgIFNlZSBhbHNvIHJlcGxhY2UtZmlyc3QuXCJcbiAgW3N0cmluZyBtYXRjaCByZXBsYWNlbWVudF1cbiAgKC5yZXBsYWNlIHN0cmluZyBtYXRjaCByZXBsYWNlbWVudCkpXG5cblxuOyhkZWYgKipXSElURVNQQUNFKiogKHN0ciBcIltcXHgwOVxceDBBXFx4MEJcXHgwQ1xceDBEXFx4MjBcXHhBMFxcdTE2ODBcXHUxODBFXFx1MjAwMFwiXG47ICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XCJcbjsgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx1MjAwOVxcdTIwMEFcXHUyMDJGXFx1MjA1RlxcdTMwMDBcXHUyMDI4XFx1MjAyOVxcdUZFRkZdXCIpKVxuOyhkZWYgKipMRUZULVNQQUNFUyoqIChyZS1wYXR0ZXJuIChzdHIgXCJeXCIgKipXSElURVNQQUNFKiogKipXSElURVNQQUNFKiogXCIqXCIpKSlcbjsoZGVmICoqUklHSFQtU1BBQ0VTKiogKHJlLXBhdHRlcm4gKHN0ciAqKldISVRFU1BBQ0UqKiAqKldISVRFU1BBQ0UqKiBcIiokXCIpKSlcbjsoZGVmICoqU1BBQ0VTKiogKHJlLXBhdHRlcm4gKHN0ciBcIl5cIiAqKldISVRFU1BBQ0UqKiBcIiokXCIpKSlcblxuXG4oZGVmICoqTEVGVC1TUEFDRVMqKiAjXCJeXFxzXFxzKlwiKVxuKGRlZiAqKlJJR0hULVNQQUNFUyoqICNcIlxcc1xccyokXCIpXG4oZGVmICoqU1BBQ0VTKiogI1wiXlxcc1xccyokXCIpXG5cblxuKGRlZlxuICBeezp0YWcgc3RyaW5nXG4gICAgOmRvYyBcIlJlbW92ZXMgd2hpdGVzcGFjZSBmcm9tIHRoZSBsZWZ0IHNpZGUgb2Ygc3RyaW5nLlwifVxuICB0cmltbFxuICAoaWYgKG5pbD8gKC4tdHJpbUxlZnQgXCJcIikpXG4gICAgKGZuIFtzdHJpbmddICgucmVwbGFjZSBzdHJpbmcgKipMRUZULVNQQUNFUyoqIFwiXCIpKVxuICAgIChmbiBbc3RyaW5nXSAoLnRyaW1MZWZ0IHN0cmluZykpKSlcblxuKGRlZlxuICBeezp0YWcgc3RyaW5nXG4gICAgOmRvYyBcIlJlbW92ZXMgd2hpdGVzcGFjZSBmcm9tIHRoZSByaWdodCBzaWRlIG9mIHN0cmluZy5cIn1cbiAgdHJpbXJcbiAgKGlmIChuaWw/ICguLXRyaW1SaWdodCBcIlwiKSlcbiAgICAoZm4gW3N0cmluZ10gKC5yZXBsYWNlIHN0cmluZyAqKlJJR0hULVNQQUNFUyoqIFwiXCIpKVxuICAgIChmbiBbc3RyaW5nXSAoLnRyaW1SaWdodCBzdHJpbmcpKSkpXG5cbihkZWZcbiAgXns6dGFnIHN0cmluZ1xuICAgIDpkb2MgXCJSZW1vdmVzIHdoaXRlc3BhY2UgZnJvbSBib3RoIGVuZHMgb2Ygc3RyaW5nLlwifVxuICB0cmltXG4gIChpZiAobmlsPyAoLi10cmltIFwiXCIpKVxuICAgIChmbiBbc3RyaW5nXSAoLnJlcGxhY2UgKC5yZXBsYWNlIHN0cmluZyAqKkxFRlQtU1BBQ0VTKiopICoqUklHSFQtU1BBQ0VTKiopKVxuICAgIChmbiBbc3RyaW5nXSAoLnRyaW0gc3RyaW5nKSkpKVxuXG4oZGVmbiBibGFuaz9cbiAgXCJUcnVlIGlmIHMgaXMgbmlsLCBlbXB0eSwgb3IgY29udGFpbnMgb25seSB3aGl0ZXNwYWNlLlwiXG4gIFtzdHJpbmddXG4gIChvciAobmlsPyBzdHJpbmcpXG4gICAgICAoZW1wdHk/IHN0cmluZylcbiAgICAgIChyZS1tYXRjaGVzICoqU1BBQ0VTKiogc3RyaW5nKSkpXG4iXX0=

},{"./runtime":33,"./sequence":34}]},{},[1])
;