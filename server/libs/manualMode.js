// manualMode.js

var Primus = require('primus'),
    Rooms = require('primus-rooms'),
    fs = require('fs'),
    server = require('http').createServer().listen(55542),
    registry = {},
    activeDuels = {},
    ConfigParser = require('./ConfigParser.js'),
    databases = {
        "0-en-OCGTCG": [],
        "1-Anime": [],
        "2-MonsterLeague": [],
        "3-Goats": [],
        "4-Newgioh": [],
        "Z-CWA": []
    },
    banLists = {},
    cdbUpdater = function () {
        for (var database in databases) {
            if (databases.hasOwnProperty(database)) {
                fs.readFile('../http/manifest/database_' + database + '.json', { encoding: "UTF-8" }, function (error, data) {
                    if (error) {
                        throw error;
                    }
                    if (JSON.stringify(databases[database]) !== JSON.stringify(data)) {
                        databases[database] = JSON.parse(data);
                    }
                });
            }
        }
    },
    banListUpdater = function () {
        fs.readFile('../http/ygopro/lflist.conf', { encoding: "UTF-8" }, function (error, data) {
            if (error) {
                throw error;
            }
            banLists = ConfigParser(data, {
                keyValueDelim: " ",
                blockRegexp: /^\s?\!(.*?)\s?$/
            });
        });
    },
    ROLE_SPECTATOR = 0,
    ROLE_HOST = 1,
    ROLE_PLAYER_TWO = 2,
    ROLE_PLAYER_THREE = 3,
    ROLE_PLAYER_FOUR = 4,
    QUERY_DUEL_COMMAND = "duelCommand",
    QUERY_GET_OPTIONS = "getOptions",
    QUERY_GET_STATE = "getState",
    QUERY_START_DUEL = "startDuel",
    primus = new Primus(server, {
        transformer: 'websockets',
        timeout: 60000,
        cors: ["http://forum.ygopro.us", "http://ygopro.us"]
    });

cdbUpdater();
banListUpdater();
    
setInterval(banListUpdater, 120000);
    
setInterval(cdbUpdater, 120000);
    
primus.use('rooms', Rooms);

primus.on('connection', function (client) {
    client.on('data', function (data) {
        handlePrimusEvent(data, client);
    });
    client.on('end', function () {
        handleClientDisconnect(client);
    });
});

