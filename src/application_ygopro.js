require('dotenv').config();


const fs = require('fs'),
    http = require('http'),
    engine = require('./engine_ocgcore'),
    Primus = require('primus'),
    Rooms = require('server-rooms'),
    validateDeck = require('./validate_deck.js'),
    database = require('../http/manifest/manifest_0-en-OCGTCG.json'),
    banlist = {},
    port = process.env.PORT || 8082,
    static = require('node-static'),
    file = new static.Server('../http', { cache: 0 }),
    game = {
        priority: false,
        draw_count: process.env.DRAW_COUNT || 1,
        start_hand_count: process.env.STARTING_HAND || 5,
        time: process.env.TIME_LIMIT || 3000,
        shuffleDeck: process.env.SHUFFLE || false,
        startLP: process.env.LIFEPOINTS || 8000,
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
        player: []
    };


function staticSystem(request, response) {
    request.addListener('end', function() {
        file.serve(request, response);
    }).resume();
}


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


function broadcast(server) {
    server.write({
        action: 'lobby',
        game: game
    });
}

function ping(server) {
    server.room('main').send({
        port: process.env.PORT,
        game: game
    });
}

function register(spark, message) {
    // Expand later
    spark.username = message.username;
    spark.write({
        action: 'registered'
    });
}

function join(server, spark) {
    spark.slot = undefined;
    game.player.some(function(player, index) {
        if (player) {
            return false;
        }
        spark.slot = index;
        spark.joined = true;
        game.player[index] = spark;
        return true;
    });

    broadcast(server);
    spark.write(({
        action: 'lobby',
        game: game
    }));
}

function leave(message) {
    if (game.player[message.slot]) {
        game.player[message.slot].write(({
            action: 'leave'
        }));
    }
    game.player[message.slot] = null;
}

function kick(spark, message) {
    if (spark.slot !== 0) {
        return;
    }
    leave(message);
}

function surrender(message) {
    if (!game.duel) {
        return;
    }
    game.duel.surrender(message.slot);
}

function deckCheck(spark, message) {
    message.validate = validateDeck(message.deck, banlist[game.banlist], database, game.cardpool, game.prerelease);
    if (message.validate) {
        if (message.validate.error) {
            spark.write(({
                errorType: 'validation',
                action: 'error',
                error: message.validate.error,
                msg: message.validate.msg
            }));
            return false;
        }
    }
    spark.write(({
        action: 'lock',
        result: 'success'
    }));
    return true;
}

function lock(spark, message) {
    if (spark.slot === undefined) {
        return;
    }
    if (game.player[spark.slot].ready) {
        game.player[spark.slot].ready = false;
        return;
    }
    try {
        game.player[spark.slot].ready = deckCheck(spark, message);
    } catch (error) {
        game.player[spark.slot].ready = false;
        throw error;
    }
    game.player[spark.slot].deck = message.deck;
}

function start(spark) {
    if (spark.slot !== 0) {
        return;
    }
    const players = [game.player[0], game.player[1]];
    engine(game, players, []);
    broadcast(server);
}

function controller(server, spark, message) {
    //console.log(message);
    if (!message.action) {
        return;
    }
    switch (message.action) {
        case 'ping':
            ping(server);
            break;
        case 'register':
            register(spark, message);
            break;
        case 'join':
            join(spark);
            break;
        case 'kick':
            kick(spark, message);
            break;
        case 'leave':
            leave(message);
            break;
        case 'surrender':
            surrender(message);
            break;
        case 'lock':
            lock(spark, message);
            break;
        case 'start':
            start(spark);
            break;
        default:
            break;
    }
    broadcast(server);
}


function messageHandler(server, spark, message) {
    try {
        controller(server, spark, message);
    } catch (error) {
        console.log(error);
        spark.write({
            error: error.message,
            stack: error.stack,
            input: (message)
        });
    }

}

function main() {
    const server = new Primus(http.createServer(staticSystem), {
        parser: 'JSON'
    }).listen(port, getBanlist);

    server.plugin('rooms', Rooms);

    server.save(__dirname + '/../http/js/vendor/server.js');
    server.on('connection', function(spark) {
        spark.on('data', function(data) {
            messageHandler(server, spark, data);
        });
    });
}