export default class ZoneSelector extends React.Component {
    getZoneProperties(state) {
        const player = (state.orientSlot) ? (state.player ? 0 : 1) : state.player,
            className = ['cardselectionzone', 'p' + player, state.location, 'i' + state.index],
            style = {
                pointerEvents: (state.active) ? 'auto' : 'none',
                background: (state.active) ? 'rgba(255,0,0,.5)' : 'none'
            },
            count = Object.keys(app.duel.field.state.cards).reduce((total, uid) => {
                const card = app.duel.field.state.cards[uid];
                if (card.state.location === state.location && state.player === card.state.player) {
                    total = total + 1;
                }
                return total;
            }, 0);


        return {
            className: className.join(' '),
            'data-position': state.position,
            'data-id': state.id,
            'data-uid': state.uid,
            'data-index': state.index,
            'data-count': (count) ? count : '',
            'reloaded': state.reloaded,
            'key': state.uid,
            onError: function (event) {
                event.target.src = 'img/textures/unknown.jpg';
            },
            onMouseEnter: this.hover.bind(this),
            onClick: this.click.bind(this),
            style
        };
    }

    constructor(state, store) {
        super();
        this.state = state;
        this.store = store;
        return this;
    }

    hover() {
        this.state.hover = !Boolean(this.state.hover);
        this.store.hey({
            action: 'ZONE_HOVER',
            id: this.state.id
        });
    }

    click() {
        const enummap = {
            DECK: 1,
            EXTRA: 64,
            GRAVE: 16,
            HAND: 2,
            MONSTERZONE: 4,
            OVERLAY: 128,
            BANISHED: 32,
            SPELLZONE: 8
        };
        this.store.hey({
            action: 'ZONE_CLICK',
            manual: {
                choice: this.state.index,
                location: this.state.location
            },
            automatic: {
                type: 'zone',
                i: [
                    (window.orientation) ? (this.state.player ? 0 : 1) : this.state.player,
                    enummap[this.state.location],
                    this.state.index
                ]

            }
        });
    }
    render() {
        return React.createElement('div', this.getZoneProperties(this.state, this.hover));
    }
}