function handlePrimusEvent(data, client) {
    var data = data || {},
        action = data.action,
        uid = data.uid,
        username = data.username,
        options = data.options || {},
        hostOptions = data.hostOptions || {},
        duelID = options.duelID,
        duelQuery = options.duelQuery,
        duelCommand = options.duelCommand,
        deckList = hostOptions.deckList,
        id = client.id;
    if (!action || !uid) {
        writeResponse(client, [403, 'invalidRequest']);
        return;
    }
    switch (action) {
        case "registerUID": {
            if (registry.hasOwnProperty(id) || !username || typeof username !== "string" || !username.length)) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            registry[id] = {
                uid: uid,
                username: username
            };
            writeResponse(client, [200, 'registeredUID']);
            return;
        }
        case "hostDuel": {
            if (!duelID) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            if (!activeDuels.hasOwnProperty(duelID) && validDeck(deckList, banLists[hostOptions.banList], databases[hostOptions.database])) {
                client.join(duelID, function () {
                    activeDuels[duelID] = {
                        options: hostOptions
                    };
                    activeDuels[duelID][uid] = {
                        ROLE: ROLE_HOST,
                        deckList: deckList
                    };
                    writeResponse(client, [200, 'hostedDuel', duelID]);
                });
                return;
            } else {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
        }
        case "joinDuel": {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            switch (Object.keys(activeDuels[duelID]).length) {
                case 2: {
                    if (validDeck(deckList, banLists[activeDuels[duelID].options.banList], databases[activeDuels[duelID].options.database])) {
                        client.join(duelID, function () {
                            activeDuels[duelID][uid] = {
                                ROLE: ROLE_PLAYER_TWO,
                                deckList: deckList
                            };
                            writeResponse(client, [200, 'joinedDuel', duelID]);
                        });
                    } else {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    return;
                }
                case 3: {
                    if (validDeck(deckList, banLists[activeDuels[duelID].options.banList], databases[activeDuels[duelID].options.database])) {
                        client.join(duelID, function () {
                            activeDuels[duelID][uid] = {
                                ROLE: ROLE_PLAYER_THREE,
                                deckList: deckList
                            };
                            writeResponse(client, [200, 'joinedDuel', duelID]);
                        });
                    } else {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    return;
                }
                case 4: {
                    if (validDeck(deckList, banLists[activeDuels[duelID].options.banList], databases[activeDuels[duelID].options.database])) {
                        client.join(duelID, function () {
                            activeDuels[duelID][uid] = {
                                ROLE: ROLE_PLAYER_FOUR,
                                deckList: deckList
                            };
                            writeResponse(client, [200, 'joinedDuel', duelID]);
                        });
                    } else {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    return;
                }
                default: {
                    writeResponse(client, [412, 'duelRoomFull', duelID]);
                    return;
                }
            }
        }
        case "spectateDuel": {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            client.join(duelID, function () {
                activeDuels[duelID][uid] = {
                    ROLE: ROLE_SPECTATOR
                };
                writeResponse(client, [200, 'spectatingDuel', duelID]);
            });
            return;
        }
        case "duelQuery": {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            if (duelQuery.indexOf("kick ") === 0 && activeDuels[duelID][uid].ROLE === ROLE_HOST) {
                duelQuery = duelQuery.split('kick ')[1];
                primus.room(duelID).write({
                    event: 'kick',
                    data: duelQuery
                });
                for(var user in registry) {
                    if (registry[user].username === duelQuery) {
                        delete activeDuels[duelID][registry[user].uid];
                        break;
                    }
                }
                writeResponse(client, [200, 'kickedUser', duelQuery]);
                return;
            }
            switch (duelQuery) {
                case QUERY_DUEL_COMMAND: {
                    if (verifyClientState(activeDuels[duelID], uid, options.clientState)) {
                        primus.room(duelID).write({
                            event: 'duelCommand',
                            data: {
                                player: registry[uid].username,
                                state: clientState
                            }
                        });
                        writeResponse(client, [200, 'commandVerified']);
                    } else {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    return;
                }
                case QUERY_GET_OPTIONS: {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    writeResponse(client, [200, 'getOptionsResponse', activeDuels[duelID].options]);
                    return;
                }
                case QUERY_GET_STATE: {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID) || !activeDuels.hasOwnProperty("state")) {
                        writeResponse(client, [403, 'invalidRequest']);
                        return;
                    }
                    writeResponse(client, [200, 'getStateResponse', activeDuels[duelID].state]);
                    return;
                }
                case QUERY_START_DUEL: {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID) || activeDuels[duelID][uid].ROLE !== ROLE_HOST) {
                        writeResponse(client, [403, 'invalidRequest']);
                        return;
                    }
                    primus.room(duelID).write({
                        event: 'duelStart',
                        data: secureClientState(activeDuels[duelID])
                    });
                    activeDuels[duelID].state = GameState(Object.keys(activeDuels[duelID]).length - 1);
                    activeDuels[duelID].duelStarted = true;
                    writeResponse(client, [200, 'duelStarted', duelID]);
                    return;
                }
                default: {
                    writeResponse(client, [403, 'invalidRequest']);
                    return;
                }
            }
        }
        case "heartBeat": {
            writeResponse(client, [200, 'heartBeat']);
            return;
        }
        case "regDuelLog": {
            if (data.devKey !== process.ENV.DEVKEY) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            writeResponse(client, [200, 'regDuelLog', {
                registry: registry,
                activeDuels: activeDuels
            }]);
            return;
        }
        default: {
            writeResponse(client, [403, 'invalidRequest']);
            return;
        }
    }
}

function handleClientDisconnect (client) {
    var id = client.id,
        duel;
    if (registry.hasOwnProperty(id)) {
        for(duel in activeDuels) {
            if (activeDuels.hasOwnProperty(duel) && activeDuels[duel].hasOwnProperty(registry[id].uid)) {
                primus.room(duel).write({
                    event: 'playerDisconnect',
                    data: registry[id].username
                });
                delete activeDuels[duel];
                delete registry[id];
                return;
            }
        }
    }
}

function writeResponse (client, dataArray) {
    // dataArray format: [responseCode, event, data]
    client.write({
        responseCode: dataArray[0],
        event: dataArray[1],
        data: dataArray[2] || {}
    });
}

