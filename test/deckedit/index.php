<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html>
<head>
<link rel="stylesheet" type="text/css" href="css/layout.css">
<link rel="stylesheet" type="text/css" href="css/schrift.css">
<link rel="stylesheet" type="text/css" href="css/dragdrop.css">
<link href='http://fonts.googleapis.com/css?family=Press+Start+2P' rel='stylesheet' type='text/css'>
    
    

<script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>
<script type="text/javascript" src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<!-- Jquery Hovertip-->
<script type="text/javascript" src="js/jquery.hovertip.js"></script>
<link rel="StyleSheet" href="css/jquery.hovertip.css" type="text/css">
<!-- Jquery Hovertip-->
<script type="text/javascript" src="js/jquery.hovercards.js"></script>
<link rel="StyleSheet" href="css/jquery.hovercards.css" type="text/css">
    
<script type="text/javascript" src="js/cardsDragAndDrop.js"></script>    
<script type="text/javascript" src="js/auswahlboxen.js"></script> 


</style>
</head>
<body>

    
    <div id="cardPic"><img id="cardPicDummy" src="../img/cardpics/cover.jpg"></div>
    <div id="cardDesc"></div>
    
    
    
        <form action="index.php" method="post">
    <fieldset>
      <legend><img src="pics/plus.png" class="show" id="img_hover" /></legend>
        <span>Suchfilter gef&auml;llig?</span><br />
          <div style="display: none;" class="hidden">
            <h2>Kartenart</h2>
            
            <select name="filter_kartenwahl_dropdown" onchange="val()" id="select_id">
                <option value="5">Alle</option>
                <option value="1">Monster</option>
                <option value="2">Zauber</option>
                <option value="4">Fallen</option>
            </select>
    
            <!-- Nur filterbar wenn bei Kategorie Monster gewaehlt wird -->
            <select name="filter_monster_dropdown" id="filter_monster_dropdown">
              <option value="5">Monster</option>
              <option value="17">Normal</option>
              <option value="33">Effekt</option>
              <option value="97">Fusion</option>
              <option value="161">Ritual</option>
              <option value="8225">Synchro</option>
              <option value="8388641">XYZ</option>
              <option value="4129">Empf&auml;nger</option>
              <option value="94944637">Zwilling</option>
              <option value="1057">Union</option>
              <option value="545">Spirit</option>
              <option value="2097185">Flip</option>
              <option value="4194337">Toon</option>
            </select>
            
            <!-- Nur filterbar wenn bei Kategorie Zauber gewaehlt wird -->
            <select name="filter_zauber_dropdown" id="filter_zauber_dropdown">
              <option value="5">Zauber</option>
              <option value="2">Normal</option>
              <option value="65538">Schnell</option>
              <option value="131074">Permanent</option>
              <option value="130">Ritual</option>
              <option value="262146">Ausr&uuml;stung</option>
              <option value="524290">Spielfeld</option>
            </select>
            
            <!-- Nur filterbar wenn bei Kategorie Fallen gewaehlt wird -->
            <select name="filter_fallen_dropdown" id="filter_fallen_dropdown">
              <option value="5">Fallen</option>
              <option value="4">Normal</option>
              <option value="131076">Permanent</option>
              <option value="1048580">Konter</option>
            </select>
            <br /><br />
    
            
            
            
            
            
            <!-- filter_div_monster_erweiterung -->
            <div id="filter_div_monster_erweiterung">
            
            <h2>Eigenschaft</h2>
    
            <input type="checkbox" name="filter_attribute[]" value="1"> 
            <img src="pics/icons/att_earth.png" /> <span>Erde</span>
    
            <input class="eigenschaft" type="checkbox" name="filter_attribute[]" value="2"> 
            <img src="pics/icons/att_water.png" /> <span>Wasser</span>
    
            <input class="eigenschaft" type="checkbox" name="filter_attribute[]" value="4"> 
            <img src="pics/icons/att_fire.png" /> <span>Feuer</span>

            <br />

            <input type="checkbox" name="filter_attribute[]" value="8"> 
            <img src="pics/icons/att_wind.png" /> <span>Wind</span>
    
            <input class="eigenschaft" type="checkbox" name="filter_attribute[]" value="16"> 
            <img src="pics/icons/att_light.png" /> <span>Licht</span><br />
    
            <input type="checkbox" name="filter_attribute[]" value="32"> 
            <img src="pics/icons/att_dark.png" /> <span>Finsternis</span>
    
          <br /><br />
          
          <h2>Monster Typ</h2>
    
        <select name="filter_race" id="filter_race">
              <option value="5">Alle</option>
              <option value="1">Krieger</option>
              <option value="2">Hexer</option>
              <option value="4">Fee</option>
              <option value="8">Unterweltler</option>
              <option value="16">Zombie</option>
              <option value="32">Maschine</option>
              <option value="64">Wasser</option>
              <option value="128">Pyro</option>
              <option value="256">Fels</option>
              <option value="512">Gefl&uuml;geltes Ungeheuer</option>
              <option value="1024">Pflanze</option>
              <option value="2048">Insekt</option>
              <option value="4096">Donner</option>
              <option value="8192">Drache</option>
              <option value="16384">Ungeheuer</option>
              <option value="32768">Ungeheuer-Krieger</option>
              <option value="65536">Dinosaurier</option>
              <option value="131072">Fisch</option>
              <option value="262144">Seeschlange</option>
              <option value="524288">Reptil</option>
              <option value="1048576">Psi</option>
              <option value="2097152">G&ouml;ttliches Ungeheuer</option>
        </select>
    
        <br /><br />
    
        <h2>Level / Rank</h2>
    
        <input type="text" name="filter_level" maxlength="2" />

        <br /><br />
  
        <h2>ATK & DEF</h2>
        
        <img style="cursor:help;" src="pics/fragezeichen.png" id="tooltip_3" class="hilfetip" />
        <div class="hovertipContent">
        <p>Gebt hier die Angriffsst&auml;rke ein nach der Ihr suchen wollt!</p></div>
  
      <input type="text" name="filter_atk" maxlength="4" size="5" />
  
      <img style="cursor:help;" src="pics/fragezeichen.png" id="tooltip_4" class="hilfetip" />
      <div class="hovertipContent">
      <p>Gebt hier die Verteigungsst&auml;rke ein nach der Ihr suchen wollt!</p></div>
  
      <input type="text" name="filter_def" maxlength="4" size="5" />
      
            </div><!-- ENDE DIV BOX filter_div_monster_erweiterung -->
    
