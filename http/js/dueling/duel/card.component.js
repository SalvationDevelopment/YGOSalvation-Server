const React = window.React,
    ReactDOM = window.ReactDOM,
    createElement = React.createElement;


function makeCardheader(state) {
    if (state.position === 'FaceDownDefence' || state.position === 'FaceDownAttack') {
        return '';
    }
    if (cardIs('link', state)) {
        return `L ${state.level}`;
    }
    if (cardIs('xyz', state)) {
        return `R ${state.rank || state.level}`;
    }
    return `★ ${state.level}`;
}
/**
 * React Binding for dynamically updating a card image with animations.
 * @class
 */
class CardImage extends React.Component {
    getContainerProperties(state) {
        const counters = (state.counters > 0 && state.location !== 'HAND') ? `\n${state.counters} Counters` : '',
            line2 = (cardIs('monster', state)) ? `\n${makeCardheader(state)}` : '',
            line3 = (state.def !== undefined) ? `\n${state.attack || state.atk} / ${state.def} ${counters}` : counters,
            player = (window.orientation) ? (state.player ? 0 : 1) : state.player,
            className = ['card', 'p' + player, state.location, 'i' + state.index],
            style = {};
        if (!player && state.location === 'HAND') {
            state.position = 'FaceUp';
        }


        if (state.location !== 'HAND') {
            //style.zIndex = state.index;
        } else {
            const f = 75 / 0.8,
                xCoord = (state.handLocation < 6)
                    ? (5.5 * f - 0.8 * f * state.handLocation) / 2 + 1.55 * f + state.index * 0.8 * f
                    : 1.9 * f + state.index * 4.0 * f / (state.handLocation - 1);

            style.left = String() + xCoord + 'px';

        }

        if (state.location === 'DECK' || state.location === 'EXTRA' || state.location === 'GRAVE' || state.location === 'BANISHED') {
            style.transform = 'translate3d(0, 0, ' + state.index + 'px)';
            style.zIndex = state.index;
        }

        if (state.location === 'MONSTERZONE' && state.overlayindex) {
            // console.log(state);
            const offsetX = (state.overlayindex % 2) ? (-1) * (state.overlayindex + 1) * 3 : state.overlayindex + (-1) * 3,
                offsetY = state.overlayindex * 4;

            style.zIndex = -1 * state.overlayindex;
            style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
        }

        if (state.attackmode) {
            className.push('attackglow');
        }

        return {
            className: className.join(' '),
            'data-position': state.position,
            'data-id': state.id,
            'data-uid': state.uid,
            'data-index': state.index,
            'data-header': line2,
            'data-footer': line3,
            'reloaded': state.reloaded,
            'key': state.uid,
            onMouseEnter: this.hover.bind(this, `${state.name} ${line2} ${line3}`),
            onMouseLeave: this.toolKill.bind(this),
            onClick: this.click.bind(this),
            style
        };
    }

    getImageProperties(state) {
        const facedown = (state.position === 'FaceDownDefence' || state.position === 'FaceDownAttack' || state.id === 'unknown'),
            src = (state.id && !facedown) ? localStorage.imageURL + '/' + state.id + '.jpg' : 'img/textures/cover.jpg',
            style = {};
        if (state.location !== 'HAND') {
            style.zIndex = state.index;
        }
        return {
            src,
            style,
            onError: function (event) {
                event.target.src = 'img/textures/unknown.jpg';
            }

        }
    }


    constructor(state, store) {
        super();
        this.state = state;
        this.store = store;
        return this;
    }

    hover(tooltip) {
        this.store.dispatch({
            action: 'CARD_HOVER',
            id: this.state.id
        });
        if (!['MONSTERZONE', 'SPELLZONE', 'HAND'].includes(this.state.location)) {
            return;
        }

        if ((this.state.position === 'FaceDown'
            || this.state.position === 'FaceDownDefence')
            && this.state.player !== window.orientation
        ) {
            return;
        }
        window.toolTipData = tooltip;
       
    }


    toolKill() {
        window.toolTipData = '';
    }

    click(event) {
        this.store.dispatch({ action: 'CARD_CLICK', card: this.state, y: event.pageY, x: event.pageX });
        this.store.dispatch({ action: 'UPDATE_FIELD' });
    }
    render() {
        const element = createElement('div', this.getContainerProperties(this.state, this.hover),
            createElement('img', this.getImageProperties(this.state))
        );
        return element;
    }
}
