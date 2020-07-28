

/*global React, ReactDOM, ForumService*/

class Forum extends React.Component {


    constructor() {
        super();
        this.service = new ForumService('');
        this.state = {
            homepage: []
        };
        this.service.homepage()
            .then((homepage) => {
                this.state.homepage = homepage;
            });

    }

    componentDidMount() {
        console.log('mounted');

    }

    login(session) {
        this.service = new ForumService(session);
    }

    render() {
        console.log(this.state);
        const element = React.createElement;
        return element('div', { id: 'longsection' });
    }
}