import React, { useEffect, useState } from 'react';
import AppImage from '../common/app-image';
import styles from './sidechat.component.module.scss';

function sanitize(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function resolveSideChatStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

function createEmptySideChatState(state = {}) {
    return {
        chat: [],
        ...state
    };
}

export function appendSideChatMessage(target, message) {
    const controller = target?.state ? target : undefined,
        resolvedStore = resolveSideChatStore(target);

    if (!controller || !message) {
        return;
    }

    const nextMessage = {
        ...message,
        avatar: ''
    };
    if (app.lobby.state.player.length) {
        const player = app.lobby.state.player.find((player) => message.username === player.username);
        if (player) {
            nextMessage.avatar = player.avatar;
        }
    }
    nextMessage.message = sanitize(nextMessage.message);
    controller.state.chat = controller.state.chat.concat([nextMessage]);

    resolvedStore?.emit?.({
        action: 'UPDATE_SIDECHAT',
        state: {
            chat: controller.state.chat
        }
    });
}

export function handleSideChatKeyDown(controller, event) {
    const message = sanitize(event.target.value),
        parts = message.split(' '),
        key = {
            RETURN: 13,
            DOWN: 40
        };

    let amount;

    switch (event.which) {
        case key.DOWN:
            event.target.value = controller.sent;
            break;
        case key.RETURN:
            if (!event.target.value) {
                return;
            }
            if (parts[0] === '/surrender') {
                event.target.value = '';
                app.surrender();
                return;
            }
            if (app.manual) {
                if (parts[0] === '/roll') {
                    event.target.value = '';
                    controller.manualControls.manualRoll();
                    return;
                }
                if (parts[0] === '/flip') {
                    event.target.value = '';
                    controller.manualControls.manualFlip();
                    return;
                }
                if (parts[0] === '/token') {
                    event.target.value = '';
                    controller.manualControls.manualToken();
                    return;
                }
                if (parts[0] === '/rps') {
                    event.target.value = '';
                    controller.manualControls.manualRPS();
                    return;
                }

                if (parts.length === 2) {
                    if (parts[0] === '/sub') {
                        amount = (-1) * parseInt(parts[1], 10);
                        if (isNaN(amount)) {
                            return;
                        }
                        controller.manualControls.manualChangeLifepoints(amount);
                        event.target.value = '';
                        return;
                    }
                    if (parts[0] === '/add') {
                        amount = parseInt(parts[1], 10);
                        if (isNaN(amount)) {
                            return;
                        }
                        controller.manualControls.manualChangeLifepoints(amount);
                        event.target.value = '';
                        return;
                    }
                    if (parts[0] === '/draw') {
                        amount = parseInt(parts[1], 10);
                        if (isNaN(amount)) {
                            return;
                        }
                        for (let i = 0; i < amount; i += 1) {
                            controller.manualControls.manualDraw();
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
                            controller.manualControls.manualExcavateTop();
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
                            controller.manualControls.manualMill();
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
                            controller.manualControls.manualMillRemovedCard();
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
                            controller.manualControls.manualMillRemovedCardFaceDown();
                        }
                        event.target.value = '';
                        return;
                    }
                }
            }
            controller.store.emit({ action: 'CHAT_ENTRY', message });
            controller.sent = message;
            event.target.value = '';
            break;
        default:
            return;
    }
}

function SideChatMessage({ message, index }) {
    return (
        <li key={`char-message-${index}`}>
            <AppImage className="avatar" src={message.avatar} alt={message.username ? `${message.username} avatar` : ''} fallbackSrc='data:image/gif;base64,R0lGODlhAQABAAAAACw=' width={48} height={48} style={{ width: '3vw', height: 'auto' }} />
            <div>
                <span className="sidechat-username">{message.username}</span>
                <span className="sidechat-date">{new Date(message.date).toLocaleTimeString()}</span>
                <span className="sidechat-message">{message.message}</span>
            </div>
        </li>
    );
}

function SideChatView({ chat, onKeyDown }) {
    return (
        <div className={styles.root}>
            <ul
                id="sidechattext"
                className="ingamechatbox"
            >
                {chat.map((message, index) => (
                    <SideChatMessage
                        key={`char-message-${index}`}
                        message={message}
                        index={index}
                    />
                ))}
            </ul>
            <input
                id="sidechatinput"
                onKeyDown={onKeyDown}
            />
        </div>
    );
}

export function MountedSideChat({ controller }) {
    const [state, setState] = useState(createEmptySideChatState(controller?.state));

    useEffect(() => {
        setState(createEmptySideChatState(controller?.state));
    }, [controller]);

    useEffect(() => {
        if (!controller?.store?.on) {
            return undefined;
        }

        return controller.store.on('UPDATE_SIDECHAT', (message) => {
            if (controller?.state) {
                controller.state.chat = message?.state?.chat || [];
            }
            setState(createEmptySideChatState(message?.state));
        });
    }, [controller]);

    if (!controller) {
        return null;
    }

    return (
        <SideChatView
            chat={state.chat}
            onKeyDown={(event) => handleSideChatKeyDown(controller, event)}
        />
    );
}

export function SideChat(store, manualControls) {
    return {
        sent: '',
        state: {
            chat: []
        },
        store,
        manualControls
    };
}

export default SideChat;
