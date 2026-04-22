
/**global app, $*/

import { emit, on } from './listener.service';
import { cardIs } from '../util/cardManipulation';

export default class ManualControls {
            /**
     * Initializes a new Manual instance and prepares its internal state.
     * @param {Object} store The store value provides an input used by the manual module.
     * @param {Object} ws The ws value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    constructor(store, ws) {
        
        this.ws = ws;
        this.manualActionReference = {};
        this.zonetargetingmode = '';
        return this;
    }

            /**
     * Clears card reference used by the manual module.
     * @returns {void} Does not return a value.
     */
    clearCardReference() {
        app.duel.controls.enable({});
        app.duel.closeRevealer();
        emit({ action: 'RENDER' });
    }

            /**
     * Executes the exclusion list helper used by the manual module.
     * @param {(string|number)} player The player value provides an input used by the manual module.
     * @param {(string|number)} location The location value provides an input used by the manual module.
     * @param {string} classValue The classValue value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Makes card movement used by the manual module.
     * @param {Object} start The start object supplies the structured input used by the manual module, including the `code`, `index`, `location`, `player`, `position`, and `uid` properties.
     * @param {string} start.code The `code` property supplies structured input used by the manual module.
     * @param {number} start.index The `index` property supplies structured input used by the manual module.
     * @param {string} start.location The `location` property supplies structured input used by the manual module.
     * @param {number} start.player The `player` property supplies structured input used by the manual module.
     * @param {string} start.position The `position` property supplies structured input used by the manual module.
     * @param {string} start.uid The `uid` property supplies structured input used by the manual module.
     * @param {Object} end The end object supplies the structured input used by the manual module, including the `index`, `isBecomingCard`, `location`, `overlayindex`, `player`, and `position` properties.
     * @param {number} end.index The `index` property supplies structured input used by the manual module.
     * @param {boolean} end.isBecomingCard The `isBecomingCard` property supplies structured input used by the manual module.
     * @param {string} end.location The `location` property supplies structured input used by the manual module.
     * @param {number} end.overlayindex The `overlayindex` property supplies structured input used by the manual module.
     * @param {number} end.player The `player` property supplies structured input used by the manual module.
     * @param {string} end.position The `position` property supplies structured input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Selects ionzoneonclick used by the manual module.
     * @param {number} choice The choice value provides an input used by the manual module.
     * @param {string} zone The zone value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
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

            /**
     * Starts special summon used by the manual module.
     * @param {string} mode The mode value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
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

            /**
     * Starts spell targeting used by the manual module.
     * @param {string} mode The mode value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
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

            /**
     * Starts xyzsummon used by the manual module.
     * @returns {void} Does not return a value.
     */
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

            /**
     * Makes monster used by the manual module.
     * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
     * @param {number} card.player The `player` property supplies structured input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Makes spell used by the manual module.
     * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
     * @param {number} card.player The `player` property supplies structured input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Makes hand used by the manual module.
     * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
     * @param {number} card.player The `player` property supplies structured input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Makes deck card used by the manual module.
     * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
     * @param {number} card.player The `player` property supplies structured input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Makes extra used by the manual module.
     * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
     * @param {number} card.player The `player` property supplies structured input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Makes grave used by the manual module.
     * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
     * @param {number} card.player The `player` property supplies structured input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Makes removed used by the manual module.
     * @param {Object} card The card object supplies the structured input used by the manual module, including the `player` property.
     * @param {number} card.player The `player` property supplies structured input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
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

            /**
     * Sets monster used by the manual module.
     * @param {Object} card The card value provides an input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
    setMonster(card, index) {

        var end = this.makeMonster(card, index);
        end.position = 'FaceDownDefence';
        return end;
    }

            /**
     * Executes the defence monster helper used by the manual module.
     * @param {Object} card The card value provides an input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
    defenceMonster(card, index) {

        var end = this.makeMonster(card, index);
        end.position = 'FaceUpDefence';
        return end;
    }

            /**
     * Sets spell used by the manual module.
     * @param {Object} card The card value provides an input used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
    setSpell(card, index) {

        var end = this.makeSpell(card, index);
        end.position = 'FaceDown';
        return end;
    }

            /**
     * Makes field spell used by the manual module.
     * @param {Object} card The card value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
    makeFieldSpell(card) {

        return this.makeSpell(card, 5);
    }

            /**
     * Makes field spell face down used by the manual module.
     * @param {Object} card The card value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
    makeFieldSpellFaceDown(card) {

        var end = this.setSpell(card, 5);
        return end;
    }

            /**
     * Makes pendulum zone l used by the manual module.
     * @param {Object} card The card value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
    makePendulumZoneL(card) {

        return this.makeSpell(card, this.penL());
    }

            /**
     * Makes pendulum zone r used by the manual module.
     * @param {Object} card The card value provides an input used by the manual module.
     * @returns {Object} Returns the value produced by the manual module.
     */
    makePendulumZoneR(card) {

        return this.makeSpell(card, this.penR());
    }


