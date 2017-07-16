/*jslint node : true*/
'use strict';

// Man-Eater Bug
module.exports = {
    id: 54652250,
    initial_effect: function initial_effect(card, duel, aux) {

        function operation(target) {
            if (!target) {
                return;
            }
            aux.destroy(duel, target);
        }



        function target() {
            var targetList = aux.query(duel).filterByLocation('MONSTERZONE');
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