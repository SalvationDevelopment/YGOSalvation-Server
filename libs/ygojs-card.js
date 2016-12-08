/*jslint node : true*/
'use strict';

// Based on https://github.com/Fluorohydride/ygopro-core/blob/master/libcard.cpp


function get_code(card) {

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