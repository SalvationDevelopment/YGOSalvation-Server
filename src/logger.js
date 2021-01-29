const DEV_MODE = true;

const config = {
    main: true,
    debug: false,
    error: false,
};

/**
 * Usage is the same as console.log, but can be turned on/off as needed
 *
 * @param {boolean} enabled whether or not the log should be enabled
 * @param {string} prefix the prefix for the log
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
                },
            },
        }
    );

module.exports = {
    create,
    config,
};
