/**
 * Executes the same day helper used by the tournament.mock module.
 * @param {Object} a The a value provides an input used by the tournament.mock module.
 * @param {Object} b The b value provides an input used by the tournament.mock module.
 * @returns {boolean} Returns the value produced by the tournament.mock module.
 */
export function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

/**
 * Executes the same month helper used by the tournament.mock module.
 * @param {Object} a The a value provides an input used by the tournament.mock module.
 * @param {Object} b The b value provides an input used by the tournament.mock module.
 * @returns {boolean} Returns the value produced by the tournament.mock module.
 */
export function sameMonth(a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth();
}

/**
 * Starts of day used by the tournament.mock module.
 * @param {(Object|Date)} date The date value provides an input used by the tournament.mock module.
 * @returns {Date} Returns the value produced by the tournament.mock module.
 */
export function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Makes tournament used by the tournament.mock module.
 * @param {string} id The id value provides an input used by the tournament.mock module.
 * @param {number} year The year value provides an input used by the tournament.mock module.
 * @param {number} month The month value provides an input used by the tournament.mock module.
 * @param {number} day The day value provides an input used by the tournament.mock module.
 * @param {number} hour The hour value provides an input used by the tournament.mock module.
 * @param {number} minute The minute value provides an input used by the tournament.mock module.
 * @param {Object} options The options object supplies the structured input used by the tournament.mock module, including the `capacity`, `checkInRequired`, `description`, `entrants`, `format`, `graceMinutes`, `league`, `name`, `ownedByMe`, `pairings`, `platformManaged`, `preregistered`, `ranked`, `registeredByMe`, `registrationOpen`, `reminderOffsets`, `roomRules`, `rounds`, `roundsOverview`, `slug`, `standings`, and `summary` properties.
 * @param {number} options.capacity The `capacity` property supplies structured input used by the tournament.mock module.
 * @param {boolean} options.checkInRequired The `checkInRequired` property supplies structured input used by the tournament.mock module.
 * @param {string} options.description The `description` property supplies structured input used by the tournament.mock module.
 * @param {Array} options.entrants The `entrants` property supplies structured input used by the tournament.mock module.
 * @param {string} options.format The `format` property supplies structured input used by the tournament.mock module.
 * @param {number} options.graceMinutes The `graceMinutes` property supplies structured input used by the tournament.mock module.
 * @param {string} options.league The `league` property supplies structured input used by the tournament.mock module.
 * @param {string} options.name The `name` property supplies structured input used by the tournament.mock module.
 * @param {boolean} options.ownedByMe The `ownedByMe` property supplies structured input used by the tournament.mock module.
 * @param {Array} options.pairings The `pairings` property supplies structured input used by the tournament.mock module.
 * @param {boolean} options.platformManaged The `platformManaged` property supplies structured input used by the tournament.mock module.
 * @param {number} options.preregistered The `preregistered` property supplies structured input used by the tournament.mock module.
 * @param {boolean} options.ranked The `ranked` property supplies structured input used by the tournament.mock module.
 * @param {boolean} options.registeredByMe The `registeredByMe` property supplies structured input used by the tournament.mock module.
 * @param {boolean} options.registrationOpen The `registrationOpen` property supplies structured input used by the tournament.mock module.
 * @param {Array} options.reminderOffsets The `reminderOffsets` property supplies structured input used by the tournament.mock module.
 * @param {Object} options.roomRules The `roomRules` property supplies structured input used by the tournament.mock module.
 * @param {(number|null)} options.rounds The `rounds` property supplies structured input used by the tournament.mock module.
 * @param {Array} options.roundsOverview The `roundsOverview` property supplies structured input used by the tournament.mock module.
 * @param {string} options.slug The `slug` property supplies structured input used by the tournament.mock module.
 * @param {Array} options.standings The `standings` property supplies structured input used by the tournament.mock module.
 * @param {string} options.summary The `summary` property supplies structured input used by the tournament.mock module.
 * @returns {Object} Returns the value produced by the tournament.mock module.
 */
