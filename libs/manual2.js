var WebSocketServer = require('ws').Server,
 wss = new WebSocketServer({port: 8080});
  
function randomString(len){
    var text = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < len; i++ )
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    return text;
}

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received: %s', message);
    });
    //ws.send('something');
	responseHandler(ws, message)
});

function responseHandler(ws, message){
	
}

