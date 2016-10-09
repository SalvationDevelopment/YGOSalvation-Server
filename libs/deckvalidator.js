/*jslint node: true*/
'use strict';

var fs = require('fs'),
    ConfigParser = require('./configparser.js'),
    databases = {
        "0-en-OCGTCG": [],
        "1-Anime": [],
        "2-MonsterLeague": [],
        "3-Goats": [],
        "4-Newgioh": [],
        "Z-CWA": []
    };

function cdbUpdater() {
    Object.keys(databases).forEach(function (databaseName) {
        var database = databases[databaseName];
        fs.readFile('../http/manifest/database_' + database + '.json', {
            encoding: "UTF-8"
        }, function (error, data) {
            if (error) {
                console.log(error);
                return;
            }
            if (JSON.stringify(databases[database]) !== JSON.stringify(data)) {
                databases[database] = JSON.parse(data);
            }
        });
    });
}

function banListUpdater() {

    var data = fs.readFileSync('../http/ygopro/lflist.conf');

    return ConfigParser(data, {
        keyValueDelim: " ",
        blockRegexp: /^\s?\!(.*?)\s?$/
    });
}

module.exports = function validDeck(deckList, banList, database) {

    banList = banList || banListUpdater();
    database = database || databases["0-en-OCGTCG"];
    var decks = ["main", "side", "extra"],
        card,
        mainMin = 40,
        mainMax = 60,
        isValid = true,
        cardObject,
        getCardObject = function (id) {
            var cardObject,
                i = 0,
                len = database.length;
            for (i, len; i < len; i++) {
                if (id === database[i].id) {
                    cardObject = database[i];
                    break;
                }
            }
            return cardObject;
        };
    decks.forEach(function (deck) {
        if (!isValid) {
            return;
        }
        if (deck === "main") {
            if (deckList[deck + "Length"] < mainMin || deckList[deck + "Length"] > mainMax) {
                isValid = false;
                return;
            }
        } else {
            if (deckList[deck + "Length"] < 0 || deckList[deck + "Length"] > 15) {
                isValid = false;
                return;
            }
        }
        deck = deckList[deck];
        for (card in deck) {
            if (!isValid) {
                break;
            }
            if (!banList.hasOwnProperty(card) && deck[card] > 0 && deck[card] <= 3) {
                break;
            }
            if (banList.hasOwnProperty(card) && banList[card] == "0" && deck[card]) {
                isValid = false;
                break;
            }
            if (banList.hasOwnProperty(card) && deck[card] <= banList[card]) {
                break;
            }
            if (banList.hasOwnProperty(card) && deck[card] > banList[card]) {
                isValid = false;
                break;
            }
            if (deck[card] < 0 || deck[card] > 3) {
                isValid = false;
                break;
            }
            cardObject = getCardObject(parseInt(card, 10));
            if (cardObject.alias !== 0) {
                if (deck[card] + deck[cardObject.alias] > 3) {
                    isValid = false;
                    return;
                }
            }
        }
    });
    return isValid;
};