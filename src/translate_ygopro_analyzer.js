const enums = require('./translate_ygopro_enums.js'),
    makeCard = require('./model_ygopro_card.js'),
    BufferStreamReader = require('./model_stream_reader'),
    STOC_GAME_MSG = enums.STOC.enums.STOC_GAME_MSG;


let translator = {};

/**
 * @typedef {Buffer} Packet
 */




function user_interface_only() {}

function unused() {}

function incomplete() {}


function getFieldCards(gameBoard, controller, location, pbuf) {
    'use strict';
    const cards = [],
        values = gameBoard.generateViewCount(controller),
        requiredIterations = values[location];

    for (let i = 0; requiredIterations > i; ++i) {
        const len = pbuf.readInt32();
        if (len > 8) {
            const card = makeCard(pbuf, controller, (gameBoard.masterRule === 4));
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

function getIdleSet(pbuf, hasDescriptions) {
    const cards = [],
        count = pbuf.readInt8();

    if (hasDescriptions) {
        for (let i = 0; i < count; ++i) {
            cards.push({
                id: pbuf.readInt32(),
                player: pbuf.readInt8(),
                location: enums.locations[pbuf.readInt8()],
                index: pbuf.readInt8(),
                description: pbuf.readInt32()
            });
        }
    } else {
        for (let i = 0; i < count; ++i) {
            cards.push({
                id: pbuf.readInt32(),
                player: pbuf.readInt8(),
                location: enums.locations[pbuf.readInt8()],
                index: pbuf.readInt8()
            });
        }
    }
    return cards;
}

function msg_retry(message, pbuf, offset, game) {
    message.desc = 'Error Occurs.';
    game.sendToPlayer(game.lastSentToPlayer, STOC_GAME_MSG, offset.packet, pbuf - offset);
    return 1;
}

function msg_start(message, pbuf, offset, game) {
    message.playertype = pbuf.readInt8();
    message.lifepoints1 = pbuf.readInt32();
    message.lifepoints2 = pbuf.readInt32();
    message.player1decksize = pbuf.readInt16();
    message.player1extrasize = pbuf.readInt16();
    message.player2decksize = pbuf.readInt16();
    message.player2extrasize = pbuf.readInt16();
}

function msg_hint(message, pbuf, offset, game) {
    message.command = pbuf.readInt8();
    message.player = pbuf.readInt8(); /* defunct in the code */
    message.data = pbuf.readInt32();
    switch (message.command) {
        case 5:
            game.sendBufferToPlayer(message.player, STOC_GAME_MSG, offset, pbuf - offset);
            break;
        case 9:
            game.sendBufferToPlayer(1 - message.player, STOC_GAME_MSG, offset, pbuf - offset);
            //send to observers;
            break;
        case 10:
            game.sendBufferToPlayer(0, STOC_GAME_MSG, offset, pbuf - offset);
            game.sendBufferToPlayer(1, STOC_GAME_MSG, offset, pbuf - offset);
            //send to observers;
            break;
        default:
    }
}

function msg_new_turn(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
}

function msg_win(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.type = pbuf.readInt8();
    //need to double check for more variables
    game.sendBufferToPlayer(0, STOC_GAME_MSG, offset, pbuf - offset);
    game.reSendToPlayer(1);
    // send to observers;
    if (message.player > 1) {
        game.match_result[game.duel_count++] = 2;
        game.tp_player = 1 - game.tp_player;
    } else if (players[message.player] == pplayer[message.player]) { //pplayer is not a typo?
        game.match_result[game.duel_count++] = message.player;
        game.tp_player = 1 - message.player;
    } else {
        game.match_result[game.duel_count++] = 1 - message.player;
        game.tp_player = message.player;
    }
    game.endDuel();
    return 2;
}

function msg_new_phase(message, pbuf, offset, game) {
    message.phase = pbuf.readInt8();
    message.gui_phase = enums.phase[message.phase];
}

function msg_draw(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push({
            id: pbuf.readInt32()
        });
    }
}

function msg_shuffle_deck(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
}

function msg_shuffle_hand(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    pbuf.readInt8();
    message.count = pbuf.readInt8();
    //for some number that cant be determined here because the count was not sent (getting it from the state like an idiot)
    // readInt32 off.
}

function msg_shuffle_extra(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    //for some number that cant be determined here because the count was not sent (getting it from the state like an idiot)
    // readInt32 off.
}

function msg_chaining(message, pbuf, offset, game) {
    message.id = pbuf.readInt32();
    message.pc = {
        player: pbuf.readInt8(),
        location: enums.locations[pbuf.readInt8()],
        index: pbuf.readInt8()
    };
    message.subs = pbuf.readInt8();
    message.c = {
        player: pbuf.readInt8(),
        location: enums.locations[pbuf.readInt8()],
        index: pbuf.readInt8()
    };
    message.desc = pbuf.readInt32();
    message.ct = pbuf.readInt8(); // defunct in code
}

function msg_chained(message, pbuf, offset, game) {
    message.chain_link = pbuf.readInt8();
}

function msg_chain_solving(message, pbuf, offset, game) {
    message.chain_link = pbuf.readInt8();
}

function msg_chain_solved(message, pbuf, offset, game) {
    message.ct = pbuf.readInt8(); // defunct in the code
}


function msg_chain_negated(message, pbuf, offset, game) {
    message.chain_link = pbuf.readInt8();
}

function msg_chain_disabled(message, pbuf, offset, game) {
    message.chain_link = pbuf.readInt8();
}

function msg_card_selected(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();

}

function msg_random_selected(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.selections = [];
    for (let i = 0; i < message.count; ++i) {
        message.selections.push({
            c: pbuf.readInt8(),
            l: pbuf.readInt8(),
            s: pbuf.readInt8(),
            ss: pbuf.readInt8()
        });
    }
}

function msg_become_target(message, pbuf, offset, game) {
    message.count = pbuf.readInt8();
    message.selections = [];
    for (let i = 0; i < message.count; ++i) {
        message.selections.push({
            c: pbuf.readInt8(),
            l: pbuf.readInt8(),
            s: pbuf.readInt8(),
            ss: pbuf.readInt8()
        });
    }
}

function msg_pay_lpcost(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = -1;
}

function msg_damage(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = -1;
}

function msg_recover(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = 1;
}

function msg_lpupdate(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = 1;
}

function msg_summoning(message, pbuf, offset, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); //defunct in code
    message.location = enums.locations[pbuf.readInt8()]; //defunct in code
    message.index = pbuf.readInt8(); //defunct in code
    message.position = enums.positions[pbuf.readInt8()];
}

function msg_equip(message, pbuf, offset, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c2 = pbuf.readInt8();
    message.l2 = pbuf.readInt8();
    message.s2 = pbuf.readInt8();
    pbuf.readInt8();
}

function msg_unequip(message, pbuf, offset, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8();
}

function msg_card_target(message, pbuf, offset, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8();
}

function msg_cancel_target(message, pbuf, offset, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c2 = pbuf.readInt8();
    message.l2 = pbuf.readInt8();
    message.s2 = pbuf.readInt8();
    pbuf.readInt8();
}

function msg_add_counter(message, pbuf, offset, game) {
    message.type = pbuf.readInt16();
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    message.count = pbuf.readInt8();
}

function msg_remove_conuter(message, pbuf, offset, game) {
    message.type = pbuf.readInt16();
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    message.count = pbuf.readInt8();
}

function msg_attack(message, pbuf, offset, game) {
    message.attacker = {
        player: pbuf.readInt8(),
        location: enums.locations[pbuf.readInt8()],
        index: pbuf.readInt8()
    };
    pbuf.readInt8();
    message.defender = {
        player: pbuf.readInt8(),
        location: enums.locations[pbuf.readInt8()],
        index: pbuf.readInt8()
    };
    pbuf.readInt8();
}

function msg_battle(message, pbuf, offset, game) {
    message.ca = pbuf.readInt8();
    message.la = pbuf.readInt8();
    message.sa = pbuf.readInt8();
    pbuf.readInt8(); // padding
    message.aatk = pbuf.readInt32();
    message.adef = pbuf.readInt32();
    message.da = pbuf.readInt8(); //defunct
    message.cd = pbuf.readInt8();
    message.ld = pbuf.readInt8();
    message.sd = pbuf.readInt8();
    pbuf.readInt8(); //padding
    message.datk = pbuf.readInt32();
    message.ddef = pbuf.readInt32();
    message.dd = pbuf.readInt8();
    return 1;
}

function msg_missed_effect(pbuf, message) {
    pbuf.readInt8(); //padding
    message.id = pbuf.readInt32();
}

function msg_toss_dice(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.results = [];
    for (let i = 0; i < message.count; ++i) {
        message.results.push(pbuf.readInt8());
    }
}

function msg_rock_paper_scissors(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    return 1;
}

function msg_hand_res(message, pbuf, offset, game) {
    message.res = pbuf.readInt8();
    message.res1 = (message.res & 0x3) - 1;
    message.res2 = ((message.res >> 2) & 0x3) - 1;
}

function msg_toss_coin(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.results = [];
    for (let i = 0; i < message.count; ++i) {
        message.results.push(pbuf.readInt8());
    }
}

function msg_announce_race(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.announce_count = pbuf.readInt8();
    message.avaliable = pbuf.readInt32();
    return 1;
}

function msg_announce_attrib(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.announce_count = pbuf.readInt8();
    message.avaliable = pbuf.readInt32();
    return 1;
}

function msg_announce_card(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.declarable_type = pbuf.readInt32();
    return 1;
}

function msg_announce_number(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.announce_count = pbuf.readInt8();
    message.values = [];
    for (let i = 0; i < message.announce_count; ++i) {
        message.values.push(pbuf.readInt32());
    }
}

function msg_announc_card_filter(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.opcodes = [];
    for (let i = 0; i < message.count; ++i) {
        message.opcodes.push(pbuf.readInt32());
    }
    return 1;
}

function msg_card_hint(message, pbuf, offset, game) {
    message.controller = pbuf.readInt8();
    message.location = pbuf.readInt8();
    message.sequence = pbuf.readInt8();
    pbuf.readInt8(); //padding
    message.chtype = pbuf.readInt8();
    message.value = pbuf.readInt32();
}

function msg_player_hint(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.chtype = pbuf.readInt8();
    message.value = pbuf.readInt32();
}

function msg_match_kill(message, pbuf, offset, game) {
    message.match_kill = pbuf.readInt32();
}

function msg_select_idlecmd(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.summonable_cards = getIdleSet(pbuf);
    message.spsummonable_cards = getIdleSet(pbuf);
    message.repositionable_cards = getIdleSet(pbuf);
    message.msetable_cards = getIdleSet(pbuf);
    message.ssetable_cards = getIdleSet(pbuf);
    message.activatable_cards = getIdleSet(pbuf, true);
    message.enableBattlePhase = pbuf.readInt8();
    message.enableEndPhase = pbuf.readInt8();
    message.shufflecount = pbuf.readInt8();
    game.refreshMzone(0);
    game.refreshMzone(1);
    game.refreshSzone(0);
    game.refreshSzone(1);
    game.refreshHand(0);
    game.refreshHand(1);
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, STOC_GAME_MSG, offset, pbuf - offset);
    return 1;
}

