[![Code Climate](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/badges/gpa.svg)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server)
[![Test Coverage](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/badges/coverage.svg)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/coverage)
[![Issue Count](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/badges/issue_count.svg)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server)
[![Build Status](https://travis-ci.org/SalvationDevelopment/YGOPro-Salvation-Server.svg?branch=master)](https://travis-ci.org/SalvationDevelopment/YGOPro-Support-System)
[![Support via Gittip](http://img.shields.io/gittip/Zayelion.svg)](https://www.gittip.com/Zayelion/)
[![Stories in Backlog](https://badge.waffle.io/salvationdevelopment/ygopro-support-system.png?label=ready&title=Planned )](https://waffle.io/salvationdevelopment/ygopro-support-system)
[![Stories in Progress](https://badge.waffle.io/salvationdevelopment/ygopro-support-system.png?label=In%20Progress&title=In%20Progress )](https://waffle.io/salvationdevelopment/ygopro-support-system)
#YGOPro Salvation Server
**by Salvation Development**

Salvation Development is a large scale social engineering non-profit project set out to tackle the 'wicked problem' of Yu-Gi-Oh! Online Simulators via enterprise level software design. To do so it employs a merit of interconnected support software based around the core support software of YGOPro, [Invision Power Boards](https://www.invisionpower.com/), and [InspIRCD](https://github.com/inspircd/inspircd/releases) written in HTML, CSS and JavaScript housed in this repository. The project addresses issues of negligence by automating deployment and updating.

![Screenshot of Launcher featuring Magi Magi * Gal](/documentation/screenshot.jpg?raw=true)

[Feature List](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/documentation/features.md)

## Usage
If you are looking for a system to use just for dueling with custom cards server side this is not the system, please use [YGOCore](https://github.com/SalvationDevelopment/YGOCore) for that. This system is much more complex and geared to the sole use of SalvationDevelopment.

## Installation

Install [Node JS](https://nodejs.org/en/) this will also install `node` and `npm` to your commandline, download or clone the program from this repository. Navigate to that folder in `cmd` or `terminal`. Run the following commands:

* `npm install -g istanbul` installs the code coverage check system.
* `npm install -g mocha`  installs the test harness.
* A local private IRC server is also recommended.

This will setup a run enviroment  you a test harnesses.

To run the system use `node server`. This will create a version of the system on your desktop at http://localhost.

### Windows 10 users (updated installation steps)

- Install [Nodist](https://github.com/marcelklehr/nodist) instead of Node JS.
- Open your PowerShell as Administrator (this is important), then `cd` to the root of the cloned repository to install the following 
  - `npm install --global windows-build-tools`
  - `npm install yarn -g`
  - `yarn install`

## Licensing
**Do not use our software without our permission.** It is ment for use at http://ygopro.us if you want to use this software for something please leave open an issue explaining your intended use and we will write you a custom licence.

*This software was developed and designed to help the Yu-Gi-Oh! Online community which for years has been socially suffering. In line with that, to protect the community this project is 'mostly open'. This software can not be used at scale without written permission. That means no more than 10 users. There is a very speific use case I have in mind where we will give out an a flexible licence if asked, by companies and major community leaders. I've seen this software abused we do not want to see that happen again. Basically you are not allowed to use this without asking its creators permission first.*

## Contributing
Feel free to fork the project to change the code around and land patches back via pull request. For JavaScript please make sure it follows standard jslint rules on whitespace.
