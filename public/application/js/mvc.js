/* jslint node:true */
/* jslint browser:true */
/*global jQuery, watch */

function model(publicModel, view, controller, level, init) {
    view = view || [];
    controller = controller || function () {};
    init = init || function () {};
    level = level || 1;

    publicModel = publicModel || {
        model: null
    };
    this.set = function (property, value) {
        publicModel[property] = value;
    };
    this.get = function (property) {
        return publicModel[property];
    };
    this.state = function () {
        return publicModel;
    };
    this.init = init;
    watch(publicModel, function (property, action, newValue, oldValue) {
        var data = {
            property: property,
            action: action,
            newValue: newValue,
            oldValue: oldValue
        };
        controller(view, data);
    }, level);
    return this;
}
var tabModel = {
    location: 'login'
};
var tabController = function (view, data) {
    jQuery(view[0]).attr('class', data.newValue);
    jQuery('#' + data.oldValue+', .mainnavigation .'+data.oldValue).toggleClass('active');
    jQuery('#' + data.newValue+', .mainnavigation .'+data.newValue).toggleClass('active');
};
var tab = new model(tabModel, ['#view'], tabController);
var gotoTab = function(location){
    tab.set('location',location);
};