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
            } else if (command === 'MSG_NEW_PHASE') {
                model.phase++;
                console.log(enums.phase[model.phase]);
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
            } else if (command === 'MSG_UPDATE_DATA') {
                var player = task[i].STOC_GAME_MSG.message[1];
                var fieldlocation = task[i].STOC_GAME_MSG.message[2];
                var fieldmodel = enums.locations[fieldlocation];
                //console.log('MSG_UPDATE_DATA', 'Player' + (player + 1), fieldmodel);
            } else if (command === 'MSG_UPDATE_CARD') {
                var udplayer = task[i].STOC_GAME_MSG.message[1];
                var udfieldlocation = task[i].STOC_GAME_MSG.message[2];
                var udindex = task[i].STOC_GAME_MSG.message[3];

                var udcard = makeCard(task[i].STOC_GAME_MSG.message, udplayer);
                console.log('MSG_UPDATE_CARD',
                    'Player' + (udplayer + 1), enums.locations[udfieldlocation], udindex, udcard, task[i].STOC_GAME_MSG.message);
            } else {
                console.log(command, task[i].STOC_GAME_MSG.message);
            }
        } else if (task[i].STOC_DUEL_START) {
            console.log('Starting Duel!');
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

function makeCard(buffer, controller) {
    if (buffer.length < 12) {
        return;
    }

    var flag = buffer.readUInt32LE(8);
    if (!flag) {
        return;
    }
    var card = {};
    card.flag = flag;
    card.Code = 0;
    card.Position = 0;
    card.Alias = 0;
    card.Type = 0;
    card.Level = 0;
    card.Rank = 0;
    card.Attribute = 0;
    card.Race = 0;
    card.Attack = 0;
    card.Defence = 0;
    card.BaseAttack = 0;
    card.BaseDefence = 0;
    card.Reason = 0;
    card.ReasonCard = 0;
    card.EquipCard = 0;
    card.TargetCard = 0;
    card.OverlayCard = 0;
    card.Counters = 0;
    card.Owner = 0;
    card.IsDisabled = 0;
    card.IsPublic = 0;
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
        card.EquipCard = buffer.readUInt32LE(readposition);
        readposition = readposition + 4;
    }
    if (flag & enums.query.TargetCard) {

        for (var i = 0; i < buffer.readUInt32LE(readposition); ++i) {
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
    return card;


}