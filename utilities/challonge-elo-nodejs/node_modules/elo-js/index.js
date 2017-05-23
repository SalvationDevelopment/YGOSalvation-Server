"use strict";

(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module);
    }
})(function (exports, module) {
    var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

    var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var CHANCES = Object.freeze({
        lost: 0,
        tied: 0.5,
        won: 1
    });

    // lol magic http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
    var MAGIC = 400;

    // http://en.wikipedia.org/wiki/Elo_rating_system#Most_accurate_K-factor
    // USCF k-factors
    var DEFAULT_KFACTOR = 32;

    var DEFAULT_KFACTORS = function (rating) {
        if (rating <= 2100) {
            return DEFAULT_KFACTOR;
        } else if (2100 < rating && rating <= 2400) {
            return 24;
        } else if (2400 < rating) {
            return 16;
        }
    };

    var processRating = Symbol();
    var _kFactor = Symbol();
    var _min = Symbol();
    var _max = Symbol();

    var Elo = (function () {
        function Elo() {
            var kFactor = arguments[0] === undefined ? DEFAULT_KFACTOR : arguments[0];
            var min = arguments[1] === undefined ? -Infinity : arguments[1];
            var max = arguments[2] === undefined ? Infinity : arguments[2];

            _classCallCheck(this, Elo);

            this[_kFactor] = kFactor;
            this[_min] = min;
            this[_max] = max;
        }

        _prototypeProperties(Elo, null, _defineProperty({
            getMin: {
                value: function getMin() {
                    return this[_min];
                },
                writable: true,
                configurable: true
            },
            setMin: {
                value: function setMin() {
                    var minimum = arguments[0] === undefined ? -Infinity : arguments[0];

                    this[_min] = minimum;

                    return this;
                },
                writable: true,
                configurable: true
            },
            getMax: {
                value: function getMax() {
                    return this[_max];
                },
                writable: true,
                configurable: true
            },
            setMax: {
                value: function setMax() {
                    var maximum = arguments[0] === undefined ? Infinity : arguments[0];

                    this[_max] = maximum;

                    return this;
                },
                writable: true,
                configurable: true
            },
            getKFactor: {
                value: function getKFactor() {
                    var rating = arguments[0] === undefined ? 0 : arguments[0];

                    if (!isNaN(this[_kFactor])) {
                        return this[_kFactor];
                    }

                    return DEFAULT_KFACTORS(rating);
                },
                writable: true,
                configurable: true
            },
            setKFactor: {
                value: function setKFactor() {
                    var kFactor = arguments[0] === undefined ? DEFAULT_KFACTOR : arguments[0];

                    this[_kFactor] = kFactor;

                    return this;
                },
                writable: true,
                configurable: true
            },
            odds: {
                value: function odds(rating, opponentRating) {
                    var difference = opponentRating - rating;

                    return 1 / (1 + Math.pow(10, difference / MAGIC));
                },
                writable: true,
                configurable: true
            },
            ifWins: {
                value: function ifWins(rating, opponentRating) {
                    var odds = this.odds(rating, opponentRating);

                    return this[processRating](odds, CHANCES.won, rating);
                },
                writable: true,
                configurable: true
            },
            ifLoses: {
                value: function ifLoses(rating, opponentRating) {
                    var odds = this.odds(rating, opponentRating);

                    return this[processRating](odds, CHANCES.lost, rating);
                },
                writable: true,
                configurable: true
            },
            ifTies: {
                value: function ifTies(rating, opponentRating) {
                    var odds = this.odds(rating, opponentRating);

                    return this[processRating](odds, CHANCES.tied, rating);
                },
                writable: true,
                configurable: true
            }
        }, processRating, {
            value: function (odds, actualScore, previousRating) {
                var difference = actualScore - odds;
                var rating = Math.round(previousRating + this.getKFactor(previousRating) * difference);

                if (rating < this[_min]) {
                    rating = this[_min];
                } else if (rating > this[_max]) {
                    rating = this[_max];
                }

                return rating;
            },
            writable: true,
            configurable: true
        }));

        return Elo;
    })();

    module.exports = Elo;
});

/* @flow */