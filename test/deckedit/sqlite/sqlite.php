<?php
class MyDB extends SQLite3
{
    function __construct()
    {
        $this->open('cards/german/cards.cdb');
    }
    
    function open_en_cards()
    {
        $this->open('cards/english/cards.cdb');
    }
}
?>