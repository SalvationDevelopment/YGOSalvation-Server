/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
function custom_error(message) {
    'use strict';
    var output = {
        messagetype: 'custom_error',
        message: message
    };
    process.send(output);
}
module.exports = custom_error; 