import net from "net";
import tls from "tls";
import carrier from "carrier";
import fs from "fs";
import path from "path";
import assert from "assert";
import { createRequire } from "module";
import config from "../../config/irc.js";

const require = createRequire(import.meta.url);

/**
 * Normalizes Winston so the legacy ircdjs integration can continue using the
 * single-argument `log` calls it relied on in the 0.x series while also ensuring
 * a console transport is registered by default.
 *
 * @param {import("winston")} logger - Winston instance to patch for backward compatibility.
 * @returns {import("winston")} Winston logger with legacy behaviours restored.
 */
function applyLegacyWinstonCompat(logger) {
  if (!logger || logger.__legacyCompatApplied) return logger;

  const originalLog = logger.log.bind(logger);

  logger.log = function logWithDefaultLevel(levelOrMessage, maybeMessage, ...rest) {
    if (typeof maybeMessage === "undefined" && typeof levelOrMessage === "string") {
      return originalLog("info", levelOrMessage, ...rest);
    }

    if (
      typeof levelOrMessage === "object" &&
      levelOrMessage !== null &&
      "message" in levelOrMessage &&
      !("level" in levelOrMessage)
    ) {
      return originalLog({ level: "info", ...levelOrMessage });
    }

    return originalLog(levelOrMessage, maybeMessage, ...rest);
  };

  if (
    logger.add &&
    logger.default?.transports &&
    logger.default.transports.length === 0 &&
    logger.transports?.Console
  ) {
    logger.add(
      new logger.transports.Console({
        level: "info",
        format: logger.format.simple(),
      }),
    );
  }

  logger.__legacyCompatApplied = true;
  return logger;
}

const baseWinston = applyLegacyWinstonCompat(require("winston"));
const ircd = require("ircdjs");
const irc = require("ircdjs/lib/protocol.js");
const { Channel } = require("ircdjs/lib/channel.js");
const { User } = require("ircdjs/lib/user.js");
const { History, ChannelDatabase, UserDatabase } = require("ircdjs/lib/storage.js");
const ServerCommands = require("ircdjs/lib/commands.js");
const winston = applyLegacyWinstonCompat(ircd.winston || baseWinston);

const exists = fs.exists || path.exists; // Compatibility for older Node versions

/**
 * Wraps a raw socket stream to associate it with IRC user metadata.
 *
 * @param {net.Socket} stream - Incoming TCP stream from a client.
 * @constructor
 */
function AbstractConnection(stream) {
  this.stream = stream;
  this.object = null;

  this.__defineGetter__("id", function () {
    return this.object ? this.object.id : "Unregistered";
  });
}

/**
 * IRC server orchestrator responsible for user, channel, and history state.
 *
 * @constructor
 */
function Server() {
  this.history = new History(this);
  this.users = new UserDatabase(this);
  this.channels = new ChannelDatabase(this);
  this.config = config;
  this.commands = new ServerCommands(this);
}

/**
 * Boots the IRC server and registers the default channels.
 *
 * @returns {void}
 */
Server.boot = function () {
  var server = new Server();

  server.start();
  server.createDefaultChannels();


  process.on("SIGTERM", function () {
    winston.info("Exiting...");
    server.close();
  });
};

