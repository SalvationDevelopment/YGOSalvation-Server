var battlePack3 = {
        commons: ["1001", "1002", "1003", "1007", "1009", "1010", "1011", "1012", "1016", "1018", "1020", "1021", "1022", "1023", "1024", "1025", "1027", "1028", "1029", "1032", "1035", "1036", "1038", "1045", "1047", "1049", "1050", "1051", "1052", "1054", "1061", "1062", "1063", "1067", "1069", "1070", "1071", "1073", "1077", "1078", "1079", "1080", "1083", "1087", "1088", "1090", "1091", "1092", "1097", "1099", "1100", "1101", "1104", "1105", "1106", "1110", "1111", "1113", "1114", "1115", "1133", "1134", "1135", "1136", "1137", "1138", "1139", "1140", "1141", "1142", "1143", "1144", "1145", "1146", "1147", "1148", "1149", "1150", "1151", "1152", "1153", "1154", "1155", "1156", "1157", "1158", "1159", "1160", "1161", "1162", "1163", "1164", "1165", "1166", "1167", "1168", "1169", "1170", "1171", "1172", "1173", "1174", "1175", "1176", "1177", "1178", "1179", "1180", "1181", "1182", "1183", "1184", "1185", "1186", "1187", "1188", "1189", "1190", "1191", "1192", "1193", "1194", "1195", "1196", "1197", "1198", "1199", "1200", "1201", "1202", "1203", "1204", "1205", "1206", "1207", "1208", "1209", "1210", "1211", "1212", "1213", "1214", "1215", "1216", "1217", "1218", "1219", "1220", "1221", "1222", "1223", "1224", "1225", "1226", "1227", "1228", "1229", "1230", "1231", "1232", "1233", "1234", "1235", "1236", "1237"],
        rares: ["1112", "1107", "1109", "1095", "1094", "1093", "1089", "1098", "1096", "1102", "1103", "1072", "1068", "1060", "1064", "1065", "1066", "1074", "1075", "1076", "1084", "1081", "1082", "1086", "1085", "1026", "1017", "1015", "1019", "1006", "1004", "1005", "1008", "1013", "1014", "1041", "1042", "1043", "1044", "1040", "1039", "1037", "1031", "1033", "1034", "1030", "1048", "1046", "1053", "1055", "1056", "1057", "1058", "1059"],
        shatterfoils: ["1118", "1117", "1116", "1132", "1131", "1130", "1129", "1128", "1127", "1126", "1125", "1124", "1123", "1122", "1121", "1120", "1119"]
    },
    xyzs = [];

function pick(list) {
    'use strict';
    return list[Math.floor(Math.random() * (list.length))];
}

function pickNum(list, num) {
    
    
    'use strict';

    var a = 0;

    var returnList = [];

    var cardToAdd;
    while (a < num)
    {
        cardToAdd = pick(list);

	//Prevents duplicates if the number of cards requested isn't bigger than the length of the list
        if (!(returnList.indexOf(cardToAdd) >= 0) || list.length < num)
        {
            returnList.push(cardToAdd);
            a++;

        }

    }
    return returnList;

}

function makePack() {
    'use strict';
    var pack = [];
    //ooh a pack of cards

    //ick commons;
    pack.push(pick(battlePack3.commons)).push(pick(battlePack3.commons)).push(pick(battlePack3.commons));

    //ooh a rare
    pack.push(pick(battlePack3.rares));

    //ooh shinny!
    pack.push(pick(battlePack3.shatterfoils));
    return pack;
}

function shuffle(array) {
    'use strict';
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function makeDeck(ofXpacks, asPileofCards) {
    'use strict';
    var cardpool = [],
        psudeoDeck = [],
        mainDeck = [],
        extraDeck = [],
        sideDeck = [],
        opening = 0;

    for (opening; ofXpacks > opening; opening++) {
        cardpool.concat(makePack);
    }
    if (asPileofCards) {
        return cardpool;
    }
    cardpool = shuffle(cardpool);
    psudeoDeck = cardpool.filter(function (i) {
        return (xyzs.indexOf(i) > -1);
    });
    extraDeck = cardpool.filter(function (i) {
        return (xyzs.indexOf(i) < -1);
    });
    mainDeck = psudeoDeck.splice(0, 39);
    sideDeck = psudeoDeck.splice(39);

    return {
        main: mainDeck,
        extra: extraDeck,
        side: sideDeck
    };
}

function writeDeckList(deck) {
    'use strict';
    var ydkfile = '',
        mainIter = 0,
        extraIter = 0,
        sideIter = 0;
    ydkfile = ydkfile + '#created by...\r\n';
    ydkfile = ydkfile + '#main\r\n';
    for (mainIter; deck.main.length > mainIter; mainIter++) {
        ydkfile = ydkfile + deck.main[mainIter] + '\r\n';
    }
    ydkfile = ydkfile + '#extra\r\n';
    for (extraIter; deck.extra.length > extraIter; extraIter++) {
        ydkfile = ydkfile + deck.extra[extraIter] + '\r\n';
    }
    ydkfile = ydkfile + '!side\r\n';
    for (sideIter; deck.side.length > sideIter; sideIter++) {
        ydkfile = ydkfile + deck.side[sideIter] + '\r\n';
    }
    return ydkfile;
}