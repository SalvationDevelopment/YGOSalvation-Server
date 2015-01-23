/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
var assert = require("assert");
var phantom = require('phantom');

phantom.create(
    function (ph) {
        'use strict';
        ph.createPage(function (page) {
            page.open("../client/interface/index.html", function (status) {
                //      console.log("opened google? ", status);
                //      page.evaluate(function () { return document.title; }, function (result) {
                //        console.log('Page title is ' + result);
                ph.exit();
            });
        });
    }
);

require('../server/server.js');