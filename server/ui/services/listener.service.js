/**
 * Executes the feed helper used by the listener.service module.
 * @param {Object} initialStates The initialStates value provides an input used by the listener.service module.
 * @returns {Object} Returns the value produced by the listener.service module.
 */
function Feed(initialStates) {
    const states = Object.assign({}, initialStates),
        events = {},
        subscriptions = {},
        replayableActions = new Set([
            'LOAD_RANKING',
            'LOAD_DATABASE',
            'LOAD_RELEASES',
            'BANLIST',
            'GAME_LIST',
            'LOAD_DECKS',
            'LOAD_SETCODES',
            'SYSTEM_LOADED',
            'SET_LIFEPOINT_WAITING',
            'IRC_STATE',
            'IRC_HISTORY',
            'IRC_MESSAGE',
            'IRC_ERROR',
            'IRC_RESET'
        ]);

    function ensureState(action) {
        if (!states[action]) {
            states[action] = {};
        }
        return states[action];
    }

    function ensureCollection(collection, action) {
        if (!collection[action]) {
            collection[action] = [];
        }
        return collection[action];
    }

    function removeBehavior(collection, action, behavior) {
        const bucket = collection[action];
        if (!bucket || !bucket.length) {
            return;
        }

        const index = bucket.indexOf(behavior);
        if (index < 0) {
            return;
        }

        bucket.splice(index, 1);
        if (!bucket.length) {
            delete collection[action];
        }
    }

    function replayIfAvailable(action, behavior, includeState) {
        const state = ensureState(action);
        if (!replayableActions.has(action) || !state.lastEvent) {
            return;
        }

        if (includeState) {
            behavior(state.lastEvent, state);
            return;
        }

        behavior(state.lastEvent);
    }

    /**
     * Executes the on helper used by the listener.service module.
     * @param {string} action The action value provides an input used by the listener.service module.
     * @param {Function} behavior The behavior value provides an input used by the listener.service module.
     * @returns {Function} Returns the unsubscribe function produced by the listener.service module.
     */
    function on(action, behavior) {
        if (typeof action !== 'string' || typeof behavior !== 'function') {
            return () => {};
        }

        ensureState(action);
        ensureCollection(events, action).push(behavior);
        console.log('registering:', action);

        replayIfAvailable(action, behavior, true);

        return function unsubscribe() {
            removeBehavior(events, action, behavior);
        };
    }

    /**
     * Executes the emit helper used by the listener.service module.
     * @param {Object} event The event event object provides the browser event data used by the listener.service module, including the `action` property.
     * @param {string} event.action The `action` property supplies structured input used by the listener.service module.
     * @returns {void} Does not return a value.
     */
    function emit(event) {
        if (!event || !event.action) {
            return;
        }

        const state = ensureState(event.action);

        if (replayableActions.has(event.action)) {
            state.lastEvent = event;
        }

        if (
            !replayableActions.has(event.action) &&
            !(events[event.action] && events[event.action].length) &&
            !(subscriptions[event.action] && subscriptions[event.action].length)
        ) {
            console.log(new Error(`Action ${event.action} is not registered`));
        }

        if (events[event.action] && events[event.action].length) {
            [...events[event.action]].forEach((behavior) => {
                behavior(event, state);
            });
        }

        if (subscriptions[event.action] && subscriptions[event.action].length) {
            [...subscriptions[event.action]].forEach((behavior) => {
                behavior(event);
            });
        }
    }

    /**
     * Subscribes used by the listener.service module.
     * @param {string} action The action value provides an input used by the listener.service module.
     * @param {Function} behavior The behavior value provides an input used by the listener.service module.
     * @returns {Function} Returns the unsubscribe function produced by the listener.service module.
     */
    function subscribe(action, behavior) {
        if (typeof action !== 'string' || typeof behavior !== 'function') {
            return () => {};
        }

        ensureCollection(subscriptions, action).push(behavior);
        console.log('Subscribing:', action);

        replayIfAvailable(action, behavior, false);

        return function unsubscribe() {
            removeBehavior(subscriptions, action, behavior);
        };
    }

    return {
        on,
        emit,
        subscribe
    };
}

export const {
    on,
    emit,
    subscribe
} = new Feed({});

export {
    on as listen,
    emit as hey,
    subscribe as watch,
    subscribe as watchOut
};
