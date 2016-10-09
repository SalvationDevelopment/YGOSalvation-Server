/*jslint browser:true*/

var manualServer;

function serverconnect() {
    window.manualServer = new WebSocket("ws://" + location.hostname + ":8080", "duel");
}

manualHost() {
    manualServer.send({
        action: 'host'
    });
}
manualJoin(game) {
    manualServer.send({
        action: 'join',
        game: game
    });
}
manualLeave(game) {
    manualServer.send({
        action: 'leave',
        game: game
    }));
}

manualLock(deck) {
    manualServer.send({
        action: 'lock',
        deck: deck
    });
}

manualStart() {
    manualServer.send({
        action: 'start'
    });
}
manualChat(message) {
    manualServer.send();
}

manualNextPhase() {
    manualServer.send();
}
manualNextTurn() {
    manualServer.send();
}
manualChangeLifepoints() {
    manualServer.send();
}
serverconnect();