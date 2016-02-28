/*jslint browser:true, plusplus:true, bitwise : true*/
/*globals WebSocket, Buffer, enums, makeCard, BufferStreamReader, EventEmitter, duel*/
// buffer.js
// card.js

function Framemaker() {
    "use strict";
    var memory = new Buffer([]);

    this.input = function (buffer) {
        var x = true,
            output = [],
            recordOfBuffer,
            frame_length;
        //console.log('before', memory.length, 'bytes in memory');
        memory = Buffer.concat([memory, buffer]);
        //console.log('concated', memory.length);
        while (x === true && memory.length > 2) {
            frame_length = memory.readUInt16LE(0);
            //console.log('read', frame_length, '(+2) of', memory.length, 'bytes');
            if ((memory.length - 2) < frame_length) {
                //console.log('not enough');
                x = false;
            } else {
                recordOfBuffer = memory.slice(2).toJSON();
                output.push(recordOfBuffer);
                if (memory.length === (frame_length + 2)) {
                    memory = new Buffer([]);
                    x = false;
                } else {
                    memory = memory.slice((frame_length + 2));
                }
                //console.log('after', memory.length);
            }
        }
        //console.log('----',output);
        return output;
    };
    return this;
}


function BufferStreamReader(packet) {
    'use strict';
    /* FH, Buttys, and Tenkei have very annoying code to replicate
    in JavaScript of and around the reading of streammed network
    buffers, this should make it easier. */
    var readposition = 0;
    this.packet = packet; // maybe this should be read only.
    this.readposition = function () {
        return readposition;
    };
    this.setReadposition = function (value) {
        readposition = Number(value);
        return readposition;
    };
    this.ReadInt8 = function () {
        // read 1 byte
        var output = packet[readposition];
        readposition++;
        return output;
    };
    this.ReadUInt8 = this.ReadInt8;
    this.ReadInt16 = function () {
        var output = packet.readUInt16LE(readposition);
        readposition += 2;
        return output;
    };
    this.ReadInt32 = function () {
        var output = packet.readUInt32LE(readposition);
        readposition += 4;
        return output;
    };
    return this;
    // I should later comeback and make this completely array based.
}

