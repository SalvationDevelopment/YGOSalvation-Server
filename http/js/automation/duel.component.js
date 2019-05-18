/*global React, ReactDOM */
/*global Store, Field, CardInfo, SideChat, Flasher, Revealer, ControlButtons, LifepointDisplay */

class DuelScreen extends React.Component {
    constructor(databaseSystem) {
        super();
        this.state = {
            lastUpdate: {}
        };
        this.store = new Store({});
        this.field = new Field({}, this.store);
        this.info = new CardInfo(databaseSystem);
        this.sidechat = new SideChat(this.store);
        this.flasher = new Flasher({});
        this.revealer = new Revealer(this.store);
        this.controls = new ControlButtons(this.store);
        this.lifepoints = new LifepointDisplay(this.info);

        this.store.register('CARD_HOVER', this.onHover.bind(this));
        this.store.register('CARD_CLICK', this.onCardClick.bind(this));
    }

    onCardClick(event, state) {
        this.controls.enable(event.card, { x: event.x, y: event.y });
        return event;
    }

    onHover(event, state) {
        const description = this.info.update({
            id: event.id
        });
        return {
            id: event.id,
            description
        };
    }

    update(update) {
        this.lifepoints.update(update.info);
        this.field.update(update.info.phase);
        this.state.lastUpdate = update;
    }

    idle(commands) {
        this.controls.update(commands);
    }

    render() {
        return [
            ReactDOM.createElement('div', { id: 'sidechat', key: 'sidechat' }, this.sidechat.render()),
            ReactDOM.createElement('div', { id: 'actions', key: 'actions' }, this.controls.render()),
            ReactDOM.createElement('div', { id: 'ingamecardimage', key: 'ingamecardimage' }, this.info.render()),
            ReactDOM.createElement('div', { id: 'lifepoints', key: 'lifepoints' }, this.lifepoints.render()),
            ReactDOM.createElement('div', { id: 'revealer', key: 'revealer' }, this.flasher.render()),
            ReactDOM.createElement('div', { id: 'announcer', key: 'announcer' }, this.flasher.render()),
            ReactDOM.createElement('div', { className: 'field newfield', key: 'field-newfield' }, [
                ReactDOM.createElement('div', {
                    id: 'automationduelfield',
                    className: 'fieldimage',
                    key: 'automationduelfield',
                    style: {
                        display: 'block'
                    }
                }, this.field.render())
            ])
        ];
    }

    flash(card) {
        this.flasher.trigger(card);
    }

    reveal(cards) {
        this.revealer.trigger({ active: true, cards });
    }

    closeRevealer() {
        this.revealer.trigger({ active: false });
    }

    disableSelection() {
        this.field.disableSelection();
    }

    select(query) {
        this.field.select(query);
    }
}
