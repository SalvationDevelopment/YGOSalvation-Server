/*jslint node : true*/
'use strict';

// Flame Ghost
module.exports = {
    id: 58528964,
    initial_effect: function initial_effect(card, duel, aux) {

        var effect = {},
            FUSION_MATERIALS = [
                32274490, // Skull Servant
                40826495 // Dissolverock
            ];
        effect = aux.fusionMonster(card, effect, FUSION_MATERIALS);

        card.registerEffect(effect);

        return card;
    }
};