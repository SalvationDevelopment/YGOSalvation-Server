require('dotenv').config();
var fs = require('fs'),
    http = require('http'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    validateDeck = require('./validate_deck.js'),
    database = require('../http/manifest/manifest_0-en-OCGTCG.json'),
    ygopro = require('./engine_ygopro.js'),
    banlist = {},
    ygopros = {},
    port = process.env.PORT || 8082,
    realgames = [],
    stateSystem = require('./engine_manual.js'),
    games = {},
    states = {},
    log = {},
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
 * @param {Object} settings game settings
 * @returns {object} customized game object
 */
function newGame(settings) {
    return {
        roompass: settings.roompass,
        started: false,
        deckcheck: 0,
        draw_count: 0,
        ot: parseInt(settings.ot, 10),
        banlist: settings.banlist,
        banlistid: settings.banlistid,
        mode: settings.mode,
        cardpool: settings.cardpool,
        noshuffle: settings.shuf,
        prerelease: settings.prerelease,
        masterRule: 4 || banlist[settings.banlist].masterRule,
        legacyfield: false, //(banlist[settings.banlist].masterRule !== 4),
        rule: 0,
        startLP: settings.startLP,
        starthand: 0,
        timelimit: 0,
        player: {
            0: {
                name: '',
                ready: false
            },
            1: {
                name: '',
                ready: false
            }
        },
        spectators: [],
        delCount: 0
    };
}

/**
 * Create a function that sorts to the correct viewers.
 * @param   {Object} game active game
 * @returns {function} binding function
 */
function socketBinding(game) {

    /**
     * response handler
     * @param {Object} view  view definition set
     * @param {Array} stack of cards
     * @param {callback} callback optional finishing function
     * @returns {undefined} 
     */
    function gameResponse(view, stack, callback) {
        if (stateSystem[game] === undefined) {
            return;
        }
        try {


            if (stateSystem[game] && view !== undefined) {
                if (stateSystem[game].players) {
                    if (stateSystem[game].players[0]) {
                        if (stateSystem[game].players[0].slot === 0) {
                            stateSystem[game].players[0].write((view['p' + stateSystem[game].players[0].slot]));
                        }
                    }
                    if (stateSystem[game].players[1]) {
                        if (stateSystem[game].players[1].slot === 1) {
                            stateSystem[game].players[1].write((view['p' + stateSystem[game].players[1].slot]));
                        }
                    }

                    Object.keys(stateSystem[game].spectators).forEach(function(username) {
                        var spectator = stateSystem[game].spectators[username];
                        spectator.write((view.spectators));
                    });
                }
            }
        } catch (error) {
            console.log('failed messaging socket', error);
        } finally {
            if (callback) {
                callback(stack);
            }
        }
    }
    return gameResponse;
}

/**
 * Return a random string.
 * @param   {Number} len Length of resulting string
 * @returns {String} random string
 */
function randomString(len) {
    var i,
        text = '',
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (i = 0; i < len; i += 1) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

const primus = new Primus(primusServer, {
    parser: 'JSON'
});

primus.plugin('rooms', Rooms);

primus.save(__dirname + '/../http/js/vendor/primus.js');

primus.duelBroadcast = function broadcast() {
    Object.keys(games).forEach(function(key) {
        try {
            if (games[key].player[0].name === '' && games[key].player[1].name === '') {
                games[key].delCount += 1;
            }
            if (games[key].delCount > 10) {
                delete games[key];
            }
        } catch (failedDeletion) {
            console.log('failedDeletion', failedDeletion);
        }
    });
    primus.write({
        duelAction: 'broadcast',
        data: games
    });
};



function ackgames() {
    Object.keys(games).forEach(function(key) {
        if (realgames.indexOf(key) > -1) {
            return;
        } else {
            delete games[key];
        }
    });
    realgames = [];
    primus.clients.forEach(function each(client) {
        client.write(({
            duelAction: 'ack'
        }));
    });
}

//setInterval(ackgames, 60000);

function duelBroadcast(duel, message) {
    stateSystem[duel].players[0].write((message));
    stateSystem[duel].players[1].write((message));
}

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
                games: games
            });
            break;
        case 'host':
            generated = randomString(12);
            games[generated] = newGame(message);
            log[generated] = [];
            stateSystem[generated] = {

            };
            games[generated].player[0].name = message.name;
            stateSystem[generated].players[0] = socket;
            stateSystem[generated].setNames(socket.username, 0);
            socket.activeduel = generated;
            primus.duelBroadcast(games);
            socket.write(({
                duelAction: 'lobby',
                game: generated
            }));
            socket.slot = 0;
            setTimeout(function() {
                stateSystem[generated].duelistChat('Gamelist', '90min Time limit reached. Ending the duel');
                delete games[generated];
                delete stateSystem[generated];
            }, 10800000); // 180 mins.


            break;

        case 'join':
            socket.slot = undefined;
            Object.keys(games[message.game].player).some(function(playerNo, index) {
                var player = games[message.game].player[playerNo];
                if (player.name !== '') {
                    return false;
                }
                joined = true;
                player.name = message.name;
                socket.slot = index;

                return true;
            });
            if (!joined && stateSystem[message.game]) {

                if (games[message.game].started) {


                }
            }

            primus.duelBroadcast(games);
            socket.write(({
                duelAction: 'lobby',
                game: games[message.game]
            }));
            socket.activeduel = message.game;
            break;
        case 'kick':
            if (socket.slot !== undefined) {
                if (socket.slot === 0) {
                    stateSystem[message.game].players[message.slot].write(({
                        duelAction: 'kick'
                    }));

                }
            }
            break;
        case 'leave':
            socket.activeduel = undefined;
            if (socket.slot !== undefined && games[activeduel]) {
                games[activeduel].player[socket.slot].name = '';
                games[activeduel].player[socket.slot].ready = false;
            } else if (stateSystem[activeduel]) {
                delete stateSystem[activeduel].spectators[message.name];
            }
            socket.slot = undefined;
            if (games[activeduel]) {
                if (games[activeduel].player[0].name === '' && games[activeduel].player[1].name === '') {
                    delete games[activeduel];
                }
            }
            if (games[activeduel]) {
                if ((games[activeduel].player[0].name === '' || games[activeduel].player[1].name === '') && games[activeduel].started === true) {
                    stateSystem[activeduel].duelistChat('Server', 'Player left the game. Duel has ended.');
                    delete games[activeduel];
                }
            }
            primus.duelBroadcast(games);
            socket.write(({
                duelAction: 'leave'
            }));

            break;
        case 'surrender':
            if (socket.slot !== undefined) {

                socket.write(({
                    duelAction: 'surrender',
                    by: socket.slot
                }));
                stateSystem[activeduel].surrender(games[activeduel].player[socket.slot].name);

                stateSystem[activeduel].players[0].write(({
                    duelAction: 'side',
                    deck: stateSystem[activeduel].decks[0]
                }));
                games[activeduel].player[0].ready = false;
                stateSystem[activeduel].players[1].write(({
                    duelAction: 'side',
                    deck: stateSystem[activeduel].decks[1]
                }));
                games[activeduel].player[1].ready = false;
            }
            break;
        case 'lock':
            if (games[activeduel] === undefined) {
                return;
            }
            if (games[activeduel].player[socket.slot].ready) {
                games[activeduel].player[socket.slot].ready = false;
                stateSystem[activeduel].lock[socket.slot] = false;
                primus.duelBroadcast(games, 'new game locked');
                break;
            }
            if (socket.slot !== undefined) {
                try {
                    message.validate = validateDeck(message.deck, banlist[games[activeduel].banlist], database, games[activeduel].cardpool, games[activeduel].prerelease);
                    if (message.validate) {
                        if (message.validate.error) {
                            socket.write(({
                                errorType: 'validation',
                                duelAction: 'error',
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
                        duelAction: 'error',
                        error: 'Server Error',
                        msg: 'Server Error'
                    }));
                    return;
                }

                games[activeduel].player[socket.slot].ready = true;
                stateSystem[activeduel].lock[socket.slot] = true;

                stateSystem[activeduel].decks[socket.slot] = message.deck;
                socket.write(({
                    duelAction: 'lock',
                    result: 'success'
                }));
                primus.duelBroadcast(games);
                if (games[activeduel].player[socket.slot].ready) {
                    stateSystem[activeduel].duelistChat('Server', '<pre>' + games[activeduel].player[socket.slot].name + ' locked in deck.</pre>');
                }
                socket.write(({
                    duelAction: 'slot',
                    slot: socket.slot
                }));

            }

            break;
        case 'start':
            if (socket.slot !== undefined) {
                player1 = stateSystem[activeduel].decks[0];
                player2 = stateSystem[activeduel].decks[1];
                if (games[activeduel].automatic) {
                    const players = [stateSystem[activeduel].players[0], stateSystem[activeduel].players[1]];
                    players.forEach(function(item, iteration) {
                        item.activeduel = activeduel;
                    });
                    players[0].deck = player1;
                    players[1].deck = player2;
                    ygopros[activeduel] = ygopro(Object.assign({}, games[activeduel]), players);
                    games[activeduel].started = true;
                    primus.duelBroadcast(games);
                } else {
                    stateSystem[activeduel].startDuel(player1, player2, true, games[activeduel]);
                    games[activeduel].started = true;
                    primus.duelBroadcast(games);
                }

            }
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
games.default_game = newGame({
    masterRule: 4,
    startLP: 8000
});

primus.on('connection', function(socket) {
    socket.on('data', function(data) {
        websocketHandle(socket, data);
    });
});