/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';


// review the following https://github.com/Fluorohydride/ygopro-core/blob/master/processor.cpp

var DRAW_PHASE = 0,
    STANDBY_PHASE = 1,
    MAIN_PHASE_1;

var waterfall = require('async-waterfall');
/*
    Action Object
    {
        command  : {Function},
        callback : {Function},
        params   : {Array}
    }
    Can be understood as:
    `command(...params, callback);`
    
    When sending a question to the user, make sure to set a duel.responseEngine.once listener with a
    unique id to catch the response. Do not use `.on`.
*/

/**
 * Process a queue of actions (as defined by above Action Object).
 * @param {Array} actionQueue Array of action objects. Each contains a command and parameters.
 */
function processActionQueue(actionQueue, callback) {
    waterfall(actionQueue.map(function (action) {
        return function (lastActionResult, nextCallback) {
            var params = action.parameters || [],
                actionCallback = function (error, result) {
                    if (error) {
                        nextCallback(error);
                    } else {
                        if (typeof action.callback === 'function') {
                            action.callback(error, result);
                        }
                        nextCallback(null, true);
                    }
                };
            params.push(actionCallback);
            action.command.apply(params);
        };
    }), function () {
        if (typeof callback === 'function') {
            callback();
        }
    });
}


function askYesNo(duel, player, id, callback) {
    var question = {
        action: 'askYesNo',
        player: player,
        id: id
    };
    duel.question(question, callback);
}

/**
 * Set the starting Lifepoints of a duel.
 * @param {object} duel Engine instance.
 * @param {number} lp   Number of Lifepoints to start with.
 */
function setLP(duel, lp) {
    duel.lp.forEach(function (currentLP, index) {
        duel.lp[index] = lp;
    });
}


/**
 * Do the automatic processsing of the draw phase. Start by emptying the queue then doing base logic.
 * @param {object}   duel              Engine instance.
 * @param {Array} drawPhaseActionQueue The queue for the draw phase.
 */
function doDrawPhase(duel, drawPhaseActionQueue, callback) {

    var state = duel.state(),
        player = state.turnOfPlayer,
        turnCount = state.turnCount;

    duel.nextPhase(DRAW_PHASE);
    processActionQueue(drawPhaseActionQueue, function () {
        if (turnCount && !state.skipDrawPhase) {

            /* duel engine moves the card, then triggers its effects
               when its done it moves on. That is why the callback is passed. */

            duel.drawCard(player, 1, duel.playerName[player], function () {

                /* drawing a card may have added an action to the phase stack so do it again */
                processActionQueue(drawPhaseActionQueue, callback);
            });
        }
    });
    return;
}


function doStandbyPhase(duel, standbyPhaseActionQueue, callback) {
    duel.nextPhase(DRAW_PHASE);
    processActionQueue(standbyPhaseActionQueue, function () {
        callback();
    });
    return;
}

function doMainPhase1(duel, mainPhase1ActionQueue, callback) {

    var state = duel.state(),
        player = state.turnOfPlayer,
        turnCount = state.turnCount;

    duel.nextPhase(MAIN_PHASE_1);

    function askUserNextAction() {
        processActionQueue(mainPhase1ActionQueue, function () {
            var normalsummonable = duel.query.getGroup({
                    normalSummonable: true
                }),
                specialsummonable = duel.query.getGroup({
                    specialsummonable: true
                }),
                canchangetodefense = duel.query.getGroup({
                    canchangetodefense: true
                }),
                canactivatespelltrap = duel.query.getGroup({
                    canactivate: true
                }),
                cansetmonster = duel.query.getGroup({
                    cansetmonster: true
                }),
                cantributesummon = duel.query.getGroup({
                    canTributeSummon: true
                }),
                cansetspelltrap = duel.query.getGroup({
                    cansetspelltrap: true
                }),
                canactivategrave = duel.query.getGroup({
                    canactivategrave: true
                }),
                canactivatebanished = duel.query.getGroup({
                    canactivatebanished: true
                });


            duel.question({
                questionType: 'mainphase',
                battlephase: state.battlephaseAvaliable,
                endphase: state.endPhaseAvaliable,
                normalSummon: normalsummonable,
                specialSummon: specialsummonable,
                toDefense: canchangetodefense,
                setMonster: cansetmonster,
                activateSpellTrap: canactivatespelltrap,
                setSpellTrap: cansetspelltrap,
                pendulumSummon: state.pendulumnSummonAvaliable

            }, function (error, answer) {
                switch (answer.action) {
                case 'battlephase':
                    break;
                case 'endphase':
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

function doEndPhase(duel, endPhaseActionQueue) {
    processActionQueue.push({
        command: doDrawPhase,
        params: [duel, endPhaseActionQueue]
    });
}

/**
 * Initiate the duel
 * @param {object} duel   Engine instance (ygojs-core.js)
 * @param {object} params Object with a bunch of info to use as start up info.
 */
function init(duel, params) {
    var actionQueue = [],
        drawPhaseActionQueue = [],
        standbyPhaseActionQueue = [],
        mainPhase1ActionQueue = [],
        battlePhaseActionQueue = [],
        mainPhase2ActionQueue = [],
        endPhaseActionQueue = [];

    // load all cards


    // Set the starting Life Points
    actionQueue.push({
        command: setLP,
        params: [params.lifePoints]
    });

    // Set the starting Player
    actionQueue.push({
        command: duel.setTurnPlayer,
        params: [params.firstPlayer]
    });

    // Assume the starting mode is Draw

    function setupTurn() {
        actionQueue.push({
            command: doDrawPhase,
            params: [duel, drawPhaseActionQueue]
        });
        actionQueue.push({
            command: doStandbyPhase,
            params: [duel, standbyPhaseActionQueue]
        });
        actionQueue.push({
            command: doMainPhase1,
            params: [duel, mainPhase1ActionQueue]
        });
    }
}
module.exports = {
    init: init
};