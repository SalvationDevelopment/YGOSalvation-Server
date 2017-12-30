Handlebars.registerHelper("formatDate", function (datetime, format) {
    if (moment) {
        return moment(datetime).calendar();
    }
    else {
        return datetime;
    }
});


$.getJSON('api/forum/index', function (board) {
    board.latestTopics = board.latestTopics.map(function (post) { 
        return post ;
    });
    $.get('handlebars/forum.handlebars', function (template) {
        console.log(board);

        var parser = Handlebars.compile(template),
            html = parser(board);

        $('#forum').html(html);
    });
});