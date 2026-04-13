import { disposeAttackAnimation, triggerAttackAnimation } from '../components/duel/attack.animation.component';
import { closeSelectAttributesDialog } from '../components/duel/attribute.component';
import { ChainerState, closeChainer, disposeChainer, handleChainerQuestion, handleChainerSortQuestion, resetChainerDuelState, triggerChainer } from '../components/duel/chain.component';
import { closeAnnounceCardDialog } from '../components/duel/announce.card.component';
import { ControlButtonsState, enableControlButtons, getActionableDeckForControls, getIdleCommandFieldActionCoversForControls, getIdleCommandPileActionCoversForControls, getIdleCommandPileHintsForControls, updateControlButtons } from '../components/duel/controls.component';
import CardInfo, { disposeCardInfo, updateCardInfo } from '../components/duel/cardinfo.component';
import { FieldState } from '../components/duel/field.component';
import { disposeFieldReveal, triggerFieldReveal } from '../components/duel/field.reveal.component';
import { closeIdleExtraDeckViewer, disposeIdleExtraDeckViewer } from '../components/duel/idle.extra.viewer.component';
import { disposeLifepointState, pulseLifepointDelta, updateLifepointState } from '../components/duel/lifepoint.component';
import { closeSelectPositionDialog } from '../components/duel/position.component';
import { disposePhaseBanner, triggerPhaseBanner } from '../components/duel/phase.banner.component';
import { closeRevealer, disposeRevealer, triggerRevealer } from '../components/duel/reveal.component';
import { closeSelectOptionDialog } from '../components/duel/select.option.component';
import { closeDeckDialog } from '../components/duel/view_decks.component';
import { disposeFlasher, triggerFlasher } from '../components/duel/anouncement.component';
import { closeYesNoDialog } from '../components/duel/yesno.component';
import { createDuelPresentationLayoutService } from './duel-presentation-layout.service';

const defaultPresentationLayoutService = createDuelPresentationLayoutService();

function createDefaultLifepointState(store) {
    return {
        store,
        state: {
            lifepoints: [8000, 8000],
            turn: 1,
            names: ['Player 1', 'Player 2'],
            lpDeltas: {
                0: null,
                1: null
            },
            playerHints: {
                0: [],
                1: []
            }
        },
        waiting: false,
        maxLifepoints: 8000
    };
}

