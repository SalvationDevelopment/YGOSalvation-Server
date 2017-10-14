/* global manualActionReference, singlesitenav, targetmode, record, manualTarget, zonetargetingmode */

function ygoproController(message) {
    $('.idleoption').removeClass('.idleoption');
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

        idleCommands.msetable_cards.forEach(function(card) {
            if (manualActionReference.id === card.code) {
                $('.ygo-set').css({
                    'display': 'block'
                });
            }
        });
        idleCommands.repositionable_cards.forEach(function(card) {
            if (manualActionReference.id === card.code) {
                $('.ygo-reposition').css({
                    'display': 'block'
                });
            }
        });
        idleCommands.select_chains.forEach(function(card) {
            if (manualActionReference.id === card.code) {
                $('.ygo-chain').css({
                    'display': 'block'
                });
            }
        });
        idleCommands.spsummonable_cards.forEach(function(card) {
            if (manualActionReference.id === card.code) {
                $('.ygo-special').css({
                    'display': 'block'
                });
            }
        });
        idleCommands.ssetable_cards.forEach(function(card) {
            if (manualActionReference.id === card.code) {
                $('.ygo-special-set').css({
                    'display': 'block'
                });
            }
        });
        idleCommands.summonable_cards.forEach(function(card) {
            if (manualActionReference.id === card.code) {
                $('.ygo-summon').css({
                    'display': 'block'
                });
            }
        });
    } catch (onError) {
        console.log(onError);
    }
}