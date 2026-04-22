/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';


/**
 * Update the banlist
 */

var banlist = {};



/**
 * Executes the broadcast helper used by the controller manual module.
 * @param {Array} players The players array supplies the ordered values used by the controller manual module.
 * @param {Object} message The message value provides an input used by the controller manual module.
 * @returns {void} Does not return a value.
 */
function broadcast(players, message) {
    players[0].write((message));
    players[1].write((message));
}

/**
 * Executes the response handler helper used by the controller manual module.
 * @param {Object} engine The engine object supplies the structured input used by the controller manual module, including the `addCounter`, `answerListener`, `changeLifepoints`, `drawCard`, `duelistChat`, `excavateCard`, `findUIDCollection`, `flipCoin`, `flipDeck`, `makeNewCard`, `millCard`, `millRemovedCard`, `millRemovedCardFaceDown`, `nextPhase`, `nextTurn`, `offsetZone`, `relayYGOPro`, `removeCard`, `removeCounter`, `revealBottom`, `revealCallback`, `revealDeck`, `revealExcavated`, `revealExtra`, `revealHand`, `revealTop`, `rollDie`, `rps`, `setState`, `shuffleDeck`, `shuffleHand`, `viewBanished`, `viewDeck`, `viewExcavated`, `viewExtra`, `viewGrave`, `viewXYZ`, and `ygoproUpdate` properties.
 * @param {Function} engine.addCounter The `addCounter` property supplies structured input used by the controller manual module.
 * @param {Function} engine.answerListener The `answerListener` property supplies structured input used by the controller manual module.
 * @param {(number|Function)} engine.changeLifepoints The `changeLifepoints` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.drawCard The `drawCard` property supplies structured input used by the controller manual module.
 * @param {Function} engine.duelistChat The `duelistChat` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.excavateCard The `excavateCard` property supplies structured input used by the controller manual module.
 * @param {Function} engine.findUIDCollection The `findUIDCollection` property supplies structured input used by the controller manual module.
 * @param {Function} engine.flipCoin The `flipCoin` property supplies structured input used by the controller manual module.
 * @param {Function} engine.flipDeck The `flipDeck` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.makeNewCard The `makeNewCard` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.millCard The `millCard` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.millRemovedCard The `millRemovedCard` property supplies structured input used by the controller manual module.
 * @param {Function} engine.millRemovedCardFaceDown The `millRemovedCardFaceDown` property supplies structured input used by the controller manual module.
 * @param {Function} engine.nextPhase The `nextPhase` property supplies structured input used by the controller manual module.
 * @param {Function} engine.nextTurn The `nextTurn` property supplies structured input used by the controller manual module.
 * @param {Function} engine.offsetZone The `offsetZone` property supplies structured input used by the controller manual module.
 * @param {Function} engine.relayYGOPro The `relayYGOPro` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.removeCard The `removeCard` property supplies structured input used by the controller manual module.
 * @param {Function} engine.removeCounter The `removeCounter` property supplies structured input used by the controller manual module.
 * @param {Function} engine.revealBottom The `revealBottom` property supplies structured input used by the controller manual module.
 * @param {Function} engine.revealCallback The `revealCallback` property supplies structured input used by the controller manual module.
 * @param {Function} engine.revealDeck The `revealDeck` property supplies structured input used by the controller manual module.
 * @param {Function} engine.revealExcavated The `revealExcavated` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.revealExtra The `revealExtra` property supplies structured input used by the controller manual module.
 * @param {Function} engine.revealHand The `revealHand` property supplies structured input used by the controller manual module.
 * @param {Function} engine.revealTop The `revealTop` property supplies structured input used by the controller manual module.
 * @param {Function} engine.rollDie The `rollDie` property supplies structured input used by the controller manual module.
 * @param {Function} engine.rps The `rps` property supplies structured input used by the controller manual module.
 * @param {Function} engine.setState The `setState` property supplies structured input used by the controller manual module.
 * @param {Function} engine.shuffleDeck The `shuffleDeck` property supplies structured input used by the controller manual module.
 * @param {Function} engine.shuffleHand The `shuffleHand` property supplies structured input used by the controller manual module.
 * @param {Function} engine.viewBanished The `viewBanished` property supplies structured input used by the controller manual module.
 * @param {Function} engine.viewDeck The `viewDeck` property supplies structured input used by the controller manual module.
 * @param {Function} engine.viewExcavated The `viewExcavated` property supplies structured input used by the controller manual module.
 * @param {(Function|Array)} engine.viewExtra The `viewExtra` property supplies structured input used by the controller manual module.
 * @param {Function} engine.viewGrave The `viewGrave` property supplies structured input used by the controller manual module.
 * @param {Function} engine.viewXYZ The `viewXYZ` property supplies structured input used by the controller manual module.
 * @param {Function} engine.ygoproUpdate The `ygoproUpdate` property supplies structured input used by the controller manual module.
 * @param {Array} players The players array supplies the ordered values used by the controller manual module.
 * @param {Object} client The client object supplies the structured input used by the controller manual module, including the `slot` property.
 * @param {number} client.slot The `slot` property supplies structured input used by the controller manual module.
 * @param {Object} message The message object supplies the structured input used by the controller manual module, including the `action`, `amount`, `answer`, `card`, `choice`, `data`, `id`, `index`, `location`, `name`, `phase`, `player`, `position`, `sound`, `source`, `target`, `uid`, and `uuid` properties.
 * @param {string} message.action The `action` property supplies structured input used by the controller manual module.
 * @param {number} message.amount The `amount` property supplies structured input used by the controller manual module.
 * @param {Object} message.answer The `answer` property supplies structured input used by the controller manual module.
 * @param {Array} message.card The `card` property supplies structured input used by the controller manual module.
 * @param {string} message.card.uid The `card.uid` property supplies structured input used by the controller manual module.
 * @param {(number|string)} message.choice The `choice` property supplies structured input used by the controller manual module.
 * @param {Object} message.data The `data` property supplies structured input used by the controller manual module.
 * @param {string} message.id The `id` property supplies structured input used by the controller manual module.
 * @param {number} message.index The `index` property supplies structured input used by the controller manual module.
 * @param {string} message.location The `location` property supplies structured input used by the controller manual module.
 * @param {string} message.name The `name` property supplies structured input used by the controller manual module.
 * @param {(number|string)} message.phase The `phase` property supplies structured input used by the controller manual module.
 * @param {number} message.player The `player` property supplies structured input used by the controller manual module.
 * @param {(number|string)} message.position The `position` property supplies structured input used by the controller manual module.
 * @param {string} message.sound The `sound` property supplies structured input used by the controller manual module.
 * @param {string} message.source The `source` property supplies structured input used by the controller manual module.
 * @param {Array} message.target The `target` property supplies structured input used by the controller manual module.
 * @param {string} message.uid The `uid` property supplies structured input used by the controller manual module.
 * @param {string} message.uuid The `uuid` property supplies structured input used by the controller manual module.
 * @returns {void} Does not return a value.
 */
