/*jslint browser:true*/

function startgame(roompass) {
    'use strict';
    window.ws = new WebSocket("ws://192.99.11.19:8082", "duel");
    window.ws.binaryType = 'arraybuffer';
    var framer = new Framemaker();
    window.ws.onconnect = function () {


    };
    window.ws.onclose = function () {
        console.log('Websocket died');
    };
    window.ws.onmessage = function (data) {
        var q = new Buffer(new Uint8Array(data.data)),
            frame,
            task,
            newframes = 0,
            commands,
            l = 0,
            reply;


        frame = framer.input(q);
        for (newframes; frame.length > newframes; newframes++) {
            task = parsePackets('STOC', new Buffer(frame[newframes]));
            //console.log('!', task);
            commands = processTask(task);
            // process AI
            //console.log(task);
            l = 0;
            for (l; commands.length > l; l++) {
                processTask(commands[l]);
            }


        }
        frame = [];
    };
    window.ws.onopen = function () {
        console.log('Send Game request for', roompass);
        var name = makeCTOS('CTOS_PlayerInfo', 'Spectator'),
            join = makeCTOS('CTOS_JoinGame', roompass),
            tosend = Buffer.concat([name, join]);
        window.ws.send(tosend);
    };

}