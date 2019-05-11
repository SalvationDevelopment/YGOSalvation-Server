class LifepointDisplay extends React.Component {
    constructor(state) {
        super();
        this.root = document.getElementById('lifepoints');
        this.state = state;


    }

    meter(className, value, max) {
        return React.createElement('meter', {
            className,
            key: className,
            type: 'meter',
            value,
            max,
            min: 0
        });
    }

    render() {
        ReactDOM.render([
            this.meter('p0lp', this.state.lifepoints[0]),
            this.meter('p1lp', this.state.lifepoints[0]),
            this.meter('p0time'),
            this.meter('p1time')
        ], this.root);
    }
}