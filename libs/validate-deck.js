/*jslint plusplus :true*/


function getBanlist() {
    var banlist = {},
        files = fs.readdirSync('../http/banlist/');
    files.forEach(function (filename) {
        if (filename.indexOf('.js') > -1) {
            var listname = filename.slice(0, -3);
            banlist[listname] = require('../http/banlist/' + '/' + filename);
        }
    });
    return banlist;
}

function validateDeck(deck, banlist, database, cardpool, prerelease) {
    'use strict';

    var main = {},
        side = {},
        extra = {},
        region = banlist.region,
		today = new Date(),
		today_date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
        validate = {
            error: false,
            msg: ''
        },
        card,
        packDB = database.filter(function (card) {
            if (region && banlist.endDate) {
                if (card[region]) {
                    if (card[region].date) {
                        return new Date(banlist.endDate).getTime() > card[region].date;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        });

    function getCardById(cardId) {
        var result = database.find(function (card) {
            if (card.id === parseInt(cardId, 10)) {
                return true;
            }
            return false;
        });
        return result || {};
    }

    function getFilteredCardById(cardId) {
        var result = database.find(function (card) {
            if (card.id === parseInt(cardId, 10)) {
                return true;
            }
            return false;
        });
        return result || null;
    }



    // make sure we can work with the input
    if (!deck.main || !deck.side || !deck.extra || typeof deck.main.forEach !== 'function' || typeof deck.side.forEach !== 'function' || typeof deck.extra.forEach !== 'function') {
        validate.error = true;
        validate.msg = 'Invalid deck object';
        return validate;
    }
    // check deck lengths
    if (deck.main.length < 40) {
        validate.error = true;
        validate.msg = 'Main Deck size below 40';
        return validate;
    }
    if (deck.main.length > 60 && banlist.masterRule > 0) {
        validate.error = true;
        validate.msg = 'Main Deck size above 60';
        return validate;
    }
    if (deck.side.length > 15) {
        validate.error = true;
        validate.msg = 'Side Deck size above 15';
        return validate;
    }
    if (deck.extra.length > 15 && banlist.masterRule > 0) {
        validate.error = true;
        validate.msg = 'Extra Deck size above 15';
        return validate;
    }
    // remap decks

    deck.main.forEach(function (card) {
        var cardObject = getCardById(card);
        if (cardObject.alias) {
            card = cardObject.alias;
        }
        if (!main[card]) {
            main[card] = 1;
        } else {
            main[card]++;
        }
    });
    deck.side.forEach(function (card) {
        var cardObject = getCardById(card);
        if (cardObject.alias) {
            card = cardObject.alias;
        }
        if (!side[card]) {
            side[card] = 1;
        } else {
            side[card]++;
        }
    });
    deck.extra.forEach(function (card) {
        var cardObject = getCardById(card);
        if (cardObject.alias) {
            card = cardObject.alias;
        }
        if (!extra[card]) {
            extra[card] = 1;
        } else {
            extra[card]++;
        }
    });
    // check amount of cards

    for (card in main) {
        var reference = getCardById(card);
        if (main[card] > 3 || side[card] && main[card] + side[card] > 3) {
            validate.error = true;
            validate.msg = "You can't have " + cardAmount + " copies of " + '"' + reference.name + '"';
            return validate;
        }
    }
    for (card in side) {
        var reference = getCardById(card);
        if (side[card] > 3 || main[card] && main[card] + side[card] > 3) {
            validate.error = true;
            validate.msg = "You can't have " + cardAmount + " copies of " + '"' + reference.name + '"';
            return validate;
        }
    }
    for (card in extra) {
        var reference = getCardById(card);
        if (extra[card] > 3 || side[card] && extra[card] + side[card] > 3) {
            validate.error = true;
            validate.msg = "You can't have " + cardAmount + " copies of " + '"' + reference.name + '"';
            return validate;
        }
    }
    // check cardpool 
/*     console.log('checking against', cardpool);
    for (var card in main) {
        var reference = getCardById(card);
        if (cardpool == 'OCG/TCG' && reference.ot == 4) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the OCG/TCG card pool";
            return validate;
        }
        if (cardpool == 'TCG' && (reference.ot == 4 || reference.ot == 1 || reference.ot == 5)) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the TCG card pool";
            return validate;
        }
        if (cardpool == 'OCG' && (reference.ot == 4 || reference.ot == 2 || reference.ot == 6)) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the OCG card pool";
            return validate;
        }
    }
    for (var card in side) {
        var reference = getCardById(card);
        if (cardpool == 'OCG/TCG' && reference.ot == 4) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the OCG/TCG card pool";
            return validate;
        }
        if (cardpool == 'TCG' && (reference.ot == 4 || reference.ot == 1 || reference.ot == 5)) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the TCG card pool";
            return validate;
        }
        if (cardpool == 'OCG' && (reference.ot == 4 || reference.ot == 2 || reference.ot == 6)) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the OCG card pool";
            return validate;
        }
    }
    for (var card in extra) {
        var reference = getCardById(card);
        if (cardpool == 'OCG/TCG' && reference.ot == 4) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the OCG/TCG card pool";
            return validate;
        }
        if (cardpool == 'TCG' && (reference.ot == 4 || reference.ot == 1 || reference.ot == 5)) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the TCG card pool";
            return validate;
        }
        if (cardpool == 'OCG' && (reference.ot == 4 || reference.ot == 2 || reference.ot == 6)) {
            validate.error = true;
            validate.msg = '"' + reference.name + '"' + " is not allowed in the OCG card pool";
            return validate;
        }
    } */
    // check banlist, assume banlist is an object generated from ConfigParser()
    for (var card in banlist.bannedCards) {
        var cardAmount = 0,
            reference = getCardById(card);
        if (main[card]) {
            cardAmount += main[card];
        }
        if (side[card]) {
            cardAmount += side[card];
        }
        if (extra[card]) {
            cardAmount += extra[card];
        }
        if (cardAmount > banlist.bannedCards[card]) {
            validate.error = true;
            validate.msg = "The number of copies of " + '"' + reference.name + '"' + " exceeds the number permitted by the selected Forbidden/Limited Card List";
            return validate;
        }
    }
    console.log(banlist.region);
    if (banlist.region == 'tcg') {
        console.log('checking against tcg');
        for (var card in main) {
            var reference = getFilteredCardById(card),
                subreference = getCardById(card);
            console.log(reference.name, subreference.tcg.date, new Date(banlist.endDate));
            if (reference.tcg.date || (reference && cardpool == 'OCG/TCG')) {
                if (reference.tcg.date > new Date(banlist.endDate)) {
                    console.log(card)
                    validate.error = true;
                    validate.msg = '"' + subreference.name + '"' + " does not exist in the timeframe of the selected Forbidden/Limited Card List";
                    return validate;
                }
            } else {
                console.log(card.tcg, card)
                validate.error = true;
                validate.msg = '"' + reference.name + '"' + " does not exist in the TCG";
                return validate;
            }
        }
        for (var card in side) {
            var reference = getFilteredCardById(card),
                subreference = getCardById(card);
            console.log(reference.name, subreference.tcg.date, new Date(banlist.endDate));
            if (reference.tcg.date || (reference && cardpool == 'OCG/TCG')) {
                if (reference.tcg.date > new Date(banlist.endDate)) {
                    console.log(card)
                    validate.error = true;
                    validate.msg = '"' + subreference.name + '"' + " does not exist in the timeframe of the selected Forbidden/Limited Card List";
                    return validate;
                }
            } else {
                console.log(card.tcg, card)
                validate.error = true;
                validate.msg = '"' + reference.name + '"' + " does not exist in the TCG";
                return validate;
            }
        }
        for (var card in extra) {
            var reference = getFilteredCardById(card),
                subreference = getCardById(card);
            console.log(reference.name, subreference.tcg.date, new Date(banlist.endDate));
            if (reference.tcg.date || (reference && cardpool == 'OCG/TCG')) {
                if (reference.tcg.date > new Date(banlist.endDate)) {
                    console.log(card)
                    validate.error = true;
                    validate.msg = '"' + subreference.name + '"' + " does not exist in the timeframe of the selected Forbidden/Limited Card List";
                    return validate;
                }
            } else {
                console.log(card.tcg, card)
                validate.error = true;
                validate.msg = '"' + reference.name + '"' + " does not exist in the TCG";
                return validate;
            }
        }
    }
    if (banlist.region == 'ocg') {
        console.log('checking against ocg');
        for (var card in main) {
            var reference = getFilteredCardById(card),
                subreference = getCardById(card);
            console.log(reference.name, subreference.ocg.date, new Date(banlist.endDate));
            if (reference.ocg.date || (reference && cardpool == 'OCG/TCG')) {
                if (reference.ocg.date > new Date(banlist.endDate)) {
                    console.log(card)
                    validate.error = true;
                    validate.msg = '"' + subreference.name + '"' + " does not exist in the timeframe of the selected Forbidden/Limited Card List";
                    return validate;
                }
            } else {
                console.log(card.ocg, card)
                validate.error = true;
                validate.msg = '"' + reference.name + '"' + " does not exist in the OCG";
                return validate;
            }
        }
        for (var card in side) {
            var reference = getFilteredCardById(card),
                subreference = getCardById(card);
            console.log(reference.name, subreference.ocg.date, new Date(banlist.endDate));
            if (reference.ocg.date || (reference && cardpool == 'OCG/TCG')) {
                if (reference.ocg.date > new Date(banlist.endDate)) {
                    console.log(card)
                    validate.error = true;
                    validate.msg = '"' + subreference.name + '"' + " does not exist in the timeframe of the selected Forbidden/Limited Card List";
                    return validate;
                }
            } else {
                console.log(card.ocg, card)
                validate.error = true;
                validate.msg = '"' + reference.name + '"' + " does not exist in the OCG";
                return validate;
            }
        }
        for (var card in extra) {
            var reference = getFilteredCardById(card),
                subreference = getCardById(card);
            console.log(reference.name, subreference.ocg.date, new Date(banlist.endDate));
            if (reference.ocg.date || (reference && cardpool == 'OCG/TCG')) {
                if (reference.ocg.date > new Date(banlist.endDate)) {
                    console.log(card)
                    validate.error = true;
                    validate.msg = '"' + subreference.name + '"' + " does not exist in the timeframe of the selected Forbidden/Limited Card List";
                    return validate;
                }
            } else {
                console.log(card.ocg, card)
                validate.error = true;
                validate.msg = '"' + reference.name + '"' + " does not exist in the OCG";
                return validate;
            }
        }
    }
    if (banlist.masterRule !== 4) {
        for (var card in extra) {
			var reference = getCardById(card);
            if (reference.type >= 33554433) {
                validate.error = true;
                validate.msg = "Link Monsters are not permitted by the selected Forbidden/Limited Card List";
                return validate;
            }
        }
    }
    return validate;
}

if (module && typeof module.exports !== 'undefined') {
    module.exports = validateDeck;
}