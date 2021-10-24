
/**global app, $*/

import { hey, listen } from './listener.service';
class ManualControls {
    constructor(store, primus) {
        
        this.primus = primus;
        this.manualActionReference = {};
        this.zonetargetingmode = '';
        return this;
    }

    clearCardReference() {
        app.duel.controls.enable({});
        app.duel.closeRevealer();
        app.refreshUI();
    }

    exclusionList(player, location, classValue) {
        var cardsOnField = app.duel.field.state.cards.filter(function (card) {
            return (orient(card.player) === player && card.location === location);
        }),
            selections = cardsOnField.map(function (card) {
                return '.cardselectionzone.p' + player + '.' + location + '.i' + card.index;
            });

        selections.forEach(function (cardzone) {
            $(cardzone).removeClass(classValue);
        });
        return {
            selections: selections,
            cardsOnField: cardsOnField
        };

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
            location: start.location,
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

    selectionzoneonclick(choice, zone) {
        if (this.overlaymode) {
            this.manualXYZSummon({
                location: 'MONSTERZONE',
                index: choice,
                player: window.orientation
            });
            return;
        }
        if (!this.zonetargetingmode) {
            return;
        }
        app.duel.closeRevealer();
        $('.cardselectionzone.p0').removeClass('card');
        $('.cardselectionzone.p0').removeClass('attackglow');
        if (this.zonetargetingmode === 'atk') {
            this.manualToAttack(choice);
        }
        if (this.zonetargetingmode === 'generic') {
            if (zone === 'GRAVE') {
                this.manualToGrave();
            } else {
                this.manualMoveGeneric(choice, zone);
            }

        }
        if (this.zonetargetingmode === 'def') {
            this.manualSetMonsterFaceUp(choice);
        }
        if (this.zonetargetingmode === 'normalatk') {
            this.manualNormalSummon(choice);
        }
        if (this.zonetargetingmode === 'normaldef') {
            this.manualSetMonster(choice);
        }
        if (this.zonetargetingmode === 'activate') {
            this.manualActivate(choice);
        }
        if (this.zonetargetingmode === 'set') {
            this.manualSetSpell(choice);
        }
        if (this.zonetargetingmode === 'token') {
            this.manualToken(choice);
        }


        this.zonetargetingmode = false;
        return;

    }

    startSpecialSummon(mode) {
        app.duel.closeRevealer();
        this.zonetargetingmode = mode;
        const player = 0;
        app.duel.select({
            zones: [
                { player, location: 'MONSTERZONE', index: 0 },
                { player, location: 'MONSTERZONE', index: 1 },
                { player, location: 'MONSTERZONE', index: 2 },
                { player, location: 'MONSTERZONE', index: 3 },
                { player, location: 'MONSTERZONE', index: 4 }
            ]
        });
        if (!this.legacyMode) {
            app.duel.select({
                zones: [
                    { player, location: 'MONSTERZONE', index: 0 },
                    { player, location: 'MONSTERZONE', index: 1 },
                    { player, location: 'MONSTERZONE', index: 2 },
                    { player, location: 'MONSTERZONE', index: 3 },
                    { player, location: 'MONSTERZONE', index: 4 },
                    { player, location: 'MONSTERZONE', index: 5 },
                    { player, location: 'MONSTERZONE', index: 6 }
                ]
            });
        }
        if (mode === 'generic') {
            if (this.legacyMode) {
                app.duel.select({
                    zones: [
                        { player, location: 'SPELLZONE', index: 0 },
                        { player, location: 'SPELLZONE', index: 1 },
                        { player, location: 'SPELLZONE', index: 2 },
                        { player, location: 'SPELLZONE', index: 3 },
                        { player, location: 'SPELLZONE', index: 4 }
                    ]
                });
            } else {
                app.duel.select({
                    zones: [
                        { player, location: 'SPELLZONE', index: 0 },
                        { player, location: 'SPELLZONE', index: 1 },
                        { player, location: 'SPELLZONE', index: 2 },
                        { player, location: 'SPELLZONE', index: 3 },
                        { player, location: 'SPELLZONE', index: 4 },
                        { player, location: 'SPELLZONE', index: 5 },
                        { player, location: 'SPELLZONE', index: 6 }
                    ]
                });
            }
        }

    }

    startSpellTargeting(mode) {
        'use strict';
        this.zonetargetingmode = mode;
        app.duel.closeRevealer();
        $('.cardselectionzone.p0.SPELLZONE').addClass('attackglow card');
        if (!this.legacyMode) {
            $('.cardselectionzone.p0.SPELLZONE.i6').removeClass('attackglow card');
            $('.cardselectionzone.p0.SPELLZONE.i7').removeClass('attackglow card');
        }
        $('.cardselectionzone.p0.SPELLZONE.i5').removeClass('attackglow card');
        this.exclusionList(0, 'SPELLZONE', 'attackglow');

    }

    startXYZSummon() {
        const viables = app.duel.field.state.cards.filter((card) => {
            return ((card.state.location === 'MONSTERZONE') && (card.state.player === window.orientation));
        });

        if (viables.length === 0) {
            return;
        }


        this.overlaymode = true;
        this.overlaylist = [this.manualActionReference];

        app.duel.select({
            zones: viables.map((card) => card.state)
        });
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
            location: 'BANISHED',
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

        return this.makeSpell(card, this.penL());
    }

    makePendulumZoneR(card) {

        return this.makeSpell(card, this.penR());
    }


    manualNextPhase(phase) {
        this.primus.write(({
            action: 'nextPhase',
            phase: phase,
            sound: 'soundphase'
        }));
        this.clearCardReference();

    }

    manualNextTurn() {
        this.primus.write({
            action: 'nextTurn'
        });
        this.clearCardReference();
    }

    manualChangeLifepoints(amount) {


        this.primus.write(({
            action: 'changeLifepoints',
            amount: amount,
            sound: 'soundchangeLifePoints'
        }));
        this.clearCardReference();
    }

    manualMoveCard(movement) {
        this.primus.write((movement));
        this.clearCardReference();
    }

    manualShuffleHand() {

        setTimeout(() => {
            this.primus.write(({
                action: 'shuffleHand',
                sound: 'soundcardShuffle'
            }));
            this.clearCardReference();
        });

    }



    manualDraw() {
        this.primus.write(({
            action: 'draw',
            sound: 'sounddrawCard'
        }));
        this.clearCardReference();
    }

    manualExcavateTop() {
        this.primus.write(({
            action: 'excavate',
            sound: 'sounddrawCard'
        }));
        this.clearCardReference();
    }

    manualShuffleDeck() {
        this.primus.write(({
            action: 'shuffleDeck',
            sound: 'soundcardShuffle'
        }));
        this.clearCardReference();
    }

    manualRevealTop() {
        this.primus.write(({
            action: 'revealTop'
        }));
        this.clearCardReference();
    }

    manualRevealBottom() {
        this.primus.write(({
            action: 'revealBottom'
        }));
        this.clearCardReference();
    }

    manualRevealDeck() {
        this.primus.write(({
            action: 'revealDeck'
        }));
        this.clearCardReference();
    }

    manualRevealExtra() {
        this.primus.write(({
            action: 'revealExtra'
        }));
        this.clearCardReference();
    }

    manualRevealExcavated() {
        this.primus.write(({
            action: 'revealExcavated'
        }));
        this.clearCardReference();
    }

    manualMill() {
        this.primus.write(({
            action: 'mill'
        }));
        this.clearCardReference();
    }


    manualMillRemovedCard() {
        this.primus.write(({
            action: 'millRemovedCard'
        }));
        this.clearCardReference();
    }

    manualMillRemovedCardFaceDown() {
        this.primus.write(({
            action: 'millRemovedCardFaceDown'
        }));
        this.clearCardReference();
    }

    manualViewDeck() {
        this.primus.write(({
            action: 'viewDeck'
        }));
        this.clearCardReference();
    }

    manualViewBanished() {
        this.primus.write(({
            action: 'viewBanished',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

    manualFlipDeck() {

        this.primus.write(({
            action: 'flipDeck'
        }));
        this.clearCardReference();
    }

    manualAddCounter() {

        this.primus.write(({
            action: 'addCounter',
            uid: this.manualActionReference.uid
        }));
        this.clearCardReference();
    }

    manualRemoveCounter() {

        this.primus.write(({
            action: 'removeCounter',
            uid: this.manualActionReference.uid
        }));
        this.clearCardReference();
    }




    manualAttack() {
        this.primus.write(({
            action: 'attack',
            source: this.manualActionReference,
            target: this.targetreference,
            sound: 'soundattack'
        }));
        this.attackmode = false;
        //$('.card.p1').removeClass('attackglow');
        this.clearCardReference();
    }

    manualAttackDirectly() {

        this.targetreference = {
            player: (orientSlot) ? 0 : 1,
            location: 'HAND',
            index: 0,
            position: 'FaceUp'
        };
        this.manualAttack();
    }

    manualTarget(target) {

        this.primus.write(({
            action: 'target',
            target: target
        }));
        this.targetmode = false;
        //$('.card').removeClass('targetglow');
        this.clearCardReference();
    }


    manualRemoveToken() {
        console.log(this.manualActionReference);
        this.primus.write(({
            action: 'removeToken',
            uid: this.manualActionReference.uid
        }));
        this.clearCardReference();
    }

    manualViewExtra() {


        this.primus.write(({
            action: 'viewExtra',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

    manualViewExcavated() {

        this.primus.write(({
            action: 'viewExcavated',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

    manualViewGrave() {

        this.primus.write(({
            action: 'viewGrave',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

    manualViewXYZMaterials() {

        this.primus.write(({
            action: 'viewXYZ',
            index: this.manualActionReference.index,
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

    manualSignalEffect() {

        this.primus.write(({
            action: 'effect',
            id: this.manualActionReference.id,
            player: this.manualActionReference.player,
            index: this.manualActionReference.index,
            location: this.manualActionReference.location,
            name : this.manualActionReference.name
        }));
        this.clearCardReference();
    }

    manualNormalSummon(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToAttack(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualSetMonster(index) {


        index = (index !== undefined) ? index : automaticZonePicker(this.manualActionReference.player, 'MONSTERZONE');
        var end = this.setMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToDefence() {


        var index = this.manualActionReference.index,
            end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToFaceDownDefence() {

        var index = this.manualActionReference.index,
            end = this.setMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToFaceUpDefence() {

        var index = this.manualActionReference.index,
            end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualSetMonsterFaceUp(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualMoveGeneric(index, zone) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var message = this.makeCardMovement(this.manualActionReference, {
            player: window.orientation,
            location: zone,
            position: this.manualActionReference.position,
            index
        });

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualActivate(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundactivateCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualActivateFieldSpell() {


        var end = this.makeFieldSpell(this.manualActionReference),
            message = this.makeCardMovement(this.manualActionReference, end);
        message.sound = 'soundactivateCard';
        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualActivateFieldSpellFaceDown() {


        var end = this.makeFieldSpellFaceDown(this.manualActionReference),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualSetSpell(index) {


        index = (index !== undefined) ? index : automaticZonePicker(this.manualActionReference.player, 'SPELLZONE');
        var end = this.setSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualSTFlipDown() {


        var index = this.manualActionReference.index,
            end = this.setSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundflipSummon';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualSTFlipUp() {


        var index = this.manualActionReference.index,
            end = this.makeSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundflipSummon';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToExcavate() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXCAVATED').length,
            end = this.makeHand(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.movelocation = 'EXCAVATED';
        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToExtra() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';

        message.moveposition = 'FaceDown';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualTake(message) {
        if (message.target.player !== window.orientation) {
            this.manualActionReference = message.target;
            if (message.choice === 'HAND') {
                this.manualMoveGeneric(message.target.index, 'HAND');
            } else {
                this.startSpecialSummon('generic');
            }
        }
    }

    manualToOpponent() {
        this.primus.write(({
            action: 'give',
            target: this.manualActionReference
        }));
        this.clearCardReference();
    }

    manualToOpponentsHand() {

        this.primus.write(({
            action: 'give',
            target: this.manualActionReference,
            choice: 'HAND'
        }));
        this.clearCardReference();
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
        this.clearCardReference();
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
            this.clearCardReference();
        }, 300);

    }

    manualSlideRight() {


        var index = this.manualActionReference.index + 1,
            end = JSON.parse(JSON.stringify(this.manualActionReference)),
            message = this.makeCardMovement(this.manualActionReference, end);

        if (index === (this.legacyMode) ? 7 : 5) {
            index = 0;
        }
        message.moveindex = index;
        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
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
        this.clearCardReference();
    }

    manualOverlay() {

        var overlayindex = 0;
        this.revealcache.forEach((card, index) => {
            if (index === revealcacheIndex) {
                return;
            }
            overlayindex += 1;
            var message = this.makeCardMovement(card, card);
            message.overlayindex = overlayindex;
            message.action = 'moveCard';
            this.primus.write((message));
            this.clearCardReference();
        });
    }

    manualXYZSummon(target) {

        this.overlaymode = false;
        this.overlaylist.push(target);



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
                this.clearCardReference();
            });
        }, 1000);
    }


    manualToGrave() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.GRAVE').length,
            end = this.makeGrave(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToOpponentsGrave() {

        var moveplayer = (this.manualActionReference.player) ? 0 : 1,
            index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.GRAVE').length,
            end = this.makeGrave(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.moveplayer = moveplayer;
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToRemoved() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.BANISHED').length,
            end = this.makeRemoved(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.primus.write((message));
        this.clearCardReference();
    }



    manualToExtraFaceUp() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.moveposition = 'FaceUp';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToHand() {

        if (cardIs('fusion', this.manualActionReference) || cardIs('synchro', this.manualActionReference) || cardIs('xyz', this.manualActionReference) || cardIs('link', this.manualActionReference)) {
            this.manualToExtra();
            return;
        }
        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.HAND').length,
            end = this.makeHand(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.clearCardReference();
        this.primus.write((message));
    }

    manualToExtra() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';

        message.moveposition = 'FaceDown';
        this.primus.write((message));
        this.clearCardReference();
    }

    manualToRemovedFacedown() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.BANISHED').length,
            end = this.makeRemoved(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);
        message.action = 'moveCard';
        message.moveposition = 'FaceDown';
        this.primus.write((message));
        this.clearCardReference();
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
        this.clearCardReference();
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
        this.clearCardReference();
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
        this.clearCardReference();
    }

    manualRevealHandSingle() {


        this.primus.write(({
            action: 'revealHandSingle',
            card: this.manualActionReference
        }));
        this.clearCardReference();
    }

    manualRevealHand() {


        this.primus.write(({
            action: 'revealHand',
            card: this.manualActionReference
        }));
        this.clearCardReference();
    }

    manualRevealExtraDeckRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length));


        this.primus.write(({
            action: 'reveal',
            card: card
        }));
        this.clearCardReference();
    }

    manualRevealExcavatedRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXCAVATED').length));


        this.primus.write(({
            action: 'reveal',
            card: card
        }));
        this.clearCardReference();
    }

    manualRevealDeckRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.DECK').length));


        this.primus.write(({
            action: 'reveal',
            card: card
        }));
        this.clearCardReference();
    }


    manualToken(index, id) {

        var card = {};
        card.player = window.orientation;
        card.location = 'MONSTERZONE';
        card.position = 'FaceUpDefence';
        card.id = id || parseInt($('#tokendropdown').val(), 10);
        card.index = index;
        card.action = 'makeToken';
        this.primus.write((card));
        this.clearCardReference();
    }

    manualRoll() {
        this.primus.write(({
            action: 'rollDie',
            name: localStorage.nickname
        }));
        this.clearCardReference();
    }

    manualFlip() {
        this.primus.write(({
            action: 'flipCoin',
            name: localStorage.nickname
        }));
        this.clearCardReference();
    }

    manualRPS() {
        this.primus.write(({
            action: 'rps',
            name: localStorage.nickname
        }));
        this.clearCardReference();
    }

}