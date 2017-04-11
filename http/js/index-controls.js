/*jslint browser:true, plusplus:true, nomen: true, regexp:true*/
/*global $, saveSettings, Handlebars, prompt, _gaq, isChecked, alert, primus, ygopro, translationDB, params, swfobject, console, FileReader, prompt, confirm, jQuery, activelyDueling*/

var admin = false,
    chatStarted = false,
    dnStarted = false;

var tournament = {},
    loadedprofiles = {};



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
$.browser = {};
(function () {
    'use strict';
    $.browser.msie = false;
    $.browser.version = 0;

    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
}());

function updatenews() {
    'use strict';
    $.getFeed({
        url: 'https://forum.ygopro.us/index.php?/forum/14-announcements-and-news.xml/',
        success: function (feed) {
            $.get('handlebars/forumnews.handlebars', function (template) {
                var parser = Handlebars.compile(template),
                    topics = feed.items,
                    news = {
                        articles: []
                    },
                    output;

                topics.forEach(function (topic, index) {
                    if (index > 5) {
                        //limit the number of post in the news feed.
                        return;
                    }
                    news.articles.push({
                        date: new Date(topic.updated).toString().substr(0, 15),
                        //author: topic.author,
                        post: topic.description,
                        title: topic.title,
                        link: topic.link
                    });
                });
                news.articles.sort(function (arti) {
                    return new Date(arti.date).getTime();
                });
                news.articles.reverse();
                output = parser(news);
                //console.log(feed, parser, topics, output);
                $('#news').html(output);
            });
        }
    });
}

function updateevents() {
    'use strict';
    $.getFeed({
        url: 'https://forum.ygopro.us/index.php?/forum/15-official-tournaments.xml',
        success: function (feed) {
            $.get('handlebars/forumnews.handlebars', function (template) {
                var parser = Handlebars.compile(template),
                    topics = feed.items,
                    news = {
                        articles: []
                    };
                topics.forEach(function (topic, index) {
                    if (index > 5) {
                        //limit the number of post in the news feed.
                        return;
                    }
                    news.articles.push({
                        date: new Date(topic.updated).toString().substr(0, 15),
                        //author: topic.author,
                        post: topic.description,
                        title: topic.title,
                        link: topic.link
                    });
                });
                $('#eventsandtournaments').html(parser(news));
            });
        }
    });
}
updatenews();
var launcher = false,
    internalLocal = 'home',
    loggedIn = false,
    allowLogin = false,
    list = {};

function alertmodal(message) {
    'use strict';
    $('#alertmodal').css('display', 'flex');
    $('#alertmodaltext').html(message);
}

function closealertmodal() {
    'use strict';
    $('#alertmodal').css('display', 'none');
    $('#alertmodaltext').html('');
}

function deckeditloader() {
    'use strict';
    primus.write({
        username: localStorage.nickname,
        action: 'load'
    });
}

var uncensoredcolor = 'url(../img/magimagipink.jpg)',
    uncensoredblack = 'url(../img/magimagiblack.jpg)',
    censoredcolor = 'url(../img/magimagipinkshadow.jpg)',
    censoredblack = 'url(../img/magimagipinkshadow2.jpg)',
    usecensor = (location.host === 'ygopro.us');

function blackbg() {
    'use strict';
    return (usecensor) ? censoredblack : uncensoredblack;
}

function colorbg() {
    'use strict';
    return (usecensor) ? censoredcolor : uncensoredcolor;
}

function singlesitenav(target) {
    'use strict';
    if (target === 'forum') {
        return;
    }
    if (activelyDueling === undefined) {
        if (internalLocal === 'duelscreen' && activelyDueling) {
            alertmodal('You are in a duel, surrender or finish it.');
            return false;
        }
    }

    if (target === 'deckedit') {
        deckeditloader();
    }
    manualDuel === undefined;
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
    $('body').css('background-image', blackbg());
    $('#marquee').removeClass('marquee');
    if (target === 'faq') {
        updatenews();
        $('body').css('background-image', colorbg());
    }
    if (target === 'events') {
        updateevents();
        $('body').css('background-image', colorbg());
    }
    if (target === 'sqleditor') {
        $('body').css('background-image', 'url(../img/bg.jpg)');
    }
    if (target === 'chat' && !chatStarted) {

    }
    if (target === 'gamelist') {
        $('body').css('background-image', colorbg());
        if (launcher === false) {
            window.manualModeGamelistSwitch();
        }
        window.manualLeave();
    }
    if (target === 'chat') {
        $('body').css('background-image', colorbg());
    }

    if (target === 'host') {
        $('body').css('background-image', blackbg());
        window.manualLeave();
        if (launcher === false) {
            $('.automaticonly').css('display', 'none');
        }
    }

    if (target === 'settings') {
        $('body').css('background-image', blackbg());
        if (admin === "1") {
            $('#sqleditorbutton').css('display', 'block');
        }
    }
    if (target === 'customization') {
        $('body').css('background-image', blackbg());
        setTimeout(function () {
            $('#cusomizationselection').trigger('change');
        }, 3000);


    }
    //$('body').css('background-image', 'url(http://static.zerochan.net/Ghostrick.Nekomusume.full.1945016.jpg)');
    if (target === 'credits') {
        $('body').css('background-image', 'url(../img/bg.jpg)');
        $('#marquee').addClass('marquee');
    }
    if (target === 'home') {
        allowLogin = false;
    }

    $('.activescreen').removeClass('activescreen');
    $('header').not('#anti').css('left', '100vw');
    $('#anti').css('left', '0');
    $('#' + target).css('left', '0').addClass('activescreen');
    saveSettings();
    $('#manualcontrols button').css({
        'display': 'none'
    });
    if (!launcher) {
        $('.notneededinweb').css('display', 'none');
    }
    activelyDueling = false;
    $('#camerazone').css('display', 'none');
    return false;
}




