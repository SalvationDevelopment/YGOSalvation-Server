/* jslint node : true */

var structureDefinition = require('../objectifier.js');
var header = {
    test: 'char',
    long: 'long'
};
console.log("header", header);
var strut = structureDefinition(header);
var out = strut.write({
    test: 'a',
    long: "abcd    "
});
console.log("What a write returns", out);
var validate = strut.read(out);
console.log("validate", validate);
console.log(validate === {
    test: 1,
    long: 34
});
console.log(validate);