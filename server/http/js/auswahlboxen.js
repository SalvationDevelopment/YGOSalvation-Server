$(function() {
    $('.show').click(function() {
      $('.hidden').slideToggle();
    });
  });

 $(document).ready(function(){
  $('#tooltip_1').hovertip('');
  $('#tooltip_2').hovertip('');
  $('#tooltip_3').hovertip('');
  $('#tooltip_4').hovertip('');
  
// Zähler fuer die Kartensuchergebnisse um Hover Boxen anzuzeigen
//for (var i = 0; i <= 100; i++)
  //$('#' + i).hovercards('');  
});

// Kartenwahl dropdown detect selectetd item
function val() {
d = document.getElementById("select_id").value;
if(d === '1')
    {
    document.getElementById("filter_monster_dropdown").style.display='inline';
    document.getElementById("filter_zauber_dropdown").style.display='none';
    document.getElementById("filter_fallen_dropdown").style.display='none';
    document.getElementById("filter_div_monster_erweiterung").style.display='inline';
    }
else if(d === '2')
    {
    document.getElementById("filter_monster_dropdown").style.display='none';
    document.getElementById("filter_zauber_dropdown").style.display='inline';
    document.getElementById("filter_fallen_dropdown").style.display='none';
    document.getElementById("filter_div_monster_erweiterung").style.display='none';
    }
else if(d === '4')
    {
    document.getElementById("filter_monster_dropdown").style.display='none';
    document.getElementById("filter_zauber_dropdown").style.display='none';
    document.getElementById("filter_fallen_dropdown").style.display='inline';
    document.getElementById("filter_div_monster_erweiterung").style.display='none';
    }
else if(d === '5')
    {
    document.getElementById("filter_monster_dropdown").style.display='none';
    document.getElementById("filter_zauber_dropdown").style.display='none';
    document.getElementById("filter_fallen_dropdown").style.display='none';
    document.getElementById("filter_div_monster_erweiterung").style.display='none';
    
    }    
}

