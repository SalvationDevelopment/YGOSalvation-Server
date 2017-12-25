/*jslint node:true*/

'use strict';
var validationCache = {},
    fs = require('fs'),
    mysql = require('mysql'),
    crypto = require('crypto'),
    zxcvbn = require('zxcvbn'),
    hotload = require('hotload'),
    mongoose = require('mongoose'),
    OAuthServer = require('express-oauth-server'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    UserEntry = new Schema({
        username: String,
        passwordHash: String,
        salt: String,
        email: String,
        creation: Date,
        verified: { type: Boolean, default: false },
        updated: { type: Date, default: Date.now },
        lastOnline: Date,
        friends: [ObjectId],
        admin: Boolean,
        decks: [Schema.Types.Mixed],
        rewards: [String],
        recoveryPass: String,
        session: String,
        sessionExpiration: Date,
        ranking: {
            rankPoints: Number,
            rankedWins: Number,
            rankedLosses: Number,
            rankedTies: Number
        },
        settings: {
            sleeves: Buffer,
            avatar: Buffer
        },
        bans: [Schema.Types.Mixed]

    }),
    oauthModel = require('./model_oauth.js'),
    BaseUser = mongoose.model('user', UserEntry),
    SparkPost = require('sparkpost'),
    uuidv4 = require('uuid/v4');

process.env.SALT = process.env.SALT || function () {
    console.log('');
};


function sessionTimeout(time) {
    if (!time) {
        return false;
    }
    const hour = 60 * 60 * 1000;
    return ((time.getTime() + hour) > Date.now());
}

var db = mongoose.connect('mongodb://localhost/salvation');


function salt() {
    var text = '';
    for (var i = 0; i < 8; i++) {
        text += uuidv4().split('-').join();
    }
    return text;
}

function hash(string, salt) {
    return crypto.createHash('md5').update(string + salt + process.env.SALT).digest('hex');
}

function validate(data, callback) {
    BaseUser.findOne({
        'username': data.username
    }, function (error, person) {
        if (error) {
            callback(error);
            return;
        }
        if (!person) {
            callback(new Error('Incorrect Login Information.'), false);
            return;
        }
        if (!person.verified) {
            //callback(new Error('User email not verified.'), false);
        }


        if (hash(data.password, person.salt) === person.passwordHash) {
            if (sessionTimeout(person.sessionExpiration)) {
                person.session = uuidv4();
            }
            person.sessionExpiration = new Date();
            person.save(function (saveError) {
                callback(saveError, true, person);
            });
        } else {
            callback(new Error('Incorrect Login Information.'), false);
        }
    });
}

function validateSession(data, callback) {
    BaseUser.findOne({
        'session': data.session
    }, function (error, person) {
        if (error) {
            callback(error, false);
            return;
        }
        if (!person) {
            callback(new Error('Invalid session.'), false);
            return;
        }

        if (!sessionTimeout(person.sessionExpiration)) {
            callback(new Error('Invalid session.'), false);
            return;
        }
        person.sessionExpiration = new Date();
        person.save(function (saveError) {
            callback(saveError, true, person);
        });
        callback(null, true);
    });
}

function updatePassword(data, callback) {
    validate(data, function (error, result, person) {
        var password = data.newPassword,
            salt = salt();
        passwordHash = hash(password, salt),
            recoveryPass = undefined;
        if (result) {
            BaseUser.findByIdAndUpdate(person._id, { passwordHash, salt, recoveryPass }, callback);
        }
    });
}

function startRecoverPassword(data, callback) {
    var code = salt();
    BaseUser.findOneAndUpdate({ username: data.username }, { recoveryPass: salt }, function (error, person) {
        callback(error, person, code);
        sendRecoveryEmail(person.email, person.username, code);
    });
}

function recoverPassword(data, id, callback) {
    BaseUser.findOne({ username: data.username, recoveryPass: id }, function (error, result, person) {
        var password = data.newPassword,
            salt = salt();
        passwordHash = hash(password, salt);
        if (result) {
            BaseUser.findByIdAndUpdate(person._id, { passwordHash, salt }, callback);
        }
    });
}

function sendEmail(address, username, id) {
    try {
        var emailClient = new SparkPost(process.env.SPARKPOST);
        emailClient.transmissions.send({
            content: {
                from: 'no-replay@ygosalvation.com',
                subject: 'User Validation for ' + username,
                html: '<html><body><p>Click the link to activate account. <a href="http://ygosalvation.com/verify/' + id + '" >http://ygosalvation.com/verify/' + id + '</a></p></body></html>'
            },
            recipients: [
                { address }
            ]
        }).then(data => {
            console.log(data);
        }).catch(err => {
            console.log('Whoops! Something went wrong');
            console.log(err);
        });
    } catch (fatal) {
        console.log(address, username, id, fatal);
    }

}

function sendRecoveryEmail(address, username, salt) {
    try {
        var emailClient = new SparkPost(process.env.SPARKPOST);
        emailClient.transmissions.send({
            content: {
                from: 'no-replay@ygosalvation.com',
                subject: 'User Recovery for ' + username,
                html: '<html><body><p>Click the link to recover account. <a href="http://ygosalvation.com/recover/' + salt + '" >http://ygosalvation.com/recover/' + salt + '</a></p></body></html>'
            },
            recipients: [
                { address }
            ]
        }).then(data => {
            console.log(data);
        }).catch(err => {
            console.log('Whoops! Something went wrong');
            console.log(err);
        });
    } catch (fatal) {
        console.log(address, username, id, fatal);
    }

}

function setupRegistrationService(app) {
    var oauth = new OAuthServer({ model: oauthModel });

    app.post('/register', function (request, response) {
        var payload = request.body || {},
            user;
        if (!payload.username) {
            response.send({
                error: 'No username'
            });
            return;
        }
        if (!payload.password) {
            response.send({
                error: 'No Password'
            });
            return;
        }
        if (zxcvbn(payload.password) < 3) {
            response.send({
                error: 'Password is to weak'
            });
            response.end();
            return;
        } else {
            // find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
            BaseUser.findOne({ 'email': payload.email }, 'username email', function (err, person) {
                if (err) {
                    return console.log(err);
                }
                if (person) {
                    // already exist
                    response.send({
                        error: 'Email exist in system already'
                    });
                    response.end();
                } else {


                    var newUser = new BaseUser();
                    newUser.username = payload.username;
                    newUser.salt = salt();
                    newUser.passwordHash = hash(payload.password, newUser.salt);
                    newUser.email = payload.email;
                    newUser.creation = new Date();
                    newUser.lastOnline = new Date();
                    newUser.friends = [];
                    newUser.admin = false;
                    newUser.decks = [];
                    newUser.rewards = [];
                    newUser.ranking = {
                        rankPoints: 0,
                        rankedWins: 0,
                        rankedLosses: 0,
                        rankedTies: 0
                    };
                    BaseUser.create(newUser, function (error, resultingUser, numAffected) {
                        response.send({
                            info: resultingUser,
                            success: true,
                            error,
                            numAffected
                        });
                        sendEmail(payload.email, payload.username, resultingUser._id);
                        response.end();
                    });
                }
            });
        }
    });

    app.get('/verify/:id', function (request, response) {
        var id = request.params.id;

        BaseUser.findByIdAndUpdate(id, { verified: true }, function (err, person) {
            response.write({
                success: error,
                result: person
            });
        });
    });


    function loadCurrentUser(req) {
        return db.getUserBySessionId(req.session.sessionid);
    }

    app.post('/recover', function (request, response, next) {
        var payload = request.body || {},
            user;

        if (!payload.username || !payload.email) {
            response.send({
                error: 'No username or email address'
            });
            return;
        }
        if (payload.username) {
            BaseUser.findOne({ 'username': payload.username }, 'username email', function (err, person) {
                startRecoverPassword(person, callback);
            });
        } else {
            BaseUser.findOne({ 'email': payload.email }, 'username email', function (err, person) {
                startRecoverPassword(person, callback);
            });
        }
    });
}

function saveDeck(user, callback) {
    BaseUser.findOne({ 'username': user.username }, function (err, person) {
        person.decks = user.decks;
        person.save(callback);
    });
}

module.exports = {
    validate,
    saveDeck,
    setupRegistrationService,
    db
};
