/* jshint node :true */

var anyalsis = {};
var enums = require('enums').analysis;
var Game = {};

module.exports = function Analyse(msg) {
    var LastMessage = msg;
    var cmsg = new Buffer(msg);
    //Logger.WriteLine(msg);
    switch (msg) {
    case enums.Retry:
        anyalsis.OnRetry();
        return 1;
    case enums.Hint:
        anyalsis.OnHint(cmsg);
        break;
    case enums.Win:
        anyalsis.OnWin(cmsg);
        return 2;
    case enums.SelectBattleCmd:
        anyalsis.OnSelectBattleCmd(cmsg);
        return 1;
    case enums.SelectIdleCmd:
        anyalsis.OnSelectIdleCmd(cmsg);
        return 1;
    case enums.SelectEffectYn:
        anyalsis.OnSelectEffectYn(cmsg);
        return 1;
    case enums.SelectYesNo:
        anyalsis.OnSelectYesNo(cmsg);
        return 1;
    case enums.SelectOption:
        anyalsis.OnSelectOption(cmsg);
        return 1;
    case enums.SelectCard:
    case enums.SelectTribute:
        anyalsis.OnSelectCard(cmsg);
        return 1;
    case enums.SelectChain:
        return anyalsis.OnSelectChain(cmsg);
    case enums.SelectPlace:
    case enums.SelectDisfield:
    case enums.SelectPosition:
        anyalsis.OnSelectPlace(cmsg);
        return 1;
    case enums.SelectCounter:
        anyalsis.OnSelectCounter(cmsg);
        return 1;
    case enums.SelectSum:
        anyalsis.OnSelectSum(cmsg);
        return 1;
    case enums.SortCard:
    case enums.SortChain:
        anyalsis.OnSortCard(cmsg);
        return 1;
    case enums.ConfirmDecktop:
        anyalsis.OnConfirmDecktop(cmsg);
        break;
    case enums.ConfirmCards:
        anyalsis.OnConfirmCards(cmsg);
        break;
    case enums.ShuffleDeck:
    case enums.RefreshDeck:
        anyalsis.SendToAll(cmsg, 1);
        break;
    case enums.ShuffleHand:
        anyalsis.OnShuffleHand(cmsg);
        break;
    case enums.SwapGraveDeck:
        anyalsis.OnSwapGraveDeck(cmsg);
        break;
    case enums.ReverseDeck:
        anyalsis.SendToAll(cmsg, 0);
        break;
    case enums.DeckTop:
        anyalsis.SendToAll(cmsg, 6);
        break;
    case enums.ShuffleSetCard:
        anyalsis.OnShuffleSetCard(cmsg);
        break;
    case enums.NewTurn:
        anyalsis.OnNewTurn(cmsg);
        break;
    case enums.NewPhase:
        anyalsis.OnNewPhase(cmsg);
        break;
    case enums.Move:
        anyalsis.OnMove(cmsg);
        break;
    case enums.PosChange:
        anyalsis.OnPosChange(cmsg);
        break;
    case enums.Set:
        anyalsis.OnSet(cmsg);
        break;
    case enums.Swap:
        anyalsis.SendToAll(cmsg, 16);
        break;
    case enums.FieldDisabled:
        anyalsis.SendToAll(cmsg, 4);
        break;
    case enums.Summoned:
    case enums.SpSummoned:
    case enums.FlipSummoned:
        anyalsis.SendToAll(cmsg, 0);
        Game.RefreshMonsters(0);
        Game.RefreshMonsters(1);
        Game.RefreshSpells(0);
        Game.RefreshSpells(1);
        break;
    case enums.Summoning:
    case enums.SpSummoning:
        anyalsis.SendToAll(cmsg, 8);
        break;
    case enums.FlipSummoning:
        anyalsis.OnFlipSummoning(cmsg);
        break;
    case enums.Chaining:
        anyalsis.SendToAll(cmsg, 16);
        break;
    case enums.Chained:
        anyalsis.SendToAll(cmsg, 1);
        Game.RefreshAll();
        break;
    case enums.ChainSolving:
        anyalsis.SendToAll(cmsg, 1);
        break;
    case enums.ChainSolved:
        anyalsis.SendToAll(cmsg, 1);
        Game.RefreshAll();
        break;
    case enums.ChainEnd:
        anyalsis.SendToAll(cmsg, 0);
        Game.RefreshAll();
        break;
    case enums.ChainNegated:
    case enums.ChainDisabled:
        anyalsis.SendToAll(cmsg, 1);
        break;
    case enums.CardSelected:
        anyalsis.OnCardSelected(cmsg);
        break;
    case enums.RandomSelected:
        anyalsis.OnRandomSelected(cmsg);
        break;
    case enums.BecomeTarget:
        anyalsis.OnBecomeTarget(cmsg);
        break;
    case enums.Draw:
        anyalsis.OnDraw(cmsg);
        break;
    case enums.Damage:
    case enums.Recover:
    case enums.LpUpdate:
    case enums.PayLpCost:
        anyalsis.OnLpUpdate(cmsg);
        break;
    case enums.Equip:
        anyalsis.SendToAll(cmsg, 8);
        break;
    case enums.Unequip:
        anyalsis.SendToAll(cmsg, 4);
        break;
    case enums.CardTarget:
    case enums.CancelTarget:
        anyalsis.SendToAll(cmsg, 8);
        break;
    case enums.AddCounter:
    case enums.RemoveCounter:
        anyalsis.SendToAll(cmsg, 6);
        break;
    case enums.Attack:
        anyalsis.SendToAll(cmsg, 8);
        break;
    case enums.Battle:
        anyalsis.SendToAll(cmsg, 26);
        break;
    case enums.AttackDiabled:
        anyalsis.SendToAll(cmsg, 0);
        break;
    case enums.DamageStepStart:
    case enums.DamageStepEnd:
        anyalsis.SendToAll(cmsg, 0);
        Game.RefreshMonsters(0);
        Game.RefreshMonsters(1);
        break;
    case enums.MissedEffect:
        anyalsis.OnMissedEffect(cmsg);
        break;
    case enums.TossCoin:
    case enums.TossDice:
        anyalsis.OnTossCoin(cmsg);
        break;
    case enums.AnnounceRace:
        anyalsis.OnAnnounceRace(cmsg);
        return 1;
    case enums.AnnounceAttrib:
        anyalsis.OnAnnounceAttrib(cmsg);
        return 1;
    case enums.AnnounceCard:
        anyalsis.OnAnnounceCard(cmsg);
        return 1;
    case enums.AnnounceNumber:
        anyalsis.OnAnnounceNumber(cmsg);
        return 1;
    case enums.CardHint:
        anyalsis.SendToAll(cmsg, 9);
        break;
    case enums.MatchKill:
        anyalsis.OnMatchKill(cmsg);
        break;
    case enums.TagSwap:
        anyalsis.OnTagSwap(cmsg);
        break;
    default:
        throw ("[GameAnalyser] Unhandled packet id: " + msg);
    }
    Game.BonusTime(msg);
    return 0;
};