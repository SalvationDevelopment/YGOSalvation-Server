import {
    createSelectChainAnswer,
    createSortCardAnswer
} from '../../services/duel-response.service';
import { getCardImageUrl, getStorage, persist } from '../../services/storage.service';
import React from 'react';
import AppImage from '../common/app-image';
import styles from './chain.component.module.scss';

const AUTO_CHAIN_DELAY_MS = 320;
const CHAIN_MODE_NEUTRAL = 'neutral';
const CHAIN_MODE_IGNORE = 'ignore';
const CHAIN_MODE_ALWAYS = 'always';
const CHAIN_MODE_WHEN_AVAILABLE = 'when_available';
const CHAIN_SETTING_FIELDS = Object.freeze([
    {
        id: 'autochain',
        label: 'Automatic Chain Link Order'
    },
    {
        id: 'waitchain',
        label: 'Add a delay even when no response'
    },
    {
        id: 'hide_hint_button',
        label: 'Hide Chain Buttons'
    }
]);
const CHAIN_MODE_BUTTONS = Object.freeze([
    {
        id: CHAIN_MODE_IGNORE,
        label: 'Chain: OFF'
    },
    {
        id: CHAIN_MODE_ALWAYS,
        label: 'Always pause'
    },
    {
        id: CHAIN_MODE_WHEN_AVAILABLE,
        label: 'Chain: ON'
    }
]);
const KEYBOARD_CHAIN_MODE_BY_CODE = Object.freeze({
    KeyA: CHAIN_MODE_ALWAYS,
    KeyS: CHAIN_MODE_IGNORE,
    KeyD: CHAIN_MODE_WHEN_AVAILABLE
});

function resolveKeyboardChainMode(event) {
    if (!event) {
        return CHAIN_MODE_NEUTRAL;
    }

    if (typeof event.code === 'string' && KEYBOARD_CHAIN_MODE_BY_CODE[event.code]) {
        return KEYBOARD_CHAIN_MODE_BY_CODE[event.code];
    }

    switch (String(event.key || '').toLowerCase()) {
        case 'a':
            return CHAIN_MODE_ALWAYS;
        case 's':
            return CHAIN_MODE_IGNORE;
        case 'd':
            return CHAIN_MODE_WHEN_AVAILABLE;
        default:
            return CHAIN_MODE_NEUTRAL;
    }
}

