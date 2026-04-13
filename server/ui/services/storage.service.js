
const DEFAULT_IMAGE_CDN = 'https://images.ygoprodeck.com/images/cards';
const DEFAULT_CARD_COVER = 'img/textures/cover.png';

/**
 * Parses stored boolean used by the storage.service module.
 * @param {(string|boolean|null)} value The value value provides an input used by the storage.service module.
 * @param {boolean} fallback The fallback value provides an input used by the storage.service module.
 * @returns {boolean} Returns the value produced by the storage.service module.
 */
function parseStoredBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }
    }
    return Boolean(value);
}

/**
 * Executes the persist helper used by the storage.service module.
 * @param {string} key The key value provides an input used by the storage.service module.
 * @param {string} value The value value provides an input used by the storage.service module.
 * @returns {void} Does not return a value.
 */
export function persist(key, value) {
    localStorage.setItem(key, value);
}

/**
 * Normalizes image cdn url used by the storage.service module.
 * @param {string} value The value value provides an input used by the storage.service module.
 * @returns {string} Returns the value produced by the storage.service module.
 */
export function normalizeImageCdnUrl(value) {
    const normalized = String(value || '').trim().replace(/\/+$/, '');
    return normalized || DEFAULT_IMAGE_CDN;
}

/**
 * Gets card image url used by the storage.service module.
 * @param {string} id The id value provides an input used by the storage.service module.
 * @returns {(string|null)} Returns the value produced by the storage.service module.
 */
export function getCardImageUrl(id) {
    if (!id) {
        return DEFAULT_CARD_COVER;
    }

    return `${normalizeImageCdnUrl(getStorage().imageURL)}/${id}.jpg`;
}

/**
 * Gets storage used by the storage.service module.
 * @returns {Object} Returns the value produced by the storage.service module.
 */
export function getStorage() {
    const applicationDefaults = {
        username : '',
        password : '',
        remember : '',
        imageURL : DEFAULT_IMAGE_CDN,
        theme: '../img/magimagipinkshadow.jpg',
        cover: '../img/textures/cover.png',
        hide_banlist: true,
        autochain: false,
        waitchain: false,
        hide_hint_button: true,
        playassist: false,
        bluff: false,
        language: 'en'
    },
    storage = (typeof window !== 'undefined') ? JSON.parse(JSON.stringify(localStorage)) : {};
    
    return {
        ...applicationDefaults,
        ...storage,
        imageURL: normalizeImageCdnUrl(storage.imageURL || applicationDefaults.imageURL),
        autochain: parseStoredBoolean(storage.autochain, applicationDefaults.autochain),
        hide_banlist: parseStoredBoolean(storage.hide_banlist, applicationDefaults.hide_banlist),
        hide_hint_button: parseStoredBoolean(storage.hide_hint_button, applicationDefaults.hide_hint_button),
        playassist: parseStoredBoolean(storage.playassist, applicationDefaults.playassist),
        bluff: parseStoredBoolean(storage.bluff, applicationDefaults.bluff),
        waitchain: parseStoredBoolean(storage.waitchain, applicationDefaults.waitchain)
    };
}