<h2>Effekt Filter</h2>
            <!-- Effekt Filter sucht in der Beschreibung -->
            <select name="filter_effekt_dropdown" id="filter_effekt_dropdown">
              <option value="filter">Filter</option>
              <option value="Z/F Zerst&ouml;ren">Z/F Zerst&ouml;ren</option>
              <option value="auf die hand">Auf die Hand</option>
              <option value="ziehen">Karten ziehen</option>
              <option value="kontrolle wechseln">Kontrolle wechseln</option>
              <option value="nicht angreifen">Angriff beschr&auml;nken</option>
              <option value="Typ-Abh&auml;ngig">Typ-Abh&auml;ngig</option>
              <option value="Zerst&ouml;ren">Zerst&ouml;ren</option>
              <option value="Fusions Verbunden">Fusions Verbunden</option>
              <option value="Monster zerst&ouml;ren">Monster zerst&ouml;ren</option>
              <option value="deck zur&uuml;ck">Ins Deck zur&uuml;ck</option>
              <option value="Suche">Suchen</option>
              <option value="Wechsel">Wechsel ATK/DEF</option>
              <option value="Direktangriff">Direktangriff</option>
              <option value="Eigenschafft">Eigenschafft</option>
              <option value="W&auml;hlen">W&auml;hlen</option>
              <option value="Empf&auml;nger">Empf&auml;nger-Verbunden</option>
              <option value="Handzerst&ouml;rung">Verbannen</option>
              <option value="Handzerst&ouml;rung">Handzerst&ouml;rung</option>
              <option value="Wiederherstellen">Wiederherstellen</option>
              <option value="Durchschlag">Durchschlag schaden</option>
              <option value="Spezialbeschw&ouml;rung">Spezialbeschw&ouml;rung</option>
              <option value="lebenspunkte Schaden">LP Schaden</option>
              <option value="z&auml;hlmarke">Z&auml;hlmarke</option>
              <option value="Xyz Verbunden">Xyz Verbunden</option>
              <option value="friedhof">Friedhof</option>
              <option value="deckzerst&ouml;rung">Deckzerst&ouml;rung</option>
              <option value="position wechseln">Position wechseln</option>
              <option value="angriff wiederholen">Angriff wiederholen</option>
              <option value="spielmarken">Spielmarken</option>
              <option value="lepenspunkte wiederherstellen">LP wiederherstellen</option>
              <option value="m&uuml;nze">Gl&uuml;cksspiele</option>
              <option value="w&uuml;rfel">W&uuml;rfelspiel</option>
              <option value="Effekte annulieren">Effekte annulieren</option>
            </select>            
            
            
    </fieldset>

  <!-- Ende Hidden Filter Box -->
  </div>


