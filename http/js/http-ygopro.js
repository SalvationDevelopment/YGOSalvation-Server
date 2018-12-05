/* global $, reveal, doGuiShuffle, orient, manualActionReference,activeQuestion, singlesitenav, targetmode, record, manualTarget, zonetargetingmode, reorientmenu, resolveQuestion */

var idleQuestion = {},
    battleQuestion = {},
    ylocations = {
        0x01: 'DECK',
        0x02: 'HAND',
        0x04: 'MONSTERZONE',
        0x08: 'SPELLZONE',
        0x10: 'GRAVE',
        0x20: 'REMOVED',
        0x40: 'EXTRA',
        0x80: 'OVERLAY'

    },
    ygoproLocations = {
        'DECK': 0x01,
        'HAND': 0x02,
        'MONSTERZONE': 0x04,
        'SPELLZONE': 0x08,
        'GRAVE': 0x10,
        'REMOVED': 0x20,
        'EXTRA': 0x40,
        'OVERLAY': 0x80
    },
    ygoproPositions = {
        'FaceUpAttack': 0x1,
        'FaceDownAttack': 0x2,
        'FaceUpDefence': 0x4,
        'FaceDownDefence': 0x8,
        'FaceUp': 0x5,
        'FaceDown': 0xA,
        'Attack': 0x3,
        'Defence': 0xC
    };


function filterSelectedOptions(card) {
    var result = activeQuestion.answer.includes(function(option) {
        var index = (option.player === card[0]),
            location = (option.location === ylocations[card[1]]),
            sequence = (option.index === card[2]);
        return (index && location && sequence);
    });
    return !result;
}

function unFilterSelectOptions(card) {
    return !filterSelectedOptions(card);
}

function setIdle(input) {
    input = input || {};
    idleQuestion = {
        summonable_cards: [],
        spsummonable_cards: [],
        repositionable_cards: [],
        msetable_cards: [],
        ssetable_cards: [],
        activatable_cards: [],
        select_options: [],
        attackable_cards: []
    };
    Object.assign(idleQuestion, input);
}


function selectStartingPlayer() {
    $('#selectplayer').css('display', 'block');
}

function notImmediatelyVisible(card) {
    return (card.location === 'GRAVE' ||
        card.location === 'EXTRA' ||
        card.location === 'DECK' ||
        card.location === 'REMOVED');
}

function ygoproQuestion(message) {
    'use strict';
    var type = message.type;
    activeQuestion = message;
    activeQuestion.answer = [];
    activeQuestion.action = 'question';
    zonetargetingmode = false;
    $('.cardselectionzone.p0').removeClass('card');
    $('.cardselectionzone.p0').removeClass('attackglow');
    $('.card, .cardselectionzone').removeClass('selection');
    switch (type) {
        case 'STOC_SELECT_TP':
            selectStartingPlayer();
            break;
        case 'MSG_SELECT_IDLECMD':
            setIdle(message.options);
            if (idleQuestion.enableBattlePhase) {
                $('#battlephi').addClass('option');
            }
            if (idleQuestion.enableEndPhase) {
                $('#endphi').addClass('option');
            }
            if (idleQuestion.shufflecount) {

            }
            idleQuestion.select_options = [];


            break;
        case 'MSG_SELECT_BATTLECMD':
            setIdle(message.options);
            if (idleQuestion.enableMainPhase2) {
                $('#main2phi').addClass('option');
            }
            if (idleQuestion.enableEndPhase) {
                $('#endphi').addClass('option');
            }
            break;
        case 'MSG_SELECT_TRIBUTE':
            zonetargetingmode = 'ygo';
            message.options.selectable_targets.forEach(function(zone) {
                $('.cardselectionzone.p' + orient(zone.player) + '.' + zone.location + '.i' + zone.index).addClass('card selection');
            });
            break;
        case 'MSG_SELECT_PLACE':
            zonetargetingmode = 'ygo';
            message.options.zones.forEach(function(zone) {
                $('.cardselectionzone.p' + zone.player + '.' + zone.location + '.i' + zone.index).addClass('card selection');
            });
            break;
        case 'MSG_SELECT_CARD':
            setIdle(message.options);
            if (message.options.select_options.some(notImmediatelyVisible)) {
                reveal(message.options.select_options, 'ygo');
            } else {
                message.options.select_options.forEach(function(card) {
                    $('.card.p' + orient(card.player) + '.' + card.location + '.i' + card.index).addClass('selection');
                });
            }
            break;
        case 'MSG_SELECT_POSITION':
            if (message.options.positionsMask === 0x1 ||
                message.options.positionsMask === 0x2 ||
                message.options.positionsMask === 0x4 ||
                message.options.positionsMask === 0x8) {
                resolveQuestion(toBytesInt32(message.options.positionsMask));
            } else {
                reveal(message.options.positions.map(function(position) {
                    var
                        card = message.options,
                        src = (card.id) ? 'https://raw.githubusercontent.com/shadowfox87/YGOSeries10CardPics/master/' + card.id + '.png' : 'img/textures/cover.jpg';

                    revealcache.push(card);
                    return '<img id="revealuid' + card.id + '" class="revealedcard" src="' + src + '" data-id="' + card.id + '" onclick = "resolveQuestion(toBytesInt32(ygoproPositions["' + position + '"]))" data-uid="' + card.uid + '" data-position="' + position + '" / > ';
                }), 'button');
            }
            break;
        default:
            break;
    }
}