            /**
     * Executes the manual next phase helper used by the manual module.
     * @param {string} phase The phase value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualNextPhase(phase) {
        this.ws.write(({
            action: 'nextPhase',
            phase: phase,
            sound: 'soundphase'
        }));
        this.clearCardReference();

    }

            /**
     * Executes the manual next turn helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualNextTurn() {
        this.ws.write({
            action: 'nextTurn'
        });
        this.clearCardReference();
    }

            /**
     * Executes the manual change lifepoints helper used by the manual module.
     * @param {number} amount The amount value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualChangeLifepoints(amount) {


        this.ws.write(({
            action: 'changeLifepoints',
            amount: amount,
            sound: 'soundchangeLifePoints'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual move card helper used by the manual module.
     * @param {Object} movement The movement value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualMoveCard(movement) {
        this.ws.write((movement));
        this.clearCardReference();
    }

            /**
     * Executes the manual shuffle hand helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualShuffleHand() {

        setTimeout(() => {
            this.ws.write(({
                action: 'shuffleHand',
                sound: 'soundcardShuffle'
            }));
            this.clearCardReference();
        });

    }



            /**
     * Executes the manual draw helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualDraw() {
        this.ws.write(({
            action: 'draw',
            sound: 'sounddrawCard'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual excavate top helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualExcavateTop() {
        this.ws.write(({
            action: 'excavate',
            sound: 'sounddrawCard'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual shuffle deck helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualShuffleDeck() {
        this.ws.write(({
            action: 'shuffleDeck',
            sound: 'soundcardShuffle'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal top helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealTop() {
        this.ws.write(({
            action: 'revealTop'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal bottom helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealBottom() {
        this.ws.write(({
            action: 'revealBottom'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal deck helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealDeck() {
        this.ws.write(({
            action: 'revealDeck'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal extra helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealExtra() {
        this.ws.write(({
            action: 'revealExtra'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal excavated helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealExcavated() {
        this.ws.write(({
            action: 'revealExcavated'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual mill helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualMill() {
        this.ws.write(({
            action: 'mill'
        }));
        this.clearCardReference();
    }


            /**
     * Executes the manual mill removed card helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualMillRemovedCard() {
        this.ws.write(({
            action: 'millRemovedCard'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual mill removed card face down helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualMillRemovedCardFaceDown() {
        this.ws.write(({
            action: 'millRemovedCardFaceDown'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual view deck helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualViewDeck() {
        this.ws.write(({
            action: 'viewDeck'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual view banished helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualViewBanished() {
        this.ws.write(({
            action: 'viewBanished',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual flip deck helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualFlipDeck() {

        this.ws.write(({
            action: 'flipDeck'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual add counter helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualAddCounter() {

        this.ws.write(({
            action: 'addCounter',
            uid: this.manualActionReference.uid
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual remove counter helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRemoveCounter() {

        this.ws.write(({
            action: 'removeCounter',
            uid: this.manualActionReference.uid
        }));
        this.clearCardReference();
    }




            /**
     * Executes the manual attack helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualAttack() {
        this.ws.write(({
            action: 'attack',
            source: this.manualActionReference,
            target: this.targetreference,
            sound: 'soundattack'
        }));
        this.attackmode = false;
        //$('.card.p1').removeClass('attackglow');
        this.clearCardReference();
    }

            /**
     * Executes the manual attack directly helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualAttackDirectly() {

        this.targetreference = {
            player: (orientSlot) ? 0 : 1,
            location: 'HAND',
            index: 0,
            position: 'FaceUp'
        };
        this.manualAttack();
    }

            /**
     * Executes the manual target helper used by the manual module.
     * @param {string} target The target value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualTarget(target) {

        this.ws.write(({
            action: 'target',
            target: target
        }));
        this.targetmode = false;
        //$('.card').removeClass('targetglow');
        this.clearCardReference();
    }


            /**
     * Executes the manual remove token helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRemoveToken() {
        console.log(this.manualActionReference);
        this.ws.write(({
            action: 'removeToken',
            uid: this.manualActionReference.uid
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual view extra helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualViewExtra() {


        this.ws.write(({
            action: 'viewExtra',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual view excavated helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualViewExcavated() {

        this.ws.write(({
            action: 'viewExcavated',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual view grave helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualViewGrave() {

        this.ws.write(({
            action: 'viewGrave',
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual view xyzmaterials helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualViewXYZMaterials() {

        this.ws.write(({
            action: 'viewXYZ',
            index: this.manualActionReference.index,
            player: this.manualActionReference.player
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual signal effect helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualSignalEffect() {

        this.ws.write(({
            action: 'effect',
            id: this.manualActionReference.id,
            player: this.manualActionReference.player,
            index: this.manualActionReference.index,
            location: this.manualActionReference.location,
            name : this.manualActionReference.name
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual normal summon helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualNormalSummon(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to attack helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToAttack(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual set monster helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualSetMonster(index) {


        index = (index !== undefined) ? index : automaticZonePicker(this.manualActionReference.player, 'MONSTERZONE');
        var end = this.setMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to defence helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToDefence() {


        var index = this.manualActionReference.index,
            end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to face down defence helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToFaceDownDefence() {

        var index = this.manualActionReference.index,
            end = this.setMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to face up defence helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToFaceUpDefence() {

        var index = this.manualActionReference.index,
            end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual set monster face up helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualSetMonsterFaceUp(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.defenceMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundspecialSummonFromExtra';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual move generic helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @param {string} zone The zone value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
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
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual activate helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualActivate(index) {


        index = (index !== undefined) ? index : this.manualActionReference.index;
        var end = this.makeSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundactivateCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual activate field spell helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualActivateFieldSpell() {


        var end = this.makeFieldSpell(this.manualActionReference),
            message = this.makeCardMovement(this.manualActionReference, end);
        message.sound = 'soundactivateCard';
        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual activate field spell face down helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualActivateFieldSpellFaceDown() {


        var end = this.makeFieldSpellFaceDown(this.manualActionReference),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual set spell helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualSetSpell(index) {


        index = (index !== undefined) ? index : automaticZonePicker(this.manualActionReference.player, 'SPELLZONE');
        var end = this.setSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual stflip down helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualSTFlipDown() {


        var index = this.manualActionReference.index,
            end = this.setSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundflipSummon';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual stflip up helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualSTFlipUp() {


        var index = this.manualActionReference.index,
            end = this.makeSpell(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundflipSummon';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to excavate helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToExcavate() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXCAVATED').length,
            end = this.makeHand(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.movelocation = 'EXCAVATED';
        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to extra helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToExtra() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';

        message.moveposition = 'FaceDown';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual take helper used by the manual module.
     * @param {Object} message The message object supplies the structured input used by the manual module, including the `choice` and `target` properties.
     * @param {string} message.choice The `choice` property supplies structured input used by the manual module.
     * @param {Array} message.target The `target` property supplies structured input used by the manual module.
     * @param {number} message.target.index The `target.index` property supplies structured input used by the manual module.
     * @param {number} message.target.player The `target.player` property supplies structured input used by the manual module.
     * @returns {void} Does not return a value.
     */
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

