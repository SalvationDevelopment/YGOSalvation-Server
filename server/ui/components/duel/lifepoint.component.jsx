import React, { useEffect, useRef, useState } from 'react';
import styles from './lifepoint.component.module.scss';

function createLifepointState(state = {}) {
    const nextState = Object.assign({
        lifepoints: [8000, 8000],
        turn: 1,
        names: ['Player 1', 'Player 2'],
        lpDeltas: {
            0: undefined,
            1: undefined
        },
        playerHints: {
            0: [],
            1: []
        },
        waiting: false
    }, state);

    return {
        ...nextState,
        maxLifepoints: Math.max(
            Number(nextState?.lifepoints?.[0]) || 0,
            Number(nextState?.lifepoints?.[1]) || 0,
            Number(nextState?.maxLifepoints || 0),
            8000
        )
    };
}

function resolveLifepointStore(target) {
    if (target?.on && target?.emit) {
        return target;
    }

    return target?.store;
}

function resolveLifepointController(target) {
    if (target?.state || target?.waiting !== undefined) {
        return target;
    }

    return target?.controller;
}

function normalizeLifepointUpdate(current, update = {}) {
    const nextState = {
            ...current,
            ...update,
            lpDeltas: update.lpDeltas || current.lpDeltas || {
                0: undefined,
                1: undefined
            },
            playerHints: update.playerHints || current.playerHints || {
                0: [],
                1: []
            }
        },
        nextMax = Math.max(
            Number(nextState?.lifepoints?.[0]) || 0,
            Number(nextState?.lifepoints?.[1]) || 0,
            Number(current?.maxLifepoints || 0),
            8000
        );

    return {
        ...nextState,
        maxLifepoints: nextMax
    };
}

function LifepointSlot({ player, value, ratio, delta, name, hints }) {
    return (
        <div className={`lp-slot p${player}`} key={`lp-slot-${player}`}>
            <div className='lp-shell'>
                <div className='lp-track'>
                    <div className='lp-fill' style={{ width: `${ratio * 100}%` }} />
                </div>
                <div className='lp-value'>{value}</div>
                {delta ? <div className={`lp-delta ${delta.tone || 'damage'}`}>{delta.value > 0 ? `+${delta.value}` : `${delta.value}`}</div> : null}
            </div>
            <div className='lp-name'>{name}</div>
            {hints.map((hint, index) => (
                <div className='lp-hint' key={`lp-hint-${player}-${index}`}>{hint}</div>
            ))}
        </div>
    );
}

