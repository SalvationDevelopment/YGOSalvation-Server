/* jslint node : true */
var fs = require('fs');
var childProcess = require('child_process');

function createDateString(dateObject) {
    return "[" + dateObject.getHours() + ":" + dateObject.getMinutes() + "]";
}

function startCore() {
    fs.exists(__dirname + '/../ygocore/YGOServer.exe', function (exist) {
        if (!exist) {
            console.log('core not found at ' + __dirname + '/' + '../ygocore');
            return;
        }

        var core = childProcess.spawn(__dirname + '/../ygocore/YGOServer.exe', ['8911', '2-config.txt'], {
            cwd: __dirname + '/../ygocore'
        }, function (error, stdout, stderr) {
            console.log(createDateString(new Date()) + ' CORE Terminated', error, stderr, stdout);
        });
        core.stdout.on('error', function (error) {
            console.log(createDateString(new Date()) + ' core error', error);
        });
        core.stdout.on('data', function (core_message) {
            console.log(createDateString(new Date()), core_message);
        });

    });
}

startCore();