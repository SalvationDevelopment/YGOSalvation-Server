function createGame(){
    // ToDo: Generate random string for the room pass
    // ToDo: add Hostform and get string from there
    u.getUnity().SendMessage("GameClient", 'CreateGame', '200OOO8000,0,5,1,U,ECI7o');
}

function deck(filename, main, side, extra) {
    //    if (typeof name  !== "string"){console.log('name must be a string'); return false}
    //    if (typeof main  !== "array") {console.log('main must be a array'); return false}
    //    if (typeof side  !== "array") {console.log('side must be a array'); return false}
    //    if (typeof extra !== "array") {console.log('extra must be a array'); return false}
    var name = filename.substring(0, (filename.length - 4));
    this.name = name;
    this.main = main;
    this.side = side;
    this.extra = extra;
    this.data = JSON.stringify({
        main: this.main,
        side: this.side,
        extra: this.extra
    });

}

function updateDeck(){
u.getUnity().SendMessage("GameClient", 'UpdateDeck', '{"main": ["11366199","11366199","11366199","91449144","91449144","91449144","65277087","65277087","65277087","59575539","59575539","59575539","54455435","54455435","54455435","91662792","91662792","11830996","11830996","11830996","31036355","31036355","31036355","37520316","53129443","70368879","70368879","70368879","5318639","5318639","5318639","14087893","67723438","67723438","67723438","73915051","73915051","72022087","72022087","72022087"],"extra": ["44508094"],"side": ["9012916"]}');
}

function setReady(){
    // ToDo: add Hostwindow where user can lock his Deck
    u.getUnity().SendMessage("GameClient", 'SetReady', 1);
}

function startDuel(){
    // ToDo: Switch the startDuel to HostWindow and disable if not both ready
    u.getUnity().SendMessage("GameClient", 'StartDuel', '');
}
function selectRPS(select){
    u.getUnity().SendMessage("GameClient", 'SelectRPS', select);
    $('#selectRPS').toggle();
}
function selectFirstPlayer(select){
    u.getUnity().SendMessage("GameClient", 'SelectFirstPlayer', select);
    $('#selectFirstPlayer').toggle();
}





