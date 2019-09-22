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

function responseHandler(duel, players, client, message) {

    if (!message.action) {
        return;
    }
    switch (message.action) {
        case 'moveCard':
            duel.setState(message);
            break;
        case 'revealTop':
            duel.revealTop(client.slot);
            break;
        case 'revealBottom':
            duel.revealBottom(client.slot);
            break;
        case 'offsetDeck':
            duel.offsetZone(client.slot, 'DECK');
            break;
        case 'makeToken':
            duel.makeNewCard(message.location, message.player, message.index, message.position, message.id, message.index);
            break;
        case 'removeToken':
            duel.removeCard(message.uid);
            break;
        case 'revealDeck':
            duel.revealDeck(client.slot);
            break;
        case 'revealExcavated':
            duel.revealExcavated(client.slot);
            break;
        case 'revealExtra':
            duel.revealExtra(client.slot);
            break;
        case 'revealHand':
            duel.revealHand(client.slot);
            break;
        case 'viewDeck':
            duel.viewDeck(client.slot, players[client.slot].username, client.slot);
            break;
        case 'viewExtra':
            duel.viewExtra(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewExcavated':
            duel.viewExcavated(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewGrave':
            duel.viewGrave(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewBanished':
            duel.viewBanished(message.player, players[client.slot].username, client.slot);
            break;
        case 'viewXYZ':
            duel.viewXYZ(client.slot, message.index, message.player);
            break;
        case 'shuffleDeck':
            duel.shuffleDeck(client.slot, players[client.slot].username, message.player);
            break;
        case 'shuffleHand':
            duel.shuffleHand(client.slot);
            break;
        case 'draw':
            duel.drawCard(client.slot, 1, [{}], players[client.slot].username);
            break;
        case 'excavate':
            duel.excavateCard(client.slot, 1);
            break;
        case 'mill':
            duel.millCard(client.slot, 1);
            break;
        case 'millRemovedCard':
            duel.millRemovedCard(client.slot, 1);
            break;
        case 'millRemovedCardFaceDown':
            duel.millRemovedCardFaceDown(client.slot, 1);
            break;
        case 'addCounter':
            duel.addCounter(message.uid);
            break;
        case 'flipDeck':
            duel.flipDeck(client.slot);
            break;
        case 'removeCounter':
            duel.removeCounter(message.uid);
            break;
        case 'rollDie':
            duel.rollDie(message.name);
            break;
        case 'flipCoin':
            duel.flipCoin(players[client.slot].username);
            break;
        case 'nextPhase':
            duel.nextPhase(message.phase);
            break;
        case 'nextTurn':
            duel.nextTurn();
            break;
        case 'changeLifepoints':
            duel.changeLifepoints(client.slot, message.amount, players[client.slot].username);
            break;
        case 'revealHandSingle':
            duel.revealCallback([message.card], client.slot, 'revealHandSingle');
            break;
        case 'rps':
            duel.rps(function (result) {
                var winner = 'Player ' + (1 + result);
                duel.duelistChat('Server', players[client.slot].username + ' ' + winner + ' won.');
            });
            break;
        case 'reveal':
            duel.revealCallback(duel.findUIDCollection(message.card.uid), client.slot, 'revealHandSingle');
            break;
        case 'question':
            duel.answerListener.emit(message.uuid, message.answer);
            break;
        case 'attack':
            broadcast(players, {
                duelAction: 'attack',
                source: message.source,
                target: message.target
            });
            break;
        case 'effect':
            broadcast(players, {
                duelAction: 'effect',
                id: message.id,
                player: message.player,
                index: message.index,
                location: message.location
            });
            break;
        case 'target':
            broadcast(players, {
                duelAction: 'target',
                target: message.target
            });
            break;
        case 'give':
            broadcast(players, {
                duelAction: 'give',
                target: message.target,
                choice: message.choice
            });
            break;
        case 'ygopro':
            duel.relayYGOPro(client.slot, message.data);
            break;
        default:
            break;
    }

    if (client.slot !== undefined && message.sound) {
        duel.players[0].write(({
            duelAction: 'sound',
            sound: message.sound
        }));
        duel.players[1].write(({
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
            clients[0].write((view['p' + clients[0].slot]));
            clients[1].write((view['p' + clients[1].slot]));
            spectators.write((view.spectators));

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


module.exports = {
    Game,
    clientBinding,
    responseHandler
};