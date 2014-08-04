<?php
class flist
{
public $filter_limit_flist;

function SetFilterSearchLimit()
{
if($_POST['filter_limit_flist'] != "5")
  {
  
  $search_line_forbidden   = '#forbidden';
  $search_line_limit   = '#limit';
  $search_line_semilimit   = '#semilimit'; 
    
    switch($_POST['filter_limit_flist'])
  {
    case "5":
        break;
    
    case "1": // Banned
      
      $zeilen = file('lflist.conf'); 
           foreach ($zeilen as $zeile) 
        {   
          if (strpos($zeile, $search_line_forbidden) !== false) // Zeile #forbidden gefunden
              {
                   $go = "ok"; 
              }
          if($go == "ok")
            {
               if (strpos($zeile, $search_line_limit) !== false) // Zeile #limit
                        {
                          break;
                        }
                      $rest = substr($zeile, 0, -2);  // schneide String
                      
                      $search_lim .= '\'' . $rest . '\','; // baue query fuer flist limit suche
                      $i++;
            } 
             
        }  // end foreach
            
            $trim_search_lim = substr($search_lim, 12, -1); // schneide letztes komma weg
            $this->filter_limit_flist = (" ( $trim_search_lim ) "); // baue endquery 

            break;
      
      
    case "2": // Limit
 
           $zeilen = file('lflist.conf'); 
           foreach ($zeilen as $zeile) 
        {   
          if (strpos($zeile, $search_line_limit) !== false) // Zeile #limit gefunden
              {
                   $go = "ok"; 
              }
          if($go == "ok")
            {
               if (strpos($zeile, $search_line_semilimit) !== false) // Zeile #semilimit
                        {
                          break;
                        }
                      $rest = substr($zeile, 0, -2);  // schneide String
                      
                      $search_lim .= '\'' . $rest . '\','; // baue query fuer flist limit suche
                      $i++;
            } 
             
        }  // end foreach
        
            $trim_search_lim = substr($search_lim, 8, -1); // schneide letztes komma weg
            $this->filter_limit_flist = (" ( $trim_search_lim ) "); // baue endquery 
            
            break;
   
   case "4": // Semilimit
    
         $zeilen = file('lflist.conf'); 
           foreach ($zeilen as $zeile) 
        {   
          if (strpos($zeile, $search_line_semilimit) !== false) // Zeile #semilimit gefunden
              {
                   $go = "ok"; 
              }
          if($go == "ok")
            {
                      $rest = substr($zeile, 0, -2);  // schneide String
                      
                      $search_lim .= '\'' . $rest . '\','; // baue query fuer flist limit suche
                      $i++;
            } 
             
        }  // end foreach
        
            $trim_search_lim = substr($search_lim, 12, -1); // schneide letztes komma weg
            $this->filter_limit_flist = (" ( $trim_search_lim ) "); // baue endquery 
            
            break;
            
  } // Ende Switch
 
 } // Ende If post filter_limit_flist 
 
} // end function SetFilterSearchLimit

 
   
} // ende class  
?>