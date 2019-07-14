const SMTPServer = require("smtp-server").SMTPServer,
    fs = require('fs'),
    exitEmail = process.env.SMTP_EMAIL_ADDRESS,
    exitEmailPassword = process.env.SMTP_EMAIL_Password;

function onAuth(auth, session, callback) {
    if (auth.username !== exitEmail || auth.password !== exitEmailPassword) {
        return callback(new Error("Invalid username or password"));
    }
    callback(null, { user: 'local' });
}

function onConnect(session, callback) { }
}

function withSSL() {
    const privateKey = fs.readFileSync(path.resolve(process.env.SSL + '\\private.key')).toString(),
        certificate = fs.readFileSync(path.resolve(process.env.SSL + '\\certificate.crt')).toString(),
        server = new SMTPServer({
            name: 'YGOSalvation Email Server',
            secure: true,
            key: privateKey,
            cert: certificate,
            onAuth,
            onConnect
        });
    return server;
}

module.exports = function () {
    let server;
    try {
        server = withSSL();
    } catch (e) {
        server = noSSL()
    }
    server.listen(463);
};