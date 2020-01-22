/* eslint-disable brace-style */
/*global React, ReactDOM */
/*global app */

function checksetcode(obj, sc) {
    'use strict';
    var val = obj.setcode,
        hexA = val.toString(16),
        hexB = sc.toString(16);
    if (val === sc
        || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16)
        || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16)
        || (val >> 16).toString(16) === hexB) {
        return true;
    }
    return false;

}

function excludeTokens(card) {
    // filter out Tokens
    if (card.type === 16401 || card.type === 16417) {
        return false;
    }
    return true;
}

class GameplayControlButton extends React.Component {

    click() {
        this.store.dispatch({ action: 'CONTROL_CLICK', card: this.state.card, uuid: this.uuid });
    }

    render() {
        return React.createElement('button', {
            key: this.state.info.text,
            onClick: this.click.bind(this),
            style: {
                display: 'flex',
                width: 'auto',
                'text-align': 'center'
            }
        }, this.state.info.text);
    }

    constructor(store, card, info, list, uuid) {
        super();
        this.uuid = uuid;
        this.store = store;
        this.state = {
            card,
            info
        };
        this.index = list.indexOf((item) => {
            return item.id === card.id;
        });
    }
}


class ControlButtons {

    hide() {
        Object.keys(this.state.zones).forEach((uid) => {
            this.state.zones[uid].state.active = false;
        });
    }


