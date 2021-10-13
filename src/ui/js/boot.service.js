/*global store, $, app, Store, cardId, cardIs */

const store = new Store();

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}


function isExtra(card) {
    'use strict';
    return (cardIs('fusion', card) || cardIs('synchro', card) || cardIs('xyz', card) || cardIs('link', card));
}

function cardEvaluate(card) {
    'use strict';
    var value = 0;

    if (cardIs('monster', card)) {
        value -= 100;
    }
    if (card.type === 17) { // normal monster
        value -= 100;
    }
    if (cardIs('ritual', card)) {
        value += 300;
    }
    if (cardIs('fusion', card)) {
        value += 400;
    }
    if (cardIs('synchro', card)) {
        value += 500;
    }
    if (cardIs('xyz', card)) {
        value += 600;
    }
    if (cardIs('link', card)) {
        value += 700;
    }
    if (cardIs('spell', card)) {
        value += 10000;
    }
    if (cardIs('trap', card)) {
        value += 100000;
    }
    return value;

}

function getLevel(card) {
    'use strict';
    return card.level & 0xff;
}

function cardStackSort(a, b) {
    'use strict';
    if (cardEvaluate(a) > cardEvaluate(b)) {
        return 1;
    }
    if (cardEvaluate(a) < cardEvaluate(b)) {
        return -1;
    }
    if (getLevel(a) > getLevel(b)) {
        return -1;
    }
    if ((getLevel(a) < getLevel(b))) {
        return 1;
    }
    if (a.atk > b.atk) {
        return -1;
    }
    if (a.atk < b.atk) {
        return 1;
    }
    if (a.def < b.def) {
        return 1;
    }
    if (a.def > b.def) {
        return -1;
    }

    if (a.type > b.type) {
        return 1;
    }
    if (a.type < b.type) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    if (a.id < b.id) {
        return -1;
    }
    return 0;
}


postJSON = function (url, data, callback) {
    return $.ajax({ url: url, data: JSON.stringify(data), type: 'POST', contentType: 'application/json', success: callback });
};

store.register('REGISTER_ACCOUNT', (action) => {
    var username = $('#new_username').val(),
        email = $('#new_email').val(),
        password = $('#new_password').val(),
        repeatedPassword = $('#repeat_new_password').val();

    if (password.length < 7) {
        app.alert('Stronger Password Required');
        return false;
    }

    if (repeatedPassword !== password) {
        app.alert('Passwords do not match');
        return false;
    }

    if (!validateEmail(email)) {
        app.alert('Invalid Email address');
        return false;
    }

    postJSON('/register', { email: email, username: username, password: password }, function (result, networkStatus) {
        console.log(result);
        if (result.error) {
            app.alert(result.error);
        } else {
            app.alert('Account Created. Please check your email.');
            store.dispatch({ action: 'OPEN_LOGIN' });
        }
    });
});

store.register('RECOVER_ACCOUNT', (action) => {
    var email = $('#remember').val();


    if (!validateEmail(email)) {
        app.alert('Invalid Email address');
        return false;
    }

    postJSON('/recover', { email: email }, function (result, networkStatus) {
        console.log(result);
        if (result.error) {
            app.alert(result.error);
        } else {
            app.alert('Recovery Code Sent.');
        }
    });
});

store.register('RECOVER_CODE', (action) => {
    var recoveryPass = $('#remember').val();

    postJSON('/recoverpassword', { recoveryPass }, function (result, networkStatus) {
        console.log(result);
        if (result.error) {
            app.alert(result.error);
        } else {
            app.alert('Account Password Updated.');
        }
    });
});

$.getJSON('/ranking', function (data) {
    const ranks = data.ranks;
    // ranks.sort((user) => user.points);
    store.dispatch({ action: 'LOAD_RANKING', ranks });
});


$.getJSON('/manifest/manifest_0-en-OCGTCG.json', function (data) {
    data.sort(cardStackSort);
    store.dispatch({ action: 'LOAD_DATABASE', data });
    const cardsets = data.reduce((hash, item) => {
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
    }, {}), sets = Object.keys(cardsets).sort();

    store.dispatch({ action: 'LOAD_RELEASES', sets });
    $.getJSON('/manifest/banlist.json', (bdata) => {
        const banlist = [];
        let primary;
        Object.keys(bdata).forEach((list) => {
            bdata[list].name = list;
            banlist.push(bdata[list]);
            if (bdata[list].primary) {
                primary = bdata[list].name;
            }
        });
        banlist.reverse();
        store.dispatch({ action: 'HOST_BANLIST', banlist, primary });
        store.dispatch({ action: 'GAMELIST_BANLIST', banlist, primary });
        store.dispatch({ action: 'DECK_EDITOR_BANLIST', banlist, primary });

        $.getJSON('./setcodes.json', 'utf-8', function (data) {
            var raw = data,
                setcodes = Object.keys(raw).map(function (arch) {
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
            store.dispatch({ action: 'LOAD_SETCODES', data: setcodes });
            store.dispatch({ action: 'SYSTEM_LOADED', banlist, primary });
            if (localStorage.remember === 'true' && localStorage.username && localStorage.session) {

                store.dispatch({ action: 'LOAD_SESSION', banlist, primary });
                $.getJSON('api/session/' + localStorage.session, (userInfo) => {
                    console.log('Session Login', userInfo);
                    store.dispatch({ action: 'SYSTEM_LOADED', banlist, primary });
                    store.dispatch({ action: 'LOAD_LOGIN' });
                    console.log(userInfo.success);
                    const state = (userInfo.success)
                        ? store.dispatch({ action: 'LOAD_SESSION', banlist, primary })
                        : store.dispatch({ action: 'LOAD_LOGIN' });

                }).fail((e) => {
                    console.log(e);
                    store.dispatch({ action: 'LOAD_LOGIN' });
                });
            } else {
                store.dispatch({ action: 'LOAD_LOGIN' });
            }
        });
    });
});



