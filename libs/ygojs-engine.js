/*jslint node : true*/
'use strict';

var fs = require('fs'),
    stateEngine = require('./ygojs-core'),
    LuaVM = require('lua.vm.js'),
    SQL = require('sql.js'),
    card = require('./ygojs-card.js'),
    effect = require('./ygojs-effect.js'),
    group = require('./ygojs-group.js'),
    duel = require('./ygojs-duel.js'),
    debug = require('./ygojs-debug.js');


function getcards(file) {
    var filebuffer = fs.readFileSync('../http/ygopro/databases/' + file),
        db = new SQL.Database(filebuffer),
        string = "SELECT * FROM datas",
        texts = db.prepare(string),
        asObject = {
            texts: texts.getAsObject({
                'id': 1
            })
        },
        output = [],
        row;

    // Bind new values
    texts.bind({
        name: 1,
        id: 2
    });
    while (texts.step()) { //
        row = texts.getAsObject();
        output.push(row);
    }
    db.close();

    return output;
}

function getCardObject(id, DB) {
    return DB.filter(function (card, index) {
        if (id === card.id) {
            return true;
        } else {
            return false;
        }
    })[0];
}

function startDuel(config, decks, callback) {
    var allCards = [].concat(decks.player1, decks.player2),
        scriptFilenames = allCards.map(function (cardID) {
            return config.folder + 'c' + cardID + '.lua';
        }),
        scripts = scriptFilenames.map(function (filename) {
            return fs.readFileSync(filename, 'utf-8');
        }),
        DB = getcards(config.db),
        state = stateEngine.initEvent(callback),
        lua = new LuaVM.Lua.State(),

        engine = {
            Card: card(state),
            Effect: effect(state),
            Group: group(state),
            Duel: duel(state),
            Debug: debug(state)
        };

    state.startDuel(decks.player1, decks.player2, false);

    state.stack.forEach(function (card) {
        Object.assign(card, getCardObject(card.id, DB));
    });

    engine.Duel.add_process('PROCESSOR_TURN', 0, 0, 0, 0, 0);

}