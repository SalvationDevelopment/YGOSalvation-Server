/**
 * The point of the core is to play the game. We want this happening on a different thread from the actual server and if it crashes
 * it should not take the server down. Normally this is not much of an issue but it is connected to a dynamic library via a foriegn
 * function interface (C++) so what is going on in there could cause a crash and it will take the Nodejs process with it.
 */

const core  = require('./core');
core.main();
