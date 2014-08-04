<?php
    if(isset($_GET['mainDeck'])){
        $mainDeck = $_GET['mainDeck'];
        $xtraDeck = htmlspecialchars($_GET['xtraDeck']);
        $sideDeck = htmlspecialchars($_GET['mainDeck']);
    }
    $mainDeckArray = explode(',',$mainDeck);
    $xtraDeckArray = explode(',',$xtraDeck);
    $sideDeckArray = explode(',',$sideDeck);
    
    
    $fp = fopen('../download/deck.ydk', 'w');
    // Main 
    fputs($fp, '#main'."\n");
    foreach($mainDeckArray as $values) fputs($fp, $values."\n"); 
    // Xtra
    fputs($fp, '#extra'."\n");
    foreach($xtraDeckArray as $values) fputs($fp, $values."\n");
    // side
    fputs($fp, '!side'."\n");
    foreach($sideDeckArray as $values) fputs($fp, $values."\n"); 
    fclose($fp); 
   
    

    

?>
