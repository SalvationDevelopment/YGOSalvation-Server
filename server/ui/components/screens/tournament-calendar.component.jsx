'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    buildCalendarDays,
    buildMockTournaments,
    formatDateTime,
    formatDay,
    formatMonth,
    leagueOptions,
    sameDay,
    sameMonth,
} from '../../util/tournament.mock';
import { fetchTournaments } from '../../util/tournament.api';
import styles from './tournament-calendar.component.module.scss';

export function loadMockTournamentCalendarData(initialCalendarDate) {
    return Promise.resolve(buildMockTournaments(initialCalendarDate));
}

export default function TournamentCalendarScreen({ initialCalendarDate, loadTournaments = fetchTournaments }) {
    const today = new Date(
        initialCalendarDate.year,
        initialCalendarDate.month,
        initialCalendarDate.day
    );

    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [viewDate, setViewDate] = useState(new Date(
        initialCalendarDate.year,
        initialCalendarDate.month,
        1
    ));
    const [selectedDate, setSelectedDate] = useState(today);
    const [filters, setFilters] = useState({
        league: 'all',
        format: 'all',
        rankedOnly: false,
        registrationOnly: false,
    });

    useEffect(() => {
        let active = true;

        loadTournaments(initialCalendarDate).then((data) => {
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
    }, [initialCalendarDate, loadTournaments]);

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
            return true;
        })
        .sort((left, right) => left.startAt - right.startAt);

    const calendarDays = buildCalendarDays(viewDate);
    const selectedDayTournaments = filteredTournaments.filter((tournament) => sameDay(tournament.startAt, selectedDate));
    const registrationsOpen = filteredTournaments.filter((tournament) => tournament.registrationOpen).length;
    const rankedCount = filteredTournaments.filter((tournament) => tournament.ranked).length;
    const standardizedCount = filteredTournaments.filter((tournament) => tournament.platformManaged).length;

    function changeFilter(event) {
        const { id, type, value, checked } = event.target;
        setFilters((current) => ({
            ...current,
            [id]: type === 'checkbox' ? checked : value,
        }));
    }

    function stepMonth(offset) {
        const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(next);
        setSelectedDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }

    function selectDate(date) {
        setSelectedDate(date);
        if (!sameMonth(date, viewDate)) {
            setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.board}>
                <div className={`${styles.lane} ${styles.summaryLane} ${styles.panel}`}>
                    <div className={styles.sectionHeader}>
                        
                        
                        
                    </div>

                    <div className={`${styles.summaryGrid} ${styles.metrics}`}>
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

                    <div className={styles.filterShell}>
                        <div className={styles.sectionHeader}>
                            <h3>Filters</h3>
                            <p>Trim the calendar down to the league and event type you care about.</p>
                        </div>
                        {loading && (
                            <div className={styles.empty}>Loading tournaments...</div>
                        )}
                        {!loading && loadError && (
                            <div className={`${styles.empty} ${styles.validation}`}>{loadError}</div>
                        )}
                        <div className={styles.filterGrid}>
                            <label className={styles.field}>
                                <span>League</span>
                                <select id='league' value={filters.league} onChange={changeFilter}>
                                    <option value='all'>All leagues</option>
                                    {leagueOptions(tournaments).map((league) => (
                                        <option key={league} value={league}>{league}</option>
                                    ))}
                                </select>
                            </label>
                            <label className={styles.field}>
                                <span>Format</span>
                                <select id='format' value={filters.format} onChange={changeFilter}>
                                    <option value='all'>All formats</option>
                                    <option value='Swiss'>Swiss</option>
                                    <option value='Single Elimination'>Single Elimination</option>
                                </select>
                            </label>
                            <label className={styles.toggle}>
                                <input
                                    id='rankedOnly'
                                    type='checkbox'
                                    checked={filters.rankedOnly}
                                    onChange={changeFilter}
                                />
                                <span>Ranked only</span>
                            </label>
                            <label className={styles.toggle}>
                                <input
                                    id='registrationOnly'
                                    type='checkbox'
                                    checked={filters.registrationOnly}
                                    onChange={changeFilter}
                                />
                                <span>Registration open</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={`${styles.lane} ${styles.monthLane} ${styles.panel} ${styles.monthPanel}`}>
                    <div className={styles.monthHeader}>
                        <div>
                            <h3>{formatMonth(viewDate)}</h3>
                        </div>
                        <div className={styles.monthControls}>
                            <button type='button' onClick={() => stepMonth(-1)}>Prev</button>
                            <button type='button' onClick={() => stepMonth(1)}>Next</button>
                        </div>
                    </div>

                    <div className={styles.weekdayRow}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel) => (
                            <span key={dayLabel}>{dayLabel}</span>
                        ))}
                    </div>

                    <div className={styles.monthGrid}>
                        {calendarDays.map((date) => {
                            const dayTournaments = filteredTournaments.filter((tournament) => sameDay(tournament.startAt, date));
                            const isToday = sameDay(date, today);
                            const isSelected = sameDay(date, selectedDate);
                            const inMonth = sameMonth(date, viewDate);

                            return (
                                <button
                                    key={date.toISOString()}
                                    className={styles.day}
                                    data-current-month={inMonth}
                                    data-today={isToday}
                                    data-selected={isSelected}
                                    type='button'
                                    onClick={() => selectDate(date)}
                                >
                                    <span className={styles.dayNumber}>{date.getDate()}</span>
                                    <div className={styles.dayEvents}>
                                        {dayTournaments.slice(0, 2).map((tournament) => (
                                            <span
                                                key={tournament.id}
                                                className={styles.dayPill}
                                                data-format={tournament.format}
                                            >
                                                {new Intl.DateTimeFormat('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                }).format(tournament.startAt)}
                                                {' '}
                                                {tournament.name}
                                            </span>
                                        ))}
                                        {dayTournaments.length > 2 && (
                                            <span className={styles.dayOverflow}>
                                                +{dayTournaments.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={`${styles.lane} ${styles.detailLane} ${styles.panel}`}>
                    <div className={styles.sectionHeader}>
                        <h3>{formatDay(selectedDate)}</h3>
                        <p>{selectedDayTournaments.length} tournament{selectedDayTournaments.length === 1 ? '' : 's'} scheduled.</p>
                    </div>
                    <div className={styles.stack}>
                        {selectedDayTournaments.length === 0 ? (
                            <div className={styles.empty}>
                                No tournaments are scheduled on this date yet.
                            </div>
                        ) : selectedDayTournaments.map((tournament) => (
                            <Link key={tournament.id} href={`/tournaments/${tournament.slug}`} className={styles.eventCard}>
                                <div className={styles.eventMeta}>
                                    <span className={styles.status} data-status={tournament.status.replace(/\s+/g, '-').toLowerCase()}>
                                        {tournament.status}
                                    </span>
                                    <span>{formatDateTime(tournament.startAt)}</span>
                                    <span>{tournament.league}</span>
                                </div>
                                <div className={styles.eventBody}>
                                    <div>
                                        <h4>{tournament.name}</h4>
                                        <p>{tournament.summary}</p>
                                    </div>
                                    <dl className={styles.stats}>
                                        <div>
                                            <dt>Format</dt>
                                            <dd>{tournament.format}</dd>
                                        </div>
                                        <div>
                                            <dt>Field</dt>
                                            <dd>{tournament.preregistered}/{tournament.capacity}</dd>
                                        </div>
                                        <div>
                                            <dt>Rounds</dt>
                                            <dd>{tournament.rounds || 'TBD'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
