/* jslint node : true */

/* global localStorage, require */
//development, stage, production
var os = require('os');
var http = require('http');
var url = require('url');
var child_process = require('child_process');
var fs = require('fs');
var operating_system = os.platform();
var platform = {
    win32 : 'ygopro.exe',
    win64 : 'ygopro.exe'
};
console.log(operating_system);
var executable = platform[operating_system] || 'ygopro';
require('nw.gui').Window.get().showDevTools();

var settings = ['use_d3d', 'antialias', 'errorlog', 'nickname', 'roompass', 'lastdeck', 'textfont', 'numfont', 'fullscreen', 'enable_sound',
'sound_volume', 'enable_music', 'music_volume', 'skin_index', 'auto_card_placing', 'random_card_placing', 'auto_chain_order', 'no_delay_for_chain',
'enable_sleeve_loading', 'serverport', 'lastip', 'textfontsize', 'lastport'];

try {
    var localStorageExist = localStorage;
} catch (e) {
    /*jshint -W020 */
    localStorage = {};

}
try {
    var normal = true;
    var template = fs.readFileSync('./interface/template.ini', 'utf-8');
} catch (e) {
    var normal = false;
    var template = fs.readFileSync('./interface/template.ini', 'utf-8');
}
for (var i = 0; settings.length > i; i++) {
    if (!localStorageExist || !localStorage[settings[i]]) {
        localStorage.use_d3d = '0\r\n';
        localStorage.antialias = '0\r\n';
        localStorage.errorlog = '0\r\n';
        localStorage.nickname = 'Player\r\n';
        localStorage.roompass = '\r\n';
        localStorage.lastdeck = '\r\n';
        localStorage.textfont = 'simhei.ttf';
        localStorage.textfontsize = '12\r\n';
        localStorage.numfont = 'arialbd.ttf\r\n';
        localStorage.serverport = '8911\r\n';
        localStorage.lastip = '127.0.0.1\r\n';
        localStorage.lastport = '8911\r\n';
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
console.log('Starting Offline Server');
http.createServer(function (request, response) {
    var parameter = url.parse(request.url);
    var letter = parameter.path.slice(-1);
    runYGOPro('-' + letter, function () {
        console.log('!',parameter.path);
    });
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    response.end('');
}).listen(9467, '127.0.0.1');

function runYGOPro(mode, callback) {
    //console.log(template);
    var systemConf = template;
    
    function fillInData(form, placeholder, value) {
        form = form.replace(placeholder, value);
        return form;
    }
    for (var i = 0; settings.length > i; i++) {
        systemConf = fillInData(systemConf, '{' + settings[i] + '}', localStorage[settings[i]]);
    }
    var path =  './ygopro/system.CONF';
    fs.writeFile(path, systemConf, function (err) {
        if (err) {
            console.log('file permission error, cant edit ' + path);

        }
        console.log(mode);
        //console.log('It\'s saved!');
        child_process.execFile(executable, [mode], {
            cwd: './ygopro'
        }, function (error) {
            if (error !== null) {
                //write crash report;
                console.log('YGOPro Crashed');
                var filelocation = 'crash_report_YGOPro_' + (new Date().toDateString) + '.log';
                fs.writeFile(filelocation, error, function () {});
            }
            //            fs.readFile(__dirname + '/../../ygopro/system.CONF', function (error, file) {
            //                if (error !== null) {
            //                    console.log('file permission error, cant read system.conf');
            //                    throw err;
            //                }
            //                console.log("file os =", file, typeof file);
            //                var options = file.split('\r\n');
            //                console.log(options);
            //            });
        });
        callback();
    });
}