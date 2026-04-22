# Agent Guidelines

- Follow the repository root `AGENTS.md` instructions for this directory and its descendants.
- Keep shared IRC connection helpers isolated in `irc.js` so bot clients can import them without duplication.
- Coordinate bot behaviour changes with the guidance in `server/irc/bots/AGENTS.md`.

## Folder Overview
Hosts the IRC bridge used by background workers and admin tooling, including the core connection wrapper and its integration tests.

## Test & Verification Checklist
Before wrapping up changes in this scope, complete the following checks:

- [ ] Run `npm run lint -- "server/irc"`.
- [ ] Run `npm test -- "server/irc"`.

