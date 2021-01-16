/*eslint no-plusplus: 0*/
'use strict';

var enums = require('./enums.js');

const TYPE_LINK = 0x4000000;

function makeCard(BufferIO, controller, masterRule4) {
    'use strict';

    var i,
        count;
    const flag = BufferIO.readInt32(),
        card = {};
    if (flag === 0) {
        return {};
    }

    if (flag & enums.query.Code) {
        card.id = BufferIO.readInt32();
    }
    if (flag & enums.query.Position) {
        card.position = BufferIO.readInt32();
        card.position = enums.positions[((card.position >> 24) & 0xff)];
    }
    if (flag & enums.query.Alias) {
        card.id = BufferIO.readInt32();
    }
    if (flag & enums.query.Type) {
        card.typeVal = BufferIO.readInt32();
        card.type = enums.textTypes[card.typeVal];
    }
    if (flag & enums.query.Level) {
        card.level = BufferIO.readInt32();
    }
    if (flag & enums.query.Rank) {
        card.rank = BufferIO.readInt32();
    }
    if (flag & enums.query.Attribute) {
        card.attribute = enums.cardAttributes[BufferIO.readInt32()];
    }
    if (flag & enums.query.Race) {
        card.race = enums.race[BufferIO.readInt32()];
    }
    if (flag & enums.query.Attack) {
        card.attack = BufferIO.readInt32();
        card.atkstring = [];
        if (card.attack < 0) {
            card.atkstring[0] = '?';
            card.atkstring[1] = 0;
        } else {
            card.atkstring[0] = card.Attack;
            card.atkstring[1] = card.Attack;
        }
    }
    if (flag & enums.query.Defence) {
        card.defence = BufferIO.readInt32();
        card.defstring = [];
        if (card.typeVal & TYPE_LINK) {
            card.defstring[0] = '-';
            card.defstring[1] = 0;
        } else if (card.Defence < 0) {
            card.defstring[0] = '?';
            card.defstring[1] = 0;
        } else {
            card.defstring[0] = card.Defence;
            card.defstring[1] = card.Defence;
        }
    }
    if (flag & enums.query.BaseAttack) {
        card.baseAttack = BufferIO.readInt32();
    }
    if (flag & enums.query.BaseDefence) {
        card.baseDefence = BufferIO.readInt32();
    }
    if (flag & enums.query.Reason) {
        card.reason = BufferIO.readInt32();
    }
    if (flag & enums.query.ReasonCard) {
        card.reasonCard = BufferIO.readInt32();
    }
    if (flag & enums.query.EquipCard) {
        card.equipCard = {
            player: BufferIO.readInt8(),
            location: enums.locations[BufferIO.readInt8()],
            index: BufferIO.readInt8()
        };
        BufferIO.readInt8(); //padding
    }
    if (flag & enums.query.TargetCard) {
        card.targetCard = [];
        const ncount = BufferIO.readInt32();
        for (i = 0; i < ncount; ++i) {
            card.targetCard.push({
                player: BufferIO.readInt8(),
                location: enums.locations[BufferIO.readInt8()],
                index: BufferIO.readInt8()
            });
            BufferIO.readInt8(); //padding
        }
    }
    if (flag & enums.query.OverlayCard) {
        card.overlayCard = [];
        count = BufferIO.readInt32();
        for (i = 0; i < count; ++i) {
            card.overlayCard.push(BufferIO.readInt32());
        }
    }
    if (flag & enums.query.Counters) {
        card.counters = [];
        count = BufferIO.readInt32();
        for (i = 0; i < count; ++i) {
            card.Counters.push({
                counterType: BufferIO.readInt16(),
                amount: BufferIO.readInt16()
            });
        }
    }
    if (flag & enums.query.Owner) {
        card.owner = BufferIO.readInt32();
    }
    if (flag & enums.query.IsDisabled) {
        card.isDisabled = BufferIO.readInt32();
    }
    if (flag & enums.query.IsPublic) {
        card.isPublic = BufferIO.readInt32();
    }
    if (flag & enums.query.LScale) {
        card.LScale = BufferIO.readInt32();
    }
    if (flag & enums.query.RScale) {
        card.RScale = BufferIO.readInt32();
    }
    if (masterRule4) {
        if (flag & enums.query.Link) {
            card.link = BufferIO.readInt32();
            card.linkMarker = BufferIO.readInt32();
        }
    }
    return card;

}
module.exports = makeCard;