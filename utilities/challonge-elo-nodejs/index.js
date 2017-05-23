const request = require('request-promise');
const R = require('ramda');
const moment = require('moment');
const Elo = require('elo-js');

const elo = new Elo();

module.exports.getStats = function(config) {
  
  const tournamentConfigs = config.tournaments;
  const eloMultiplier = config.elo_multiplier || 1;

  let tournamentNamesAndUrls = [];

  return Promise.all(tournamentConfigs.map((tournamentConfig) => {
    return getAllTournaments(tournamentConfig).then((tournaments) => {
      tournamentNamesAndUrls = tournamentNamesAndUrls.concat(getTournamentNamesAndUrls(tournaments));
      return getAllResults(tournaments, tournamentConfig);
    });

  })).then((results) => {
    results = R.flatten(results);
    const stats = calculateStats(results, eloMultiplier);
    const rankedPlayers = addPercentToWinrate(rankAndSortPlayers(stats));
    return {
      players: rankedPlayers,
      tournaments: tournamentNamesAndUrls
    }
  });
};

function getAllTournaments(config) {
  return request({
    method: 'GET',
    uri: 'https://api.challonge.com/v1/tournaments.json',
    qs: {
      api_key: config.api_key,
      subdomain: config.subdomain
    },
    json: true
  }).then((tournaments) => {
    return tournaments.filter(t => config.tournament_urls.indexOf(t.tournament.url) >= 0).filter(t => t.tournament.completed_at);
  })
}

function getTournamentNamesAndUrls(tournaments) {
  tournaments.sort((t1, t2) => moment(t1.tournament.completed_at).isBefore(moment(t2.tournament.completed_at)) ? 1 : -1);
  return tournaments.map((t) => {
    return {
      name: t.tournament.name,
      url: t.tournament.full_challonge_url
    }
  });
}

function getAllResults(tournaments, config) {
  const tournamentIds = tournaments.map(t => t.tournament.id);

  // tournament_id => participant_id => username dictionary
  const participantsPromises = tournamentIds.map((tournamentId) => {
    return request({
      method: 'GET',
      uri: `https://api.challonge.com/v1/tournaments/${tournamentId}/participants.json`,
      qs: {
        api_key: config.api_key,
        subdomain: config.subdomain
      },
      json: true
    }).then((participants) => {
      return participants.map((participant) => {
        return {
          [participant.participant.id]: participant.participant.challonge_username
        };
      }).reduce((prev, curr) => {
        prev[tournamentId] = R.merge(prev[tournamentId], curr);
        return prev;
      }, {});
    });
  });

  const matchesPromises = tournamentIds.map((tournamentId) => {
    return request({
      method: 'GET',
      uri: `https://api.challonge.com/v1/tournaments/${tournamentId}/matches.json`,
      qs: {
        api_key: config.api_key,
        subdomain: config.subdomain
      },
      json: true
    });
  });

  return Promise.all([Promise.all(participantsPromises), Promise.all(matchesPromises)]).then(([participants, matches]) => {

    participants = R.mergeAll(participants);

    matches = R.flatten(matches);

    return matches.map((match) => {
      return {
        winner_id: match.match.winner_id,
        loser_id: match.match.loser_id,
        updated_at: match.match.updated_at,
        loser_name: participants[match.match.tournament_id][match.match.loser_id],
        winner_name: participants[match.match.tournament_id][match.match.winner_id],
        tournament_id: match.match.tournament_id
      };
    });
  })
}

function calculateStats(results, eloMultiplier) {

  results.sort((r1, r2) => {
    return moment(r1.updated_at).isAfter(moment(r2.updated_at)) ? 1 : -1;
  });

  const stats = results.reduce((stats, match) => {

    const winnerName = match.winner_name;
    const loserName = match.loser_name;

    const winnerStats = stats[winnerName] = stats[winnerName] || {};
    const loserStats = stats[loserName] = stats[loserName] || {};

    const currEloWinner = stats[winnerName].elo || 1200;
    const currEloLoser = stats[loserName].elo || 1200;

    const deltaEloWinner = (elo.ifWins(currEloWinner, currEloLoser) - currEloWinner) * eloMultiplier;
    const deltaEloLoser = (elo.ifLoses(currEloLoser, currEloWinner) - currEloLoser) * eloMultiplier;

    const newEloWinner = Math.round(currEloWinner + deltaEloWinner);
    const newEloLoser = Math.round(currEloLoser + deltaEloLoser);

    winnerStats.elo = newEloWinner;
    winnerStats.wins = (winnerStats.wins || 0) + 1;
    winnerStats.losses = (winnerStats.losses || 0);
    winnerStats.total = (winnerStats.total || 0) + 1;
    winnerStats.winrate = Math.round(winnerStats.wins / winnerStats.total * 100);

    winnerStats.history = winnerStats.history || [];
    winnerStats.history.unshift({
      vs: loserName,
      result: 'win',
      delta: '+' + deltaEloWinner,
      previous_elo: currEloWinner,
      current_elo: newEloWinner
    });

    loserStats.elo = newEloLoser;
    loserStats.wins = (loserStats.wins || 0);
    loserStats.losses = (loserStats.losses || 0) + 1;
    loserStats.total = (loserStats.total || 0) + 1;
    loserStats.winrate = Math.round(loserStats.wins / loserStats.total * 100);

    loserStats.history = loserStats.history || [];
    loserStats.history.unshift({
      vs: winnerName,
      result: 'lose',
      delta: deltaEloLoser,
      previous_elo: currEloLoser,
      current_elo: newEloLoser
    });

    return stats;
  }, {});

  return stats;

}

function rankAndSortPlayers(stats) {
  return Object.keys(stats).map((playername) => {
    return R.merge({
      name: playername
    }, stats[playername])
  }).sort((p1, p2) => {
    return p2.elo - p1.elo;
  }).map((p, i) => {
    p.rank = i + 1;
    return p;
  });
}

function addPercentToWinrate(stats) {
  return stats.map((p) => {
    p.winrate += '%';
    return p;
  });
}
