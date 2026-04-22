'use client';

import React, { useState } from 'react';
import styles from './contact.component.module.scss';

function getSessionHeaders() {
    const session = typeof window !== 'undefined' ? window.localStorage?.session : '';
    return session ? { Authorization: `Bearer ${session}` } : {};
}

async function readJson(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Request failed.');
    }
    return data;
}

const CLASSIFICATIONS = [
    { value: 'bugs', label: 'Bugs' },
    { value: 'business', label: 'Business' },
    { value: 'suggestions', label: 'Suggestions' },
    { value: 'tournaments', label: 'Tournaments' },
    { value: 'other', label: 'Other' }
];

export default function ContactScreen() {
    const [form, setForm] = useState({
        classification: 'bugs',
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function onChange(event) {
        const { id, value } = event.target;
        setForm((current) => ({
            ...current,
            [id]: value
        }));
    }

    async function onSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await fetch('/api/contact', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    ...getSessionHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            }).then(readJson);

            setSuccess('Message sent.');
            setForm((current) => ({
                ...current,
                subject: '',
                message: ''
            }));
        } catch (submitError) {
            setError(submitError.message || 'Unable to send message.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section id='contactpage' className={styles.root}>
            <div className={styles.shell}>
                <article className={styles.panel}>
                    <p className={styles.eyebrow}>Contact</p>
                    <h2>Send a message to the team</h2>
                    <p className={styles.lede}>
                        Use the correct classification so the message lands in the right queue in the CMS.
                    </p>
                    {success ? <p className={styles.message}>{success}</p> : null}
                    {error ? <p className={styles.error}>{error}</p> : null}
                    <form className={styles.form} onSubmit={onSubmit}>
                        <label htmlFor='classification'>Type</label>
                        <select id='classification' value={form.classification} onChange={onChange}>
                            {CLASSIFICATIONS.map((entry) => (
                                <option key={entry.value} value={entry.value}>{entry.label}</option>
                            ))}
                        </select>

                        <label htmlFor='name'>Name</label>
                        <input id='name' value={form.name} onChange={onChange} required />

                        <label htmlFor='email'>Email</label>
                        <input id='email' type='email' value={form.email} onChange={onChange} required />

                        <label htmlFor='subject'>Subject</label>
                        <input id='subject' value={form.subject} onChange={onChange} />

                        <label htmlFor='message'>Message</label>
                        <textarea id='message' rows={8} value={form.message} onChange={onChange} required />

                        <button type='submit' className={styles.action} disabled={submitting}>
                            {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </article>
            </div>
        </section>
    );
}
