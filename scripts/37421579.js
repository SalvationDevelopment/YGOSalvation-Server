/*jslint node : true*/
'use strict';

// Charubin the Fire Knight
module.exports = {
    id: 37421579,
    initial_effect: function initial_effect(card, duel, aux) {

        var effect = {},
            FUSION_MATERIALS = [
                36121917, // Monster Egg
                96851799 // Hinotama Soul
            ];
        effect = aux.fusionMonster(card, effect, FUSION_MATERIALS);

        card.registerEffect(effect);

        return card;
    }
};