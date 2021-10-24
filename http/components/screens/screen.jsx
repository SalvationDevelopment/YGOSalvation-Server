import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import SuperHeaderComponent from './superheader.component';
import SuperFooterComponent from './superfooter.component';
import { listen } from '../../services/listener.service';

export default function Screen({ children }) {

    const [isModalActive, setModalModalActive] = useState(false),
        [modalMessage, setModalMessage] = useState('');


    function alert({ message }) {
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

    useEffect(() => {
        listen('ALERT', alert);
        listen('CLOSE_ALERT', closeModal);
    }, []);

    return (
        <div key='screen-top'>
            <SuperHeaderComponent />
            {children}
            <SuperFooterComponent />
            <Modal />
        </div>
    );

}
