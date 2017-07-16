/*jslint node : true*/
'use strict';

// Armed Ninja
module.exports = {
    id: 9076207,
    initial_effect: function initial_effect(card, duel, aux) {

        function operation(target) {
            // https://github.com/Fluorohydride/ygopro-scripts/blob/master/c9076207.lua
            // origial script has some checking in it I dont understand at the moment so skipping.

            if (!target) {
                return;
            }
            if (card.position === 'FaceDown') {
                duel.revealCallback(target, card.player, 'revealHandSingle');
                if (aux.isSpell(card)) {
                    aux.destroy(duel, target);
                }
            }


        }

        function filter() {
            return card.position === 'FaceDown' || aux.isSpell(card);
        }

        function target() {
            var targetList = aux.query(duel).filterByLocation('SPELLZONE').filter(filter);
            if (targetList.length === 0) {
                return;
            } else {
                duel.question({
                    player: card.player,
                    type: 'HINT_SELECTMSG',
                    options: targetList
                }, function (error, targetUID) {
                    var target = aux.query(duel).filterByID(targetUID);
                    operation(target);
                });
            }
        }
        var flipEffect = {
            SetDescription: aux.Stringid(33066139, 0),
            SetCategory: 'CATEGORY_DESTROY',
            SetProperty: 'EFFECT_FLAG_CARD_TARGET',
            SetType: ['EFFECT_TYPE_SINGLE', 'EFFECT_TYPE_FLIP'],
            SetTarget: target,
            SetOperation: operation
        };

        card.registerEffect(flipEffect);

        return card;
    }
};