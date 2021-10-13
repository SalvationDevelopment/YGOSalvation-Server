/*global React*/

export default class LifepointDisplay extends React.Component {
    constructor(state) {
        super();
        this.root = document.getElementById('lifepoints');
        this.state = state;
        this.maxLifepoints = state.lifepoints[0];
        return this;
    }

    meter(className, value, max) {
        return React.createElement('meter', {
            className,
            key: `meter-${className}`,
            type: 'meter',
            value,
            max,
            min: 0
        });
    }

    input(className, value) {
        return React.createElement('input', {
            key: `input-${className}`,
            disabled: true,
            className,
            value
        });
    }

    span(className, value) {
        return React.createElement('span', {
            key: `span-${className}`,
            className
        }, value);
    }

    flasher() {
        if (!this.state.waiting) {
            return '';
        }
        return React.createElement('div', {
            key: 'span-x',
            id: 'ygowaiting'
        }, 'Waiting...');
    }


    render() {
        return [
            this.meter('p0lp', this.state.lifepoints[0], this.maxLifepoints),
            this.meter('p1lp', this.state.lifepoints[1], this.maxLifepoints),
            //this.input('p0lp', this.state.lifepoints[0]),
            //this.input('p1lp', this.state.lifepoints[1]),
            this.span('p0name', 'Player 1'),
            this.span('p1name', 'Player 2'),
            this.meter('p0time'),
            this.meter('p1time'),
            this.flasher()
        ];
    }

    update(state) {
        if (state) {
            this.state = state;
        }
    }
}