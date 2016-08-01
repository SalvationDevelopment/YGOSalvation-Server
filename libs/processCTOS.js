/*jslint node: true, plusplus: true, unparam: false, nomen: true*/

/* This is the YGOCore routing and proxy system. The System checks
a number of CTOS commands and from them works out if to just route
the connection to an existing connection or start a new YGOCore.
If a new YGOCore is needed it works out what config file is needed
for that instance of dueling based on the `roompass` in the
connection string of the `CTOS_JOIN` command */

'use strict';
var portmin = 30000 + process.env.PORTRANGE * 100, //Port Ranges
    portmax = (30000 + process.env.PORTRANGE * 100) + 100,
    handleCoreMessage, // Send messages BACK to the MASTER PROCESS
    startDirectory = __dirname,
    fs = require('fs'),
    path = require('path'),
    childProcess = require('child_process'),
    net = require('net'),
    parsePackets = require('./parsepackets.js'), //Get data sets out of the YGOPro Network API.
    recieveCTOS = require('./recieveCTOS'), // Translate data sets into messages of the API
    gamelist = {},
    registry = {
        //People that have read this source code.
        SnarkyChild: '::ffff: 127.0.0.1',
        AccessDenied: '::ffff:127.0.0.1',
        Irate: '::ffff:127.0.0.1',
        Chibi: '::ffff:127.0.0.1',
        OmniMage: '::ffff:127.0.0.1'
    },
    //winston = require('winston'),

    coreIsInPlace = false,
    ps = require('ps-node'),

    Primus = require('primus'), //Primus, our Sepiroth-Qliphopth Creator God. Websocket connections.
    internalGames = [], // internal list of all games the bot is playing
    //enums = require('./libs/enums.js'),


    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client = {
        write: function () {
            console.log('    [ProcessCTOS]system not ready yet');
        }
    },

    childProcess = require('child_process'),
    startDirectory = __dirname;

//if (cluster.isWorker) {
//    process.on('message', function (message) {
//
//
//        if (message.gamelist) {
//            gamelist = message.gamelist;
//        }
//        if (message.registry) {
//            registry = message.registry;
//        }
//    });
//}

//client.on('connected', function () {});
//client.on('close', function () {}); // start shutting down server.


var primaryScripts = {
    0: '../http/ygopro/script',
    1: '../ygopro-tcg-scripts',
    2: '../http/ygopro/script',
    3: '../http/ygopro/script',
    4: '../http/ygopro/script',
    5: '../http/ygopro/script',
    99: '../ygopro-goat-scripts'
};
var secondaryScripts = {
    0: '../http/ygopro/script',
    1: '../http/ygopro/script',
    2: '../http/ygopro/script',
    3: '../http/ygopro/script',
    4: '../http/ygopro/script',
    5: '../http/ygopro/script',
    99: '../http/ygopro/script'
};

var dbs = {
    'ini/config.ini': '../http/ygopro/databases/0-en-OCGTCG.cdb',
    'ini/newgioh.ini': '../http/ygopro/databases/4-Newgioh.cdb',
    'ini/goat.ini': '../http/ygopro/databases/3-Goats.cdb',
    'ini/3-config.ini': '../http/ygopro/databases/Z-CWA.cdb',
    'ini/4-config.ini': '../http/ygopro/databases',
    'ini/5-config.ini': '../http/ygopro/databases'
};

