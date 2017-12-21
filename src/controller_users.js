/*jslint node:true*/

'use strict';
var validationCache = {},
    fs = require('fs'),
    mysql = require('mysql'),
    crypto = require('crypto'),
    zxcvbn = require('zxcvbn'),
    hotload = require('hotload'),
    mongoose = require('mongoose'),
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
        bans : [Schema.Types.Mixed]
    }),
    BaseUser = mongoose.model('user', UserEntry),
    SparkPost = require('sparkpost'),
    uuidv4 = require('uuid/v4');



var db = mongoose.connect('mongodb://localhost/salvation');


function salt() {
    var text = "";
    for (var i = 0; i < 8; i++) {
        text += uuidv4().split('-').join();
    }
    return text;
}

function hash(string, salt) {
    return crypto.createHash('md5').update(string + salt + process.env.SALT).digest("hex");
}

function isAdmin(data) {
    var result = '0';
    Object.keys(admins).forEach(function (admin) {
        if (admin === data.username && admins[admin]) {
            result = '1';
        }
    });
    return result;
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
            callback(new Error('User email not verified.'), false);
        }


        if (hash(data.password, person.salt) === person.password) {
            callback(error, true, person);
        } else {
            callback(new Error('Incorrect Login Information.'), false);
        }
    });
}

function updatePassword(data, callback){
    validate(data, function (error, result, person){
        var password = data.newPassword,
            salt = salt();
            passwordHash = hash(password, salt);
        if (result){
            BaseUser.findByIdAndUpdate(person._id, {passwordHash, salt}, callback);
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

function setupRegistrationService(app) {
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
}

module.exports = {
    validate,
    setupRegistrationService,
    db
};
