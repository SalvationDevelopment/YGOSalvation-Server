'use strict';

const childProcess = require('child_process');
const path = require('path');

/**
 * Creates lobby hosted game service used by the lobby hosted game service module.
 * @param {Object} options The options object supplies the structured input used by the lobby hosted game service module.
 * @param {Function} options.broadcast The `broadcast` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.consoleLog The `consoleLog` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.dateNow The `dateNow` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.logDuel The `logDuel` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.parseHostConfig The `parseHostConfig` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.roomStatePacket The `roomStatePacket` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.sendPacket The `sendPacket` property supplies structured input used by the lobby hosted game service module.
 * @param {Object} options.state The `state` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.validateSession The `validateSession` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.clearTimeoutFn The `clearTimeoutFn` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.forkProcess The `forkProcess` property supplies structured input used by the lobby hosted game service module.
 * @param {string} options.gameChildCwd The `gameChildCwd` property supplies structured input used by the lobby hosted game service module.
 * @param {Object} options.pathModule The `pathModule` property supplies structured input used by the lobby hosted game service module.
 * @param {string[]} options.processArgv The `processArgv` property supplies structured input used by the lobby hosted game service module.
 * @param {Object} options.processEnv The `processEnv` property supplies structured input used by the lobby hosted game service module.
 * @param {Function} options.setTimeoutFn The `setTimeoutFn` property supplies structured input used by the lobby hosted game service module.
 * @returns {{handleChildMessage: Function, hostGame: Function, spawnHostedChild: Function}} Returns the value produced by the lobby hosted game service module.
 */
