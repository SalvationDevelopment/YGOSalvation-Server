/**
 * @typedef FieldCoordinate
 * @type {Object}
 * @property {Number} player controlling player
 * @property {String} location zone or deck in caps, MONSTERZONE, SPELLZONE, EXTRA etc
 * @property {Number} index sequence in the zone or deck.
 */

const enums = require('./translate_ygopro_enums'),
    gameResponse = require('./translate_ygopro_reply.js'),
    cardMap = {
        0: 'rock',
        1: 'paper',
        2: 'scissors'
    },
    buttonName = {
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
        enableMainPhase2: () => 2,
        shuffle: () => 8,
        enableEndPhase: (i, command) => {
            console.log(command);
            switch (command) {
                case 'MSG_SELECT_IDLECMD':
                    return 7;
                case 'MSG_SELECT_BATTLECMD':
                    return 3;
                default:
                    return i;
            }
        },
        yesno: (i, command) => {
            switch (command) {
                case 'MSG_SELECT_CHAIN':
                    if (i === 0) {
                        return -1;
                    }
                    return 1;
                default:
                    return Number(Boolean(i));
            }
        },
        zone: (i) => Buffer.from(i).readUIntLE(0, 3),
        list: (i) => Buffer.from(i)
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
        ygopro.write(buttonName[answer.type](answer.i, command));
    });
}


/**
 * Return the Array Index of a matching card in a list of cards.
 * @param {FieldCoordinate[]} list list of cards the option appears in.
 * @param {Number[]} card card being searched for.
 * @returns {Number} Index of the card in the given options.
 */
function resolveCardIndex(list, card) {
    var number = list.findIndex(function (option) {
        var index = (option.player === card[0]),
            location = (option.location === enums.locations[card[1]]),
            sequence = (option.index === card[2]);
        return (index && location && sequence);

    });
    return number;
}


// Good, means completed in the UI.
function boardController(gameBoard, slot, message, ygopro, player) {
    'use strict';
    var output = {
        p0: {},
        p1: {},
        spectators: {}
    };
    player.lastData = message;
    switch (message.command) {
        case ('STOC_UNKNOWN'): // Good
            process.exit();
            break;
        case ('STOC_GAME_MSG'): // Good
            break;
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
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_REMOVE_COUNTER'):
            gameBoard.announcement(slot, message);
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
            gameBoard.setState({
                player: message.pc,
                clocation: message.pl,
                index: message.ps,
                moveplayer: message.cc,
                movelocation: message.cl,
                moveindex: message.cs,
                moveposition: message.cp,
                overlayindex: 0
            });
            break;
        case ('MSG_POS_CHANGE'):
            gameBoard.setState({
                player: message.player,
                clocation: message.location,
                index: message.index,
                moveplayer: message.player,
                movelocation: message.location,
                moveindex: message.index,
                moveposition: message.position,
                overlayindex: 0
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
            gameBoard.setState({
                player: message.player,
                clocation: message.location,
                index: message.index,
                moveplayer: message.player,
                movelocation: message.location,
                moveindex: message.index,
                moveposition: message.position,
                overlayindex: 0,
                id: message.id
            });
            output[slot] = {
                duelAction: 'sound',
                sound: 'soundsummonCard'
            };
            gameBoard.callback(output);
            break;
        case ('MSG_SPSUMMONING'): // Good
            gameBoard.setState({
                id: message.id,
                player: message.player,
                clocation: message.location,
                index: message.index,
                moveplayer: message.player,
                movelocation: message.location,
                moveindex: message.index,
                moveposition: message.position,
                overlayindex: 0
            });
            break;
        case ('MSG_FLIPSUMMONING'): // Good
            gameBoard.setState({
                id: message.id,
                player: message.player,
                clocation: message.location,
                index: message.index,
                moveplayer: message.player,
                movelocation: message.location,
                moveindex: message.index,
                moveposition: message.position,
                overlayindex: 0
            });
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
        case ('MSG_SELECT_CHAIN'):
            if (message.count) {
                askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_CHAIN');
            } else {
                ygopro.write(-1);
            }
            break;
        case ('MSG_SELECT_PLACE'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_PLACE');
            break;
        case ('MSG_SELECT_POSITION'):
            askUser(gameBoard, slot, message, ygopro, 'MSG_SELECT_POSITION');
            break;
        case ('MSG_SELECT_TRIBUTE'):
            gameBoard.question(slot, message.command, message, { min: message.select_min, max: message.select_max }, function (answer) {
                var messageBuffer = [answer.length].concat(answer.map(function (card) {
                    return resolveCardIndex(message.selectable_targets, card);
                })).filter(function (card) {
                    return (card !== undefined);
                });
                ygopro.write(gameResponse('CTOS_RESPONSE', new Buffer(messageBuffer)));
            });
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
            gameBoard.announcement(slot, message);
            break;
        case ('MSG_UPDATE_DATA'): // inconsistent
            message.cards.forEach(function (card, index) {
                if (card) {
                    try {
                        gameBoard.setState({
                            id: message.id,
                            player: message.player,
                            clocation: message.location,
                            index: index,
                            moveplayer: message.player,
                            movelocation: message.location,
                            moveindex: index,
                            moveposition: card.Position,
                            overlayindex: 0
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
            if (message.cards.length) {
                gameBoard.ygoproUpdate();
            }
            return {};
        case ('MSG_UPDATE_CARD'): // Inconsistent
            try {
                gameBoard.setState({
                    player: message.player,
                    clocation: message.location,
                    index: message.index,
                    moveplayer: message.player,
                    movelocation: message.location,
                    moveindex: message.index,
                    moveposition: message.card.Position,
                    overlayindex: 0,
                    id: message.card.id
                });
            } catch (e) {
                console.log(e);
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
        default:
            console.log('FAILURE!', message);
            break;
    }
    return message;
}
module.exports = boardController;