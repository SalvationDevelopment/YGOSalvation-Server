/* jshint node: true */
var enums = require('./enums.js');
var defineStructure = require('./objectifier.js');

var STOC_TimeLimit = defineStructure({
    player: 'unsigned char',
    left_time: 'unsigned short'
});
//var STOC_Chat = defineStructure( {
//	player:'unsigned short',
//	'unsigned short', msg[256];
//});
var HostInfo = defineStructure({
    lflist: 'unsigned int',
    rule: 'unsigned char',
    mode: 'unsigned char',
    enable_priority: 'bool',
    no_check_deck: 'bool',
    no_shuffle_deck: 'bool',
    start_lp: 'unsigned int',
    start_hand: 'unsigned char',
    draw_count: 'unsigned char',
    time_limit: 'unsigned short',
});

var STOC_HS_WatchChange = defineStructure({
    watch_count: 'unsigned short'
});

module.exports = function recieveSTOC(packet) {
    var task = Object.create(enums.STOCCheck);
    task[packet.STOC] = packet;
    return task;
};