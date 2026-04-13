import React, { useEffect, useState } from 'react';
import { MountedSideChat } from './sidechat.component';
import styles from './choice.component.module.scss';

const choicePreviewStore = {
    emit() {},
    on() {
        return () => {};
    }
};

const choiceRpsPreviewRounds = [
    {
        slot: 0,
        result: [0, 2]
    },
    {
        slot: 0,
        result: [1, 0]
    },
    {
        slot: 0,
        result: [2, 2]
    }
];

function ChoiceChat({ sidechat }) {
    return (
        <div id="lobbychat" key="sidechat">
            <MountedSideChat controller={sidechat} />
        </div>
    );
}

function renderChoiceError() {
    return (
        <section id="error" key="error">
            <div id="gofirst">Choice screen error.</div>
        </section>
    );
}

export function toRpsDisplayIndex(choice, value) {
    const numeric = Number(value);

    if (choice?.state?.protocol === 'ocgcore') {
        switch (numeric) {
            case 2:
                return 0;
            case 3:
                return 1;
            case 1:
                return 2;
            default:
                return 0;
        }
    }

    return Math.max(0, Math.min(2, numeric));
}

export function startChoiceFirst(choice, startplayer) {
    choice.store?.emit?.({ action: 'START_CHOICE', player: startplayer });
}

export function replaceChoiceState(choice, nextState) {
    if (!choice) {
        return null;
    }

    choice.state = nextState || {};
    return choice.state;
}

export function updateChoiceState(choice, update) {
    if (!choice) {
        return null;
    }

    const resolvedUpdate = typeof update === 'function'
        ? update(choice.state || {})
        : update;

    return replaceChoiceState(choice, {
        ...(choice.state || {}),
        ...(resolvedUpdate || {})
    });
}

export function setChoiceOverlayActive(choice, active) {
    return updateChoiceState(choice, {
        overlayActive: Boolean(active)
    });
}

export function choiceStateMatches(choice, query = {}) {
    const state = choice?.state || {};

    return Object.entries(query).every(([key, value]) => state[key] === value);
}

export function answerChoiceRps(choice, answer, setSelectedAnswer) {
    if (choice.state.selectedAnswer !== undefined) {
        return;
    }

    updateChoiceState(choice, {
        selectedAnswer: answer
    });
    setSelectedAnswer?.(answer);
    choice.store.emit({ action: 'RENDER' });
    choice.store.emit({ action: 'RPS', answer });
}

export function renderChoiceRpsOption(label, answer, image, selectedAnswer, onAnswer) {
    const style = {
        background: `url(${image}) no-repeat`
    };

    if (selectedAnswer !== undefined && selectedAnswer !== answer) {
        style.opacity = 0.25;
    }

    return (
        <div
            style={style}
            id={label}
            className="rpschoice"
            key={label}
            onClick={() => onAnswer(answer)}
        />
    );
}

export function renderTurnPlayerChoice(choice) {
    return [
        (
            <div id="selectwhogoesfirst" key="turn-player-controls">
                <div id="gofirst" onClick={() => startChoiceFirst(choice, 0)}>Go First</div>
                <div id="gosecond" onClick={() => startChoiceFirst(choice, 1)}>Go Second</div>
            </div>
        ),
        <ChoiceChat sidechat={choice.sidechat} key="sidechat" />
    ];
}

export function renderRpsChoice(choice, selectedAnswer, onAnswer) {
    return [
        (
            <div id="selectwhogoesfirst" className="rpscontainer" key="rps-controls">
                {renderChoiceRpsOption('Rock', 'rock', '../img/textures/rock.jpg', selectedAnswer, onAnswer)}
                {renderChoiceRpsOption('Paper', 'paper', '../img/textures/paper.jpg', selectedAnswer, onAnswer)}
                {renderChoiceRpsOption('Scissors', 'scissors', '../img/textures/scissors.jpg', selectedAnswer, onAnswer)}
            </div>
        ),
        <ChoiceChat sidechat={choice.sidechat} key="sidechat" />
    ];
}

export function renderCoinChoice(choice) {
    const result = choice.state.slot ? 'heads' : 'tail';

    return [
        (
            <div id="selectwhogoesfirst" key="coin-controls">
                <div id="gofirst">{`Flipped a coin, hoping for ${result}`}</div>
            </div>
        ),
        <ChoiceChat sidechat={choice.sidechat} key="sidechat" />
    ];
}

