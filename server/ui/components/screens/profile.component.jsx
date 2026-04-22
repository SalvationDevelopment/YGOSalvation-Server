'use client';

import React, { useEffect, useState } from 'react';
import AppImage from '../common/app-image';
import { getStorage, persist } from '../../services/storage.service';
import styles from './profile.component.module.scss';

function getSessionHeaders() {
    const session = typeof window !== 'undefined' ? window.localStorage?.session : '';
    return session ? { Authorization: `Bearer ${session}` } : {};
}

function getSessionToken() {
    return typeof window !== 'undefined' ? window.localStorage?.session || '' : '';
}

async function readJson(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Request failed.');
    }
    return data;
}

const EMPTY_PROFILE = Object.freeze({
    username: '',
    email: '',
    bio: '',
    avatarUrl: '',
    points: 0,
    elo: 0,
    friends: [],
    incomingFriendRequests: [],
    outgoingFriendRequests: [],
    settings: {}
});

function normalizeProfile(profile) {
    return {
        ...EMPTY_PROFILE,
        ...(profile || {}),
        friends: Array.isArray(profile?.friends) ? profile.friends : [],
        incomingFriendRequests: Array.isArray(profile?.incomingFriendRequests) ? profile.incomingFriendRequests : [],
        outgoingFriendRequests: Array.isArray(profile?.outgoingFriendRequests) ? profile.outgoingFriendRequests : []
    };
}

