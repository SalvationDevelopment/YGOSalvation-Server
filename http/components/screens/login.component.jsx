import React, { useState, useEffect } from 'react';
import {
    listen,
    hey
} from '../../services/store';

export default function LoginScreen(props) {

    const [mode, setMode] = useState('loading');




    function nav() {
        hey({ action: 'NAVIGATE', screen: 'login' });
    }

    function openLogin() {
        setMode('login');
        document.body.style.backgroundImage = 'url(../img/magimagipinkshadow.jpg)';
        nav();
    }

    function logout() {
        setMode('login');
        hey({ action: 'LOGOUT_ACCOUNT' });
        nav();
    }

    function openRecover() {
        setMode('recover');
        nav();
    }

    function back() {
        setMode('start');
        nav();
    }

    function forgot() {
        setMode('remember');
        nav();
    }

    function registration() {
        setMode('register');
        nav();
    }

    function login() {
        localStorage.remember = document.getElementById('ips_remember').checked;
        hey({ action: 'LOGIN_ACCOUNT' });
        nav();
    }

    function recoverAccount() {
        hey({ action: 'RECOVER_ACCOUNT' });
        openRecover();
        nav();
    }

    function useRecoverCode() {
        hey({ action: 'RECOVER_CODE' });
        openRecover();
        nav();
    }

    function registerAccount() {
        hey({ action: 'REGISTER_ACCOUNT' });
        nav();
    }

    function passwordKeyPress(event, n) {
        if (event.key === 'Enter') {
            login.apply(this);
        }
    }


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


    function modal() {
        const element = React.createElement,
            memory = (localStorage.remember === 'true') ? { defaultChecked: true } : {};
        switch (mode) {
            case 'login':
                return element('div', { id: 'loginmodal', key: 'modal-1' }, [
                    element('input', {
                        key: 'username',
                        id: 'ips_username',
                        type: 'text',
                        className: 'loginsystem',
                        name: 'ips_username',
                        tabIndex: '1',
                        placeholder: 'Username'
                    }),
                    '\r\n',
                    element('input', {
                        key: 'password',
                        id: 'ips_password',
                        type: 'password',
                        className: 'loginsystem',
                        name: 'ips_password',
                        tabIndex: '2',
                        placeholder: 'Password',
                        onKeyPress: passwordKeyPress.bind(this)
                    }),
                    element('br', { key: 'br-1' }), ,
                    element('a', { key: 'a-1' },
                        element('button', {
                            id: 'dolog',
                            key: 'dolog',
                            className: 'loginsystem',
                            onClick: login.bind(this)
                        }, 'Login')),
                    '\r\n',
                    element('button', {
                        id: 'backuplogin',
                        key: 'backuplogin',
                        className: 'loginsystem',
                        onClick: back.bind(this)
                    }, 'Back'),
                    element('br', { key: 'br-2' }),
                    element('br', { key: 'br-3' }),
                    element('input', Object.assign({ id: 'ips_remember', type: 'checkbox', key: 'remember' }, memory)),
                    element('span', { key: 'span-1' }, 'Remember Username & Password?'),
                    element('br', { key: 'br-4' }), ,
                    element('a', {
                        key: 'a-2',
                        loginsystem: 'loginsystem',
                        style: { cursor: 'pointer' },
                        onClick: forgot.bind(this)
                    }, 'Forgot Password?'),
                    element('br', { key: 'br-5' })
                ]);
            case 'start':
                return element('div', { key: 'ipblogin', id: 'ipblogin', className: 'loginsystem', key: 'modal-2' }, [
                    element('br', { key: 'br' }),
                    element('button', {
                        key: 'openlogin',
                        id: 'openlogin',
                        className: 'loginsystem',
                        key: 'modal-openlogin',
                        onClick: openLogin.bind(this)
                    }, 'Login'),
                    '\r\n',
                    element('button', {
                        key: 'doregister',
                        id: 'doregister',
                        className: 'loginsystem',
                        key: 'modal-doregister',
                        onClick: registration.bind(this)
                    }, 'Register')
                ]);
            case 'register':
                return element('div', { id: 'loginmodal', key: 'modal-3' }, [
                    element('input', {
                        id: 'new_email',
                        type: 'text',
                        className: 'loginsystem reg',
                        tabIndex: '1',
                        placeholder: 'Email Address'
                    }),
                    element('br', { key: 'br-1' }), ,
                    element('input', {
                        id: 'new_username',
                        type: 'text',
                        className: 'loginsystem reg',
                        tabIndex: '2',
                        placeholder: 'Username'
                    }),
                    element('br', { key: 'br-2' }), ,
                    element('input', {
                        id: 'new_password',
                        type: 'password',
                        className: 'loginsystem reg',
                        tabIndex: '3',
                        placeholder: 'Password'
                    }),
                    element('br', { key: 'br-3' }), ,
                    element('input', {
                        id: 'repeat_new_password',
                        type: 'password',
                        className: 'loginsystem reg',
                        tabIndex: '4',
                        placeholder: 'Verify Password'
                    }),
                    element('br', { key: 'br-4' }), ,
                    element('br', { key: 'br-5' }), ,
                    element('button', {
                        id: 'openlogin',
                        className: 'loginsystem',
                        onClick: registerAccount.bind(this)
                    }, 'Register'),
                    '\r\n',
                    element('button', {
                        id: 'backuplogin',
                        className: 'loginsystem',
                        onClick: openLogin.bind(this)
                    }, 'Back'),
                    element('br', { key: 'br-6' })
                ]);
            case 'remember':
                return element('div', { id: 'loginmodal', key: 'modal-4' }, [
                    element('br', { key: 'br-1' }), ,
                    element('input', {
                        id: 'remember',
                        key: 'remember',
                        type: 'text',
                        className: 'loginsystem reg',
                        tabIndex: '1',
                        placeholder: 'Email Address'
                    }),
                    element('br', { key: 'br-2' }), ,

                    element('button', {
                        id: 'dolog',
                        className: 'loginsystem',
                        onClick: recoverAccount.bind(this)
                    }, 'Remember'),
                    '\r\n',
                    element('button', {
                        id: 'backuplogin',
                        className: 'loginsystem',
                        onClick: openLogin.bind(this)
                    }, 'Back'),
                    element('br', { key: 'br-3' }), ,
                    element('br', { key: 'br-4' }), ,
                    element('a', { className: 'loginsystem', onClick: openRecover.bind(this) }, 'Use Recovery Code')
                ]);
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
                        onClick: recoverAccount.bind(this)
                    }, 'Recover'),
                    '\r\n',
                    element('button', {
                        id: 'backuplogin',
                        className: 'loginsystem',
                        onClick: openLogin.bind(this)
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
                        onClick: logout.bind(this)
                    }, 'Logout')
                ]);
            case 'loading':
                return element('div', { id: 'ipblogin', className: 'loginsystem', key: 'modal-7' }, 'Loading...');
            default:
                return '';
        }
    }

    return (() => {
        const element = React.createElement;
        return element('div', { id: 'homecontainer' }, [
            element('span', { key: 'span-1' },
                element('h1', { className: 'shine superlogo' }, [
                    element('span', { className: 'logopink', key: 'span-1' }, 'YGO'),
                    element('span', { key: 'span-2' }, 'Salvation')
                ])),
            // modal(),

            element('ul', { key: 'socialmediabuttons', id: 'socialmediabuttons' }, [
                element('li', { key: 'facebook' },
                    element('a', { target: '_blank', href: 'https://www.facebook.com/ygoprosalvation' },
                        element('img', { 'src': 'img/social/Circle Color/Facebook.png' })
                    )
                ),
                element('li', { key: 'twitter' },
                    element('a', { target: '_blank', href: 'https://twitter.com/ygoprosalvation?lang=en' },
                        element('img', { 'src': 'img/social/Circle Color/Twitter.png' })
                    )
                ),
                element('li', { key: 'github' },
                    element('a', { target: '_blank', href: 'https://github.com/SalvationDevelopment' },
                        element('img', { 'src': 'img/social/Circle Color/Github.png' })
                    )
                ),
                element('li', { key: 'discord' },
                    element('a', { target: '_blank', href: 'https://discord.gg/DVJppsT' },
                        element('img', { 'src': 'img/social/Circle Color/Discord.png' })
                    )
                )
            ])
        ]);
    })();
}