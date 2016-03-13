// clientDuelInterface.js
var manual,
    uid = generateUID(),
    activeDuels = {},
    banlists = {},
    databases = [
        "0-en-OCGTCG",
        "1-Anime",
        "2-MonsterLeague",
        "3-Goats",
        "4-Newgioh",
        "Z-CWA"
    ],
    HEARTBEAT = "heartBeat",
    HEARTBEAT_INTERVAL = 36000,
    ROLE_SPECTATOR = 0,
    ROLE_HOST = 1,
    ROLE_PLAYER_TWO = 2,
    ROLE_PLAYER_THREE = 3,
    ROLE_PLAYER_FOUR = 4,
    CARD_TOKEN = "Token",
    POSITION_FACEDOWN = 0,
    POSITION_FACEUP = 1,
    POSITION_FACEDOWN_ATK = 2,
    POSITION_FACEUP_DEF = 3,
    DRAW_PHASE = "Draw Phase",
    STANDBY_PHASE = "Standby Phase",
    MAIN_PHASE_ONE = "Main Phase 1",
    BATTLE_PHASE = "Battle Phase",
    MAIN_PHASE_TWO = "Main Phase 2",
    END_PHASE = "End Phase",
    HAND = "Hand",
    MONSTER_ZONE = "Monster Zone",
    SPELL_ZONE = "Spell Zone",
    PENDULUM_ZONE = "Pendulum Zone",
    FIELD_ZONE = "Field Zone",
    GRAVEYARD = "Graveyard",
    BANISHED_ZONE = "Banished Zone",
    EXTRA_DECK = "Extra Deck",
    DECK = "Deck",
    LP = "LP",
    QUERY_CHANGE_POSITION = "changePosition",
    QUERY_CHANGE_FLIPSTATUS = "changeFlipStatus",
    QUERY_ADD_LP = "addLP",
    QUERY_SUB_LP = "subLP",
    QUERY_CLOSE_DECK = "closeDeck",
    QUERY_VIEW_DECK = "viewDeck",
    QUERY_VIEW_EXTRA = "viewExtra",
    QUERY_DUEL_COMMAND = "duelCommand",
    QUERY_DICE_ROLL = "diceRoll",
    QUERY_COIN_FLIP = "coinFlip",
    QUERY_GET_OPTIONS = "getOptions",
    QUERY_GET_STATE = "getState",
    QUERY_START_DUEL = "startDuel",
    QUERY_XYZ_SUMMON = "xyzSummon",
    CHANGING_FLIPSTATUS = "changingFlipStatus",
    CLOSING_DECK = "closingDeck",
    VIEWING_DECK = "viewingDeck",
    VIEWING_EXTRA = "viewingExtra";
$(function() {
    if (!manual) {
        manual = new Primus(PRIMUS_WS_ADDR);
        manual.on('open', function () {
            manual.on('data', function (data) {
                handleServerEvent(manual, data);
            });
            setTimeout(function () {
                manual.write({
                    action: HEARTBEAT,
                    uid: uid
                });
            }, HEARTBEAT_INTERVAL);
        });
    }
});

function handleServerEvent (connection, data) {
    // TBD
}

function generateUID() {
    var generatedString = "",
        minimumLength = 16,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    while (generatedString.length <= minimumLength) {
        generatedString += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return generatedString;
}