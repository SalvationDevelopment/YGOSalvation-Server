import React, { useState, useEffect } from 'react';
import { hey, listen } from '../../services/store';

export default function LoginScreen(props) {

    const [mode, setMode] = useState('loading'),
        [memory, setMemory] = useState({});


    function openLogin() {
        setMode('login');
        document.body.style.backgroundImage = 'url(../img/magimagipinkshadow.jpg)';
    }

    useEffect(() => {
        setMemory((localStorage.remember === 'true') ? { defaultChecked: true } : {});

        listen('LOGGEDIN', (action) => {
            setMode('loggedIn');
            document.body.style.backgroundImage = `url(${localStorage.theme})`;
        });

        listen('LOAD_LOGIN', (action) => {
            setMode('start');
        });

        listen('OPEN_LOGIN', (action) => {
            openLogin();
        });

        setTimeout(() => {
            setMode('start');
        }, 1000);
    }, []);


    function logout() {
        setMode('login');
        hey({ action: 'LOGOUT_ACCOUNT' });

    }

    function openRecover() {
        setMode('recover');

    }

    function back() {
        setMode('start');

    }

    function forgot() {
        setMode('remember');

    }

    function registration() {
        setMode('register');

    }

    function login() {
        localStorage.remember = document.getElementById('ips_remember').checked;
        hey({ action: 'LOGIN_ACCOUNT' });

    }

    function recoverAccount() {
        hey({ action: 'RECOVER_ACCOUNT' });
        openRecover();

    }

    function useRecoverCode() {
        hey({ action: 'RECOVER_CODE' });
        openRecover();

    }

    function registerAccount() {
        hey({ action: 'REGISTER_ACCOUNT' });

    }

    function passwordKeyPress(event, n) {
        if (event.key === 'Enter') {
            login.apply(this);
        }
    }


    function Modal() {
        const element = React.createElement;

        switch (mode) {
            case 'login':
                return <div id="loginmodal">
                    <input id="ips_username" type="text" className="loginsystem" name="ips_username" tabIndex="1" placeholder="Username" />
                    <input id="ips_password" type="password" className="loginsystem" name="ips_password" tabIndex="2" placeholder="Password" />
                    <br />
                    <a>
                        <button id="dolog" className="loginsystem" onClick={login}>Login</button>
                    </a>
                    <button id="backuplogin" className="loginsystem" onClick={back}>Back</button>
                    <br />
                    <br />
                    <input id="ips_remember" type="checkbox" />
                    <span>Remember Username &amp; Password?</span>
                    <br />
                    <a className="loginsystem" style={{ cursor: 'pointer' }} onClick={forgot}>Forgot Password?</a>
                    <br />
                </div>;
            case 'start':
                return <div id="ipblogin" className="loginsystem">
                    <br />
                    <button id="openlogin" className="loginsystem" onClick={openLogin}>Login</button>
                    <button id="doregister" className="loginsystem" onClick={registration}>Register</button>
                </div>;
            case 'register':
                return <div id="loginmodal">
                    <input id="new_email" type="text" className="loginsystem reg" tabIndex="1" placeholder="Email Address" />
                    <br />
                    <input id="new_username" type="text" className="loginsystem reg" tabIndex="2" placeholder="Username" />
                    <br />
                    <input id="new_password" type="password" className="loginsystem reg" tabIndex="3" placeholder="Password" />
                    <br />
                    <input id="repeat_new_password" type="password" className="loginsystem reg" tabIndex="4" placeholder="Verify Password" />
                    <br />
                    <br />
                    <button id="openlogin" className="loginsystem" onClick={registerAccount}>Register</button>
                    <button id="backuplogin" className="loginsystem" onClick={back}>Back</button>
                    <br />
                </div>;
            case 'remember':
                return <div id="loginmodal">
                    <br />
                    <input id="remember" type="text" className="loginsystem reg" tabIndex="1" placeholder="Email Address" />
                    <br />
                    <button id="dolog" className="loginsystem" onClick={recoverAccount}>Remember</button>
                    <button id="backuplogin" className="loginsystem" onClick={openLogin}>Back</button>
                    <br />
                    <br />
                    <a className="loginsystem" onClick={useRecoverCode} >Use Recovery Code</a>
                </div>;
            case 'recover':
                return element('div', { id: 'loginmodal', key: 'modal-5' }, [
                    element('br', { key: 'br-1' }), ,
                    element('input', {
                        key: 'recovery',
                        id: 'recover',
                        type: 'text',
                        className: 'loginsystem reg',
                        tabIndex: '1',
                        placeholder: 'Recovery Code'
                    }),
                    element('br', { key: 'br-2' }), ,

                    element('button', {
                        id: 'dolog',
                        className: 'loginsystem',
                        onClick: recoverAccount
                    }, 'Recover'),
                    '\r\n',
                    element('button', {
                        id: 'backuplogin',
                        className: 'loginsystem',
                        onClick: openLogin
                    }, 'Back'),
                    element('br', { key: 'br-3' })
                ]);
            case 'loggedin':
                return element('div', { key: 'ipblogin', id: 'ipblogin', className: 'loginsystem', key: 'modal-6' }, [
                    element('br', { key: 'br-1' }), ,
                    element('button', {
                        key: 'logout',
                        id: 'logout',
                        className: 'loginsystem',
                        onClick: logout
                    }, 'Logout')
                ]);
            case 'loading':
                return element('div', { id: 'ipblogin', className: 'loginsystem', key: 'modal-7' }, 'Loading...');
            default:
                return '';
        }
    }

    return <div id="homecontainer">
        <span>
            <h1 className="shine superlogo">
                <span className="logopink">YGO</span>
                <span>Salvation</span>
            </h1>
        </span>
        <Modal />
        <ul id="socialmediabuttons">
            <li>
                <a target="_blank" href="https://www.facebook.com/ygoprosalvation" rel="noreferrer">
                    <img src="img/social/Circle Color/Facebook.png" />
                </a>
            </li>
            <li>
                <a target="_blank" href="https://twitter.com/ygoprosalvation?lang=en" rel="noreferrer">
                    <img src="img/social/Circle Color/Twitter.png" />
                </a>
            </li>
            <li>
                <a target="_blank" href="https://github.com/SalvationDevelopment" rel="noreferrer">
                    <img src="img/social/Circle Color/Github.png" />
                </a>
            </li>
            <li>
                <a target="_blank" href="https://discord.gg/DVJppsT" rel="noreferrer">
                    <img src="img/social/Circle Color/Discord.png" />
                </a>
            </li>
        </ul>
    </div>;
}