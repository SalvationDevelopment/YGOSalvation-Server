/*global React*/
export classLobbyScreen extends React.Component {
    constructor(store, chat, primus) {
        super();
        this.primus = primus;
        this.store = store;
        this.sidechat = chat;
        this.state = {
            decks: [],
            selectedDeck: 0
        };
    }



    slotElement(player) {
        if (this.state.mode !== 'Tag' && player > 2) {
            return '';
        }
        const tag = React.createElement,
            p = this.state.player[player - 1],
            username = (p) ? p.username : '',
            rating = (p) ? `Points: ${p.points} | Rating: ${p.elo}` : '\r\n',
            lock = (p) ? p.ready : false;
        return tag('div', { id: `slot${player}`, className: 'slot' }, [
            tag('img', { key: 'avatar', className: 'avatar', src: (p) ? p.avatar : '' }),
            tag('div', { key: 'rating', className: 'lobbyrating' }, rating),
            '\r\n',
            tag('div', { key: 'kick', className: 'kickbutton', onClick: this.kickDuelist.bind(this, player) }, 'X'),
            '\r\n',
            tag('input', { key: 'slot', id: `player${player}lobbyslot`, placeholder: 'empty slot', value: username }),
            '\r\n',
            tag('div', { key: 'lock', className: 'lockindicator', onClick: this.lock.bind(this, player), 'data-state': lock })
        ]);
    }

    deckElement(deck, index) {
        const tag = React.createElement;
        return tag('option', { key: index, value: index }, deck.name);
    }

    currentDeckElement() {
        const tag = React.createElement;
        return tag('div', { id: 'lobbycurrentdeck', key: 'lobbycurrentdeck' }, [
            'Select Deck : ',
            tag('select', { className: 'currentdeck', key: 'currentdeck', onChange: this.deckSelect.bind(this) }, this.state.decks.map(this.deckElement))
        ]);
    }



    render() {
        const tag = React.createElement;
        console.log('lobby render', this.state.banlist);
        return [
            tag('div', { id: 'lobbymenu' }, [
                tag('div', { id: 'duelspectate', key: 'duelspectate' }, [
                    tag('span', { id: 'lobbygotoduel', key: 'lobbygotoduel', onClick: this.start.bind(this) }, 'Duel'),
                    '\r\n',
                    tag('span', { id: 'lobbygotospectate', key: 'lobbygotospectate', onClick: this.spectate.bind(this) }, 'Spectate'),
                    this.slotElement(1),
                    this.slotElement(2),
                    this.slotElement(3),
                    this.slotElement(4)
                ]),
                tag('div', { id: 'lobbygameinfo', key: 'lobbygameinfo' }, [
                    tag('span', { id: 'judgetxt', key: 'judgetxt' }, 'Judge'),
                    tag('span', { id: 'lobbyauto', key: 'Judge' }, this.state.automatic),
                    tag('br', { key: 'br0' }),
                    tag('span', { id: 'competitiontxt', key: 'competitiontxt' }, 'Competition'),
                    tag('span', { id: 'lobbyranked', key: 'competition' }, this.state.ranked),
                    tag('br', { key: 'br1' }),
                    tag('span', { id: 'translatefl', key: 'translatefl' }, 'Forbidden List'),
                    tag('span', { id: 'lobbyflist', key: 'lobbyflist' }, this.state.banlist),
                    tag('br', { key: 'br2' }),
                    tag('span', { id: 'translateacp', key: 'translateacp' }, 'Allowed Card Pool'),
                    tag('span', { id: 'lobbyallowed', key: 'lobbyallowed' }, this.state.lobbyallowed),
                    tag('br', { key: 'br3' }),
                    tag('span', { id: 'translategamemode', key: 'translategamemode' }, 'Game Mode'),
                    tag('span', { id: 'lobbygamemode', key: 'lobbygamemode' }, this.state.mode),
                    tag('br', { key: 'br4' }),
                    tag('span', { id: 'translatestartinglifepoints', key: 'translatestartinglifepoints' }, 'Starting Lifepoints'),
                    tag('span', { id: 'lobbylp', key: 'lobbylp' }, this.state.startLP)
                ]),
                this.currentDeckElement(),
            ]),
            tag('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    start() {
        this.primus.write({
            action: 'determine'
        });
    }

    spectate() {
        this.primus.write({
            action: 'spectate'
        });
    }

    kickDuelist(player) {
        this.primus.write({
            action: 'kick',
            slot: player
        });
    }

    leave() {
        this.primus.write({
            action: 'leave'
        });
    }

    get deck() {
        const deck = this.state.decks[this.state.selectedDeck];
        return {
            main: deck.main.map((card) => card.id),
            side: deck.side.map((card) => card.id),
            extra: deck.extra.map((card) => card.id)
        };

    }

    lock() {
        this.primus.write({
            action: 'lock',
            deck: this.deck
        });
    }

    deckSelect(event, value) {
        this.state.selectedDeck = event.currentTarget.value;
    }

    update(update) {
        Object.assign(this.state, update);
        app.manual = Boolean(this.state.automatic !== 'Automatic');
        console.log('lobby', this.state);
    }
}