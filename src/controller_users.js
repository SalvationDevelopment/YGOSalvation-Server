/*jslint node:true*/

'use strict';
var crypto = require('crypto'),
    zxcvbn = require('zxcvbn'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    sanitizer = require('sanitizer'),
    ObjectId = Schema.ObjectId,
    Message = new Schema({
        updated: { type: Date, default: Date.now },
        created: Date,
        modified: Date,
        author: String,
        author_id: ObjectId,
        content: String,
        status: String
    }),
    DuelSchema = new Schema({
        created: { type: Date, default: Date.now },
        decks: [Schema.Types.Mixed],
        banlist: String,
        winner: Number,
        loser: Number,
        players: [String]
    }),
    MatchSchema = new Schema({
        won: [Boolean],
        loss: [Boolean],
        draw: [Boolean],
        opponent: String
    }),
    TournamentEntrySchema = new Schema({
        joined: { type: Date, default: Date.now },
        username: String,
        deck: [Schema.Types.Mixed],
        matches: [MatchSchema]
    }),
    TournamentSchema = new Schema({
        created: { type: Date, default: Date.now },
        entries: [TournamentEntrySchema],
        banlist: String,
        createdBy: String,
        name: String
    }),
    UserSchema = new Schema({
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
        inbox: [Message],
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
        bans: [Schema.Types.Mixed],
        signiture: String

    }),
    Users = mongoose.model('user', UserSchema),
    Duels = mongoose.model('duel', DuelSchema),
    Tournaments = mongoose.model('tournment', TournamentSchema),
    SparkPost = require('sparkpost'),
    uuidv4 = require('uuid/v4');

process.env.SALT = process.env.SALT || function() {
    console.log('');
};

mongoose.Promise = Promise;

function sessionTimeout(time) {
    if (!time) {
        return false;
    }
    const hour = 60 * 60 * 1000;
    return ((time.getTime() + hour) > Date.now());
}

var db = mongoose.createConnection('mongodb://localhost/salvation', { useMongoClient: true }, console.log)


function salter() {
    var text = '';
    for (var i = 0; i < 8; i++) {
        text += uuidv4().split('-').join();
    }
    return text;
}

function hash(string, salt) {
    return crypto.createHash('md5').update(string + salt + process.env.SALT).digest('hex');
}

function validate(login, data, callback) {
    Users.findOne({
        'username': { $regex: new RegExp('^' + data.username.toLowerCase(), 'i') }
    }, function(error, person) {
        if (error) {
            callback(error);
            return;
        }
        if (!person) {
            callback(new Error('Incorrect Login Information.'), false, { bans: [] });
            return;
        }
        if (!person.verified) {
            //callback(new Error('User email not verified.'), false);
        }


        if (hash(data.password, person.salt) === person.passwordHash) {
            if (sessionTimeout(person.sessionExpiration) && login) {
                person.session = uuidv4();
            }
            person.sessionExpiration = new Date();
            person.save(function(saveError) {
                callback(saveError, true, person);
            });
        } else {
            callback(new Error('Incorrect Login Information.'), false, {});
        }
    });
}

function validateSession(data, callback) {
    Users.findOne({
        'session': data.session
    }, function(error, person) {
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
        person.save(function(saveError) {
            callback(saveError, true, person);
        });
    });
}

function updatePassword(data, callback) {
    validate(data, function(error, result, person) {
        var password = data.newPassword,
            salt = salter(),
            passwordHash = hash(password, salt),
            recoveryPass;
        if (result) {
            Users.findByIdAndUpdate(person._id, { passwordHash, salt, recoveryPass }, callback);
        }
    });
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

function startRecoverPassword(data, callback) {
    var code = salter();
    Users.findOneAndUpdate({ username: data.username }, { recoveryPass: code }, function(error, person) {
        callback(error, person, code);
        sendRecoveryEmail(person.email, person.username, code);
    });
}

function recoverPassword(data, id, callback) {
    Users.findOne({ email: data.email, recoveryPass: id }, function(error, result, person) {
        var password = data.newPassword,
            salt = salter(),
            passwordHash = hash(password, salt);
        if (result) {
            Users.findByIdAndUpdate(person._id, { passwordHash, salt }, callback);
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




function saveDeck(user, callback) {
    Users.findOne({ 'username': user.username }, function(err, person) {
        person.decks = user.decks;
        person.save(callback);
    });
}



function getAllUsersDecks(callback) {
    Users.find({}, function(error, users) {
        if (error) {
            callback(error);
        }
        const decks = [];
        users.forEach(function(user) {

            user.decks.forEach(function(deck) {
                delete deck.creator;
                decks.push(deck);
            });
        });



        callback(null, decks);
    });
}

function getUserCount(callback) {
    Users.find({}, function(error, users) {
        if (error) {
            callback(error);
        }
        callback(null, users.length);
    });
}

function recordDuelResult(duel, callback) {
    const input = new Duels(duel);
    Duels.create(input, callback);
    Users.findOneAndUpdate({ username: duel.players[duel.winner] }, { $inc: { 'ranking.rankedPoints': 1 } });
    callback();
}

function createTournament(banlist, callback) {
    const input = new Tournaments({ banlist });
    Tournaments.create(input, callback);
}

function addTournamentEntry(id, entry, callback) {
    Tournaments.update({
        _id: id,
        'entires.username': { $ne: 'entires.username' }
    }, { $push: { entries: entry } }, callback);
}

function updateTournamentEntry(id, entry, callback) {
    Tournaments.update({
        _id: id,
        'entires.username': entry.username
    }, entry, callback);
}

function queryTournament(id, callback) {
    Tournaments.find({ _id: id }, function(error, tournament) {
        if (error) {
            callback(error);
        }
        callback(null, tournament);
    });
}

function removeTournament(id, callback) {
    Tournaments.delete({ _id: id }, function(error, tournament) {
        if (error) {
            callback(error);
        }
        callback(null, tournament);
    });
}

function getDuels(start, end, callback) {
    Duels.find({
        created: {
            '$gte': new Date(start),
            '$lt': new Date(end)
        }
    }, function(error, result) {
        if (error) {
            callback(error);
        }
        callback(null, result);
    });
}

function getRanking(callback) {
    Users.find({}, function(error, users) {
        if (error) {
            callback(error);
        }
        const ranks = users.map(function(user) {
            return {
                username: user.username,
                points: user.ranking.rankPoints
            };
        });
        ranks.sort(function(primary, secondary) {
            return primary.points > secondary.points;
        });
        callback(null, ranks.slice(0, 100));
    });
}

function setupController(app) {

    app.post('/register', function(request, response) {
        var payload = request.body || {},
            user;

        if (!payload.password) {
            response.send({
                error: 'No Password'
            });
            return;
        }
        payload.username = sanitizer.sanitize(payload.username);
        if (!payload.username) {
            response.send({
                error: 'No username'
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
            Users.findOne({ $or: [{ 'email': payload.email }, { 'username': payload.username }] }, 'username email', function(err, person) {
                if (err) {
                    return console.log(err);
                }
                if (person) {
                    // already exist
                    response.send({
                        error: 'Username or Email exist in system already'
                    });
                    response.end();
                } else {


                    var newUser = new Users();
                    newUser.username = payload.username;
                    newUser.salt = salter();
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
                    Users.create(newUser, function(error, resultingUser, numAffected) {
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

    app.get('/verify/:id', function(request, response) {
        var id = request.params.id;

        Users.findByIdAndUpdate(id, { verified: true }, function(err, person) {
            response.write({
                success: error,
                result: person
            });
        });
    });


    function loadCurrentUser(req) {
        return db.getUserBySessionId(req.session.sessionid);
    }

    app.post('/recover', function(request, response, next) {
        var payload = request.body || {},
            user;

        function callback(error, person, code) {
            response.send({
                error: error
            });
        }
        if (!payload.email) {
            response.send({
                error: 'No username or email address'
            });
            return;
        }

        Users.findOne({ 'email': payload.email }, 'username email', function(err, person) {
            startRecoverPassword(person, callback);
        });

    });

    app.post('/recoverpassword', function(request, response, next) {
        var payload = request.body || {},
            user;

        function callback(error, person, code) {
            response.send({
                error: error
            });
        }
        if (!payload.email) {
            response.send({
                error: 'No username or email address'
            });
            return;
        }


        recoverPassword(payload, function(error) {});


    });


    app.get('/decks', function(req, res, next) {

        getAllUsersDecks(function(error, decks) {
            if (error) {
                next();
            }
            res.write(JSON.stringify(decks));
            next();
        });
    });

    app.get('/usercount', function(req, res, next) {

        getUserCount(function(error, count) {
            res.write(JSON.stringify({
                usercount: count,
                error: error
            }));
            next();
        });
    });

    app.get('/duelrecords', function(req, res, next) {
        const start = req.params.start,
            end = req.params.end || Date.now();
        getDuels(start, end, function(error, duels) {
            res.write(JSON.stringify({
                duels: duels,
                error: error
            }));
            next();
        });
    });

    app.get('/ranking', function(req, res, next) {
        getRanking(function(error, ranks) {
            res.write(JSON.stringify({
                ranks: ranks,
                error: error
            }));
            next();
        });
    });

    app.post('/createtournament', function(req, res, next) {
        const banlist = JSON.parse(req.body);
        createTournament(banlist, function(error, tournament) {
            res.write(JSON.stringify({
                tournament: tournament,
                error: error
            }));
            next();
        });
    });

    app.post('/tournament', function(req, res, next) {
        const id = req.params.id;
        queryTournament(id, function(error, tournament) {
            res.write(JSON.stringify({
                tournament: tournament,
                error: error
            }));
            next();
        });
    });

    app.post('/addtournamententry', function(req, res, next) {
        const id = req.params.id,
            entry = JSON.parse(req.body);
        addTournamentEntry(id, entry, function(error, result) {
            res.write(JSON.stringify({
                sucess: Boolean(result),
                error: error
            }));
            next();
        });
    });

    app.post('/updatetournamententry', function(req, res, next) {
        const id = req.params.id,
            entry = JSON.parse(req.body);
        updateTournamentEntry(id, entry, function(error, result) {
            res.write(JSON.stringify({
                sucess: Boolean(result),
                error: error
            }));
            next();
        });
    });

}

module.exports = {
    getDuels,
    recordDuelResult,
    getRanking,
    createTournament,
    queryTournament,
    addTournamentEntry,
    updateTournamentEntry,
    validate,
    saveDeck,
    setupController,
    getAllUsersDecks,
    getUserCount,
    validateSession,
    db
};