import React from 'react';
import { emit, on, subscribe } from './listener.service';
import ManualControls from './manual';
import { createLobbyScreen, LobbyScreen } from '../components/duel/lobby.component';
import { ChoiceScreen, setChoiceOverlayActive, updateChoiceState } from '../components/duel/choice.component';
import { SideChat } from '../components/duel/sidechat.component';
import { DuelScreen } from '../components/duel/duel.component';
import Field from '../components/duel/field.component';
import CardInfo from '../components/duel/cardinfo.component';
import Flasher from '../components/duel/anouncement.component';
import Revealer from '../components/duel/reveal.component';
import { ControlButtons } from '../components/duel/controls.component';
import LifepointDisplay, { setLifepointWaiting } from '../components/duel/lifepoint.component';
import SelectPosition from '../components/duel/position.component';
import DeckDialog from '../components/duel/view_decks.component';
import YesNoDialog from '../components/duel/yesno.component';
import SelectAttributes from '../components/duel/attribute.component';
import AnnounceCardDialog from '../components/duel/announce.card.component';
import Chainer from '../components/duel/chain.component';
import ExtraControls from '../components/duel/extracontrols.component';
import PhaseIndicator from '../components/duel/phases.component';
import FieldSelector from '../components/duel/field.selection.component';
import ZoneSelector from '../components/duel/zone.selection.component';
import SelectOptionDialog from '../components/duel/select.option.component';
import { CardImage } from '../components/common/card.component';
import { createGameDialogService } from './game-dialog.service';
import { createPassiveGameStateService } from './game-passive-state.service';
import { createGameSetupService } from './game-setup.service';

const store = { emit, on, subscribe };

const uiRuntimeState = {
    duel: null,
    chat: null,
    lobby: null,
    choice: null,
    manualControls: null,
    mode: 'lobby',
    orientation: 0
};

const questionState = {
    id: undefined,
    command: undefined,
    min: 0,
    max: 0,
    options: {},
    selection: [],
    counterAllocations: [],
    counterTarget: 0,
    prompt: '',
    promptTimer: null,
    signature: null,
    answerPending: false
};

const uiFlowState = {
    choiceOverlay: {
        timer: null,
        token: 0
    },
    incomingActions: {
        delayUntil: 0,
        timer: null,
        buffered: []
    }
};

const app = {
    manual: false,
    duel: null,
    lobby: null,
    manualControls: null,
    refreshUI: () => context.renderCurrentView(),
    surrender: () => {
        if (!context.ws) {
            return;
        }
        context.ws.write({
            action: 'surrender',
            slot: context.uiRuntimeState.orientation || 0
        });
    }
};

const context = {
    store,
    app,
    root: null,
    ws: null,
    databaseSystem: [],
    listenersRegistered: false,
    uiRuntimeState,
    questionState,
    uiFlowState,
    renderCurrentView: () => {},
    setIncomingActionDelay: () => {},
    choiceApi: {
        setChoiceOverlayActive,
        updateChoiceState
    },
    lifepointApi: {
        setLifepointWaiting
    }
};

const localOrient = (player, currentOrientation = context.uiRuntimeState.orientation) =>
    currentOrientation ? (player ? 0 : 1) : player;

const dialogService = createGameDialogService(context, {
    orient: localOrient
});
const passiveService = createPassiveGameStateService(context, dialogService);
const game = createGameSetupService(context, dialogService, passiveService);

Object.assign(globalThis, {
    React,
    app,
    Field,
    CardInfo,
    SideChat,
    LobbyScreen,
    DuelScreen,
    ChoiceScreen,
    ManualControls,
    PhaseIndicator,
    FieldSelector,
    ZoneSelector,
    CardImage,
    Flasher,
    Revealer,
    ControlButtons,
    LifepointDisplay,
    SelectPosition,
    DeckDialog,
    YesNoDialog,
    SelectOptionDialog,
    SelectAttributes,
    AnnounceCardDialog,
    Chainer,
    ExtraControls,
    createLobbyScreen
});

export default async function createGame(room) {
    return game.startGame(room);
}
