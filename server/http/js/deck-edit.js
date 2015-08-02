var cards = [],
    lflist = {};
$(function () {
    $.getJSON('http://ygopro.us/manifest/database.json', function (data) {
        cards = data;
        $.get('http://ygopro.us/ygopro/lflist.conf', function (data) {
            var list;
            lflist = ConfigParser(data, {
                keyValueDelim: " ",
                blockRegexp: /^\s?\!(.*?)\s?$/
            });
            for (list in lflist) {
                $('.banlistSelect').append('<option value="' + list + '">' + list + '</option>');
            }
            $.get('http://ygopro.us/ygopro/Strings.conf', function (data) {
                var setcodes = ConfigParser(data, {
                        keyValueDelim: " ",
                        commentDelims: [],
                        blockRegexp: /^\s?\#(.*?)\s?$/,
                        joinKeyValue: true,
                        joinKeySlice: 1
                    }).setcodes,
                    setcode,
                    monsterCardSelect = $('.monsterCardSelect'),
                    monsterTypeSelect = $('.monsterTypeSelect'),
                    spellSelect = $('.spellSelect'),
                    trapSelect = $('.trapSelect'),
                    raceSelect = $('.raceSelect'),
                    attributeSelect = $('.attributeSelect');
                for (setcode in setcodes) {
                    $('.setcodeSelect').append('<option value="' + parseInt(setcode, 16) + '">' + setcodes[setcode] + '</option>');
                }
                $('.typeSelect').on('change', function () {
                    switch ($(this).val()) {
                    case "5":
                        { // all
                            monsterCardSelect.css('display', 'none').removeAttr('data-input-monster-card');
                            monsterTypeSelect.css('display', 'none').removeAttr('data-input-monster-type');
                            spellSelect.css('display', 'none');
                            trapSelect.css('display', 'none');
                            raceSelect.attr('disabled', '').removeAttr('data-input-race');
                            attributeSelect.attr('disabled', '').removeAttr('data-input-attribute');
                            $('[data-input-type]').removeAttr('data-input-type');
                            break;
                        }
                    case "1":
                        { // monster
                            monsterCardSelect.css('display', 'block').attr('data-input-monster-card', '');
                            monsterTypeSelect.css('display', 'block').attr('data-input-monster-type', '');
                            spellSelect.css('display', 'none').removeAttr('data-input-type');
                            trapSelect.css('display', 'none').removeAttr('data-input-type');
                            raceSelect.removeAttr('disabled').attr('data-input-race', '');
                            attributeSelect.removeAttr('disabled').attr('data-input-attribute', '');
                            break;
                        }
                    case "2":
                        { // spell
                            spellSelect.css('display', 'block').attr('data-input-type', '');
                            monsterCardSelect.css('display', 'none').removeAttr('data-input-monster-card');
                            monsterTypeSelect.css('display', 'none').removeAttr('data-input-monster-type');
                            trapSelect.css('display', 'none').removeAttr('data-input-type');
                            raceSelect.attr('disabled', '').removeAttr('data-input-race');
                            attributeSelect.attr('disabled', '').removeAttr('data-input-attribute');
                            break;
                        }
                    case "4":
                        { // traps
                            trapSelect.css('display', 'block').attr('data-input-type', '');
                            monsterCardSelect.css('display', 'none').removeAttr('data-input-monster-card');
                            monsterTypeSelect.css('display', 'none').removeAttr('data-input-monster-type');
                            spellSelect.css('display', 'none').removeAttr('data-input-type');
                            raceSelect.attr('disabled', '').removeAttr('data-input-race');
                            attributeSelect.attr('disabled', '').removeAttr('data-input-attribute');
                            break;
                        }
                    }
                });
                $('.searchButton').on('click', handleResults);
                $('.nameInput, .descInput').on('keyup', function () {
                    if ($(this).val().length >= 5) {
                        handleResults();
                    }
                });
                $('.searchResults').on('mouseenter', '.resultDiv:not(".exceededSearchNotif")', function () {
                    var id = $('img', this).attr('data-card-id');
                    $('.imgContainer').attr('src', imgDir + id + '.jpg');
                    $('.cardDescription').html(makeDescription(id));
                });
                $('.mainDeck, .sideDeck, .extraDeck').on('mouseenter', 'img', function () {
                    var id = $(this).attr('data-card-id');
                    $('.imgContainer').attr('src', imgDir + id + '.jpg');
                    $('.cardDescription').html(makeDescription(id));
                });
                $('.mainDeck').droppable({
                    addClasses: false,
                    accept: "img[data-card-id]",
                    drop: dropHandler("main"),
                    out: dropOutHandler("main")
                });
                $('.sideDeck').droppable({
                    addClasses: false,
                    accept: "img[data-card-id]",
                    drop: dropHandler("side"),
                    out: dropOutHandler("side")
                });
                $('.extraDeck').droppable({
                    addClasses: false,
                    accept: "img[data-card-id]",
                    drop: dropHandler("extra"),
                    out: dropOutHandler("extra")
                });
                $('.saveDeck').on('click', function () {
                    primus.write({
                        action: "saveDeckRequest",
                        deckList: createDeckList(deckStorage.decks),
                        uniqueID: uniqueID
                    });
                });
                $('.saveDeckAs').on('click', function () {
                    var deckName = $('.decknameInput').val();
                    if (!deckName) {
                        primus.write({
                            action: "saveDeckRequest",
                            deckList: createDeckList(deckStorage.decks),
                            deckName: $('.deckSelect').val(),
                            uniqueID: uniqueID
                        });
                    } else {
                        primus.write({
                            action: "saveDeckRequest",
                            deckList: createDeckList(deckStorage.decks),
                            deckName: deckName + ".ydk",
                            uniqueID: uniqueID
                        });
                    }
                });
                $('.deleteDeck').on('click', function () {
                    if (confirm("Are you sure you want to permanently delete this deck?")) {
                        primus.write({
                            action: "unlinkDeckRequest",
                            deckName: $('.deckSelect').val(),
                            uniqueID: uniqueID
                        });
                        drawDeckEditor({
                            main: {},
                            side: {},
                            extra: {}
                        });
                    }
                });
                $('.clearDeck').on('click', function () {
                    drawDeckEditor({
                        main: {},
                        side: {},
                        extra: {}
                    });
                });
                $('.shuffleDeck').on('click', function () {
                    var deck = deckStorage.getDeck("main");
                    deckStorage.setDeck("main", shuffleArray(deck));
                    drawDeck("main");
                });
                $('.sortDeck').on('click', function () {
                    sortAllDecks();
                });
            });
        });
    });
});

