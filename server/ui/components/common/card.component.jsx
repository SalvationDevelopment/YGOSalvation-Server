import React from 'react';
import AppImage from './app-image';
import { getCardImageUrl } from '../../services/storage.service';
import { emit } from '../../services/listener.service';
import { cardIs } from '../../util/cardManipulation';
import styles from './card.component.module.scss';

function makeCardheader(state) {
    const level = Number(state.level),
        rank = Number(state.rank);

    if (state.position === 'FaceDownDefence' || state.position === 'FaceDownAttack') {
        return '';
    }
    if (cardIs('link', state)) {
        return Number.isFinite(level) && level > 0 ? `L ${level}` : 'L';
    }
    if (cardIs('xyz', state) || (Number.isFinite(rank) && rank > 0)) {
        return `R ${Number.isFinite(rank) && rank > 0 ? rank : level}`;
    }
    if (Number.isFinite(level) && level > 0) {
        return `â˜… ${level}`;
    }

    return '';
}

function getCounterTotal(counters) {
    if (typeof counters === 'number') {
        return counters;
    }

    if (!counters || typeof counters !== 'object') {
        return 0;
    }

    return Object.values(counters).reduce((total, amount) => total + (Number(amount) || 0), 0);
}

function getCardHintLines(state) {
    const lines = [];

    if (typeof state?.card_hint_text === 'string' && state.card_hint_text.trim()) {
        lines.push(state.card_hint_text.trim());
    }

    if (Array.isArray(state?.desc_hints)) {
        state.desc_hints.forEach((hint) => {
            if (typeof hint === 'string' && hint.trim()) {
                lines.push(hint.trim());
            }
        });
    }

    return Array.from(new Set(lines));
}

function renderChainOverlay(state) {
    if (!state?.chainOverlay || !Number.isInteger(Number(state.chainOverlay.index))) {
        return null;
    }

    const status = typeof state.chainOverlay.status === 'string'
        ? state.chainOverlay.status
        : 'queued';

    return (
        <div
            className={`card-overlay chain-overlay ${status}`}
            data-chain-index={state.chainOverlay.index}
            data-chain-status={status}
        >
            <AppImage alt="" aria-hidden="true" src="/img/textures/chain-overlay.svg" width={128} height={128} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <span className="chain-overlay-number">{state.chainOverlay.index}</span>
        </div>
    );
}

