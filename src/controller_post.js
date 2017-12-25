/*jslint node:true*/

'use strict';
var validationCache = {},
    zxcvbn = require('zxcvbn'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Post = new Schema({
        updated: { type: Date, default: Date.now },
        created: Date,
        modified: Date,
        author: String,
        author_id: ObjectId,
        date: Date,
        content: String,
        status: String,
        forum: String,
        tags: [String],
        poll: {
            options : [String],
            type : String,
            enabled: Boolean,
            polling: [Schema.Types.Mixed]
        },
        answer : Schema.Types.Mixed,
        slug : String
    }),
    oauthModel = require('./model_oauth.js'),
    BasePost = mongoose.model('user', ),
    uuidv4 = require('uuid/v4');


var db = mongoose.connect('mongodb://localhost/salvation');