function locallogin(init) {
    'use strict';
    localStorage.nickname = localStorage.nickname || '';


    $(document.body).addClass("launcher").removeClass('unlogged').removeClass('web');
    //    $('#ipblogin').css('display', 'none');
    try {
        _gaq.push(['_trackEvent', 'Launcher', 'Login', localStorage.nickname]);
    } catch (e) {}




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

function mysql_real_escape_string(str) {
    'use strict';
    return str.replace(/[\0\x08\x09\x1a"\\\%]/g, function (char) {
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

function processLogin(data) {
    'use strict';
    if (loggedIn || !allowLogin) {
        return;
    }


    var info = data;
    console.log('Attempting to do login based on :', data);
    if (info.success) {
        localStorage.nickname = info.displayname;
        admin = info.data.g_access_cp;
        if (admin === "1") {
            $('body').addClass('adminuser');
        }
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
        loggedIn = true;


        $('#profileusername').text(info.displayname);
        $('#profilepoints span').text(info.data.field_12);
        if (parseInt(info.data.post, 10) < 1) {
            alertmodal('Please visit our forums and introduce yourself!');
        }
        window.quedfunc = 'populatealllist';
        window.quedready = true;

        primus.write({
            username: localStorage.nickname,
            action: 'load'
        });
    } else {
        alertmodal(info.message);
    }

}



Handlebars.registerHelper("counter", function (index) {
    'use strict';
    return index + 1;
});

function updateranking() {
    'use strict';
    $.getJSON('/ranking.json', function (feed) {
        var rows = [],
            merged = {};

        feed.forEach(function (tournament) {
            Object.keys(tournament).forEach(function (name) {
                if (merged[name]) {
                    merged[name] += tournament[name];
                } else {
                    merged[name] = tournament[name];
                }
            });
        });

        Object.keys(merged).forEach(function (person) {
            rows.push({
                name: person,
                points: merged[person]
            });
        });
        rows = rows.sort(function (a, b) {
            return b.points - a.points;
        });
        var requests = [],
            i;
        for (i = 0; i < rows.length; i++) {
            requests.push($.ajax('https://forum.ygopro.us/avatar2.php?username=' + rows[i].name));
        }
        $.when.apply(undefined, requests).then(function () {
            var duelist = [].slice.call(arguments),
                convert = [],
                endresult;

            duelist.forEach(function (item) {
                try {
                    convert.push(JSON.parse(item[0]));
                } catch (ignoreError) {}
            });


            endresult = rows.map(function (item) {
                var forumresult = convert.find(function (forumitem) {
                    return (forumitem.username === item.name);
                });
                return Object.assign({}, item, forumresult);
            });
            $.get('handlebars/ranking.handlebars', function (template) {
                var parser = Handlebars.compile(template);
                $('#rankingtable').html(parser(endresult));
            });
            endresult.forEach(function (item) {
                loadedprofiles[item.username] = item;
            });
            $(".clickable-row").click(function () {
                window.open($(this).data("href"));
            });
        });
    });
}


$(document).ready(function () {
    'use strict';

    $('#creategameduelmode').on('change', function () {
        $('#creategamelp').val($('#creategameduelmode option:selected').attr('data-lp'));
    });
    if (window.self !== window.top) {
        $(document.body).addClass("in-iframe");
        launcher = true;
        try {
            _gaq.push(['_trackEvent', 'Launcher', 'Load', 'Boot Launcher']);
        } catch (e) {}
    } else {
        $(document.body).addClass("web");
    }

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
        allowLogin = true;
        try {
            _gaq.push(['_trackEvent', 'Launcher', 'Attempt Login', $('#ips_username').val()]);
        } catch (e) {}
        primus.write({
            action: 'register',
            username: $('#ips_username').val(),
            password: $('#ips_password').val()
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
        if (e.which === 13) {
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

function runreUpdate() {
    'use strict';
    window.quedfunc = 'reUpdate';
    window.quedready = true;
}


function maketextsSQL() {
    'use strict';
    var id = '"' + $('#sqlid').val() + '"',
        name = '"' + $('#sqlnamebox').val().replace(/"/g, '""') + '"',
        description = $('#sqldescriptionbox').val(),
        str1 = '"' + $('#sqlstr1').val().replace(/"/g, '""') + '"',
        str2 = '"' + $('#sqlstr2').val().replace(/"/g, '""') + '"',
        str3 = '"' + $('#sqlstr3').val().replace(/"/g, '""') + '"',
        str4 = '"' + $('#sqlstr4').val().replace(/"/g, '""') + '"',
        str5 = '"' + $('#sqlstr5').val().replace(/"/g, '""') + '"',
        str6 = '"' + $('#sqlstr6').val().replace(/"/g, '""') + '"',
        str7 = '"' + $('#sqlstr7').val().replace(/"/g, '""') + '"',
        str8 = '"' + $('#sqlstr8').val().replace(/"/g, '""') + '"',
        str9 = '"' + $('#sqlstr9').val().replace(/"/g, '""') + '"',
        str10 = '"' + $('#sqlstr10').val().replace(/"/g, '""') + '"',
        str11 = '"' + $('#sqlstr11').val().replace(/"/g, '""') + '"',
        str12 = '"' + $('#sqlstr12').val().replace(/"/g, '""') + '"',
        str13 = '"' + $('#sqlstr13').val().replace(/"/g, '""') + '"',
        str14 = '"' + $('#sqlstr14').val().replace(/"/g, '""') + '"',
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


$("#sqlcardtypes input[type=radio]").change(function () {
    'use strict';
    var checked = $(this).is(':checked');
    $("#sqlcardtypes input").prop('checked', false);
    if (checked) {
        $(this).prop('checked', true);
    }
});

$("#sqlcardtypes input[type=checkbox]").change(function () {
    'use strict';
    var checked = $(this).is(':checked');
    $("#sqlcardtypes input[type=radio]").prop('checked', false);
});

function makedatasSQL() {
    'use strict';
    var id = '"' + $('#sqlid').val() + '"',
        ot = '"' + ($('#sqlot').val() || 0) + '"',
        alias = '"' + $('#sqlalias').val() + '"',
        setcode,
        type = 0,
        atk = '"' + ($('#sqlatk').val() || 0) + '"',
        def = '"' + ($('#sqldef').val() || 0) + '"',
        level,
        race = '"' + $('#sqlrace').val() + '"',
        attribute = '"' + $('#sqlattribute').val() + '"',
        category = 0,
        texts = [],
        montype;

    $('.typebox input:checked').each(function () {
        var val = parseInt($(this).val(), 10);
        type = type + val;
    });

    $('#sqlcardcategorybox input:checked').each(function () {
        var val = parseInt($(this).val(), 16);
        if (val) {
            category = Number(category) + val;
        }
    });
    montype = 0;
    $('#monbox input:checked').each(function () {
        montype = 1;
    });
    type = '"' + (type + montype) + '"';

    category = Number(category) + montype;
    atk = (atk === '"?"') ? '"-2"' : atk;
    def = (def === '"?"') ? '"-2"' : def;
    category = '"' + category + '"';

    level = '0x' + parseInt($('#sqlscalel').val()).toString(16) + '0' + parseInt($('#sqlscaler').val()).toString(16) + '000' + parseInt($('#sqllevel').val()).toString(16);
    level = '"' + parseInt(level, 16) + '"';
    setcode = '0x' + $('#sqlsc4 option:selected').attr('data-calc') + leftpad($('#sqlsc3 option:selected').attr('data-calc'), 4, 0) + leftpad($('#sqlsc2 option:selected').attr('data-calc'), 4, 0) + leftpad($('#sqlsc1 option:selected').attr('data-calc'), 4, 0);
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
        alertmodal('Invalid ID, not a number');
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


function confirmDialog(title, message, confirm, reject) {
    var dialog = $('<div />').html(message).dialog({
        appendTo: 'body',
        title: title,
        modal: true,
        buttons: {
            "OK": function () {
                $(this).dialog("close");
                confirm();
            },
            "cancel": function () {
                $(this).dialog("close");
                if ($.isFunction(reject)) {
                    reject();
                }
            }
        },
        close: function (event, ui) {
            $(this).dialog('destroy');
            $(this).remove();
        }
    });
}

function screenshot() {
    'use strict';
    html2canvas(document.body, {
        onrendered: function (canvas) {
            var dt = canvas.toDataURL('image/png');
            dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
            var image = new Image();
            image.src = dt;
            var newWin = window.open("<title>Screenshot</title>");
            if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                //POPUP BLOCKED
                alertmodal('Popups are blocked, cant display screenshot!');
                return;
            }
            newWin.document.write(image.outerHTML);
        }
    });
}