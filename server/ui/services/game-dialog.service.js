import { choiceStateMatches } from '../components/duel/choice.component';
import { resolveCardName, resolveHintText } from './duel-hint.service';
import {
    createCommandButtonAnswer,
    createRockPaperScissorsAnswer,
    createSelectCardAnswer,
    createSelectCounterAnswer,
    createSelectSumAnswer,
    createSelectTributeAnswer,
    createSelectUnselectCardAnswer,
    createSortCardAnswer
} from './duel-response.service';

const duelMessageTypes = {
    2: 'MSG_HINT',
    3: 'MSG_WAITING',
    10: 'MSG_SELECT_BATTLECMD',
    11: 'MSG_SELECT_IDLECMD',
    12: 'MSG_SELECT_EFFECTYN',
    13: 'MSG_SELECT_YESNO',
    14: 'MSG_SELECT_OPTION',
    15: 'MSG_SELECT_CARD',
    16: 'MSG_SELECT_CHAIN',
    18: 'MSG_SELECT_PLACE',
    19: 'MSG_SELECT_POSITION',
    20: 'MSG_SELECT_TRIBUTE',
    21: 'MSG_SORT_CHAIN',
    22: 'MSG_SELECT_COUNTER',
    23: 'MSG_SELECT_SUM',
    24: 'MSG_SELECT_DISFIELD',
    25: 'MSG_SORT_CARD',
    26: 'MSG_SELECT_UNSELECT_CARD',
    30: 'MSG_CONFIRM_DECKTOP',
    31: 'MSG_CONFIRM_CARDS',
    32: 'MSG_SHUFFLE_DECK',
    33: 'MSG_SHUFFLE_HAND',
    36: 'MSG_SHUFFLE_SET_CARD',
    38: 'MSG_DECK_TOP',
    39: 'MSG_SHUFFLE_EXTRA',
    42: 'MSG_CONFIRM_EXTRATOP',
    60: 'MSG_SUMMONING',
    62: 'MSG_SPSUMMONING',
    64: 'MSG_FLIPSUMMONING',
    70: 'MSG_CHAINING',
    80: 'MSG_CARD_SELECTED',
    81: 'MSG_RANDOM_SELECTED',
    83: 'MSG_BECOME_TARGET',
    95: 'MSG_UNEQUIP',
    96: 'MSG_CARD_TARGET',
    97: 'MSG_CANCEL_TARGET',
    101: 'MSG_ADD_COUNTER',
    102: 'MSG_REMOVE_COUNTER',
    112: 'MSG_ATTACK_DISABLED',
    120: 'MSG_MISSED_EFFECT',
    121: 'MSG_BE_CHAIN_TARGET',
    122: 'MSG_CREATE_RELATION',
    123: 'MSG_RELEASE_RELATION',
    130: 'MSG_TOSS_COIN',
    131: 'MSG_TOSS_DICE',
    132: 'MSG_ROCK_PAPER_SCISSORS',
    133: 'MSG_HAND_RES',
    141: 'MSG_ANNOUNCE_ATTRIB',
    140: 'MSG_ANNOUNCE_RACE',
    142: 'MSG_ANNOUNCE_CARD',
    143: 'MSG_ANNOUNCE_NUMBER',
    161: 'MSG_TAG_SWAP',
    163: 'MSG_AI_NAME',
    164: 'MSG_SHOW_HINT',
    170: 'MSG_MATCH_KILL',
    180: 'MSG_CUSTOM_MSG',
    190: 'MSG_REMOVE_CARDS'
};

export function resolveDuelMessageName(message, fallback) {
    if (typeof fallback === 'string' && fallback.length) {
        return fallback;
    }
    if (typeof message?.command === 'string' && message.command.length) {
        return message.command;
    }
    if (typeof message?.type === 'string' && message.type.length) {
        return message.type;
    }
    if (typeof message?.type === 'number') {
        return duelMessageTypes[message.type];
    }
    return undefined;
}

