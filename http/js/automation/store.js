/*global React */
class Store {
    constructor(initialStates) {
        this.states = Object.assign({}, initialStates);
        this.reducers = {};
    }

    register(action, behavior) {

        this.states[action] = {};
        this.reducers[action] = behavior;
    }

    dispatch(event) {
        console.log(event);
        if (!this.states[event.action] || !this.reducers[event.action]) {
            return;
        }

        Object.assign(this.states[event.action], (this.reducers[event.action](event, this.states[event.action])));
    }
}
