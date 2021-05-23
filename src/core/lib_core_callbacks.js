/* eslint-disable no-sync */
/* eslint-disable new-cap */

const fs = require('fs'),
    ffi = require('ffi'),
    ref = require('ref'), {
        uint32_t,
        OCG_Duel,
        OCG_CardData,
        OCG_CardData_pointer
    } = require('./lib_core_h');


/**
 * Determine if a card has a certain type. Effect/Fusion/Sychro etc
 * @param {Card} card Card in question
 * @param {Number} type Enum of the type in question
 * @returns {Boolean} result
 */
function hasType(card, type) {
    return ((card.type & type) !== 0);
}

function unMaskedLevel(dbEntry) {
    return dbEntry.level & 0xff;
}

function unMaskDefence(dbEntry) {
    return (hasType(dbEntry, 0x4000000)) ? 0 : dbEntry.def;
}

function unMaskLeftScale(dbEntry) {
    return (dbEntry.level >> 24) & 0xff;
}

function unMaskRightScale(dbEntry) {
    return (dbEntry.level >> 16) & 0xff;
}

function unMaskLinkMarker(dbEntry) {
    return (hasType(dbEntry, 0x4000000)) ? dbEntry.defense : 0
}

function cardReader(database, payload, code, data) {

    const dbEntry = database.find(function (cardEntry) {
        return cardEntry.id === code;
    });

    if (!dbEntry) {
        return;
    }

    data = OCG_CardData({
        code: dbEntry.id,
        alias: dbEntry.alias,
        setcode: dbEntry.setcode,
        type: dbEntry.type,
        level: unMaskedLevel(dbEntry),
        attribute: dbEntry.attribute,
        race: dbEntry.race,
        attack: dbEntry.atk,
        defence: unMaskDefence(dbEntry),
        lscale: unMaskLeftScale(dbEntry),
        rscale: unMaskRightScale(dbEntry),
        link_marker: unMaskLinkMarker(dbEntry)
    }).ref();
}

function scriptReader(scriptsFolder, payload, duel, name) {
    let file = scriptsFolder + '/' + name.substr(9, 13);
    const size = ref.reinterpret(payload.deref()['ref.buffer'], 32);

    if (name === './expansions/script/constant.lua') {
        file = scriptsFolder + '/constant.lua';
    }
    if (name === './expansions/script/utility.lua') {
        file = scriptsFolder + '/utility.lua';
    }
    if (fs.existsSync(file)) {
        try {
            const script = fs.readFileSync(file);
            size.writeUInt32LE(script.length);
            global.gc_protected.push(script);
            return ref.readCString(script, 0);
        } catch (e) {
            return ref.alloc('pointer');
        }
    }

    console.log(name, 'at', file, 'does not exist');
    return ref.alloc('pointer');
}

function logHander(logger, payload, str, type) {
    const types = {
        0: 'LOG_TYPE_ERROR',
        1: 'LOG_TYPE_FROM_SCRIPT',
        2: 'LOG_TYPE_FOR_DEBUG'
    };

    if (!payload.deref()) {
        return;
    }
    logger(types[type], str);
}

function dataReaderDone(payloadPointer, dataPointer) {
    const data = dataPointer.deref(),
        payload = payloadPointer.deref();

    payload.copy(data);
}
function createCardReader(database) {
    return ffi.Callback('void', ['void*', uint32_t, OCG_CardData_pointer],
        (payload, code, data) => cardReader(database, payload, code, data));
}

function createScriptReader(scriptsFolder) {
    return ffi.Callback('int', ['void*', OCG_Duel, 'char*'],
        (payload, duel, name) => scriptReader(scriptsFolder, payload, duel, name));
}
function createLogHandler(logger) {
    return ffi.Callback('void', ['void*', 'char*', 'int'],
        (payload, str, type) => logHander(logger, payload, str, type));
}

function createDataReaderDone() {
    return 
}
module.export = {
    createCardReader,
    createScriptReader,
    createLogHandler,
    dataReaderDone : ffi.Callback('void', ['void*', OCG_CardData_pointer], dataReaderDone)
};