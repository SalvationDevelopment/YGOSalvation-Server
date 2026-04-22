import React, { useState, useEffect } from 'react';
import AppImage from '../common/app-image';
import { emit } from '../../services/listener.service';
import { on } from '../../hooks/use-listener';
import { useAuthState } from '../../hooks/use-auth-state';
import styles from './login.component.module.scss';

export default function LoginScreen(props) {
    const { loggedIn } = useAuthState();
    const primaryActionClass = `${styles.actionButton} ${styles.primaryAction} loginsystem`,
        secondaryActionClass = `${styles.actionButton} ${styles.secondaryAction} loginsystem`,
        logoutActionClass = `${styles.actionButton} ${styles.logoutAction} loginsystem`,
        inputClass = `${styles.loginInput} loginsystem`,
        registerInputClass = `${styles.loginInput} ${styles.regInput} loginsystem reg`;

    const [mode, setMode] = useState('loading'),
        [remember, setRemember] = useState(false),
        [showPassword, setShowPassword] = useState(false),
        [formValues, setFormValues] = useState({
            username: '',
            email: '',
            password: '',
            repeatedPassword: '',
            rememberCode: ''
        });

    function onChangeHandler(event) {
        const { name, value } = event.target;
        setFormValues((current) => {
            if (!(name in current)) {
                return current;
            }
            return {
                ...current,
                [name]: value
            };
        });
    }

    function openLogin() {
        debugger;
        if (typeof window !== 'undefined') {
            setRemember(window.localStorage.remember === 'true');
        }
        setMode('login');
        //document.body.style.backgroundImage = 'url(../img/magimagipinkshadow.jpg)';
    }

    on('LOGGEDIN', () => {
        setMode('loggedIn');
        //document.body.style.backgroundImage = `url(${localStorage.theme})`;
    });

    on('LOAD_LOGIN', () => {
        if (localStorage.session) {
            setMode('loggedIn');
            return;
        }
        setMode('start');
    });

    on('OPEN_LOGIN', () => {
        openLogin();
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (localStorage.session) {
                setMode('loggedIn');
                return;
            }
            setMode('start');
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, []);


    function logout() {
        setMode('start');
        emit({ action: 'LOGOUT_ACCOUNT' });

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
        localStorage.remember = remember;
        emit({ action: 'LOGIN_ACCOUNT', ...formValues });

    }

    function recoverAccount() {
        emit({ action: 'RECOVER_ACCOUNT', ...formValues });
        openRecover();

    }

    function useRecoverCode() {
        emit({ action: 'RECOVER_CODE', ... formValues });
        openRecover();

    }

    function registerAccount() {
        emit({ action: 'REGISTER_ACCOUNT', ...formValues });

    }

    function passwordKeyDown(event) {
        if (event.key === 'Enter') {
            login();
        }
    }


    function LoginModal() {
        const currentMode = loggedIn ? 'loggedIn' : mode;
        switch (currentMode) {
            case 'login':
                return <div id="loginmodal" className={styles.loginModal}>
                    <div className={styles.loginFieldStack}>
                        <input id="ips_username" type="text" className={inputClass} onChange={onChangeHandler} name="username" value={formValues.username} tabIndex="1" placeholder="Username" />
                        <div className={styles.passwordFieldWrap}>
                            <input
                                id="ips_password"
                                type={showPassword ? "text" : "password"}
                                className={inputClass}
                                onChange={onChangeHandler}
                                onKeyDown={passwordKeyDown}
                                name="password"
                                value={formValues.password}
                                tabIndex="2"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                onClick={() => setShowPassword((current) => !current)}
                            >
                                {showPassword ? '\u25C9' : '\u25CE'}
                            </button>
                        </div>
                    </div>
                    <br />
                    <button id="dolog" className={primaryActionClass} onClick={login} type="button">Login</button>
                    <button id="backuplogin" className={secondaryActionClass} onClick={back} type="button">Back</button>
                    <br />
                    <br />
                    <input id="ips_remember" className={styles.rememberCheckbox} type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                    <span>Remember Username &amp; Password?</span>
                    <br />
                    <button className={`${styles.inlineAction} loginsystem`} onClick={forgot} style={{ cursor: 'pointer' }} type="button">Forgot Password?</button>
                    <br />
                </div>;
            case 'start':
                return <div id="ipblogin" className={`${styles.loginStart} loginsystem`}>
                    <br />
                    <button id="openlogin" className={primaryActionClass} onClick={openLogin} type="button">Login</button>
                    <button id="doregister" className={secondaryActionClass} onClick={registration} type="button">Register</button>
                </div>;
            case 'register':
                return <div id="loginmodal" className={styles.loginModal}>
                    <input id="new_email" type="text" className={registerInputClass} tabIndex="1" placeholder="Email Address" name="email" value={formValues.email} onChange={onChangeHandler} />
                    <br />
                    <input id="new_username" type="text" className={registerInputClass} tabIndex="2" placeholder="Username" name="username" value={formValues.username} onChange={onChangeHandler} />
                    <br />
                    <input id="new_password" type="password" className={registerInputClass} tabIndex="3" placeholder="Password" name="password" value={formValues.password} onChange={onChangeHandler} />
                    <br />
                    <input id="repeat_new_password" type="password" className={registerInputClass} tabIndex="4" placeholder="Verify Password" name="repeatedPassword" value={formValues.repeatedPassword} onChange={onChangeHandler} />
                    <br />
                    <br />
                    <button id="openlogin" className={primaryActionClass} onClick={registerAccount} type="button">Register</button>
                    <button id="backuplogin" className={secondaryActionClass} onClick={back} type="button">Back</button>
                    <br />
                </div>;
            case 'remember':
                return <div id="loginmodal" className={styles.loginModal}>
                    <br />
                    <input id="remember" type="text" className={registerInputClass} tabIndex="1" placeholder="Email Address" name="email" value={formValues.email} onChange={onChangeHandler} />
                    <br />
                    <button id="dolog" className={primaryActionClass} onClick={recoverAccount} type="button">Remember</button>
                    <button id="backuplogin" className={secondaryActionClass} onClick={openLogin} type="button">Back</button>
                    <br />
                    <br />
                    <button className={`${styles.inlineAction} loginsystem`} onClick={useRecoverCode} type="button">Use Recovery Code</button>
                </div>;
            case 'recover':
                return <div id='loginmodal' className={styles.loginModal}>
                    <br />
                    <input
                        key='recovery'
                        id='recover'
                        type='text'
                        className={registerInputClass}
                        tabIndex='1'
                        placeholder='Recovery Code'
                        name='rememberCode'
                        value={formValues.rememberCode}
                        onChange={onChangeHandler}
                    />
                    <br />

                    <button id="dolog" className={primaryActionClass} onClick={recoverAccount} type="button">Recover</button>
                    {'\r\n'},
                    <button id="backuplogin" className={secondaryActionClass} onClick={openLogin} type="button">Back</button>
                    <br />
                </div>;
            case 'loggedIn':
                return <div id="loginmodal" className={styles.loginModal}>
                    <br />
                    <button id="logout" className={logoutActionClass} onClick={logout} type="button">Logout</button>
                </div>;
            case 'loading':
                return <div id='ipblogin' className={`${styles.loginStart} loginsystem`}>Loading...</div>;
            default:
                return '';
        }
    }

    return <div id="homecontainer" className={styles.homeContainer}>
        <span>
            <h1 className={`shine ${styles.superLogo}`}>
                <span className={styles.logoPink}>YGO</span>
                <span>Salvation</span>
            </h1>
        </span>
        <LoginModal />
        <ul id="socialmediabuttons" className={styles.socialMediaButtons}>
            <li>
                <a target="_blank" href="https://www.facebook.com/ygoprosalvation" rel="noreferrer">
                    <AppImage src="img/social/Circle Color/Facebook.png" alt="Facebook" width={64} height={64} style={{ width: '100%', height: 'auto' }} />
                </a>
            </li>
            <li>
                <a target="_blank" href="https://twitter.com/ygoprosalvation?lang=en" rel="noreferrer">
                    <AppImage src="img/social/Circle Color/Twitter.png" alt="Twitter" width={64} height={64} style={{ width: '100%', height: 'auto' }} />
                </a>
            </li>
            <li>
                <a target="_blank" href="https://github.com/SalvationDevelopment" rel="noreferrer">
                    <AppImage src="img/social/Circle Color/Github.png" alt="GitHub" width={64} height={64} style={{ width: '100%', height: 'auto' }} />
                </a>
            </li>
            <li>
                <a target="_blank" href="https://discord.gg/DVJppsT" rel="noreferrer">
                    <AppImage src="img/social/Circle Color/Discord.png" alt="Discord" width={64} height={64} style={{ width: '100%', height: 'auto' }} />
                </a>
            </li>
        </ul>
    </div>;
}
