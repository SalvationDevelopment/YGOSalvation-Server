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
        const key = {
            RETURN: 13,
            DOWN: 40
        };

        switch (event.which) {
            case key.DOWN:
                event.target.value = this.sent;
                break;
            case key.RETURN:
                if (!event.target.value) {
                    return;
                }
                const message = sanitize(event.target.value);
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

    constructor(store) {
        super();
        this.sent = [];
        this.state = {
            chat: []
        };
        this.store = store;
    }
}