function msg_move(message, pbuf, offset, game) {
    message.id = pbuf.readInt32();
    message.pc = pbuf.readInt8(); // original controller
    message.pl = enums.locations[pbuf.readInt8()]; // original cLocation
    message.ps = pbuf.readInt8(); // original sequence (index)
    message.pp = pbuf.readInt8(); // padding??
    message.cc = pbuf.readInt8(); // current controller
    message.cl = enums.locations[pbuf.readInt8()]; // current cLocation
    message.cs = pbuf.readInt8(); // current sequence (index)
    message.cp = enums.positions[pbuf.readInt8()]; // current position
    message.reason = pbuf.readInt32();
}

function msg_pos_change(message, pbuf, offset, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); // current controller
    message.location = enums.locations[pbuf.readInt8()]; // current cLocation
    message.index = pbuf.readInt8(); // current sequence (index)
    message.pp = pbuf.readInt8(); // padding??
    message.position = enums.positions[pbuf.readInt8()];
}

function msg_set(message, pbuf, offset, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); // current controller
    message.location = enums.locations[pbuf.readInt8()]; // current cLocation
    message.index = pbuf.readInt8(); // current sequence (index)
    message.position = enums.positions[pbuf.readInt8()];
}

function msg_swap(message, pbuf, offset, game) {
    message.id1 = pbuf.readInt8(); // defunct in the code
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    message.p1 = pbuf.readInt8(); //defunct in the code
    message.id2 = pbuf.readInt8(); //defunct in the code
    message.c2 = pbuf.readInt8();
    message.l2 = pbuf.readInt8();
    message.s2 = pbuf.readInt8();
    message.p2 = pbuf.readInt8();
}

