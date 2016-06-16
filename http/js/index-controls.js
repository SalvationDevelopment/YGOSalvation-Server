/*jslint browser:true, plusplus:true, nomen: true, regexp:true*/
/*global $, saveSettings, Handlebars, prompt, _gaq, isChecked, alert, primus, ygopro, translationDB, params, swfobject, console, FileReader, prompt, confirm*/

var admin = false,
    chatStarted = false,
    dnStarted = false;

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
    $.getJSON('http://ygopro.us/manifest/forumNews.json', function (news) {
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

    try {
        _gaq.push(['_trackEvent', 'Site', 'Navigation', target]);
        _gaq.push(['_trackEvent', 'Site', 'Navigation Movement', internalLocal + ' - ' + target]);
    } catch (e) {}
    internalLocal = target;
    //console.log(target);

    if (launcher && target === 'forum') {
        event.preventDefault();
        ygopro('-a');
        return false;
    } else if (!launcher && target === 'forum') {
        return true;
    } else if ($('.unlogged.in-iframe').length > 0 && target === 'gamelist') {
        return;
    }
    $('body').css('background-image', 'url(http://ygopro.us/img/magimagipinkshadow2.jpg)');
    if (target === 'faq') {
        updatenews();
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagipinkshadow.jpg)');
    }
    if (target === 'sqleditor') {
        $('body').css('background-image', 'url(http://ygopro.us/img/bg.jpg)');
    }
    if (target === 'chat' && !chatStarted) {
        swfobject.embedSWF("lightIRC/lightIRC.swf", "lightIRC", "100%", "92%", "10.0.0", "expressInstall.swf", params, {
            wmode: "transparent"
        });
        chatStarted = true;
    }
    if (target === 'dn' && !dnStarted) {
        $('#dnwindow').attr('src', 'http://www.duelingnetwork.com/?card_image_base=http://localhost:7591/dn/');
        dnStarted = true;
    }
    if (target === 'gamelist') {
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagipinkshadow.jpg)');
    }
    if (target === 'chat') {
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagipinkshadow.jpg)');
    }
    if (target === 'credits') {
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagiblack.jpg)');
    }
    if (target === 'host') {
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagipinkshadow2.jpg)');
    }
    if (target === 'settings') {
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagiblack.jpg)');
        if (admin === "1") {
            $('#sqleditorbutton').css('display', 'block');
        }
    }
    if (target === 'customization') {
        $('body').css('background-image', 'url(http://ygopro.us/img/magimagipinkshadow2.jpg)');
        $('#cusomizationselection').trigger('change');
    }
    $('.activescreen').removeClass('activescreen');
    $('header').not('#anti').css('left', '100vw');
    $('#anti').css('left', '0');
    $('#' + target).css('left', '0').addClass('activescreen');
    saveSettings();
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


    primus.write({
        action: 'privateServer',
        username: localStorage.nickname
    });
    loggedIn = true;
    params.nick = $('#ips_username').val();
    params.identifyPassword = $('#ips_password').val();
    swfobject.embedSWF("lightIRC/lightIRC.swf", "lightIRC", "100%", "92%", "10.0.0", "expressInstall.swf", params, {
        wmode: "transparent"
    });
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
    params.language = lang;
}

function achievementConstructor(data) {
    'use strict';
    return {
        "shadow": (data.field_13 === 'u') ? 'Unlocked' : 'Locked'
    };
}

function mysql_real_escape_string(str) {
    'use strict';
    return str.replace(/[\0\x08\x09\x1a\n\r"\\\%]/g, function (char) {
        switch (char) {
        case "\0":
            return "\\0";
        case "\x08":
            return "\\b";
        case "\x09":
            return "\\t";
        case "\x1a":
            return "\\z";
        case "\n":
            return "\\n";
        case "\r":
            return "\\r";
        case "\"":
            return '""';
        case "\\":
        case "%":
            return "\\" + char; // prepends a backslash to backslash, percent,
            // and double/single quotes
        }
    });
}


