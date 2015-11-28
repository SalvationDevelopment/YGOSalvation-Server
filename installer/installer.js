/*jslint node : true */
'use strict';

//var createMsi = require('msi-packager'),
var version = require('./version.json'),
    extended_fs = require('extended-fs'),
    zipFolder = require('zip-folder'),
    targz = require('targz');
var options = {

    // required 
    source: './input',
    output: './salvation-installer.msi',
    name: 'YGOPro Salvation Server Launcher',
    upgradeCode: '0000-0000-00001',
    version: version.launcher,
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

//extended_fs.copyDir(src, dest, callback);

extended_fs.copyDirSync('../client', './input');
extended_fs.copyDirSync('../server/http/ygopro', './input/ygopro');
extended_fs.copyDirSync('../server/http/license', './input/license');
extended_fs.copyDirSync('../server/http/plugins', './input/plugins');
extended_fs.copyDirSync('./starterDecks', './input/ygopro/deck');
extended_fs.copyDirSync('./textures', './input/ygopro/textures');
extended_fs.copyDirSync('./sound', './input/ygopro/sound');



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


//createMsi(options, function (err) {
//    if (err) {
//        throw err;
//    }
//    console.log('Outputed to ' + options.output);
//
//});

//https://vathsalas.wordpress.com/2013/05/27/creating-installer-with-nsis/