/*jslint node : true*/
'use strict';

var fs = require('fs'),
    stateEngine = require('./ygojs-core'),
    scriptInterpreter = require('./ygojs-scriptsfuncs.js'),
    LuaVM = require('lua.vm.js'),
    SQL = require('sql.js');


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

        Card = scriptInterpreter.Card(state),
        Effect = scriptInterpreter.Effect(state),
        Group = scriptInterpreter.Group(state);

    state.startDuel(decks.player1, decks.player2, false);

    state.stack.forEach(function (card) {
        Object.assign(card, getCardObject(card.id, DB));
    });

}