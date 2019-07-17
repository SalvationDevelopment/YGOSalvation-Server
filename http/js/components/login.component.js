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
            document.body.style.backgroundImage = 'url(../img/magimagiblack.jpg)';
        });

        store.register('LOAD_LOGIN', (action) => {
            this.state.mode = 'start';
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

    modal() {
        const element = React.createElement,
            memory = (localStorage.remember === 'true') ? { defaultChecked: true } : {};
        switch (this.state.mode) {
            case 'login':
                return element('div', { id: 'loginmodal' }, [
                    element('input', { id: 'ips_username', type: 'text', className: 'loginsystem', name: 'ips_username', tabIndex: '1', placeholder: 'Username' }),
                    '\r\n',
                    element('input', { id: 'ips_password', type: 'password', className: 'loginsystem', name: 'ips_password', tabIndex: '2', placeholder: 'Password' }),
                    element('br'),
                    element('a', {},
                        element('button', { id: 'dolog', className: 'loginsystem', onClick: this.login.bind(this) }, 'Login')),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.back.bind(this) }, 'Back'),
                    element('br'),
                    element('br'),
                    element('input', Object.assign({ id: 'ips_remember', type: 'checkbox' }, memory)),
                    element('span', {}, 'Remember Username & Password?'),
                    element('br'),
                    element('a', { className: 'loginsystem', style: { cursor: 'pointer' }, onClick: this.forgot.bind(this) }, 'Forgot Password?'),
                    element('br')
                ]);
            case 'start':
                return element('div', { id: 'ipblogin', className: 'loginsystem' }, [
                    element('br'),
                    element('button', { id: 'openlogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Login'),
                    '\r\n',
                    element('button', { id: 'doregister', className: 'loginsystem', onClick: this.registration.bind(this) }, 'Register')
                ]);
            case 'register':
                return element('div', { id: 'loginmodal' }, [

                    element('input', { id: 'new_email', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Email Address' }),
                    element('br'),
                    element('input', { id: 'new_username', type: 'text', className: 'loginsystem reg', tabIndex: '2', placeholder: 'Username' }),
                    element('br'),
                    element('input', { id: 'new_password', type: 'password', className: 'loginsystem reg', tabIndex: '3', placeholder: 'Password' }),
                    element('br'),
                    element('input', { id: 'repeat_new_password', type: 'password', className: 'loginsystem reg', tabIndex: '4', placeholder: 'Verify Password' }),
                    element('br'),
                    element('br'),
                    element('button', { id: 'openlogin', className: 'loginsystem', onClick: this.registerAccount.bind(this) }, 'Register'),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    element('br')
                ]);
            case 'remember':
                return element('div', { id: 'loginmodal' }, [
                    element('br'),
                    element('input', { id: 'remember', key: 'remember', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Email Address' }),
                    element('br'),

                    element('button', { id: 'dolog', className: 'loginsystem', onClick: this.recoverAccount.bind(this) }, 'Remember'),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    element('br'),
                    element('br'),
                    element('a', { className: 'loginsystem', onClick: this.openRecover.bind(this) }, 'Use Recovery Code')
                ]);
            case 'recover':
                return element('div', { id: 'loginmodal' }, [
                    element('br'),
                    element('input', { key: 'recovery', id: 'recover', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Recovery Code' }),
                    element('br'),

                    element('button', { id: 'dolog', className: 'loginsystem', onClick: this.recoverAccount.bind(this) }, 'Recover'),
                    '\r\n',
                    element('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    element('br')
                ]);
            case 'loggedin':
                return element('div', { id: 'ipblogin', className: 'loginsystem' }, [
                    element('br'),
                    element('button', { id: 'logout', className: 'loginsystem', onClick: this.logout.bind(this) }, 'Logout')
                ]);
            case 'loading':
                return element('div', { id: 'ipblogin', className: 'loginsystem' }, 'Loading...');
            default:
                return '';
        }
    }

    render() {
        const element = React.createElement;
        return element('div', { id: 'homecontainer' }, [
            element('span', {},
                element('h1', { className: 'shine superlogo' }, [
                    element('span', { className: 'logopink' }, 'YGO'),
                    element('span', {}, 'Salvation')
                ])),
            this.modal(),

            element('ul', { id: 'socialmediabuttons' }, [
                element('li', { key: 'facebook' },
                    element('a', { target: '_blank', href: '' },
                        element('img', { 'src': 'img/social/Circle Color/Facebook.png' })
                    )
                ),
                element('li', { key: 'twitter' },
                    element('a', { target: '_blank', href: '' },
                        element('img', { 'src': 'img/social/Circle Color/Twitter.png' })
                    )
                ),
                element('li', { key: 'github' },
                    element('a', { target: '_blank', href: '' },
                        element('img', { 'src': 'img/social/Circle Color/Github.png' })
                    )
                ),
                element('li', { key: 'discord' },
                    element('a', { target: '_blank', href: '' },
                        element('img', { 'src': 'img/social/Circle Color/Discord.png' })
                    )
                )
            ])
        ]);
    }
}