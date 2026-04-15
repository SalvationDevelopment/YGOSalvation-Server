# Puzzle Mode Plan

## Goal

Add an authenticated `/puzzles` flow that lets a user choose a provided puzzle, launches a duel room for that puzzle, skips manual lobby setup, and auto-advances the puzzle until Main Phase 1.

## Findings

- EDOPro puzzle mode is a single-player duel that loads a Lua puzzle script after `constant.lua` and `utility.lua`.
- This repo already has puzzle helpers in `server/game/scripts/utility.lua`, including `Auxiliary.BeginPuzzle()`.
- The current web duel flow already supports opening a hosted room through the lobby websocket and rendering the duel on `/ygopro?room=<port>`.
- The current room core is still multiplayer-oriented, so puzzle rooms need a server-side bootstrap path for a synthetic opponent slot and automatic start.

## Implementation Slices

1. Add a shared puzzle catalog.
   Include public metadata for the `/puzzles` page and runtime metadata for the room core.

2. Extend host config for puzzle rooms.
   Add `puzzleId` and normalized puzzle metadata so a hosted child can resolve the requested puzzle deterministically.

3. Add a puzzle bootstrap path in the duel room core.
   Resolve the puzzle definition, create a synthetic opponent seat, assign the puzzle deck to the human seat, skip manual lobby configuration, and start with the configured starting player.

4. Extend the ocgcore controller for puzzle scripts.
   Allow loading puzzle Lua files and starting the duel from the puzzle script state so the room auto-processes until the first player decision in Main Phase 1.

5. Add the `/puzzles` UI.
   Add a logged-in superheader link, render a list of provided puzzles, and start a hosted puzzle room on selection.

6. Add coverage.
   Add a test that verifies puzzle launch drives itself to Main Phase 1 without requiring manual lobby choices.

## Initial Scope

- Ship one working provided puzzle first.
- Keep the puzzle catalog file-based.
- Optimize for the single-player puzzle flow only; do not generalize into a broader solo-mode system yet.
