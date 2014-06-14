/* jshint node: true*/
try {
    require('httpsys').slipStream();
} catch (error) {
    console.log('Windows 8+ spefic enhancements not enabled.');
} finally {
    var unvarifiedUsers = {};
    var activeUsers = [];
    var activeGames = [];
    var fs = require('fs');
    var http = require('http');
    var https = require('https');
    var Primus = require('primus');
    var ws = require('ws');
    var irc = require('irc');
    var net = require('net');
    var findport = require('find-port');
    var limiter = require('connect-ratelimit');
    var connection;
    var client;
    var enums = require('./enums.js');
}

var run = { in : {
        console: require('child_process').exec(),
        gui: require('child_process').execFile
    }
};
var ygopro_path = {
    tcg: 'calc',
    ocg: 'private/ocg/ygocore.exe',
};

var ircbot = new irc.Client('salvationdevelopment.com', 'DuelServer', {
    channels: ['#lobby'],
    debug: true
});


var server = http.createServer().listen(5000, '127.0.0.1');
var primus = new Primus(server, {
    parser: 'JSON'
});
//primus.before('connect-ratelimit', function () {
//    limiter({
//        whitelist: ['127.0.0.1'],
//        blacklist: ['example.com']
//    });
//});
primus.save(__dirname + '/primus.js');
primus.on('connection', function (client) {
    client.on('data', function (data) {
        console.log(data);
        switch (data.serverEvent) {

        case ('joinActiveGames'):
            {
                client.join('activeGames');
                break;
            }

        case ('leaveActiveGames'):
            {
                client.leave('activeGames');
                break;
            }
        case ('core'):
            {
                connection.write(data.data);
                break;
            }

        case ('hostGame'):
            {

                findgame(data.format, client);
                break;
            }
        }

        function updateActiveGames(gameid, gameinfo) {
            activeGames[gameid] = gameinfo;
            client.broadcast. in ('activeGames').emit('activeGames', {
                activeGames: activeGames
            });
        }




    });
    client.on('end', function () {
        delete activeUsers[client.username];
    });
});
primus.on('disconnection', function (spark) {
    // the spark that disconnected
});

function findgame(format, client) {
    client.write({
        hostGame: {
            timeout: new Date().toISOString(),
            data:activeGames
        }
    });
    for (var i = 0; activeGames.length > i; i++) {
        if (activeGames.started === false) {


            joingame(format, client, activeGames.port);
            //found a game, break out the loop.
            break;
        } else {
            if (activeGames.length === i) {
                client.write({
                    error: 'no free cores, one moment'
                });
            }
        }
    }
}


function joingame(format, client, port) {
    var connection;
    connection = net.connect(port);
    connection.setEncoding('hex');
    connection.on('connect', function () {
        client.write({
            'command': 'duelMode',
            'type': 'internal',
            'port': port
        });
    });
    connection.on('data', function (data) {
        parsePackets(data);
        client.write({
            'core': data
        });
    });
}

function spinUpGame(format, client) {

    findport(8000, 9000, rungame);
    //take micro move to next line, mills to start a game, a problem exist here,....
    var rungame = function (ports) {
        run. in .gui(ygopro_path[format], ports[0]);
        var game = {
            'started': false,
            'format': format,
            'port': ports[0]
        };
        activeGames.push(game);
        if (client) {
            joingame(format, client, ports[0]);
        }
    };

}





primus.on('disconnection', function (client) {
    // the client that disconnected
});



function parsePackets(message) {
    var buffer_read_position = 0;
    //console.log(message)
    //The message is stripped and turned into a normal packet so we can understand it as:
    //{length, +length, type of message, the message itself }
    //the server may send more than one at a time so lets take it one at a time.
    while (buffer_read_position < message.length) {
        var read = message[buffer_read_position] + message[(buffer_read_position + 1)];
        var packet = {
            LENGTH: read,
            STOC: enums[message[(buffer_read_position + 2)]] || message[(buffer_read_position + 2)],
            message: message.slice((buffer_read_position + 3), (buffer_read_position + 1 + read)),
            readposition: 0
        };
        packet = RecieveCommunication(packet);
        buffer_read_position = buffer_read_position + 2 + read;
    }
    //console.log(buffer_read_position, message.length, "Equal means nothing bad happened");
}
var debug = {};

function RecieveCommunication(packet) {
    console.log(packet);
    switch (packet.STOC) {

    case ('STOC_GAME_MSG'):
        {
            //game data dont need to process
            return false;
        }
        break;
    case ('STOC_ERROR_MSG'):
        {
            //game died, recover it!
            return 'die';
        }
        break;
    case ('STOC_SELECT_HAND'):
        {
            //play rps
            return false;
        }
        break;
    case ('STOC_HAND_RESULT'):
        {
            //rps result
            return false;
        }
        break;
    case ('STOC_CHANGE_SIDE'):
        {
            //side decking
            return false;
        }
        break;
    case ('STOC_WAITING_SIDE'):
        {
            //waiting on side decking.
            return false;
        }
        break;
    case ('STOC_CREATE_GAME'):
        {

        }
        break;
    case ('STOC_TYPE_CHANGE'):
        {

        }
        break;
    case ('STOC_LEAVE_GAME'):
        {
            //Player left the game
            return 'remove player' + packet;
        }
        break;
    case ('STOC_DUEL_START'):
        {
            //Game started
            connection.write([0x00, 0x01, 0x26]);
        }
        break;

    case ('STOC_REPLAY'):
        {
            // catch this packet and do ranking on it.
            return 'replay';
        }
        break;
    case ('STOC_TIME_LIMIT'):
        {
            // User went over time.
            return false;
        }
        break;
    case ('STOC_CHAT'):
        {
            // A user said something, we should record this.
            return 'chat';
        }
        break;
    case ('STOC_HS_PLAYER_ENTER'):
        {
            //A player entered the duel
            return 'player connected';
        }
        break;
    case ('STOC_HS_PLAYER_CHANGE'):
        {
            //A player swaped places
            return 'player swap';
        }
        break;
    case ('STOC_HS_WATCH_CHANGE'):
        {
            //A player is no longer dueling and is instead watching.
        }
        break;
    }
    console.log(packet);
    if (!debug[packet.STOC]) {
        debug[packet.STOC] = 0;
    }
    debug[packet.STOC]++;
}

//initiate server

run. in .gui('node update');
run. in .gui('http-server -p 8080');
//all done maybe I should make a bajilling cores!
function test() {


}