/*
Start various sub-servers.
--------------------------
- Game List on port 24555
- YGOPro listener on port 8911, YGOPro applications connect to this port
- YGOPro Web listener on port 8913, browser version connects to this port, 
  and is stripped and routed to the same place as the application. *disabled
- HTTP server running static files out of port 80
- IRC bot connects to #lobby, is named DuelServ
- Update Server is running on port 12000
- Ports 8911, 8913, *80, 12000 need to be free for the server to run.

*/

/*jslint  node: true, plusplus: true*/
'use strict';
var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    processManager = require('child_process'),
    domain = require('domain'), // yay error handling,
    CONFIGURATION = {
        FORUM: 'localforum',
        SITE: 'localhost',
        ProductionFORUM: 'forum.ygopro.us',
        ProductionSITE: 'ygopro.us'
    };

var dependencies = require('./package.json').dependencies,
    modules,
    safe = true,
    moduleIsAvaliable = true;
if (os.platform() === 'win32') {
    for (modules in dependencies) {
        if (dependencies.hasOwnProperty(modules)) {
            moduleIsAvaliable = fs.existsSync('./node_modules/' + modules);
            if (!moduleIsAvaliable) {
                safe = false;
                console.log('Missing module', modules);
            }
        }
    }
}
if (!safe) {
    console.log('Installing missing modules...');
    processManager.execSync('npm install', {
        cwd: '../'
    });
}

var extended_fs = require('extended-fs'),
    colors = require('colors'), // oo pretty colors!
    request = require('request'), //talking HTTP here
    needHTTPMicroService = false, //if there is an HTTPD then dont do anything.
    net = require('net'); // ping!;;

function vgetMSBuildPath(framework) {
    framework = framework || '4.0';
    if (os.platform() === 'linux') {
        return "xbuild";
    }

    var toolsVersion = {
            '2.0': '2.0.50727', // can only target 2.0
            '3.0': '3.0',
            '3.5': '3.5',
            '4.0': '4.0.30319', // can target 2.0, 3.0, 3.5 and 4
            '4.5': '4.0.30319'
        },
        windir = process.env.WINDIR,
        frameworkprocessorDirectory = process.arch ? 'framework64' : 'framework',
        frameworkDirectory = 'v' + toolsVersion[framework];
    return (windir + '\\Microsoft.NET\\' + frameworkprocessorDirectory + '\\' + frameworkDirectory + '\\msbuild.exe').toLowerCase();
}


function makeygosharp(callback) {

    var buildpath = vgetMSBuildPath(),
        solution = ' "' + path.resolve('./ygosharp/source/YGOSharp.sln') + '" ',
        parameters = '/p:Configuration=Release /p:Platform="Any CPU" /t:Clean,Build',
        buildString = buildpath + solution + parameters,
        ygocoreBuilder = processManager.exec(buildString, function () {
            if (os.platform() === 'win32') {
                var binaries = fs.readdirSync('./ygosharp/source/YGOSharp/bin/Release/'),
                    i;
                try {
                    for (i = 0; binaries.length > i; i++) {
                        extended_fs.copyFileSync('./ygosharp/source/YGOSharp/bin/Release/' + binaries[i], './ygosharp/' + binaries[i]);
                    }
                    callback();
                } catch (error) {
                    console.log('Could not put the files in place!');
                }

            } else {
                callback();
            }
        });

    ygocoreBuilder.stdout.on('data', function (data) {
        console.log(data);
    });
    ygocoreBuilder.stdout.on('error', function (error) {
        console.log(error);
    });
}

//var ygopro_core = processManager.exec('./premake4 vs2012', {
//    cwd: path.resolve('../../ygopro-core')
//}, function () {
//    makeYGOProCore();
//});

function bootlogger() {
    console.log('    Logging Enabled @ ../logs'.bold.yellow);
    processManager.fork('./logger.js', [], {
        cwd: 'libs'
    }).on('exit', bootlogger);
}

function manualModeBoot() {
    //console.log('    Logging Enabled @ ../logs'.bold.gold);
    processManager.fork('./manualMode.js', [], {
        cwd: 'libs'
    }).on('exit', manualModeBoot);
}

function deckstorageBoot() {
    console.log('    DeckStorage Online');
    processManager.fork('./deckstorage.js', [], {
        cwd: 'libs'
    }).on('exit', deckstorageBoot);
}

function bootHTTPServer() {
    console.log('    HTTP Server @ port 80'.bold.yellow);
    processManager.fork('./httpserver.js', [], {
        cwd: 'libs',
        env: CONFIGURATION
    }).on('exit', bootHTTPServer);
}

