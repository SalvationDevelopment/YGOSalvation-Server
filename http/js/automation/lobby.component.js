/*global React*/
class LobbyScreen extends React.Component {
    constructor(store, chat) {
        super();
        this.sidechat = chat;
        this.state = {
            decks: []
        };

    }

    slotElement(player) {
        const tag = React.createElement;
        return tag('div', { id: `slot${player}`, className: 'slot' }, [
            tag('div', { key: 'kick', className: 'kickbutton', onClick: this.kickDuelist.bind(this, player) }, 'X'),
            '\r\n',
            tag('input', { key: 'slot', id: `player${player}lobbyslot`, placeholder: 'empty slot' }),
            tag('div', { key: 'lock', className: 'lockindicator', onClick: this.lock.bind(this, player) })
        ]);
    }

    deckElement(deck, index) {
        const tag = React.createElement;
        return tag('option', { key: index }, deck.name);
    }

    currentDeckElement() {
        const tag = React.createElement;
        return tag('div', { id: 'lobbycurrentdeck', key: 'lobbycurrentdeck' }, [
            'Select Deck : ',
            tag('select', { className: 'currentdeck', key: 'currentdeck' }, this.state.decks.map(this.deckElement))
        ]);
    }

    render() {
        const tag = React.createElement;
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
                    tag('span', { id: 'translatefl', key: 'translatefl' }, 'Forbidden List'),
                    tag('span', { id: 'lobbyflist', key: 'lobbyflist' }, this.lobbyflist),
                    tag('br', { key: 'br1' }),
                    tag('span', { id: 'translateacp', key: 'translateacp' }, 'Allowed Card Pool'),
                    tag('span', { id: 'lobbyallowed', key: 'lobbyallowed' }, this.lobbyallowed),
                    tag('br', { key: 'br2' }),
                    tag('span', { id: 'translategamemode', key: 'translategamemode' }, 'Game Mode'),
                    tag('span', { id: 'lobbygamemode', key: 'lobbygamemode' }, this.lobbygamemode),
                    tag('br', { key: 'br3' }),
                    tag('span', { id: 'translatestartinglifepoints', key: 'translatestartinglifepoints' }, 'Starting Lifepoints'),
                    tag('span', { id: 'lobbylp', key: 'lobbylp' }, this.lobbylp)
                ]),
                this.currentDeckElement(),
                tag('div', { id: 'lobbystartcancel', key: 'lobbystartcancel' }, [
                    tag('button', { id: 'lobbystart', key: 'lobbystart', onClick: this.start.bind(this) }, 'Duel'),
                    tag('button', { id: 'lobbycancel', key: 'lobbycancel', onClick: this.leave.bind(this) }, 'Leave')
                ])
            ]),
            tag('div', { id: 'lobbychat', key: 'sidechat' }, this.sidechat.render())];
    }

    start() {
        this.store.dispatch('DUEL_START', {});
    }

    spectate() {
        this.store.dispatch('PLAYER_SPECTATE', {});
    }

    kickDuelist(player) {
        this.store.dispatch('DUEL_START', { player });
    }

    leave() {
        this.store.dispatch('PLAYER_LEAVE', {});
    }


    lock() {
        this.store.dispatch('PLAYER_LOCK', {});
    }
    update(update) {
        Object.assign(this.state, update);
    }
}