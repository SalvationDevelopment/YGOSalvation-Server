<?php
require_once 'sqlite/sqlite.php';

if(isset($_GET['cardid'])){
    // Todo: check pregmatch nur zahlen
    //
    //
    $cardId = htmlspecialchars($_GET['cardid']);
    
    getCardData($cardId);
}



function getCardData($cardId)
  {
    $db = new MyDB();
    $abfrage = 
              ("
                  SELECT 
                    *
                  FROM 
                    datas
                  WHERE
                    id = '$cardId'
                ");    
        
    
    $ergebnis = $db->query($abfrage) or die('Fehler beim SQL verbinden');            
        
       while ($row = $ergebnis->fetchArray()) {
           $type = $row['type'];
       }
       switch ($type){
           case 8388641: // XYZ
           case 8193:    // Normal Synchro
           case 8225:    // effekt Synchro
           case 97:      // Fusion Monster
               echo 'xtraDeck';
               break;
           
           default:
               echo 'mainDeck';
       }
  }      
?>
