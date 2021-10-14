import React, { useEffect, useState } from 'react';
import { hey, listen  } from '../services/store';
import Screen from '../components/screens/screen';
import LoginScreen from './../components/screens/login.component';


export default function Application(props) {
    return (
        <main id="application">
            <ApplicationComponent />
        </main>
    );

}

function ApplicationComponent() {


    const [admin, setAdmin] = useState(false),
        [activeUsers, setactiveUsers] = useState(0),
        [globalMessage, setglobalMessage] = useState(''),
        [session, setsession] = useState(false),
        [username, setusername] = useState(false),
        [modalActive, setModalActive] = useState(false),
        [loggedIn] = useState(false);


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
            action: 'listen(',
            username,
            password
        });
    }

    function closeModal() {
        hey()
    }

    useEffect(() => {
        window.addEventListener('unload', function (event) {
            if (localStorage.remember === 'true') {
                return;
            }
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('session');
        });


        listen('LOGIN_ACCOUNT', (action) => {
            logInAccount();
        });

        listen('LOAD_SESSION', (action) => {
            const session = localStorage.session;
            primus.write({
                action: 'loadSession',
                username: localStorage.username,
                session: localStorage.session
            });
        });

        listen('HOST', (action) => {
            primus.write({
                action: 'host',
                info: action.settings
            });
            alert('Requesting new game room...');
            setTimeout(() => {
                closeModal();
            }, 5000);
        });

        listen('DUEL', (action) => {
            lobby(action.key, action.locked, action.port);
        });

        listen('SAVE_DECK', (action) => {

            var message = {
                action: 'save',
                deck: action.deck,
                username: localStorage.nickname
            };
            primus.write(message);
        });

        listen('DELETE_DECK', (action) => {

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



    function prompt(message) {
        // modalActive = true;
        // modalMessage = message;
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
        store.hey({ action: 'LOAD_DECKS', decks: info.decks });
        store.hey({ action: 'LOGGEDIN' });

    }

    function registrationRequest() {
        if (username && password) {
            primus.write({
                action: 'listen(',
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








    return (

        <Screen>
            <LoginScreen />,
        </Screen>

    );
}
