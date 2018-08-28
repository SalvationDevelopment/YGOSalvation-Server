const enums = require('./translate_ygopro_enums.js');

function sendBufferToPlayer(player, messageType, buffer, length) {
    player.write(messageType);
    player.write(length);
    player.write(buffer);
}



function analyze(engineBuffer, engLen, players, game) {

    function refreshMzone(player, flag, use_cache) {
        const query_buffer = Buffer.alloc(0x2000);
        query_buffer.writeInt8(enums.STOC.STOC_GAME_MSG.MSG_UPDATE_DATA);
        query_buffer.writeInt8(player);
        query_buffer.writeInt8(LOCATION_MZONE);
        var len = game.query_field_card(game.pduel, player, LOCATION_MZONE, flag, query_buffer, use_cache);

    }
    console.log(engLen, engineBuffer);

    return 2;
}

module.exports = analyze;