const ROCK = 0,
    PAPER = 1,
    SCISSORS = 2,
    ANIMATION_TIME = 1000,
    shuffle = require('./lib_shuffle');

/**
 * Executes the roll helper used by the lib choice module.
 * @param {number} sides The sides value provides an input used by the lib choice module.
 * @returns {number} Returns the value produced by the lib choice module.
 */
function roll(sides = 6) {
    return Math.floor(Math.random() * sides) + 1;
}


/**
 * Executes the flip helper used by the lib choice module.
 * @returns {number} Returns the value produced by the lib choice module.
 */
function flip() {
    return roll(2) - 1;
}

/**
 * Executes the shoot helper used by the lib choice module.
 * @param {Array} clients The clients value provides an input used by the lib choice module.
 * @param {number} p1 The p1 value provides an input used by the lib choice module.
 * @param {number} p2 The p2 value provides an input used by the lib choice module.
 * @returns {Promise<null>} Returns the value produced by the lib choice module.
 */
function shoot(clients, p1, p2) {
    clients.forEach((client, i) => {
        client.write({
            action: 'choice',
            type: 'rps',
            result: [p1, p2],
            slot: i
        });
    });

    if (p1 < 0 || p1 > 3 || p2 < 0 || p2 > 3) {
        throw new Error('Enumeral of player result is out of range');
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let result;
            if (p1 === p2) {
                return resolve(null);
            }

            switch (p1) {
                case ROCK:
                    result = (p2 === SCISSORS) ? 0 : 1;
                    break;
                case PAPER:
                    result = (p2 === ROCK) ? 0 : 1;
                    break;
                case SCISSORS:
                    result = (p2 === PAPER) ? 0 : 1;
                    break;
            }
            resolve(result);

        }, ANIMATION_TIME);
    });

}

/**
 * Executes the ask helper used by the lib choice module.
 * @param {Object} client The client value provides an input used by the lib choice module.
 * @param {number} i The i value provides an input used by the lib choice module.
 * @returns {Promise<Object>} Returns the value produced by the lib choice module.
 */
function ask(client, i) {
    return new Promise((resolve) => {
        client.write({
            action: 'choice',
            type: 'rps'
        });
        client.once('choice', resolve);
    });

}

/**
 * Executes the dice helper used by the lib choice module.
 * @param {Array} clients The clients value provides an input used by the lib choice module.
 * @returns {Object} Returns the value produced by the lib choice module.
 */
function dice(clients) {
    let p1 = 0,
        p2 = 0;

    while (p1 === p2) {
        p1 = roll();
        p2 = roll();
    }

    return {
        winner: (p1 > p2) ? 0 : 1,
        results: [p1, p2]
    };
}

/**
 * Executes the coin helper used by the lib choice module.
 * @param {Array} clients The clients value provides an input used by the lib choice module.
 * @returns {Object} Returns the value produced by the lib choice module.
 */
function coin(clients) {
    let p1 = 0,
        p2 = 0;

    while (p1 === p2) {
        p1 = flip();
        p2 = flip();
    }

    return {
        winner: (p1 > p2) ? 0 : 1,
        results: [p1, p2]
    };
}



/**
 * Executes the animation pause helper used by the lib choice module.
 * @returns {Promise<void>} Returns the value produced by the lib choice module.
 */
function animationPause() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

/**
 * Executes the rps helper used by the lib choice module.
 * @param {Array} clients The clients value provides an input used by the lib choice module.
 * @returns {Promise<Object>} Resolves with the value produced by the lib choice module.
 */
async function rps(clients) {
    let result = null,
        p1,
        p2;

    while (Object.is(null, result)) {
        const results = await Promise.all(clients.map(ask));
        p1 = results[0];
        p2 = results[1];
        result = await shoot(clients, p1, p2);
    }

    return {
        winner: result,
        results: [p1, p2]
    };
}



/**
 * Executes the choice helper used by the lib choice module.
 * @param {Array} clients The clients array supplies the ordered values used by the lib choice module, each item uses the `slot` property.
 * @param {number} clients[].slot The `[].slot` property describes data read from each item used by the lib choice module.
 * @param {string} type The type value provides an input used by the lib choice module.
 * @returns {Promise<void>} Resolves when the lib choice operation completes.
 */
async function choice(clients, type = 'rps') {

    clients[0].write({
        action: 'choice',
        type,
        slot: 0
    });

    clients[1].write({
        action: 'choice',
        type,
        slot: 1
    });

    if (type.toLowerCase() !== 'rps') {
        await animationPause();
    }

    const games = {
        dice,
        coin,
        rps
    }, gameResults = await games[type.toLowerCase()](clients);

  
    if (type.toLowerCase() !== 'rps') {
        await animationPause();
    }

    clients[0].write({
        action: 'choice',
        type,
        result: gameResults.results,
        winner: gameResults.winner,
        slot: 0
    });

    clients[1].write({
        action: 'choice',
        type,
        result: gameResults.results,
        winner: gameResults.winner,
        slot: 1
    });

    await animationPause();

    if (gameResults.winner !== 0) {
        clients[0].slot = 1;
        clients[1].slot = 0;
        clients.reverse();
    }
}


module.exports = choice;