export function getRevealCards(options) {
    if (Array.isArray(options?.reveal_cards)) {
        return options.reveal_cards;
    }
    if (Array.isArray(options?.select_options)) {
        return options.select_options;
    }
    if (Array.isArray(options?.selectable_targets)) {
        return options.selectable_targets;
    }
    return [];
}

function isFieldZoneSelectionCard(card) {
    return card
        && (card.location === 'MONSTERZONE' || card.location === 'SPELLZONE')
        && Number.isInteger(card.player)
        && Number.isInteger(card.index);
}

export function canUseZoneSelectorsForCards(cards) {
    return Array.isArray(cards)
        && cards.length > 0
        && cards.every(isFieldZoneSelectionCard);
}

export function buildZoneSelectionQuery(cards) {
    return {
        zones: cards.map((card) => ({
            player: card.player,
            location: card.location,
            index: card.index
        }))
    };
}

export function getZoneSelectionCard(cards, zoneAnswer, orient) {
    if (!Array.isArray(cards) || !zoneAnswer) {
        return null;
    }

    const [player, location, index] = Array.isArray(zoneAnswer.i) ? zoneAnswer.i : [];
    const locationMap = {
        4: 'MONSTERZONE',
        8: 'SPELLZONE'
    };
    const resolvedLocation = locationMap[location],
        normalizedPlayer = Number(player),
        normalizedIndex = Number(index),
        directMatch = cards.find((card) =>
            card
            && card.player === normalizedPlayer
            && card.location === resolvedLocation
            && card.index === normalizedIndex);

    if (directMatch) {
        return directMatch;
    }

    return cards.find((card) =>
        card
        && card.player === orient(normalizedPlayer)
        && card.location === resolvedLocation
        && card.index === normalizedIndex);
}

export function buildSelectOptionChoices(options, database = [], strings = { system: {} }) {
    if (!Array.isArray(options)) {
        return [];
    }

    return options.map((option, index) => {
        const value = option?.value ?? option,
            resolved = resolveHintText(value, database, strings) || resolveCardName(database, value);

        return {
            i: Number(option?.i ?? index),
            value,
            label: resolved || (typeof value === 'string' ? value : `Option ${index + 1}`)
        };
    });
}

export function toggleOrderedRevealSelection(selection, option) {
    const current = Array.isArray(selection) ? selection.slice() : [],
        index = current.indexOf(option);

    if (index >= 0) {
        current.splice(index, 1);
        return current;
    }

    current.push(option);
    return current;
}

export function applyCounterAllocation(allocations, cards, totalRequired, option, direction = 1) {
    const next = Array.isArray(allocations)
            ? allocations.slice()
            : Array.from({ length: Array.isArray(cards) ? cards.length : 0 }, () => 0),
        target = Number(next[option] || 0),
        available = Number(cards?.[option]?.count || 0),
        currentTotal = next.reduce((sum, value) => sum + (Number(value) || 0), 0);

    if (direction < 0) {
        if (target > 0) {
            next[option] = target - 1;
        }
        return next;
    }

    if (available <= 0 || target >= available || currentTotal >= Number(totalRequired || 0)) {
        return next;
    }

    next[option] = target + 1;
    return next;
}

export function toLegacyRpsAnswer(choice) {
    switch (choice) {
        case 'rock':
            return 0;
        case 'paper':
            return 1;
        case 'scissors':
            return 2;
        default:
            return 0;
    }
}

export function toOcgcoreRpsAnswer(choice) {
    switch (choice) {
        case 'rock':
            return 2;
        case 'paper':
            return 3;
        case 'scissors':
            return 1;
        default:
            return 2;
    }
}

