/* jslint node : true */
var structureDefinition = require('../objectifier.js');

var structureDefinition = require('../objectifier.js');
var header = {
    test: 'char',
    long: 'long'
};
var strut = structureDefinition(header);
var out = strut.write({
    test: 'a',
    long: "abcd    "
});
var validate = strut.read(out);
console.log(validate.test.length, "a".length, true);
console.log(validate.long.length, "abcd    ".length, true);
console.log(validate.test, "a", true);
console.log(validate.long, "abcd    ", true);