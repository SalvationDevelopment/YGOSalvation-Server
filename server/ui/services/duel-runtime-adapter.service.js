import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import ManualControls from './manual';
import { createLobbyScreen } from '../components/duel/lobby.component';
import { ChoiceScreen } from '../components/duel/choice.component';
import { appendSideChatMessage, SideChat } from '../components/duel/sidechat.component';
import { DuelScreen } from '../components/duel/duel.component';
import { triggerSelectPositionDialog } from '../components/duel/position.component';
import { triggerYesNoDialog } from '../components/duel/yesno.component';
import { triggerSelectAttributesDialog } from '../components/duel/attribute.component';
import { triggerAnnounceCardDialog } from '../components/duel/announce.card.component';
import { triggerSelectOptionDialog } from '../components/duel/select.option.component';
import { defaultDuelFieldDomEffectsService } from './duel-field-dom-effects.service';
import DuelRuntimeRoot from '../components/duel/runtime.root.component';

const initialLobbyState = Object.freeze({
    player: [{}, {}],
    decks: [],
    automatic: 'Automatic',
    ranked: 'Casual',
    banlist: 'Loading...',
    allowedCardsLabel: 'OCG / TCG',
    mode: 'Single',
    startingLP: 8000
});

function getStorageValue(key) {
    if (typeof localStorage === 'undefined' || !key) {
        return undefined;
    }

    if (typeof localStorage.getItem === 'function') {
        return localStorage.getItem(key) ?? undefined;
    }

    return localStorage[key];
}

function logTransport(logger, message, payload) {
    if (typeof logger?.log === 'function') {
        logger.log(message, payload);
        return;
    }

    console.log(message, payload);
}

export function createLegacySocketTransport(url, dependencies = {}) {
    const WebSocketImpl = dependencies.WebSocketImpl || globalThis.WebSocket;

    if (typeof WebSocketImpl !== 'function') {
        throw new Error('WebSocket transport is unavailable.');
    }

    const logger = dependencies.logger || console,
        socket = new WebSocketImpl(url),
        openState = Number(WebSocketImpl.OPEN ?? 1),
        adapter = {
            raw: socket,
            proxyReady: false,
            on(event, handler) {
                if (event === 'data') {
                    socket.addEventListener('message', (messageEvent) => {
                        let data;
                        try {
                            data = JSON.parse(messageEvent.data);
                        } catch (_error) {
                            return;
                        }
                        handler(data);
                    });
                    return;
                }

                socket.addEventListener(event, handler);
            },
            write(payload) {
                if (socket.readyState !== openState) {
                    logTransport(logger, '[ygopro/ws] drop outgoing packet because socket is not open', {
                        readyState: socket.readyState,
                        payload
                    });
                    return;
                }
                const packet = (adapter.proxyReady
                    && payload?.action
                    && payload.action !== 'proxy_connect'
                    && payload.action !== 'proxy_disconnect')
                    ? {
                        action: 'proxy_message',
                        payload
                    }
                    : payload;
                logTransport(logger, '[ygopro/ws] outgoing packet', {
                    proxyReady: adapter.proxyReady,
                    payload,
                    packet
                });
                socket.send(JSON.stringify(packet));
            },
            close() {
                adapter.proxyReady = false;
                socket.close();
            }
        };

    return adapter;
}

