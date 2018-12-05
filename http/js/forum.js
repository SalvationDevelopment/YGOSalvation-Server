Handlebars.registerHelper('formatDate', function (datetime, format) {
    if (moment) {
        return moment(datetime).calendar();
    }    else {
        return datetime;
    }
});


$.getJSON('api/forum/index', function (board) {
    board.latestTopics = board.latestTopics.map(function (post) {
        return post;
    });
    $.get('handlebars/forumheader.handlebars', function (header) {
        $.get('handlebars/forumindex.handlebars', function (template) {

            var parserTemplate = Handlebars.compile(template),
                parserHeader = Handlebars.compile(header),
                html = parserHeader(board) + parserTemplate(board);

            $('#forum').html(html);
        });
    });
});

function viewForum(forum) {
    $.getJSON('api/forum/' + forum, function (board) {
        $.get('handlebars/forumheader.handlebars', function (header) {
            $.get('handlebars/forumbody.handlebars', function (template) {
                console.log(board);
                var parserTemplate = Handlebars.compile(template),
                    parserHeader = Handlebars.compile(header),
                    html = parserHeader(board) + parserTemplate(board);

                $('#forum').html(html);
            });
        });
    });
}

function viewPost(id) {
    $.getJSON('api/post/'+id, function (post) {
        $.get('handlebars/forumheader.handlebars', function (header) {
            $.get('handlebars/forumpost.handlebars', function (template) {
                post.owned = (localStorage.session === post.author_id);
                post.comments.forEach(function(comment) {
                    comment.owned =  (localStorage.session === comment.author_id);
                });
                console.log(post);
                var parserTemplate = Handlebars.compile(template),
                    parserHeader = Handlebars.compile(header),
                    html = parserHeader(post) + parserTemplate(post.results);

                $('#forum').html(html);
            });
        });
    });
}