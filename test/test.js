/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
var assert = require("assert");

global.__base = __dirname + '/';

describe('Array', function(){
  
    it('Should start the server', function(){
      require('./server.js')
    })
 
});
