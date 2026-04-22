# Agent Guidelines

- Follow the repository root `AGENTS.md` instructions for this directory and its descendants.

## Folder Overview
Email transport services leveraging AWS SES plus mail composition helpers used throughout the backend.

## Implementation Checklist
- [ ] Confirm transactional templates have accompanying plain-text fallbacks to keep emails accessible.
- [ ] When creating or updating templates, re-run the unit tests in `server/services/email/__tests__` to ensure rendering helpers stay deterministic.
- [ ] Validate new message types against SES sandbox restrictions before promoting them to production credentials.

## Test & Verification Checklist
Before wrapping up changes in this scope, complete the following checks:

- [ ] Run `npm run lint -- "server/services/email"`.
- [ ] Run `npm test -- "server/services/email"`.

