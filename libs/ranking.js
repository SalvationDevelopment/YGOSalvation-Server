/*jslint node: true*/
'use strict';


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
    rankingDB = new Datastore({
        filename: '../databases/ranking.nedb',
        autoload: true
    });

function verifyUser(username) {
    rankingDB.find({
        '_id': username
    }, function (err, docs) {
        if (docs.length === 0) {
            rankingDB.insert({
                '_id': username
            });
        }
    });
}

function onDB(data) {

    if (!data.deck) {
        return;
    }
    if (!data.room) {
        return;
    }
    console.log('processing', data.command);
    switch (data.command) {
    case 'new':
        rankingDB.find({
            _id: data.user
        }, function (err, docs) {

            if (docs) {
                client.write({
                    action: 'rankreply',
                    clientEvent: 'rank',
                    command: 'new',
                    message: 'user already exist',
                    room: data.room
                });
            } else {

            }
        });
        break;
    case 'save':


        break;
    case 'delete':
        console.log('Deleting:', data.deck);
        rankingDB.remove({
            _id: data.user
        }, {}, function (err, numRemoved) {
            client.write({
                action: 'rankreply',
                clientEvent: 'rank',
                command: 'delete',
                room: data.room
            });
        });
        break;

    case 'get':
        rankingDB.find({
            _id: data.user
        }, function (err, docs) {
            client.write({
                action: 'rankreply',
                clientEvent: 'rank',
                command: 'get',
                decklist: docs,
                room: data
            });
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