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

function ask(client, i) {
    return new Promise((resolve) => {
        client.write({
            action: 'choice',
            type: 'rps'
        });
        client.once('choice', resolve);
    });

}

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



function animationPause() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

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