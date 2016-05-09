/*jslint node:true, plusplus:true, bitwise:true */
'use strict';
var LuaVM = require('lua.vm.js');
var fs = require('fs');
var i = fs.readFileSync('../SnarkyLua/AI/ai-child.lua').toString();
global.AI = {
    Chat: function (input, o, a) {
        console.log(this.args, input, o, a);
        return 'hi';
    }
};
var lua = new LuaVM.Lua.State();


function readFiles(dirname, onFileContent, onError) {

    var filenames = fs.readdirSync(dirname);
    filenames.forEach(function (filename) {
        var content = fs.readFileSync(dirname + filename, 'utf-8');
        onFileContent(filename, content);
    });
}

(function getMods(callback) {
    readFiles('../SnarkyLua/AI/mod/', function (filename, content) {

        //global.luadata[filename] = content;
        lua.execute(content);
        console.log('Loaded:', filename);
    });

}());

(function getDecks(callback) {
    readFiles('../SnarkyLua/AI/decks/', function (filename, content) {
        //global.luadata[filename] = content;
        lua.execute(content);
    });

}());
lua._G.set("AI", global.AI);
lua.execute(i);
//lua.execute('OnStartOfDuel()');