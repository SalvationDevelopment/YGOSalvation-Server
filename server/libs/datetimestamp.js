/*jslint node: true, plusplus: true, unparam: false, nomen: true*/
String.prototype.reverse = function () {
    'use strict';
    var s = "",
        i = this.length;
    while (i > 0) {
        s += this.substring(i - 1, i);
        i--;
    }
    return s;
};

function createDateString() {
    'use strict';
    var dateObject = new Date(),
        hours = ('0' + dateObject.getHours()).reverse().substring(0, 2).reverse(),
        minutes = ('0' + dateObject.getMinutes()).reverse().substring(0, 2).reverse();
    return "[" + hours + ":" + minutes + "] ";
}

module.exports = createDateString;