/*eslint no-plusplus: 0*/
'use strict';

/**
 * @typedef {Object} YGOProMessage
 * @property {String} command
 * @property {Packet} packet
 */

/**
 * @typedef {Buffer} Packet
 */

const enums = require('./translate_ygopro_enums.js'),
    makeCard = require('./model_ygopro_card.js'),
    BufferStreamReader = require('./model_stream_reader');




function getFieldCards(gameBoard, controller, location, BufferIO) {
    'use strict';
    const cards = [],
        values = gameBoard.generateViewCount(controller),
        requiredIterations = values[location];

    for (let i = 0; requiredIterations > i; ++i) {
        const len = BufferIO.readInt32();
        if (len > 8) {
            let card = makeCard(BufferIO, controller, (gameBoard.masterRule === 4));
            cards.push(card);
        }
    }
    return cards;
}

function getSelectableZones(mask) {
    const zones = [];
    let filter = 0x1;

    for (let i = 0; i < 7; ++i, filter <<= 1) {
        if (mask & filter) {
            zones.push({
                player: 0,
                location: 'MONSTERZONE',
                index: i,
                status: !(mask & filter)
            });
        }
    }
    filter = 0x100;
    for (let i = 0; i < 8; ++i, filter <<= 1) {
        if (mask & filter) {
            zones.push({
                player: 0,
                location: 'SPELLZONE',
                index: i,
                status: !(mask & filter)
            });
        }
    }
    filter = 0x10000;
    for (let i = 0; i < 7; ++i, filter <<= 1) {
        if (mask & filter) {
            zones.push({
                player: 1,
                location: 'MONSTERZONE',
                index: i,
                status: !(mask & filter)
            });
        }
    }
    filter = 0x1000000;
    for (let i = 0; i < 8; ++i, filter <<= 1) {
        if (mask & filter) {
            zones.push({
                player: 1,
                location: 'SPELLZONE',
                index: i,
                status: !(mask & filter)
            });
        }
    }
    return zones;
}

function getIdleSet(BufferIO, hasDescriptions) {
    const cards = [],
        count = BufferIO.readInt8();

    if (hasDescriptions) {
        for (let i = 0; i < count; ++i) {
            cards.push({
                id: BufferIO.readInt32(),
                player: BufferIO.readInt8(),
                location: enums.locations[BufferIO.readInt8()],
                index: BufferIO.readInt8(),
                description: BufferIO.readInt32()
            });
        }
    } else {
        for (let i = 0; i < count; ++i) {
            cards.push({
                id: BufferIO.readInt32(),
                player: BufferIO.readInt8(),
                location: enums.locations[BufferIO.readInt8()],
                index: BufferIO.readInt8()
            });
        }
    }
    return cards;
}


function msg_start(message, BufferIO) {
    message.playertype = BufferIO.readInt8();
    message.lifepoints1 = BufferIO.readInt32();
    message.lifepoints2 = BufferIO.readInt32();
    message.player1decksize = BufferIO.readInt16();
    message.player1extrasize = BufferIO.readInt16();
    message.player2decksize = BufferIO.readInt16();
    message.player2extrasize = BufferIO.readInt16();
}

function msg_hint(message, BufferIO) {
    message.command = enums.STOC.STOC_GAME_MSG.MSG_HINT[BufferIO.readInt8()];
    message.player = BufferIO.readInt8(); /* defunct in the code */
    message.data = BufferIO.readInt32();
    message.hintforce = BufferIO.readInt8();

    switch (message.command) {
        case 'HINT_EVENT':
            //myswprintf(event_string, L"%ls", dataManager.GetDesc(data));
            //this is a rabbit hole, the hint system takes bytes and uses that to 
            //calculate (hurr, god why) the string that should be used from strings.conf
            // like a direct reference would be hard....
            break;
        case 'HINT_MESSAGE':
            //display task.data after processing it against the DB.
            break;
        case 'HINT_SELECTMSG':
            message.select_hint = message.data;
            break;

        case 'HINT_OPSELECTED':
            break;
        case 'HINT_EFFECT':
            message.showcardcode = message.data;
            message.showcarddif = 0;
            message.showcard = 1;
            break;
    }
}

function msg_new_turn(message, BufferIO) {
    message.player = BufferIO.readInt8();
}

function msg_win(message, BufferIO) {
    message.win = BufferIO.readInt8();
    //need to double check for more variables
}

