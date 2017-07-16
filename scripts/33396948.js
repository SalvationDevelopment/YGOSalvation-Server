/*jslint node : true*/
'use strict';

// Exodia The Forbidden One
module.exports = {
    id: 33396948,
    initial_effect: function initial_effect(card, duel, aux) {

        // id valuses of Exodia for lookup.
        var exodia = [8124921, 44519536, 70903634, 7902349, 33396948],
            winningEffect = {
                SetType: ['EFFECT_TYPE_FIELD', 'EFFECT_TYPE_CONTINUOUS'],
                SetProperty: ['EFFECT_FLAG_UNCOPYABLE', 'EFFECT_FLAG_CANNOT_DISABLE', 'EFFECT_FLAG_DELAY'],
                SetCode: ['EVENT_TO_HAND'],
                SetRange: 'LOCATION_HAND'
            };

        /**
         * Determine if the given player has Exodia in hand
         * @param   {Number} player 
         * @returns {Boolean} if they won or not.
         */
        function determineWin(player) {
            // get players cards in hand.
            var hand = aux.query(duel).filterByLocation('HAND').filter(function (cardInHand) {
                    cardInHand.player = player;
                }),
                // See if at least one card in their hand is one of each exodia pieces.
                partsInHand = exodia.map(function (bodyPart) {
                    return hand.some(function (heldCard) {
                        return heldCard.id === bodyPart;
                    });
                });
            // condense that down to a boolean.
            return partsInHand.every(function (value) {
                return value;
            });
        }

        /**
         * Determin if a player has exodia, and apply win condition if so.
         * @returns {[[Type]]} [[Description]]
         */
        function operation() {
            // Get both players hand
            var player1HasExodia = determineWin(0),
                player2HasExodia = determineWin(1);

            if (!player1HasExodia && !player2HasExodia) {
                return;
            } else if (player1HasExodia && !player2HasExodia) {
                duel.win(0, 'WIN_REASON_EXODIA');
                return 0;
            } else if (!player1HasExodia && player2HasExodia) {
                duel.win(0, 'WIN_REASON_EXODIA');
                return 1;
            }
        }



        winningEffect.SetOperation = operation;
        card.registerEffect(winningEffect);

        return card;
    }
};