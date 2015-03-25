/*jslint plusplus: true */
/*jslint node: true*/
var i,
    fs = require("fs"),
    goatnumbers = [],
    goatsql = [],
    goatfile = [
        'LOB',
        'MRD',
        'SRL',
        'PSV',
        'LON',
        'LOD',
        'PGD',
        'MFC',
        'DCR',
        'IOC',
        'AST',
        'SOD',
        'RDS',
        'FET',
        'TLM'];
console.log('mining salt');
//pretty sure you're trying to concat an array (numbers) and a string (Filesync of file) here.....
for (i = 0; goatfile.length > i; i++) {
    goatnumbers = goatnumbers.concat(fs.readFileSync('./' + goatfile[i] + '.txt').toString().split('\n'));
}
console.log('writing sql');
if (goatnumbers.length > 0) {
    console.log('it worked!');
} else {
    console.log('it failed!');
}
for (i = 0; goatnumbers.length > i; i++) {
    var c = 'SELECT * FROM "datas" WHERE "id" = "' + goatnumbers[i] + '";\n';
    goatsql.push(c);
}
for (i = 0; goatnumbers.length > i; i++) {
    var c = 'SELECT * FROM "texts" WHERE "id" = "' + goatnumbers[i] + '";\n';
    goatsql.push(c);
}
goatsql.join('');

console.log('saving salt cake');
fs.writeFileSync('goat.sql', goatsql);
console.log('Salt cake done');