function msg_field_disabled(message, pbuf, offset, game) {
    message.disabled = pbuf.readInt32();
    message.ifisfirst_disabled = (message.disabled >> 16) | (message.disabled << 16);
}

function msg_spsummoning(message, pbuf, offset, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    message.position = enums.positions[pbuf.readInt8()];
}

function msg_flipsummoning(message, pbuf, offset, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); // current controller
    message.location = enums.locations[pbuf.readInt8()]; // current cLocation
    message.index = pbuf.readInt8(); // current sequence (index)
    message.position = enums.positions[pbuf.readInt8()];
}

function msg_select_battlecmd(message, pbuf, offset, game) {
    message.player = pbuf.readInt8(); // defunct in the code, just reading ahead.
    message.activatable_cards = getIdleSet(pbuf, true);
    message.attackable_cards = [];
    message.count = pbuf.readInt8();
    for (let i = 0; i < message.count; ++i) {
        message.attackable_cards.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8(),
            diratt: pbuf.readInt8() // defuct in code
        });
    }
    message.enableMainPhase2 = pbuf.readInt8();
    message.enableEndPhase = pbuf.readInt8();
    game.refreshMzone(0);
    game.refreshMzone(1);
    game.refreshSzone(0);
    game.refreshSzone(1);
    game.refreshHand(0);
    game.refreshHand(1);
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, STOC_GAME_MSG, offset, pbuf - offset);
    return 1;
}

