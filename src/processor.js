/*jslint plusplus : true*/
/*global console*/
var duel = {
        deckcheck: 0,
        draw_count: 0,
        lflist: 0,
        mode: 0,
        noshuffle: 0,
        prio: 0,
        rule: 0,
        startlp: 0,
        starthand: 0,
        timelimit: 0,
        player: {
            0: {
                name: ''
            },
            1: {
                name: ''
            },
            2: {
                name: ''
            },
            3: {
                name: ''
            }
        },
        spectators: 0,
        turn: 0,
        turnOfPlayer: 0,
        phase: 0
    },
    field = {
        0: {},
        1: {}
    };

function initiateNetwork(network) {
    'use strict';
    network.on('STOC_JOIN_GAME', function (data) {
        //copy the object over into the model
        duel.deckcheck = data.deckcheck;
        duel.draw_count = data.draw_count;
        duel.banlistHashCode = data.banlistHashCode;
        duel.mode = data.mode;
        duel.noshuffle = data.noshuffle;
        duel.prio = data.prio;
        duel.startlp = data.startlp;
        duel.starthand = data.startlp;
        //fire handbars to render the view.
    });
    network.on('STOC_TYPE_CHANGE', function (data) {
        //remember who is the host, use this data to rotate the field properly.
        duel.ishost = data.ishost;
    });
    network.on('STOC_HS_PLAYER_ENTER', function (data) {
        //someone entered the duel lobby as a challenger.
        //slot them into the avaliable open duel slots.
        var i;
        for (i = 0; 3 > i; i++) {
            if (!duel.player[i].name) {
                duel.player[i].name = data.person;
                return;
            }
        }
    });
    network.on('STOC_HS_PLAYER_CHANGE', function (data) {
        //update to the names in the slots,
        //signals leaving also.
        var state = data.state,
            stateText = data.stateText,
            pos = data.changepos,
            previousName;
        if (data.pos > 3) {
            return;
        }
        if (data.state < 8) {
            previousName = String(duel.player[pos]); //copy then delete...
            duel.player[state].name = previousName;
            duel.player[pos].name = '';
            duel.player[pos].ready = false;
            console.log('???');
        } else if (stateText === 'PLAYERCHANGE_READY') {
            duel.player[pos].ready = true;
        } else if (stateText === 'PLAYERCHANGE_NOTREADY') {
            duel.player[pos].ready = false;
        } else if (stateText === 'PLAYERCHANGE_LEAVE') {
            duel.player[pos].name = '';
            duel.player[pos].ready = false;
        } else if (stateText === 'PLAYERCHANGE_OBSERVE') {
            duel.player[pos].name = '';
            duel.player[pos].ready = false;
            duel.spectators++;
        }
    });
    network.on('STOC_HS_WATCH_CHANGE', function (data) {
        //update the number of spectators.
        data.spectators = duel.spectators;
    });
    network.on('STOC_DUEL_START', function (STOC_DUEL_START) {
        //switch view from duel to duel field.
    });
    network.on('MSG_START', function (data) {
        //set the LP.
        duel.player[0].lifepoints = data.lifepoints1;
        duel.player[1].lifepoints = data.lifepoints2;
        //set the size of each deck
    });
    network.on('MSG_NEW_TURN', function (data) {
        //new turn, 
        duel.turn++;
        duel.turnOfPlayer = data.player;
        //refresh field
    });
    network.on('MSG_RELOAD_FIELD', function (data) {
        //???
    });
    network.on('MSG_UPDATE_DATA', function (data) {
        //ygopro-core sent information about the state of a collection of related cards.
        //field[data.player][data.fieldmodel] = ???;
        //reimage field;
    });
    network.on('MSG_MOVE', function (data) {
        //use animation system in gui.js

    });
    network.on('MSG_UPDATE_CARD', function (data) {
        //ygopro-core sent information about the state of one specific card.
        field[data.player][data.fieldmodel][data.index] = data.card;
        //redraw field;
    });
    network.on('MSG_CHAIN_END', function (data) {
        //???
    });
    network.on('MSG_WAITING', function (data) {
        //waiting animation/flag set to true.
    });
    network.on('MSG_SUMMONING', function (data) {
        //attempting to summon animation
        //data.code give the id of the card
    });
    network.on('MSG_SUMMONED', function (data) {
        //???
    });
    network.on('MSG_CHAINING', function (data) {
        //gives a card location and card
    });
    network.on('MSG_CHAINED', function (data) {
        //???
    });
    network.on('MSG_EQUIP', function (data) {
        //???
    });
    network.on('MSG_POS_CHANGE', function (data) {
        //??? might be extention of move command?
    });
    network.on('MSG_SHUFFLE_DECK', function (data) {
        //use gui to shuffle deck of data.player
    });
    network.on('MSG_CHAIN_SOLVED', function (data) {
        //???
    });
    network.on('MSG_NEW_PHASE', function (data) {
        duel.phase = data.phase;
    });
    network.on('MSG_DRAW', function (data) {
        var i = 0;
        for (i; data.count > i; i++) {
            field[data.player].DECK[(field.DECK.length - i)] = data.cardslist[i];
        }
        //due draw animation/update
    });
    network.on('MSG_SPSUMMONING', function (data) {
        //special summoning animation with data
    });
    network.on('MSG_SPSUMMONED', function (data) {
        //???
    });
    network.on('ERRMSG_DECKERROR', function (data) {
        //something is wrong with the deck you asked the server to validate!
        alert(data.error);
    });
    network.on('STOC_SELECT_HAND', function (data) {
        //Trigger RPS Prompt
    });
}