    renderEnabledClasses(enabledClasses) {
        const buttons = [
            { text: 'Flip Deck Over', options: ['m-deck', 'm-convulse'], onClick: function () { app.manualControls.manualFlipDeck(); } },
            { text: 'Reveal Deck', options: ['m-deck'], onClick: function () { app.manualControls.manualRevealDeck(); } },
            { text: 'Reveal Top Card', options: ['m-deck'], onClick: function () { app.manualControls.manualRevealTop(); } },
            { text: 'Reveal Bottom Card', options: ['m-deck'], onClick: function () { app.manualControls.manualRevealBottom(); } },
            { text: 'Banish Top Card', options: ['m-deck'], onClick: function () { app.manualControls.manualMillRemovedCard(); } },
            { text: 'Banish FaceDown', options: ['m-deck'], onClick: function () { app.manualControls.manualMillRemovedCardFaceDown(); } },
            { text: 'Excavate', options: ['m-hand', 'm-deck', 'v-grave', 'v-removed', 'v-deck', 'non-excavate'], onClick: function () { app.manualControls.manualToExcavate(); } },
            { text: 'Excavate Face-down', options: ['m-deck'], onClick: function () { app.manualControls.manualExcavateTop(); } },
            { text: 'Shuffle Deck', options: ['m-deck'], onClick: function () { app.manualControls.manualShuffleDeck(); } },
            { text: 'View Deck', options: ['m-deck'], onClick: function () { app.manualControls.manualViewDeck(); } },
            { text: 'Mill', options: ['m-deck'], onClick: function () { app.manualControls.manualMill(); } },
            { text: 'Draw', options: ['m-deck'], onClick: function () { app.manualControls.manualDraw(); } },

            { text: 'View Graveyard', options: ['m-grave'], onClick: function () { app.manualControls.manualViewGrave(); } },
            { text: 'View Banished', options: ['m-removed'], onClick: function () { app.manualControls.manualViewBanished(); } },

            { text: 'View Extra Deck', options: ['m-extra', 'm-extra-view'], onClick: function () { app.manualControls.manualViewExtra(); } },
            { text: 'Reveal Extra Deck', options: ['m-extra'], onClick: function () { app.manualControls.manualRevealExtra(); } },
            { text: 'Reveal Random Card', options: ['m-extra'], onClick: function () { app.manualControls.manualRevealExtraDeckRandom(); } },

            { text: 'View Excavated', options: ['m-excavated'], onClick: function () { app.manualControls.manualViewExcavated(); } },
            { text: 'Reveal Excavated Deck', options: ['m-excavated'], onClick: function () { app.manualControls.manualRevealExcavated(); } },
            { text: 'Reveal Random Card', options: ['m-excavated'], onClick: function () { app.manualControls.manualRevealExcavatedRandom(); } },

            { text: 'To Bottom of Deck', options: ['m-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'], onClick: function () { app.manualControls.manualToBottomOfDeck(); } },
            { text: 'To Top of Deck', options: ['m-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'], onClick: function () { app.manualControls.manualToTopOfDeck(); } },

            { text: 'To Opponents Hand', options: ['m-hand', 'm-field', 'st-field', 'non-extra'], onClick: function () { app.manualControls.manualToOpponentsHand(); } },
            { text: 'To Opponents Field', options: ['m-hand', 'm-field', 'st-field', 'v-deck ', 'v-extra', 'v-grave', 'v-excavate', 'v-removed'], onClick: function () { app.manualControls.manualToOpponent(); } },
            { text: 'Reveal', options: ['m-hand', 'v-extra', 'v-excavate'], onClick: function () { app.manualControls.manualRevealHandSingle(); } },
            { text: 'Banish', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'], onClick: function () { app.manualControls.manualToRemoved(); } },
            { text: 'Banish Face-down', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'], onClick: function () { app.manualControls.manualToRemovedFacedown(); } },

            { text: 'To GY', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-removed', 'v-extra', 'v-excavate', 'non-grave'], onClick: function () { app.manualControls.manualToGrave(); } },

            { text: 'Set in S/T', options: ['m-hand-st', 'm-monster-st', 'm-st-monster', 'non-deck', 'non-banished'], onClick: function () { app.manualControls.startSpellTargeting('set'); } },
            { text: 'Activate', options: ['m-hand-st'], onClick: function () { app.manualControls.startSpellTargeting('activate'); } },

            { text: 'To Hand', options: ['m-field', 'st-field', 'non-extra'], onClick: function () { app.manualControls.manualToHand(); } },
            {
                text: 'Reveal and Add to Hand', options: ['v-deck', 'v-grave', 'v-removed', 'v-excavate', 'v-extra-p non-extra'],
                onClick: function () { app.manualControls.manualToHand(); app.manualControls.manualRevealHandSingle(); }
            },

            { text: 'To Extra Deck Face-up', options: ['m-hand-p', 'm-monster-p', 'm-monster-to-extra-faceup'], onClick: function () { app.manualControls.manualToExtraFaceUp(); } },
            { text: 'To Extra Deck', options: ['m-monster-extra', 'v-monster-extra'], onClick: function () { app.manualControls.manualToExtra(); } },

            { text: 'Special Summon in Defense', options: ['m-hand-m', 'v-extra'], onClick: function () { app.manualControls.startSpecialSummon('def'); } },
            { text: 'Special Summon in Attack', options: ['m-hand-m', 'v-extra'], onClick: function () { app.manualControls.startSpecialSummon('atk'); } },
            { text: 'Set Monster', options: ['m-hand-m', 'non-grave non-excavate', 'non-banished', 'non-deck'], onClick: function () { app.manualControls.startSpecialSummon('normaldef'); } },
            { text: 'Normal Summon', options: ['m-hand-m', 'non-grave', 'non-banished', 'non-deck'], onClick: function () { app.manualControls.startSpecialSummon('normalatk'); } },

            { text: 'Activate Field Spell', options: ['m-hand-f'], onClick: function () { app.manualControls.manualActivateFieldSpell(); } },
            { text: 'Set Field Spell', options: ['m-hand-f'], onClick: function () { app.manualControls.manualActivateFieldSpellFaceDown(); } },

            { text: 'Flip Face-down', options: ['m-st'], onClick: function () { app.manualControls.manualSTFlipDown(); } },
            { text: 'Flip Face-up', options: ['m-st'], onClick: function () { app.manualControls.manualActivate(); } },
            { text: 'Move', options: ['m-monster', 'm-st'], onClick: function () { app.manualControls.startSpecialSummon(); } },

            { text: 'Add Counter', options: ['m-monster', 'm-st', 'countercontroller'], onClick: function () { app.manualControls.manualAddCounter(); } },
            { text: 'Remove Counter', options: ['m-monster', 'm-st', 'countercontroller'], onClick: function () { app.manualControls.manualRemoveCounter(); } },
            { text: 'View Xyz Materials', options: [], onClick: function () { app.manualControls.manualViewXYZMaterials(); } },
            { text: 'Overlay', options: ['m-monster', 'm-monster-xyz', 'v-monster-xyz'], onClick: function () { app.manualControls.startXYZSummon(); } },
            { text: 'Flip Face-up', options: ['m-monster'], onClick: function () { app.manualControls.manualToFaceUpDefence(); } },
            { text: 'Flip Face-down', options: ['m-monster'], onClick: function () { app.manualControls.manualToFaceDownDefence(); } },
            { text: 'To Attack', options: ['m-monster'], onClick: function () { app.manualControls.manualToAttack(); } },
            { text: 'To Defense', options: ['m-field'], onClick: function () { app.manualControls.manualToDefence(); } },
            { text: 'Remove Token', options: ['m-monster-token'], onClick: function () { app.manualControls.manualRemoveToken(); } },
            { text: 'To Left Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'], onClick: function () { app.manualControls.manualToPZoneL(); } },
            { text: 'To Right Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'], onClick: function () { app.manualControls.manualToPZoneR(); } },
            { text: 'Send to Deck Face-up', options: ['m-parasite'], onClick: function () { app.manualControls.manualSendToDeckFaceup(); } },

            { text: 'Attack', options: ['a-field'], onClick: function () { app.manualControls.startAttack(); } },
            { text: 'Attack Directly', options: ['a-field'], onClick: function () { app.manualControls.manualAttackDirectly(); } },

            { text: 'Signal Effect', options: ['m-field', 'st-field', 'm-hand-m', 'v-grave', 'v-removed'], onClick: function () { app.manualControls.manualSignalEffect(); } },
        ];

        const elements = buttons.filter((button) => {
            return enabledClasses.some((prospect) => {
                return button.options.includes(prospect);
            });
        }).map((button, i) => {
            button.className = button.options;
            button.key = 'mbutton' + i;
            button.style = {
                display: 'flex',
                width: 'auto',
                'text-align': 'center'
            };
            return React.createElement('button', button, button.text);
        });

        return React.createElement('div', {
            style: {
                left: `${(this.info.coords.x - 15)}px`,
                top: `${(this.info.coords.y - 15)}px`,
                position: 'fixed',
                display: 'flex',
                'flex-direction': 'column',
                'text-align': 'center'
            }
        }, elements);
    }

    manualDisplay(query) {
        // https://github.com/SalvationDevelopment/YGOSalvation-Server/blob/55e4f846c824d1718e9297de12ca46c6df9b6477/http/js/http-manual.js
        const enabledClasses = [],
            disabledClasses = [];

        if (query.location === 'GRAVE') {
            enabledClasses.push('m-grave');
            if (cardIs('link', query)) {
                disabledClasses.push('spdef');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-monster-p');
            }
        }
        if (query.location === 'MONSTERZONE') {
            enabledClasses.push('m-opponent');
            // non-extra filter

            if (cardIs('fusion', query) || cardIs('synchro', query) || cardIs('xyz', query) || cardIs('link', query)) {
                enabledClasses.push('m-monster-extra');
            }
            if (!(cardIs('fusion', query) || cardIs('synchro', query) || cardIs('xyz', query) || cardIs('link', query))) {
                enabledClasses.push('non-extra');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-monster-p');
            }
            if (cardIs('xyz', query)) {
                enabledClasses.push('m-monster-xyz');
            }
            if (!excludeTokens(query)) {
                enabledClasses.push('m-monster-token').css({
                    'display': 'block'
                });
                disabledClasses.push('bottomdeck', 'topdeck', 'opphand', 'banishcard', 'tograve', 'tohand', 'overlayStack', 'flipDownMonster', 'banishcardfd');
            }
            if (checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) {
                enabledClasses.push('m-st-monster');
            }
            if (query.id === 27911549) {
                enabledClasses.push('m-parasite');
            }
            if (query.position === 'FaceUpAttack') {
                enabledClasses.push('m-monster');

            }
            if (cardIs('link', query)) {
                disabledClasses.push('toDefence', 'flipUpMonster', 'flipDownMonster', 'flipDown');
            }
            if (query.position === 'FaceUpDefence') {
                disabledClasses.push('toDefence', 'flipUpMonster');
            }
            if (!query.counters) {
                disabledClasses.push('#removeCounter');
            }
        }
        if (query.location === 'EXCAVATED') {
            enabledClasses.push('m-excavated');
        }
        if (query.location === 'EXTRA') {
            enabledClasses.push('m-extra-view');
            enabledClasses.push('m-extra');
            if (cardIs('link', query)) {
                // remove defense option.
            }
        }
        if (query.location === 'REMOVED') {
            enabledClasses.push('m-removed');
            enabledClasses.push('m-removed');
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-monster-p');
            }
            if (cardIs('link', query)) {
                $('#SpDef').css({
                    'display': 'none'
                });
            }
        }
        if (query.location === 'DECK') {
            enabledClasses.push('m-deck');
        }
        if (query.player !== window.orientation) {
            return;
        }
        if (query.location === 'HAND') {
            enabledClasses.push('m-hand');
            if (monsterMap[query.type]) {
                enabledClasses.push('m-hand-m');
            }
            console.log(query);
            if ((stMap[query.type]
                || query.type === 2
                || query.type === 4
                || checksetcode(query, 151)
                || query.id === 9791914
                || query.id === 58132856) && !fieldspell[query.type]) {
                enabledClasses.push('m-hand-st');
            }
            if (fieldspell[query.type]) {
                enabledClasses.push('m-hand-f');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
                enabledClasses.push('m-monster-p');
            }
        }

        return this.renderEnabledClasses(enabledClasses);

    }

