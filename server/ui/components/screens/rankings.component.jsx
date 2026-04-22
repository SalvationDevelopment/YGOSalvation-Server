import React, { useState, useEffect } from 'react';
import { subscribe } from '../../hooks/use-listener';
import { fetchTournamentRankings, fetchTournaments } from '../../util/tournament.api';
import { leagueOptions } from '../../util/tournament.mock';
import styles from './rankings.component.module.scss';

export default function RankingScreen() {
    const [ranks, setRanks] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [activeBoard, setActiveBoard] = useState('duel');
    const [leagueId, setLeagueId] = useState('');
    const [error, setError] = useState('');
    const [tournamentBoard, setTournamentBoard] = useState({
        resolvedLeagueId: null,
        ranks: [],
        error: '',
    });

    subscribe('LOAD_RANKING', (action) => {
        const nextRanks = Array.isArray(action?.ranks) ? action.ranks : [];
        setRanks(nextRanks);
        setError('');
    });

    useEffect(() => {
        fetch('/ranking')
            .then((response) => response.json())
            .then((data) => {
                const nextRanks = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.ranks)
                        ? data.ranks
                        : [];
                setRanks(nextRanks);
            })
            .catch(() => {
                setError('Unable to load rankings.');
                setRanks([]);
            });

        fetchTournaments()
            .then((data) => {
                setTournaments(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setTournaments([]);
            });
    }, []);

    useEffect(() => {
        let active = true;

        fetchTournamentRankings(leagueId)
            .then((data) => {
                if (!active) {
                    return;
                }
                setTournamentBoard({
                    resolvedLeagueId: leagueId,
                    ranks: Array.isArray(data) ? data : [],
                    error: '',
                });
            })
            .catch(() => {
                if (!active) {
                    return;
                }
                setTournamentBoard({
                    resolvedLeagueId: leagueId,
                    ranks: [],
                    error: 'Unable to load tournament rankings.',
                });
            });

        return () => {
            active = false;
        };
    }, [leagueId]);

    const tournamentLoading = tournamentBoard.resolvedLeagueId !== leagueId;
    const tournamentError = tournamentBoard.resolvedLeagueId === leagueId ? tournamentBoard.error : '';
    const tournamentRanks = tournamentBoard.resolvedLeagueId === leagueId ? tournamentBoard.ranks : [];

    function Row({ user, rank }) {
        return <tr className={styles.row}>
            <td>{rank}</td>
            <td>{user.points}</td>
            <td>{user.elo}</td>
            <td>{user.username}</td>
        </tr>;
    }

    function TournamentRow({ user }) {
        return <tr className={styles.row}>
            <td>{user.place}</td>
            <td>{user.rating}</td>
            <td>{user.leagueId}</td>
            <td>{user.wins}-{user.losses}-{user.draws}</td>
            <td>{user.provisionalGames}</td>
            <td>{user.username}</td>
        </tr>;
    }

    return <section id='rankingssection' className={styles.root}>
        <div className={styles.container}>
            <article id='rankings' className={styles.shell}>
                <h2 className={styles.title}>Rankings</h2>
                <p className={styles.intro}>
                    Duel ladder rankings and tournament Elo are tracked separately. Tournament Elo follows the tournament system plan:
                    per-league ratings, updates on match completion, and a standalone competitive history outside the normal duel ladder.
                </p>
                <div className={styles.boardTabs}>
                    <button
                        type='button'
                        className={styles.boardTab}
                        data-active={activeBoard === 'duel'}
                        onClick={() => setActiveBoard('duel')}
                    >
                        Duel Ladder
                    </button>
                    <button
                        type='button'
                        className={styles.boardTab}
                        data-active={activeBoard === 'tournament'}
                        onClick={() => setActiveBoard('tournament')}
                    >
                        Tournament Elo
                    </button>
                </div>
                {activeBoard === 'tournament' && (
                    <div className={styles.toolbar}>
                        <label className={styles.filter}>
                            <span>League</span>
                            <select value={leagueId} onChange={(event) => setLeagueId(event.target.value)}>
                                <option value=''>All leagues</option>
                                {leagueOptions(tournaments).map((league) => (
                                    <option key={league} value={league}>{league}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
                {activeBoard === 'duel' && error ? <p className={styles.error}>{error}</p> : null}
                {activeBoard === 'tournament' && tournamentError ? <p className={styles.error}>{tournamentError}</p> : null}
                <div className={styles.tableWrap}>
                    {activeBoard === 'duel' && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Points</th>
                                    <th>Skill Rating</th>
                                    <th>Username</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranks.map((user, i) => <Row user={user} key={user.id || user.username || i} rank={i + 1} />)}
                            </tbody>
                        </table>
                    )}
                    {activeBoard === 'tournament' && (
                        tournamentLoading ? (
                            <p className={styles.empty}>Loading tournament rankings...</p>
                        ) : tournamentRanks.length === 0 ? (
                            <p className={styles.empty}>No tournament Elo standings have been recorded for this league filter yet.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Place</th>
                                        <th>Elo</th>
                                        <th>League</th>
                                        <th>Record</th>
                                        <th>Rated</th>
                                        <th>Username</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tournamentRanks.map((user) => <TournamentRow user={user} key={user.id || `${user.leagueId}-${user.username}`} />)}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </article>
        </div>
    </section>;
}
