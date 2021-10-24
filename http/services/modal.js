import { hey, listen } from './listener.service';

function Modal() {
    function userAlert(message) {
        hey({ action: 'ALERT', message });
    }

    function closeModal() {
        hey({ action: 'CLOSE_ALERT' });
    }

    return {
        userAlert,
        closeModal
    };
}

export const {
    userAlert
} = new Modal({});