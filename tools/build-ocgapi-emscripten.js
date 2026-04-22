const buildScript = require("../scripts/build-emscripten.js");

if (require.main === module) {
  buildScript.main(process.argv);
}

module.exports = buildScript;
