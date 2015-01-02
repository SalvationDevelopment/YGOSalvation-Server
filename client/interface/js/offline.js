/*jslint browser: true, node: true, plusplus: true*/
/*global  prompt, alert, localStorage, developmentstage, mode, $*/
/*exported  connectToCheckmateServer, applySettings, saveSettings, isChecked, openScreen*/

function ygopro(parameter) {
    'use strict';
    $.ajax('http://127.0.0.1:9467/' + parameter);
}

function connectToCheckmateServer() {
    'use strict';
    var pass,
        nickname,
        chkusername = prompt("Please enter your name Checkmate Server Username", localStorage.chknickname);
    while (!chkusername) {
        chkusername = prompt("Please enter your name Checkmate Server Username", localStorage.chknickname);
    }
    pass = prompt("Please enter your name Checkmate Server Password", '');
    nickname = chkusername + '$' + pass;
    if (nickname.length > 19 && chkusername.length > 0) {
        alert('Username and Password combined must be less than 19 charaters');
        return;
    }
    localStorage.chknickname = chkusername;
    localStorage.lastip = '173.224.211.158';
    localStorage.lastport = '21001';
    ygopro('j');
}

function applySettings() {
    'use strict';
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost'),
            value = ('1' === localStorage[property]) ? true : false;
        $(this).prop('checked', value);
    });
}

function saveSettings() {
    'use strict';
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost');
        localStorage[property] = Number($(this).prop('checked'));
    });
}

function isChecked(id) {
    'use strict';
    return ($(id).is(':checked'));
}


$('document').ready(function () {
    'use strict';
    $('main').load(developmentstage[mode] + '?' + Math.random(), function () {

        if (window.self !== window.top) {
            $(document.body).addClass("in-iframe");
            var gui = require('nw.gui');
            $(document).ready(function () {
                gui.Window.get().show();
            });

        }

    });


});
function closeAllScreens() {
    'use strict';
    $('#salvationdevelopment').css('display', 'block');
    $('#staticbar section').css('display', 'none');

}
function openScreen(id) {

    closeAllScreens();
    $('#salvationdevelopment').css('display', 'none');
    $(id).toggle();
}