# frax

Frame extractor from data stream (e.g. TCP).

## Installation
    $ npm install frax

## Features
* Extracts frames delimited by frame header (frame length)
* Supports various frame header lengths (1, 2, 4 bytes)
* Frame header length 2 is equivalent to RFC 4571.

```text
+--+-------------+--+-------------+--+-------------+
|FH|   Frame 1   |FH|   Frame 2   |FH|   Frame 3   | ...
+--+-------------+--+-------------+--+-------------+
FH: Frame header contains frame length in bytes (big-endian)
    The length does not include the frame header itself.
Frame: Application data.
```

## API

### Module method
* create([headerLen])
Creates an instance of frax. The `headerLen` should either be 1, 2 or 4, or defaults to 2 otherwise.

### Instance method
* frax.input(buf) -
Input stream data. The `buf` is of type Buffer.
* frax.headerSize (getter) -
Returns frame header size used by the instance.
* frax.reset() -
Reset the internal state. Probably useless expect for test purposes.
* Event: 'data' -
Emitted when a complete frame is ready. The argument `buf` will be a Buffer.

## Example

```js
var frax = require('frax').create();

// Set up data event handler
frax.on('data', function (frame) {
    console.log('%d bytes of frame received', frame.length);
});

// Pass incoming data into frax directly.
soc.on('data', function (buf) {
    frax.input(buf);
});

```
