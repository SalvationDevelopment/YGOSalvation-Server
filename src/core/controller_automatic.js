/**
 * @typedef FieldCoordinate
 * @type {Object}
 * @property {Number} player controlling player
 * @property {String} location zone or deck in caps, MONSTERZONE, SPELLZONE, EXTRA etc
 * @property {Number} index sequence in the zone or deck.
 */

const buttonName = {
    summonable_cards: (i) => i << 16,
    spsummonable_cards: (i) => (i << 16) + 1,
    repositionable_cards: (i) => (i << 16) + 2,
    msetable_cards: (i) => (i << 16) + 3,
    ssetable_cards: (i) => (i << 16) + 4,
    activatable_cards: (i, command) => (command === 'MSG_SELECT_IDLECMD') ? (i << 16) + 5 : (i << 16),
    select_options: (i, command) => {
        switch (command) {
            case 'MSG_SELECT_IDLECMD':
                return (i << 16) + 5;
            case 'MSG_SELECT_BATTLECMD':
                return i << 16;
            default:
                return i;
        }

    },
    attackable_cards: (i) => (i << 16) + 1,
    enableBattlePhase: () => 6,
    shuffle: () => 8,
    enableMainPhase2: () => 2,
    enableEndPhase: (i, command) => {
        switch (command) {
            case 'MSG_SELECT_BATTLECMD':
                return 3;
            case 'MSG_SELECT_IDLECMD':
                return 7;

            default:
                return -1;
        }
    },
    yesno: (i, command) => {
        switch (command) {
            case 'MSG_SELECT_CHAIN':
                if (!i) {
                    return -1;
                }
                return 1;
            default:
                return Number(Boolean(i));
        }
    },
    zone: (i) => Buffer.from(i).readUIntLE(0, 3),
    list: (i) => Buffer.from([i.length].concat(i)),
    number: (i) => Number(i),
    FaceUpAttack: () => 0x1,
    FaceDownAttack: () => 0x2,
    FaceUpDefence: () => 0x4,
    FaceDownDefence: () => 0x8
};

/**
 * Standardized way of sending a preformatted message to the user from YGOSharp. 
 * @param {Object} gameBoard Instance of the manual state engine
 * @param {String} slot name of the view the player is using
 * @param {Object} message message from YGOSharp
 * @param {Object} ygopro TCP connection back to YGOSharp
 * @returns {undefined}
 */
function askUser(gameBoard, slot, message, ygopro, command) {
    gameBoard.question('p' + slot, message.command, message, {
        max: 1,
        min: 1
    }, function (answer) {
        console.log('[CONTROLLER_AUTOMATIC] p' + slot, '  -->', answer.type, answer.i, command, buttonName[answer.type](answer.i, command));
        ygopro.write(buttonName[answer.type](answer.i, command));
    });
}


function movement(message, gameBoard) {
    const OVERLAY_UNIT = 0x80,
        {
            code,
            previousController,
            previousLocation, pl,
            previousIndex, pp,
            currentController, cl,
            currentIndex,
            currentLocation,
            currentPosition
        } = message,
        previous = {
            player: previousController,
            location: previousLocation,
            index: previousIndex
        },
        current = {
            player: currentController,
            location: currentLocation,
            index: currentIndex,
            position: currentPosition
        };

    if (pl === 0) {
        gameBoard.makeNewCard(
            currentLocation,
            currentController,
            currentIndex,
            currentPosition,
            code, pp);
        gameBoard.ygoproUpdate();
        return;
    }
    if (cl === 0) {
        gameBoard.removeCard(previous);
        gameBoard.ygoproUpdate();
        return;
    }
    if (!(pl & OVERLAY_UNIT) && !(cl & OVERLAY_UNIT)) {
        gameBoard.moveCard(previous, current);
        gameBoard.ygoproUpdate();
        return;
    }
    if (!(pl & OVERLAY_UNIT)) {
        gameBoard.attachMaterial(previous, current);
        return;
    }
    if (!(cl & OVERLAY_UNIT)) {
        previous.location = 'MONSTERZONE';
        gameBoard.detachMaterial(previous, message.overlayindex + 1, current);
        gameBoard.ygoproUpdate();
        return;
    }
    console.log('[CONTROLLER_AUTOMATIC] take card');
    gameBoard.takeMaterial(previous, pp, current);
    gameBoard.ygoproUpdate();
}


