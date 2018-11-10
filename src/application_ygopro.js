require('dotenv').config();
var fs = require('fs'),
    http = require('http'),
    engine = require('./engine_ocgcore'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    validateDeck = require('./validate_deck.js'),
    database = require('../http/manifest/manifest_0-en-OCGTCG.json'),
    ygopro = require('./engine_ygopro.js'),
    banlist = {},
    ygopros = {},
    port = process.env.PORT || 8082,
    game = {},
    static = require('node-static'),
    file = new static.Server('../http', { cache: 0 }),
    primusServer = http.createServer(function(request, response) {
        request.addListener('end', function() {
            //
            // Serve files!
            //
            file.serve(request, response);
        }).resume();
    }).listen(port, function(request, response) {
        console.log('Listening on port', port);
    });

function getBanlist() {
    // this needs to be rewritten;
    banlist = {};
    var files = fs.readdirSync('../http/banlist/');
    files.forEach(function(filename) {
        if (filename.indexOf('.js') > -1) {
            var listname = filename.slice(0, -3);
            banlist[listname] = require('../http/banlist/' + '/' + filename);
        }
    });
    fs.writeFile('./http/manifest/banlist.json', JSON.stringify(banlist, null, 1), function() {});
    return banlist;
}


/**
 * Create a new game object.
 * @returns {object} customized game object
 */
function newGame() {
    return {
        priority: false,
        draw_count: process.env.STARTING_HAND || 5,
        start_hand_count: 5,
        time: process.env.TIME_LIMIT || 3000,
        shuffleDeck: process.env.SHUFFLE || false,
        start_lp: 8000,
        roompass: process.env.ROOMPASS || 'default',
        started: false,
        deckcheck: process.env.DECK_CHECK || false,
        ot: process.env.OT || 0,
        banlist: process.env.BANLIST || 'No Banlist',
        banlistid: process.env.BANLIST_ID,
        mode: process.env.MODE || 0,
        cardpool: process.env.CARD_POOL || 0,
        prerelease: process.env.PRERELEASE || true,
        masterRule: process.env.MASTER_RULE || 4,
        legacyfield: process.env.LEGACY || false,
        rule: process.env.RULE || 0,
        startLP: process.env.LIFEPOINTS || 8000,
        player: {
            0: {
                name: '',
                ready: false,
                deck: {
                    main: [],
                    extra: [],
                    side: []
                }
            },
            1: {
                name: '',
                ready: false,
                deck: {
                    main: [],
                    extra: [],
                    side: []
                }
            }
        },
        spectators: [],
        delCount: 0
    };
}

const primus = new Primus(primusServer, {
    parser: 'JSON'
});

primus.plugin('rooms', Rooms);

primus.save(__dirname + '/../http/js/vendor/primus.js');

primus.duelBroadcast = function broadcast() {
    Object.keys(game).forEach(function(key) {
        try {
            if (game[key].player[0].name === '' && game[key].player[1].name === '') {
                game[key].delCount += 1;
            }
            if (game[key].delCount > 10) {
                delete game[key];
            }
        } catch (failedDeletion) {
            console.log('failedDeletion', failedDeletion);
        }
    });
    primus.write({
        action: 'broadcast',
        data: game
    });
};


function responseHandler(socket, message) {
    //console.log(message);
    var generated,
        joined = false,
        player1,
        player2,
        ready,
        activeduel = socket.activeduel;
    if (!message.action) {
        return;
    }
    switch (message.action) {
        case 'ping':
            primus.room('main').send({
                port: process.env.PORT,
                games: game
            });
            break;
        case 'register':
            // Expand later
            socket.username = message.username;
            socket.write({
                action: 'registered'
            });
            break;
        case 'join':
            socket.slot = undefined;
            Object.keys(game.player).some(function(playerNo, index) {
                if (index > 1 || playerNo.joined) {
                    return;
                }
                socket.slot = index;
                socket.joined = true;
                game.player[index] = socket;
                return true;
            });

            primus.duelBroadcast(game);
            socket.write(({
                action: 'lobby',
                game: game
            }));
            break;
        case 'kick':
            if (socket.slot === undefined) {
                return;
            }
            if (socket.slot === 0) {
                game.players[message.slot].write(({
                    action: 'kick'
                }));
            }
            break;
        case 'leave':
            if (socket.slot !== undefined) {
                game.player[socket.slot].name = '';
                game.player[socket.slot].ready = false;
            }
            delete game.spectators[message.name];

            socket.slot = undefined;

            if (game.player[0].name === '' && game.player[1].name === '') {
                throw game;
            }


            if ((game.player[0].name === '' || game.player[1].name === '') && game.started === true) {
                game.duelistChat('Server', 'Player left the game. Duel has ended.');
                throw game;
            }

            primus.duelBroadcast(game);
            socket.write(({
                action: 'leave'
            }));

            break;
        case 'surrender':
            if (socket.slot !== undefined) {

                socket.write(({
                    action: 'surrender',
                    by: socket.slot
                }));
                game.surrender(game.player[socket.slot].name);

                game.players[0].write(({
                    action: 'side',
                    deck: game.decks[0]
                }));
                game.player[0].ready = false;
                game.players[1].write(({
                    action: 'side',
                    deck: game.decks[1]
                }));
                game.player[1].ready = false;
            }
            break;
        case 'lock':
            if (game === undefined) {
                return;
            }
            if (game.player[socket.slot].ready) {
                game.player[socket.slot].ready = false;
                game.lock[socket.slot] = false;
                primus.duelBroadcast(game, 'new game locked');
                break;
            }
            if (socket.slot === undefined) {
                return;
            }
            try {
                message.validate = validateDeck(message.deck, banlist[game.banlist], database, game.cardpool, game.prerelease);
                if (message.validate) {
                    if (message.validate.error) {
                        socket.write(({
                            errorType: 'validation',
                            action: 'error',
                            error: message.validate.error,
                            msg: message.validate.msg
                        }));
                        return;
                    }
                }
            } catch (error) {
                socket.write(({
                    error: error,
                    stack: error.stack,
                    input: (message)
                }));
                socket.write(({
                    errorType: 'validation',
                    action: 'error',
                    error: 'Server Error',
                    msg: 'Server Error'
                }));
                return;
            }

            game.player[socket.slot].ready = true;
            game.lock[socket.slot] = true;

            socket.deck = message.deck;
            socket.write(({
                action: 'lock',
                result: 'success'
            }));
            primus.duelBroadcast(game);
            if (game.player[socket.slot].ready) {
                game.duelistChat('Server', '<pre>' + game.player[socket.slot].name + ' locked in deck.</pre>');
            }
            socket.write(({
                action: 'slot',
                slot: socket.slot
            }));



            break;
        case 'start':
            if (socket.slot !== 0) {
                return;
            }


            const players = [game.player[0], game.player[1]];


            engine(game, players, []);
            primus.duelBroadcast(game);

            break;
        default:
            break;
    }
}


function websocketHandle(socket, message) {

    try {
        responseHandler(socket, message);
    } catch (error) {
        console.log(error);
        socket.write({
            error: error.message,
            stack: error.stack,
            input: (message)
        });
    }

}

getBanlist();
game = newGame({
    masterRule: 4,
    startLP: 8000,
    banlist: '2017.09.18 (TCG Advanced)'
});

primus.on('connection', function(socket) {
    socket.on('data', function(data) {
        websocketHandle(socket, data);
    });
});