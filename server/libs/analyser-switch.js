/* jshint node :true */

var process = {};
var enums = require('enums').analysis;
var Game = {};

module.exports = function Analyse(msg) {
    var LastMessage = msg;
    var cmsg = new Buffer(msg);
    //Logger.WriteLine(msg);
    switch (msg) {
    case enums.Retry:
        process.OnRetry();
        return 1;
    case enums.Hint:
        process.OnHint(cmsg);
        break;
    case enums.Win:
        process.OnWin(cmsg);
        return 2;
    case enums.SelectBattleCmd:
        process.OnSelectBattleCmd(cmsg);
        return 1;
    case enums.SelectIdleCmd:
        process.OnSelectIdleCmd(cmsg);
        return 1;
    case enums.SelectEffectYn:
        process.OnSelectEffectYn(cmsg);
        return 1;
    case enums.SelectYesNo:
        process.OnSelectYesNo(cmsg);
        return 1;
    case enums.SelectOption:
        process.OnSelectOption(cmsg);
        return 1;
    case enums.SelectCard:
    case enums.SelectTribute:
        process.OnSelectCard(cmsg);
        return 1;
    case enums.SelectChain:
        return process.OnSelectChain(cmsg);
    case enums.SelectPlace:
    case enums.SelectDisfield:
    case enums.SelectPosition:
        process.OnSelectPlace(cmsg);
        return 1;
    case enums.SelectCounter:
        process.OnSelectCounter(cmsg);
        return 1;
    case enums.SelectSum:
        process.OnSelectSum(cmsg);
        return 1;
    case enums.SortCard:
    case enums.SortChain:
        process.OnSortCard(cmsg);
        return 1;
    case enums.ConfirmDecktop:
        process.OnConfirmDecktop(cmsg);
        break;
    case enums.ConfirmCards:
        process.OnConfirmCards(cmsg);
        break;
    case enums.ShuffleDeck:
    case enums.RefreshDeck:
        process.SendToAll(cmsg, 1);
        break;
    case enums.ShuffleHand:
        process.OnShuffleHand(cmsg);
        break;
    case enums.SwapGraveDeck:
        process.OnSwapGraveDeck(cmsg);
        break;
    case enums.ReverseDeck:
        process.SendToAll(cmsg, 0);
        break;
    case enums.DeckTop:
        process.SendToAll(cmsg, 6);
        break;
    case enums.ShuffleSetCard:
        process.OnShuffleSetCard(cmsg);
        break;
    case enums.NewTurn:
        process.OnNewTurn(cmsg);
        break;
    case enums.NewPhase:
        process.OnNewPhase(cmsg);
        break;
    case enums.Move:
        process.OnMove(cmsg);
        break;
    case enums.PosChange:
        process.OnPosChange(cmsg);
        break;
    case enums.Set:
        process.OnSet(cmsg);
        break;
    case enums.Swap:
        process.SendToAll(cmsg, 16);
        break;
    case enums.FieldDisabled:
        process.SendToAll(cmsg, 4);
        break;
    case enums.Summoned:
    case enums.SpSummoned:
    case enums.FlipSummoned:
        process.SendToAll(cmsg, 0);
        Game.RefreshMonsters(0);
        Game.RefreshMonsters(1);
        Game.RefreshSpells(0);
        Game.RefreshSpells(1);
        break;
    case enums.Summoning:
    case enums.SpSummoning:
        process.SendToAll(cmsg, 8);
        break;
    case enums.FlipSummoning:
        process.OnFlipSummoning(cmsg);
        break;
    case enums.Chaining:
        process.SendToAll(cmsg, 16);
        break;
    case enums.Chained:
        process.SendToAll(cmsg, 1);
        Game.RefreshAll();
        break;
    case enums.ChainSolving:
        process.SendToAll(cmsg, 1);
        break;
    case enums.ChainSolved:
        process.SendToAll(cmsg, 1);
        Game.RefreshAll();
        break;
    case enums.ChainEnd:
        process.SendToAll(cmsg, 0);
        Game.RefreshAll();
        break;
    case enums.ChainNegated:
    case enums.ChainDisabled:
        process.SendToAll(cmsg, 1);
        break;
    case enums.CardSelected:
        process.OnCardSelected(cmsg);
        break;
    case enums.RandomSelected:
        process.OnRandomSelected(cmsg);
        break;
    case enums.BecomeTarget:
        process.OnBecomeTarget(cmsg);
        break;
    case enums.Draw:
        process.OnDraw(cmsg);
        break;
    case enums.Damage:
    case enums.Recover:
    case enums.LpUpdate:
    case enums.PayLpCost:
        process.OnLpUpdate(cmsg);
        break;
    case enums.Equip:
        process.SendToAll(cmsg, 8);
        break;
    case enums.Unequip:
        process.SendToAll(cmsg, 4);
        break;
    case enums.CardTarget:
    case enums.CancelTarget:
        process.SendToAll(cmsg, 8);
        break;
    case enums.AddCounter:
    case enums.RemoveCounter:
        process.SendToAll(cmsg, 6);
        break;
    case enums.Attack:
        process.SendToAll(cmsg, 8);
        break;
    case enums.Battle:
        process.SendToAll(cmsg, 26);
        break;
    case enums.AttackDiabled:
        process.SendToAll(cmsg, 0);
        break;
    case enums.DamageStepStart:
    case enums.DamageStepEnd:
        process.SendToAll(cmsg, 0);
        Game.RefreshMonsters(0);
        Game.RefreshMonsters(1);
        break;
    case enums.MissedEffect:
        process.OnMissedEffect(cmsg);
        break;
    case enums.TossCoin:
    case enums.TossDice:
        process.OnTossCoin(cmsg);
        break;
    case enums.AnnounceRace:
        process.OnAnnounceRace(cmsg);
        return 1;
    case enums.AnnounceAttrib:
        process.OnAnnounceAttrib(cmsg);
        return 1;
    case enums.AnnounceCard:
        process.OnAnnounceCard(cmsg);
        return 1;
    case enums.AnnounceNumber:
        process.OnAnnounceNumber(cmsg);
        return 1;
    case enums.CardHint:
        process.SendToAll(cmsg, 9);
        break;
    case enums.MatchKill:
        process.OnMatchKill(cmsg);
        break;
    case enums.TagSwap:
        process.OnTagSwap(cmsg);
        break;
    default:
        throw ("[GameAnalyser] Unhandled packet id: " + msg);
    }
    Game.BonusTime(msg);
    return 0;
};