Server.prototype = {
  version: "0.0.22",
  created: "2012-09-21",
  debug: false,
  get name() {
    return this.config.serverName;
  },
  get info() {
    return this.config.serverDescription;
  },
  get token() {
    return this.config.token;
  },
  get host() {
    return ":" + this.config.hostname;
  },

  /**
   * Parses CLI flags to determine an alternate configuration file.
   *
   * @returns {string | null}
   */
  cliParse: function () {
    var file = null;

    commander
      .option(
        "-f --file [file]",
        "Configuration file (Defaults: /etc/ircdjs/config.json or ../config/config.json)"
      )
      .parse(process.argv);
    // When the -f switch is passwd without a parameter, commander.js evaluates it to true.
    if (commander.file && commander.file !== true) file = commander.file;
    return file;
  },

  /**
   * Normalizes IRC identifiers for consistent lookups.
   *
   * @param {string} name - Raw channel or nickname value.
   * @returns {string | undefined}
   */
  normalizeName: function (name) {
    return (
      name &&
      name
        .toLowerCase()
        .replace(/{/g, "[")
        .replace(/}/g, "]")
        .replace(/\|/g, "\\")
        .trim()
    );
  },

  /**
   * Determines whether the provided string represents a positive integer.
   *
   * @param {string} str - Value to evaluate.
   * @returns {boolean}
   */
  isValidPositiveInteger: function (str) {
    var n = ~~Number(str);
    return String(n) === str && n >= 0;
  },

  /**
   * Checks whether a normalized value exists within a collection of objects.
   *
   * @param {string} value - Value to search for.
   * @param {Array<Record<string, string>>} collection - Items that contain the field to inspect.
   * @param {string} field - Property to compare against the normalized value.
   * @returns {boolean}
   */
  valueExists: function (value, collection, field) {
    var self = this;
    value = this.normalizeName(value);
    return collection.some(function (u) {
      return self.normalizeName(u[field]) === value;
    });
  },

  //make sure the channel name is valid as per RFC 2813
  /**
   * Validates whether a target references a channel by inspecting its prefix.
   *
   * @param {string} target - Raw IRC message target.
   * @returns {boolean}
   */
  channelTarget: function (target) {
    var prefix = target[0];
    var channelPrefixes = ["#", "&", "!", "+"];
    return channelPrefixes.indexOf(prefix) !== -1;
  },

  /**
   * Parses a raw IRC message line into a structured command payload.
   *
   * @param {string} data - Raw IRC message data.
   * @returns {{command: string, args: string[]}}
   */
  parse: function (data) {
    var parts = data.trim().split(/ :/),
      args = parts[0].split(" ");

    parts = [parts.shift(), parts.join(" :")];

    if (parts.length > 0) {
      args.push(parts[1]);
    }

    if (data.match(/^:/)) {
      args[1] = args.splice(0, 1, args[1]);
      args[1] = (args[1] + "").replace(/^:/, "");
    }

    return {
      command: args[0].toUpperCase(),
      args: args.slice(1),
    };
  },

  /**
   * Executes a parsed command against the registered server command set.
   *
   * @param {User} user - IRC user issuing the command.
   * @param {{command: string, args: string[]}} message - Parsed IRC message payload.
   * @returns {void}
   */
  respondToMessage: function (user, message) {
    this.commands[message.command].apply(
      this.commands,
      [user].concat(message.args)
    );
  },

  /**
   * Handles raw client input and dispatches the command when valid.
   *
   * @param {string} data - Raw IRC line from the client.
   * @param {AbstractConnection} client - Client connection wrapper.
   * @returns {void}
   */
  respond: function (data, client) {
    var message = this.parse(data);

    if (this.validCommand(message.command)) {
      if (this.config.serverPassword && !client.object.passwordAccepted) {
        this.queueResponse(client, message);
      } else {
        this.respondToMessage(client.object, message);
      }
    }
  },

  /**
   * Queues client messages until authentication succeeds.
   *
   * @param {AbstractConnection} client - Client connection wrapper.
   * @param {{command: string, args: string[]}} message - Parsed IRC message payload.
   * @returns {void}
   */
  queueResponse: function (client, message) {
    if ("PASS" === message.command) {
      // Respond now
      client.object.pendingAuth = false;
      this.respondToMessage(client.object, message);
    } else {
      client.object.queue(message);
    }
  },

  /**
   * Determines whether an incoming command is implemented.
   *
   * @param {string} command - Command identifier to validate.
   * @returns {boolean}
   */
  validCommand: function (command) {
    return this.commands[command];
  },

  /**
   * Registers the configured default channels on boot.
   *
   * @returns {void}
   */
  createDefaultChannels: function () {
    var self = this;
    if (this.config.channels) {
      Object.keys(this.config.channels).forEach(function (channel) {
        var channelName = "";
        if (!self.channelTarget(channel)) {
          channelName = "#" + channel;
        } else {
          channelName = channel;
        }
        var newChannel = (self.channels.registered[
          self.normalizeName(channelName)
        ] = new Channel(channelName, self));
        newChannel.topic = self.config.channels[channel].topic;
      });
    }
  },

  /**
   * Sends the message-of-the-day banner to the provided user.
   *
   * @param {User} user - IRC user to receive the MOTD.
   * @returns {void}
   */
  motd: function (user) {
    user.send(
      this.host,
      irc.reply.motdStart,
      user.nick,
      ":- Message of the Day -"
    );
    user.send(
      this.host,
      irc.reply.motd,
      user.nick,
      this.config.motd || "No message set"
    );
    user.send(
      this.host,
      irc.reply.motdEnd,
      user.nick,
      ":End of /MOTD command."
    );
  },

  /**
   * Begins periodically checking for user timeouts and dispatching pings.
   *
   * @returns {void}
   */
  startTimeoutHandler: function () {
    var self = this;
    var timeout = this.config.pingTimeout || 10;
    this.timeoutHandler = setInterval(function () {
      self.users.forEach(function (user) {
        if (user.hasTimedOut()) {
          winston.info("User timed out:", user.mask);
          self.disconnect(user);
        } else {
          // TODO: If no other activity is detected
          user.send("PING", self.config.hostname, self.host);
        }
      });
    }, timeout * 1000);
  },

  /**
   * Stops the timeout polling interval.
   *
   * @returns {void}
   */
  stopTimeoutHandler: function () {
    clearInterval(this.timeoutHandler);
  },

  /**
   * Starts listening for IRC client connections.
   *
   * @param {() => void} [callback] - Optional callback executed once listening.
   * @returns {void}
   */
  start: function (callback) {
    var server = this,
      key,
      cert,
      options;

    if (this.config.key && this.config.cert) {
      try {
        key = fs.readFileSync(this.config.key);
        cert = fs.readFileSync(this.config.cert);
      } catch (exception) {
        winston.error("Fatal error:", exception);
      }
      options = { key: key, cert: cert };
      this.server = tls.createServer(options, handleStream);
    } else {
      this.server = net.createServer(handleStream);
    }

    assert.ok(callback === undefined || typeof callback == "function");
    this.server.listen(this.config.port, callback);
    winston.info("Server listening on port: " + this.config.port);

    this.startTimeoutHandler();

    /**
     * Handles an accepted socket stream by wiring up IRC event listeners.
     *
     * @param {net.Socket} stream - Accepted client stream.
     * @returns {void}
     */
    function handleStream(stream) {
      try {
        var carry = carrier.carry(stream),
          client = new AbstractConnection(stream);

        client.object = new User(client, server);
        if (server.config.serverPassword) {
          client.object.pendingAuth = true;
        }

        stream.on("end", function () {
          server.end(client);
        });
        stream.on("error", winston.error);
        carry.on("line", function (line) {
          server.data(client, line);
        });
      } catch (exception) {
        winston.error("Fatal error:", exception);
      }
    }
  },

  /**
   * Closes the IRC server and cleans up listeners.
   *
   * @param {() => void} [callback] - Optional callback triggered on close.
   * @returns {void}
   */
  close: function (callback) {
    if (callback !== undefined) {
      assert.ok(typeof callback === "function");
      this.server.once("close", callback);
    }
    this.stopTimeoutHandler();
    this.server.close();
  },

  /**
   * Handles the end of a client connection by disconnecting the user.
   *
   * @param {AbstractConnection} client - Client connection wrapper.
   * @returns {void}
   */
  end: function (client) {
    var user = client.object;

    if (user) {
      this.disconnect(user);
    }
  },

  /**
   * Removes a user from all channels and closes their stream.
   *
   * @param {User} user - IRC user to disconnect.
   * @returns {void}
   */
  disconnect: function (user) {
    user.channels.forEach(function (channel) {
      channel.users.forEach(function (channelUser) {
        if (channelUser !== user) {
          channelUser.send(user.mask, "QUIT", user.quitMessage);
        }
      });

      channel.users.splice(channel.users.indexOf(user), 1);
    });

    user.closeStream();
    this.users.remove(user);
    user = null;
  },

  /**
   * Processes an incoming line of IRC data from the client.
   *
   * @param {AbstractConnection} client - Client connection wrapper.
   * @param {string} line - Raw IRC data line.
   * @returns {void}
   */
  data: function (client, line) {
    line = line.slice(0, 512);
    winston.info("[" + this.name + ", C: " + client.id + "] " + line);
    this.respond(line, client);
  },
};


export default Server;
