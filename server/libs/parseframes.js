/* jshint node : true */

module.exports = function () {
    var memory = new Buffer([]);

    this.input = function (buffer) {
        var x = true;
        var output = [];
        while (x === true) {
            console.log('before', memory.length, 'bytes in memory');
            memory = Buffer.concat([memory, buffer]);
            console.log('concated', memory.length);
            var frame_length = memory[0] + memory[1];
            console.log('read', frame_length, 'of', memory.length, 'bytes');
            if ((memory.length - 2) < frame_length) {
                console.log('not enough');
                x = true;
            } else {
                var recordOfBuffer = memory.slice(2, frame_length).toJSON();
                console.log(recordOfBuffer.data.length);
                var frame = new Buffer(recordOfBuffer.data);
                output.push(frame);
                if (memory.length === (frame_length + 2)) {
                    memory = new Buffer([]);
                    x = false;
                } else {
                    memory = memory.slice((frame_length + 2));
                    this.input(new Buffer([]));
                }
                console.log('after', memory.length);
            }
        }
        return output;
    };
    return this;
};