/*jslint  node: true, plusplus: true, white: false, nomen  : true*/
// Gamelist object acts similar to a Redis server, could be replaced with on but its the gamelist state.
'use strict';

/**
 * @typedef CardRecord
 * @type {Object}
 * @property {Number} id passcode of the card.
 */

// Mostly just stuff so that Express runs
const child_process = require('child_process'),
    hotload = require('hotload'),
    cardidmap = hotload('../http/cardidmap.js'),
    express = require('express'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    toobusy = require('toobusy-js'),
    app = express(),
    compression = require('compression'),
    hsts = require('hsts'),
    Ddos = require('ddos'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    Primus = require('primus'),
    Rooms = require('primus-rooms'),
    domain = require('domain'),
    ps = require('ps-node'),
    userController = require('./controller_users.js'),
    forumController = require('./controller_forum.js'),
    pack = require('../package.json'),
    adminlist = hotload('./record_admins.js'),
    HTTP_PORT = pack.port || 80,
    ddos = new Ddos({
        maxcount: 2000,
        burst: 500,
        limit: 500 * 10,
        maxexpiry: 15,
        checkinterval: 5,
        trustProxy: true,
        includeUserAgent: true,
        whitelist: [],
        errormessage: 'Error',
        testmode: false,
        silent: true,
        silentStart: true,
        responseStatus: 429
    }),
    registry = {
        //People that have read this source code.
        SnarkyChild: '::ffff:127.0.0.1',
        AccessDenied: '::ffff:127.0.0.1',
        Irate: '::ffff:127.0.0.1',
        Chibi: '::ffff:127.0.0.1',
        OmniMage: '::ffff:127.0.0.1'
    },
    manualController = require('./controller_dueling.js');

var userlist = [],
    chatbox = [],
    sayCount = 0,
    primus,
    online = 0,
    activeDuels = 0,
    logins = 0,
    booting = true,
    lockStatus = false,
    primusServer,
    currentGlobalMessage = '';


app.use(ddos.express);
app.use(compression());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Body parser use JSON data

app.use(function(req, res, next) {
    var processing = toobusy();
    if (processing && req.headers['Content-Type'] !== 'application/json') {
        res.status(503).send(`<html><head>
        <title>YGOSalvation</title>
        <style>
        body {color:white;background:black; text-align:center}
        div {margin-top:45vh}
        </style>
        </head><body>
            <div>Server is loading,...</div>
            <script>
                setTimeout(window.location.reload.bind(window.location),5000);
            </script>
        </body></html>`);
    } else {
        if (req.get('host') === 'ygopro.us') {
            res.redirect(301, 'https://ygosalvation.com' + req.url);
            res.end();
        } else {
            next();
        }
    }
});


app.use(express.static(path.join(__dirname, '../http')));
/**
 * Maps a deck to updated IDs.
 * @param   {CardRecord[]} deck A deck of cards from the user possibly containing old cards.
 * @returns {CardRecord[]} A deck of cards from the user.
 */
function mapCards(deck) {
    return deck.map(function(cardInDeck) {
        if (cardidmap[cardInDeck.id]) {
            return {
                id: cardidmap[cardInDeck.id]
            };
        } else {
            // else we just return out the old card object
            return cardInDeck;
        }
    });
}

function gitRoute(req, res, next) {
    manualController.setter();
    child_process.spawn('git', ['pull'], {}, function() {
        console.log('finished running git');
    });
}

app.post('/git', function(req, res, next) {
    gitRoute(req, res, next);
});

app.git('/git', function(req, res, next) {
    gitRoute(req, res, next);
});


app.get('/decks', function(req, res, next) {

    userController.getAllUsersDecks(function(error, decks) {
        if (error) {
            next();
        }
        res.write(JSON.stringify(decks));
        next();
    });
});

app.get('/usercount', function(req, res, next) {

    userController.getUserCount(function(error, count) {
        res.write(JSON.stringify({
            usercount: count,
            error: error
        }));
        next();
    });
});



userController.setupRegistrationService(app);
forumController(app);

try {
    var privateKey = fs.readFileSync(path.resolve(process.env.SSL + '\\private.key')).toString(),
        certificate = fs.readFileSync(path.resolve(process.env.SSL + '\\certificate.crt')).toString(),
        openserver = express();



    primusServer = https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(443);

    // set up a route to redirect http to spdy
    openserver.use(helmet());
    openserver.use(ddos.express);
    openserver.get('*', function(req, res) {
        if (req.get('host') === 'ygopro.us') {
            res.redirect(301, 'https://ygosalvation.com' + req.url);
        } else {
            res.redirect(301, 'https://' + req.get('host') + req.url);
        }
    });
    openserver.listen(HTTP_PORT);
} catch (nossl) {
    console.log('Failed to apply SSL to HTTP server', nossl.code);
    primusServer = http.createServer(app);
    primusServer.listen(HTTP_PORT);
}





primus = new Primus(primusServer, {
    parser: 'JSON'
});

primus.use('rooms', Rooms);

var duelLogic = manualController.init(primus);


var Datastore = require('nedb'),
    deckStorage = new Datastore({
        filename: './databases/deckStorage.nedb',
        autoload: true
    });



function announce(announcement) {
    primus.write(announcement);
}





var pidList = [];

var acklevel = 0;

function massAck() {
    acklevel = 0;
    userlist = [];
    announce({
        clientEvent: 'ack'
    });

}




setInterval(function() {
    announce({
        clientEvent: 'ackresult',
        ackresult: acklevel,
        userlist: userlist
    });
    massAck();
}, 15000);




function registrationCall(data, socket) {
    userController.validate(true, data, function(error, valid, info) {

        if (error) {
            console.log(error);
            socket.write({
                clientEvent: 'servererror',
                message: currentGlobalMessage
            });
            socket.write({
                clientEvent: 'login',
                info: {
                    message: error.message
                },
                error: error
            });
            return;
        }
        if (valid) {
            registry[info.username] = socket.address.ip;
            socket.username = info.username;

            socket.write({
                clientEvent: 'global',
                message: currentGlobalMessage,
                admin: adminlist[data.username]
            });
            socket.write({
                clientEvent: 'ackresult',
                ackresult: acklevel,
                userlist: userlist
            });
            socket.speak = true;
            socket.write({
                clientEvent: 'login',
                info: {
                    username: info.username,
                    decks: info.decks,
                    friends: info.friends,
                    session: info.session,
                    sessionExpiration: info.sessionExpiration,
                    ranking: info.ranking,
                    admin: info.admin,
                    rewards: info.rewards,
                    settings: info.settings,
                    bans: info.bans
                },
                chatbox: chatbox
            });
            socket.join(socket.username);

        } else {
            socket.write({
                clientEvent: 'servererror',
                message: currentGlobalMessage
            });
            socket.write({
                clientEvent: 'login',
                info: info
            });
        }

    });
}

function globalCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            console.log('[Gamelist]', error);
            return;
        }
        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'global',
                message: data.message
            });
            currentGlobalMessage = data.message;
        } else {
            console.log(data, 'asked for global', 'Info Was', info.success, 'Is Admin was', adminlist[data.username]);
        }
    });
}

