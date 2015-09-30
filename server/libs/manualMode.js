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
    ROLE_SPECTATOR = 0,
    ROLE_HOST = 1,
    ROLE_PLAYER_TWO = 2,
    ROLE_PLAYER_THREE = 3,
    ROLE_PLAYER_FOUR = 4,
    DRAW_PHASE = "Draw Phase",
    STANDBY_PHASE = "Standby Phase",
    MAIN_PHASE_ONE = "Main Phase 1",
    BATTLE_PHASE = "Battle Phase",
    MAIN_PHASE_TWO = "Main Phase 2",
    END_PHASE = "End Phase",
    HAND = "Hand",
    MONSTER_ZONE = "Monster Zone",
    SPELL_ZONE = "Spell Zone",
    PENDULUM_ZONE = "Pendulum Zone",
    FIELD_ZONE = "Field Zone",
    GRAVEYARD = "Graveyard",
    BANISHED_ZONE = "Banished Zone",
    EXTRA_DECK = "Extra Deck",
    DECK = "Deck",
    QUERY_DUEL_COMMAND = "duelCommand",
    QUERY_GET_OPTIONS = "getOptions",
    QUERY_GET_STATE = "getState",
    QUERY_START_DUEL = "startDuel",
    QUERY_XYZ_SUMMON = "xyzSummon",
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
        duelID = data.duelID,
        duelQuery = data.duelQuery,
        target = data.target,
        moveTo = data.moveTo,
        hostOptions = data.hostOptions || {},
        deckList = hostOptions.deckList,
        id = client.id;
    if (!action || !uid) {
        writeResponse(client, [403, 'invalidRequest']);
        return;
    }
    switch (action) {
    case "registerUID":
        {
            if (registry.hasOwnProperty(id) || !username || typeof username !== "string" || !username.length) {
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
    case "hostDuel":
        {
            if (!duelID) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            if (!activeDuels.hasOwnProperty(duelID) && validDeck(deckList, banLists[hostOptions.banList], databases[hostOptions.database])) {
                client.join(duelID, function () {
                    activeDuels[duelID] = {
                        options: hostOptions,
                        players: {},
                        spectators: {}
                    };
                    activeDuels[duelID].players[uid] = {
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
    case "joinDuel":
        {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            switch (Object.keys(activeDuels[duelID].players).length) {
            case 1:
                {
                    if (validDeck(deckList, banLists[activeDuels[duelID].options.banList], databases[activeDuels[duelID].options.database])) {
                        client.join(duelID, function () {
                            activeDuels[duelID].players[uid] = {
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
            case 2:
                {
                    if (validDeck(deckList, banLists[activeDuels[duelID].options.banList], databases[activeDuels[duelID].options.database])) {
                        client.join(duelID, function () {
                            activeDuels[duelID].players[uid] = {
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
            case 3:
                {
                    if (validDeck(deckList, banLists[activeDuels[duelID].options.banList], databases[activeDuels[duelID].options.database])) {
                        client.join(duelID, function () {
                            activeDuels[duelID].players[uid] = {
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
            default:
                {
                    writeResponse(client, [412, 'duelRoomFull', duelID]);
                    return;
                }
            }
        }
    case "spectateDuel":
        {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            client.join(duelID, function () {
                activeDuels[duelID].spectators[uid] = {
                    ROLE: ROLE_SPECTATOR
                };
                writeResponse(client, [200, 'spectatingDuel', duelID]);
            });
            return;
        }
    case "duelQuery":
        {
            if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }
            if (duelQuery.indexOf("kick ") === 0 && activeDuels[duelID].players[uid].ROLE === ROLE_HOST) {
                duelQuery = duelQuery.split(/^kick\s/)[1];
                primus.room(duelID).write({
                    event: 'kick',
                    data: duelQuery
                });
                for (var user in registry) {
                    if (registry[user].username === duelQuery) {
                        delete activeDuels[duelID].players[registry[user].uid];
                        break;
                    }
                }
                writeResponse(client, [200, 'kickedUser', duelQuery]);
                return;
            }
            switch (duelQuery) {
            case QUERY_DUEL_COMMAND:
                {
                    if (activeDuels[duelID].players.hasOwnProperty(uid) && commandIsValid(activeDuels[duelID], uid, target, moveTo)) {
                        moveCard({
                            from: {
                                location: activeDuels[duelID].state["Player " + target.player][target.location],
                                slot: target.slot
                            },
                            to: {
                                location: activeDuels[duelID].state["Player " + moveTo.player][moveTo.location],
                                slot: moveTo.slot
                            }
                        });
                        primus.room(duelID).write({
                            event: QUERY_DUEL_COMMAND,
                            data: {
                                target: target,
                                moveTo: moveTo
                            }
                        });
                        writeResponse(client, [200, 'commandIsValid']);
                    } else {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    return;
                }
            case QUERY_XYZ_SUMMON:
                {
                    if (activeDuels[duelID].players.hasOwnProperty(uid) && xyzSummonIsValid(activeDuels[duelID], uid, target, moveTo)) {
                        primus.room(duelID).write({
                            event: QUERY_XYZ_SUMMON,
                            data: {
                                target: target,
                                moveTo: moveTo
                            }
                        });
                        writeResponse(client, [200, 'xyzSummonIsValid']);
                    } else {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    return;
                }
            case QUERY_GET_OPTIONS:
                {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID)) {
                        writeResponse(client, [403, 'invalidRequest']);
                    }
                    writeResponse(client, [200, 'getOptionsResponse', activeDuels[duelID].options]);
                    return;
                }
            case QUERY_GET_STATE:
                {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID) || !activeDuels[duelID].hasOwnProperty("state")) {
                        writeResponse(client, [403, 'invalidRequest']);
                        return;
                    }
                    writeResponse(client, [200, 'getStateResponse', activeDuels[duelID].state]);
                    return;
                }
            case QUERY_START_DUEL:
                {
                    if (!duelID || !activeDuels.hasOwnProperty(duelID) || activeDuels[duelID].players[uid].ROLE !== ROLE_HOST) {
                        writeResponse(client, [403, 'invalidRequest']);
                        return;
                    }
                    primus.room(duelID).write({
                        event: 'duelStart',
                        data: secureClientDuel(activeDuels[duelID])
                    });
                    activeDuels[duelID].state = GameState(Object.keys(activeDuels[duelID]).length - 1);
                    activeDuels[duelID].duelStarted = true;
                    for (var player in activeDuels[duelID].players) {
                        if (activeDuels[duelID].players.hasOwnProperty(player)) {
                            var playerState = activeDuels[duelID].state["Player " + activeDuels[duelID].players[player].ROLE];
                            if (!playerState) {
                                writeResponse(client, [500, 'unexpectedServerError']);
                            }
                            playerState = startDuelState(playerState, JSON.parse(JSON.stringify(activeDuels[duelID].players[player].deckList)));
                        }
                    }
                    writeResponse(client, [200, 'duelStarted', duelID]);
                    return;
                }
            default:
                {
                    writeResponse(client, [403, 'invalidRequest']);
                    return;
                }
            }
        }
    case "heartBeat":
        {
            writeResponse(client, [200, 'heartBeat']);
            return;
        }
    case "regDuelLog":
        {
            /*if (data.devKey !== process.ENV.DEVKEY) {
                writeResponse(client, [403, 'invalidRequest']);
                return;
            }*/
            writeResponse(client, [200, 'regDuelLog', {
                registry: registry,
                activeDuels: activeDuels
            }]);
            return;
        }
    default:
        {
            writeResponse(client, [403, 'invalidRequest']);
            return;
        }
    }
}

function handleClientDisconnect(client) {
    var id = client.id,
        duel;
    if (registry.hasOwnProperty(id)) {
        for (duel in activeDuels) {
            if (activeDuels.hasOwnProperty(duel) && activeDuels[duel].players.hasOwnProperty(registry[id].uid)) {
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

function writeResponse(client, dataArray) {
    // dataArray format: [responseCode, event, data]
    client.write({
        responseCode: dataArray[0],
        event: dataArray[1],
        data: dataArray[2] || {}
    });
}

function secureClientDuel(activeDuel) {
    var clientDuel = {
            options: activeDuel.options,
            players: {},
            spectators: {}
        },
        uid,
        spectator;
    for (uid in activeDuel.players) {
        if (activeDuel.players.hasOwnProperty(uid) && registry.hasOwnProperty(uid)) {
            clientDuel.players[registry[uid].username] = {
                ROLE: activeDuel.players[uid].ROLE
            };
        }
    }
    for (spectator in activeDuel.spectators) {
        if (activeDuel.spectators.hasOwnProperty(spectator) && registry.hasOwnProperty(spectator)) {
            clientDuel.spectators[registry[spectator].username] = {
                ROLE: ROLE_SPECTATOR
            }
        }
    }
    return clientDuel;
}

function validDeck(deckList, banList, database) {
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

function commandIsValid(activeDuel, uid, target, moveTo) {
    return activeDuel.players[uid].ROLE === target.player && activeDuel.state["Player " + target.player][target.location][target.slot] && !activeDuel.state["Player " + moveTo.player][moveTo.location][moveTo.slot];
}

function xyzSummonIsValid(activeDuel, uid, target, moveTo) {
    var locations = target.locations.slice(1),
        slots = target.slots.slice(1),
        playerState = activeDuel.state["Player " + target.player],
        moveToSlot = activeDuel.state["Player " + moveTo.player][moveTo.location][moveTo.slot],
        xyzMonster = playerState[target.locations[0]][target.slots[0]],
        isValid = true;
    if (activeDuel.players[uid].ROLE !== target.player || !moveToSlot || !xyzMonster) {
        isValid = false;
        return;
    }
    xyzMonster = [xyzMonster]; // to Array
    locations.forEach(function (location, i) {
        if (!playerState[location][slots[i]]) {
            isValid = false;
            return;
        }
        xyzMonster = xyzMonster.concat(playerState[location][slots[i]]);
    });
    moveToSlot = xyzMonster;
    return isValid;
}

function GameState(nPlayers) {
    var state = {
        "Turn Counter": 1,
        "Turn Player": ROLE_HOST,
        "Current Phase": DRAW_PHASE
    };
    while (nPlayers > 0) {
        state["Player " + nPlayers] = {
            "Hand": [],
            "Monster Zone": [],
            "Spell Zone": [],
            "Pendulum Zone": [],
            "Field Zone": [],
            "Graveyard": [],
            "Banished Zone": [],
            "Extra Deck": [],
            "Deck": [],
            "LP": 8000
        };
        nPlayers--;
    }
    return state;
}

function startDuelState(gameState, deckList) {
    var mainArray = [],
        extraArray = [],
        deckCopy = deckList,
        mainCard,
        extraCard;
    for (mainCard in deckCopy.main) {
        while (deckCopy.main[mainCard]--) {
            mainArray.push(mainCard);
        }
    }
    for (extraCard in deckCopy.extra) {
        while (deckCopy.extra[extraCard]--) {
            extraArray.push(extraCard);
        }
    }
    gameState[DECK] = shuffleArray(mainArray);
    gameState[EXTRA_DECK] = extraArray;
    moveCards(5, {
        from: gameState[DECK],
        to: gameState[HAND],
        dir: 0
    });
    return gameState;
}

function moveCard(move) {
    var from = move.from,
        to = move.to;
    to.location[to.slot] = from.location[from.slot];
    from.location[from.slot] = 0;
    from.location = from.location.filter(function(card) {
        return !!card;
    });
}
        

function moveCards(amount, move) {
    var from = move.from,
        to = move.to,
        dir = move.dir || 0,
        spliced;
    if (dir === 0) {
        spliced = from.splice(0, amount);
        spliced.forEach(function (card) {
            to.unshift(card);
        });
    } else {
        spliced = from.splice(from.length - amount, amount);
        spliced.forEach(function (card) {
            to.push(card);
        });
    }
}

function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function cdbUpdater() {
    for (var database in databases) {
        if (databases.hasOwnProperty(database)) {
            fs.readFile('../http/manifest/database_' + database + '.json', {
                encoding: "UTF-8"
            }, function (error, data) {
                if (error) {
                    throw error;
                }
                if (JSON.stringify(databases[database]) !== JSON.stringify(data)) {
                    databases[database] = JSON.parse(data);
                }
            });
        }
    }
}

function banListUpdater() {
    fs.readFile('../http/ygopro/lflist.conf', {
        encoding: "UTF-8"
    }, function (error, data) {
        if (error) {
            throw error;
        }
        banLists = ConfigParser(data, {
            keyValueDelim: " ",
            blockRegexp: /^\s?\!(.*?)\s?$/
        });
    });
}
