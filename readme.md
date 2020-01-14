[![Code Climate](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/badges/gpa.svg)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server)
[![Test Coverage](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/badges/coverage.svg)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/coverage)
[![Issue Count](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server/badges/issue_count.svg)](https://codeclimate.com/github/SalvationDevelopment/YGOPro-Salvation-Server)
[![Build Status](https://travis-ci.org/SalvationDevelopment/YGOPro-Salvation-Server.svg?branch=master)](https://travis-ci.org/SalvationDevelopment/YGOPro-Support-System)

# Introduction


![Screenshot of Launcher featuring Magi Magi * Gal](/documentation/screenshot.png?raw=true)

Salvation Development is a large scale social engineering non-profit project set out to tackle the 'wicked problem' of Yu-Gi-Oh! Online Simulators via enterprise level software design. To do so it employs a merit of interconnected support software based around the core software of YGOPro. Written in HTML, CSS and JavaScript housed in this and sibling repositories, the project addresses issues of negligence by automating deployment and updating.

[Feature List](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/documentation/features.md)

# Usage
If you are looking for a system to use just for dueling with custom cards server side this is not the system, please use [YGOCore](https://github.com/SalvationDevelopment/YGOCore) for that. This system is much more complex and geared to the sole use of YGOSalvation.

# Installation
- Clone [ygopro-scripts](https://github.com/Fluorohydride/ygopro-scripts) adjacent to this folder.
- Clone [ygopro-pre-scripts](https://github.com/Fluorohydride/ygopro-pre-script) adjacent to this folder.
- Install and properly configure [ygosalvation-admin](https://github.com/SalvationDevelopment/YGOSalvation-Admin) project adjacent to this folder.
- Install and properly configure [ygosalvation-database](https://github.com/SalvationDevelopment/YGOSalvation-Database) project adjacent to this folder.

    ![Folder Structure](/documentation/folder_structure.png?raw=true)

- Nodist should be setup in previous steps. Set local build enviroment up.
    ```Powershell
    nodist local 10
    nodist npm local latest
    ```
- Open your PowerShell (not CMD) as Administrator (this is important). Run the following commands. It installs a build tools, and then the dependencies. 
  ````
  set NODIST_X64=0
  npm install --global windows-build-tools
  npm install
  ````
- create a `.env` file based on the `.env.sample` file.
  - Set `SSL=<path>` SSL isnt needed to work locally during development.
  - Set `ADMIN_SERVER_USERNAME=<string>` and `ADMIN_SERVER_PASSWORD=<string>` based on a "Server" Permission level user in the admin.
  - Set `ADMIN_SERVER_URL` if connecting to a centralized hub, (staging, production), default should suffice for local development 
  - Set `ADMIN_SERVER_LOCAL` to blank if using external admin server.

# Start
````
set NODIST_X64=0
node ./
````
This will create a version of the system on your desktop at http://localhost.

# Licensing
**Do not use our software without our permission.** It is meant for use at http://ygosalvation.com if you want to use this software for something please leave open an issue explaining your intended use and we will write you a custom license.

*This software was developed and designed to help the Yu-Gi-Oh! Online community which for years has been socially suffering. In line with that, to protect the community, this project is 'mostly open'. This software can not be used at scale without written permission. That means no more than 10 users. There is a very specific use case I have in mind where we will give out an a flexible license if asked by companies and major community leaders. I've seen this software abused, and we do not want to see that happen again. Basically you are not allowed to use this without asking for its creator's permission first.*

# Contributing
Feel free to fork the project to change the code around and land patches back via pull request. For JavaScript please make sure it follows standard eslint rules on whitespace and code style.
