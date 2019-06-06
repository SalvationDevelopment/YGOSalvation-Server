/*global React, ReactDOM*/
class LoginScreen extends React.Component {
    constructor(store, initialState) {
        super();
        this.state = {
            mode: 'start'
        };
        this.store = store;
        store.register('LOGGEDIN', (action) => {
            this.state.mode = 'loggedin';
        });
    }

    nav() {
        this.store.dispatch({ action: 'NAVIGATE', screen: 'login' });
    }

    openLogin() {
        this.state.mode = 'login';
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
        this.store.dispatch({ action: 'LOGIN_ACCOUNT' });
        this.nav();
    }

    recoverAccount(login) {
        this.store.dispatch({ action: 'RECOVER_ACCOUNT' });
        this.nav();
    }

    registerAccount() {
        this.store.dispatch({ action: 'REGISTER_ACCOUNT' });
        this.nav();
    }

    modal() {
        switch (this.state.mode) {
            case 'login':
                return React.createElement('div', { id: 'loginmodal' }, [
                    React.createElement('input', { id: 'ips_username', type: 'text', className: 'loginsystem', name: 'ips_username', tabIndex: '1', placeholder: 'Username' }),
                    '\r\n',
                    React.createElement('input', { id: 'ips_password', type: 'password', className: 'loginsystem', name: 'ips_password', tabIndex: '2', placeholder: 'Password' }),
                    React.createElement('br'),
                    React.createElement('a', {},
                        React.createElement('button', { id: 'dolog', className: 'loginsystem', onClick: this.login.bind(this) }, 'Login')),
                    '\r\n',
                    React.createElement('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.back.bind(this) }, 'Back'),
                    React.createElement('br'),
                    React.createElement('br'),
                    React.createElement('input', { id: 'ips_remember', type: 'checkbox' }),
                    React.createElement('span', {}, 'Remember Username & Password?'),
                    React.createElement('br'),
                    React.createElement('a', { className: 'loginsystem', onClick: this.forgot.bind(this) }, 'Forgot Password?'),
                    React.createElement('br')
                ]);
            case 'start':
                return React.createElement('div', { id: 'ipblogin', className: 'loginsystem' }, [
                    React.createElement('br'),
                    React.createElement('button', { id: 'openlogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Login'),
                    '\r\n',
                    React.createElement('button', { id: 'doregister', className: 'loginsystem', onClick: this.registration.bind(this) }, 'Register')
                ]);
            case 'register':
                return React.createElement('div', { id: 'loginmodal' }, [

                    React.createElement('input', { id: 'new_email', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Email Address' }),
                    React.createElement('br'),
                    React.createElement('input', { id: 'new_username', type: 'text', className: 'loginsystem reg', tabIndex: '2', placeholder: 'Username' }),
                    React.createElement('br'),
                    React.createElement('input', { id: 'new_password', type: 'password', className: 'loginsystem reg', tabIndex: '3', placeholder: 'Password' }),
                    React.createElement('br'),
                    React.createElement('input', { id: 'repeat_new_password', type: 'password', className: 'loginsystem reg', tabIndex: '4', placeholder: 'Verify Password' }),
                    React.createElement('br'),
                    React.createElement('br'),
                    React.createElement('button', { id: 'openlogin', className: 'loginsystem', onClick: this.registerAccount.bind(this) }, 'Register'),
                    '\r\n',
                    React.createElement('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    React.createElement('br')
                ]);
            case 'remember':
                return React.createElement('div', { id: 'loginmodal' }, [
                    React.createElement('br'),
                    React.createElement('input', { id: 'remember', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Email Address' }),
                    React.createElement('br'),

                    React.createElement('button', { id: 'dolog', className: 'loginsystem', onClick: this.recoverAccount.bind(this) }, 'Remember'),
                    '\r\n',
                    React.createElement('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    React.createElement('br'),
                    React.createElement('br'),
                    React.createElement('a', { className: 'loginsystem', onClick: this.openRecover.bind(this) }, 'Use Recovery Code')
                ]);
            case 'recover':
                return React.createElement('div', { id: 'loginmodal' }, [
                    React.createElement('br'),
                    React.createElement('input', { id: 'recover', type: 'text', className: 'loginsystem reg', tabIndex: '1', placeholder: 'Recovery Code' }),
                    React.createElement('br'),

                    React.createElement('button', { id: 'dolog', className: 'loginsystem', onClick: this.recoverAccount.bind(this) }, 'Recover'),
                    '\r\n',
                    React.createElement('button', { id: 'backuplogin', className: 'loginsystem', onClick: this.openLogin.bind(this) }, 'Back'),
                    React.createElement('br')
                ]);
            default:
                return '';
        }
    }

    render() {
        return React.createElement('div', { id: 'homecontainer' }, [
            React.createElement('span', {},
                React.createElement('h1', { className: 'shine superlogo' }, [
                    React.createElement('span', { className: 'logopink' }, 'YGO'),
                    React.createElement('span', {}, 'Salvation')
                ])),
            this.modal(),

            React.createElement('ul', { id: 'socialmediabuttons' }, [
                React.createElement('li', { key: 'facebook' },
                    React.createElement('a', { target: '_blank', href: '' },
                        React.createElement('img', { 'src': 'img/social/Circle Color/Facebook.png' })
                    )
                ),
                React.createElement('li', { key: 'twitter' },
                    React.createElement('a', { target: '_blank', href: '' },
                        React.createElement('img', { 'src': 'img/social/Circle Color/Twitter.png' })
                    )
                ),
                React.createElement('li', { key: 'github' },
                    React.createElement('a', { target: '_blank', href: '' },
                        React.createElement('img', { 'src': 'img/social/Circle Color/Github.png' })
                    )
                ),
                React.createElement('li', { key: 'discord' },
                    React.createElement('a', { target: '_blank', href: '' },
                        React.createElement('img', { 'src': 'img/social/Circle Color/Discord.png' })
                    )
                )
            ])
        ]);
    }
}