# YGOPro Salvation Server Game Manager Microservice API 0.1.0

##Preface
The main feature of second generation and beyond YGOPro servers is a gamelist, it is the key desirable feature. This is a collection of active and avaliable duels that the end-user can join to duel or spectate in. It gives an overview of the server activity level and possibly health. To achieve this the server side instance of YGOPro needs to be able to communicate what is happening within the process, and route the end-user to the requested game because only one port is exposed to all end users to connect to, and YGOPro/YGOServers need unique ports to operate on. Salvation takes this a step farther beyond Percy Checkmate DevPro and MyCard in providing unique routing for alternative script, database, and banlist configurations.

##TCP and Websocket Connection
The game-manager-microservice provides a standard port for both standard YGOPro communications and websocket wrapped browser communications. 

##Shutdown Listener
On update the system will close the port listeners, but not shut down for 10 mins. 

##Understanding YGOPro
YGOPro has a rather complex network API compared to the working language of the server JavaScript. It features C++ structures printed to memory, and specifically crafted buffer streams. The game-manager-microservice can only understand a few of these natively and leaves the rest for the `ygoserver.exe` process to communicate to it. On new connection the game-manager-microservice listens to the first two message commands and gets a `roompass`. It then parses this room pass and starts `ygoserver.exe` on a new port, then patches the YGOPro of the end-user to `ygoserver.exe`. During the parsing the game-manager-microservice checks the security of verification of the user and will ignore the request of unverified users.