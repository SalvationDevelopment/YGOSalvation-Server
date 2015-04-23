/*jslint browser:true, plusplus:true*/
/*global $, saveSettings, Handlebars, prompt*/

var launcher = false;

function singlesitenav(target) {
    'use strict';
    //console.log(target);
    if (launcher && target === 'forum') {
        event.preventDefault();
    } else if (!launcher && target === 'forum') {
        return true;
    } else if ($('.unlogged.in-iframe').length > 0 && target === 'gamelist') {
        return;
    }
    $('header').css('top', '100vh');
    $('#' + target).css('top', '0');
    saveSettings();
    return false;
}

$(function () {
    'use strict';
    if (window.self !== window.top) {
        $(document.body).addClass("in-iframe");
        launcher = true;
    } else {
        $(document.body).addClass("web");
    }
});



function locallogin(init) {
    'use strict';
    localStorage.nickname = localStorage.nickname || '';
    if (localStorage.nickname.length < 1 || init === true) {
        var username = prompt('Username: ', localStorage.nickname);
        while (!username) {
            username = prompt('Username: ', localStorage.nickname);
            username.replace(/[^a-zA-Z0-9_]/g, "");
        }
        localStorage.nickname = username;
        $('.unlogged').removeClass("unlogged");
    }

    $(document.body).addClass("launcher").removeClass('unlogged').removeClass('web');
    $('#login-username').css('display', 'none');
    singlesitenav('faq');

}
$(document).ready(function () {
    'use strict';

    function weblogin() {
        localStorage.nickname = $('#login-username').val();
        locallogin();
    }

    $('#login-username').bind("enterKey", function (e) {

        weblogin();
    });
    $('#login-username').keyup(function (e) {
        if (e.keyCode === 13) {
            $(this).trigger("enterKey");
        }
    });

    if (launcher) {
        //locallogin(true);
        $('webonly').css('display', 'none');
        setInterval(function () {
            $.getJSON('http://127.0.0.1:9468/', function (data) { //small kittens hate localhost
                var selected = $(".currentdeck option:selected").val(),
                    selectedskin = $("#skinlist option:selected").val(),
                    selectedfont = $("#fontlist option:selected").val(),
                    selecteddb = $("#dblist option:selected").val();
                $('.currentdeck').html(data.currentdeck);
                $('#skinlist').html(data.skinlist);
                $('#fontlist').html(data.fonts);
                $('#dblist').html(data.databases);
                $('.currentdeck option[value="' + selected + '"]').attr('selected', 'selected');
                $('#skinlist option[value="' + selectedskin + '"]').attr('selected', 'selected');
                $('#fontlist option[value="' + selectedfont + '"]').attr('selected', 'selected');
                $('#dblist option[value="' + selecteddb + '"]').attr('selected', 'selected');
                //console.log(data);
            }).fail(function () {

            });
        }, 10000);
    }

    function updatenews() {
        $.getJSON('news.json', function (news) {
            $.get('handlebars/news.handlebars', function (template) {
                var parser = Handlebars.compile(template);
                $('#news').append(parser(news));
            });
        });
    }
    updatenews();
    setInterval(function () {
        updatenews();
    }, 120000);

});