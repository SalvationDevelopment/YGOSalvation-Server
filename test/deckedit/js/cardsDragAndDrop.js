    mainDeckList = new Array();
    xtraDeckList = new Array();
    sideDeckList = new Array();
    moep = '';
    
    
$( init );
 
function init() {
  $('.makeMeDraggable').draggable({
    cursor: 'move',
    helper: 'clone'
  });
  
  
  $('#mainDeck').droppable( {
      
      drop: handleDropEvent
  } );
  
  $('#xtraDeck').droppable( {
        drop: handleDropEvent
  } );
  
  $('#sideDeck').droppable( {
    drop: handleDropEvent
  } );
}
function checkDropElement(cardPicElement){
        // check wieviele Karten mit der ID schon vorhanden sind
        var cardId = $(cardPicElement).attr('src')
        var cardId =  cardId.substring(40,cardId.length-4);
        var countMainDeckList = mainDeckList.length;
        var countXtraDeckList = xtraDeckList.length;
        //var countSideDeckList = sideDeckList.lenght; // Number of items in the arrays
        var bmain = 0; // Counter for mainDeck
        var bxtra = 0; // Counter for xtraDeck
        //var bside = 0; // counter for sideDeck
        
        // GetCardDatas
        var getCards = getCardData(cardId);
        //console.log(getCards);
        /*
         * get mainDeck or xtraDeck where the Elememt dropped
         */
        var getCardsPlace = $(this).attr('id');
            console.log($(cardPicElement).attr('id'));
            console.log(getCards);
            console.log(getCardsPlace);
        
        if(getCards != getCardsPlace){
            return false;
        }
        
        // counter für mainDeck Max. 3 cards 
        for(i=0; i < countMainDeckList; i++){
            if(mainDeckList[i] == cardId){
                if(bmain >= 2){
                    return false;
                }
                else{
                    bmain++;
                    console.log('Treffer'+bmain);
                }
            }    
        }  
       return true; // Element wird gedropped
}




function handleDropEvent( event, ui ) {
        /* 
         * check which div is the pic dropped
         * save the dropped clones in array  
         */
       
   
    
        var draggable = ui.draggable;
        var cards = new Object();
        /* Save Card */
        cards.place = $(this).attr('id'); 
        cards.main  = draggable.attr('src');
        cards.Id =  cards.main.substring(40,cards.main.length-4);
        
        // check wieviele Karten mit der ID schon vorhanden sind
        var countMainDeckList = mainDeckList.length;
        //var countXtraDeckList = xtraDeckList.length;
        //var countSideDeckList = sideDeckList.lenght; // Number of items in the arrays
        var bmain = 0; // Counter for mainDeck
        //var bxtra = 0; // Counter for xtraDeck
        //var bside = 0; // counter for sideDeck
       
        // GetCardDatas
        var getCards = getCardData(cards.Id);
        //console.log(getCards);
    
        /*
         * get mainDeck or xtraDeck where the Elememt dropped
         */
        var getCardsPlace = $(this).attr('id');
            console.log(getCards);
            console.log(getCardsPlace);
        
        if(getCards != getCardsPlace){
            return false;
        }
        
        
        
        // counter für mainDeck Max. 3 cards 
        for(i=0; i < countMainDeckList; i++){
            if(mainDeckList[i] == cards.Id){
                if(bmain >= 2){
                    return false;
                }
                else{
                    bmain++;
                    console.log('Treffer'+bmain);
                }
            }    
        }
            
        
        
   var cardPicUrl = '<img id="'+cards.Id+'" class="cardhover"  onclick="cardRemove();" onmouseover="change_image('+cards.Id+');"  width="60" src="http://ygopro.de/img/cardpics/'+cards.Id+'.jpg">';
    $( '#'+cards.place ).append( cardPicUrl );
            
   /* wenn Karte gedropt speicher id in global array */
   switch(cards.place)
   {
       case 'mainDeck':
           mainDeckList.push(cards.Id);
           break;
       case 'xtraDeck':
           xtraDeckList.push(cards.Id);
           break;
       case 'sideDeck':
           sideDeckList.push(cards.Id);
           break;
   }
   

        

 return true; // Element wird gedropped
}//end handleDropEvent

// Speicher 1,2 für Main/side oder Extra Deck Karte
// Speicher limit der Karte
// Erstelle jquery get Request an php mit id übergaben
// zurück bekommen: Zone: 1/2 Limit: 1, 2, 3
function getCardData(cardId){
$.get("getCardData.php?cardid="+cardId, function(cardId,status){
   //console.log("Data: " + cardId + "\nStatus: " + status);
    moep = cardId;
});
   return moep; 
}

/* bei click karte aus array löschen */
function cardRemove(){
    $('.cardhover').click(function() {
        var cardid = $(this).attr('id');
        var cardplace = $(this).parent().attr('id');
        
        switch(cardplace){
            case 'mainDeck': finden_und_entfernen(mainDeckList, cardid); break;
            case 'xtraDeck': finden_und_entfernen(xtraDeckList, cardid); break;
            case 'sideDeck': finden_und_entfernen(mainDeckList, cardid); break;
        }
        
        //finden_und_entfernen(cardplace + 'List', cardid);
        
        console.log(mainDeckList);
        console.log(xtraDeckList);
        $(this).remove();
    });
};





function finden_und_entfernen(dasarray, wert){

var der_index = index_finden(dasarray, wert);
if (der_index > -1) { 
return dasarray.splice(der_index, 1);
}
return dasarray;
}


function index_finden(dasarray,wert){

for (var i = 0; i < dasarray.length; i++) {
if (dasarray[i] === wert) {
return i; document.write(i);
}
}
return -1;
}


