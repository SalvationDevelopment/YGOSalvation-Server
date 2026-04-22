function resolveDocument(dependencies) {
    return dependencies.document || globalThis.document;
}

function resolveWindow(dependencies) {
    return dependencies.window || globalThis.window;
}

function getElementCenter(element) {
    const rect = element?.getBoundingClientRect?.();

    if (!rect) {
        return null;
    }

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

export function createDuelFieldViewport(dependencies = {}) {
    function queryElements(selector) {
        const documentImpl = resolveDocument(dependencies);

        if (!documentImpl || typeof documentImpl.querySelectorAll !== 'function') {
            return [];
        }

        return Array.from(documentImpl.querySelectorAll(selector));
    }

    function queryElement(selector) {
        const documentImpl = resolveDocument(dependencies);

        if (!documentImpl || typeof documentImpl.querySelector !== 'function') {
            return null;
        }

        return documentImpl.querySelector(selector);
    }

    function getElementById(id) {
        const documentImpl = resolveDocument(dependencies);

        if (!documentImpl || typeof documentImpl.getElementById !== 'function') {
            return null;
        }

        return documentImpl.getElementById(id);
    }

    function getNumericStyle(element, property) {
        const windowImpl = resolveWindow(dependencies);

        if (!windowImpl || typeof windowImpl.getComputedStyle !== 'function') {
            return 0;
        }

        return Number.parseFloat(windowImpl.getComputedStyle(element)?.[property]) || 0;
    }

    function getCardElementByUid(uid) {
        if (!uid) {
            return null;
        }

        return queryElement(`.card[data-uid="${uid}"]`);
    }

    function getCardCenterByUid(uid) {
        return getElementCenter(getCardElementByUid(uid));
    }

    function getFieldRootCenter(fieldRootId = 'automationduelfield') {
        return getElementCenter(getElementById(fieldRootId));
    }

    function getLpSlotCenter(player) {
        return getElementCenter(queryElement(`.lp-slot.p${player}`));
    }

    function getCardGhostStyle(uid) {
        const element = getCardElementByUid(uid),
            rect = element?.getBoundingClientRect?.();

        if (!rect) {
            return null;
        }

        const computedStyle = element ? resolveWindow(dependencies)?.getComputedStyle?.(element) : null;

        return {
            position: 'fixed',
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            transform: computedStyle?.transform && computedStyle.transform !== 'none'
                ? computedStyle.transform
                : '',
            zIndex: 40
        };
    }

    return {
        getCardCenterByUid,
        getCardElementByUid,
        getCardGhostStyle,
        getFieldRootCenter,
        getLpSlotCenter,
        getNumericStyle,
        queryElement,
        queryElements
    };
}