function msg_new_phase(message, BufferIO) {
    message.phase = BufferIO.readInt8();
    message.gui_phase = enums.phase[message.phase];
}

function msg_draw(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push({
            id: BufferIO.readInt32()
        });
    }
}

function msg_shuffle_deck(message, BufferIO) {
    message.player = BufferIO.readInt8();
}

function msg_shuffle_hand(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    //for some number that cant be determined here because the count was not sent (getting it from the state like an idiot)
    // readInt32 off.
}

function msg_chaining(message, BufferIO) {
    message.id = BufferIO.readInt32();
    message.pc = {
        player: BufferIO.readInt8(),
        location: enums.locations[BufferIO.readInt8()],
        index: BufferIO.readInt8()
    };
    message.subs = BufferIO.readInt8();
    message.c = {
        player: BufferIO.readInt8(),
        location: enums.locations[BufferIO.readInt8()],
        index: BufferIO.readInt8()
    };
    message.desc = BufferIO.readInt32();
    message.ct = BufferIO.readInt8(); // defunct in code
}

function msg_chained(message, BufferIO) {
    message.chain_link = BufferIO.readInt8();
}

function msg_chain_solving(message, BufferIO) {
    message.chain_link = BufferIO.readInt8();
}

function msg_chain_solved(message, BufferIO) {
    message.ct = BufferIO.readInt8(); // defunct in the code
}


function msg_chain_negated(message, BufferIO) {
    message.chain_link = BufferIO.readInt8();
}

function msg_chain_disabled(message, BufferIO) {
    message.chain_link = BufferIO.readInt8();
}

function msg_card_selected(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
}

function msg_random_selected(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.selections = [];
    for (let i = 0; i < message.count; ++i) {
        message.selections.push({
            c: BufferIO.readInt8(),
            l: BufferIO.readInt8(),
            s: BufferIO.readInt8(),
            ss: BufferIO.readInt8()
        });
    }
}

function msg_become_target(message, BufferIO) {
    message.count = BufferIO.readInt8();
    message.selections = [];
    for (let i = 0; i < message.count; ++i) {
        message.selections.push({
            c: BufferIO.readInt8(),
            l: BufferIO.readInt8(),
            s: BufferIO.readInt8(),
            ss: BufferIO.readInt8()
        });
    }
}

function msg_pay_lpcost(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.lp = BufferIO.readInt32();
    message.multiplier = -1;
}

function msg_damage(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.lp = BufferIO.readInt32();
    message.multiplier = -1;
}

function msg_recover(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.lp = BufferIO.readInt32();
    message.multiplier = 1;
}

function msg_lpupdate(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.lp = BufferIO.readInt32();
    message.multiplier = 1;
}

function msg_summoning(message, BufferIO) {
    message.id = BufferIO.readInt32();
    message.player = BufferIO.readInt8(); //defunct in code
    message.location = enums.locations[BufferIO.readInt8()]; //defunct in code
    message.index = BufferIO.readInt8(); //defunct in code
    message.position = enums.positions[BufferIO.readInt8()];
}

function msg_equip(message, BufferIO) {
    message.c1 = BufferIO.readInt8();
    message.l1 = BufferIO.readInt8();
    message.s1 = BufferIO.readInt8();
    BufferIO.readInt8(); //padding wtf
    message.c2 = BufferIO.readInt8();
    message.l2 = BufferIO.readInt8();
    message.s2 = BufferIO.readInt8();
    BufferIO.readInt8();
}

function msg_unequip(message, BufferIO) {
    message.c1 = BufferIO.readInt8();
    message.l1 = BufferIO.readInt8();
    message.s1 = BufferIO.readInt8();
    BufferIO.readInt8(); //padding wtf
    message.c1 = BufferIO.readInt8();
    message.l1 = BufferIO.readInt8();
    message.s1 = BufferIO.readInt8();
    BufferIO.readInt8();
}

function msg_card_target(message, BufferIO) {
    message.c1 = BufferIO.readInt8();
    message.l1 = BufferIO.readInt8();
    message.s1 = BufferIO.readInt8();
    BufferIO.readInt8(); //padding wtf
    message.c1 = BufferIO.readInt8();
    message.l1 = BufferIO.readInt8();
    message.s1 = BufferIO.readInt8();
    BufferIO.readInt8();
}

