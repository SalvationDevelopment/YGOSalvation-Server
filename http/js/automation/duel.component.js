/*global React */
/*global Store, Field, CardInfo, SideChat, Flasher, Revealer, ControlButtons, LifepointDisplay */
/*global SelectPosition, DeckDialog*/
class DuelScreen extends React.Component {
    constructor(store, chat, databaseSystem) {
        super();
        this.state = {
            lastUpdate: {}
        };
        this.store = store;
        this.field = new Field({ info: {}, field: {} }, this.store);
        this.info = new CardInfo(databaseSystem);
        this.sidechat = chat;
        this.flasher = new Flasher(store, {});
        this.revealer = new Revealer(this.store);
        this.viewDecks = new DeckDialog(this.store);
        this.controls = new ControlButtons(this.store);
        this.lifepoints = new LifepointDisplay({ lifepoints: [8000, 8000] });
        this.positionDialog = new SelectPosition(this.store);
        this.store.register('CARD_HOVER', this.onHover.bind(this));
        this.store.register('CARD_CLICK', this.onCardClick.bind(this));
        this.store.register('DECK_CARD_CLICK', this.onCardClick.bind(this));

        console.log(this.controls.render());
    }

    onCardClick(event, state) {
        this.controls.enable(event.card, { x: event.x, y: event.y });
        this.store.dispatch({ action: 'RENDER' });
        return event;
    }

    onHover(event, state) {
        if (!event.id) {
            return;
        }
        const description = this.info.update({
            id: event.id
        });
        this.store.dispatch({ action: 'RENDER' });
        return {
            id: event.id,
            description
        };
    }

    update(update) {
        this.lifepoints.update({ lifepoints: update.lifepoints });
        this.field.phase(update.phase);
    }

    updateField(field) {
        this.field.updateField(field);
    }

    idle(commands) {
        this.controls.update(commands);
    }

    render() {
        return [
            React.createElement('div', { id: 'sidechat', key: 'sidechat' }, this.sidechat.render()),
            React.createElement('div', { id: 'actions', key: 'actions' }, this.controls.render()),
            React.createElement('div', { id: 'ingamecardimage', key: 'ingamecardimage' }, this.info.render()),
            React.createElement('div', { id: 'lifepoints', key: 'lifepoints' }, this.lifepoints.render()),
            React.createElement('div', { id: 'revealer', key: 'revealer' }, this.revealer.render()),
            React.createElement('div', { id: 'positionDialog', key: 'positionDialog' }, this.positionDialog.render()),
            React.createElement('div', { id: 'viewDecks', key: 'viewDecks' }, this.viewDecks.render()),
            React.createElement('div', { id: 'announcer', key: 'announcer' }, this.flasher.render()),
            React.createElement('div', { className: 'field newfield', key: 'field-newfield' }, [
                React.createElement('div', {
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