function msg_select_effectyn(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.id = pbuf.readInt32();
    message.location = pbuf.readInt8();
    message.index = pbuf.readInt8();
    pbuf.readInt8();
    message.desc = pbuf.readInt32();
    return 1;
}

function msg_select_yesno(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.desc = pbuf.readInt32();
    return 1;
}

function msg_select_option(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push(pbuf.readInt32());
    }
    return 1;
}

function msg_select_card(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.select_cancelable = pbuf.readInt8();
    message.select_min = pbuf.readInt8();
    message.select_max = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8(),
            ss: pbuf.readInt8()
        });
    }
    return 1;
}

function msg_select_chain(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.specount = pbuf.readInt8();
    message.forced = pbuf.readInt8();
    message.hint0 = pbuf.readInt32();
    message.hint1 = pbuf.readInt32();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push({
            flag: pbuf.readInt8(),
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8(),
            ss: pbuf.readInt8(),
            desc: pbuf.readInt32()
        });
    }
    return 1;
}

function msg_select_place(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.select_min = pbuf.readInt8();
    message.selectable_field = ~pbuf.readInt32(); // mind the bitwise modifier.
    message.selected_field = 0;
    message.zones = getSelectableZones(message.selectable_field);
    return 1;
}

function msg_select_position(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.id = pbuf.readInt32();
    message.positionsMask = pbuf.readInt8();
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
    return 1;
}

function msg_select_tribute(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.select_cancelable = pbuf.readInt8() ? true : false;
    message.select_min = pbuf.readInt8();
    message.select_max = pbuf.readInt8();
    const count = pbuf.readInt8();
    message.selectable_targets = [];
    for (let i = 0; i < count; ++i) {
        message.selectable_targets.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8(),
            t: pbuf.readInt8()
        });
    }
    return 1;
}

function msg_select_counter() {
    user_interface_only();
    return 1;
}

function msg_soft_chain(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.selectable_targets = [];
    for (let i = 0; i < message.count; ++i) {
        message.selectable_targets.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8()
        });
    }
}

function msg_select_disfield(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.select_min = pbuf.readInt8();
    message.selectable_field = ~pbuf.readInt32(); // mind the bitwise modifier.
    message.selected_field = 0;
    return 1;
}

function msg_sort_card(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.selectable_targets = [];
    for (let i = 0; i < message.count; ++i) {
        message.selectable_targets.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8()
        });
    }
    return 1;
}

function msg_confirm_decktop(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push(pbuf.readInt32());
        pbuf.move(3);
    }
}

function msg_confirm_extratop(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push(pbuf.readInt32());
        pbuf.move(3);
    }
}

function msg_confirm_cards(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    for (let i = 0; i < message.count; ++i) {
        message.selections.push({
            c: pbuf.readInt8(),
            l: pbuf.readInt8(),
            s: pbuf.readInt8()
        });
    }
}

function msg_update_data(message, pbuf, offset, game, gameBoard) {
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.cards = getFieldCards(gameBoard, message.player, message.location, pbuf);
}

function msg_update_card(message, pbuf, offset, game, gameBoard) {
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    message.card = makeCard(pbuf, message.player, (gameBoard.masterRule === 4));
}