function msg_cancel_target(message, BufferIO) {
    message.c1 = BufferIO.readInt8();
    message.l1 = BufferIO.readInt8();
    message.s1 = BufferIO.readInt8();
    BufferIO.readInt8(); //padding wtf
    message.c2 = BufferIO.readInt8();
    message.l2 = BufferIO.readInt8();
    message.s2 = BufferIO.readInt8();
    BufferIO.readInt8();
}

function msg_add_counter(message, BufferIO) {
    message.type = BufferIO.readInt16();
    message.player = BufferIO.readInt8();
    message.location = enums.locations[BufferIO.readInt8()];
    message.index = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
}

function msg_remove_conuter(message, BufferIO) {
    message.type = BufferIO.readInt16();
    message.player = BufferIO.readInt8();
    message.location = enums.locations[BufferIO.readInt8()];
    message.index = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
}

function msg_attack(message, BufferIO) {
    message.attacker = {
        player: BufferIO.readInt8(),
        location: enums.locations[BufferIO.readInt8()],
        index: BufferIO.readInt8()
    };
    BufferIO.readInt8();
    message.defender = {
        player: BufferIO.readInt8(),
        location: enums.locations[BufferIO.readInt8()],
        index: BufferIO.readInt8()
    };
    BufferIO.readInt8();
}

function msg_battle(message, BufferIO) {
    message.ca = BufferIO.readInt8();
    message.la = BufferIO.readInt8();
    message.sa = BufferIO.readInt8();
    BufferIO.readInt8(); // padding
    message.aatk = BufferIO.readInt32();
    message.adef = BufferIO.readInt32();
    message.da = BufferIO.readInt8(); //defunct
    message.cd = BufferIO.readInt8();
    message.ld = BufferIO.readInt8();
    message.sd = BufferIO.readInt8();
    BufferIO.readInt8(); //padding
    message.datk = BufferIO.readInt32();
    message.ddef = BufferIO.readInt32();
    message.dd = BufferIO.readInt8();
}

function msg_missed_effect(BufferIO, message) {
    BufferIO.readInt8(); //padding
    message.id = BufferIO.readInt32();
}

function msg_toss_dice(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.results = [];
    for (let i = 0; i < message.count; ++i) {
        message.results.push(BufferIO.readInt8());
    }
}

function msg_rock_paper_scissors(message, BufferIO) {
    message.player = BufferIO.readInt8();
}

function msg_hand_res(message, BufferIO) {
    message.res = BufferIO.readInt8();
    message.res1 = (message.res & 0x3) - 1;
    message.res2 = ((message.res >> 2) & 0x3) - 1;
}

function msg_toss_coin(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.results = [];
    for (let i = 0; i < message.count; ++i) {
        message.results.push(BufferIO.readInt8());
    }
}

function msg_announce_race(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.announce_count = BufferIO.readInt8();
    message.avaliable = BufferIO.readInt32();
}

function msg_announce_attrib(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.announce_count = BufferIO.readInt8();
    message.avaliable = BufferIO.readInt32();
}

function msg_announce_card(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.declarable_type = BufferIO.readInt32();
}

function msg_accounce_number(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.values = [];
    for (let i = 0; i < message.count; ++i) {
        message.values.push(BufferIO.readInt32());
    }
}

function msg_announc_card_filter(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.opcodes = [];
    for (let i = 0; i < message.count; ++i) {
        message.opcodes.push(BufferIO.readInt32());
    }
}

function msg_card_hint(message, BufferIO) {
    message.controller = BufferIO.readInt8();
    message.location = BufferIO.readInt8();
    message.sequence = BufferIO.readInt8();
    BufferIO.readInt8(); //padding
    message.chtype = BufferIO.readInt8();
    message.value = BufferIO.readInt32();
}

function msg_player_hint(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.chtype = BufferIO.readInt8();
    message.value = BufferIO.readInt32();
}

function msg_match_kill(message, BufferIO) {
    message.match_kill = BufferIO.readInt32();
}

function msg_select_idlecmd(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.summonable_cards = getIdleSet(BufferIO);
    message.spsummonable_cards = getIdleSet(BufferIO);
    message.repositionable_cards = getIdleSet(BufferIO);
    message.msetable_cards = getIdleSet(BufferIO);
    message.ssetable_cards = getIdleSet(BufferIO);
    message.activatable_cards = getIdleSet(BufferIO, true);
    message.enableBattlePhase = BufferIO.readInt8();
    message.enableEndPhase = BufferIO.readInt8();
    message.shufflecount = BufferIO.readInt8();
}

