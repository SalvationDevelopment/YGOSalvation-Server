[![Build Status](https://travis-ci.org/SalvationDevelopment/YGOCoreJS.svg?branch=master)](https://travis-ci.org/SalvationDevelopment/YGOCoreJS)

For each YGOPro implementation there are four programs that need to be running to maintain the system.
* Player 1's Client
* Player 2's Client
* Server's Client
* Server Management Software.

YGOCoreJS is an implementation of the Server Management Software using Nodejs and IRC. The system is built to handle a specification of 10k users at once that are 


Installation
============
The isntallation and execution of the server was designed to be as easy as possible.

Requirements
------------
* NodeJS  
* GitHub (Git)


``` bash
cd /installation-directory/
git clone git://github.com/SalvationDevelopment/YGOCoreJS/YGOCore.git
npm install -g node-gyp
npm install
```

Running
-------
A single core for testing reasons can be spun up via command prompt, options are intergers unless otherwise stated.
``` bash
node ygoserver
```
