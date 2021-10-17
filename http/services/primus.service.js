function Connection() {

    let primus,
        session;


    function setSession(newSession) {
        session = newSession;
    }

    function connect(onData) {
        console.log(process);
        const primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
        primus = Primus.connect(primusprotocol + process.env.WEBSOCKET);
        primus.on('open', () => {
            console.log('Connected to YGOSalvation Server');
        });
        primus.on('close', () => {
            console.log('Disconnected from YGOSalvation Server');
        });

        primus.on('data', onData);

        setInterval(function () {
            if (!session) {
                return;
            }
            primus.write({
                action: 'sessionUpdate',
                session: session
            });
        }, 10000);
    }

    function write(...args) {
        primus.write(...args);
    }

    return {
        write,
        connect,
        setSession
    };

}

export const {
    write,
    connect
} = new Connection({});