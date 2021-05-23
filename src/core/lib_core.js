/**
 * Creates an interface to to edopro-core
 */

const {
    uint32_t,
    uint8_t,
    uint32_t_pointer,
    OCG_Duel,
    OCG_DuelOptions,
    OCG_NewCardInfo,
    OCG_QueryInfo,
    OCG_Duel_pointer } = require('./lib_core_h'),
    ffi = require('ffi'),
    path = require('path'),
    os = require('os'),
    platform = os.platform(),
    arch = os.arch(),
    fileExtension = (platform === 'win32') ? 'dll' : 'so',
    core_location = path.resolve(__dirname, `./bin/${platform}/${arch}/ocgcore.${fileExtension}`);

exports = function () {
    return new ffi.Library(core_location, {
        OCG_GetVersion: ['void', ['int*', 'int*']],
        OCG_CreateDuel: ['int', [OCG_Duel_pointer, OCG_DuelOptions]],
        OCG_DestroyDuel: ['void', [OCG_Duel]],
        OCG_DuelNewCard: ['void', [OCG_Duel, OCG_NewCardInfo]],
        OCG_StartDuel: ['void', [OCG_Duel]],
        OCG_DuelProcess: ['int', [OCG_Duel]],
        OCG_DuelGetMessage: ['void*', [OCG_Duel, uint32_t_pointer]],
        OCG_DuelSetResponse: ['void', [OCG_Duel, 'void*', uint32_t]],
        OCG_LoadScript: ['int', [OCG_Duel, 'char*', uint32_t, 'char*']],
        OCG_DuelQueryCount: [uint32_t, [OCG_Duel, uint8_t, uint32_t]],
        OCG_DuelQuery: ['void*', [OCG_Duel, uint32_t_pointer, OCG_QueryInfo]],
        OCG_DuelQueryLocation: ['void*', [OCG_Duel, uint32_t_pointer, OCG_QueryInfo]],
        OCG_DuelQueryField: ['void*', [OCG_Duel, uint32_t_pointer]]
    });
};

/**
\*** CORE INFORMATION ***\
OCGAPI void OCG_GetVersion(int* major, int* minor);
\* OCGAPI void OCG_GetName(const char** name); Maybe created by git hash? *\

\*** DUEL CREATION AND DESTRUCTION ***\
OCGAPI int OCG_CreateDuel(OCG_Duel* duel, OCG_DuelOptions options);
OCGAPI void OCG_DestroyDuel(OCG_Duel duel);
OCGAPI void OCG_DuelNewCard(OCG_Duel duel, OCG_NewCardInfo info);
OCGAPI void OCG_StartDuel(OCG_Duel duel);

\*** DUEL PROCESSING AND QUERYING ***\
OCGAPI int OCG_DuelProcess(OCG_Duel duel);
OCGAPI void* OCG_DuelGetMessage(OCG_Duel duel, uint32_t* length);
OCGAPI void OCG_DuelSetResponse(OCG_Duel duel, const void* buffer, uint32_t length);
OCGAPI int OCG_LoadScript(OCG_Duel duel, const char* buffer, uint32_t length, const char* name);

OCGAPI uint32_t OCG_DuelQueryCount(OCG_Duel duel, uint8_t team, uint32_t loc);
OCGAPI void* OCG_DuelQuery(OCG_Duel duel, uint32_t* length, OCG_QueryInfo info);
OCGAPI void* OCG_DuelQueryLocation(OCG_Duel duel, uint32_t* length, OCG_QueryInfo info);
OCGAPI void* OCG_DuelQueryField(OCG_Duel duel, uint32_t* length);

 */