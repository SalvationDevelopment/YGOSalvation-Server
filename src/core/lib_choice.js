const ROCK = 0,
    PAPER = 1,
    SCISSORS = 2,
    ANIMATION_TIME = 1000,
    shuffle = require('./lib_shuffle');

/**
 * Roll a multi sided die.
 * @param {Number} sides number of sides on the die.
 * @returns {Number} result
 */
function roll(sides = 6) {
    return Math.floor(Math.random() * sides) + 1;
}


/**
 * Flip a coin
 * @returns {Boolean} result
 */
function flip() {
    return roll(2) - 1;
}

function shoot(clients, p1, p2) {
    clients.forEach((client, i) => {
        client.write({
            action: 'result',
            type : 'rps',
            results: [p1, p2]
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

function ask(client) {
    return new Promise((resolve) => {
        client.write({
            action: 'choice',
            type : 'rps'
        });
        client.once('rps', resolve);
    });

}

function dice(clients) {
    const p1 = 0,
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

function coin(clients) {
    const p1 = 0,
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

async function rps(clients) {
    let result = null,
        p1,
        p2;

    while (Object.is(null, result)) {
        p1 = await ask(clients[0]);
        p2 = await ask(clients[0]);
        result = await shoot(clients, p1, p2);
    }

    return {
        winner: result,
        results: [p1, p2]
    };
}

async function choice(clients, type = 'rps') {
    const games = {
        dice,
        coin,
        rps
    }, gameResults = await games[type.toLowerCase()](clients);

    if (gameResults.winner !== 0) {
        clients[0].slot = 1;
        clients[1].slot = 0;
        clients.reverse();
    }

    clients[0].write({
        action: 'choice',
        type,
        result: gameResults.results,
        slot: 0
    });

    clients[1].write({
        action: 'choice',
        type,
        result: gameResults.results,
        slot: 1
    });
}


module.exports = choice;