/*jslint node: true, plusplus: true, unparam: false, nomen: true*/

/* This is the YGOCore routing and proxy system. The System checks
a number of CTOS commands and from them works out if to just route
the connection to an existing connection or start a new YGOCore.
If a new YGOCore is needed it works out what config file is needed
for that instance of dueling based on the `roompass` in the
connection string of the `CTOS_JOIN` command */


var portmin = 30000 + process.env.PORTRANGE * 100, //Port Ranges
    portmax = (30000 + process.env.PORTRANGE * 100) + 100,
    handleCoreMessage, // Send messages BACK to the MASTER PROCESS
    startDirectory = __dirname,
    fs = require('fs'),
    childProcess = require('child_process'),
    net = require('net'),
    parsePackets = require('./parsepackets.js'), //Get data sets out of the YGOPro Network API.
    recieveCTOS = require('./recieveCTOS'), // Translate data sets into messages of the API
    events = require('events'),
    bouncer = new events.EventEmitter(),
    gamelist = {},
    registry = {},
    winston = require('winston'),
    path = require('path'),
    coreIsInPlace = false,
    cluster = require('cluster'),
    ps = require('ps-node');

if (cluster.isWorker) {
    process.on('message', function (message) {
        'use strict';

        if (message.gamelist) {
            gamelist = message.gamelist;
        }
        if (message.registry) {
            registry = message.registry;
        }
    });
}

//client.on('connected', function () {});
//client.on('close', function () {}); // start shutting down server.




var cHistory = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.DailyRotateFile)({
            filename: ".\\logs\\conection_history.log"
        })
    ]
});

var coreErrors = new(winston.Logger)({
    transports: [
        new(winston.transports.DailyRotateFile)({
            filename: ".\\logs\\conection_history_coreErrors.log"
        })
    ]
});

fs.exists(startDirectory + '../../ygocore/YGOServer.exe', function (exist) {
    'use strict';
    if (!exist) {
        coreErrors.info('YGOCore not found at ' + startDirectory + '../../ygocore/YGOServer.exe');
        return;
    } else {
        coreErrors.info('YGOCore is in place, allowing connections.');
        coreIsInPlace = true;
    }
});


/* Listen to the MASTER  process for messages to the SLAVE 
processes. That message will be an update to the internal
gamelist of each SLAVE process */

function processTask(task, socket) {
    'use strict';
    var i = 0,
        l = 0,
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
    'use strict';

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
    'use strict';
    var rooms,
        activerooms = [],
        i = min;
    for (rooms in gamelist) {
        if (gamelist.hasOwnProperty(rooms)) {
            activerooms.push(gamelist[rooms].port);
        }
    }
    for (i; max > i; i++) {
        if (activerooms.indexOf(i) === -1) {
            callback(null, i);
            return;
        }
    }
}

/* The routing is done based on the
game string or rather `roompass` in
connection request */

function pickCoreConfig(socket) {
    'use strict';
    var output = 'ini/';
    if (socket.hostString.indexOf(",5,5,1") > -1) {
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

/* send the YGOCore API commands back to the main process, some cleanup
is needed before sending the message. Basic logging for finding idiots
later after they have misbehaved or providing administrative ablities
to kill or act on games */

function handleCoreMessage(core_message_raw, port, socket, data, pid) {
    'use strict';
    if (core_message_raw.toString().indexOf("::::") < 0) {
        return;
    }
    var core_message = core_message_raw.toString().split('|'),
        gamelistmessage = {
            password: process.env.OPERPASS,
            action: 'gamelistEvent',
            messagetype: 'coreMessage',
            coreMessage: {
                core_message_raw: core_message_raw.toString(),
                port: port,
                pid: pid
            }
        };
    if (core_message[0].trim() === '::::network-ready') {
        connectToCore(port, data, socket);
        //cHistory.info('++GAME: ' + pid);
    }
    if (core_message[0].trim() === '::::end-duel') {
        socket.core.kill();
        //cHistory.info('--GAME: ' + pid);
    }
    process.send(gamelistmessage);

}

/* Checks if a given password is valid, returns true or false */
function legalPassword(passIn) {
    'use strict';
    if (passIn.length !== 24) {
        console.log('Invalid password length', passIn);
        return false;
    }
    console.log(passIn);
    var re = new RegExp("\\d\\d\\d(O|T)(O|T)(O|T)(\\d)+,(\\d)|(\\d\\d),\\d,\\d,(\\w)+,(\\w)+"),
        output = re.test(passIn);
    if (output) {
        return true;
    } else {
        console.log('Invalid password construction');
        return false;
    }
}


function authenticate(socket) {
    'use strict';
    if (!process.env.YGOPROLOGINENABLED) {
        return;
    }
    //console.log(socket.username, registry[socket.username], socket.remoteAddress);
    if (registry[socket.username] !== socket.remoteAddress) {
        try {
            socket.end();
        } catch (killerror) {
            console.log('Something wierd happened with auth', killerror);
        }
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
    'use strict';
    authenticate(socket);
    if (!coreIsInPlace) {
        return;
    }

    var configfile = pickCoreConfig(socket),
        params = port + ' ' + configfile;

    console.log(configfile);
    if (!legalPassword(socket.hostString)) {
        //deal with bad game request
        cHistory.info('[' + socket.remoteAddress + ':' + socket.username + '] requested bad game: ' + socket.hostString);
        return;
    } else {
        //contact main process.
        //        process.send({
        //            messagetype: 'coreMessage',
        //            coreMessage: {
        //                core_message_raw: 'passwordQuery',
        //                ip: socket.remoteAddress,
        //                username: socket.username
        //            }
        //        });
    }
    console.log(startDirectory + '/../ygocore/YGOServer.exe');
    socket.core = childProcess.spawn(startDirectory + '/../ygocore/YGOServer.exe', [port, configfile], {
        cwd: startDirectory + '/../ygocore'
    }, function (error, stdout, stderr) {
        coreErrors.info(error, stdout, stderr);
        handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data, socket.core.pid);
    });

    socket.core.stdout.on('error', function (error) {
        coreErrors.info(error);
        handleCoreMessage('::::endduel|' + socket.hostString, port, socket, data, socket.core.pid);
        socket.core.kill();
    });

    /* This is important, handle YGOCore API calls for managing the gamelist */
    socket.core.stdout.on('data', function (core_message_raw) {
        handleCoreMessage(core_message_raw, port, socket, data, socket.core.pid);
    });

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
    'use strict';
    processTask(task, socket);
    authenticate(socket);
    if (!socket.active_ygocore && socket.hostString) {

        if (gamelist[socket.hostString]) {
            socket.alpha = false;
            cHistory.info('[' + socket.remoteAddress + ':' + socket.username + '] Connecting to ' + gamelist[socket.hostString].players[0]);
            connectToCore(gamelist[socket.hostString].port, data, socket);



        } else {
            cHistory.info('[' + socket.remoteAddress + ':' + socket.username + '] Connecting to new CORE');
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

module.exports = processIncomingTrasmission;