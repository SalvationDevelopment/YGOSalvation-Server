const gameResponse = require('./translate_ygopro_reply.js'),
    cardMap = {
        0: 'rock',
        1: 'paper',
        2: 'scissors'
    };

function askUser(gameBoard, slot, message, ygopro) {
    gameBoard.question(slot, message.command, message, {
        max: 1,
        min: 1
    }, function(answer) {
        ygopro.write(gameResponse('CTOS_RESPONSE', new Buffer(answer[0])));
    });
}

function boardController(gameBoard, slot, message, ygopro) {
    'use strict';
    console.log(slot, message.command);
    switch (message.command) {
        case ('STOC_UNKNOWN'):
            break;
        case ('STOC_GAME_MSG'):
            break;
        case ('MSG_RETRY'):
            gameBoard.retryLastQuestion();
            break;
        case ('MSG_START'):
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
            break;
        case 'HINT_EVENT':
            break;
        case 'HINT_MESSAGE':
            break;
        case 'HINT_SELECTMSG':
            break;
        case 'HINT_OPSELECTED':
            break;
        case 'HINT_EFFECT':
            break;
        case ('MSG_NEW_TURN'):
            gameBoard.nextTurn();
            break;
        case ('MSG_WIN'):
            break;
        case ('MSG_NEW_PHASE'):
            gameBoard.nextPhase(message.gui_phase);
            break;
        case ('MSG_DRAW'):
            gameBoard.drawCard(message.player, message.count, message.cards);
            break;
        case ('MSG_SHUFFLE_DECK'):
            break;
        case ('MSG_SHUFFLE_HAND'):
            break;
        case ('MSG_CHAINING'):
            break;
        case ('MSG_CHAINED'):
            break;
        case ('MSG_CHAIN_SOLVING'):
            break;
        case ('MSG_CHAIN_SOLVED'):
            break;
        case ('MSG_CHAIN_END'):
            break;
        case ('MSG_CHAIN_NEGATED'):
            break;
        case ('MSG_CHAIN_DISABLED'):
            break;
        case ('MSG_CARD_SELECTED'):
            break;
        case ('MSG_RANDOM_SELECTED'):
            break;
        case ('MSG_BECOME_TARGET'):
            break;
        case ('MSG_PAY_LPCOST'):
            break;
        case ('MSG_DAMAGE'):
            break;
        case ('MSG_RECOVER'):
            break;
        case ('MSG_LPUPDATE'):
            break;
        case ('MSG_SUMMONING '):
            break;
        case ('MSG_EQUIP'):
            break;
        case ('MSG_UNEQUIP'):
            break;
        case ('MSG_CANCEL_TARGET'):
            break;
        case ('MSG_ADD_COUNTER'):
            break;
        case ('MSG_REMOVE_COUNTER'):
            break;
        case ('MSG_ATTACK'):
            break;
        case ('MSG_BATTLE'):
            break;
        case ('MSG_ATTACK_DISABLED'):
            break;
        case ('MSG_DAMAGE_STEP_START'):
            break;
        case ('MSG_DAMAGE_STEP_END'):
            break;
        case ('MSG_MISSED_EFFECT'):
            break;
        case ('MSG_TOSS_COIN'):
            break;
        case ('MSG_SELECT_IDLECMD'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_MOVE'):
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
            break;
        case ('MSG_SET'):
            //check for variables
            break;
        case ('MSG_SWAP'):
            break;
        case ('MSG_FIELD_DISABLED'):
            break;
        case ('MSG_SUMMONING'):
            break;
        case ('MSG_SPSUMMONING'):
            break;
        case ('MSG_SUMMONED'):
            break;
        case ('MSG_SPSUMMONED'):
            break;
        case ('MSG_FLIPSUMMONED'):
            break;
        case ('MSG_FLIPSUMMONING'):
            break;
        case ('MSG_REQUEST_DECK'):
            break;
        case ('MSG_SELECT_BATTLECMD'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_EFFECTYN'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_YESNO'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_OPTION'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_CARD'):

            gameBoard.question(slot, message.command, message, { min: message.select_min, max: message.select_max }, function(answer) {
                ygopro.write(gameResponse('CTOS_RESPONSE', new Buffer(answer[0])));
            });

            break;
        case ('MSG_SELECT_CHAIN'):
            break;
        case ('MSG_SELECT_PLACE'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_POSITION'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_TRIBUTE'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SORT_CHAIN'):
            break;
        case ('MSG_SELECT_COUNTER'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_SUM'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SELECT_DISFIELD'):
            askUser(gameBoard, slot, message, ygopro);
            break;
        case ('MSG_SORT_CARD'):
            break;
        case ('MSG_CONFIRM_DECKTOP'):
            break;
        case ('MSG_CONFIRM_CARDS'):
            break;
        case ('MSG_UPDATE_DATA'):
            message.cards.forEach(function(card, index) {
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
                    } catch (no) {
                        console.log(no);
                    }
                }
            });
            if (message.cards.length) {
                gameBoard.ygoproUpdate();
            }
            return {};
        case ('MSG_UPDATE_CARD'):

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
            break;
        case ('MSG_WAITING'):
            break;
        case ('MSG_SWAP_GRAVE_DECK'):
            break;
        case ('MSG_REVERSE_DECK'):
            break;
        case ('MSG_DECK_TOP'):
            break;
        case ('STOC_ERROR_MSG'):
            break;
        case ('ERRMSG_JOINERROR'):
            break;
        case ('ERRMSG_DECKERROR'):
            break;
        case ('ERRMSG_SIDEERROR'):
            break;
        case ('ERRMSG_VERERROR'):
            break;
        case ('STOC_SELECT_HAND'):

            gameBoard.question(slot, 'specialCards', [{
                id: 'rock',
                value: 0
            }, {
                id: 'paper',
                value: 1
            }, {
                id: 'scissors',
                value: 2
            }], 1, function(answer) {
                var choice = cardMap[answer[0]];
                ygopro.write(gameResponse(choice));
            });
            break;
        case ('STOC_SELECT_TP'):
            gameBoard.question(slot, 'STOC_SELECT_TP', [0, 1], 1, function(answer) {
                ygopro.write(gameResponse('CTOS_TP_RESULT', answer[0]));
            });
            return {};
        case ('STOC_HAND_RESULT'):
            break;
        case ('STOC_TP_RESULT'):
            break;
        case ('STOC_CHANGE_SIDE'):
            break;
        case ('STOC_WAITING_SIDE'):
            break;
        case ('STOC_CREATE_GAME'):
            break;
        case ('STOC_JOIN_GAME'):
            break;
        case ('STOC_TYPE_CHANGE'):
            break;
        case ('STOC_LEAVE_GAME'):
            break;
        case ('STOC_DUEL_START'):
            //trigger to start duel, nothing more.
            break;
        case ('STOC_DUEL_END'):
            //trigger to close the duel, nothing more.
            break;
        case ('STOC_REPLAY'):
            break;
        case ('STOC_TIME_LIMIT'):
            break;
        case ('STOC_CHAT'):
            break;
        case ('STOC_HS_PLAYER_ENTER'):
            break;
        case ('STOC_HS_PLAYER_CHANGE'):
            break;
        case ('STOC_HS_WATCH_CHANGE'):
            break;
    }
    return message;
}
module.exports = boardController;