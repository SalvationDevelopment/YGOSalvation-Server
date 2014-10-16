/* jshint node : true */
var GameServerPacket = function () {};
var Game = {};
var CardLocation = {};
var Program = {};
var GameMessage = require('enums').analysis;
var CardPosition = require('enums').CardPosition;
var SendToAll = function () {};
var SendToPlayer = function () {};
var process = {};

process.OnRetry = function () {
    var player = Game.WaitForResponse();
    Game.CurPlayers[player].Send(new GameServerPacket(GameMessage.Retry));

    Game.Replay.End();
    //File.WriteAllBytes("error_" + DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss") + ".yrp", Game.Replay.GetFile());
};

process.OnHint = function (msg) {
    var type = msg.Reader.ReadByte();
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadInt32();

    var buffer = msg.CreateBuffer();
    var packet = new GameServerPacket(msg.Message);
    packet.Write(buffer);

    switch (type) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
        Game.CurPlayers[player].Send(packet);
        break;
    case 6:
    case 7:
    case 8:
    case 9:
        Game.SendToAllBut(packet, player);
        break;
    case 10:
        if (Game.IsTag)
            Game.CurPlayers[player].Send(packet);
        else
            Game.SendToAll(packet);
        break;
    }
};

process.OnWin = function (msg) {
    var player = msg.Reader.ReadByte();
    var reason = msg.Reader.ReadByte();
    Game.MatchSaveResult(player);
    Game.RecordWin(player, reason);
    SendToAll(msg);
};

process.OnSelectBattleCmd = function (msg) {
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 11);
    count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 8 + 2);
    Game.RefreshAll();
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSelectIdleCmd = function (msg) {
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);
    count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);
    count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);
    count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);
    count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);
    count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 11 + (Program.Config.HandShuffle ? 3 : 2));

    Game.RefreshAll();
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSelectEffectYn = function (msg) {
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(8);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSelectYesNo = function (msg) {
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(4);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSelectOption = function (msg) {
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 4);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSelectCard = function (msg) {
    var packet = new GameServerPacket(msg.Message);

    var player = msg.Reader.ReadByte();
    packet.Write(player);
    packet.Write(msg.Reader.ReadBytes(3));

    var count = msg.Reader.ReadByte();
    packet.Write(count);

    for (var i = 0; i < count; i++) {
        var code = msg.Reader.ReadInt32();
        var pl = msg.Reader.ReadByte();
        var loc = msg.Reader.ReadByte();
        var seq = msg.Reader.ReadByte();
        var pos = msg.Reader.ReadByte();
        packet.Write(pl === player ? code : 0);
        packet.Write(pl);
        packet.Write(loc);
        packet.Write(seq);
        packet.Write(pos);
    }

    Game.WaitForResponse(player);
    Game.CurPlayers[player].Send(packet);
};

process.OnSelectChain = function (msg) {
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(10 + count * 12);

    if (count > 0) {
        Game.WaitForResponse(player);
        SendToPlayer(msg, player);
        return 1;
    }

    Game.SetResponse(-1);
    return 0;
};

process.OnSelectPlace = function (msg) {
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(5);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSelectCounter = function (msg) {
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(3);
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 8);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSelectSum = function (msg) {
    msg.Reader.ReadByte();
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(6);
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 11);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnSortCard = function (msg) {
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnConfirmDecktop = function (msg) {
    msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);
    SendToAll(msg);
};

process.OnConfirmCards = function (msg) {
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 7);

    var buffer = msg.CreateBuffer();
    var packet = new GameServerPacket(msg.Message);
    packet.Write(buffer);
    if (buffer[7] === CardLocation.Hand)
        Game.SendToAll(packet);
    else
        Game.CurPlayers[player].Send(packet);
};

process.OnShuffleHand = function (msg) {
    var packet = new GameServerPacket(msg.Message);
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    packet.Write(player);
    packet.Write(count);

    msg.Reader.ReadBytes(count * 4);
    for (var i = 0; i < count; i++)
        packet.Write(0);

    SendToPlayer(msg, player);
    Game.SendToAllBut(packet, player);
    Game.RefreshHand(player, 0x181fff, false);
};

process.OnSwapGraveDeck = function (msg) {
    var player = msg.Reader.ReadByte();
    SendToAll(msg);
    Game.RefreshGrave(player);
};

process.OnShuffleSetCard = function (msg) {
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 8);
    SendToAll(msg);
    Game.RefreshMonsters(0, 0x181fff, false);
    Game.RefreshMonsters(1, 0x181fff, false);
};

process.OnNewTurn = function (msg) {
    Game.TimeReset();
    if (!Game.IsTag)
        Game.RefreshAll();
    Game.CurrentPlayer = msg.Reader.ReadByte();
    SendToAll(msg);

    if (Game.IsTag && Game.TurnCount > 0) {
        if (Game.TurnCount % 2 === 0) {
            if (Game.CurPlayers[0].Equals(Game.Players[0]))
                Game.CurPlayers[0] = Game.Players[1];
            else
                Game.CurPlayers[0] = Game.Players[0];
        } else {
            if (Game.CurPlayers[1].Equals(Game.Players[2]))
                Game.CurPlayers[1] = Game.Players[3];
            else
                Game.CurPlayers[1] = Game.Players[2];
        }
    }
    Game.TurnCount++;
};

process.OnNewPhase = function (msg) {
    msg.Reader.ReadByte();
    SendToAll(msg);
    Game.RefreshAll();
};

process.OnMove = function (msg) {
    var raw = msg.Reader.ReadBytes(16);
    var pc = raw[4];
    var pl = raw[5];
    var cc = raw[8];
    var cl = raw[9];
    var cs = raw[10];
    var cp = raw[11];

    SendToPlayer(msg, cc);
    var packet = new GameServerPacket(msg.Message);
    packet.Write(raw);
    if (!Boolean((cl & (CardLocation.Grave + CardLocation.Overlay))) && Boolean((cl & (CardLocation.Deck + CardLocation.Hand))) || Boolean((cp & CardPosition.FaceDown))) {
        packet.SetPosition(2);
        packet.Write(0);
    }
    Game.SendToAllBut(packet, cc);

    if (cl !== 0 && (cl & 0x80) === 0 && (cl !== pl || pc !== cc))
        Game.RefreshSingle(cc, cl, cs);
};

process.OnPosChange = function (msg) {
    var raw = msg.Reader.ReadBytes(9);
    SendToAll(msg);

    var cc = raw[4];
    var cl = raw[5];
    var cs = raw[6];
    var pp = raw[7];
    var cp = raw[8];
    if ((pp & CardPosition.FaceDown) !== 0 && (cp & CardPosition.FaceUp) !== 0)
        Game.RefreshSingle(cc, cl, cs);
};

process.OnSet = function (msg) {
    msg.Reader.ReadBytes(4);
    var raw = msg.Reader.ReadBytes(4);
    var packet = new GameServerPacket(GameMessage.Set);
    packet.Write(0);
    packet.Write(raw);
    Game.SendToAll(packet);
};

process.OnFlipSummoning = function (msg) {
    var raw = msg.Reader.ReadBytes(8);
    Game.RefreshSingle(raw[4], raw[5], raw[6]);
    SendToAll(msg);
};

process.OnCardSelected = function (msg) {
    msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 4);
};

