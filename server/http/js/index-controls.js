/*jslint browser:true, plusplus:true*/
/*global $, saveSettings, Handlebars, prompt, _gaq*/

var launcher = false,
    internalLocal = 'home';

function singlesitenav(target) {
    _gaq.push(['_trackEvent', 'Site', 'Navigation', target]);
    _gaq.push(['_trackEvent', 'Site', 'Navigation Movement', internalLocal + ' - ' + target]);
    internalLocal = target;
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
        _gaq.push(['_trackEvent', 'Launcher', 'Load', 'Boot Launcher']);
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
    $('#ips_username, #ips_password').css('display', 'none');
    
    _gaq.push(['_trackEvent', 'Launcher', 'Login', localStorage.nickname]);
    singlesitenav('faq');
}

$(document).ready(function () {
    'use strict';
    $("#dolog").click(function (ev) {
        _gaq.push(['_trackEvent', 'Launcher', 'Attempt Login', $('#ips_username').val()]);
        var url = "http://forum.ygopro.us/log.php";
        $.ajax({
            type: "POST",
            url: url,
            data: $("#ipblogin").serialize(), // serializes the form's elements.
            success: function (data) {
                var info = JSON.parse(data);
                console.log(info);
                if (info.success) {
                    localStorage.nickname = info.displayname;
                    locallogin();
                } else {
                    alert (info.message);
                }
            }
        });
        ev.preventDefault();
        return false; // avoid to execute the actual submit of the form.
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