// Good, means completed in the UI.
function boardController(gameBoard, slot, message, ygopro, player) {
    'use strict';
    var output = {
        p0: {},
        p1: {},
        spectators: {}
    };

    const previous = {
        player: message.previousController,
        location: message.previousLocation,
        index: message.previousIndex
    };

    switch (message.command) {
        case ('MSG_RETRY'): // Good
            gameBoard.retryLastQuestion();
            break;
        case ('MSG_START'): // Good

            gameBoard.startDuel({
                main: Array(message.player1decksize).fill(0),
                side: Array(0),
                extra: Array(message.player1extrasize).fill(0)
            }, {
                main: Array(message.player2decksize).fill(0),
                side: Array(0),
                extra: Array(message.player2extrasize).fill(0)
            }, false, {
                startLP: message.lifepoints1
            });
            break;
        case ('MSG_ORIENTATION'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_HINT'):
            gameBoard.announcement(slot, message);
            break;
        case 'HINT_EVENT':
            gameBoard.announcement(slot, message);
            break;
        case 'HINT_MESSAGE':
            gameBoard.announcement(slot, message);
            break;
        case 'HINT_SELECTMSG':
            gameBoard.announcement(slot, message);
            break;
        case 'HINT_OPSELECTED':
            gameBoard.announcement(slot, message);
            break;
        case 'HINT_EFFECT':
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_NEW_TURN'): // Good
            gameBoard.nextTurn();
            break;
        case ('MSG_WIN'):
            gameBoard.announcement(slot, message);
            process.recordOutcome.emit('win', message);
            break;
        case ('MSG_NEW_PHASE'): // Good
            gameBoard.nextPhase(message.gui_phase);
            break;
        case ('MSG_DRAW'): // Good
            gameBoard.drawCard(message.player, message.count, message.cards);
            break;
        case ('MSG_SHUFFLE_DECK'): // Good
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SHUFFLE_HAND'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CHAINING'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CHAINED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CHAIN_SOLVING'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CHAIN_SOLVED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CHAIN_END'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CHAIN_NEGATED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CHAIN_DISABLED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CARD_SELECTED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_RANDOM_SELECTED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_BECOME_TARGET'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_PAY_LPCOST'): // Good
            gameBoard.changeLifepoints(message.player, (message.lp * message.multiplier));
            output[slot] = {
                duelAction: 'sound',
                sound: 'soundchangeLifePoints'
            };
            gameBoard.callback(output);
            break;
        case ('MSG_DAMAGE'): // Good
            gameBoard.changeLifepoints(message.player, (message.lp * message.multiplier));
            output[slot] = {
                duelAction: 'sound',
                sound: 'soundchangeLifePoints'
            };
            gameBoard.callback(output);
            output[slot] = {
                duelAction: 'sound',
                sound: 'soundchangeLifePoints'
            };
            gameBoard.callback(output);
            break;
        case ('MSG_RECOVER'): // Good
            gameBoard.changeLifepoints(message.player, (message.lp * message.multiplier));
            output[slot] = {
                duelAction: 'sound',
                sound: 'soundchangeLifePoints'
            };
            gameBoard.callback(output);
            break;
        case ('MSG_LPUPDATE'): // Good
            gameBoard.changeLifepoints(message.player, (message.lp * message.multiplier));
            output[slot] = {
                duelAction: 'sound',
                sound: 'soundchangeLifePoints'
            };
            gameBoard.callback(output);
            break;
        case ('MSG_EQUIP'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_UNEQUIP'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CANCEL_TARGET'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_ADD_COUNTER'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_ADD_COUNTER');
            break;
        case ('MSG_REMOVE_COUNTER'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_REMOVE_COUNTER');
            break;
        case ('MSG_ATTACK'): // Good
            output[slot] = {
                duelAction: 'attack',
                sound: 'soundattack',
                source: message.attacker,
                target: message.defender
            };
            gameBoard.callback(output);
            break;
        case ('MSG_BATTLE'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_ATTACK_DISABLED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_DAMAGE_STEP_START'): // Good
            break;
        case ('MSG_DAMAGE_STEP_END'): // Good
            break;
        case ('MSG_MISSED_EFFECT'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_TOSS_COIN'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SELECT_IDLECMD'): // Good
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_IDLECMD');
            break;
        case ('MSG_MOVE'): // Good
            gameBoard.announcement(slot, message);
            movement(message, gameBoard);
            break;
        case ('MSG_POS_CHANGE'):
            gameBoard.moveCard(previous, {
                player: message.player,
                location: message.location,
                index: message.index,
                position: message.position
            });
            break;
        case ('MSG_SET'): // Good
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SWAP'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_FIELD_DISABLED'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SUMMONING'): // Good
            gameBoard.update(message);
            output[slot] = {
                duelAction: 'sound',
                sound: 'soundsummonCard'
            };
            gameBoard.callback(output);
            break;
        case ('MSG_SPSUMMONING'): // Good
            gameBoard.update(message);
            break;
        case ('MSG_FLIPSUMMONING'): // Good
            gameBoard.update(message);
            break;
        case ('MSG_SUMMONED'): // Good
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SPSUMMONED'): // Good
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_FLIPSUMMONED'): // Good
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_REQUEST_DECK'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SELECT_BATTLECMD'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_BATTLECMD');
            break;
        case ('MSG_SELECT_EFFECTYN'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_EFFECTYN');
            break;
        case ('MSG_SELECT_YESNO'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_YESNO');
            break;
        case ('MSG_SELECT_OPTION'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_OPTION');
            break;
        case ('MSG_SELECT_CARD'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_CARD');
            break;
        case ('MSG_SELECT_UNSELECT_CARD'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_UNSELECT_CARD');
            break;
        case ('MSG_SELECT_CHAIN'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_CHAIN');
            break;
        case ('MSG_SELECT_PLACE'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_PLACE');
            break;
        case ('MSG_SELECT_POSITION'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_POSITION');
            break;
        case ('MSG_SELECT_TRIBUTE'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_TRIBUTE');
            break;
        case ('MSG_SORT_CHAIN'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SELECT_COUNTER'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_COUNTER');
            break;
        case ('MSG_SELECT_SUM'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_SUM');
            break;
        case ('MSG_SELECT_DISFIELD'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_DISFIELD');
            break;
        case ('MSG_SORT_CARD'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CONFIRM_DECKTOP'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_CONFIRM_CARDS'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_CONFIRM_CARDS');
            break;
        case ('MSG_UPDATE_DATA'): // inconsistent
            if (message.cards.length) {
                gameBoard.announcement(slot, message);
            }
            message.cards.forEach(function (card, index) {
                if (card.position === 'MONSTERZONE') {
                    throw Error('WRONG CARD POSITION');
                }

                card.location = message.location;
                gameBoard.update(card);

            });
            if (message.cards.length) {
                //gameBoard.ygoproUpdate();
            }
            return {};
        case ('MSG_UPDATE_CARD'): // Inconsistent
            gameBoard.announcement(slot, message);
            break;
            if (!message.card.id) {
                throw '----';
            }

            try {
                gameBoard.update({
                    player: message.card.player,
                    location: message.card.location,
                    index: message.card.index,
                    position: message.card.position,
                    id: message.card.id
                });
            } catch (e) {
                console.log('[CONTROLLER_AUTOMATIC]', e, message);
            }
            break;
        case ('MSG_WAITING'): // Good
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_SWAP_GRAVE_DECK'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_REVERSE_DECK'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_DECK_TOP'):
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_ANNOUNCE_ATTRIB'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_ANNOUNCE_ATTRIB');
            break;
        case ('MSG_ANNOUNCE_NUMBER'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_ANNOUNCE_NUMBER');
            break;
        default:
            console.log('[CONTROLLER_AUTOMATIC] FAILURE!', message);
            break;
    }
    return message;
}
module.exports = boardController;