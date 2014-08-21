// carddb-update.js

var sqlite3 = require("sqlite3").verbose();
var cdbPath = "../../http/ygopro/cards.cdb";
var idArray = [];
var c;
var query = "SELECT `id` FROM `datas`";
var cdb = new sqlite3.Database(cdbPath);

cdb.serialize(function(){
	cdb.each(query, function(error,row){
		if(error){
			throw error;
		}
		idArray.push(row.id);
	});
});
cdb.close();

while(c=idArray.pop()){
	console.log(c);
}