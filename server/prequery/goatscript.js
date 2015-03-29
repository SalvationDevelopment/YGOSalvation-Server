/*jslint plusplus: true */
/*jslint node: true*/
var i,
    fs = require("fs"),
    goatnumbers = [],
    mainlist = [],
    banlist = [],
    ban = [];

console.log('mining salt');
//pretty sure you're trying to concat an array (numbers) and a string (Filesync of file) here.....


goatnumbers = goatnumbers.concat(fs.readFileSync('./goatlist.txt').toString().split('\n'));
mainlist = mainlist.concat(fs.readFileSync('./mainline.txt').toString().split('\n'));

banlist = mainlist.filter(function (item) {
    'use strict';
    return (goatnumbers.indexOf(item) === -1);
    
});

for (i = 1; banlist.length > i; i++) {
    var c = banlist[i].trim() + ' 0\n';
    ban.push(c);
}
out = ban.join('').replace(',', '');

console.log('saving salt cake', ban.length, mainlist.length, goatnumbers.length);
fs.writeFileSync('newban.txt', out);
console.log('Salt cake done');