$(document).ready(function () {
    'use strict';
    if (window.self !== window.top) {
        $(document.body).addClass("in-iframe");
        launcher = true;
        try {
            _gaq.push(['_trackEvent', 'Launcher', 'Load', 'Boot Launcher']);
        } catch (e) {}
    } else {
        $(document.body).addClass("web");
    }

    params.showJoinPartMessages = false;
    params.autoReconnect = false;
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
                    window.quedfunc = 'populatealllist';
                    window.quedready = true;
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

    if (launcher) {
        $('webonly').css('display', 'none');
        singlesitenav('legal');
    } else {
        singlesitenav('home');
    }


    $('#ipblogin').css('display', 'block');
    $('#cusomizationselection').change(function () {
        $('#displaybody').html('<div class="loading">Loading...</div>');
        var option = $('#cusomizationselection option:selected'),
            source = option.attr('data-source');
        window.quedparams = './ygopro/assets/' + source + '/';
        window.quedfunc = 'getCustoms';
        window.quedready = true;
    });
    $('#displaybody').on('click', 'img', function (item) {
        if (!confirm('Install as ' + $('#cusomizationselection option:selected').text() + ' image?')) {
            return;
        }
        var imgfilename = $(this).attr('data-filename'),
            option = $('#cusomizationselection option:selected'),
            source = option.attr('data-source'),
            target = option.attr('data-target');
        window.quedparams = {
            source: './ygopro/Assets/' + source + '/' + imgfilename,
            target: './ygopro/textures/' + target
        };

        window.quedfunc = 'applycustom';
        window.quedready = true;
        console.log(window.quedparams);

    });
    $('#displaybody').on('click', '.soundsets span', function (item) {
        if (!confirm('Install as ' + $(this).text() + ' music?')) {
            return;
        }
        var target = $(this).attr('data-target'),
            source = $(this).parent().attr('data-filename');

        window.quedparams = {
            source: './ygopro/Assets/Music/' + source,
            target: './ygopro/sound/' + target
        };

        window.quedfunc = 'applycustom';
        window.quedready = true;
        console.log(window.quedparams);

    });
    $('#sqlsearch').keypress(function (e) {
        if (e.which == 13) {
            window.quedparams = {
                db: $('#sqldblist option:selected').text(),
                text: mysql_real_escape_string($('#sqlsearch').val())
            };

            window.quedfunc = 'dbsearch';
            window.quedready = true;
            return false;
        }
    });
    $('#sqlsearchresults').change(function (e) {
        window.quedparams = {
            db: $('#sqldblist option:selected').text(),
            text: $(this).val()
        };

        window.quedfunc = 'dbsearch';
        window.quedready = true;
        return false;
    });
});


function customizationadd() {
    'use strict';
    var file = $('#imageupload')[0].files[0],
        reader = new FileReader(),
        option = $('#cusomizationselection option:selected'),
        source = option.attr('data-source');

    reader.readAsDataURL(file);
    reader.addEventListener("load", function () {
        window.quedparams = {
            target: './ygopro/Assets/' + source + '/' + file.name,
            code: reader.result
        };
        window.quedfunc = 'addcustom';
        window.quedready = true;
        console.log(reader, window.quedparams);
        setTimeout(function () {
            $('#cusomizationselection').change();
        }, 1300);
    }, false);
}


function maketextsSQL() {
    'use strict';
    var id = '"' + $('#sqlid').val() + '"',
        name = '"' + $('#sqlnamebox').val() + '"',
        description = $('#sqldescriptionbox').val(),
        str1 = '"' + $('#sqlstr1').val() + '"',
        str2 = '"' + $('#sqlstr2').val() + '"',
        str3 = '"' + $('#sqlstr3').val() + '"',
        str4 = '"' + $('#sqlstr4').val() + '"',
        str5 = '"' + $('#sqlstr5').val() + '"',
        str6 = '"' + $('#sqlstr6').val() + '"',
        str7 = '"' + $('#sqlstr7').val() + '"',
        str8 = '"' + $('#sqlstr8').val() + '"',
        str9 = '"' + $('#sqlstr9').val() + '"',
        str10 = '"' + $('#sqlstr10').val() + '"',
        str11 = '"' + $('#sqlstr11').val() + '"',
        str12 = '"' + $('#sqlstr12').val() + '"',
        str13 = '"' + $('#sqlstr13').val() + '"',
        str14 = '"' + $('#sqlstr14').val() + '"',
        datas = [id, name, '"' + mysql_real_escape_string(description) + '"', str1, str2, str3, str4, str5, str5, str6, str7, str8, str9, str10, str11, str11, str12, str13, str14].join(',');

    return 'INSERT OR REPLACE INTO "texts" VALUES (' + datas + ');';
}

