# Agent Guidelines

- Follow the repository root `AGENTS.md` instructions for this directory and its descendants.

## Folder Overview
Implements the suite of IRC service bots (ChanServ, MemoServ, OperServ, etc.) that power the project's real-time collaboration tools.

## Test & Verification Checklist
Before wrapping up changes in this scope, complete the following checks:

- [ ] Run `npm run lint -- "server/irc/bots"`.
- [ ] Run `npm test -- "server/irc/bots"`.