export function makeTournament(id, year, month, day, hour, minute, options = {}) {
    return {
        id,
        slug: options.slug || id,
        name: options.name || 'Tournament',
        league: options.league || 'TCG Modern',
        format: options.format || 'Swiss',
        ranked: options.ranked ?? true,
        capacity: options.capacity || 16,
        preregistered: options.preregistered || 0,
        status: options.status || 'Registration Open',
        registrationOpen: options.registrationOpen ?? true,
        platformManaged: options.platformManaged ?? false,
        ownedByMe: options.ownedByMe ?? false,
        registeredByMe: options.registeredByMe ?? false,
        startAt: new Date(year, month, day, hour, minute, 0, 0),
        rounds: options.rounds || null,
        graceMinutes: options.graceMinutes || 10,
        summary: options.summary || '',
        description: options.description || options.summary || '',
        checkInRequired: options.checkInRequired ?? true,
        reminderOffsets: options.reminderOffsets || ['24h', '4h', '30m'],
        entrants: options.entrants || [],
        roundsOverview: options.roundsOverview || [],
        standings: options.standings || [],
        pairings: options.pairings || [],
        roomRules: options.roomRules || {
            ruleset: options.league || 'TCG Modern',
            duelMode: 'Match',
            banlist: 'Modern',
            automation: 'Automatic',
        },
    };
}

/**
 * Builds mock tournaments used by the tournament.mock module.
 * @param {Object} referenceDate The referenceDate object supplies the structured input used by the tournament.mock module, including the `day`, `month`, and `year` properties.
 * @param {number} referenceDate.day The `day` property supplies structured input used by the tournament.mock module.
 * @param {number} referenceDate.month The `month` property supplies structured input used by the tournament.mock module.
 * @param {number} referenceDate.year The `year` property supplies structured input used by the tournament.mock module.
 * @returns {Array} Returns the value produced by the tournament.mock module.
 */