var imgDir = "http://ygopro.us/ygopro/pics/",
    forumLink = "http://forum.ygopro.us/index.php/?ref=_deckEditor",
    attributeMap = {
        1: "EARTH",
        2: "WATER",
        4: "FIRE",
        8: "WIND",
        16: "LIGHT",
        32: "DARK",
        64: "DIVINE"
    },
    typeMap = {
        130: " / Ritual",
        65538: " / Quick-Play",
        131074: " / Continuous",
        131076: " / Continuous",
        262146: " / Equip",
        524290: " / Field",
        1048580: " / Counter"
    },
    monsterMap = {
        17: "Normal",
        33: "Effect",
        65: "Fusion",
        97: "Fusion / Effect",
        129: "Ritual",
        161: "Ritual / Effect",
        545: "Spirit",
        1057: "Union",
        2081: "Gemini / Effect",
        4113: "Tuner",
        4129: "Tuner / Effect",
        8193: "Synchro",
        8225: "Synchro / Effect",
        12321: "Synchro / Tuner / Effect",
        2097185: "Flip / Effect",
        4194337: "Toon / Effect",
        8388609: "Xyz",
        8388641: "Xyz / Effect",
        16777233: "Pendulum",
        16777249: "Pendulum / Effect",
        25165857: "Xyz / Pendulum / Effect"
    },
    raceMap = {
        1: "Warrior",
        2: "Spellcaster",
        4: "Fairy",
        8: "Fiend",
        16: "Zombie",
        32: "Machine",
        64: "Aqua",
        128: "Pyro",
        256: "Rock",
        512: "Winged-Beast",
        1024: "Plant",
        2048: "Insect",
        4096: "Thunder",
        8192: "Dragon",
        16384: "Beast",
        32768: "Beast-Warrior",
        65536: "Dinosaur",
        131072: "Fish",
        262144: "Sea-Serpent",
        524288: "Reptile",
        1048576: "Psychic",
        2097152: "Divine-Beast",
        4194304: "Creator God",
        8388608: "Wyrm"
    },
    deckStorage = {
        not: function (deck) {
            var key,
                arr = [];
            for (key in deckStorage.decks) {
                if (key !== deck) {
                    arr.push(deckStorage.decks[key]);
                }
            }
            return arr;
        },
        getDeck: function (deck) {
            return deckStorage.decks[deck];
        },
        setDeck: function (deck, newDeck) {
            deckStorage.decks[deck] = newDeck;
        },
        addCard: function (deck, id) {
            deckStorage.decks[deck].push(id);
        },
        removeCard: function (deck, index) {
            deckStorage.decks[deck][index] = undefined;
            deckStorage.decks[deck] = deckStorage.decks[deck].filter(function (card) {
                return !!card;
            });
        },
        reset: function (deck) {
            deckStorage.decks[deck] = [];
        },
        maximumSize: function (deck) {
            return deckStorage.sizeMap[deck];
        },
        sizeMap: {
            main: 60,
            side: 15,
            extra: 15
        },
        decks: {
            main: [],
            side: [],
            extra: []
        }
    };

