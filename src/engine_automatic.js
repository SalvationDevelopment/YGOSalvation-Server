/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';


// review the following https://github.com/Fluorohydride/ygopro-core/blob/master/processor.cpp


const DRAW_PHASE = 0,
    STANDBY_PHASE = 1,
    MAIN_PHASE_1 = 2,
    BATTLE_PHASE = 3,
    MAIN_PHASE_2 = 4,
    END_PHASE = 5,
    path = require('path'),
    sourceDir = path.resolve('../'),
    aux = require('../scripts/utilities/index.js'),
    waterfall = require('async-waterfall'), // Async flow control
    hotload = require('hotload'); // Allows for cards to be live edited


function isCard(cat, obj) {
    'use strict';
    if (cat === 'monster' && (obj.race !== 0 || obj.level !== 0 || obj.attribute !== 0)) {
        return true;
    }
    if (cat === 'monster') {
        return (obj.type & 1) === 1;
    }
    if (cat === 'spell') {
        return (obj.type & 2) === 2;
    }
    if (cat === 'trap') {
        return (obj.type & 4) === 4;
    }
    if (cat === 'fusion') {
        return (obj.type & 64) === 64;
    }
    if (cat === 'ritual') {
        return (obj.type & 128) === 128;
    }
    if (cat === 'synchro') {
        return (obj.type & 8192) === 8192;
    }
    if (cat === 'token') {
        return (obj.type & 16400) === 16400;
    }
    if (cat === 'xyz') {
        return (obj.type & 8388608) === 8388608;
    }
    if (cat === 'link') {
        return (obj.type & 33554432) === 33554432;
    }
}

function setupCard(card) {
    if (isCard('monster', card)) {

    } else {

    }
}
/**
 * Get cards that have a specific effect type.
 * @param   {Object}   duel       Engine Instance
 * @param   {String} effectType Text String to look for
 * @returns {Array} Array of card
 */
function getForType(duel, effectType) {
    return duel.stack.filter(function(card) {
        var validEffectList = card.effectList.some(function(effect) {
            if (Array.isArray(effectType)) {
                effect.setType.includes(effectType);
            } else {
                return effect.setType === effectType;
            }
        });
        return validEffectList.length;
    });
}

/**
 * Get cards that have a specific effect category.
 * @param   {Object}   duel           Engine Instance
 * @param   {String} effectCategory Text String to look for
 * @returns {Array} Array of card
 */
function getForCategory(duel, effectCategory) {
    return duel.stack.filter(function(card) {
        var validEffectList = card.effectList.some(function(effect) {
            if (Array.isArray(effectCategory)) {
                effect.SetCategory.includes(effectCategory);
            } else {
                return effect.SetCategory === effectCategory;
            }
        });
        return validEffectList.length;
    });
}

/**
 * Get cards that have a specific effect code.
 * @param   {Object}   duel       Engine Instance
 * @param   {String} effectCode Text String to look for
 * @returns {Array} Array of card
 */
function getForEffects(duel, effectCode) {
    return duel.stack.filter(function(card) {
        var validEffectList = card.effectList.some(function(effect) {
            if (Array.isArray(effectCode)) {
                effect.SetCode.includes(effectCode);
            } else {
                return effect.SetCode === effectCode;
            }
        });
        return validEffectList.length;
    });
}

/**
 * Get cards that have a specific effect code.
 * @param   {Object}   duel       Engine Instance
 * @param   {String} effectProperty Text String to look for
 * @returns {Array} Array of card
 */
function getForProperty(duel, effectProperty) {
    return duel.stack.filter(function(card) {
        var validEffectList = card.effectList.some(function(effect) {
            if (Array.isArray(effectProperty)) {
                effect.SetProperty.includes(effectProperty);
            } else {
                return effect.SetProperty === effectProperty;
            }
        });
        return validEffectList.length;
    });
}


/*
    Action Object
    {
        command  : {Function}, required
        callback : {Function}, optional
        params   : {Array}     optional
    }
    Can be understood as:
    `command(params[0], params[1], etc..., callback);`
    
    When sending a question to the user, make sure to set a duel.responseEngine.once listener with a
    unique id to catch the response. Do not use `.on`.
*/


/**
 * Process a queue of actions (as defined by above Action Object).
 * @param {Array} actionQueue Array of action Objects. Each contains a command and parameters.
 * @param {callback} callback allow function to be recursive.
 * @returns {undefined}
 */