function msg_move(message, BufferIO) {
    message.id = BufferIO.readInt32();
    message.pc = BufferIO.readInt8(); // original controller
    message.pl = enums.locations[BufferIO.readInt8()]; // original cLocation
    message.ps = BufferIO.readInt8(); // original sequence (index)
    message.pp = BufferIO.readInt8(); // padding??
    message.cc = BufferIO.readInt8(); // current controller
    message.cl = enums.locations[BufferIO.readInt8()]; // current cLocation
    message.cs = BufferIO.readInt8(); // current sequence (index)
    message.cp = enums.positions[BufferIO.readInt8()]; // current position
    message.reason = BufferIO.readInt32();
}

function msg_pos_change(message, BufferIO) {
    message.id = BufferIO.readInt32();
    message.player = BufferIO.readInt8(); // current controller
    message.location = enums.locations[BufferIO.readInt8()]; // current cLocation
    message.index = BufferIO.readInt8(); // current sequence (index)
    message.pp = BufferIO.readInt8(); // padding??
    message.position = enums.positions[BufferIO.readInt8()];
}

function msg_set(message, BufferIO) {
    message.id = BufferIO.readInt32();
    message.player = BufferIO.readInt8(); // current controller
    message.location = enums.locations[BufferIO.readInt8()]; // current cLocation
    message.index = BufferIO.readInt8(); // current sequence (index)
    message.position = enums.positions[BufferIO.readInt8()];
}

function msg_swap(message, BufferIO) {
    message.id1 = BufferIO.readInt8(); // defunct in the code
    message.c1 = BufferIO.readInt8();
    message.l1 = BufferIO.readInt8();
    message.s1 = BufferIO.readInt8();
    message.p1 = BufferIO.readInt8(); //defunct in the code
    message.id2 = BufferIO.readInt8(); //defunct in the code
    message.c2 = BufferIO.readInt8();
    message.l2 = BufferIO.readInt8();
    message.s2 = BufferIO.readInt8();
    message.p2 = BufferIO.readInt8();
}

function msg_field_disabled(message, BufferIO) {
    message.disabled = BufferIO.readInt32();
    message.ifisfirst_disabled = (message.disabled >> 16) | (message.disabled << 16);
}

function msg_spsummoning(message, BufferIO) {
    message.id = BufferIO.readInt32();
    message.player = BufferIO.readInt8();
    message.location = enums.locations[BufferIO.readInt8()];
    message.index = BufferIO.readInt8();
    message.position = enums.positions[BufferIO.readInt8()];
}

function msg_flipsummoning(message, BufferIO) {
    message.id = BufferIO.readInt32();
    message.player = BufferIO.readInt8(); // current controller
    message.location = enums.locations[BufferIO.readInt8()]; // current cLocation
    message.index = BufferIO.readInt8(); // current sequence (index)
    message.position = enums.positions[BufferIO.readInt8()];
}

function msg_select_battlecmd(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8(); // defunct in the code, just reading ahead.
    message.activatable_cards = getIdleSet(BufferIO, true);
    message.attackable_cards = [];
    message.count = BufferIO.readInt8();
    for (let i = 0; i < message.count; ++i) {
        message.attackable_cards.push({
            id: BufferIO.readInt32(),
            player: BufferIO.readInt8(),
            location: enums.locations[BufferIO.readInt8()],
            index: BufferIO.readInt8(),
            diratt: BufferIO.readInt8() // defuct in code
        });
    }
    message.enableMainPhase2 = BufferIO.readInt8();
    message.enableEndPhase = BufferIO.readInt8();
}

function msg_select_effectyn(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.c = BufferIO.readInt8();
    message.cl = BufferIO.readInt8();
    message.cs = BufferIO.readInt8();
    message.cp = BufferIO.readInt8();
}

function msg_select_option(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push(BufferIO.readInt32());
    }
}

function msg_select_card(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.select_cancelable = BufferIO.readInt8();
    message.select_min = BufferIO.readInt8();
    message.select_max = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push({
            id: BufferIO.readInt32(),
            player: BufferIO.readInt8(),
            location: enums.locations[BufferIO.readInt8()],
            index: BufferIO.readInt8(),
            ss: BufferIO.readInt8()
        });
    }
}

