/*jslint bitwise : true*/
var cards = [];
$.getJSON('http://ygopro.us/manifest/database.json', function (data) {
    cards = data;
});


function filterAttrRace(obj, num, at) {
    'use strict';
    var val = (at === 1) ? obj.Attribute : obj.Type;
    if (val === num) {
        return true;
    } else {
        return false;
    }
}


function filterSetcode(obj, sc) {
    'use strict';
    var val = obj.setcode,
        hexA = val.toString(16),
        hexB = sc.toString(16);
    if (val === sc || parseInt(hexA.substr(hexA.length - 4),16) === parseInt(hexB, 16) || parseInt(hexA.substr(hexA.length - 2),16) === parseInt(hexB, 16)|| (val >> 16).toString(16) === hexB) {
        return true;
    } else {
        return false;
    }
}

function filterLevel(obj, lv, op) {
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


function filterScale(obj, sc, op) {
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




function filterType(obj, ty) {
    'use strict';
    var val = obj['type'];
    if ((val & ty) > 0) {
        return true;
    } else {
        return false;
    }
}

function filterAtkDef(obj, num, ad, op) {
    'use strict';
    var val = (ad === 1) ? obj.atk : obj.def;
    if (op === 0) {
        if (val <= num) {
            return true;
        } else {
            return false;
        }
    } else if (op === 0) {
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

function filterNameDesc(obj, txt, nd) {
    'use strict';
    var val = (nd === 1) ? obj.name.toLowerCase() : obj['desc'].toLowerCase();
    if (val.includes(txt.toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

// Attempt to use FilterNameDesc with filter
function filterName(txt) {
    'use strict';
    var output = cards.filter(function (item) {
        filterNameDesc(item, txt, 1);
    });
    return output;
}