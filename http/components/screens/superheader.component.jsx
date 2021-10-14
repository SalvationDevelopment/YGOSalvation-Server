import React from 'react';

export default class SuperHeaderComponent extends React.Component {
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
        this.store.hey({action: 'NAVIGATE', screen});
    }

    links(loggedIn) {
        if (loggedIn) {
            return [
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'news'),
                    key: 'super-header-news',
                    className: 'psudolinksingle'
                }, 'News'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'deckedit'),
                    key: 'super-header-deckedit',
                    className: 'psudolinksingle'
                }, 'Deck Edit'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'host'),
                    key: 'super-header-host',
                    className: 'psudolinksingle'
                }, 'Host'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'gamelist'),
                    key: 'super-header-gamelist',
                    className: 'psudolinksingle'
                }, 'Game List'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'rankings'),
                    key: 'super-header-rankings',
                    className: 'psudolinksingle'
                }, 'Rankings'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'tournament'), key: 'super-header-tournament', className: 'psudolinksingle' }, 'Tournaments'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'forum'), key: 'super-header-forum', className: 'psudolinksingle' }, 'Forum'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'chat'), key: 'super-header-chat', className: 'psudolinksingle' }, 'Chat'),
                // React.createElement('li', { onClick: this.nav.bind(this, 'inbox'), key: 'super-header-inbox', className: 'psudolinksingle' }, 'Inbox'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'settings'),
                    key: 'super-header-settings',
                    className: 'psudolinksingle'
                }, 'Settings'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'faqs'),
                    key: 'super-header-faqs',
                    className: 'psudolinksingle'
                }, 'FAQs'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'downloads'),
                    key: 'super-header-downloads',
                    className: 'psudolinksingle'
                }, 'Downloads'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'forum'),
                    key: 'super-header-forum',
                    className: 'psudolinksingle'
                }, 'Forum'),
                React.createElement('li', {
                    onClick: this.nav.bind(this, 'credits'),
                    key: 'super-header-credits',
                    className: 'psudolinksingle'
                }, 'Credits')
            ];
        }
        return [
            React.createElement('li', {
                onClick: this.nav.bind(this, 'news'),
                key: 'super-header-news',
                className: 'psudolinksingle'
            }, 'News'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'deckedit'), key: 'super-header-deckedit', className: 'psudolinksingle' }, 'Deck Edit'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'host'), key: 'super-header-host', className: 'psudolinksingle' }, 'Host'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'gamelist'), key: 'super-header-gamelist', className: 'psudolinksingle' }, 'Game List'),
            React.createElement('li', {
                onClick: this.nav.bind(this, 'rankings'),
                key: 'super-header-rankings',
                className: 'psudolinksingle'
            }, 'Rankings'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'tournament'), key: 'super-header-tournament', className: 'psudolinksingle' }, 'Tournaments'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'forum'), key: 'super-header-forum', className: 'psudolinksingle' }, 'Forum'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'chat'), key: 'super-header-chat', className: 'psudolinksingle' }, 'Chat'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'inbox'), key: 'super-header-inbox', className: 'psudolinksingle' }, 'Inbox'),
            //React.createElement('li', { onClick: this.nav.bind(this, 'settings'), key: 'super-header-settings', className: 'psudolinksingle' }, 'Settings'),
            React.createElement('li', {
                onClick: this.nav.bind(this, 'faqs'),
                key: 'super-header-faqs',
                className: 'psudolinksingle'
            }, 'FAQs'),
            React.createElement('li', {
                onClick: this.nav.bind(this, 'downloads'),
                key: 'super-header-downloads',
                className: 'psudolinksingle'
            }, 'Downloads'),
            React.createElement('li', {
                onClick: this.nav.bind(this, 'forum'),
                key: 'super-header-forum',
                className: 'psudolinksingle'
            }, 'Forum'),
            React.createElement('li', {
                onClick: this.nav.bind(this, 'credits'),
                key: 'super-header-credits',
                className: 'psudolinksingle'
            }, 'Credits')
        ];
    }

    render(loggedIn) {
        return React.createElement('div', {key: 'super-header-header', className: 'superheader', id: 'superheader'},
            React.createElement('ul', {key: 'super-header-list', className: 'featurelist', id: 'featurelist'}, [
                React.createElement('li', {
                        onClick: this.nav.bind(this, 'login'),
                        key: 'super-header-logo',
                        className: 'psudolinksingle logolink',
                        id: 'psudologo'
                    },
                    React.createElement('h1', {key: 'super-header-h1-shine-logolink', className: 'shine logolink'}, [
                        React.createElement('span', {key: 'super-header-span-1', className: 'logopink'}, 'YGO'),
                        React.createElement('span', {key: 'super-header-span-2'}, 'Salvation')
                    ]))
            ].concat(this.links(loggedIn))));
    }
}