function globalRequested(socket) {
    socket.write({
        clientEvent: 'global',
        message: currentGlobalMessage
    });
}


function genocideCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }
        if (info.data) {
            if (info.success && info.data.g_access_cp === '1') {
                announce({
                    clientEvent: 'genocide',
                    message: data.message
                });
            } else {
                console.log(data, 'asked for genocide');
            }
        } else {
            console.log(data, 'asked for genocide');
        }
    });
}

function reviveCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'revive',
                target: data.target
            });

        } else {
            console.log(data, 'asked for murder');
        }

    });
}


function murderCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'murder',
                target: data.target
            });
        } else {
            console.log(data, 'asked for murder');
        }

    });
}

function censorCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'censor',
                messageID: data.messageID
            });
            chatbox = chatbox.filter(function(message) {
                return message.uid !== Number(data.messageID);
            });

        } else {
            console.log(data, 'asked for censor');
        }

    });
}

function mindcrushCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'mindcrush',
                target: data.target
            });

        } else {
            console.log(data, 'asked for mind crush');
        }

    });
}

function aiRestartCall(data) {
    userController.validate(false, data, function(error, info, body) {
        if (error) {
            return;
        }

        if (info.success && adminlist[data.username]) {
            announce({
                clientEvent: 'airestart'
            });

        } else {
            console.log(data, 'asked for murder');
        }

    });
}








var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*',
    tagOrComment = new RegExp(
        '<(?:' + '!--(?:(?:-*[^->])*--+|-?)|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' + '|/?[a-z]' + tagBody + ')>',
        'gi'
    );

