/*jslint node: true*/
'use strict';

var deck = {
    owner: '',
    name: '',
    main: [],
    side: [],
    extra: [],
    description: []
};


var
    Primus = require('primus'),

    Socket = require('primus').createSocket({
        iknowclusterwillbreakconnections: true
    }),
    client = {
        write: function () {
            console.log('system not ready yet');
        }
    },
    Datastore = require('nedb'),
    deckStorage = new Datastore({
        filename: '../databases/deckStorage.nedb',
        autoload: true
    });

function verifyUser(username) {
    deckStorage.find({
        '_id': username
    }, function (err, docs) {
        if (docs.length === 0) {
            deckStorage.insert({
                '_id': username
            });
        }
    });
}

function onDB(data) {
    switch (data.command) {
    case 'new':
        deckStorage.insert(data.deck);
        break;
    case 'save':
        deckStorage.update({
            username: data.deck.username,
            name: data.deck.name
        }, data.deck, function (err, numReplaced) {});
        break;
    case 'delete':
        deckStorage.remove({
            username: data.deck.username,
            name: data.deck.name
        }, {}, function (err, numRemoved) {});
        break;
    case 'update':
        deckStorage.update({
            username: data.deck.username,
            name: data.deck.name
        }, data.deck, function (err, numReplaced) {});
        break;
    case 'list':
        deckStorage.find({
            username: data.deck.username
        }, function (err, docs) {
            //docs is a list of decks
        });
        break;

    }
}

function onConnectGamelist() {

}

function onCloseGamelist() {

}
setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Connect the God to the tree;

    client.on('data', onDB);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);

}, 5000);