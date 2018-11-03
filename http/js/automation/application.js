/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array, enums, makeCard, recieveSTOC, CommandParser, Framemaker, makeCTOS, initiateNetwork*/
// card.js
// gui.js




var primusprotocol = (location.protocol === 'https:') ? "wss://" : "ws://",
    primus = window.Primus.connect(primusprotocol + location.host);

primus.on('data', function(data) {
    console.log(data);
});

primus.on('open', function() {
    console.log('connected');
    primus.write({
        action: 'join',
        game: 'default_game'
    });
});

primus.on('error', function(error) {
    console.log('error', error);
});