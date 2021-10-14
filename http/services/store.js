class Navi {
    constructor(initialStates) {
        this.states = Object.assign({}, initialStates);
        this.events = {};
    }

    listen(action, behavior) {

        if (this.events[action]) {
            throw new Error(`Action ${action}} is already registered`);
        }
        this.states[action] = {};
        this.events[action] = behavior;
    }

    hey(event) {
        //console.log(event);
        if (!this.events[event.action]) {
            return;
        }

        // for debugging
        Object.assign(this.states[event.action], (this.events[event.action](event, this.states[event.action])));
    }

    watchOut(action) {
        delete this.states[action];
        delete this.events[action];
    }
}

export default new Navi();
