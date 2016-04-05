/*jslint node: true*/
'use strict';
// read
//http://forum.duelingnetwork.com/index.php?/topic/23820-error-with-elo-rating-system/?p=357313
var elo = require('elo-rank')(15);



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


function newUser(username) {
    return {
        _id: username,
        experience: 0,
        elo: 1200,
        wins: 0,
        loses: 0
    }
}

function calcElo(playerA, playerB) {

    //Gets expected score for first parameter 
    var expectedScoreA = elo.getExpected(playerA, playerB);
    var expectedScoreB = elo.getExpected(playerB, playerA);

    //update score, 1 if won 0 if lost 
    playerA = elo.updateRating(expectedScoreA, 1, playerA);
    playerB = elo.updateRating(expectedScoreB, 0, playerB);
    return [playerA, playerB];
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