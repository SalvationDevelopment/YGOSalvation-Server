/* jshint node:true */
/* global module */
/* jslint browser : true */
var sqlite3 = require('sqlite3').verbose();
var ffi = require('ffi'); /* allows dynamic linking of the ocgapi.dll, critical; */
var ref = require('ref'); /* allows use of C++ pointers for C++ JS interactions, critical */
var struct = require('ref-struct'); /* allows use of C++ structures for C++ JS interactions, critical */


var cardDatabase = new sqlite3.Database('cards.cbd', function () {


});

module.exports = function (scripts) {
    function getScript(identificationNumber) {
        /* pull the script out the cache and send it into the core as a buffer */
        return new Buffer(scripts['c' + identificationNumber]);
    }

    function card_reader(request) {
        /* incomplete */
        var code = request.code;
        var data = request.data;
        var query = cardDatabase.query = "SELECT id, ot, alias, setcode, type, level, race, attribute, atk, def FROM datas";
        return struct({
            code: request.code,
            alias: 'uint32',
            setcode: 'uint64',
            type: 'uint32',
            level: 'uint32',
            attribute: 'uint32',
            race: 'uint32',
            attack: 'int32',
            defence: 'int32'
        });
    }
    this.ocgapi = ffi.Library(__dirname + '/ocgcore.dll', {
        'set_script_reader': ['void', getScript],
        'set_card_reader': ['void', card_reader],
        'set_message_handler': ['void', console.log],
        'create_duel': ['pointer', ['uint32']],
        'start_duel': ['void', ['pointer', 'int']],
        'end_duel': ['void', ['pointer']],
        'set_player_info': ['void', ['pointer', 'int32', 'int32', 'int32', 'int32']],
        'get_log_message': ['void', ['pointer', 'byte*']],
        'get_message': ['int32', ['pointer' /*, get_message_pointer*/
]],
        'process': ['int32', ['pointer']],
        'new_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']],
        'new_tag_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8']],
        'query_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
        'query_field_count': ['int32', ['pointer', 'uint8', 'uint8']],
        'query_field_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', 'byte*', 'int32']],
        'query_field_info': ['int32', ['pointer', 'byte*']],
        'set_responsei': ['void', ['pointer', 'int32']],
        'set_responseb': ['void', ['pointer', 'byte*']],
        'preload_script': ['int32', ['pointer', 'char*', 'int32']]
    });
};