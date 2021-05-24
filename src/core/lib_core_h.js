/**
 * All the different ffi-types needed to interact with edopro-core
 * Giving the structs an formed object will create the buffer needed to send in.
 */


/**
 * @useage
 * const options = OCG_DuelOptions({ seed, flags, cardReaderDone, payload4 })
 * const corebound_cardInfo = OCG_NewCardInfo({ team, duelist, code, con, loc, seq, pos });
 * const query_for_core = OCG_QueryInfo({ flags, con, loc, seq, overlay_seq });
 */
const struct = require('ref-struct'),
    refArray = require('ref-array'),
    ref = require('ref'),
    uint64_t = ref.types.uint64,
    uint32_t = ref.types.uint32,
    uint16_t = ref.types.uint16,
    uint8_t = ref.types.uint8,
    uint16_t_pointer = ref.refType(uint16_t),
    uint32_t_pointer = ref.refType(uint32_t),
    int32_t = ref.types.uint32,
    Array_uint16_t = refArray(uint16_t),
    OCG_Duel = 'pointer',
    OCG_DataReader = 'pointer',
    OCG_ScriptReader = 'pointer',
    OCG_LogHandler = 'pointer',
    OCG_DataReaderDone = 'pointer',
    OCG_CardData = struct({
        code: uint32_t,
        alias: uint32_t,
        setcode: uint16_t_pointer,
        type: uint32_t,
        level: uint32_t,
        attribute: uint32_t,
        race: uint32_t,
        attack: int32_t,
        defence: int32_t,
        lscale: uint32_t,
        rscale: uint32_t,
        link_marker: uint32_t
    }),
    OCG_CardData_pointer = ref.refType(OCG_CardData),
    OCG_Player = struct({
        startingLP: uint32_t,
        startingDrawCount: uint32_t,
        drawCountPerTurn: uint32_t
    }),
    OCG_DuelOptions = struct({
        seed: uint32_t,
        flags: uint64_t,
        team1: OCG_Player,
        team2: OCG_Player,
        cardReader: OCG_DataReader,
        payload1: 'void*', /* relayed to cardReader */
        scriptReader: OCG_ScriptReader,
        payload2: 'void*', /* relayed to scriptReader */
        logHandler: OCG_LogHandler,
        payload3: 'void*',  /* relayed to errorHandler */
        cardReaderDone: OCG_DataReaderDone,
        payload4: 'void*'  /* relayed to cardReader */
    }),
    OCG_NewCardInfo = struct({
        team: uint8_t, /* either 0 or 1 */
        duelist: uint8_t, /* index of original owner */
        code: uint32_t,
        con: uint8_t,
        loc: uint32_t,
        seq: uint32_t,
        pos: uint32_t
    }),
    OCG_QueryInfo = struct({
        flags: uint32_t,
        con: uint8_t,
        loc: uint32_t,
        seq: uint32_t,
        overlay_seq: uint32_t
    }),
    OCG_Duel_pointer = ref.refType(OCG_Duel);




module.exports = {
    uint64_t,
    uint32_t,
    uint8_t,
    uint32_t_pointer,
    OCG_Duel,
    Array_uint16_t,
    OCG_CardData,
    OCG_Player,
    OCG_DuelOptions,
    OCG_NewCardInfo,
    OCG_QueryInfo,
    OCG_CardData_pointer,
    OCG_Duel_pointer
};