import Field from '../components/duel/field.component';
import { resolveDuelMessageName } from './game-dialog.service';

const duelSoundFiles = Object.freeze({
    activate: '/sounds/activate.wav',
    attack: '/sounds/attack.wav',
    coinflip: '/sounds/coinflip.wav',
    diceroll: '/sounds/diceroll.wav',
    equip: '/sounds/equip.wav',
    flip: '/sounds/flip.wav',
    soundactivateCard: '/sounds/activate.wav',
    soundattack: '/sounds/attack.wav',
    soundequip: '/sounds/equip.wav',
    soundflipSummon: '/sounds/flip.wav',
    soundspecialSummonFromExtra: '/sounds/specialsummon.wav',
    soundsummonCard: '/sounds/summon.wav',
    specialsummon: '/sounds/specialsummon.wav',
    summon: '/sounds/summon.wav'
});

export function createPassiveGameStateService(context, dialogService) {
    const soundCache = new Map();

    function getDuelRuntime() {
        return context.duelRuntime || null;
    }

    function orient(player, currentOrientation = context.uiRuntimeState.orientation) {
        return currentOrientation ? (player ? 0 : 1) : player;
    }

    function orientFieldQuery(query, currentOrientation = context.uiRuntimeState.orientation) {
        if (!query || typeof query !== 'object') {
            return null;
        }

        return {
            ...query,
            player: orient(Number(query.player || 0), currentOrientation)
        };
    }

    function orientFieldQueryList(cards, currentOrientation = context.uiRuntimeState.orientation) {
        return Array.isArray(cards)
            ? cards.map((card) => orientFieldQuery(card, currentOrientation)).filter(Boolean)
            : [];
    }

    function orientFieldCoordinate(query, currentOrientation = context.uiRuntimeState.orientation) {
        if (!query || typeof query !== 'object') {
            return null;
        }

        const player = Number(query.player),
            index = Number(query.index);

        if (!Number.isInteger(player) || typeof query.location !== 'string' || !Number.isInteger(index)) {
            return null;
        }

        const output = {
            player: orient(player, currentOrientation),
            location: query.location,
            index
        };

        if (Number.isInteger(Number(query.overlay_sequence))) {
            output.overlay_sequence = Number(query.overlay_sequence);
        }

        if (Number.isInteger(Number(query.overlayindex))) {
            output.overlayindex = Number(query.overlayindex);
        }

        return output;
    }

    function orientRevealCards(cards, currentOrientation = context.uiRuntimeState.orientation) {
        return Array.isArray(cards)
            ? cards.map((card) => ({
                ...card,
                player: Number.isInteger(Number(card?.player))
                    ? orient(Number(card.player), currentOrientation)
                    : card?.player
            }))
            : [];
    }

    function resolvePhaseBannerText(phase) {
        const normalized = String(phase ?? '').toUpperCase(),
            labels = {
                0: 'Draw Phase',
                1: 'Standby Phase',
                2: 'Main Phase 1',
                3: 'Battle Phase',
                4: 'Main Phase 2',
                5: 'End Phase',
                DRAW: 'Draw Phase',
                PHASE_DRAW: 'Draw Phase',
                STANDBY: 'Standby Phase',
                PHASE_STANDBY: 'Standby Phase',
                MAIN1: 'Main Phase 1',
                MAIN_1: 'Main Phase 1',
                PHASE_MAIN1: 'Main Phase 1',
                BATTLE: 'Battle Phase',
                BATTLE_START: 'Battle Phase',
                PHASE_BATTLE_START: 'Battle Phase',
                MAIN2: 'Main Phase 2',
                MAIN_2: 'Main Phase 2',
                PHASE_MAIN2: 'Main Phase 2',
                END: 'End Phase',
                PHASE_END: 'End Phase'
            };

        return labels[normalized] || labels[phase] || 'Phase';
    }

    function resolveSoundFile(name) {
        if (typeof name !== 'string' || !name.length) {
            return null;
        }

        return duelSoundFiles[name] || null;
    }

    function playUiSound(name) {
        const src = resolveSoundFile(name);
        if (!src || typeof window === 'undefined' || typeof window.Audio !== 'function') {
            return;
        }

        let audio = soundCache.get(src);
        if (!audio) {
            audio = new window.Audio(src);
            soundCache.set(src, audio);
        }

        try {
            audio.currentTime = 0;
            const playback = audio.play?.();
            if (playback && typeof playback.catch === 'function') {
                playback.catch(() => {});
            }
        } catch (_error) {
            // Ignore blocked autoplay or unavailable audio devices in test environments.
        }
    }

    function showChoiceResultOverlay(contract, modeName) {
        const duelRuntime = getDuelRuntime();

        if (!duelRuntime) {
            return;
        }

        if (context.uiFlowState.choiceOverlay.timer) {
            clearTimeout(context.uiFlowState.choiceOverlay.timer);
            context.uiFlowState.choiceOverlay.timer = null;
        }

        context.uiFlowState.choiceOverlay.token += 1;
        const overlayToken = context.uiFlowState.choiceOverlay.token;

        duelRuntime.showChoiceResult(modeName, contract, {
            overlayActive: true
        });

        const duration = Math.max(0, Number(contract?.duration || 1500) || 1500);
        context.uiFlowState.choiceOverlay.timer = setTimeout(() => {
            if (overlayToken !== context.uiFlowState.choiceOverlay.token) {
                return;
            }

            duelRuntime.setChoiceOverlayActive(false);
            context.uiFlowState.choiceOverlay.timer = null;
            context.renderCurrentView();
        }, duration);
    }

    function resolveAnnouncementContract(message, currentOrientation = 0) {
        function resolveSummonMode(command) {
            switch (command) {
                case 'MSG_SUMMONING':
                case 'MSG_SUMMONED':
                    return 'summon';
                case 'MSG_SPSUMMONING':
                case 'MSG_SPSUMMONED':
                    return 'special_summon';
                case 'MSG_FLIPSUMMONING':
                case 'MSG_FLIPSUMMONED':
                    return 'flip_summon';
                default:
                    return 'summon';
            }
        }

        function resolveSummonSound(command) {
            switch (command) {
                case 'MSG_SUMMONING':
                    return 'summon';
                case 'MSG_SPSUMMONING':
                    return 'specialsummon';
                case 'MSG_FLIPSUMMONING':
                    return 'flip';
                default:
                    return undefined;
            }
        }

        function resolveFieldCoordinate(query) {
            return orientFieldCoordinate(query, currentOrientation);
        }

        switch (resolveDuelMessageName(message, message.command)) {
            case 'MSG_AI_NAME': {
                const aiName = message?.ai_name || message?.name || message?.opponent_name || 'AI';
                return {
                    kind: 'lobby_metadata',
                    aiName,
                    opponentName: aiName
                };
            }
            case 'MSG_SHOW_HINT':
                return {
                    kind: 'notice',
                    text: message?.text || message?.hint || '',
                    duration: Number(message?.duration || 1800),
                    log: true,
                    logLabel: 'MSG_SHOW_HINT'
                };
            case 'MSG_CUSTOM_MSG':
                return {
                    kind: 'notice',
                    text: message?.text || 'Custom duel message received.',
                    duration: Number(message?.duration || 1800),
                    log: true,
                    logLabel: 'MSG_CUSTOM_MSG'
                };
            case 'MSG_MATCH_KILL':
                return {
                    kind: 'notice',
                    text: message?.text || 'Match kill effect registered',
                    duration: Number(message?.duration || 1600),
                    log: true,
                    logLabel: 'MSG_MATCH_KILL'
                };
            case 'MSG_NEW_TURN':
                return {
                    kind: 'phase_banner',
                    bannerType: 'turn',
                    text: `Turn ${Number(message?.turn || 0) || 1}`,
                    duration: Number(message?.duration || 1400)
                };
            case 'MSG_NEW_PHASE':
                return {
                    kind: 'phase_banner',
                    bannerType: 'phase',
                    text: resolvePhaseBannerText(message?.gui_phase ?? message?.phase),
                    duration: Number(message?.duration || 1400)
                };
            case 'MSG_ORIENTATION':
                return { kind: 'orientation', slot: message.slot };
            case 'MSG_OPPONENT_TURN':
                return { kind: 'opponent_turn', active: Boolean(message.active) };
            case 'MSG_WAITING':
                return { kind: 'waiting' };
            case 'MSG_SUMMONING':
            case 'MSG_SPSUMMONING':
            case 'MSG_FLIPSUMMONING':
            case 'MSG_SUMMONED':
            case 'MSG_SPSUMMONED':
            case 'MSG_FLIPSUMMONED': {
                const command = resolveDuelMessageName(message, message.command),
                    contract = {
                        kind: 'flash',
                        mode: resolveSummonMode(command),
                        phase: command.endsWith('ED') ? 'complete' : 'start',
                        id: message.id,
                        source: resolveFieldCoordinate(message?.source || message)
                    };

                if (command.endsWith('ED')) {
                    contract.confirmation = true;
                }

                if (resolveSummonSound(command)) {
                    contract.sound = resolveSummonSound(command);
                }

                return contract;
            }
            case 'MSG_CHAINING':
                return {
                    kind: 'chain',
                    mode: 'activate',
                    phase: 'start',
                    chainIndex: Number(message?.chain_size || 0),
                    id: message?.id,
                    source: resolveFieldCoordinate(message?.source || message),
                    sound: 'activate'
                };
            case 'MSG_CHAINED':
            case 'MSG_CHAIN_SOLVING':
            case 'MSG_CHAIN_SOLVED':
            case 'MSG_CHAIN_NEGATED':
            case 'MSG_CHAIN_DISABLED':
                return {
                    kind: 'chain',
                    mode: resolveDuelMessageName(message, message.command) === 'MSG_CHAIN_NEGATED' || resolveDuelMessageName(message, message.command) === 'MSG_CHAIN_DISABLED'
                        ? 'negated'
                        : 'activate',
                    phase: ({
                        MSG_CHAINED: 'queued',
                        MSG_CHAIN_SOLVING: 'solving',
                        MSG_CHAIN_SOLVED: 'solved',
                        MSG_CHAIN_NEGATED: 'negated',
                        MSG_CHAIN_DISABLED: 'disabled'
                    })[resolveDuelMessageName(message, message.command)],
                    chainIndex: Number(message?.chain_size || 0),
                    id: message?.id,
                    source: resolveFieldCoordinate(message?.source || message)
                };
            case 'MSG_CHAIN_END':
                return { kind: 'chain', phase: 'end' };
            case 'MSG_CARD_SELECTED':
            case 'MSG_RANDOM_SELECTED':
                return {
                    kind: 'selection_event',
                    phase: resolveDuelMessageName(message, message.command) === 'MSG_RANDOM_SELECTED' ? 'random_selected' : 'card_selected',
                    cards: orientFieldQueryList(message?.cards, currentOrientation),
                    duration: Number(message?.duration || (resolveDuelMessageName(message, message.command) === 'MSG_RANDOM_SELECTED' ? 650 : 900))
                };
            case 'MSG_ATTACK':
                return {
                    kind: 'attack',
                    id: message?.source?.code || message?.source?.id || message?.attacker?.code || message?.attacker?.id,
                    sound: message.sound,
                    source: message.source || message.attacker,
                    target: message.target || message.defender
                };
            case 'MSG_EQUIP':
                return { kind: 'sound', sound: 'equip', source: message?.source || message?.card || null, target: message?.target || null };
            case 'MSG_UNEQUIP':
                return {
                    kind: 'selection_event',
                    phase: 'unequip',
                    cards: orientFieldQueryList([message?.source || message?.card], currentOrientation),
                    duration: Number(message?.duration || 650)
                };
            case 'MSG_CARD_TARGET':
            case 'MSG_CANCEL_TARGET':
                return {
                    kind: 'target_event',
                    phase: resolveDuelMessageName(message, message.command) === 'MSG_CARD_TARGET' ? 'link' : 'unlink',
                    cards: orientFieldQueryList([message?.source || message?.card, message?.target], currentOrientation),
                    duration: Number(message?.duration || (resolveDuelMessageName(message, message.command) === 'MSG_CARD_TARGET' ? 950 : 700))
                };
            case 'MSG_BECOME_TARGET':
            case 'MSG_BE_CHAIN_TARGET': {
                const cards = orientFieldQueryList(message?.cards, currentOrientation);
                return cards.length ? {
                    kind: 'target_event',
                    phase: resolveDuelMessageName(message, message.command) === 'MSG_BECOME_TARGET' ? 'become_target' : 'chain_target',
                    cards,
                    duration: Number(message?.duration || 950)
                } : null;
            }
            case 'MSG_CREATE_RELATION':
            case 'MSG_RELEASE_RELATION': {
                const cards = Array.isArray(message?.cards) && message.cards.length ? message.cards : [message?.source || message?.card, message?.target],
                    orientedCards = orientFieldQueryList(cards, currentOrientation);
                return orientedCards.length ? {
                    kind: 'relation_event',
                    phase: resolveDuelMessageName(message, message.command) === 'MSG_CREATE_RELATION' ? 'create' : 'release',
                    cards: orientedCards,
                    duration: Number(message?.duration || (resolveDuelMessageName(message, message.command) === 'MSG_CREATE_RELATION' ? 900 : 650))
                } : null;
            }
            case 'MSG_BATTLE':
                return { kind: 'battle', source: message?.source || message?.card || null, target: message?.target || null };
            case 'MSG_ATTACK_DISABLED':
                return { kind: 'notice', text: message?.text || 'An attack was negated', duration: Number(message?.duration || 1400) };
            case 'MSG_DAMAGE':
            case 'MSG_PAY_LPCOST':
            case 'MSG_RECOVER':
            case 'MSG_LPUPDATE': {
                const delta = Number(
                    message?.delta
                    ?? (resolveDuelMessageName(message, message.command) === 'MSG_RECOVER'
                        ? Number(message?.amount || message?.lp || 0)
                        : resolveDuelMessageName(message, message.command) === 'MSG_LPUPDATE'
                            ? 0
                            : (-1 * Number(message?.amount || message?.lp || 0)))
                );
                return delta ? {
                    kind: 'lp_delta',
                    player: orient(message?.player, currentOrientation),
                    value: delta,
                    tone: resolveDuelMessageName(message, message.command) === 'MSG_RECOVER'
                        ? 'recover'
                        : resolveDuelMessageName(message, message.command) === 'MSG_PAY_LPCOST'
                            ? 'cost'
                            : 'damage',
                    duration: Number(message?.duration || 1300)
                } : null;
            }
            case 'MSG_MISSED_EFFECT':
                return {
                    kind: 'selection_event',
                    phase: 'missed_effect',
                    cards: orientFieldQueryList(message?.cards || [message?.source || message], currentOrientation),
                    text: message?.text || 'An effect missed the timing',
                    duration: Number(message?.duration || 1400)
                };
            case 'MSG_TOSS_COIN':
                return { kind: 'coin_result', player: orient(message.player, currentOrientation), results: Array.isArray(message?.results) ? message.results.map((value) => Boolean(value)) : [], sound: 'coinflip' };
            case 'MSG_TOSS_DICE':
                return { kind: 'dice_result', player: orient(message.player, currentOrientation), results: Array.isArray(message?.results) ? message.results.map((value) => Number(value)) : [], sound: 'diceroll' };
            case 'MSG_FIELD_DISABLED':
                return {
                    kind: 'field_disabled',
                    zones: Array.isArray(message?.zones)
                        ? message.zones.map((zone) => ({ player: orient(zone?.player, currentOrientation), location: zone?.location, index: Number(zone?.index ?? 0) }))
                        : []
                };
            case 'MSG_SHUFFLE_DECK':
            case 'MSG_SHUFFLE_HAND':
            case 'MSG_SHUFFLE_EXTRA':
                return {
                    kind: 'shuffle',
                    zone: ({ MSG_SHUFFLE_DECK: 'DECK', MSG_SHUFFLE_HAND: 'HAND', MSG_SHUFFLE_EXTRA: 'EXTRA' })[resolveDuelMessageName(message, message.command)],
                    player: orient(message.player, currentOrientation)
                };
            case 'MSG_SHUFFLE_SET_CARD': {
                const players = Array.from(new Set((message.cards || []).reduce((output, movement) => {
                    if (Number.isInteger(movement?.from?.player)) {
                        output.push(orient(movement.from.player, currentOrientation));
                    }
                    if (Number.isInteger(movement?.to?.player)) {
                        output.push(orient(movement.to.player, currentOrientation));
                    }
                    return output;
                }, [])));
                return { kind: 'shuffle_set', zone: message.location, players };
            }
            case 'MSG_TAG_SWAP':
                return { kind: 'tag_swap', player: orient(message.player, currentOrientation), zones: ['DECK', 'HAND', 'EXTRA'] };
            case 'MSG_DECK_TOP':
                return Number(message?.id || 0)
                    ? {
                        kind: 'pile_reveal',
                        call: 'deck_top',
                        player: orient(message?.player, currentOrientation),
                        cards: [{ id: Number(message.id), player: orient(message?.player, currentOrientation), location: 'DECK', index: Number(message?.offset || 0) }],
                        duration: Number(message?.duration || 900)
                    }
                    : null;
            case 'MSG_HAND_RES':
                return { kind: 'rps_result', results: Array.isArray(message?.results) ? message.results.slice() : [], duration: Number(message?.duration || 1000) };
            default:
                return null;
        }
    }

    function handleAnnouncement(message) {
        const duelRuntime = getDuelRuntime(),
            contract = message?.ui || resolveAnnouncementContract(message, context.uiRuntimeState.orientation);

        if (contract?.kind === 'rps_result') {
            duelRuntime?.showChoiceResult('rps', contract, {
                clearPrompt: true,
                overlayActive: false,
                runtimeMode: 'choice'
            });
            context.setIncomingActionDelay(contract.duration || 1000);
            return;
        }

        if (contract?.kind === 'hint') {
            if (contract.log && contract.text) {
                console.log(`[ygopro/${contract.logLabel || contract.kind}]`, contract.text);
            }
            dialogService.setQuestionPrompt(contract.text || '');
            return;
        }

        if (contract?.kind === 'coin_result') {
            playUiSound(contract.sound);
            showChoiceResultOverlay(contract, 'coin');
            return;
        }

        if (contract?.kind === 'dice_result') {
            playUiSound(contract.sound);
            showChoiceResultOverlay(contract, 'dice');
            return;
        }

        if (contract?.sound) {
            playUiSound(contract.sound);
        }

        if (contract?.kind === 'notice') {
            if (contract.text && contract.log) {
                console.log(`[ygopro/${contract.logLabel || contract.kind}]`, contract.text);
            }
            dialogService.showTransientPrompt(contract.text, contract.duration);
            return;
        }

        if (duelRuntime?.applyAnnouncementContract(contract)) {
            if (contract.kind === 'selection_event' && contract.text) {
                dialogService.showTransientPrompt(contract.text, contract.duration);
            }
            return;
        }
    }

    function handleDuelAction(message) {
        const duelRuntime = getDuelRuntime(),
            preserveActiveZoneSelection = dialogService.hasActiveZoneSelectorQuestion(),
            preserveActiveAnnounceNumber = dialogService.hasActiveAnnounceNumberQuestion(),
            preserveActiveQuestionUi = preserveActiveZoneSelection || preserveActiveAnnounceNumber;

        switch (message.duelAction) {
            case 'start':
            case 'reload':
                dialogService.clearQuestionTracking();
                duelRuntime?.applyDuelSnapshot(message, {
                    clearField: true,
                    clearPrompt: true,
                    disableSelection: true,
                    mode: 'duel',
                    resetChainState: true
                });
                break;
            case 'duel':
                if (!preserveActiveQuestionUi) {
                    dialogService.clearQuestionTracking();
                }
                duelRuntime?.applyDuelSnapshot(message, {
                    disableSelection: !preserveActiveQuestionUi,
                    mode: 'duel'
                });
                break;
            case 'question':
                dialogService.setupQuestion(message);
                break;
            case 'announcement':
                handleAnnouncement(message.message);
                break;
            case 'reveal':
                dialogService.clearQuestionTracking();
                duelRuntime?.disableSelection();
                {
                    const revealCards = dialogService.hydrateRevealCardList(orientRevealCards(message.reveal));

                    if (duelRuntime?.previewReveal(revealCards, {
                        call: message.call,
                        player: orient(Number(message.player || 0)),
                        duration: Number(message.duration || 1400)
                    })) {
                        break;
                    }

                    duelRuntime?.openReveal(revealCards);
                }
                break;
            case 'effect':
                if (!preserveActiveQuestionUi) {
                    dialogService.clearQuestionTracking();
                    duelRuntime?.disableSelection();
                }
                duelRuntime?.flashDuel(Object.assign({}, message, {
                    mode: message?.mode || 'legacy_preview',
                    phase: message?.phase || 'start',
                    source: orientFieldCoordinate(message, context.uiRuntimeState.orientation)
                }));
                break;
            case 'chat':
                duelRuntime?.appendChatMessage(message);
                break;
            case 'give':
                duelRuntime?.manualTake(message);
                break;
            default:
                break;
        }
    }

    return {
        Field,
        orient,
        orientFieldQuery,
        orientFieldQueryList,
        orientFieldCoordinate,
        orientRevealCards,
        handleAnnouncement,
        handleDuelAction,
        resolveAnnouncementContract,
        resolvePhaseBannerText,
        playUiSound,
        showChoiceResultOverlay
    };
}
