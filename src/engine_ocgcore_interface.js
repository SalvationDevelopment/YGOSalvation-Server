/**

*/

const fastcall = require('fastcall'),
    arrayBuf = fastcall.ArrayType,
    ref = fastcall.ref,
    bytePointer = ref.refType(ref.types.byte),
    charArray = arrayBuf(ref.types.char),
    voidPointer = ref.refType(ref.types.void),
    uint32Pointer = ref.refType(ref.types.uint32),
    StructType = fastcall.StructType,
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
    core_location = path.resolve('../bin/mr4/ocgcore.dll'),
    cardDataPointer = ref.refType(cardData),
    ocgcore = new fastcall.Library(core_location).
callback({ card_reader_function: ['uint32', ['uint32', cardDataPointer]] }).
callback({ responsei_function: ['int32', [voidPointer, 'uint32']] }).
callback({ script_reader_function: ['pointer', ['string', 'uint32*']] }).
callback({ message_handler_function: ['uint32', [voidPointer, 'uint32']] }).
function({ 'set_script_reader': [bytePointer, ['script_reader_function']] }).
function({ 'set_card_reader': ['void', ['card_reader_function']] }).
function({ 'set_message_handler': ['void', ['message_handler_function']] }).
function({ 'create_duel': ['pointer', ['uint32']] }).
function({ 'start_duel': ['void', ['pointer', 'int']] }).
function({ 'end_duel': ['void', ['pointer']] }).
function({ 'set_player_info': ['void', ['pointer', 'int32', 'int32', 'int32', 'int32']] }).
function({ 'get_log_message': ['void', ['pointer', bytePointer]] }).
function({ 'get_message': ['int32', ['pointer', bytePointer]] }).
function({ 'process': ['int32', ['pointer']] }).
function({ 'new_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']] }).
function({ 'new_tag_card': ['void', ['pointer', 'uint32', 'uint8', 'uint8']] }).
function({ 'query_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', bytePointer, 'int32']] }).
function({ 'query_field_count': ['int32', ['pointer', 'uint8', 'uint8']] }).
function({ 'query_field_card': ['int32', ['pointer', 'uint8', 'uint8', 'int32', bytePointer, 'int32']] }).
function({ 'query_field_info': ['int32', ['pointer', bytePointer]] }).
function({ 'set_responsei': ['void', ['pointer', 'int32']] }).
function({ 'set_responseb': ['void', ['pointer', bytePointer]] }).
function({ 'preload_script': ['int32', ['pointer', 'string', 'int32']] });

module.exports = ocgcore.interface;