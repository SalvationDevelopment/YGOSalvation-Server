/* eslint-disable no-sync */

/**
 * One to One foreign function interface to ygopro-core.
 * More information at https://github.com/edo9300/ygopro-core
 * @module
 * @type {coreInterface}
 */

const fs = require('fs'),
    fastcall = require('fastcall'),
    os = require('os'),
    path = require('path'),
    ref = fastcall.ref,
    bytePointer = ref.refType(ref.types.byte),
    voidPointer = ref.refType(ref.types.void),
    core_location = path.resolve(__dirname, `../bin/${os.platform()}/${os.arch()}/ocgcore.dll`),
    coreIsAvaliable = fs.existsSync(core_location);

/**
 * @typedef coreInterfaceDefinition
 * @type {Object}
 * @property {Array} [card_reader_function]
 * @property {Array} [responsei_function]
 * @property {Array} [script_reader_function]
 * @property {Array} [message_handler_function]
 * @property {Array} [set_script_reader]
 * @property {Array} [set_card_reader]
 * @property {Array} [set_message_handler]
 * @property {Array} [create_duel]
 * @property {Array} [start_duel]
 * @property {Array} [end_duel]
 * @property {Array} [set_player_info]
 * @property {Array} [get_log_message]
 * @property {Array} [get_message]
 * @property {Array} [process]
 * @property {Array} [new_card]
 * @property {Array} [new_tag_card]
 * @property {Array} [query_card]
 * @property {Array} [query_field_count]
 * @property {Array} [query_field_card]
 * @property {Array} [query_field_info]
 * @property {Array} [set_responsei]
 * @property {Array} [set_responseb]
 * @property {Array} [preload_script]
 */

/**
 * @typedef coreInterface
 * @type {Object}
 * @property {Function} card_reader_function
 * @property {Function} responsei_function
 * @property {Function} script_reader_function
 * @property {Function} message_handler_function
 * @property {Function} set_script_reader           set script reading callback function
 * @property {Function} set_card_reader             set card reader callback function
 * @property {Function} set_message_handler         set messaging handle callbackfunction
 * @property {Function} create_duel                 create a new duel
 * @property {Function} start_duel                  start a duel
 * @property {Function} end_duel                    end a duel
 * @property {Function} set_player_info             set player information of a duel
 * @property {Function} get_log_message             get log message from a duel
 * @property {Function} get_message                 get result of the last process tick
 * @property {Function} process                     tick a duel
 * @property {Function} new_card                    add a new card to a duel
 * @property {Function} new_tag_card                add a new offscreen card to a duel
 * @property {Function} query_card                  query information about a specific card in a duel
 * @property {Function} query_field_count           query the number of cards in a sub field of a duel
 * @property {Function} query_field_card            query information of a collection of cards 
 * @property {Function} query_field_info            query information of a field zone
 * @property {Function} set_responsei               set game response using an intger
 * @property {Function} set_responseb               set game response using a byte
 * @property {Function} preload_script              load helper functions or additional game mechanics
 */


/**
 * Callback signiture for sending information from the `datas` table into ygopro-core.
 * @example
 * card_reader_function(eightDigitPasscode){return cardStructure(database[eightDigitPasscode])};
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function card_reader_function() {
    const StructType = fastcall.StructType,
        cardStructure = new StructType({
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
        cardDataPointer = ref.refType(cardStructure);
    return { card_reader_function: ['uint32', ['uint32', cardDataPointer]] };
}


/**
 * Callback signiture for responding to script request, create a function like the following:
 * @example
 * function scriptReaderCallback(filename, returnBuffer){}
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function script_reader_function() {
    return { script_reader_function: ['pointer', ['string', 'uint32*']] };
}


/**
 * Callback signiture for reading messages from the core. Create a function like the following:
 * @example
 * function messageHandlerCallback(messagepointer, length){ return new Buffer(messagepointer.deref(), length)}
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function message_handler_function() {
    return { message_handler_function: ['uint32', [voidPointer, 'uint32']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function responsei_function() {
    return { responsei_function: ['int32', [voidPointer, 'uint32']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function set_script_reader() {
    return { set_script_reader: [bytePointer, ['script_reader_function']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function set_card_reader() {
    return { set_card_reader: ['void', ['card_reader_function']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function set_message_handler() {
    return { set_message_handler: ['void', ['message_handler_function']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function create_duel() {
    return { create_duel: ['pointer', ['uint32']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function start_duel() {
    return { start_duel: ['void', ['pointer', 'int']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function end_duel() {
    return { end_duel: ['void', ['pointer']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function set_player_info() {
    return { set_player_info: ['void', ['pointer', 'int32', 'int32', 'int32', 'int32']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function get_log_message() {
    return { get_log_message: ['void', ['pointer', bytePointer]] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function get_message() {
    return { get_message: ['int32', ['pointer', bytePointer]] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function tick() {
    return { process: ['int32', ['pointer']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function new_card() {
    return { new_card: ['void', ['pointer', 'uint32', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function new_tag_card() {
    return { new_tag_card: ['void', ['pointer', 'uint32', 'uint8', 'uint8']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function query_card() {
    return { query_card: ['int32', ['pointer', 'uint8', 'uint8', 'int32', bytePointer, 'int32']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function query_field_count() {
    return { query_field_count: ['int32', ['pointer', 'uint8', 'uint8']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function query_field_card() {
    return { query_field_card: ['int32', ['pointer', 'uint8', 'uint8', 'int32', bytePointer, 'int32']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function query_field_info() {
    return { query_field_info: ['int32', ['pointer', bytePointer]] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function set_responsei() {
    return { set_responsei: ['void', ['pointer', 'int32']] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function set_responseb() {
    return { set_responseb: ['void', ['pointer', bytePointer]] };
}

/**
 * @returns {coreInterfaceDefinition} ygopro-core inferface definition. 
 */
function preload_script() {
    return { set_responseb: ['int32', ['pointer', 'string', 'int32']] };
}

/**
 * @class
 * @returns {coreInterface}
 */
function CoreInterface() {
    if (!coreIsAvaliable) {
        throw new Error(`Can not find compiled version of ygopro-core (Edo) for: ${core_location}`);
    }

    const ygoproCore = new fastcall.Library(core_location).
        callback(card_reader_function()).
        callback(responsei_function()).
        callback(script_reader_function()).
        callback(message_handler_function()).
        function(set_script_reader()).
        function(set_card_reader()).
        function(set_message_handler()).
        function(create_duel()).
        function(start_duel()).
        function(end_duel()).
        function(set_player_info()).
        function(get_log_message()).
        function(get_message()).
        function(tick()).
        function(new_card()).
        function(new_tag_card()).
        function(query_card()).
        function(query_field_count()).
        function(query_field_card()).
        function(query_field_info()).
        function(set_responsei()).
        function(set_responseb()).
        function(preload_script());

    return ygoproCore.interface;
}

module.exports = new CoreInterface();