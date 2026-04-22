 
import React from 'react';
import { cardIs } from '../../util/cardManipulation';
import { fieldspell, monsterMap, pendulumMap, stMap } from './cardinfo.component';
import styles from './controls.component.module.scss';
/*global app */

const buttonDetails = {
    activatable_cards: { text: 'Activate', id: 6 },
    activates: { text: 'Activate', id: 6 },
    summonable_cards: { text: 'Normal Summon', id: 1 },
    summons: { text: 'Normal Summon', id: 1 },
    spsummonable_cards: { text: 'Special Summon', id: 2 },
    special_summons: { text: 'Special Summon', id: 2 },
    repositionable_cards: { text: 'Flip', id: 3 },
    pos_changes: { text: 'Flip', id: 3 },
    msetable_cards: { text: 'Set MZ', id: 4 },
    monster_sets: { text: 'Set MZ', id: 4 },
    ssetable_cards: { text: 'Set ST', id: 5 },
    spell_sets: { text: 'Set ST', id: 5 },
    select_options: { text: 'Select', id: 7 },
    attackable_cards: { text: 'Attack', id: 8 },
    attacks: { text: 'Attack', id: 8 },
    chains: { text: 'Activate', id: 0 },
    view_materials: { text: 'View', id: 9 },
    view_pile: { text: 'View', id: 10 },
    activate_pile: { text: 'Activate', id: 11 },
    spsummon_pile: { text: 'Special Summon', id: 12 }
};

const commandOptionKeys = [
    'summonable_cards',
    'summons',
    'spsummonable_cards',
    'special_summons',
    'repositionable_cards',
    'pos_changes',
    'msetable_cards',
    'monster_sets',
    'ssetable_cards',
    'spell_sets',
    'activatable_cards',
    'activates',
    'select_options',
    'attackable_cards',
    'attacks',
    'chains'
];

const pileActivateOptionKeys = ['activatable_cards', 'activates', 'chains'];
const pileSpecialSummonOptionKeys = ['spsummonable_cards', 'special_summons'];
const fieldActivateOptionKeys = ['activatable_cards', 'activates', 'chains'];
const viewerModeByCardType = Object.freeze({
    activate_pile: 'activate',
    spsummon_pile: 'spsummon',
    view_materials: 'view',
    view_pile: 'view'
});

function getViewerSlot(viewerSlot) {
    const fallbackViewerSlot = typeof window !== 'undefined'
        ? (window.orientation || 0)
        : 0,
        resolvedViewerSlot = viewerSlot === undefined
            ? fallbackViewerSlot
            : viewerSlot;

    return Number.isInteger(Number(resolvedViewerSlot)) ? Number(resolvedViewerSlot) : 0;
}

function checksetcode(obj, sc) {
    'use strict';
    var val = obj.setcode,
        hexA = val.toString(16),
        hexB = sc.toString(16);
    if (val === sc
        || parseInt(hexA.substr(hexA.length - 4), 16) === parseInt(hexB, 16)
        || parseInt(hexA.substr(hexA.length - 2), 16) === parseInt(hexB, 16)
        || (val >> 16).toString(16) === hexB) {
        return true;
    }
    return false;

}

function excludeTokens(card) {
    // filter out Tokens
    if (card.type === 16401 || card.type === 16417) {
        return false;
    }
    return true;
}

function hasKnownCardIdentity(id) {
    return !(
        id === undefined
        || id === null
        || id === ''
        || id === 'unknown'
    );
}

function setControlButtonsState(controller, nextState) {
    controller.state = {
        ...controller.state,
        ...nextState
    };
}

function setControlButtonsInfo(controller, nextInfo) {
    controller.info = {
        ...controller.info,
        ...nextInfo
    };
}

function ControlActionButton({ text, onClick, className, style }) {
    return (
        <button
            className={className}
            onClick={onClick}
            style={style}
        >
            {text}
        </button>
    );
}

function FloatingControlPanel({ coords, className, children }) {
    return (
        <div
            style={{
                left: `${coords.x - 15}px`,
                top: `${coords.y - 15}px`,
                position: 'fixed',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center'
            }}
            className={[styles.root, className].filter(Boolean).join(' ')}
        >
            {children}
        </div>
    );
}