function msg_swap_grave_deck(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
}

function msg_waiting(message, pbuf, offset, game) {
    // Nothing happens, ui only.
}

function msg_deck_top(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.index = pbuf.readInt8();
    message.id = pbuf.readInt32();
    message.rev = ((message.id & 0x80000000) !== 0);
}

function msg_shuffle_set_card(message, pbuf, offset, game) {
    message.location = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.targets = [];
    for (let i = 0; i < message.count; ++i) {
        message.targets.push({
            c: pbuf.readInt8(),
            l: pbuf.readInt8(),
            s: pbuf.readInt8()
        });
        pbuf.readInt8();
    }
    message.new_cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.new_cards.push({
            c: pbuf.readInt8(),
            l: pbuf.readInt8(),
            s: pbuf.readInt8()
        });
        pbuf.readInt8();
    }
}

function msg_tag_swap(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
    message.mcount = pbuf.readInt8();
    message.ecount = pbuf.readInt8();
    message.pcount = pbuf.readInt8();
    message.hcount = pbuf.readInt8();
    message.topcode = pbuf.readInt32();
    message.hand = [];
    message.extra_deck = [];
    for (let i = 0; i < message.hcount; ++i) {
        message.hand.push(pbuf.readInt32());
    }
    for (let i = 0; i < message.ecount; ++i) {
        message.extra_deck.push(pbuf.readInt32());
    }
}

function msg_reload_field(message, pbuf, offset, game) {
    message.lp = [];
    message.mzone = [];
    message.stzone = [];
    message.deck = [];
    message.hand = [];
    message.grave = [];
    message.chains = [];
    message.duel_rule = pbuf.readInt8();
    let val = 0;
    for (let i = 0; i < 2; ++i) {
        message.lp[i] = pbuf.readInt32();
        for (let seq = 0; seq < 7; ++seq) {
            val = pbuf.readInt8();
            if (val) {
                const card = {
                    val: val,
                    position: pbuf.readInt8()
                };
                message.mzone.push(card);
                val = pbuf.readInt8();
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
            val = pbuf.readInt8();
            if (val) {
                message.stzone.push({
                    sequence: seq,
                    position: pbuf.readInt8()
                });
            }
        }
        val = pbuf.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.deck.push({
                sequence: seq
            });
        }
        val = pbuf.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.hand.push({
                sequence: seq
            });
        }
        val = pbuf.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.grave.push({
                sequence: seq
            });
        }
        val = pbuf.readInt8();
        for (let seq = 0; seq < val; ++seq) {
            message.removed.push({
                sequence: seq
            });
        }
        message.extra_deck_p = pbuf.readInt8();
    }
    val = pbuf.readInt8(); //chains
    for (let i = 0; i < val; ++i) {
        message.chains.push({
            id: pbuf.readInt32(),
            pcc: pbuf.readInt8(),
            pcl: pbuf.readInt8(),
            pcs: pbuf.readInt8(),
            subs: pbuf.readInt8(),
            cc: pbuf.readInt8(),
            cl: pbuf.readInt8(),
            cs: pbuf.readInt8(),
            desc: pbuf.readInt32()
        });
    }
}

function msg_request_deck() {
    unused();
}

function msg_sort_chain(message, pbuf, offset, game) {
    msg_sort_chain(message, pbuf, offset, game);
    return 1;
}

function msg_select_sum(message, pbuf, offset, game) {
    message.select_mode = pbuf.readInt8();
    message.select_player = pbuf.readInt8();
    message.select_sumval = pbuf.readInt32();
    message.select_min = pbuf.readInt8();
    message.select_max = pbuf.readInt8();
    message.must_select_count = pbuf.readInt8();
    message.select_panalmode = false;
    message.must_select = [];
    message.can_select = [];
    for (let i = 0; i < message.must_select_count; ++i) {
        message.must_select.push({
            code: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: pbuf.readInt8(),
            index: pbuf.readInt8(),
            opParam: pbuf.readInt32()
        });

    }
    const count = pbuf.readInt8();
    for (let i = 0; i < count; ++i) {
        message.can_select.push({
            code: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: pbuf.readInt8(),
            index: pbuf.readInt8(),
            opParam: pbuf.readInt32()
        });
    }
    return 1;
}

function msg_refresh_deck(message, pbuf, offset, game) {
    message.player = pbuf.readInt8();
}