function bootGameList() {
    console.log('    Primus Server Game Manager @ port 24555'.bold.yellow);
    processManager.fork('./gamelist.js', [], {
        cwd: 'libs'
    }).on('exit', bootGameList);
}

function bootManager() {
    console.log('    YGOSharp Service @ port 8911'.bold.yellow);
    processManager.fork('./game-manager.js', [], {
        cwd: 'libs'
    }).on('exit', bootManager);
}

function bootUpdateSystem() {
    console.log('    Update System @ port 12000'.bold.yellow);
    processManager.fork('../libs/update.js', [], {
        cwd: 'http'
    }).on('exit', bootUpdateSystem);
}

function bootAISystem() {
    setTimeout(function () {
        console.log('    AI[SnarkyChild] connecting to port 127.0.0.1:24555 '.bold.yellow);
        processManager.fork('./ai.js', [], {
            cwd: 'libs'
        }).on('exit', bootAISystem);
    }, 10000);
}

function bootFlashPolicyServer() {
    console.log('    Flash Policy @ Port 843'.bold.yellow);
    processManager.fork('./policyserver.js', [], {
        cwd: 'libs'
    }).on('exit', bootFlashPolicyServer);
}

function bootIRC() {
    console.log('    IRCServer Started'.bold.yellow);
    processManager.exec('./inspircd.exe', [], {
        cwd: '../../Salvation-inspire-ws-binary'
    }, bootIRC);
}

function main() {
    var mainStack = domain.create();

    mainStack.on('error', function (err) {
        console.error((new Date()).toUTCString(), ' mainStackException:', err.message);
    });
    mainStack.run(function () {

        //segfaultHandler.registerHandler("crash.log"); // With no argument, SegfaultHandler will generate a generic log file name
        process.title = 'YGOPro Salvation Server ' + new Date();
        console.log('YGOPro Salvation Server - Saving Yu-Gi-Oh!'.bold.yellow);

        //boot the microservices

        //boot IRC
        //boot anope
        //boot 
        bootGameList();
        bootFlashPolicyServer();
        setTimeout(function () {
            bootUpdateSystem();
            bootlogger();
            //manualModeBoot();
        }, 1000);
        setTimeout(function () {
            bootManager();
            bootAISystem();
            deckstorageBoot();
            //manualModeBoot();

        }, 2000);


        var httpcheck = net.createServer(),
            localhost = process.env.MAINSITE || '127.0.0.1';

        httpcheck.once('error', function (err) {
            httpcheck.close();
            return;
        });

        httpcheck.once('listening', function () {
            // close the server if listening doesn't fail
            httpcheck.close();
            bootHTTPServer();
        });
        httpcheck.listen(80, localhost);

    });
    delete process.send; // in case we're a child process
}


function checkDependencies() {
    var servercoreIsInPlace = true,
        ocgcoreIsInPlace = false;


    if (os.platform() === 'win32') {
        if (!fs.existsSync('./ygosharp/YGOSharp.exe')) {
            console.log('/ygosharp/YGOServer.exe is missing!');
            servercoreIsInPlace = false;
        }
        if (!fs.existsSync('./ygosharp/OcgWrapper.dll')) {
            console.log('/ygosharp/OcgWrapper.dll is missing!');
            servercoreIsInPlace = false;
        }
        if (!fs.existsSync('./ygosharp/Mono.Data.Sqlite.dll')) {
            console.log('/ygosharp/Mono.Data.Sqlite.dll!');
            servercoreIsInPlace = false;
        }
        if (!fs.existsSync('./ygosharp/sqlite3.dll')) {
            console.log('/ygosharp/sqlite3.dll!');
            servercoreIsInPlace = false;
        }
        if (!fs.existsSync('./ygosharp/SevenZip.dll')) {
            console.log('/ygosharp/SevenZip.dll!');
            servercoreIsInPlace = false;
        }
        if (!fs.existsSync('./ygosharp/YGOSharp.Network.dll')) {
            console.log('/ygosharp/YGOSharp.Network.dll!');
            servercoreIsInPlace = false;
        }
        if (!fs.existsSync('./ygosharp/ocgcore.dll')) {
            try {
                extended_fs.copyFileSync('./ocgcore/bin/release/ocgcore.dll', './ygosharp/ocgcore.dll');
            } catch (error) {
                console.log('/ygosharp/ocgcore.dll is missing please compile it!');
            }
        }
        if (!servercoreIsInPlace) {
            console.log('Attempting to compile missing binaries');
            makeygosharp(main);
        } else {
            main();
        }

    }
}



// segfaultHandler = require('segfault-handler'); //http://imgs.xkcd.com/comics/compiler_complaint.png
//https://www.npmjs.com/package/segfault-handler
checkDependencies();