/*jslint browser: true, node: true, plusplus: true*/
/*global  prompt, alert, localStorage, developmentstage, mode, $*/
/*exported  connectToCheckmateServer, applySettings, saveSettings, isChecked, openScreen*/



function applySettings() {
    'use strict';
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost'),
            value = ('1' === localStorage[property]) ? true : false;
        $(this).prop('checked', value);
    });
}

function saveSettings() {
    'use strict';
    $('[data-localhost]').each(function () {
        var property = $(this).attr('data-localhost');
        localStorage[property] = Number($(this).prop('checked'));
    });
}


$('document').ready(function () {
    'use strict';
    $('main').load(developmentstage[mode] + '?' + Math.random(), function () {

        if (window.self !== window.top) {
            $(document.body).addClass("in-iframe");
            var gui = require('nw.gui');
            $(document).ready(function () {
                gui.Window.get().show();
            });

        }

    });


});
function closeAllScreens() {
    'use strict';
    $('#salvationdevelopment').css('display', 'block');
    $('#staticbar section').css('display', 'none');

}
function openScreen(id) {

    closeAllScreens();
    $('#salvationdevelopment').css('display', 'none');
    $(id).toggle();
}