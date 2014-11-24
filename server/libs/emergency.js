/* jslint node : true */
var fs = require('fs');
var childProcess = require('child_process');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length - 1;
var net = require('net');

if (cluster.isMaster) {
    for (var instances = 0; instances < numCPUs; instances++) {
        var port = (28912 + instances);
        cluster.fork({
            PORT: port
        });
    }
    cluster.on('exit', function (worker, code, signal) {
        var port = (28912 + worker.id);
        cluster.fork({
            PORT: port
        });
    });
} else {
    startCore(process.env.PORT);
    var proxy = net.createServer(function () {}).listen(28911);
    proxy.on('connection', function (socket) {
        var connection = net.connect(process.env.PORT, '127.0.0.1');

        connection.on('data', function (data) {
            socket.write(data);
        });
        socket.on('data', function (data) {
            connection.write(data);
        });
        connection.on('error', function () {
            //core died
        });
        socket.on('error', function () {
            //player DC'd abruptly
            connection.end();
            socket.destroy();
        });
        socket.on('end', function () {
            connection.end();
            socket.destroy();
        });

    });

}

function createDateString(dateObject) {
    var hours = ('00' + dateObject.getHours()).slice(-2);
    var minutes = ('00' + dateObject.getMinutes()).slice(-2);
    return process.env.PORT + "-[" + hours + ":" + minutes + "]";
}

function startCore(port) {
    fs.exists(__dirname + '/../ygocore/YGOServer.exe', function (exist) {
        if (!exist) {
            console.log('core not found at ' + __dirname + '/' + '../ygocore');
            return;
        }

        var core = childProcess.spawn(__dirname + '/../ygocore/YGOServer.exe', [port, '2-config.txt'], {
            cwd: __dirname + '/../ygocore'
        }, function (error, stdout, stderr) {
            console.log(createDateString(new Date()) + ' CORE Terminated', error, stderr, stdout);
        });
        core.stdout.on('error', function (error) {
            console.log(createDateString(new Date()) + ' core error', error);
            process.exit(0);
        });
        core.stdout.on('data', function (core_message) {
            console.log(createDateString(new Date()), core_message.toString());
        });
        console.log('running on' , port);

    });
}