/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';


/**
 * Update the banlist
 */

var banlist = {};



function broadcast(players, message) {
    players[0].write((message));
    players[1].write((message));
}

function responseHandler(engine, players, client, message) {
    console.log('[MANUAL]', message);
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
 * Create a new game object.
 * @param {GameState} game public gamelist state information.
 * @returns {Object} customized game object
 */
function Game(game) {
    return {
        roompass: game.roompass,
        started: false,
        deckcheck: 0,
        draw_count: 0,
        ot: parseInt(game.ot, 10),
        banlist: game.banlist,
        banlistid: game.banlistid,
        mode: game.mode,
        cardpool: game.cardpool,
        noshuffle: game.shuf,
        prerelease: game.prerelease,
        masterRule: banlist[game.banlist].masterRule,
        legacyfield: (banlist[game.banlist].masterRule !== 4),
        rule: 0,
        startLP: game.startLP,
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
 * @param {PlayerAbstraction[]} clients array of dueling players.
 * @param {PlayerAbstraction} spectators clients that are watching the duel.
 * @returns {Function} binding function
 */
function clientBinding(clients, spectators) {

    /**
     * response handler
     * @param {Object} view  view definition set
     * @param {Array} stack of cards
     * @param {Function} callback gamestate watcher
     * @returns {Function} manual duel mode update state callback function
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

function surrender(game, duel, slot) {

}

module.exports = {
    Game,
    clientBinding,
    responseHandler,
    surrender
};