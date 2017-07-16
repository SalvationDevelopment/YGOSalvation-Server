/*jslint node : true*/
'use strict';

// Legendary Sword
module.exports = {
    id: 61854111,
    initial_effect: function initial_effect(card, duel, aux) {

        var equipEffect,
            increaseATKEffect,
            increaseDEFEffect;

        function filter(target) {
            return target.race === aux.getRace('WARRIOR');
        }

        function operation(target) {
            if (aux.isFaceup(target)) {
                aux.equip(target, card);
            }
        }

        function target() {
            var targetList = aux.query(duel).filterByLocation('MONSTERZONE').filter(filter);
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


        equipEffect = {
            SetCategory: 'CATEGORY_EQUIP',
            SetType: 'EFFECT_TYPE_ACTIVATE',
            SetCode: 'EVENT_FREE_CHAIN',
            SetProperty: 'EFFECT_FLAG_CARD_TARGET',
            SetTarget: target,
            SetOperation: operation
        };

        increaseATKEffect = {
            SetCategory: 'CATEGORY_EQUIP',
            SetType: 'EFFECT_TYPE_EQUIP',
            SetCode: 'EFFECT_UPDATE_ATTACK',
            SetValue: 300
        };

        increaseDEFEffect = {
            SetCategory: 'CATEGORY_EQUIP',
            SetType: 'EFFECT_TYPE_EQUIP',
            SetCode: 'EFFECT_UPDATE_DEFENSE',
            SetValue: 300
        };

        card.registerEffect(equipEffect);
        card.registerEffect(increaseATKEffect);
        card.registerEffect(increaseDEFEffect);

        return card;
    }
};