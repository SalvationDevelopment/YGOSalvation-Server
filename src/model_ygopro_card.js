/*eslint no-plusplus: 0*/
'use strict';

var enums = require('./translate_ygopro_enums.js');

const TYPE_LINK = 0x4000000;

function makeCard(BufferIO, controller, masterRule4) {
    'use strict';

    var i,
        count;
    const flag = BufferIO.readInt32(),
        card = {
            Code: 'cover',
            Position: 'FaceDownAttack',
            controller: controller
        };
    if (flag === 0) {
        return card;
    }

    if (flag & enums.query.Code) {
        card.Code = BufferIO.readInt32();
    }
    if (flag & enums.query.Position) {
        card.Position = BufferIO.readInt32();
        card.Position = (card.Position >> 24) & 0xff;
    }
    if (flag & enums.query.Alias) {
        card.Alias = BufferIO.readInt32();
    }
    if (flag & enums.query.Type) {
        card.TypeVal = BufferIO.readInt32();
        card.Type = enums.textTypes[card.TypeVal];
    }
    if (flag & enums.query.Level) {
        card.Level = BufferIO.readInt32();
    }
    if (flag & enums.query.Rank) {
        card.Rank = BufferIO.readInt32();
    }
    if (flag & enums.query.Attribute) {
        card.Attribute = enums.cardAttributes[BufferIO.readInt32()];
    }
    if (flag & enums.query.Race) {
        card.Race = enums.race[BufferIO.readInt32()];
    }
    if (flag & enums.query.Attack) {
        card.Attack = BufferIO.readInt32();
        card.atkstring = [];
        if (card.Attack < 0) {
            card.atkstring[0] = '?';
            card.atkstring[1] = 0;
        } else {
            card.atkstring[0] = card.Attack;
            card.atkstring[1] = card.Attack;
        }
    }
    if (flag & enums.query.Defence) {
        card.Defence = BufferIO.readInt32();
        card.defstring = [];
        if (card.TypeVal & TYPE_LINK) {
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
        card.BaseAttack = BufferIO.readInt32();
    }
    if (flag & enums.query.BaseDefence) {
        card.BaseDefence = BufferIO.readInt32();
    }
    if (flag & enums.query.Reason) {
        card.Reason = BufferIO.readInt32();
    }
    if (flag & enums.query.ReasonCard) {
        card.ReasonCard = BufferIO.readInt32();
    }
    if (flag & enums.query.EquipCard) {
        card.EquipCard = {
            c: BufferIO.readInt8(),
            l: BufferIO.readInt8(),
            s: BufferIO.readInt8()
        };
        BufferIO.readInt8(); //padding
    }
    if (flag & enums.query.TargetCard) {
        card.TargetCard = [];
        var ncount = BufferIO.readInt32();
        for (i = 0; i < ncount; ++i) {
            console.log(ncount);
            card.TargetCard.push({
                c: BufferIO.readInt8(),
                l: BufferIO.readInt8(),
                s: BufferIO.readInt8()
            });
            BufferIO.readInt8(); //padding
        }
    }
    if (flag & enums.query.OverlayCard) {
        card.OverlayCard = [];
        count = BufferIO.readInt32();
        for (i = 0; i < count; ++i) {
            card.OverlayCard.push(BufferIO.readInt32());
        }
    }
    if (flag & enums.query.Counters) {
        card.Counters = [];
        count = BufferIO.readInt32();
        for (i = 0; i < count; ++i) {
            card.Counters.push({
                counterType: BufferIO.readInt16(),
                amount: BufferIO.readInt16()
            });
        }
    }
    if (flag & enums.query.Owner) {
        card.Owner = BufferIO.readInt32();
    }
    if (flag & enums.query.IsDisabled) {
        card.IsDisabled = BufferIO.readInt32();
    }
    if (flag & enums.query.IsPublic) {
        card.IsPublic = BufferIO.readInt32();
    }
    if (flag & enums.query.LScale) {
        card.LScale = BufferIO.readInt32();
    }
    if (flag & enums.query.RScale) {
        card.RScale = BufferIO.readInt32();
    }
    if (masterRule4) {
        if (flag & enums.query.Link) {
            card.Link = BufferIO.readInt32();
            card.Link_marker = BufferIO.readInt32();
        }
    }
    return card;

}
module.exports = makeCard;