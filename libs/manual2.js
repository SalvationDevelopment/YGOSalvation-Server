var WebSocketServer = require('ws').Server,
 wss = new WebSocketServer({port: 8080}),
 games= {};
  
function randomString(len){
    var text = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ )
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    return text;
}

function newGame(){
	return {
	deckcheck: 0,
	draw_count: 0,
	lflist: 0,
	mode: 0,
	noshuffle: 0,
	prio: 0,
	rule: 0,
	startlp: 0,
	starthand: 0,
	timelimit: 0,
	player: {
		0: {
			name: '',
			ready: false
		},
		1: {
			name: '',
			ready: false
		},
		2: {
			name: '',
			ready: false
		},
		3: {
			name: '',
			ready: false
		}
	},
	spectators: 0,
	turn: 0,
	turnOfPlayer: 0,
	phase: 0
  }
}

	
function responseHandler(socket, message){
	if(!message.action){
		return;
	} 
	switch(message){
		case "host":
			games[randomString(12)] = newGame();
		break;
		
		case "join":
			Object.keys(games[socket.activeduel].player).some(function(playerNo){
				var player= games[socket.activeduel].player[playerNo];
				if(player.name === ''){
					return false;
				}
				player.name = message.name;
				//moar stuff
				return true;
			});
	}
}

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
		responseHandler(ws,message);
    });
    //ws.send('something');
});


