import { emit, on } from './listener.service';

/**
 * Executes the modal helper used by the modal module.
 * @returns {Object} Returns the value produced by the modal module.
 */
function Modal() {
            /**
     * Uses r alert used by the modal module.
     * @param {Object} message The message value provides an input used by the modal module.
     * @returns {void} Does not return a value.
     */
    function userAlert(message) {
        emit({ action: 'ALERT', message });
    }

            /**
     * Closes modal used by the modal module.
     * @returns {void} Does not return a value.
     */
    function closeModal() {
        emit({ action: 'CLOSE_ALERT' });
    }

    return {
        userAlert,
        closeModal
    };
}

export const {
    userAlert,
    closeModal
} = new Modal({});
