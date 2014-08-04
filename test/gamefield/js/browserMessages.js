function MessageBrowser(message) {
console.log('MessageBrowser:message: '+message);
}

/* Unity wurde geladen */                
function IsLoaded(){
    console.log('unity loaded')
}

function MessagePopUp(message){
    console.log('MessagePopUp:message: '+message)
}

function OnHubMessage(type, data){
    console.log('onHubMessage type: '+type);
    console.log('onHubMessage data: '+data);
}

/* 
 * Region Lobby 
 */
function SetRoomInfo(roomInfo, info){
    console.log('SetRoomInfo:roominfo: '+roomInfo);
    console.log('SetRoomInfo:info: '+info);
}

//This Refers the you the player and not other players
function PosUpdate(pos){
    console.log('PosUpdate:pos: '+pos);
}

function PlayerEnter(username, pos){
    console.log('PlayerEnter:Username: '+username);
    console.log('PlayerEnter:pos '+pos);
}

function PlayerLeave(pos){
    console.log('PlayerLeave:pos: '+pos);
}

function UpdatePlayer(pos, newpos){
    console.log('UpdatePlayer:pos: '+pos);
    console.log('UpdatePlayer:newpos: '+newpos);
}

/* Zeige ob Spieler Haken ready/nicht ready ist im Host Fenster
 * pos: 0 = erster Spieler, 1 = zweiter Spieler
 * ready = true or false  
 */
function PlayerReady(pos, ready){
    console.log('player pos: '+pos);
    console.log('ready: '+ready);
}

function DeckError(card){
    console.log('DeckError:card: '+card);
}

function SideError(){
    console.log('Sidedeck error');
}

function PlayerMessage(player, message){
    console.log('PlayerMessage:player: '+player);
    console.log('PlayerMessage:message: '+message);
}

/* 
 * Region Duel
 */
function OnWin(result){
    console.log('Onwin:result: '+result);
}

function DuelEnd(){
    console.log('duel end');
}

function SelectRPS(){
    console.log('SelectRPS');
    $('#selectRPS').toggle()
}
function SelectFirstPlayer(){
    console.log('SelectFirstPlayer');
    $('#selectFirstPlayer').toggle()
}
function StartDuel(duelStartData){
    console.log('StartDuel: '+duelStartData);
}
function DrawCard(player, count){
    console.log('Drawcard:player: '+player);
    console.log('Drawcard:count: '+count);
}
function ShuffleDeck(player){
    console.log('ShuffleDeck:player: '+player);
}
function ShuffleHand(player, listCardData){
    console.log('ShuffleHand:player: '+player);
    console.log('Shufflehand:listcardata: '+listCardData);
}
function NewTurn(player){
    console.log('NewTurn:player: '+player);
    
}
function NewPhase(newPhase){
    console.log('NewPhase: '+newPhase);
    // Zeige Background color an welche Phase gerade ist.
    switch(newPhase){
        case 0: // DP
            $("#ep").css("background", "white");
            $("#dp").css("background", "green");
            break;
        case 1: // SP
            $("#dp").css("background", "white");
            $("#sp").css("background", "green");
            break;
        case 2: // MP 1
            $("#sp").css("background", "white");
            $("#mp1").css("background", "green");
            break;
        case 3: // BP
            $("#mp1").css("background", "white");
            $("#bp").css("background", "green");
            break;
        case 4: // MP 2
            $("#bp").css("background", "white");
            $("#mp2").css("background", "green");
            break;
        case 5: // EP
            $("#mp2").css("background", "white");
            $("#ep").css("background", "green");
            break;
    }
}
function IdleCommands(mainPhase){
    console.log('IdleCommands: '+mainPhase);
}
function BattleCommands(battlephase){
    console.log('BattleCommands: '+battlephase);
}
function DamageLifePoints(player, total){
    console.log('DamageLifepoints:player: '+player);
    console.log('DamageLifepoints:total: '+total);
}
function RecoverLifePoints(player, total){
    console.log('RecoverLifepoints:player: '+player);
    console.log('RecoverLifepoints:total: '+total);
}
function UpdateLifePoints(player, lifepoints){
    console.log('UpdateLifepoints:player: '+player);
    console.log('UpdateLifepoints:lifepoints: '+lifepoints);
}
function UpdateCard(player, location, index, cardData){
    console.log('UpdateCard:player: '+player);
    console.log('UpdateCard:location: '+location);
    console.log('UpdateCard:index: '+index);
    console.log('UpdateCard:carddata: '+cardData);
}

/* 
 * Hier werden die Kartenupdates gesendet.
 * Locations:
 *  Deck = 1
 *  Hand = 2
 *  MonsterZone = 4
 *  Spellzone = 8
 *  Grave = 16
 *  Removed = 32
 *  Extra = 64
 *  Overlay = 128
 *  Onfield = 12 
 */ 
