/*jslint node:true*/

'use strict';
var validationCache = {},
    zxcvbn = require('zxcvbn'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Message = new Schema({
        updated: { type: Date, default: Date.now },
        created: Date,
        modified: Date,
        author: String,
        author_id: ObjectId,
        content: String,
        status: String,
        comments: [Comment]
    }),
    Comment = new Schema({
        updated: { type: Date, default: Date.now },
        created: Date,
        modified: Date,
        author: String,
        author_id: ObjectId,
        content: String,
        status: String,
        correctness: [Schema.Types.Mixed],
        comments: [Comment]
    }),
    Vote = new Schema({
        voter: ObjectId,
        correct: Boolean,
        weight: Number,
        strength: Number
    }),
    Poll = new Schema({
        options: [String],
        type: String,
        enabled: Boolean,
        polling: [Schema.Types.Mixed]
    }),
    Post = new Schema({
        title: String,
        updated: { type: Date, default: Date.now },
        created: Date,
        modified: Date,
        author: String,
        author_id: ObjectId,
        content: String,
        status: String,
        forum: String,
        tags: [String],
        polls: [Poll],
        correctness: [Schema.Types.Mixed],
        answer: ObjectId,
        slug: String,
        comments: [Comment]
    }),
    User = new Schema({
        username: String,
        verified: { type: Boolean, default: false },
        admin: Boolean,
        signiture: String
    }),
    oauthModel = require('./model_oauth.js'),
    Users = mongoose.model('user', User),
    Posts = mongoose.model('forum', Post),
    Comments = mongoose.model('forum', Comment),
    uuidv4 = require('uuid/v4');


var db = mongoose.connect('mongodb://localhost/salvation');


function updatePost(author_id, data, callback) {
    Posts.findById(data.id, function (error, submission) {
        if (error) {
            callback(error);
            return;
        }
        if (!submission) {
            submission = new Post();
            Object.assign(submission, data);
            submission.created = new Date();
            submission.modified = new Date();
            submission.author_id = id;
            callback();
            return;
        }
        Object.assign(submission, data);
        submission.modified = new Date();
        submission.save(callback);
    });
}

function updateComment(author_id, data, callback) {
    if (error) {
        callback(error);
        return;
    }
    Comments.findById(data.parent, function (error, post) {
        var comment;
        if (!data._id) {
            comment = new Comments();
            Object.assign(comment, data);
            comment.created = new Date();
            comment.modified = new Date();
            comment.author_id = author_id;
            post.push(comment);
            post.save(callback);
            return;
        }        
        Object.assign(post.comments(data._id), data);
        post.comments(data._id).modified = new Date();
        post.comments(data._id).save(callback);
    });
}