process.OnRandomSelected = function (msg) {
    msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 4);
    SendToAll(msg);
};

process.OnBecomeTarget = function (msg) {
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 4);
    SendToAll(msg);
};

process.OnDraw = function (msg) {
    var packet = new GameServerPacket(msg.Message);
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    packet.Write(player);
    packet.Write(count);

    for (var i = 0; i < count; i++) {
        var code = msg.Reader.ReadUInt32();
        if ((code & 0x80000000) !== 0)
            packet.Write(code);
        else
            packet.Write(0);
    }

    SendToPlayer(msg, player);
    Game.SendToAllBut(packet, player);
};

process.OnLpUpdate = function (msg) {
    var player = msg.Reader.ReadByte();
    var value = msg.Reader.ReadInt32();

    switch (msg.Message) {
    case GameMessage.LpUpdate:
        Game.LifePoints[player] = value;
        break;
    case GameMessage.PayLpCost:
    case GameMessage.Damage:
        Game.LifePoints[player] -= value;
        if (Game.LifePoints[player] < 0)
            Game.LifePoints[player] = 0;
        break;
    case GameMessage.Recover:
        Game.LifePoints[player] += value;
        break;
    }

    SendToAll(msg);
};

process.OnMissedEffect = function (msg) {
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(7);
    SendToPlayer(msg, player);
};

process.OnTossCoin = function (msg) {
    msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count);
    SendToAll(msg);
};

process.OnAnnounceRace = function (msg) {
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(5);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnAnnounceAttrib = function (msg) {
    var player = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(5);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnAnnounceCard = function (msg) {
    var player = msg.Reader.ReadByte();
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnAnnounceNumber = function (msg) {
    var player = msg.Reader.ReadByte();
    var count = msg.Reader.ReadByte();
    msg.Reader.ReadBytes(count * 4);
    Game.WaitForResponse(player);
    SendToPlayer(msg, player);
};

process.OnMatchKill = function (msg) {
    msg.Reader.ReadInt32();
    if (Game.IsMatch) {
        Game.MatchKill();
        SendToAll(msg);
    }
};

process.OnTagSwap = function (msg) {
    var packet = new GameServerPacket(GameMessage.TagSwap);

    var player = msg.Reader.ReadByte();
    packet.Write(player);
    packet.Write(msg.Reader.ReadBytes(2));
    var count = msg.Reader.ReadByte();
    packet.Write(count);
    packet.Write(msg.Reader.ReadBytes(4));

    for (var i = 0; i < count; i++) {
        var code = msg.Reader.ReadUInt32();
        if ((code & 0x80000000) !== 0)
            packet.Write(code);
        else
            packet.Write(0);
    }

    SendToPlayer(msg, player);
    Game.SendToAllBut(packet, player);

    Game.RefreshExtra(player);
    Game.RefreshMonsters(0, 0x81fff, false);
    Game.RefreshMonsters(1, 0x81fff, false);
    Game.RefreshSpells(0, 0x681fff, false);
    Game.RefreshSpells(1, 0x681fff, false);
    Game.RefreshHand(0, 0x181fff, false);
    Game.RefreshHand(1, 0x181fff, false);
};

process.SendToAll = function (msg) {
    var buffer = msg.CreateBuffer();
    var packet = new GameServerPacket(msg.Message);
    packet.Write(buffer);
    Game.SendToAll(packet);
};

process.SendToAll = function (msg, length) {
    if (length === 0) {
        Game.SendToAll(new GameServerPacket(msg.Message));
        return;
    }
    msg.Reader.ReadBytes(length);
    SendToAll(msg);
};

process.SendToPlayer = function (msg, player) {
    if (player !== 0 && player !== 1)
        return;
    var buffer = msg.CreateBuffer();
    var packet = new GameServerPacket(msg.Message);
    packet.Write(buffer);
    Game.CurPlayers[player].Send(packet);
};

module.exports = process;