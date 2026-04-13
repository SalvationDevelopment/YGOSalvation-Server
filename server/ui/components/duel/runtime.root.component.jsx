import React, { useEffect } from 'react';
import { MountedChoiceOverlay, MountedChoiceScreen } from './choice.component';
import { LobbyScreen } from './lobby.component';
import QuestionPrompt from './question.prompt.component';
import { DuelRuntimeScene } from './duel.component';
import styles from './runtime.root.component.module.scss';

function scrollSideChatToBottom() {
    const list = document.getElementById('sidechattext');

    if (list) {
        list.scrollTop = list.scrollHeight;
    }
}

function renderDuelRoot(duel, choice, questionPrompt) {
    const questionText = duel?.lifepoints?.waiting ? 'Waiting,...' : questionPrompt,
        showChoiceOverlay = Boolean(choice?.state?.overlayActive);

    return (
        <section className={styles.root} id="duel">
            <QuestionPrompt
                key="question-prompt"
                text={questionText}
            />
            {showChoiceOverlay
                ? <MountedChoiceOverlay controller={choice} />
                : null}
            <DuelRuntimeScene duel={duel} />
        </section>
    );
}

function renderChoiceRoot(choice) {
    return (
        <section className={styles.root} id="choice-runtime">
            <MountedChoiceScreen controller={choice} />
        </section>
    );
}

function renderLobbyRoot(lobby) {
    return (
        <section className={styles.root} id="lobby">
            <LobbyScreen lobby={lobby} />
        </section>
    );
}

export default function DuelRuntimeRoot({
    mode,
    duel,
    choice,
    lobby,
    questionPrompt
}) {
    useEffect(() => {
        scrollSideChatToBottom();
    });

    switch (mode) {
        case 'duel':
            return renderDuelRoot(duel, choice, questionPrompt);
        case 'choice':
            return renderChoiceRoot(choice);
        default:
            return renderLobbyRoot(lobby);
    }
}
