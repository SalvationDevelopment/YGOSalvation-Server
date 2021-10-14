/*global React, ReactDOM */
export default class PhaseIndicator extends React.Component {
    constructor(store, state) {
        super();
        this.state = state || {};
        this.store = store;
        this.store.listen('ENABLE_PHASE', (message) => {
            this.state.battlephase = message.battlephase;
            this.state.mainphase2 = message.mainphase2;
            this.state.endphase = message.endphase;
            return this.state;
        });

        return this;
    }

    update(phaseUpdate) {
        this.state.phase = phaseUpdate;
        this.state.battlephase = undefined;
        this.state.mainphase2 = undefined;
        this.state.endphase = undefined;
    }

    click(phase) {
        this.store.hey({
            action: 'PHASE_CLICK', phase: {
                type: phase
            }
        });
    }

    manualPhase(number) {
        if (app.manual) {
            if (number === 6) {
                app.manualControls.manualNextTurn(number);
                return;
            }
            app.manualControls.manualNextPhase(number);
        }
    }

    button(number, id, text, enabled) {
        return React.createElement('button', {
            className: (enabled) ? 'phaseindicator enabled' : 'phaseindicator',
            id: id,
            key: id,
            onClick: (enabled) ? this.click.bind(this, enabled) : this.manualPhase.bind(this, number)
        }, text);
    }

    render() {
        const buttons = [
            this.button(0, 'drawphi', 'DP'),
            this.button(1, 'standbyphi', 'SP'),
            this.button(2, 'main1phi', 'M1'),
            this.button(3, 'battlephi', 'BP', this.state.battlephase),
            this.button(4, 'main2phi', 'M2', this.state.mainphase2),
            this.button(5, 'endphi', 'EP', this.state.endphase),
            this.button(6, 'nextturn', 'Opponent')
        ];

        return React.createElement('div', {
            'data-currentphase': this.state.phase,
            id: 'phaseindicator',
            key: 'phase-indicator'
        }, buttons);
    }
}