function leftpad(str, len, ch) {
    'use strict';
    str = String(str);
    var i = -1;
    if (!ch && ch !== 0) {
        ch = ' ';
    }
    len = len - str.length;
    while (++i < len) {
        str = ch + str;
    }
    return str;
}

function makedatasSQL() {
    'use strict';
    var id = '"' + $('#sqlid').val() + '"',
        ot = '"' + ($('#sqlot').val() || 0) + '"',
        alias = '"' + $('#sqlalias').val() + '"',
        setcode,
        type = 0,
        atk = '"' + $('#sqlatk').val() + '"',
        def = '"' + $('#sqldef').val() + '"',
        level,
        race = '"' + $('#sqlrace').val() + '"',
        attribute = '"' + $('#sqlattribute').val() + '"',
        category = 0,
        texts = [];

    $('.typebox input:checked').each(function () {
        var val = parseInt($(this).val(), 10);
        type = type + val;

    });
    type = '"' + type + '"';
    $('#sqlcardcategorybox input:checked').each(function () {
        var val = parseInt($(this).val(), 16);
        if (val) {
            category = Number(category) + val;
        }

    });
    atk = (atk === '"?"') ? '"-2"' : atk;
    def = (def === '"?"') ? '"-2"' : def;
    category = '"' + category + '"';

    level = '0x' + leftpad($('#sqlscalel').val(), 2, 0) + leftpad($('#sqlscaler').val(), 2, 0) + leftpad($('#sqllevel').val(), 4, 0);
    level = '"' + parseInt(level, 16) + '"';
    setcode = '0x' + leftpad($('#sqlsc4 option:selected').attr('data-calc'), 3, 0) + leftpad($('#sqlsc3 option:selected').attr('data-calc'), 3, 0) + leftpad($('#sqlsc2 option:selected').attr('data-calc'), 3, 0) + leftpad($('#sqlsc1 option:selected').attr('data-calc'), 3, 0);
    setcode = '"' + parseInt(setcode, 16) + '"';
    texts = [id, ot, alias, setcode, type, atk, def, level, race, attribute, category].join(',');
    return 'INSERT OR REPLACE INTO "datas" VALUES (' + texts + ');';
}

function saveCard() {
    'use strict';
    var message = {
        sql: makedatasSQL() + '\r\n\r\n' + maketextsSQL(),
        db: $('#sqldblist option:selected').text()
    };
    window.quedparams = message;
    window.quedfunc = 'dbupdate';
    window.quedready = true;
    $('#sqloutput').val(message.sql);
    return message;
}

function deleteCard() {
    'use strict';
    var id = $('#sqlid').val(),
        message = {
            sql: 'DELETE FROM datas WHERE id="' + id + '";DELETE FROM texts WHERE id="' + id + '";',
            db: $('#sqldblist option:selected').text()
        };
    if (confirm('Delete ' + id)) {
        window.quedparams = message;
        window.quedfunc = 'dbupdate';
        window.quedready = true;
        $('#sqloutput').val(message.sql);
    }
}

function convertID() {
    'use strict';
    var regex = /^\d+$/,
        id = $('#sqlid').val(),
        convert = prompt("Please enter NEW ID", ""),
        message;

    if (convert && convert.match(regex)) {
        message = {
            sql: 'UPDATE datas SET id = ' + convert + ' WHERE id="' + id + '";UPDATE texts SET id = ' + convert + ' WHERE id="' + id + '";',
            db: $('#sqldblist option:selected').text(),
            rename: true,
            from: convert,
            to: id
        };
        if (confirm('Convert ' + id + ' to ' + convert + '?')) {
            window.quedparams = message;
            window.quedfunc = 'dbupdate';
            window.quedready = true;
            $('#sqloutput').val(message.sql);
        }
    } else {
        alert('Invalid ID, not a number');
    }
}

function runPowerDB() {
    'use strict';
    var sql = $('#sqleditorpowermodeinput').val(),
        message = {
            sql: sql,
            db: $('#sqldblist2 option:selected').text()
        };

    window.quedparams = message;
    window.quedfunc = 'powerdb';
    window.quedready = true;


}