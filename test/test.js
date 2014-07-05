/* jshint node : true */
console.log('Running Test');


var parsePackets = require('../parsepacts.js');

var net = require('net');
var Primus = require('primus');
try {
    console.log('do this');
}catch(e){}

if (false){
    console.log('never do this.');
}