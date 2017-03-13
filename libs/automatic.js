/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';


// review the following https://github.com/Fluorohydride/ygopro-core/blob/master/processor.cpp


/**
 * Process a queue of actions.
 * @param {Array} actionQueue Array of action objects. Each contains a command and parameters.
 */
function processActionQueue(actionQueue) {
    var currentAction;
    while (actionQueue.length !== 0) {
        currentAction = actionQueue.shift();
        currentAction.command.apply(currentAction.parameters);
    }
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

    processActionQueue(drawPhaseActionQueue);

    if (turnCount && !state.skipDrawPhase) {
        duel.drawCard(player, 1, duel.playerName[player]);
    }
    return;
}

function doEndPhase(processActionQueue) {
    processActionQueue.push({
        command: doDrawPhase,
        params: [duel, drawPhaseActionQueue]
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