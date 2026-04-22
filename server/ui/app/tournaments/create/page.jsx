'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createTournament, fetchLeagues } from '../../../util/tournament.api';

const fallbackLeagueCatalog = [
    {
        id: 'tcg-modern-ranked',
        name: 'TCG Modern',
        formats: ['Swiss', 'Single Elimination'],
        banlist: 'Modern',
        duelMode: 'Match',
    },
    {
        id: 'ocg-modern-ranked',
        name: 'OCG Modern',
        formats: ['Swiss', 'Single Elimination'],
        banlist: 'Modern',
        duelMode: 'Match',
    },
    {
        id: 'goat-locked',
        name: 'Goat Locked',
        formats: ['Swiss', 'Single Elimination'],
        banlist: 'April 2005',
        duelMode: 'Match',
    },
];

const reminderOptions = ['24h', '4h', '30m'];

function defaultStartTime() {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(19, 0, 0, 0);
    return start.toISOString().slice(0, 16);
}

export default function CreateTournamentPage() {
    const [leagueCatalog, setLeagueCatalog] = useState(fallbackLeagueCatalog);
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        leagueId: fallbackLeagueCatalog[0].id,
        format: 'Swiss',
        capacity: '16',
        scheduledStart: defaultStartTime(),
        configuredRoundCount: '4',
        checkInRequired: true,
        gracePeriodMinutes: '10',
        ranked: true,
        visibility: 'public',
        reminderOffsets: ['24h', '4h', '30m'],
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;

        fetchLeagues().then((leagues) => {
            if (!active || !leagues.length) {
                return;
            }

            const nextCatalog = leagues.map((league) => ({
                id: league.slug,
                name: league.name,
                formats: league.supportedFormats,
                banlist: league.roomConfiguration?.banlist || 'Modern',
                duelMode: league.roomConfiguration?.duelMode || 'Match',
            }));

            setLeagueCatalog(nextCatalog);
            setFormValues((current) => ({
                ...current,
                leagueId: nextCatalog.some((league) => league.id === current.leagueId) ? current.leagueId : nextCatalog[0].id,
                format: nextCatalog.some((league) => league.id === current.leagueId && league.formats.includes(current.format))
                    ? current.format
                    : nextCatalog[0].formats[0],
            }));
        }).catch(() => {
        });

        return () => {
            active = false;
        };
    }, []);

    const selectedLeague = leagueCatalog.find((league) => league.id === formValues.leagueId) || leagueCatalog[0];
    const validationErrors = useMemo(() => {
        const errors = [];
        const capacity = Number(formValues.capacity);
        const rounds = Number(formValues.configuredRoundCount);
        const grace = Number(formValues.gracePeriodMinutes);
        const startDate = new Date(formValues.scheduledStart);

        if (!formValues.name.trim()) {
            errors.push('Tournament name is required.');
        }
        if (!formValues.description.trim()) {
            errors.push('Description is required.');
        }
        if (capacity < 4 || capacity > 64) {
            errors.push('Capacity must be between 4 and 64 players.');
        }
        if (rounds < 1 || rounds > 7) {
            errors.push('Configured rounds must be between 1 and 7.');
        }
        if (grace < 0 || grace > 30) {
            errors.push('Grace period must be between 0 and 30 minutes.');
        }
        if (Number.isNaN(startDate.getTime()) || startDate <= new Date()) {
            errors.push('Scheduled start must be in the future.');
        }
        if (!selectedLeague.formats.includes(formValues.format)) {
            errors.push('Selected format is not allowed for the chosen league.');
        }
        if (formValues.reminderOffsets.length === 0) {
            errors.push('At least one reminder offset should be selected.');
        }

        return errors;
    }, [formValues, selectedLeague]);

    function onChange(event) {
        const { id, type, value, checked } = event.target;
        setFormValues((current) => {
            const next = {
                ...current,
                [id]: type === 'checkbox' ? checked : value,
            };

            if (id === 'leagueId' && !leagueCatalog.find((league) => league.id === value)?.formats.includes(current.format)) {
                next.format = leagueCatalog.find((league) => league.id === value)?.formats[0] || 'Swiss';
            }

            return next;
        });
    }

    function toggleReminder(offset) {
        setFormValues((current) => {
            const exists = current.reminderOffsets.includes(offset);
            return {
                ...current,
                reminderOffsets: exists
                    ? current.reminderOffsets.filter((entry) => entry !== offset)
                    : current.reminderOffsets.concat(offset),
            };
        });
    }

    async function onSubmit(event) {
        event.preventDefault();
        setSubmitAttempted(true);
        setSubmitMessage('');

        if (validationErrors.length) {
            return;
        }

        setSubmitting(true);
        try {
            const created = await createTournament(formValues);
            setSubmitMessage(`Tournament created: ${created.name}`);
        } catch (error) {
            setSubmitMessage(error.data?.error || error.message || 'Tournament creation failed.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div id='tournamentcreatepage' className='tournamentpanel'>
            <p className='tournamenteyebrow'>Tournament Hosting</p>
            <h2>Create Tournament</h2>
            <div className='tournamentcalendargrid tournamentcreategrid'>
                <form className='tournamentpanel tournamentcreateform' onSubmit={onSubmit}>
                    <div className='tournamentsectionheader'>
                        <h3>Configuration</h3>
                        <p>Define the event shell, timing, league ruleset, and reminder policy.</p>
                    </div>

                    <div className='tournamentfiltergrid tournamentcreatefields'>
                        <label className='tournamentfield tournamentfieldfull'>
                            <span>Tournament Name</span>
                            <input id='name' type='text' value={formValues.name} onChange={onChange} placeholder='Sunday Major' />
                        </label>

                        <label className='tournamentfield tournamentfieldfull'>
                            <span>Description</span>
                            <textarea
                                id='description'
                                value={formValues.description}
                                onChange={onChange}
                                rows='4'
                                placeholder='Describe the event, target league, and registration expectations.'
                            />
                        </label>

                        <label className='tournamentfield'>
                            <span>League</span>
                            <select id='leagueId' value={formValues.leagueId} onChange={onChange}>
                                {leagueCatalog.map((league) => (
                                    <option key={league.id} value={league.id}>{league.name}</option>
                                ))}
                            </select>
                        </label>

                        <label className='tournamentfield'>
                            <span>Format</span>
                            <select id='format' value={formValues.format} onChange={onChange}>
                                {selectedLeague.formats.map((format) => (
                                    <option key={format} value={format}>{format}</option>
                                ))}
                            </select>
                        </label>

                        <label className='tournamentfield'>
                            <span>Capacity</span>
                            <input id='capacity' type='number' min='4' max='64' value={formValues.capacity} onChange={onChange} />
                        </label>

                        <label className='tournamentfield'>
                            <span>Configured Rounds</span>
                            <input id='configuredRoundCount' type='number' min='1' max='7' value={formValues.configuredRoundCount} onChange={onChange} />
                        </label>

                        <label className='tournamentfield'>
                            <span>Scheduled Start</span>
                            <input id='scheduledStart' type='datetime-local' value={formValues.scheduledStart} onChange={onChange} />
                        </label>

                        <label className='tournamentfield'>
                            <span>Grace Period</span>
                            <input id='gracePeriodMinutes' type='number' min='0' max='30' value={formValues.gracePeriodMinutes} onChange={onChange} />
                        </label>

                        <label className='tournamentfield'>
                            <span>Visibility</span>
                            <select id='visibility' value={formValues.visibility} onChange={onChange}>
                                <option value='public'>Public</option>
                                <option value='unlisted'>Unlisted</option>
                            </select>
                        </label>

                        <label className='tournamenttoggle'>
                            <input id='checkInRequired' type='checkbox' checked={formValues.checkInRequired} onChange={onChange} />
                            <span>Require check-in during grace window</span>
                        </label>

                        <label className='tournamenttoggle'>
                            <input id='ranked' type='checkbox' checked={formValues.ranked} onChange={onChange} />
                            <span>Ranked tournament Elo enabled</span>
                        </label>
                    </div>

                    <div className='tournamentsectionheader'>
                        <h3>Reminders</h3>
                        <p>Choose the reminder offsets to schedule once tournament persistence exists.</p>
                    </div>

                    <div className='tournamentreminders'>
                        {reminderOptions.map((offset) => (
                            <label key={offset} className='tournamenttoggle'>
                                <input
                                    type='checkbox'
                                    checked={formValues.reminderOffsets.includes(offset)}
                                    onChange={() => toggleReminder(offset)}
                                />
                                <span>{offset}</span>
                            </label>
                        ))}
                    </div>

                    {submitAttempted && validationErrors.length > 0 && (
                        <div className='tournamentvalidation tournamentempty'>
                            {validationErrors.map((error) => (
                                <p key={error}>{error}</p>
                            ))}
                        </div>
                    )}
                    {submitMessage && (
                        <div className='tournamentvalidation tournamentempty'>
                            <p>{submitMessage}</p>
                        </div>
                    )}

                    <div className='tournamentformactions'>
                        <button className='tournamentcta' type='submit' disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Tournament'}
                        </button>
                        <Link className='tournamentsecondarycta' href='/tournaments'>Back To Calendar</Link>
                    </div>
                </form>

                <aside className='tournamentpanel tournamentdaydetail'>
                    <div className='tournamentsectionheader'>
                        <h3>Preview</h3>
                        <p>Live summary of the configuration that will be sent to the tournament API.</p>
                    </div>

                    <div className='tournamentstack'>
                        <article className='tournamenteventcard'>
                            <div className='tournamenteventmeta'>
                                <span className='tournamentstatus' data-status='registration-open'>Draft Preview</span>
                                <span>{selectedLeague.name}</span>
                                <span>{formValues.visibility}</span>
                            </div>
                            <div className='tournamenteventbody'>
                                <div>
                                    <h4>{formValues.name || 'Untitled Tournament'}</h4>
                                    <p>{formValues.description || 'Add a description to preview the event summary here.'}</p>
                                </div>
                                <dl className='tournamentstats'>
                                    <div>
                                        <dt>Format</dt>
                                        <dd>{formValues.format}</dd>
                                    </div>
                                    <div>
                                        <dt>Capacity</dt>
                                        <dd>{formValues.capacity}</dd>
                                    </div>
                                    <div>
                                        <dt>Rounds</dt>
                                        <dd>{formValues.configuredRoundCount}</dd>
                                    </div>
                                </dl>
                            </div>
                        </article>

                        <article className='tournamentsidecard'>
                            <div>
                                <strong>League Snapshot</strong>
                                <p>{selectedLeague.name} - {selectedLeague.banlist}</p>
                            </div>
                            <span>{selectedLeague.duelMode}</span>
                        </article>

                        <article className='tournamentsidecard'>
                            <div>
                                <strong>Timing</strong>
                                <p>{new Date(formValues.scheduledStart).toLocaleString()}</p>
                            </div>
                            <span>{formValues.gracePeriodMinutes}m grace</span>
                        </article>

                        <article className='tournamentsidecard'>
                            <div>
                                <strong>Reminders</strong>
                                <p>{formValues.reminderOffsets.join(', ') || 'None selected'}</p>
                            </div>
                            <span>{formValues.ranked ? 'Ranked' : 'Unranked'}</span>
                        </article>
                    </div>
                </aside>
            </div>
        </div>
    );
}