function msg_select_chain(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.specount = BufferIO.readInt8();
    message.forced = BufferIO.readInt8();
    message.hint0 = BufferIO.readInt32();
    message.hint1 = BufferIO.readInt32();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push({
            flag: BufferIO.readInt8(),
            id: BufferIO.readInt32(),
            player: BufferIO.readInt8(),
            location: enums.locations[BufferIO.readInt8()],
            index: BufferIO.readInt8(),
            ss: BufferIO.readInt8(),
            desc: BufferIO.readInt32()
        });
    }
}

function msg_select_place(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.select_min = BufferIO.readInt8();
    message.selectable_field = ~BufferIO.readInt32(); // mind the bitwise modifier.
    message.selected_field = 0;
    message.zones = getSelectableZones(message.selectable_field);
}

function msg_select_position(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.id = BufferIO.readInt32();
    message.positionsMask = BufferIO.readInt8();
    message.positions = [];
    if (message.positionsMask & 0x1) {
        message.positions.push(enums.positions[0x1]);
    }
    if (message.positionsMask & 0x2) {
        message.positions.push(enums.positions[0x2]);
    }
    if (message.positionsMask & 0x4) {
        message.positions.push(enums.positions[0x4]);
    }
    if (message.positionsMask & 0x8) {
        message.positions.push(enums.positions[0x8]);
    }
}

function msg_select_tribute(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.select_cancelable = BufferIO.readInt8() ? true : false;
    message.select_min = BufferIO.readInt8();
    message.select_max = BufferIO.readInt8();
    count = BufferIO.readInt8();
    message.selectable_targets = [];
    for (let i = 0; i < count; ++i) {
        message.selectable_targets.push({
            id: BufferIO.readInt32(),
            player: BufferIO.readInt8(),
            location: enums.locations[BufferIO.readInt8()],
            index: BufferIO.readInt8(),
            t: BufferIO.readInt8()
        });
    }
}

function msg_soft_chain(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.selectable_targets = [];
    for (let i = 0; i < message.count; ++i) {
        message.selectable_targets.push({
            id: BufferIO.readInt32(),
            player: BufferIO.readInt8(),
            location: enums.locations[BufferIO.readInt8()],
            index: BufferIO.readInt8()
        });
    }
}

function msg_select_disfield(message, BufferIO) {
    message.selecting_player = BufferIO.readInt8();
    message.select_min = BufferIO.readInt8();
    message.selectable_field = ~BufferIO.readInt32(); // mind the bitwise modifier.
    message.selected_field = 0;
}

function msg_sort_card(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.selectable_targets = [];
    for (let i = 0; i < message.count; ++i) {
        message.selectable_targets.push({
            id: BufferIO.readInt32(),
            player: BufferIO.readInt8(),
            location: enums.locations[BufferIO.readInt8()],
            index: BufferIO.readInt8()
        });
    }
}

function msg_confirm_decktop(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push(BufferIO.readInt32());
        BufferIO.move(3);
    }
}

function msg_confirm_cards(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.count = BufferIO.readInt8();
    for (let i = 0; i < message.count; ++i) {
        message.selections.push({
            c: BufferIO.readInt8(),
            l: BufferIO.readInt8(),
            s: BufferIO.readInt8()
        });
    }
}

function msg_update_data(message, BufferIO, gameBoard) {
    message.player = BufferIO.readInt8();
    message.location = enums.locations[BufferIO.readInt8()];
    message.cards = getFieldCards(gameBoard, message.player, message.location, BufferIO);
}

function msg_update_card(message, BufferIO, gameBoard) {
    message.player = BufferIO.readInt8();
    message.location = enums.locations[BufferIO.readInt8()];
    message.index = BufferIO.readInt8();
    message.card = makeCard(BufferIO, message.player, (gameBoard.masterRule === 4));
}

function msg_swap_grave_deck(message, BufferIO) {
    message.player = BufferIO.readInt8();
}

function msg_waiting(message, BufferIO) {
    // Nothing happens, ui only.
}

function msg_deck_top(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.index = BufferIO.readInt8();
    message.id = BufferIO.readInt32();
    message.rev = ((message.id & 0x80000000) !== 0);
}

