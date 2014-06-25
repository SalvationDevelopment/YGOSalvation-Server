/* jslint node : true */
/* jslint browser : true */
/* jslint jquery : true */
/* global alert, prompt */

//development, stage, production
var mode = 'development';

var child_process = require('child_process');
var developmentstage = require('../../servercontrol.json');
var http = require('http');
var fs = require('fs');
var walk = require('fs-walk');
var template;
fs.readFile('application/template.ini', 'utf-8', function (error, data) {
    template = data;
    // there is a data race here.
});

var settings = ['use_d3d', 'antialias', 'errorlog', 'nickname', 'roompass', 'lastdeck', 'textfont', 'numfont', 'fullscreen', 'enable_sound',
'sound_volume', 'enable_music', 'music_volume', 'skin_index', 'auto_card_placing', 'random_card_placing', 'auto_chain_order', 'no_delay_for_chain',
'enable_sleeve_loading', 'serverport', 'lastip', 'textfontsize', 'lastport'];

for (var i = 0; settings.length > i; i++) {
    if (!localStorage[settings[i]]) {
        localStorage.use_d3d = '0\r\n';
        localStorage.antialias = '0\r\n';
        localStorage.errorlog = '0\r\n';
        localStorage.nickname = 'Player\r\n';
        localStorage.roompass = '\r\n';
        localStorage.lastdeck = '\r\n';
        localStorage.textfont = 'simhei.ttf';
        localStorage.textfontsize = '12\r\n';
        localStorage.numfont = 'arialbd.ttf\r\n';
        localStorage.serverport = '7911\r\n';
        localStorage.lastip = '127.0.0.1\r\n';
        localStorage.lastport = '7911\r\n';
        localStorage.fullscreen = '0\r\n';
        localStorage.enable_sound = '1\r\n';
        localStorage.sound_volume = '100\r\n';
        localStorage.enable_music = '0\r\n';
        localStorage.music_volume = '100\r\n';
        localStorage.skin_index = '-1\r\n';
        localStorage.auto_card_placing = '1\r\n';
        localStorage.random_card_placing = '0\r\n';
        localStorage.auto_chain_order = '1\r\n';
        localStorage.no_delay_for_chain = '0\r\n';
        localStorage.enable_sleeve_loading = '0\r\n';
    }
}

function ygopro(mode) {
    var systemConf = template;

    function fillInData(form, placeholder, value) {
        form = form.replace(placeholder, value);
        return form;
    }
    for (var i = 0; settings.length > i; i++) {
        systemConf = fillInData(systemConf, '{' + settings[i] + '}', localStorage[settings[i]]);
    }

    //console.log(systemConf)
    fs.writeFile('ygopro/system.conf', systemConf, function (err) {
        if (err) {
            alert('file permission error, cant edit system.conf');
            throw err;
        }
        //console.log('It\'s saved!');
        child_process.execFile('devpro.dll', [mode], {
            cwd: 'ygopro'
        }, function (error) {
            if (error !== null) {
                //write crash report;
                alert('YGOPro Crashed');
                var filelocation = 'crash_report_YGOPro_' + (new Date().toDateString) + '.log';
                fs.writeFile(filelocation, error, function () {});
            }
            fs.readFile('ygopro/system.conf', function (error, file) {
                if (error !== null) {
                    alert('file permission error, cant read system.conf');
                    throw err;
                }
                var options = file.split('\r\n');
                console.log(options);
            });
        });
    });
}

function connectToCheckmateServer() {
    var username = prompt("Please enter your name Checkmate Server Username", localStorage.nickname);
    var pass = prompt("Please enter your name Checkmate Server Password", '');
    var nickname = username + '$' + pass;
    if (nickname.length > 19 && username.length > 0) {
        alert('Username and Password combined must be less than 19 charaters');
        return;
    }
    localStorage.nickname = nickname;
    localStorage.lastip = '173.224.211.158\r\n';
    localStorage.lastport = '21001\r\n';
    ygopro('-j');
}

function applySettings() {
    $('[data-localhost]').each(function (i) {
        var property = $(this).attr('data-localhost');
        var value = ('1\r\n' === localStorage[property]) ? true : false;
        $(this).prop('checked', value);
    });
}

function saveSettings() {
    $('[data-localhost]').each(function (i) {
        var property = $(this).attr('data-localhost');
        localStorage[property] = Number($(this).prop('checked')) + '\r\n';
    });
}

function isChecked(id) {
    return ($(id).is(':checked'));
}


$('document').ready(function () {
    $('#servermessages').text('You are currently offline, please restart the when you have an internet connection');
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