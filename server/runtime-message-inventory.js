'use strict';

const { CLIENT_MESSAGE_TYPES } = require('./protocol');

const LEGACY_LOBBY_ACTION_INVENTORY = Object.freeze([
  { action: 'listen', owner: 'lobby', disposition: 'translate', canonicalAction: 'register' },
  { action: 'listen(', owner: 'lobby', disposition: 'translate', canonicalAction: 'register' },
  { action: 'register', owner: 'lobby', disposition: 'keep' },
  { action: 'loadSession', owner: 'lobby', disposition: 'keep' },
  { action: 'duelrequest', owner: 'lobby', disposition: 'keep' },
  { action: 'ai', owner: 'lobby', disposition: 'keep' },
  { action: 'ack', owner: 'lobby', disposition: 'keep' },
  { action: 'proxy_connect', owner: 'lobby', disposition: 'keep' },
  { action: 'proxy_disconnect', owner: 'lobby', disposition: 'keep' },
  { action: 'proxy_message', owner: 'lobby', disposition: 'keep' },
  { action: 'chatline', owner: 'lobby', disposition: 'keep' },
  { action: 'irc_message', owner: 'lobby', disposition: 'keep' },
  { action: 'irc_sync', owner: 'lobby', disposition: 'keep' },
  { action: 'irc_list_rooms', owner: 'lobby', disposition: 'keep' },
  { action: 'irc_join_room', owner: 'lobby', disposition: 'keep' },
  { action: 'irc_create_room', owner: 'lobby', disposition: 'keep' },
  { action: 'irc_disconnect', owner: 'lobby', disposition: 'keep' },
  { action: 'global', owner: 'lobby', disposition: 'keep' },
  { action: 'globalrequest', owner: 'lobby', disposition: 'keep' },
  { action: 'gamelistrequest', owner: 'lobby', disposition: 'keep' },
  { action: 'genocide', owner: 'lobby', disposition: 'keep' },
  { action: 'murder', owner: 'lobby', disposition: 'keep' },
  { action: 'censor', owner: 'lobby', disposition: 'keep' },
  { action: 'revive', owner: 'lobby', disposition: 'keep' },
  { action: 'mindcrush', owner: 'lobby', disposition: 'keep' },
  { action: 'host', owner: 'lobby', disposition: 'keep' },
  { action: 'privateMessage', owner: 'lobby', disposition: 'keep' },
  { action: 'save', owner: 'lobby', disposition: 'keep' },
  { action: 'delete', owner: 'lobby', disposition: 'keep' }
]);

const LEGACY_ROOM_ACTION_INVENTORY = Object.freeze([
  {
    action: 'join',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.JOIN_ROOM
  },
  {
    action: 'leave',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.LEAVE_ROOM
  },
  {
    action: 'chat',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.CHAT
  },
  {
    action: 'lock',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.SUBMIT_DECK
  },
  {
    action: 'start',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.START_DUEL
  },
  {
    action: 'question',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.OCG_RESPONSE
  },
  {
    action: 'choice',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.OCG_RESPONSE
  },
  {
    action: 'ping',
    owner: 'room',
    disposition: 'translate',
    canonicalType: CLIENT_MESSAGE_TYPES.PING
  },
  { action: 'determine', owner: 'room', disposition: 'delete' },
  { action: 'kick', owner: 'room', disposition: 'delete' },
  { action: 'spectate', owner: 'room', disposition: 'delete' },
  { action: 'surrender', owner: 'room', disposition: 'delete' },
  { action: 'side', owner: 'room', disposition: 'delete' },
  { action: 'reconnect', owner: 'room', disposition: 'delete' },
  { action: 'restart', owner: 'room', disposition: 'delete' }
]);

const CANONICAL_ROOM_MESSAGE_INVENTORY = Object.freeze(
  Object.values(CLIENT_MESSAGE_TYPES).map((type) => ({
    type,
    owner: 'room',
    disposition: 'keep'
  }))
);

function findLegacyActionInventoryEntry(action) {
  if (typeof action !== 'string' || !action.length) {
    return undefined;
  }

  return (
    LEGACY_LOBBY_ACTION_INVENTORY.find((entry) => entry.action === action) ||
    LEGACY_ROOM_ACTION_INVENTORY.find((entry) => entry.action === action)
  );
}

function findCanonicalRoomTypeInventoryEntry(type) {
  if (typeof type !== 'string' || !type.length) {
    return undefined;
  }

  return CANONICAL_ROOM_MESSAGE_INVENTORY.find((entry) => entry.type === type);
}

module.exports = {
  CANONICAL_ROOM_MESSAGE_INVENTORY,
  LEGACY_LOBBY_ACTION_INVENTORY,
  LEGACY_ROOM_ACTION_INVENTORY,
  findCanonicalRoomTypeInventoryEntry,
  findLegacyActionInventoryEntry
};
