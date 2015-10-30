# YGOPro Salvation Server Update Microservice API 0.1.0

##Preface
This feature is unique to Salvation and provides its extreme speed. Salvation manages individual files and keeps in a live deployment mode allowing the developers to quickly push updates without fear, and easily correct bugs in real time.

##Server Side
The production server is registered to GitHub and recieves notifications via HTTP REST calls about updates to its source code. When it gets an update it will compile a manifest of all the file names and thier sizes in the system the end-user needs to keep upto date. It then creates a JavaScript file that stores that manifest as a variable.

##Client Side
On boot the client-server will process the server manifest and compare it to its own files compiling a list of files within a 1KB error range. It then downloads each file one by one and self updates.

##Server Internal Update
Each microservice will listen for a manifest update then shut down and restart in a way that will not interrupt end-user gameplay  signifigantly. (with the currect execption of browser mode players).