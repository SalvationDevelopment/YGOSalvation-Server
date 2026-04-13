/*global store, $, app, Store, cardId, cardIs */
import { userAlert } from './modal';
import { emit, on } from './listener.service';
import { cardStackSort } from '../util/cardManipulation';

/**
 * Validates email used by the boot.service module.
 * @param {string} email The email value provides an input used by the boot.service module.
 * @returns {boolean} Returns the value produced by the boot.service module.
 */
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}


/**
 * Executes the post json helper used by the boot.service module.
 * @param {string} url The url value provides an input used by the boot.service module.
 * @param {Object} data The data value provides an input used by the boot.service module.
 * @returns {Promise<string>} Returns the value produced by the boot.service module.
 */
function postJSON(url, data) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        }).then((response) => {
            return response.json();
        }).then((response) => {
            resolve(JSON.stringify(response));
        }).catch(reject);
    });
}

/**
 * Gets json used by the boot.service module.
 * @param {string} url The url value provides an input used by the boot.service module.
 * @returns {Promise<Object>} Returns the value produced by the boot.service module.
 */
function getJSON(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);

            resolve(data);
        }).catch(reject);
    });
}

/**
 * Executes the wire register account helper used by the boot.service module.
 * @returns {void} Does not return a value.
 */
function wireRegisterAccount() {
    on('REGISTER_ACCOUNT', async ({ username, email, password, repeatedPassword }) => {

        if (password.length < 7) {
            userAlert('Stronger Password Required');
            return false;
        }

        if (repeatedPassword !== password) {
            userAlert('Passwords do not match');
            return false;
        }

        if (!validateEmail(email)) {
            userAlert('Invalid Email address');
            return false;
        }

        const result = await postJSON('/register', { email: email, username: username, password: password });

        if (result.error) {
            userAlert(result.error);
        } else {
            userAlert('Account Created. Please check your email.');
            emit({ action: 'OPEN_LOGIN' });
        }

    });
}

/**
 * Executes the wire recover account helper used by the boot.service module.
 * @returns {void} Does not return a value.
 */
function wireRecoverAccount() {
    on('RECOVER_ACCOUNT', async ({ email }) => {

        if (!validateEmail(email)) {
            userAlert('Invalid Email address');
            return false;
        }

        const result = await postJSON('/recover', { email: email });

        if (result.error) {
            userAlert(result.error);
        } else {
            userAlert('Recovery Code Sent.');
        }
    });

    on('RECOVER_CODE', async ({ recoveryPass }) => {
        const result = await postJSON('/recoverpassword', { recoveryPass });

        if (result.error) {
            userAlert(result.error);
        } else {
            userAlert('Account Password Updated.');
        }
    });
}

/**
 * Gets ranking used by the boot.service module.
 * @returns {Promise<void>} Resolves when the boot.service operation completes.
 */
async function getRanking() {
    const ranking = await getJSON('/ranking'),
        ranks = Array.isArray(ranking) ? ranking : (ranking.ranks || []);
    emit({ action: 'LOAD_RANKING', ranks });
}

/**
 * Reduces card db used by the boot.service module.
 * @param {Object} hash The hash value provides an input used by the boot.service module.
 * @param {Object} item The item object supplies the structured input used by the boot.service module, including the `links`, `ocg`, `tcg`, and `type` properties.
 * @param {Array} item.links The `links` property supplies structured input used by the boot.service module.
 * @param {Object} item.ocg The `ocg` property supplies structured input used by the boot.service module.
 * @param {string} item.ocg.pack The `ocg.pack` property supplies structured input used by the boot.service module.
 * @param {Object} item.tcg The `tcg` property supplies structured input used by the boot.service module.
 * @param {string} item.tcg.pack The `tcg.pack` property supplies structured input used by the boot.service module.
 * @param {(string|number)} item.type The `type` property supplies structured input used by the boot.service module.
 * @returns {Object} Returns the value produced by the boot.service module.
 */
function reduceCardDB(hash, item) {

    item.links = item.links || [];
    if (item.type === 16401) {
        // no token packs
        return hash;
    }
    if (item.ocg && item.ocg.pack) {
        item.ocg.pack = item.ocg.pack.trim();
        hash[item.ocg.pack] = 0;
    }
    if (item.tcg && item.tcg.pack) {
        item.tcg.pack = item.tcg.pack.trim();
        hash[item.tcg.pack] = 0;
    }
    return hash;
}

/**
 * Gets banlist used by the boot.service module.
 * @returns {Promise<Object>} Resolves with the value produced by the boot.service module.
 */
async function getBanlist() {
    const bdata = await getJSON('/manifest/banlist.json'),
        banlist = [];
    let primary;
    Object.keys(bdata).forEach((list) => {
        bdata[list].name = list;
        banlist.push(bdata[list]);
        if (bdata[list].primary) {
            primary = bdata[list].name;
        }
    });
    banlist.reverse();

    return {
        primary,
        banlist
    };
}

/**
 * Gets set codes used by the boot.service module.
 * @returns {Promise<Array>} Resolves with the value produced by the boot.service module.
 */
async function getSetCodes() {
    const raw = await getJSON('./setcodes.json', 'utf-8');

    return Object.keys(raw).map(function (arch) {
        return {
            num: arch,
            name: raw[arch]
        };
    }).sort(function (a, b) {
        return (a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: 'base'
        }));
    });
}

/**
 * Loads card db used by the boot.service module.
 * @returns {Promise<void>} Resolves when the boot.service operation completes.
 */
async function loadCardDB() {
    const cardDB = (await getJSON('./manifest/manifest_0-language-merged.json')),
        cardsets = cardDB.reduce(reduceCardDB, {}),
        sets = Object.keys(cardsets).sort(),
        setcodes = await getSetCodes(),
        { banlist, primary } = await getBanlist();

    cardDB.sort(cardStackSort);

    emit({ action: 'LOAD_DATABASE', data: cardDB });
    emit({ action: 'LOAD_RELEASES', sets });
    emit({ action: 'BANLIST', banlist, primary });
    emit({ action: 'LOAD_SETCODES', data: setcodes });
    emit({ action: 'SYSTEM_LOADED' });
}

/**
 * Executes the try to load session helper used by the boot.service module.
 * @returns {Promise<boolean>} Resolves with the value produced by the boot.service module.
 */
async function tryToLoadSession() {
    if (localStorage.remember === 'true' && localStorage.username && localStorage.session) {
        try {
            const userInfo = await getJSON('/api/session/' + localStorage.session);

            if (userInfo.success) {
                emit({ action: 'LOAD_SESSION'});
                return true;
            }

            if (userInfo.error === 'Invalid session') {
                emit({ action: 'LOGOUT_ACCOUNT' });
            }
        } catch (e) {
            console.log(e);
        }
    }
}

/**
 * Executes the boot helper used by the boot.service module.
 * @returns {Promise<void>} Resolves when the boot.service operation completes.
 */
export async function boot() {
    wireRegisterAccount();
    wireRecoverAccount();
    getRanking();
    loadCardDB();

    if (await tryToLoadSession()) {
        return;
    }

    emit({ action: 'LOAD_LOGIN' });
}
