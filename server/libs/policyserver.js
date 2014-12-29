/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
var path = '../configurations/policy.xml',
    net = require('net'),
    fs = require('fs');

var server = net.createServer(function (client) {
    'use strict';
    fs.read(path, function (policy) {
        client.write(policy);
        client.end();
    });
});

server.listen(843, function () { //'listening' listener
    'use strict';
    console.log('    Policy Server Online');
});