import React, { useState, useEffect, useRef } from 'react';
import { hey, listen } from '../../services/listener.service';
import { deRef } from '../../util/deRef';

export default function LoginScreen(props) {

    const [mode, setMode] = useState('loading'),
        [memory, setMemory] = useState({}),
        username = useRef(''),
        email = useRef(''),
        password = useRef(''),
        repeatedPassword = useRef(''),
        rememberCode = useRef('');

    function onChangeHandler(event) {
        const data = {
            memory,
            username,
            email,
            password,
            repeatedPassword,
            rememberCode
        };

        if (data[event.target.name]) {
            data[event.target.name].current = event.target.value;
        }
    }

    function openLogin() {
        setMode('login');
        document.body.style.backgroundImage = 'url(../img/magimagipinkshadow.jpg)';
    }

    useEffect(() => {

        memory.current = (localStorage.remember === 'true') ? { defaultChecked: true } : {};

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
        
        const values = deRef({
            username,
            email,
            password,
            repeatedPassword,
            rememberCode
        });
        localStorage.remember = document.getElementById('ips_remember').checked;
        hey({ action: 'LOGIN_ACCOUNT', ...values });

    }

    function recoverAccount() {
        const values = deRef({
            username,
            email,
            password,
            repeatedPassword,
            rememberCode
        });
        hey({ action: 'RECOVER_ACCOUNT', ...values });
        openRecover();

    }

    function useRecoverCode() {
        const values = deRef({
            username,
            email,
            password,
            repeatedPassword,
            rememberCode
        });
        hey({ action: 'RECOVER_CODE', ... values });
        openRecover();

    }

    function registerAccount() {
        const values = deRef({
            username,
            email,
            password,
            repeatedPassword,
            rememberCode
        });
        hey({ action: 'REGISTER_ACCOUNT', ...values });

    }

    function passwordKeyPress(event) {
        if (event.key === 'Enter') {
            login();
        }
    }


    function Modal() {
        const element = React.createElement;

        switch (mode) {
            case 'login':
                return <div id="loginmodal">
                    <input id="ips_username" type="text" className="loginsystem" onChange={onChangeHandler} name="username" tabIndex="1" placeholder="Username" />
                    <input id="ips_password" type="password" className="loginsystem" onChange={onChangeHandler} onKeyPress={passwordKeyPress} name="password" tabIndex="2" placeholder="Password" />
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
                return <div id= 'loginmodal'>
                    <br />
                    <input
                        key= 'recovery'
                        id= 'recover'
                        type= 'text'
                        className= 'loginsystem reg'
                        tabIndex= '1'
                        placeholder= 'Recovery Code'
                    />
                    <br />

                    <button id="dolog" className="loginsystem" onClick={recoverAccount}>Recover</button>
                    {'\r\n'},
                    <button id="backuplogin" className="loginsystem" onClick={openLogin}>Back</button>
                    <br />
                </div>;
            case 'loggedin':
                return <div id="loginmodal">
                    <br />
                    <button id="backuplogin" className="loginsystem" onClick={logout}>Logout</button>
                </div>;
            case 'loading':
                return <div id='ipblogin' className= 'loginsystem'>Loading...</div>;
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