function removeTags(html) {
    var oldHtml;
    do {
        oldHtml = html;
        html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
}

function onData(data, socket) {
    var socketwatcher = domain.create(),
        action,
        save;
    socketwatcher.on('error', function(err) {
        if (err.message === 'TypeError: Cannot read property \'forwarded\' of undefined') {
            // not sure how to handle this yet.
            return;
        }
        console.log('[Gamelist]Error-Critical:', err);
    });
    socketwatcher.enter();
    data = data || {};
    action = data.action;
    save = false;
    if (socket.readyState !== primus.Spark.CLOSED) {
        save = true;
    }
    if (save === false) {
        return;
    }


    socket.join(socket.address.ip + data.uniqueID);
    switch (action) {



        case ('duelrequest'):

            announce({
                clientEvent: 'duelrequest',
                target: data.target,
                from: data.from,
                roompass: data.roompass
            });

            break;
        case ('ai'):
            if (socket.username && socket.aiReady) {
                console.log(socket.username, 'requested AI Duel');
                announce({
                    clientEvent: 'duelrequest',
                    target: 'SnarkyChild',
                    from: socket.username,
                    roompass: data.roompass,
                    deck: data.deck
                });
                socket.aiReady = false;
                setTimeout(function() {
                    socket.aiReady = true;
                }, 10000);
            }
            break;

        case ('ack'):
            acklevel += 1;
            if (data.name) {
                userlist.push(data.name);
            }
            break;
        case ('register'):
            registrationCall(data, socket);
            break;
        case ('chatline'):
            if (socket.username && socket.speak) {
                socket.speak = false;
                if (chatbox.length > 100) {
                    chatbox.shift();
                }
                announce({
                    clientEvent: 'chatline',
                    from: socket.username,
                    msg: removeTags(data.msg),
                    uid: sayCount,
                    date: new Date(),
                    timezone: data.timezone
                });
                chatbox.push({
                    from: socket.username,
                    msg: removeTags(data.msg),
                    uid: sayCount,
                    date: new Date(),
                    timezone: data.timezone
                });
                sayCount = +1;
                setTimeout(function() {
                    socket.speak = true;
                }, 500);
            } else {
                primus.room(socket.address.ip + data.uniqueID).write({
                    clientEvent: 'slowchat',
                    error: 'Exceeded 500ms chat timeout'
                });
            }
            break;
        case ('global'):
            globalCall(data);
            break;
        case ('globalrequest'):
            globalRequested(socket);
            break;
        case ('genocide'):
            genocideCall(data);
            break;
        case ('murder'):
            murderCall(data);
            break;
        case ('censor'):
            censorCall(data);
            break;
        case ('revive'):
            reviveCall(data);
            break;
        case ('mindcrush'):
            mindcrushCall(data);
            break;
        case ('airestart'):
            aiRestartCall(data);
            break;
        case ('internalRestart'):
            if (data.password !== process.env.OPERPASS) {
                return;
            }
            //restartAnnouncement();
            break;
        case ('restart'):
            //restartCall(data);
            break;

        case ('privateServerRequest'):
            primus.room(socket.address.ip + data.uniqueID).write({
                clientEvent: 'privateServerRequest',
                parameter: data.parameter,
                local: data.local
            });
            break;


        case ('privateMessage'):
            if (socket.username) {
                data.date = new Date();
                console.log(data);
                primus.room(data.to).write(data);
            }
            break;
        case 'save':
            delete data.action;
            data.decks.forEach(function(deck, i) { //cycles through the decks
                data.decks[i].main = mapCards(data.decks[i].main); //This cannot be simplified 
                data.decks[i].side = mapCards(data.decks[i].side); //further due to the abstract
                data.decks[i].extra = mapCards(data.decks[i].extra); //of data.decks, afaik
            }); //unsure if loop should run through all decks for a single save; might be resource intensive
            userController.saveDeck(data, function(error, docs) {
                primus.room(socket.address.ip + data.uniqueID).write({
                    clientEvent: 'deckSaved',
                    error: error
                });
            });

            break;
        default:
            duelLogic(socket, data);
    }

    socketwatcher.exit();

}

primus.on('connection', function(socket) {
    var connectionwatcher = domain.create();
    connectionwatcher.on('error', function(err) {
        console.log('[Gamelist]Error Critical User-Connection:', err);
    });
    connectionwatcher.enter();
    socket.on('error', function(error) {
        console.log('[Gamelist]:Generic Socket Error:', error);
    });
    socket.aiReady = true;
    socket.on('data', function(data) {
        var save = false;
        if (socket.readyState !== primus.Spark.CLOSED) {
            save = true;
        }
        if (save === false) {
            return;
        }
        onData(data, socket);
    });
    connectionwatcher.exit();
});