    display(list) {
        const details = {
            activatable_cards: { text: 'Activate', id: 6 },
            summonable_cards: { text: 'Normal Summon', id: 1 },
            spsummonable_cards: { text: 'Special Summon', id: 2 },
            repositionable_cards: { text: 'Flip', id: 3 },
            msetable_cards: { text: 'Set MZ', id: 4 },
            ssetable_cards: { text: 'Set ST', id: 5 },
            select_options: { text: 'Select', id: 7 },
            attackable_cards: { text: 'Attack', id: 8 }
        }, elements = list.map((card) => {
            return new GameplayControlButton(this.store,
                card,
                details[card.type],
                this.state[card.type],
                this.state.uuid
            ).render();
        });

        return React.createElement('div', {
            style: {
                left: `${(this.info.coords.x - 15)}px`,
                top: `${(this.info.coords.y - 15)}px`,
                position: 'fixed',
                display: 'flex',
                'flex-direction': 'column',
                'text-align': 'center'
            }
        }, elements);
    }

    render() {
        const list = [],
            query = this.info.target;
        if (app.manual) {
            return this.manualDisplay(query);
        }
        Object.keys(this.state).forEach((type) => {
            const options = (Array.isArray(this.state[type])) ? this.state[type] : [],
                selectable = options.find((option, i) => {
                    option.i = i;
                    option.type = type;
                    return (
                        option.index === query.index &&
                        option.location === query.location &&
                        option.id === query.id
                    );
                });
            if (selectable) {
                list.push({ type, card: query, i: selectable.i });
            }
        });
        return this.display(list, this.state.uuid);
    }



    update(newState) {
        this.state = {};
        Object.assign(this.state, newState);
        this.store.dispatch({
            action: 'ENABLE_PHASE',
            battlephase: (this.state.enableBattlePhase) ? 'enableBattlePhase' : false,
            mainphase2: (this.state.enableMainPhase2) ? 'enableMainPhase2' : false,
            endphase: (this.state.enableEndPhase) ? 'enableEndPhase' : false
        });
        this.store.dispatch({ action: 'RENDER' });
    }

    enable(query, coords) {
        this.info.target = {
            id: query.id,
            index: query.index,
            location: query.location,
            type: query.type,
            player: query.player,
            setcode: query.setcode,
            position : query.position
        };
        this.info.coords = coords;
        app.manualControls.manualActionReference = this.info.target;
    }

    constructor(store) {
        this.store = store;
        this.state = {
            summonable_cards: [],
            spsummonable_cards: [],
            repositionable_cards: [],
            msetable_cards: [],
            ssetable_cards: [],
            activatable_cards: [],
            select_options: [],
            attackable_cards: []
        };
        this.info = {
            coords: {
                x: 0,
                y: 0
            },
            target: {}
        };
    }
}