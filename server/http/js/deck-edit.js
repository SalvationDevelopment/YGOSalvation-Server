var cards = [],
    lflist = {};
$(function() {
    $.getJSON('http://ygopro.us/manifest/database.json', function(data) {
        cards = data;
        $.get('http://ygopro.us/ygopro/lflist.conf', function(data) {
            var list;
            lflist = ConfigParser(data, {
                keyValueDelim: " ",
                blockRegexp: /^\s?\!(.*?)\s?$/
            });
            for (list in lflist) {
                $('.banlistSelect').append('<option value="' + list + '">' + list + '</option>');
            }
            $.get('http://ygopro.us/ygopro/Strings.conf', function(data) {
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
                $('.typeSelect').on('change', function() {
                    switch ($(this).val()) {
                        case "5":
                            { // all
                                monsterCardSelect.fadeOut().removeAttr('data-input-monster-card');
                                monsterTypeSelect.fadeOut().removeAttr('data-input-monster-type');
                                spellSelect.fadeOut();
                                trapSelect.fadeOut();
                                raceSelect.fadeOut().removeAttr('data-input-race');
                                attributeSelect.fadeOut().removeAttr('data-input-attribute');
                                $('[data-input-type]').removeAttr('data-input-type');
                                break;
                            }
                        case "1":
                            { // monster
                                monsterCardSelect.fadeIn().attr('data-input-monster-card', '');
                                monsterTypeSelect.fadeIn().attr('data-input-monster-type', '');
                                spellSelect.fadeOut().removeAttr('data-input-type');
                                trapSelect.fadeOut().removeAttr('data-input-type');
                                raceSelect.fadeIn().attr('data-input-race', '');
                                attributeSelect.fadeIn().attr('data-input-attribute', '');
                                break;
                            }
                        case "2":
                            { // spell
                                spellSelect.fadeIn().attr('data-input-type', '');
                                monsterCardSelect.fadeOut().removeAttr('data-input-monster-card');
                                monsterTypeSelect.fadeOut().removeAttr('data-input-monster-type');
                                trapSelect.fadeOut().removeAttr('data-input-type');
                                raceSelect.fadeOut().removeAttr('data-input-race');
                                attributeSelect.fadeOut().removeAttr('data-input-attribute');
                                break;
                            }
                        case "4":
                            { // traps
                                trapSelect.fadeIn().attr('data-input-type', '');
                                monsterCardSelect.fadeOut().removeAttr('data-input-monster-card');
                                monsterTypeSelect.fadeOut().removeAttr('data-input-monster-type');
                                spellSelect.fadeOut().removeAttr('data-input-type');
                                raceSelect.fadeOut().removeAttr('data-input-race');
                                attributeSelect.fadeOut().removeAttr('data-input-attribute');
                                break;
                            }
                    }
                });
                $('.searchButton').on('click', handleResults);
                $('.nameInput, .descInput').on('keyup', function() {
                    if ($(this).val().length >= 5) {
                        handleResults();
                    }
                });
                $('.searchResults').on('mouseenter', '.resultDiv:not(".exceededSearchNotif")', function() {
                    var id = $(this).attr('data-card-id');
                    $('.imgContainer').attr('src', imgDir + id + '.jpg');
                    $('.cardDescription').html(makeDescription(id));
                });
                $('.mainDeck').droppable({
                    drop: dropHandler("main")
                });
                $('.sideDeck').droppable({
                    drop: dropHandler("side")
                });
                $('.extraDeck').droppable({
                    drop: dropHandler("extra")
                });
            });
        });
    });
});

var imgDir = "http://ygopro.us/ygopro/pics/",
    thumbDir = imgDir + "thumbnail/",
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
        not: function(deck) {
            var keys = deckStorage.decks.keys(),
                arr = [];
            keys.forEach(function(key) {
                if (key !== deck) {
                    arr.push(deckStorage.decks[key]);
                }
            });
            return arr;
        },
        getDeck: function(deck) {
            return deckStorage.decks[deck];
        },
        addCard: function(deck, id) {
            deckStorage.decks[deck].push(id);
            return deckStorage.decks;
        },
        decks: {
            main: [],
            side: [],
            extra: []
        }
    };