export function createDuelScreenController(store, chat, databaseSystem, dependencies = {}) {
    const createFieldState = dependencies.createFieldState
            || ((state, nextStore, nextDatabaseSystem, fieldDependencies = {}) => FieldState(state, nextStore, nextDatabaseSystem, fieldDependencies)),
        createCardInfo = dependencies.createCardInfo || ((nextDatabaseSystem) => CardInfo(nextDatabaseSystem)),
        createChainerState = dependencies.createChainerState || ((nextStore) => ChainerState(nextStore)),
        createControlButtonsState = dependencies.createControlButtonsState || ((nextStore) => ControlButtonsState(nextStore)),
        createLifepointState = dependencies.createLifepointState || ((nextStore) => createDefaultLifepointState(nextStore)),
        presentationLayoutService = dependencies.presentationLayoutService || defaultPresentationLayoutService,
        updateCardInfoImpl = dependencies.updateCardInfo || updateCardInfo,
        updateLifepointStateImpl = dependencies.updateLifepointState || updateLifepointState,
        updateControlButtonsImpl = dependencies.updateControlButtons || updateControlButtons,
        enableControlButtonsImpl = dependencies.enableControlButtons || enableControlButtons,
        getActionableDeckForControlsImpl = dependencies.getActionableDeckForControls || getActionableDeckForControls,
        getIdleCommandPileHintsForControlsImpl = dependencies.getIdleCommandPileHintsForControls || getIdleCommandPileHintsForControls,
        getIdleCommandPileActionCoversForControlsImpl = dependencies.getIdleCommandPileActionCoversForControls || getIdleCommandPileActionCoversForControls,
        getIdleCommandFieldActionCoversForControlsImpl = dependencies.getIdleCommandFieldActionCoversForControls || getIdleCommandFieldActionCoversForControls,
        triggerFlasherImpl = dependencies.triggerFlasher || triggerFlasher,
        triggerFieldRevealImpl = dependencies.triggerFieldReveal || triggerFieldReveal,
        triggerAttackAnimationImpl = dependencies.triggerAttackAnimation || triggerAttackAnimation,
        triggerPhaseBannerImpl = dependencies.triggerPhaseBanner || triggerPhaseBanner,
        triggerRevealerImpl = dependencies.triggerRevealer || triggerRevealer,
        triggerChainerImpl = dependencies.triggerChainer || triggerChainer,
        handleChainerQuestionImpl = dependencies.handleChainerQuestion || handleChainerQuestion,
        handleChainerSortQuestionImpl = dependencies.handleChainerSortQuestion || handleChainerSortQuestion,
        resetChainerDuelStateImpl = dependencies.resetChainerDuelState || resetChainerDuelState,
        closeChainerImpl = dependencies.closeChainer || closeChainer,
        closeRevealerImpl = dependencies.closeRevealer || closeRevealer,
        closeIdleExtraDeckViewerImpl = dependencies.closeIdleExtraDeckViewer || closeIdleExtraDeckViewer,
        closeDeckDialogImpl = dependencies.closeDeckDialog || closeDeckDialog,
        closeSelectPositionDialogImpl = dependencies.closeSelectPositionDialog || closeSelectPositionDialog,
        closeSelectAttributesDialogImpl = dependencies.closeSelectAttributesDialog || closeSelectAttributesDialog,
        closeAnnounceCardDialogImpl = dependencies.closeAnnounceCardDialog || closeAnnounceCardDialog,
        closeYesNoDialogImpl = dependencies.closeYesNoDialog || closeYesNoDialog,
        closeSelectOptionDialogImpl = dependencies.closeSelectOptionDialog || closeSelectOptionDialog,
        disposeCardInfoImpl = dependencies.disposeCardInfo || disposeCardInfo,
        disposeChainerImpl = dependencies.disposeChainer || disposeChainer,
        disposeAttackAnimationImpl = dependencies.disposeAttackAnimation || disposeAttackAnimation,
        disposePhaseBannerImpl = dependencies.disposePhaseBanner || disposePhaseBanner,
        disposeFieldRevealImpl = dependencies.disposeFieldReveal || disposeFieldReveal,
        disposeFlasherImpl = dependencies.disposeFlasher || disposeFlasher,
        disposeLifepointStateImpl = dependencies.disposeLifepointState || disposeLifepointState,
        disposeRevealerImpl = dependencies.disposeRevealer || disposeRevealer,
        disposeIdleExtraDeckViewerImpl = dependencies.disposeIdleExtraDeckViewer || disposeIdleExtraDeckViewer,
        isManualMode = dependencies.isManualMode || (() => Boolean(globalThis.app?.manual)),
        fieldDependencies = dependencies.fieldDependencies || {};

    function instantiateFieldState(state = { info: {}, field: {} }) {
        return createFieldState(state, store, databaseSystem, fieldDependencies);
    }

    let field = instantiateFieldState(),
        info = createCardInfo(databaseSystem),
        chainer = createChainerState(store),
        controls = createControlButtonsState(store),
        lifepoints = createLifepointState(store),
        cleanup = () => {};

    const controller = {
        databaseSystem,
        state: {
            lastUpdate: {}
        },
        store,
        sidechat: chat
    };

    Object.defineProperties(controller, {
        field: {
            enumerable: true,
            get() {
                return field;
            },
            set(value) {
                field = value;
            }
        },
        info: {
            enumerable: true,
            get() {
                return info;
            },
            set(value) {
                info = value;
            }
        },
        chainer: {
            enumerable: true,
            get() {
                return chainer;
            },
            set(value) {
                chainer = value;
            }
        },
        controls: {
            enumerable: true,
            get() {
                return controls;
            },
            set(value) {
                controls = value;
            }
        },
        lifepoints: {
            enumerable: true,
            get() {
                return lifepoints;
            },
            set(value) {
                lifepoints = value;
            }
        },
        cleanup: {
            enumerable: true,
            get() {
                return cleanup;
            },
            set(value) {
                cleanup = typeof value === 'function' ? value : () => {};
            }
        }
    });

    function clearDuelScreen() {
        controller.field = instantiateFieldState();
        resetChainerDuelStateImpl(controller.chainer);
    }

    function handleDuelManualCardClick(event) {
        enableControlButtonsImpl(controller.controls, event.card, { x: event.x, y: event.y });
        controller.store.emit({ action: 'RENDER' });
        return event;
    }

    function handleDuelDeckCardClick(event) {
        enableControlButtonsImpl(controller.controls, event.card, { x: event.x, y: event.y });
        controller.store.emit({ action: 'RENDER' });
        return event;
    }

    function handleDuelCardClick(event) {
        const overlayMaterials = controller.field.getOverlayViewerDeck(event.card),
            controlTarget = Number(event.card?.overlayindex || 0) > 0
                ? (controller.field.getStackHost(event.card) || event.card)
                : event.card;

        if (isManualMode()) {
            return handleDuelManualCardClick(event);
        }

        if (!event.viewDeck && ['EXTRA', 'GRAVE', 'BANISHED'].includes(event.card.location)) {
            const deck = getActionableDeckForControlsImpl(
                controller.controls,
                controller.field.getDeck(event.card.player, event.card.location)
            );

            enableControlButtonsImpl(controller.controls, Object.assign({}, event.card, {
                pile: true,
                deck
            }), { x: event.x, y: event.y });
            controller.store.emit({ action: 'RENDER' });
            return event;
        }

        if (event.card.location === 'DECK') {
            return undefined;
        }

        enableControlButtonsImpl(controller.controls, Object.assign({}, controlTarget, {
            overlayMaterials
        }), { x: event.x, y: event.y });
        controller.store.emit({ action: 'RENDER' });
        return event;
    }

    function handleDuelHover(event) {
        if (event?.clear) {
            controller.field.clearRelationHighlights();
            controller.store.emit({ action: 'RENDER' });
            return null;
        }

        if (event?.card) {
            controller.field.applyRelationHighlights(event.card);
        }

        if (!event?.id) {
            controller.store.emit({ action: 'RENDER' });
            return undefined;
        }

        const description = updateCardInfoImpl(controller.info, {
            id: event.id
        });

        controller.store.emit({ action: 'RENDER' });
        return {
            id: event.id,
            description
        };
    }

    function updateDuelScreen(update) {
        updateLifepointStateImpl(controller.lifepoints, {
            lifepoints: update.lifepoints,
            turn: update.turn,
            names: update.names,
            playerHints: update.playerHints
        });
        controller.field.phase(update.phase);
    }

    function idleDuelScreen(commands) {
        updateControlButtonsImpl(controller.controls, commands);
        controller.field.setPileCommandHints(getIdleCommandPileHintsForControlsImpl(controller.controls));
        controller.field.setActionSpinners([
            ...getIdleCommandPileActionCoversForControlsImpl(controller.controls),
            ...getIdleCommandFieldActionCoversForControlsImpl(controller.controls)
        ]);
    }

    function flashDuelScreen(card) {
        const presentation = presentationLayoutService.resolveAnnouncementPresentation(controller.field, card);

        if (!presentation) {
            return;
        }

        if (presentation.type === 'pulse') {
            controller.field.pulseAnnouncementCards(presentation.cards, presentation.duration);
            return;
        }

        triggerFlasherImpl(controller.store, presentation.payload);
    }

    function previewDuelReveal(cards = [], options = {}) {
        const presentation = presentationLayoutService.resolveRevealPresentation(controller.field, cards, options);

        if (!presentation) {
            return false;
        }

        triggerFieldRevealImpl(controller.store, presentation);
        return true;
    }

    function disposeDuelScreen() {
        controller.cleanup?.();
        controller.cleanup = () => {};
        disposeCardInfoImpl(controller.info);
        disposeChainerImpl(controller.chainer);
        disposeAttackAnimationImpl(controller.store);
        disposePhaseBannerImpl(controller.store);
        disposeFieldRevealImpl(controller.store);
        disposeFlasherImpl(controller.store);
        disposeLifepointStateImpl(controller.lifepoints);
        disposeRevealerImpl(controller.store);
        disposeIdleExtraDeckViewerImpl(controller.store);
        closeSelectPositionDialogImpl(controller.store);
        closeSelectAttributesDialogImpl(controller.store);
        closeAnnounceCardDialogImpl(controller.store);
        closeYesNoDialogImpl(controller.store);
        closeSelectOptionDialogImpl(controller.store);
        controller.field?.dispose?.();
    }

    function registerDuelScreenListeners() {
        const listeners = [
            controller.store.on('CARD_HOVER', (event) => handleDuelHover(event)),
            controller.store.on('DECK_CARD_CLICK', (event) => handleDuelDeckCardClick(event)),
            controller.store.on('CARD_CLICK', (event) => handleDuelCardClick(event))
        ];

        return () => {
            listeners.forEach((unsubscribe) => {
                unsubscribe?.();
            });
        };
    }

    controller.clear = () => clearDuelScreen();
    controller.onCardClick = (event) => handleDuelCardClick(event);
    controller.onManualCardClick = (event) => handleDuelManualCardClick(event);
    controller.onDeckCardClick = (event) => handleDuelDeckCardClick(event);
    controller.onHover = (event) => handleDuelHover(event);
    controller.update = (update) => updateDuelScreen(update);
    controller.updateField = (nextField) => controller.field.updateField(nextField);
    controller.hydrateField = (nextField) => controller.field.hydrateField(nextField);
    controller.replaceField = (nextField) => controller.field.replaceField(nextField);
    controller.setDisabledZones = (zones) => controller.field.setDisabledZones(zones);
    controller.idle = (commands) => idleDuelScreen(commands);
    controller.flash = (card) => flashDuelScreen(card);
    controller.reveal = (cards, state = {}) => triggerRevealerImpl(controller.store, { active: true, cards, ...state });
    controller.chain = (cards, state = {}) => triggerChainerImpl(controller.chainer, { active: true, cards, ...state });
    controller.handleChainQuestion = (options = {}, state = {}) => handleChainerQuestionImpl(controller.chainer, options, state);
    controller.handleSortChainQuestion = (options = {}, state = {}) => handleChainerSortQuestionImpl(controller.chainer, options, state);
    controller.clearChainQuestion = () => closeChainerImpl(controller.chainer);
    controller.resetChainState = () => resetChainerDuelStateImpl(controller.chainer);
    controller.closeRevealer = () => {
        closeRevealerImpl(controller.store);
        closeIdleExtraDeckViewerImpl(controller.store);
        closeDeckDialogImpl(controller.store);
    };
    controller.updateChainOverlay = (contract) => controller.field.updateChainOverlay(contract);
    controller.clearChainOverlays = () => controller.field.clearChainOverlays();
    controller.animateBattle = (source, target) => controller.field.pulseBattleOverlay(source, target);
    controller.animateAttack = (source, target, duration = 720) => {
        const animation = presentationLayoutService.resolveAttackAnimation(controller.field, source, target, duration);

        if (animation) {
            triggerAttackAnimationImpl(controller.store, animation);
        }
    };
    controller.showPhaseBanner = (text, duration) => {
        triggerPhaseBannerImpl(controller.store, {
            text,
            duration
        });
    };
    controller.previewReveal = (cards = [], options = {}) => previewDuelReveal(cards, options);
    controller.pulseLifepoints = (player, value, tone, duration) => pulseLifepointDelta(controller.lifepoints, player, value, tone, duration);
    controller.pulseSelectionCards = (cards, duration) => controller.field.pulseSelectionCards(cards, duration);
    controller.pulseTargetCards = (cards, duration) => controller.field.pulseTargetCards(cards, duration);
    controller.disableSelection = () => controller.field.disableSelection();
    controller.select = (query) => controller.field.select(query);
    controller.dispose = () => disposeDuelScreen();

    controller.cleanup = registerDuelScreenListeners();

    return controller;
}