class LobbyHostedGameService {
  constructor({
    state,
    broadcast,
    consoleLog = console.log,
    dateNow = Date.now,
    logDuel,
    parseHostConfig,
    roomStatePacket,
    sendPacket,
    validateSession,
    clearTimeoutFn = clearTimeout,
    forkProcess = childProcess.fork.bind(childProcess),
    gameChildCwd = path.resolve(__dirname, 'game'),
    pathModule = path,
    processArgv = process.argv,
    processEnv = process.env,
    setTimeoutFn = setTimeout
  }) {
  /**
   * Resolves random port used by the lobby hosted game service module.
   * @returns {number} Returns the value produced by the lobby hosted game service module.
   */
  function unsafePort() {
    const minPort = processEnv.PORT_RANGE_MIN
      ? Number(processEnv.PORT_RANGE_MIN)
      : 2000;
    const maxPort = processEnv.PORT_RANGE_MAX
      ? Number(processEnv.PORT_RANGE_MAX)
      : 9000;

    return Math.floor(Math.random() * (maxPort - minPort) + minPort);
  }

  /**
   * Resolves hosted port used by the lobby hosted game service module.
   * @param {(number|null)} requestedPort The requestedPort value provides an input used by the lobby hosted game service module.
   * @returns {number} Returns the value produced by the lobby hosted game service module.
   */
  function resolveHostedPort(requestedPort) {
    const preferredPort = Number(requestedPort);
    if (
      Number.isFinite(preferredPort) &&
      preferredPort > 0 &&
      !state.gamePorts[preferredPort]
    ) {
      return Math.trunc(preferredPort);
    }

    let attempts = 0;
    while (attempts < 100) {
      const candidate = unsafePort();
      if (!state.gamePorts[candidate]) {
        return candidate;
      }
      attempts += 1;
    }

    return unsafePort();
  }

  /**
   * Resolves debug port used by the lobby hosted game service module.
   * @returns {number} Returns the value produced by the lobby hosted game service module.
   */
  function unsafeDebugPort() {
    const port = state.nextCoreDebugPort;
    state.nextCoreDebugPort += 1;
    return port;
  }

  /**
   * Updates gamelist from child used by the lobby hosted game service module.
   * @param {Object} message The message value provides an input used by the lobby hosted game service module.
   * @returns {void} Does not return a value.
   */
  function updateGamelistFromChild(message) {
    const roompass = message?.game?.roompass || message?.roompass;
    if (!roompass || !message?.game) {
      return;
    }

    state.gamelist[roompass] = message.game;
  }

  /**
   * Handles child message used by the lobby hosted game service module.
   * @param {Object} child The child value provides an input used by the lobby hosted game service module.
   * @param {Object} client The client value provides an input used by the lobby hosted game service module.
   * @param {Object} message The message value provides an input used by the lobby hosted game service module.
   * @returns {void} Does not return a value.
   */
  function handleChildMessage(child, client, message) {
    consoleLog('Message from child process:', message);
    switch (message?.action) {
    case 'process_error':
      consoleLog('[lobby/child] tcgcore reported process error', {
        pid: child?.pid,
        message
      });
      break;
    case 'process_exit':
      consoleLog('[lobby/child] tcgcore reported exit', {
        pid: child?.pid,
        message
      });
      break;
    case 'quit_notice':
      consoleLog('[lobby/child] tcgcore reported quit notice', {
        pid: child?.pid,
        message
      });
      break;
    case 'lobby':
      updateGamelistFromChild(message);
      broadcast(roomStatePacket());
      break;
    case 'stop':
      delete state.gamelist[message.game.roompass];
      broadcast(roomStatePacket());
      break;
    case 'ready':
      updateGamelistFromChild(message);
      broadcast(roomStatePacket());
      sendPacket(client, {
        clientEvent: 'lobby',
        roompass: message.roompass,
        port: message.port
      });
      break;
    case 'register':
      validateSession(
        {
          session: message.session,
          username: message.username
        },
        (error, valid, person) => {
          child.send({
            action: 'register',
            error,
            person,
            session: message.session,
            valid
          });
        }
      );
      break;
    case 'quit':
      delete state.gamelist[message.game.roompass];
      delete state.gamePorts[message.game.port];
      broadcast(roomStatePacket());
      break;
    case 'win': {
      const winTraceId = `${dateNow()}_${child?.pid || 'unknown'}`;
      const winStartedAt = dateNow();
      consoleLog(
        '[lobby/child] tcgcore reported win, starting post-duel cleanup',
        {
          winTraceId,
          pid: child?.pid,
          message
        }
      );
      logDuel(message, () => {
        consoleLog(
          '[lobby/child] logDuel callback finished, sending shutdown_after_win',
          {
            winTraceId,
            pid: child?.pid,
            elapsedMs: dateNow() - winStartedAt,
            message
          }
        );
        child.send({
          action: 'shutdown_after_win',
          winTraceId,
          childTraceId: message?.traceId
        });
      });
      break;
    }
    case 'match_kill':
      consoleLog('[lobby/child] tcgcore reported match kill', {
        pid: child?.pid,
        message
      });
      if (message?.roompass && state.gamelist[message.roompass]) {
        state.gamelist[message.roompass] = Object.assign(
          {},
          state.gamelist[message.roompass],
          {
            matchKill: {
              card: message.card,
              cardName: message.cardName || '',
              tournamentId: message.tournamentId || '',
              tournamentMatchId: message.tournamentMatchId || '',
              occurredAt: message.occurredAt || ''
            }
          }
        );
        broadcast(roomStatePacket());
      }
      break;
    default:
      break;
    }
  }

  /**
   * Spawns hosted child used by the lobby hosted game service module.
   * @param {Object} inputHostConfig The inputHostConfig value provides an input used by the lobby hosted game service module.
   * @param {Object} callbacks The callbacks object supplies the structured input used by the lobby hosted game service module.
   * @param {Object} callbacks.client The `client` property supplies structured input used by the lobby hosted game service module.
   * @param {Function} callbacks.onError The `onError` property supplies structured input used by the lobby hosted game service module.
   * @param {Function} callbacks.onReady The `onReady` property supplies structured input used by the lobby hosted game service module.
   * @returns {Object} Returns the value produced by the lobby hosted game service module.
   */
  function spawnHostedChild(inputHostConfig, { client, onReady, onError } = {}) {
    const hostConfig = parseHostConfig(inputHostConfig);
    const port = resolveHostedPort(hostConfig.hostPort);
    const childHostConfig = Object.assign({}, hostConfig, {
      hostPort: port
    });
    const execArgv = processEnv.CORE_DEBUG
      ? [`--inspect=${unsafeDebugPort()}`]
      : undefined;
    const child = forkProcess('./core/index.js', processArgv, {
      cwd: pathModule.resolve(gameChildCwd),
      env: Object.assign({}, processEnv, {
        HOST_CONFIG_JSON: JSON.stringify(childHostConfig)
      }),
      execArgv
    });

    child.on('message', (message) => {
      handleChildMessage(child, client, message);
      if (message?.action === 'ready' && typeof onReady === 'function') {
        onReady({
          roompass: message.roompass,
          password: message.password,
          port: message.port,
          game: message.game,
          child
        });
      }
    });
    child.on('error', (error) => {
      consoleLog('[lobby/child] tcgcore child process error', {
        pid: child?.pid,
        port,
        message: error?.message,
        stack: error?.stack
      });
      if (typeof onError === 'function') {
        onError(error);
      }
    });
    child.on('exit', (code, signal) => {
      consoleLog('[lobby/child] tcgcore child process exit', {
        pid: child?.pid,
        port,
        code,
        signal
      });
    });
    child.on('close', (code, signal) => {
      consoleLog('[lobby/child] tcgcore child process close', {
        pid: child?.pid,
        port,
        code,
        signal
      });
    });
    child.on('disconnect', () => {
      consoleLog('[lobby/child] tcgcore child process disconnect', {
        pid: child?.pid,
        port
      });
    });
    state.gamePorts[port] = child;
    return child;
  }

  /**
   * Hosts game used by the lobby hosted game service module.
   * @param {Object} info The info value provides an input used by the lobby hosted game service module.
   * @returns {Promise<{roompass: string, password: string, port: number, game: Object, child: Object}>} Returns the value produced by the lobby hosted game service module.
   */
  function hostGame(info) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeoutFn(() => {
        if (settled) {
          return;
        }
        settled = true;
        reject(new Error('Timed out while waiting for duel room startup.'));
      }, 15000);

      spawnHostedChild(info, {
        onReady(result) {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeoutFn(timeout);
          resolve(result);
        },
        onError(error) {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeoutFn(timeout);
          reject(error);
        }
      });
    });
  }

  return {
    handleChildMessage,
    hostGame,
    spawnHostedChild
  };
  }
}

module.exports = {
  LobbyHostedGameService
};
