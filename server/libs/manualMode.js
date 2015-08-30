// manualMode.js
 
 process.on('uncaughtException', function (error) {
    console.log('Error not caught: ', error);
});
 
var wss_config = {
        host: 'ygopro.us',
        port: 55542,
        verifyClient: function (info) {
            return (info.origin.indexOf(ACCEPT_ORIGIN) > -1 && info.req.headers.host.indexOf(ACCEPT_ORIGIN) > -1);
        }
    },
    activeDuels = {},
    registry = {},
    ws = require("ws"),
    WebSocketServer = new ws.Server(wss_config);
    
// Define Constants

var ACCEPT_ORIGIN = "ygopro.us",
    ROLE_SPECTATOR = 0,
    ROLE_HOST = 1,
    ROLE_PLAYER_TWO = 2,
    ROLE_PLAYER_THREE = 3,
    ROLE_PLAYER_FOUR = 4,
    QUERY_GET_OPTIONS = "getOptions",
    QUERY_GET_STATE = "getState",
    QUERY_START_DUEL = "startDuel";
    
WebSocketServer.on('connection', function (WebSocket) {
    WebSocket.on('message', function (message) {
        WebSocket.send(generateServerResponse(message, WebSocket));
    });
});

WebSocketServer.on('error', function (error) {
    console.log('Server encountered an error: ', error);
});

function generateServerResponse(message, WebSocket) {
    /**
     *
     * Message Structure is as follows:
     *
     * uniqueID,messageType,duelID|userName[,duelOptions|query|command]
     *
     * Possible messageTypes:
     *
     * - registerUID
     * - hostDuel
     * - joinDuel
     * - spectateDuel
     * - duelQuery
     * - duelCommand
     *
     **/
    var splitMessage = message.split(','),
        uniqueID = splitMessage[0],
        messageType = splitMessage[1],
        identifier = splitMessage[2],
        params = splitMessage[3],
        response = "serverResponse,";
    if (!uniqueID || !messageType || !identifier) {
        WebSocket.close();
    }
    switch (messageType) {
        case "registerUID": {
            if (registry.hasOwnProperty(uniqueID)) {
                WebSocket.close();
                break;
            }
            registry[uniqueID] = identifier;
            return response + 'registeredUID';
        }
        case "hostDuel": {
            activeDuels[identifier] = {
                options: params
            };
            activeDuels[identifier][uniqueID] = {
                ROLE: ROLE_HOST
            };
            return response + ',hostedDuel,' + identifier;
        }
        case "joinDuel": {
            if (activeDuels.hasOwnProperty(identifier)) {
                switch (Object.keys(activeDuels[identifier]).length) {
                    case 2: {
                        activeDuels[identifier][uniqueID] = {
                            ROLE: ROLE_PLAYER_TWO
                        };
                        break;
                    }
                    case 3: {
                        activeDuels[identifier][uniqueID] = {
                            ROLE: ROLE_PLAYER_THREE
                        };
                        break;
                    }
                    case 4: {
                        activeDuels[identifier][uniqueID] = {
                            ROLE: ROLE_PLAYER_FOUR
                        };
                        break;
                    }
                    default: {
                        break;
                    }
                }
                return response + "joinedDuel," + identifier;
            } else {
                return response + "invalidDuelID," + identifier;
            }
        }
        case "spectateDuel": {
            if (activeDuels.hasOwnProperty(identifier)) {
                activeDuels[identifier][uniqueID] = {
                    ROLE: ROLE_SPECTATOR
                };
                return response + 'spectatingDuel,' + identifier;
            } else {
                return response + "invalidSpectatorDuelID," + identifier;
            }
        }
        case "duelQuery": {
            // possible queries: "kick:userName", "getState", "getOptions", "startDuel"
            if (activeDuels.hasOwnProperty(identifier)) {
                if (params.indexOf("kick:") === 0) {
                    params = params.substr(5);
                    if (activeDuels[identifier].hasOwnProperty(params)) {
                        delete activeDuels[identifier][params];
                        return response + 'kickedUser,' + params;
                    }
                }
                if (params === QUERY_GET_STATE) {
                    return response + ((activeDuels[identifier].state && JSON.stringify(activeDuels[identifier].state)) || "emptyState");
                }
                if (params === QUERY_GET_OPTIONS) {
                    return response + JSON.stringify(activeDuels[identifier].options);
                }
                if (params === QUERY_START_DUEL && activeDuels[identifier][uniqueID].ROLE === ROLE_HOST) {
                    activeDuels[identifier].state = {}; // replace with: new GameState();
                    return response + "startedDuel" + identifier;
                }
            } else {
                return response + "invalidDuelQueryID," + identifier;
            }
        }
        case "duelCommand": {
            if (activeDuels.hasOwnProperty(identifier) && activeDuels[identifier].state && activeDuels[identifier][uniqueID].ROLE > ROLE_SPECTATOR) {
                // TODO: evaluate the command and change state
                return response + "commandEvaluated," + identifier + "," + JSON.stringify(activeDuels[identifier].state);
            } else {
                WebSocket.close();
                return;
            }
        }
        default: {
            WebSocket.close();
            return;
        }
    }
}