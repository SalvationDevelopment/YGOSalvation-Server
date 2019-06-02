/* eslint-disable new-cap */
/**

*/

const ffi = require('ffi'),
    ref = require('ref'),
    bytePointer = ref.refType(ref.types.byte),
    voidPointer = ref.refType(ref.types.void),
    StructType = require('ref-struct'),
    cardData = new StructType({
        code: ref.types.uint32,
        alias: ref.types.uint32,
        setcode: ref.types.uint64,
        type: ref.types.uint32,
        level: ref.types.uint32,
        attribute: ref.types.uint32,
        race: ref.types.uint32,
        attack: ref.types.int32,
        defense: ref.types.int32,
        lscale: ref.types.uint32,
        rscale: ref.types.uint32,
        link: ref.types.uint32
    }),
    path = require('path'),
    os = require('os'),
    core_location = path.resolve(__dirname, `../bin/${os.platform()}/${os.arch()}/ocgcore.dll`),
    cardDataPointer = ref.refType(cardData),
    ocgcore = new ffi.Library(core_location, {
        'set_script_reader': [bytePointer, ['pointer']],
        'set_card_reader': ['void', ['pointer']],
        'set_message_handler': ['void', ['pointer']],
        'create_duel': ['pointer', ['uint32']],
        'start_duel': ['void', ['pointer', 'int']],
        'end_duel': ['void', ['pointer']],
        'set_player_info': ['void', ['pointer', 'int32', 'int32', 'int32', 'int32']],
        'get_log_message': ['void', ['pointer', bytePointer]],
        'get_message': ['int32', ['pointer', bytePointer]],
        'process': ['int32', ['pointer']],
        'new_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']],
        'new_tag_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8']],
        'query_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', bytePointer, 'int32']],
        'query_field_count': ['int32', ['pointer', 'uint8', 'uint8']],
        'query_field_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', bytePointer, 'int32']],
        'query_field_info': ['int32', ['pointer', bytePointer]],
        'set_responsei': ['void', ['pointer', 'int32']],
        'set_responseb': ['void', ['pointer', bytePointer]],
        'preload_script': ['int32', ['pointer', 'string', 'int32']]
    });

module.exports = ocgcore;