export function ControlButtonsView({ state, info, store }) {
    if (!state || !info || !store) {
        return null;
    }

    const list = [],
        query = info.target;
    if (!query) {
        return null;
    }
    if (app.manual) {
        return manualDisplayControls({ state, info, store }, query);
    }
    if (query.pile) {
        getPileActionEntriesForControls({ state }, query.deck).forEach((entry) => {
            list.push({
                ...entry,
                id: `${entry.type}-${query.player}-${query.location}`
            });
        });
        return list.length ? displayControlButtons({ state, info, store }, list) : null;
    }
    Object.keys(state).forEach((type) => {
        const options = (Array.isArray(state[type])) ? state[type] : [],
            selectableIndex = options.findIndex((option, i) => {
                return commandOptionMatchesQuery({
                    ...option,
                    i,
                    type
                }, query);
            });
        if (selectableIndex !== -1) {
            list.push({ type, card: query, i: selectableIndex });
        }
    });
    if (Array.isArray(query.overlayMaterials) && query.overlayMaterials.length) {
        list.push({
            type: 'view_materials',
            id: `view-materials-${query.uid || query.id || query.location}-${query.index}`,
            deck: query.overlayMaterials
        });
    }
    if (!list.length) {
        return null;
    }
    return displayControlButtons({ state, info, store }, list);
}

export function MountedControlButtons({ controller }) {
    return (
        <ControlButtonsView
            state={controller?.state}
            info={controller?.info}
            store={controller?.store}
        />
    );
}

export function resolveViewerPlayer(player, viewerSlot = getViewerSlot()) {
    const normalizedPlayer = Number(player);

    if (!Number.isInteger(normalizedPlayer)) {
        return player;
    }

    return viewerSlot ? (normalizedPlayer ? 0 : 1) : normalizedPlayer;
}

export function commandOptionMatchesQuery(option, query, viewerSlot = getViewerSlot()) {
    if (!option || !query) {
        return false;
    }

    const queryPlayer = query.player === undefined
        ? undefined
        : resolveViewerPlayer(query.player, viewerSlot);

    return (
        option.index === query.index
        && option.location === query.location
        && (
            option.player === undefined
            || queryPlayer === undefined
            || Number(option.player) === Number(queryPlayer)
        )
        && (
            option.id === undefined
            || !hasKnownCardIdentity(option.id)
            || !hasKnownCardIdentity(query.id)
            || option.id === query.id
        )
    );
}

export function cardMatchesCommandFamilies(card, commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
    if (!card || !Array.isArray(commandOptions) || !commandFamilies.length) {
        return false;
    }

    return commandOptions.some((option) =>
        commandFamilies.includes(option?.type)
        && commandOptionMatchesQuery(option, card, viewerSlot)
    );
}

export function getCommandAnswerForCard(card, commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
    if (!card || !Array.isArray(commandOptions) || !commandFamilies.length) {
        return null;
    }

    const match = commandOptions.find((option) =>
        commandFamilies.includes(option?.type)
        && commandOptionMatchesQuery(option, card, viewerSlot)
    );

    return match
        ? {
            type: match.type,
            i: match.i
        }
        : null;
}

function optionMatchesPile(option, pileCard, viewerSlot = getViewerSlot()) {
    if (!option || !pileCard) {
        return false;
    }

    const pilePlayer = pileCard.player === undefined
        ? undefined
        : resolveViewerPlayer(pileCard.player, viewerSlot);

    return (
        option.location === pileCard.location
        && (
            option.player === undefined
            || pilePlayer === undefined
            || Number(option.player) === Number(pilePlayer)
        )
    );
}

export function annotatePileDeck(deck = [], commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
    return (Array.isArray(deck) ? deck : []).map((card) => ({
        ...card,
        actionable: cardMatchesCommandFamilies(card, commandOptions, commandFamilies, viewerSlot)
    }));
}

export function filterPileDeck(deck = [], commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
    return annotatePileDeck(deck, commandOptions, commandFamilies, viewerSlot)
        .filter((card) => card.actionable);
}

export function buildPileActionDeck(deck = [], commandOptions = [], commandFamilies = commandOptionKeys, viewerSlot = getViewerSlot()) {
    const cards = Array.isArray(deck) ? deck : [],
        pileCard = cards[0];

    if (!pileCard || !Array.isArray(commandOptions) || !commandFamilies.length) {
        return [];
    }

    return commandOptions
        .filter((option) =>
            commandFamilies.includes(option?.type)
            && optionMatchesPile(option, pileCard, viewerSlot)
        )
        .map((option) => {
            const matchedCard = cards.find((card) => commandOptionMatchesQuery(option, card, viewerSlot))
                || cards.find((card) =>
                    card?.location === option.location
                    && Number(card?.index) === Number(option.index)
                ),
                resolvedId = hasKnownCardIdentity(option?.id)
                    ? option.id
                    : matchedCard?.id,
                viewerAnswer = {
                    type: option.type,
                    i: option.i
                };

            return {
                ...(pileCard || {}),
                ...(matchedCard || {}),
                ...(resolvedId !== undefined ? { id: resolvedId } : {}),
                player: matchedCard?.player ?? pileCard.player,
                location: matchedCard?.location || pileCard.location,
                index: matchedCard?.index ?? option.index,
                actionable: true,
                viewerAnswer
            };
        })
        .filter((card) => card.viewerAnswer);
}

