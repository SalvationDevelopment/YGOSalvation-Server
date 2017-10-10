/*eslint no-plusplus: 0*/
'use strict';

/**
 * @typedef YGOProMessage
 * @type {Object}
 * @property {String} command
 * @property {Packet} packet
 */

const enums = require('./translate_ygopro_enums.js'),
    makeCard = require('./model_ygopro_card.js');

/**
 * Takes a packet and makes a readable object out of it.
 * @param {Packet} packet a delimited buffer
 * @returns {BufferStreamReader} Wrapper object around a packet with streamed read functionality.
 */
function BufferStreamReader(packet) {
    var readposition = 0,
        stream = {};
    stream.packet = packet; // maybe stream should be read only.
    stream.readposition = function() {
        return readposition;
    };
    stream.setReadposition = function(value) {
        readposition = Number(value);
        return readposition;
    };
    stream.readInt8 = function() {
        // read 1 byte
        var output = packet[readposition];
        readposition += 1;
        return output;
    };
    stream.readUInt8 = stream.readInt8;
    stream.readInt16 = function() {
        var output = packet.readUInt16LE(readposition);
        readposition += 2;
        return output;
    };
    stream.readInt32 = function() {
        var output = packet.readUInt32LE(readposition);
        readposition += 4;
        return output;
    };
    return stream;
}

/**
 * Turn a delimited packet and turn it into a JavaScript Object.
 * @param {Packet} packet delimited buffer of information containing a YGOProMessage.
 * @returns {YGOProMessage} Object with various types of information stored in it.
 */
