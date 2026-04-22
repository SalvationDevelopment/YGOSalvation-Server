# Application File Feature Inventory

## Purpose

This is the maintained high-level map of the application codebase.

It is intentionally not a line-by-line file dump. Use it to answer:

- where a feature family lives
- which files are the main owners
- where current migration work is concentrated

For exact file discovery, use `rg` against the repo.

## Scope

Included:

- [`server/ui`](/c:/work/ygo-core-server/server/ui)
- [`server`](/c:/work/ygo-core-server/server)
- [`cms`](/c:/work/ygo-core-server/cms)

Excluded:

- vendor and embedded engine code
- card script payloads
- database payload files
- generated output and binary assets

## UI Application

### App shell and routing

Main owners:

- [`server/ui/app/layout.js`](/c:/work/ygo-core-server/server/ui/app/layout.js)
  Root layout, global styles, auth wrapper, and top-level route behavior.
- [`server/ui/app/page.jsx`](/c:/work/ygo-core-server/server/ui/app/page.jsx)
  Landing page and login surface entry.
- [`server/ui/app/index.jsx`](/c:/work/ygo-core-server/server/ui/app/index.jsx)
  Home/login runtime wiring, event bus integration, websocket setup, and legacy app boot behavior.
- [`server/ui/app/game/ygopro.js`](/c:/work/ygo-core-server/server/ui/app/game/ygopro.js)
  Duel-client mount entry.
- [`server/ui/app/ygopro/page.jsx`](/c:/work/ygo-core-server/server/ui/app/ygopro/page.jsx)
  Thin route wrapper for the duel client.

Route families:

- public content: `news`, `faqs`, `downloads`, `contact`, `credits`
- account and rankings: `profile`, `rankings`
- tournament flows: `calendar`, `tournaments`, `tournaments/create`, `tournaments/[slug]`, `tournaments/[slug]/edit`
- game flows: `host`, `gamelist`, `deckedit`, `ygopro`

### Screen components

Primary screen owners live in:

- [`server/ui/components/screens`](/c:/work/ygo-core-server/server/ui/components/screens)

Important files:

- [`login.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/login.component.jsx)
  Home and auth UI.
- [`host.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/host.component.jsx)
  Duel host workbench.
- [`gamelist.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/gamelist.component.jsx)
  Public room list and join flow.
- [`deckedit.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/deckedit.component.jsx)
  Deck editor and card search runtime.
- [`tournaments.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/tournaments.component.jsx)
  Tournament hub.
- [`tournament-calendar.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/tournament-calendar.component.jsx)
  Tournament month-view and detail rail.
- [`tournament-detail.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/tournament-detail.component.jsx)
  Tournament detail and entrant actions.
- [`profile.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/profile.component.jsx)
  Account personalization and social graph UI.
- [`news.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/news.component.jsx)
  News listing.
- [`news-article.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/news-article.component.jsx)
  Single article view.

Shared shell components:

