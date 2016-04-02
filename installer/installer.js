/*jslint node : true */
'use strict';


var extended_fs = require('extended-fs'),
    zipFolder = require('zip-folder'),
    targz = require('targz');
var exec = require('child_process').execSync;
var cmd = '"C://Program Files (x86)//NSIS//makensis.exe" /v0 SalvInstall.nsi';



var options = {

    // required 
    source: './input',
    output: './salvation-installer.msi',
    name: 'YGOPro Salvation Server Launcher',
    upgradeCode: '0000-0000-00001',
    //version: version.launcher,
    manufacturer: 'ygopro.us',
    iconPath: './installer-icon.ico',
    executable: 'Launcher.exe',

    // optional 
    description: "Exclusive launcher system for the YGOPro Salvation Server",
    arch: 'x86',
    localInstall: true

};


//do the following synchronously
// copy client over
// copy ygopro over
// copy license
// copy decks over
// copy default templates over
// copy default sounds and music over

//compile installer from those files

//extended_fs.copyDir(src, dest, callback);

extended_fs.copyDirSync('../client', './input');
extended_fs.copyDirSync('../http/ygopro', './input/ygopro');
extended_fs.copyDirSync('../http/license', './input/license');
extended_fs.copyDirSync('../http/plugins', './input/plugins');
extended_fs.copyDirSync('./starterDecks', './input/ygopro/deck');
extended_fs.copyDirSync('./textures', './input/ygopro/textures');
extended_fs.copyDirSync('./sound', './input/ygopro/sound');

// compile Installer
exec(cmd, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
    zipFolder('./input', 'output/installer.zip', function (err) {
        if (err) {
            console.log('oh no!', err);
        } else {
            // compress files into tar.gz archive 
            targz.compress({
                src: './input',
                dest: 'output/installer.tar.gz'
            }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Done!");
                }
            });
        }
    });

});