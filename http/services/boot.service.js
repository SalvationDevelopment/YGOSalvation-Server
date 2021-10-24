/*global store, $, app, Store, cardId, cardIs */
import { userAlert } from './modal';
import { hey, listen } from './listener.service';
import { cardStackSort } from '../util/cardManipulation';

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}


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

function wireRegisterAccount() {
    listen('REGISTER_ACCOUNT', async ({ username, email, password, repeatedPassword }) => {

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
            hey({ action: 'OPEN_LOGIN' });
        }

    });
}

function wireRecoverAccount() {
    listen('RECOVER_ACCOUNT', async ({ email }) => {

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

    listen('RECOVER_CODE', async ({ recoveryPass }) => {
        const result = await postJSON('/recoverpassword', { recoveryPass });

        if (result.error) {
            userAlert(result.error);
        } else {
            userAlert('Account Password Updated.');
        }
    });
}

async function getRanking() {
    const ranking = await getJSON('/ranking'),
        ranks = ranking.ranks;
    // ranks.sort((user) => user.points);
    hey({ action: 'LOAD_RANKING', ranks });
}

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

async function loadCardDB() {
    const cardDB = (await getJSON('./manifest/manifest_0-en-OCGTCG.json')),
        cardsets = cardDB.reduce(reduceCardDB, {}),
        sets = Object.keys(cardsets).sort(),
        setcodes = await getSetCodes(),
        { banlist, primary } = await getBanlist();

    cardDB.sort(cardStackSort);

    hey({ action: 'LOAD_DATABASE', data: cardDB });
    hey({ action: 'LOAD_RELEASES', sets });
    hey({ action: 'BANLIST', banlist, primary });
    hey({ action: 'LOAD_SETCODES', data: setcodes });
    hey({ action: 'SYSTEM_LOADED' });
}

async function tryToLoadSession() {
    if (localStorage.remember === 'true' && localStorage.username && localStorage.session) {
        try {
            const userInfo = await getJSON('api/session/' + localStorage.session);

            if (userInfo.success) {
                hey({ action: 'LOAD_SESSION'});
                return true;
            }
        } catch (e) {
            console.log(e);
        }
    }
}

export async function boot() {
    wireRegisterAccount();
    wireRecoverAccount();
    getRanking();
    loadCardDB();

    if (await tryToLoadSession()) {
        return;
    }

    hey({ action: 'LOAD_LOGIN' });
}