/**
 * The point of the core is to play the game. We want this happening on a different thread from the actual server and if it crashes
 * it should not take the server down. Normally this is not much of an issue but it is connected to a dynamic library via a foriegn
 * function interface (C++) so what is going on in there could cause a crash and it will take the Nodejs process with it.
 */

const core = require('./core');

let hostConfiguration = {};

if (typeof process.env.HOST_CONFIG_JSON === 'string' && process.env.HOST_CONFIG_JSON) {
    try {
        hostConfiguration = JSON.parse(process.env.HOST_CONFIG_JSON);
    } catch (error) {
        console.error('[tcgcore/bootstrap] failed to parse HOST_CONFIG_JSON');
        console.error(error.stack || error.message || error);
    }
}

core.main(hostConfiguration);

process.on('uncaughtException', function (err) {
    console.error('An uncaught error occurred!');
    console.error(err.stack);
});