function summonFlash(id) {
    $('#effectflasher').css('display', 'block');
    $('#effectflasher .mainimage').attr('src', 'https://raw.githubusercontent.com/shadowfox87/YGOSeries10CardPics/master/pics/' + id + '.png');
    setTimeout(function() {
        $('#effectflasher').css('display', 'none');
    }, 500);
}

function ygoproController(message) {
    scaleScreenFactor();
    if (message.command.indexOf('SELECT') > -1) {
        $('#ygowaiting').css('display', 'block').text('Your Move...');
    }
    switch (message.command) {
        case ('STOC_DUEL_START'):
            singlesitenav('duelscreen');
            break;
        case ('MSG_WAITING' || 'STOC_TIME_LIMIT' || 'STOC_WAITING_SIDE'):
            $('#ygowaiting').css('display', 'block').text('Waiting,...');
            break;
        case ('STOC_SELECT_TP'):
            break;
        case ('MSG_SELECT_IDLECMD'):
            $('#ygowaiting').css('display', 'block');
            break;
        case ('MSG_NEW_PHASE'):
            $('#ygowaiting').css('display', 'none');
            $('#phaseindicator button.option').removeClass('option');
            setIdle();
            break;
        case ('STOC_TIME_LIMIT'):
            $('.p' + message.player + 'time').val(message.time);
            break;
        case ('MSG_SUMMONING'):
            summonFlash(message.id);
            break;
        case ('MSG_SPSUMMONING'):
            summonFlash(message.id);
            break;
        case ('MSG_FLIPSUMMONING'):
            summonFlash(message.id);
            break;
        case ('MSG_CHAINING'):
            summonFlash(message.id);
        case ('MSG_SHUFFLE_DECK'):
            doGuiShuffle(orient(message.player), 'DECK');
            break;
        case ('MSG_SHUFFLE_HAND'):
            doGuiShuffle(orient(message.player), 'DECK');
            break;
        default:
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

function ygoproReviewOptions() {
    idleQuestion.select_options.filter(filterSelectedOptions).forEach(function(card, slot) {
        if (cardEquvilanceCheck(manualActionReference, card)) {
            resolveQuestion([
                manualActionReference.player,
                ygoproLocations[manualActionReference.location],
                manualActionReference.index
            ]);
        }
    });
    idleQuestion.summonable_cards.forEach(function(card, slot) {
        if (cardEquvilanceCheck(manualActionReference, card)) {
            $('.ygo-summon').attr('data-slot', (slot << 16)).css({
                'display': 'block'
            });
        }
    });
    idleQuestion.spsummonable_cards.forEach(function(card, slot) {
        if (cardEquvilanceCheck(manualActionReference, card)) {
            $('.ygo-special').attr('data-slot', ((slot << 16) + 1)).css({
                'display': 'block'
            });
        }
    });
    idleQuestion.repositionable_cards.forEach(function(card, slot) {
        var text = (manualActionReference.position && manualActionReference.position.indexOf('Attack') > -1) ? 'to Defense' : 'to Attack';
        if (cardEquvilanceCheck(manualActionReference, card)) {
            $('.ygo-reposition').attr('data-slot', ((slot << 16) + 2)).css({
                'display': 'block'
            }).text(text);
        }
    });

    idleQuestion.msetable_cards.forEach(function(card, slot) {
        if (cardEquvilanceCheck(manualActionReference, card)) {
            $('.ygo-set').attr('data-slot', ((slot << 16) + 3)).css({
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
            $('.ygo-activate').attr('data-slot', ((slot << 16) + (5))).css({
                'display': 'block'
            });
        }
    });
    idleQuestion.attackable_cards.forEach(function(card, slot) {
        if (cardEquvilanceCheck(manualActionReference, card)) {
            var message = ((slot << 16) + 1);
            $('.ygo-attack').attr('data-slot', message).css({
                'display': 'block'
            });
        }
    });
}

function zoneContainmentFilter(set, zone) {
    return set.some(function(card) {
        if (card.location === zone) {
            return true;
        }
    });
}


function viewExtraDeckSummonable() {
    reveal(idleQuestion.spsummonable_cards.filter(function(card) {
        return (card.location === 'EXTRA');
    }), 'ygo');
}



function idleOnClick() {
    var idIndex = window.manualDuel.uidLookup(record),
        stackunit = window.manualDuel.stack[idIndex],
        fullset = [];

    if (targetmode) {
        manualTarget(stackunit);
        return;
    }
    if (zonetargetingmode) {
        return;
    }

    if (stackunit === undefined) {
        fullset = [].concat(idleQuestion.spsummonable_cards,
            idleQuestion.activatable_cards,
            idleQuestion.select_options);
        stackunit = fullset.find(function(card) {
            return (card.id === record);
        });
        manualActionReference = stackunit;
        ygoproReviewOptions();
        reorientmenu();
        return;
    }

    manualActionReference = stackunit;
    $('#manualcontrols button').css({
        'display': 'none'
    });
    switch (manualActionReference.location) {
        case ('EXTRA'):
            $('.m-extra-view').css({
                'display': 'block'
            });
            if (zoneContainmentFilter(idleQuestion.spsummonable_cards, 'EXTRA')) {
                $('.ygo-extra-summonable').css({
                    'display': 'block'
                });
            }
            break;
        case ('DECK'):
            break;
        case ('GRAVE'):
            $('.m-extra-grave').css({
                'display': 'block'
            });
            if (zoneContainmentFilter(idleQuestion.spsummonable_cards, 'GRAVE')) {
                reveal(idleQuestion.spsummonable_cards.filter(function(card) {
                    (card.location === 'GRAVE');
                }), 'ygo');
            }
            if (zoneContainmentFilter(idleQuestion.activatable_cards, 'GRAVE')) {
                reveal(idleQuestion.activatable_cards.filter(function(card) {
                    (card.location === 'GRAVE');
                }), 'ygo');
            }
            break;
        case ('REMOVED'):
            $('.m-removed-view').css({
                'display': 'block'
            });
            if (zoneContainmentFilter(idleQuestion.spsummonable_cards, 'GRAVE')) {
                reveal(idleQuestion.spsummonable_cards.filter(function(card) {
                    (card.location === 'REMOVED');
                }), 'ygo');
            }
            if (zoneContainmentFilter(idleQuestion.activatable_cards, 'GRAVE')) {
                reveal(idleQuestion.activatable_cards.filter(function(card) {
                    (card.location === 'REMOVED');
                }), 'ygo');
            }
            break;
        default:
            ygoproReviewOptions();

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
        if (idleQuestion.command === 'MSG_SELECT_IDLECMD') {
            resolveQuestion(toBytesInt32(7));
            return;
        }
        if (idleQuestion.command === 'MSG_SELECT_BATTLECMD') {
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