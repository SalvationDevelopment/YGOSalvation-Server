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
            { text: 'Flip Deck Over', options: ['m-deck', 'm-convulse'] },
            { text: 'Reveal Deck', options: ['m-deck'] },
            { text: 'Reveal Top Card', options: ['m-deck'] },
            { text: 'Reveal Bottom Card', options: ['m-deck'] },
            { text: 'Banish Top Card', options: ['m-deck'] },
            { text: 'Banish FaceDown', options: ['m-deck'] },
            { text: 'Excavate', options: ['m-hand', 'm-deck', 'v-grave', 'v-removed', 'v-deck', 'non-excavate'] },
            { text: 'Excavate Face-down', options: ['m-deck'] },
            { text: 'Shuffle Deck', options: ['m-deck'] },
            { text: 'View Deck', options: ['m-deck'] },
            { text: 'Mill', options: ['m-deck'], onClick: app.manualControls.manualMill },
            { text: 'Draw', options: ['m-deck'], onClick: function () { app.manualControls.manualDraw() } },

            { text: 'View Graveyard', options: ['m-grave'] },
            { text: 'View Banished', options: ['m-removed'] },

            { text: 'View Extra Deck', options: ['m-extra', 'm-extra-view'] },
            { text: 'Reveal Extra Deck', options: ['m-extra'] },
            { text: 'Reveal Random Card', options: ['m-extra'] },

            { text: 'View Excavated', options: ['m-excavated'] },
            { text: 'Reveal Excavated Deck', options: ['m-excavated'] },
            { text: 'Reveal Random Card', options: ['m-excavated'] },

            { text: 'To Bottom of Deck', options: ['m-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'] },
            { text: 'To Top of Deck', options: ['m-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'] },

            { text: 'To Opponents Hand', options: ['m-hand', 'm-field', 'st-field', 'non-extra'] },
            { text: 'To Opponents Field', options: ['m-hand', 'm-field', 'st-field', 'v-deck ', 'v-extra', 'v-grave', 'v-excavate', 'v-removed'] },
            { text: 'Reveal', options: ['m-hand', 'v-extra', 'v-excavate'] },
            { text: 'Banish', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'] },
            { text: 'Banish Face-down', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'] },

            { text: 'To GY', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-removed', 'v-extra', 'v-excavate', 'non-grave'] },

            { text: 'Set in S/T', options: ['m-hand-st', 'm-monster-st', 'm-st-monster', 'non-deck', 'non-banished'] },
            { text: 'Activate', options: ['m-hand-st'] },

            { text: 'To Hand', options: ['m-field', 'st-field', 'non-extra'] },
            { text: 'Reveal and Add to Hand', options: ['v-deck', 'v-grave', 'v-removed', 'v-excavate', 'v-extra-p non-extra'] },

            { text: 'To Extra Deck Face-up', options: ['m-hand-p', 'm-monster-p', 'm-monster-to-extra-faceup'] },
            { text: 'To Extra Deck', options: ['m-monster-extra', 'v-monster-extra'] },

            { text: 'Special Summon in Defense', options: ['m-hand-m', 'v-extra'] },
            { text: 'Special Summon in Attack', options: ['m-hand-m', 'v-extra'] },
            { text: 'Set Monster', options: ['m-hand-m', 'non-grave non-excavate', 'non-banished', 'non-deck'] },
            { text: 'Normal Summon', options: ['m-hand-m', 'non-grave', 'non-banished', 'non-deck'] },

            { text: 'Activate Field Spell', options: ['m-hand-f'] },
            { text: 'Set Field Spell', options: ['m-hand-f'] },

            { text: 'Flip Face-down', options: ['m-st'] },
            { text: 'Flip Face-up', options: ['m-st'] },
            { text: 'Move', options: ['m-monster', 'm-st'] },

            { text: 'Add Counter', options: ['m-monster', 'm-st', 'countercontroller'] },
            { text: 'Remove Counter', options: ['m-monster', 'm-st', 'countercontroller'] },
            { text: 'View Xyz Materials', options: [] },
            { text: 'Overlay', options: ['m-monster', 'm-monster-xyz', 'v-monster-xyz'] },
            { text: 'Flip Face-up', options: ['m-monster'] },
            { text: 'Flip Face-down', options: ['m-monster'] },
            { text: 'To Attack', options: ['m-monster'] },
            { text: 'To Defense', options: ['m-field'] },
            { text: 'Remove Token', options: ['m-monster-token'] },
            { text: 'To Left Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'] },
            { text: 'To Right Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'] },
            { text: 'Send to Deck Face-up', options: ['m-parasite'] },

            { text: 'Attack', options: ['a-field'] },
            { text: 'Attack Directly', options: ['a-field'] },

            { text: 'Signal Effect', options: ['m-field', 'st-field', 'm-hand-m', 'v-grave', 'v-removed'] },
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