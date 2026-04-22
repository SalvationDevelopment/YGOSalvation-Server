import React, { useEffect, useState } from 'react';
import { createCommandButtonAnswer } from '../../services/duel-response.service';
import styles from './phases.component.module.scss';

const PHASE_INDEX_BY_NAME = {
    DRAW: 0,
    PHASE_DRAW: 0,
    STANDBY: 1,
    PHASE_STANDBY: 1,
    MAIN1: 2,
    MAIN_1: 2,
    PHASE_MAIN1: 2,
    BATTLE: 3,
    BATTLE_START: 3,
    PHASE_BATTLE_START: 3,
    MAIN2: 4,
    MAIN_2: 4,
    PHASE_MAIN2: 4,
    END: 5,
    PHASE_END: 5
};

function createEmptyPhaseIndicatorState(state = {}) {
    return {
        opponentTurn: false,
        phase: undefined,
        battlephase: undefined,
        mainphase2: undefined,
        endphase: undefined,
        ...state
    };
}

function resolvePhaseStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

function resolvePhaseController(target) {
    if (target?.state || target?.phase !== undefined) {
        return target;
    }

    return target?.controller;
}

export function normalizePhaseIndicatorUpdate(phaseUpdate) {
    const numericPhase = Number(phaseUpdate);

    if (Number.isInteger(numericPhase)) {
        return numericPhase;
    }

    return PHASE_INDEX_BY_NAME[String(phaseUpdate || '').toUpperCase()] ?? phaseUpdate;
}

export function updatePhaseIndicator(target, state = {}) {
    const controller = resolvePhaseController(target),
        resolvedStore = resolvePhaseStore(target);

    if (controller) {
        Object.assign(controller.state, state);
    }

    resolvedStore?.emit?.({
        action: 'UPDATE_PHASE_INDICATOR',
        state: createEmptyPhaseIndicatorState({
            ...(controller?.state || {}),
            ...state
        })
    });
}

function clickPhase(store, phase) {
    store?.emit?.({
        action: 'PHASE_CLICK',
        phase: createCommandButtonAnswer(phase)
    });
}

function triggerManualPhase(number) {
    if (!app.manual) {
        return;
    }

    if (number === 6) {
        app.manualControls.manualNextTurn(number);
        return;
    }

    app.manualControls.manualNextPhase(number);
}

function isActivePhase(state, number) {
    return Number(state?.phase) === number;
}

function PhaseIndicatorButton({ number, id, text, enabled, active, onEnabledClick, onManualClick }) {
    const classNames = ['phaseindicator'];

    if (enabled) {
        classNames.push('enabled');
    }

    if (active) {
        classNames.push('active');
    }

    return (
        <button
            className={classNames.join(' ')}
            id={id}
            onClick={enabled ? onEnabledClick : onManualClick}
        >
            {text}
        </button>
    );
}

export default function PhaseIndicator({ controller, store }) {
    const resolvedStore = resolvePhaseStore(store || controller),
        [state, setState] = useState(createEmptyPhaseIndicatorState(controller?.state));

    useEffect(() => {
        setState(createEmptyPhaseIndicatorState(controller?.state));
    }, [controller]);

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const unsubscribeUpdate = resolvedStore.on('UPDATE_PHASE_INDICATOR', (message) => {
                if (controller?.state) {
                    Object.assign(controller.state, message?.state || {});
                }
                setState((current) => createEmptyPhaseIndicatorState({
                    ...current,
                    ...(message?.state || {})
                }));
            }),
            unsubscribeEnablePhase = resolvedStore.on('ENABLE_PHASE', (message) => {
                if (controller?.state) {
                    Object.assign(controller.state, {
                        battlephase: message.battlephase,
                        mainphase2: message.mainphase2,
                        endphase: message.endphase
                    });
                }
                setState((current) => ({
                    ...current,
                    battlephase: message.battlephase,
                    mainphase2: message.mainphase2,
                    endphase: message.endphase
                }));
            }),
            unsubscribeOpponentTurn = resolvedStore.on('OPPONENT_TURN', (message) => {
                if (controller?.state) {
                    controller.state.opponentTurn = Boolean(message.active);
                }
                setState((current) => ({
                    ...current,
                    opponentTurn: Boolean(message.active)
                }));
            });

        return () => {
            unsubscribeUpdate?.();
            unsubscribeEnablePhase?.();
            unsubscribeOpponentTurn?.();
        };
    }, [resolvedStore]);

    const buttons = [
        { number: 0, id: 'drawphi', text: 'DP', enabled: false, active: isActivePhase(state, 0) },
        { number: 1, id: 'standbyphi', text: 'SP', enabled: false, active: isActivePhase(state, 1) },
        { number: 2, id: 'main1phi', text: 'M1', enabled: false, active: isActivePhase(state, 2) },
        { number: 3, id: 'battlephi', text: 'BP', enabled: state.battlephase, active: isActivePhase(state, 3) },
        { number: 4, id: 'main2phi', text: 'M2', enabled: state.mainphase2, active: isActivePhase(state, 4) },
        { number: 5, id: 'endphi', text: 'EP', enabled: state.endphase, active: isActivePhase(state, 5) },
        { number: 6, id: 'nextturn', text: 'Opponent', enabled: state.opponentTurn, active: Boolean(state.opponentTurn) }
    ];

    return (
        <div
            className={styles.root}
            data-currentphase={state.phase}
            data-opponentturn={state.opponentTurn ? 'true' : 'false'}
            id="phaseindicator"
        >
            {buttons.map((button) => (
                <PhaseIndicatorButton
                    active={button.active}
                    enabled={button.enabled}
                    id={button.id}
                    key={button.id}
                    number={button.number}
                    onEnabledClick={() => clickPhase(resolvedStore, button.enabled)}
                    onManualClick={() => triggerManualPhase(button.number)}
                    text={button.text}
                />
            ))}
        </div>
    );
}

export function MountedPhaseIndicator(props) {
    return <PhaseIndicator {...props} />;
}
