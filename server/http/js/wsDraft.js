/* globals: sendCTOS, parseSTOC, getClientData */

var SALVATION_WSS = 'wss://ygopro.us:24555',
    sockLoaded = false,
    abort = false,
    sock = new WebSocket(SALVATION_WSS),
    maxTries = 100, // wait maxTries * 200 ms before aborting
    whenSockLoad = function (callback, sockInstance) {
        var interval = setInterval(function () {
                if (sockInstance.readyState === 1) {
                    callback();
                    maxTries = 100;
                    clearInterval(interval);
                } else {
                    if (maxTries-- < 0) {
                        abort = true;
                        clearInterval(interval);
                        sockInstance.close(4000, 'No connection established');
                    }
                }
            }, 200);
    };
sock.onopen = function (event) {
    sock.send(sendCTOS(instanceData));
};
sock.onmessage = function (event) {
    whenSockLoad(function () {
        var stocResponse = parseSTOC(event.data);
        if (stocResponse.hasSideEffects) {
            return;
        }
        if (stocResponse.requiresData) {
            getClientData(stocResponse);
        }
    }, sock);
};