function msg_shuffle_set_card(message, BufferIO) {
    message.count = BufferIO.readInt8();
    message.targets = [];
    for (let i = 0; i < message.count; ++i) {
        message.targets.push({
            c: BufferIO.readInt8(),
            l: BufferIO.readInt8(),
            s: BufferIO.readInt8()
        });
        BufferIO.readInt8();
    }
    message.new_cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.new_cards.push({
            c: BufferIO.readInt8(),
            l: BufferIO.readInt8(),
            s: BufferIO.readInt8()
        });
        BufferIO.readInt8();
    }
}

function msg_tag_swap(message, BufferIO) {
    message.player = BufferIO.readInt8();
    message.mcount = BufferIO.readInt8();
    message.ecount = BufferIO.readInt8();
    message.pcount = BufferIO.readInt8();
    message.hcount = BufferIO.readInt8();
    message.topcode = BufferIO.readInt32();
    message.hand = [];
    message.extra_deck = [];
    for (let i = 0; i < message.hcount; ++i) {
        message.hand.push(BufferIO.readInt32());
    }
    for (let i = 0; i < message.ecount; ++i) {
        message.extra_deck.push(BufferIO.readInt32());
    }
}

function msg_reload_field(message, BufferIO) {
    message.lp = [];
    message.mzone = [];
    message.stzone = [];
    message.deck = [];
    message.hand = [];
    message.grave = [];
    let val;
    for (let i = 0; i < 2; ++i) {
        message.lp[i] = BufferIO.readInt32();
        for (let seq = 0; seq < 7; ++seq) {
            val = BufferIO.readInt8();
            if (val) {
                let card = {
                    val: val,
                    position: BufferIO.readInt8()
                };
                message.mzone.push(card);
                val = BufferIO.readInt8();
                if (val) {
                    for (let xyz = 0; xyz < val; ++xyz) {
                        message.mzone.push({
                            position: card.position,
                            sequence: seq,
                            overlayunit: xyz
                        });
                    }
                }
            }
        }
        for (let seq = 0; seq < 8; ++seq) {
            val = BufferIO.readInt8();
            if (val) {
                message.stzone.push({
                    sequence: seq,
                    position: BufferIO.readInt8()
                });
            }
        }
        val = BufferIO.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.deck.push({
                sequence: seq
            });
        }
        val = BufferIO.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.hand.push({
                sequence: seq
            });
        }
        val = BufferIO.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.grave.push({
                sequence: seq
            });
        }
        val = BufferIO.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.removed.push({
                sequence: seq
            });
        }
        message.extra_deck_p = BufferIO.readInt8();
    }
    val = BufferIO.readInt8(); //chains
    message.id = BufferIO.readInt32();
    message.pcc = BufferIO.readInt8();
    message.pcl = BufferIO.readInt8();
    message.pcs = BufferIO.readInt8();
    message.subs = BufferIO.readInt8();
    message.cc = BufferIO.readInt8();
    message.cl = BufferIO.readInt8();
    message.cs = BufferIO.readInt8();
    message.desc = BufferIO.readInt32();
}


