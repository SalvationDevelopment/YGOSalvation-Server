[![Code Climate](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System.png)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System)
[![Code Climate](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System/coverage.png)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Support-System)
[![Build Status](https://travis-ci.org/SalvationDevelopment/YGOPro-Support-System.svg?branch=master)](https://travis-ci.org/SalvationDevelopment/YGOPro-Support-System)
[![Support via Gittip](http://img.shields.io/gittip/Zayelion.svg)](https://www.gittip.com/Zayelion/)
[![Stories in Backlog](https://badge.waffle.io/salvationdevelopment/ygopro-support-system.png?label=ready&title=Planned )](https://waffle.io/salvationdevelopment/ygopro-support-system)
[![Stories in Progress](https://badge.waffle.io/salvationdevelopment/ygopro-support-system.png?label=In%20Progress&title=In%20Progress )](https://waffle.io/salvationdevelopment/ygopro-support-system)
#YGOPro Support System
**by Salvation Development**

Salvation Development is a large scale social engineering non-profit project set out to tackle the 'wicked problem' of Yu-Gi-Oh! Online Simulators via enterprise level software design. To do so it employs a merit of interconnected support software based around the core support software of YGOPro, Invision Power Boards, and IRC written in JavaScript and SQL housed in this repository. The project addresses administrator megalomania, social stablity, competitive player group think, extremely high lack of public project oversight, developer negligence,  funding, and automation. 

(https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/documentation/features.md)



## Installation
If you are looking for a system to use just for dueling with custom cards server side this is not the system, please use [YGOCore](https://github.com/SalvationDevelopment/YGOCore) for that. This system is much more complex and geared to the sole use of SalvationDevelopment.

Install `nodejs` this will also install `node` and `npm`, download the program from this git and unzip it or clone to desktop. Navigate to that folder in `cmd` or `console`. Run the following commands:
* `npm install` installs the actual program dependencies.
* `npm install -g istanbul` installs the code coverage check system.
* `npm install -g mocha`  installs the test harnss.
* `npm install -g http-server`  an overpowered http server\http to run the server folder.
* A local private IRC server is also recommended.

This will setup a run enviroment  you two test harnesses and an http server. Next download and install [YGOCore](https://github.com/SalvationDevelopment/YGOCore) follow its readme instuctions carefully to compile. Place the executable and its dependencies in `server/ygocore`. Place a copy of `ygopro` in `server/http/ygopro`. Make sure the config files in the `ygocore` directory are pointing to the correct locations. Refer to the YGOCore documentation. Congrats you know have a fully functional server you are not allowed to use except for development reasons, please refer to the license. Open `client\interface\js\configuration.js` set `mode` to `development`, the launcher will now connect to this new server.

## Licensing and Contributing
**Do not use our software without our permission.** It is ment for use at http://ygopro.us if you want to use this software for something please leave open an issue explaining your intended use and we will write you a custom licence.

*This software was developed and designed to help the Yu-Gi-Oh! Online community which for years has been socially suffering. In line with that, to protect the community this project is 'mostly open'. This software can not be used at scale without written permission. That means no more than 10 users. There is a very speific use case I have in mind where we will give out an a flexible licence if asked, by companies and major community leaders. I've seen this software abused we do not want to see that happen again. Basically you are not allowed to use this without asking its creators permission first.*