function targetIsEditable(target) {
    if (!target || target === document || target === window) {
        return false;
    }

    if (target.isContentEditable) {
        return true;
    }

    const tagName = String(target.tagName || '').toUpperCase();
    return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

export function normalizeChainMode(mode) {
    switch (mode) {
        case CHAIN_MODE_IGNORE:
        case CHAIN_MODE_ALWAYS:
        case CHAIN_MODE_WHEN_AVAILABLE:
            return mode;
        default:
            return CHAIN_MODE_NEUTRAL;
    }
}

export function toggleChainMode(currentMode, nextMode) {
    const normalizedCurrent = normalizeChainMode(currentMode),
        normalizedNext = normalizeChainMode(nextMode);

    if (normalizedNext === CHAIN_MODE_NEUTRAL || normalizedCurrent === normalizedNext) {
        return CHAIN_MODE_NEUTRAL;
    }

    return normalizedNext;
}

export function getChainModeFlags(mode) {
    const normalizedMode = normalizeChainMode(mode);

    return {
        ignore: normalizedMode === CHAIN_MODE_IGNORE,
        always: normalizedMode === CHAIN_MODE_ALWAYS,
        whenAvailable: normalizedMode === CHAIN_MODE_WHEN_AVAILABLE
    };
}

export function resolveChainDecision(options = {}, settings = {}, mode = CHAIN_MODE_NEUTRAL) {
    const selectTrigger = Boolean(options.select_trigger) || Number(options.specount || 0) === 0x7f,
        forced = Boolean(options.forced),
        count = Number(options.count || 0),
        specount = Number(options.specount || 0),
        autochain = Boolean(settings.autochain),
        waitchain = Boolean(settings.waitchain),
        {
            ignore,
            always,
            whenAvailable
        } = getChainModeFlags(mode),
        shouldDecline = (
            !selectTrigger
            && !forced
            && (
                ignore
                || (((count === 0) || (specount === 0)) && !always)
            )
            && ((count === 0) || !whenAvailable)
        );

    if (shouldDecline) {
        return {
            type: 'decline',
            delayMs: waitchain && !ignore ? AUTO_CHAIN_DELAY_MS : 0
        };
    }

    if (autochain && forced && !(always || whenAvailable)) {
        return {
            type: 'accept_first',
            delayMs: 0
        };
    }

    return {
        type: 'manual',
        delayMs: 0
    };
}

function readChainSettings() {
    const storage = getStorage();

    return {
        autochain: Boolean(storage.autochain),
        waitchain: Boolean(storage.waitchain),
        hide_hint_button: Boolean(storage.hide_hint_button)
    };
}

function setChainerState(controller, update) {
    controller.state = {
        ...controller.state,
        ...update
    };
}

function ChainOptionCard({ card, index, onClick, getCardKey }) {
    return (
        <AppImage
            key={getCardKey(card, index)}
            className={card.selected ? 'selected' : ''}
            src={getCardImageUrl(card.id || card.code)}
            alt={card.name || `Chain option ${index + 1}`}
            onClick={onClick}
            fallbackSrc='img/textures/unknown.jpg'
            width={177}
            height={254}
            sizes='(max-width: 768px) 40vw, 177px'
        />
    );
}

function ChainSettingsPanel({ normalizedMode, settings, onModeClick, onSettingChange }) {
    const showChainButtons = !settings.hide_hint_button;

    return (
        <div
            key="chain-settings-box"
            className="chain-settings-box"
            data-chain-mode={normalizedMode}
            data-hide-chain-buttons={String(Boolean(settings.hide_hint_button))}
        >
            {showChainButtons
                ? (
                    <div
                        key="chain-mode-buttons"
                        className="chain-mode-buttons"
                    >
                        {CHAIN_MODE_BUTTONS.map((button) => {
                            const active = normalizedMode === button.id;

                            return (
                                <button
                                    key={`chain-mode-${button.id}`}
                                    type="button"
                                    className={`chain-mode-button${active ? ' is-active' : ''}`}
                                    data-chain-mode={button.id}
                                    aria-pressed={String(active)}
                                    onClick={(event) => onModeClick(button.id, event)}
                                >
                                    {button.label}
                                </button>
                            );
                        })}
                    </div>
                )
                : null}
            <div
                key="chain-settings-title"
                className="chain-settings-title"
            >
                Chain Settings
            </div>
            {CHAIN_SETTING_FIELDS.map((field) => (
                <label
                    key={`chain-setting-${field.id}`}
                    className="chain-settings-row"
                    htmlFor={`chain-setting-${field.id}`}
                >
                    <input
                        id={`chain-setting-${field.id}`}
                        type="checkbox"
                        checked={Boolean(settings[field.id])}
                        onChange={(event) => onSettingChange(field.id, event)}
                    />
                    <span>{field.label}</span>
                </label>
            ))}
        </div>
    );
}

function ChainDialog({
    active,
    promptText,
    cards,
    forced,
    onCardClick,
    onActivateFirst,
    onDecline,
    getCardKey
}) {
    if (!active) {
        return null;
    }

    const hasSingleChoice = cards.length === 1,
        isForced = Boolean(forced),
        showDecline = !isForced,
        helperText = isForced
            ? (hasSingleChoice
                ? 'Choose Continue to resolve this chain link.'
                : 'Click a card to continue the forced chain.')
            : (hasSingleChoice
                ? 'Choose Yes to activate this card, or No to continue.'
                : 'Click a card to answer Yes, or choose No to continue.');

    return (
        <div
            className={styles.root}
            style={{
                display: 'flex'
            }}
            id="revealed"
            className="chain-dialog"
        >
            <div className="chain-dialog-content">
                {promptText
                    ? <div className="chainprompt">{promptText}</div>
                    : null}
                <div className="chaincards">
                    {cards.map((card, index) => (
                        <ChainOptionCard
                            key={getCardKey(card, index)}
                            card={card}
                            index={index}
                            getCardKey={getCardKey}
                            onClick={(event) => onCardClick(card.selected, index, event)}
                        />
                    ))}
                </div>
                <div className="chainactions">
                    <div className="chainhelper">{helperText}</div>
                    <div className="chainbuttons">
                        {hasSingleChoice
                            ? (
                                <button
                                    className="chainbutton chainbutton-primary"
                                    onClick={onActivateFirst}
                                >
                                    {isForced ? 'Continue' : 'Yes'}
                                </button>
                            )
                            : null}
                        {showDecline
                            ? (
                                <button
                                    className="chainbutton chainbutton-secondary"
                                    onClick={onDecline}
                                >
                                    No
                                </button>
                            )
                            : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChainerView({
    active,
    promptText,
    cards,
    forced,
    onCardClick,
    onActivateFirst,
    onDecline,
    getCardKey
}) {
    if (!active && !promptText && !cards.length && !forced) {
        return null;
    }

    return (
        <ChainDialog
            active={active}
            promptText={promptText}
            cards={cards}
            forced={forced}
            onCardClick={onCardClick}
            onActivateFirst={onActivateFirst}
            onDecline={onDecline}
            getCardKey={getCardKey}
        />
    );
}

export function MountedChainer({ controller }) {
    React.useEffect(() => {
        if (typeof document === 'undefined') {
            return () => {
                disposeChainer(controller);
            };
        }

        const handleKeyDown = (event) => handleChainerKeyDown(controller, event),
            handleKeyUp = (event) => handleChainerKeyUp(controller, event);

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            disposeChainer(controller);
        };
    }, [controller]);

    return (
        <ChainerView
            active={controller?.state?.active}
            promptText={controller?.state?.promptText}
            cards={controller?.state?.cards || []}
            forced={controller?.state?.forced}
            onCardClick={(selected, option, event) => clickChainCard(controller, selected, option, event)}
            onActivateFirst={(event) => activateFirstChain(controller, event)}
            onDecline={(event) => declineChain(controller, event)}
            getCardKey={getChainCardKey}
        />
    );
}

export function MountedChainSettingsPanel({ controller }) {
    if (!controller) {
        return null;
    }

    return (
        <ChainSettingsPanel
            normalizedMode={getEffectiveChainMode(controller)}
            settings={controller.state.settings}
            onModeClick={(mode, event) => {
                event.preventDefault();
                event.stopPropagation();
                updateChainerMode(controller, mode);
            }}
            onSettingChange={(key, event) => {
                event.stopPropagation();
                updateChainerSetting(controller, key, event.target.checked);
            }}
        />
    );
}

export function ChainerState(store) {
    return {
        store,
        state: {
            active: false,
            promptText: '',
            cards: [],
            forced: false,
            mode: CHAIN_MODE_NEUTRAL,
            keyboardMode: CHAIN_MODE_NEUTRAL,
            settings: readChainSettings(),
            pendingAutoResponseTimer: null,
            pendingQuestionToken: 0
        }
    };
}

export function getChainCardKey(card, index) {
    return `chain-${card?.uid || card?.id || card?.code || 'card'}-${card?.player ?? 'x'}-${card?.location || 'unknown'}-${card?.index ?? index}-${index}`;
}

function closeChainModal(controller) {
    setChainerState(controller, {
        cards: [],
        promptText: '',
        active: false,
        forced: false
    });
}

export function cancelPendingChainAutoResponse(controller) {
    if (controller.state.pendingAutoResponseTimer) {
        clearTimeout(controller.state.pendingAutoResponseTimer);
        setChainerState(controller, {
            pendingAutoResponseTimer: null
        });
    }
    setChainerState(controller, {
        pendingQuestionToken: controller.state.pendingQuestionToken + 1
    });
}

export function closeChainer(controller) {
    cancelPendingChainAutoResponse(controller);
    closeChainModal(controller);
}

export function queueChainResponse(controller, answer, delayMs = 0, label = 'CHAIN_RESPONSE') {
    const token = controller.state.pendingQuestionToken,
        commit = () => {
            if (token !== controller.state.pendingQuestionToken) {
                return;
            }
            closeChainModal(controller);
            controller.store.emit({ action: 'CHAIN_RESPONSE', answer, label });
            controller.store.emit({ action: 'RENDER' });
        };

    if (delayMs > 0) {
        const timer = setTimeout(() => {
            setChainerState(controller, {
                pendingAutoResponseTimer: null
            });
            commit();
        }, delayMs);
        setChainerState(controller, {
            pendingAutoResponseTimer: timer
        });
        controller.store.emit({ action: 'RENDER' });
        return;
    }

    commit();
}

export function clickChainCard(controller, selected, option, event) {
    queueChainResponse(controller, createSelectChainAnswer(option), 0, 'chain select');
    event?.preventDefault?.();
    event?.stopPropagation?.();
}

export function declineChain(controller, event) {
    queueChainResponse(controller, createSelectChainAnswer(null), 0, 'chain decline');
    event?.preventDefault?.();
    event?.stopPropagation?.();
}

export function activateFirstChain(controller, event) {
    clickChainCard(controller, false, 0, event);
}

export function getEffectiveChainMode(controller) {
    const keyboardMode = normalizeChainMode(controller.state.keyboardMode);

    if (keyboardMode !== CHAIN_MODE_NEUTRAL) {
        return keyboardMode;
    }

    return normalizeChainMode(controller.state.mode);
}

export function resolveChainerQuestionDecision(controller, options = {}) {
    return resolveChainDecision(
        options,
        controller.state.settings,
        getEffectiveChainMode(controller)
    );
}

export function triggerChainer(controller, state) {
    setChainerState(controller, {
        ...state,
        active: true
    });
}

export function handleChainerQuestion(controller, options = {}, state = {}) {
    closeChainer(controller);

    const decision = resolveChainerQuestionDecision(controller, options);
    if (decision.type === 'decline') {
        queueChainResponse(controller, createSelectChainAnswer(null), decision.delayMs, 'auto chain');
        return true;
    }

    if (decision.type === 'accept_first') {
        queueChainResponse(controller, createSelectChainAnswer(0), decision.delayMs, 'forced chain');
        return true;
    }

    triggerChainer(controller, {
        promptText: state.promptText || '',
        cards: options.chain_choices || [],
        forced: Boolean(options.forced)
    });
    controller.store.emit({ action: 'RENDER' });
    return false;
}

export function handleChainerSortQuestion(controller) {
    cancelPendingChainAutoResponse(controller);
    closeChainModal(controller);

    if (!controller.state.settings.autochain) {
        return false;
    }

    queueChainResponse(controller, createSortCardAnswer(null), 0, 'auto sort chain');
    return true;
}

export function setChainerKeyboardMode(controller, mode) {
    const normalizedMode = normalizeChainMode(mode);

    if (controller.state.keyboardMode === normalizedMode) {
        return;
    }

    setChainerState(controller, {
        keyboardMode: normalizedMode
    });
    controller.store.emit({ action: 'RENDER' });
}

export function handleChainerKeyDown(controller, event) {
    if (!event || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }

    if (targetIsEditable(event.target)) {
        return;
    }

    const nextMode = resolveKeyboardChainMode(event);
    if (nextMode === CHAIN_MODE_NEUTRAL) {
        return;
    }

    event.preventDefault();
    setChainerKeyboardMode(controller, nextMode);
}

export function handleChainerKeyUp(controller, event) {
    const releasedMode = resolveKeyboardChainMode(event);

    if (releasedMode === CHAIN_MODE_NEUTRAL || controller.state.keyboardMode !== releasedMode) {
        return;
    }

    event.preventDefault?.();
    setChainerKeyboardMode(controller, CHAIN_MODE_NEUTRAL);
}

export function updateChainerMode(controller, mode) {
    setChainerState(controller, {
        mode: toggleChainMode(controller.state.mode, mode)
    });
    controller.store.emit({ action: 'RENDER' });
}

export function updateChainerSetting(controller, key, checked) {
    const nextSettings = {
        ...controller.state.settings,
        [key]: Boolean(checked)
    };

    setChainerState(controller, {
        settings: nextSettings
    });
    persist(key, String(Boolean(checked)));
    controller.store.emit({ action: 'RENDER' });
}

export function resetChainerDuelState(controller) {
    closeChainer(controller);
    setChainerState(controller, {
        mode: CHAIN_MODE_NEUTRAL,
        keyboardMode: CHAIN_MODE_NEUTRAL
    });
}

export function disposeChainer(controller) {
    if (!controller) {
        return;
    }

    resetChainerDuelState(controller);
}

export default function Chainer({ controller }) {
    return <MountedChainer controller={controller} />;
}
