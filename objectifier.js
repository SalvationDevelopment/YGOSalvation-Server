/* jslint node:true */

/* supported data types, and the number of bytes to read/write for each. */
var dataMap = {
    'char': 1,
    'signed char': 1,
    'unsigned char': 1,
    'bool': 1,
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
    if (structure === undefined) {
        return;
    }
    /* take the definition of the structure of the buffer/array you are decoding,
    then compare each value in it to see how big each 'data bucket' needs to be */
    var maxLength = 1;
    var names = [];
    var iterationMap = [];
    for (var property in structure) {
        if (structure.hasOwnProperty(property)) {
            //            console.log(typeof (structure[property]), property)
            if (typeof (structure[property]) !== 'string') {
                names.push(property);
                iterationMap.push(structure[property][1]);
                if (dataMap[structure[property]] > maxLength) {
                    maxLength = dataMap[structure[property]];
                }
            }
            if (typeof (structure[property]) === 'string') {
                names.push(property);
                iterationMap.push(1);
                if (dataMap[structure[property]] > maxLength) {
                    maxLength = dataMap[structure[property]];
                }
            }

        }
    }
    //    console.log(iterationMap)
    /* Using the definition return a function that processes an inputed buffer and,
    outputs an object that follows/mirrors the structure defined with a proper naming,
    schema. Data is returned in buffer/arrays. */
    return {
        read: function (buffer) {
            if (buffer === undefined) {
                return;
            }
            var output = {};
            var readposition = 0;
            for (var i = 0, items = names.length; items > i; i++) {
                for (var j = 0, arrayItem = iterationMap[i]; arrayItem > j; j++) {
                    //                    console.log(j, i, dataMap[structure[names[i]]] * 2)
                    var segment = buffer.slice(readposition, (dataMap[structure[names[i]]] * 2)) || '';
                    output[names[i]] = segment.slice(0, dataMap[structure[names[i]]]).toString() || '';
                    readposition = readposition + maxLength;
                }
            }
            return output;
        },
        write: function (jsStructure) {
            if (jsStructure === undefined) {
                return;
            }
            var output = [];
            for (var property in structure) {
                var maxArrayLength = names.indexOf(property);
                if (structure.hasOwnProperty(property)) {
                    var data = new Buffer(jsStructure[property]);
                    var size = dataMap[structure[property]] || dataMap[structure[property][0]];
                    data = data.slice(0, (size * 2 * iterationMap[maxArrayLength]));
                    var insert;
                    for (var i = 0, items = maxLength; items > i; i++) {
                        insert = data[i];
                        output.push(insert);
                    }
                }
            }
            return new Buffer(output);
        }
    };
}

/*export all this work to an nodejs/commonjs module so I/others can use it everywhere. */
module.exports = structureDefinition;

/* todo: add static typing */