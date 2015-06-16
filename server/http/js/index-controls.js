/*jslint browser:true, plusplus:true, nomen: true*/
/*global $, saveSettings, Handlebars, prompt, _gaq, isChecked, alert, primus, ygopro*/

function isChecked(id) {
    'use strict';
    return ($(id).is(':checked'));
}
function updatenews() {
    'use strict';
    $.getJSON('news.json', function (news) {
        $.get('handlebars/news.handlebars', function (template) {
            var parser = Handlebars.compile(template);
            $('#news').append(parser(news));
        });
    });
}

var launcher = false,
    internalLocal = 'home',
    loggedIn = false,
    list = {};

function singlesitenav(target) {
    'use strict';
    console.log('navigating to:', target);
    _gaq.push(['_trackEvent', 'Site', 'Navigation', target]);
    _gaq.push(['_trackEvent', 'Site', 'Navigation Movement', internalLocal + ' - ' + target]);
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
    if (target === 'faq') {
        updatenews();
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
    $('#ipblogin').css('display', 'none');

    _gaq.push(['_trackEvent', 'Launcher', 'Login', localStorage.nickname]);
    singlesitenav('faq');

    primus.write({
        action: 'privateServer',
        username: localStorage.nickname
    });
    loggedIn = true;

}

function processServerCall(data) {
    'use strict';
    if (!data.currentdeck) {
        return;
    }
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
}

$(document).ready(function () {
    'use strict';
    if (localStorage.loginnick && localStorage.loginpass) {
        $('#ips_username').val(localStorage.loginnick);
        $('#ips_password').val(localStorage.loginpass);
    }
    if (localStorage.remember) {
        $('#ips_remember').prop('checked', true);
    }
    $("#dolog").click(function (ev) {
        _gaq.push(['_trackEvent', 'Launcher', 'Attempt Login', $('#ips_username').val()]);
        var url = "http://forum.ygopro.us/log.php";
        $.ajax({
            type: "POST",
            url: url,
            data: $("#ipblogin").serialize(), // serializes the form's elements.
            success: function (data) {
                var info = JSON.parse(data);
                if (info.success) {
                    localStorage.nickname = info.displayname;
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
                } else {
                    alert(info.message);
                }
            }
        });
        ev.preventDefault();
        return false; // avoid to execute the actual submit of the form.
    });

    if (launcher) {
        $('webonly').css('display', 'none');
        $('#ipblogin').css('display', 'block');
    }

    
   

});
