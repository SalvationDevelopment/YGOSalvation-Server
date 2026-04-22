const path = require("node:path");
const { pathToFileURL } = require("node:url");

async function loadCmsModule(relativePath) {
  const absolutePath = path.resolve(__dirname, "../../../server/cms/lib", relativePath);
  return import(pathToFileURL(absolutePath).href);
}

module.exports = {
  loadCmsModule
};
// Run with: npm run test:unit