function stoc_game_msg(packet, message, gameBoard) {
    const BufferIO = new BufferStreamReader(packet.message),
        translator = {
            MSG_RETRY: msg_retry,
            MSG_HINT: msg_hint,
            MSG_WAITING: msg_waiting,
            MSG_START: msg_start,
            MSG_WIN: msg_win,
            MSG_UPDATE_DATA: msg_update_data,
            MSG_UPDATE_CARD: msg_update_card,
            MSG_REQUEST_DECK: msg_request_deck,
            MSG_SELECT_BATTLECMD: msg_select_battlecmd,
            MSG_SELECT_IDLECMD: msg_select_idlecmd,
            MSG_SELECT_EFFECTYN: msg_select_effectyn,
            MSG_SELECT_YESNO: msg_select_yesno,
            MSG_SELECT_OPTION: msg_select_option,
            MSG_SELECT_CARD: msg_select_card,
            MSG_SELECT_CHAIN: msg_select_chain,
            MSG_SELECT_PLACE: msg_select_place,
            MSG_SELECT_POSITION: msg_select_position,
            MSG_SELECT_TRIBUTE: msg_select_tribute,
            MSG_SORT_CHAIN: msg_sort_chain,
            MSG_SELECT_COUNTER: msg_select_counter,
            MSG_SELECT_SUM: msg_select_sum,
            MSG_SELECT_DISFIELD: msg_select_disfield,
            MSG_SORT_CARD: msg_sort_card,
            MSG_CONFIRM_DECKTOP: msg_confirm_decktop,
            MSG_CONFIRM_CARDS: msg_confirm_cards,
            MSG_SHUFFLE_DECK: msg_shuffle_deck,
            MSG_SHUFFLE_HAND: msg_shuffle_hand,
            MSG_REFRESH_DECK: msg_refresh_deck,
            MSG_SWAP_GRAVE_DECK: msg_swap_grace_deck,
            MSG_SHUFFLE_SET_CARD: msg_shuffle_set_card,
            MSG_REVERSE_DECK: msg_reverse_deck,
            MSG_DECK_TOP: msg_deck_top,
            MSG_NEW_TURN: msg_new_turn,
            MSG_NEW_PHASE: msg_new_phase,
            MSG_MOVE: msg_move,
            MSG_POS_CHANGE: msg_pos_change,
            MSG_SET: msg_set,
            MSG_SWAP: msg_swap,
            MSG_FIELD_DISABLED: msg_field_disabled,
            MSG_SUMMONING: msg_summoning,
            MSG_SUMMONED: msg_summoned,
            MSG_SPSUMMONING: msg_spsummoning,
            MSG_SPSUMMONED: msg_spsummoned,
            MSG_FLIPSUMMONING: msg_flipsummoning,
            MSG_FLIPSUMMONED: msg_flipsummoned,
            MSG_CHAINING: msg_chaining,
            MSG_CHAINED: msg_chained,
            MSG_CHAIN_SOLVING: msg_chain_solving,
            MSG_CHAIN_SOLVED: msg_chain_solved,
            MSG_CHAIN_END: msg_chain_end,
            MSG_CHAIN_NEGATED: msg_chain_negated,
            MSG_CHAIN_DISABLED: msg_chain_disabled,
            MSG_CARD_SELECTED: msg_card_selected,
            MSG_RANDOM_SELECTED: msg_random_selected,
            MSG_BECOME_TARGET: msg_become_target,
            MSG_DRAW: msg_draw,
            MSG_DAMAGE: msg_damage,
            MSG_RECOVER: msg_recover,
            MSG_EQUIP: msg_equip,
            MSG_LPUPDATE: msg_lpupdate,
            MSG_UNEQUIP: msg_unequip,
            MSG_CARD_TARGET: msg_card_target,
            MSG_CANCEL_TARGET: msg_cancel_target,
            MSG_PAY_LPCOST: msg_pay_lpcost,
            MSG_ADD_COUNTER: msg_add_counter,
            MSG_REMOVE_COUNTER: msg_remove_conuter,
            MSG_ATTACK: msg_attack,
            MSG_BATTLE: msg_battle,
            MSG_ATTACK_DISABLED: msg_attack_disabled,
            MSG_DAMAGE_STEP_START: msg_damage_start,
            MSG_DAMAGE_STEP_END: msg_damage_step_end,
            MSG_MISSED_EFFECT: msg_missed_effect,
            MSG_BE_CHAIN_TARGET: msg_be_chain_target,
            MSG_CREATE_RELATION: msg_create_relation,
            MSG_RELEASE_RELATION: msg_release_relation,
            MSG_TOSS_COIN: msg_toss_coin,
            MSG_TOSS_DICE: msg_toss_dice,
            MSG_ANNOUNCE_RACE: msg_annound_race,
            MSG_ANNOUNCE_ATTRIB: msg_announce_attrib,
            MSG_ANNOUNCE_CARD: msg_announce_card,
            MSG_ANNOUNCE_NUMBER: msg_announce_number,
            MSG_CARD_HINT: msg_card_hint,
            MSG_TAG_SWAP: msg_tag_swap,
            MSG_RELOAD_FIELD: msg_reload_field,
            MSG_AI_NAME: msg_ai_name,
            MSG_SHOW_HINT: msg_show_hint,
            MSG_MATCH_KILL: msg_match_kill,
            MSG_CUSTOM_MSG: msg_custom_msg
        };
    message.command = enums.STOC.STOC_GAME_MSG[BufferIO.readInt8()];
    translator[message.command](message, BufferIO);
    return message;
}

module.exports = stoc_game_msg;