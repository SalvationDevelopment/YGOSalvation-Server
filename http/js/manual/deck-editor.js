/*global currentMousePos, getCardObject, reorientmenu, cardIs, $*/
/*jslint bitwise: true*/



var deckEditor = (function () {
    'use strict';
    var usersDecks = [],
        activeIndex = 0;

    function makeBlankDeck(name, username, date) {
        return {
            main: [],
            extra: [],
            side: [],
            name: [],
            creator: username,
            creationDate: date
        };
    }

    function makeNewDeck(name) {
        usersDecks.push(makeBlankDeck(name, localStorage.nickname, new Date()));
        return usersDecks[usersDecks.length - 1];
    }

    function updateDeckSelect() {
        var text = '';
        usersDecks.forEach(function (deck, index) {
            text += '<option data-index=' + index + '>' + deck.name + '</option>';
        });
        return text;
    }

    function makeCard(cards, zone) {
        var html = '';
        cards.forEach(function (card, index) {
            var hardcard = JSON.stringify(card),
                src = 'ygopro/pics/' + card + '.jpg';
            html += '<img class="deckeditcard card" src="http://ygopro.us/' + src + '" data-"' + card + '" onclick = "deckeditonclick(' + index + ', \'' + zone + '\')" / > ';
        });

        $('#deckedit .cardspace .' + zone).html(html);
        //$('#subreveal').width(cards.length * 197);
    }

    function deckeditonclick(index, zone) {


        $('#manualcontrols button').css({
            'display': 'none'
        });

        $('#manualcontrols').css({
            'top': currentMousePos.y,
            'left': currentMousePos.x,
            'display': 'block'
        });
        var sideReference = {
                id: usersDecks[activeIndex][zone][index],
                zone: zone,
                index: index
            },
            dbEntry = getCardObject(parseInt(sideReference.id, 10));
        if (sideReference.zone === 'main') {
            $('.de-toside, .de-remove').css({
                'display': 'block'
            });

        }
        if (sideReference.zone === 'extra') {
            $('.de-toside, .de-remove').css({
                'display': 'block'
            });
        }
        if (sideReference.zone === 'side') {
            if (cardIs('xyz', dbEntry) || cardIs('fusion', dbEntry) || cardIs('synchro', dbEntry)) {
                $('.de-toextra, .de-remove').css({
                    'display': 'block'
                });
            } else {
                $('.de-tomain, .de-remove').css({
                    'display': 'block'
                });
            }
        }
        if (sideReference.zone === 'search') {
            if (cardIs('xyz', dbEntry) || cardIs('fusion', dbEntry) || cardIs('synchro', dbEntry)) {
                $('.de-toextra').css({
                    'display': 'block'
                });
            } else {
                $('.de-tomain').css({
                    'display': 'block'
                });
            }
        }
        reorientmenu();
        return;
    }

    //-----------------------
    //FILTERS BEIGN HERE

    //Filters either attribute or race, depending on the value of AT.
    //at =1 is attribute, Else it's race.
    // Num is the value in the DB for a given attribute or race.
    function fAttrRace(obj, num, at) {

        var val = (at === 1) ? obj.Attribute : obj.Type;
        if (val === num) {
            return true;
        } else {
            return false;
        }
    }



    //Lv is the level sought. OP is operation.
    //OP =0 is LESS THAN OR EQUAL lv.
    //OP =1 Is EQUALS lv.
    // Else is HIGHER THAN OR EQUAL
    function fLevel(obj, lv, op) {

        var val = obj.level.toString(16);
        lv = parseInt(lv.toString(16), 10);
        if (op === 0) {
            if (parseInt(val.substr(val.length - 2), 10) <= lv) {
                return true;
            } else {
                return false;
            }
        } else if (op === 1) {
            if (parseInt(val.substr(val.length - 2), 10) === lv) {
                return true;
            } else {
                return false;
            }
        } else {
            if (parseInt(val.substr(val.length - 2), 10) >= lv) {
                return true;
            } else {
                return false;
            }
        }
    }

    // Same as Lv, but with SC as the Scale (Assumes Right=Left)
    function fScale(obj, sc, op) {

        var val = obj.level;
        sc = parseInt(sc.toString(16), 0);
        if (op === 0) {
            if (parseInt((val >> 24).toString(16), 0) <= sc) {
                return true;
            } else {
                return false;
            }
        } else if (op === 1) {
            if (parseInt((val >> 24).toString(16), 0) === sc) {
                return true;
            } else {
                return false;
            }
        } else {
            if (parseInt((val >> 24).toString(16), 0) >= sc) {
                return true;
            } else {
                return false;
            }
        }
    }


    // Uses the monsters full Type value from DB to determine.
    //works  either 1 by 1 or against the sum of Type filters.
    function fType(obj, ty) {

        var val = obj.type;
        if ((val & ty) > 0) {
            return true;
        } else {
            return false;
        }
    }

    //As Level, but for ATK/DEF
    //AD =1 is ATK, Else it's DEF being evaluated.
    // Num is the value to compare against.
    function fAtkDef(obj, num, ad, op) {

        var val = (ad === 1) ? obj.atk : obj.def;
        if (op === 0) {
            if (val <= num) {
                return true;
            } else {
                return false;
            }
        } else if (op === 1) {
            if (val === num) {
                return true;
            } else {
                return false;
            }
        } else {
            if (val >= num) {
                return true;
            } else {
                return false;
            }
        }
    }
    // ND=1 is Name, else Desc. Checks if the TXT string is contained.
    function fNameDesc(obj, txt, nd) {

        var val = (nd === 1) ? obj.name.toLowerCase() : obj.desc.toLowerCase();
        if (val.indexOf(txt.toLowerCase()) >= 0) {
            return true;
        } else {
            return false;
        }
    }

    // Filters cards that have 'txt' in their name.
    function filterName(cardsf, txt) {
        if (txt !== undefined) {

            var output = cardsf.filter(function (item) {
                return fNameDesc(item, txt, 1);
            });
            return output;
        }
    }

    //Filters effect or flavor texts for the txt string
    function filterDesc(cardsf, txt) {
        if (txt !== undefined) {

            var output = cardsf.filter(function (item) {
                return fNameDesc(item, txt, 0);
            });
            return output;
        }
    }

    // Returns all cards that have all the types input.
    function filterType(cardsf, type) {
        if (type !== undefined) {

            var output = cardsf.filter(function (item) {
                return fType(item, type);
            });
            return output;
        }
    }

    //Attribute must matcht he arg.
    function filterAttribute(cardsf, attribute) {
        if (attribute !== undefined) {

            var output = cardsf.filter(function (item) {
                return fAttrRace(item, attribute, 1);
            });
            return output;
        }
    }

    //Returns Cards whose race matches the arg.
    function filterRace(cardsf, race) {
        if (race !== undefined) {

            var output = cardsf.filter(function (item) {
                return fAttrRace(item, race, 0);
            });
            return output;
        }
    }

    //SC is setcode in decimal. This handles all possible combinations.
    function fSetcode(obj, sc) {

        var val = obj.setcode,
            hexA = val.toString(16),
            hexB = sc.toString(16);
        if (val === sc || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16) || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16) || (val >> 16).toString(16) === hexB) {
            return true;
        } else {
            return false;
        }
    }
    //All cards that share at least 1 setcode with the arg.
    function filteSetcode(cardsf, setcode) {
        if (setcode !== undefined) {

            var output = cardsf.filter(function (item) {
                return fSetCode(item, setcode);
            });
            return output;
        }
    }

    //OP here functions just as in the previous function.
    //OP=0 is LOWER THAN OR EQUAL to 
    //OP=1 is EQUALS to 
    //Else it's HIGHER THAN OR EQUAL
    function filterAtk(cardsf, atk, op) {
        if (atk !== undefined) {

            var output = cardsf.filter(function (item) {
                return fAtkDef(item, atk, 1, op);
            });
            return output;
        }
    }
    return {
        updateDeckSelect: updateDeckSelect
    };
}());