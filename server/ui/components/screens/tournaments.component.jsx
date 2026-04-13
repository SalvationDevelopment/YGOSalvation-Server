'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthState } from '../../hooks/use-auth-state';
import {
    formatDateTime,
    startOfDay,
} from '../../util/tournament.mock';
import {
    fetchTournamentAlerts,
    fetchTournaments,
} from '../../util/tournament.api';
import styles from './tournaments.component.module.scss';

export default function TournamentsScreen() {
    const { loggedIn } = useAuthState();
    const today = new Date();
    const alertRequestKey = loggedIn && typeof window !== 'undefined'
        ? window.localStorage?.session || 'logged-in'
        : 'logged-out';

    const [tournaments, setTournaments] = useState([]);
    const [alertsState, setAlertsState] = useState({
        requestKey: '',
        alerts: [],
        error: '',
    });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');
    const [filters, setFilters] = useState({
        league: 'all',
        format: 'all',
        rankedOnly: false,
        registrationOnly: false,
        mineOnly: false,
    });
    const heroEyebrow = 'Tournament Hub';
    const heroTitle = 'Track upcoming events, hourly queues, alerts, and league standings.';
    const heroLead = 'Browse scheduled events, keep an eye on registrations, and jump into the dedicated calendar when you need the month view.';

    useEffect(() => {
        let active = true;

        fetchTournaments().then((data) => {
            if (!active) {
                return;
            }
            setTournaments(data);
            setLoadError('');
        }).catch((error) => {
            if (!active) {
                return;
            }
            setLoadError(error.message || 'Failed to load tournaments.');
            setTournaments([]);
        }).finally(() => {
            if (active) {
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        if (!loggedIn) {
            return () => {
                active = false;
            };
        }

        fetchTournamentAlerts().then((data) => {
            if (!active) {
                return;
            }
            setAlertsState({
                requestKey: alertRequestKey,
                alerts: data,
                error: '',
            });
        }).catch((error) => {
            if (!active) {
                return;
            }
            setAlertsState({
                requestKey: alertRequestKey,
                alerts: [],
                error: error.message || 'Failed to load tournament alerts.',
            });
        });

        return () => {
            active = false;
        };
    }, [alertRequestKey, loggedIn]);

    const alerts = loggedIn && alertsState.requestKey === alertRequestKey ? alertsState.alerts : [];
    const alertsError = loggedIn && alertsState.requestKey === alertRequestKey ? alertsState.error : '';
    const alertsLoading = loggedIn && alertsState.requestKey !== alertRequestKey;

    const filteredTournaments = tournaments
        .filter((tournament) => {
            if (filters.league !== 'all' && tournament.league !== filters.league) {
                return false;
            }
            if (filters.format !== 'all' && tournament.format !== filters.format) {
                return false;
            }
            if (filters.rankedOnly && !tournament.ranked) {
                return false;
            }
            if (filters.registrationOnly && !tournament.registrationOpen) {
                return false;
            }
            if (filters.mineOnly && !(tournament.ownedByMe || tournament.registeredByMe)) {
                return false;
            }
            return true;
        })
        .sort((left, right) => left.startAt - right.startAt);

    const upcomingTournaments = filteredTournaments
        .filter((tournament) => tournament.startAt >= startOfDay(today))
        .slice(0, 6);
    const hourlyTournaments = filteredTournaments
        .filter((tournament) => tournament.platformManaged)
        .slice(0, 5);
    const myTournaments = filteredTournaments
        .filter((tournament) => tournament.ownedByMe || tournament.registeredByMe)
        .slice(0, 4);
    const registrationsOpen = filteredTournaments.filter((tournament) => tournament.registrationOpen).length;
    const rankedCount = filteredTournaments.filter((tournament) => tournament.ranked).length;
    const standardizedCount = filteredTournaments.filter((tournament) => tournament.platformManaged).length;
    const unreadAlerts = alerts.filter((alert) => !alert.readAt).length;
    const tabs = [
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'hourly', label: 'Hourly' },
        { id: 'mine', label: 'My Events' },
        { id: 'alerts', label: 'Alerts' },
    ];

    return (
        <div id='tournamenthubpage' className={styles.root}>
              <section className={`${styles.panel} ${styles.tabFrame}`}>
                <div className={styles.tabList} role='tablist' aria-label='Tournament sections'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            id={`tournament-tab-${tab.id}`}
                            className={styles.tabButton}
                            data-active={activeTab === tab.id}
                            type='button'
                            role='tab'
                            aria-selected={activeTab === tab.id}
                            aria-controls={`tournament-panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            {tab.id === 'alerts' && loggedIn && unreadAlerts > 0 ? ` (${unreadAlerts})` : ''}
                        </button>
                    ))}
                </div>
                <div className={styles.tabBody}>
                    {loading && (
                        <div className={styles.tabPanel} role='status' aria-live='polite'>
                            <div className={styles.empty}>Loading tournaments...</div>
                        </div>
                    )}

                    {!loading && loadError && (
                        <div className={styles.tabPanel} role='alert'>
                            <div className={`${styles.empty} ${styles.validation}`}>{loadError}</div>
                        </div>
                    )}

                    {!loading && !loadError && activeTab === 'upcoming' && (
                        <div
                            id='tournament-panel-upcoming'
                            className={styles.tabPanel}
                            role='tabpanel'
                            aria-labelledby='tournament-tab-upcoming'
                        >
                            <div className={styles.sectionHeader}>
                                <h3>Upcoming</h3>
                                <p>Closest events that still need registrations and check-ins.</p>
                            </div>
                            <div className={styles.listGrid}>
                                {upcomingTournaments.length === 0 ? (
                                    <div className={styles.empty}>No upcoming tournaments are currently stored.</div>
                                ) : upcomingTournaments.map((tournament) => (
                                    <Link key={tournament.id} href={`/tournaments/${tournament.slug}`} className={styles.sideCard}>
                                        <div>
                                            <strong>{tournament.name}</strong>
                                            <p>{tournament.league} - {tournament.format}</p>
                                        </div>
                                        <span>{formatDateTime(tournament.startAt)}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && !loadError && activeTab === 'hourly' && (
                        <div
                            id='tournament-panel-hourly'
                            className={styles.tabPanel}
                            role='tabpanel'
                            aria-labelledby='tournament-tab-hourly'
                        >
                            <div className={styles.sectionHeader}>
                                <h3>Standardized Hourly</h3>
                                <p>Top-of-the-hour events aligned with locked league settings.</p>
                            </div>
                            <div className={styles.listGrid}>
                                {hourlyTournaments.length === 0 ? (
                                    <div className={styles.empty}>No standardized hourly tournaments are currently stored.</div>
                                ) : hourlyTournaments.map((tournament) => (
                                    <Link key={tournament.id} href={`/tournaments/${tournament.slug}`} className={styles.sideCard} data-platform-managed='true'>
                                        <div>
                                            <strong>{tournament.name}</strong>
                                            <p>{tournament.league}</p>
                                        </div>
                                        <span>{formatDateTime(tournament.startAt)}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && !loadError && activeTab === 'mine' && (
                        <div
                            id='tournament-panel-mine'
                            className={styles.tabPanel}
                            role='tabpanel'
                            aria-labelledby='tournament-tab-mine'
                        >
                            <div className={styles.sectionHeader}>
                                <h3>My Tournaments</h3>
                                <p>Owned or preregistered events for this account.</p>
                            </div>
                            <div className={styles.listGrid}>
                                {!loggedIn ? (
                                    <div className={styles.empty}>
                                        Sign in to host events, manage registrations, and receive reminders.
                                    </div>
                                ) : myTournaments.length === 0 ? (
                                    <div className={styles.empty}>
                                        No owned or registered tournaments are in this filtered view yet.
                                    </div>
                                ) : myTournaments.map((tournament) => (
                                    <Link key={tournament.id} href={`/tournaments/${tournament.slug}`} className={styles.sideCard}>
                                        <div>
                                            <strong>{tournament.name}</strong>
                                            <p>{tournament.ownedByMe ? 'Owner' : 'Registered player'}</p>
                                        </div>
                                        <span>{formatDateTime(tournament.startAt)}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && !loadError && activeTab === 'alerts' && (
                        <div
                            id='tournament-panel-alerts'
                            className={styles.tabPanel}
                            role='tabpanel'
                            aria-labelledby='tournament-tab-alerts'
                        >
                            <div className={styles.sectionHeader}>
                                <h3>Tournament Alerts</h3>
                                <p>Persisted round-start and recorded-result alerts for the signed-in user.</p>
                            </div>
                            {!loggedIn && (
                                <div className={styles.empty}>
                                    Sign in to view tournament alerts and reminder-related tournament activity.
                                </div>
                            )}
                            {loggedIn && alertsLoading && (
                                <div className={styles.empty}>Loading tournament alerts...</div>
                            )}
                            {loggedIn && !alertsLoading && alertsError && (
                                <div className={`${styles.empty} ${styles.validation}`}>{alertsError}</div>
                            )}
                            {loggedIn && !alertsLoading && !alertsError && (
                                <>
                                    <div className={`${styles.listGrid} ${styles.metricsGrid}`}>
                                        <article className={styles.sideCard}>
                                            <div>
                                                <strong>{alerts.length}</strong>
                                                <p>Total persisted alerts</p>
                                            </div>
                                            <span>History</span>
                                        </article>
                                        <article className={styles.sideCard}>
                                            <div>
                                                <strong>{unreadAlerts}</strong>
                                                <p>Unread alerts</p>
                                            </div>
                                            <span>Attention</span>
                                        </article>
                                    </div>
                                    <div className={styles.stack}>
                                        {alerts.length === 0 ? (
                                            <div className={styles.empty}>No tournament alerts have been recorded for this account yet.</div>
                                        ) : alerts.map((alert) => (
                                            <article key={alert.id} className={`${styles.eventCard} ${styles.alertCard}`}>
                                                <div className={styles.eventMeta}>
                                                    <span className={styles.status} data-status={String(alert.type || 'alert').replace(/_/g, '-')}>
                                                        {String(alert.type || 'alert').replace(/_/g, ' ')}
                                                    </span>
                                                    <span>{formatDateTime(new Date(alert.createdAt))}</span>
                                                    <span>{alert.readAt ? 'Read' : 'Unread'}</span>
                                                </div>
                                                <div className={styles.eventBody}>
                                                    <div>
                                                        <h4>{alert.title}</h4>
                                                        <p>{alert.message}</p>
                                                    </div>
                                                    {(alert.metadata?.roundNumber || alert.metadata?.matchId || alert.metadata?.result) && (
                                                        <dl className={styles.stats}>
                                                            {alert.metadata?.roundNumber && (
                                                                <div>
                                                                    <dt>Round</dt>
                                                                    <dd>{alert.metadata.roundNumber}</dd>
                                                                </div>
                                                            )}
                                                            {alert.metadata?.matchId && (
                                                                <div>
                                                                    <dt>Match</dt>
                                                                    <dd>{alert.metadata.matchId}</dd>
                                                                </div>
                                                            )}
                                                            {alert.metadata?.result && (
                                                                <div>
                                                                    <dt>Result</dt>
                                                                    <dd>{String(alert.metadata.result).replace(/_/g, ' ')}</dd>
                                                                </div>
                                                            )}
                                                        </dl>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </section>
            <section className={`${styles.panel} ${styles.hero}`}>
                <div className={styles.heroCopy}>
                    <p className={styles.eyebrow}>{heroEyebrow}</p>
                    <h2>{heroTitle}</h2>
                    <p className={styles.lede}>
                        {heroLead}
                    </p>
                </div>
                <div className={styles.heroActions}>
                    {loggedIn ? (
                        <Link className={styles.cta} href='/tournaments/create'>
                            Create Tournament
                        </Link>
                    ) : (
                        <p className={styles.hint}>Sign in to host events, preregister, and receive reminders.</p>
                    )}
                </div>
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryValue}>{registrationsOpen}</span>
                        <span className={styles.summaryLabel}>Open Registration</span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryValue}>{rankedCount}</span>
                        <span className={styles.summaryLabel}>Ranked Events</span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryValue}>{standardizedCount}</span>
                        <span className={styles.summaryLabel}>Standardized Hourly</span>
                    </div>
                </div>
            </section>

          
        </div>
    );
}