function shuffleArray (array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function storeCard (outputArray) {
    return function (data) {
        outputArray.push(data.cardId);
    };
}

function cardSort (prev, next) {
    if (prev.cardType === next.cardType) {
        if (prev.cardName === next.cardName) {
            return 0;
        }
        return (prev.cardName.toLowerCase() < next.cardName.toLowerCase()) ? -1 : 1;
    }
    return prev.cardType - next.cardType;
}

function sortDeck(target) {
    var sortTarget = deckStorage.getDeck(target),
        normalMonster = [],
        effectMonster = [],
        spell = [],
        trap = [],
        extra = [],
        outputArray = [],
        domData,
        extraRegexp = /^(Fusion|Synchro|Xyz)/;
    sortTarget.forEach(function (card) {
        domData = $('[data-card-id="' + card + '"]').data();
        if (!domData || !domData.cardType) {
            return;
        }
        domData.cardName = domData.cardName.replace(/\{\{quote\}\}/g, '"');
        if ((domData.cardType & 2) === 2) {
            spell.push(domData);
        } else if ((domData.cardType & 4) === 4) {
            trap.push(domData);
        } else if (domData.cardType === 17) {
            normalMonster.push(domData);
        } else if (extraRegexp.test(monsterMap[domData.cardType])) {
            extra.push(domData);
        } else {
            effectMonster.push(domData);
        }
    });
    normalMonster = normalMonster.sort(function (prev, next) {
        if (prev.cardName === next.cardName) {
            return 0;
        }
        return (prev.cardName.toLowerCase() < next.cardName.toLowerCase()) ? -1 : 1;
    }).forEach(storeCard);
    effectMonster.sort(cardSort).forEach(storeCard(outputArray));
    spell.sort(cardSort).forEach(storeCard(outputArray));
    trap.sort(cardSort).forEach(storeCard(outputArray));
    extra.sort(cardSort).forEach(storeCard(outputArray));
    return outputArray;
}

function sortAllDecks () {
    var deck,
        sortedDeck;
    for (deck in deckStorage.decks) {
        sortedDeck = sortDeck(deck);
        deckStorage.setDeck(deck, sortedDeck);
        drawDeck(deck);
    }
}
        
function handleResults() {
    const SEARCH_HARD_CAP = 100;
    var monsterCardSelect = $('.monsterCardSelect'),
        monsterTypeSelect = $('.monsterTypeSelect'),
        monsterCardCheck = $('[data-input-monster-card]'),
        monsterTypeCheck = $('[data-input-monster-type]'),
        searchResults = $('.searchResults'),
        inputTypeCheck = $('[data-input-type]').val(),
        monsterCardValue = parseInt(monsterCardSelect.val() || 0,10),
        monsterTypeValue = parseInt(monsterTypeSelect.val() || 0,10),
        exceededSearchCap = false,
        exceededSearchArray = [],
        hiddenType,
        results,
        output = "";
    if ((!inputTypeCheck && $('.typeSelect').val() !== "5") || monsterCardCheck.length || monsterTypeCheck.length) {
    hiddenType = $('<input type="hidden" data-input-type>').appendTo($('.searchBlock:eq(0)')).val(1 + ((monsterCardValue === 16 && monsterTypeValue) ? 0 : monsterCardValue) + monsterTypeValue);    }
    results = applyFilters(generateQueryObject(), $('.banlistSelect').val(), lflist);
    $('[data-input-type]:hidden').remove();
    if (results.length > SEARCH_HARD_CAP) {
        exceededSearchArray = results;
        exceededSearchCap = true;
        results = results.slice(0, SEARCH_HARD_CAP);
    }
    results.forEach(function (result, index) {
        output += '<div class="resultDiv row_' + index + '"><div class="thumbContainer">' + createCardImage(result) + '</div><div class="descriptionContainer"><span class="name">' + result.name + '</span><br />';
        if (cardIs("monster", result)) {
            // render monster display
            output += '<span class="monsterDetails">' + attributeMap[result.attribute] + ' / ' + raceMap[result.race] + '<br />' + parseLevelScales(result.level);
            output += '<br />';
            output += '<span class="monsterAtkDef">' + parseAtkDef(result.atk, result.def);
        } else if (cardIs("spell", result)) {
            // render spell display
            output += '<span class="spellDetails">Spell' + (typeMap[result.type] || "") + '</span>';
        } else if (cardIs("trap", result)) {
            // render trap display
            output += '<span class="trapDetails">Trap' + (typeMap[result.type] || "") + '</span>';
        }
        output += '</div></div>';
    });
    if (exceededSearchCap) {
        output += '<div class="resultDiv exceededSearchNotif">Display more results...</div>';
    }
    searchResults.html(output);
    $('.resultDiv img', searchResults).each(function () {
        $(this).data('cardData', 'searchedCard');
    });
    attachDnDEvent($('.resultDiv img', searchResults));
}

function makeDescription(id) {
    var targetCard = getCardObject(parseInt(id, 10)),
        output = "";
    if (!targetCard) {
        return '<span class="searchError">An error occurred while looking up the card in our database.<br />Please report this issue <a href="' + forumLink + '" target="_blank">at our forums</a> and be sure to include following details:<br /><br />Subject: Deck Editor Error<br />Function Call: makeDescription(' + id + ')<br />User Agent: ' + navigator.userAgent + '</span>';
    }
    output += '<div class="descContainer"><span class="cardName">' + targetCard.name + ' [' + id + ']</span><br />';
    if (cardIs("monster", targetCard)) {
        output += "<span class='monsterDesc'>[ Monster / " + monsterMap[targetCard.type] + " ]<br />" + raceMap[targetCard.race] + " / " + attributeMap[targetCard.attribute] + "<br />";
        output += "[ " + parseLevelScales(targetCard.level) + " ]<br />" + parseAtkDef(targetCard.atk, targetCard.def) + "</span>";
    } else if (cardIs("spell", targetCard)) {
        output += "<span class='spellDesc'>[ Spell" + (typeMap[targetCard.type] || "") + " ]</span>";
    } else if (cardIs("trap", targetCard)) {
        output += "<span class='trapDesc'>[ Trap" + (typeMap[targetCard.type] || "") + " ]</span>";
    }
    return output + "<br /><span class='description'>" + targetCard.desc.replace(/\r\n/g, '<br />') + "</span>";
}

function attachDnDEvent(targetCollection) {
    targetCollection.draggable({
        addClasses: false,
        cursor: "move",
        helper: function () {
            var helperElem = document.createElement("img");
            helperElem.src = $(this).attr('src');
            $(helperElem).attr('data-card-id', $(this).attr('data-card-id'));
            if ($(this).attr('data-card-alias')) {
                $(helperElem).attr('data-card-alias', $(this).attr('data-card-alias'));
            }
            $(helperElem).css({
                height: $(this).css('height'),
                width: $(this).css('width')
            });
            return helperElem;
        },
        scroll: false
    });
}

function dropHandler(target) {
    return function (event, ui) {
        var clone = ui.draggable.clone(),
            id = clone.attr('data-card-alias') ? [clone.attr('data-card-id'), clone.attr('data-card-alias')] : clone.attr('data-card-id'),
            targetDeck = deckStorage.getDeck(target),
            remainingDecks = deckStorage.not(target),
            maximumSize = deckStorage.maximumSize(target),
            targetContainer = $('.' + target + 'Deck');
        if (addDeckLegal(id, targetDeck, maximumSize, lflist, $('.banlistSelect').val(), remainingDecks[0], remainingDecks[1]) && ui.draggable.data('cardData') === 'searchedCard') {
            clone.addClass(target + '_card_' + targetDeck.length);
            clone.data('cardData', 'deckCard');
            attachDnDEvent(clone);
            targetContainer.append(clone);
            deckStorage.addCard(target, id);
            adjustDeckClass(targetDeck, targetContainer);
            return true;
        } else {
            if (ui.draggable.data('cardData') === 'searchedCard') {
                // empty
            } else {
                return false;
            }
        }
    };
}

function adjustDeckClass(targetDeck, targetContainer) {
    if (targetDeck.length <= 40) {
        targetContainer.addClass('f40').removeClass('f50 f60');
    } else if (targetDeck.length > 40 && targetDeck.length <= 50) {
        targetContainer.addClass('f50').removeClass('f40 f60');
    } else if (targetDeck.length > 50) {
        targetContainer.addClass('f60').removeClass('f40 f50');
    }
}

function dropOutHandler(target) {
    return function (event, ui) {
        var clone = ui.draggable.clone(),
            cardClasses = clone.attr('class').split(' '),
            cardData = ui.draggable.data('cardData'),
            indexRegexp = new RegExp(target + '\\_card\\_(\\d+)');
        if (cardData === 'searchedCard') {
            return false;
        } else if (cardData === 'deckCard') {
            cardClasses.forEach(function (cardClass) {
                var matches;
                if ((matches = cardClass.match(indexRegexp)) !== null) {
                    deckStorage.removeCard(target, matches[1]);
                }
            });
            ui.draggable.remove();
            drawDeck(target);
            return true;
        } else {
            return false;
        }
    };
}

function parseAtkDef(atk, def) {
    return ((atk < 0) ? "?" : atk) + " / " + ((def < 0) ? "?" : def);
}

function parseLevelScales(level) {
    var output = "",
        leftScale,
        rightScale,
        pendulumLevel;
    if (level > 0 && level <= 12) {
        output += '<span class="levels">';
        while (level--) {
            output += "*";
        }
    } else {
        level = level.toString(16); // format: [0-9A-F]0[0-9A-F][0-9A-F]{4}
        leftScale = parseInt(level.charAt(0), 16); // first digit: left scale in hex (0-16)
        rightScale = parseInt(level.charAt(2), 16); // third digit: right scale in hex (0-16)
        pendulumLevel = parseInt(level.charAt(6), 16); // seventh digit: level of the monster in hex (technically, all 4 digits are levels, but here we only need the last char
        output += '<span class="scales"><< ' + leftScale + ' | ' + rightScale + ' >> <span class="levels">';
        while (pendulumLevel--) {
            output += '*';
        }
        output += '</span>';
    }
    return output + '</span>';
}

function cardIs(cat, obj) {
    if (cat === "monster" && (obj.race !== 0 || obj.level !== 0 || obj.attribute !== 0)) {
        return true;
    }
    if (cat === "spell") {
        return (obj.type & 2) == 2;
    }
    if (cat === "trap") {
        return (obj.type & 4) == 4;
    }
    if (cat === "fusion") {
        return (obj.type & 64) == 64;
    }
    if (cat === "synchro") {
        return (obj.type & 8192) == 8192;
    }
    if (cat === "xyz") {
        return (obj.type & 8388608) == 8388608;
    }
}

function getCardObject(id) {
    var cardObject,
        i = 0,
        len = cards.length;
    for (i, len; i < len; i++) {
        if (id === cards[i].id) {
            cardObject = cards[i];
            break;
        }
    }
    return cardObject;
}

function createCardImage(card) {
    if (!card) {
        return '<span class="cardImage"><img src="' + imgDir + 'cover.jpg" data-card-id="cover" data-card-name="???" data-card-type="0" /></span>';
    } else {
        return '<span class="cardImage" data-card-limit="' + (lflist[$('.banlistSelect').val()][card.id] || 3) + '"><img src="' + imgDir + card.id + '.jpg" data-card-id="' + card.id + '" data-card-name="' + card.name.replace(/\"/g, '{{quote}}') + '" ' + (card.alias !== 0 ? 'data-card-alias="' + card.alias + '"' : '') + 'data-card-type="' + card.type + '" /></span>';
    }
}

function createDeckList(decks) {
    var generatedYDK = "#Created by YGOPro.us' deck editor\r\n",
        order = ["main", "extra", "side"],
        deck,
        i = 0;
    for (i; i < order.length; i++) {
        deck = order[i];
        generatedYDK += (deck === "side" ? "!" : "#") + deck + "\r\n";
        generatedYDK += decks[deck].join("\r\n") + "\r\n";
    }
    return generatedYDK.split("\r\n").filter(function (line) {
        return !!line;
    }).join("\r\n");
}

function fAttrRace(obj, num, at) {
    'use strict';
    var val = (at === 1) ? obj.attribute : obj.race;
    if (val === num) {
        return true;
    } else {
        return false;
    }
}

function fSetcode(obj, sc) {
    'use strict';
    var val = obj.setcode,
        hexA = val.toString(16),
        hexB = sc.toString(16);
    if (val === sc || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16) || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16) || (val >> 16).toString(16) === hexB) {
        return true;
    } else {
        return false;
    }
}