function recieveSTOC(packet) {
    var BufferIO = new BufferStreamReader(packet.message),
        command,
        bitreader = 0,
        iter = 0,
        errorCode,
        i = 0,
        message = {
            duelAction: 'ygopro',
            command: packet.command,
            packet: packet
        };

    switch (message.command) {
        case ('STOC_UNKNOWN'):
            message = {
                command: 'STOC_UNKNOWN'
            };
            break;

        case ('STOC_GAME_MSG'):
            command = enums.STOC.STOC_GAME_MSG[BufferIO.readInt8()];
            message.command = command;
            bitreader += 1;
            switch (command) {
                case ('MSG_RETRY'):
                    break;

                case ('MSG_START'):
                    message.playertype = BufferIO.readInt8();
                    message.lifepoints1 = BufferIO.readInt32();
                    message.lifepoints2 = BufferIO.readInt32();
                    message.player1decksize = BufferIO.readInt16();
                    message.player1extrasize = BufferIO.readInt16();
                    message.player2decksize = BufferIO.readInt16();
                    message.player2extrasize = BufferIO.readInt16();
                    break;

                case ('MSG_HINT'):
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

                    break;

                case ('MSG_NEW_TURN'):
                    message.player = BufferIO.readInt8();
                    break;

                case ('MSG_WIN'):
                    message.win = BufferIO.readInt8();
                    //need to double check for more variables
                    break;

                case ('MSG_NEW_PHASE'):
                    message.phase = BufferIO.readInt8();
                    break;

                case ('MSG_DRAW'):
                    message.player = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    message.cardslist = [];
                    for (i = 0; i < message.count; ++i) {
                        message.cardslist.push({
                            code: BufferIO.readInt32()
                        });
                    }
                    break;

                case ('MSG_SHUFFLE_DECK'):
                    message.player = BufferIO.readInt8();
                    break;

                case ('MSG_SHUFFLE_HAND'):
                    message.player = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    //for some number that cant be determined here because the count was not sent (getting it from the state like an idiot)
                    // readInt32 off.
                    break;

                case ('MSG_CHAINING'):
                    message.code = BufferIO.readInt32();
                    message.pcc = BufferIO.readInt8();
                    message.pcl = BufferIO.readInt8();
                    message.pcs = BufferIO.readInt8();
                    message.subs = BufferIO.readInt8();
                    message.cc = BufferIO.readInt8();
                    message.cl = BufferIO.readInt8();
                    message.cs = BufferIO.readInt8();
                    message.desc = BufferIO.readInt32();
                    message.ct = BufferIO.readInt8(); // defunct in code
                    break;
                case ('MSG_CHAINED'):
                    message.ct = BufferIO.readInt8();
                    break;

                case ('MSG_CHAIN_SOLVING'):
                    message.ct = BufferIO.readInt8();
                    break;

                case ('MSG_CHAIN_SOLVED'):
                    message.ct = BufferIO.readInt8(); // defunct in the code
                    break;

                case ('MSG_CHAIN_END'):
                    // remove any liggering chain parts with a graphical command
                    break;

                case ('MSG_CHAIN_NEGATED'):
                    message.ct = BufferIO.readInt8();
                    break; //graphical and trigger only for replay

                case ('MSG_CHAIN_DISABLED'):
                    message.ct = BufferIO.readInt8();
                    break; //graphical and trigger only for replay

                case ('MSG_CARD_SELECTED'):
                    message.player = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    break;
                case ('MSG_RANDOM_SELECTED'):
                    message.player = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    message.selections = [];
                    for (i = 0; i < message.count; ++i) {
                        message.selections.push({
                            c: BufferIO.readInt8(),
                            l: BufferIO.readInt8(),
                            s: BufferIO.readInt8(),
                            ss: BufferIO.readInt8()
                        });
                    }
                    break;
                case ('MSG_BECOME_TARGET'):
                    message.count = BufferIO.readInt8();
                    message.selections = [];
                    for (i = 0; i < message.count; ++i) {
                        message.selections.push({
                            c: BufferIO.readInt8(),
                            l: BufferIO.readInt8(),
                            s: BufferIO.readInt8(),
                            ss: BufferIO.readInt8() // defunct in code
                        });
                    }
                    break;

                case ('MSG_PAY_LPCOST'):
                    message.player = BufferIO.readInt8();
                    message.lp = BufferIO.readInt32();
                    message.multiplier = -1;
                    break;

                case ('MSG_DAMAGE'):
                    message.player = BufferIO.readInt8();
                    message.lp = BufferIO.readInt32();
                    message.multiplier = -1;
                    break;

                case ('MSG_RECOVER'):
                    message.player = BufferIO.readInt8();
                    message.lp = BufferIO.readInt32();
                    message.multiplier = 1;
                    break;
                case ('MSG_LPUPDATE'):
                    message.player = BufferIO.readInt8();
                    message.lp = BufferIO.readInt32();
                    message.multiplier = 1;
                    break;

                case ('MSG_SUMMONING '):
                    message.player = BufferIO.readInt8();
                    message.code = BufferIO.readInt32();
                    message.cc = BufferIO.readInt8(); //defunct in code
                    message.cl = BufferIO.readInt8(); //defunct in code
                    message.cs = BufferIO.readInt8(); //defunct in code
                    message.cp = BufferIO.readInt8(); //defunct in code
                    break;

                case ('MSG_EQUIP'):
                    message.c1 = BufferIO.readInt8();
                    message.l1 = BufferIO.readInt8();
                    message.s1 = BufferIO.readInt8();
                    BufferIO.readInt8(); //padding wtf
                    message.c2 = BufferIO.readInt8();
                    message.l2 = BufferIO.readInt8();
                    message.s2 = BufferIO.readInt8();
                    BufferIO.readInt8(); //padding wtf
                    break;

                case ('MSG_UNEQUIP'):
                    message.c1 = BufferIO.readInt8();
                    message.l1 = BufferIO.readInt8();
                    message.s1 = BufferIO.readInt8();
                    BufferIO.readInt8(); //padding wtf
                    message.c1 = BufferIO.readInt8();
                    message.l1 = BufferIO.readInt8();
                    message.s1 = BufferIO.readInt8();
                    BufferIO.readInt8(); //padding wtf
                    break;

                case ('MSG_CANCEL_TARGET'):
                    message.c1 = BufferIO.readInt8();
                    message.l1 = BufferIO.readInt8();
                    message.s1 = BufferIO.readInt8();
                    BufferIO.readInt8(); //padding wtf
                    message.c2 = BufferIO.readInt8();
                    message.l2 = BufferIO.readInt8();
                    message.s2 = BufferIO.readInt8();
                    BufferIO.readInt8(); //padding wtf
                    break;

                case ('MSG_ADD_COUNTER'):
                    message.type = BufferIO.readInt16();
                    message.c = BufferIO.readInt8();
                    message.l = BufferIO.readInt8();
                    message.s = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    break;

                case ('MSG_REMOVE_COUNTER'):
                    message.type = BufferIO.readInt16();
                    message.c = BufferIO.readInt8();
                    message.l = BufferIO.readInt8();
                    message.s = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    break;

                case ('MSG_ATTACK'):
                    message.ca = BufferIO.readInt8();
                    message.la = BufferIO.readInt8();
                    message.sa = BufferIO.readInt8();
                    BufferIO.readInt8();
                    message.cd = BufferIO.readInt8();
                    message.ld = BufferIO.readInt8();
                    message.sd = BufferIO.readInt8();
                    BufferIO.readInt8();
                    break;
                case ('MSG_BATTLE'):
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
                    message.dd = BufferIO.readInt8(); //defunct
                    break;

                case ('MSG_ATTACK_DISABLED'):
                    //myswprintf(event_string, dataManager.GetSysString(1621), dataManager.GetName(message.attacker->code));
                    break;

                case ('MSG_DAMAGE_STEP_START'):
                    //no code, just a trigger
                    break;

                case ('MSG_DAMAGE_STEP_END'):
                    //no code just a trigger
                    break;
                case ('MSG_MISSED_EFFECT'):
                    BufferIO.readInt8(); //padding
                    message.code = BufferIO.readInt32();
                    break;
                case ('MSG_TOSS_COIN'):
                    //ugh....new BufferIO stuff. Does it take all this to flip a coin?
                    break;
                case ('MSG_SELECT_IDLECMD'):
                    message.command = 'MSG_SELECT_IDLECMD';
                    //https://github.com/Fluorohydride/ygopro/blob/d9450dbb35676db3d5b7c2a5241a54d7f2c21e98/ocgcore/playerop.cpp#L69
                    message.idleplayer = BufferIO.readInt8();
                    i = 0;
                    message.summonable_cards = [];
                    message.count = BufferIO.readInt8();
                    for (i = 0; i < message.count; ++i) {
                        message.summonable_cards.push({
                            code: BufferIO.readInt32(),
                            controller: BufferIO.readInt8(),
                            location: BufferIO.readInt8(),
                            sequence: BufferIO.readInt8()
                        });
                    }
                    iter = 0;

                    message.spsummonable_cards = [];
                    message.count = BufferIO.readInt8();
                    for (i = 0; i < message.count; ++i) {
                        message.spsummonable_cards.push({
                            code: BufferIO.readInt32(),
                            controller: BufferIO.readInt8(),
                            location: BufferIO.readInt8(),
                            sequence: BufferIO.readInt8()
                        });
                    }
                    iter = 0;
                    bitreader += 1;
                    message.repositionable_cards = [];
                    for (i = 0; i < message.count; ++i) {
                        message.repositionable_cards.push({
                            code: packet.message.readUInt16LE(bitreader + 1),
                            controller: packet.message[bitreader + 5],
                            location: packet.message[bitreader + 6],
                            sequence: packet.message[bitreader + 7]
                        });
                        bitreader = bitreader + 7;
                    }
                    iter = 0;
                    bitreader += 1;
                    message.msetable_cards = [];
                    for (iter; packet.message[bitreader] > iter; iter++) {
                        message.msetable_cards.push({
                            code: packet.message.readUInt16LE(bitreader + 1),
                            controller: packet.message[bitreader + 5],
                            location: packet.message[bitreader + 6],
                            sequence: packet.message[bitreader + 7]
                        });
                        bitreader = bitreader + 7;
                    }
                    iter = 0;
                    bitreader += 1;
                    message.select_chains = [];
                    for (iter; packet.message[bitreader] > iter; iter++) {
                        message.select_chains.push({
                            code: packet.message.readUInt16LE(bitreader + 1),
                            controller: packet.message[bitreader + 5],
                            location: packet.message[bitreader + 6],
                            sequence: packet.message[bitreader + 7]
                        });
                        bitreader = bitreader + 7;
                    }
                    iter = 0;
                    bitreader += 1;
                    message.ssetable_cards = [];
                    for (iter; packet.message[bitreader] > iter; iter++) {
                        message.ssetable_cards.push({
                            code: packet.message.readUInt16LE(bitreader + 1),
                            controller: packet.message[bitreader + 5],
                            location: packet.message[bitreader + 6],
                            sequence: packet.message[bitreader + 7]
                        });
                        bitreader = bitreader + 7;
                    }
                    iter = 0;
                    bitreader += 1;
                    message.select_chains = [];
                    for (iter; packet.message[bitreader] > iter; iter++) {
                        message.select_chains.push({
                            code: packet.message.readUInt16LE(bitreader + 1),
                            controller: packet.message[bitreader + 5],
                            location: packet.message[bitreader + 6],
                            sequence: packet.message[bitreader + 7]
                        });
                        bitreader = bitreader + 7;
                    }
                    message.bp = packet.message[bitreader];
                    message.ep = packet.message[bitreader + 1];
                    message.shufflecount = packet.message[bitreader + 2];
                    //https://github.com/Fluorohydride/ygopro/blob/d9450dbb35676db3d5b7c2a5241a54d7f2c21e98/ocgcore/playerop.cpp#L147
                    //something is gonna go wrong;
                    break;

                case ('MSG_MOVE'):
                    message.code = BufferIO.readInt32();
                    message.pc = BufferIO.readInt8(); // original controller
                    message.pl = BufferIO.readInt8(); // original cLocation
                    message.ps = BufferIO.readInt8(); // original sequence (index)
                    message.pp = BufferIO.readInt8(); // padding??
                    message.cc = BufferIO.readInt8(); // current controller
                    message.cl = BufferIO.readInt8(); // current cLocation
                    message.cs = BufferIO.readInt8(); // current sequence (index)
                    message.cp = BufferIO.readInt8(); // current position
                    message.reason = BufferIO.readInt32(); //debug data??
                    break;

                case ('MSG_POS_CHANGE'):
                    message.code = BufferIO.readInt32();
                    message.cc = BufferIO.readInt8(); // current controller
                    message.cl = BufferIO.readInt8(); // current cLocation
                    message.cs = BufferIO.readInt8(); // current sequence (index)
                    message.pp = BufferIO.readInt8(); // padding??
                    message.cp = BufferIO.readInt8(); // current position
                    break;

                case ('MSG_SET'):
                    //check for variables
                    break;

                case ('MSG_SWAP'):
                    message.code1 = BufferIO.readInt8(); // defunct in the code
                    message.c1 = BufferIO.readInt8();
                    message.l1 = BufferIO.readInt8();
                    message.s1 = BufferIO.readInt8();
                    message.p1 = BufferIO.readInt8(); //defunct in the code
                    message.code2 = BufferIO.readInt8(); //defunct in the code
                    message.c2 = BufferIO.readInt8();
                    message.l2 = BufferIO.readInt8();
                    message.s2 = BufferIO.readInt8();
                    message.p2 = BufferIO.readInt8(); //defunct in the code
                    break;

                case ('MSG_FIELD_DISABLED'):
                    message.disabled = BufferIO.readInt8();
                    message.ifisfirst_disabled = (message.disabled >> 16) | (message.disabled << 16);
                    break;
                case ('MSG_SUMMONING'):
                    message.code = BufferIO.readInt32();
                    //check for variables
                    break;

                case ('MSG_SPSUMMONING'):
                    message.code = BufferIO.readInt32();
                    message.cc = BufferIO.readInt8();
                    message.cl = BufferIO.readInt8();
                    message.cs = BufferIO.readInt8();
                    message.cp = BufferIO.readInt8();
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
                    message.code = BufferIO.readInt32();
                    message.cc = BufferIO.readInt8(); // current controller
                    message.cl = BufferIO.readInt8(); // current cLocation
                    message.cs = BufferIO.readInt8(); // current sequence (index)
                    message.cp = BufferIO.readInt8(); // current position
                    break;

                case ('MSG_REQUEST_DECK'):

                    break;
                case ('MSG_SELECT_BATTLECMD'):
                    message.selecting_player = BufferIO.readInt8(); // defunct in the code, just reading ahead.
                    message.count = BufferIO.readInt8();
                    message.cardsThatCanBattle = [];
                    for (i = 0; i < message.count; ++i) {
                        message.cardsThatCanBattle.push({
                            con: BufferIO.readInt8(),
                            loc: BufferIO.readInt8(),
                            seq: BufferIO.readInt8(),
                            desc: BufferIO.readInt32()
                        });
                        // client looks at the field, gets a cmdflag, does bytemath on it to see if it can activate.
                        // if it can do the can activate animations.

                    }
                    message.cardsThatAreAttackable = [];
                    message.count = BufferIO.readInt8();
                    for (i = 0; i < message.count; ++i) {
                        message.cardsThatAreAttackable.push({
                            code: BufferIO.readInt32(),
                            con: BufferIO.readInt8(),
                            loc: BufferIO.readInt8(),
                            seq: BufferIO.readInt8(),
                            diratt: BufferIO.readInt32() // defuct in code
                        });
                    }
                    break;
                case ('MSG_SELECT_EFFECTYN'):
                    message.selecting_player = BufferIO.readInt8();
                    message.c = BufferIO.readInt8();
                    message.cl = BufferIO.readInt8();
                    message.cs = BufferIO.readInt8();
                    message.cp = BufferIO.readInt8();
                    break;

                case ('MSG_SELECT_YESNO'):
                    message.selecting_player = BufferIO.readInt8();
                    message.desc = BufferIO.readInt32();
                    break;
                case ('MSG_SELECT_OPTION'):
                    message.selecting_player = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    message.select_options = [];
                    for (i = 0; i < message.count; ++i) {
                        message.select_options.push(BufferIO.readInt32());
                    }
                    break;
                case ('MSG_SELECT_CARD'):
                    message.selecting_player = BufferIO.readInt8();
                    message.select_cancelable = BufferIO.readInt8();
                    message.select_min = BufferIO.readInt8();
                    message.select_max = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    message.select_options = [];
                    for (i = 0; i < message.count; ++i) {
                        message.select_options.push({
                            code: BufferIO.readInt32(),
                            c: BufferIO.readInt8(),
                            l: BufferIO.readInt8(),
                            s: BufferIO.readInt8(),
                            ss: BufferIO.readInt8()
                        });
                    }
                    break;
                case ('MSG_SELECT_CHAIN'):
                    message.selecting_player = BufferIO.readInt8();
                    message.count = BufferIO.readInt8();
                    message.specount = BufferIO.readInt8();
                    message.forced = BufferIO.readInt8();
                    message.hint0 = BufferIO.readInt32();
                    message.hint1 = BufferIO.readInt32();
                    for (i = 0; i < message.count; ++i) {
                        message.select_options.push({
                            flag: BufferIO.readInt8(),
                            code: BufferIO.readInt32(),
                            c: BufferIO.readInt8(),
                            l: BufferIO.readInt8(),
                            s: BufferIO.readInt8(),
                            ss: BufferIO.readInt8(),
                            desc: BufferIO.readInt32()
                        });
                    }

                    break;
                case ('MSG_SELECT_PLACE'):
                    message.selecting_player = BufferIO.readInt8();
                    message.select_min = BufferIO.readInt8();
                    message.selectable_field = ~BufferIO.readInt32(); // mind the bitwise modifier.
                    message.selected_field = 0;
                    break;
                case ('MSG_SELECT_POSITION'):

                case ('MSG_SELECT_TRIBUTE'):

                    break;

                case ('MSG_SORT_CHAIN'):

                    break;
                case ('MSG_SELECT_COUNTER'):

                    break;
                case ('MSG_SELECT_SUM'):

                    break;
                case ('MSG_SELECT_DISFIELD'):
                    message.selecting_player = BufferIO.readInt8();
                    message.select_min = BufferIO.readInt8();
                    message.selectable_field = ~BufferIO.readInt32(); // mind the bitwise modifier.
                    message.selected_field = 0;
                    break;
                    break;
                case ('MSG_SORT_CARD'):

                    break;
                case ('MSG_CONFIRM_DECKTOP'):

                    break;
                case ('MSG_CONFIRM_CARDS'):
                    message.player = BufferIO.readInt8(); /* defunct in code */
                    message.count = BufferIO.readInt8();
                    message.c = undefined;
                    message.l = undefined;
                    message.s = undefined;
                    for (i = 0; i < message.count; ++i) {
                        /*sigh this goes into something extremely complex and that overwrites itself*/
                    }
                    break;


                case ('MSG_UPDATE_DATA'):
                    message.player = BufferIO.readInt8();
                    message.fieldlocation = BufferIO.readInt8();
                    message.fieldmodel = enums.locations[message.fieldlocation];
                    message.message = packet.message;
                    //message.UpdateFieldCard(player, location, pbuf);
                    // ^ problem.
                    break;

                case ('MSG_UPDATE_CARD'):
                    message.player = BufferIO.readInt8();
                    message.fieldlocation = BufferIO.readInt8();
                    message.index = BufferIO.readInt8();
                    message.card = makeCard(packet.message, 8, message.udplayer).card;
                    message.fieldmodel = enums.locations[message.fieldlocation];
                    break;

                case ('MSG_WAITING'):
                    //mainGame->stHintMsg->setText(dataManager.GetSysString(1390));
                    break;
                case ('MSG_SWAP_GRAVE_DECK'):
                    message.player = BufferIO.readInt8();
                    break;

                case ('MSG_REVERSE_DECK'):
                    //all graphical from what I can tell.
                    break;
                case ('MSG_DECK_TOP'):
                    message.player = BufferIO.readInt8();
                    message.seq = BufferIO.readInt8();
                    message.code = BufferIO.readInt32();
                    message.rev = ((message.code & 0x80000000) !== 0);
                    break;

                default:
                    //console.log('bad', command, packet, task);
                    break;
            }
            return message;



        case ('STOC_ERROR_MSG'):
            command = enums.STOC.STOC_ERROR_MSG[BufferIO.readInt8()];
            message.command = command;
            // set the screen back to the join screen.
            switch (command) {

                case ('ERRMSG_JOINERROR'):
                    break;
                case ('ERRMSG_DECKERROR'):
                    message.errorCode = packet.message[1];
                    message.cardID = packet.message.readUInt32LE(1);
                    // complain about deck error. Invalid Deck.
                    message.error = (message.errorCode === 1) ? 'Invalid Deck' : 'Invalid Card, ' + message.cardID; // 
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

        case ('STOC_SELECT_HAND'):
            //visual only trigger
            break;

        case ('STOC_SELECT_TP'):
            //prompt turn player trigger
            break;

        case ('STOC_HAND_RESULT'):
            message.showcardcode = (packet.message[0] - 1) + ((packet.message[1] - 1) << 16);
            message.showcarddif = 50;
            message.showcardp = 0;
            message.showcard = 100;
            message.res1 = packet.message[0];
            message.res2 = packet.message[1];
            break;

        case ('STOC_TP_RESULT'):
            break;
            //Literally exact code in duelist.cpp for STOC_TP_RESULT

        case ('STOC_CHANGE_SIDE'):
            //display the deck builder
            break;

        case ('STOC_WAITING_SIDE'):
            // graphical reset
            break;

        case ('STOC_CREATE_GAME'):
            break;

        case ('STOC_JOIN_GAME'):
            console.log(packet.message);
            message.banlistHashCode = packet.message.readUInt16LE(0);
            message.rule = packet.message[4];
            message.mode = packet.message[5];
            message.prio = packet.message[8];
            message.deckcheck = packet.message[7];
            message.noshuffle = packet.message[8];
            message.startLP = packet.message.readUInt16LE(12);
            message.start_hand = packet.message[16];
            message.draw_count = packet.message[17];
            message.time_limit = packet.message.readUInt16LE(18);
            message.message = packet.message;
            break;
        case ('STOC_TYPE_CHANGE'):
            message.typec = packet.message[0];
            message.pos = message.typec & 0xF;
            message.ishost = ((message.typec >> 4) & 0xF) !== 0;
            break;

        case ('STOC_LEAVE_GAME'):
            break;

        case ('STOC_DUEL_START'):
            //trigger to start duel, nothing more.
            break;

        case ('STOC_DUEL_END'):
            //trigger to close the duel, nothing more.
            break;

        case ('STOC_REPLAY'):
            break;

        case ('STOC_TIME_LIMIT'):
            message.player = packet.message[0];
            message.time = packet.message[1] + packet.message[2];
            break;

        case ('STOC_CHAT'):
            message.from = packet.message[0] + packet.message[1];
            message.chat = packet.message.toString('utf16le', 2).replace(/\0/g, '');
            message.len = message.chat.length;
            break;

        case ('STOC_HS_PLAYER_ENTER'):
            message.person = packet.message.toString('utf16le', 0, 39).replace(/\0/g, '');
            message.messagelen = message.person.length;
            message.person = message.person.replace('\u0000', '');
            break;

        case ('STOC_HS_PLAYER_CHANGE'):
            message.change = packet.message[0];
            message.changepos = (message.change >> 4) & 0xF;
            message.state = message.change & 0xF;
            message.stateText = enums.lobbyStates[message.state];

            break;

        case ('STOC_HS_WATCH_CHANGE'):
            message.spectators = packet.message[0];
            break;

    }
    return message;
}

module.exports = recieveSTOC;