function parseDuelOptions(duelOptions) {
    //{"200OOO8000,0,5,1,U,PaS5w":{"port":8000,"players":[],"started":false}}
    var duelOptionsParts = duelOptions.split(','),
        settings = { //Determine time limit
            //Use classic TCG rules?
            isTCGRuled: (duelOptionsParts[0][3] === 'O') ? 'false' : 'true',

            //Check Deck for Illegal cards?
            isDeckChecked: (duelOptionsParts[0][4] === 'O') ? 'false' : 'true',

            //Shuffle deck at start?
            isShuffled: (duelOptionsParts[0][5] === 'O') ? 'false' : 'true',

            //Choose Starting Life Points
            lifePoints: duelOptionsParts[0].substring(6),

            //Determine Banlist
            banList: parseInt(duelOptionsParts[1], 10),

            //Select how many cards to draw on first hand
            openDraws: duelOptionsParts[2],

            //Select how many cards to draw each turn
            turnDraws: duelOptionsParts[3],

            //Choose whether duel is locked
            isLocked: (duelOptionsParts[4] === 'U') ? false : true,

            //Copy password
            password: duelOptionsParts[5]
        };
    settings.timeLimit = (Number(duelOptionsParts[0][2]) + 1) * 180;

    settings.allowedCards = duelOptionsParts[0][0];
    settings.gameMode = duelOptionsParts[0][1];
    return settings;

}




fs.exists(startDirectory + '../../ygosharp/YGOSharp.exe', function (exist) {

    if (!exist) {
        console.log('    [ProcessCTOS]', path.resolve(startDirectory + '../../ygosharp/YGOSharp.exe') + ' is missing!');
        return;
    } else {
        //coreErrors.info('YGOCore is in place, allowing connections.');
        coreIsInPlace = true;
    }
});


/* Listen to the MASTER  process for messages to the SLAVE 
processes. That message will be an update to the internal
gamelist of each SLAVE process */

function processTask(task, socket) {

    var i = 0,
        l = 0,
        players,
        output = [];
    for (i; task.length > i; i++) {
        output.push(recieveCTOS(task[i], socket.username, socket.hostString));
    }

    for (l; output.length > l; l++) {
        if (output[l].CTOS_JOIN_GAME) {
            socket.active = true;
            socket.hostString = output[l].CTOS_JOIN_GAME;

        }
        if (output[l].CTOS_PLAYER_INFO) {
            socket.username = output[l].CTOS_PLAYER_INFO;
        }

    }
}


/* After determining the routing location, then connect the CLIENT to
the proper YGOCore and monitor the connection */

function connectToCore(port, data, socket) {


    socket.active_ygocore = net.connect(port, '127.0.0.1', function () {

        /* Unlimit the speed of the connection
        by not doing processing on the data
        to incease up network optimization */
        socket.active_ygocore.setNoDelay(true);

        /*proxy the data*/
        socket.active_ygocore.write(data);

        socket.active = false;
        socket.active_ygocore.on('data', function (core_data) {
            socket.write(core_data);
        });

        socket.on('close', function () {
            if (socket.active_ygocore) {
                socket.active_ygocore.end();
            }
        });
        socket.on('error', function (error) {
            socket.active_ygocore.end();
        });
    });
    socket.active_ygocore.on('error', function (error) {
        //cHistory.info('--GAME');
        if (socket.alpha) {
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
        }
        socket.end();
    });
    socket.active_ygocore.on('close', function () {
        if (socket.alpha) {
            handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data);
        }
        socket.end();
    });

}

/* Each YGOCore needs to operate on its own port,
each SLAVE is given a range to loop through. This
is actually a very poor way of doing this and
frequently fails; rewrite is needed*/



function portfinder(min, max, callback) {
    var rooms,
        activerooms = [],
        num = Math.floor(Math.random() * 10000);

    function isPortTaken(port, fn) {
        var tester = net.createServer().once('error', function (err) {
            if (err.code !== 'EADDRINUSE') {
                return fn(err);
            }
            fn(null, true);
        }).once('listening', function () {
            tester.once('close', function () {
                fn(null, false);
            }).close();
        }).listen(port);
    }

    function portResolve(error) {
        if (error) {
            portfinder(min, max, callback);
        } else {
            callback(null, num);
        }
    }

    isPortTaken(num, portResolve);

}

/* The routing is done based on the
game string or rather `roompass` in
connection request */