            /**
     * Executes the manual to opponent helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToOpponent() {
        this.ws.write(({
            action: 'give',
            target: this.manualActionReference
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual to opponents hand helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToOpponentsHand() {

        this.ws.write(({
            action: 'give',
            target: this.manualActionReference,
            choice: 'HAND'
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual to top of deck helper used by the manual module.
     * @returns {void} Does not return a value.
     */
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
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to bottom of deck helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToBottomOfDeck() {
        this.ws.write(({
            action: 'offsetDeck'
        }));
        var index = 0,
            end = this.makeDeckCard(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        setTimeout(() => {
            this.ws.write((message));
            this.clearCardReference();
        }, 300);

    }

            /**
     * Executes the manual slide right helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualSlideRight() {


        var index = this.manualActionReference.index + 1,
            end = JSON.parse(JSON.stringify(this.manualActionReference)),
            message = this.makeCardMovement(this.manualActionReference, end);

        if (index === (this.legacyMode) ? 7 : 5) {
            index = 0;
        }
        message.moveindex = index;
        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }


            /**
     * Executes the manual slide left helper used by the manual module.
     * @returns {void} Does not return a value.
     */
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
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual overlay helper used by the manual module.
     * @returns {void} Does not return a value.
     */
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
            this.ws.write((message));
            this.clearCardReference();
        });
    }

            /**
     * Executes the manual xyzsummon helper used by the manual module.
     * @param {Object} target The target object supplies the structured input used by the manual module, including the `index` property.
     * @param {number} target.index The `index` property supplies structured input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualXYZSummon(target) {

        this.overlaymode = false;
        this.overlaylist.push(target);



        var index = target.index,
            end = this.makeMonster(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.ws.write((message));
        setTimeout(() => {
            var overlayindex = 0;
            overlaylist.forEach((card, cindex) => {
                overlayindex += 1;
                var message = this.makeCardMovement(card, card);
                message.overlayindex = overlayindex;
                message.action = index;
                message.action = 'moveCard';
                this.ws.write((message));
                this.clearCardReference();
            });
        }, 1000);
    }


            /**
     * Executes the manual to grave helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToGrave() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.GRAVE').length,
            end = this.makeGrave(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to opponents grave helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToOpponentsGrave() {

        var moveplayer = (this.manualActionReference.player) ? 0 : 1,
            index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.GRAVE').length,
            end = this.makeGrave(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.moveplayer = moveplayer;
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to removed helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToRemoved() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.BANISHED').length,
            end = this.makeRemoved(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        this.ws.write((message));
        this.clearCardReference();
    }



            /**
     * Executes the manual to extra face up helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToExtraFaceUp() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.moveposition = 'FaceUp';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to hand helper used by the manual module.
     * @returns {void} Does not return a value.
     */
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
        this.ws.write((message));
    }

            /**
     * Executes the manual to extra helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToExtra() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length,
            end = this.makeExtra(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';

        message.moveposition = 'FaceDown';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to removed facedown helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToRemovedFacedown() {

        var index = $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.BANISHED').length,
            end = this.makeRemoved(this.manualActionReference, index),
            message = this.makeCardMovement(this.manualActionReference, end);
        message.action = 'moveCard';
        message.moveposition = 'FaceDown';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual activate field helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualActivateField() {

        if ($('#automationduelfield .p' + orient(this.manualActionReference.player) + '.SPELLZONE.i5').length) {
            return;
        }
        var end = this.makeSpell(this.manualActionReference, 5),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to pzone l helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToPZoneL() {


        if ($('#automationduelfield .p' + orient(this.manualActionReference.player) + '.SPELLZONE.i' + penL()).length) {
            return;
        }
        var end = this.makeSpell(this.manualActionReference, penL()),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual to pzone r helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToPZoneR() {

        if ($('#automationduelfield .p' + orient(this.manualActionReference.player) + '.SPELLZONE.i' + penR()).length) {
            return;
        }
        var end = this.makeSpell(this.manualActionReference, penR()),
            message = this.makeCardMovement(this.manualActionReference, end);

        message.action = 'moveCard';
        message.sound = 'soundsetCard';
        this.ws.write((message));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal hand single helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealHandSingle() {


        this.ws.write(({
            action: 'revealHandSingle',
            card: this.manualActionReference
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal hand helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealHand() {


        this.ws.write(({
            action: 'revealHand',
            card: this.manualActionReference
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal extra deck random helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealExtraDeckRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXTRA').length));


        this.ws.write(({
            action: 'reveal',
            card: card
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal excavated random helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealExcavatedRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.EXCAVATED').length));


        this.ws.write(({
            action: 'reveal',
            card: card
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual reveal deck random helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRevealDeckRandom() {


        var card = this.manualActionReference;
        card.index = Math.floor((Math.random() * $('#automationduelfield .p' + orient(this.manualActionReference.player) + '.DECK').length));


        this.ws.write(({
            action: 'reveal',
            card: card
        }));
        this.clearCardReference();
    }


            /**
     * Executes the manual token helper used by the manual module.
     * @param {number} index The index value provides an input used by the manual module.
     * @param {(string|number)} id The id value provides an input used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualToken(index, id) {

        var card = {};
        card.player = window.orientation;
        card.location = 'MONSTERZONE';
        card.position = 'FaceUpDefence';
        card.id = id || parseInt($('#tokendropdown').val(), 10);
        card.index = index;
        card.action = 'makeToken';
        this.ws.write((card));
        this.clearCardReference();
    }

            /**
     * Executes the manual roll helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRoll() {
        this.ws.write(({
            action: 'rollDie',
            name: localStorage.nickname
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual flip helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualFlip() {
        this.ws.write(({
            action: 'flipCoin',
            name: localStorage.nickname
        }));
        this.clearCardReference();
    }

            /**
     * Executes the manual rps helper used by the manual module.
     * @returns {void} Does not return a value.
     */
    manualRPS() {
        this.ws.write(({
            action: 'rps',
            name: localStorage.nickname
        }));
        this.clearCardReference();
    }

}
