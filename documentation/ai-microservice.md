# YGOPro Salvation Server AI Microservice API 0.1.0

##Preface
A key feature of third generation YGOPro Software is an artificial intellegence for the user to duel against. Salvation mixes the Dawn of a New Era and DevPro `windbot.exe` system then wraps it in a microservice that acts as a standard client-browser interface to the server listening for duel request against it. If a deck name is passed it will use that deck.

##Windbot
Salvation uses a fork of IceYGO's windbot system. DevPro's Devbot and Dawns "J.A.R.I.S" are also forks. Windbot was modified to take parameters on boot and is launched and managed for cleanup via the microservice. Windbot can eat up signifigant portions of memory if not managed.