function UpdateCards(player, location, cardData){ 
    duel = JSON.parse(cardData);
    
    /*if(player == 0){
    
        switch(location){
            case 1:
                $( "#hzone2" ).empty();
                var i = (card.length);
                for(a = 0; a < i; a++){
                    console.log(card[a].Id);
                    $( "#hzone2" ).append( '<img id="'+card[a].Id+'." src="http://ygopro.de/img/cardpics/'+card[a].Id+'.jpg" width="90"> ' );
                }
                duel.p0.Deck = card;
                break;
            case 2:
                $( "#hzone2" ).empty();
                var i = (card.length);
                for(a = 0; a < i; a++){
                    console.log(card[a].Id);
                    $( "#hzone2" ).append( '<img id="'+card[a].Id+'." src="http://ygopro.de/img/cardpics/'+card[a].Id+'.jpg" width="90"> ' );
                }
                
                
                
                duel.p0.Hand = card;
                break;
            case 4:
                duel.p0.MonsterZone = card;
                break;
            case 8:
                duel.p0.Spellzone = card;
                break;
            case 16:
                duel.p0.Grave = card;
                break;
            case 32:
                duel.p0.Removed = card;
                break;
            case 64:
                duel.p0.Extra = card;
                break;
            case 128:
                duel.p0.Overlay = card;
                break;
            case 12:
                duel.p0.Onfield = card;
                break;             
        }   
    }
    else{
        switch(location){
            case 1:
                duel.p1.Deck = card;
                break;
            case 2:
                duel.p1.Hand = card;
                break;
            case 4:
                duel.p1.MonsterZone = card;
                break;
            case 8:
                duel.p1.Spellzone = card;
                break;
            case 16:
                duel.p1.Grave = card;
                break;
            case 32:
                duel.p1.Removed = card;
                break;
            case 64:
                duel.p1.Extra = card;
                break;
            case 128:
                duel.p1.Overlay = card;
                break;
            case 12:
                duel.p1.Onfield = card;
                break;     
        }   
    }*/
   
console.log(duel);

    //console.log('UpdateCards:player: '+player);
    //console.log('UpdateCards:location: '+location);
    //console.log('UpdateCards:cardata: '+cardData);
    
}
function MoveCard(player, location, index, moveplayer, movelocation, movezone, moveposition){
    console.log('MoveCard:player: '+player);
    console.log('MoveCard:location: '+location);
    console.log('MoveCard:index: '+index);
    console.log('MoveCard:moveplayer: '+moveplayer);
    console.log('MoveCard:movelocation: '+movelocation);
    console.log('MoveCard:movezone: '+movezone);
    console.log('MoveCard:moveposition: '+moveposition);
}
function ChangePosition(player, location, index, newposition){
    console.log('ChangePosition:player '+player);
    console.log('ChangePosition:location '+location);
    console.log('ChangePosition:index '+index);
    console.log('ChangePosition:newposition '+newposition);
}
function SelectCards(cards, min, max, cancelable){
    console.log('SelectCards:cards '+cards);
    console.log('SelectCards:min '+min);
    console.log('SelectCards:max '+max);
    console.log('SelectCards:cancelable: '+cancelable);
}
function ActivateCardEffect(cardid){
    console.log('ActivateCardEffect:cardid: '+cardid);
}
function SelectYn(desc){
    console.log('SelectYn:desc: '+desc);
}
function SelectPosition(positions){
    console.log('SelectPosition: '+positions);
}
function SelectOption(options){
    console.log('SelectOption: '+options);
}
function AnnounceCard(){
    console.log('AnnounceCard');
}
function AnnounceAttribute(count, attributes){
    console.log('AnnounceAttribute:count: '+count);
    console.log('AnnounceAtrribute:attributes: '+attributes);
}
function AnnounceNumber(numbers){
    console.log('AnnounceNumber: '+numbers);
}
function AnnounceRace(count, race){
    console.log('AnnounceRace:count: '+count);
    console.log('AnnounceRace:race: '+race);
}
function SelectSyncoMaterial(sum, min, max, cards){
    console.log('SelectSyncoMaterial:sum: '+sum);
    console.log('SelectSyncoMaterial:min: '+min);
    console.log('SelectSyncoMaterial:max: '+max);
    console.log('SelectSyncoMaterial:cards: '+cards);
}
 /* Locations:
 *  Deck = 1
 *  Hand = 2
 *  MonsterZone = 4
 *  Spellzone = 8
 *  Grave = 16
 *  Removed = 32
 *  Extra = 64
 *  Overlay = 128
 *  Onfield = 12 */ 
function OnChaining(cardpos, desc, forced){
    console.log('OnChaining:cardpos: '+cardpos); // beinhaltet Player: 0/1, Loc: x, Index: 1, Card: card data
    console.log('OnChaining:desc: '+desc);
    console.log('OnChaining:forced: '+forced);
    //ToDo: hightlight the cards which are chainable
}