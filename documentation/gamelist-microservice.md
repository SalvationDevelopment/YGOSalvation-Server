# YGOPro Salvation Server Gamelist Microservice API 0.1.0

##Preface
The main feature of second generation and beyond YGOPro servers is a gamelist, it is the key desirable feature. This is a collection of active and avaliable duels that the end-user can join to duel or spectate in. It gives an overview of the server activity level and possibly health. Third generation and beyond gamelist are in real time using TCP communications. Salvation's gamelist uses websockets to communicate with other microservices and both the end-users browser-client and server-client. This is the internal standard for internal communication across the archeticture except to the forums which uses REST HTTP calls.

##Boot
On boot the gamelist will have a 10 second span where it will ask the internal servers for its gamelist, if one responds it will update its internal dictionary of users (registry) and the gamelist to match. On a cold boot these will be blank, or only contain the defaults. This process provides service crash recovery, the main pain process of the microservice will automatically restart the process on crash providing redunancy. End-users will detect a momentarily disconnection, but no lost of the gamelist.

##Gamelist Update Messages
The gamelist-microservice recieves text inputs from the `routing-boot` subprocess of the game-manager-microservice. These inputs are documented with the `ygocore`. These are parsed and used to update the gamelist. Chat communications are logged to file and outputed to the IRC server in the `#public` room. If a game falls into a specific state it will remove it from the game list and try to kill the `ygoserver.exe` process associated with it in its records.

    - Zero players, and zero spectators.
    - Name of the room is not exactly 24 charaters. This is managed else where but this is a contengency.
    - Game is older than 45 mins.

##Registry
To avoid bot nukes from malicious users with an understanding of second generation YGOPro server workings, a user must be registered to our forums and have logged into from thier current IP address within the time of server restart to duel. This process is completely fluid to normal users but prove extra steps for attackers. This registry is an internal dictionary of users provided to all relivant microservices. 
The registry is distributed to the `routing-boot` subprocess of the game-manager-microservice. It compares the IP of incoming duels to those on the 'ok list' the registry provides and will disconnect any user not on it immediately. 

###Known issues

- There are some holes in this model that need to be patched in future releases where the system is subpar in comparision to DevPro's more active defenses. Salvation does not deregister users on disconnection.

- Repeated request to the forum for verification cause server instablity and overload of the server, the gamelist-microprocess therefore limits redundant calls to one per minute.

##Admin Commands
For an admin command to be executed the user must be an administrator on the forums.

    * global : Global Message to all users, these are cached in memory and users logging in will get the previous message.
    * killgame : Takes a `pid` number, kills that process on the server indescrimately. (Needs to be limited to YGOServer.exe processes)
    * murder : Disconnects a specific user.
    * genocide : Disconnects all users.
    * update : Forces all users to initate thier update system immediately without reloading the manifest.
    
These commands can be accessed via the launcher. DuelServ no longer provides these capablities to avoid issues within the administration. Thes commands tap into the the gamelist-microservice's natural gamelist cleanup systems.
    
##Client-Server
The end-user's launcher application is two conceptual spaces, the client-browser and the client-server. Because we plan on going to a pure brower system the commands sent to the client-server have been encapsulated and do not directly communicate with the client-browser, the primary user interface provided by `http://ygopro.us`. The client-server uses `nwjs`'s nodejs and chromium hybrid nature to act as a unsandboxed application enviroment. It is able to access the user interface file system and network. To communicate internally the client-server generates a random identifier, then injects it into the client browser. The client-browser and client-server then connect to a private room within the gamelist communication system and are able to communicate. Metaphorically throwing a ball over a fence, the fence being the server. In the future when the system is purely browser based the client-server will be defuncted. For this reason the launcher does not work offline. The client-server provides a backup interface if accessed offline that ignores this seperation of conserns and can communicate directly with it.

##Client-Browser
After render the client-browser will connect to the gamelist-microservice and recieve gamelist updates. After login it will register its username and IP with the gamelist-microservice and start recieving global update messages along with communications from its paired client-server process. On connection there is usually an immediate update from the client-server and global cached and needing processing which the client-browser retriveves on its registration call.

