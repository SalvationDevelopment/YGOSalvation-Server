/*jslint node : true*/
'use strict';

// Dark Hole
module.exports = {
    id: 53129443,
    initial_effect: function initial_effect(card, duel, aux) {
       
        function operation(target) {
            target.forEach(function(targetCard){
            aux.destroy(duel, targetCard);
        }
    }
        
        
        function target(){
            var targetList = aux.query(duel).filterByLocation('MONSTERZONE');
            return targetList;
        }
        var effect = {
            SetDescription: aux.Stringid(53129443, 0),
            SetCategory: 'CATEGORY_DESTROY',
            SetType: ['EFFECT_TYPE_SINGLE'],
            SetOperation: operation
        }
        
        card.registerEffect(effect);

        return card;
    }
}