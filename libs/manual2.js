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
function responseHandler(socket, message){
	if(!message.action){
		return;
	} 
	switch(message){
		case "host":
		
	}
}

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
		responseHandler(ws,message);
    });
    //ws.send('something');
});