function fLevel(obj, lv, op) {
    'use strict';
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

function fScale(obj, sc, op) {
    'use strict';
    var val = obj.level;
    sc = parseInt(sc.toString(16));
    if (op === 0) {
        if (parseInt((val >> 24).toString(16)) <= sc) {
            return true;
        } else {
            return false;
        }
    } else if (op === 1) {
        if (parseInt((val >> 24).toString(16)) === sc) {
            return true;
        } else {
            return false;
        }
    } else {
        if (parseInt((val >> 24).toString(16)) >= sc) {
            return true;
        } else {
            return false;
        }
    }
}

function fType(obj, ty) {
    'use strict';
    var val = obj.type;
    if (val === 2 && ty === 2) {
        return true;
    } else if (obj.ty === 4 && ty === 4) {
        return true;
    } else if ((val & ty) == ty) {
        return true;
    } else {
        return false;
    }
}

function fAtkDef(obj, num, ad, op) {
    'use strict';
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

function fNameDesc(obj, txt, nd) {
    'use strict';
    var val = (nd === 1) ? obj.name.toLowerCase() : obj.desc.toLowerCase();
    if (val.indexOf(txt.toLowerCase()) >= 0) {
        return true;
    } else {
        return false;
    }
}

function filterName(result, txt) {
    'use strict';
    return result.filter(function (item) {
        return fNameDesc(item, txt, 1);
    });

}

function filterDesc(result, txt) {
    'use strict';
    return result.filter(function (item) {
        return fNameDesc(item, txt, 0);
    });

}

function filterType(result, type) {
    'use strict';
    return result.filter(function (item) {
        return fType(item, type);
    });

}

function filterAttribute(result, attribute) {
    'use strict';
    return result.filter(function (item) {
        return fAttrRace(item, attribute, 1);
    });

}

function filterRace(result, race) {
    'use strict';
    return result.filter(function (item) {
        return fAttrRace(item, race, 0);
    });

}

function filterSetcode(result, setcode) {
    'use strict';
    return result.filter(function (item) {
        return fSetcode(item, setcode);
    });

}

function filterAtk(result, atk, op) {
    'use strict';
    return result.filter(function (item) {
        return fAtkDef(item, atk, 1, op);
    });

}

function filterDef(result, def, op) {
    'use strict';
    return result.filter(function (item) {
        return fAtkDef(item, def, 0, op);
    });

}

function filterLevel(result, level, op) {
    'use strict';
    return result.filter(function (item) {
        return fLevel(item, level, op);
    });

}

function filterScale(result, scale, op) {
    'use strict';
    return result.filter(function (item) {
        return fScale(item, scale, op);
    });
}

function filterForbiddenLimited(result, selectedLimitation, placeholder, selectedBanlist, config) {
    return result.filter(function (card) {
        if (selectedLimitation === 4) {
            return true;
        }
        if (!(card.id in config[selectedBanlist]) && selectedLimitation === 3) {
            return true;
        }
        if (!(card.id in config[selectedBanlist]) && selectedLimitation !== 3) {
            return false;
        }
        return parseInt(config[selectedBanlist][card.id], 10) === selectedLimitation;
    });
}

function applyFilters(filterObject, banlist, lflist) {
    var queriedCards = cards,
        o = filterObject,
        prop,
        args = {
            'Atk': 1,
            'Def': 1,
            'Level': 1,
            'Scale': 1,
            'Name': "",
            "Desc": ""
        };
    for (prop in o) {
        if (o.hasOwnProperty(prop) && o.propertyIsEnumerable(prop)) {
            if (o[prop] !== null) {
                queriedCards = window['filter' + prop](queriedCards, (typeof args[prop] === "string") ? "" + o[prop] : parseInt(o[prop], 10), args[prop] || 0, banlist, lflist);
            }
        }
    }
    return queriedCards;
}

function generateQueryObject() {
    var retVal = {},
        filters = [
            "Name",
            "Desc",
            "Type",
            "Attribute",
            "Race",
            "Setcode",
            "Atk",
            "Def",
            "Level",
            "Scale",
            "ForbiddenLimited"
        ];
    filters.forEach(function (filter) {
        retVal[filter] = $('[data-input-' + filter + ']').val() || null;
    });
    return retVal;
}

function addDeckLegal(id, targetDeck, targetDeckSize, flList, currentList, deck2, deck3) {
    if (typeof id !== 'string') {
        id = id[1];
    }

    function idMatches(value) {
        return ((typeof id === 'string') && id === value || value[1] === id);
    }
    if (targetDeckSize <= targetDeck.length) {
        return false;
    }
    var matchingCopies = targetDeck.filter(idMatches).length + deck2.filter(idMatches).length + deck3.filter(idMatches).length,
        maxCopies = flList[currentList][id],
        cardObject = getCardObject(parseInt(id, 10));
    if (typeof cardObject !== "object") {
        return false;
    }
    if ((cardIs("fusion", cardObject) || cardIs("synchro", cardObject) || cardIs("xyz", cardObject)) && targetDeck === deckStorage.getDeck("main")) {
        return false;
    }
    if ((!cardIs("fusion", cardObject) || !cardIs("synchro", cardObject) || !cardIs("xyz", cardObject)) && targetDeck === deckStorage.getDeck("extra")) {
        return false;
    }
    if (maxCopies === undefined) {
        maxCopies = 3;
    }
    return (matchingCopies < maxCopies);
}
