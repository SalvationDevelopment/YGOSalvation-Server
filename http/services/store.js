function Navi(initialStates) {
    const states = Object.assign({}, initialStates),
        events = {};


    function listen(action, behavior) {

        if (events[action]) {
            return;
        }
        states[action] = {};
        events[action] = behavior;
        console.log('registering:', action);
    }

    function hey(event) {
        //console.log(event);
        if (!events[event.action]) {
            throw new Error(`Action ${action}} is not registered`);
        }

        // for debugging
        Object.assign(states[event.action], (events[event.action](event, states[event.action])));
    }

    function watchOut(action) {
        delete states[action];
        delete events[action];
    }

    return {
        listen,
        hey,
        watchOut
    };
}

export const {
    listen,
    hey,
    watchOut
} = new Navi({});

