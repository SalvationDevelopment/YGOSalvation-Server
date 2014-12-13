/* jslint jquery : true */
/* global  prompt, alert, localStorage, developmentstage, mode */
/* exported  connectToCheckmateServer, applySettings, saveSettings, isChecked, openScreen*/
var joinGamelist = function(){},
    leaveGamelist= function(){},
    hostGame= function(){},
    connectgamelist= function(){},
    enterGame= function(){},
    setHostSettings= function(){};
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
    localStorage.lastip = '173.224.211.158';
    localStorage.lastport = '21001';
    ygopro('j');
}

function applySettings() {
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost');
        var value = ('1' === localStorage[property]) ? true : false;
        $(this).prop('checked', value);
    });
}

function saveSettings() {
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost');
        localStorage[property] = Number($(this).prop('checked')) ;
    });
}

function isChecked(id) {
    return ($(id).is(':checked'));
}


$('document').ready(function () {
    $('main').load(developmentstage[mode]+'/?'+Math.random(), function(){

            if (window.self != window.top) {
                $(document.body).addClass("in-iframe");
                var gui = require('nw.gui');
                $(document).ready(function(){
                   gui.Window.get().show();
                });
               
            }

    });
    

});
var openid = '';
function closeAllScreens() {
    $('#salvationdevelopment').css('display', 'block');
    $('#staticbar section').css('display', 'none');
    openid = '';
}

function openScreen(id) {
    if(id === openid){
        closeAllScreens();
        return;
    }
    closeAllScreens();
    $('#salvationdevelopment').css('display', 'none');
    $(id).toggle();
    id = openid;
    return;
}