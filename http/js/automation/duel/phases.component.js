class PhaseIndicator extends React.Component {
    constructor(state) {
        super();
        this.state = state;
        return this;
    }

    update(phaseUpdate) {
        this.state.phase = phaseUpdate;
    }

    button(number, id, text) {
        return React.createElement('button', {
            className: 'phaseindicator',
            id: id,
            key: id,
            onClick: function () {
                manualNextPhase(number);
            }
        }, text);
    }

    render() {
        console.log('phase', this.state.phase);
        const buttons = [
            this.button(0, 'drawphi', 'Draw'),
            this.button(1, 'standbyphi', 'Standby'),
            this.button(2, 'main1phi', 'Main 1'),
            this.button(3, 'battlephi', 'Battle'),
            this.button(4, 'main2phi', 'Main 2'),
            this.button(5, 'endphi', 'End'),
            this.button(6, 'nextturn', 'Opponent')
        ];

        return React.createElement('div', {
            'data-currentphase': this.state.phase,
            id: 'phaseindicator',
            key: 'phase-indicator'
        }, buttons);
    }
}