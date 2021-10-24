function Navi(initialStates) {
    const states = Object.assign({}, initialStates),
        events = {},
        subscriptions = {};


    function listen(action, behavior) {

        if (events[action]) {
            return;
        }
        states[action] = {};
        events[action] = behavior;
        console.log('registering:', action);
    }

    function hey(event) {

        if (!events[event.action] && !subscriptions[event.action]) {
            console.log(new Error(`Action ${event.action}} is not registered`));
        }

        if (events[event.action]) {
            events[event.action](event, states[event.action]);
        }

        if (subscriptions[event.action]) {
            subscriptions[event.action].forEach((behavior) => {
                behavior(event);
            });
        }
    }

    function watchOut(action, behavior) {
        if (!subscriptions[action]) {
            subscriptions[action] = [];
        }


        subscriptions[action].push(behavior);
        console.log('Watching:', action);
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