export function createDuelRuntimeAdapter(context, services, dependencies = {}) {
    const { dialogService, passiveService } = services,
        RuntimeRootComponent = dependencies.RuntimeRootComponent || DuelRuntimeRoot,
        rootFactory = dependencies.createRoot || createRoot,
        flush = dependencies.flushSync || flushSync,
        createChat = dependencies.createChat || ((store) => SideChat(store)),
        createChoice = dependencies.createChoice || ((store, chat) => ChoiceScreen(store, chat)),
        createLobby = dependencies.createLobby || ((store, chat) => createLobbyScreen(store, chat, null)),
        createDuel = dependencies.createDuel || ((store, chat, databaseSystem) => DuelScreen(store, chat, databaseSystem)),
        createManualControls = dependencies.createManualControls || ((store, ws) => new ManualControls(store, ws)),
        createSocketTransport = dependencies.createSocketTransport || ((url) => createLegacySocketTransport(url, dependencies)),
        openSelectPositionDialogImpl = dependencies.openSelectPositionDialog || triggerSelectPositionDialog,
        openYesNoDialogImpl = dependencies.openYesNoDialog || triggerYesNoDialog,
        openSelectAttributesDialogImpl = dependencies.openSelectAttributesDialog || triggerSelectAttributesDialog,
        openAnnounceCardDialogImpl = dependencies.openAnnounceCardDialog || triggerAnnounceCardDialog,
        openSelectOptionDialogImpl = dependencies.openSelectOptionDialog || triggerSelectOptionDialog,
        fieldDomEffectsService = dependencies.fieldDomEffectsService || defaultDuelFieldDomEffectsService,
        logger = dependencies.logger || console;

    function withDuelController(callback, fallback = false) {
        const duel = context.uiRuntimeState.duel;

        if (!duel) {
            return fallback;
        }

        return callback(duel);
    }

    function setMode(mode) {
        context.uiRuntimeState.mode = mode;
        return mode;
    }

    function updateLobby(patch) {
        context.uiRuntimeState.lobby?.update?.(patch);
        return Boolean(context.uiRuntimeState.lobby);
    }

    function appendChatMessage(message) {
        appendSideChatMessage(context.uiRuntimeState.chat, message);
        return Boolean(context.uiRuntimeState.chat);
    }

    function setOrientation(slot) {
        context.uiRuntimeState.orientation = slot;
        if (typeof window !== 'undefined') {
            window.orientation = slot;
        }
        updateLobby({ slot });
        return slot;
    }

    function updateChoiceState(update) {
        if (!context.uiRuntimeState.choice) {
            return false;
        }

        context.choiceApi.updateChoiceState(context.uiRuntimeState.choice, update);
        return true;
    }

    function setChoiceOverlayActive(active) {
        if (!context.uiRuntimeState.choice) {
            return false;
        }

        context.choiceApi.setChoiceOverlayActive(context.uiRuntimeState.choice, active);
        return true;
    }

    function showLegacyTurnChoice(message) {
        setMode('choice');
        dialogService.setQuestionPrompt('');
        updateChoiceState({
            mode: 'turn_player',
            protocol: 'legacy',
            result: undefined,
            slot: message.slot ?? 0,
            selectedAnswer: undefined
        });
        if (typeof window !== 'undefined') {
            window.verification = message.verification;
        }
    }

    function showLegacyChoice(message) {
        setMode('choice');
        dialogService.setQuestionPrompt('');

        if (!context.uiRuntimeState.choice) {
            return false;
        }

        context.choiceApi.updateChoiceState(context.uiRuntimeState.choice, (state) => ({
            mode: message.type,
            protocol: 'legacy',
            result: message.result,
            slot: message.slot,
            winner: message.winner,
            selectedAnswer: (message.type === 'rps' && message.result === undefined)
                ? undefined
                : state.selectedAnswer
        }));
        return true;
    }

    function showChoiceResult(modeName, contract, options = {}) {
        const choiceUpdate = {
            mode: modeName,
            protocol: options.protocol || 'ocgcore',
            result: Array.isArray(contract?.results) ? contract.results.slice() : options.result,
            slot: Number(contract?.player ?? options.slot ?? context.uiRuntimeState.orientation ?? 0),
            selectedAnswer: undefined
        };

        if (Object.prototype.hasOwnProperty.call(options, 'overlayActive')) {
            choiceUpdate.overlayActive = options.overlayActive;
        }

        if (options.runtimeMode) {
            setMode(options.runtimeMode);
        }

        if (options.clearPrompt) {
            dialogService.setQuestionPrompt('');
        }

        return updateChoiceState(choiceUpdate);
    }

    function showChoicePrompt(modeName, options = {}) {
        const choiceUpdate = {
            mode: modeName,
            protocol: options.protocol || 'ocgcore',
            result: options.result,
            slot: Number(options.slot ?? context.uiRuntimeState.orientation ?? 0),
            selectedAnswer: undefined
        };

        if (Object.prototype.hasOwnProperty.call(options, 'winner')) {
            choiceUpdate.winner = options.winner;
        }

        if (Object.prototype.hasOwnProperty.call(options, 'overlayActive')) {
            choiceUpdate.overlayActive = options.overlayActive;
        }

        setMode(options.runtimeMode || 'choice');
        if (options.clearPrompt !== false) {
            dialogService.setQuestionPrompt('');
        }

        return updateChoiceState(choiceUpdate);
    }

    function setWaiting(waiting) {
        context.lifepointApi.setLifepointWaiting(
            context.uiRuntimeState.duel?.lifepoints,
            Boolean(waiting)
        );
    }

    function disableSelection() {
        return withDuelController((duel) => {
            duel.disableSelection?.();
            return true;
        });
    }

    function idle(commands = {}) {
        return withDuelController((duel) => {
            duel.idle?.(commands);
            return true;
        });
    }

    function clearChainQuestion() {
        return withDuelController((duel) => {
            duel.clearChainQuestion?.();
            return true;
        });
    }

    function applyDuelSnapshot(message, options = {}) {
        const update = Object.assign({}, message?.info, { names: message?.names });

        if (options.clearPrompt) {
            dialogService.setQuestionPrompt('');
        }

        if (options.disableSelection) {
            disableSelection();
        }

        if (options.mode) {
            setMode(options.mode);
        }

        return withDuelController((duel) => {
            if (options.resetChainState) {
                duel.resetChainState?.();
            }
            if (options.clearField) {
                duel.clear?.();
            }
            if (message?.info || message?.names !== undefined) {
                duel.update?.(update);
            }
            if (message?.field !== undefined) {
                duel.replaceField?.(message.field);
            }
            return true;
        });
    }

    function hydrateField(field) {
        return withDuelController((duel) => {
            duel.hydrateField?.(field);
            return true;
        });
    }

    function select(query) {
        return withDuelController((duel) => {
            duel.select?.(query);
            return true;
        });
    }

    function sendQuestionAnswer(answer, uuid) {
        dialogService.setQuestionPrompt('');
        disableSelection();
        renderCurrentView();
        context.ws?.write({
            action: 'question',
            answer,
            uuid
        });
        return Boolean(context.ws);
    }

    function sendLegacyChoiceAnswer(answer) {
        context.ws?.write({
            action: 'choice',
            answer
        });
        return Boolean(context.ws);
    }

    function openReveal(cards, state = {}) {
        return withDuelController((duel) => {
            duel.reveal?.(cards, state);
            return true;
        });
    }

    function previewReveal(cards, options = {}) {
        return withDuelController((duel) => duel.previewReveal?.(cards, options), false);
    }

    function closeRevealer() {
        return withDuelController((duel) => {
            duel.closeRevealer?.();
            return true;
        });
    }

    function flashDuel(contract) {
        return withDuelController((duel) => {
            duel.flash?.(contract);
            return true;
        });
    }

    function previewCard(id) {
        const numericId = Number(id);

        if (!Number.isInteger(numericId) || numericId <= 0) {
            return false;
        }

        return flashDuel({
            id: numericId,
            mode: 'legacy_preview',
            phase: 'preview'
        });
    }

    function hoverFieldCard(query) {
        const cards = Object.values(context.uiRuntimeState.duel?.field?.state?.cards || {}),
            hoveredCard = cards.find((cardImage) =>
                cardImage?.state
                && cardImage.state.player === query?.player
                && cardImage.state.location === query?.location
                && cardImage.state.index === query?.index);

        if (!hoveredCard?.state?.id) {
            return false;
        }

        context.store.emit({
            action: 'CARD_HOVER',
            id: hoveredCard.state.id
        });
        return true;
    }

    function handleChainQuestion(options = {}, state = {}) {
        return withDuelController((duel) => {
            duel.handleChainQuestion?.(options, state);
            return true;
        });
    }

    function handleSortChainQuestion(options = {}, state = {}) {
        return withDuelController((duel) => duel.handleSortChainQuestion?.(options, state), false);
    }

    function openSelectPositionDialog(state) {
        return withDuelController((duel) => {
            openSelectPositionDialogImpl(duel, state);
            return true;
        });
    }

    function openYesNoDialog(state) {
        return withDuelController((duel) => {
            openYesNoDialogImpl(duel, state);
            return true;
        });
    }

    function openSelectAttributesDialog(state) {
        return withDuelController((duel) => {
            openSelectAttributesDialogImpl(duel, state);
            return true;
        });
    }

    function openAnnounceCardDialog(state) {
        return withDuelController((duel) => {
            openAnnounceCardDialogImpl(duel, state);
            return true;
        });
    }

    function openSelectOptionDialog(state) {
        return withDuelController((duel) => {
            openSelectOptionDialogImpl(duel, state);
            return true;
        });
    }

    function applyAnnouncementContract(contract) {
        switch (contract?.kind) {
            case 'orientation':
                setOrientation(contract.slot);
                return true;
            case 'lobby_metadata':
                updateLobby({
                    aiName: contract.aiName,
                    opponentName: contract.opponentName
                });
                return true;
            case 'opponent_turn':
                context.store.emit({
                    action: 'OPPONENT_TURN',
                    active: contract.active
                });
                return true;
            case 'waiting':
                setWaiting(true);
                return true;
            case 'flash':
                return flashDuel(contract);
            case 'phase_banner':
                return withDuelController((duel) => {
                    duel.showPhaseBanner?.(contract.text, contract.duration);
                    return true;
                });
            case 'lp_delta':
                return withDuelController((duel) => {
                    duel.pulseLifepoints?.(contract.player, contract.value, contract.tone, contract.duration);
                    return true;
                });
            case 'attack':
                return withDuelController((duel) => {
                    duel.flash?.({
                        id: contract.id,
                        sound: contract.sound,
                        source: contract.source,
                        target: contract.target
                    });
                    duel.animateAttack?.(contract.source, Array.isArray(contract.target) ? contract.target[0] : contract.target);
                    return true;
                });
            case 'battle':
                return withDuelController((duel) => {
                    duel.animateBattle?.(contract.source, Array.isArray(contract.target) ? contract.target[0] : contract.target);
                    return true;
                });
            case 'selection_event':
                return withDuelController((duel) => {
                    duel.pulseSelectionCards?.(contract.cards || [], contract.duration);
                    return true;
                });
            case 'target_event':
            case 'relation_event':
                return withDuelController((duel) => {
                    duel.pulseTargetCards?.(contract.cards || [], contract.duration);
                    return true;
                });
            case 'field_disabled':
                return withDuelController((duel) => {
                    duel.setDisabledZones?.(contract.zones || []);
                    return true;
                });
            case 'chain':
                return withDuelController((duel) => {
                    if (contract.phase === 'start' && contract.id) {
                        duel.flash?.(contract);
                        return true;
                    }
                    if (contract.phase === 'end') {
                        duel.clearChainOverlays?.();
                        return true;
                    }
                    duel.updateChainOverlay?.(contract);
                    if ((contract.phase === 'negated' || contract.phase === 'disabled') && contract.id) {
                        duel.flash?.(contract);
                    }
                    return true;
                });
            case 'shuffle':
                fieldDomEffectsService.shuffleDeck(contract.player, contract.zone);
                return true;
            case 'shuffle_set':
                contract.players.forEach((player) => {
                    fieldDomEffectsService.shuffleZone(player, contract.zone);
                });
                return true;
            case 'tag_swap':
                fieldDomEffectsService.shuffleTagSwap(contract.player, contract.zones);
                return true;
            case 'pile_reveal':
                return withDuelController((duel) => {
                    if (!duel.previewReveal?.(contract.cards || [], {
                        call: contract.call,
                        player: contract.player,
                        duration: contract.duration
                    }) && contract.cards?.[0]?.id) {
                        duel.flash?.({ id: contract.cards[0].id });
                    }
                    return true;
                });
            default:
                return false;
        }
    }

    function manualTake(message) {
        context.uiRuntimeState.manualControls?.manualTake?.(message);
        return Boolean(context.uiRuntimeState.manualControls);
    }

    function getMountRoot() {
        if (typeof document === 'undefined') {
            return null;
        }
        const mountNode = document.getElementById('main');
        if (!mountNode) {
            return null;
        }

        if (!context.root) {
            context.root = rootFactory(mountNode);
        }

        return context.root;
    }

    function renderCurrentView() {
        const mountRoot = getMountRoot();
        if (!mountRoot || !context.uiRuntimeState.lobby || !context.uiRuntimeState.chat || !context.uiRuntimeState.choice) {
            return;
        }

        flush(() => {
            mountRoot.render(
                <RuntimeRootComponent
                    mode={context.uiRuntimeState.mode}
                    duel={context.uiRuntimeState.duel}
                    choice={context.uiRuntimeState.choice}
                    lobby={context.uiRuntimeState.lobby}
                    questionPrompt={context.questionState.prompt}
                />
            );
        });
    }

    function hydrateRuntime() {
        context.uiRuntimeState.chat = createChat(context.store);
        context.uiRuntimeState.choice = createChoice(context.store, context.uiRuntimeState.chat);
        context.uiRuntimeState.lobby = createLobby(context.store, context.uiRuntimeState.chat);
        context.uiRuntimeState.duel = createDuel(context.store, context.uiRuntimeState.chat, context.databaseSystem);
        dialogService.setQuestionPrompt('');

        context.uiRuntimeState.lobby.update({ ...initialLobbyState });

        context.app.duel = context.uiRuntimeState.duel;
        context.app.lobby = context.uiRuntimeState.lobby;
    }

    function handleIncomingAction(message) {
        switch (message.action) {
            case 'proxy':
                logTransport(logger, '[ygopro/ws] proxy status update', {
                    previous: context.ws?.proxyReady,
                    next: message.status === 'up',
                    message
                });
                if (!context.ws) {
                    break;
                }
                context.ws.proxyReady = message.status === 'up';
                if (message.status !== 'up') {
                    break;
                }
                context.ws.write({
                    action: 'register',
                    username: getStorageValue('username'),
                    session: getStorageValue('session')
                });
                break;
            case 'lobby':
                updateLobby(message.game);
                break;
            case 'registered':
                context.ws?.write({ action: 'join' });
                break;
            case 'decks':
                updateLobby({ decks: message.decks });
                break;
            case 'chat':
                appendChatMessage(message);
                break;
            case 'slot':
                setOrientation(message.slot);
                break;
            case 'turn_player':
                showLegacyTurnChoice(message);
                break;
            case 'choice':
                showLegacyChoice(message);
                break;
            case 'start':
                setMode('duel');
                dialogService.setQuestionPrompt('');
                break;
            case 'clear':
                applyDuelSnapshot({}, {
                    clearField: true,
                    clearPrompt: true,
                    mode: 'lobby',
                    resetChainState: true
                });
                break;
            case 'ygopro':
                logTransport(logger, '[ygopro/ws] duel message', message.message);
                passiveService.handleDuelAction(message.message);
                break;
            case 'error':
                logTransport(logger, '[ygopro/ws] server error', message.msg || message.error);
                break;
            default:
                break;
        }
    }

    function connect(proxyPort, roomPort) {
        const protocol = (window.location.protocol === 'https:') ? 'wss://' : 'ws://';
        context.ws = createSocketTransport(`${protocol}${window.location.hostname}:${proxyPort}`);

        if (context.uiRuntimeState.lobby) {
            context.uiRuntimeState.lobby.ws = context.ws;
        }

        context.uiRuntimeState.manualControls = createManualControls(context.store, context.ws);
        if (context.uiRuntimeState.chat) {
            context.uiRuntimeState.chat.manualControls = context.uiRuntimeState.manualControls;
        }
        context.app.manualControls = context.uiRuntimeState.manualControls;

        context.ws.on('data', (data) => {
            context.lifepointApi.setLifepointWaiting(context.uiRuntimeState.duel?.lifepoints, false);
            if (data.action) {
                handleIncomingAction(data);
            }
            renderCurrentView();
        });

        context.ws.on('open', () => {
            logTransport(logger, '[ygopro/ws] socket open', { proxyPort, roomPort });
            context.ws.write({
                action: 'proxy_connect',
                port: roomPort
            });
        });

        context.ws.on('error', (error) => {
            logTransport(logger, '[ygopro/ws] transport error', error);
        });
    }

    function dispose() {
        if (context.questionState.promptTimer) {
            clearTimeout(context.questionState.promptTimer);
            context.questionState.promptTimer = null;
        }
        if (context.uiFlowState.choiceOverlay.timer) {
            clearTimeout(context.uiFlowState.choiceOverlay.timer);
            context.uiFlowState.choiceOverlay.timer = null;
        }
        if (context.uiFlowState.incomingActions.timer) {
            clearTimeout(context.uiFlowState.incomingActions.timer);
            context.uiFlowState.incomingActions.timer = null;
        }
        context.uiFlowState.incomingActions.delayUntil = 0;
        context.uiFlowState.incomingActions.buffered = [];
        context.uiFlowState.choiceOverlay.token += 1;
        context.questionState.prompt = '';
        if (context.ws) {
            context.ws.close();
            context.ws = null;
        }
        context.uiRuntimeState.duel?.dispose?.();
        if (context.root) {
            context.root.unmount();
            context.root = null;
        }
        context.uiRuntimeState.orientation = 0;
        if (typeof window !== 'undefined') {
            window.orientation = 0;
        }
        context.uiRuntimeState.mode = 'lobby';
        context.uiRuntimeState.duel = null;
        context.uiRuntimeState.chat = null;
        context.uiRuntimeState.lobby = null;
        context.uiRuntimeState.choice = null;
        context.uiRuntimeState.manualControls = null;
        context.app.duel = null;
        context.app.lobby = null;
        context.app.manualControls = null;
        dialogService.setQuestionPrompt('');
    }

    return {
        appendChatMessage,
        applyAnnouncementContract,
        applyDuelSnapshot,
        clearChainQuestion,
        connect,
        dispose,
        disableSelection,
        flashDuel,
        handleIncomingAction,
        handleChainQuestion,
        handleSortChainQuestion,
        hydrateField,
        hydrateRuntime,
        hoverFieldCard,
        idle,
        manualTake,
        openAnnounceCardDialog,
        openReveal,
        openSelectAttributesDialog,
        openSelectOptionDialog,
        openSelectPositionDialog,
        openYesNoDialog,
        previewReveal,
        previewCard,
        renderCurrentView,
        select,
        sendLegacyChoiceAnswer,
        sendQuestionAnswer,
        setChoiceOverlayActive,
        setMode,
        setOrientation,
        setWaiting,
        showChoicePrompt,
        showChoiceResult,
        updateLobby
    };
}
