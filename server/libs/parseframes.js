/* jshint node : true */
var util         = require("util");
var EventEmitter = require("events").EventEmitter;

module.exports = function () {
    var memory = new Buffer([]);

    this.input = function (buffer) {
        var x = true;
        var output = [];
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

                output.push(recordOfBuffer.data);
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