function renderBattleOverlay(state) {
    if (typeof state?.battlePulse !== 'string' || !state.battlePulse.length) {
        return null;
    }

    return (
        <div
            className={`card-overlay battle-overlay ${state.battlePulse}`}
            data-battle-pulse={state.battlePulse}
        >
            <AppImage alt="" aria-hidden="true" src="/img/textures/attack.png" width={128} height={128} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
}

function renderRelationOverlay(state) {
    if (state?.relationOverlay !== 'equip') {
        return null;
    }

    return (
        <div
            className="card-overlay relation-overlay equip-overlay"
            data-relation-overlay="equip"
        >
            <AppImage alt="" aria-hidden="true" src="/img/textures/equip.png" width={128} height={128} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
    );
}

function hoverCardImage(state, tooltip) {
    emit({
        action: 'CARD_HOVER',
        id: state.id,
        card: state
    });
    if (!['MONSTERZONE', 'SPELLZONE', 'HAND'].includes(state.location)) {
        return;
    }

    if ((state.position === 'FaceDown'
        || state.position === 'FaceDownDefence')
        && state.player !== window.orientation
    ) {
        return;
    }
    window.toolTipData = tooltip;
}

function clearCardImageHover() {
    emit({
        action: 'CARD_HOVER',
        clear: true
    });
    window.toolTipData = '';
}

function clickCardImage(state, event) {
    emit({ action: 'CARD_CLICK', card: state, y: event.pageY, x: event.pageX });
    emit({ action: 'UPDATE_FIELD' });
}

export function getCardImageContainerProperties(state) {
    const isOverlayUnit = Number(state.overlayindex || 0) > 0,
        counterTotal = getCounterTotal(state.counters),
        hintLines = getCardHintLines(state),
        counters = (!isOverlayUnit && counterTotal > 0 && state.location !== 'HAND') ? `\n${counterTotal} Counters` : '',
        line2 = (!isOverlayUnit && cardIs('monster', state)) ? `\n${makeCardheader(state)}` : '',
        line3 = (!isOverlayUnit && state.def !== undefined) ? `\n${state.attack || state.atk} / ${state.def} ${counters}` : counters,
        hintFooter = (!isOverlayUnit && hintLines.length) ? `\n${hintLines.join('\n')}` : '',
        player = (window.orientation) ? (state.player ? 0 : 1) : state.player,
        className = ['card'],
        style = {};
    if (!state.ghostOverlay) {
        className.push('p' + player, state.location, 'i' + state.index);
    }

    if (!player && state.location === 'HAND') {
        state = { ...state, position: 'FaceUp' };
    }

    if (state.location === 'HAND') {
        const f = 75 / 0.8,
            xCoord = (state.handLocation < 6)
                ? (5.5 * f - 0.8 * f * state.handLocation) / 2 + 1.55 * f + state.index * 0.8 * f
                : 1.9 * f + state.index * 4.0 * f / (state.handLocation - 1);

        style.left = String() + xCoord + 'px';
    }

    if (state.location === 'DECK' || state.location === 'EXTRA' || state.location === 'GRAVE' || state.location === 'BANISHED') {
        style.transform = 'translate3d(0, 0, ' + state.index + 'px)';
        style.zIndex = state.index;
    }

    if (state.location === 'MONSTERZONE' && state.overlayindex) {
        const offsetX = (state.overlayindex % 2) ? (-1) * (state.overlayindex + 1) * 3 : state.overlayindex + (-1) * 3,
            offsetY = state.overlayindex * 4;

        style.zIndex = -1 * state.overlayindex;
        style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
    }

    if (state.ghostOverlay && state.ghostStyle) {
        Object.assign(style, state.ghostStyle);
    }

    if (state.attackmode) {
        className.push('attackglow');
    }
    if (state.selectionPulse) {
        className.push('selectionglow');
    }
    if (state.flashCover) {
        className.push('flashcover');
    }
    if (state.commandHintPulse) {
        className.push('commandhintglow');
    }
    if (state.targetGlow || state.targetPulse) {
        className.push('targetglow');
    }
    if (state.enterFade) {
        className.push('card-enter');
    }
    if (state.exitFade) {
        className.push('card-exit', 'card-ghost');
    }

    return {
        className: `${className.join(' ')} ${styles.cardComponent}`,
        'data-position': state.position,
        'data-id': state.id,
        'data-uid': state.uid,
        'data-index': state.index,
        'data-overlayindex': state.overlayindex || 0,
        'data-selection-pulse': state.selectionPulse ? 'true' : 'false',
        'data-flash-cover': state.flashCover ? 'true' : 'false',
        'data-command-hint-pulse': state.commandHintPulse ? 'true' : 'false',
        'data-target-pulse': state.targetPulse ? 'true' : 'false',
        'data-header': line2,
        'data-footer': `${line3}${hintFooter}`,
        reloaded: state.reloaded,
        onMouseEnter: () => hoverCardImage(state, `${state.name} ${line2} ${line3}${hintFooter}`),
        onMouseLeave: () => clearCardImageHover(),
        onClick: (event) => clickCardImage(state, event),
        style
    };
}

export function getCardImageProperties(state) {
    const facedown = (state.position === 'FaceDownDefence' || state.position === 'FaceDownAttack' || state.id === 'unknown'),
        src = (state.id && !facedown) ? getCardImageUrl(state.id) : 'img/textures/cover.jpg',
        style = {};
    if (state.location !== 'HAND') {
        style.zIndex = state.index;
    }
    return {
        src,
        style
    };
}

export function CardImageState(input) {
    return {
        state: input?.state || input || {}
    };
}

export function CardImageView({ controller }) {
    if (!controller) {
        return null;
    }

    const imageProperties = getCardImageProperties(controller.state);
    return (
        <div key={controller.state.uid} {...getCardImageContainerProperties(controller.state)}>
            <AppImage alt={controller.state.name || 'Card image'} fallbackSrc='img/textures/unknown.jpg' width={177} height={254} sizes='(max-width: 768px) 33vw, 177px' {...imageProperties} />
            {renderRelationOverlay(controller.state)}
            {renderChainOverlay(controller.state)}
            {renderBattleOverlay(controller.state)}
        </div>
    );
}

/**
 * Render contract
 * Purpose:
 * Renders a single card image surface with field, hand, and overlay presentation.
 *
 * Render Props:
 * - `controller`: object with a `state` field used by the card view
 * - `state`: fallback shorthand that is wrapped into `{ state }` when `controller`
 *   is not provided
 *
 * Local State:
 * - none inside the view; all render state is expected on `controller.state`
 *
 * Feed Inputs:
 * - none listened for directly in this component
 *
 * Feed Outputs:
 * - emits `CARD_HOVER` on mouse enter and mouse leave
 * - emits `CARD_CLICK` on click
 * - emits `UPDATE_FIELD` after click to refresh the field runtime
 *
 * Ambient Dependencies:
 * - `window.orientation` for player-facing field positioning rules
 * - `window.toolTipData` for legacy tooltip content handoff
 * - card image URL resolution through `getCardImageUrl(...)`
 *
 * Minimum render requirements:
 * - `controller.state` or `state` should include at least `id`, `uid`, `location`,
 *   `index`, `position`, and any render metadata needed for overlays
 *
 * Refactor target:
 * - keep the visible render surface prop-driven
 * - move legacy tooltip and field-refresh side effects into a container or harness
 *   where practical
 */
export function CardImage({ controller, state }) {
    const resolvedController = controller || CardImageState(state);
    return <CardImageView controller={resolvedController} />;
}

export function MountedCardImage({ controller }) {
    return <CardImage controller={controller} />;
}

export default CardImage;
