/*jslint  node: true, plusplus: true*/
var ldap = require('ldapjs'),
    dataBaseKey = require('../../../databasePassword.json') || '';
client = ldap.createClient({
    url: 'ldap://127.0.0.1:1389'
});


client.bind('cn=root', dataBaseKey.password, function (err) {
    assert.ifError(err);
});

module.exports = function (cn, sn, bar) {
    client.compare('cn=foo, o=salvation', 'sn', 'bar', function (err, matched) {
        assert.ifError(err);

        console.log('matched: ' + matched);
    });
}