- [`superheader.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/superheader.component.jsx)
- [`superfooter.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/superfooter.component.jsx)
- [`screen.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/screen.jsx)
  Legacy passthrough wrapper

### Common components

Primary owners:

- [`server/ui/components/common/card.component.jsx`](/c:/work/ygo-core-server/server/ui/components/common/card.component.jsx)
- [`server/ui/components/common/faq.component.jsx`](/c:/work/ygo-core-server/server/ui/components/common/faq.component.jsx)
- [`server/ui/components/common/loading.component.jsx`](/c:/work/ygo-core-server/server/ui/components/common/loading.component.jsx)

These are the simplest and most reusable render surfaces in the UI tree.

### Duel runtime

Primary mounted owners:

- [`server/ui/components/duel/runtime.root.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/runtime.root.component.jsx)
- [`server/ui/components/duel/duel.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/duel.component.jsx)
- [`server/ui/components/duel/field.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/field.component.jsx)
- [`server/ui/components/duel/lobby.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/lobby.component.jsx)

Major supporting surfaces:

- controls and command flows:
  [`controls.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/controls.component.jsx),
  [`extracontrols.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/extracontrols.component.jsx),
  [`choice.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/choice.component.jsx),
  [`chain.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/chain.component.jsx)
- informational overlays:
  [`cardinfo.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/cardinfo.component.jsx),
  [`lifepoint.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/lifepoint.component.jsx),
  [`phases.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/phases.component.jsx),
  [`anouncement.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/anouncement.component.jsx)
- selection and dialog surfaces:
  [`reveal.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/reveal.component.jsx),
  [`view_decks.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/view_decks.component.jsx),
  [`announce.card.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/announce.card.component.jsx),
  [`attribute.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/attribute.component.jsx),
  [`position.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/position.component.jsx),
  [`yesno.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/yesno.component.jsx)

### UI services

Eventing and app state:

- [`server/ui/services/listener.service.js`](/c:/work/ygo-core-server/server/ui/services/listener.service.js)
  App-wide `Feed`/event bus.
- [`server/ui/hooks/use-listener.js`](/c:/work/ygo-core-server/server/ui/hooks/use-listener.js)
  React helpers for the bus.
- [`server/ui/hooks/use-auth-state.js`](/c:/work/ygo-core-server/server/ui/hooks/use-auth-state.js)
  Shared auth state.

Duel runtime stack:

- [`server/ui/services/game.service.js`](/c:/work/ygo-core-server/server/ui/services/game.service.js)
  Thin duel-service coordinator and legacy bridge.
- [`server/ui/services/game-setup.service.js`](/c:/work/ygo-core-server/server/ui/services/game-setup.service.js)
  Duel setup, mounting, sockets, listeners, teardown.
- [`server/ui/services/game-passive-state.service.js`](/c:/work/ygo-core-server/server/ui/services/game-passive-state.service.js)
  Passive state application, field side effects, announcements, orientation.
- [`server/ui/services/game-dialog.service.js`](/c:/work/ygo-core-server/server/ui/services/game-dialog.service.js)
  Question state, reveal flows, answer serialization.
- [`server/ui/services/manual.js`](/c:/work/ygo-core-server/server/ui/services/manual.js)
  Manual duel actions and imperative duel tooling.

Other feature services:

- [`boot.service.js`](/c:/work/ygo-core-server/server/ui/services/boot.service.js)
- [`connection.service.js`](/c:/work/ygo-core-server/server/ui/services/connection.service.js)
- [`cardsearch.service.js`](/c:/work/ygo-core-server/server/ui/services/cardsearch.service.js)
- [`storage.service.js`](/c:/work/ygo-core-server/server/ui/services/storage.service.js)
- [`modal.js`](/c:/work/ygo-core-server/server/ui/services/modal.js)

### UI styling

Root/global styles:

- [`server/ui/styles/normalize.scss`](/c:/work/ygo-core-server/server/ui/styles/normalize.scss)
- [`server/ui/styles/main.scss`](/c:/work/ygo-core-server/server/ui/styles/main.scss)
- [`server/ui/styles/animation.scss`](/c:/work/ygo-core-server/server/ui/styles/animation.scss)

Remaining route-owned feature styles:

- [`server/ui/styles/landing.scss`](/c:/work/ygo-core-server/server/ui/styles/landing.scss)
- [`server/ui/styles/deckeditor.scss`](/c:/work/ygo-core-server/server/ui/styles/deckeditor.scss)
- [`server/ui/styles/tournament.scss`](/c:/work/ygo-core-server/server/ui/styles/tournament.scss)

Component-owned styling is now the default for mounted components under [`server/ui/components`](/c:/work/ygo-core-server/server/ui/components).

### Component lab

Primary owners:

- [`server/ui/app/playwright/components`](/c:/work/ygo-core-server/server/ui/app/playwright/components)
- [`server/ui/component-lab`](/c:/work/ygo-core-server/server/ui/component-lab)

Important files:

- [`registry.js`](/c:/work/ygo-core-server/server/ui/component-lab/registry.js)
  Entry definitions, presets, controls, docs associations.
- [`component-lab-preview.jsx`](/c:/work/ygo-core-server/server/ui/component-lab/component-lab-preview.jsx)
  Preview runtime and controls UI.
- [`component-lab-shell.jsx`](/c:/work/ygo-core-server/server/ui/component-lab/component-lab-shell.jsx)
  Shadow-DOM isolation shell.
- [`component-lab-duel-harness.jsx`](/c:/work/ygo-core-server/server/ui/component-lab/component-lab-duel-harness.jsx)
  Field-backed duel harness for duel previews.

## Main Server

### Core runtime

Primary owners:

- [`server/index.js`](/c:/work/ygo-core-server/server/index.js)
  Main server bootstrap.
- [`server/lobby.js`](/c:/work/ygo-core-server/server/lobby.js)
  Legacy lobby runtime, chat, hosted duel startup.
- [`server/rooms.js`](/c:/work/ygo-core-server/server/rooms.js)
  Modern room system.
- [`server/transport.js`](/c:/work/ygo-core-server/server/transport.js)
  TCP and WebSocket transport layer.
- [`server/duel-session.js`](/c:/work/ygo-core-server/server/duel-session.js)
  Duel lifecycle around the loaded engine.

### HTTP and API layer

Primary owners:

- [`server/routes/index.js`](/c:/work/ygo-core-server/server/routes/index.js)
- [`server/routes/endpoint_users.js`](/c:/work/ygo-core-server/server/routes/endpoint_users.js)
- [`server/routes/endpoint_services.js`](/c:/work/ygo-core-server/server/routes/endpoint_services.js)
- [`server/routes/endpoint_decks.js`](/c:/work/ygo-core-server/server/routes/endpoint_decks.js)
- [`server/routes/endpoint_tournaments.js`](/c:/work/ygo-core-server/server/routes/endpoint_tournaments.js)

### Shared infrastructure

- [`server/lib/http.js`](/c:/work/ygo-core-server/server/lib/http.js)
- [`server/lib/load-shared-env.js`](/c:/work/ygo-core-server/server/lib/load-shared-env.js)
- [`server/protocol.js`](/c:/work/ygo-core-server/server/protocol.js)
- [`server/utils.js`](/c:/work/ygo-core-server/server/utils.js)
- [`server/logger.js`](/c:/work/ygo-core-server/server/logger.js)

## CMS

### App shell

Primary owners:

- [`cms/index.js`](/c:/work/ygo-core-server/cms/index.js)
- [`cms/app/layout.js`](/c:/work/ygo-core-server/cms/app/layout.js)
- [`cms/app/dashboard/layout.js`](/c:/work/ygo-core-server/cms/app/dashboard/layout.js)

### Management surfaces

Current dashboard feature families:

- users
- news
- backgrounds
- covers
- decks
- tournaments
- contact

Main dashboard route files live under:

- [`cms/app/dashboard`](/c:/work/ygo-core-server/cms/app/dashboard)

## Current Hotspots

These are the files or areas most likely to matter during active refactors:

- [`server/ui/services/game.service.js`](/c:/work/ygo-core-server/server/ui/services/game.service.js)
- [`server/ui/services/game-setup.service.js`](/c:/work/ygo-core-server/server/ui/services/game-setup.service.js)
- [`server/ui/services/game-passive-state.service.js`](/c:/work/ygo-core-server/server/ui/services/game-passive-state.service.js)
- [`server/ui/services/game-dialog.service.js`](/c:/work/ygo-core-server/server/ui/services/game-dialog.service.js)
- [`server/ui/services/manual.js`](/c:/work/ygo-core-server/server/ui/services/manual.js)
- [`server/ui/components/screens/deckedit.component.jsx`](/c:/work/ygo-core-server/server/ui/components/screens/deckedit.component.jsx)
- [`server/ui/components/duel/field.component.jsx`](/c:/work/ygo-core-server/server/ui/components/duel/field.component.jsx)
- [`server/ui/component-lab/registry.js`](/c:/work/ygo-core-server/server/ui/component-lab/registry.js)
- [`server/ui/component-lab/component-lab-preview.jsx`](/c:/work/ygo-core-server/server/ui/component-lab/component-lab-preview.jsx)

## Related Planning Docs

- [`documentation/component-owned-scss-loading-plan.md`](/c:/work/ygo-core-server/documentation/component-owned-scss-loading-plan.md)
- [`documentation/component-lab-render-contract-plan.md`](/c:/work/ygo-core-server/documentation/component-lab-render-contract-plan.md)
- [`documentation/ui-null-removal-plan.md`](/c:/work/ygo-core-server/documentation/ui-null-removal-plan.md)
- [`documentation/edopro-host-page-parity-plan.md`](/c:/work/ygo-core-server/documentation/edopro-host-page-parity-plan.md)
