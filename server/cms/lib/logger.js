const DEV_MODE = process.env.NODE_ENV !== "production";

export const config = {
  main: true,
  debug: false,
  error: true,
};

/**
 * Executes the create helper used by the logger module.
 * @param {(string|boolean)} enabled The enabled value provides an input used by the logger module.
 * @param {string} prefix The prefix value provides an input used by the logger module.
 * @returns {Object} Returns a logger wrapper object that exposes the logging helpers used by the logger module.
 */
export const create = (enabled, prefix) =>
  Object.create(
    {},
    {
      log: {
        get: () => {
          if (enabled && DEV_MODE) {
            return console.log.bind(console, prefix);
          }
          if (enabled && !DEV_MODE) {
            return console.log.bind(console, prefix);
          }
          return () => {};
        },
      },
    },
  );
