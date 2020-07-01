const ROCK = 0,
    PAPER = 1,
    SCISSORS = 2,
    ANIMATION_TIME = 1000;

function roll(sides = 6) {
    return Math.floor(Math.random() * sides) + 1;
}

function flip() {
    return roll(2) - 1;
}

function shoot(clients, p1, p2) {
    clients.forEach((client, i) => {
        client.write({
            action: 'shoot',
            results: [p1, p2]
        })
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            let result;
            if (p1 === p2) {
                return resolve(null);
            }

            switch (p1) {
                case ROCK:
                    result = (p2 === SCISSORS) ? 0 : 1;
                case PAPER:
                    result = (p2 === ROCK) ? 0 : 1;
                case SCISSORS:
                    result = (p2 === PAPER) ? 0 : 1;
            }
            resolve(result);

        }, ANIMATION_TIME);
    });

}

function ask(client) {
    return new Promise((resolve) => {
        client.write({
            action: 'rps'
        });
        client.once('rps', resolve);
    });

}

function dice(clients, callback) {
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

function coin(clients, callback) {
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

async function rps(clients, callback) {
    let result = null;
    let p1;
    let p2;

    while (isNull(result)) {
        p1 = await ask(clients[0]);
        p2 = await ask(clients[0]);
<<<<<<< HEAD
        result = await shoot(clients, p1, p2);
=======
        result = shoot(clients, p1, p2);
>>>>>>> ab1a47d1b854181cf58fd5be6ec813f728847225
    }

    return {
        winner: result,
        results: [p1, p2]
    };
}


module.exports = {
    dice,
    coin,
    rps
}