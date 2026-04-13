const { Router } = require('express');
const users = require('./endpoint_users');
const services = require('./endpoint_services');
const forum = require('./endpoint_forum');
const tournaments = require('./endpoint_tournaments');

/**
 * Creates api router used by the api routes module.
 * @param {Object} options The options object supplies structured input used by the api routes module.
 * @param {?Function} options.hostGameAllocator The `hostGameAllocator` property supplies structured input used by the api routes module.
 * @returns {import('express').Router} Returns the value produced by the api routes module.
 */
function createApiRouter(options = {}) {
  const router = Router();

  users.setupEndpoints(router);
  services.setupEndpoints(router);
  forum.setupEndpoints(router);
  tournaments.setupEndpoints(router, {
    hostGameAllocator: options.hostGameAllocator
  });

  return router;
}

module.exports = {
  createApiRouter
};
