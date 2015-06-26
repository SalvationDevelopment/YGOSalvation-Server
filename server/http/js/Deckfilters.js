/*jslint bitwise : true*/
var cards = [];
$.getJSON('https://ygopro.us/manifest/database.json', function (data) {
    cards = data;
});


//Filters either attribute or race, depending on the value of AT.
//at =1 is attribute, Else it's race.
// Num is the value in the DB for a given attribute or race.
function fAttrRace(obj, num, at) {
    'use strict';
    var val = (at === 1) ? obj.Attribute : obj.Type;
    if (val === num) {
        return true;
    } else {
        return false;
    }
}

//SC is setcode in decimal. This handles all possible combinations.
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

//Lv is the level sought. OP is operation.
//OP =0 is LESS THAN OR EQUAL lv.
//OP =1 Is EQUALS lv.
// Else is HIGHER THAN OR EQUAL
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

// Same as Lv, but with SC as the Scale (Assumes Right=Left)
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


// Uses the monsters full Type value from DB to determine.
//works  either 1 by 1 or against the sum of Type filters.
function fType(obj, ty) {
    'use strict';
    var val = obj['type'];
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
// ND=1 is Name, else Desc. Checks if the TXT string is contained.
function fNameDesc(obj, txt, nd) {
    'use strict';
    var val = (nd === 1) ? obj.name.toLowerCase() : obj['desc'].toLowerCase();
    if (val.indexOf(txt.toLowerCase()) >= 0) {
        return true;
    } else {
        return false;
    }
}
//-----------------------
//FILTERS BEIGN HERE


// Filters cards that have 'txt' in their name.
function filterName(txt) {
    'use strict';
    var output = cards.filter(function (item) {
        return fNameDesc(item, txt, 1);
    });
    return output;
}

//Filters effect or flavor texts for the txt string
function filterDesc(txt) {
    'use strict';
    var output = cards.filter(function (item) {
        return fNameDesc(item, txt, 0);
    });
    return output;
}

// Returns all cards that have all the types input.
function filterType(type) {
    'use strict';
    var output = cards.filter(function (item) {
        return fType(item, type);
    });
    return output;
}

//Attribute must matcht he arg.
function filterAttribute(attribute) {
    'use strict';
    var output = cards.filter(function (item) {
        return fAttrRace(item, attribute, 1);
    });
    return output;
}

//Returns Cards whose race matches the arg.
function filterRace(race) {
    'use strict';
    var output = cards.filter(function (item) {
        return fAttrRace(item, race, 0);
    });
    return output;
}

//All cards that share at least 1 setcode with the arg.
function filteSetcode(setcode) {
    'use strict';
    var output = cards.filter(function (item) {
        return fSetCode(item, setcode);
    });
    return output;
}

//OP here functions just as in the previous function.
//OP=0 is LOWER THAN OR EQUAL to 
//OP=1 is EQUALS to 
//Else it's HIGHER THAN OR EQUAL
function filterAtk(atk, op) {
    'use strict';
    var output = cards.filter(function (item) {
        return fAtkDef(item, atk, 1, op);
    });
    return output;
}

//As above, but DEF
function filterDef(def, op) {
    'use strict';
    var output = cards.filter(function (item) {
        return fAtkDef(item, def, 0, op);
    });
    return output;
}

function filterLevel(level, op) {
    'use strict';
    var output = cards.filter(function (item) {
        return fLevel(item, level, op);
    });
    return output;
}

function filterScale(scale, op) {
    'use strict';
    var output = cards.filter(function (item) {
        return fScale(item, scale, op);
    });
    return output;
}
