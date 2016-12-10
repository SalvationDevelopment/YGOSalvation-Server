/*jslint node : true*/
'use strict';

// Based on https://github.com/Fluorohydride/ygopro-core/blob/master/libcard.cpp


function get_code(card) {
    var temp = card.temp;
    if (card.assume_code) {
        return card.assume_value;
    }
    if (temp.code !== 0xffffffff) {
        return temp.code;
    }
    return card.code;
}

function get_another_code() {}

function libcard(state) {

    function card_get_code(card) {
        var pcard = state.uidLookup(card),
            code = get_code(card),
            otcode = get_another_code(pcard);
        return [code, otcode];
    }

    return {
        card_get_code: card_get_code
    };
}