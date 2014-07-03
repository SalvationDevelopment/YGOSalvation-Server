/* jslint node:true */

/* supported data types, and the number of bytes to read/write for each. */
var dataMap = {
    'char': 1,
    'signed char': 1,
    'unsigned char': 1,
    'short': 2,
    'short int': 2,
    'signed short': 2,
    'signed short int': 2,
    'unsigned short': 2,
    'unsigned short int': 2,
    'int': 4,
    'signed int': 4,
    'long': 8,
    'long int': 8,
    'signed long': 8,
    'signed long int': 8,
    'unsigned long': 8,
    'unsigned long int': 8,
    'long long': 16,
    'long long int': 16,
    'signed long long': 16,
    'signed long long int': 16,
    'float': 8,
    'double': 16,
    'long double': 32
};

function structureDefinition(structure) {
    /* take the definition of the structure of the buffer/array you are decoding,
    then compare each value in it to see how big each 'data bucket' needs to be */
    var maxLength = 1;
    var names = [];
    for (var property in structure) {
        if (hasOwnProperty(property)) {
            names.push(property.toLowerCase());
            if (dataMap[structure[property].toLowerCase()] > maxLength) {
                maxLength = dataMap[structure[property].toLowerCase()];
            }
        }
    }
    /* Using the definition return a function that processes an inputed buffer and,
    outputs an object that follows/mirrors the structure defined with a proper naming,
    schema. Data is returned in buffer/arrays. */
    return {
        read: function (buffer) {
            var output = {};
            var readposition = 0;
            for (var i, items = names.length; items > i; i++) {
                var segment = buffer.slice(readposition, readposition + maxLength);
                output[names[i]] = segment.slice(0, dataMap[structure[names[i]].toLowerCase()]);
            }
        },
        write: function (jsStructure) {
            var output = [];
            for (var property in structure) {
                if (hasOwnProperty(property)) {
                    var data = jsStructure[property];
                    var segment = new Array(maxLength);
                    segment.fill(0);
                    for (var i = 0, items = data.length; items > i; i++) {
                        segment[i] = data[i];
                    }
                    output.concat(segment);
                }
            }
            return output;
        }
    };
}

/*export all this work to an nodejs/commonjs module so I/others can use it everywhere. */
module.exports.define = structureDefinition;

/* todo: add static typing */