export function buildMockTournaments(referenceDate) {
    const { year, month, day } = referenceDate;

    return [
        makeTournament('hourly-modern-cup', year, month, day, 18, 0, {
            name: 'Hourly Modern Cup',
            league: 'TCG Modern',
            format: 'Swiss',
            ranked: true,
            capacity: 16,
            preregistered: 11,
            platformManaged: true,
            registeredByMe: true,
            rounds: 4,
            summary: 'Standardized top-of-the-hour ranked cup.',
            description: 'Standardized hourly cup with locked league rules and ranked impact.',
            entrants: ['Zayel', 'Aster', 'Jaden', 'Kaiser', 'Nova', 'Rin'],
            roundsOverview: [
                { name: 'Round 1', status: 'Pending' },
                { name: 'Round 2', status: 'Pending' },
                { name: 'Round 3', status: 'Pending' },
                { name: 'Round 4', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'Zayel', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'Aster', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 3, player: 'Jaden', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round 1', table: 1, playerA: 'Zayel', playerB: 'Aster', status: 'Pending' },
                { round: 'Round 1', table: 2, playerA: 'Jaden', playerB: 'Kaiser', status: 'Pending' },
            ],
        }),
        makeTournament('abyss-night-swiss', year, month, day + 1, 20, 30, {
            name: 'Abyss Night Swiss',
            league: 'TCG Modern',
            format: 'Swiss',
            ranked: false,
            capacity: 32,
            preregistered: 21,
            ownedByMe: true,
            rounds: 5,
            summary: 'Community-hosted swiss with open preregistration.',
            description: 'Night swiss built for casual community turnout with a short grace period.',
            entrants: ['Zayel', 'Rogue', 'Skye', 'Aria', 'Vance', 'Kite', 'Mina', 'Orion'],
            roundsOverview: [
                { name: 'Registration', status: 'Open' },
                { name: 'Round 1', status: 'Pending' },
                { name: 'Round 2', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'Zayel', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'Rogue', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 3, player: 'Skye', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 4, player: 'Aria', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round 1', table: 1, playerA: 'Zayel', playerB: 'Rogue', status: 'Pending' },
                { round: 'Round 1', table: 2, playerA: 'Skye', playerB: 'Aria', status: 'Pending' },
            ],
        }),
        makeTournament('ocg-hourly-sprint', year, month, day + 2, 19, 0, {
            name: 'OCG Sprint Hour',
            league: 'OCG Modern',
            format: 'Single Elimination',
            ranked: true,
            capacity: 8,
            preregistered: 7,
            platformManaged: true,
            rounds: 3,
            summary: 'Fast knockout bracket with locked league settings.',
            description: 'Platform-managed elimination sprint using OCG modern configuration.',
            entrants: ['Yuto', 'Shun', 'Reiji', 'Sora', 'Ruri', 'Yuzu', 'Yugo'],
            roundsOverview: [
                { name: 'Quarterfinals', status: 'Pending' },
                { name: 'Semifinals', status: 'Pending' },
                { name: 'Final', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'Yuto', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'Shun', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Quarterfinals', table: 1, playerA: 'Yuto', playerB: 'Shun', status: 'Pending' },
                { round: 'Quarterfinals', table: 2, playerA: 'Reiji', playerB: 'Sora', status: 'Pending' },
            ],
        }),
        makeTournament('goat-retro-cup', year, month, day + 4, 21, 0, {
            name: 'Goat Retro Cup',
            league: 'Goat Locked',
            format: 'Single Elimination',
            ranked: false,
            capacity: 16,
            preregistered: 10,
            rounds: 4,
            summary: 'Historical locked-banlist side event.',
            description: 'Retro bracket with locked historical rules and curated room defaults.',
            entrants: ['GoatOne', 'GoatTwo', 'GoatThree', 'GoatFour'],
            roundsOverview: [
                { name: 'Bracket Lock', status: 'Pending' },
                { name: 'Round of 16', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'GoatOne', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'GoatTwo', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round of 16', table: 1, playerA: 'GoatOne', playerB: 'GoatTwo', status: 'Pending' },
            ],
        }),
        makeTournament('weekend-swiss-open', year, month, day + 6, 14, 0, {
            name: 'Weekend Swiss Open',
            league: 'TCG Modern',
            format: 'Swiss',
            ranked: true,
            capacity: 64,
            preregistered: 42,
            registeredByMe: true,
            rounds: 6,
            summary: 'Large open event with automated pairings and byes.',
            description: 'Large-scale swiss event intended to stress registration, pairings, and standings.',
            entrants: ['Zayel', 'Aki', 'Blair', 'Crow', 'Jack', 'Leo', 'Luna', 'Rex', 'Rua'],
            roundsOverview: [
                { name: 'Registration', status: 'Open' },
                { name: 'Round 1', status: 'Pending' },
                { name: 'Round 2', status: 'Pending' },
                { name: 'Round 3', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'Zayel', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'Aki', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 3, player: 'Blair', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 4, player: 'Crow', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round 1', table: 1, playerA: 'Zayel', playerB: 'Aki', status: 'Pending' },
                { round: 'Round 1', table: 2, playerA: 'Blair', playerB: 'Crow', status: 'Pending' },
                { round: 'Round 1', table: 3, playerA: 'Jack', playerB: 'Leo', status: 'Pending' },
            ],
        }),
        makeTournament('late-check-in-trial', year, month, day + 8, 18, 30, {
            name: 'Late Check-In Trial',
            league: 'TCG Modern',
            format: 'Swiss',
            ranked: false,
            capacity: 24,
            preregistered: 14,
            status: 'Registration Grace',
            rounds: 4,
            graceMinutes: 15,
            summary: 'Grace-period tournament focused on fast round starts.',
            description: 'Used to validate check-in windows, registration lock, and first-round countdowns.',
            entrants: ['Axel', 'Jim', 'Adrian', 'Jesse', 'Fubuki'],
            roundsOverview: [
                { name: 'Grace Window', status: 'Active' },
                { name: 'Round 1', status: 'Queued' },
            ],
            standings: [
                { place: 1, player: 'Axel', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'Jim', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round 1', table: 1, playerA: 'Axel', playerB: 'Jim', status: 'Queued' },
            ],
        }),
        makeTournament('goat-hourly-classic', year, month, day + 10, 18, 0, {
            name: 'Goat Hourly Classic',
            league: 'Goat Locked',
            format: 'Swiss',
            ranked: true,
            capacity: 16,
            preregistered: 9,
            platformManaged: true,
            rounds: 4,
            summary: 'Standardized league hourly with locked room rules.',
            description: 'Top-of-the-hour goat event for standardized recurring competitive play.',
            entrants: ['RetroFox', 'Dust', 'Shade', 'Moth'],
            roundsOverview: [
                { name: 'Round 1', status: 'Pending' },
                { name: 'Round 2', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'RetroFox', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'Dust', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round 1', table: 1, playerA: 'RetroFox', playerB: 'Dust', status: 'Pending' },
            ],
        }),
        makeTournament('owners-sunday-major', year, month, day + 13, 13, 0, {
            name: 'Sunday Major',
            league: 'TCG Modern',
            format: 'Swiss',
            ranked: true,
            capacity: 64,
            preregistered: 57,
            ownedByMe: true,
            rounds: 6,
            summary: 'Major-sized event intended for ladder-impacting results.',
            description: 'Host-owned large event that will later need full management actions and alerts.',
            entrants: ['HostOne', 'HostTwo', 'HostThree', 'HostFour', 'HostFive'],
            roundsOverview: [
                { name: 'Registration', status: 'Open' },
                { name: 'Round 1', status: 'Pending' },
                { name: 'Round 2', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'HostOne', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'HostTwo', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round 1', table: 1, playerA: 'HostOne', playerB: 'HostTwo', status: 'Pending' },
                { round: 'Round 1', table: 2, playerA: 'HostThree', playerB: 'HostFour', status: 'Pending' },
            ],
        }),
        makeTournament('next-month-prime-cup', year, month + 1, 3, 19, 0, {
            name: 'Prime Cup',
            league: 'OCG Modern',
            format: 'Swiss',
            ranked: true,
            capacity: 32,
            preregistered: 18,
            platformManaged: true,
            rounds: 5,
            summary: 'Next-month standardized cup preview.',
            description: 'Preview tournament to show cross-month calendar rendering and detail navigation.',
            entrants: ['PrimeA', 'PrimeB', 'PrimeC'],
            roundsOverview: [
                { name: 'Registration', status: 'Open' },
                { name: 'Round 1', status: 'Pending' },
            ],
            standings: [
                { place: 1, player: 'PrimeA', wins: 0, losses: 0, draws: 0, points: 0 },
                { place: 2, player: 'PrimeB', wins: 0, losses: 0, draws: 0, points: 0 },
            ],
            pairings: [
                { round: 'Round 1', table: 1, playerA: 'PrimeA', playerB: 'PrimeB', status: 'Pending' },
            ],
        }),
        makeTournament('previous-month-finals', year, month - 1, 27, 20, 0, {
            name: 'Season Wrap Finals',
            league: 'TCG Modern',
            format: 'Single Elimination',
            ranked: true,
            capacity: 16,
            preregistered: 16,
            registrationOpen: false,
            status: 'Completed',
            rounds: 4,
            summary: 'Prior event shown for calendar continuity.',
            description: 'Completed event retained for calendar continuity and future archive pages.',
            entrants: ['Winner', 'RunnerUp'],
            roundsOverview: [
                { name: 'Final', status: 'Completed' },
            ],
            standings: [
                { place: 1, player: 'Winner', wins: 4, losses: 0, draws: 0, points: 12 },
                { place: 2, player: 'RunnerUp', wins: 3, losses: 1, draws: 0, points: 9 },
            ],
            pairings: [
                { round: 'Final', table: 1, playerA: 'Winner', playerB: 'RunnerUp', status: 'Completed' },
            ],
        }),
    ];
}

/**
 * Formats month used by the tournament.mock module.
 * @param {Date} date The date value provides an input used by the tournament.mock module.
 * @returns {string} Returns the value produced by the tournament.mock module.
 */
export function formatMonth(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

/**
 * Formats day used by the tournament.mock module.
 * @param {Date} date The date value provides an input used by the tournament.mock module.
 * @returns {string} Returns the value produced by the tournament.mock module.
 */
export function formatDay(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

/**
 * Formats date time used by the tournament.mock module.
 * @param {Date} date The date value provides an input used by the tournament.mock module.
 * @returns {string} Returns the value produced by the tournament.mock module.
 */
export function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

/**
 * Executes the league options helper used by the tournament.mock module.
 * @param {Array} tournaments The tournaments array supplies the ordered values used by the tournament.mock module, each item uses the `league` property.
 * @param {string} tournaments[].league The `[].league` property describes data read from each item used by the tournament.mock module.
 * @returns {Array<string>} Returns the value produced by the tournament.mock module.
 */
export function leagueOptions(tournaments) {
    return Array.from(new Set(tournaments.map((tournament) => tournament.league)));
}

/**
 * Builds calendar days used by the tournament.mock module.
 * @param {Object} viewDate The viewDate value provides an input used by the tournament.mock module.
 * @returns {Array<Date>} Returns the value produced by the tournament.mock module.
 */
export function buildCalendarDays(viewDate) {
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    return Array.from({ length: 42 }, (_value, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return day;
    });
}
