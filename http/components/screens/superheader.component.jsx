import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { listen, watchOut } from '../../services/store';
import { getTranslation } from './../../services/useTranslation';


export default function SuperHeaderComponent() {

    const [isLoggedIn, setLogInStatus] = useState(true),
        [translation, setTranslation] = useState(getTranslation());


    useEffect(() => {
        listen('LOGIN_SUPER_HEADER', () => {
            setLogInStatus(true);
        });

        listen('LOGOUT_SUPER_HEADER', () => {
            setLogInStatus(false);
        });

        watchOut('TRANSLATION', ({ newTranslation }) => {
            setTranslation(newTranslation);
        });
    }, []);



    function LoggedInContent() {
        return <>
            <li className="psudolinksingle">
                <Link href="/news">
                    <a>{translation.NEWS}</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/deckedit">
                    <a>{translation.DECKEDIT}</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/host">
                    <a>{translation.HOST}</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/gamelist">
                    <a>Game List</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/rankings">
                    <a>Rankings</a>
                </Link>
            </li>

            <li className="psudolinksingle">
                <Link href="/settings">
                    <a>Settings</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/faqs">
                    <a>FAQs</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/downloads">
                    <a>downloads</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/forum">
                    <a>forum</a>
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/credits">
                    <a>credits</a>
                </Link>
            </li>
        </>;
    }

    function LoggedOutContent() {
        return (
            <>
                <li className="psudolinksingle">
                    <Link href="/news">
                        <a>News</a>
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/rankings">
                        <a>Rankings</a>
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/faqs">
                        <a>FAQs</a>
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/downloads">
                        <a>downloads</a>
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/forum">
                        <a>forum</a>
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/credits">
                        <a>credits</a>
                    </Link>
                </li>
            </>
        );
    }

    function SiteLinks() {
        if (isLoggedIn) {
            return <LoggedInContent />;
        }
        return <LoggedOutContent />;
    }

    return (
        <div className='superheader' id='superheader'>
            <ul className='featurelist' id='featurelist'>
                <li className='psudolinksingle logolink'>
                    <Link href="/">
                        <h1 className='shine logolink'>
                            <span className='logopink'> YGO</span>
                            <span> Salvation</span>
                        </h1>
                    </Link>
                </li>
                <SiteLinks />
            </ul>
        </div>
    );
}