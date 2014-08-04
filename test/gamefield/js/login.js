function login(){
    u.getUnity().SendMessage("HubClient", "Login", "{'Username' : '" + ($('#username').val()) + "', 'Password' : '" + ($('#password').val()) + "', 'UID' : 'Unity', 'Version' : '998000'}");
}