export default function ProfileScreen() {
    const [backgrounds, setBackgrounds] = useState([]);
    const [covers, setCovers] = useState([]);
    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [settings, setSettings] = useState(() => getStorage());
    const [friendUsername, setFriendUsername] = useState('');
    const [loadStatus, setLoadStatus] = useState('loading');
    const [saving, setSaving] = useState(false);
    const [friendPending, setFriendPending] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let active = true;
        const session = getSessionToken();

        if (!session) {
            setError('Missing session.');
            setLoadStatus('error');
            return () => {
                active = false;
            };
        }

        Promise.all([
            fetch('/backgrounds').then((response) => response.json()).catch(() => []),
            fetch('/covers').then((response) => response.json()).catch(() => []),
            fetch(`/api/session/${encodeURIComponent(session)}`, {
                headers: {
                    ...getSessionHeaders()
                }
            }).then(readJson).then((data) => {
                if (data?.success === false || !data?.user) {
                    throw new Error(data?.error || 'Unable to load profile.');
                }
                return data.user;
            })
        ]).then(([backgroundData, coverData, profileData]) => {
            if (!active) {
                return;
            }
            setBackgrounds(Array.isArray(backgroundData) ? backgroundData : []);
            setCovers(Array.isArray(coverData) ? coverData : []);
            const normalizedProfile = normalizeProfile(profileData);
            setProfile(normalizedProfile);

            const nextSettings = {
                ...getStorage(),
                ...(normalizedProfile.settings || {})
            };
            setSettings(nextSettings);
            applyLocalSettings(nextSettings);
            setError('');
            setLoadStatus('ready');
        }).catch((loadError) => {
            if (!active) {
                return;
            }
            setError(loadError.message || 'Unable to load profile.');
            setProfile(EMPTY_PROFILE);
            setLoadStatus('error');
        });

        return () => {
            active = false;
        };
    }, []);

    function applyLocalSettings(nextSettings) {
        persist('theme', nextSettings.theme);
        persist('cover', nextSettings.cover);
        persist('hide_banlist', String(Boolean(nextSettings.hide_banlist)));
        persist('playassist', String(Boolean(nextSettings.playassist)));
        persist('bluff', String(Boolean(nextSettings.bluff)));
        persist('imageURL', nextSettings.imageURL);
        //document.body.style.backgroundImage = `url(${nextSettings.theme})`;
    }

    function onSettingsChange(event) {
        const { id, type, checked, value } = event.target;
        setSettings((current) => {
            const next = {
                ...current,
                [id]: type === 'checkbox' ? checked : value
            };
            applyLocalSettings(next);
            return next;
        });
    }

    function onProfileChange(event) {
        const { id, value } = event.target;
        setProfile((current) => ({
            ...current,
            [id]: value
        }));
    }

    async function saveProfile() {
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const data = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    ...getSessionHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    avatarUrl: profile.avatarUrl || '',
                    bio: profile.bio || '',
                    settings: {
                        theme: settings.theme,
                        cover: settings.cover,
                        imageURL: settings.imageURL,
                        hide_banlist: Boolean(settings.hide_banlist),
                        playassist: Boolean(settings.playassist),
                        bluff: Boolean(settings.bluff)
                    }
                })
            }).then(readJson);

            setProfile(normalizeProfile(data.profile));
            setMessage('Profile updated.');
        } catch (saveError) {
            setError(saveError.message || 'Unable to save profile.');
        } finally {
            setSaving(false);
        }
    }

    async function sendFriendRequest(event) {
        event.preventDefault();
        if (!friendUsername.trim()) {
            return;
        }

        setFriendPending(true);
        setError('');
        setMessage('');

        try {
            const data = await fetch('/api/profile/friends', {
                method: 'POST',
                headers: {
                    ...getSessionHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: friendUsername.trim()
                })
            }).then(readJson);

            setProfile(normalizeProfile(data.profile));
            setFriendUsername('');
            setMessage('Friend request sent.');
        } catch (friendError) {
            setError(friendError.message || 'Unable to send friend request.');
        } finally {
            setFriendPending(false);
        }
    }

    async function updateFriend(userId, action) {
        setFriendPending(true);
        setError('');
        setMessage('');

        try {
            const data = await fetch('/api/profile/friends', {
                method: 'PATCH',
                headers: {
                    ...getSessionHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    action
                })
            }).then(readJson);

            setProfile(normalizeProfile(data.profile));
            setMessage('Friend list updated.');
        } catch (friendError) {
            setError(friendError.message || 'Unable to update friend list.');
        } finally {
            setFriendPending(false);
        }
    }

    function Options({ items }) {
        return items.map((item, i) => (
            <option value={item.image?.url} key={`profile-option-${i}`}>{item.name}</option>
        ));
    }

    if (loadStatus === 'loading') {
        return <section className={styles.profilePage}><div className={styles.profileShell}><div className={styles.profilePanel}>Loading profile...</div></div></section>;
    }

    if (loadStatus !== 'ready') {
        return <section className={styles.profilePage}><div className={styles.profileShell}><div className={styles.profilePanel}>{error || 'Unable to load profile.'}</div></div></section>;
    }

    return (
        <section className={styles.profilePage}>
            <div className={styles.profileShell}>
                <article className={styles.profilePanel}>
                    <div className={styles.profileSummary}>
                        <AppImage
                            className={styles.profileAvatar}
                            src={profile.avatarUrl || settings.cover || '../img/textures/cover.jpg'}
                            alt={`${profile.username} avatar`}
                            fallbackSrc='../img/textures/cover.jpg'
                            width={224}
                            height={224}
                            sizes='(max-width: 768px) 100vw, 14rem'
                            style={{ width: '100%', height: 'auto' }}
                        />
                        <div className={styles.profileSummaryCopy}>
                            <p className={styles.profileEyebrow}>Profile</p>
                            <h2>{profile.username}</h2>
                            <p>{profile.email}</p>
                            <p>{profile.bio || 'No profile bio yet.'}</p>
                        </div>
                    </div>
                    <div className={styles.profileAccountFields}>
                        <label htmlFor='avatarUrl'>Avatar URL</label>
                        <input id='avatarUrl' value={profile.avatarUrl || ''} onChange={onProfileChange} />
                        <label htmlFor='bio'>Bio</label>
                        <textarea id='bio' value={profile.bio || ''} onChange={onProfileChange} rows={5} />
                    </div>
                    <div className={styles.profileMetrics}>
                        <div className={styles.profileMetric}><strong>{profile.points}</strong><span>Points</span></div>
                        <div className={styles.profileMetric}><strong>{profile.elo}</strong><span>Elo</span></div>
                        <div className={styles.profileMetric}><strong>{profile.friends?.length || 0}</strong><span>Friends</span></div>
                    </div>
                    {message && <p className={styles.profileMessage}>{message}</p>}
                    {error && <p className={styles.profileError}>{error}</p>}
                </article>

                <article className={styles.profilePanel}>
                    <h3>Personalization</h3>
                    <label htmlFor='theme'>Theme</label>
                    <select id='theme' onChange={onSettingsChange} value={settings.theme}>
                        <Options items={backgrounds} />
                    </select>
                    <label htmlFor='cover'>Cover</label>
                    <select id='cover' onChange={onSettingsChange} value={settings.cover}>
                        <Options items={covers} />
                    </select>
                    <AppImage
                        className={styles.settingsCoverPreview}
                        src={settings.cover}
                        alt='Selected cover preview'
                        fallbackSrc='../img/textures/cover.jpg'
                        width={640}
                        height={360}
                        sizes='(max-width: 768px) 100vw, 640px'
                        style={{ width: 'auto', height: '300px' }}
                    />
                    <label htmlFor='imageURL'>Image URL</label>
                    <input id='imageURL' value={settings.imageURL} onChange={onSettingsChange} />
                    <div className={styles.profileCheckrow}><input id='hide_banlist' type='checkbox' checked={Boolean(settings.hide_banlist)} onChange={onSettingsChange} /><label htmlFor='hide_banlist'>Hide Old Banlist</label></div>
                    <div className={styles.profileCheckrow}><input id='playassist' type='checkbox' checked={Boolean(settings.playassist)} onChange={onSettingsChange} /><label htmlFor='playassist'>Play Assistance</label></div>
                    <div className={styles.profileCheckrow}><input id='bluff' type='checkbox' checked={Boolean(settings.bluff)} onChange={onSettingsChange} /><label htmlFor='bluff'>Automatically Bluff</label></div>
                    <button type='button' className={styles.profileAction} onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                </article>

                <article className={styles.profilePanel}>
                    <h3>Friends</h3>
                    <form className={styles.profileFriendForm} onSubmit={sendFriendRequest}>
                        <input
                            value={friendUsername}
                            onChange={(event) => setFriendUsername(event.target.value)}
                            placeholder='Add friend by username'
                        />
                        <button type='submit' className={styles.profileAction} disabled={friendPending}>Send Request</button>
                    </form>

                    <div className={styles.profileFriendGroups}>
                        <div>
                            <h4>Friends</h4>
                            {(profile.friends || []).length === 0 ? <p>No friends yet.</p> : profile.friends.map((friend) => (
                                <div key={friend.id} className={styles.profileFriendCard}>
                                    <div>
                                        <strong>{friend.username}</strong>
                                        <span>{friend.elo} Elo</span>
                                    </div>
                                    <button type='button' className={styles.profileSecondaryAction} onClick={() => updateFriend(friend.id, 'remove')} disabled={friendPending}>Remove</button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h4>Incoming Requests</h4>
                            {(profile.incomingFriendRequests || []).length === 0 ? <p>No incoming requests.</p> : profile.incomingFriendRequests.map((friend) => (
                                <div key={friend.id} className={styles.profileFriendCard}>
                                    <div>
                                        <strong>{friend.username}</strong>
                                        <span>{friend.elo} Elo</span>
                                    </div>
                                    <div className={styles.profileInlineActions}>
                                        <button type='button' className={styles.profileAction} onClick={() => updateFriend(friend.id, 'accept')} disabled={friendPending}>Accept</button>
                                        <button type='button' className={styles.profileSecondaryAction} onClick={() => updateFriend(friend.id, 'decline')} disabled={friendPending}>Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h4>Outgoing Requests</h4>
                            {(profile.outgoingFriendRequests || []).length === 0 ? <p>No outgoing requests.</p> : profile.outgoingFriendRequests.map((friend) => (
                                <div key={friend.id} className={styles.profileFriendCard}>
                                    <div>
                                        <strong>{friend.username}</strong>
                                        <span>{friend.elo} Elo</span>
                                    </div>
                                    <button type='button' className={styles.profileSecondaryAction} onClick={() => updateFriend(friend.id, 'cancel')} disabled={friendPending}>Cancel</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