export function createGameDialogService(context, helpers) {
    const { store, questionState, uiRuntimeState } = context;
    const { orient } = helpers;

    function getDuelRuntime() {
        return context.duelRuntime || null;
    }

    function setQuestionPrompt(text) {
        if (questionState.promptTimer) {
            clearTimeout(questionState.promptTimer);
            questionState.promptTimer = null;
        }
        questionState.prompt = typeof text === 'string' ? text : '';
    }

    function showTransientPrompt(text, duration = 1400) {
        if (typeof text !== 'string' || !text.trim()) {
            return;
        }

        const visibleDuration = Math.max(120, Number(duration || 1400));

        setQuestionPrompt(text);
        store.emit({ action: 'RENDER' });

        questionState.promptTimer = setTimeout(() => {
            questionState.prompt = '';
            questionState.promptTimer = null;
            store.emit({ action: 'RENDER' });
        }, visibleDuration);
    }

    function buildQuestionSignature(message) {
        const command = resolveDuelMessageName(message, message?.command),
            promptText = typeof message?.prompt_text === 'string' ? message.prompt_text : '';

        if (command === 'MSG_ANNOUNCE_NUMBER') {
            const announcementValues = Array.isArray(message?.options?.announcement_values)
                ? message.options.announcement_values.map((value) => Number(value))
                : (Array.isArray(message?.options?.options)
                    ? message.options.options.map((value) => Number(value))
                    : (Array.isArray(message?.options?.values)
                        ? message.options.values.map((value) => Number(value))
                        : []));

            return JSON.stringify({
                command,
                promptText,
                announcementValues
            });
        }

        return JSON.stringify({
            command,
            promptText,
            options: message?.options || null
        });
    }

    function clearQuestionTracking() {
        questionState.signature = null;
        questionState.answerPending = false;
    }

    function hasActiveZoneSelectorQuestion() {
        if (questionState.signature === null || questionState.answerPending) {
            return false;
        }

        if (questionState.command === 'MSG_SELECT_PLACE' || questionState.command === 'MSG_SELECT_DISFIELD') {
            return true;
        }

        return canUseZoneSelectorsForCards(getRevealCards(questionState.options));
    }

    function hasActiveAnnounceNumberQuestion() {
        return (
            questionState.signature !== null
            && !questionState.answerPending
            && questionState.command === 'MSG_ANNOUNCE_NUMBER'
        );
    }

    function sendQuestionAnswer(answer, label) {
        const duelRuntime = getDuelRuntime();

        if (questionState.answerPending) {
            console.log(`[ygopro/question] ignoring ${label} answer while a response is already pending`, {
                question: questionState.id,
                answer
            });
            return;
        }

        console.log(`[ygopro/question] sending ${label} answer`, {
            question: questionState.id,
            answer
        });
        questionState.answerPending = true;
        duelRuntime?.sendQuestionAnswer(answer, questionState.id);
    }

    function updateSelectableCardSelection(selectedCard, answerIndex, rerender) {
        if (selectedCard?.selected) {
            const remove = questionState.selection.indexOf(answerIndex);
            if (remove >= 0) {
                questionState.selection.splice(remove, 1);
            }
            selectedCard.selected = false;
            rerender();
            return;
        }

        questionState.selection.push(answerIndex);
        if (questionState.selection.length === questionState.max) {
            sendQuestionAnswer(createRevealSelectionAnswer(questionState.selection), 'selection');
            return;
        }

        if (questionState.selection.length > questionState.min) {
            promptForAdditionalTargets(selectedCard, rerender);
            return;
        }

        if (selectedCard) {
            selectedCard.selected = true;
        }
        setTimeout(() => {
            rerender();
        }, 300);
    }

    function resolveCommandAnswer(card, options = questionState.options) {
        if (!card || !options || typeof options !== 'object') {
            return card;
        }

        if (typeof card.type === 'string' && Number.isInteger(card.i)) {
            return {
                type: card.type,
                i: card.i
            };
        }

        const commandKeys = [
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

        const hasKnownCardIdentity = (id) => !(
            id === undefined
            || id === null
            || id === ''
            || id === 'unknown'
        );

        for (const type of commandKeys) {
            const optionSet = Array.isArray(options[type]) ? options[type] : [];
            const matchIndex = optionSet.findIndex((option) =>
                option
                && option.index === card.index
                && option.location === card.location
                && (
                    option.player === undefined
                    || card.player === undefined
                    || option.player === card.player
                )
                && (
                    option.id === undefined
                    || !hasKnownCardIdentity(option.id)
                    || !hasKnownCardIdentity(card.id)
                    || option.id === card.id
                ));

            if (matchIndex >= 0) {
                return createCommandButtonAnswer(type, matchIndex);
            }
        }

        return createCommandButtonAnswer(card.type, card.i);
    }

    function createRevealSelectionAnswer(indices) {
        switch (questionState.command) {
            case 'MSG_SELECT_TRIBUTE':
                return createSelectTributeAnswer(indices);
            case 'MSG_SELECT_SUM':
                return createSelectSumAnswer(indices);
            case 'MSG_SELECT_UNSELECT_CARD':
                return createSelectUnselectCardAnswer(indices[0] ?? null);
            default:
                return createSelectCardAnswer(indices);
        }
    }

    function resolveRevealCardId(card) {
        const numericId = Number(card?.id ?? card?.code ?? 0);

        if (Number.isInteger(numericId) && numericId > 0) {
            return numericId;
        }

        return card?.id ?? card?.code ?? null;
    }

    function hydrateRevealCard(card, database = context.databaseSystem) {
        if (!card || typeof card !== 'object') {
            return card;
        }

        const id = resolveRevealCardId(card),
            dbEntry = Number.isInteger(Number(id))
                ? (database.find((entry) => entry.id === Number(id)) || {})
                : {};

        return {
            ...dbEntry,
            ...card,
            id
        };
    }

    function hydrateRevealCardList(cards, database = context.databaseSystem) {
        return Array.isArray(cards)
            ? cards.map((card) => hydrateRevealCard(card, database))
            : [];
    }

    function renderRevealQuestion(cards, state = {}) {
        getDuelRuntime()?.openReveal(hydrateRevealCardList(cards), {
            dismissable: false,
            ...state,
            cards2: hydrateRevealCardList(state.cards2)
        });
    }

    function promptForAdditionalTargets(selectedCard, rerender) {
        const duelRuntime = getDuelRuntime();

        if (selectedCard) {
            selectedCard.selected = true;
        }

        duelRuntime?.openYesNoDialog({
            promptText: 'Select Additional Targets?',
            onYes: () => {
                setTimeout(() => {
                    rerender();
                }, 300);
            },
            onNo: () => {
                sendQuestionAnswer(createRevealSelectionAnswer(questionState.selection), 'partial selection');
            }
        });
        store.emit({ action: 'RENDER' });
    }

    function getCounterTargets(options = questionState.options) {
        if (Array.isArray(options?.reveal_cards)) {
            return options.reveal_cards;
        }
        return Array.isArray(options?.counter_targets) ? options.counter_targets : [];
    }

    function rerenderCounterQuestion() {
        const counterTargets = getCounterTargets();
        renderRevealQuestion(counterTargets, {
            mode: 'counter',
            counterAllocations: questionState.counterAllocations,
            remaining: Math.max(0, questionState.counterTarget - questionState.counterAllocations.reduce((sum, value) => sum + (Number(value) || 0), 0))
        });
    }

    function rerenderSortQuestion() {
        renderRevealQuestion(getRevealCards(questionState.options), {
            mode: 'sort',
            selectionOrder: questionState.selection
        });
    }

    function setupQuestion(message) {
        const duelRuntime = getDuelRuntime(),
            command = message.command,
            nextQuestionSignature = buildQuestionSignature(message),
            repeatedActiveQuestion = (
                !questionState.answerPending
                && nextQuestionSignature === questionState.signature
                && command === questionState.command
            );

        questionState.id = message.uuid;
        questionState.command = command;
        questionState.min = Number(message.options?.select_min || 0);
        questionState.max = Number(message.options?.select_max || 0);
        setQuestionPrompt(message.prompt_text || '');

        if (Array.isArray(message.field)) {
            duelRuntime?.hydrateField(message.field);
        }

        if (repeatedActiveQuestion) {
            questionState.options = message.options || questionState.options;

            if (command === 'MSG_SELECT_IDLECMD' || command === 'MSG_SELECT_BATTLECMD') {
                duelRuntime?.idle(questionState.options);
            }
            if (command === 'MSG_SELECT_CHAIN') {
                questionState.min = 1;
                questionState.max = 1;
                duelRuntime?.handleChainQuestion(questionState.options, {
                    promptText: message.prompt_text || ''
                });
            }
            if (command === 'MSG_SORT_CHAIN') {
                questionState.selection = [];
                if (!duelRuntime?.handleSortChainQuestion(questionState.options, {
                    promptText: message.prompt_text || ''
                })) {
                    rerenderSortQuestion();
                }
            }

            store.emit({ action: 'RENDER' });
            return;
        }

        questionState.signature = nextQuestionSignature;
        questionState.answerPending = false;
        questionState.options = message.options || {};
        questionState.selection = [];
        questionState.counterAllocations = [];
        questionState.counterTarget = 0;
        duelRuntime?.disableSelection();
        duelRuntime?.idle({});
        duelRuntime?.clearChainQuestion();

        switch (command) {
            case 'MSG_ROCK_PAPER_SCISSORS':
                duelRuntime?.showChoicePrompt('rps', {
                    protocol: 'ocgcore',
                    runtimeMode: 'choice',
                    slot: uiRuntimeState.orientation ?? 0
                });
                break;
            case 'MSG_SELECT_IDLECMD':
            case 'MSG_SELECT_BATTLECMD':
                duelRuntime?.idle(message.options);
                break;
            case 'MSG_SELECT_PLACE':
            case 'MSG_SELECT_DISFIELD':
                duelRuntime?.select({
                    ...(message.options.zone_selection || { zones: [] }),
                    command,
                    player: message.options.player
                });
                break;
            case 'MSG_SELECT_OPTION':
                duelRuntime?.openSelectOptionDialog({
                    active: true,
                    options: message.options.option_rows || [],
                    selectedIndex: 0
                });
                break;
            case 'MSG_SELECT_CARD':
            case 'MSG_SELECT_TRIBUTE':
            case 'MSG_CONFIRM_CARDS':
                if (message.options.zone_selection) {
                    duelRuntime?.select({
                        ...message.options.zone_selection,
                        command,
                        player: message.options.player
                    });
                    break;
                }
                renderRevealQuestion(message.options.reveal_cards || []);
                break;
            case 'MSG_SELECT_UNSELECT_CARD':
                questionState.min = 1;
                questionState.max = 1;
                renderRevealQuestion(message.options.reveal_cards || [], {
                    cards2: message.options.secondary_reveal_cards || []
                });
                break;
            case 'MSG_SELECT_SUM':
                questionState.max = 1;
                questionState.selection.push(Number(message.options.must_select_count || 0));
                if (message.options.zone_selection) {
                    duelRuntime?.select({
                        ...message.options.zone_selection,
                        command,
                        player: message.options.player
                    });
                    break;
                }
                renderRevealQuestion(message.options.reveal_cards || []);
                break;
            case 'MSG_SELECT_COUNTER':
                questionState.counterTarget = Number(message.options.count || message.options.select_max || 0);
                questionState.counterAllocations = Array.from({
                    length: getCounterTargets(message.options).length
                }, () => 0);
                rerenderCounterQuestion();
                break;
            case 'MSG_SORT_CARD':
                questionState.selection = [];
                rerenderSortQuestion();
                break;
            case 'MSG_SORT_CHAIN':
                questionState.selection = [];
                if (!duelRuntime?.handleSortChainQuestion(message.options || {}, {
                    promptText: message.prompt_text || ''
                })) {
                    rerenderSortQuestion();
                }
                break;
            case 'MSG_SELECT_POSITION':
                duelRuntime?.openSelectPositionDialog(message.options);
                break;
            case 'MSG_SELECT_EFFECTYN':
            case 'MSG_SELECT_YESNO':
                duelRuntime?.openYesNoDialog({
                    active: true,
                    promptText: message.prompt_text || (command === 'MSG_SELECT_EFFECTYN' ? 'Use effect?' : 'Confirm this action?')
                });
                break;
            case 'MSG_SELECT_CHAIN':
                questionState.min = 1;
                questionState.max = 1;
                duelRuntime?.handleChainQuestion(message.options || {}, {
                    promptText: message.prompt_text || ''
                });
                break;
            case 'MSG_ANNOUNCE_ATTRIB':
            case 'MSG_ANNOUNCE_RACE':
            case 'MSG_ANNOUNCE_NUMBER':
                duelRuntime?.openSelectAttributesDialog({
                    active: true,
                    options: message.options.announcement_values || {},
                    text: command === 'MSG_ANNOUNCE_NUMBER' ? 'Number' : (command === 'MSG_ANNOUNCE_RACE' ? 'Race' : 'Attribute'),
                    responseType: command
                });
                break;
            case 'MSG_ANNOUNCE_CARD':
                duelRuntime?.openAnnounceCardDialog({
                    opcodes: message.options.opcodes || []
                });
                break;
            default:
                break;
        }
    }

    function onZoneClick(message) {
        const duelRuntime = getDuelRuntime();

        if (context.app.manual) {
            context.app.manualControls?.selectionzoneonclick(message.manual.choice, message.manual.location);
            return;
        }

        if (canUseZoneSelectorsForCards(getRevealCards(questionState.options))) {
            const revealCards = getRevealCards(questionState.options);
            const selectedCard = getZoneSelectionCard(revealCards, message.automatic, orient);
            const answerIndex = Number.isInteger(selectedCard?.i)
                ? selectedCard.i
                : revealCards.indexOf(selectedCard);

            if (answerIndex < 0) {
                return;
            }

            updateSelectableCardSelection(selectedCard, answerIndex, () => {
                duelRuntime?.select(buildZoneSelectionQuery(revealCards));
                store.emit({ action: 'RENDER' });
            });
            return;
        }

        sendQuestionAnswer(message.automatic, 'ZONE_CLICK');
    }

    function onZoneHover(message) {
        getDuelRuntime()?.hoverFieldCard({
            player: message.player,
            location: message.location,
            index: message.index
        });
    }

    function onRevealCardClick(message) {
        if (questionState.command === 'MSG_SORT_CARD' || questionState.command === 'MSG_SORT_CHAIN') {
            questionState.selection = toggleOrderedRevealSelection(questionState.selection, message.option);
            rerenderSortQuestion();
            store.emit({ action: 'RENDER' });
            return;
        }

        const revealCards = getRevealCards(questionState.options);
        const selectedCard = revealCards[message.option];
        const answerIndex = Number.isInteger(selectedCard?.i) ? selectedCard.i : message.option;
        updateSelectableCardSelection(selectedCard, answerIndex, () => {
            renderRevealQuestion(revealCards);
            store.emit({ action: 'RENDER' });
        });
    }

    function onRevealSortClick(message) {
        questionState.selection = toggleOrderedRevealSelection(questionState.selection, message.option);
        rerenderSortQuestion();
        store.emit({ action: 'RENDER' });
    }

    function onRevealCounterClick(message) {
        questionState.counterAllocations = applyCounterAllocation(
            questionState.counterAllocations,
            getCounterTargets(),
            questionState.counterTarget,
            message.option,
            message.direction
        );
        rerenderCounterQuestion();
        store.emit({ action: 'RENDER' });
    }

    function onRevealConfirm() {
        const duelRuntime = getDuelRuntime();

        if (questionState.command === 'MSG_SELECT_COUNTER') {
            duelRuntime?.closeRevealer();
            sendQuestionAnswer(createSelectCounterAnswer(questionState.counterAllocations), 'REVEAL_CONFIRM_COUNTER');
            return;
        }

        if (questionState.command === 'MSG_SORT_CARD' || questionState.command === 'MSG_SORT_CHAIN') {
            duelRuntime?.closeRevealer();
            sendQuestionAnswer(createSortCardAnswer(questionState.selection), 'REVEAL_CONFIRM_SORT');
        }
    }

    function onRevealReset() {
        if (questionState.command === 'MSG_SELECT_COUNTER') {
            questionState.counterAllocations = Array.from({
                length: getCounterTargets().length
            }, () => 0);
            rerenderCounterQuestion();
            return;
        }

        if (questionState.command === 'MSG_SORT_CARD' || questionState.command === 'MSG_SORT_CHAIN') {
            questionState.selection = [];
            rerenderSortQuestion();
        }
    }

    function registerListeners() {
        store.on('CONTROL_CLICK', (message) => {
            const answer = resolveCommandAnswer(message.card);
            console.log('control click', message, answer);
            sendQuestionAnswer(answer, 'CONTROL_CLICK');
        });

        store.on('SELECT_OPTION_CLICK', (message) => {
            sendQuestionAnswer(message.answer, 'SELECT_OPTION_CLICK');
        });

        store.on('PHASE_CLICK', (message) => {
            sendQuestionAnswer(message.phase, 'PHASE_CLICK');
        });

        store.on('RPS', (message) => {
            if (
                questionState.command === 'MSG_ROCK_PAPER_SCISSORS'
                && uiRuntimeState.mode === 'choice'
                && choiceStateMatches(uiRuntimeState.choice, {
                    mode: 'rps',
                    protocol: 'ocgcore'
                })
            ) {
                sendQuestionAnswer(
                    createRockPaperScissorsAnswer(toOcgcoreRpsAnswer(message.answer)),
                    'RPS'
                );
                return;
            }

            getDuelRuntime()?.sendLegacyChoiceAnswer(toLegacyRpsAnswer(message.answer));
        });

        store.on('ZONE_CLICK', onZoneClick);
        store.on('ZONE_HOVER', onZoneHover);

        store.on('POSITION_CARD_CLICK', (message) => {
            sendQuestionAnswer(message.position, 'POSITION_CARD_CLICK');
        });

        store.on('YESNO_CLICK', (message) => {
            sendQuestionAnswer(message.option, 'YESNO_CLICK');
        });

        store.on('EMPTY_SPACE', () => {
            getDuelRuntime()?.closeRevealer();
            store.emit({ action: 'RENDER' });
        });

        store.on('REVEAL_CARD_CLICK', onRevealCardClick);
        store.on('REVEAL_SORT_CLICK', onRevealSortClick);
        store.on('REVEAL_COUNTER_CLICK', onRevealCounterClick);

        store.on('CHAIN_RESPONSE', (message) => {
            sendQuestionAnswer(message.answer, message.label || 'CHAIN_RESPONSE');
        });

        store.on('ANNOUNCE_SELECTION_CLICK', (message) => {
            sendQuestionAnswer(message.answer, 'ANNOUNCE_SELECTION_CLICK');
        });

        store.on('ANNOUNCE_CARD_PREVIEW', (message) => {
            if (!Number.isInteger(message?.id)) {
                return;
            }
            getDuelRuntime()?.previewCard(message.id);
        });

        store.on('REVEALER_CLOSE', () => {
            if (questionState.selection.length > questionState.min) {
                sendQuestionAnswer(createRevealSelectionAnswer(questionState.selection), 'REVEALER_CLOSE');
            }
        });

        store.on('REVEAL_CONFIRM', onRevealConfirm);
        store.on('REVEAL_RESET', onRevealReset);
    }

    return {
        setQuestionPrompt,
        showTransientPrompt,
        clearQuestionTracking,
        hasActiveZoneSelectorQuestion,
        hasActiveAnnounceNumberQuestion,
        hydrateRevealCardList,
        renderRevealQuestion,
        setupQuestion,
        sendQuestionAnswer,
        resolveCommandAnswer,
        registerListeners
    };
}
