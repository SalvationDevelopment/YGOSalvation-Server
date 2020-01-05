class ManualControls {
    constructor(store, primus) {
        this.store = store;
        this.primus = primus;
        this.manualActionReference = {};
        return this;
    }

    makeCardMovement(start, end) {
        
        if (end.position === undefined) {
            end.position = start.position;
        }
        if (end.overlayindex === undefined) {
            end.overlayindex = 0;
        }
        if (end.isBecomingCard === undefined) {
            end.isBecomingCard = false;
        }
        if (end.index === undefined) {
            end.index = start.index;
        }
        return {
            code: start.code,
            player: start.player,
            clocation: start.location,
            index: start.index,
            moveplayer: end.player,
            movelocation: end.location,
            moveindex: end.index,
            moveposition: end.position,
            overlayindex: end.overlayindex,
            isBecomingCard: end.isBecomingCard,
            uid: start.uid
        };
    }
    
    makeMonster(card, index) {

        return {
            player: card.player,
            location: 'MONSTERZONE',
            index: index,
            position: 'FaceUpAttack',
            overlayindex: 0,
            isBecomingCard: false
        };
    }

    makeSpell(card, index) {

        return {
            player: card.player,
            location: 'SPELLZONE',
            index: index,
            position: 'FaceUp',
            overlayindex: 0,
            isBecomingCard: false
        };
    }

    makeHand(card, index) {

        return {
            player: card.player,
            location: 'HAND',
            index: index,
            position: 'FaceUp',
            overlayindex: 0,
            isBecomingCard: false
        };
    }

    makeDeckCard(card, index) {

        return {
            player: card.player,
            location: 'DECK',
            index: index,
            position: 'FaceDown',
            overlayindex: 0,
            isBecomingCard: false
        };
    }

    makeExtra(card, index) {
        return {
            player: card.player,
            location: 'EXTRA',
            index: index,
            position: 'FaceDown',
            overlayindex: 0,
            isBecomingCard: false
        };
    }

    makeGrave(card, index) {

        return {
            player: card.player,
            location: 'GRAVE',
            index: index,
            position: 'FaceUp',
            overlayindex: 0,
            isBecomingCard: false
        };
    }

    makeRemoved(card, index) {

        return {
            player: card.player,
            location: 'REMOVED',
            index: index,
            position: 'FaceUp',
            overlayindex: 0,
            isBecomingCard: false
        };
    }

    setMonster(card, index) {

        var end = this.makeMonster(card, index);
        end.position = 'FaceDownDefence';
        return end;
    }

    defenceMonster(card, index) {

        var end = this.makeMonster(card, index);
        end.position = 'FaceUpDefence';
        return end;
    }

    setSpell(card, index) {

        var end = this.makeSpell(card, index);
        end.position = 'FaceDown';
        return end;
    }

    makeFieldSpell(card) {

        return this.makeSpell(card, 5);
    }

    makeFieldSpellFaceDown(card) {

        var end = this.setSpell(card, 5);
        return end;
    }

    makePendulumZoneL(card) {

        return this.makeSpell(card, penL());
    }

    makePendulumZoneR(card) {

        return this.makeSpell(card, penR());
    }


    manualNextPhase(phase) {

        this.primus.write(({
            action: 'nextPhase',
            phase: phase,
            sound: 'soundphase'
        }));
    }

    manualNextTurn() {

        this.primus.write({
            action: 'nextTurn'
        });
    }

    manualChangeLifepoints(amount) {

        this.primus.write(({
            action: 'changeLifepoints',
            amount: amount,
            sound: 'soundchangeLifePoints'
        }));
    }

    manualMoveCard(movement) {

        this.primus.write((movement));
    }

    manualShuffleHand() {

        setTimeout(() => {
            this.primus.write(({
                action: 'shuffleHand',
                sound: 'soundcardShuffle'
            }));
        });

    }



    manualDraw() {

        this.primus.write(({
            action: 'draw',
            sound: 'sounddrawCard'
        }));
    }

    manualExcavateTop() {

        this.primus.write(({
            action: 'excavate',
            sound: 'sounddrawCard'
        }));
    }

    manualShuffleDeck() {

        this.primus.write(({
            action: 'shuffleDeck',
            sound: 'soundcardShuffle'
        }));
    }

    manualRevealTop() {

        this.primus.write(({
            action: 'revealTop'
        }));
    }

    manualRevealBottom() {

        this.primus.write(({
            action: 'revealBottom'
        }));
    }

    manualRevealDeck() {

        this.primus.write(({
            action: 'revealDeck'
        }));
    }

    manualRevealExtra() {

        this.primus.write(({
            action: 'revealExtra'
        }));
    }

    manualRevealExcavated() {

        this.primus.write(({
            action: 'revealExcavated'
        }));
    }

    manualMill() {

        this.primus.write(({
            action: 'mill'
        }));
    }


    manualMillRemovedCard() {

        this.primus.write(({
            action: 'millRemovedCard'
        }));
    }

    manualMillRemovedCardFaceDown() {

        this.primus.write(({
            action: 'millRemovedCardFaceDown'
        }));
    }

    manualViewDeck() {

        this.primus.write(({
            action: 'viewDeck'
        }));
    }

    manualViewBanished() {

        this.primus.write(({
            action: 'viewBanished',
            player: this.manualActionReference.player
        }));
    }

    manualFlipDeck() {

        this.primus.write(({
            action: 'flipDeck'
        }));
    }

    manualAddCounter() {

        this.primus.write(({
            action: 'addCounter',
            uid: this.manualActionReference.uid
        }));
    }

    manualRemoveCounter() {

        this.primus.write(({
            action: 'removeCounter',
            uid: this.manualActionReference.uid
        }));
    }




    manualAttack() {

        this.primus.write(({
            action: 'attack',
            source: this.manualActionReference,
            target: targetreference,
            sound: 'soundattack'
        }));
        attackmode = false;
        //$('.card.p1').removeClass('attackglow');
    }

    manualAttackDirectly() {

        targetreference = {
            player: (orientSlot) ? 0 : 1,
            location: 'HAND',
            index: 0,
            position: 'FaceUp'
        };
        manualAttack();
    }

    manualTarget(target) {

        this.primus.write(({
            action: 'target',
            target: target
        }));
        targetmode = false;
        //$('.card').removeClass('targetglow');
    }


    manualRemoveToken() {

        this.primus.write(({
            action: 'removeToken',
            uid: this.manualActionReference.uid
        }));
    }

    manualViewExtra() {

        this.primus.write(({
            action: 'viewExtra',
            player: this.manualActionReference.player
        }));
    }

    manualViewExcavated() {

        this.primus.write(({
            action: 'viewExcavated',
            player: this.manualActionReference.player
        }));
    }

    manualViewGrave() {

        this.primus.write(({
            action: 'viewGrave',
            player: this.manualActionReference.player
        }));
    }

    manualViewXYZMaterials() {

        this.primus.write(({
            action: 'viewXYZ',
            index: this.manualActionReference.index,
            player: this.manualActionReference.player
        }));
    }

    manualSignalEffect() {


        this.primus.write(({
            action: 'effect',
            id: this.manualActionReference.id,
            player: this.manualActionReference.player,
            index: this.manualActionReference.index,
            location: this.manualActionReference.location
        }));
    }

    manualNormalSummon(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
    }

    manualToAttack(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
    }

    manualsetMonster(index) {


        index = (index !== undefined) ? index : automaticZonePicker(this.manualActionReference.player, 'MONSTERZONE');
        var end = this.setMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
    }

    manualToDefence() {


        var index = this.manualActionReference.index,
            end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualToFaceDownDefence() {


        var index = this.manualActionReference.index,
            end = this.setMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualToFaceUpDefence() {


        var index = this.manualActionReference.index,
            end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualsetMonsterFaceUp(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
    }

    manualActivate(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundactivateCard';
        this.primus.write((message));
    }

    manualActivateFieldSpell() {


        var end = this.makeFieldSpell(this.manualActionReference),
            message = this.makeCardMovement(this.manualActionReference, end);
        message.sound = 'soundactivateCard';
        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualActivateFieldSpellFaceDown() {


        var end = this.makeFieldSpellFaceDown(this.manualActionReference),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.primus.write((message));
    }

    manualsetSpell(index) {


        index = (index !== undefined) ? index : automaticZonePicker(this.manualActionReference.player, 'SPELLZONE');
        var end = this.setSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.primus.write((message));
    }

    manualSTFlipDown() {


        var index = this.manualActionReference.index,
            end = this.setSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundflipSummon';
        this.primus.write((message));
    }

    manualSTFlipUp() {


        var index = this.manualActionReference.index,
            end = this.makeSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundflipSummon';
        this.primus.write((message));
    }

    manualToExcavate() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXCAVATED').length,
            end = this.makeHand(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.movelocation = 'EXCAVATED';
        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualToExtra() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';

        message.moveposition = 'FaceDown';
        this.primus.write((message));
    }

    manualToOpponent() {

        this.primus.write(({
            action: 'give',
            target: this.manualActionReference
        }));
    }

    manualToOpponentsHand() {

        this.primus.write(({
            action: 'give',
            target: this.manualActionReference,
            choice: 'HAND'
        }));
    }

    manualToTopOfDeck() {

        if (cardIs('fusion', this.manualActionReference) || cardIs('synchro', this.manualActionReference) || cardIs('xyz', this.manualActionReference) || cardIs('link', this.manualActionReference)) {
            manualToExtra();
            return;
        }
        if (cardIs('fusion', this.manualActionReference) || cardIs('synchro', this.manualActionReference) || cardIs('xyz', this.manualActionReference) || cardIs('link', this.manualActionReference)) {
            manualToExtra();
            return;
        }
        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.DECK').length,
            end = this.makeDeckCard(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualToBottomOfDeck() {


        this.primus.write(({
            action: 'offsetDeck'
        }));
        var index = 0,
            end = this.makeDeckCard(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        setTimeout(() => {
            this.primus.write((message));
        }, 300);

    }

    manualSlideRight() {


        var index = this.manualActionReference.index + 1,
            end = JSON.parse(JSON.stringify(this.manualActionReference)),
            message = this.makeCardMovement(this.manualActionReference, end);

        if (index === (legacyMode) ? 7 : 5) {
            index = 0;
        }
        message.moveindex = index;
        message.action = 'moveCard';
        this.primus.write((message));
    }


    manualSlideLeft() {


        var index = this.manualActionReference.index - 1,
            end = JSON.parse(JSON.stringify(this.manualActionReference)),
            message = this.makeCardMovement(this.manualActionReference, end);

        if (index === -1) {
            index = (legacyMode) ? 6 : 4;
            index = (legacyMode) ? 6 : 4;
        }
        message.moveindex = index;
        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualOverlay() {

        var overlayindex = 0;
        revealcache.forEach((card, index) => {
            if (index === revealcacheIndex) {
                return;
            }
            overlayindex += 1;
            var message = this.makeCardMovement(card, card);
            message.overlayindex = overlayindex;
            message.action = 'moveCard';
            this.primus.write((message));
        });
    }

    manualXYZSummon(target) {

        overlaymode = false;
        overlaylist.push(target);
        $('.card').removeClass('targetglow');


        var index = target.index,
            end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
        setTimeout(() => {
            var overlayindex = 0;
            overlaylist.forEach((card, cindex) => {
                overlayindex += 1;
                var message = this.makeCardMovement(card, card);
                message.overlayindex = overlayindex;
                message.action = index;
                message.action = 'moveCard';
                this.primus.write((message));
            });
        }, 1000);
    }


    manualToGrave() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.GRAVE').length,
            end = this.makeGrave(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualToOpponentsGrave() {

        var moveplayer = (this.manualActionReference.player) ? 0 : 1,
            index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.GRAVE').length,
            end = this.makeGrave(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.moveplayer = moveplayer;
        this.primus.write((message));
    }

    manualToRemoved() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.REMOVED').length,
            end = this.makeRemoved(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
    }



    manualToExtraFaceUp() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.moveposition = 'FaceUp';
        this.primus.write((message));
    }

    manualToHand() {

        if (cardIs('fusion', this.manualActionReference) || cardIs('synchro', this.manualActionReference) || cardIs('xyz', this.manualActionReference) || cardIs('link', this.manualActionReference)) {
            manualToExtra();
            return;
        }
        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.HAND').length,
            end = this.makeHand(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
    }

    manualToExtra() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';

        message.moveposition = 'FaceDown';
        this.primus.write((message));
    }

    manualToRemovedFacedown() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.REMOVED').length,
            end = this.makeRemoved(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);
        message.action = 'moveCard';
        message.moveposition = 'FaceDown';
        this.primus.write((message));
    }

    manualActivateField() {

        if ($('#automationduelfield .p' + orient(this.manualActionReference.player) + '.SPELLZONE.i5').length) {
            return;
        }
        var end = this.makeSpell(this.manualActionReference, 5),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.primus.write((message));
    }

    manualToPZoneL() {


        if ($('#automationduelfield .p' + orient(this.manualActionReference.player) + '.SPELLZONE.i' + penL()).length) {
            return;
        }
        var end = this.makeSpell(this.manualActionReference, penL()),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.primus.write((message));
    }

    manualToPZoneR() {

        if ($('#automationduelfield .p' + orient(this.manualActionReference.player) + '.SPELLZONE.i' + penR()).length) {
            return;
        }
        var end = this.makeSpell(this.manualActionReference, penR()),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.primus.write((message));
    }

    manualRevealHandSingle() {

        this.primus.write(({
            action: 'revealHandSingle',
            card: this.manualActionReference
        }));
    }

    manualRevealHand() {

        this.primus.write(({
            action: 'revealHand',
            card: this.manualActionReference
        }));
    }

    manualRevealExtraDeckRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length));

        this.primus.write(({
            action: 'reveal',
            card: card
        }));
    }

    manualRevealExcavatedRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXCAVATED').length));

        this.primus.write(({
            action: 'reveal',
            card: card
        }));
    }

    manualRevealDeckRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.DECK').length));

        this.primus.write(({
            action: 'reveal',
            card: card
        }));
    }


     manualToken(index, id) {
        
        var card = {};
        card.player = orientSlot;
        card.location = 'MONSTERZONE';
        card.position = 'FaceUpDefence';
        card.id = id;
        card.index = index;
        card.action = 'makeToken';
        this.primus.write((card));
    }

     manualRoll() {
        
        this.primus.write(({
            action: 'rollDie',
            name: localStorage.nickname
        }));
    }
    
     manualFlip() {
        
        this.primus.write(({
            action: 'flipCoin',
            name: localStorage.nickname
        }));
    }
    
     manualRPS() {
        
        this.primus.write(({
            action: 'rps',
            name: localStorage.nickname
        }));
    }
    
}