function handleResults() {
    const SEARCH_HARD_CAP = 100;
    var monsterCardSelect = $('.monsterCardSelect'),
        monsterTypeSelect = $('.monsterTypeSelect'),
        monsterCardCheck = $('[data-input-monster-card]'),
        monsterTypeCheck = $('[data-input-monster-type]'),
        searchResults = $('.searchResults'),
        inputTypeCheck = $('[data-input-type]').val(),
        monsterCardValue = monsterCardSelect.val() || 0,
        monsterTypeValue = monsterTypeSelect.val() || 0,
        exceededSearchCap = false,
        exceededSearchArray = [],
        hiddenType,
        results,
        output = "";
    if (!inputTypeCheck || monsterCardCheck || monsterTypeCheck) {
        hiddenType = $('<input type="hidden" data-input-type>').appendTo($('.searchBlock:eq(0)')).val(1 + parseInt(monsterCardValue, 10) + parseInt(monsterTypeValue, 10));
    }
    results = applyFilters(generateQueryObject(), $('.banlistSelect').val(), lflist);
    if (results.length > SEARCH_HARD_CAP) {
        exceededSearchArray = results;
        exceededSearchCap = true;
        results = results.slice(0, SEARCH_HARD_CAP);
    }
    results.forEach(function(result, index) {
        output += '<div class="resultDiv row_' + index + '"><div class="thumbContainer"><img src="' + thumbDir + result.id + '.jpg"  data-card-id="' + result.id + '"' + (result.alias !== 0 ? ' data-card-alias="' + result.alias + '"' : '') + ' /></div><div class="descriptionContainer"><span class="name">' + result.name + '</span><br />';
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
    attachDnDEvent($('.resultDiv img', searchResults));
}

function makeDescription(id) {
    var targetCard,
        output = "";
    cards.forEach(function(card) {
        if (parseInt(id, 10) === card.id) {
            targetCard = card;
        }
    });
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
        helper: function() {
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
        }
    });
}

function dropHandler(target) {
    return function(event, ui) {
        var id = ui.helper.attr('data-card-alias') ? [ui.helper.attr('data-card-id'), ui.helper.attr('data-card-alias')] : ui.helper.attr('data-card-id'),
            targetDeck = deckStorage.getDeck(target),
            remainingDecks = deckStorage.not(target);
        if (addDeckLegal(id, targetDeck, targetDeck.maximumSize, lflist, $('.banlistSelect').val(), remainingDecks[0], remainingDecks[1])) {
            $('.' + target + 'Deck').append(ui.helper);
            deckStorage.addCard(target, id);
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
        output += '<span class="levels">'
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
    return result.filter(function(item) {
        return fNameDesc(item, txt, 1);
    });

}

function filterDesc(result, txt) {
    'use strict';
    return result.filter(function(item) {
        return fNameDesc(item, txt, 0);
    });

}

function filterType(result, type) {
    'use strict';
    return result.filter(function(item) {
        return fType(item, type);
    });

}

function filterAttribute(result, attribute) {
    'use strict';
    return result.filter(function(item) {
        return fAttrRace(item, attribute, 1);
    });

}

function filterRace(result, race) {
    'use strict';
    return result.filter(function(item) {
        return fAttrRace(item, race, 0);
    });

}

function filterSetcode(result, setcode) {
    'use strict';
    return result.filter(function(item) {
        return fSetcode(item, setcode);
    });

}

function filterAtk(result, atk, op) {
    'use strict';
    return result.filter(function(item) {
        return fAtkDef(item, atk, 1, op);
    });

}

function filterDef(result, def, op) {
    'use strict';
    return result.filter(function(item) {
        return fAtkDef(item, def, 0, op);
    });

}

function filterLevel(result, level, op) {
    'use strict';
    return result.filter(function(item) {
        return fLevel(item, level, op);
    });

}

function filterScale(result, scale, op) {
    'use strict';
    return result.filter(function(item) {
        return fScale(item, scale, op);
    });
}

function filterForbiddenLimited(result, selectedLimitation, placeholder, selectedBanlist, config) {
    return result.filter(function(card) {
        if (!(card.id in config[selectedBanlist]) && selectedLimitation === 3) {
            return true;
        }
        return (card.id in config[selectedBanlist] && config[selectedBanlist][card.id] === selectedLimitation);
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
    filters.forEach(function(filter) {
        retVal[filter] = $('[data-input-' + filter + ']').val() || null;
    });
    return retVal;
}

function addMainDeckLegal(id, md, sd, ed, flList, currentList) {
    return addDeckLegal(id, md, 60, flList, currentList, sd, ed);
}

function addSideDeckLegal(id, md, sd, ed, flList, currentList) {
    return addDeckLegal(id, sd, 15, flList, currentList, md, ed);
}

function addExtraDeckLegal(id, md, sd, ed, flList, currentList) {
    return addDeckLegal(id, ed, 15, flList, currentList, md, sd);
}

function addDeckLegal(id, targetDeck, targetDeckSize, flList, currentList, deck2, deck3) {
    function idMatches(value) {
        return ((id === value) || (id[1] !== undefined && id[1] === value) || (value[1] !== undefined && id === value[1]) || (id[1] !== undefined && id[1] === value[1]));
    }
    if (targetDeckSize <= targetDeck.length) {
        return false;
    }
    var matchingCopies = targetDeck.filter(idMatches).length + deck2.filter(idMatches).length + deck3.filter(idMatches).length;
    var maxCopies;
    if (id[1] === undefined) {
        maxCopies = flList[currentList][id];
    } else {
        maxCopies = flList[currentList][id[1]];
    }
    if (maxCopies === undefined) {
        maxCopies = 3;
    }
    return (matchingCopies < maxCopies);
}