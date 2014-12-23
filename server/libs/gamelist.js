/*jshint node : true */
var http = require('http');
var Primus = require('primus');
var Rooms = require('primus-rooms');
// This object acts similar to a Redis server, could be replaced with on but its the gamelist state.
 var gamelist = {};

 // Things that only the initial starting p
function messageListener(message){
    var core_message_raw = message.core_message_raw;
    var port = message.port;
    var data = message.data;
    return handleCoreMessage(core_message_raw, port, data);
}
 function handleCoreMessage(core_message_raw, port, data) {
     var core_message_txt = core_message_raw.toString();
     //console.log(core_message_txt);
     if (core_message_txt.indexOf("::::") < 0) {
         return;
     }
     var core_message = core_message_txt.split('|');
     //console.log(core_message);
     core_message[0] = core_message[0].trim();
     try {
         switch (core_message[0]) {
         case ('::::network-end'):
             {
                 //servercallback('kill', gamelist);
             }
             break;
         case ('::::join-slot'):
             {
                 //socket.hostString = core_message[1];
                 var join_slot = parseInt(core_message[2], 10);
                 if (join_slot === -1) {
                     return;
                 }
                 gamelist[core_message[1]].players[join_slot] = core_message[3];
                 gamelist[core_message[1]].port = port;

                 //servercallback('update', gamelist);
             }
             break;
         case ('::::leave-slot'):
             {

                 var leave_slot = parseInt(core_message[2], 10);
                 if (leave_slot === -1) {
                     return;
                 }
                 gamelist[core_message[1]].players[leave_slot] = null;
                 //servercallback('update', gamelist);
             }
             break;
         case ('::::spectator'):
             {

                 gamelist[core_message[1]].spectators = parseInt(core_message[2], 10);
                 //servercallback('update', gamelist);

             }
             break;
         case ('::::lock-slot'):
             {

                 var lock_slot = parseInt(core_message[2], 10);
                 gamelist[core_message[1]].locked[lock_slot] = Boolean(core_message[2]);
                 //servercallback('update', gamelist);
             }
             break;
         case ('::::endduel'):
             {
                 //do ranking here

                 delete gamelist[core_message[1]];
                 //servercallback('update', gamelist);
             }
             break;
         case ('::::startduel'): // rockpaperscissors
             {

                 gamelist[core_message[1]].started = true;
                 //servercallback('update', gamelist);
             }
             break;
         case ('::::chat'):
             {
                 var chat ='';        
             }
             break;
         }
     } catch (error_message) {
         console.log(error_message);
     }
     return gamelist;
 }

 var primus = new Primus(primusServer, {
     parser: 'JSON'
 });
 primus.use('rooms', Rooms);
 primus.on('connection', function (socket) {
     socket.on('data', function (data) {
         data = data || {};
         var action = data.action;
         switch (action) {
         case ('join'):
             {
                 socket.join('activegames', function () {
                     socket.write(JSON.stringify(gamelist));
                 });
             }
             break;
         case ('leave'):
             {
                 socket.leave('activegames');
             }
             break;
         default:
             {
                 console.log(data);
             }
         }
     });
 });
 primus.on('disconnection', function (socket) {
     
 });

 primus.on('error', function (socket) {
    
 });

 var primusServer = http.createServer().listen(24555);
