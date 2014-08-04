// ReadInt32() = readUInt16LE()
/* jshint node: true */
console.log('Runing DevPro Packet Sniffing Proxy');

var net = require('net');

var WebSocket = require('ws');
var parsePackets = require('../../libs/parsepackets.js');
var enums = require('../../libs/enums.js');
var Model = require(__dirname + '/../../../client/interface/js/game-model.js');
//var recieveCTOS = require('../../recieveCTOS');
var recieveSTOC = require('../../libs/recieveSTOC.js');
var ws = new WebSocket('ws://192.99.11.19:8913/path');
var wsproxy = net.createServer(function () {});
wsproxy.listen(8912);
//wsproxy.on('connection', function (socket) {
//    console.log('new client starting a proxy.');
//    socket.on('data', function (data) {
//        console.log('sending data');
//        ws.send(data);
//
//    });
//    ws.on('message', function (data) {
//        console.log('recieving data');
//        socket.write(data);
//        var task = parsePackets('STOC', data);
//        console.log(task)
//        processTask(task, socket);
//    });
//});
var model = new Model();
model.singlelock = false;
var proxy = net.createServer(function () {});
proxy.on('connection', function (socket) {

    var connection = net.connect(8911, '91.250.87.52');
    connection.on('data', function (data) {
        socket.write(data);
        var task = parsePackets('STOC', data);
        processTask(task, socket);
    });
    socket.on('data', function (data) {
        connection.write(data);
    });
    connection.on('error', function () {});
    socket.on('error', function () {});
});
proxy.listen(8914);