function msg_swap_grace_deck() {
    unused();
}

function msg_reverse_deck(message, pbuf, offset, game) {
    user_interface_only();
}

function msg_summoned(message, pbuf, offset, game) {
    user_interface_only();
}

function msg_spsummoned(message, pbuf, offset, game) {
    user_interface_only();
}

function msg_flipsummoned(message, pbuf, offset, game) {
    user_interface_only();
}

function msg_chain_end(message, pbuf, offset, game) {
    user_interface_only();
}

function msg_attack_disabled(message, pbuf, offset, game) {
    user_interface_only();
}

function msg_damage_step_start(message, pbuf, offset, game) {
    unused();
}

function msg_damage_step_end(message, pbuf, offset, game) {
    unused();
}

function msg_be_chain_target(message, pbuf, offset, game) {
    unused();
}

function msg_create_relation(message, pbuf, offset, game) {
    unused();
}

function msg_release_relation(message, pbuf, offset, game) {
    unused();
}

function msg_ai_name(message, pbuf, offset, game) {
    unused();
}

function msg_show_hint(message, pbuf, offset, game) {
    unused();
}

function msg_custom_msg(message, pbuf, offset, game) {
    unused();
}

function msg_select_unselect_card(message, pbuf, offset, game) {
    message.selecting_player = pbuf.readInt8();
    message.buttonok = Boolean(!!pbuf.readInt8());
    message.select_cancelable = pbuf.readInt8();
    message.select_min = pbuf.readInt8();
    message.select_max = pbuf.readInt8();
    message.count1 = pbuf.readInt8();
    message.select_ready = false;
    message.cards1 = [];
    message.cards2 = [];
    for (let i = 0; i < message.count1; ++i) {
        message.cards1.push({
            code: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: pbuf.readInt8(),
            index: pbuf.readInt8(),
            ss: pbuf.readInt8()
        });
    }
    message.count2 = pbuf.readInt8();
    for (let i = message.count1; i < message.count1 + message.count2; ++i) {
        message.cards2.push({
            code: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: pbuf.readInt8(),
            index: pbuf.readInt8(),
            ss: pbuf.readInt8()
        });
    }
    return 1;
}

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
    MSG_SHUFFLE_EXTRA: msg_shuffle_extra,
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
    MSG_DAMAGE_STEP_START: msg_damage_step_start,
    MSG_DAMAGE_STEP_END: msg_damage_step_end,
    MSG_MISSED_EFFECT: msg_missed_effect,
    MSG_BE_CHAIN_TARGET: msg_be_chain_target,
    MSG_CREATE_RELATION: msg_create_relation,
    MSG_RELEASE_RELATION: msg_release_relation,
    MSG_TOSS_COIN: msg_toss_coin,
    MSG_TOSS_DICE: msg_toss_dice,
    MSG_ANNOUNCE_RACE: msg_announce_race,
    MSG_ANNOUNCE_ATTRIB: msg_announce_attrib,
    MSG_ANNOUNCE_CARD: msg_announce_card,
    MSG_ANNOUNCE_NUMBER: msg_announce_number,
    MSG_CARD_HINT: msg_card_hint,
    MSG_TAG_SWAP: msg_tag_swap,
    MSG_RELOAD_FIELD: msg_reload_field,
    MSG_AI_NAME: msg_ai_name,
    MSG_SHOW_HINT: msg_show_hint,
    MSG_MATCH_KILL: msg_match_kill,
    MSG_CUSTOM_MSG: msg_custom_msg,
    MSG_SELECT_UNSELECT_CARD: msg_select_unselect_card,
    MSG_CONFIRM_EXTRATOP: msg_confirm_extratop
};

function analyze(engineBuffer, len, game) {


    let offset,
        snippet;

    const msgbuffer = new BufferStreamReader(engineBuffer),
        pbuf = new BufferStreamReader(engineBuffer);

    while (pbuf - msgbuffer < len) {
        snippet = Buffer.from(msgbuffer.packet, pbuf.readposition);
        offset = new BufferStreamReader(snippet);
        const engType = enums.STOC.STOC_GAME_MSG[pbuf.readInt8()];
        console.log(pbuf - msgbuffer);
        if (translator[engType]) {
            console.log(engType);
            var message = {};
            const output = translator[engType](message, pbuf, offset);
            if (output) {
                return output;
            }
        } else {
            debugger;
        }
    }
    return 0;
}

module.exports = analyze;