export function getPileActionEntries(deck = [], commandOptions = [], viewerSlot = getViewerSlot()) {
    const cards = Array.isArray(deck) ? deck : [],
        resolvedViewerSlot = getViewerSlot(viewerSlot),
        list = [];

    if (!cards.length) {
        return list;
    }

    list.push({
        type: 'view_pile',
        deck: annotatePileDeck(cards, commandOptions, commandOptionKeys, resolvedViewerSlot)
    });

    const activateDeck = buildPileActionDeck(cards, commandOptions, pileActivateOptionKeys, resolvedViewerSlot);
    if (activateDeck.length) {
        list.push({
            type: 'activate_pile',
            deck: activateDeck
        });
    }

    const specialSummonDeck = buildPileActionDeck(cards, commandOptions, pileSpecialSummonOptionKeys, resolvedViewerSlot);
    if (specialSummonDeck.length) {
        list.push({
            type: 'spsummon_pile',
            deck: specialSummonDeck
        });
    }

    return list;
}

export function clickGameplayControlButton(store, card, uuid) {
    if (['view_materials', 'view_pile', 'activate_pile', 'spsummon_pile'].includes(card.type)) {
        app.duel.closeRevealer();
        clearControlButtons(app.duel.controls);
        store.emit({
            action: 'OPEN_IDLE_EXTRA_VIEWER',
            deck: Array.isArray(card.deck) ? card.deck : [],
            mode: viewerModeByCardType[card.type] || 'view'
        });
        return;
    }

    store.emit({ action: 'CONTROL_CLICK', card, uuid });
    app.duel.closeRevealer();
}

export function GameplayControlButtonView({ store, card, info, uuid }) {
    return (
        <ControlActionButton
            key={info.text}
            onClick={() => clickGameplayControlButton(store, card, uuid)}
            style={{
                display: 'flex',
                width: 'auto',
                zIndex: '350',
                textAlign: 'center'
            }}
            text={info.text}
        />
    );
}

export function getControlButtonsCommandOptions(controller) {
    return commandOptionKeys.flatMap((type) =>
        (Array.isArray(controller?.state?.[type]) ? controller.state[type] : []).map((option, index) => ({
            ...option,
            i: index,
            type
        }))
    );
}

export function hasActionableControlCard(controller, query) {
    return getControlButtonsCommandOptions(controller).some((option) => commandOptionMatchesQuery(option, query));
}

export function getActionableDeckForControls(controller, deck = []) {
    return annotatePileDeck(deck, getControlButtonsCommandOptions(controller), commandOptionKeys, getViewerSlot());
}

export function getPileActionEntriesForControls(controller, deck = [], viewerSlot = getViewerSlot()) {
    return getPileActionEntries(deck, getControlButtonsCommandOptions(controller), viewerSlot);
}

export function getIdleCommandPileHintsForControls(controller, viewerSlot = getViewerSlot()) {
    const localCanonicalPlayer = viewerSlot ? 1 : 0,
        pileLocations = new Set(
            getControlButtonsCommandOptions(controller)
                .filter((option) =>
                    ['EXTRA', 'GRAVE', 'BANISHED'].includes(option?.location)
                    && (option.player === undefined || Number(option.player) === 0)
                )
                .map((option) => option.location)
        );

    return Array.from(pileLocations).map((location) => ({
        player: localCanonicalPlayer,
        location
    }));
}

export function getIdleCommandPileActionCoversForControls(controller, viewerSlot = getViewerSlot()) {
    const localCanonicalPlayer = viewerSlot ? 1 : 0,
        pileLocations = new Set(
            getControlButtonsCommandOptions(controller)
                .filter((option) =>
                    ['EXTRA', 'GRAVE', 'BANISHED'].includes(option?.location)
                    && (option.player === undefined || Number(option.player) === 0)
                    && (
                        pileActivateOptionKeys.includes(option?.type)
                        || pileSpecialSummonOptionKeys.includes(option?.type)
                    )
                )
                .map((option) => option.location)
        );

    return Array.from(pileLocations).map((location) => ({
        player: localCanonicalPlayer,
        location
    }));
}

