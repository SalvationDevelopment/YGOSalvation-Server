'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthState } from '../../hooks/use-auth-state';
import { formatDateTime } from '../../util/tournament.mock';
import styles from './tournament-detail.component.module.scss';
import {
    cancelTournament,
    checkInToTournament,
    closeTournamentRegistration,
    createNextTournamentRound,
    dropFromTournament,
    fetchTournament,
    forceStartTournament,
    joinTournamentMatch,
    openTournamentRegistration,
    registerForTournament,
    reportTournamentMatchResult,
    unregisterFromTournament,
} from '../../util/tournament.api';

function createEmptyTournament() {
    return {
        id: '',
        slug: '',
        name: '',
        description: '',
        league: '',
        format: '',
        status: '',
        startAt: '',
        graceActive: false,
        graceClosesAt: undefined,
        graceMinutes: 0,
        capacity: 0,
        checkInRequired: false,
        preregistered: 0,
        registeredByMe: false,
        myRegistrationState: '',
        ownedByMe: false,
        entrants: [],
        pairings: [],
        roundsOverview: [],
        standings: [],
        reminderOffsets: [],
        roomRules: {
            ruleset: '',
            duelMode: ''
        },
        liveOverview: {
            liveMatchCount: 0,
            waitingMatchCount: 0,
            completedMatchCount: 0,
            currentDuelists: []
        }
    };
}

function normalizeTournament(data) {
    return {
        ...createEmptyTournament(),
        ...(data || {}),
        entrants: Array.isArray(data?.entrants) ? data.entrants : [],
        pairings: Array.isArray(data?.pairings) ? data.pairings : [],
        roundsOverview: Array.isArray(data?.roundsOverview) ? data.roundsOverview : [],
        standings: Array.isArray(data?.standings) ? data.standings : [],
        reminderOffsets: Array.isArray(data?.reminderOffsets) ? data.reminderOffsets : [],
        roomRules: {
            ruleset: data?.roomRules?.ruleset || '',
            duelMode: data?.roomRules?.duelMode || ''
        },
        liveOverview: {
            liveMatchCount: Number(data?.liveOverview?.liveMatchCount || 0),
            waitingMatchCount: Number(data?.liveOverview?.waitingMatchCount || 0),
            completedMatchCount: Number(data?.liveOverview?.completedMatchCount || 0),
            currentDuelists: Array.isArray(data?.liveOverview?.currentDuelists) ? data.liveOverview.currentDuelists : []
        }
    };
}

