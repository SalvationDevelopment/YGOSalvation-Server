/*jslint node: true, plusplus: true, unparam: false, nomen: true*/

(function main() {
    'use strict';
    var portmin = 23500,
        startDirectory = __dirname,
        fs = require('fs'),
        childProcess = require('child_process'),
        net = require('net'),
        parsePackets = require('./parsepackets.js'),
        recieveCTOS = require('./recieveCTOS'),
        recieveSTOC = require('./recieveSTOC.js'),
        gamelist = {};

    process.on('message', function (message) {
        if (message.messagetype === 'gamelist') {
            gamelist = message.gamelist;
        }
    });

    function processTask(task, socket) {
        var i = 0,
            l = 0;
        task = (function () {
            var output = [];
            for (i; task.length > i; i++) {
                output.push(recieveCTOS(task[i], socket.username, socket.hostString));
            }
            return output;
        }());
        for (l; task.length > l; l++) {
            if (task[l].CTOS_JOIN_GAME) {
                socket.active = true;
                socket.hostString = task[l].CTOS_JOIN_GAME;
                //console.log(task);
            }
        }
    }

    function connectToCore(port, data, socket) {
        //console.log('attempting link up');
        socket.active_ygocore = net.connect(port, '127.0.0.1', function () {
            socket.active_ygocore.setNoDelay(true);
            //console.log('linkup established');
            socket.active_ygocore.write(data);
            //console.log('-->');
            socket.active = false;
            socket.active_ygocore.on('data', function (core_data) {
                socket.write(core_data);
                //console.log('<--',core_data.toString());
            });
            socket.active_ygocore.on('error', function (error) {
                socket.close();
            });
            socket.active_ygocore.on('close', function () {
                 socket.close();
            });
        });
        
    }

    function portfinder(min, max, callback) {
        //console.log(gamelist);
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

    function pickCoreConfig(socket) {
        var output = '';
        if (socket.hostString[0] > '4') {
            return output + socket.hostString[0] + '-config.txt';
        } else {
            /*load default configuration */
            return 'config.txt';
        }
    }

    function handleCoreMessage(core_message_raw, port, data, socket) {
        if (core_message_raw.toString().indexOf("::::") < 0) {
            console.log('ERROR: ', core_message_raw.toString());
        }
        var core_message = core_message_raw.toString().split('|'),
            gamelistmessage = {
                messagetype: 'coreMessage',
                coreMessage: {
                    core_message_raw: core_message_raw,
                    port: port
                }
            };
        if (core_message[0].trim() === '::::network-ready') {
            connectToCore(port, data, socket);
        }

        process.send(gamelistmessage);
    }


    function startCore(port, socket, data, callback) {
        //console.log(socket.hostString);
        fs.exists(startDirectory + '../../ygocore/YGOServer.exe', function (exist) {
            if (!exist) {
                console.log('core not found at ' + __dirname + '/../ygocore/YGOServer.exe');
                return;
            }
console.log('!')
            var configfile = pickCoreConfig(socket),
                params = port + ' ' + configfile,
                currentDate = new Date();
            console.log(' initiating core for ' + socket.username + ' on port:' + port + ' with: ' + configfile);
            socket.core = childProcess.spawn(startDirectory + '/../ygocore/YGOServer.exe', [port, configfile], {
                cwd: startDirectory + '/../ygocore'
            }, function (error, stdout, stderr) {
                //console.log(createDateString(currentDate) + ' CORE Terminated', error, stderr, stdout);
            });
            socket.core.stdout.on('error', function (error) {

            });
            socket.core.stdout.on('data', function (core_message_raw) {
                handleCoreMessage(core_message_raw, port, socket, data);
            });

        });
    }



    function processIncomingTrasmission(data, socket) {
        if (socket.active_ygocore) {
            //console.log('-->');
            //socket.active_ygocore.write(data);
            // eventing shifted server wont overload due to constant dueling.
            //return true;
        }
        var task = parsePackets('CTOS', data);
        processTask(task, socket);

        //console.log(socket.hostString);
        if (!socket.active_ygocore) {
            try {
                console.log('[' + new Date().getHours() + ':' + new Date().getMinutes() + ']', socket.username, socket.hostString);
            } catch (error) {
                console.log(new Date(), socket.username, socket.hostString, 'not on gamelist');
            }
            console.log(gamelist);
            if (gamelist[socket.hostString] && !socket.active_ygocore) {
                socket.alpha = false;
                connectToCore(gamelist[socket.hostString].port, data, socket);
                //console.log(socket.username + ' connecting to existing core');

            } else if (!gamelist[socket.hostString] && !socket.active_ygocore) {
                console.log(socket.username + ' connecting to new core');
                portfinder(++portmin, 27000, function (error, port) {
                    socket.alpha = true;
                    startCore(port, socket, data);
                });
            }
        }
        //console.log('process complete', gamelist);
        if (portmin === 27000) {
            portmin = 23500;
        }
    }









    function createDateString(dateObject) {
        return "[" + dateObject.getHours() + ":" + dateObject.getMinutes() + "]";
    }


    module.exports = processIncomingTrasmission;

}());