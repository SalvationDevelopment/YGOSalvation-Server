[![Dependencies](https://david-dm.org/SalvationDevelopment/YGOPro-Support-System.svg)](https://david-dm.org/)
[![Code Climate](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System.png)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System)
[![Code Climate](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System/coverage.png)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System)
[![Build Status](https://travis-ci.org/SalvationDevelopment/YGOPro-Support-System.svg?branch=master)](https://travis-ci.org/SalvationDevelopment/YGOPro-Support-System)
[![Support via Gittip](http://img.shields.io/gittip/Zayelion.svg)](https://www.gittip.com/Zayelion/)
[![Stories in Backlog](https://badge.waffle.io/salvationdevelopment/ygopro-support-system.png?label=ready&title=Plans )](https://waffle.io/salvationdevelopment/ygopro-support-system)
#YGOPro Support System
**by Salvation Development**

Salvation Development is a large scale social engineering non-profit project set out to tackle the 'wicked problem' of Yu-Gi-Oh! Online Simulators via enterprise level software design. To do so it employs a merit of interconnected support software based around the core software of YGOPro, WordPress, and IRC housed in this repository. The project addresses administrator megalomania, social stablity, competitive player group think, extremely high lack of public project oversight, developer negligence,  funding, and automation. The following facilitates this:
* A server system based on NodeJS 
* A server GUI based on node-webkit
* node-webkit based YGOPro Launcher
* Mirco unit automatic update system, self update only what it needs, no versioning.
* Checkmate Server Access
* YGOPro settings Control UI
* Forum Intergration

YGOCore not included

## Planned Features & Goals
* Automatic redeployment based on community activity
* IRC intergration
* Web browser launcher/client
* Launcher-Client persistent settings control
* Format specific card pools
* TCG rule support

It isnt our goal to be the best simulator as far as feature sets, we have a defined system in mind that is not a reproduction of any other simulator or official game. It is something unique, inspired from all previous system, learning from the best elements and working them into something each type of duelist can appreciate.


## Installation
Download the server, run it. Thats it. *(Config in development hince vagueness)*
###Development Area
Install `nodejs` this will also install `npm`, download the program from this git and unzip it. Navigate to that folder in `cmd` or `console`. Run the following commands:
* `npm install` installs the actual program.
* `npm install -g istanbul` installs the code coverage check system.
* `npm install -g mocha`  installs the test harnss.
* `npm install -g http-server`  an overpowered http server to run the server folder.

This will setup a run enviroment  you two test harnesses and an http server. In the future it will download an install the YGOCore and compile it to your systems native architure. Edit the `servercontrol.json` file with the name of your remote installations for production and stage (You shouldnt have a production area see License).

## Licensing and Contributing
*This software was developed and designed to help the Yu-Gi-Oh! Online community which for years has been socially suffering. In line with that, to protect the community this project is 'mostly open'. This software can not be used at scale without my written permission. That means no more than 10 users. There is a very speific use case I have in mind where I will not give out an a flexible licence if asked, by companies and major community leaders. I've seen this software abused I do not want to see that happen again. Basically you are not allowed to use this without asking its creators permission first.*

##Donations
Donations go to our opted-in staff memebers that work on the project. They pay taxes on it.


[![Support via Gittip](https://rawgithub.com/twolfson/gittip-badge/0.2.0/dist/gittip.png)](https://www.gittip.com/Zayelion/)
