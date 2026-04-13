const DEV_MODE = true;

const config = {
  main: true,
  debug: false,
  error: false
};

/**
 * Executes the create helper used by the logger module.
 * @param {boolean} enabled The enabled value provides an input used by the logger module.
 * @param {string} prefix The prefix value provides an input used by the logger module.
 * @returns {{log: Function}} Returns the value produced by the logger module.
 */
const create = (enabled, prefix) =>
  Object.create(
    {},
    {
      log: {
        get: () => {
          // if debug is enabled and the environment is dev, return bound console
          // so logs are passed-through as-is.
          if (enabled && DEV_MODE) {
            return console.log.bind(console, prefix);
          }
          // if debug is enabled and the environment is NOT DEV, return new function
          if (enabled && !DEV_MODE) {
            // Determine what we want to do for "Production" logs here.
          }
          // if debug is not enabled, surpress all logs
          return () => {
          };
        }
      }
    }
  );

module.exports = {
  create,
  config
};