export function describeChoiceCoinFace(value) {
    return value ? 'heads' : 'tails';
}

export function renderDiceChoice(choice) {
    return [
        (
            <div id="selectwhogoesfirst" key="dice-controls">
                <div id="gofirst">Rolling a die.</div>
            </div>
        ),
        <ChoiceChat sidechat={choice.sidechat} key="sidechat" />
    ];
}

export function renderRpsResultCard(id, image, key, extraClassName = '') {
    return (
        <div
            className={`rpsresultlane ${extraClassName}`.trim()}
            key={`${key}-lane`}
        >
            <div
                style={{
                    background: `url(${image}) no-repeat`
                }}
                id={id}
                className={extraClassName.includes('opponent') ? 'rpschoice opponent' : 'rpschoice'}
            />
        </div>
    );
}

export function renderRpsResult(choice) {
    const opponentOptions = [
            renderRpsResultCard('p2Rock', '../img/textures/rock.jpg', 'p1one', 'rpsresultlane-opponent'),
            renderRpsResultCard('p2Paper', '../img/textures/paper.jpg', 'p1two', 'rpsresultlane-opponent'),
            renderRpsResultCard('p2Scissors', '../img/textures/scissors.jpg', 'p1three', 'rpsresultlane-opponent')
        ],
        options = [
            renderRpsResultCard('Rock', '../img/textures/rock.jpg', 'one', 'rpsresultlane-self'),
            renderRpsResultCard('Paper', '../img/textures/paper.jpg', 'two', 'rpsresultlane-self'),
            renderRpsResultCard('Scissors', '../img/textures/scissors.jpg', 'three', 'rpsresultlane-self')
        ],
        playerResultIndex = toRpsDisplayIndex(choice, choice.state.result[choice.state.slot]),
        opponentResultIndex = toRpsDisplayIndex(choice, choice.state.result[Math.abs(choice.state.slot - 1)]);

    return [
        (
            <div id="selectwhogoesfirst" className="rpscontainer result" key="p1">
                <div className="rpszones rpszones-opponent">{opponentOptions[opponentResultIndex]}</div>
                <div className="rpszones rpszones-self">{options[playerResultIndex]}</div>
            </div>
        ),
        <ChoiceChat sidechat={choice.sidechat} key="sidechat" />
    ];
}

export function renderCoinResult(choice, includeChat = true) {
    const ocgcoreResults = Array.isArray(choice.state.result)
            ? choice.state.result.map(describeChoiceCoinFace).join(', ')
            : '',
        result = (choice.state.protocol === 'ocgcore')
            ? `Coin toss ${Array.isArray(choice.state.result) && choice.state.result.length > 1 ? 'results' : 'result'}: ${ocgcoreResults || 'unknown'}.`
            : `Flipped ${choice.state.slot ? 'heads' : 'tails'}.`,
        views = [(
            <div id="selectwhogoesfirst" key="coin-result">
                <div id="gofirst">{result}</div>
            </div>
        )];

    if (includeChat) {
        views.push(<ChoiceChat sidechat={choice.sidechat} key="sidechat" />);
    }

    return views;
}

export function renderDiceResult(choice, includeChat = true) {
    const result = (choice.state.protocol === 'ocgcore')
            ? `Dice roll ${Array.isArray(choice.state.result) && choice.state.result.length > 1 ? 'results' : 'result'}: ${(choice.state.result || []).join(', ') || 'unknown'}.`
            : `You rolled a ${choice.state.result[choice.state.slot]} your opponent rolled a ${choice.state.result[Math.abs(choice.state.slot - 1)]}`,
        views = [(
            <div id="selectwhogoesfirst" key="dice-result">
                <div id="gofirst">{result}</div>
            </div>
        )];

    if (includeChat) {
        views.push(<ChoiceChat sidechat={choice.sidechat} key="sidechat" />);
    }

    return views;
}

export function renderWaitingChoice(choice) {
    return [
        (
            <div id="selectwhogoesfirst" key="waiting-controls">
                <div id="gofirst">Opponent is deciding who goes first.</div>
            </div>
        ),
        <ChoiceChat sidechat={choice.sidechat} key="sidechat" />
    ];
}

export function ChoiceOverlayView({ state }) {
    if (!state?.result || (state.mode !== 'coin' && state.mode !== 'dice')) {
        return null;
    }

    if (state.mode === 'dice') {
        return <section className={styles.root} id="dice" key="dice-overlay">{renderDiceResult({ state, sidechat: null }, false)}</section>;
    }

    return <section className={styles.root} id="coin" key="coin-overlay">{renderCoinResult({ state, sidechat: null }, false)}</section>;
}

