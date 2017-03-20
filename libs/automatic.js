/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';


// review the following https://github.com/Fluorohydride/ygopro-core/blob/master/processor.cpp

var DRAW_PHASE = 0,
    STANDBY_PHASE = 1;

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
    }), callback);
}


function askYesNo(duel, player, id, callback) {
    var question = {
        action: 'askYesNo',
        player: player,
        id: id
    };
    duel.question(question);
    duel.responseEngine.once(id, callback);
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
function doDrawPhase(duel, drawPhaseActionQueue) {

    var state = duel.state(),
        player = state.turnOfPlayer,
        turnCount = state.turnCount;

    processActionQueue(drawPhaseActionQueue, function () {
        if (turnCount && !state.skipDrawPhase) {
            duel.drawCard(player, 1, duel.playerName[player]);
        }
        duel.nextPhase(STANDBY_PHASE);
        processActionQueue.push({
            command: doStandbyPhase,
            params: [duel, standbyPhaseActionQueue]
        });
    });


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
        drawPhaseActionQueue = [];

    // load all cards


    // Set the starting Life Points
    processActionQueue.push({
        command: setLP,
        params: [params.lifePoints]
    });

    // Set the starting Player
    processActionQueue.push({
        command: duel.setTurnPlayer,
        params: [params.firstPlayer]
    });

    // Assume the starting mode is Draw

    processActionQueue.push({
        command: doDrawPhase,
        params: [duel, drawPhaseActionQueue]
    });
}
module.exports = {
    init: init
};