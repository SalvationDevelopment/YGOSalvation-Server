/* jshint node: true */
function killCore(socket, gamelist, primus) {
    if (socket.active_ygocore) {
        socket.active_ygocore.end();
    }
    if (socket.core) {
        socket.core.kill();
        delete socket.core;
        delete gamelist[socket.hostString];
        primus.room('activegames').write(JSON.stringify(gamelist));
    }
}

module.exports = killCore;