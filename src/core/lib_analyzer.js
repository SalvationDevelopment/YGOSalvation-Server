/*eslint no-plusplus: 0*/
const enums = require('./enums.js'),
    makeCard = require('./lib_card.js'),
    BufferStreamReader = require('./model_stream_reader');


let translator = {};

/**
 * @typedef {Buffer} Packet
 */

function user_interface_only(message, pbuf, game) {
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function unused() { }

function incomplete() { }


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

function msg_retry(message, pbuf, game) {
    message.desc = 'Error Occurs.';
    game.retry();
    return 1;
}

function msg_start(message, pbuf, game) {
    message.playertype = pbuf.readInt8();
    message.lifepoints1 = pbuf.readInt32();
    message.lifepoints2 = pbuf.readInt32();
    message.player1decksize = pbuf.readInt16();
    message.player1extrasize = pbuf.readInt16();
    message.player2decksize = pbuf.readInt16();
    message.player2extrasize = pbuf.readInt16();
}

function msg_hint(message, pbuf, game) {
    message.command = pbuf.readInt8();
    message.player = pbuf.readInt8(); /* defunct in the code */
    message.data = pbuf.readInt32();
    switch (message.command) {
        case 5:
            game.sendBufferToPlayer(message.player, message);
            break;
        case 9:
            game.sendBufferToPlayer(1 - message.player, message);
            game.sendToObservers();
            break;
        case 10:
            game.sendBufferToPlayer(0, message);
            game.sendBufferToPlayer(1, message);
            game.sendToObservers();
            break;
        default:
    }
}

function msg_new_turn(message, pbuf, game) {
    game.refresh(0);
    game.refresh(1);
    message.player = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_win(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.type = pbuf.readInt8();
    //need to double check for more variables
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
    // game ending logic goes here.
    return 2;
}

function msg_new_phase(message, pbuf, game) {
    message.phase = pbuf.readInt16();
    message.gui_phase = enums.phase[message.phase];
    game.refresh(0);
    game.refresh(1);
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_draw(message, pbuf, game) {
    //pbufw issue
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push({
            id: pbuf.readInt32()
        });
    }
    game.sendBufferToPlayer(message.player, message);
    game.reSendToPlayer(1 - message.player);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function msg_shuffle_deck(message, pbuf, game) {
    message.player = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function msg_shuffle_hand(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.codes = [];
    for (let i = 0; i < message.count; ++i) {
        message.codes.push(pbuf.readInt32());
    }
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1 - message.player, message);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function msg_shuffle_extra(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.codes = []; // this is not correct, duelclient.cpp actually has it looking at the cards in the deck. (=_=#[n|m])
    for (let i = 0; i < message.count; ++i) {
        message.codes.push(pbuf.readInt32());
    }
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1 - message.player, message);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function msg_chaining(message, pbuf, game) {
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
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function msg_chained(message, pbuf, game) {
    message.chain_link = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}


function msg_chain_solving(message, pbuf, game) {
    message.chain_link = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();

}

function msg_chain_solved(message, pbuf, game) {
    message.ct = pbuf.readInt8(); // defunct in the code
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
}


function msg_chain_negated(message, pbuf, game) {
    message.chain_link = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
}

function msg_chain_disabled(message, pbuf, game) {
    message.chain_link = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
}

function msg_card_selected(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    // in single this doesnt do anything, is this a bug?
}

function msg_random_selected(message, pbuf, game) {
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
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
}

function msg_become_target(message, pbuf, game) {
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
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();

}

function msg_pay_lpcost(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = -1;
}

function msg_damage(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = -1;
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_recover(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = 1;
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_lpupdate(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.lp = pbuf.readInt32();
    message.multiplier = 1;
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_summoning(message, pbuf, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); //defunct in code
    message.location = enums.locations[pbuf.readInt8()]; //defunct in code
    message.index = pbuf.readInt8(); //defunct in code
    message.position = enums.positions[pbuf.readInt8()];
}

function msg_equip(message, pbuf, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c2 = pbuf.readInt8();
    message.l2 = pbuf.readInt8();
    message.s2 = pbuf.readInt8();
    pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_unequip(message, pbuf, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_card_target(message, pbuf, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_cancel_target(message, pbuf, game) {
    message.c1 = pbuf.readInt8();
    message.l1 = pbuf.readInt8();
    message.s1 = pbuf.readInt8();
    pbuf.readInt8(); //padding wtf
    message.c2 = pbuf.readInt8();
    message.l2 = pbuf.readInt8();
    message.s2 = pbuf.readInt8();
    pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_add_counter(message, pbuf, game) {
    message.type = pbuf.readInt16();
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.select_options = {
        zones: [{
            player: message.player,
            location: message.location,
            index: message.index
        }]
    };
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_remove_conuter(message, pbuf, game) {
    message.type = pbuf.readInt16();
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    message.count = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_attack(message, pbuf, game) {
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
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_battle(message, pbuf, game) {
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
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_missed_effect(pbuf, message, game) {
    var player = pbuf.readInt8(); //padding
    message.id = pbuf.readInt32();
    game.sendBufferToPlayer(player, message);
}

function msg_toss_dice(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.results = [];
    for (let i = 0; i < message.count; ++i) {
        message.results.push(pbuf.readInt8());
    }
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_rock_paper_scissors(message, pbuf, game) {
    message.player = pbuf.readInt8();
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_hand_res(message, pbuf, game) {
    message.res = pbuf.readInt8();
    message.res1 = (message.res & 0x3) - 1;
    message.res2 = ((message.res >> 2) & 0x3) - 1;
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_toss_coin(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.results = [];
    for (let i = 0; i < message.count; ++i) {
        message.results.push(pbuf.readInt8());
    }
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_announce_race(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.announce_count = pbuf.readInt8();
    message.avaliable = pbuf.readInt32();
    message.chkRace = [];
    for (let i = 0, filter = 0x1; i < 25; ++i, filter <<= 1) {
        message.chkRace.push((filter & message.available) ? true : false);
    }

    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_announce_attrib(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.announce_count = pbuf.readInt8();
    message.avaliable = pbuf.readInt32();
    message.options = {};
    for (let i = 0, filter = 0x1; i < 7; ++i, filter <<= 1) {
        message.options[enums.cardAttributes[filter]] = {
            active: Boolean(filter & message.available),
            value: filter
        };
    }
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_announce_card(message, pbuf, game) {
    message.player = pbuf.readInt8();
    game.waitforResponse(message.player);
    message.declarable_type = pbuf.readInt32();
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_announce_number(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.announce_count = pbuf.readInt8();
    message.values = [];
    for (let i = 0; i < message.announce_count; ++i) {
        message.values.push(pbuf.readInt32());
    }
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_announce_card_filter(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.opcodes = [];
    for (let i = 0; i < message.count; ++i) {
        message.opcodes.push(pbuf.readInt32());
    }
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_card_hint(message, pbuf, game) {
    message.controller = pbuf.readInt8();
    message.location = pbuf.readInt8();
    message.sequence = pbuf.readInt8();
    pbuf.readInt8(); //padding
    message.chtype = pbuf.readInt8();
    message.value = pbuf.readInt32();
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
}

function msg_player_hint(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.chtype = pbuf.readInt8();
    message.value = pbuf.readInt32();
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
}

function msg_match_kill(message, pbuf, game) {
    message.match_kill = pbuf.readInt32();
    if (game.match_mode) {
        game.sendBufferToPlayer(0, message);
        game.sendBufferToPlayer(1, message);
        game.sendToObservers();
    }
}

function msg_select_idlecmd(message, pbuf, game) {
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
    game.refresh(0);
    game.refresh(1);
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_move(message, pbuf, game) {
    //pbufw issue
    const pbufw = new BufferStreamReader(pbuf.packet);
    pbufw.readposition = pbuf.readposition;
    message.id = pbuf.readInt32();
    message.previousController = pbuf.readInt8(); // original controller
    message.pl = pbuf.readInt8();
    message.previousLocation = enums.locations[message.pl]; // original cLocation
    message.previousIndex = pbuf.readInt8(); // original sequence (index)
    message.overlayindex = pbuf.readInt8();
    message.currentController = pbuf.readInt8(); // current controller
    message.cl = pbuf.readInt8();
    message.currentLocation = enums.locations[message.cl]; // current cLocation
    message.currentIndex = pbuf.readInt8(); // current sequence (index)
    message.currentPosition = enums.positions[pbuf.readInt8()]; // current position
    message.r = pbuf.readInt32();
    message.reason = enums.reasons[message.r];

    game.sendBufferToPlayer(message.previousController, message);
    game.sendBufferToPlayer(1 - message.previousController, message);
    game.sendToObservers();

    game.refresh(0);
    game.refresh(1);
}

function msg_pos_change(message, pbuf, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); // current controller
    message.location = enums.locations[pbuf.readInt8()]; // current cLocation
    message.index = pbuf.readInt8(); // current sequence (index)
    message.pp = pbuf.readInt8(); // padding??
    message.position = enums.positions[pbuf.readInt8()];
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();

}

function msg_set(message, pbuf, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); // current controller
    message.location = enums.locations[pbuf.readInt8()]; // current cLocation
    message.index = pbuf.readInt8(); // current sequence (index)
    message.position = enums.positions[pbuf.readInt8()];
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
}

function msg_swap(message, pbuf, game) {
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
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function msg_field_disabled(message, pbuf, game) {
    message.disabled = pbuf.readInt32();
    message.ifisfirst_disabled = (message.disabled >> 16) | (message.disabled << 16);
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
}

function msg_spsummoning(message, pbuf, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    message.position = enums.positions[pbuf.readInt8()];
}

function msg_flipsummoning(message, pbuf, game) {
    message.id = pbuf.readInt32();
    message.player = pbuf.readInt8(); // current controller
    message.location = pbuf.readInt8(); // current cLocation
    message.index = pbuf.readInt8(); // current sequence (index)
    message.position = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.sendBufferToPlayer(1, message);
    game.sendToObservers();
    game.refreshSingle(message.player, message.location, message.index);
}

function msg_select_battlecmd(message, pbuf, game) {
    message.player = pbuf.readInt8(); // defunct in the code, just reading ahead.
    message.activatable_cards = getIdleSet(pbuf, true);
    message.count = pbuf.readInt8();
    message.attackable_cards = [];
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
    game.refresh(0);
    game.refresh(1);
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_effectyn(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.id = pbuf.readInt32();
    message.controller = pbuf.readInt8();
    message.location = enums.locations[pbuf.readInt8()];
    message.index = pbuf.readInt8();
    pbuf.readInt8();
    message.desc = pbuf.readInt32();
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_yesno(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.desc = pbuf.readInt32();
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_option(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push(pbuf.readInt32());
    }
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_card(message, pbuf, game) {
    message.player = pbuf.readInt8();
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
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_chain(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.specount = pbuf.readInt8();
    message.select_trigger = (message.specount === 0x7f);
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
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_place(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.select_min = pbuf.readInt8();
    message.selectable_field = ~pbuf.readInt32(); // mind the bitwise modifier.
    message.selected_field = 0;
    message.zones = getSelectableZones(message.selectable_field);
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_position(message, pbuf, game) {
    message.player = pbuf.readInt8();
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
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_tribute(message, pbuf, game) {
    message.player = pbuf.readInt8();
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
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_counter(message, pbuf, game) {
    message.player = pbuf.readInt8();
    pbuf.readposition += 4;
    message.count = pbuf.readInt8();
    pbuf += message.count * 9;
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_soft_chain(message, pbuf, game) {
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

function msg_select_disfield(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.select_min = pbuf.readInt8();
    message.selectable_field = ~pbuf.readInt32(); // mind the bitwise modifier.
    message.selected_field = 0;
    return 1;
}

function msg_sort_card(message, pbuf, game) {
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
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_confirm_decktop(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push(pbuf.readInt32());
        pbuf.move(3);
    }
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_confirm_extratop(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.cards = [];
    for (let i = 0; i < message.count; ++i) {
        message.cards.push(pbuf.readInt32());
        pbuf.move(3);
    }
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_confirm_cards(message, pbuf, game) {
    const LOCATION_DECK = 0x01;
    message.player = pbuf.readInt8();
    message.count = pbuf.readInt8();
    message.select_options = [];
    for (let i = 0; i < message.count; ++i) {
        message.select_options.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(), // really controller
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8()
        });
    }
    if (pbuf[5] !== LOCATION_DECK) {
        game.sendBufferToPlayer(0, message);
        game.reSendToPlayer(1);
        game.sendToObservers();
        return;
    }
    game.sendBufferToPlayer(message.player, message);
    return;
}

function msg_swap_grave_deck(message, pbuf, game) {
    message.player = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);
}

function msg_waiting(message, pbuf, game) {
    // Nothing happens, ui only.
}

function msg_deck_top(message, pbuf, game) {
    message.player = pbuf.readInt8();
    message.index = pbuf.readInt8();
    message.id = pbuf.readInt32();
    message.rev = ((message.id & 0x80000000) !== 0);
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_shuffle_set_card(message, pbuf, game) {
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
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
    game.refresh(0);
    game.refresh(1);

}

function msg_tag_swap(message, pbuf, game) {
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

function msg_reload_field(message, pbuf, game) {
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

function msg_sort_chain(message, pbuf, game) {
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
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_select_sum(message, pbuf, game) {
    message.select_mode = pbuf.readInt8();
    message.player = pbuf.readInt8();
    message.select_sumval = pbuf.readInt32();
    message.select_min = pbuf.readInt8();
    message.select_max = pbuf.readInt8();
    message.must_select_count = pbuf.readInt8();
    message.select_panalmode = false;
    message.must_select = [];
    message.can_select = [];
    for (let i = 0; i < message.must_select_count; ++i) {
        message.must_select.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8(),
            opParam: pbuf.readInt32()
        });

    }
    const count = pbuf.readInt8();
    for (let i = 0; i < count; ++i) {
        message.can_select.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: enums.locations[pbuf.readInt8()],
            index: pbuf.readInt8(),
            opParam: pbuf.readInt32()
        });
    }
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

function msg_refresh_deck(message, pbuf, game) {
    message.player = pbuf.readInt8();
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_reverse_deck(message, pbuf, game) {
    game.sendBufferToPlayer(0, message);
    game.reSendToPlayer(1);
    game.sendToObservers();
}

function msg_summoned(message, pbuf, game) {
    user_interface_only(message, pbuf, game);
}

function msg_spsummoned(message, pbuf, game) {
    user_interface_only(message, pbuf, game);
}

function msg_flipsummoned(message, pbuf, game) {
    user_interface_only(message, pbuf, game);
}

function msg_chain_end(message, pbuf, game) {
    user_interface_only(message, pbuf, game);
}

function msg_attack_disabled(message, pbuf, game) {
    user_interface_only(message, pbuf, game);
}

function msg_damage_step_start(message, pbuf, game) {
    user_interface_only(message, pbuf, game);
}

function msg_damage_step_end(message, pbuf, game) {
    user_interface_only(message, pbuf, game);
}

function msg_be_chain_target(message, pbuf, game) {
    unused();
}

function msg_create_relation(message, pbuf, game) {
    unused();
}

function msg_release_relation(message, pbuf, game) {
    unused();
}

function msg_ai_name(message, pbuf, game) {
    unused();
}

function msg_show_hint(message, pbuf, game) {
    unused();
}

function msg_custom_msg(message, pbuf, game) {
    unused();
}

function msg_select_unselect_card(message, pbuf, game) {
    message.player = pbuf.readInt8();
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
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: pbuf.readInt8(),
            index: pbuf.readInt8(),
            ss: pbuf.readInt8()
        });
    }
    message.count2 = pbuf.readInt8();
    for (let i = message.count1; i < message.count1 + message.count2; ++i) {
        message.cards2.push({
            id: pbuf.readInt32(),
            player: pbuf.readInt8(),
            location: pbuf.readInt8(),
            index: pbuf.readInt8(),
            ss: pbuf.readInt8()
        });
    }
    game.waitforResponse(message.player);
    game.sendBufferToPlayer(message.player, message);
    return 1;
}

translator = {
    MSG_RETRY: msg_retry,
    MSG_HINT: msg_hint,
    MSG_PLAYER_HINT: msg_player_hint,
    MSG_WAITING: msg_waiting,
    MSG_START: msg_start,
    MSG_WIN: msg_win,
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
    MSG_SWAP_GRAVE_DECK: msg_swap_grave_deck,
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
    MSG_CONFIRM_EXTRATOP: msg_confirm_extratop,
    MSG_ROCK_PAPER_SCISSORS: msg_rock_paper_scissors,
    MSG_HAND_RES: msg_hand_res,
    MSG_ANNOUNCE_CARD_FILTER: msg_announce_card_filter
};

/**
 * 
 * @param {Buffer} coreMessage Message from ygopro-core
 * @param {Number} length Number of messages in the buffer
 * @param {Duel} game Duel Instance
 * @returns {Number} action enum to take
 */
function analyze(coreMessage, length, game) {
    const msgbuffer = new BufferStreamReader(coreMessage),
        pbuf = new BufferStreamReader(coreMessage);

    while (pbuf - msgbuffer < length) {
        const commandEnum = pbuf.readInt8(),
            messageFunction = enums.STOC.STOC_GAME_MSG[commandEnum];
        let output = 0;
        if (!translator[messageFunction]) {
            // there should always be a function to run. Otherwise is a bug in the BufferStreamReader step logic.
            throw new Error(`Missing translation function: ${commandEnum}`);
        }
        var message = {
            command: messageFunction
        };
        if (!messageFunction && commandEnum) {
            throw new Error(`Did not comprehend enum:, ${commandEnum}`);
        }

        console.log(messageFunction);

        output = (messageFunction) ? translator[messageFunction](message, pbuf, game) : 0;
        if (output) {
            return output;
        }
    }
    return 0;
}

module.exports = analyze;