function processQueue(actionQueue, duel, callback) {
    console.log('start doing stuff');
    // waterfall takes a list of functions, we need to generate those functions.
    waterfall(actionQueue, callback);
}

/**
 * Do the automatic processsing of the draw phase. Start by emptying the queue then doing base logic.
 * @param {Object}   duel              Engine instance.
 * @param {Function} callback          Function to call to move onto next phase.
 * @return {undefined}
 */
function doDrawPhase(duel, callback) {
    console.log('draw');
    var drawPhaseActionQueue = duel.drawPhaseActionQueue;
    if (duel.skipDrawPhase) {
        // kill everything in the draw phase queue. Skip it, but make sure it isnt around next turn.
        drawPhaseActionQueue.length = 0;
        callback(null);
        return;
    }

    duel.nextPhase(DRAW_PHASE);

    // Do any "on start of phase", actions first, then attempt to draw.
    processQueue(drawPhaseActionQueue, duel, function() {
        var state = duel.getState(),
            player = state.turnOfPlayer,
            turnCount = state.turn;
        console.log(turnCount, player)
        if (turnCount && !state.skipDraw) {

            /* duel engine moves the card, then triggers its effects
               when its done it moves on. That is why the callback is passed. 
               By the way this is the part where you actually draw. */

            duel.drawCard(player, 1, duel.playerName[player], function() {

                /* drawing a card may have added an action to the phase stack so do it again */
                processQueue(drawPhaseActionQueue, duel, function() {
                    callback(null);
                });
            });
        } else {
            console.log('start turn not drawing...');
            processQueue(drawPhaseActionQueue, duel, function() {
                callback(null);
            });
        }
    });
    return;
}

/**
 * Do the automatic processsing of the standby phase.
 * @param {Object}   duel                      Engine instance
 * @param {Function} callback                  Function to call to move onto next phase.
 * @return {undefined}
 */
function doStandbyPhase(duel, callback) {
    var standbyPhaseActionQueue = duel.standbyPhaseActionQueue;
    if (duel.skipStandbyPhase) {
        // kill everything in the standby phase queue. Skip it, but make sure it isnt around next turn.
        standbyPhaseActionQueue.length = 0;
        callback(null);
        return;
    }


    duel.nextPhase(MAIN_PHASE_1);
    processQueue(standbyPhaseActionQueue, duel, function() {
        callback(null);
    });
    return;
}

/**
 * Get a list of cards that the active user can normal summon at the moment.
 * @param {Object} duel Engine Instance
 * @param {String} prevention Card type text to ignore
 * @returns {Array}  List of Cards
 */
function getNormalOptions(duel, prevention) {
    if (!duel.normalSummonedThisTurn) {
        var cards = duel.getGroup({
                location: 'HAND',
                player: duel.getState().turnOfPlayer
            }),

            monsters = cards.filter(function(card) {
                return isCard('monster', card);
            });
        console.log('getting normal options', cards.length);
        return monsters.filter(function(card) {
            if (card.effectList) {
                var validEffectList = card.effectList.some(function(effect) {
                    return effect.SetCode !== prevention;
                });
                return (validEffectList.length && card.level < 5);
            } else {
                return false;
            }
        });
    } else {
        return [];
    }
}

/**
 * Generate action list for main phases.
 * @param   {Object} duel Engine instance
 * @returns {Object} options that user can take.
 */
function getMainPhaseActions(duel) {
    return {
        normalsummonable: getNormalOptions(duel, 'CANNONT_NORMAL_SUMMON'),
        cansetmonster: getNormalOptions(duel, 'CANNONT_SET'),
        specialsummonable: duel.getGroup({
            specialsummonable: true,
            location: 'HAND'
        }),
        canchangetodefense: duel.getGroup({
            canchangetodefense: true,
            location: 'MONSTERZONE'
        }),
        canactivatespelltrap: duel.getGroup({
            canactivate: true,
            location: 'SPELLZONE'
        }),
        cantributesummon: duel.getGroup({
            canTributeSummon: true,
            location: 'HAND'
        }),
        cansetspelltrap: duel.getGroup({
            cansetspelltrap: true,
            location: 'HAND'
        }),
        canactivategrave: duel.getGroup({
            canactivategrave: true,
            location: 'GRAVE'
        }),
        canactivatebanished: duel.getGroup({
            canactivatebanished: true,
            location: 'REMOVED'
        })
    };
}

