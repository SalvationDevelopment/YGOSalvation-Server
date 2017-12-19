/*jslint node:true*/

'use strict';
var validationCache = {},
    request = require('request'),
    fs = require('fs'),
    mysql = require('mysql'),
    crypto = require('crypto'),
    zxcvbn = require('zxcvbn '),
    hotload = require('hotload'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    UserEntry = new Schema({
        userID: ObjectId,
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
    SparkPost = require('sparkpost'),
    emailClient = new SparkPost('YOUR_API_KEY');


mongoose.connect('mongodb://localhost/salvation');

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


function setupRegistrationService(app) {
    app.post('register', function (request, response) {
        var payload = request.body,
            user;
        if (zxcvbn(payload.password) < 3) {
            response.write({
                error: 'Password is to weak'
            });
        } else {
            user = mongoose.model('Person', UserEntry);

            // find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
            user.findOne({ 'email': payload.email }, 'username email', function (err, person) {
                if (err) { return handleError(err); }
                if (person.length) {
                    // already exist
                } else {
                    var newUser = new UserEntry();
                    newUser.username = payload.username;
                    newUser.passwordHash = hash(payload.password);
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
                    newUser.save(function () {

                    });
                }
            });

            user = new UserEntry();
        }
    });

    app.get('verify', function () {

    });
}

module.exports = {
    validate
};