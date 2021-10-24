/*global React */
/*global Store, Field, CardInfo, SideChat, Flasher, Revealer, ControlButtons, LifepointDisplay */
/*global SelectPosition, DeckDialog, YesNoDialog, SelectAttributes, Chainer, ExtraControls*/
export class DuelScreen extends React.Component {
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
        this.chainer = new Chainer(this.store);
        this.viewDecks = new DeckDialog(this.store);
        this.controls = new ControlButtons(this.store);
        this.lifepoints = new LifepointDisplay({ lifepoints: [8000, 8000] });
        this.positionDialog = new SelectPosition(this.store);
        this.pickAttribute = new SelectAttributes(this.store);
        this.yesnoDialog = new YesNoDialog(this.store);
        this.extracontrols = new ExtraControls(this.store, this.controls, databaseSystem);
        this.store.listen('CARD_HOVER', this.onHover.bind(this));
        this.store.listen('DECK_CARD_CLICK', this.onDeckCardClick.bind(this));
        this.store.listen('CARD_CLICK', this.onCardClick.bind(this));

    }

    clear() {
        this.field = new Field({ info: {}, field: {} }, this.store);
    }

    onCardClick(event, state) {

        if (app.manual) {
            this.onManualCardClick(event, state);
            return;
        }

        const decks = ['EXTRA', 'GRAVE', 'EXTRA', 'BANISHED'];
        if (!event.viewDeck && decks.includes(event.card.location)) {
            const deck = this.field.getDeck(event.card.player, event.card.location);
            this.store.hey({ action: 'OPEN_DECK', deck });
            return;
        }
        if (event.card.location === 'DECK') {
            return;
        }
        this.controls.enable(event.card, { x: event.x, y: event.y });
        this.store.hey({ action: 'RENDER' });
        return event;
    }

    onManualCardClick(event, state) {

        this.controls.enable(event.card, { x: event.x, y: event.y });
        this.store.hey({ action: 'RENDER' });
        return event;
    }

    onDeckCardClick(event, state) {
        this.controls.enable(event.card, { x: event.x, y: event.y });
        this.store.hey({ action: 'RENDER' });
        return event;
    }

    onHover(event, state) {
        if (!event.id) {
            return;
        }
        const description = this.info.update({
            id: event.id
        });
        this.store.hey({ action: 'RENDER' });
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
            React.createElement('div', { id: 'extracontrols', key: 'extracontrols' }, this.extracontrols.render()),
            React.createElement('div', { id: 'actions', key: 'actions' }, this.controls.render()),
            React.createElement('div', { id: 'ingamecardimage', key: 'ingamecardimage' }, this.info.render()),
            React.createElement('div', { id: 'lifepoints', key: 'lifepoints' }, this.lifepoints.render()),
            React.createElement('div', { id: 'revealer', key: 'revealer' }, this.revealer.render()),
            React.createElement('div', { id: 'chain', key: 'chain' }, this.chainer.render()),
            React.createElement('div', { id: 'positionDialog', key: 'positionDialog' }, this.positionDialog.render()),
            React.createElement('div', { id: 'yesnoDialog', key: 'yesnoDialog' }, this.yesnoDialog.render()),
            React.createElement('div', { id: 'viewDecks', key: 'viewDecks' }, this.viewDecks.render()),
            React.createElement('div', { id: 'announcer', key: 'announcer' }, this.flasher.render()),
            React.createElement('div', { id: 'attributes', key: 'attributes' }, this.pickAttribute.render()),
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

    chain(cards) {
        this.chainer.trigger({ active: true, cards });
    }

    closeRevealer() {
        this.revealer.close();
    }

    disableSelection() {
        this.field.disableSelection();
    }

    select(query) {
        this.field.select(query);
    }

}
