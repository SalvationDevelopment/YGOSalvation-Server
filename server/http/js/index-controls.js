/*jslint browser:true, plusplus:true, nomen: true*/
/*global $, saveSettings, Handlebars, prompt, _gaq, isChecked, alert, primus, ygopro, translationDB, swfobject, console*/

var admin = false,
    chatStarted = false;

function isChecked(id) {
    'use strict';
    return ($(id).is(':checked'));
}

Handlebars.getTemplate = function (name) {
    'use strict';
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
        $.ajax({
            url: 'templatesfolder/' + name + '.handlebars',
            success: function (data) {
                if (Handlebars.templates === undefined) {
                    Handlebars.templates = {};
                }
                Handlebars.templates[name] = Handlebars.compile(data);
            },
            async: false
        });
    }
    return Handlebars.templates[name];
};

function updatenews() {
    'use strict';
    $.getJSON('manifest/forumNews.json', function (news) {
        $.get('handlebars/forumnews.handlebars', function (template) {
            var parser = Handlebars.compile(template),
                topics = news.topics.reverse();
            news.articles = [];
            topics.forEach(function (topic, index) {
                if (index > 5) {
                    //limit the number of post in the news feed.
                    return;
                }
                news.articles.push({
                    date: new Date(topic.date).toString().substr(0, 15),
                    author: topic.author,
                    post: topic.post,
                    title: topic.title,
                    link: topic.link
                });
            });
            $('#news').html(parser(news));
        });
    });
}
updatenews();
var launcher = false,
    internalLocal = 'home',
    loggedIn = false,
    list = {};

function singlesitenav(target) {
    'use strict';
    if (internalLocal === 'duelscreen' || internalLocal === 'lobby') {
        if (!confirm('You are in a duel, are you sure? Not recommened')) {
            return;
        }
    }
    console.log('navigating to:', target);
    try {
        _gaq.push(['_trackEvent', 'Site', 'Navigation', target]);
        _gaq.push(['_trackEvent', 'Site', 'Navigation Movement', internalLocal + ' - ' + target]);
    } catch (e) {}
    internalLocal = target;
    //console.log(target);
    if (launcher && target === 'forum') {
        event.preventDefault();
        sound.play('soundactivate');
        return false;
    } else if (!launcher && target === 'forum') {
        return true;
    } else if ($('.unlogged.in-iframe').length > 0 && target === 'gamelist') {
        return;
    }
    $('body').css('background-image', 'url(img/bg.jpg)');
    if (target === 'faq') {
        updatenews();
        $('body').css('background-image', 'url(img/brightx_bg.jpg)');
    }
    if (target === 'chat' && !chatStarted) {
        chatStarted = true;
    }
    if (target === 'gamelist') {
        $('body').css('background-image', 'url(img/brightx_bg.jpg)');
    }
    if (target === 'chat') {
        $('body').css('background-image', 'url(img/brightx_bg.jpg)');
    }
    if (target === 'host') {
        $('body').css('background-image', 'url(img/brightx_bg.jpg)');
    }
    if (target === 'settings') {
        $('body').css('background-image', 'url(img/brightx_bg.jpg)');
    }
    $('.activescreen').removeClass('activescreen');
    $('header').css('left', '100vw');
    $('#' + target).css('left', '0').addClass('activescreen');
    sound.play('soundnewphase');
    return false;
}




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
    //    $('#ipblogin').css('display', 'none');
    try {
        _gaq.push(['_trackEvent', 'Launcher', 'Login', localStorage.nickname]);
    } catch (e) {}



    loggedIn = true;

    //chatStarted = true;
    singlesitenav('faq');
    setTimeout(function () {
        //singlesitenav('chat');
    }, 2000);
}
var deckfiles;

function processServerCall(data) {
    'use strict';
    if (!data) {
        return;
    }
    var selected = $(".currentdeck option:selected").val(),
        selectedskin = $("#skinlist option:selected").val(),
        selectedfont = $("#fontlist option:selected").val(),
        selecteddb = $("#dblist option:selected").val(),
        deckfile;
    $('.currentdeck').not('.activescreen .currentdeck').html(data.currentdeck);
    $('#skinlist').not('.activescreen #skinlist').html(data.skinlist);
    $('#fontlist').not('.activescreen #fontlist').html(data.fonts);
    $('#dblist').not('.activescreen #dblist').html(data.databases);
    $('.currentdeck option[value="' + selected + '"]').not('.activescreen option').attr('selected', 'selected');
    $('#skinlist option[value="' + selectedskin + '"]').not('.activescreen option').attr('selected', 'selected');
    $('#fontlist option[value="' + selectedfont + '"]').not('.activescreen option').attr('selected', 'selected');
    $('#dblist option[value="' + selecteddb + '"]').not('.activescreen option').attr('selected', 'selected');
    deckfiles = data.files;
    $('.deckSelect').not('.activescreen .deckSelect').html('');
    for (deckfile in deckfiles) {
        $('.deckSelect').not('.activescreen .deckSelect').append('<option value="' + deckfile + '">' + deckfile.replace('.ydk', '') + '</option>');
    }
    //console.log(data);
}
var jsLang = {};


function translateLang(lang) {
    "use strict";
    var i = 0;
    localStorage.language = lang;
    for (i; translationDB.length > i; i++) {
        if (translationDB[i].item && translationDB[i][lang]) {
            $('[' + translationDB[i].item + ']').text(translationDB[i][lang]);
        }
        if (translationDB[i].note) {
            $('[' + translationDB[i].note + ']').attr('placeholder', translationDB[i][lang]);
        }
        if (translationDB[i].item === 'data-translation-join') {
            jsLang.join = translationDB[i][lang];
        }
        if (translationDB[i].item === 'data-translation-spectate') {
            jsLang.spectate = translationDB[i][lang];
        }
    }
}

function achievementConstructor(data) {
    'use strict';
    return {
        "shadow": (data.field_13 === 'u') ? 'Unlocked' : 'Locked'
    };
}

$(document).ready(function () {
    'use strict';
    var useLang = localStorage.language || 'en';
    translateLang(useLang);
    if (localStorage.loginnick && localStorage.loginpass) {
        $('#ips_username').val(localStorage.loginnick);
        $('#ips_password').val(localStorage.loginpass);
    }
    if (localStorage.remember) {
        $('#ips_remember').prop('checked', true);
    }
    $("#dolog").click(function (ev) {
        try {
            _gaq.push(['_trackEvent', 'Launcher', 'Attempt Login', $('#ips_username').val()]);
        } catch (e) {}
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
                    admin = info.data.g_access_cp;
                    if (isChecked('#ips_remember')) {
                        localStorage.loginnick = $('#ips_username').val();
                        localStorage.loginpass = $('#ips_password').val();
                        localStorage.remember = true;
                    } else {
                        localStorage.loginnick = '';
                        localStorage.loginpass = '';
                        localStorage.remember = false;
                    }


                    locallogin();
                    primus.write({
                        action: 'register',
                        username: $('#ips_username').val(),
                        password: $('#ips_password').val()
                    });
                    $('#avatar').attr('src', 'http://forum.ygopro.us/uploads/' + info.avatar);
                    $('#profileusername').text(info.displayname);
                    $('#profilepoints span').text(info.data.field_12);
                    if (parseInt(info.data.post, 10) < 1) {
                        alert('Please visit our forums and introduce yourself!');
                    }
                } else {
                    alert(info.message);
                }
            },
            fail: function () {
                alert('Remain calm, issue was experienced while contacting the login server.');
            }
        });
        ev.preventDefault();
        return false; // avoid to execute the actual submit of the form.
    });
});