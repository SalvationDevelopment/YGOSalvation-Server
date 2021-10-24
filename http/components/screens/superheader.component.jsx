import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { listen, watchOut } from '../../services/listener.service';
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
                <Link href="/news" scroll={true}>
                    {translation.NEWS}
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/deckedit" scroll={true}>
                    {translation.DECKEDIT}
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/host">
                    {translation.HOST}
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/gamelist">
                    Game List
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/rankings">
                    Rankings
                </Link>
            </li>

            <li className="psudolinksingle">
                <Link href="/settings">
                    Settings
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/faqs">
                    FAQs
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/downloads">
                    downloads
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/forum">
                    forum
                </Link>
            </li>
            <li className="psudolinksingle">
                <Link href="/credits">
                    credits
                </Link>
            </li>
        </>;
    }

    function LoggedOutContent() {
        return (
            <>
                <li className="psudolinksingle">
                    <Link href="/news">
                        News
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/rankings">
                        Rankings
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/faqs">
                        FAQs
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/downloads">
                        downloads
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/forum">
                        forum
                    </Link>
                </li>
                <li className="psudolinksingle">
                    <Link href="/credits">
                        credits
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