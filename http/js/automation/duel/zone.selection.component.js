class ZoneSelector extends React.Component {
    getZoneProperties(state) {
        const player = (state.orientSlot) ? (state.player ? 0 : 1) : state.player,
            className = ['cardselectionzone', 'p' + player, state.location, 'i' + state.index],
            style = {
                pointerEvents: (state.active) ? 'auto' : 'none'
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
        console.log(this);
        this.store.dispatch({ action: 'ZONE_CLICK', zone: this.state });
    }
    render() {
        return React.createElement('div', this.getZoneProperties(this.state, this.hover));
    }
}
