/*global React, ReactDOM */

function sanitize(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

class SideChat extends React.Component {

    messageElement(message, i) {
        return React.createElement('li', { key: `char-message-${i}` }, sanitize(message));
    }

    manualCommand() {

    }

    onKeyDown(event) {
        const message = sanitize(event.target.value),
            parts = message.split(' '),
            key = {
                RETURN: 13,
                DOWN: 40
            };

        let amount;

        switch (event.which) {
            case key.DOWN:
                event.target.value = this.sent;
                break;
            case key.RETURN:
                if (!event.target.value) {
                    return;
                }
                if (app.manual) {
                    if (parts[0] === '/surrender') {
                        event.target.value = '';
                        this.manualControls.surrender();
                        return;
                    }
                    if (parts[0] === '/side') {
                        event.target.value = '';
                        this.manualControls.startSiding();
                        return;
                    }
                    if (parts[0] === '/roll') {
                        event.target.value = '';
                        this.manualControls.manualRoll();
                        return;
                    }
                    if (parts[0] === '/flip') {
                        event.target.value = '';
                        this.manualControls.manualFlip();
                        return;
                    }
                    if (parts[0] === '/token') {
                        event.target.value = '';
                        this.manualControls.manualToken();
                        return;
                    }
                    if (parts[0] === '/rps') {
                        event.target.value = '';
                        this.manualControls.manualRPS();
                        return;
                    }

                    if (parts.length === 2) {
                        if (parts[0] === '/sub') {
                            amount = (-1) * parseInt(parts[1], 10);
                            if (isNaN(amount)) {
                                return;
                            }
                            this.manualControls.manualChangeLifepoints(amount);
                            event.target.value = '';
                            return;
                        }
                        if (parts[0] === '/add') {
                            amount = parseInt(parts[1], 10);
                            if (isNaN(amount)) {
                                return;
                            }
                            this.manualControls.manualChangeLifepoints(amount);
                            event.target.value = '';
                            return;
                        }
                        if (parts[0] === '/draw') {
                            amount = parseInt(parts[1], 10);
                            if (isNaN(amount)) {
                                return;
                            }
                            for (let i = 0; i < amount; i += 1) {
                                this.manualControls.manualDraw();
                            }
                            event.target.value = '';
                            return;
                        }
                        if (parts[0] === '/excavate') {
                            amount = parseInt(parts[1], 10);
                            if (isNaN(amount)) {
                                return;
                            }
                            for (let i = 0; i < amount; i += 1) {
                                this.manualControls.manualExcavateTop();
                            }
                            event.target.value = '';
                            return;
                        }
                        if (parts[0] === '/mill') {
                            amount = parseInt(parts[1], 10);
                            if (isNaN(amount)) {
                                return;
                            }
                            for (let i = 0; i < amount; i += 1) {
                                this.manualControls.manualMill();
                            }
                            event.target.value = '';
                            return;
                        }
                        if (parts[0] === '/banish') {
                            amount = parseInt(parts[1], 10);
                            if (isNaN(amount)) {
                                return;
                            }
                            for (let i = 0; i < amount; i += 1) {
                                this.manualControls.manualMillRemovedCard();
                            }
                            event.target.value = '';
                            return;
                        }
                        if (parts[0] === '/banishfd') {
                            amount = parseInt(parts[1], 10);
                            if (isNaN(amount)) {
                                return;
                            }
                            for (let i = 0; i < amount; i += 1) {
                                this.manualControls.manualMillRemovedCardFaceDown();
                            }
                            event.target.value = '';
                            return;
                        }
                    }
                }
                this.store.dispatch({ action: 'CHAT_ENTRY', message });
                this.sent = message;
                event.target.value = '';
                break;
            default:
                return;
        }
    }

    render() {
        return [React.createElement('ul', {
            id: 'sidechattext',
            key: 'sidechattext',
            className: 'ingamechatbox'
        }, this.state.chat.map(this.messageElement)),
        React.createElement('input', {
            id: 'sidechatinput',
            key: 'sidechatinput',
            onKeyDown: this.onKeyDown.bind(this)
        })];
    }

    add(message) {
        this.state.chat = this.state.chat.concat([sanitize(message)]);
    }

    constructor(store, manualControls) {
        super();
        this.sent = [];
        this.state = {
            chat: []
        };
        this.store = store;
        this.manualControls = manualControls;
    }
}