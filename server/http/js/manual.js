/*global localStorage, $, Primus, console*/
function createmessage() {
    'use strict';
    return {
        command : '',
        identity : localStorage.username
    };
}

var manualconnection = Primus.connect(window.location.origin + ':24556');
manualconnection.on('data', function (data) {
    'use strict';
    console.log(data);
    
});
manualconnection.on('connect', function () {
    'use strict';
    console.log('!!!!!! connect');
});
manualconnection.on('close', function () {
    'use strict';
    console.log('!!!!!! close');
});

