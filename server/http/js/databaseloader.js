var database = {};
//get datbase

$.getJSON('http://ygopro.us/manifest/database.json', function processDB(information) {
    'use strict';
    var iteration = 0;
    for (iteration; information.length > iteration; iteration++) {
        database[information[iteration].id] = information[iteration];
    }
    //show cards
});
