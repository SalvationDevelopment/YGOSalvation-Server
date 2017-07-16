/*jslint node : true*/
'use strict';

// Gaia the Dragon Champion
module.exports = {
    id: 17881964,
    initial_effect: function initial_effect(card, duel, aux) {

        var effect = {},
            FUSION_MATERIALS = [
                6368038, // Gaia The Fierce Knight
                28279543 // Curse of Dragon
            ];
        effect = aux.fusionMonster(card, effect, FUSION_MATERIALS);

        card.registerEffect(effect);

        return card;
    }
};