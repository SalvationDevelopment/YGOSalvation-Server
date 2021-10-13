/*global React */
export default class FieldSelector {
    cast(field, callback) {
        Object.keys(field).forEach((zone) => {
            field[zone].forEach(callback);
            field[zone].forEach(callback);
        });
    }

    render() {
        const zones = Object.keys(this.state.zones)
            .map((zone) => {
                return this.state.zones[zone].render();
            });

        return zones;

    }

    updateField(update) {
        this.cast(update.field, (card) => {
            Object.assign(this.state.cards[card.uid].state, card);
        });
    }

    setup(zoneType, count) {
        const selectors = [];
        for (let player = 0; player <= 1; player++) {
            for (let index = 0; index <= count; index++) {
                selectors.push({
                    index,
                    location: zoneType,
                    player,
                    uid: `selector-player_${player}-${zoneType}-${index}`
                });
            }
        }
        return selectors;
    }

    disableSelection() {
        Object.keys(this.state.zones).forEach((uid) => {
            this.state.zones[uid].state.active = false;
        });
    }

    select(query) {
        query.zones.forEach((zone) => {
            const uuid = `selector-player_${zone.player}-${zone.location}-${zone.index}`;
            this.state.zones[uuid].state.active = true;
        });
        app.refreshUI();
    }



    constructor(store) {
        this.state = {
            zones: {}
        };

        const initialField = {
            SPELLZONE: this.setup('SPELLZONE', 7),
            MONSTERZONE: this.setup('MONSTERZONE', 7),
            DECK: this.setup('DECK', 1),
            EXTRA: this.setup('EXTRA', 1),
            GRAVE: this.setup('GRAVE', 1),
            BANISHED: this.setup('BANISHED', 1)
        };

        this.cast(initialField, (zone) => {
            this.state.zones[zone.uid] = new ZoneSelector(zone, store);
        });
    }
}