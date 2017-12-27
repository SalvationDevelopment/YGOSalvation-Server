/*jslint node:true*/

'use strict';
var validationCache = {},
    zxcvbn = require('zxcvbn'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Comment = new Schema(),
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
    Vote = new Schema({
        voter: ObjectId,
        correct: Boolean,
        weight: { type: Number, default: 0 },
        strength: { type: Number, default: 0 }
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
        forum : {
            index : String,
            forum: String,
            subForum : String
        },
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
    Forum = new Schema({
        title: String,
        slug: String,
        description: String,
        subforums: [String],
        link: String,
        isLink: { type: Boolean, default: false },
        isQuestion: { type: Boolean, default: false },
        lastPost: Schema.Types.Mixed,
        threadCount: { type: Number, default: 0 },
        postCount: { type: Number, default: 0 },
        icon: String
    }),
    Index = new Schema({
        title: String,
        slug: String,
        description: String,
        categories: [Forum]
    }, { usePushEach: true }),
    oauthModel = require('./model_oauth.js'),
    Users = mongoose.model('user'),
    Posts = mongoose.model('post', Post),
    Comments = mongoose.model('comment', Comment),
    Indexes = mongoose.model('index', Index),
    uuidv4 = require('uuid/v4');


var db = mongoose.connect('mongodb://localhost/salvation');



function sessionTimeout(time) {
    if (!time) {
        return false;
    }
    const hour = 60 * 60 * 1000;
    return ((time.getTime() + hour) > Date.now());
}

function sessionCheck (request, response, next) {
    var session = request.get('Session') || '';
    Users.findOne({session}, function (error, person) {
        if (error) {
            response.status(500);
            response.json({ code: 500, error });
            response.end();
        }
        if (!person) {
            response.status(401);
            response.json({ code: 401, error: '401 Unauthorized' });
            response.end();
            return;
        } else if (sessionTimeout(person.sessionExpiration)) {
            request.user = person;
            next();
            return;
        } else {
            response.json({ error, code: 401, message: '401 Unauthorized' });
            response.end();
            return;
        }

    });
}

function adminSessionCheck (request, response, next) {
    var session = request.get('Session') || '';
    Users.findOne({ session, admin: true }, function (error, person) {
        if (error) {
            response.status(500);
            response.json({ code: 500, error });
            response.end();
        }
        if (!person) {
            response.status(401);
            response.json({ code: 401, error: '401 Unauthorized' });
            response.end();
            return;
        } else if (sessionTimeout(person.sessionExpiration)) {
            next();
            return;
        } else {
            response.json({ error, code: 401, message: '401 Unauthorized' });
            response.end();
            return;
        }

    });
}

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
        submission.modified = new Date();
        submission.content = data.content;
        submission.content = data.title;
        submission.save(callback);
    });
}

function updateComment(author_id, data, callback) {
    Comments.findById(data.parent, function (error, post) {
        if (error) {
            callback(error);
            return;
        }
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

        post.comments(data._id).modified = new Date();
        post.comments(data._id).content = data.content;
        post.comments(data._id).save(callback);
    });
}


module.exports = function (app) {
    app.use('/api/post', sessionCheck);
    app.use('/api/admin', adminSessionCheck);
    app.get('/api/forum/index', function (request, response) {
        Indexes.find({}, function (error, results) {
            response.json({
                error,
                results
            });
        });
    });

    app.get('/api/forum/:forum/sub/:sub', function (request, response) {
        Indexes.findOne({ slug: request.params.forum }, function (error, index) {
            var forum = index.categories.find(function (sub) {
                return sub.slug === request.params.sub;
            });
            response.json({
                error,
                forum
            });
        });
    });

    app.get('/api/forum/:forum', function (request, response) {
        Indexes.findOne({ slug: request.params.forum }, function (error, forum) {
            response.json({
                error,
                forum
            });
        });
    });

    

    app.get('/api/post/:slug', function (request, response) {
        var slug = request.params.id;
        Post.find({ slug }, function (error, results) {
            response.json({
                error,
                results
            });
        });
    });

    

    app.post('/api/admin/forum/add', function (request, response) {
        var payload = request.body || {},
            user;
        if (!payload.slug) {
            response.send({
                error: 'No slug'
            });
            return;
        }
        payload.slug = String(payload.slug.trim());
        if (!payload.title || !payload.slug || !payload.description) {
            response.send({
                error: 'Missing information'
            });
            return;
        }

        Indexes.findOne({ 'slug': payload.slug }, function (err, index) {
            if (err) {
                response.send({
                    err,
                    index
                });
                response.end();
                return console.log(err);
            }
            if (index && !payload.parent) {
                // already exist
                response.send({
                    error: 'Already Exist',
                    index
                });
                response.end();
            } else if (!index && payload.parent) {
                Indexes.findOne({ 'slug': payload.parent }, function (err, parent) {
                    if (err || !parent || parent.categories.some(function (sub) {
                        return sub.slug === payload.slug;
                    })) {
                        response.send({
                            err,
                            parent,
                            success: false
                        });
                        response.end();
                        return;
                    }

                    parent.categories.push(payload);
                    parent.save(payload, function (error, result, numAffected) {
                        if (error) {
                            // already exist
                            response.send({
                                error,
                                result,
                                numAffected,
                                parent,
                                sucess: false
                            });
                            response.end();
                            return;
                        }
                        response.send({
                            result: result,
                            success: true,
                            error,
                            numAffected
                        });
                        response.end();
                    });
                });
            } else if (!payload.parent) {
                Indexes.create(payload, function (error, result, numAffected) {
                    response.send({
                        result: result,
                        success: true,
                        error,
                        numAffected
                    });
                    response.end();
                });
            } else {
                response.send({
                    success: false,
                    error: 'Check parent child relationship.'
                });
            }
        });
    });
};