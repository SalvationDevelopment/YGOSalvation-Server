function Action(type, parameters = {}) {
    return Object.assign({ type }, parameters);
}

function start(field, actions) {
    const p1 = {
        main: Array(actions.player1decksize).fill(0),
        side: Array(0),
        extra: Array(actions.player1extrasize).fill(0)
    }, p2 = {
        main: Array(actions.player2decksize).fill(0),
        side: Array(0),
        extra: Array(actions.player2extrasize).fill(0)
    };

    field.startDuel(p1, p2, false, {
        startLP: actions.lifepoints1
    });
    actions.push(new Action('PROCESSOR_ADJUST'));
    actions.push(new Action('PROCESSOR_TURN'));
}

function process_turn(field, actions) {
    field.nextTurn();
    actions.push(new Action('PROCESSOR_PHASE'));
}

function resolve_chains(field, actions) { }

function adjust(field, actions) {
    //detect card location changes

    resolve_chains(field, actions);
}

function process_phase(field, actions) {
    const currentPhase = field.state.phase,
        player = field.state.turnOfPlayer;
    switch (currentPhase) {
        case 0: //draw
            field.drawCard(player, 1);
            actions.push(new Action('PROCESSOR_ADJUST', { phase: 0 }));
            actions.push(new Action('PROCESSOR_PHASE'));
            break;
        case 1: //standby
            actions.push(new Action('PROCESSOR_PHASE', { phase: 1 }));
            break;
        case 2: //main phase 1
            actions.push(new Action('PROCESSOR_IDLE', { phase: 2 }));
            break;
        case 3: //battle
            actions.push(new Action('PROCESSOR_PHASE'));
            break;
        case 4: //main phase 2
            actions.push(new Action('PROCESSOR_IDLE'), { phase: 4 });
            break;
        case 5: //end
            actions.push(new Action('PROCESSOR_TURN'));
            break;
        default:
            actions.push(new Action('PROCESSOR_PHASE'));
    }
}

module.exports = {
    process_phase,
    process_turn,
    start
};