export default function TournamentDetailScreen({ slug }) {
    const { loggedIn } = useAuthState();
    const [tournament, setTournament] = useState(() => createEmptyTournament());
    const [loadStatus, setLoadStatus] = useState('loading');
    const [loadError, setLoadError] = useState('');
    const [registered, setRegistered] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [dropped, setDropped] = useState(false);
    const [entrantCount, setEntrantCount] = useState(0);
    const [actionMessage, setActionMessage] = useState('');
    const [joinedMatchKey, setJoinedMatchKey] = useState('');
    const [actionPending, setActionPending] = useState(false);

    function applyTournamentState(data) {
        const nextTournament = normalizeTournament(data);
        setTournament(nextTournament);
        setRegistered(Boolean(nextTournament.registeredByMe));
        setCheckedIn(nextTournament.myRegistrationState === 'checked_in');
        setDropped(nextTournament.myRegistrationState === 'dropped');
        setEntrantCount(nextTournament.preregistered || 0);
    }

    useEffect(() => {
        let active = true;
        setLoadStatus('loading');
        setLoadError('');

        fetchTournament(slug).then((data) => {
            if (!active) {
                return;
            }
            applyTournamentState(data);
            setActionMessage('');
            setJoinedMatchKey('');
            setLoadStatus('ready');
        }).catch((error) => {
            if (!active) {
                return;
            }
            setTournament(createEmptyTournament());
            setLoadError(error.message || 'Failed to load tournament.');
            setLoadStatus('error');
        });

        return () => {
            active = false;
        };
    }, [slug]);

    const currentUsername = typeof window !== 'undefined' ? window.localStorage?.username || '' : '';
    if (loadStatus === 'loading') {
        return (
            <div id='tournamentdetailpage' className={`${styles.owner} tournamentpanel`}>
                <p className='tournamenteyebrow'>Tournament Detail</p>
                <h2>Loading Tournament</h2>
            </div>
        );
    }

    if (loadStatus !== 'ready') {
        return (
            <div id='tournamentdetailpage' className={`${styles.owner} tournamentpanel`}>
                <p className='tournamenteyebrow'>Tournament Detail</p>
                <h2>Tournament Not Found</h2>
                <p className='tournamentlede'>{loadError || 'The requested tournament slug is not available in persistent tournament storage.'}</p>
                <Link className='tournamentcta' href='/tournaments'>Back To Calendar</Link>
            </div>
        );
    }

    function preregister() {
        if (!loggedIn || registered || dropped || actionPending) {
            return;
        }
        setActionPending(true);
        registerForTournament(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Preregistration saved.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Preregistration failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function unregister() {
        if (!loggedIn || !registered || checkedIn || actionPending) {
            return;
        }
        setActionPending(true);
        unregisterFromTournament(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Registration removed.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Unregister failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function checkIn() {
        if (!loggedIn || !registered || dropped || actionPending) {
            return;
        }
        setActionPending(true);
        checkInToTournament(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Check-in saved.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Check-in failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function drop() {
        if (!loggedIn || !registered || actionPending) {
            return;
        }
        setActionPending(true);
        dropFromTournament(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Drop saved.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Drop failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function joinMatch(pairing) {
        if (!loggedIn || dropped || !registered || actionPending) {
            return;
        }
        setActionPending(true);
        joinTournamentMatch(tournament.id, pairing.pairingId || pairing.matchId || `${pairing.round}::${pairing.table}`).then((data) => {
            applyTournamentState(data.tournament);
            setJoinedMatchKey(data.matchAccess.matchId);
            setActionMessage(data.matchAccess.message);
            if (data.matchAccess.joinPath && typeof window !== 'undefined') {
                window.location.href = data.matchAccess.joinPath;
            }
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Match join failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function cancelOwnedTournament() {
        if (!tournament?.ownedByMe || actionPending) {
            return;
        }
        setActionPending(true);
        cancelTournament(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Tournament cancelled.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Tournament cancellation failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function openRegistration() {
        if (!tournament?.ownedByMe || actionPending) {
            return;
        }
        setActionPending(true);
        openTournamentRegistration(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Registration reopened.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Reopen registration failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function closeRegistration() {
        if (!tournament?.ownedByMe || actionPending) {
            return;
        }
        setActionPending(true);
        closeTournamentRegistration(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Registration moved into grace.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Close registration failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function forceStart() {
        if (!tournament?.ownedByMe || actionPending) {
            return;
        }
        setActionPending(true);
        forceStartTournament(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage('Tournament force-started. Round 1 pairings are now live.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Force start failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function createNextRound() {
        if (!tournament?.ownedByMe || actionPending) {
            return;
        }
        setActionPending(true);
        createNextTournamentRound(tournament.id).then((data) => {
            applyTournamentState(data);
            setActionMessage(`Round ${data.currentRoundNumber} pairings are now live.`);
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Next-round creation failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function reportMatchResult(pairing, result) {
        if (!tournament?.ownedByMe || actionPending) {
            return;
        }
        setActionPending(true);
        reportTournamentMatchResult(tournament.id, pairing.pairingId || pairing.matchId || `${pairing.round}::${pairing.table}`, { result }).then((data) => {
            applyTournamentState(data);
            setActionMessage('Match result recorded and standings updated.');
        }).catch((error) => {
            setActionMessage(error.data?.error || error.message || 'Match result update failed.');
        }).finally(() => {
            setActionPending(false);
        });
    }

    function actionState() {
        if (!loggedIn) {
            return {
                label: 'Sign in to register for this tournament.',
                buttons: [],
            };
        }
        if (dropped) {
            return {
                label: 'You have dropped from this tournament.',
                buttons: [
                    { text: 'Preregister Again', onClick: preregister, kind: 'primary' },
                ],
            };
        }
        if (!registered) {
            return {
                label: 'You are not yet registered.',
                buttons: [
                    { text: 'Preregister', onClick: preregister, kind: 'primary' },
                ],
            };
        }
        if (checkedIn) {
            return {
                label: 'You are registered and checked in.',
                buttons: [
                    { text: 'Drop Tournament', onClick: drop, kind: 'secondary' },
                ],
            };
        }
        return {
            label: 'You are registered. Check in when the grace window opens, or unregister before lock.',
            buttons: [
                { text: 'Check In', onClick: checkIn, kind: 'primary' },
                { text: 'Unregister', onClick: unregister, kind: 'secondary' },
                { text: 'Drop Tournament', onClick: drop, kind: 'secondary' },
            ],
        };
    }

    const currentActionState = actionState();
    const playerIsEntrant = tournament.entrants.includes(currentUsername) || registered;
    const myPairings = (tournament.pairings || []).filter((pairing) => pairing.playerA === currentUsername || pairing.playerB === currentUsername);
    const liveOverview = tournament.liveOverview || {
        liveMatchCount: 0,
        waitingMatchCount: 0,
        completedMatchCount: 0,
        currentDuelists: [],
    };

    return (
        <div id='tournamentdetailpage' className={`${styles.owner} tournamentpanel`}>
            <div className='tournamentdetailhero'>
                <p className='tournamenteyebrow'>Tournament Detail</p>
                <h2>{tournament.name}</h2>
                <p className='tournamentlede'>{tournament.description}</p>
            </div>

            <div className='tournamentdetailboard'>
                <div className='tournamentdetaillane'>
                    <div className='tournamentsectionheader'>
                        <h3>Overview</h3>
                        <p>Event state, timing, rules, and live summary.</p>
                    </div>
                    <div className='tournamentstack'>
                        <div className='tournamentsidecard'><div><strong>Overview</strong><p>{tournament.league} - {tournament.format}</p></div><span>{tournament.status}</span></div>
                        <div className='tournamentsidecard'><div><strong>Scheduled Start</strong><p>{formatDateTime(tournament.startAt)}</p></div><span>{tournament.graceActive && tournament.graceClosesAt ? `Grace closes ${formatDateTime(tournament.graceClosesAt)}` : `${tournament.graceMinutes}m grace`}</span></div>
                        <div className='tournamentsidecard'><div><strong>Registration</strong><p>{entrantCount}/{tournament.capacity} players</p></div><span>{tournament.checkInRequired ? 'Check-in required' : 'Auto-lock'}</span></div>
                        <div className='tournamentsidecard'><div><strong>Room Rules</strong><p>{tournament.roomRules.ruleset}</p></div><span>{tournament.roomRules.duelMode}</span></div>
                        <div className='tournamentsidecard'><div><strong>Live Round State</strong><p>{liveOverview.liveMatchCount} dueling, {liveOverview.waitingMatchCount} waiting</p></div><span>{liveOverview.completedMatchCount} resolved</span></div>
                        {tournament.ownedByMe && <div className='tournamentsidecard'><div><strong>Owner Actions</strong><p>Edit and control registration before bracket execution begins.</p></div><div className='tournamentmatchactions'><Link className='tournamentcta' href={`/tournaments/${tournament.slug}/edit`}>Edit Tournament</Link></div></div>}
                    </div>
                </div>

                <div className='tournamentdetaillane'>
                    {tournament.ownedByMe && tournament.status !== 'Cancelled' && (
                        <div className='tournamentpanel tournamentfilters'>
                            <div className='tournamentsectionheader'><h3>Owner Controls</h3><p>Pre-bracket tournament controls and live result administration.</p></div>
                            <div className='tournamentformactions'>
                                <button type='button' className='tournamentcta tournamentbutton' onClick={openRegistration} disabled={actionPending || tournament.status !== 'Registration Grace'}>Open Registration</button>
                                <button type='button' className='tournamentsecondarycta tournamentbutton' onClick={closeRegistration} disabled={actionPending || tournament.status !== 'Registration Open'}>Close Registration Early</button>
                                <button type='button' className='tournamentsecondarycta tournamentbutton' onClick={cancelOwnedTournament} disabled={actionPending || !['Registration Open', 'Registration Grace'].includes(tournament.status)}>Cancel Tournament</button>
                                <button type='button' className='tournamentcta tournamentbutton' onClick={forceStart} disabled={actionPending || !['Registration Open', 'Registration Grace'].includes(tournament.status)}>Force Start</button>
                                <button type='button' className='tournamentcta tournamentbutton' onClick={createNextRound} disabled={actionPending || tournament.status !== 'Between Rounds'}>Create Next Round</button>
                            </div>
                        </div>
                    )}

                    <div className='tournamentpanel tournamentfilters'>
                        <div className='tournamentsectionheader'><h3>Entrant Actions</h3><p>{currentActionState.label}</p></div>
                        <div className='tournamentformactions'>
                            {currentActionState.buttons.map((button) => (
                                <button key={button.text} type='button' className={button.kind === 'primary' ? 'tournamentcta tournamentbutton' : 'tournamentsecondarycta tournamentbutton'} onClick={button.onClick} disabled={actionPending}>{button.text}</button>
                            ))}
                        </div>
                        {actionMessage && <div className='tournamentempty tournamentvalidation'><p>{actionMessage}</p></div>}
                    </div>

                    <div className='tournamentpanel tournamentfilters'>
                        <div className='tournamentsectionheader'><h3>Match Access</h3><p>Server-validated access for the current user&apos;s assigned pairing.</p></div>
                        {!loggedIn && <div className='tournamentempty'><p>Sign in to see match access for your current tournament pairing.</p></div>}
                        {loggedIn && !playerIsEntrant && <div className='tournamentempty'><p>You are not currently listed as an entrant for this tournament.</p></div>}
                        {loggedIn && playerIsEntrant && myPairings.length === 0 && <div className='tournamentempty'><p>No pairing is assigned to your current user in persistent tournament state yet.</p></div>}
                        {loggedIn && playerIsEntrant && myPairings.length > 0 && (
                            <div className='tournamentstack'>
                                {myPairings.map((pairing) => {
                                    const pairingKey = pairing.pairingId || pairing.matchId || `${pairing.round}::${pairing.table}`;
                                    const joined = joinedMatchKey === pairingKey;
                                    return (
                                        <article key={pairingKey} className='tournamentsidecard'>
                                            <div><strong>{pairing.round} - Table {pairing.table}</strong><p>{pairing.playerA} vs {pairing.playerB}</p></div>
                                            <div className='tournamentmatchactions'>
                                                <span>{joined ? 'Access validated' : pairing.status}</span>
                                                <button type='button' className='tournamentcta tournamentbutton' onClick={() => joinMatch(pairing)} disabled={actionPending || pairing.result !== 'pending'}>{joined ? 'Rejoin Match' : 'Join Match'}</button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className='tournamentdetaillane'>
                    <div className='tournamentpanel tournamentdaydetail'>
                        <div className='tournamentsectionheader'><h3>Competition</h3><p>Round plan and API-backed pairings.</p></div>
                        <div className='tournamentstack'>
                            {(tournament.roundsOverview || []).map((round) => (
                                <article key={round.name} className='tournamenteventcard'>
                                    <div className='tournamenteventmeta'><span className='tournamentstatus' data-status={round.status.toLowerCase().replace(/\s+/g, '-')}>{round.status}</span></div>
                                    <div className='tournamenteventbody'><div><h4>{round.name}</h4><p>{round.status === 'Complete' ? 'All reported matches for this round are resolved.' : 'This round is still active or waiting on current match state.'}</p></div></div>
                                </article>
                            ))}
                            {(tournament.pairings || []).map((pairing) => (
                                <article key={pairing.pairingId || pairing.matchId || `${pairing.round}::${pairing.table}`} className='tournamentsidecard'>
                                    <div>
                                        <strong>{pairing.round} - Table {pairing.table}</strong>
                                        <p>{pairing.playerA} vs {pairing.playerB}</p>
                                        <p>{pairing.playerAReady ? `${pairing.playerA} ready` : `${pairing.playerA} not ready`} | {pairing.playerB === 'BYE' ? 'Bye' : pairing.playerBReady ? `${pairing.playerB} ready` : `${pairing.playerB} not ready`}</p>
                                    </div>
                                    <div className='tournamentmatchactions'>
                                        <span>{pairing.status}</span>
                                        {tournament.ownedByMe && pairing.result === 'pending' && pairing.playerB !== 'BYE' && <>
                                            <button type='button' className='tournamentsecondarycta tournamentbutton' onClick={() => reportMatchResult(pairing, 'player_a_win')} disabled={actionPending}>A Wins</button>
                                            <button type='button' className='tournamentsecondarycta tournamentbutton' onClick={() => reportMatchResult(pairing, 'player_b_win')} disabled={actionPending}>B Wins</button>
                                            <button type='button' className='tournamentsecondarycta tournamentbutton' onClick={() => reportMatchResult(pairing, 'draw')} disabled={actionPending}>Draw</button>
                                        </>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='tournamentdetaillane'>
                    <div className='tournamentpanel tournamentfilters'>
                        <div className='tournamentsectionheader'><h3>Field</h3><p>Live duelists, entrants, and standings in one sweep.</p></div>
                        {liveOverview.currentDuelists.length === 0 ? <div className='tournamentempty'><p>No live duelists are currently marked for this round.</p></div> : (
                            <div className='tournamentlistgrid'>
                                {liveOverview.currentDuelists.map((username) => <article key={username} className='tournamentsidecard'><div><strong>{username}</strong><p>Currently dueling</p></div><span>Live</span></article>)}
                            </div>
                        )}
                    </div>
                    <div className='tournamentpanel tournamentdaydetail'>
                        <div className='tournamentstack'>
                            {(tournament.entrants || []).map((entrant) => <article key={entrant} className='tournamentsidecard'><div><strong>{entrant}</strong><p>{registered && entrant === currentUsername ? (checkedIn ? 'Checked in' : dropped ? 'Dropped' : 'Registered by current user') : 'Registered entrant'}</p></div><span>{registered && entrant === currentUsername ? (checkedIn ? 'Ready' : dropped ? 'Dropped' : 'Waiting') : 'Ready'}</span></article>)}
                            {(tournament.standings || []).map((standing) => <article key={standing.player} className='tournamentsidecard'><div><strong>#{standing.place} {standing.player}</strong><p>{standing.wins}-{standing.losses}-{standing.draws} record</p></div><span>{standing.points} pts</span></article>)}
                        </div>
                    </div>
                </div>

                <div className='tournamentdetaillane'>
                    <div className='tournamentpanel tournamentfilters'>
                        <div className='tournamentsectionheader'><h3>Reminders</h3><p>Configured reminder offsets and exit navigation.</p></div>
                        <div className='tournamentlistgrid'>
                            {(tournament.reminderOffsets || []).map((offset) => <div key={offset} className='tournamentsidecard'><div><strong>{offset} reminder</strong><p>Email and in-app hooks will attach here.</p></div></div>)}
                        </div>
                    </div>
                    <Link className='tournamentcta tournamentdetailback' href='/tournaments'>Back To Calendar</Link>
                </div>
            </div>
        </div>
    );
}
