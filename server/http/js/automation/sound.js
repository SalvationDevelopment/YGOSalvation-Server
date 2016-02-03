var sound = {};


(function () {
    'use strict';
    sound.play = function (targetID) {

        document.getElementById(targetID).play();
    };
}());