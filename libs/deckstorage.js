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


var Primus = require('primus'),

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
    var regex = new RegExp(username, 'i');
    deckStorage.find({
        '_id': regex
    }, function (err, docs) {
        if (docs.length === 0) {
            deckStorage.insert({
                '_id': username
            });
        }
    });
}

function reply(username, replaymessage) {

}

function onDB(data) {
    switch (data.action) {
    case 'save':
        deckStorage.update({
            username: data.username
        }, data, {
            upsert: true
        }, function () {

        });
        break;
    case 'load':
        var regex = new RegExp(data.username, 'i');
        deckStorage.find({
            username: regex
        }, function (error, docs) {
            reply(data.username, docs);
        });
        break;
    }
}

function onConnectGamelist() {
    client.write({
        action: 'internalServerLogin',
        password: process.env.OPERPASS,
        gamelist: false,
        registry: false
    });
}

function onCloseGamelist() {

}
setTimeout(function () {
    client = new Socket('ws://127.0.0.1:24555'); //Connect the God to the tree;

    client.on('data', onDB);
    client.on('open', onConnectGamelist);
    client.on('close', onCloseGamelist);

}, 5000);

require('fs').watch(__filename, process.exit);