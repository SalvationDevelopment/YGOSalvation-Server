/*jslint node:true, plusplus:true, bitwise : true, nomen:true*/
'use strict';


function processActionQueue(actionQueue) {
    var currentAction;
    while (actionQueue.length !== 0) {
        currentAction = actionQueue.shift();
        currentAction.command.apply(currentAction.parameters);
    }
}

function setLP(duel, lp) {
    duel.lp.forEach(function (currentLP, index) {
        duel.lp[index] = lp;
    });
}

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

function setupNextTurn(processActionQueue) {
    processActionQueue.push({
        command: doDrawPhase,
        params: [duel, drawPhaseActionQueue]
    });
}

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
module.exports = {};