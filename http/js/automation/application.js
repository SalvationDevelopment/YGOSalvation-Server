/*jslint browser:true, plusplus : true, bitwise : true*/
/*globals WebSocket, Buffer, Uint8Array, enums, makeCard, recieveSTOC, CommandParser, Framemaker, makeCTOS, initiateNetwork*/
// card.js
// gui.js




var primusprotocol = (location.protocol === 'https:') ? "wss://" : "ws://",
    primus = window.Primus.connect(primusprotocol + location.host + ':8082');

primus.on('data', function(data) {
    console.log(data);
});