function getLifepoints(state, player) {
    const value = state?.lifepoints?.[player];
    return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function getPlayerName(state, player) {
    const value = state?.names?.[player];
    if (typeof value === 'string' && value.trim()) {
        return value;
    }
    return `Player ${player + 1}`;
}

function getTurnCount(state) {
    const turn = Number(state?.turn);
    return Number.isFinite(turn) ? Math.max(1, turn) : 1;
}

function getPlayerHints(state, player) {
    const hints = state?.playerHints?.[player];
    return Array.isArray(hints) ? hints.filter(Boolean) : [];
}

function getDelta(state, player) {
    return state?.lpDeltas?.[player] || undefined;
}

function getLifepointRatio(state, player) {
    const maxLifepoints = Number(state?.maxLifepoints || 0),
        value = getLifepoints(state, player);

    return maxLifepoints > 0 ? Math.max(0, Math.min(1, value / maxLifepoints)) : 0;
}

function clearDeltaTimers(timerRefs) {
    Object.values(timerRefs.current || {}).forEach((timer) => {
        if (timer) {
            clearTimeout(timer);
        }
    });
    timerRefs.current = {};
}

export function updateLifepointState(target, state) {
    const controller = resolveLifepointController(target),
        resolvedStore = resolveLifepointStore(target);

    if (!controller || !state) {
        return;
    }

    const currentState = createLifepointState({
        ...(controller.state || {}),
        waiting: Boolean(controller.waiting),
        maxLifepoints: controller.maxLifepoints
    });
    const nextState = normalizeLifepointUpdate(currentState, state);

    controller.state = {
        lifepoints: nextState.lifepoints,
        turn: nextState.turn,
        names: nextState.names,
        lpDeltas: nextState.lpDeltas,
        playerHints: nextState.playerHints
    };
    controller.maxLifepoints = nextState.maxLifepoints;

    resolvedStore?.emit?.({
        action: 'UPDATE_LIFEPOINTS',
        state: nextState
    });
}

export function setLifepointWaiting(target, active) {
    const controller = resolveLifepointController(target),
        resolvedStore = resolveLifepointStore(target),
        waiting = Boolean(active);

    if (controller) {
        controller.waiting = waiting;
    }

    resolvedStore?.emit?.({
        action: 'SET_LIFEPOINT_WAITING',
        active: waiting
    });
    resolvedStore?.emit?.({
        action: 'RENDER'
    });
}

export function pulseLifepointDelta(target, player, value, tone = 'damage', duration = 1300) {
    const controller = resolveLifepointController(target),
        resolvedStore = resolveLifepointStore(target),
        numericPlayer = Number(player || 0),
        numericValue = Number(value || 0);

    if (!controller || !numericValue) {
        return;
    }

    const nextDeltas = Object.assign({}, controller.state?.lpDeltas || {});
    nextDeltas[numericPlayer] = {
        value: numericValue,
        tone,
        token: Date.now()
    };
    controller.state.lpDeltas = nextDeltas;

    resolvedStore?.emit?.({
        action: 'PULSE_LIFEPOINT_DELTA',
        state: {
            player: numericPlayer,
            value: numericValue,
            tone,
            duration: Math.max(500, Number(duration || 1300)),
            token: Date.now()
        }
    });
}

export function disposeLifepointState(target) {
    const controller = resolveLifepointController(target),
        resolvedStore = resolveLifepointStore(target);

    if (controller) {
        controller.waiting = false;
        if (controller.state) {
            controller.state.lpDeltas = {
                0: undefined,
                1: undefined
            };
        }
    }

    resolvedStore?.emit?.({
        action: 'RESET_LIFEPOINTS'
    });
}

export function LifepointDisplayView({ state }) {
    if (!state) {
        return null;
    }

    return (
        <div className={`lp-layout ${styles.root}`}>
            <LifepointSlot
                player={0}
                value={getLifepoints(state, 0)}
                ratio={getLifepointRatio(state, 0)}
                delta={getDelta(state, 0)}
                name={getPlayerName(state, 0)}
                hints={getPlayerHints(state, 0)}
            />
            <div className='turncount'>{getTurnCount(state)}</div>
            <LifepointSlot
                player={1}
                value={getLifepoints(state, 1)}
                ratio={getLifepointRatio(state, 1)}
                delta={getDelta(state, 1)}
                name={getPlayerName(state, 1)}
                hints={getPlayerHints(state, 1)}
            />
        </div>
    );
}

export function MountedLifepointDisplay({ controller, store }) {
    const resolvedStore = resolveLifepointStore(store || controller),
        initialControllerState = controller
            ? createLifepointState({
                ...(controller.state || {}),
                waiting: Boolean(controller.waiting),
                maxLifepoints: controller.maxLifepoints
            })
            : createLifepointState(),
        [state, setState] = useState(initialControllerState),
        deltaTimersRef = useRef({});

    useEffect(() => {
        if (!resolvedStore?.on) {
            return undefined;
        }

        const resetState = () => {
                clearDeltaTimers(deltaTimersRef);
                setState(createLifepointState());
            },
            unsubscribeUpdate = resolvedStore.on('UPDATE_LIFEPOINTS', (message) => {
                setState((current) => normalizeLifepointUpdate(current, message?.state || {}));
            }),
            unsubscribeWaiting = resolvedStore.on('SET_LIFEPOINT_WAITING', (message) => {
                setState((current) => ({
                    ...current,
                    waiting: Boolean(message?.active)
                }));
            }),
            unsubscribePulse = resolvedStore.on('PULSE_LIFEPOINT_DELTA', (message) => {
                const payload = message?.state || {},
                    numericPlayer = Number(payload.player || 0),
                    duration = Math.max(500, Number(payload.duration || 1300));

                if (deltaTimersRef.current[numericPlayer]) {
                    clearTimeout(deltaTimersRef.current[numericPlayer]);
                }

                setState((current) => ({
                    ...current,
                    lpDeltas: {
                        ...(current.lpDeltas || {}),
                        [numericPlayer]: {
                            value: Number(payload.value || 0),
                            tone: payload.tone || 'damage',
                            token: payload.token || Date.now()
                        }
                    }
                }));

                deltaTimersRef.current[numericPlayer] = setTimeout(() => {
                    deltaTimersRef.current[numericPlayer] = null;
                    setState((current) => ({
                        ...current,
                        lpDeltas: {
                            ...(current.lpDeltas || {}),
                            [numericPlayer]: undefined
                        }
                    }));
                }, duration);
            }),
            unsubscribeReset = resolvedStore.on('RESET_LIFEPOINTS', () => {
                resetState();
            });

        return () => {
            unsubscribeUpdate?.();
            unsubscribeWaiting?.();
            unsubscribePulse?.();
            unsubscribeReset?.();
            resetState();
        };
    }, [resolvedStore]);

    return <LifepointDisplayView state={state} />;
}

export default function LifepointDisplay(props) {
    return <MountedLifepointDisplay {...props} />;
}