<fieldset class="filter">    
    <legend></legend>
      
        <p class="underlined"></p>
        
        <input type="text" name="filter_cardname" maxlength="40">
            <img style="cursor:help;" src="pics/fragezeichen.png" id="tooltip_1" class="hilfetip" />
                <div class="hovertipContent"><p>Hier k&ouml;nnt Ihr direkt nach dem Karten Namen suchen!</p></div>
                    <input type="submit" value="suchen" class="rechts" />
</fieldset>
</form>
    
    
    <!-- Deck DOWNLOADS -->
    <a href="#" id="deckDownload">DECK DOWNLOAD</a>
    
    <script>
    $( "#deckDownload" ).click(function() {
        var deck = mainDeckList;
        
        $.get("php/deckdownload.php?mainDeck="+deck+"&xtraDeck="+xtraDeckList+"&sideDeck="+sideDeckList, function(deck,status){
            console.log("Data: " + deck + "\nStatus: " + status);
  });
    });
    
    
    </script>
    
    <!-- Deckfelder -->
    <div id="mainDeckHeader"><p>MainDeck</p></div>
    <div id="mainDeck"></div>
    
    <div id="xtraDeckHeader"><p>XtraDeck</p></div>
    <div id="xtraDeck"></div>
    
    <div id="sideDeckHeader"><p>SideDeck</p></div>
    <div id="sideDeck"></div>


    <div id="card-container">

    <?php
      if(!empty($_POST))
        {
          // Anzeigen wenn suchanfrage -->
          include_once('sqlite/sqlite.php');

            function __autoload($class)
              {
                require 'class/'.$class.'.php';
              }


            $cardfilter = new FilterCardsearch();
            $attribute = new attribute();

            $cardfilter->SetFilter();
            echo $cardfilter->GetSearchCardName();

            // Für die Wiki Links werden hier die Englischen Kartennamen ausgelesen
            $cardfilter->BuildQueryEnglishCards();
            $cardfilter->GetEnglishCardName();

            // Debug
            //print_r($cardfilter->result);
      
        
      $i = 0;  
      foreach($cardfilter->result as $ausgabe)
      {
        echo '  
        
            <div class="ergebnis_ausgabe_suche" id="'.$i.'">
            
            <div class="ergebnis_ausgabe_suche_bilder">
                <img onmouseover="change_image_thumb('.$cardfilter->result[$i]['id'].');" class="makeMeDraggable" id="thumbnail-'.$i.'" src="http://ygopro.de/img/cardpics/thumbnail/'.$cardfilter->result[$i]['id'].'.jpg"></img>
            </div>
            
            <div class="ergebnis_ausgabe_suche_text"><span style="margin-left: 10px;">' 
            
            .$cardfilter->result[$i]['name']. '</span><br>
            
            
             '; 
             if($cardfilter->result[$i]['attribute'] != "0")
              { 
             
             echo '<span style="margin-left: 10px;" class="small">'.$attribute->attribute[$cardfilter->result[$i]['attribute']].'</span>
             
             / <span class="small">'.$attribute->race[$cardfilter->result[$i]['race']].' &#10028;' . $cardfilter->result[$i]['level'].
             
             '</span><br><span style="margin-left: 10px;" class="small">' . $cardfilter->result[$i]['atk']. '</span><span class="small">/' . $cardfilter->result_def[$i].
            
             '</span>
             
             <span style="margin-left: 10px;" class="small">' . $cardfilter->result_wiki_cardruling_link[$i].'</span>';
              }
             else
              {
                echo '<br /><span style="margin-left: 10px;" class="small">Zauber / Falle </span>
                <span style="margin-left: 10px;" class="small">' . $cardfilter->result_wiki_cardruling_link[$i].'</span>';
              }
             echo '</div></div>
             
             <div class="hovertipContent">
              <img src="http://ygopro.de/img/cardpics/'.$cardfilter->result[$i]['id'].'.jpg"></img>
              <h3 style="color: white;">'.$cardfilter->result_name[$i].'</h3>';
           if($cardfilter->result_attribute[$i] != "0")
           {
              echo '<p>Level &#10028;' . $cardfilter->result_level[$i].'</p>';   
              echo '<p>' . $cardfilter->result_atk[$i].
                      ' / '.$cardfilter->result_def[$i].'</p>';
           }   
              echo '<p>' . $attribute->race[$cardfilter->result_race[$i]].'</p>
                  
              <p>'.$cardfilter->result_desc[$i].'</p>
              </div>';
             
             $i++;
        
     }//end foreach   
   }//end function    
   
   
?>


</div>
</body>
</html>