function responseHandler(engine, players, client, message) {
    console.log(message);
    if (!message.action) {
        return;
    }
    switch (message.action) {
        case 'moveCard':
            engine.setState(message);
            break;
        case 'revealTop':
            engine.revealTop(client.slot);
            break;
        case 'revealBottom':
            engine.revealBottom(client.slot);
            break;
        case 'offsetDeck':
            engine.offsetZone(client.slot, 'DECK');
            break;
        case 'makeToken':
            engine.makeNewCard(message.location, message.player, message.index, message.position, message.id, message.index);
            engine.ygoproUpdate();
            break;
        case 'removeToken':
            engine.removeCard(message.uid);
            break;
        case 'revealDeck':
            engine.revealDeck(client.slot);
            break;
        case 'revealExcavated':
            engine.revealExcavated(client.slot);
            break;
        case 'revealExtra':
            engine.revealExtra(client.slot);
            break;
        case 'revealHand':
            engine.revealHand(client.slot);
            break;
        case 'viewDeck':
            engine.viewDeck(client.slot, players[client.slot].username, client.slot);
            break;
        case 'viewExtra':
            engine.viewExtra(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewExcavated':
            engine.viewExcavated(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewGrave':
            engine.viewGrave(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewBanished':
            engine.viewBanished(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewXYZ':
            engine.viewXYZ(client.slot, message.index, message.player);
            break;
        case 'shuffleDeck':
            engine.shuffleDeck(client.slot, players[client.slot].username, message.player);
            break;
        case 'shuffleHand':
            engine.shuffleHand(client.slot);
            break;
        case 'draw':
            engine.drawCard(client.slot, 1, [{}], players[client.slot].username);
            break;
        case 'excavate':
            engine.excavateCard(client.slot, 1);
            break;
        case 'mill':
            engine.millCard(client.slot, 1);
            break;
        case 'millRemovedCard':
            engine.millRemovedCard(client.slot, 1);
            break;
        case 'millRemovedCardFaceDown':
            engine.millRemovedCardFaceDown(client.slot, 1);
            break;
        case 'addCounter':
            engine.addCounter(message.uid);
            break;
        case 'flipDeck':
            engine.flipDeck(client.slot);
            break;
        case 'removeCounter':
            engine.removeCounter(message.uid);
            break;
        case 'rollDie':
            engine.rollDie(message.name);
            break;
        case 'flipCoin':
            engine.flipCoin(players[client.slot].username);
            break;
        case 'nextPhase':
            engine.nextPhase(message.phase);
            break;
        case 'nextTurn':
            engine.nextTurn();
            break;
        case 'changeLifepoints':
            engine.changeLifepoints(client.slot, message.amount, players[client.slot].username);
            break;
        case 'revealHandSingle':
            engine.revealCallback([message.card], client.slot, 'revealHandSingle');
            break;
        case 'rps':
            engine.rps(function (result) {
                var winner = 'Player ' + (1 + result);
                engine.duelistChat('Server', players[client.slot].username + ' ' + winner + ' won.');
            });
            break;
        case 'reveal':
            engine.revealCallback(engine.findUIDCollection(message.card.uid), client.slot, 'revealHandSingle');
            break;
        case 'question':
            engine.answerListener.emit(message.uuid, message.answer);
            break;
        case 'attack':
            broadcast(players, {
                action: 'ygopro',
                message: {
                    duelAction: 'attack',
                    source: message.source,
                    target: message.target
                }
            });
            break;
        case 'effect':
            broadcast(players, {
                action: 'ygopro',
                message: {
                    duelAction: 'effect',
                    id: message.id,
                    player: message.player,
                    index: message.index,
                    location: message.location
                }
            });
            engine.duelistChat('Server', `${players[client.slot].username} signaled the effect of ${message.name}`);
            break;
        case 'target':
            broadcast(players, {
                action: 'ygopro',
                message: {
                    duelAction: 'target',
                    target: message.target
                }
            });
            break;
        case 'give':
            broadcast(players, {
                action: 'ygopro',
                message: {
                    duelAction: 'give',
                    target: message.target,
                    choice: message.choice
                }
            });
            break;
        case 'ygopro':
            engine.relayYGOPro(client.slot, message.data);
            break;
        default:
            break;
    }

    if (client.slot !== undefined && message.sound) {
        players[0].write(({
            duelAction: 'sound',
            sound: message.sound
        }));
        players[1].write(({
            duelAction: 'sound',
            sound: message.sound
        }));
    }
}



/**
 * Executes the game helper used by the controller manual module.
 * @param {Object} game The game object supplies the structured input used by the controller manual module, including the `banlist`, `cardpool`, `mode`, `prerelease`, `roompass`, `noShuffleDeck`, `startingLP`, and `timeLimitSeconds` properties.
 * @param {Array} game.banlist The `banlist` property supplies structured input used by the controller manual module.
 * @param {string} game.cardpool The `cardpool` property supplies structured input used by the controller manual module.
 * @param {string} game.mode The `mode` property supplies structured input used by the controller manual module.
 * @param {boolean} game.prerelease The `prerelease` property supplies structured input used by the controller manual module.
 * @param {string} game.roompass The `roompass` property supplies structured input used by the controller manual module.
 * @param {boolean} game.noShuffleDeck The `noShuffleDeck` property supplies structured input used by the controller manual module.
 * @param {number} game.startingLP The `startingLP` property supplies structured input used by the controller manual module.
 * @param {number} game.timeLimitSeconds The `timeLimitSeconds` property supplies structured input used by the controller manual module.
 * @returns {Object} Returns the value produced by the controller manual module.
 */
function Game(game) {
    return {
        roompass: game.roompass,
        started: false,
        deckcheck: 0,
        drawCountPerTurn: Number(game.drawCountPerTurn || game.team1?.drawCountPerTurn || 1),
        bestOf: Number(game.bestOf || 1),
        banlist: game.banlist,
        mode: game.mode,
        cardpool: game.cardpool,
        noShuffleDeck: Boolean(game.noShuffleDeck),
        prerelease: game.prerelease,
        masterRule: banlist[game.banlist].masterRule,
        rule: 0,
        startingLP: Number(game.startingLP || game.team1?.startingLP || 8000),
        startingDrawCount: Number(game.startingDrawCount || game.team1?.startingDrawCount || 5),
        timeLimitSeconds: Number(game.timeLimitSeconds || 0),
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
 * Executes the client binding helper used by the controller manual module.
 * @param {Array} clients The clients array supplies the ordered values used by the controller manual module.
 * @param {Object} spectators The spectators value provides an input used by the controller manual module.
 * @returns {Function} Returns the value produced by the controller manual module.
 */
function clientBinding(clients, spectators) {

        /**
     * Executes the game response helper used by the controller manual module.
     * @param {Object} view The view object supplies the structured input used by the controller manual module, including the `p0`, `p1`, and `spectator` properties.
     * @param {Object} view.p0 The `p0` property supplies structured input used by the controller manual module.
     * @param {Object} view.p1 The `p1` property supplies structured input used by the controller manual module.
     * @param {Object} view.spectator The `spectator` property supplies structured input used by the controller manual module.
     * @param {Array} stack The stack value provides an input used by the controller manual module.
     * @param {Function} callback The callback value provides an input used by the controller manual module.
     * @returns {undefined} Returns the value produced by the controller manual module.
     */
    function gameResponse(view, stack, callback) {
        try {
            if (!view) {
                return;
            }

            clients[0].write((view.p0));
            clients[1].write((view.p1));
            spectators.write((view.spectator));
        } catch (error) {
            console.log('failed messaging client', error);
        } finally {
            if (callback) {
                return callback(stack);
            }
        }
    }
    return gameResponse;
}

/**
 * Executes the surrender helper used by the controller manual module.
 * @param {Object} game The game value provides an input used by the controller manual module.
 * @param {Object} duel The duel value provides an input used by the controller manual module.
 * @param {number} slot The slot value provides an input used by the controller manual module.
 * @returns {void} Does not return a value.
 */
function surrender(game, duel, slot) {

}

module.exports = {
    Game,
    clientBinding,
    responseHandler,
    surrender
};
