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
        }
    }),
    BaseUser = mongoose.model('user', UserEntry),
    SparkPost = require('sparkpost'),
    emailClient = new SparkPost('YOUR_API_KEY');


var db = mongoose.connect('mongodb://localhost/salvation');

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
    var post = {
        ips_username: data.username,
        ips_password: data.password
    };

    return validate;
}

function sendEmail(address, id) {
    emailClient.transmissions.send({
        content: {
            from: 'no-replay@ygosalvation.com',
            subject: 'Hello, World!',
            html: '<html><body><p>Testing SparkPost - the world\'s most awesomest email service!</p></body></html>'
        },
        recipients: [
            { address }
        ]
    }).then(data => {
        console.log('Woohoo! You just sent your first mailing!');
        console.log(data);
    })
        .catch(err => {
            console.log('Whoops! Something went wrong');
            console.log(err);
        });

}

function setupRegistrationService(app) {
    console.log('attaching registration endpoints');
    app.post('/register', function (request, response) {
        console.log('eep', request.body);
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
            console.log('made new model');
            // find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
            BaseUser.findOne({ 'email': payload.email }, 'username email', function (err, person) {
                if (err) {
                    return console.log(err);
                }
                console.log('checking person', person);
                if (person) {
                    // already exist
                    console.log('person exist');
                    response.send({
                        error: 'Email exist in system already'
                    });
                    response.end();
                } else {
                   
                    
                    var newUser = new BaseUser();
                    newUser.username = payload.username;
                    newUser.passwordHash = payload.password; // needs to be hashed
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
                    console.log(newUser);
                    BaseUser.create(newUser, function (error, resultingUser, numAffected) {
                        response.send({
                            success: resultingUser,
                            error,
                            numAffected
                        });
                        response.end();
                    });
                }
            });
        }
    });

    app.get('/verify/:id', function (request, response) {
        var id = request.params.id;

        Adventure.findById(id, function (err, adventure) { });

    });

    console.log(new ObjectId());
}

module.exports = {
    validate,
    setupRegistrationService,
    db
};

console.log( ObjectId(), 'eeee');