function recieveSTOC(packet) {
    // OK!!!! HARD PART!!!!
    // recieve.js should have create obejects with all the parameters as properites, then emit them.
    // its done here because we might need to pass in STATE to the functions also.
    // again if you are fiddling with a state/gui you are doing it wrong!!!
    // data decode and command execution are different conserns.
    'use strict';
    var data = {},
        //makeCard = require('../http/js/card.js'),
        command,
        bitreader = 0,
        iter = 0,
        errorCode,
        i = 0,
        BufferIO = new BufferStreamReader(packet.message);

    data.command = packet.STOC;
    data.packet = packet;

    switch (data.command) {
    case ("STOC_UNKNOWN"):
        break;

    case ("STOC_GAME_MSG"):
        command = enums.STOC.STOC_GAME_MSG[BufferIO.ReadInt8()];
        data.command = command;
        bitreader++;
        switch (command) {
        case ('MSG_RETRY'):
            break;

        case ('MSG_START'):
            data.playertype = BufferIO.ReadInt8();
            data.lifepoints1 = BufferIO.ReadInt32();
            data.lifepoints2 = BufferIO.ReadInt32();
            data.player1decksize = BufferIO.ReadInt16();
            data.player1extrasize = BufferIO.ReadInt16();
            data.player2decksize = BufferIO.ReadInt16();
            data.player2extrasize = BufferIO.ReadInt16();
            data.isFirst = (data.playertype & 0xf) ? false : true;
            break;

        case ('MSG_HINT'):
            data.command = enums.STOC.STOC_GAME_MSG.MSG_HINT[BufferIO.ReadInt8()];
            data.player = BufferIO.ReadInt8(); /* defunct in the code */
            data.data = BufferIO.ReadInt32();
            data.hintforce = BufferIO.ReadInt8();

            switch (data.command) {
            case 'HINT_EVENT':
                //myswprintf(event_string, L"%ls", dataManager.GetDesc(data));
                //this is a rabbit hole, the hint system takes bytes and uses that to 
                //calculate (hurr, god why) the string that should be used from strings.conf
                // like a direct reference would be hard....
                break;
            case 'HINT_MESSAGE':
                //display data.data after processing it against the DB.
                break;
            case 'HINT_SELECTMSG':
                data.select_hint = data.data;
                break;

            case 'HINT_OPSELECTED':
                break;
            case 'HINT_EFFECT':
                data.showcardcode = data.data;
                data.showcarddif = 0;
                data.showcard = 1;
                break;
            }

            break;

        case ('MSG_NEW_TURN'):
            data.player = BufferIO.ReadInt8();
            break;

        case ('MSG_WIN'):
            data.win = BufferIO.ReadInt8();
            //need to double check for more variables
            break;

        case ('MSG_NEW_PHASE'):
            data.phase = BufferIO.ReadInt8();
            break;

        case ('MSG_DRAW'):
            data.player = BufferIO.ReadInt8();
            data.count = BufferIO.ReadInt8();
            data.cardslist = [];
            for (i = 0; i < data.count; ++i) {
                data.cardslist.push({
                    code: BufferIO.ReadInt32()
                });
            }
            break;

        case ('MSG_SHUFFLE_DECK'):
            data.player = BufferIO.ReadInt8();
            break;

        case ('MSG_SHUFFLE_HAND'):
            data.player = BufferIO.ReadInt8();
            data.count = BufferIO.ReadInt8();
            //for some number that cant be determined here because the count was not sent (getting it from the state like an idiot)
            // readint32 off.
            break;

        case ('MSG_CHAINING'):
            data.code = BufferIO.ReadInt32();
            data.pcc = BufferIO.ReadInt8();
            data.pcl = BufferIO.ReadInt8();
            data.pcs = BufferIO.ReadInt8();
            data.subs = BufferIO.ReadInt8();
            data.cc = BufferIO.ReadInt8();
            data.cl = BufferIO.ReadInt8();
            data.cs = BufferIO.ReadInt8();
            data.desc = BufferIO.ReadInt32();
            data.ct = BufferIO.ReadInt8(); // defunct in code
            break;
        case ('MSG_CHAINED'):
            data.ct = BufferIO.ReadInt8();
            break;

        case ('MSG_CHAIN_SOLVING'):
            data.ct = BufferIO.ReadInt8();
            break;

        case ('MSG_CHAIN_SOLVED'):
            data.ct = BufferIO.ReadInt8(); // defunct in the code
            break;

        case ('MSG_CHAIN_END'):
            // remove any liggering chain parts with a graphical command
            break;

        case ('MSG_CHAIN_NEGATED'):
            data.ct = BufferIO.ReadInt8();
            break; //graphical and trigger only for replay

        case ('MSG_CHAIN_DISABLED'):
            data.ct = BufferIO.ReadInt8();
            break; //graphical and trigger only for replay

        case ('MSG_CARD_SELECTED'):
            data.player = BufferIO.ReadInt8();
            data.count = BufferIO.ReadInt8();
            break;
        case ('MSG_RANDOM_SELECTED'):
            data.player = BufferIO.ReadInt8();
            data.count = BufferIO.ReadInt8();
            data.selections = [];
            for (i = 0; i < data.count; ++i) {
                data.selections.push({
                    c: BufferIO.ReadInt8(),
                    l: BufferIO.ReadInt8(),
                    s: BufferIO.ReadInt8(),
                    ss: BufferIO.ReadInt8()
                });
            }
            break;
        case ('MSG_BECOME_TARGET'):
            data.count = BufferIO.ReadInt8();
            data.selections = [];
            for (i = 0; i < data.count; ++i) {
                data.selections.push({
                    c: BufferIO.ReadInt8(),
                    l: BufferIO.ReadInt8(),
                    s: BufferIO.ReadInt8(),
                    ss: BufferIO.ReadInt8() // defunct in code
                });
            }
            break;

        case ('MSG_PAY_LPCOST'):
            data.player = BufferIO.ReadInt8();
            data.lp = BufferIO.ReadInt32();
            data.multiplier = -1;
            break;

        case ('MSG_DAMAGE'):
            data.player = BufferIO.ReadInt8();
            data.lp = BufferIO.ReadInt32();
            data.multiplier = -1;
            break;

        case ('MSG_RECOVER'):
            data.player = BufferIO.ReadInt8();
            data.lp = BufferIO.ReadInt32();
            data.multiplier = 1;
            break;
        case ('MSG_LPUPDATE'):
            data.player = BufferIO.ReadInt8();
            data.lp = BufferIO.ReadInt32();
            data.multiplier = 1;
            break;

        case ('MSG_SUMMONING '):
            data.player = BufferIO.ReadInt8();
            data.code = BufferIO.ReadInt32();
            data.cc = BufferIO.ReadInt8(); //defunct in code
            data.cl = BufferIO.ReadInt8(); //defunct in code
            data.cs = BufferIO.ReadInt8(); //defunct in code
            data.cp = BufferIO.ReadInt8(); //defunct in code
            break;

        case ('MSG_EQUIP'):
            data.c1 = BufferIO.ReadInt8();
            data.l1 = BufferIO.ReadInt8();
            data.s1 = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); //padding wtf
            data.c2 = BufferIO.ReadInt8();
            data.l2 = BufferIO.ReadInt8();
            data.s2 = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); //padding wtf
            break;

        case ('MSG_UNEQUIP'):
            data.c1 = BufferIO.ReadInt8();
            data.l1 = BufferIO.ReadInt8();
            data.s1 = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); //padding wtf
            data.c1 = BufferIO.ReadInt8();
            data.l1 = BufferIO.ReadInt8();
            data.s1 = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); //padding wtf
            break;

        case ('MSG_CANCEL_TARGET'):
            data.c1 = BufferIO.ReadInt8();
            data.l1 = BufferIO.ReadInt8();
            data.s1 = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); //padding wtf
            data.c2 = BufferIO.ReadInt8();
            data.l2 = BufferIO.ReadInt8();
            data.s2 = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); //padding wtf
            break;

        case ('MSG_ADD_COUNTER'):
            data.type = BufferIO.ReadInt16();
            data.c = BufferIO.ReadInt8();
            data.l = BufferIO.ReadInt8();
            data.s = BufferIO.ReadInt8();
            data.count = BufferIO.ReadInt8();
            break;

        case ('MSG_REMOVE_COUNTER'):
            data.type = BufferIO.ReadInt16();
            data.c = BufferIO.ReadInt8();
            data.l = BufferIO.ReadInt8();
            data.s = BufferIO.ReadInt8();
            data.count = BufferIO.ReadInt8();
            break;

        case ('MSG_ATTACK'):
            data.ca = BufferIO.ReadInt8();
            data.la = BufferIO.ReadInt8();
            data.sa = BufferIO.ReadInt8();
            BufferIO.ReadInt8();
            data.cd = BufferIO.ReadInt8();
            data.ld = BufferIO.ReadInt8();
            data.sd = BufferIO.ReadInt8();
            BufferIO.ReadInt8();
            break;
        case ('MSG_BATTLE'):
            data.ca = BufferIO.ReadInt8();
            data.la = BufferIO.ReadInt8();
            data.sa = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); // padding
            data.aatk = BufferIO.ReadInt32();
            data.adef = BufferIO.ReadInt32();
            data.da = BufferIO.ReadInt8(); //defunct
            data.cd = BufferIO.ReadInt8();
            data.ld = BufferIO.ReadInt8();
            data.sd = BufferIO.ReadInt8();
            BufferIO.ReadInt8(); //padding
            data.datk = BufferIO.ReadInt32();
            data.ddef = BufferIO.ReadInt32();
            data.dd = BufferIO.ReadInt8(); //defunct
            break;

        case ('MSG_ATTACK_DISABLED'):
            //myswprintf(event_string, dataManager.GetSysString(1621), dataManager.GetName(mainGame->dField.attacker->code));
            break;

        case ('MSG_DAMAGE_STEP_START'):
            //no code, just a trigger
            break;

        case ('MSG_DAMAGE_STEP_END'):
            //no code just a trigger
            break;
        case ('MSG_MISSED_EFFECT'):
            BufferIO.ReadInt8(); //padding
            data.code = BufferIO.ReadInt32();
            break;
        case ('MSG_TOSS_COIN'):
            //ugh....new BufferIO stuff. Does it take all this to flip a coin?
            break;
        case ('MSG_SELECT_IDLECMD'):
            data.command = 'MSG_SELECT_IDLECMD';
            //https://github.com/Fluorohydride/ygopro/blob/d9450dbb35676db3d5b7c2a5241a54d7f2c21e98/ocgcore/playerop.cpp#L69
            data.idleplayer = BufferIO.ReadInt8();
            data.summonable_cards = [];
            data.spsummonable_cards = [];
            data.repositionable_cards = [];
            data.msetable_cards = [];
            data.ssetable_cards = [];
            data.select_chains = [];
            data.activatable = [];
            data.count = BufferIO.ReadInt8();
            for (i = 0; i < data.count; ++i) {
                data.summonable_cards.push({
                    code: BufferIO.ReadInt32(),
                    controller: BufferIO.ReadInt8(),
                    location: BufferIO.ReadInt8(),
                    sequence: BufferIO.ReadInt8()
                });
            }
            data.count = BufferIO.ReadInt8();
            for (i = 0; i < data.count; ++i) {
                data.spsummonable_cards.push({
                    code: BufferIO.ReadInt32(),
                    controller: BufferIO.ReadInt8(),
                    location: BufferIO.ReadInt8(),
                    sequence: BufferIO.ReadInt8()
                });
            }

            data.count = BufferIO.ReadInt8();

            for (i = 0; i < data.count; ++i) {
                data.repositionable_cards.push({
                    code: BufferIO.ReadInt32(),
                    controller: BufferIO.ReadInt8(),
                    location: BufferIO.ReadInt8(),
                    sequence: BufferIO.ReadInt8()
                });

            }
            data.count = BufferIO.ReadInt8();

            for (i = 0; i < data.count; ++i) {
                data.msetable_cards.push({
                    code: BufferIO.ReadInt32(),
                    controller: BufferIO.ReadInt8(),
                    location: BufferIO.ReadInt8(),
                    sequence: BufferIO.ReadInt8()
                });

            }
            data.count = BufferIO.ReadInt8();

            for (i = 0; i < data.count; ++i) {
                data.select_chains.push({
                    code: BufferIO.ReadInt32(),
                    controller: BufferIO.ReadInt8(),
                    location: BufferIO.ReadInt8(),
                    sequence: BufferIO.ReadInt8()
                });

            }
            data.count = BufferIO.ReadInt8();

            for (i = 0; i < data.count; ++i) {
                data.ssetable_cards.push({
                    code: BufferIO.ReadInt32(),
                    controller: BufferIO.ReadInt8(),
                    location: BufferIO.ReadInt8(),
                    sequence: BufferIO.ReadInt8()
                });

            }

            data.count = BufferIO.ReadInt8();
            for (i = 0; i < data.count; ++i) {
                data.activatable.push({
                    code: BufferIO.ReadInt32(),
                    controller: BufferIO.ReadInt8(),
                    location: BufferIO.ReadInt8(),
                    sequence: BufferIO.ReadInt8()
                });

            }
            data.bp = BufferIO.ReadInt8();
            data.ep = BufferIO.ReadInt8();
            data.shufflecount = BufferIO.ReadInt8();
            break;

        case ('MSG_MOVE'):
            data.code = BufferIO.ReadInt32();
            data.pc = BufferIO.ReadInt8(); // original controller
            data.pl = BufferIO.ReadInt8(); // original cLocation
            data.ps = BufferIO.ReadInt8(); // original sequence (index)
            data.pp = BufferIO.ReadInt8(); // padding??
            data.cc = BufferIO.ReadInt8(); // current controller
            data.cl = BufferIO.ReadInt8(); // current cLocation
            data.cs = BufferIO.ReadInt8(); // current sequence (index)
            data.cp = BufferIO.ReadInt8(); // current position
            data.reason = BufferIO.ReadInt32(); //debug data??
            break;

        case ('MSG_POS_CHANGE'):
            data.code = BufferIO.ReadInt32();
            data.cc = BufferIO.ReadInt8(); // current controller
            data.cl = BufferIO.ReadInt8(); // current cLocation
            data.cs = BufferIO.ReadInt8(); // current sequence (index)
            data.pp = BufferIO.ReadInt8(); // padding??
            data.cp = BufferIO.ReadInt8(); // current position
            break;

        case ('MSG_SET'):
            //check for variables
            break;

        case ('MSG_SWAP'):
            data.code1 = BufferIO.ReadInt8(); // defunct in the code
            data.c1 = BufferIO.ReadInt8();
            data.l1 = BufferIO.ReadInt8();
            data.s1 = BufferIO.ReadInt8();
            data.p1 = BufferIO.ReadInt8(); //defunct in the code
            data.code2 = BufferIO.ReadInt8(); //defunct in the code
            data.c2 = BufferIO.ReadInt8();
            data.l2 = BufferIO.ReadInt8();
            data.s2 = BufferIO.ReadInt8();
            data.p2 = BufferIO.ReadInt8(); //defunct in the code
            break;

        case ('MSG_FIELD_DISABLED'):
            data.disabled = BufferIO.ReadInt8();
            data.ifisfirst_disabled = (data.disabled >> 16) | (data.disabled << 16);
            break;
        case ('MSG_SUMMONING'):
            data.code = BufferIO.ReadInt32();
            //check for variables
            break;

        case ('MSG_SPSUMMONING'):
            data.code = BufferIO.ReadInt32();
            data.cc = BufferIO.ReadInt8();
            data.cl = BufferIO.ReadInt8();
            data.cs = BufferIO.ReadInt8();
            data.cp = BufferIO.ReadInt8();
            break;

        case ('MSG_SUMMONED'):
            //myswprintf(event_string, dataManager.GetSysString(1604));
            //graphical only
            break;

        case ('MSG_SPSUMMONED'):
            //myswprintf(event_string, dataManager.GetSysString(1606));
            //graphical only
            break;

        case ('MSG_FLIPSUMMONED'):
            //myswprintf(event_string, dataManager.GetSysString(1608));
            //graphical only
            break;
        case ('MSG_FLIPSUMMONING'):
            // notice pp is missing, and everything is upshifted; not repeating code.
            data.code = BufferIO.ReadInt32();
            data.cc = BufferIO.ReadInt8(); // current controller
            data.cl = BufferIO.ReadInt8(); // current cLocation
            data.cs = BufferIO.ReadInt8(); // current sequence (index)
            data.cp = BufferIO.ReadInt8(); // current position
            break;

        case ('MSG_REQUEST_DECK'):

            break;
        case ('MSG_SELECT_BATTLECMD'):
            data.selecting_player = BufferIO.ReadInt8(); // defunct in the code, just reading ahead.
            data.count = BufferIO.ReadInt8();
            data.cardsThatCanBattle = [];
            for (i = 0; i < data.count; ++i) {
                data.cardsThatCanBattle.push({
                    con: BufferIO.ReadInt8(),
                    loc: BufferIO.ReadInt8(),
                    seq: BufferIO.ReadInt8(),
                    desc: BufferIO.ReadInt32()
                });
                // client looks at the field, gets a cmdflag, does bytemath on it to see if it can activate.
                // if it can do the can activate animations.

            }
            data.cardsThatAreAttackable = [];
            data.count = BufferIO.ReadInt8();
            for (i = 0; i < data.count; ++i) {
                data.cardsThatAreAttackable.push({
                    code: BufferIO.ReadInt32(),
                    con: BufferIO.ReadInt8(),
                    loc: BufferIO.ReadInt8(),
                    seq: BufferIO.ReadInt8(),
                    diratt: BufferIO.ReadInt32() // defuct in code
                });
            }
            break;
        case ('MSG_SELECT_EFFECTYN'):

            break;

        case ('MSG_SELECT_YESNO'):

            break;
        case ('MSG_SELECT_OPTION'):

            break;
        case ('MSG_SELECT_CARD'):

            break;
        case ('MSG_SELECT_CHAIN'):

            break;
        case ('MSG_SELECT_PLACE' || 'MSG_SELECT_DISFIELD'):
            data.player = BufferIO.ReadInt8(); // defunct in the code.
            data.select_min = BufferIO.ReadInt8();
            data.selectable_field = ~BufferIO.ReadInt32();
            data.selected_field = 0;
            data.respbuf = new Buffer([0, 0, 0]);
            data.pzone = 0;
            data.filter = 0;
            if (data.selectable_field & 0x1f) {
                data.respbuf[0] = duel.isFirst ? 0 : 1;
                data.respbuf[1] = 0x4;
                data.filter = data.selectable_field & 0x1f;
            } else if (data.selectable_field & 0x1f00) {
                data.respbuf[0] = duel.isFirst ? 0 : 1;
                data.respbuf[1] = 0x8;
                data.filter = (data.selectable_field >> 8) & 0x1f;
            } else if (data.selectable_field & 0xc000) {
                data.respbuf[0] = duel.isFirst ? 0 : 1;
                data.respbuf[1] = 0x8;
                data.filter = (data.selectable_field >> 14) & 0x3;
                data.pzone = 1;
            } else if (data.selectable_field & 0x1f0000) {
                data.respbuf[0] = duel.isFirst ? 1 : 0;
                data.respbuf[1] = 0x4;
                data.filter = (data.selectable_field >> 16) & 0x1f;
            } else if (data.selectable_field & 0x1f000000) {
                data.respbuf[0] = duel.isFirst ? 1 : 0;
                data.respbuf[1] = 0x8;
                data.filter = (data.selectable_field >> 24) & 0x1f;
            } else {
                data.respbuf[0] = duel.isFirst ? 1 : 0;
                data.respbuf[1] = 0x8;
                data.filter = (data.selectable_field >> 30) & 0x3;
                data.pzone = 1;
            }
            if (!data.pzone) {
                if (Boolean(localStorage.random_placement)) {
                    data.respbuf[2] = Math.floor(Math.random() * 5);
                    while (!(data.filter & (1 << data.respbuf[2]))) {
                        data.respbuf[2] = Math.floor(Math.random() * 5);
                    }
                } else {
                    if (data.filter & 0x4) {
                        data.respbuf[2] = 2;
                    } else if (data.filter & 0x2) {
                        data.respbuf[2] = 1;
                    } else if (data.filter & 0x8) {
                        data.respbuf[2] = 3;
                    } else if (data.filter & 0x1) {
                        data.respbuf[2] = 0;
                    } else if (data.filter & 0x10) {
                        data.respbuf[2] = 4;
                    }
                }
            } else {
                if (data.filter & 0x1) {
                    data.respbuf[2] = 6;
                } else if (data.filter & 0x2) {
                    data.respbuf[2] = 7;
                }
            }

            break;
        case ('MSG_SELECT_POSITION'):

            break;
        case ('MSG_SELECT_TRIBUTE'):

            break;

        case ('MSG_SORT_CHAIN'):

            break;
        case ('MSG_SELECT_COUNTER'):

            break;
        case ('MSG_SELECT_SUM'):

            break;
        case ('MSG_SELECT_DISFIELD'):

            break;
        case ('MSG_SORT_CARD'):

            break;
        case ('MSG_CONFIRM_DECKTOP'):

            break;
        case ('MSG_CONFIRM_CARDS'):
            data.player = BufferIO.ReadInt8(); /* defunct in code */
            data.count = BufferIO.ReadInt8();
            data.c = undefined;
            data.l = undefined;
            data.s = undefined;
            for (i = 0; i < data.count; ++i) {
                /*sigh this goes into something extremely complex and that overwrites itself*/
            }
            break;


        case ('MSG_UPDATE_DATA'):
            data.player = BufferIO.ReadInt8();
            data.fieldlocation = BufferIO.ReadInt8();
            data.fieldmodel = enums.locations[data.fieldlocation];
            data.message = packet.message;
            data.cards = updateMassCards(data.player, data.fieldlocation, packet.message);
            //mainGame->dField.UpdateFieldCard(player, location, pbuf);
            // ^ problem.
            break;

        case ('MSG_UPDATE_CARD'):
            data.player = BufferIO.ReadInt8();
            data.fieldlocation = BufferIO.ReadInt8();
            data.index = BufferIO.ReadInt8();
            data.card = makeCard(packet.message, 8, data.udplayer).card;
            data.fieldmodel = enums.locations[data.fieldlocation];
            break;

        case ('MSG_WAITING'):
            //mainGame->stHintMsg->setText(dataManager.GetSysString(1390));
            break;
        case ('MSG_SWAP_GRAVE_DECK'):
            data.player = BufferIO.ReadInt8();
            break;

        case ('MSG_REVERSE_DECK'):
            //all graphical from what I can tell.
            break;
        case ('MSG_DECK_TOP'):
            data.player = BufferIO.ReadInt8();
            data.seq = BufferIO.ReadInt8();
            data.code = BufferIO.ReadInt32();
            data.rev = ((data.code & 0x80000000) !== 0);
            break;

        default:
            //console.log('bad', command, packet, data);
            break;
        }
        return data;



    case ("STOC_ERROR_MSG"):
        command = enums.STOC.STOC_ERROR_MSG[BufferIO.ReadInt8()];
        data.command = command;
        // set the screen back to the join screen.
        switch (command) {

        case ('ERRMSG_JOINERROR'):
            break;
        case ('ERRMSG_DECKERROR'):
            data.errorCode = packet.message[1];
            data.cardID = packet.message.readUInt32LE(1);
            // complain about deck error. Invalid Deck.
            data.error = (data.errorCode === 1) ? 'Invalid Deck' : 'Invalid Card, ' + data.cardID; // 
            break;

        case ('ERRMSG_SIDEERROR'):
            // complain about side deck error.
            break;
        case ('ERRMSG_VERERROR'):
            //wierd math to get the version number, displays and complains about it then resets.
            break;
        default:
        }

        break;

    case ("STOC_SELECT_HAND"):
        //visual only trigger
        break;

    case ("STOC_SELECT_TP"):
        //prompt turn player trigger
        break;

    case ("STOC_HAND_RESULT"):
        data.showcardcode = (packet.message[0] - 1) + ((packet.message[1] - 1) << 16);
        data.showcarddif = 50;
        data.showcardp = 0;
        data.showcard = 100;
        data.res1 = packet.message[0];
        data.res2 = packet.message[1];
        break;

    case ("STOC_TP_RESULT"):
        break;
        //Literally exact code in duelist.cpp for STOC_TP_RESULT

    case ("STOC_CHANGE_SIDE"):
        //display the deck builder
        break;

    case ("STOC_WAITING_SIDE"):
        // graphical reset
        break;

    case ("STOC_CREATE_GAME"):
        break;

    case ("STOC_JOIN_GAME"):
        console.log(packet.message);
        data.banlistHashCode = packet.message.readUInt16LE(0);
        data.rule = packet.message[4];
        data.mode = packet.message[5];
        data.prio = packet.message[8];
        data.deckcheck = packet.message[7];
        data.noshuffle = packet.message[8];
        data.startLP = packet.message.readUInt16LE(12);
        data.starthand = packet.message[16];
        data.drawcount = packet.message[17];
        data.timelimit = packet.message.readUInt16LE(18);
        data.message = packet.message;
        break;
    case ("STOC_TYPE_CHANGE"):
        data.typec = packet.message[0];
        data.pos = data.typec & 0xF;
        data.ishost = ((data.typec >> 4) & 0xF) !== 0;
        break;

    case ("STOC_LEAVE_GAME"):
        break;

    case ("STOC_DUEL_START"):
        //trigger to start duel, nothing more.
        break;

    case ("STOC_DUEL_END"):
        //trigger to close the duel, nothing more.
        break;

    case ("STOC_REPLAY"):
        break;

    case ("STOC_TIME_LIMIT"):
        data.player = packet.message[0];
        data.time = packet.message[1] + packet.message[2];
        break;

    case ("STOC_CHAT"):
        data.from = packet.message[0] + packet.message[1];
        data.chat = packet.message.toString('utf16le', 2).replace(/\0/g, '');
        data.len = data.chat.length;
        break;

    case ("STOC_HS_PLAYER_ENTER"):
        data.person = packet.message.toString('utf16le', 0, 39).replace(/\0/g, '');
        data.messagelen = data.person.length;
        data.person = data.person.replace("\u0000", "");
        break;

    case ("STOC_HS_PLAYER_CHANGE"):
        data.change = packet.message[0];
        data.changepos = (data.change >> 4) & 0xF;
        data.state = data.change & 0xF;
        data.stateText = enums.lobbyStates[data.state];

        break;

    case ("STOC_HS_WATCH_CHANGE"):
        data.spectators = packet.message[0];
        break;

    }
    return data;
}


function CommandParser() {
    'use strict';
    var output = {};
    output = new EventEmitter();
    output.input = function (input) {
        output.emit(input.command, input);
    };
    return output;
}