function pickCoreConfig(socket) {

    var output = 'ini/';
    if (socket.hostString.indexOf(",2,5,1") > -1) {
        return "ini/goat.ini";
    }
    if (socket.hostString.indexOf(",4,5,1") > -1) {
        return "ini/newgioh.ini";
    }
    if (socket.hostString[0] > '2') {
        return output + socket.hostString[0] + '-config.ini';
    } else {
        /*load default configuration */
        return output + 'config.ini';
    }
}


//function makeCoverMsg(player, domain, username) {
//    var ctos = new Buffer([0x30, player]),
//        blanksite = new Buffer(new Array(256).fill('0', 0, 256)),
//        blankdir = new Buffer(new Array(256).fill('0', 0, 256)),
//        site = new Buffer(domain + '\u0000', 'utf16le'),
//        dir = new Buffer('covers/' + username + '.jpg\u0000', 'utf16le'),
//        len = 2 + site.length + dir.length,
//        proto = new Buffer(2),
//        read;
//
//    site.copy(blanksite);
//    dir.copy(blankdir);
//    read = Buffer.concat([site, dir]);
//    console.log(read.toString('utf16le'));
//    proto.writeUInt16LE(len, 0);
//    proto = Buffer.concat([proto, ctos, site, dir]);
//    console.log(proto);
//    return proto;
//}

/* send the YGOCore API commands back to the main process, some cleanup
is needed before sending the message. Basic logging for finding idiots
later after they have misbehaved or providing administrative ablities
to kill or act on games */

function handleCoreMessage(core_message_raw, port, socket, data, pid) {

    if (core_message_raw.toString().indexOf("::::") < 0) {
        return;
    }
    var core_message = core_message_raw.toString().split('|'),
        n;

    if (core_message[0].trim() === '::::network-ready') {
        connectToCore(port, data, socket);
        //cHistory.info('++GAME: ' + pid);
    }

    client.write({
        password: process.env.OPERPASS,
        action: 'gamelistEvent',
        messagetype: 'coreMessage',
        coreMessage: {
            core_message_raw: core_message_raw.toString(),
            port: port,
            pid: pid,
            game: socket.hostString
        }
    });
    //    try {
    //        if (core_message[0].trim() === '::::start-game') {
    //
    //            for (n = 0; gamelist[socket.hostString].players.length > n; n++) {
    //                //send (n, gamelist[socket.hostString].players[n]);
    //                //socket.write(makeCoverMsg(n, 'http://ygopro.us/', gamelist[socket.hostString].players[n]));
    //                //console.log('sending cover data');
    //                //socket.write(makeCoverMsg(n, 'ygopro.us', 'SnarkyChild'));
    //            }
    //        }
    //    } catch (massiveErr) {
    //        console.log(massiveErr);
    //    }
}

/* Checks if a given password is valid, returns true or false */
function legalPassword(passIn) {
    if (passIn.length !== 24) {
        console.log('    [ProcessCTOS]', 'Invalid password length', passIn);
        return false;
    }
    var re = new RegExp("\\d\\d\\d(O|T)(O|T)(O|T)(\\d)+,(\\d)|(\\d\\d),\\d,\\d,(\\w)+,(\\w)+"),
        output = re.test(passIn);
    if (output) {
        return true;
    } else {
        console.log('    [ProcessCTOS]', 'Invalid password construction');
        return false;
    }
}


function authenticate(socket) {

    if (!process.env.YGOPROLOGINENABLED) {
        return;
    }

    if (registry[socket.username] !== socket.remoteAddress && socket.remoteAddress !== '::ffff:127.0.0.1') {
        try {
            console.log('Terminating:', socket.username, socket.remoteAddress);
            socket.end();
        } catch (killerror) {
            console.log('    [AccessDenied]', 'Something wierd happened with auth', killerror);
        }
    } else {
        console.log('    [Authenticated]', socket.username, registry[socket.username], socket.remoteAddress);
    }
}

/* Unlike DevPro, Salvation does not preload its 
YGOCores. It calls them on demand. This posses a 
few issues but provides routing flexiblity. When a
YGOCore is needed it needs to figure out a few
things. 1.) The configuration file, 2.) a port
number to use and 3.) if it is a valid duel to use
server resources on. */

