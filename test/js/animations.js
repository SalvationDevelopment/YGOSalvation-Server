/* globals $,UnityObject2, jQuery,showUnsupported, alert, document,isChecked,randomString, console, clearInterval, setInterval, setTimeout, duel, cardPositions*/
var deckpositionx = 735;
var currenterror;
var positions = {
    extra: {
        x: 25
    }
};
var shuffler, fix; 

$(document).ready(function(){
       $('.card').on('click', function () {
        complete(deckpositionx);
    });
                  });


// Animation functions
 
    function cardmargin(player,deck) {
        var orientation = (player === 'p0') ? ({x : 'left', y : 'bottom', direction : 1,multiple : 2} ) : ({x : 'right', y : 'top', direction : -1, multiple : 3} );
        $('.card.'+player+'.'+deck).each(function (i) {
           // console.log($('.card.'+player+'.'+deck), cardlocations[player],player,deck);
            var decklocationx = (orientation.direction *  i / orientation.multiple) + (cardlocations[player][deck].x_origin);
            var decklocationy = (orientation.direction *  i / orientation.multiple) + (cardlocations[player][deck].y_origin);
            //console.log(decklocationx,decklocationy);
            
            $(this).css(
                orientation.y, decklocationy + 'px').css(
                orientation.x, decklocationx + 'px'
            );
    
        });
    }
function shuffle(player, deck) {
   var orientation = (player === 'p0') ? ({x : 'left', y : 'bottom', direction : 1} ) : ({x : 'right', y : 'top', direction : -1} );
    cardmargin(player, deck);
    $($('.card.'+player+'.'+deck).get().reverse()).each(function (i) {
        var cache = $(this).css(orientation.x);
        var spatical = Math.floor((Math.random() * 150) - 75);
        $(this).css(orientation.x, '-=' + spatical + 'px');
    });
    fix = setTimeout(function () {
        cardmargin(player,deck);
    }, 50);
}

function complete(x) {
    var started = Date.now();

    // make it loop every 100 milliseconds

    var interval = setInterval(function () {

        // for 1.5 seconds
        if (Date.now() - started > 500) {

            // and then pause it
            clearInterval(interval);

        } else {

            // the thing to do every 100ms
            shuffle('p0');

        }
    }, 100); // every 100 milliseconds
}


function animateDrawCard(player, amount){
    var c = $('.'+player+'.Deck').splice(0,amount);
//    console.log('.'+player+'.Deck');
//    console.log(c.length);
    $(c).each(function(i){
        $(this).attr('class', "card "+player+' '+'Hand i'+(i+duel[player].Hand.length)+' AttackFaceUp')
        .attr('style','');
    }
);}

function animateState(player, clocation, index, moveplayer, movelocation, movezone, moveposition, count){
    if (count === undefined) {count = 1;}
    var query = "."+player+"."+clocation+".i"+index;
    $(query).slice(0,count).attr('class', "card "+ moveplayer+" "+ movelocation +" i"+movezone+" "+cardPositions[moveposition])
    .attr('style','');
}
function animateChaining(player,clocation,index){
    $(player+'.'+clocation+'.i'+index).addClass('chainable');
}
function animateRemoveChaining(){
    $('.chainable').removeClass('chainable');
}
function layouthand(player){
    var count = $('.'+player+'.Hand').length;
    var f = 83/0.8;
    var xCoord;
//    console.log(count,f,xCoord);
    for (var sequence = 0; sequence < count; sequence++) {
        if(duel[player].Hand.length < 6 ){
            xCoord = ( 5.5*f - 0.8*f * count) / 2 + 1.55*f + sequence * 0.8*f;
        }else{
            xCoord = 1.9*f + sequence * 4.0*f / (count - 1);
        }
       // console.log('.'+player+'.Hand.i'+sequence);
        //console.log(xCoord);
        if (player === 'p0'){
            $('.'+player+'.Hand.i'+sequence).css('left',''+xCoord+'px');
        }else{
            $('.'+player+'.Hand.i'+sequence).css('right',''+xCoord+'px');
        }
    }
}
    
//    
//    if (count <= 6)
//    t->X = (5.5f - 0.8f * count) / 2 + 1.55f + sequence * 0.8f;
//   else
//    t->X = 1.9f + sequence * 4.0f / (count - 1);
