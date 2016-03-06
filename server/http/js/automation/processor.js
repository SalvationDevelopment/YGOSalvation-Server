/*jslint plusplus : true*/
/*global console, gui, $*/

var duel = {};

function cleanstate() {
    'use strict';
    window.duel = {
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
                name: '',
                ready: false
            },
            1: {
                name: '',
                ready: false
            },
            2: {
                name: '',
                ready: false
            },
            3: {
                name: '',
                ready: false
            }
        },
        spectators: 0,
        turn: 0,
        turnOfPlayer: 0,
        phase: 0
    };
    window.field = {
        0: {},
        1: {}
    };
}


function cardCollections(player) {
    'use strict';
    return {
        DECK: $('.p' + player + '.DECK').length,
        HAND: $('.p' + player + '.HAND').length,
        EXTRA: $('.p' + player + '.EXTRA').not('.overlayunit').length,
        GRAVE: $('.p' + player + '.GRAVE').length,
        REMOVED: $('.p' + player + '.REMOVED').length,
        SPELLZONE: 8,
        MONSTERZONE: 5
    };
}

function initiateNetwork_STOC(network) {
    'use strict';
    network.on('STOC_ERROR_MSG', function (data) {

    });
    network.on('STOC_SELECT_HAND', function (data) {
        //Trigger RPS Prompt
        gui.displayRPSSelector();
    });
    network.on('STOC_SELECT_TP', function (data) {
        gui.displaySelectWhoGoesFirst();
    });
    network.on('STOC_SELECT_RESULT', function (data) {

    });
    network.on('STOC_HAND_RESULT', function (data) {
        //Sissors = 1
        //Rock = 2
        //Paper = 3
        gui.hideRPSSelector();
        gui.displayRPSResult(data.res1, data.res2);
    });
    network.on('STOC_HS_WATCH_SIDE', function (data) {

    });
    network.on('STOC_TP_RESULT', function (data) {

    });
    network.on('STOC_CHANGE_SIDE', function (data) {

    });
    network.on('STOC_WAITING_SIDE', function (data) {

    });
    network.on('STOC_JOIN_GAME', function (data) {
        duel.banlistHashCode = data.banlistHashCode;
        duel.rule = data.rule;
        duel.mode = data.mode;
        duel.prio = data.prio;
        duel.deckcheck = data.deckcheck;
        duel.noshuffle = data.noshuffle;
        duel.startLP = data.startLP;
        duel.starthand = data.starthand;
        duel.drawcount = data.drawcount;
        duel.timelimit = data.timelimit;
        //fire handbars to render the view.
        gui.gotoLobby();
    });
    network.on('STOC_TYPE_CHANGE', function (data) {
        //remember who is the host, use this data to rotate the field properly.
        duel.ishost = data.ishost;
    });
    network.on('STOC_DUEL_START', function (STOC_DUEL_START) {
        window.singlesitenav('duelscreen');
        //switch view from duel to duel field.
    });
    network.on('STOC_DUEL_END', function (STOC_DUEL_START) {
        window.ws.close();
    });

    network.on('STOC_REPLAY', function (data) {

    });
    network.on('STOC_TIME_LIMIT', function (data) {

    });
    network.on('STOC_CHAT', function (data) {

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
    network.on('STOC_HS_WATCH_CHANGE', function (data) {
        //update the number of spectators.
        data.spectators = duel.spectators;
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
            previousName = String(duel.player[pos].name); //copy then delete...
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

}

function initiateNetwork_MSG(network) {
    'use strict';

    network.on('MSG_START', function (data) {
        //set the LP.
        duel.isFirst = data.isFirst;
        duel.player[0].lifepoints = data.lifepoints1;
        duel.player[1].lifepoints = data.lifepoints2;

        //set the size of each deck
        gui.StartDuel(data.lifepoints[0], data.lifepoints[1], data.deck[0], data.deck[1], data.extra[0], data.extra[0]);

        //double check that the screen is cleared.
        gui.hideSelectWhoGoesFirst();
        gui.hideRPSSelector();

    });
    network.on('MSG_WIN', function (data) {
        //???
    });
    network.on('MSG_SELECT_BATTLECMD', function (data) {
        //???
    });
    network.on('MSG_SELECT_EFFECTYN', function (data) {
        //???
    });
    network.on('MSG_SELECT_YESNO', function (data) {
        //???
    });
    network.on('MSG_SELECT_OPTION', function (data) {
        //???
    });
    network.on('MSG_SELECT_CARD', function (data) {
        //???
    });
    network.on('MSG_SELECT_CHAIN', function (data) {
        //???
    });
    network.on('MSG_SELECT_POSITION', function (data) {
        //???
    });
    network.on('MSG_SELECT_TRIBUTE', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('', function (data) {
        //???
    });
    network.on('MSG_WAITING', function (data) {
        gui.displayWaiting();
    });

    network.on('MSG_NEW_TURN', function (data) {
        //new turn, 
        duel.turn++;
        duel.turnOfPlayer = data.player;
        //refresh field
    });
    network.on('MSG_RELOAD_FIELD', function (data) {
        gui.ClearField();
    });
    network.on('MSG_UPDATE_DATA', function (data) {
        gui.UpdateData(data.player, data.fieldlocation, data.cards);
        //ygopro-core sent information about the state of a collection of related cards.
        //field[data.player][data.fieldmodel] = ???;
        //reimage field;
    });
    network.on('MSG_MOVE', function (data) {
        //use animation system in gui.js
        gui.MoveCard(data.code, data.pc, data.pl, data.ps, data.pp, data.cc, data.cl, data.cs, data.cp);

    });
    network.on('MSG_UPDATE_CARD', function (data) {
        //ygopro-core sent information about the state of one specific card.
        gui.UpdateCard(data.player, data.fieldlocation, data.index, data.card);
        //field[data.player][data.fieldmodel][data.index] = data.card;
        //redraw field;
    });
    network.on('MSG_CHAIN_END', function (data) {
        //???
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
    network.on('', function (data) {
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
        $('[data-currentphase]').attr('data-currentphase', data.phase);
        $('#phaseindicator button').removeClass('avaliable');
        window.actionables = {};
    });
    network.on('MSG_DRAW', function (data) {
        var i = 0;
        gui.DrawCard(data.player, data.count, data.cardslist);

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
        window.alert(data.error);
        //gui.displayRPSSelector();
    });



    network.on('MSG_SELECT_IDLECMD', function (data) {
        var list,
            i;
        window.actionables = {};
        window.idlecmd = data;
        window.idlelookup = [];
        for (list in data) {
            console.log(list);
            if (data.hasOwnProperty(list) && data[list] instanceof Array) {
                console.log('ok', data[list].length);
                for (i = 0; data[list].length > i; i++) {
                    console.log(data[list][i].code, list);
                    if (!window.actionables[data[list][i].code]) {
                        window.actionables[data[list][i].code] = [];
                    }
                    window.idlecmd[list][i].index = i;
                    window.actionables[data[list][i].code].push({
                        list: list,
                        index: i
                    });
                }
            }
        }
        if (!data.ep) {
            $('#endphi').addClass('avaliable');
        }
        if (data.bp) {
            $('#battlephi').addClass('avaliable');
        }
    });
    network.on('MSG_SELECT_PLACE', function (data) {
        var servermessage;
        if (data.respbuf) { //replace with if auto_placement = on;
            servermessage = makeCTOS('CTOS_RESPONSE', data.respbuf);
        } // else show field selector;

        window.ws.send(servermessage);
    });
}

var gametick = setInterval(gui.updateloby, 1000);

var initiateNetwork = {
    STOC: initiateNetwork_STOC,
    MSG: initiateNetwork_MSG
}