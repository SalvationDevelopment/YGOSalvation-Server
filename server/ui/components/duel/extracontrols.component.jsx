import React from 'react';
import { cardIs } from '../../util/cardManipulation';
import { MountedChainSettingsPanel } from './chain.component';
import styles from './extracontrols.component.module.scss';

function sanitize(value) {
    return String(value ?? '');
}

export function ExtraControlsView({ controls, chainController, tokens }) {
    if (!controls || !chainController) {
        return null;
    }

    if (!app.manual) {
        return (
            <div className={styles.root}>
                <button
                    id="control-surrender"
                    onClick={() => app.surrender()}
                >
                    Surrender
                </button>
                <MountedChainSettingsPanel controller={chainController} />
            </div>
        );
    }
    return (
        <div className={styles.root}>
            <button
                id="control-surrender"
                onClick={() => app.surrender()}
            >
                Surrender
            </button>
            <button
                id="control-filter-adv"
                onClick={() => toggleExtraControls(controls)}
            >
                Toggle Controls
            </button>
            <button
                id="control-flip-coin"
                onClick={() => app.manualControls.manualFlip()}
            >
                Flip Coin
            </button>
            <button
                id="control-roll-die"
                onClick={() => app.manualControls.manualRoll()}
            >
                Roll Die
            </button>
            <button
                id="control-token"
                onClick={() => app.manualControls.startSpecialSummon('token')}
            >
                Make Token
            </button>
            <select id="tokendropdown">
                {tokens.map((card, i) => (
                    <option key={`selectn${i}`} value={card.id}>
                        {sanitize(card.name)}
                    </option>
                ))}
            </select>
            <button
                id="control-surrender"
                onClick={() => app.surrender()}
            >
                Surrender
            </button>
        </div>
    );
}

function getResolvedTokens(tokens, databaseSystem, controller) {
    if (Array.isArray(tokens)) {
        return tokens;
    }

    if (Array.isArray(databaseSystem)) {
        return databaseSystem.filter((card) => {
            return cardIs('token', card);
        });
    }

    if (Array.isArray(controller?.tokens)) {
        return controller.tokens;
    }

    return [];
}

export function MountedExtraControls({ controller, controls, databaseSystem, chainController, tokens }) {
    const resolvedControls = controls || controller?.controls,
        resolvedChainController = chainController || controller?.chainController,
        resolvedTokens = React.useMemo(() => {
            return getResolvedTokens(tokens, databaseSystem, controller);
        }, [tokens, databaseSystem, controller]);

    return (
        <ExtraControlsView
            controls={resolvedControls}
            chainController={resolvedChainController}
            tokens={resolvedTokens}
        />
    );
}

export function toggleExtraControls(controls) {
    if (!controls?.state) {
        return;
    }

    controls.state.filter = !controls.state.filter;
}

export default function ExtraControls(props) {
    return <MountedExtraControls {...props} />;
}