/**
 * Do the automatic processsing of the main phase 1.
 * @param {Object}   duel        Engine instance
 * @param {Function} callback    Function to call to move onto next phase.
 * @return {undefined}
 */
function doMainPhase1(duel, callback) {
    var mainPhase1ActionQueue = duel.mainPhase1ActionQueue;
    console.log('MARK');
    duel.nextPhase(MAIN_PHASE_1);

    function askUserNextAction() {
        processQueue(mainPhase1ActionQueue, duel, function() {
            var state = duel.getState(),
                player = state.turnOfPlayer,
                turnCount = state.turnCount,
                options = getMainPhaseActions(duel);
            duel.question(player, 'mainphase', {
                questionType: 'mainphase',
                battlephase: state.battlephaseAvaliable,
                endphase: state.endPhaseAvaliable,
                normalSummon: options.normalsummonable,
                specialSummon: options.specialsummonable,
                toDefense: options.canchangetodefense,
                setMonster: options.cansetmonster,
                activateSpellTrap: options.canactivatespelltrap,
                setSpellTrap: options.cansetspelltrap,
                pendulumSummon: state.pendulumnSummonAvaliable,
                player: state.turnOfPlayer

            }, 1, function(message) {
                switch (message.action) {
                    case 'battlephase':
                        callback(null);
                        break;
                    case 'endphase':
                        duel.skipbattlephase = true;
                        duel.skipmainphase2 = true;
                        callback(null);
                        break;
                    case 'normalsummon':
                        duel.question({
                            questionType: 'openMonsterSlots'
                        }, function(querytionError, openMonsterSlots) {
                            message.index = openMonsterSlots;
                            // Really need to fix
                            duel.setState(message);
                            duel.normalSummonedThisTurn = true;
                        });

                        break;
                    default:
                        askUserNextAction();
                        break;
                }
            });

        });
    }
    askUserNextAction();
    return;
}


/**
 * Do the automatic processsing of the battle phase.
 * @param {Object}   duel                      Engine instance
 * @param {Function} callback                  Function to call to move onto next phase.
 * @return {undefined}
 */
function doBattlePhase(duel, callback) {

    var battlePhaseActionQueue = duel.battlePhaseActionQueue;

    if (duel.skipbattlephase) {
        // kill everything in the battle queue. Skip it, but make sure it isnt around next turn.
        battlePhaseActionQueue.length = 0;
        callback(null);
        return;
    }

    duel.nextPhase(BATTLE_PHASE);

    function askUserNextAction() {
        processQueue(battlePhaseActionQueue, duel, function() {
            var state = duel.getState(),
                player = state.turnOfPlayer,
                turnCount = state.turnCount,
                canattack = duel.getGroup({
                    canattack: true,
                    location: 'MONSTERZONE'
                }),
                canactivate = duel.getGroup({
                    canactivate: true
                });

            duel.question({
                questionType: 'battlephase',
                attackOptions: canattack,
                activationOptions: canactivate,
                player: state.turnOfPlayer
            }, function(error, answer) {

                switch (answer.action) {
                    case 'mainphase2':
                        callback(null);
                        break;
                    case 'endphase':
                        duel.skipmainphase2 = true;
                        callback(null);
                        break;
                    default:
                        askUserNextAction();
                        break;
                }
            });
        });
    }
    askUserNextAction();
    return;
}

/**
 * Process Damage Calculation
 * @param {Object}        duel       Engine Instance
 * @param {Number}        attackerID Attacking Cards UID
 * @param {Number|Null}   defenderID Defending Cards UID, 
 * @param {Function}      callback   Finishing function
 * @return {undefined}
 */
