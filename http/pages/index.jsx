import React, { useEffect, useState } from 'react';
import { hey, listen } from '../services/listener.service';
import Screen from '../components/screens/screen';
import LoginScreen from './../components/screens/login.component';
import { userAlert, closeModal } from './../services/modal';
import { connect, write, setSession } from '../services/primus.service';



let toolTipData = '';


function updateTooltip(event) {
    const tooltip = document.querySelector('#tooltip');
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = event.pageY + 'px';

    tooltip.style.display = (toolTipData) ? 'block' : 'none';
    tooltip.innerHTML = toolTipData;
}


document.addEventListener('mousemove', updateTooltip, false);

export default function Application(props) {
    return (
        <main id="application">
            <ApplicationComponent />
        </main>
    );

}

function ApplicationComponent() {

    const [admin, setAdmin] = useState(false),
        [activeUsers, setActiveUsers] = useState(0),
        [session, setsession] = useState(false),
        [username, setusername] = useState(false),
        [modalActive, setModalActive] = useState(false),
        [loggedIn, setLoggedIn] = useState(false),
        [userlist, setUserlist] = useState([]);




    function logOutAccount() {
        setLoggedIn(false);
        window.localStorage.removeItem('remember');
        window.localStorage.removeItem('username');
        window.localStorage.removeItem('session');
    }

    function logInAccount({
        username: loginUsername,
        password
    }) {

        setusername(loginUsername);
        write({
            action: 'listen',
            username: loginUsername,
            password
        });
    }



    function ack() {
        if (!username) {
            return;
        }
        write({
            action: 'ack',
            name: username
        });
    }

    function lobby(identifier, locked, port) {
        if (locked && admin !== false) {
            let guess = '';
            guess = window.prompt('Password?', guess);
            if (identifier !== guess) {
                userAlert('Wrong Password!');
                return;
            }
        }
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            userAlert('Firefox isnt supported at this time, please use Google Chrome.');
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
            userAlert(data.info.message);
            return;
        }
        const info = data.info || data.result;

        if (info.session && info.blocked) {
            return;
        }


        setsession(info.session);


        setAdmin = (info.admin);

        setloggedIn(true);

        write({
            username: username,
            action: 'load'
        });
        localStorage.session = info.session;
        localStorage.username = info.username;
        console.log(info);
        hey({ action: 'LOAD_DECKS', decks: info.decks });
        hey({ action: 'LOGGEDIN' });

    }

    function registrationRequest() {
        if (username && password) {
            write({
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
                setUserlist(data.userlist);
                setActiveUsers(data.ackresult);
                break;
            case 'gamelist':
                setActiveUsers(data.ackresult);
                setUserlist(data.userlist);
                hey({ action: 'GAMELIST', data });
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
                userAlert('Saved Deck');
                setTimeout(() => {
                    closeModal();
                }, 1000);
                console.log(data);
                break;
            case 'deletedDeck':
                userAlert('Deleted Deck');
                setTimeout(() => {
                    closeModal();
                }, 1000);
                console.log(data);
                break;
            default:
                console.log('Error: Unknown Data', data);
                return;
        }

    }



    useEffect(() => {
        window.addEventListener('unload', function (event) {
            if (localStorage.remember === 'true') {
                return;
            }
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('session');
        });


        listen('LOGIN_ACCOUNT', logInAccount);

        listen('TOOL_TIP', (action) => {
            toolTipData = action.data;
        });

        listen('LOAD_SESSION', (action) => {
            const session = localStorage.session;
            write({
                action: 'loadSession',
                username: localStorage.username,
                session: localStorage.session
            });
        });

        listen('HOST', (action) => {
            write({
                action: 'host',
                info: action.settings
            });
            userAlert('Requesting new game room...');
            setTimeout(() => {
                closeModal();
            }, 5000);
        });

        listen('DUEL', (action) => {
            lobby(action.key, action.locked, action.port);
        });

        listen('SAVE_DECK', (action) => {

            const message = {
                action: 'save',
                deck: action.deck,
                username: localStorage.nickname
            };
            write(message);
        });

        listen('DELETE_DECK', (action) => {

            const message = {
                action: 'delete',
                deck: action.deck,
                username: localStorage.nickname
            };
            write(message);
        });


        connect(onData);

        localStorage.imageURL = localStorage.imageURL || 'http://127.0.0.1:8887';

    }, []);





    return (

        <Screen>
            <LoginScreen />,
        </Screen>

    );
}
