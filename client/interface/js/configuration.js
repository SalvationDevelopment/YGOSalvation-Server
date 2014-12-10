/* jslint node : true */
var developmentstage = {
    "production": "http://ygopro.us/launcher.html",
    "stage": "http://dev.ygopro.us/launcher.html",
    "development": "http://127.0.0.1:8080/launcher.html"
};
var mode = 'development';

if (mode === 'development') {
    try {
        require('nw.gui').Window.get().showDevTools();
    } catch (error) {}
}