function doDamageCalculation(duel, attackerID, defenderID, callback) {
    var damageCalculationActionQueue = duel.damageCalculationActionQueue;

    // Give cards notice that damage calculation is starting.
    duel.enterDamageCalculation();

    function afterDamageCalculation() {

        // Process any cards that where moved effects after damage calculation.
        processQueue(damageCalculationActionQueue, duel, function() {

            // leave damage calculation and then give cards a chance to respond.
            duel.leaveDamageCalculation();
            processQueue(damageCalculationActionQueue, duel, callback);
        });
    }

    // do any events at the start of damage calculation to change attack values
    processQueue(damageCalculationActionQueue, duel, function() {

        // This doesnt return the card but a modified version of the card for easy math.
        var attackingCard = duel.getDamageCalculationCard(attackerID),
            defendingCard = duel.getDamageCalculationCard(defenderID),
            sendAttackerToGrave = false,
            sendDefenderToGrave = false;



        function calculate() {
            // Actual damage calculation mathmatics
            if (defendingCard.card === undefined) {
                duel.changeLifepoints(defendingCard.player, (-1 * attackingCard.atk));
            } else if (defendingCard.card.position === 'FaceUpDefense') {
                if (attackingCard.card.atk > defendingCard.card.def) {
                    sendDefenderToGrave = true;
                    if (attackingCard.piercing) {
                        duel.changeLifepoints(defendingCard.player, defendingCard.card.def - attackingCard.card.atk);
                    }
                } else if (attackingCard.card.atk < defendingCard.card.def) {
                    duel.changeLifepoints(attackingCard.player, attackingCard.card.atk - defendingCard.card.atk);
                }
            } else {
                if (attackingCard.card.atk > defendingCard.card.atk) {
                    duel.changeLifepoints(defendingCard.player, defendingCard.card.atk - attackingCard.card.atk);
                    if (attackingCard.card.atk) {
                        sendAttackerToGrave = true;
                    }
                } else if ((attackingCard.card.atk < defendingCard.card.atk)) {
                    duel.changeLifepoints(defendingCard.player, attackingCard.card.atk - defendingCard.card.atk);
                    sendDefenderToGrave = true;
                } else {
                    sendAttackerToGrave = true;
                    sendDefenderToGrave = true;
                }
            }


            // Pick one of three outcomes for card movements and do them.
            if (sendAttackerToGrave && !sendDefenderToGrave) {
                duel.setState({}, afterDamageCalculation);
            } else if (sendAttackerToGrave && sendDefenderToGrave) {
                duel.setState({}, afterDamageCalculation);
            } else if (!sendAttackerToGrave && !sendDefenderToGrave) {
                duel.setState({}, afterDamageCalculation);
            }
        }

        // flip defense position monsters face up and apply flip effect.
        // then do damage calculation.
        if (defendingCard.card.position === 'FaceDownDefense') {
            duel.setState({}, function() {
                processQueue(damageCalculationActionQueue, duel, function() {
                    calculate();
                });
            });
        } else {
            calculate();
        }
    });
}

/**
 * Do the automatic processsing of the main phase 2.
 * @param {Object}   duel                      Engine instance
 * @param {Function} callback                  Function to call to move onto next phase.
 * @return {undefined}
 */
function doMainPhase2(duel, callback) {

    var mainPhase2ActionQueue = duel.mainPhase2ActionQueue;

    if (duel.skipmainphase2) {
        // kill everything in the main phase 2 queue. Skip it, but make sure it isnt around next turn.
        mainPhase2ActionQueue.length = 0;
        callback(null);
        return;
    }
    duel.nextPhase(MAIN_PHASE_2);

    function askUserNextAction() {
        processQueue(mainPhase2ActionQueue, duel, function() {
            var state = duel.getState(),
                player = state.turnOfPlayer,
                turnCount = state.turnCount,
                options = getMainPhaseActions(duel);


            duel.question({
                questionType: 'mainphase',
                battlephase: state.battlephaseAvaliable,
                endphase: state.endPhaseAvaliable,
                normalSummon: options.normalsummonable,
                specialSummon: options.specialsummonable,
                toDefense: options.canchangetodefense,
                setMonster: options.cansetmonster,
                activateSpellTrap: options.canactivatespelltrap,
                setSpellTrap: options.cansetspelltrap,
                pendulumSummon: state.pendulumnSummonAvaliable,
                player: state.turnOfPlayer
            }, function(error, answer) {
                switch (answer.action) {
                    case 'endphase':
                        callback(null);
                        break;
                    default:
                        askUserNextAction();
                        break;
                }
            });

        });
    }
    askUserNextAction();
    return;
}

/**
 * Do the automatic processsing of the end phase.
 * @param {Object}   duel                      Engine instance
 * @param {Function} callback                  Function to call go to setup the next turn.
 * @return {undefined}
 */
