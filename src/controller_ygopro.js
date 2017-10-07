function boardController(instance, message) {
    'use strict';
    switch (message.command) {
        case ('STOC_JOIN_GAME'):
            //copy the object over into the model
            instance.deckcheck = message.deckcheck;
            instance.draw_count = message.draw_count;
            instance.banlistHashCode = message.banlistHashCode;
            instance.mode = message.mode;
            instance.noshuffle = message.noshuffle;
            instance.prio = message.prio;
            instance.startlp = message.startlp;
            instance.starthand = message.startlp;
            //fire handbars to render the view.
            break;
        case ('STOC_TYPE_CHANGE'):
            //remember who is the host, use this message to rotate the field properly.
            instance.ishost = message.ishost;
            break;
        case ('STOC_HS_PLAYER_ENTER'):
            //someone entered the duel lobby as a challenger.
            //slot them into the avaliable open duel slots.
            var i;
            for (i = 0; 3 > i; i++) {
                if (!instance.player[i].name) {
                    instance.player[i].name = message.person;
                    return;
                }
            }
            break;
        case ('STOC_HS_PLAYER_CHANGE'):
            //update to the names in the slots,
            //signals leaving also.
            var state = message.state,
                stateText = message.stateText,
                pos = message.changepos,
                previousName;
            if (message.pos > 3) {
                return;
            }
            if (message.state < 8) {
                previousName = String(instance.player[pos]); //copy then delete...
                instance.player[state].name = previousName;
                instance.player[pos].name = '';
                instance.player[pos].ready = false;
                console.log('???');
            } else if (stateText === 'PLAYERCHANGE_READY') {
                instance.player[pos].ready = true;
            } else if (stateText === 'PLAYERCHANGE_NOTREADY') {
                instance.player[pos].ready = false;
            } else if (stateText === 'PLAYERCHANGE_LEAVE') {
                instance.player[pos].name = '';
                instance.player[pos].ready = false;
            } else if (stateText === 'PLAYERCHANGE_OBSERVE') {
                instance.player[pos].name = '';
                instance.player[pos].ready = false;
                instance.spectators++;
            }
            break;
        case ('STOC_HS_WATCH_CHANGE'):
            //update the number of spectators.
            message.spectators = instance.spectators;
            break;
        case ('STOC_DUEL_START'):
            //switch view from duel to duel field.
            break;
        case ('MSG_START'):
            //set the LP.
            instance.player[0].lifepoints = message.lifepoints1;
            instance.player[1].lifepoints = message.lifepoints2;
            //set the size of each deck
            break;
        case ('MSG_NEW_TURN'):
            //new turn, 
            instance.turn++;
            instance.turnOfPlayer = message.player;
            //refresh field
            break;
        case ('MSG_RELOAD_FIELD'):
            //???
            break;
        case ('MSG_UPDATE_message'):
            //ygopro-core sent information about the state of a collection of related cards.
            //field[message.player][message.fieldmodel] = ???;
            //reimage field;
            break;
        case ('MSG_MOVE'):
            //use animation system in gui.js

            break;
        case ('MSG_UPDATE_CARD'):
            //ygopro-core sent information about the state of one specific card.
            field[message.player][message.fieldmodel][message.index] = message.card;
            //redraw field;
            break;
        case ('MSG_CHAIN_END'):
            //???
            break;
        case ('MSG_WAITING'):
            //waiting animation/flag set to true.
            break;
        case ('MSG_SUMMONING'):
            //attempting to summon animation
            //message.code give the id of the card
            break;
        case ('MSG_SUMMONED'):
            //???
            break;
        case ('MSG_CHAINING'):
            //gives a card location and card
            break;
        case ('MSG_CHAINED'):
            //???
            break;
        case ('MSG_EQUIP'):
            //???
            break;
        case ('MSG_POS_CHANGE'):
            //??? might be extention of move command?
            break;
        case ('MSG_SHUFFLE_DECK'):
            //use gui to shuffle deck of message.player
            break;
        case ('MSG_CHAIN_SOLVED'):
            //???
            break;
        case ('MSG_NEW_PHASE'):
            instance.phase = message.phase;
            break;
        case ('MSG_DRAW'):
            var i = 0;
            for (i; message.count > i; i++) {
                field[message.player].DECK[(field.DECK.length - i)] = message.cardslist[i];
            }
            //due draw animation/update
            break;
        case ('MSG_SPSUMMONING'):
            //special summoning animation with message
            break;
        case ('MSG_SPSUMMONED'):
            //???
            break;
        case ('ERRMSG_DECKERROR'):
            //something is wrong with the deck you asked the server to validate!
            console.log(message.error);
            break;
        case ('STOC_SELECT_HAND'):
            //Trigger RPS Prompt
            break;
    }
}
module.exports = boardController;