function processTask(task, socket) {
    task = (function () {
        var output = [];
        for (var i = 0; task.length > i; i++) {
            output.push(recieveSTOC(task[i]));
        }
        return output;
    })();
    for (var i = 0; task.length > i; i++) {
        if (task[i].STOC_UNKNOWN) {
            //console.log('-----', makeCard(task[i].STOC_UNKNOWN.message));
        } else
        if (task[i].STOC_GAME_MSG) {
            var command = enums.STOC.STOC_GAME_MSG[task[i].STOC_GAME_MSG.message[0]];
            if (command === 'MSG_START') {
                var type = task[i].STOC_GAME_MSG.message[1];
                model.lifepoints1 = task[i].STOC_GAME_MSG.message.readUInt16LE(2);
                model.lifepoints2 = task[i].STOC_GAME_MSG.message.readUInt16LE(6);
                model.player1decksize = task[i].STOC_GAME_MSG.message.readUInt8(10);
                model.player1extrasize = task[i].STOC_GAME_MSG.message.readUInt8(12);
                model.player2decksize = task[i].STOC_GAME_MSG.message.readUInt8(14);
                model.player2extrasize = task[i].STOC_GAME_MSG.message.readUInt8(16);
                console.log(model.lifepoints1, model.lifepoints2, model.player1decksize, model.player1extrasize,
                    model.player2decksize, model.player2extrasize);
            } else if (command === 'MSG_NEW_TURN') {
                model.activePlayer = !model.activePlayer;
                model.phase = 0;
                console.log('Player' + (model.activePlayer + 1) + '\'s turn');
            } else if (command === 'MSG_WIN') {
                console.log('Win', task[i].STOC_GAME_MSG.message[1]);
            } else if (command === 'MSG_NEW_PHASE') {
                model.phase++;
                console.log(enums.phase[model.phase]);
            } else if (command === 'MSG_DRAW') {
                var drawplayer = task[i].STOC_GAME_MSG.message[1];
                var draw = task[i].STOC_GAME_MSG.message[2];
                console.log(('Player' + (drawplayer + 1)), 'drew', draw, 'cards');
            } else if (command === 'MSG_SHUFFLE_DECK') {
                var deckshuffleplayer = task[i].STOC_GAME_MSG.message[1];
                console.log(('Player' + (deckshuffleplayer + 1)), 'shuffled the deck');
            } else if (command === 'MSG_SHUFFLE_HAND') {
                var handshuffleplayer = task[i].STOC_GAME_MSG.message[1];
                console.log(('Player' + (handshuffleplayer + 1)), 'shuffled the deck');
            } else if (command === 'MSG_CHAINED') {
                model.chainsolved = 0;
                console.log('Chain in progress');
            } else if (command === 'MSG_CHAIN_SOLVING') {
                model.chainsolved = 1;
                console.log('Resolving Chain');
            } else if (command === 'MSG_CHAIN_SOLVED') {
                model.chainsolved = 3;
                console.log('Solved Chain');
            } else if (command === 'MSG_PAY_LPCOST') {
                player = task[i].STOC_GAME_MSG.message[1];
                var lpcost = task[i].STOC_GAME_MSG.message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'paid', lpcost, 'lifepoints');
            } else if (command === 'MSG_DAMAGE') {
                player = task[i].STOC_GAME_MSG.message[1];
                var damage = task[i].STOC_GAME_MSG.message.readUInt16LE(2);
                console.log(('Player' + (player + 1)), 'took', damage, 'damage');
            } else if (command === 'MSG_SUMMONING ') {
                //ignoring
                console.log('Normal summon preformed');
            } else if (command === 'MSG_SELECT_IDLECMD') {
                var idleplayer = task[i].STOC_GAME_MSG.message[1];
                model.idle = true;
                var idlereadposition = 2;
                for (var k = 0; k < 5; k++) {
                    var idlecount = task[i].STOC_GAME_MSG.message[idlereadposition];
                    idlereadposition++;
                    //                    for (var j = 0; j < idlecount; ++j) {
                    //                        var idlecard = task[i].STOC_GAME_MSG.message.readUInt16LE(idlereadposition);
                    //                        idlereadposition = idlereadposition + 4;
                    //                    }
                }
            } else if (command === 'MSG_MOVE') {
                var movecardid = task[i].STOC_GAME_MSG.message[1];
                var pc = task[i].STOC_GAME_MSG.message[2];
                var pl = task[i].STOC_GAME_MSG.message[3];
                var ps = task[i].STOC_GAME_MSG.message[4];
                var pp = task[i].STOC_GAME_MSG.message[5];
                var cc = task[i].STOC_GAME_MSG.message[6];
                var cl = task[i].STOC_GAME_MSG.message[7];
                var cs = task[i].STOC_GAME_MSG.message[8];
                var reason = task[i].STOC_GAME_MSG.message[3];
                console.log('Move', pc, pl, ps, 'to', cc, cl, cs, 'due to', pp, reason);
            } else if (command === 'MSG_SET') {
                var smovecardid = task[i].STOC_GAME_MSG.message[1];
                var spc = task[i].STOC_GAME_MSG.message[2];
                var spl = task[i].STOC_GAME_MSG.message[3];
                var sps = task[i].STOC_GAME_MSG.message[4];
                var spp = task[i].STOC_GAME_MSG.message[5];
                var scc = task[i].STOC_GAME_MSG.message[6];
                var scl = task[i].STOC_GAME_MSG.message[7];
                var scs = task[i].STOC_GAME_MSG.message[8];
                var sreason = task[i].STOC_GAME_MSG.message[3];
                console.log('Move', spc, spl, sps, 'to', scc, scl, scs, 'due to', spp, sreason);
            } else if (command === 'MSG_UPDATE_DATA') {
                var player = task[i].STOC_GAME_MSG.message[1];
                var fieldlocation = task[i].STOC_GAME_MSG.message[2];
                var fieldmodel = enums.locations[fieldlocation];
                //console.log('MSG_UPDATE_DATA', 'Player' + (player + 1), fieldmodel);
            } else if (command === 'MSG_UPDATE_CARD') {
                var udplayer = task[i].STOC_GAME_MSG.message[1];
                var udfieldlocation = task[i].STOC_GAME_MSG.message[2];
                var udindex = task[i].STOC_GAME_MSG.message[3];

                var udcard = makeCard(task[i].STOC_GAME_MSG.message, 0, udplayer).card;
                console.log('MSG_UPDATE_CARD',
                    'Player' + (udplayer + 1), enums.locations[udfieldlocation], udindex, udcard);
            } else {
                console.log(command, task[i].STOC_GAME_MSG.message);
            }
        } else if (task[i].STOC_DUEL_START) {
            console.log('Starting Duel!');
        } else if (task[i].STOC_SELECT_TP) {
            console.log('Select who goes first');
        } else if (task[i].STOC_HAND_RESULT) {
            var rpschoice = task[i].STOC_HAND_RESULT.message[0];
            console.log('Opponent used', enums.RPS[rpschoice]);
        } else if (task[i].STOC_SELECT_HAND) {
            console.log('Please Select RPS');
        } else if (task[i].STOC_REPLAY) {
            console.log('Replay Information', task[i].STOC_REPLAY);
        } else if (task[i].STOC_TIME_LIMIT) {

            //console.log('Player' + (task[i].STOC_TIME_LIMIT.message[0] + 1), 'has ' + (task[i].STOC_TIME_LIMIT.message[1] + task[i].STOC_TIME_LIMIT.message[2]) + 'sec left');
        } else if (task[i].STOC_CHAT) {
            var chat = task[i].STOC_CHAT.message.toString('utf16le', 2);
            console.log('Chat:', chat);
        } else if (task[i].STOC_HS_PLAYER_ENTER) {
            var person = task[i].STOC_HS_PLAYER_ENTER.message.toString('utf16le', 0, 40);
            var position = task[i].STOC_HS_PLAYER_ENTER.message.toString('utf16le', 41);
            console.log(person, 'entered', 'the duel', position.length);
        } else if (task[i].STOC_HS_PLAYER_CHANGE) {
            model.singlelock = !model.singlelock;
            var ready = model.singlelock ? 'now' : 'not';
            console.log('Opponent is', ready, 'ready');
        } else if (task[i].STOC_HS_WATCH_CHANGE) {
            console.log('Spectators:', task[i].STOC_HS_WATCH_CHANGE.message[0]);
        } else if (task[i].STOC_TYPE_CHANGE) {
            console.log('STOC_TYPE_CHANGE', task[i].STOC_TYPE_CHANGE);
        } else if (task[i].STOC_SELECT_TP) {
            console.log('Chat', task[i].STOC_SELECT_TP);
        } else if (task[i].STOC_JOIN_GAME) {
            console.log('Join Game', task[i].STOC_JOIN_GAME);
        } else {
            console.log('????', task[i]);
        }
    }
}

