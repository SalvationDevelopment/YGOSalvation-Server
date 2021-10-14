import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import SuperHeaderComponent from './superheader.component';
import SuperFooterComponent from './superfooter.component';

export default function Screen({ children }) {

    const [language, setLanguage] = useState('en'),
        [isModalActive, setModalModalActive] = useState(false),
        [modalMessage, setModalMessage] = useState('');

    function translate(lang) {
        setLanguage(lang);
    }

    function alert(message) {
        isModalActive(true);
        setModalMessage(message);
    }

    function closeModal() {
        isModalActive(false);
        setModalMessage('');
    }


    function Modal() {
        if (!isModalActive) {
            return <></>;
        }
        return (
            <div id='lightbox'>
                <p id='error'>
                    {modalMessage}
                    <button id='modal-ok' onClick={closeModal}>OK</button>
                </p>
            </div>
        );
    }

    function Language() {
        return (
            <div id='languagesetter' key='screen-languagesetter' >
                <span key='screen-en' onClick={translate('en')}>English</span>
                <span key='screen-es' onClick={translate('es')}>Español</span>
                <span key='screen-de' onClick={translate('de')}>Deutsch</span>
                <span key='screen-fr' onClick={translate('fr')}>Français(France)</span>
                <span key='screen-frca' onClick={translate('fr-ca')}>Français(Québec)</span>
                <span key='screen-it' onClick={translate('it')}>Italiano</span>
                <span key='screen-pt' onClick={translate('pt')}>Português</span>
                <span key='screen-nl' onClick={translate('nl')}>Nederlands</span>
                <span key='screen-jp' onClick={translate('jp')}>日本語</span>
                <span key='screen-tr' onClick={translate('tr')}>Türkçe</span>
                <span key='screen-el' onClick={translate('el')}>Ελληνικά</span>
                <span key='screen-fa' onClick={translate('fa')}>فارسی</span>
                <span key='screen-ar' onClick={translate('ar')}>لغةعربي</span>
                <span key='screen-zh' onClick={translate('zh')}>中文(简体)</span>
                <span key='screen-he' onClick={translate('he')}>עברית</span>
            </div>
        );
    }

    return (
        <div key='screen-top'>
            <SuperHeaderComponent />
            {children}
            <Language />
            <SuperFooterComponent />
            <Modal />
        </div>
    );

}

Screen.propTypes = {
    children: PropTypes.string.isRequired
};