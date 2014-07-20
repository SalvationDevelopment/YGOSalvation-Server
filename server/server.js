/* jslint node : true */
//process.on('uncaughtException', function (error) {
//    console.log('Caught exception: ' + error);
//});
try {
    require('httpsys').slipStream();
} catch (error) {
    console.log('Windows 8+ spefic enhancements not enabled.');
}

var fs = require('fs');
var net = require('net');
var childProcess = require('child_process');
var Primus = require('primus');
var Rooms = require('primus-rooms');
var http = require('http');
var servercontrol = require('./libs/servercontrol.json');
var server = http.createServer().listen(5000);
var primus = new Primus(server, {
    parser: 'JSON'
});

var parsePackets = require('./libs/parsepackets.js');
var recieveCTOS = require('./libs/recieveCTOS');
var recieveSTOC = require('./libs/recieveSTOC.js');
var gamelist = {};

primus.use('rooms', Rooms);
primus.on('connection', function (socket) {
    socket.on('data', function (data) {
        data = data || {};
        var action = data.action;
        switch (action) {
        case ('join'):
            {
                socket.join('activegames', function () {
                    socket.write(JSON.stringify(gamelist));
                });
            }
            break;
        case ('leave'):
            {
                socket.leave('activegames');
            }
            break;
        default:
            {
                console.log(data);
            }
        }
    });
});
primus.on('disconnection', function (socket) {
    killCore(socket); // allow reconnection?
});
primus.on('error', function (socket) {
    killCore(socket); // allow reconncetion?
});

var ygoserver = net.createServer(function (socket) {
    socket.active_ygocore = false;
    socket.active = false;
    socket.on('data', function (data) {
        processIncomingTrasmission(data, socket);
    });
    socket.on('close', function () {
        killCore(socket);
    });
    socket.on('error', function () {
        killCore(socket);
    });
});
ygoserver.listen(8911);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    port: 8913
});

wss.on('connection', function (socket) {
    socket.active_ygocore = false;
    socket.active = false;
    socket.write = function (data) {
        socket.send(data, {
            binary: true,
            mask: true
        });
    };
    socket.on('message', function (data) {
        processIncomingTrasmission(data, socket);
    });
    socket.on('close', function () {
        killCore(socket);
    });
    socket.on('error', function () {
        killCore(socket);
    });
});

function killCore(socket) {
    if (socket.active_ygocore) {
        socket.active_ygocore.end();
    }
    if (socket.core) {
        socket.core.kill();
        delete socket.core;
        delete gamelist[socket.hostString];
        primus.room('activegames').write(JSON.stringify(gamelist));
    }
}

function processTask(task, socket) {
    task = (function () {
        var output = [];
        for (var i = 0; task.length > i; i++) {
            output.push(recieveCTOS(task[i], socket.username, socket.hostString));
        }
        return output;
    })();
    for (var i = 0; task.length > i; i++) {
        if (task[i].CTOS_JOIN_GAME) {
            socket.active = true;
            socket.hostString = task[i].CTOS_JOIN_GAME;
            //console.log(task);
        }
        if (task[i].CTOS_PLAYER_INFO) {
            socket.username = task[i].CTOS_PLAYER_INFO;
        }
        if (task[i].CTOS_HS_TODUELIST) {
            gamelist[socket.hostString].players.push(socket.username);
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
        if (task[i].CTOS_HS_TOOBSERVER || task[i].CTOS_LEAVE_GAME) {
            gamelist[socket.hostString].players.splice(gamelist[socket.hostString].players.indexOf(socket.username), 1);
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
        if (task[i].CTOS_HS_START) {
            gamelist[socket.hostString].started = true;
            primus.room('activegames').write(JSON.stringify(gamelist));
        }
    }
}

function connectToCore(port, data, socket) {
    socket.active_ygocore = net.connect(port, '127.0.0.1', function () {
        socket.active_ygocore.write(data);
        primus.room('activegames').write(JSON.stringify(gamelist));
        socket.active = false;
        socket.active_ygocore.on('data', function (core_data) {
            var task = parsePackets('STOC', data);
            task = (function () {
                var output = [];
                for (var i = 0; task.length > i; i++) {
                    output.push(recieveSTOC(task[i], socket.hostString));
                }
                return output;
            })();
            socket.write(core_data);
        });
        socket.active_ygocore.on('error', function (error) {
            killCore(socket);
            console.log(error);
        });
        socket.active_ygocore.on('close', function () {
            killCore(socket);
        });
    });
}

function portfinder(min, max, gamelist, callback) {
    var activerooms = [];
    for (var rooms in gamelist) {
        if (gamelist.hasOwnProperty(rooms)) {
            activerooms.push(gamelist[rooms].port);
        }
    }
    for (var i = min; max > i; i++) {
        if (activerooms.indexOf(i) === -1) {
            callback(null, i);
            return;
        }
    }
}

function processIncomingTrasmission(data, socket) {
    //console.log(socket.hostString);
    if (socket.active_ygocore) {
        socket.active_ygocore.write(data);
        // eventing shifted server wont overload due to constant dueling.
    }
    var task = parsePackets('CTOS', data);
    processTask(task, socket);

    //console.log(socket.hostString);
    if (socket.active) {
        if (gamelist[socket.hostString] && !socket.active_ygocore) {
            connectToCore(gamelist[socket.hostString].port, data, socket);
            console.log(socket.username + ' connecting to existing core');
            gamelist[socket.hostString].players.push(socket.username);
        } else if (!gamelist[socket.hostString] && !socket.active_ygocore) {
            console.log(socket.username + ' connecting to new core');
            portfinder(7000, 9001, gamelist, function (error, port) {
                startCore(port, socket, data);
            });
        }
    }
}

function startCore(port, socket, data) {
    fs.exists('public/ygopro/ygocoreSD3.exe', function (exist) {
        if (!exist) {
            console.log('core not found at ' + __dirname + '/' + 'public/ygopro');
            return;
        }
        //console.log('connecting to new core @', port);
        //console.log('found port ', port);
        socket.core = childProcess.spawn('ygocoreSD3.exe ', [port], {
            cwd: 'public/ygopro/'
        }, function (error, stdout, stderr) {
            console.log('CORE Terminated', error, stderr, stdout);
        });
        socket.core.stdout.on('error', function (error) {
            killCore(socket);
            console.log('core error', error);
        });
        socket.core.stdout.on('data', function (core_message) {
            core_message = core_message.toString();
            console.log(port + ': Core Message: ', core_message);
            if (core_message[0] === 'S') {

                connectToCore(port, data, socket);
                gamelist[socket.hostString] = {
                    port: port,
                    players: [socket.username],
                    started: false
                };
                primus.room('activegames').write(JSON.stringify(gamelist));
            } else {
                killCore(socket);
            }

        });

    });
}