export function getIdleCommandFieldActionCoversForControls(controller, viewerSlot = getViewerSlot()) {
    const localCanonicalPlayer = viewerSlot ? 1 : 0,
        seen = new Set();

    return getControlButtonsCommandOptions(controller)
        .filter((option) =>
            ['MONSTERZONE', 'SPELLZONE'].includes(option?.location)
            && (option.player === undefined || Number(option.player) === 0)
            && fieldActivateOptionKeys.includes(option?.type)
            && Number.isInteger(Number(option?.index))
        )
        .map((option) => ({
            player: localCanonicalPlayer,
            location: option.location,
            index: Number(option.index)
        }))
        .filter((hint) => {
            const key = `${hint.player}:${hint.location}:${hint.index}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
}

export function hideControlZones(controller) {
    const zones = controller?.state?.zones;

    if (!zones) {
        return;
    }

    setControlButtonsState(controller, {
        zones: Object.fromEntries(
            Object.entries(zones).map(([uid, zone]) => [
                uid,
                zone
                    ? {
                        ...zone,
                        state: {
                            ...zone.state,
                            active: false
                        }
                    }
                    : zone
            ])
        )
    });
}

export function renderEnabledControlClasses(controller, enabledClasses, disabledClasses) {
    const buttons = [
        { text: 'Flip Deck Over', options: ['filtered', 'm-deck', 'm-convulse'], onClick: function () { app.manualControls.manualFlipDeck(); } },
        { text: 'Reveal Deck', options: ['filtered', 'm-deck'], onClick: function () { app.manualControls.manualRevealDeck(); } },
        { text: 'Reveal Top Card', options: ['filtered', 'm-deck'], onClick: function () { app.manualControls.manualRevealTop(); } },
        { text: 'Reveal Bottom Card', options: ['filtered', 'm-deck'], onClick: function () { app.manualControls.manualRevealBottom(); } },
        { text: 'Banish Top Card', options: ['filtered', 'm-deck', 'non-banish'], onClick: function () { app.manualControls.manualMillRemovedCard(); } },
        { text: 'Banish FaceDown', options: ['m-deck', 'non-banish'], onClick: function () { app.manualControls.manualMillRemovedCardFaceDown(); } },
        { text: 'Excavate', options: ['filtered', 'm-hand', 'm-deck', 'v-grave', 'v-removed', 'v-deck', 'non-excavate'], onClick: function () { app.manualControls.manualToExcavate(); } },
        { text: 'Excavate Face-down', options: ['filtered', 'm-deck'], onClick: function () { app.manualControls.manualExcavateTop(); } },
        { text: 'Shuffle Deck', options: ['m-deck'], onClick: function () { app.manualControls.manualShuffleDeck(); } },
        { text: 'View Deck', options: ['m-deck'], onClick: function () { app.manualControls.manualViewDeck(); } },
        { text: 'Mill', options: ['m-deck'], onClick: function () { app.manualControls.manualMill(); } },
        { text: 'Draw', options: ['m-deck'], onClick: function () { app.manualControls.manualDraw(); } },

        { text: 'View Graveyard', options: ['m-grave'], onClick: function () { app.manualControls.manualViewGrave(); } },
        { text: 'View Banished', options: ['m-removed'], onClick: function () { app.manualControls.manualViewBanished(); } },

        { text: 'View Extra Deck', options: ['m-extra', 'm-extra-view'], onClick: function () { app.manualControls.manualViewExtra(); } },
        { text: 'Reveal Extra Deck', options: ['filtered', 'm-extra'], onClick: function () { app.manualControls.manualRevealExtra(); } },
        { text: 'Reveal Random Card', options: ['filtered', 'm-extra'], onClick: function () { app.manualControls.manualRevealExtraDeckRandom(); } },

        { text: 'View Excavated', options: ['m-excavated'], onClick: function () { app.manualControls.manualViewExcavated(); } },
        { text: 'Reveal Excavated', options: ['m-excavated'], onClick: function () { app.manualControls.manualRevealExcavated(); } },
        { text: 'Reveal Random Card', options: ['m-excavated'], onClick: function () { app.manualControls.manualRevealExcavatedRandom(); } },

        { text: 'To Bottom of Deck', options: ['filtered', 'm-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'], onClick: function () { app.manualControls.manualToBottomOfDeck(); } },
        { text: 'To Top of Deck', options: ['m-hand', 'm-field', 'st-field', 'non-extra', 'v-grave', 'v-removed', 'v-excavate', 'non-deck'], onClick: function () { app.manualControls.manualToTopOfDeck(); } },

        { text: 'To Opponents Hand', options: ['filtered', 'm-hand', 'm-field', 'st-field', 'non-extra'], onClick: function () { app.manualControls.manualToOpponentsHand(); } },
        { text: 'To Opponents Field', options: ['filtered', 'm-hand', 'm-field', 'st-field', 'v-deck ', 'v-extra', 'v-grave', 'v-excavate', 'v-removed'], onClick: function () { app.manualControls.manualToOpponent(); } },
        { text: 'Reveal', options: ['m-hand', 'v-extra', 'v-excavate'], onClick: function () { app.manualControls.manualRevealHandSingle(); } },
        { text: 'Banish', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'], onClick: function () { app.manualControls.manualToRemoved(); } },
        { text: 'Banish Face-down', options: ['filtered', 'm-hand', 'm-field', 'st-field', 'v-deck', 'v-extra', 'v-grave', 'v-excavate'], onClick: function () { app.manualControls.manualToRemovedFacedown(); } },

        { text: 'To GY', options: ['m-hand', 'm-field', 'st-field', 'v-deck', 'v-removed', 'v-extra', 'v-excavate', 'non-grave'], onClick: function () { app.manualControls.manualToGrave(); } },

        { text: 'Set in S/T', options: ['m-hand-st', 'm-monster-st', 'm-st-monster', 'non-deck', 'non-banished'], onClick: function () { app.manualControls.startSpellTargeting('set'); } },
        { text: 'Activate', options: ['m-hand-st'], onClick: function () { app.manualControls.startSpellTargeting('activate'); } },

        { text: 'To Hand', options: ['m-field', 'st-field', 'non-extra'], onClick: function () { app.manualControls.manualToHand(); } },
        {
            text: 'Reveal and Add to Hand', options: ['v-deck', 'v-grave', 'v-removed', 'v-excavate', 'v-extra-p non-extra'],
            onClick: function () { app.manualControls.manualToHand(); app.manualControls.manualRevealHandSingle(); }
        },

        { text: 'To Extra Deck Face-up', options: ['m-hand-p', 'm-monster-p', 'm-monster-to-extra-faceup'], onClick: function () { app.manualControls.manualToExtraFaceUp(); } },
        { text: 'To Extra Deck', options: ['m-monster-extra', 'v-monster-extra'], onClick: function () { app.manualControls.manualToExtra(); } },

        { text: 'SS in Defense', options: ['m-hand-m', 'v-extra'], onClick: function () { app.manualControls.startSpecialSummon('def'); } },
        { text: 'SS in Attack', options: ['m-hand-m', 'v-extra'], onClick: function () { app.manualControls.startSpecialSummon('atk'); } },
        { text: 'Set Monster', options: ['m-hand-m', 'non-grave non-excavate', 'non-banished', 'non-deck'], onClick: function () { app.manualControls.startSpecialSummon('normaldef'); } },
        { text: 'Normal Summon', options: ['m-hand-m', 'non-grave', 'non-banished', 'non-deck'], onClick: function () { app.manualControls.startSpecialSummon('normalatk'); } },

        { text: 'Activate Field Spell', options: ['m-hand-f'], onClick: function () { app.manualControls.manualActivateFieldSpell(); } },
        { text: 'Set Field Spell', options: ['m-hand-f'], onClick: function () { app.manualControls.manualActivateFieldSpellFaceDown(); } },

        { text: 'Flip Face-down', options: ['m-st'], onClick: function () { app.manualControls.manualSTFlipDown(); } },
        { text: 'Flip Face-up', options: ['m-st'], onClick: function () { app.manualControls.manualActivate(); } },
        { text: 'Move', options: ['m-monster', 'm-st'], onClick: function () { app.manualControls.startSpecialSummon('generic'); } },

        { text: 'Add Counter', options: ['filtered', 'm-monster', 'm-st', 'countercontroller'], onClick: function () { app.manualControls.manualAddCounter(); } },
        { text: 'Remove Counter', options: ['filtered', 'm-monster', 'm-st', 'countercontroller'], onClick: function () { app.manualControls.manualRemoveCounter(); } },
        { text: 'View Xyz Materials', options: ['m-monster-xyz'], onClick: function () { app.manualControls.manualViewXYZMaterials(); } },
        { text: 'Overlay', options: ['m-monster', 'm-monster-xyz', 'v-monster-xyz'], onClick: function () { app.manualControls.startXYZSummon(); } },
        { text: 'Flip Face-up', options: ['m-monster', 'toDefence'], onClick: function () { app.manualControls.manualToFaceUpDefence(); } },
        { text: 'Flip Face-down', options: ['m-monster'], onClick: function () { app.manualControls.manualToFaceDownDefence(); } },
        { text: 'To Attack', options: ['m-monster'], onClick: function () { app.manualControls.manualToAttack(); } },
        { text: 'To Defense', options: ['m-field', 'toDefence'], onClick: function () { app.manualControls.manualToDefence(); } },
        { text: 'Remove Token', options: ['m-monster-token'], onClick: function () { app.manualControls.manualRemoveToken(); } },
        { text: 'To Left Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'], onClick: function () { app.manualControls.manualToPZoneL(); } },
        { text: 'To Right Pendulumn Zone', options: ['m-hand-p', 'm-monster-p'], onClick: function () { app.manualControls.manualToPZoneR(); } },
        { text: 'Send to Deck Face-up', options: ['filtered', 'm-parasite'], onClick: function () { app.manualControls.manualSendToDeckFaceup(); } },

        { text: 'Attack', options: ['a-field'], onClick: function () { app.manualControls.startAttack(); } },
        { text: 'Attack Directly', options: ['a-field'], onClick: function () { app.manualControls.manualAttackDirectly(); } },

        { text: 'Signal Effect', options: ['m-field', 'st-field', 'm-hand-m', 'v-grave', 'v-removed'], onClick: function () { app.manualControls.manualSignalEffect(); } }
    ], elements = buttons.filter((button) => {
        return enabledClasses.some((prospect) => {
            return button.options.includes(prospect);
        });
    }).filter((button) => {
        return disabledClasses.every((prospect) => {
            return !button.options.includes(prospect);
        });
    }).map((button, i) => {
        const buttonClassName = button.options.join(' ');

        return (
            <ControlActionButton
                key={`mbutton${i}`}
                className={buttonClassName}
                onClick={button.onClick}
                style={{
                    width: 'auto',
                    textAlign: 'center'
                }}
                text={button.text}
            />
        );
    }).reverse();

    return (
        <FloatingControlPanel
            coords={controller.info.coords}
            className={controller.state.filter ? 'button-filter' : 'no-button-filter'}
        >
            {elements}
        </FloatingControlPanel>
    );
}

export function manualDisplayControls(controller, query) {
    // https://github.com/SalvationDevelopment/YGOSalvation-Server/blob/55e4f846c824d1718e9297de12ca46c6df9b6477/http/js/http-manual.js
    const enabledClasses = [],
        disabledClasses = [];

    if (query.location === 'GRAVE') {
        if (query.status === 'revealed') {
            enabledClasses.push('m-hand');
            if (monsterMap[query.type]) {
                enabledClasses.push('m-hand-m');
            }
            if ((stMap[query.type]
                || query.type === 2
                || query.type === 4
                || checksetcode(query, 151)
                || query.id === 9791914
                || query.id === 58132856) && !fieldspell[query.type]) {
                enabledClasses.push('m-hand-st');
            }
            if (fieldspell[query.type]) {
                enabledClasses.push('m-hand-f');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
                enabledClasses.push('m-monster-p');
            }
            disabledClasses.push('non-grave');
        } else {
            enabledClasses.push('m-grave');
        }
        if (cardIs('link', query)) {
            disabledClasses.push('spdef');
        }
        if (pendulumMap[query.type]) {
            enabledClasses.push('m-monster-p');
        }
    }
    if (query.location === 'MONSTERZONE') {
        enabledClasses.push('m-opponent');
        enabledClasses.push('m-field');
        enabledClasses.push('m-monster');
        if (cardIs('fusion', query) || cardIs('synchro', query) || cardIs('xyz', query) || cardIs('link', query)) {
            enabledClasses.push('m-monster-extra');
        }
        if (!(cardIs('fusion', query) || cardIs('synchro', query) || cardIs('xyz', query) || cardIs('link', query))) {
            enabledClasses.push('non-extra');
        }
        if (pendulumMap[query.type]) {
            enabledClasses.push('m-monster-p');
        }
        if (cardIs('xyz', query)) {
            enabledClasses.push('m-monster-xyz');
        }
        if (!excludeTokens(query)) {
            enabledClasses.push('m-monster-token');
            disabledClasses.push('non-extra', 'm-monster-xyz', 'non-deck', 'non-banish', 'non-hand', 'overlayStack', 'flipDownMonster', 'banishcardfd', 'non-grave');
        }
        if (checksetcode(query, 151) || query.id === 9791914 || query.id === 58132856) {
            enabledClasses.push('m-st-monster');
        }
        if (query.id === 27911549) {
            enabledClasses.push('m-parasite');
        }
        if (query.position === 'FaceUpAttack') {
            enabledClasses.push('m-monster');

        }
        if (cardIs('link', query)) {
            disabledClasses.push('toDefence', 'flipUpMonster', 'flipDownMonster', 'flipDown');
        }
        if (query.position === 'FaceUpDefence') {


            disabledClasses.push('toDefence', 'flipUpMonster');
        }
        if (!query.counters) {
            disabledClasses.push('#removeCounter');
        }
    }
    if (query.location === 'SPELLZONE') {
        enabledClasses.push('st-field');
        if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
            enabledClasses.push('m-st');
        }
        if (query.id === 62966332) {
            enabledClasses.push('m-convulse');
        }
        if (query.id === 63571750) {
            enabledClasses.push('m-pharaohstreasure');
        }
        if (pendulumMap[query.type]) {
            enabledClasses.push('m-monster-to-extra-faceup');
        }
    }

    if (query.location === 'EXCAVATED') {
        if (query.status === 'revealed') {
            enabledClasses.push('m-hand');
            if (monsterMap[query.type]) {
                enabledClasses.push('m-hand-m');
            }
            if ((stMap[query.type]
                || query.type === 2
                || query.type === 4
                || checksetcode(query, 151)
                || query.id === 9791914
                || query.id === 58132856) && !fieldspell[query.type]) {
                enabledClasses.push('m-hand-st');
            }
            if (fieldspell[query.type]) {
                enabledClasses.push('m-hand-f');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
                enabledClasses.push('m-monster-p');
            }
        } else {
            enabledClasses.push('m-excavated');
        }
    }
    if (query.location === 'EXTRA') {
        if (query.status === 'revealed') {
            enabledClasses.push('v-removed');
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
                enabledClasses.push('m-monster-p');

            }
            if (monsterMap[query.type]) {
                enabledClasses.push('m-hand-m');
            }
            if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
                enabledClasses.push('m-hand-st');
            }
            if (fieldspell[query.type]) {
                enabledClasses.push('m-hand-f');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
            }
            if (cardIs('fusion', query) || cardIs('synchro', query) || cardIs('xyz', query) || cardIs('link', query)) {
                enabledClasses.push('v-monster-extra');
            }
        } else {
            enabledClasses.push('m-extra-view');
            enabledClasses.push('m-extra');
            if (cardIs('link', query)) {
                // remove defense option.
            }
        }
    }
    if (query.location === 'BANISHED') {
        if (query.status === 'revealed') {
            enabledClasses.push('v-removed');
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
                enabledClasses.push('m-monster-p');

            }
            if (monsterMap[query.type]) {
                enabledClasses.push('m-hand-m');
            }
            if ((stMap[query.type] || query.type === 2 || query.type === 4) && !fieldspell[query.type]) {
                enabledClasses.push('m-hand-st');
            }
            if (fieldspell[query.type]) {
                enabledClasses.push('m-hand-f');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
            }
            if (cardIs('fusion', query) || cardIs('synchro', query) || cardIs('xyz', query) || cardIs('link', query)) {
                enabledClasses.push('v-monster-extra');
            } else {
                enabledClasses.push('non-extra');
            }
        } else {
            enabledClasses.push('m-excavated');
        }

    }
    if (query.location === 'DECK') {
        if (query.status === 'revealed') {
            enabledClasses.push('m-hand');
            if (monsterMap[query.type]) {
                enabledClasses.push('m-hand-m');
            }

            if ((stMap[query.type]
                || query.type === 2
                || query.type === 4
                || checksetcode(query, 151)
                || query.id === 9791914
                || query.id === 58132856) && !fieldspell[query.type]) {
                enabledClasses.push('m-hand-st');
            }
            if (fieldspell[query.type]) {
                enabledClasses.push('m-hand-f');
            }
            if (pendulumMap[query.type]) {
                enabledClasses.push('m-hand-p');
                enabledClasses.push('m-monster-p');
            }
        } else {
            enabledClasses.push('m-deck');
        }
    }
    if (query.player !== window.orientation) {
        return;
    }
    if (query.location === 'HAND') {
        enabledClasses.push('m-hand');
        if (monsterMap[query.type]) {
            enabledClasses.push('m-hand-m');
        }

        if ((stMap[query.type]
            || query.type === 2
            || query.type === 4
            || checksetcode(query, 151)
            || query.id === 9791914
            || query.id === 58132856) && !fieldspell[query.type]) {
            enabledClasses.push('m-hand-st');
        }
        if (fieldspell[query.type]) {
            enabledClasses.push('m-hand-f');
        }
        if (pendulumMap[query.type]) {
            enabledClasses.push('m-hand-p');
            enabledClasses.push('m-monster-p');
        }
    }

    return renderEnabledControlClasses(controller, enabledClasses, disabledClasses);
}

export function displayControlButtons(controller, list) {
    const elements = list.map((card) => {
        return (
            <GameplayControlButtonView
                key={`${card.type}-${card.id ?? card.uid ?? card.location}-${card.i ?? 'x'}`}
                store={controller.store}
                card={card}
                info={buttonDetails[card.type]}
                uuid={controller.state.uuid}
            />
        );
    });

    return (
        <FloatingControlPanel coords={controller.info.coords}>
            {elements}
        </FloatingControlPanel>
    );
}

export function updateControlButtons(controller, newState) {
    setControlButtonsState(controller, newState);
    controller.store.emit({
        action: 'ENABLE_PHASE',
        battlephase: (controller.state.enableBattlePhase) ? 'enableBattlePhase' : false,
        mainphase2: (controller.state.enableMainPhase2) ? 'enableMainPhase2' : false,
        endphase: (controller.state.enableEndPhase) ? 'enableEndPhase' : false
    });
    controller.store.emit({ action: 'RENDER' });
}

export function enableControlButtons(controller, query, coords) {
    setControlButtonsInfo(controller, {
        target: {
        id: query.id,
        uid: query.uid,
        index: query.index,
        location: query.location,
        type: query.type,
        player: query.player,
        pile: Boolean(query.pile),
        deck: Array.isArray(query.deck) ? query.deck : [],
        setcode: query.setcode,
        position: query.position,
        status: query.status,
        overlayMaterials: Array.isArray(query.overlayMaterials) ? query.overlayMaterials : []
        },
        coords
    });
    app.manualControls.manualActionReference = controller.info.target;
}

export function clearControlButtons(controller) {
    setControlButtonsInfo(controller, {
        target: null
    });
}

export function ControlButtonsState(store) {
    const controller = {
        store,
        state: {
            summonable_cards: [],
            spsummonable_cards: [],
            repositionable_cards: [],
            msetable_cards: [],
            ssetable_cards: [],
            activatable_cards: [],
            select_options: [],
            attackable_cards: []
        },
        info: {
            coords: {
                x: 0,
                y: 0
            },
            target: null
        }
    };

    controller.getCommandOptions = () => getControlButtonsCommandOptions(controller);
    controller.hasActionableCard = (query) => hasActionableControlCard(controller, query);
    controller.getActionableDeck = (deck = []) => getActionableDeckForControls(controller, deck);
    controller.getPileActionEntries = (deck = [], viewerSlot = getViewerSlot()) => getPileActionEntriesForControls(controller, deck, viewerSlot);
    controller.getIdleCommandPileHints = (viewerSlot = getViewerSlot()) => getIdleCommandPileHintsForControls(controller, viewerSlot);
    controller.getIdleCommandPileActionCovers = (viewerSlot = getViewerSlot()) => getIdleCommandPileActionCoversForControls(controller, viewerSlot);
    controller.getIdleCommandFieldActionCovers = (viewerSlot = getViewerSlot()) => getIdleCommandFieldActionCoversForControls(controller, viewerSlot);
    controller.hide = () => hideControlZones(controller);
    controller.renderEnabledClasses = (enabledClasses, disabledClasses) => renderEnabledControlClasses(controller, enabledClasses, disabledClasses);
    controller.manualDisplay = (query) => manualDisplayControls(controller, query);
    controller.display = (list) => displayControlButtons(controller, list);
    controller.update = (newState) => updateControlButtons(controller, newState);
    controller.enable = (query, coords) => enableControlButtons(controller, query, coords);
    controller.clear = () => clearControlButtons(controller);

    return controller;
}


export function ControlButtons(store) {
    return ControlButtonsState(store);
}
