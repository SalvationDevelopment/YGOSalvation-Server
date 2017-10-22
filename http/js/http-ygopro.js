/* global $, manualActionReference,activeQuestion, singlesitenav, targetmode, record, manualTarget, zonetargetingmode, reorientmenu, resolveQuestion */

var idleQuestion = {},
    battleQuestion = {},
    ygoproLocations = {
        'DECK': 0x01,
        'HAND': 0x02,
        'MONSTERZONE': 0x04,
        'SPELLZONE': 0x08,
        'GRAVE': 0x10,
        'REMOVED': 0x20,
        'EXTRA': 0x40,
        'OVERLAY': 0x80
    };

function setIdle() {
    idleQuestion = {
        summonable_cards: [],
        spsummonable_cards: [],
        repositionable_cards: [],
        msetable_cards: [],
        ssetable_cards: [],
        activatable_cards: [],
        battle: false
    };
}


function selectStartingPlayer() {
    $('#selectplayer').css('display', 'block');
}

function ygoproQuestion(message) {
    'use strict';
    var type = message.type;
    activeQuestion = message;
    activeQuestion.answer = [];
    activeQuestion.action = 'question';
    switch (type) {
        case 'STOC_SELECT_TP':
            selectStartingPlayer();
            break;
        case 'MSG_SELECT_IDLECMD':
            idleQuestion = message.options;
            if (idleQuestion.enableBattlePhase) {
                $('#battlephi').addClass('option');
            }
            if (idleQuestion.enableEndPhase) {
                $('#endphi').addClass('option');
            }
            if (idleQuestion.shufflecount) {

            }
            break;
        case 'MSG_SELECT_BATTLECMD':
            idleQuestion = message.options;
            idleQuestion.battle = true;
            if (idleQuestion.enableMainPhase2) {
                $('#main2phi').addClass('option');
            }
            if (idleQuestion.enableEndPhase) {
                $('#endphi').addClass('option');
            }
            break;
        case 'MSG_SELECT_PLACE':
            zonetargetingmode = 'ygo';
            message.options.zones.forEach(function(zone) {
                $('.cardselectionzone.p' + zone.player + '.' + zone.zone + '.i' + zone.slot).addClass('attackglow card')
            });
        default:
            break;
    }
}

function ygoproController(message) {

    scaleScreenFactor();
    switch (message.command) {
        case ('STOC_DUEL_START'):
            singlesitenav('duelscreen');
            break;
        case ('STOC_SELECT_TP'):
            break;
        case ('MSG_SELECT_IDLECMD'):
            break;
        case ('MSG_NEW_PHASE'):
            $('#phaseindicator button.option').removeClass('option');
            setIdle();
            break;
        case ('STOC_TIME_LIMIT'):
            $('.p' + message.player + 'time').val(message.time);
            break;
    }
}



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
        idleQuestion.attackable_cards.forEach(function(card, slot) {
            if (cardEquvilanceCheck(manualActionReference, card)) {
                var message = ((slot << 16) + 1);
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


function idleResponse(target) {
    resolveQuestion(toBytesInt32(parseInt($(target).attr('data-slot'), 10)));
}

function sayYES() {
    resolveQuestion(toBytesInt32(parseInt(1, 10)));
}

function sayNO() {
    resolveQuestion(toBytesInt32(0));
}

function sayCANCEL() {
    resolveQuestion(toBytesInt32(-1));
}

function changeAttackPosition(AttackPosition) {
    resolveQuestion(toBytesInt32(AttackPosition));
}

function ygoproNextPhase(phase) {
    if (phase === 5) {
        if (idleQuestion.enableEndPhase) {
            resolveQuestion(toBytesInt32(7));
            return;
        }
        if (idleQuestion.battle) {
            resolveQuestion(toBytesInt32(3));
            return;
        }
    }
    if (phase === 3) {
        if (idleQuestion.enableBattlePhase) {
            resolveQuestion(toBytesInt32(parseInt(6, 10)));
            return;
        }
        if (battleQuestion.enableEndPhase) {
            resolveQuestion(toBytesInt32(parseInt(3, 10)));
            return;
        }
    }
}