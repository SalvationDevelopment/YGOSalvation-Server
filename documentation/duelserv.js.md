# duelserv.js

---

## Preface

---

[duelserv.js](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/libs/duelserv.js) is a server-side script included in [server.js](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/server.js) — which implies that it is **NOT** downloaded by the client — and provides Salvation Development with its own IRC bot.

---

## Requirements

As duelserv is expected to be run on the server with Node-/io.js — in fact, it will only run there —, a running server is self-explanatory.

It requires following npm modules:

- irc
  - This module provides the entire IRC connectivity for the bot (DuelServ)
  - Since most of the bot commands are rather self-explanatory, I will only shortly go over them
- events
  - Node's event handler for everything, attached to the module.exports object
- ps-node
  - ps is a Unix utility used for looking up and killing processes
  - As with irc, I will only shortly describe them
  
---

### Globals

#### Functions

- `randomString()`
  - Generates a pseudo-random alphanumeric string used for duels without a specified password
- `duelrequest(challenger, challengedParty, roompass)`
  - emits an event to [gamelist.js](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/libs/gamelist.js) (more documentation on that [here](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/documentation/gamelist.js.md)) which is then processed by [http-gamelist.js](https://github.com/SalvationDevelopment/YGOPro-Support-System/blob/master/server/http/js/http-gamelist.js) — challenge `challengedParty` to a duel
- `kill(challenger, challengedParty)`
  - as the name suggests, it kills `challengedParty`'s client and forces restart of the launcher
  - emits event like `duelrequest`
- `update()`
  - force all clients to update
  - **<span style="color: red;">currently defunct</span>**
- `globalMsg(message)`
  - emits event like `duelrequest`
  - sends global message to all clients as well as to the IRC channel 'global' (although it appears that this is not the case at the moment)

#### Variables

- `bot`
  - used as reference for new IRC client
- `irc`
  - `irc` is the Node implementation of the IRC standard received with `require`
  - [Read the entire documentation of it here](https://node-irc.readthedocs.org/en/latest/)
- `events`
  - `events` serves as constructor for:
- `eventEmitter`
  - as mentioned above, this handles the entirety of Node.js events
  - used to emit the events described in `duelrequest`, `kill`, `update` and `globalMsg`
- `ps`
  - handles process killing described in the afterword
- `config`
  - arguments given to the IRC constructor
  
---

## Short afterword

`bot` also provides the staff with methods to perform moderating actions, they can:

1. force one or more (or all) clients to
  1. update
  2. close
2. display global messages

All of the above actions are performed by entering commands in the #public channel on the IRC server (available under `config.server`) — for example: `!kill <duelID>`, where `<duelID>` is replaced with any duel's unique ID —, and will enforce forum bans to take effect. However, due to the security risks which this poses, the channel is (naturally) invite-only and hidden.

Action #2 can also render any arbitrary HTML. This feature is one of the reasons why Salvation might be detected as virus: the client method for displaying the message will evaluate any `<script>` tags, which could be used for various malcontent. I'll leave those to your imagination.

Oh, and `bot` also will /sajoin itself into #public if it isn't there already.