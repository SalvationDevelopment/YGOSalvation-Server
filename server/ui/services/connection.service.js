/**
 * Executes the connection helper used by the connection.service module.
 * @returns {Object} Returns the value produced by the connection.service module.
 */
function Connection() {
    let socket,
        session,
        heartbeatTimer,
        connectInFlight = null,
        pendingMessages = [];

            /**
     * Sets session used by the connection.service module.
     * @param {string} newSession The newSession value provides an input used by the connection.service module.
     * @returns {void} Does not return a value.
     */
    function setSession(newSession) {
        session = newSession;
    }

            /**
     * Resolves web socket url used by the connection.service module.
     * @returns {Promise<string>} Resolves with the value produced by the connection.service module.
     */
    async function resolveWebSocketUrl() {
        const response = await fetch('/api/websocket-port', {
            method: 'GET',
            cache: 'no-store',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Unable to fetch websocket port (${response.status})`);
        }

        const payload = await response.json(),
            port = Number(payload?.port);

        if (!Number.isFinite(port) || port <= 0) {
            throw new Error('Invalid websocket port payload');
        }

        const protocol = (window.location.protocol === 'https:') ? 'wss://' : 'ws://';
        return `${protocol}${window.location.hostname}:${port}`;
    }

            /**
     * Clears heartbeat used by the connection.service module.
     * @returns {void} Does not return a value.
     */
    function clearHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    }

            /**
     * Executes the flush pending messages helper used by the connection.service module.
     * @returns {void} Does not return a value.
     */
    function flushPendingMessages() {
        if (!socket || socket.readyState !== WebSocket.OPEN || !pendingMessages.length) {
            return;
        }

        pendingMessages.forEach((message) => {
            socket.send(JSON.stringify(message));
        });
        pendingMessages = [];
    }

            /**
     * Executes the connect helper used by the connection.service module.
     * @param {Function} onData The onData value provides an input used by the connection.service module.
     * @returns {void} Does not return a value.
     */
    function connect(onData) {
        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (connectInFlight) {
            return;
        }

        connectInFlight = resolveWebSocketUrl().then((url) => {
            socket = new WebSocket(url);
            socket.addEventListener('open', () => {
                console.log('Connected to YGOSalvation Server');
                flushPendingMessages();
            });
            socket.addEventListener('close', () => {
                console.log('Disconnected from YGOSalvation Server');
                clearHeartbeat();
                socket = null;
            });
            socket.addEventListener('message', (event) => {
                let parsed;
                try {
                    parsed = JSON.parse(event.data);
                } catch (_error) {
                    return;
                }
                onData(parsed);
            });

            heartbeatTimer = setInterval(function () {
                if (!session || !socket || socket.readyState !== WebSocket.OPEN) {
                    return;
                }
                socket.send(JSON.stringify({
                    action: 'sessionUpdate',
                    session: session
                }));
            }, 10000);
        }).catch((error) => {
            console.error(error);
            clearHeartbeat();
            socket = null;
        }).finally(() => {
            connectInFlight = null;
        });
    }

            /**
     * Executes the write helper used by the connection.service module.
     * @param {Object} message The message value provides an input used by the connection.service module.
     * @returns {void} Does not return a value.
     */
    function write(message) {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            pendingMessages.push(message);
            return;
        }
        socket.send(JSON.stringify(message));
    }

    return {
        write,
        connect,
        setSession
    };
}

export const {
    write,
    connect,
    setSession
} = new Connection({});
