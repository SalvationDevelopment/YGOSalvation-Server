/*jslint node : true */
'use strict';

var createMsi = require('msi-packager'),
    version = require('./version.json');

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
// copy decks over
// copy ygopro over
// copy default templates over
// copy default sounds and music over

createMsi(options, function (err) {
    if (err) {
        throw err;
    }
    console.log('Outputed to ' + options.output);

});