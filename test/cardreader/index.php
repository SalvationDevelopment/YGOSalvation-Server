<?php
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: http://unity.devpro.org');
header('content-type: application/json; charset=utf-8');

require_once 'cards/cards.php';   

$card = new cards();

    if(isset($_GET['site'])){
        switch ($_GET['site']){
            case 'texts':
               $card->getCardsTexts();
               break;
           
           case 'datas':
               $card->getCardsDatas();
               break;
               
           default:
               $card->getCardsTexts();
        }
    }  else {
        $card->getCardsTexts();
}

?>

   