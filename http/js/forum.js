$.getJSON('api/forum/index', function (board) {
    $.get('handlebars/forum.handlebars', function (template) {
        console.log(board);
        var parser = Handlebars.compile(template),
            html = parser(board);

        $('#forum').html(html);
        console.log(html);
    });
});