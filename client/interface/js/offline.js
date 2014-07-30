/* jslint jquery : true */
/* global  prompt, alert, localStorage */
/* exported  connectToCheckmateServer, applySettings, saveSettings, isChecked, openScreen*/
//development, stage, production
var developmentstage = {
    "production": "http://salvationdevelopment.com/launcher/launcher.html",
    "stage": "http://localhost:80/launcher.html",
    "development": "../../server/http/launcher.html",
};
var mode = 'development';



function ygopro(parameter) {
    $.ajax('http://127.0.0.1:9467/' + parameter);
}

function connectToCheckmateServer() {
    var chkusername = prompt("Please enter your name Checkmate Server Username", localStorage.chknickname);
    while (!chkusername) {
        chkusername = prompt("Please enter your name Checkmate Server Username", localStorage.chknickname);
    }
    var pass = prompt("Please enter your name Checkmate Server Password", '');
    var nickname = chkusername + '$' + pass;
    if (nickname.length > 19 && chkusername.length > 0) {
        alert('Username and Password combined must be less than 19 charaters');
        return;
    }
    localStorage.chknickname = chkusername;
    localStorage.lastip = '173.224.211.158\r\n';
    localStorage.lastport = '21001\r\n';
    ygopro('j');
}

function applySettings() {
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost');
        var value = ('1\r\n' === localStorage[property]) ? true : false;
        $(this).prop('checked', value);
    });
}

function saveSettings() {
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost');
        localStorage[property] = Number($(this).prop('checked')) + '\r\n';
    });
}

function isChecked(id) {
    return ($(id).is(':checked'));
}


$('document').ready(function () {
    $('#servermessages').text('You are currently offline, please restart when you have an internet connection');
    $('main').load(developmentstage[mode]);

});

function closeAllScreens() {
    $('#salvationdevelopment').css('display', 'block');
    $('#staticbar section').css('display', 'none');
}

function openScreen(id) {

    closeAllScreens();
    $('#salvationdevelopment').css('display', 'none');
    $(id).toggle();
}