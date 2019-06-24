
const manualControlEngine = require('./engine_manual.js'),
    operation = require('./operation.js');

function GameBoard(viewer) {
    return manualControlEngine(viewer);
}

function Action(type, parameters) {
    return Object.assign({ type }, parameters);
}

function Announcement(action) {
    return {
        p0: action,
        p1: action,
        sepectators: action
    };
}

function processor(field, actions) {
    const action = actions.pop() || new Action('PROCESSOR_END_DUEL', {});
    switch (action.type) {
        case 'PROCESSOR_START':
            field.started = true;
            operation.start(field, actions);
            break;
        case 'PROCESSOR_TURN':
            operation.process_turn(field, actions);
            break;
        case 'PROCESS_ANNOUNCE':
            field.callback(new Announcement(action));
            break;
        case 'PROCESS_WAIT':
            field.callback(new Announcement(action));
            break;
        default:
            break;
    }
    if (actions.length) {
        process.nextTick(process, field, actions);
    }
}

function GameTicker(configuration, viewer = console.log) {
    const actions = [],
        field = new GameBoard(viewer),
        startAction = new Action('PROCESSOR_START', configuration);

    return function tick(response) {
        const message = (field.started) ? new Action('PROCESSOR_RESPONSE', response) :
            startAction;


        actions.push(message);
        processor(field, actions);
    };

}

module.exports = GameTicker;