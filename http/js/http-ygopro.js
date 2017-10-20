/* global $, manualActionReference, singlesitenav, targetmode, record, manualTarget, zonetargetingmode, reorientmenu, resolveQuestion */

var COMMAND_SUMMON = 0,
    COMMAND_SPECIAL_SUMMON = 1,
    COMMAND_CHANGE_POS = 2,
    COMMAND_SET_MONSTER = 3, // ???
    COMMAND_SET_ST = 4,
    COMMAND_ACTIVATE = 5,
    COMMAND_TO_NEXT_PHASE = 6,
    COMMAND_TO_END_PHASE = 7,
    ygoproLocations = {
        'DECK': 0x01,
        'HAND': 0x02,
        'MONSTERZONE': 0x04,
        'SPELLZONE': 0x08,
        'GRAVE': 0x10,
        'REMOVED': 0x20,
        'EXTRA': 0x40,
        'OVERLAY': 0x80
    }



function ygoproController(message) {
    $('.idleoption').removeClass('.idleoption');
    scaleScreenFactor();
    switch (message.command) {
        case ('STOC_DUEL_START'):
            singlesitenav('duelscreen');
            break;
        case ('STOC_SELECT_TP'):
            break;
        case ('MSG_SELECT_IDLECMD'):
            break;
    }
}

var idleQuestion = {};

function idleCommands(message) {
    if (message.enableBattlePhase) {
        $('.idleBattle').addClass('idleoption');
    }
    if (message.enableEndPhase) {
        $('.idleEnd').addClass('idleoption');
    }
}

function cardEquvilanceCheck(gui, data) {
    var index = (gui.player === data.player),
        location = (gui.location === data.location),
        sequence = (gui.index === data.index);

    return (index && location && sequence);
}

function idleOnClick() {
    try {
        var idIndex = window.manualDuel.uidLookup(record),
            stackunit = window.manualDuel.stack[idIndex],
            dbEntry;

        if (targetmode) {
            manualTarget(stackunit);
            return;
        }
        if (zonetargetingmode) {
            return;
        }

        manualActionReference = stackunit;
        $('#manualcontrols button').css({
            'display': 'none'
        });
        idleQuestion.summonable_cards.forEach(function(card, slot) {
            if (cardEquvilanceCheck(manualActionReference, card)) {
                $('.ygo-summon').attr('data-slot', ((slot) << 16)).css({
                    'display': 'block'
                });
            }
        });
        idleQuestion.spsummonable_cards.forEach(function(card, slot) {
            if (cardEquvilanceCheck(manualActionReference, card)) {
                $('.ygo-special').attr('data-slot', (((slot) << 16) + 1)).css({
                    'display': 'block'
                });
            }
        });
        idleQuestion.repositionable_cards.forEach(function(card, slot) {
            if (cardEquvilanceCheck(manualActionReference, card)) {
                $('.ygo-reposition').attr('data-slot', (((slot + 1) << 16) + 2)).css({
                    'display': 'block'
                });
            }
        });

        idleQuestion.msetable_cards.forEach(function(card, slot) {
            if (cardEquvilanceCheck(manualActionReference, card)) {
                $('.ygo-set').attr('data-slot', (((slot + 1) << 16) + 3)).css({
                    'display': 'block'
                });
            }
        });
        idleQuestion.ssetable_cards.forEach(function(card, slot) {
            if (cardEquvilanceCheck(manualActionReference, card)) {
                $('.ygo-st-set').attr('data-slot', ((slot << 16) + 4)).css({
                    'display': 'block'
                });
            }
        });
        idleQuestion.activatable_cards.forEach(function(card, slot) {
            if (cardEquvilanceCheck(manualActionReference, card)) {
                var message = ((slot << 16) + 5);
                $('.ygo-activate').attr('data-slot', message).css({
                    'display': 'block'
                });
            }
        });
    } catch (onError) {
        console.log(onError);
    }
    reorientmenu();
}

function toBytesInt32(num) {
    var arr = new ArrayBuffer(4), // an Int32 takes 4 bytes
        view = new DataView(arr);
    view.setUint32(0, num, true); // byteOffset = 0; litteEndian = false
    return [view.getInt8(0), view.getInt8(1), view.getInt8(2), view.getInt8(3)];
}


function idleResponse(action, target) {
    resolveQuestion(toBytesInt32(parseInt($(target).attr('data-slot'), 10)));
}

function sayYES() {
    resolveQuestion(toBytesInt32(parseInt(1, 10)));
}

function sayNO() {
    resolveQuestion(toBytesInt32(parseInt(0, 10)));
}

function sayCANCEL() {
    resolveQuestion(toBytesInt32(parseInt(-1, 10)));
}