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


    onKeyPress(event) {
        switch (event.which) {
            case 40:
                break;
            case 13:
                const message = sanitize(event.target.value);
                this.store.dispatch({ action: 'CHAT_ENTRY', message });
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
            onKeyPress: this.onKeyPress.bind(this)
        })];
    }

    add(message) {
        this.state.chat = this.state.chat.concat([sanitize(message)]);
    }

    constructor(store) {
        super();
        this.state = {
            chat: []
        };
        this.store = store;
    }
}