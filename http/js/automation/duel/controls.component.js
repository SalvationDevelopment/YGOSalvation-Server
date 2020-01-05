/*global React, ReactDOM */
/*global app */

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
            { text: 'Flip Deck Over', options: ['m-deck', 'm-convulse'], onClick: function () { app.manualcontrols.manualFlipDeck() } },
            { text: 'Reveal Deck', options: ['m-deck'], onClick: function () { app.manualcontrols.manualRevealDeck() } },
            { text: 'Reveal Top Card', options: ['m-deck'], onClick: function () { app.manualcontrols.manualRevealTop() } },
            { text: 'Reveal Bottom Card', options: ['m-deck'], onClick: function () { app.manualcontrols.manualRevealBottom() } },
            { text: 'Banish Top Card', options: ['m-deck'], onClick: function () { app.manualcontrols.manualMillRemovedCard() } },
            { text: 'Banish FaceDown', options: ['m-deck'], onClick: function () { app.manualcontrols.manualMillRemovedCardFaceDown() } },
            { text: 'Excavate', options: ['m-hand', 'm-deck', 'v-grave', 'v-removed', 'v-deck', 'non-excavate'], onClick: function () { app.manualcontrols.manualToExcavate() } },
            { text: 'Excavate Face-down', options: ['m-deck'], onClick: function () { app.manualcontrols.manualExcavateTop() } },
            { text: 'Shuffle Deck', options: ['m-deck'], onClick: function () { app.manualcontrols.manualShuffleDeck() } },
            { text: 'View Deck', options: ['m-deck'], onClick: function () { app.manualcontrols.manualViewDeck() } },
            { text: 'Mill', options: ['m-deck'], onClick: function () { app.manualcontrols.manualMill() } },
            { text: 'Draw', options: ['m-deck'], onClick: function () { app.manualControls.manualDraw() } },

            { text: 'View Graveyard', options: ['m-grave'], onClick: function () { app.manualcontrols.manualViewGrave() } },
            { text: 'View Banished', options: ['m-removed'], onClick: function () { app.manualcontrols.manualViewBanished() } },

            { text: 'View Extra Deck', options: ['m-extra', 'm-extra-view'], onClick: function () { app.manualcontrols.manualViewExtra() } },
            { text: 'Reveal Extra Deck', options: ['m-extra'], onClick: function () { app.manualcontrols.manualRevealExtra() } },
            { text: 'Reveal Random Card', options: ['m-extra'], onClick: function () { app.manualcontrols.manualRevealExtraDeckRandom() } },

            { text: 'View Excavated', options: ['m-excavated'], onClick: function () { app.manualcontrols.manualViewExcavated() } },
            { text: 'Reveal Excavated Deck', options: ['m-excavated'], onClick: function () { app.manualcontrols.manualRevealExcavated() } },
            { text: 'Reveal Random Card', options: ['m-excavated'], onClick: function () { app.manualcontrols.manualRevealExcavatedRandom() } },

            { text: 'To Bottom of Deck', options: ['m-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'], onClick: function () { app.manualcontrols.manualToBottomOfDeck() } },
            { text: 'To Top of Deck', options: ['m-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'], onClick: function () { app.manualcontrols.manualToTopOfDeck() } },

            { text: 'To Opponents Hand', options: ['m-hand', 'm-field', 'st-field', 'non-extra'], onClick: function () { app.manualcontrols.manualToOpponentsHand() } },
            { text: 'To Opponents Field', options: ['m-hand', 'm-field', 'st-field', 'v-deck ', 'v-extra', 'v-grave', 'v-excavate', 'v-removed'], onClick: function () { app.manualcontrols.manualToOpponent() } },
            { text: 'Reveal', options: ['m-hand', 'v-extra', 'v-excavate'], onClick: function () { app.manualcontrols.manualRevealHandSingle() } },
            { text: 'Banish', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'], onClick: function () { app.manualcontrols.manualToRemoved() } },
            { text: 'Banish Face-down', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'], onClick: function () { app.manualcontrols.manualToRemovedFacedown() } },

            { text: 'To GY', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-removed', 'v-extra', 'v-excavate', 'non-grave'], onClick: function () { app.manualcontrols.manualToGrave() } },

            { text: 'Set in S/T', options: ['m-hand-st', 'm-monster-st', 'm-st-monster', 'non-deck', 'non-banished'], onClick: function () { app.manualcontrols.startSpellTargeting('set') } },
            { text: 'Activate', options: ['m-hand-st'], onClick: function () { app.manualcontrols.startSpellTargeting('activate') } },

            { text: 'To Hand', options: ['m-field', 'st-field', 'non-extra'], onClick: function () { app.manualcontrols.manualToHand() } },
            {
                text: 'Reveal and Add to Hand', options: ['v-deck', 'v-grave', 'v-removed', 'v-excavate', 'v-extra-p non-extra'],
                onClick: function () { app.manualcontrols.manualToHand(); app.manualcontrols.manualRevealHandSingle(); () }
            },

            { text: 'To Extra Deck Face-up', options: ['m-hand-p', 'm-monster-p', 'm-monster-to-extra-faceup'], onClick: function () { app.manualcontrols.manualToExtraFaceUp() } },
            { text: 'To Extra Deck', options: ['m-monster-extra', 'v-monster-extra'], onClick: function () { app.manualcontrols.manualToExtra() } },

            { text: 'Special Summon in Defense', options: ['m-hand-m', 'v-extra'], onClick: function () { app.manualcontrols.startSpecialSummon('def') } },
            { text: 'Special Summon in Attack', options: ['m-hand-m', 'v-extra'], onClick: function () { app.manualcontrols.startSpecialSummon('atk') } },
            { text: 'Set Monster', options: ['m-hand-m', 'non-grave non-excavate', 'non-banished', 'non-deck'], onClick: function () { app.manualcontrols.startSpecialSummon('normaldef') } },
            { text: 'Normal Summon', options: ['m-hand-m', 'non-grave', 'non-banished', 'non-deck'], onClick: function () { app.manualcontrols.startSpecialSummon('normalatk') } },

            { text: 'Activate Field Spell', options: ['m-hand-f'], onClick: function () { app.manualcontrols.manualActivateFieldSpell() } },
            { text: 'Set Field Spell', options: ['m-hand-f'], onClick: function () { app.manualcontrols.manualActivateFieldSpellFaceDown() } },

            { text: 'Flip Face-down', options: ['m-st'], onClick: function () { app.manualcontrols.manualSTFlipDown() } },
            { text: 'Flip Face-up', options: ['m-st'], onClick: function () { app.manualcontrols.manualActivate() } },
            { text: 'Move', options: ['m-monster', 'm-st'], onClick: function () { app.manualcontrols.startSpecialSummon() } },

            { text: 'Add Counter', options: ['m-monster', 'm-st', 'countercontroller'], onClick: function () { app.manualcontrols.manualAddCounter() } },
            { text: 'Remove Counter', options: ['m-monster', 'm-st', 'countercontroller'], onClick: function () { app.manualcontrols.manualRemoveCounter() } },
            { text: 'View Xyz Materials', options: [], onClick: function () { app.manualcontrols.manualViewXYZMaterials() } },
            { text: 'Overlay', options: ['m-monster', 'm-monster-xyz', 'v-monster-xyz'], onClick: function () { app.manualcontrols.startXYZSummon() } },
            { text: 'Flip Face-up', options: ['m-monster'], onClick: function () { app.manualcontrols.manualToFaceUpDefence() } },
            { text: 'Flip Face-down', options: ['m-monster'], onClick: function () { app.manualcontrols.manualToFaceDownDefence() } },
            { text: 'To Attack', options: ['m-monster'], onClick: function () { app.manualcontrols.manualToAttack() } },
            { text: 'To Defense', options: ['m-field'], onClick: function () { app.manualcontrols.manualToDefence() } },
            { text: 'Remove Token', options: ['m-monster-token'], onClick: function () { app.manualcontrols.manualRemoveToken() } },
            { text: 'To Left Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'], onClick: function () { app.manualcontrols.manualToPZoneL() } },
            { text: 'To Right Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'], onClick: function () { app.manualcontrols.manualToPZoneR() } },
            { text: 'Send to Deck Face-up', options: ['m-parasite'], onClick: function () { app.manualcontrols.manualSendToDeckFaceup() } },

            { text: 'Attack', options: ['a-field'], onClick: function () { app.manualcontrols.startAttack() } },
            { text: 'Attack Directly', options: ['a-field'], onClick: function () { app.manualcontrols.manualAttackDirectly() } },

            { text: 'Signal Effect', options: ['m-field', 'st-field', 'm-hand-m', 'v-grave', 'v-removed'], onClick: function () { app.manualcontrols.manualSignalEffect() } },
        ]

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
        const enabledClasses = [];
        if (query.location === 'GRAVE') {
            enabledClasses.push('m-grave');
        }
        if (query.location === 'MONSTERZONE') {
            enabledClasses.push('m-opponent')
        }
        if (query.location === 'EXCAVATED') {
            enabledClasses.push('m-excavated')
        }
        if (query.location === 'EXTRA') {
            enabledClasses.push('m-extra-view')
        }
        if (query.location === 'REMOVED') {
            enabledClasses.push('m-removed')
        }
        if (query.location === 'DECK') {
            enabledClasses.push('m-deck')
        }
        if (query.player !== window.orientation) {
            return;
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
            category: query.category,
            player: query.player
        };
        this.info.coords = coords;
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