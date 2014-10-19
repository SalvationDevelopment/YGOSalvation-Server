The ygocore and the management software communicate via standard out and TCP network. The core signals the management software its current state via a specific API, standard out comes via the console/terminal, these signals should not be confused with debug messages.

API
===

Each call starts with `::::`, this is a standard signal to tell the core it is an API call and not a debug message.

* `::::network-ready` signal that the core has loaded and is listening on its given port
* `::::network-end` signal that the game has ended,  ie kill core request.
* `::::join-slot|#|PlayerName` PlayerName has joined the duel in slot #.
* `::::left-slot|#|PlayerName` PlayerName has left the duel in slot #.
* `::::spectator|#` number of spectators where # is an integer.
* `::::lock-slot|#|bool` slot #'s deck is locked in/out.
* `::::startduel` RPS has started, this signals that the game has started.
* `::::endduel|WinningPlayerSlot#|Reason` the winning player slot integer, and how they won.
* `::::chat|PlayerName|msg` PlayerName sent a message containing the text of `msg`. If the server speaks PlayerName is `[Server]`.

Config
======

By default these commands are off.