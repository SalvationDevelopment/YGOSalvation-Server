class ZoneSelector extends React.Component {
    getZoneProperties(state) {
        const player = (state.orientSlot) ? (state.player ? 0 : 1) : state.player,
            className = ['cardselectionzone', 'p' + player, state.location, 'i' + state.index],
            style = {
                pointerEvents: (state.active) ? 'auto' : 'none',
                border: (state.active) ? '4px solid red' : 'none'
            };


        return {
            className: className.join(' '),
            'data-position': state.position,
            'data-id': state.id,
            'data-uid': state.uid,
            'data-index': state.index,
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
        this.store.dispatch({
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
            REMOVED: 32,
            SPELLZONE: 8
        };
        this.store.dispatch({
            action: 'ZONE_CLICK', zone: {
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
