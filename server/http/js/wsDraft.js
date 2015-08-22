var SALVATION_WSS = 'ws://ygopro.us:55542',
    ws = new WebSocket(SALVATION_WSS);

ws.onopen = function (event) {
    // ONOPEN: Auth again with uniqueID to the server
    ws.send(uniqueID + '[[SPLIT]]clientAuth');
};

ws.onmessage = function (event) {
    var message = event.data;
    console.log('Received server message: ', message);
};

ws.onerror = function (event) {
    console.log('WebSocket encountered an error');
    console.log('Event data', event);
    ws.close();
};
