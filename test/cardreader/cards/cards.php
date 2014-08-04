<?php
/**
 * Description of cards
 *
 * @author ben
 */
class cards extends SQLite3 {

    public $card;
    public $cardid;
    public $format;
            
    function __construct()
    {
        $folder = $_GET['folder'];
        
        // Gestatte gültige Werte
        switch ($folder) {
            case 'German':
            case 'English':
            case 'French':
        $this->open('cards/'.$folder.'/cards.cdb');
        break;
    
            default:
                echo 'what you try?';
                exit;
                }
    }
    
    
  //Set format
  function SetFormat($format){
      $this->format = $_GET['format'];
      
      return $this->format;
  }

function getCardsTexts()
    {
      $db = new cards();
      
      $ergebnis = $db->query("
                SELECT *
                FROM texts
                ");
      
      
      
      while ($row = $ergebnis->fetchArray()) 
            {
                $card[] = $row; 
            }    
            
            if(array_key_exists('callback', $_GET)){
                echo $_GET['callback'].'('. json_encode($card).')';
            }else{
               echo json_encode($card);
            }
            
            //apc_add('foo', $jsonp);
            //var_dump(apc_fetch('foo'));
            //echo "\n";
            
            // $output =  $this->is_valid_callback($_GET['callback']);
            //$cardJson = json_encode($card);
            
    }

    
 function getCardsDatas()
    {
      $db = new cards();
      
      $ergebnis = $db->query("
                SELECT *
                FROM datas
                ");
      
      
      
      while ($row = $ergebnis->fetchArray()) 
            {
                $card[] = $row; 
            }    
            
            if(array_key_exists('callback', $_GET)){
            echo $_GET['callback'].'('. json_encode($card).')';
            }else{
               echo json_encode($card);
            }
    }           
    
function is_valid_callback($subject)
{
    $identifier_syntax
      = '/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u';

    $reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
      'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue', 
      'for', 'switch', 'while', 'debugger', 'this', 'with', 
      'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum', 
      'extends', 'super', 'const', 'export', 'import', 'implements', 'let', 
      'private', 'public', 'yield', 'interface', 'package', 'protected', 
      'static', 'null', 'true', 'false');

    return preg_match($identifier_syntax, $subject)
        && ! in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
}

}

?>
