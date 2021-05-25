# Self Updating
YGOSalvation manages individual files and stays in a live deployment mode allowing the developers to quickly push updates without fear, and easily correct bugs in real time.

##Server Side
The production server is registered to GitHub and recieves notifications via HTTP REST calls about updates to its source code. When it gets an update it will compile a manifest of all the file names and thier sizes in the system the end-user needs to keep upto date. It then creates a JSON file that stores that manifest as a variable.

##Server Internal Update
Each microservice will listen for a manifest update then shut down and restart in a way that will not interrupt end-user gameplay  signifigantly. (with the currect execption of browser mode players).