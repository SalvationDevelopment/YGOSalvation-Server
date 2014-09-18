The ygocore and the management software communicate via standard out and TCP network. The core signals the management software its current state via a specific API, standard out comes via the console/terminal, these signals should not be confused with debug messages.

API
===

Each call starts with `::::`, this is a standard signal to tell the core it is an API call and not a debug message.

* `::::network-ready` signal that the core has loaded and is listening on its given port
* `::::network-end` signalal that the game has ended, replays have been sent out and the core should be recycled, ie killed.
* `::::join-slot-1|PlayerName` PlayerName has joined the duel in slot 1.
* `::::join-slot-2|PlayerName` PlayerName has joined the duel in slot 2.
* `::::join-slot-3|PlayerName` PlayerName has joined the duel in slot 3.
* `::::join-slot-4|PlayerName` PlayerName has joined the duel in slot 4.
* `::::left-slot-1|PlayerName` PlayerName has left the duel in slot 1.
* `::::left-slot-2|PlayerName` PlayerName has left the duel in slot 2.
* `::::left-slot-3|PlayerName` PlayerName has left the duel in slot 3.
* `::::left-slot-4|PlayerName` PlayerName has left the duel in slot 4.
* `::::spectator|#` number of spectators where # is an integer.
* `::::lock-slot-1` slot 1's deck is locked in.
* `::::lock-slot-2` slot 2's deck is locked in.
* `::::lock-slot-3` slot 3's deck is locked in.
* `::::lock-slot-4` slot 4's deck is locked in.
* `::::unlock-slot-1` slot 1's deck has been unlocked.
* `::::unlock-slot-2` slot 2's deck has been unlocked.
* `::::unlock-slot-3` slot 3's deck has been unlocked.
* `::::unlock-slot-4` slot 4's deck has been unlocked.
* `::::startduel` RPS has started, this signals that the game has started. All players have locked in decks and no one may leave the duel without loss.
* `::::endduel|WinningPlayer|Reason` the winning player slot, and how they won.
::::