'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { subscribe } from '../../hooks/use-listener';
import { getTranslation } from '../../services/useTranslation';
import { useAuthState } from '../../hooks/use-auth-state';
import styles from './superheader.component.module.scss';

const LOGGED_IN_LINKS = [
    { href: '/news', label: 'News', scroll: true },
    { href: '/chat', label: 'Chat' },
    { href: '/deckedit', label: 'Deck Edit', scroll: true },
    { href: '/host', label: 'Host' },
    { href: '/puzzles', label: 'Puzzles' },
    { href: '/gamelist', label: 'Game List' },
    { href: '/calendar', label: 'Calendar', scroll: true },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/profile', label: 'Profile' },
    { href: '/faqs', label: 'FAQs' },
    { href: '/contact', label: 'Contact' },
];

const LOGGED_OUT_LINKS = [
    { href: '/news', label: 'News' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/faqs', label: 'FAQS' },
    { href: '/contact', label: 'Contact' },
];


export default function SuperHeaderComponent({ loggedInOverride }) {

    const { loggedIn: authLoggedIn } = useAuthState(),
        [, setTranslation] = useState(getTranslation());


    subscribe('TRANSLATION', ({ newTranslation }) => {
        setTranslation(newTranslation);
    });
    const loggedIn = typeof loggedInOverride === 'boolean' ? loggedInOverride : authLoggedIn;
    const links = loggedIn ? LOGGED_IN_LINKS : LOGGED_OUT_LINKS;

    return (
        <div className={styles.root} id='superheader'>
            <ul className={styles.featureList} id='featurelist'>
                <li className={`${styles.navItem} ${styles.logoLink}`}>
                    <Link href="/">
                        <h1 className={`${styles.logoLink} shine`}>
                            <span className={styles.logoAccent}> YGO</span>
                            <span> Salvation</span>
                        </h1>
                    </Link>
                </li>
                {links.map((link) => (
                    <li key={link.href} className={styles.navItem}>
                        <Link href={link.href} scroll={link.scroll}>
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
