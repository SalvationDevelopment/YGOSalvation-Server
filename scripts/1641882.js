/*jslint node : true*/
'use strict';

// Fusionist
module.exports = {
    id: 1641882,
    initial_effect: function initial_effect(card, duel, aux) {

        var effect = {},
            FUSION_MATERIALS = [
                38142739, // Petit Angel
                83464209 // Mystical Sheep #2
            ];
        effect = aux.fusionMonster(card, effect, FUSION_MATERIALS);

        card.registerEffect(effect);

        return card;
    }
};