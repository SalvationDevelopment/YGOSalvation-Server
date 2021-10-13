import React, { useEffect, useState } from 'react';
import store from '../services/store';
import SuperHeaderComponent from './../components/screens/superheader.component';
import SuperFooterComponent from './../components/screens/superfooter.component';


export default function Application(props) {
    return (
        <main id="application">
            <ApplicationComponent />
        </main>
    );

}

function ApplicationComponent() {


    const [admin, setAdmin] = useState(false);
    const [activeUsers, setactiveUsers] = useState(0);
    const [globalMessage, setglobalMessage] = useState('');
    const [session, setsession] = useState(false);
    const [username, setusername] = useState(false);
    const [modalActive, setModalActive] = useState(false);
    const [loggedIn,] = useState(false);
    const [language, setLanguage] = useState('en');

    let primus;


    function logOutAccount() {
        setLoggedIn(false);
        window.localStorage.removeItem('remember');
        window.localStorage.removeItem('username');
        window.localStorage.removeItem('session');
    }

    function logInAccount() {
        //useRef
        const username = document.getElementById('ips_username').value,
            password = document.getElementById('ips_password').value;

        primus.write({
            action: 'register',
            username,
            password
        });
    }

    useEffect(() => {
        window.addEventListener('unload', function (event) {
            if (localStorage.remember === 'true') {
                return;
            }
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('session');
        });


        store.register('LOGIN_ACCOUNT', (action) => {

        });

        store.register('LOAD_SESSION', (action) => {
            const session = localStorage.session;
            primus.write({
                action: 'loadSession',
                username: localStorage.username,
                session: localStorage.session
            });
        });

        store.register('HOST', (action) => {
            primus.write({
                action: 'host',
                info: action.settings
            });
            alert('Requesting new game room...');
            setTimeout(() => {
                closeModal();
            }, 5000);
        });

        store.register('DUEL', (action) => {
            lobby(action.key, action.locked, action.port);
        });

        store.register('SAVE_DECK', (action) => {

            var message = {
                action: 'save',
                deck: action.deck,
                username: localStorage.nickname
            };
            primus.write(message);
        });

        store.register('DELETE_DECK', (action) => {

            var message = {
                action: 'delete',
                deck: action.deck,
                username: localStorage.nickname
            };
            primus.write(message);
        });


        connect();

        localStorage.imageURL = localStorage.imageURL || 'http://127.0.0.1:8887';

    });


    function alert(message) {
        setModalActive(true);
        modalMessage = message;
        ReactDOM.render(render(), root);
    }

    function prompt(message) {
        // modalActive = true;
        // modalMessage = message;
        ReactDOM.render(render(), root);

    }

    function closeModal() {
        modalActive = false;
        modalMessage = '';
        ReactDOM.render(render(), root);
    }

    function ack() {
        if (!username) {
            return;
        }
        primus.write({
            action: 'ack',
            name: username
        });
    }

    function lobby(identifier, locked, port) {
        if (locked && admin !== false) {
            let guess = '';
            guess = window.prompt('Password?', guess);
            if (identifier !== guess) {
                alert('Wrong Password!');
                return;
            }
        }
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            alert('Firefox isnt supported at this time, please use Google Chrome.');
            return;
        }
        if (window.Cypress) {
            window.__port = port;
            return;
        }
        window.open('/ygopro.html?room=' + port);
    }

    function login(data) {
        if (loggedIn) {
            return;
        }

        if (data.error) {
            alert(data.info.message);
            return;
        }
        const info = data.info || data.result;

        if (info.session && info.blocked) {
            return;
        }

        session = info.session;
        admin = info.admin;
        loggedIn = true;
        primus.write({
            username: username,
            action: 'load'
        });
        localStorage.session = info.session;
        localStorage.username = info.username;
        console.log(info);
        store.dispatch({ action: 'LOAD_DECKS', decks: info.decks });
        store.dispatch({ action: 'LOGGEDIN' });

    }

    function registrationRequest() {
        if (username && password) {
            primus.write({
                action: 'register',
                username: username,
                password: password
            });
        }
    }

    function onData(data) {
        switch (data.clientEvent) {
            case 'ack':
                ack();
                break;
            case 'ackresult':
                userlist = data.userlist;
                activeUsers = data.ackresult;
                break;
            case 'gamelist':
                activeUsers = data.ackresult;
                userlist = data.userlist;
                gameList.update(data);
                break;
            case 'global':
                superFooter.update({ global: data.message });
                break;
            case 'lobby':
                lobby(data.roompass, data.password, data.port);
                break;
            case 'login':
                login(data);
                break;
            case 'registrationRequest':
                registrationRequest();
                break;
            case 'savedDeck':
                app.alert('Saved Deck');
                setTimeout(() => {
                    closeModal();
                }, 1000);
                console.log(data);
                break;
            case 'deletedDeck':
                app.alert('Deleted Deck');
                setTimeout(() => {
                    closeModal();
                }, 1000);
                console.log(data);
                break;
            default:
                console.log('Error: Unknown Data', data);
                return;
        }
        ReactDOM.render(render(), root);

    }

    function connect() {
        const primusprotocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
        primus = Primus.connect(primusprotocol + location.host);
        primus.on('open', () => {
            console.log('Connected to YGOSalvation Server');
        });
        primus.on('close', () => {
            console.log('Disconnected from YGOSalvation Server');
        });

        primus.on('data', onData.bind(this));

        setInterval(function () {
            if (!session) {
                return;
            }
            primus.write({
                action: 'sessionUpdate',
                session: session
            });
        }.bind(this), 10000);
    }


    function Screen() {
        return React.createElement('section', { id: 'login', key: 'screen-login' },);
    }

    function Modal() {
        if (!modalActive) {
            return '';
        }
        return React.createElement('div', { id: 'lightbox', key: 'screen-lightbox' }, [
            React.createElement('p', { id: 'error' }, [
                modalMessage,
                React.createElement('button', { id: 'modal-ok', onClick: closeModal.bind(this) }, 'OK')
            ])
        ]);
    }

    function translate(lang) {
        setLanguage(lang);
    }

    function Language() {
        return React.createElement('div', { id: 'languagesetter', key: 'screen-languagesetter' }, [
            React.createElement('span', { key: 'screen-en', onClick: translate('en') }, 'English'),
            React.createElement('span', { key: 'screen-es', onClick: translate('es') }, 'Español'),
            React.createElement('span', { key: 'screen-de', onClick: translate('de') }, 'Deutsch'),
            React.createElement('span', {
                key: 'screen-fr',
                onClick: translate('fr')
            }, 'Français(France)'),
            React.createElement('span', {
                key: 'screen-frca',
                onClick: translate('fr-ca')
            }, 'Français(Québec)'),
            React.createElement('span', { key: 'screen-it', onClick: translate('it') }, 'Italiano'),
            React.createElement('span', { key: 'screen-pt', onClick: translate('pt') }, 'Português'),
            React.createElement('span', { key: 'screen-nl', onClick: translate('nl') }, 'Nederlands'),
            React.createElement('span', { key: 'screen-jp', onClick: translate('jp') }, '日本語'),
            React.createElement('span', { key: 'screen-tr', onClick: translate('tr') }, 'Türkçe'),
            React.createElement('span', { key: 'screen-el', onClick: translate('el') }, 'Ελληνικά'),
            React.createElement('span', { key: 'screen-fa', onClick: translate('fa') }, 'فارسی'),
            React.createElement('span', { key: 'screen-ar', onClick: translate('ar') }, 'لغةعربي'),
            React.createElement('span', { key: 'screen-zh', onClick: translate('zh') }, '中文(简体)'),
            React.createElement('span', { key: 'screen-he', onClick: translate('he') }, 'עברית')
        ]);
    }


    return (
        <div key='screen-top'>
            <SuperHeaderComponent loggedIn={loggedIn} />
            <Screen />,
            <Language />,
            <SuperFooterComponent />
            <Modal />
        </div>
    );
}
