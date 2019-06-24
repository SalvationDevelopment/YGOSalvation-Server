/*global React, ReactDOM*/
class SuperHeaderComponent extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = initialState || {};
        this.store = store;
    }

    update(updatedState) {
        Object.assign(this.state, updatedState);
        return this.state;
    }

    nav(screen) {
        this.store.dispatch({ action: 'NAVIGATE', screen });
    }

    links(loggedIn) {
        if (loggedIn) {
            return [
                React.createElement('li', { onClick: this.nav.bind(this, 'deckedit'), key: 'deckedit', className: 'psudolinksingle' }, 'Deck Edit'),
                React.createElement('li', { onClick: this.nav.bind(this, 'host'), key: 'host', className: 'psudolinksingle' }, 'Host'),
                React.createElement('li', { onClick: this.nav.bind(this, 'gamelist'), key: 'gamelist', className: 'psudolinksingle' }, 'Game List'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'ranking'), key: 'ranking', className: 'psudolinksingle' }, 'Rankings'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'tournament'), key: 'tournament', className: 'psudolinksingle' }, 'Tournaments'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'forum'), key: 'forum', className: 'psudolinksingle' }, 'Forum'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'chat'), key: 'chat', className: 'psudolinksingle' }, 'Chat'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'inbox'), key: 'inbox', className: 'psudolinksingle' }, 'Inbox'),
                React.createElement('li', { onClick: this.nav.bind(this, 'settings'), key: 'settings', className: 'psudolinksingle' }, 'Settings'),
                React.createElement('li', { onClick: this.nav.bind(this, 'faqs'), key: 'faqs', className: 'psudolinksingle' }, 'FAQs'),
                React.createElement('li', { onClick: this.nav.bind(this, 'credits'), key: 'credits', className: 'psudolinksingle' }, 'Credits')
            ];
        }
        return [
            //React.createElement('li', { onClick: this.nav.bind(this, 'deckedit'), key: 'deckedit', className: 'psudolinksingle' }, 'Deck Edit'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'host'), key: 'host', className: 'psudolinksingle' }, 'Host'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'gamelist'), key: 'gamelist', className: 'psudolinksingle' }, 'Game List'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'ranking'), key: 'ranking', className: 'psudolinksingle' }, 'Rankings'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'tournament'), key: 'tournament', className: 'psudolinksingle' }, 'Tournaments'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'forum'), key: 'forum', className: 'psudolinksingle' }, 'Forum'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'chat'), key: 'chat', className: 'psudolinksingle' }, 'Chat'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'inbox'), key: 'inbox', className: 'psudolinksingle' }, 'Inbox'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'settings'), key: 'settings', className: 'psudolinksingle' }, 'Settings'),
            React.createElement('li', { onClick: this.nav.bind(this, 'faqs'), key: 'faqs', className: 'psudolinksingle' }, 'FAQs'),
            React.createElement('li', { onClick: this.nav.bind(this, 'credits'), key: 'credits', className: 'psudolinksingle' }, 'Credits')
        ];
    }

    render(loggedIn) {
        return React.createElement('div', { key: 'header', className: 'superheader', id: 'superheader' },
            React.createElement('ul', { key: 'list', className: 'featurelist', id: 'featurelist' }, [
                React.createElement('li', { onClick: this.nav.bind(this, 'login'), key: 'logo', className: 'psudolinksingle logolink', id: 'psudologo' },
                    React.createElement('h1', { className: 'shine logolink' }, [
                        React.createElement('span', { className: 'logopink' }, 'YGO'),
                        React.createElement('span', {}, 'Salvation')
                    ]))
            ].concat(this.links(loggedIn))));
    }
}