function doEndPhase(duel, callback) {
    var endPhaseActionQueue = duel.endPhaseActionQueue;
    duel.nextPhase(END_PHASE);

    function checkCardCount() {
        processQueue(endPhaseActionQueue, duel, function() {
            var state = duel.getgetState(),
                hand = duel.getGroup({
                    player: state.turnOfPlayer,
                    location: 'HAND'
                });
            if (hand.length > duel.maxHandSize) {
                duel.question({
                    'questiontype': 'select',
                    options: hand
                }, function(error, message) {
                    // discard
                    duel.setState(message, 'discard');
                    checkCardCount();
                });
            } else {
                duel.nextTurn();
                callback(null);
            }

        });
    }

    checkCardCount();
    return;
}




/**
 * Start cycle through phases of the game
 * @param {Object} duel  Engine Instance
 * @return {undefined}
 */
function setupTurn(duel) {


    // main phase 2, and battle phase skips to be determined by other mechanisms that reset each turn.
    duel.skipmainphase2 = duel.skipmainphase2 || false;
    duel.skipbattlephase = duel.skipbattlephase || false;
    duel.normalSummonedThisTurn = false;


    // queue up each of the game phase.
    // each phase is "done" even if skipped by a card effect.
    // each phase processing function has a way of handling skips.


    duel.drawPhaseActionQueue = duel.drawPhaseActionQueue || [];
    duel.standbyPhaseActionQueue = duel.standbyPhaseActionQueue || [];
    duel.mainPhase1ActionQueue = duel.mainPhase1ActionQueue || [];
    duel.damageCalculationActionQueue = duel.damageCalculationActionQueue || [];
    duel.mainPhase2ActionQueue = duel.mainPhase2ActionQueue || [];
    duel.endPhaseActionQueue = duel.endPhaseActionQueue || [];

    function run() {
        doDrawPhase(duel, function() {
            doStandbyPhase(duel, function() {
                doMainPhase1(duel, function() {
                    doBattlePhase(duel, function() {
                        doMainPhase2(duel, function() {
                            doEndPhase(duel, function() {});
                        });
                    });
                });
            });
        });
    }


    console.log('everything is queued');

    run(function() {
        if (!duel.quit) {
            setTimeout(run, 0);
        }
    });
}


function generic() {
    return undefined;
}

/**
 * Initialize all the cards in a duel.
 * @param {Object} duel Engine Instance 
 * @return {undefined}
 */
function loadCardScripts(duel, database) {
    console.log('loading scripts', sourceDir);

    function getCardById(cardId) {
        var result = database.find(function(card) {
            if (card.id === parseInt(cardId, 10)) {
                return true;
            }
            return false;
        });
        return result || {};
    }

    duel.getState().stack.forEach(function(card) {

        Object.assign(card, getCardById(card.id));
        try {
            card.effectList = [];
            card.registerEffect = function(effect) {
                card.effectList.push(effect);
            };
            card.runEffects = function() {};
            card.canattack = true;
            card.script = hotload('../scripts/' + card.id + '.js');
            card.script.initial_effect(card, duel, aux);
            console.log('Loaded script for', card.id, card.name);
        } catch (script_error) {
            if (script_error.code !== 'MODULE_NOT_FOUND') {
                var errorText = script_error.stack.split(sourceDir).join('')
                console.log(card.id, card.name, script_error);
                duel.duelistChat('Engine', '<pre class="errortext">' + errorText + '</pre>');
            } else {
                console.log('Script not found', card.id, card.name);
            }

            card.script = {
                initial_effect: function() {}
            };
            card.runEffects = function() {};
            card.canattack = true;
        }
        setupCard(card);
    });
}

/**
 * Initiate the duel
 * @param {Object} duel   Engine instance (ygojs-core.js)
 * @param {Object} params Object with a bunch of info to use as start up info.
 * @return {undefined}
 */
function init(duel, firstPlayer, database) {

    var state = duel.getState();
    duel.database = database;
    duel.maxHandSize = 5;
    loadCardScripts(duel, database);
    console.log('setting up turns');
    if (firstPlayer) {
        duel.setTurnPlayer();
    }
    duel.drawCard(0, 5, state.names[0], function() {
        duel.drawCard(1, 5, state.names[1], function() {
            setupTurn(duel);
        });
    });
}
module.exports = {
    init: init
};