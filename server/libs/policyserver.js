/*jslint node: true, plusplus: true*/
//https://github.com/3rd-Eden/FlashPolicyFileServer

var pf = require('policyfile').createServer(['ygopro.us:6667']);

pf.listen(843, function (error) {
    'use strict';
    if (error) {
        console.log('Policy Server Error:', error);
    } else {
        console.log('    Policy Server Online');
    }
});
pf.add('ygopro.us:9870');