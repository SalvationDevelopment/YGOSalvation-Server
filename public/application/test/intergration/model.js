var lobby = {

};

function fieldmodel() =
    return {
        HAND: [],
        MONSTERZONE: [null, null, null, null, null],
        SPELLZONE: [null, null, null, null, null, null],
        GRAVE: [],
        REMOVED: [],
        DECK: [],
        EXTRA: []
    };
}
var player0 = fieldmodel();
var player1 = fieldmodel();

var ygoMODEL = {
    activeplayer: 0,
    activephase: 0,
    0: player0,
    1: player1
};