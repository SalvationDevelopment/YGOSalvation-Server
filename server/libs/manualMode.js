// manualMode.js

var Primus = require('primus'),
    Rooms = require('primus-rooms'),
    server = require('http').createServer().listen(55542),
    registry = {},
    activeDuels = {},
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

primus.use('rooms', Rooms);

primus.on('connection', function (spark) {
    spark.on('data', function (data) {
        handlePrimusEvent(data, spark);
    });
    spark.on('end', function () {
        handleClientDisconnect(spark);
    });
});

function handlePrimusEvent(data, spark) {
    var data = data || {},
        action = data.action,
        uid = data.uid,
        username = data.username,
        duelOptions = data.duelOptions,
        duelID = duelOptions.duelID,
        duelQuery = duelOptions.duelQuery,
        duelCommand = duelOptions.duelCommand,
        id = spark.id;
    if (!action || !uid) {
        writeResponse(spark, [403, 'invalidRequest']);
        return;
    }
    switch (action) {
        case "registerUID": {
            if (registry.hasOwnProperty(id)) {
                writeResponse(spark, [403, 'invalidRequest']);
                return;
            }
            registry[id] = {
                uid: uid,
                username: username
            };
            writeResponse(spark, [200, 'registeredUID']);
            return;
        }
        case "hostDuel": {
            if (!duelID) {
                writeResponse(spark, [403, 'invalidRequest']);
                return;
            }
            if (!activeDuels.hasOwnProperty(duelID)) {
                spark.join(duelID, function () {
                    activeDuels[duelID] = {
                        options: duelOptions
                    };
                    activeDuels[duelID][uid] = {
                        ROLE: ROLE_HOST
                    };
                    writeResponse(spark, [200, 'hostedDuel', duelID]);
                });
                return;
            } else {
                writeResponse(spark, [403, 'invalidRequest']);
                return;
            }
        }
        case "joinDuel": {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(spark, [403, 'invalidRequest']);
                return;
            }
            switch (Object.keys(activeDuels[duelID]).length) {
                case 2: {
                    spark.join(duelID, function () {
                        activeDuels[duelID][uid] = {
                            ROLE: ROLE_PLAYER_TWO
                        };
                        writeResponse(spark, [200, 'joinedDuel', duelID]);
                    });
                    return;
                }
                case 3: {
                    spark.join(duelID, function () {
                        activeDuels[duelID][uid] = {
                            ROLE: ROLE_PLAYER_THREE
                        };
                        writeResponse(spark, [200, 'joinedDuel', duelID]);
                    });
                    return;
                }
                case 4: {
                    spark.join(duelID, function () {
                        activeDuels[duelID][uid] = {
                            ROLE: ROLE_PLAYER_FOUR
                        };
                        writeResponse(spark, [200, 'joinedDuel', duelID]);
                    });
                    return;
                }
                default: {
                    writeResponse(spark, [412, 'duelRoomFull', duelID]);
                    return;
                }
            }
        }
        case "spectateDuel": {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(spark, [403, 'invalidRequest']);
                return;
            }
            spark.join(duelID, function () {
                activeDuels[duelID][uid] = {
                    ROLE: ROLE_SPECTATOR
                };
                writeResponse(spark, [200, 'spectatingDuel', duelID]);
            });
            return;
        }
        case "duelQuery": {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(spark, [403, 'invalidRequest']);
                return;
            }
            if (duelQuery.indexOf("kick ") === 0 && activeDuels[duelID][uid].ROLE === ROLE_HOST) {
                duelQuery = duelQuery.split(' ')[1];
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
                writeResponse(spark, [200, 'kickedUser', duelQuery]);
                return;
            }
            switch (duelQuery) {
                case QUERY_DUEL_COMMAND: {
                    processDuelCommand(duelCommand, duelID, spark);
                    return;
                }
                case QUERY_GET_OPTIONS: {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                        writeResponse(spark, [403, 'invalidRequest']);
                    }
                    writeResponse(spark, [200, 'getOptionsResponse', activeDuels[duelID].options]);
                    return;
                }
                case QUERY_GET_STATE: {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID) || !activeDuels.hasOwnProperty("state")) {
                        writeResponse(spark, [403, 'invalidRequest']);
                        return;
                    }
                    writeResponse(spark, [200, 'getStateResponse', activeDuels[duelID].state]);
                    return;
                }
                case QUERY_START_DUEL: {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID) || activeDuels[duelID][uid].ROLE !== ROLE_HOST) {
                        writeResponse(spark, [403, 'invalidRequest']);
                        return;
                    }
                    primus.room(duelID).write({
                        event: 'duelStart',
                        data: secureClientState(activeDuels[duelID])
                    });
                    activeDuels[duelID].state = GameState(Object.keys(activeDuels[duelID]).length - 1);
                    activeDuels[duelID].duelStarted = true;
                    writeResponse(spark, [200, 'duelStarted', duelID]);
                    return;
                }
                default: {
                    writeResponse(spark, [403, 'invalidRequest']);
                    return;
                }
            }
        }
        case "heartBeat": {
            writeResponse(spark, [200, 'heartBeat']);
            return;
        }
        case "regDuelLog": {
            writeResponse(spark, [200, {
                registry: registry,
                activeDuels: activeDuels
            }]);
            return;
        }
        default: {
            writeResponse(spark, [403, 'invalidRequest']);
            return;
        }
    }
}

function handleClientDisconnect(spark) {
    var id = spark.id,
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

function writeResponse(spark, dataArray) {
    // dataArray format: [responseCode, event, data]
    spark.write({
        responseCode: dataArray[0],
        event: dataArray[1],
        data: dataArray[2] || {}
    });
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

function loadClientState (clientState, activeDuel, playerN) {
    // clientState is an object returned by client-side GameState
    // will add more extensive verification later, for now just insert player state
    var templateState = GameState(1), // generate game state to compare
        clientProperty;
    for (clientProperty in clientState) {
        if (templateState.Player_1.hasOwnProperty(clientProperty)) {
            templateState.Player_1[clientProperty] = clientState[clientProperty];
        }
    }
    activeDuel[playerN] = templateState.Player_1;
    return activeDuel;
}

function changeLP (queryLP, activeDuel, playerN) {
    switch (typeof queryLP) {
        case "string": {
            activeDuel[playerN].LP = (queryLP.trim().charAt(0) === "+" ? (activeDuel[playerN].LP + queryLP.trim().substr(1)) : (activeDuel[playerN].LP - queryLP.trim().substr(1)));
            return activeDuel[playerN];
        }
        case "number": {
            activeDuel[playerN].LP = queryLP;
            return activeDuel[playerN];
        }
    }
}