function startCore(port, socket, data, callback) {
    authenticate(socket);

    var configfile = pickCoreConfig(socket),
        params = port + ' ' + configfile,
        translated,
        paramlist;

    //console.log(configfile);
    if (!legalPassword(socket.hostString)) {
        //deal with bad game request
        return;
    }

    translated = parseDuelOptions(socket.hostString);
    if (configfile === 'ini/goat.ini') {
        translated.allowedCards = 99;
        translated.isTCGRuled = true;
    }
    paramlist = ['StandardStreamProtocol=true',
                 'Port=' + port,
                 'ClientVersion=0x1339',
                 'BanlistFile=../http/ygopro/lflist.conf',
                 'PrimaryScriptDirectory=' + primaryScripts[translated.allowedCards],
                 'SecondaryScriptDirectory=' + secondaryScripts[translated.allowedCards],
                 'ScriptDirectory=' + primaryScripts[translated.allowedCards],
                 'DatabaseFile=' + dbs[configfile],
                 'Rule=' + translated.allowedCards,
                 'Mode=' + translated.gameMode,
                 'Banlist=' + translated.banList,
                 'StartLp=' + translated.lifePoints,
                 'GameTimer=' + translated.timeLimit,
                 'NoCheckDeck=' + translated.isDeckChecked,
                 'NoShuffleDeck=' + translated.isShuffled,
                 'EnablePriority=' + translated.isTCGRuled
                ];
    //console.log(paramlist.join(' '));
    socket.core = childProcess.spawn(startDirectory + '/../ygosharp/YGOSharp.exe', paramlist, {
        cwd: startDirectory + '/../YGOSharp'
    }, function (error, stdout, stderr) {
        //coreErrors.info(error, stdout, stderr);
        handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data, socket.core.pid);
        console.log('game ended naturally');
    });

    socket.core.stdout.on('error', function (error) {
        //coreErrors.info(error);
        handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data, socket.core.pid);
        //socket.core.kill();
        console.log('game ended with issues', error);
    });

    /* This is important, handle YGOCore API calls for managing the gamelist */
    socket.core.stdout.on('data', function (core_message_raw) {
        handleCoreMessage(core_message_raw, port, socket, data, socket.core.pid);
    });
    setInterval(function () {
        if (socket.heartbeat) {
            socket.heartbeat = 0;
            return;
        }
        try {
            socket.core.kill();
        } catch (e) {
            console.log('DOA');
        }
    }, 600000);
}



/* Call the server and make
sure the user is registered and
not banned. This call is beside
the normal duel request so the
user can connect to a game
possibly before being DC'd
based on connection speeds. */

/* ..and VOLIA! Game Request Routing */
function processIncomingTrasmission(data, socket, task) {
    processTask(task, socket);
    authenticate(socket);
    if (!socket.active_ygocore && socket.hostString) {
        if (gamelist[socket.hostString]) {
            socket.alpha = false;
            connectToCore(gamelist[socket.hostString].port, data, socket);
        } else {
            portfinder(++portmin, portmax, function (error, port) {
                socket.alpha = true;
                startCore(port, socket, data);
            });
        }
        /* after looping to much reset the ports*/
        if (portmin === portmax) {
            portmin = 30000 + process.env.PORTRANGE * 100;
        }
        return;
    }

    return data;
}


function gamelistUpdate(message) {
    if (message.gamelist) {
        gamelist = message.gamelist;
    }
    if (message.registry) {
        registry = message.registry;
    }
    if (message.recoverServer) {
        client.write({

        });
    }
}

function onConnectGamelist() {
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS,
        gamelist: gamelist,
        registry: registry
    });
    console.log('        [Slave ' + process.env.PORTRANGE + '] ' + 'Connected'.grey);
}

function onCloseGamelist() {

}
setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Connect the God to the tree;

    client.on('data', gamelistUpdate);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);

}, 5000);


module.exports = processIncomingTrasmission;
fs.watch(__filename, process.exit);