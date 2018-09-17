const http = require('http'),
    port = process.env.PORT || 8891,
    server = http.createServer().listen(port),
    domain = require('domain'),
    validateDeck = require('./validate_deck'),
    games = {},
    uuid = require('uuid'),
    Rooms = require('primus-rooms'),
    Primus = require('primus'),
    primus = new Primus(server, {
        parser: 'JSON'
    });

primus.use('rooms', Rooms);


function onData(data, socket) {
    data = data || {};
    const action = data.action;

    switch (action) {
        case 'CTOS_JOIN_GAME':
            socket.join(data.game);
            break;
    }
    if (!socket.game) {
        return;
    }
    switch (action) {
        case 'CTOS_RESPONSE':
            break;
        case 'CTOS_UPDATE_DECK':
            break;
        case 'CTOS_HAND_RESULT':
            break;
        case 'CTOS_TP_RESULT':
            break;
        case 'CTOS_PLAYER_INFO':
            break;
        case 'CTOS_CREATE_GAME':
            break;
        case 'CTOS_JOIN_GAME':
            socket.join(data.game);
            break;
        case 'CTOS_LEAVE_GAME':
            break;
        case 'CTOS_SURRENDER':
            break;
        case 'CTOS_TIME_COMFIRM':
            break;
        case 'CTOS_CHAT':
            break;
        case 'CTOS_HS_TODUELIST':
            break;
        case 'CTOS_HS_TOOBSERVER':
            break;
        case 'CTOS_HS_READY':
            break;
        case 'CTOS_HS_NOTREADY':
            break;
        case 'CTOS_HS_KICK':
            break;
        case 'CTOS_HS_START':
            break;
        default:
            break;
    }
}


primus.on('connection', function(socket) {
    var connectionwatcher = domain.create();
    connectionwatcher.on('error', function(err) {
        console.log(err);
    });
    connectionwatcher.enter();
    socket.on('error', function(error) {
        console.log(error);
    });

    socket.on('data', function(data) {
        if (socket.readyState !== primus.Spark.CLOSED) {
            return;
        }
        onData(data, socket);
    });
    connectionwatcher.exit();
});