export function ChoiceScreenView({ state, sidechat, store, selectedAnswer, onSelectRpsAnswer }) {
    if (!state) {
        return null;
    }

    const choice = { state, sidechat, store };

    if (state.result) {
        switch (state.mode) {
            case 'turn_player':
                return <section className={styles.root} id="turn_player" key="lobby">{renderTurnPlayerChoice(choice)}</section>;
            case 'rps':
                return <section className={styles.root} id="rps" key="rps">{renderRpsResult(choice)}</section>;
            case 'coin':
                return <section className={styles.root} id="coin" key="coin">{renderCoinResult(choice)}</section>;
            case 'dice':
                return <section className={styles.root} id="dice" key="dice">{renderDiceResult(choice)}</section>;
            case 'waiting':
                return <section className={styles.root} id="waiting" key="waiting">{renderWaitingChoice(choice)}</section>;
            default:
                return renderChoiceError();
        }
    }

    switch (state.mode) {
        case 'turn_player':
            return <section className={styles.root} id="turn_player" key="lobby">{renderTurnPlayerChoice(choice)}</section>;
        case 'rps':
            return <section className={styles.root} id="rps" key="rps">{renderRpsChoice(choice, selectedAnswer, onSelectRpsAnswer)}</section>;
        case 'coin':
            return <section className={styles.root} id="coin" key="coin">{renderCoinChoice(choice)}</section>;
        case 'dice':
            return <section className={styles.root} id="dice" key="dice">{renderDiceChoice(choice)}</section>;
        case 'waiting':
            return <section className={styles.root} id="waiting" key="waiting">{renderWaitingChoice(choice)}</section>;
        default:
            return renderChoiceError();
    }
}

export function MountedChoiceOverlay({ controller }) {
    if (!controller) {
        return null;
    }

    return <ChoiceOverlayView state={controller.state} />;
}

export function MountedChoiceScreen({ controller }) {
    const [selectedAnswer, setSelectedAnswer] = useState(controller?.state?.selectedAnswer);

    useEffect(() => {
        if (!controller) {
            return;
        }

        setSelectedAnswer(controller.state.selectedAnswer);
    }, [controller?.state?.selectedAnswer, controller?.state?.mode, controller?.state?.result]);

    if (!controller) {
        return null;
    }

    return (
        <ChoiceScreenView
            state={controller.state}
            sidechat={controller.sidechat}
            store={controller.store}
            selectedAnswer={selectedAnswer}
            onSelectRpsAnswer={(answer) => answerChoiceRps(controller, answer, setSelectedAnswer)}
        />
    );
}

export function ChoiceRpsLoopPreview({
    promptDurationMs = 1400,
    resultDurationMs = 1800
}) {
    const [phase, setPhase] = useState('prompt');
    const [roundIndex, setRoundIndex] = useState(0);

    useEffect(() => {
        const timeoutMs = phase === 'prompt' ? promptDurationMs : resultDurationMs,
            timer = setTimeout(() => {
                if (phase === 'prompt') {
                    setPhase('result');
                    return;
                }

                setRoundIndex((currentRoundIndex) => (
                    (currentRoundIndex + 1) % choiceRpsPreviewRounds.length
                ));
                setPhase('prompt');
            }, timeoutMs);

        return () => {
            clearTimeout(timer);
        };
    }, [phase, promptDurationMs, resultDurationMs]);

    const currentRound = choiceRpsPreviewRounds[roundIndex],
        state = phase === 'prompt'
            ? {
                mode: 'rps',
                result: undefined,
                selectedAnswer: undefined
            }
            : {
                mode: 'rps',
                result: currentRound.result,
                slot: currentRound.slot,
                selectedAnswer: undefined
            };

    return (
        <ChoiceScreenView
            key={`choice-rps-preview-${phase}-${roundIndex}`}
            state={state}
            sidechat={undefined}
            store={choicePreviewStore}
            selectedAnswer={undefined}
            onSelectRpsAnswer={() => {}}
        />
    );
}

export function ChoiceScreenState(store, chat) {
    return {
        sidechat: chat,
        store,
        result: null,
        state: {
            mode: 'coin',
            result: undefined,
            selectedAnswer: undefined
        }
    };
}

export function ChoiceScreen(store, chat) {
    return ChoiceScreenState(store, chat);
}
