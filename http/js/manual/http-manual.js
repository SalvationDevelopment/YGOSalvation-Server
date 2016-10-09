/*jslint browser:true*/

var manualServer;

function serverconnect() {
    window.manualServer = new WebSocket("ws://" + location.hostname + ":8080", "duel");
}

manualHost() {
    manualServer.write();
}
manualJoin() {
    manualServer.write();
}
manualLeave() {
    manualServer.write();
}

manualLock() {
    manualServer.write();
}

manualStart() {
    manualServer.write();
}
manualChat() {
    manualServer.write();
}

manualNextPhase() {
    manualServer.write();
}
manualNextTurn() {
    manualServer.write();
}
manualChangeLifepoints() {
    manualServer.write();
}
serverconnect();