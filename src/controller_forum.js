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
        forum: {
            index: String,
            forum: String,
            subForum: String
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
        subForums: [String],
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
    uuidv4 = require('uuid/v4'),
    sanitizer = require('sanitizer'),
    BBCodeParser = require('bbcode-parser'),
    parser = new BBCodeParser(BBCodeParser.defaultTags());



var db = mongoose.connect('mongodb://localhost/salvation');



function sessionTimeout(time) {
    if (!time) {
        return false;
    }
    const hour = 60 * 60 * 1000;
    return ((time.getTime() + hour) > Date.now());
}

function sessionCheck(request, response, next) {
    var session = request.get('Session') || '';

    if (request.method === 'GET') {
        next();
        return;
    }

    Users.findOne({ session }, function (error, person) {
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

function adminSessionCheck(request, response, next) {
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

function checkForum(definition, callback) {
    if (!definition) {
        callback(null, false);
    }
    if (!definition.index && definition.forum) {
        callback(null, false);
    }
    Indexes.findOne({ slug: definition.index }, function (error, index) {
        if (error) {
            callback(error, false);
            return;
        }
        if (!index) {
            callback(error, false);
            return;
        }
        var subforum,
            forum = index.categories.find(function (sub) {
                return sub.slug === definition.forum;
            });

        if (forum && definition.subForum) {
            subforum = forum.subforums.find(function (sub) {
                return sub === definition.subForum;
            });

            callback(error, Boolean(subforum));
        } else {
            callback(error, Boolean(forum));
        }

    });
}

function finalResponse(response) {
    return function (error, result, numAffected) {
        if (error) {
            response.status(500);
            response.send({
                result,
                success: false,
                error,
                numAffected
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
    }
}

function createPost(request, response) {
    var data = request.body,
        post = new Posts(),
        slug = [(new Date()).getTime()];

    checkForum(data.forum, function (error, valid) {
        if (error) {
            response.status(500);
            response.send({
                success: false,
                error
            });
            response.end();
            return;
        }
        if (!valid || !data.title || !data.content) {
            response.status(200);
            response.send({
                success: false,
                error
            });
            response.end();
            return;
        }
        data.title.split(' ').forEach(function (element) {
            slug.push(element.toLowerCase());
        });


        post.title = sanitizer.sanitize(data.title);
        post.content = parser.parseString(sanitizer.sanitize(data.content));
        post.status = 'active';
        post.forum = data.forum;
        post.tags = data.tags;
        post.slug = slug.join('_');
        post.created = new Date();
        post.modified = new Date();
        post.author = request.user.username;
        post.author_id = request.user._id;

        Posts.create(post, finalResponse(response));
    });
}

function updatePost(request, response) {
    var data = request.body;
    Posts.findById(data.id, function (error, post) {
        if (error) {
            response.status(500);
            response.send({
                success: false,
                post,
                error
            });
            response.end();
            return;
        }
        if (!post) {
            response.status(404);
            response.send({
                success: false,
                post,
                error
            });
            response.end();
            return;
        }
        if (request.user._id !== post.author_id) {
            response.status(401);
            response.send({
                success: false,
                post,
                error: '401 Unauthorized'
            });
            response.end();
            return;
        }
        post.modified = new Date();
        post.content = data.content;
        post.content = data.title;
        post.save(finalResponse(response));
    });
}

function createComment(request, response) {
    var data = request.body;
    Post.findById(data.parent, function (error, post) {
        if (error) {
            response.status(500);
            response.send({
                success: false,
                post,
                error
            });
            response.end();
            return;
        }
        if (!post) {
            response.status(404);
            response.send({
                success: false,
                post,
                error
            });
            response.end();
            return;
        }

        var comment = new Comments();
        Object.assign(comment, data);
        comment.created = new Date();
        comment.modified = new Date();
        comment.author_id = request.user._id;
        post.push(comment);
        post.save(finalResponse(response));
    });
}

function updateComment(request, response) {
    var data = request.body,
        id = data._id
    Comments.findById(data.parent, function (error, post) {
        if (error) {
            response.status(500);
            response.send({
                success: false,
                post,
                error
            });
            response.end();
            return;
        }
        if (!post) {
            response.status(404);
            response.send({
                success: false,
                post,
                error
            });
            response.end();
            return;
        }
        if (!post.comments(id)) {
            response.status(404);
            response.send({
                success: false,
                post,
                error
            });
            response.end();
            return;
        }
        if (request.user._id !== post.comments(id).author_id) {
            response.status(401);
            response.send({
                success: false,
                post,
                error: '401 Unauthorized'
            });
            response.end();
            return;
        }

        post.comments(id).modified = new Date();
        post.comments(id).content = data.content;
        post.save(finalResponse(response));

    });
}


function getIndexes(request, response) {
    Indexes.find({}, finalResponse(response));
}

function getSubForum(request, response) {
    var index = request.params.index,
        forum = request.params.forum,
        sub = request.params.sub;

    Posts.find({
        'forum.index': index,
        'forum.forum': forum,
        'forum.sub': sub
    }, finalResponse(response));
}

function getForum(request, response) {
    var forum = request.params.forum;
    Posts.find({ 'forum.forum': forum }, finalResponse(response));
}

module.exports = function (app) {
    app.use('/api/post', sessionCheck);
    app.use('/api/comment', sessionCheck);
    app.use('/api/admin', adminSessionCheck);

    app.get('/api/forum/index', getIndexes);
    app.get('/api/forum/index/:index/forum/:forum/sub/:sub', getSubForum);
    app.get('/api/forum/:forum', getForum);



    app.get('/api/post/:slug', function (request, response) {
        var slug = request.params.id;
        Post.find({ slug }, function (error, results) {
            response.json({
                error,
                results
            });
        });
    });

    app.post('/api/post', createPost);
    app.patch('/api/post/:id', updatePost);

    app.post('/api/comment', createComment);
    app.patch('/api/comment/:id', updateComment);




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