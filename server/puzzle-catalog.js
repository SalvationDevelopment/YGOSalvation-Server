'use strict';

const fs = require('fs');
const path = require('path');

const puzzlesDirectory = path.resolve(__dirname, 'game', 'puzzles');

const PROVIDED_PUZZLES = Object.freeze([
  {
    id: 'opening-drill',
    name: 'Opening Drill',
    opponentName: 'Training Bot',
    roomName: 'Puzzle: Opening Drill',
    startingPlayerSlot: 0,
    deck: {
      name: 'Opening Drill Deck',
      main: [46986414, 89631139, 53129443, 74677422, 70781052],
      extra: [],
      side: []
    },
    scriptFilename: 'opening-drill.lua'
  }
]);

function cloneDeck(deck = {}) {
  return {
    ...(deck || {}),
    main: Array.isArray(deck?.main) ? [...deck.main] : [],
    extra: Array.isArray(deck?.extra) ? [...deck.extra] : [],
    side: Array.isArray(deck?.side) ? [...deck.side] : []
  };
}

function readPuzzleMessage(scriptSource) {
  if (typeof scriptSource !== 'string' || !scriptSource.length) {
    return '';
  }

  const match = scriptSource.match(/--\[\[message\s*([\s\S]*?)\]\]/i);
  return match?.[1]?.trim() || '';
}

function resolvePuzzleRecord(definition) {
  const scriptPath = path.resolve(puzzlesDirectory, definition.scriptFilename);
  const scriptSource = fs.readFileSync(scriptPath, 'utf8');

  return Object.freeze({
    ...definition,
    description: readPuzzleMessage(scriptSource),
    scriptPath,
    scriptSource
  });
}

const puzzleRecords = PROVIDED_PUZZLES.map(resolvePuzzleRecord);

function normalizeStartingPlayerSlot(value) {
  return Number(value) === 1 ? 1 : 0;
}

function sanitizePuzzleRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    name: record.name,
    description: record.description,
    opponentName: record.opponentName,
    roomName: record.roomName,
    startingPlayerSlot: normalizeStartingPlayerSlot(record.startingPlayerSlot),
    deck: cloneDeck(record.deck),
    hostConfig: {
      roomName: record.roomName,
      banlist: 'Puzzle',
      bestOf: 1,
      noShuffleDeck: true,
      noCheckDeckContents: true,
      noCheckDeckSize: true,
      puzzleId: record.id,
      relay: false,
      team1Count: 1,
      team2Count: 1,
      timeLimitSeconds: 1800
    }
  };
}

function getPuzzleConfig(puzzleId) {
  const normalizedId =
    typeof puzzleId === 'string'
      ? puzzleId.trim().toLowerCase()
      : '';
  const record = puzzleRecords.find((candidate) => candidate.id === normalizedId);

  if (!record) {
    return null;
  }

  return {
    ...sanitizePuzzleRecord(record),
    scriptPath: record.scriptPath,
    scriptSource: record.scriptSource
  };
}

function listProvidedPuzzles() {
  return puzzleRecords.map(sanitizePuzzleRecord).filter(Boolean);
}

module.exports = {
  cloneDeck,
  getPuzzleConfig,
  listProvidedPuzzles,
  normalizeStartingPlayerSlot
};
