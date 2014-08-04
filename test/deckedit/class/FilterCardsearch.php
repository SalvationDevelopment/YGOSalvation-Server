<?php
/* 
 * Klasse für die Kartensuche. Hier werden die ganzen Suchfilter definiert und
 * in den Eigenschaften gespeichert.
 */
class FilterCardsearch
{ 
  // Karten Filter
  public $filter_cardname;
  public $filter_kartenwahl_dropdown;
  public $filter_monster_dropdown;
  public $filter_attribute;
  public $filter_race;
  public $filter_level;
  public $filter_atk;
  public $filter_def;
  public $filter_effekt;

  // Kartenspeicher array von abfrage
  public $result = array();
  
  public $result_id;
  public $result_name;
  public $result_desc;
  public $result_attribute;
  public $result_race;
  public $result_level;
  public $result_atk;
  public $result_def;
  public $result_effekt;
  public $result_wiki_cardruling_link;
  public $wiki_query; // speichert ids im string der suchanfrage fuer query der en cards
  
  // Filter Vars setzen mit Post Daten
  function SetFilter()
  {
   
   if(!empty($_POST['filter_cardname']))
      {
        $this->filter_cardname = $_POST['filter_cardname'];
      }
   if($_POST['filter_kartenwahl_dropdown'] > 0)
      {
        // pruefen was gesucht wird
        switch($_POST['filter_kartenwahl_dropdown'])
          {
            case "1": // Monster
                if($_POST['filter_monster_dropdown'] == '5'){
                    $this->filter_kartenwahl_dropdown = (" ('1', '17', '33', '97', '161', '256', '545', '1057', '2048', '4113', '4129', '8193', '8225', '2097185', '4194337', '8388641', '94944637') "); // Type Monster zahlen adden
                    break;
                }
                else {
                    switch ($_POST['filter_monster_dropdown'])
                        {
                        case "17": // Normales-Monster
                                $this->filter_kartenwahl_dropdown = (" ('17') ");
                            break;
                        case "33": // Effekt-Monster    
                                $this->filter_kartenwahl_dropdown = (" ('33') ");
                            break;
                        case "97": // Fusions-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('97') ");
                            break;
                        case "161": // Ritual-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('161') ");
                            break;
                        case "8225": // Synchro-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('8225') ");
                            break;
                        case "8388641": // Xyz-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('8388641') ");
                            break;
                        case "4129": // Empfänger-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('4129') ");
                            break;
                        case "94944637": // Zwilling-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('94944637') ");
                            break;
                        case "1057": // Union-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('1057') ");
                            break;
                        case "545": // Spirit-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('545') ");
                            break;
                        case "2097185": // Flip-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('2097185') ");
                            break;
                        case "4194337": // Toon-Monster     
                                $this->filter_kartenwahl_dropdown = (" ('4194337') ");
                            break;
                        }//end switch
                }//end else
                
                    break;
            
            case "2": // Spells
                if($_POST['filter_zauber_dropdown'] == '5'){
                    $this->filter_kartenwahl_dropdown = (" ('2', '130', '65538', '131074', '262146', '524290') ");
                    break;
                }
                else {
                    switch ($_POST['filter_zauber_dropdown'])
                    {
                    case "2": // Normale-Zauber
                        $this->filter_kartenwahl_dropdown = (" ('2') ");
                        break;
                    case "65538": // Schnell-Zauber
                        $this->filter_kartenwahl_dropdown = (" ('65538') ");
                        break;
                    case "131074": // Permanent-Zauber
                        $this->filter_kartenwahl_dropdown = (" ('131074') ");
                        break;
                    case "130": // Ritual-Zauber
                        $this->filter_kartenwahl_dropdown = (" ('130') ");
                        break;
                    case "262146": // Ausrüstungs-Zauber
                        $this->filter_kartenwahl_dropdown = (" ('262146') ");
                        break;
                    case "524290": // Spielfeld-Zauber
                        $this->filter_kartenwahl_dropdown = (" ('524290') ");
                        break;
                    }//end switch
                }//end else
                break;
            
            case "4": // Traps
                if($_POST['filter_fallen_dropdown'] == '5'){
                    $this->filter_kartenwahl_dropdown = (" ('4', '131076', '1048580') ");
                    break;
                }
                else {
                    switch ($_POST['filter_fallen_dropdown'])
                    {
                    case "4": // Normale-Falle
                        $this->filter_kartenwahl_dropdown = (" ('4') ");
                        break;
                    case "131076": // Permanent-Falle
                        $this->filter_kartenwahl_dropdown = (" ('131076') ");
                        break;
                    case "1048580": // Konter-Falle
                        $this->filter_kartenwahl_dropdown = (" ('1048580') ");
                        break;
                    }//end switch
                }//end else
                
                break;
                
            case "5":
               $this->filter_kartenwahl_dropdown = (" ('1', '17', '33', '97', '161', '256', '545', '1057', '2048', '4113', '4129', '8193', '8225', '2097185', '4194337', '8388641', '94944637', '2', '130', '65538', '131074', '262146', '524290', '4', '131076', '1048580') ");
            break;  
          }
        
      }
   if($_POST['filter_monster_dropdown'] == true)
      {
        switch($_POST['filter_monster_dropdown'])
          {
            case "5": // alle
                break;
            case "17": // Normales Monster
              $this->filter_monster_dropdown = (" 
                                                AND
                                                  datas.type = '17' 
                                                ");
                                                break;
            case "33": // Effekt Monster
              $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '33' 
                                                ");
                                                break;
            case "97": // Fusion Monster
                  $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '97' 
                                                   ");
                                                break; 
            case "161": // Ritual Monster
                   $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '161' 
                                                   ");
                                                break; 
            case "8225": // Effekt Synchro Monster
                   $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '8225' 
                                                   ");
                                                break; 
            case "8193": // Normales Synchro Monster
                   $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '8193' 
                                                   ");
                                                break;   
            case "8388641": // XYZ
                  $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '8388641' 
                                                   ");
                                                break; 
            case "4129": // Empfaenger Monster
                   $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '4129' 
                                                   ");
                                                break; 
            case "94944637": // Zwilling Monster
                   $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '94944637' 
                                                   ");
                                                break; 
            case "1057": // Union Monster
                   $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '1057' 
                                                   ");
                                                break; 
            case "545": // Spirit Monster
                  $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '545' 
                                                   ");
                                                break; 
            case "2097185": // Flip Effekt Monster
                 $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '2097185' 
                                                   ");
                                                break; 
            case "4194337": // Toon Monster
               $this->filter_monster_dropdown =  (" 
                                                AND
                                                  datas.type = '4194337' 
                                                   ");
                                                break; 
          }
        
        
      }
   if(isset($_POST['filter_attribute']))
      {
        switch($_POST['filter_attribute'][0])
          {
            case "1": // Erde
              $this->filter_attritbute = (" 
                                         AND
                                           datas.attribute = '1' 
                                         ");
                                         break;
            case "2": // Wasser
              $this->filter_attritbute = (" 
                                         AND
                                           datas.attribute = '2' 
                                         ");
                                         break;
            case "4": // Feuer
              $this->filter_attritbute = (" 
                                         AND
                                           datas.attribute = '4' 
                                         ");
                                         break;
            case "8": // Wind
              $this->filter_attritbute = (" 
                                         AND
                                           datas.attribute = '8' 
                                         ");
                                         break;
            case "16": // Licht
              $this->filter_attritbute = (" 
                                         AND
                                           datas.attribute = '16' 
                                         ");
                                         break;
            case "32": // Finsternis
              $this->filter_attritbute = (" 
                                         AND
                                           datas.attribute = '32' 
                                         ");
                                         break; 
          }
      }
   if($_POST['filter_race'] != "5")
      {
        switch($_POST['filter_race'])
          {
            case "1": // Krieger
              $this->filter_race = (" 
                                 AND
                                   datas.race = '1' 
                                 ");
                                 break;
            case "2": // Fee
              $this->filter_race = (" 
                                 AND
                                   datas.race = '2' 
                                 ");
                                 break;
            case "4": // Hexer
              $this->filter_race = (" 
                                 AND
                                   datas.race = '4' 
                                 ");
                                 break;   
            case "8": // Unterweltler
              $this->filter_race = (" 
                                 AND
                                   datas.race = '8' 
                                 ");
                                 break; 
            case "16": // Zombie
              $this->filter_race = (" 
                                 AND
                                   datas.race = '16' 
                                 ");
                                 break; 
            case "32": // Maschine
              $this->filter_race = (" 
                                 AND
                                   datas.race = '32' 
                                 ");
                                 break; 
            case "64": // Wasser
              $this->filter_race = (" 
                                 AND
                                   datas.race = '64' 
                                 ");
                                 break; 
            case "128": // PYro
              $this->filter_race = (" 
                                 AND
                                   datas.race = '128' 
                                 ");
                                 break; 
            case "256": // Fels
              $this->filter_race = (" 
                                 AND
                                   datas.race = '256' 
                                 ");
                                 break; 
            case "512": // Gefluegeltes Ungeheuer
              $this->filter_race = (" 
                                 AND
                                   datas.race = '512' 
                                 ");
                                 break; 
            case "1024": // Pflanze
              $this->filter_race = (" 
                                 AND
                                   datas.race = '1024' 
                                 ");
                                 break; 
            case "2048": // Insekt
              $this->filter_race = (" 
                                 AND
                                   datas.race = '2048' 
                                 ");
                                 break; 
            case "4096": // Donner
              $this->filter_race = (" 
                                 AND
                                   datas.race = '4096' 
                                 ");
                                 break; 
            case "8192": // Drache
              $this->filter_race = (" 
                                 AND
                                   datas.race = '8192' 
                                 ");
                                 break; 
            case "16384": //Ungeheuer
              $this->filter_race = (" 
                                 AND
                                   datas.race = '16384' 
                                 ");
                                 break; 
            case "32768": // Ungeheuer Krieger
              $this->filter_race = (" 
                                 AND
                                   datas.race = '32768' 
                                 ");
                                 break;                                                                
          }
      }
   if($_POST['filter_level'] != "")
      {
        switch($_POST['filter_level'])
          {
            case "1":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '1' 
                                 ");
                                 break; 
            case "2":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '2' 
                                 ");
                                 break; 
            case "3":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '3' 
                                 ");
                                 break; 
            case "4":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '4' 
                                 ");
                                 break; 
            case "5":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '5' 
                                 ");
                                 break; 
            case "6":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '6' 
                                 ");
                                 break; 
            case "7":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '7' 
                                 ");
                                 break; 
            case "8":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '8' 
                                 ");
                                 break; 
            case "9":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '9' 
                                 ");
                                 break; 
            case "10":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '9' 
                                 ");
                                 break; 
            case "11":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '10' 
                                 ");
                                 break; 
            case "12":
              $this->filter_level = (" 
                                 AND
                                   datas.level = '1' 
                                 ");
                                 break; 
            
            default:
              exit;
          }
      }  
      
if($_POST['filter_atk'] != "")
    {
      $filter_atk_escaped = sqlite_escape_string($_POST['filter_atk']);
      $this->filter_atk = (" 
                           AND
                             datas.atk = '$filter_atk_escaped' 
                           "); 
    }
if($_POST['filter_def'] != "")
    {
      $filter_def_escaped = sqlite_escape_string($_POST['filter_def']);
      $this->filter_def = (" 
                           AND
                             datas.def = '$filter_def_escaped' 
                           "); 
    }

if($_POST['filter_effekt_dropdown'] != 'filter')
{
    $filter_effetk_Escaped = sqlite_escape_string(utf8_encode($_POST['filter_effekt_dropdown']));
    $this->filter_effekt = (" 
                           AND
                             texts.desc LIKE '%$filter_effetk_Escaped%' 
                           "); 
}
  
} // Ende Set Filter
  
  /* 
   * Hier wird das Ergebnis der Suchanfrage in den Eigenschaften als array gespeichert
   */
  function GetSearchCardName()
    {              
    
    $db = new MyDB();
    
    $abfrage = 
              ("
                  SELECT 
                    *
                  FROM 
                    texts
                  LEFT JOIN 
                    datas 
                  ON 
                    texts.id = datas.id 
                  WHERE
                    datas.type 
                  IN
                    $this->filter_kartenwahl_dropdown
                  AND
                    texts.name LIKE '%$this->filter_cardname%'
                   
                   $this->filter_monster_dropdown 
                   
                   $this->filter_attritbute
                   
                   $this->filter_race
                   
                   $this->filter_level
                   
                   $this->filter_atk
                   
                   $this->filter_def
                       
                   $this->filter_effekt
                 LIMIT
                   9  
                ");
    
      // debug
      //print_r($abfrage);
      echo '<br><br>';
      
      
    $ergebnis = $db->query($abfrage) or die("Error in query: <span style='color:red;'>$abfrage</span>");              
    
       // Counter fuer array setzen
       $i = 0;

       while ($row = $ergebnis->fetchArray()) 
         {
           //print_r($row);
           
           // Suche Ergebnis in Mehrdimensionalen Array speichern
           $this->result[$i]['id'] = $row['id'];
           $this->result[$i]['name'] = utf8_decode($row['name']);
           $this->result[$i]['desc'] = utf8_decode($row['desc']);
           $this->result[$i]['type'] = $row['type'];
           $this->result[$i]['attribute'] = $row['attribute'];
           $this->result[$i]['race'] = $row['race'];
           $this->result[$i]['level'] = $row['level'];
           $this->result[$i]['atk'] = $row['atk'];
           $this->result[$i]['def'] = $row['def'];
           
            $this->result_id[$i] = $row['id'];
            $this->result_name[$i] = utf8_decode($row['name']);
            $this->result_desc[$i] = utf8_decode($row['desc']);
            $this->result_attribute[$i] = $row['attribute'];
            $this->result_race[$i] = $row['race'];
            $this->result_level[$i] = $row['level'];
            $this->result_atk[$i] = $row['atk'];
            $this->result_def[$i] = $row['def'];
            
            $i++;
            
         }   
       $db->close();
    }//end function

// oeffne englishe cards um wiki cardruling link zu erstellen. Dazu counter erst    
function GetEnglishCardName()
{
  $db = new MyDB();
  $db->close();
  $db->open_en_cards();
       $abfrage = 
              ("
                  SELECT 
                    name
                  FROM 
                    texts
                  WHERE
                    id IN
                  ('$this->wiki_query')  
   
                ");
       
       $ergebnis = $db->query($abfrage) or die("Error in query: <span style='color:red;'>$abfrage</span>");
        
       // Counter fuer array setzen
       $i = 0;
        while ($row = $ergebnis->fetchArray()) 
         {
            // Englischen Namen im Wiki Format speichern
            $wiki = str_replace(" ", "_", $row['name']);
            
            // Wiki Link im Array speichern
            $this->result_wiki_cardruling_link[$i] = '<a href="http://yugioh.wikia.com/wiki/Card_Rulings:' .utf8_decode($wiki).'">Cardruling</a>';
            $i++;
         }//ende while
          
            $db->close();    
}    
    
function BuildQueryEnglishCards()
{
  $daten = '';  
  foreach($this->result_id as $card_id)
  {
    $daten .= '\'' .$card_id. '\', ';
  }
  
  $rest = substr($daten, 1, -3);

  $this->wiki_query = $rest;
  
}//end function 
    
function SearchLimit($filter_flist_limit)
  {
    $db = new MyDB();
    echo '<h3>Ausgabe Ergebnis Limit Suche</h3>';
    $abfrage = 
              ("
                  SELECT 
                    texts.id, name, datas.type, datas.attribute, datas.race
                  FROM 
                    texts
                  LEFT JOIN 
                    datas 
                  ON 
                    texts.id = datas.id 
                  WHERE
                    texts.id 
                  IN
                    $filter_flist_limit
                ");    
    
    echo '<br>';       
    
    $ergebnis = $db->query($abfrage) or die('Fehler beim SQL verbinden');
    
    echo '<br>';               
        
       while ($row = $ergebnis->fetchArray()) 
         {
            echo '<img src="http://wp11157164.server-he.de/pics/thumbnail/'.$row['id'].'.jpg"></img>';
            
             echo '<a style="vertical-align:150%; margin-left: 5px;" href="http://ygopro.de/cardsearch/kartensuche-ergebnis-einzeln.php?karte='. $row['id'].'&sprache=cards_de" 
          class="ergebnis_links">' 
          . utf8_decode($row['name']) . '</a>';
            echo ' - ';
            
            $wiki = str_replace(" ", "_", $row['name']);
            echo '<a style="vertical-align:150%; margin-left: 5px;"href="http://yugioh.wikia.com/wiki/Card_Rulings:' .utf8_decode($wiki).'">Cardruling</a>

            

            <br>';
         }
       $db->close();   
  }// end function     

} // end class

?>