function secureClientState (activeDuel) {
    var clientState = {
            options: activeDuel.options
        },
        uid;
    for (uid in activeDuel) {
        if (activeDuel.hasOwnProperty(uid) && registry.hasOwnProperty(uid)) {
            clientState[registry[uid].username] = {
                ROLE: activeDuel[uid].ROLE
            };
        }
    }
    return clientState;
}

function validDeck(deckList, banList, database) {
    // deckList is a parsed YDK object
    // banList is parsed config object
    var decks = ["main", "side", "extra"],
        card,
        mainMin = 40,
        mainMax = 60,
        isValid = true,
        cardObject,
        getCardObject = function (id) {
            var cardObject,
                i = 0,
                len = database.length;
            for (i, len; i < len; i++) {
                if (id === database[i].id) {
                    cardObject = database[i];
                    break;
                }
            }
            return cardObject;
        };
    decks.forEach(function (deck) {
        if (!isValid) {
            return;
        }
        if (deck === "main") {
            if (deckList[deck + "Length"] < mainMin || deckList[deck + "Length"] > mainMax) {
                isValid = false;
                return;
            }
        } else {
            if (deckList[deck + "Length"] < 0 || deckList[deck + "Length"] > 15) {
                isValid = false;
                return;
            }
        }
        deck = deckList[deck];
        for (card in deck) {
            if (!isValid) {
                break;
            }
            if (!banList.hasOwnProperty(card) && deck[card] > 0 && deck[card] <= 3) {
                break;
            }
            if (banList.hasOwnProperty(card) && banList[card] == "0" && deck[card]) {
                isValid = false;
                break;
            }
            if (banList.hasOwnProperty(card) && deck[card] <= banList[card]) {
                break;
            }
            if (banList.hasOwnProperty(card) && deck[card] > banList[card]) {
                isValid = false;
                break;
            }
            if (deck[card] < 0 || deck[card] > 3) {
                isValid = false;
                break;
            }
            cardObject = getCardObject(parseInt(card, 10));
            if (cardObject.alias !== 0) {
                if (deck[card] + deck[cardObject.alias] > 3) {
                    isValid = false;
                    return;
                }
            }
        }
    });
    return isValid;
}

function GameState (nPlayers) {
    var state = {
        Turn_Counter: 1
    };
    if (typeof nPlayers !== "number" || isNaN(nPlayers.valueOf())) {
        nPlayers = 2;
    }
    nPlayers = (nPlayers < 2) ? 2 : (nPlayers > 4) ? 4 : nPlayers;
    while (nPlayers > 0) {
        state["Player_" + nPlayers] = {
            Hand: [
                [ /* index 0: card ID */, /* index 1: position, face-down = 0, face-up = 1 */ ],
                [ , ],
                [ , ],
                [ , ],
                [ , ]
            ],
            Monster_Zone: [
                [ /* as with hand, index 0: card ID */, /* index 1: position, face-down ATK = -1, face-down DEF = 0, face-up DEF = 1, face-up ATK = 2 */ ],
                [ , ],
                [ , ],
                [ , ],
                [ , ]
            ],
            Spell_Trap_Zone: [
                [ /* index 0: card ID */, /* index 1: position, face-down = 0, face-up = 1 */ ],
                [ , ],
                [ , ],
                [ , ],
                [ , ],
                [ , ], // index 5: Field Spell Zone
                [ , ], // index 6: Left Pendulum Scale
                [ , ], // index 7: Right Pendulum Scale
            ],
            Graveyard: [ /* array of IDs */ ],
            Banished_Zone: [
                [ /* index 0: card ID */, /* index 1: position, face-down = 0, face-up = 1 */ ],
                [ , ],
                [ , ],
                [ , ] //, etc...
            ],
            Extra_Deck: [
                [ /* index 0: card ID */, /* index 1: position, face-down = 0, face-up = 1 */ ],
                [ , ],
                [ , ],
                [ , ],
                [ , ] //, etc...
            ],
            Deck: [
                [ /* index 0: card ID */, /* index 1: position, face-down = 0, face-up = 1 */ ],
                [ , ],
                [ , ],
                [ , ],
                [ , ] //, etc...
            ],
            LP: 8000
        };
        nPlayers--;
    }
    return state;
}
                
function verifyClientState (activeDuel, uid, clientState) {
    // verifies the state sent by the client after following criteria
    //  - amount of total cards must not change
    //  - card IDs may not change
    //  - cards cannot be used interchangeably
    //  - control over cards must be labelled as such
    var deckList = activeDuel[uid].deckList;
    // TBD
}