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
                    monsterSelect = $('.monsterSelect'),
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
                                monsterSelect.fadeOut();
                                spellSelect.fadeOut();
                                trapSelect.fadeOut();
                                raceSelect.fadeOut().removeAtr('data-input-race');
                                attributeSelect.fadeOut().removeAttr('data-input-attribute');
                                $('[data-input-type]').removeAttr('data-input-type');
                                break;
                            }
                        case "1":
                            { // monster
                                monsterSelect.fadeIn().attr('data-input-type', '');
                                spellSelect.fadeOut().removeAttr('data-input-type');
                                trapSelect.fadeOut().removeAttr('data-input-type');
                                raceSelect.fadeIn().attr('data-input-race', '');
                                attributeSelect.fadeIn().attr('data-input-attribute', '');
                                break;
                            }
                        case "2":
                            { // spell
                                spellSelect.fadeIn().attr('data-input-type', '');
                                monsterSelect.fadeOut().removeAttr('data-input-type');
                                trapSelect.fadeOut().removeAttr('data-input-type');
                                raceSelect.fadeOut().removeAttr('data-input-race');
                                attributeSelect.fadeOut().removeAttr('data-input-attribute');
                                break;
                            }
                        case "4":
                            { // traps
                                trapSelect.fadeIn().attr('data-input-type', '');
                                monsterSelect.fadeOut().removeAttr('data-input-type');
                                spellSelect.fadeOut().removeAttr('data-input-type');
                                raceSelect.fadeOut().removeAttr('data-input-race');
                                attributeSelect.fadeOut().removeAttr('data-input-attribute');
                                break;
                            }
                    }
                });
            });
        });
    });
});

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
    if ((val & ty) == ty) {
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
