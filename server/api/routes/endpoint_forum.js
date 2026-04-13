require('../../lib/load-shared-env');

const ADMIN_SERVER_HOST = process.env.ADMIN_SERVER_HOST,
  http = require('http');

/**
 * Executes the proxy request helper used by the endpoint forum module.
 * @param {Object} request The request request object provides the incoming data used by the endpoint forum route, including the `method` and `url` properties.
 * @param {string} request.method The `method` property supplies structured input used by the endpoint forum module.
 * @param {string} request.url The `url` property supplies structured input used by the endpoint forum module.
 * @param {Object} response The response response provides the outgoing channel used by the endpoint forum route.
 * @returns {void} Does not return a value.
 */
function proxyRequest(request, response) {
  const config = {};
  config.host = ADMIN_SERVER_HOST;
  config.port = 1337;
  config.method = request.method;
  config.url = request.url;

  http.request(config, res => {
    res.on('data', function (chunk) {
      // console.log('chunk', chunk)
      response.write(chunk, 'binary');
    });
    res.on('end', function () {
      response.end();
    });
  }).end();

}

/**
 * Sets up endpoints used by the endpoint forum module.
 * @param {Object} app The app object supplies the structured input used by the endpoint forum module, including the `get` property.
 * @param {Function} app.get The `get` property supplies structured input used by the endpoint forum module.
 * @returns {void} Does not return a value.
 */
function setupEndpoints(app) {
  app.get('/sections', (request, response) => {
    proxyRequest(request, response);
  });

  app.get('/forums', (request, response) => {
    proxyRequest(request, response);
  });

  app.get('/threads', (request, response) => {
    proxyRequest(request, response);
  });

  app.get('/comments', (request, response) => {
    proxyRequest(request, response);
  });
}

module.exports = {
  setupEndpoints
};