function makeCard(buffer, start, controller) {
    if (buffer.length < 12) {
        return;
    }

    var flag = buffer.readUInt32LE(8);
    if (!flag) {
        return;
    }
    var card = {};

    //console.log('flag:', flag);
    var readposition = 12;

    if (flag & enums.query.Code) {
        card.Code = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Position) {
        card.Controller = buffer[readposition + 0];
        card.Position = buffer[readposition + 3];
        readposition = readposition + 4;
    }
    if (flag & enums.query.Alias) {
        card.Alias = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Type) {
        card.Type = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Level) {
        card.Level = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Rank) {
        card.Rank = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Attribute) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Race) {
        card.Race = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Attack) {
        card.Attack = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Defense) {
        card.Defense = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.BaseAttack) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.BaseDefense) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.Reason) {
        card.Attribute = buffer.readUInt16LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.ReasonCard) {
        card.Attribute = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.EquipCard) {
        card.EquipCard = {
            c: buffer[readposition + 0],
            l: buffer[readposition + 1],
            s: buffer[readposition + 2]
        };
        readposition = readposition + 4;
    }
    if (flag & enums.query.TargetCard) {

        for (var i = 0; i < buffer.readUInt32LE(readposition); ++i) {
            card.TargetCard.push({
                c: buffer[readposition + 0],
                l: buffer[readposition + 1],
                s: buffer[readposition + 2]
            });
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.OverlayCard) {
        card.OverlayCard = [];
        for (var ii = 0; ii < buffer.readUInt32LE(readposition); ++ii) {
            card.OverlayCard.push(buffer.readUInt32LE(readposition));
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.Counters) {
        card.Counters = [];
        for (var iii = 0; iii < buffer.readUInt32LE(readposition); ++iii) {
            card.Counters.push({
                counterType: buffer.readUInt16LE(readposition),
                amount: buffer.readUInt16LE(readposition + 2)
            });
            readposition = readposition + 4;
        }
    }
    if (flag & enums.query.Owner) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.IsDisabled) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.IsPublic) {
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.lscale) {
        card.lscale = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.rscale) {
        card.rscale = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    return {
        card: card,
        readposition: readposition
    };


}