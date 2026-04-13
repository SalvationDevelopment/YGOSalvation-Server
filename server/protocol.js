'use strict';

const SERVER_MESSAGE_TYPES = Object.freeze({
  WELCOME: 'welcome',
  ROOM_LIST: 'room_list',
  ROOM_JOINED: 'room_joined',
  ROOM_STATE: 'room_state',
  ROOM_EVENT: 'room_event',
  ERROR: 'error',
  OCG_MESSAGE: 'ocg_message',
  OCG_REQUEST_INPUT: 'ocg_request_input',
  OCG_ALL_CARDS: 'ocg_all_cards'
});

const CLIENT_MESSAGE_TYPES = Object.freeze({
  LIST_ROOMS: 'list_rooms',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SUBMIT_DECK: 'submit_deck',
  READY: 'ready',
  START_DUEL: 'start_duel',
  OCG_RESPONSE: 'ocg_response',
  QUERY_ALL_CARDS: 'query_all_cards',
  CHAT: 'chat',
  PING: 'ping'
});

module.exports = {
  SERVER_MESSAGE_TYPES,
  CLIENT_MESSAGE_TYPES
};
