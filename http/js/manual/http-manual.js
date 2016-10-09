/*jslint browser:true*/
/*global WebSocket, $, parseYDK*/

var manualServer;

function getActive(user) {
    'use strict';
    var selection,
        processedDeck

    selection = $('.currentdeck option:selected').attr('data-file');
    processedDeck = parseYDK(selection);
    return processedDeck;
}

function serverconnect() {
    window.manualServer = new WebSocket("ws://" + location.hostname + ":8080", "duel");
}

function manualHost() {
    manualServer.send({
        action: 'host'
    });
}

function manualJoin(game) {
    manualServer.send({
        action: 'join',
        game: game
    });
}

function manualLeave(game) {
    manualServer.send({
        action: 'leave',
        game: game
    });
}

function manualLock(deck) {
    manualServer.send({
        action: 'lock',
        deck: deck
    });
}

function manualStart() {
    manualServer.send({
        action: 'start'
    });
}

function manualChat(message) {
    manualServer.send();
}

function manualNextPhase() {
    manualServer.send({
        action: 'nextPhase'
    });
}

function manualNextTurn() {
    manualServer.send({
        action: 'nextTurn'
    });
}

function manualChangeLifepoints(amount) {
    manualServer.send({
        action: 'changeLifepoints',
        amount: amount
    });
}

function manualMoveCard(movement) {
    Object.assign(movement, {
        action: 'moveCard'
    });
    manualServer.send(movement);
}
serverconnect();