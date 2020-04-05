/*global React, ReactDOM*/
class LoginScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            mode: 'loading'
        };
        this.store = store;
        store.register('LOGGEDIN', (action) => {
            this.state.mode = 'loggedin';
            document.body.style.backgroundImage = `url(${localStorage.theme})`;
        });

        store.register('LOAD_LOGIN', (action) => {
            this.state.mode = 'start';
        });

        store.register('OPEN_LOGIN', (action) => {
            this.openLogin();
        });
    }



    nav() {
        this.store.dispatch({ action: 'NAVIGATE', screen: 'login' });
    }

    openLogin() {
        this.state.mode = 'login';
        document.body.style.backgroundImage = 'url(../img/magimagipinkshadow.jpg)';
        this.nav();
    }

    logout() {
        this.state.mode = 'login';
        this.store.dispatch({ action: 'LOGOUT_ACCOUNT' });
        this.nav();
    }

    openRecover() {
        this.state.mode = 'recover';
        this.nav();
    }

    back() {
        this.state.mode = 'start';
        this.nav();
    }

    forgot() {
        this.state.mode = 'remember';
        this.nav();
    }

    registration() {
        this.state.mode = 'register';
        this.nav();
    }

    login(login) {
        localStorage.remember = document.getElementById('ips_remember').checked;
        this.store.dispatch({ action: 'LOGIN_ACCOUNT' });
        this.nav();
    }

    recoverAccount(login) {
        this.store.dispatch({ action: 'RECOVER_ACCOUNT' });
        this.openRecover();
        this.nav();
    }

    useRecoverCode(login) {
        this.store.dispatch({ action: 'RECOVER_CODE' });
        this.openRecover();
        this.nav();
    }

    registerAccount() {
        this.store.dispatch({ action: 'REGISTER_ACCOUNT' });
        this.nav();
    }

    passwordKeyPress(event, n) {
        if (event.key === "Enter") {
            this.login.apply(this);
        }
    }
    modal() {
        const element = React.createElement,
            memory = (localStorage.remember === 'true') ? { defaultChecked: true } : {};
        switch (this.state.mode) {
            case 'login':
                return element('div', { id: 'loginmodal', key: 'modal-1' }, [
                    element('input', { id: 'ips_username', type: 'text', className: 'loginsystem', name: 'ips_username', tabIndex: '1', placeholder: 'Username' }),
                    '\r\n',
                    element('input', { id: 'ips_password', type: 'password', className: 'loginsystem', name: 'ips_password', tabIndex: '2', placeholder: 'Password', onKeyPress: this.passwordKeyPress.bind(this)
                    }),
                    element('br', { key: 'br-1' }), ,
                    element('a', {},
                        element('button', { id: 'dolog', className: 'loginsystem', onClick: this.login.bind(this) }, 'Login')),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.back.bind(this) }, 'Back'),
                    element('br', { key: 'br-1' }),
                    element('br', { key: 'br-2' }),
                    element('input', Object.assign({ id: 'ips_remember', type: 'checkbox' }, memory)),
                    element('span', {}, 'Remember Username & Password?'),
                    element('br', { key: 'br-1' }), ,
                    element('a', { className: 'loginsystem', style: { cursor: 'pointer' }, onClick: this.forgot.bind(this) }, 'Forgot Password?'),
                    element('br', { key: 'br-2' }),
                ]);
            case 'start':
                return element('div', { key: 'ipblogin', id: 'ipblogin', className: 'loginsystem', key: 'modal-2' }, [
                    element('br', { key: 'br' }),
                    element('button', { key: 'openlogin', id: 'openlogin', className: 'loginsystem', key: 'modal-openlogin', onClick: this.openLogin.bind(this) }, 'Login'),
                    '\r\n',
                    element('button', { key: 'doregister', id: 'doregister', className: 'loginsystem', key: 'modal-doregister', onClick: this.registration.bind(this) }, 'Register')
                ]);
            case 'register':
                return element('div', { id: 'loginmodal', key: 'modal-3' }, [

                    element('input', { id: 'new_email', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Email Address' }),
                    element('br', { key: 'br-1' }), ,
                    element('input', { id: 'new_username', type: 'text', className: 'loginsystem reg', tabIndex: '2', placeholder: 'Username' }),
                    element('br', { key: 'br-2' }), ,
                    element('input', { id: 'new_password', type: 'password', className: 'loginsystem reg', tabIndex: '3', placeholder: 'Password' }),
                    element('br', { key: 'br-3' }), ,
                    element('input', { id: 'repeat_new_password', type: 'password', className: 'loginsystem reg', tabIndex: '4', placeholder: 'Verify Password' }),
                    element('br', { key: 'br-4' }), ,
                    element('br', { key: 'br-5' }), ,
                    element('button', { id: 'openlogin', className: 'loginsystem', onClick: this.registerAccount.bind(this) }, 'Register'),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    element('br', { key: 'br-6' }),
                ]);
            case 'remember':
                return element('div', { id: 'loginmodal', key: 'modal-4' }, [
                    element('br', { key: 'br-1' }), ,
                    element('input', { id: 'remember', key: 'remember', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Email Address' }),
                    element('br', { key: 'br-2' }), ,

                    element('button', { id: 'dolog', className: 'loginsystem', onClick: this.recoverAccount.bind(this) }, 'Remember'),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    element('br', { key: 'br-3' }), ,
                    element('br', { key: 'br-4' }), ,
                    element('a', { className: 'loginsystem', onClick: this.openRecover.bind(this) }, 'Use Recovery Code')
                ]);
            case 'recover':
                return element('div', { id: 'loginmodal', key: 'modal-5' }, [
                    element('br', { key: 'br-1' }), ,
                    element('input', { key: 'recovery', id: 'recover', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Recovery Code' }),
                    element('br', { key: 'br-2' }), ,

                    element('button', { id: 'dolog', className: 'loginsystem', onClick: this.recoverAccount.bind(this) }, 'Recover'),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    element('br', { key: 'br-3' }),
                ]);
            case 'loggedin':
                return element('div', { key: 'ipblogin', id: 'ipblogin', className: 'loginsystem', key: 'modal-6' }, [
                    element('br', { key: 'br-1' }), ,
                    element('button', { key: 'logout', id: 'logout', className: 'loginsystem', onClick: this.logout.bind(this) }, 'Logout')
                ]);
            case 'loading':
                return element('div', { id: 'ipblogin', className: 'loginsystem', key: 'modal-7' }, 'Loading...');
            default:
                return '';
        }
    }

    render() {
        const element = React.createElement;
        return element('div', { id: 'homecontainer' }, [
            element('span', { key: 'span-1' },
                element('h1', { className: 'shine superlogo' }, [
                    element('span', { className: 'logopink', key: 'span-1' }, 'YGO'),
                    element('span', { key: 'span-2' }, 'Salvation')
                ])),
            this.modal(),

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
    }
}