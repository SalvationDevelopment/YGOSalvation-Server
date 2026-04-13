import { hydrateDeckRecords as hydrateSavedDeckRecords } from '../util/deck-hydration';
import { createDuelRuntimeAdapter } from './duel-runtime-adapter.service';

export function createGameSetupService(context, dialogService, passiveService) {
    const duelRuntimeAdapter = createDuelRuntimeAdapter(context, {
        dialogService,
        passiveService
    });

    context.duelRuntime = duelRuntimeAdapter;

    async function loadDecksForYGOPro(database) {
        if (typeof window === 'undefined') {
            return [];
        }

        const session = localStorage.session;
        if (!session) {
            return [];
        }

        try {
            const response = await fetch(`/api/session/${session}`, {
                    cache: 'no-store'
                }),
                payload = await response.json();

            if (!payload?.success || !Array.isArray(payload?.user?.decks)) {
                return [];
            }

            return hydrateSavedDeckRecords(payload.user.decks, database);
        } catch (error) {
            console.warn('Failed to load YGOPro decks', error);
            return [];
        }
    }

    context.renderCurrentView = duelRuntimeAdapter.renderCurrentView;

    function scheduleBufferedIncomingActions() {
        if (context.uiFlowState.incomingActions.timer) {
            clearTimeout(context.uiFlowState.incomingActions.timer);
            context.uiFlowState.incomingActions.timer = null;
        }

        if (!context.uiFlowState.incomingActions.buffered.length) {
            return;
        }

        const delayMs = Math.max(0, context.uiFlowState.incomingActions.delayUntil - Date.now());
        context.uiFlowState.incomingActions.timer = setTimeout(() => {
            context.uiFlowState.incomingActions.timer = null;
            flushBufferedIncomingActions();
        }, delayMs);
    }

    function setIncomingActionDelay(durationMs) {
        const delay = Math.max(0, Number(durationMs) || 0);
        if (!delay) {
            return;
        }

        context.uiFlowState.incomingActions.delayUntil = Math.max(context.uiFlowState.incomingActions.delayUntil, Date.now() + delay);
        scheduleBufferedIncomingActions();
    }

    context.setIncomingActionDelay = setIncomingActionDelay;

    function flushBufferedIncomingActions() {
        while (context.uiFlowState.incomingActions.buffered.length && Date.now() >= context.uiFlowState.incomingActions.delayUntil) {
            duelRuntimeAdapter.handleIncomingAction(context.uiFlowState.incomingActions.buffered.shift());
        }

        duelRuntimeAdapter.renderCurrentView();

        if (context.uiFlowState.incomingActions.buffered.length) {
            scheduleBufferedIncomingActions();
        }
    }

    function registerListeners() {
        if (context.listenersRegistered) {
            return;
        }
        context.listenersRegistered = true;

        context.store.on('CHAT_ENTRY', (message) => {
            context.ws.write({
                action: 'chat',
                message: message.message
            });
        });

        context.store.on('START_CHOICE', (message) => {
            context.ws.write({
                action: 'start',
                turn_player: message.player,
                verification: window.verification
            });
        });

        dialogService.registerListeners();

        context.store.on('UPDATE_FIELD', () => {
            duelRuntimeAdapter.renderCurrentView();
        });

        context.store.on('RENDER', () => {
            duelRuntimeAdapter.renderCurrentView();
        });
    }

    async function resolveProxyPort() {
        const response = await fetch('/api/websocket-port', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Unable to fetch websocket port (${response.status})`);
        }

        const payload = await response.json(),
            port = Number(payload?.port);

        if (!Number.isFinite(port) || port <= 0) {
            throw new Error('Invalid websocket port payload');
        }

        return port;
    }

    function resolveRoomPort(room) {
        const directPort = Number(room);
        if (Number.isFinite(directPort) && directPort > 0) {
            return directPort;
        }

        if (typeof window === 'undefined') {
            return null;
        }

        const roomParam = new URLSearchParams(window.location.search).get('room'),
            parsedPort = Number(roomParam);

        if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
            return null;
        }

        return parsedPort;
    }

    async function startGame(room) {
        const roomPort = resolveRoomPort(room);

        context.uiRuntimeState.orientation = 0;
        if (typeof window !== 'undefined') {
            window.orientation = 0;
        }

        if (!roomPort) {
            duelRuntimeAdapter.renderCurrentView();
            return () => {};
        }

        context.databaseSystem = await fetch('/manifest/manifest_0-language-merged.json').then((response) => response.json());
        duelRuntimeAdapter.hydrateRuntime();
        context.uiRuntimeState.lobby.update({
            decks: await loadDecksForYGOPro(context.databaseSystem)
        });
        registerListeners();
        duelRuntimeAdapter.renderCurrentView();

        try {
            const proxyPort = await resolveProxyPort();
            duelRuntimeAdapter.connect(proxyPort, roomPort);
        } catch (error) {
            console.error(error);
        }

        return () => {
            duelRuntimeAdapter.dispose();
        };
    }

    return {
        renderCurrentView: duelRuntimeAdapter.renderCurrentView,
        startGame
    };
}
