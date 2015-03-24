var i,
    fs = require("fs"),
    goatnumbers = [],
    goatsql = [],
    goatfile = [
        'LOB',
        'MRD',
        'MRL',
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
for (i = 0; goatfile.length > i; i++) {
    goatnumbers.concat(fs.readFileSync('./' + goatfile[i] + '.txt').toString().split('\n'));
}
console.log('writing sql');
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
fs.writeFileSynch('goat.sql', goatsql);
console.log('Salt cake done');