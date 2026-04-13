# Consolidated Plans

This file consolidates the planning material that used to live across the old `documentation` folder.

All file links in this document are repo-relative so the plan stays portable across local clones and repository hosts.

Priority rules applied during the merge:

- codebase friction and remediation plans appear first
- supporting reference and current-state specs stay in the middle
- unimplemented features and delivery tracks are grouped at the bottom and sorted by expected impact

The application feature map now lives separately in [`plans/maps/application-file-feature-inventory.md`](./maps/application-file-feature-inventory.md).

## Code Friction And Stabilization

### Codebase Friction Plan

Source label: `codebase-friction-plan.md`

This file captures the current highest-friction codebase items, then turns each one into a concrete remediation plan.

The intent is not to rewrite the whole repository in one pass. The intent is to reduce the places where the codebase actively fights normal engineering work: understanding runtime ownership, changing behavior safely, and verifying that the system still works afterward.

### Recommended Execution Order

1. Split-brain server architecture (completed, remove step)
2. The lobby god-module (completed, remove step)
3. Runtime behavior leaking out of imports and globals
4. UI state flow built on a singleton event bus
5. Duel UI acting as an imperative framework inside React
6. Oversized screens and services
7. Styling ownership and test/build verification misalignment

That order matters. Several later problems are downstream of the earlier ones.

### 1. Split-Brain Server Architecture

Problem:
References: [`server/index.js`](../server/index.js), [`server/lobby.js`](../server/lobby.js), [`server/rooms.js`](../server/rooms.js), [`server/game/core/index.js`](../server/game/core/index.js)

The main process boots the newer room-based duel stack and the older lobby/action stack together, then routes shared runtime concerns through both worlds. That creates duplicate ownership of transport behavior, duel behavior, and client lifecycle.

Target state:

- one canonical connection pipeline per client
- one canonical owner for duel lifecycle
- one explicit place where legacy protocol compatibility is translated, instead of compatibility logic being spread across multiple runtimes
- server boot that reads as composition of services instead of coexistence of competing architectures

Plan:

1. Write the server architecture contract before moving code.
   Capture which responsibilities belong to:
   - session/auth and social features
   - duel room lifecycle
   - hosted tcgcore child processes
   - compatibility translation for old client actions

2. Inventory the current message surface.
   Build a mapping of every action currently consumed in:
   - [`server/lobby.js`](../server/lobby.js)
   - [`server/rooms.js`](../server/rooms.js)
   

   Mark each action as:
   - keep
   - translate
   - delete

3. Choose the canonical runtime owner.
   The most defensible steady state is:
   - lobby-style concerns own authenticated app features, chat, hosting requests, deck persistence, and app-shell messages
   - room/duel runtime owns duel state progression and duel transport
   - tcgcore child processes are behind an adapter, not exposed as a second public protocol surface

4. Introduce an explicit translation layer.
   Add one adapter module that translates legacy incoming actions into the canonical internal commands and canonical internal events back into legacy-compatible packets where still needed.

5. Stop double-routing live connections.
   Replace the current pattern in [`server/index.js`](../server/index.js) where both lobby and room managers inspect the same connection/message stream. Move to an explicit dispatcher that decides ownership once per packet or once per connection mode.

6. Retire duplicate behavior in stages.
   First move shared behavior into the new canonical owner.
   Then leave the old path only as a translation shim.
   Then remove the old path after tests cover the migrated behavior.

### 2. The Lobby Is A God-Module

Problem:
References: [`server/lobby.js`](../server/lobby.js)

One mutable closure owns auth flow, chat, room membership, deck persistence, websocket proxying, duel child-process orchestration, IRC bridge integration, room-state snapshots, ack cadence, and legacy protocol handling.

Target state:

- `createLobby()` becomes a thin composition root
- mutable state is carried by explicit state objects instead of hidden closure-local bags
- chat, auth, deck actions, proxying, and hosted duel orchestration each live in separate modules with small interfaces
- room-state snapshots and periodic ack/gamelist broadcasts are isolated in a narrow status service

Plan:

1. Split the lobby by responsibility, not by arbitrary file size.
   Extract modules for:
   - client registry and room membership
   - auth/session login and session restore
   - chat and private messaging
   - hosted duel child-process management
   - websocket proxy lifecycle
   - deck persistence actions
   - room-state snapshots and ack cadence
   - legacy action routing

2. Introduce a `LobbyState` shape.
   Instead of many closure locals, define one explicit state object containing:
   - clients
   - room membership indexes
   - chat history
   - gamelist snapshot
   - hosted child registry
   - proxy registry

3. Convert helper functions into dependency-injected services.
   Each extracted module should receive:
   - state
   - logger
   - external dependencies such as route handlers or bridge implementations

4. Keep `createLobby()` as the public facade during migration.
   It should continue returning:
   - `start`
   - `handleConnection`
   - `handleMessage`
   - `removeClient`
   - `getSnapshot`
   - `hostGame`

   but internally delegate to the extracted services.

5. Move the action switch into a router table.
   Replace the giant `switch` with a handler map so that adding or removing an action means changing a local module, not editing a monolith.

6. Add tests as each slice moves.
   Do not wait until the end. Each extraction should leave behind focused tests for its own behavior.

### 3. UI State Flow Depends On A Singleton Event Bus Plus Module-Scope Runtime Flags

Problem:
References: [`server/ui/app/index.jsx`](../server/ui/app/index.jsx), [`server/ui/app/layout.js`](../server/ui/app/layout.js), [`server/ui/services/listener.service.js`](../server/ui/services/listener.service.js)

Auth, websocket, modal, tooltip, deck, and page-shell behavior are order-dependent and non-local, so understanding one feature means loading a large portion of the app in your head.

Target state:

- page shell, auth, websocket connection, modal, and chat are owned by React providers or explicit hooks
- the event bus remains only where a compatibility boundary still requires it
- module-scope flags are reduced to narrow platform boot guards or removed entirely

Plan:

1. Define which domains should stop using the bus first.
   Start with:
   - auth/session
   - modal/alert
   - websocket connection status
   - chat state

   These are broad app concerns and already behave like providers.

2. Create explicit provider boundaries.
   Add:
   - `ConnectionProvider`
   - `ModalProvider`
   - `AppRuntimeProvider` or equivalent

   Keep them in the app shell so routes read stable context instead of subscribing through the bus.

3. Move module-scope runtime flags into provider-owned refs or state.
   Candidates are the flags in [`server/ui/app/index.jsx`](../server/ui/app/index.jsx) that currently survive outside component ownership.

4. Restrict the event bus to legacy adapters.
   The listener bus should become a narrow compatibility mechanism between old duel/runtime subsystems and newer React-owned UI, not the default state system for every feature.

5. Migrate by domain, not by file.
   For each domain:
   - create the provider/hook
   - update current consumers
   - stop emitting or subscribing to the old bus action
   - delete the old bus path

6. Keep the lints pushing in the same direction.
   Extend current guardrails where useful so new module-scope state and generic event-bus state are not reintroduced casually.

Verification:

- app shell logic is understandable from provider tree ownership in [`server/ui/app/layout.js`](../server/ui/app/layout.js)
- common features can be tested by rendering providers instead of simulating global event ordering
- listener bus traffic drops materially outside legacy duel/runtime boundaries

### 4. The Duel UI Is Effectively A Second Imperative Framework Embedded Inside React

Problem:
References: [`server/ui/services/game-setup.service.js`](../server/ui/services/game-setup.service.js), [`server/ui/components/duel/duel.component.jsx`](../server/ui/components/duel/duel.component.jsx), [`server/ui/components/duel/field.component.jsx`](../server/ui/components/duel/field.component.jsx)

It owns controllers, runtime roots, DOM geometry queries, and render-time orchestration outside normal React ownership, which splits the source of truth.

Target state:

- one explicit duel runtime adapter owns imperative engine integration
- React components render serializable duel state and dispatch commands
- DOM measurement and animation logic are isolated behind narrow hooks or view adapters

Plan:

1. Do not try to rewrite the duel UI into idiomatic React in one jump.
   First isolate the imperative core. That is the safer move.

2. Define the duel runtime boundary.
   Create one adapter responsible for:
   - socket connection to duel transport
   - controller lifecycle
   - state snapshots
   - command dispatch
   - cleanup

   Everything outside that adapter should read state and send commands.

3. Replace controller mutation leaks with explicit commands.
   Instead of deep components reaching into mutable controller objects, move toward calls like:
   - `sendResponse`
   - `selectCard`
   - `setChainMode`
   - `openViewer`

4. Convert derived UI surfaces first.
   The best first migration targets are pieces that mostly render existing state:
   - prompts
   - side viewers
   - chain indicators
   - passive overlays

   Leave the most geometry-heavy field logic for later.

5. Isolate DOM measurement.
   Move field geometry, animation anchors, and layout reads into dedicated hooks or utilities so those concerns stop contaminating unrelated rendering logic.

6. Add runtime harness tests around the adapter.
   The adapter should be testable with mocked duel packets, which is a more stable verification layer than trying to inspect every imperative mutation path inside components.

Current progress:

- the duel transport, controller lifecycle, dialog/passive commands, and cleanup paths now route through an explicit runtime adapter
- field viewport reads, reveal/attack layout math, and the remaining hand/shuffle DOM helpers now live in dedicated services instead of React component modules
- `DuelScreenState(...)` is now a thin wrapper over a dedicated controller service, so listener registration, update/idle routing, and teardown no longer live in the JSX module
- `FieldState(...)` now delegates replace/update/hydrate, pile snapshot merge, metadata merge, and fade bookkeeping through a dedicated field-state service instead of keeping that sync path inline in the JSX module
- the next section 4 slice is the remaining selection, pulse/overlay, and disabled-zone mutation logic still embedded in `FieldState(...)`

Verification:

- React render tree consumes duel state snapshots rather than hidden mutable controllers
- imperative logic is concentrated in one runtime adapter instead of spread across services and components
- component tests for duel sub-surfaces no longer require reconstructing the full imperative stack

### 5. Runtime Behavior Leaks Out Of Module Imports And Process Globals

Problem:
References: [`server/api/routes/endpoint_services.js`](../server/api/routes/endpoint_services.js), [`server/api/routes/endpoint_tournaments.js`](../server/api/routes/endpoint_tournaments.js), [`tests/unit/server/endpoint-services.test.js`](../tests/unit/server/endpoint-services.test.js), [`tests/unit/server/endpoint-tournaments.test.js`](../tests/unit/server/endpoint-tournaments.test.js)

Route modules perform startup work and rely on ambient env, timers, and globals, so tests have to reconstruct side effects just to load the code.

Target state:

- route modules are pure registration modules
- service modules are factories with explicit dependencies
- startup timers and admin-session acquisition live in top-level boot code, not in imported endpoint files
- process globals are replaced by passed dependencies where possible

Plan:

1. Move startup side effects out of endpoint modules.
   `setSession()` and recurring timers in [`server/api/routes/endpoint_services.js`](../server/api/routes/endpoint_services.js) should be started by the application bootstrap, not by module import.

2. Turn endpoint modules into factories.
   Prefer shapes like:
   - `createServicesEndpoints(deps)`
   - `createTournamentEndpoints(deps)`
   - `setupEndpoints(router, deps)`

   where `deps` includes request helpers, loggers, background jobs, and host allocators.

3. Replace `globalThis` integration points with explicit injection.
   Current globals such as hosted game allocators should be passed through the app composition root.

4. Separate read-only clients from stateful background services.
   A route that proxies CMS data should not also own admin-session refresh logic in the same module.

5. Rewrite tests around explicit dependencies.
   Once factories exist, the tests should pass fake dependencies directly instead of patching module cache, process globals, and timers.

Verification:

- importing an endpoint module has no network, timer, or auth side effects
- unit tests instantiate endpoints with fake dependencies directly
- application bootstrap explicitly shows which long-lived background services are started

### 6. Large Screens And Services Still Carry Too Many Responsibilities At Once

Problem:
References: [`server/ui/components/screens/deckedit.component.jsx`](../server/ui/components/screens/deckedit.component.jsx), [`server/ui/components/screens/host.component.jsx`](../server/ui/components/screens/host.component.jsx), [`server/ui/services/manual.js`](../server/ui/services/manual.js), [`server/ui/services/useTranslation.js`](../server/ui/services/useTranslation.js)

Data loading, persistence, subscriptions, prompts, filtering, translation data, and rendering are still packed together in oversized files.

Target state:

- large screens act as composition layers, not implementation dumps
- data loading, mutations, filtering, and view logic are split into named hooks or helpers
- static datasets live outside runtime-heavy files

Plan:

1. Set explicit extraction targets.
   Start with:
   - deck editor
   - host screen
   - manual service
   - translation data

   Those files are large enough and central enough to punish normal change work.

2. Split by role, not by arbitrary chunking.
   For each oversized file, separate:
   - static configuration/data
   - query/mutation logic
   - subscriptions/event wiring
   - reducers/state transforms
   - presentational components

3. Move translation data out of executable logic.
   [`server/ui/services/useTranslation.js`](../server/ui/services/useTranslation.js) should not be a giant embedded database plus behavior in one file. Extract translation data into structured assets or grouped modules and keep runtime code thin.

4. Extract hooks for feature state.
   Examples:
   - `useDeckEditorFilters`
   - `useHostConfiguration`
   - `useDeckPersistence`
   - `useManualModeState`

5. Add component- or hook-level tests before and during extraction.
   The point is not just smaller files. The point is being able to verify each behavior slice independently after the split.

Verification:

- no central screen file continues to own fetching, mutation, subscriptions, and rendering all at once
- static data moves out of runtime-heavy modules
- extracted hooks/helpers gain direct tests

### 7. Styling Ownership And Test/Build Verification Are Still Misaligned

Problem:
References: [`server/ui/app/layout.js`](../server/ui/app/layout.js), [`server/ui/styles/main.scss`](../server/ui/styles/main.scss), [`plans/component-owned-scss-loading-plan.md`](./component-owned-scss-loading-plan.md), [`tools/build-test-bundle.js`](../tools/build-test-bundle.js), [`tests/boot/cms.test.js`](../tests/boot/cms.test.js)

The UI still depends on broad global SCSS while the component-test bundler cannot load SCSS at all, and the boot suite has paths that fall back around startup contention instead of proving deterministic startup.

Target state:

- global styles are limited to true resets, variables, and intentionally global primitives
- mounted components own their styling explicitly
- component-test bundling understands SCSS or stubs it consistently
- boot tests prove deterministic startup instead of working around contention

Plan:

1. Continue the component-owned SCSS migration already documented in [`plans/component-owned-scss-loading-plan.md`](./component-owned-scss-loading-plan.md).
   Finish extracting selectors from:
   - [`server/ui/styles/main.scss`](../server/ui/styles/main.scss)
   - remaining feature-wide route stylesheets

2. Narrow root layout imports.
   [`server/ui/app/layout.js`](../server/ui/app/layout.js) should eventually import only:
   - true global reset/normalize
   - tokens and font declarations
   - intentionally global app-shell primitives

3. Fix the component test bundler.
   [`tools/build-test-bundle.js`](../tools/build-test-bundle.js) needs either:
   - a `.scss` loader path with stable test behavior, or
   - a deterministic SCSS module stub strategy

   Right now the current setup blocks meaningful component verification.

4. Make boot tests deterministic.
   The CMS boot test in [`tests/boot/cms.test.js`](../tests/boot/cms.test.js) currently tolerates fallback behavior around startup contention. Replace fallback-style success criteria with explicit, isolated startup ownership per test run.

5. Align the docs with CI reality.
   When a test layer cannot actually verify the current architecture, call that out and fix the harness rather than treating the failure as background noise.

Verification:

- component test build can process or consistently stub SCSS
- global stylesheet surface shrinks materially
- boot tests pass without fallback logic masking startup conflicts

### Cross-Cutting Rules While Executing This Plan

1. Do not try to solve all seven items in one branch.
   Each item should become its own focused implementation sequence.

2. Preserve behavior first, then simplify.
   Add tests or harness coverage before deleting compatibility paths.

3. Prefer new seams over big rewrites.
   The immediate win is explicit boundaries, factories, adapters, and providers.

4. When a legacy path remains, isolate it and label it.
   Hidden half-migrations are one of the reasons this codebase feels harder than it should.

### Testing Strategy And Implementation Plan

Source label: `testing-strategy-implementation-plan.md`

### Purpose

Define the live testing strategy for this repo without restating every historical finding.

The main quality goals remain:

- `cms`, `server`, and `ocgcore` boot deterministically
- first-party server and UI logic has direct test coverage
- UI components are previewable and smoke-testable in isolation
- `/ygopro` is validated through browser-level functional tests
- ranked and tournament reporting paths are verified end to end
- duel behavior is checked against EDOPro expectations at the protocol and runtime level

### Current Baseline

#### Existing smoke coverage

Already present:

- auth flow smoke coverage
- duel start flow smoke coverage
- ocgcore boot smoke coverage
- per-component UI smoke test files under [`tests/component/ui`](../tests/component/ui)

#### Current strengths

- repo already has basic boot and auth smoke coverage
- component smoke coverage exists for the UI tree
- the duel runtime is split enough to test setup, passive state, and dialog behavior in smaller slices
- the component lab gives a useful manual inspection surface for many UI components

#### Current gaps

- coverage is still uneven for deeper service logic
- many component tests are smoke-level only, not behavioral
- `/ygopro` functional coverage is still the highest-risk area
- tournament-result callback coverage after duel completion still needs stronger end-to-end verification

### Active Test Layers

#### Boot tests

Goal:

- verify `cms`, `server`, and `ocgcore` boot reliably

#### Unit tests

Goal:

- cover exported first-party helpers and service logic

Priority areas:

- `server/ui/services`
- `server/routes`
- shared server utilities
- tournament helpers

#### Component tests

Goal:

- ensure components render in isolation with stable mock data
- expand beyond smoke coverage for important flows

Priority areas:

- shared/common components
- host, gamelist, and deckedit screens
- duel dialogs and selection surfaces

#### Functional browser tests

Goal:

- validate `/ygopro` with real browser interaction and websocket/runtime behavior

Priority scenarios:

- summon flows
- attack flows
- surrender flow
- shuffle/reveal/manual actions
- duel completion and reporting

#### Parity tests

Goal:

- validate message-handling and response behavior against the same duel families EDOPro relies on

Priority message families:

- battle command selection
- idle command selection
- shuffle hand
- summon and special summon
- attack
- response submission

### Recommended Stack

- `node:test`
- `node:assert/strict`
- repo-local esbuild bundling for JSX-heavy tests
- `jsdom` for DOM-backed unit/component tests
- Playwright for browser functional coverage
- lightweight repo-local mocks and fixtures instead of broad new dependencies

### Current Priorities

1. Strengthen behavioral tests for the split duel services.
2. Expand component tests from smoke-only to contract-focused tests for important screens and duel dialogs.
3. Build out Playwright coverage for `/ygopro` runtime behaviors, not just page boot.
4. Verify ranked and tournament reporting after duel completion.
5. Keep parity testing focused on protocol behavior rather than DOM snapshots alone.

### Acceptance Criteria

- all three major apps boot under automated tests
- first-party service helpers have direct unit coverage in the risky paths
- important UI components have meaningful component tests, not only export smoke tests
- `/ygopro` has browser-level coverage for the main duel interaction flows
- ranked and tournament result reporting are verified end to end

### Test Coverage Report

Source label: `test-coverage-report.md`

### Snapshot

This report is a dated snapshot of the repository test surface as last re-verified on `2026-03-27` after the latest server-route and `/ygopro` parity coverage pass.

Coverage in this document is split into two categories:

- measured native coverage from `node --experimental-test-coverage`
- verified non-instrumented coverage from smoke and Playwright suites

### Measured Coverage

The following suites were run with Node's native coverage runner:

- `test:coverage:boot`
- `test:coverage:unit`
- `test:coverage:integration`
- `test:coverage:component`
- `test:coverage:parity`

#### Suite Summary

| Suite | Tests | Pass | Line % | Branch % | Func % | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| boot | 3 | 3 | 87.39 | 61.21 | 47.24 | Includes `cms`, `server`, and `cores` boot smoke |
| unit | 57 | 57 | 90.64 | 70.43 | 88.67 | Includes broader `server/api/routes/*` coverage plus CMS helpers |
| integration | 9 | 9 | 85.77 | 81.97 | 82.56 | CMS HTTP coverage plus spawn and lock-recovery harness branches |
| component | 17 | 17 | 84.92 | 78.00 | 68.07 | Bundled `jsdom` component coverage for CMS screens |
| parity | 8 | 8 | 43.70 | 70.70 | 30.50 | EDOPro contract slice plus source `startGame()` startup flow |

#### Covered Areas

##### Boot

- `cms/index.js`
- `server/index.js`
- `server/ocgcore/dist/index.js`
- repo-local `tests/fixtures/ocgcore/index.js`

##### Unit

- `cms/lib/logger.js`
- `cms/lib/news.js`
- `cms/lib/serializers.js`
- `cms/lib/tournament-coordinator.js`
- `cms/lib/validation.js`
- `server/lib/http.js`
- `server/api/routes/endpoint_decks.js`
- `server/api/routes/endpoint_services.js`
- `server/api/routes/endpoint_tournaments.js`
- `server/api/routes/endpoint_users.js`

##### Integration

- `cms` public rankings endpoint
- `cms` authenticated CRUD for backgrounds
- `cms` authenticated CRUD for news
- `tests/integration/cms/test-utils.js` request, auth, healthy-server reuse, spawn-success, and lock-recovery branches

##### Component

- login and recovery screens
- reset password form
- logout button
- management page shell
- pagination controls
- backgrounds management page
- contact messages management page
- covers management page
- decks management page
- news management page
- tournaments management page
- users management page

##### Parity

- duel message naming
- command answer mapping
- zone selection payload mapping
- attack and shuffle announcement mapping
- additional command-family fallbacks and announcement variants
- source `startGame()` boot path
- websocket proxy registration and join flow
- lobby lock and determine flow
- turn-order choice rendering and `start` action dispatch

### Verified But Not Included In Native Line Coverage

These suites passed, but they are not included in the percentages above:

| Suite | Status | Coverage Type |
| --- | --- | --- |
| `test:smoke` | passing | legacy compatibility smoke for auth and duel startup |
| `test:functional` | passing | Playwright browser coverage for CMS smoke and `/ygopro` shell |

#### Current Playwright Surface

- CMS smoke navigation
- `/ygopro` missing-room handling
- `/ygopro` shell bootstrap with mocked websocket setup
- `/ygopro` deterministic lobby, lock, and turn-order flow with mocked websocket packets

### Gaps

The current measured coverage is useful, but it is not yet close to the acceptance criteria in the test plan.

#### Highest-Value Gaps

- `server/api/routes/index.js` and `server/api/routes/endpoint_forum.js` still lack direct unit coverage
- existing `endpoint_tournaments.js` and `endpoint_users.js` still have many untested branches
- `server/ui/util/*` still lacks direct unit coverage
- `server/ui/services/manual.js` is only covered indirectly
- `cms` CRUD integration does not yet cover all admin-managed models
- `/ygopro` deterministic Burning Abyss functional flows are not implemented
- tournament duel-complete reporting is not covered end to end
- parity coverage is still startup-heavy rather than transcript-driven EDOPro behavior

#### Notable Low-Coverage Files

These files are already in scope but still under-covered:

- `cms/lib/tournament-coordinator.js`: `94.10` line coverage
- `server/api/routes/endpoint_services.js`: `89.76` line coverage
- `server/api/routes/endpoint_tournaments.js`: `72.77` line coverage
- `server/api/routes/endpoint_users.js`: `69.32` line coverage
- `server/api/routes/endpoint_decks.js`: `75.39` line coverage
- parity bundle output: `43.70` line coverage because most duel runtime paths are still untouched

### Run Notes

- `npm.cmd run test:coverage` passed on `2026-03-27`
- `npm.cmd run test:functional` passed on `2026-03-27`
- the parity build still emits an `esbuild` warning for a duplicate `manualToExtra` class member in `server/ui/services/manual.js`
- the parity `startGame()` test emits React `act(...)` warnings because the source client performs root updates outside a test harness
- smoke and Playwright suites remain separate from the native coverage percentages

### Latest Coverage Gains

This pass increased coverage breadth in the following ways:

- unit tests increased from `44` to `57`
- parity tests increased from `7` to `8`
- parity coverage increased from `32.42%` to `43.70%` line coverage and from `7.94%` to `30.50%` function coverage
- `server/api/routes/endpoint_services.js` now has direct unit coverage at `89.76%` line coverage
- `server/api/routes/endpoint_tournaments.js` now has direct unit coverage at `72.77%` line coverage
- `server/api/routes/endpoint_users.js` now has direct unit coverage at `69.32%` line coverage
- the aggregate unit percentage moved from `95.28%` to `90.64%` because previously unmeasured route modules are now included in the denominator

The added tests covered:

- `logDuel()` non-ranked, ranked success, and ranked failure flows
- `/api/news`, `/api/news/:slug`, `/backgrounds`, `/covers`, `/api/contact`, `/ranking`, and `/uploads/*path` in `endpoint_services.js`
- the upload proxy bug in `endpoint_services.js`, which now uses the imported HTTP client correctly
- tournament route room-assignment and action failure flows
- user route session, register, profile, and friendship flows
- source `/ygopro` startup through `startGame()`
- websocket `proxy_connect`, `register`, `join`, `lock`, `determine`, and `start` packet flow in the source duel client
- turn-player choice rendering and click handling in the parity suite
- deterministic `/ygopro` browser lobby and turn-order flow in Playwright

### Commands

Use the following command to regenerate the measured report in the terminal:

```powershell
npm.cmd run test:coverage
```

VS Code task:

- `test:coverage`

### Interpretation

The repository now has broad test entry points and meaningful CMS coverage, but the overall quality bar is still dominated by the duel stack.

The strongest current areas are:

- CMS component coverage
- CMS helper unit coverage
- direct coverage for the main server route modules
- boot coverage for all three applications

The weakest current areas are:

- EDOPro parity depth beyond startup and helper contracts
- deterministic `/ygopro` gameplay coverage
- tournament completion reporting
- `server/ui/util/*` and `server/ui/services/manual.js`

### SCSS Selector Ownership Audit

Source label: `scss-selector-ownership-audit.md`

### Purpose

This is the current ownership map for the live SCSS layer. It is intentionally concise and should describe the repo as it exists now, not every migration step that got it here.

### Root Imports

[`server/ui/app/layout.js`](../server/ui/app/layout.js) currently imports:

- [`server/ui/app/globals.css`](../server/ui/app/globals.css)
- [`server/ui/styles/normalize.scss`](../server/ui/styles/normalize.scss)
- [`server/ui/styles/main.scss`](../server/ui/styles/main.scss)
- [`server/ui/styles/animation.scss`](../server/ui/styles/animation.scss)
- global font files

Those are the remaining broad-entry stylesheets.

### Route-Owned Feature Styles

These stylesheets are still loaded from route boundaries because they remain the owner of live feature selectors:

- [`server/ui/styles/landing.scss`](../server/ui/styles/landing.scss)
  imported by [`server/ui/app/page.jsx`](../server/ui/app/page.jsx)
- [`server/ui/styles/deckeditor.scss`](../server/ui/styles/deckeditor.scss)
  imported by [`server/ui/app/deckedit/layout.jsx`](../server/ui/app/deckedit/layout.jsx)
- [`server/ui/styles/tournament.scss`](../server/ui/styles/tournament.scss)
  imported by [`server/ui/app/tournaments/create/layout.jsx`](../server/ui/app/tournaments/create/layout.jsx) and [`server/ui/app/tournaments/[slug]/edit/layout.jsx`](../server/ui/app/tournaments/[slug]/edit/layout.jsx)

### Component-Owned Coverage

Current baseline for [`server/ui/components`](../server/ui/components):

- `51` files checked
- `49` files import an adjacent unique `*.module.scss`
- `49` files currently satisfy the ownership rule
- `0` mounted app components are still missing adjacent ownership

Explicit exceptions:

- [`server/ui/components/screens/screen.jsx`](../server/ui/components/screens/screen.jsx)
- [`server/ui/components/duel/randomization_test.jsx`](../server/ui/components/duel/randomization_test.jsx)

Area breakdown:

- `screens`: `17 / 18` compliant, plus the passthrough wrapper exception
- `common`: `3 / 3` compliant
- `duel`: `29 / 30` compliant, plus the experimental script exception

### Remaining Global Owners

#### [`server/ui/styles/main.scss`](../server/ui/styles/main.scss)

Current role:

- true globals and theme primitives
- shared shell styling that has not yet been retired or moved
- remaining duel-runtime structure and monochrome overrides

Risk:

- still broad
- still mixes true globals with runtime-specific ownership

#### [`server/ui/styles/animation.scss`](../server/ui/styles/animation.scss)

Current role:

- duel field geometry
- animation and overlay placement
- selector and card positioning rules that are not yet practical to split further

Risk:

- still acts as a shared duel runtime dependency

#### [`server/ui/styles/deckeditor.scss`](../server/ui/styles/deckeditor.scss)

Current role:

- deeper deck-editor grid, card-info internals, deck zones, and link-marker geometry

Risk:

- outer shells already moved to the component module
- deeper internals still need extraction

#### [`server/ui/styles/tournament.scss`](../server/ui/styles/tournament.scss)

Current role:

- create and edit route shells and shared form surfaces

Risk:

- still route-owned rather than component-owned

### Retired Feature Styles

These old route or feature stylesheets are no longer active owners:

- `host.scss`
- `gamelist.scss`
- `faqs.scss`
- `credits.scss`
- `account.scss`
- `news.scss`
- `rankings.scss`

### Audit Conclusion
The remaining work is deeper extraction:

- reduce [`server/ui/styles/main.scss`](../server/ui/styles/main.scss) to true globals plus clearly justified runtime ownership
- keep shrinking [`server/ui/styles/deckeditor.scss`](../server/ui/styles/deckeditor.scss)
- move more bounded duel selectors behind adjacent modules where practical
- resolve the two explicit exceptions

### Component-Owned SCSS Loading Plan

Source label: `component-owned-scss-loading-plan.md`

### Purpose

Move UI styling from broad global and route-wide entrypoints toward explicit ownership:

- each mounted component should import its own adjacent SCSS module
- the top-most rendered element should carry the owner class
- route styles should load only from the route that needs them
- root-level styles should be limited to true globals
- the Playwright component lab must stay isolated from application styling

This is a loading-boundary and ownership cleanup, not a redesign.

### Current State

#### Component ownership

- `49 / 51` files under [`server/ui/components`](../server/ui/components) import an adjacent unique `*.module.scss`
- `49 / 51` files currently meet the ownership rule end-to-end
- all mounted screen, common, and duel components now have explicit adjacent style ownership

Explicit exceptions:

- [`server/ui/components/screens/screen.jsx`](../server/ui/components/screens/screen.jsx)
  structural passthrough wrapper with no bounded DOM shell
- [`server/ui/components/duel/randomization_test.jsx`](../server/ui/components/duel/randomization_test.jsx)
  experimental script, not an active mounted component boundary

#### Global and route-owned styles

Root layout still imports:

- [`server/ui/styles/normalize.scss`](../server/ui/styles/normalize.scss)
- [`server/ui/styles/main.scss`](../server/ui/styles/main.scss)
- [`server/ui/styles/animation.scss`](../server/ui/styles/animation.scss)
- global font files

Remaining route-owned feature imports:

- [`server/ui/app/page.jsx`](../server/ui/app/page.jsx) -> [`server/ui/styles/landing.scss`](../server/ui/styles/landing.scss)
- [`server/ui/app/deckedit/layout.jsx`](../server/ui/app/deckedit/layout.jsx) -> [`server/ui/styles/deckeditor.scss`](../server/ui/styles/deckeditor.scss)
- [`server/ui/app/tournaments/create/layout.jsx`](../server/ui/app/tournaments/create/layout.jsx) -> [`server/ui/styles/tournament.scss`](../server/ui/styles/tournament.scss)
- [`server/ui/app/tournaments/[slug]/edit/layout.jsx`](../server/ui/app/tournaments/[slug]/edit/layout.jsx) -> [`server/ui/styles/tournament.scss`](../server/ui/styles/tournament.scss)

#### Deeper extraction status

Fully retired route stylesheets:

- `host.scss`
- `gamelist.scss`
- `faqs.scss`
- `credits.scss`
- `account.scss`
- `news.scss`
- `rankings.scss`

Still active because they own deeper feature selectors:

- [`server/ui/styles/main.scss`](../server/ui/styles/main.scss)
- [`server/ui/styles/animation.scss`](../server/ui/styles/animation.scss)
- [`server/ui/styles/deckeditor.scss`](../server/ui/styles/deckeditor.scss)
- [`server/ui/styles/tournament.scss`](../server/ui/styles/tournament.scss)

#### Component lab constraint

The component lab at `/playwright/components` is intentionally isolated from application chrome and global CSS. Runtime styles may be mirrored into preview sandboxes, but the lab shell itself must remain scoped and independently scrollable.

### Remaining Work

#### 1. Finish deep selector extraction

Primary targets:

- [`server/ui/styles/deckeditor.scss`](../server/ui/styles/deckeditor.scss)
  Remaining owner of deck-grid, card-info internals, deck zones, and link-marker geometry.
- [`server/ui/styles/tournament.scss`](../server/ui/styles/tournament.scss)
  Remaining owner of create and edit route surfaces.
- [`server/ui/styles/main.scss`](../server/ui/styles/main.scss)
  Still owns shared shell primitives plus a large amount of duel-runtime structure and cross-file theming.
- [`server/ui/styles/animation.scss`](../server/ui/styles/animation.scss)
  Still owns duel placement and animation geometry that has not been split into bounded runtime surfaces.

#### 2. Reduce root-level feature loading

Target end state:

- root layout imports only reset, tokens, fonts, and true app-shell primitives
- feature styling loads from the route or component that renders it
- conditionally mounted overlays and dialogs load through their mounted boundary

#### 3. Make owner modules real owners, not just hooks

Many duel modules currently establish the root ownership boundary while inner selectors still live in `main.scss` or `animation.scss`. The next pass should move those inner selectors behind the component-owned root where practical.

#### 4. Resolve the two explicit exceptions

Decide whether:

- [`server/ui/components/screens/screen.jsx`](../server/ui/components/screens/screen.jsx) stays a deliberate wrapper exception
- [`server/ui/components/duel/randomization_test.jsx`](../server/ui/components/duel/randomization_test.jsx) leaves the mounted component tree entirely

### Rules

- every selector must have one obvious owner
- every mounted component that owns styles should import its own adjacent module
- the owner class belongs on the top-most rendered element
- component selectors should hang from that owner class instead of unrelated global ancestors
- root layout must not become a feature-style dumping ground again
- route-level imports are acceptable only when the route is the true owner
- the Playwright lab must not inherit the main app shell styling

### Next Steps

1. Continue shrinking [`server/ui/styles/deckeditor.scss`](../server/ui/styles/deckeditor.scss) by moving bounded card-info and deck-zone shells into adjacent modules.
2. Reduce [`server/ui/styles/tournament.scss`](../server/ui/styles/tournament.scss) to only create/edit surfaces that cannot yet be split further.
3. Split remaining duel-runtime ownership in [`server/ui/styles/main.scss`](../server/ui/styles/main.scss) and [`server/ui/styles/animation.scss`](../server/ui/styles/animation.scss) into component-owned or bounded runtime-owned layers.
4. Revisit the two exception files and either formalize or eliminate them.

### Acceptance Criteria

- root layout imports only true globals
- every mounted component in [`server/ui/components`](../server/ui/components) has an obvious style owner
- feature stylesheets are loaded only from the route or component that renders them
- the remaining global stylesheets are clearly justified and narrowly scoped
- the component lab remains visually isolated from application styling

### UI Null Removal Plan

Source label: `ui-null-removal-plan.md`

### Goal

Remove internal `null` usage from [`server/ui`](../server/ui) so `null` only survives at explicit external boundaries:

- React framework contracts
- browser APIs
- Node.js APIs
- protocol adapters that must speak `null`

Inside first-party UI state and helpers, prefer explicit non-null shapes, booleans, empty collections, tagged state, `undefined`, or named sentinels.

### Rules

Allowed:

- `useRef(null)` and other React-owned contracts
- `return null` where React requires it
- DOM or platform APIs that legally return `null`
- protocol translation layers that normalize `null` immediately

Disallowed:

- `useState(null)` for app payload state
- internal helper returns that use `null` for "not found"
- runtime state fields initialized to `null` as a generic idle marker
- arrays with `null` placeholders for ordinary control flow
- cross-module APIs that require callers to pass or check `null`

### Preferred Replacements

- "not loaded yet" -> tagged state such as `{ status: 'idle' | 'loading' | 'ready' | 'error' }`
- "missing object" -> explicit empty sentinel
- "missing list" -> `[]`
- "missing text" -> `''`
- "optional handle" -> `undefined`
- "not found" helper result -> `undefined`
- "cancel / decline" protocol value -> keep `null` only in the adapter layer

### Current State

Current hotspots:

- [`server/ui/services/game.service.js`](../server/ui/services/game.service.js)
- [`server/ui/services/game-dialog.service.js`](../server/ui/services/game-dialog.service.js)
- [`server/ui/services/game-passive-state.service.js`](../server/ui/services/game-passive-state.service.js)
- [`server/ui/services/game-setup.service.js`](../server/ui/services/game-setup.service.js)
- [`server/ui/components/screens/deckedit.component.jsx`](../server/ui/components/screens/deckedit.component.jsx)
- [`server/ui/components/duel/field.component.jsx`](../server/ui/components/duel/field.component.jsx)
- [`server/ui/services/manual.js`](../server/ui/services/manual.js)

Highest-risk overlap:

- [`server/ui/services/game.service.js`](../server/ui/services/game.service.js) and [`server/ui/services/manual.js`](../server/ui/services/manual.js) still carry both parity debt and null-cleanup debt, so they should move with direct test coverage instead of stylistic cleanup alone

### Active Strategy

#### 1. Normalize at the boundary

Whenever external APIs or protocol payloads produce `null`, convert them immediately before the value spreads into component state or helper APIs.

#### 2. Remove generic idle `null`

Grouped runtime state objects in the duel services should use:

- `undefined`
- explicit sentinels
- tagged state objects

instead of generic `null` placeholders.

#### 3. Remove helper-control-flow `null`

Internal lookups should return `undefined` or a named result object, not `null`.

#### 4. Remove placeholder-array `null`

Deck editor and duel selection code should use explicit empty-slot sentinels or structured slot objects instead of `null` entries.

### Next Steps

1. Continue reducing internal `null` state in the split duel services.
2. Remove remaining placeholder-style `null` slots in [`server/ui/components/screens/deckedit.component.jsx`](../server/ui/components/screens/deckedit.component.jsx).
3. Clean up field and manual-duel helpers that still use `null` for missing runtime state.
4. Keep `null` localized to framework and protocol boundaries only.

### Acceptance Criteria

- internal UI state does not use `null` as a generic missing or idle value
- helper APIs inside [`server/ui`](../server/ui) do not use `null` for ordinary control flow
- remaining `null` usage is limited to React, browser, Node, or explicit protocol boundaries
- every remaining `null` has an obvious reason

### Component Lab Render Contract Plan

Source label: `component-lab-render-contract-plan.md`

### Summary

The component lab should stop assuming components are already individually renderable.

The current reality is:

- most components work correctly as part of the application runtime
- many components do not work meaningfully in isolation
- the gap is hidden runtime dependency, not broken JSX

The project goal is to discover each component's real render contract, document it, and then move hidden runtime dependencies out of the view layer until the component can be rendered from explicit props or a clearly defined harness.

### Core Rule

If the lab cannot render a component with explicit props or a clearly documented harness, then the component still has hidden dependencies.

### Decision Rules

#### Make it a prop when

- it directly affects what the component renders
- it can be described as input data or render state
- a parent or container can reasonably own it
- it should be testable, previewable, and reusable

Examples:

- text
- selected value
- options
- loading or error state
- card data
- visibility state
- enabled or disabled flags

#### Keep it on `Feed` when

- it is a runtime event or command rather than render state
- multiple distant systems react to it
- it is orchestration rather than presentation
- it is transient and not meaningful as a persisted view prop

Examples:

- room joined
- duel started
- reconnect happened
- modal open requested
- answer submitted
- sound or flash triggered

#### Preferred architecture

- `Feed` carries events and commands
- container or harness layers listen to `Feed`
- containers translate events into state
- view components receive explicit props and callbacks
- view components do not directly depend on ambient runtime state unless documented as an intentional exception

### Documentation-First Standard

Each component should eventually include a concise contract comment in source covering:

1. Purpose
2. Props
3. Feed inputs listened for
4. Feed outputs emitted
5. Ambient dependencies
6. Minimum render requirements
7. Refactor target

Use these classifications:

- `Render Prop`
- `Callback Prop`
- `Local State`
- `Feed Input`
- `Feed Output`
- `Ambient Dependency`

### Lab Entry Types

The lab should distinguish between three entry types:

#### View

- renderable from props only
- no local `Feed` traffic required

#### Harnessed

- requires a local `Feed`, store, or mock runtime dependency
- still acceptable for the lab as long as the harness contract is explicit

#### Scene

- not a meaningful isolated leaf component
- should be rendered as a bounded multi-component runtime slice instead

### Implementation Phases

#### Phase 1: Contract Documentation Pass

Document the real runtime contract before refactoring behavior.

Work items:

- add component contract comments to source files
- record props, `Feed` inputs, `Feed` outputs, and ambient dependencies
- mark likely future prop boundaries

Suggested pilot order:

1. common components
2. simple screens
3. bounded dialogs
4. duel overlays
5. heavy runtime surfaces

#### Phase 2: Lab Truthfulness Pass

Reclassify lab entries based on reality, not aspiration.

Work items:

- mark entries as `view`, `harnessed`, or `scene`
- stop calling entries preview-ready unless they actually work
- document why docs-only entries are not yet isolated

#### Phase 3: Harness Extraction Pass

Create shared harnesses for repeated runtime patterns.

Priority harnesses:

- local `Feed` harness
- duel runtime state harness
- card database harness
- auth or session harness where needed

#### Phase 4: View Extraction Pass

Split runtime-bound components into:

- container or harness layer
- prop-driven view layer

Goal:

- the visible rendering surface should become a prop-driven component whenever practical

#### Phase 5: Lab Migration Pass

Move lab pages to the extracted contracts.

Work items:

- replace ad hoc preview overrides with structured contracts
- add typed controls from the contract where possible
- keep raw JSON as an advanced fallback, not the default workflow

### First Pilot Batch

Start with a mixed pilot so the documentation format covers multiple cases:

- [`server/ui/components/common/loading.component.jsx`](../server/ui/components/common/loading.component.jsx)
- [`server/ui/components/common/faq.component.jsx`](../server/ui/components/common/faq.component.jsx)
- [`server/ui/components/common/card.component.jsx`](../server/ui/components/common/card.component.jsx)

These give:

- a pure prop-driven component
- a simple data renderer
- a `Feed`-emitting runtime-aware component

### Acceptance Criteria

- each documented component has a clear source comment describing props and `Feed` behavior
- the team can decide whether a dependency should be a prop or a `Feed` event using one shared rule set
- the lab can classify every component as `view`, `harnessed`, or `scene`
- hidden runtime dependencies become explicit enough to refactor deliberately
- future lab work is driven by documented contracts instead of guesswork

## Reference Specs And Current State

### Server Interface

Source label: `server-specification.md`

* [ ] HTTP Accessible
* [ ] On update doesnt shutdown fully just cycles the spawned forks.
* [ ] Display of current gamelist.
* [ ] Display uptime.
* [ ] Display CPU "overall" usage.
* [ ] Subsite for database management.


#### Server Application
* [ ] HTTP Server, displaying server interface, behind security points.
* [ ] WebSocket YGOPro Port
* [ ] OCGCore Compilation system
* [ ] cards.cdb Compilation system
* [ ] lflist.conf compilation system
* [ ] YGOCore Compilation system
* [ ] Web facing database facing complication system
* [ ] Can spin down active cores and then reboot itself

#### Server Installation
- XAMPP
- InspIRCd
- Anope 2
- nginx
- GitHub
- Brackets.io
- 7-Zip
- WinRAR
- Dropbox

#### Backups
* Stored to Salvation Development Dropbox
* Backups Ran nightly
* Targets
 - User Game/Ranking Login Database
 - Forum Database
 - Anope Configuration
 - Apache Configuration
 - Server duel variance inis
 - InspIRCd Configuration



### Manual Mode

Source label: `manualMode.md`

### Documentation by a forgetful German

#### Preface

This documentation describes the Yu-Gi-Oh! manual dueling simulator. It is using websockets in order to communicate between server and client.

Described below is only the server-side state manager.

##### Lines 1 - 86

- Initialize the requirements. This includes:
    * `require`-ing Primus and Primus rooms
    * Setting up a server on port `55542` (the original port `24555` reversed)
    * Setting up:
        1. User registry
        2. Active duel state (in format:
        ```
        {
            duelID:
            {
                options:
                {
                    banlist: banlistPropertyName,
                    database: databasePropertyName
                },
                players:
                {
                    uid:
                    {
                        ROLE: playerRole,
                        deck: parsedYDK
                    }
                },
                spectators:
                {
                    uid:
                    {
                        ROLE: ROLE_SPECTATOR
                    }
                }
            }
        }
        ```
        3. ConfigParser
        4. Databases and banlist objects
    * Setting various constants (those should be usually self-explanatory, and if they ever aren't I will describe them)
    * Call `cdbUpdater` and `banlistUpdater()`, then refresh them every 120 seconds
- Handle users connecting, handle user input and user disconnects through callbacks. More below.

##### `handlePrimusEvent(data, client)` (L88 - L693)
###### Function parameters
- `data`: Data object being passed by Primus
- `client`: Reference to Primus' current client

This is the core logic of the server-side state manager. All the commands are received and executed here, and the internal state is modified here as well.

Data sent by the client will be in this object format:

```
{
    action: commandName,
    uid: userID,
    username: username,
    duelID: currentDuel,
    duelQuery: commandConstant,
    amount: amountInt,
    phase: currentPhase,
    target: {
        player: playerRole,
        location: locationConstant,
        slot: arrayIndex
        /*, locations: [locationConstants*] */
    },
    moveTo: {
        player: playerRole,
        location: locationConstant,
        slot: arrayIndex
    },
    hostOptions: {
        deckList: parsedYDK,
        database: databasePropertyName,
        banList: banListPropertyName
    }
}
```

Below a list of all accepted input for `data.action`:

- `"registerUID"`
- `"hostDuel"`
- `"joinDuel"`
- `"spectateDuel"`
- `"duelQuery"`
- `"heartBeat"`
- `"regDuelLog"`

`data.uid` is the user's (technically not guaranteed to be unique) user ID: it is generated by a client-side function (although I will likely change this at a later point); and it is used for all purposes of verification at the moment.

`data.username` is the user's chosen nick name and will be displayed for everyone.

`data.duelID` is a property name of the currently on-going duel which will be looked for in `activeDuels`.

Based on the `data.action`, program flow will branch:

- `"registerUID"`
    * Store the user's `data.uid` and `data.username` in the `registry` object.
    * `return;`
- `"hostDuel"`
    * Creates a new duel in `activeDuels` based on the contents of `data.hostOptions`. Format for `hostOptions` is available above.
    * This action will fail if the passed `deckList` is invalid. If `database` is not a valid property name, the default database will be used.
    * `return;`
- `"joinDuel"`
    * Checks the user's `data.hostOptions.deckList` for validity and if it succeeds, joins the user into the specified `data.duelID`.
    * Assigns a role based on how many participants are currently playing.
    * `return;`
    (I'm aware the switch can be optimized)
- `"spectateDuel"`
    * Joins the user into the `data.duelID` and assigns spectator role.
    * `return;`
- `"duelQuery"`
    * Handles a query regarding the current `data.duelID`
    * More below.
- `"heartBeat"`
    * Simple keep-alive request
    * `return;`
- `"regDuelLog"`
    * Writes the current `activeDuels` and `registry` objects to the client.
    * Only used during development. Will be removed once this hits live, or at least will be made inaccessible to any non-staff.
    * `return;`

##### `handleClientDisconnect(client)` (L695 - 711)
###### Function parameters
- `client`: Same client reference as for `handlePrimusEvent`

Simply handles the event in which a user disconnects. Write the event to all the clients listening to that user's duels and delete them.

A disconnect is final. Primus itself will handle short network interrupts, but once it can't reconnect anymore, the user has died to the server.

##### `writeResponse(client, dataArray)` (L713 - 720)
###### Function parameters
- `client`: Client reference
- `dataArray`: Array with 2 to 3 elements which is used to form the response

Surprisingly one of the few comments describe the parameters this function accepts.

Simply writes a response to the passed client. Responses will be written only in the `handlePrimusEvent` method.

##### `secureClientDuel(activeDuel)` (L722 - 745)
###### Function parameters
- `activeDuel`: Object reference to a currently on-going duel in `activeDuels`

Prepare an object containing the current duel, then extract the UIDs and replace them with user names. Used when initiating a duel.

##### `validDeck(deckList, banList, database)` (L747 - 816)
###### Function parameters
- `deckList`: Object created by `parseYDK` representing the user's deck list
- `banList`: Property of `banLists`
- `database`: Property of `databases`

Check a deck for its validity. This check will only return `true` if the following criteria matches:

- Minimum amount of 40 cards in the main deck
- Maximum amount of 60 cards in the main deck
- Minimum amount of 0 cards in the side and extra deck
- Maximum amount of 15 cards in the side and extra deck
- Card is contained in the banlist and the copies of the card do not exceed the maximum allowed amount
- Card and all of its aliases are contained a maximum of 3 times (this still needs to be fixed since card aliases are not checked in the previous checks)

##### `commandIsValid(activeDuel, uid, target, moveTo)` (L818 - 820)
###### Function parameters
- `activeDuel`: Object reference to a currently on-going duel in `activeDuels`
- `uid`: User ID as string
- `target`: Object describing the command's targeted card
- `moveTo`: Object describing the command's card's new location

A one-liner. Contains overly unnecessary optimized boolean condition for checking if the `target` card is owned by the user issuing the command, if it's in place and if the `moveTo` location and slot is not empty.

##### `xyzSummonIsValid(activeDuel, uid, target, moveTo` (L822 - 849)
###### Function parameters
- `activeDuel`: Object reference to a currently on-going duel in `activeDuels`
- `uid`: User ID as string
- `target`: Object describing the command's targeted cards
- `moveTo`: Object describing the command's cards' new location

Checks if an Xyz Summon is being performed properly. Contains similar checks to above function. However, the format is different than usual: `[XYZ_TARGET, XYZ_MATERIAL_1 /*, XYZ_MATERIAL_2, etc. */]`

##### `changePositionIsValid(activeDuel, uid, target)` (L851 - 853)
###### Function parameters
- `activeDuel`: Object reference to a currently on-going duel in `activeDuels`
- `uid`: User ID as string
- `target`: Object describing the command's targeted card

Similar one-liner to #L818. Changing a card's position uses the same command as the other movement commands so state is checked if the command is valid.

##### `GameState(nPlayers)` (L855 - 876)
###### Function parameters
- `nPlayers`: Integer assigning how many players should be present in the new game state

Initialize a game state object for `nPlayers` amount of players. Pretty straightforward, use default empty values and 8000 LP.

##### `startDuelState(gameState, deckList)` (L878 - 908)
###### Function parameters
- `gameState`: Object created by `GameState`
- `deckList`: Object created by `parseYDK` representing the user's deck list

In a specific `gameState`, fill it with the contents of `deckList`.

Afterwards, shuffle the deck and move 5 cards from the top of the deck to the hand. More about those below.

##### `moveCard(move)` (L910 - 916)
###### Function parameters
- `move`: Object containing references to target and destination locations

Passed an object `move` with `move.from` and `move.to`, the card object will be moved from `from` to `to` (I think this was obvious)

##### `moveCards(amount, move)` (L918 - 934)
###### Function parameters
- `amount`: Integer describing how many cards should be moved
- `move`: Object containing references to target and destination locations

Move `amount` of cards from either the top or the bottom of `move.from` to `move.to`. The direction is specified through `move.dir`, if `move.dir === 0` it will move from the top, and if it is any other value it will move from the bottom.

##### `shuffleArray(array)` (L936 - 948)
###### Function parameters
- `array`: Any array to be shuffled

Generic shuffle function.

##### `shuffleDeck(activeDuel, player)` (L950 - 952)
###### Function parameters
- `activeDuel`: Object reference to a currently on-going duel in `activeDuels`
- `player`: Integer assigning a target player whose deck will be shuffled

Shuffles a user's deck. Simple.

##### `cdbUpdater()` (L954 - 969)
###### Function parameters
- None

For every database that has been initialized, look up the file residing in the local file system at `../http/manifest/`; this is architecture-specific and might need to be adjusted if files are moved around.

##### `banListUpdater()` (L971 - 983)
###### Function parameters
- None

Update the banlist from the configuration file found in the local file system at `../http/ygopro/`.

## Feature And Delivery Backlog

### /ygopro Main Process Parity Plan

Source label: `ygopro-main-process-parity-plan.md`

### Goal

Bring [`mainProcess(game)`](../server/core/core/controller_core.js#L1538) into parity with the way EDOPro stops on interactive core messages, waits for a real response, and then resumes `duelProcess(pduel)` without replaying or inventing extra prompts.

Why it matters:

- when this control flow diverges from EDOPro, players can hit duplicate prompts, missing waiting-state feedback, or stalled duel flow after interactive questions

This plan is based on the desktop control flow in:

- [`GenericDuel::Process()`](../edopro/gframe/generic_duel.cpp#L730)
- [`GenericDuel::Sending(...)`](../edopro/gframe/generic_duel.cpp#L829)
- [`GenericDuel::Analyze(...)`](../edopro/gframe/generic_duel.cpp#L1269)
- [`GenericDuel::GetResponse(...)`](../edopro/gframe/generic_duel.cpp#L1284)
- [`GenericDuel::WaitforResponse(...)`](../edopro/gframe/generic_duel.cpp#L1326)
- [`SingleMode::SinglePlayAnalyze(...)`](../edopro/gframe/single_mode.cpp#L337)
- [`DuelClient::ClientAnalyze(...)`](../edopro/gframe/duelclient.cpp#L1286)
- [`DuelClient::SendResponse()`](../edopro/gframe/duelclient.cpp#L4269)

### What EDOPro Actually Does

EDOPro has a simple contract:

1. `duelProcess(pduel)` runs.
2. Parsed core messages are analyzed one by one.
3. Each message returns a process result.
   - `0`: continue processing
   - `1`: wait for player response
   - `2`: duel end / hard stop
4. The loop breaks immediately on the first non-zero result.
5. When a player answers, `GetResponse(...)` writes the response into ocgcore and immediately resumes `Process()`.

Important behavior details:

- The decision to pause is made inside the analyzer path, not inferred later by the outer loop.
- `WaitforResponse(player)` is explicit. It marks the responding player, sends `MSG_WAITING` to the rest of the duel, and sets the active player state to `CTOS_RESPONSE`.
- Identical prompts are not deduplicated away. `MSG_RETRY` is the core-supported resend path.
- Desktop UI cleanup is scoped to the current `curMsg` in `SendResponse()`. It does not try to globally suppress future prompts.

### Current /ygopro Gaps

The current controller flow diverges from that model in a few ways:

- [`mainProcess(game)`](../server/core/core/controller_core.js#L1538) still owns interactive detection directly instead of consuming a message-level stop/continue result.
- Prompt pausing is inferred from message type ranges, which spreads the contract across normalization, routing, resend logic, and the UI.
- The outer loop can still become fragile whenever a `duelProcess()` batch contains multiple messages and only the first one should block.
- The non-acting side does not follow desktop `MSG_WAITING` semantics. We currently rely on bespoke resend / announcement behavior instead of one explicit waiting state.
- There is no single server-side object equivalent to desktop `curMsg + last_response + answered` for the active interactive prompt.

### Target Contract

The server-side flow should match desktop structure:

1. `mainProcess(game)` calls `duelProcess(pduel)` only when no interactive prompt is outstanding.
2. Messages are consumed sequentially through one analyzer/dispatcher function.
3. That function returns `CONTINUE`, `WAIT_FOR_RESPONSE`, or `END_DUEL`.
4. The first `WAIT_FOR_RESPONSE` stops further processing immediately.
5. Only `Responser.write(...)` clears the wait and resumes the loop.
6. Explicit retries from ocgcore are allowed to resend the same question payload.

### Implementation Slices

#### 1. Introduce a Process Result Enum

Add a small internal result contract in [`controller_core.js`](../server/core/core/controller_core.js):

- `PROCESS_CONTINUE`
- `PROCESS_WAIT_FOR_RESPONSE`
- `PROCESS_END_DUEL`

Use it in a new helper, for example `dispatchCoreMessage(game, rawMessage)`, so `mainProcess` does not have to manually infer stop behavior from message type ranges.

Expected parity gain:

- Matches `GenericDuel::Analyze(...)` return values.
- Makes prompt pausing an analyzer concern, like desktop.

#### 2. Stop on the First Blocking Message

Refactor `mainProcess(game)` so it:

- processes parsed messages with an indexed loop
- stops immediately when `dispatchCoreMessage(...)` returns `PROCESS_WAIT_FOR_RESPONSE`
- stores any unread messages in a dedicated pending queue
- drains that queue before calling `duelProcess(pduel)` again

Expected parity gain:

- Mirrors `GenericDuel::Process()` and `SingleMode` behavior.
- Prevents later messages in the same batch from generating extra prompts while a question is already active.

#### 3. Add Explicit Wait-for-Response State

Create one server-side prompt state object on `game`, for example:

- `game.activePrompt`
  - `messageType`
  - `player`
  - `uuid`
  - `command`
  - `sourceMessage`

When a blocking interactive message is dispatched:

- set `game.activePrompt`
- send the prompt only to the acting player
- send an explicit waiting notification to the other duelist and observers

Expected parity gain:

- Aligns with `WaitforResponse(player)` and desktop `MSG_WAITING`.
- Removes the need to infer whether the system is paused from loose fields like `pendingQuestionType`.

#### 4. Move Prompt Classification Out of the Outer Loop

Today the outer loop decides what is interactive. That should move into the message dispatcher so each message family declares its own behavior:

- non-interactive announcements: `PROCESS_CONTINUE`
- interactive prompts: `PROCESS_WAIT_FOR_RESPONSE`
- terminal packets like `WIN` / `RETRY`: `PROCESS_END_DUEL` or explicit stop status as appropriate

This should cover:

- `SELECT_*`
- `ANNOUNCE_*`
- `ROCK_PAPER_SCISSORS`
- any future prompt family added by ocgcore

Expected parity gain:

- Matches the desktop analyzer pattern.
- Reduces the chance of fixing the same bug repeatedly for different message types.

#### 5. Make Response Resume the Only Resume Path

Keep resume ownership in [`Responser.write(...)`](../server/core/core/controller_core.js#L1692), mirroring desktop [`GenericDuel::GetResponse(...)`](../edopro/gframe/generic_duel.cpp#L1284):

- validate against `game.activePrompt`
- clear the active prompt
- call `duelSetResponse(...)`
- immediately call `mainProcess(game)` to continue

Add one-shot protection similar in spirit to desktop [`DuelClient::SendResponse()`](../edopro/gframe/duelclient.cpp#L4269), but scoped to the active prompt token rather than global duplicate suppression.

Expected parity gain:

- Prevents duplicate UI answers for the same prompt.
- Avoids blocking identical future prompts or real core retries.

#### 6. Replace Replay-Style Resend with Structured Waiting Updates

Review all uses of `reSendToPlayer(...)` in the interactive path and align them with desktop semantics:

- the acting player gets the actual prompt
- the opponent gets an explicit waiting state
- observers get sanitized state, not a stale replay of the previous player prompt

This is the main area where current behavior can still feel "looping" even if the core is technically paused.

#### 7. Align `MSG_RETRY` Handling With Desktop

Do not suppress repeated payloads. Instead:

- treat `MSG_RETRY` as an explicit core-directed resend/reset event
- clear any server-side active prompt state as needed
- reissue the prompt with a fresh UI token if the core requires it

Expected parity gain:

- Matches desktop retry behavior.
- Preserves the distinction between accidental duplicate processing and legitimate retry.

### Test Plan

Add focused coverage in [`tests/unit/server/controller-core.test.js`](../tests/unit/server/controller-core.test.js):

- one `duelProcess()` batch containing two interactive prompts only surfaces the first
- trailing messages are delivered only after a real response resumes processing
- identical prompt payloads are allowed when the core resends them
- `MSG_RETRY` reopens the prompt instead of being dropped
- the opponent receives waiting-state output, not the active player prompt
- observers receive sanitized prompt state
- `WIN` and end-of-duel packets stop processing immediately

Add parity coverage in the browser contract tests for:

- repeated `MSG_SELECT_CHAIN`
- repeated `MSG_ANNOUNCE_NUMBER`
- idle command resend after an interleaved duel update
- waiting-state visibility for the non-acting player

### Recommended Order

1. Add the process-result enum and dispatcher helper.
2. Refactor `mainProcess(game)` to stop on the first blocking result and queue unread messages.
3. Introduce `game.activePrompt` and move all resume ownership into `Responser.write(...)`.
4. Replace interactive-path resends with explicit waiting-state messages.
5. Add `MSG_RETRY` handling and the regression suite.

### Non-Goals

This parity pass should not try to copy desktop UI timing or animation behavior. The scope is the control-flow contract around `duelProcess`, interactive prompts, waiting state, retries, and resume behavior.

### YGOPro OCG Message Parity Audit

Source label: `ygopro-ocg-message-parity-audit.md`

### Purpose

This document tracks the remaining parity gaps between:

- `edopro/gframe/duelclient.cpp`
- the local Node duel bridge
- the `/ygopro` browser client

It is a current-state audit only. Completed work is folded into the status notes below instead of being kept as historical checklist noise.

### Transport Summary

The local duel pipeline is:

1. `server/ocgcore/src/messages.ts`
   Parses raw OCGCore packets into JS objects.
2. `server/core/core/controller_core.js`
   Normalizes protocol payloads into browser-safe structures.
3. `server/core/core/controller_automatic.js`
   Routes each packet as a question, announcement, state mutation, or reload.
4. `server/core/core/model_automatic_field.js`
   Applies authoritative duel-state changes.
5. `server/ui/services/game.service.js`
   Renders `/ygopro` and sends answers back to core.

A parity bug can therefore live in:

- message parsing
- server-side normalization
- controller routing
- browser rendering fidelity

### Messages Intentionally Excluded From Browser Parity Gaps

Movement-class packets such as `MSG_MOVE`, `MSG_POS_CHANGE`, `MSG_SET`, and `MSG_SWAP` are not browser parity gaps by themselves.

`duelclient.cpp` treats them as state transitions. The local bridge does the same through the server-side board controller and automatic field model. `/ygopro` is expected to react to the resulting field state, not to the raw movement packet itself.

### Current Status

The important interactive and board-sync paths are now mostly in place:

- summon, special summon, flip summon flash handling
- chain overlays and battle feedback
- prompt fidelity for `MSG_HINT`, `MSG_SELECT_EFFECTYN`, `MSG_SELECT_YESNO`, and `MSG_SELECT_CHAIN`
- toss overlays, rock-paper-scissors flow, and hand result display
- field reload and maintenance packets such as `MSG_REFRESH_DECK` and `MSG_TAG_SWAP`
- persistent equip and target state on server-side cards
- hover-based target glow and equip overlays in `/ygopro`
- transient `MSG_BECOME_TARGET` browser feedback
- `MSG_BE_CHAIN_TARGET`, `MSG_CREATE_RELATION`, and `MSG_RELEASE_RELATION` now reach `/ygopro` with a usable protocol shape even when the local core sends an empty packet
- selection-result and timing feedback for `MSG_CARD_SELECTED`, `MSG_RANDOM_SELECTED`, `MSG_ATTACK_DISABLED`, `MSG_MISSED_EFFECT`, and `MSG_UNEQUIP`
- `MSG_DECK_TOP` authoritative deck-top updates with browser flash feedback
- `MSG_HAND_RES` pre-duel result display with native-style one-second pacing before later packets resume
- `MSG_AI_NAME` now updates duel names and `/ygopro` lobby metadata for AI opponents
- `MSG_SHOW_HINT` now reaches the browser as visible notice/log text
- `MSG_CUSTOM_MSG` now reaches the browser as a safe notice/log marker; the local parser still does not expose a richer native payload
- `MSG_MATCH_KILL` now emits a child-process tournament-reporting signal with room and tournament metadata, and the room snapshot records the last reported match-kill card

### Target And Relation Status

#### `MSG_CARD_TARGET`

Handled.

Current local behavior:

- server-side cards store persistent `cardTarget` coordinates
- `/ygopro` shows hover-based target glow for linked cards
- the announcement path now also emits transient visual feedback when the link is created

This matches the important visible behavior from `duelclient.cpp`: persistent relationship state plus hover-driven target visibility.

#### `MSG_CANCEL_TARGET`

Handled.

Current local behavior:

- the server removes the stored target relationship
- hover glow disappears because the persistent state is gone
- the announcement path emits a transient unlink feedback pulse

#### `MSG_BECOME_TARGET`

Handled.

`duelclient.cpp` treats this as transient emphasis, not persistent target-link state. The local implementation now follows that model:

- `controller_core.js` normalizes the affected card list into browser-safe coordinates
- `controller_automatic.js` emits a dedicated transient target event
- `/ygopro` pulses the affected cards using the existing target-glow language

One detail is still thinner than native EDOPro: the local browser client does not yet keep separate chain-target bookkeeping equivalent to `current_chain.target`.

#### `MSG_BE_CHAIN_TARGET` / `MSG_CREATE_RELATION` / `MSG_RELEASE_RELATION`

Addressed as far as the local core build allows.

Current local behavior:

- `server/ocgcore/src/messages.ts` now accepts optional trailing info-location payloads for these packets instead of forcing them to remain empty forever
- when the local core still sends an empty packet, `controller_automatic.js` falls back to current chain context so `/ygopro` still receives concrete card coordinates
- `/ygopro` now gets a stable protocol shape for target/relation pulses instead of `null` UI contracts

Remaining limitation:

- this local core build still does not show an explicit writer for concrete relation endpoints, and the local `duelclient.cpp` copy still does not provide a strong dedicated standalone visual contract beyond general chain/target feedback

### Practical Conclusion

The main remaining parity limits are narrower fidelity details, especially relation endpoints that the local core still does not fully expose and any future animation polish that depends on richer native packet data.

### EDOPro Host Page Parity Plan

Source label: `edopro-host-page-parity-plan.md`

### Purpose

Keep `/host` aligned with the practical hosting surface of EDOPro while keeping the browser-to-server contract canonical and maintainable.

This is not a pixel-copy project. It is a config-surface and payload-shape project.

### Current State

Implemented on the active `/host` flow:

- tabbed host workbench
- extra-rules modal
- canonical `hostConfig` submission from the browser
- canonical host-config consumption in the main hosted-room path
- wasm-facing duel setup built from canonical `team1` and `team2` settings
- bounded host summary and preview surfaces in the UI

Main active files:

- [`server/ui/components/screens/host.component.jsx`](../server/ui/components/screens/host.component.jsx)
- [`server/ui/app/index.jsx`](../server/ui/app/index.jsx)
- [`server/lobby.js`](../server/lobby.js)
- [`server/api/routes/endpoint_tournaments.js`](../server/api/routes/endpoint_tournaments.js)
- [`server/core/core/index.js`](../server/core/core/index.js)
- [`server/core/core/core.js`](../server/core/core/core.js)
- [`server/ocgcore/src/types.ts`](../server/ocgcore/src/types.ts)

### Reference Surface

Important EDOPro concepts that still define parity expectations:

- duel tab
- deck options tab
- custom rule tab
- extra rules modal

Important data families:

- forbidden list and card filtering
- duel mode, team sizing, best-of, relay
- start LP, starting hand, draw count, timer
- deck-size and deck-validation rules
- custom duel flags
- extra-rule selections


- browser no longer needs to send the older uppercase alias payload shape
- active hosted-room startup path consumes canonical host config
- team-based settings are represented in the wasm-facing config
- `/host` exposes the modernized EDOPro-inspired control surface instead of the earlier stripped-down form

### Remaining Work

#### 1. Finish cleanup outside the main host path

Still worth revisiting:

- [`server/rooms.js`](../server/rooms.js)
- older tcgcore bootstrap and comment debt in the tcgcore layer

#### 2. Keep the config contract singular

Do not reintroduce:

- duplicate alias field names
- one-off per-hop normalization rules
- legacy environment-key dependencies when canonical host config is already available

#### 3. Validate parity at the behavior level

Parity should continue to be measured by:

- exposed option coverage
- payload shape
- duel-start behavior

not by visual mimicry alone.

### Rules

- browser submits one canonical `hostConfig`
- server paths should consume that canonical shape directly
- EDOPro parity means option and behavior parity, not skin parity
- if a field is added to the UI, it must map cleanly into the canonical duel config

### Acceptance Criteria

- `/host` exposes the intended EDOPro-inspired host surface
- the browser emits one canonical payload shape
- hosted-room startup does not depend on legacy alias fields
- team settings remain aligned with the wasm interface

### Tournament System Implementation Plan

Source label: `tournament-system-implementation-plan.md`

### Purpose

This document defines a concrete implementation plan for a full tournament system inside this repository. It is written as a build plan for future AI-assisted implementation, not as a product pitch. The goal is to break the work into stable architectural decisions, domain models, workflows, APIs, UI pages, background jobs, and phased tasks that can be executed incrementally.

### Remaining Work

Current follow-on work:

- swiss round-creation test coverage for 4-64 entrants is still not implemented
- automatic duel-complete callback into tournament match finalization, replay persistence, and stricter non-participant player blocking are still not implemented
- reminder delivery execution, email template sending, and websocket fanout for tournament alerts are still not implemented
- alert read-state mutation and richer tournament profile/ranking presentation outside the `/tournaments` shell are still not implemented

The system described here covers:

- player-created tournaments
- tournament calendar
- preregistration and check-in
- swiss and single elimination
- byes for odd player counts
- league-specific tournament configuration
- tournament-specific ranking / Elo
- round alerts and reminder emails
- standardized top-of-the-hour tournaments managed by the platform

### Repo Context

This repo already has:

- a Next-based UI under [server/ui/app](../server/ui/app)
- a central game server under [server/index.js](../server/index.js) and related server files
- auth/session flows integrated into the UI and CMS API
- duel room and duel-instance lifecycle logic
- ranking and game list concepts already present in the product
- a first-pass tournament calendar/detail stylesheet at [server/ui/styles/tournament.scss](../server/ui/styles/tournament.scss)

This plan assumes tournaments should integrate with the current stack rather than introducing a separate product or independent frontend.

### Product Requirements

The system must support:

1. A tournament calendar page.
2. Player-created tournaments.
3. A maximum of one active owned tournament per player.
4. Tournament capacity up to 64 players.
5. Player preregistration before start.
6. A start-time grace period for late registration / final check-in.
7. Automatic round generation once registration closes.
8. Match flow where players click in when ready and play.
9. Automatic round progression once all matches in the round are resolved.
10. Configurable number of rounds.
11. Swiss format.
12. Single elimination format.
13. Byes when the player count is odd.
14. Tournament-specific win/loss records.
15. A separate tournament Elo / rating system.
16. Leagues with locked room configurations.
17. Alerts for round starts.
18. Reminder emails at configurable offsets such as 24h, 4h, and 30m.
19. A separate platform-managed standardized tournament system running at the top of the hour and affecting rankings.

### Deferred Beyond First Release

The first release intentionally stopped at the stable solo-tournament core. The following items were deferred and are now assigned to later releases in this document:

- v2: double elimination
- v2: team tournaments
- v2: manual bracket editing on top of the existing v1 API and audit model
- v2: spectator broadcasting enhancements beyond current duel support
- v2: full public tournament landing pages with rich media
- v2: staff moderation dashboards beyond basic admin controls
- v2: external calendar sync
- v3: paid tournaments, prize handling, drop-shipping fulfillment, and payout rails

Those features should be layered onto the existing authoritative tournament runtime rather than implemented as parallel systems.

### Recommended Architecture

#### Core Principle

Tournament state must be server-authoritative. The browser should never decide pairings, wins, round completion, or byes. The browser is responsible only for:

- rendering tournament state
- collecting user actions
- requesting registration / check-in / match join / result confirmation

#### Services

The implementation should be split into four responsibilities:

1. Tournament persistence layer
   - stores tournaments, entrants, rounds, matches, leagues, reminders, and ratings
   - should be durable and queryable by both API and background jobs

2. Tournament coordinator service
   - server-side state machine
   - starts tournaments
   - closes registration
   - creates pairings
   - advances rounds
   - assigns byes
   - finalizes standings

3. Tournament notification layer
   - emails
   - in-app alerts
   - websocket push messages

4. Tournament UI
   - calendar page
   - host/create page
   - tournament detail page
   - player tournament dashboard

#### Storage Recommendation

Prefer a database-backed model rather than in-memory tournament state.

Use the existing application persistence environment rather than inventing a temporary JSON layer. The cleanest options are:

- CMS-backed entities if the current CMS is the main persistence authority
- or a dedicated server-side SQL store if tournament execution needs lower-latency transactional control

Recommendation:

- authoritative tournament runtime and pairings live in the main server domain
- persistent tournament records live in durable storage accessible from the main server
- CMS remains the source of identity/session/user profile data

### Domain Model

The following entities should be implemented.

#### 1. League

A league defines the tournament ruleset bundle and ranking bucket.

Fields:

- `id`
- `slug`
- `name`
- `description`
- `active`
- `roomConfiguration`
- `banlistPolicy`
- `cardPoolPolicy`
- `defaultFormat`
- `defaultRoundTimerMinutes`
- `defaultRegistrationGraceMinutes`
- `tournamentEloEnabled`
- `ranked`
- `visibility`
- `createdAt`
- `updatedAt`

`roomConfiguration` should capture the duel room defaults that are currently spread across host/game settings.

Examples:

- `tcg-modern-ranked`
- `ocg-modern-ranked`
- `goat-locked`
- `rush-ranked`

#### 2. Tournament

Represents a single scheduled event.

Fields:

- `id`
- `slug`
- `name`
- `description`
- `ownerUserId`
- `ownerUsername`
- `leagueId`
- `format`
  - `swiss`
  - `single_elimination`
- `status`
  - `draft`
  - `registration_open`
  - `registration_grace`
  - `round_in_progress`
  - `between_rounds`
  - `completed`
  - `cancelled`
- `visibility`
  - `public`
  - `unlisted`
- `capacity`
  - max `64`
- `scheduledStartAt`
- `registrationClosesAt`
- `checkInRequired`
- `gracePeriodMinutes`
- `configuredRoundCount`
- `currentRoundNumber`
- `ranked`
- `platformManaged`
- `standardizedSeriesId`
- `reminderPolicy`
- `roomConfigurationSnapshot`
- `rulesSnapshot`
- `createdAt`
- `updatedAt`
- `completedAt`

Important:

- `roomConfigurationSnapshot` must copy the league settings at creation time
- this avoids tournaments changing behavior if the league is edited later

#### 3. TournamentEntrant

Tracks preregistration, check-in, tournament record, and placement.

Fields:

- `id`
- `tournamentId`
- `userId`
- `username`
- `deckLockState`
- `registrationState`
  - `registered`
  - `checked_in`
  - `dropped`
  - `eliminated`
  - `disqualified`
- `seed`
- `wins`
- `losses`
- `draws`
- `matchPoints`
- `opponentMatchWinRate`
- `gameWinRate`
- `opponentGameWinRate`
- `receivedByeCount`
- `finalPlacement`
- `joinedAt`
- `checkedInAt`
- `droppedAt`

#### 4. TournamentRound

Fields:

- `id`
- `tournamentId`
- `roundNumber`
- `status`
  - `pending`
  - `active`
  - `complete`
- `pairingMethod`
  - `swiss`
  - `single_elimination`
  - `bye_adjustment`
- `startedAt`
- `completedAt`

#### 5. TournamentMatch

Fields:

- `id`
- `tournamentId`
- `roundId`
- `tableNumber`
- `playerAEntrantId`
- `playerBEntrantId`
- `playerAUserId`
- `playerBUserId`
- `playerAUsername`
- `playerBUsername`
- `result`
  - `pending`
  - `player_a_win`
  - `player_b_win`
  - `draw`
  - `bye`
  - `forfeit_a`
  - `forfeit_b`
  - `double_forfeit`
- `winnerEntrantId`
- `reportedBy`
- `confirmedBy`
- `roomId`
- `roomPort`
- `duelReplayId`
- `startedAt`
- `completedAt`

#### 6. TournamentReminder

Stores scheduled reminder jobs per tournament.

Fields:

- `id`
- `tournamentId`
- `offsetMinutes`
- `scheduledFor`
- `channel`
  - `email`
  - `in_app`
- `status`
  - `pending`
  - `sent`
  - `cancelled`
  - `failed`
- `sentAt`
- `error`

#### 7. TournamentRating

Separate Elo system for tournaments only.

Fields:

- `id`
- `userId`
- `leagueId`
- `rating`
- `provisionalGames`
- `wins`
- `losses`
- `draws`
- `byes`
- `lastMatchAt`
- `updatedAt`

#### 8. StandardizedTournamentSeries

Defines recurring top-of-the-hour tournaments.

Fields:

- `id`
- `leagueId`
- `name`
- `active`
- `schedule`
- `capacity`
- `format`
- `configuredRoundCount`
- `gracePeriodMinutes`
- `reminderPolicy`
- `ranked`
- `createdAt`
- `updatedAt`

#### 9. Planned Post-V1 Extensions

The existing core models should be extended for later releases instead of introducing a separate tournament subsystem.

V2 additions:

- `Tournament.format` expands to include `double_elimination`, `team_swiss`, and `team_single_elimination`
- `TournamentRound` gains bracket metadata such as `stage`, `bracketSide`, `displayOrder`, and `sourceRoundNumber`
- `TournamentMatch` gains bracket-link metadata such as `winnerNextMatchId`, `loserNextMatchId`, `sourceMatchAId`, `sourceMatchBId`, `placementMatch`, `isGrandFinalReset`, `featuredBroadcastSlot`, and optional team board metadata
- add `TournamentTeam` for roster ownership, captain, invite state, check-in state, and aggregate team record
- add `TournamentTeamMember` for roster membership, board order, substitute state, and invitation acceptance
- add `TournamentBroadcastAsset` or equivalent record for featured matches, stream URLs, hero media, recap embeds, and public copy
- add `TournamentModerationCase` or equivalent record for disputes, freezes, no-shows, and staff notes
- add `TournamentCalendarSubscription` or equivalent feed-token record for personal ICS links and feed revocation

V3 additions:

- add `TournamentPayment` for entry-fee charge state, refunds, waivers, and Stripe references
- add `TournamentPrizePackage` for placement-to-prize mapping, cash vs physical breakdown, and fulfillment requirements
- add `TournamentFulfillmentOrder` for drop-ship vendor order ids, address collection, tracking, and retry state
- add `TournamentPayout` for winner payout method, approval state, provider references, and delivery status

### High-Level State Machine

Tournament lifecycle:

1. `draft`
2. `registration_open`
3. `registration_grace`
4. `round_in_progress`
5. `between_rounds`
6. `completed`

Transition rules:

- creator publishes draft -> `registration_open`
- clock hits start time -> `registration_grace`
- grace expires -> create round 1 and start `round_in_progress`
- all matches complete -> `between_rounds`
- if more rounds remain -> next round and `round_in_progress`
- if no rounds remain or bracket winner determined -> `completed`

Special transitions:

- tournament may be `cancelled` before first round
- player may `drop` at any point
- disqualifications may force match rewrites before round closure

### Rules and Constraints

#### One Tournament Per Player

Each player may own only one active tournament at a time.

Definition of active for ownership lock:

- `draft`
- `registration_open`
- `registration_grace`
- `round_in_progress`
- `between_rounds`

Not active:

- `completed`
- `cancelled`

#### Capacity

- minimum capacity should be at least `4`
- maximum capacity must be `64`

#### Registration

- players may preregister before the start time
- if check-in is enabled, preregistered players must check in during the grace window
- if check-in is disabled, preregistered players auto-convert to active entrants when registration closes

#### Start Time

At `scheduledStartAt`:

- registration stops accepting new entries unless still inside grace
- reminder / alert messages fire
- grace countdown begins

At grace expiry:

- final entrant list locks
- pairings are generated
- players are notified

### Pairing and Round Logic

#### Swiss

Swiss behavior for v1:

- fixed number of rounds determined at tournament creation
- pair players with similar match points
- avoid repeat pairings if possible
- assign a bye to the lowest-priority eligible player when odd
- bye counts as a win and match points award
- a player should not receive more than one bye unless unavoidable

Swiss round count recommendation:

- allow manual override
- if no override, default:
  - 4-8 players: 3 rounds
  - 9-16 players: 4 rounds
  - 17-32 players: 5 rounds
  - 33-64 players: 6 rounds

#### Single Elimination

Single elimination behavior:

- bracket size expands to next power of two
- byes fill the bracket when the field is short
- only winners advance
- when oddities occur due to drops, coordinator resolves automatic advancement

#### Bye Rules

Bye selection priority for swiss:

1. active checked-in entrant only
2. entrant with no prior byes
3. lowest match points first
4. lowest tie-breaker rank
5. deterministic fallback by entrant id

Bye result handling:

- counts as a match win
- does not launch a duel room
- should still trigger round completion checks

### Match Execution Flow

For each active tournament match:

1. coordinator creates or reserves a duel room using the tournament's room configuration snapshot
2. both players receive:
   - in-app alert
   - websocket event
   - tournament page refresh state
3. player clicks `Join Match`
4. server verifies:
   - player belongs to this match
   - match is still pending
   - tournament round is active
5. player is routed into the duel room
6. duel completes
7. result is recorded server-side
8. standings update
9. if all matches finished, round closes

Important:

The tournament system should not trust manual client-side result submission as the primary result source when duel automation already knows outcomes. Prefer duel result ingestion from the duel server. Manual reporting should exist only as fallback / admin override.

### League System

Leagues are critical because they define standardized room behavior.

Each league should define:

- OCG / TCG / mixed card pool
- banlist mode:
  - modern rolling
  - locked historical list
  - special format list
- duel mode defaults:
  - single or match
  - automatic or manual
  - starting LP
  - starting hand
  - draw count
  - shuffle
  - card pool
- whether tournament Elo updates apply

Implementation rule:

Tournaments do not independently define full duel settings. They select a league, then optionally choose only allowed overrides. This prevents arbitrary tournament hosts from creating inconsistent ranked environments.

### Alerts and Notifications

#### In-App Alerts

Needed alert types:

- preregistration confirmed
- check-in open
- tournament starts soon
- round started
- opponent assigned
- match ready
- round about to close
- tournament completed

Delivery path:

- websocket event from central server
- persisted unread alerts if user is offline

#### Email Reminders

Reminder settings:

- 24 hours
- 4 hours
- 30 minutes
- user-selectable per tournament

System behavior:

- create reminder jobs on tournament creation
- cancel and recreate if start time changes
- skip already-sent reminders

Email contents:

- tournament name
- start time in user timezone if known
- league
- format
- registration/check-in instructions
- direct link to tournament page

### Standardized Top-of-Hour Tournaments

This is a separate subsystem layered on the same tournament engine.

Behavior:

- at each hour boundary, scheduler creates tournaments from active series definitions
- tournaments are platform-managed
- they use locked league configurations
- they affect standardized tournament rankings

Implementation model:

- `StandardizedTournamentSeries` defines recurrence and defaults
- scheduler materializes a `Tournament` instance at each hour
- these tournaments are clearly marked `platformManaged = true`

Examples:

- hourly TCG modern swiss 16-player cup
- hourly OCG modern swiss 16-player cup
- hourly goat single-elim 8-player cup

### Ranking and Tournament Elo

Tournament Elo must be separate from the current duel/ranked ladder if that ladder exists.

Recommended behavior:

- update only on tournament match completion
- bucket by league
- byes do not change Elo
- draws apply reduced Elo movement
- provisional state for first N matches

Leaderboard options:

- global tournament rating
- per-league tournament rating
- seasonal ranking later

Store match history for audit:

- pre-match rating
- post-match rating
- expected score
- actual score
- K-factor

### API Plan

These routes are examples. They should be added in the same server style already used by the repo.

#### Public / Authenticated Reads

- `GET /api/tournaments`
- `GET /api/tournaments/:slug`
- `GET /api/tournaments/calendar`
- `GET /api/tournaments/my-owned`
- `GET /api/tournaments/my-registrations`
- `GET /api/leagues`
- `GET /api/leagues/:slug`
- `GET /api/tournament-rankings`

#### Owner Actions

- `POST /api/tournaments`
- `PATCH /api/tournaments/:id`

#### Entrant Actions

- `POST /api/tournaments/:id/register`
- `POST /api/tournaments/:id/unregister`
- `POST /api/tournaments/:id/check-in`
- `POST /api/tournaments/:id/drop`
- `POST /api/tournaments/:id/matches/:matchId/join`

#### Admin Actions

- `POST /api/tournaments/:id/force-start`
- `POST /api/tournaments/:id/repair-round`
- `POST /api/tournaments/:id/matches/:matchId/override-result`
- `POST /api/tournaments/:id/entrants/:entrantId/disqualify`
- `POST /api/tournaments/:id/recalculate-standings`

### Websocket Event Plan

Define tournament websocket events at the central server layer.

Examples:

- `tournament_created`
- `tournament_updated`
- `tournament_registration_open`
- `tournament_checkin_open`
- `tournament_started`
- `tournament_round_started`
- `tournament_match_ready`
- `tournament_match_completed`
- `tournament_round_completed`
- `tournament_completed`
- `tournament_alert`

These should be pushed only to relevant audiences:

- tournament owner
- registered entrants
- public listeners on tournament page if needed

### Scheduler / Background Jobs

At minimum, introduce a tournament scheduler loop or cron-backed job runner.

Jobs required:

1. Tournament start monitor
   - opens grace window at scheduled start

2. Registration close / check-in finalize
   - locks entrant list
   - removes unchecked users if check-in required
   - creates round 1

3. Reminder sender
   - sends 24h / 4h / 30m reminders

4. Standardized tournament materializer
   - creates top-of-hour tournaments

5. Round completion sweeper
   - closes rounds if all matches completed
   - creates next round if appropriate

6. Abandoned match monitor
   - detects stuck match states and escalates for admin resolution

### Integration With Duel Infrastructure

Tournament matches should reuse the current duel room infrastructure rather than bypassing it.

Integration points:

- league config produces room settings
- match join creates or reuses a room assignment
- result ingestion listens to duel completion signals
- replay / log references should be stored back on the tournament match

Needed bridge logic:

1. tournament match requests duel room
2. duel room stores `tournamentId`, `roundId`, `matchId`
3. duel result callback maps back to tournament match
4. coordinator finalizes match and round state

### Admin and Moderation Requirements

Needed controls:

- cancel tournament
- force close registration
- disqualify player
- mark no-show
- override match result
- issue bye manually
- rerun pairing for current round before activation
- freeze tournament for investigation

Audit log should record:

- actor
- action
- affected tournament / round / match / entrant
- previous state
- new state
- timestamp

V2 should expand these point controls into staff dashboards with:

- active tournaments requiring intervention
- disputed or contradictory result queue
- stalled or over-time match queue
- frozen tournaments under investigation
- manual bracket edit timeline with reason codes
- entrant disciplinary history and sanction notes
- audit-log search, filtering, and export

### Failure Cases

The plan must explicitly handle:

- owner disconnects after creating tournament
- player registers but never checks in
- player disconnects before joining assigned match
- duel room crashes mid-match
- both players claim opposite results
- round has one stuck match far beyond expected time
- league config changes after tournament creation
- reminder email job fails
- standardized tournament creation fails at the hour boundary

Recommended policy:

- preserve immutable snapshots for tournament config
- use admin resolution for unresolved or contradictory match results
- never auto-delete active tournaments on server restarts

### Data Integrity Rules

- one active tournament ownership lock per player
- entrant uniqueness per tournament by `userId`
- round numbers unique per tournament
- table numbers unique per round
- only one active match result per match
- no new registration after entrant lock
- byes are explicit match records, not hidden math
- Elo updates are idempotent and tied to match finalization

### Phased Implementation Plan

This section tracks the remaining tournament hardening and expansion work after the first release. Phase numbers retain their original labels so older notes and commits still line up.

#### Phase 2: Tournament API Hardening

Goal:

- harden the shipped tournament API surface

Tasks:

1. Add validation coverage to remaining weak endpoints.
2. Tighten auth and role enforcement consistency.
3. Normalize response serializers across tournament routes.

Definition of done:

- tournament APIs enforce consistent validation, auth, and response shapes

#### Phase 4: Coordinator State Machine

Goal:

- automate start, lock, and round activation

Tasks:

1. Add tournament status machine.
2. Add websocket notifications for state changes.

Definition of done:

- tournaments automatically move from registration to active round 1

#### Phase 5: Swiss Pairing Engine

Goal:

- produce valid swiss rounds with byes

Tasks:

1. Implement match-point standings calculation.
2. Implement bye selection rule.
3. Add round creation tests for 4-64 entrants.

Definition of done:

- swiss tournaments generate correct rounds and byes

#### Phase 6: Single Elimination Engine

Goal:

- generate bracket rounds and auto-advance winners

Tasks:

1. Implement bracket seeding.
2. Implement power-of-two bracket expansion.
3. Implement bye placement.
4. Handle drops and forfeits.

Definition of done:

- single-elimination tournaments can run to completion

#### Phase 7: Duel Match Integration

Goal:

- connect tournament matches to actual duel sessions

Tasks:

1. Add tournament metadata to room creation.
2. Add duel-complete callback into tournament match finalization.
3. Persist replay and room references.
4. Prevent non-participants from joining tournament match rooms as players.

Definition of done:

- tournament pairings can be played end to end inside the current duel system

#### Phase 8: Round Completion and Advancement

Goal:

- close rounds automatically and create the next one

Tasks:

1. Add match completion observer.

Definition of done:

- tournaments progress automatically without manual bracket edits

#### Phase 9: Alerts and Reminder Emails

Goal:

- notify users before and during tournaments

Tasks:

1. Add email templates.
2. Add round-start websocket alerts.
3. Add "match ready" alerts.

Definition of done:

- users receive reminders and round start notifications

#### Phase 11: Standardized Top-of-Hour Tournaments

Goal:

- run platform-managed recurring events

Tasks:

1. Add standardized tournament series model.
2. Add hourly materializer job.
3. Add platform-owned tournament creation flow.
4. Lock configuration to league defaults.
5. Mark these tournaments as ranked and standardized.

Definition of done:

- top-of-hour tournaments appear automatically and run on the same coordinator

#### Phase 12: Admin Repair Tools

Goal:

- make the system operable under real failures

Tasks:

1. Add admin endpoints for:
   - force start
   - override result
   - disqualify
   - cancel tournament
   - regenerate current round before activation
2. Add audit views.
3. Add failure dashboards later if needed.

Definition of done:

- admins can recover broken tournaments without direct DB edits

#### Phase 13: Double Elimination Engine

Goal:

- add solo double-elimination tournaments on top of the current coordinator

Tasks:

1. Extend tournament format support with `double_elimination`.
2. Add winners-bracket and losers-bracket match-link metadata.
3. Add loss routing from winners bracket into losers bracket.
4. Add second-loss elimination tracking.
5. Add grand-final reset handling when the undefeated finalist loses once.
6. Add bracket rendering and current-life-count display on tournament detail pages.
7. Add tests covering 4-32 entrant bracket generation, advancement, byes, and reset finals.

Definition of done:

- double-elimination tournaments can run end to end without manual DB intervention

#### Phase 14: Team Tournament Foundations

Goal:

- support fixed-roster team tournaments using the existing tournament runtime as the authority

Tasks:

1. Add team and team-member persistence models.
2. Add captain-led roster creation, invite, accept, and lineup-lock flows.
3. Add team registration, check-in, drop, and disqualification flows.
4. Add board-order-aware team pairings and per-board result aggregation.
5. Add team standings and team bracket views.
6. Limit the first pass to fixed-size rosters and no roster edits after round 1 starts.
7. Add tests for roster integrity, team pairing generation, and team-result aggregation.

Definition of done:

- team tournaments can be created, filled, paired, and completed through supported team formats

#### Phase 15: Manual Bracket Editing On The Existing API

Goal:

- add controlled bracket repair and editing without introducing a second bracket system

Tasks:

1. Add API endpoints for reseeding, swapping pairings, replacing byes, reopening matches, and manual advancement.
2. Keep all edits on top of the existing v1 tournament API, storage, and audit log.
3. Add bracket-state snapshotting before every destructive edit.
4. Require actor, reason code, and affected object references for each edit.
5. Restrict downstream bracket regeneration to safe windows or explicit staff override flows.
6. Surface bracket-edit history in tournament detail and staff tooling.

Definition of done:

- staff can repair or adjust brackets through audited API actions instead of direct data edits

#### Phase 16: Public Broadcast And Landing Pages

Goal:

- turn tournaments into public-facing event pages with richer spectator surfaces

Tasks:

1. Add public landing-page content blocks for hero media, long-form copy, sponsor slots, FAQ, and recap embeds.
2. Separate public marketing layout from authenticated entrant and owner controls.
3. Add tournament broadcast state for featured table, stream URL, round headline, and replay/highlight links.
4. Add a public live-status wall showing active matches, featured table, bracket or standings, and round countdown.
5. Add share metadata and richer public presentation for `/tournaments/[slug]`.
6. Keep direct duel-room spectator permissions unchanged unless explicitly enabled by broadcast policy.

Definition of done:

- tournament pages can serve both as public event destinations and as richer spectator hubs

#### Phase 17: Staff Dashboards And External Calendar Sync

Goal:

- improve tournament operations and public discoverability around the shipped core system

Tasks:

1. Add staff dashboard views for active incidents, disputed results, stalled matches, and frozen tournaments.
2. Add audit-log search, entrant history, and moderation notes in one staff surface.
3. Add per-tournament ICS export and Google/Outlook add-to-calendar links.
4. Add per-league and personal "my tournaments" ICS feeds with revocable feed tokens.
5. Keep calendar sync one-way in v2 so the product remains the authoritative editor.

Definition of done:

- staff can operate tournaments from dashboard queues and users can subscribe to one-way external calendar feeds

#### Phase 18: Paid Entry And Prize Ledger

Goal:

- add paid tournaments and structured prize definitions

Tasks:

1. Add optional entry-fee configuration, currency, refund policy, and registration payment requirements to tournaments.
2. Add Stripe checkout or payment-session creation plus webhook-driven payment reconciliation.
3. Add payment, refund, waiver, and settlement records tied to tournament registration.
4. Add structured prize definitions by placement instead of freeform text.
5. Prevent paid registration from completing until payment clears or an approved waiver exists.
6. Add support tooling for refunds, failed payments, and registration/payment mismatch recovery.

Definition of done:

- paid tournaments can collect entry fees and store a structured prize ledger safely

#### Phase 19: Physical Prize Fulfillment And Payout Rails

Goal:

- deliver physical and cash-equivalent prizes after results are finalized

Tasks:

1. Add drop-shipping vendor integration for physical prizes, vendor order submission, and tracking updates.
2. Add address collection and fulfillment-state tracking tied to final placements.
3. Add payout preference storage with first-class support for PayPal and Cash App plus room for additional common services.
4. Add payout approval, retry, and failure handling with staff review before final disbursement.
5. Keep prize claims, fulfillment, and payouts idempotent and fully audited.
6. Add compliance and support checkpoints for refunds, disputes, and tax-sensitive payouts.

Definition of done:

- tournament prizes can be fulfilled through drop shipping or paid out through supported payout rails without manual spreadsheet tracking

### Suggested Test Plan

#### Unit Tests

- bye assignment
- swiss pairing without repeats
- swiss pairing with forced repeats
- single-elimination bracket generation
- double-elimination bracket generation and losers-bracket routing
- grand-final reset progression
- team result aggregation and lineup validation
- bracket-edit snapshot and rollback safety
- standings and tie-breakers
- tournament ownership lock
- reminder schedule generation
- Elo calculation
- payment state reconciliation
- payout idempotency

#### Integration Tests

- create -> register -> check-in -> round 1 -> complete
- odd player swiss with bye
- odd player elimination with bye
- double-elimination tournament through reset finals
- team tournament registration -> lineup lock -> round resolution
- late registration during grace
- no-show removal after check-in deadline
- duel result ingestion updates match record
- round auto-advances
- standardized tournament auto-creation at hour boundary
- manual bracket edit -> audit trail -> repaired advancement
- external calendar feed generation and revocation
- paid registration -> refund -> prize finalization flow

#### UI Tests

- calendar rendering
- create tournament form validation
- registration button state changes
- check-in state changes
- match join button visibility
- standings update after round completion
- public landing-page rendering with rich media blocks
- featured-match or broadcast wall updates
- staff dashboard queue actions
- paid-entry registration and payment-state messaging

### Open Decisions For Post-V1 Releases

These are the main product and operational decisions still to settle for v2 and v3:

1. Whether the first double-elimination release should stay capped below the current 64-player maximum.

2. Which team format ships first:
   - team swiss
   - team single elimination
   - both in the same release

3. Whether manual bracket editing is staff-only or partially available to tournament owners before a round goes live.

4. What public broadcast delay policy should apply for featured matches and live bracket updates.

5. Whether rich landing-page content is authored through CMS content blocks, tournament-owner uploads, or a hybrid workflow.

6. Whether external calendar sync should include only public tournaments or also authenticated personal feeds by default.

7. Whether paid tournaments are platform-owned only at launch or also available to trusted user hosts.

8. Which payout methods beyond PayPal and Cash App should be enabled in the first v3 launch set.

### Recommended Decisions For Next Releases

To reduce ambiguity in the next implementation waves, use these defaults:

- double elimination: ship solo brackets first and allow the field-size cap to stay below 64 if UI or recovery complexity demands it
- team tournaments: start with fixed-size rosters, one captain, and no roster edits after round 1 begins
- bracket editing: keep full edit powers staff-only first, with limited owner edits only before activation if needed later
- broadcast: ship featured-table metadata and public match-status walls before revisiting direct spectator-room permissions
- landing pages: keep tournament runtime data in the API and author hero media or rich copy through CMS-backed content blocks
- calendar sync: make v2 one-way export only through ICS feeds and add-to-calendar links
- payments: make Stripe webhooks authoritative for paid-registration state and require refund tooling in the first paid release
- payouts: support PayPal and Cash App first behind a shared payout abstraction and staff approval queue

### Deliverables Summary

The tournament program now includes a shipped v1 core with:

- tournament data models and API routes
- tournament scheduler jobs and state-machine progression
- tournament calendar, create, and detail pages
- tournament Elo and alert foundations
- platform-managed top-of-hour tournament series

The next deliverables should add:

- double-elimination bracket support
- fixed-roster team tournament support
- audited manual bracket editing on the existing API
- richer public landing pages and spectator broadcast surfaces
- staff moderation dashboards and external calendar feeds
- paid entry, structured prizing, and Stripe-backed payment flows
- drop-shipping fulfillment and payout integrations for winners

This document should be treated as the execution source for future AI implementation work.

### YGOPro Select Chain Parity Plan

Source label: `ygopro-select-chain-parity-plan.md`

### Verified Against

- `edopro/gframe/duelclient.cpp`
- `edopro/gframe/event_handler.cpp`
- `edopro/gframe/game.cpp`
- `edopro/gframe/game.h`
- `edopro/gframe/game_config.inl`
- `server/core/core/controller_core.js`
- `server/core/core/controller_automatic.js`
- `server/ui/components/duel/duel.component.jsx`
- `server/ui/components/duel/extracontrols.component.jsx`
- `server/ui/services/game.service.js`
- `server/ui/components/duel/chain.component.jsx`
- `server/ui/components/screens/profile.component.jsx`
- `server/ui/services/storage.service.js`

### Summary

Bring `/ygopro` `MSG_SELECT_CHAIN` behavior into parity with EDOPro.

The main gap is not packet parsing. The web stack already receives the fields it needs:

- `count`
- `specount`
- `forced`
- `select_trigger`
- normalized chain choices

The parity gap is client policy and client controls.

EDOPro makes chain auto-response decisions from a combination of:

- live duel chain mode buttons
- persisted chain settings exposed in the duel UI
- the current `MSG_SELECT_CHAIN` payload

`/ygopro` currently hardcodes only two shortcuts:

- auto-decline if `!select_trigger && !forced && (!count || !specount)`
- auto-pick the first choice if `forced`

That is much simpler than EDOPro and is the reason the browser cannot currently match the desktop client's chain behavior.

### EDOPro Reference Contract

#### 1. `MSG_SELECT_CHAIN` builds local chain state first

In `edopro/gframe/duelclient.cpp:2115-2206`, EDOPro:

- reads `count`, `specount`, and `chain_forced`
- derives `select_trigger` from `specount == 0x7f`
- builds `activatable_cards`
- builds `activatable_descs`
- marks pile activity flags for:
  - `LOCATION_DECK`
  - `LOCATION_GRAVE`
  - `LOCATION_REMOVED`
  - `LOCATION_EXTRA`
- switches to panel mode if any choice is in `LOCATION_OVERLAY`

Parity implication:

- the browser does not need a new server message for chain policy
- the current normalized chain payload is already sufficient
- overlay chain targets are a UI mode decision, not a protocol gap

#### 2. EDOPro chain auto-response is controlled by live duel mode

EDOPro keeps three live chain mode booleans in `edopro/gframe/game.h:683-685`:

- `ignore_chain`
- `always_chain`
- `chain_when_avail`

Those booleans are updated by `edopro/gframe/event_handler.cpp`:

- mouse:
  - left mouse down sets `always_chain` at `1673-1680`
  - right mouse down sets `ignore_chain` at `1682-1689`
- keyboard:
  - `A` drives `always_chain` at `1698-1704`
  - `S` drives `ignore_chain` at `1707-1713`
  - `D` drives `chain_when_avail` at `1716-1722`
- buttons:
  - `BUTTON_CHAIN_ALWAYS`
  - `BUTTON_CHAIN_IGNORE`
  - `BUTTON_CHAIN_WHENAVAIL`
  - wired in `event_handler.cpp:1676-1688`

The visible duel buttons themselves are created in `edopro/gframe/game.cpp:859-870` and refreshed by `UpdateChainButtons()` in `edopro/gframe/event_handler.cpp:2705-2722`.

Parity implication:

- EDOPro chain behavior is not only a static settings question
- the player can change chain policy during the duel without opening settings

#### 3. EDOPro also has persisted chain-related settings

`edopro/gframe/game_config.inl` defines these stored flags:

- `chkAutoChain` -> config key `autochain` at line `54`
- `chkWaitChain` -> config key `waitchain` at line `55`
- `chkHideHintButton` -> config key `hide_hint_button` at line `59`

They are exposed in settings UI in `edopro/gframe/game.cpp`:

- `chkAutoChainOrder` at `1543-1545` and `1732-1734`
- `chkNoChainDelay` at `1583-1585` and `1756-1758`
- `chkHideChainButtons` at `1540-1542` and `1729-1731`

They are persisted back in `edopro/gframe/game.cpp:2594-2599`.

Behaviorally:

- `chkAutoChainOrder`
  - auto-picks the first valid response for forced chain selection
  - auto-answers `MSG_SORT_CHAIN`
- `chkNoChainDelay`
  - affects the auto-decline timing path in `MSG_SELECT_CHAIN`
- `chkHideChainButtons`
  - hides the live duel chain mode buttons
  - does not remove the underlying policy logic

Parity implication:

- these settings are not just abstract stored preferences
- EDOPro exposes them from the in-duel UI, so `/ygopro` needs an equivalent control surface on the `/ygopro` page itself
- a profile-only or settings-route-only implementation would still miss the parity target

#### 4. EDOPro `MSG_SELECT_CHAIN` decision table

In `edopro/gframe/duelclient.cpp:2183-2200`, the policy is:

- read current live mode:
  - `ignore_chain`
  - `always_chain`
  - `chain_when_avail`
- auto-decline with response `-1` when all of these are true:
  - not `select_trigger`
  - not `chain_forced`
  - `ignore_chain || ((count == 0 || specount == 0) && !always_chain)`
  - `count == 0 || !chain_when_avail`
- if that auto-decline path is taken:
  - clear chain selection state
  - optionally wait `20` frames when `chkNoChainDelay` is checked and `ignore_chain` is false
  - send the response immediately
- auto-pick response `0` when all of these are true:
  - `chkAutoChainOrder` is checked
  - `chain_forced` is true
  - `always_chain` is false
  - `chain_when_avail` is false

Separate but related:

- `MSG_SORT_CHAIN` auto-answers in `edopro/gframe/duelclient.cpp:2498-2502` when `chkAutoChainOrder` is checked

Parity implication:

- `/ygopro` should stop hardcoding chain auto-response directly inside one `switch` case
- it should use the same input table EDOPro uses

#### 5. EDOPro only opens manual UI when the policy says "manual"

If the question is not auto-answered, EDOPro does one of two things:

- overlay choice exists:
  - enter chain panel mode at `duelclient.cpp:2208-2215`
- normal choice:
  - show a query popup at `duelclient.cpp:2216-2224`
  - prompt text varies for:
    - no available chain
    - trigger-selection chain
    - normal chain prompt

The query buttons then map to responses in `edopro/gframe/event_handler.cpp:229-266`:

- `Yes` opens manual chain selection when appropriate
- `No` sends `-1`

### Current `/ygopro` Divergence

#### 1. Chain auto-response is oversimplified

In `server/ui/services/game.service.js:1635-1648`, `/ygopro` currently does only this:

- auto-decline if `!select_trigger && !forced && (!count || !specount)`
- auto-pick index `0` if `forced`
- otherwise open the chain dialog

Missing inputs:

- `ignore_chain`
- `always_chain`
- `chain_when_avail`
- `autochain`
- `waitchain`
- `hide_hint_button`

#### 2. There is no duel-scoped chain mode UI

The current web duel UI has no equivalent to:

- `btnChainIgnore`
- `btnChainAlways`
- `btnChainWhenAvail`

So the user cannot change chain behavior on the fly the way EDOPro allows.

#### 3. The web settings store has no chain preferences yet

Current web settings are sourced from:

- `server/ui/services/storage.service.js`
- `server/ui/components/screens/profile.component.jsx`

They currently cover:

- theme
- cover
- image URL
- `hide_banlist`
- `playassist`
- `bluff`

There is no chain-specific stored preference.

Important note:

- `playassist` exists, but it is not currently wired into chain handling
- do not overload `playassist` to mean EDOPro-style chain policy

#### 4. The `/ygopro` duel page has no checkbox surface for these settings

The current automatic duel-side control area is `server/ui/components/duel/extracontrols.component.jsx`.

Today it renders only:

- `Surrender`

That means `/ygopro` currently has no in-duel equivalent for the EDOPro quick-settings checkboxes that matter for chain behavior, such as:

- Hide Chain Buttons
- Automatic Chain Link order
- Add a delay even when no response

Parity implication:

- these toggles must be reachable from the duel page itself
- they should not require leaving the duel to visit `/settings` or `/profile`

#### 5. `MSG_SORT_CHAIN` parity is missing

The web client handles `MSG_SORT_CHAIN` as a regular sort question in `server/ui/services/game.service.js:1620-1624`.

It does not implement EDOPro's `chkAutoChainOrder` auto-answer path.

#### 6. Most of the required protocol data already exists

`server/core/core/controller_core.js` already forwards:

- `count`
- `specount`
- `select_trigger`

`server/core/core/controller_automatic.js` already normalizes chain prompt context and choice data.

Parity implication:

- this should be implemented mostly as a web UI and web state-management slice
- it does not need a new ocgcore message format

### Implementation Plan

#### 1. Add stored chain settings and expose them on the `/ygopro` page

Target files:

- `server/ui/components/duel/duel.component.jsx`
- `server/ui/components/duel/extracontrols.component.jsx`
- `server/ui/services/storage.service.js`
- `server/ui/components/screens/profile.component.jsx`

Add defaults and persistence for:

- `autochain`
- `waitchain`
- `hide_hint_button`

Implementation notes:

- match the EDOPro config keys where possible
- the primary parity surface is the duel page, not the standalone settings route
- render in-duel checkboxes on `/ygopro`, most likely in or adjacent to `extracontrols`
- the separate settings/profile screens can mirror the same values, but they are not sufficient by themselves
- use EDOPro-facing labels on the duel page for the three chain-related checkboxes:
  - `Hide Chain Buttons`
  - `Automatic Chain Link Order`
  - `Add a delay even when no response`
- keep them in both local storage and profile settings, the same way current user settings are handled
- do not reuse `playassist`

Expected outcome:

- the browser has persistent user preferences that can participate in chain policy
- those preferences are directly controllable from the active duel page

#### 2. Introduce duel-scoped chain mode state

Target files:

- `server/ui/services/game.service.js`
- the duel UI component that owns the action-row/header control area

Add a duel-local state model for:

- `ignore`
- `always`
- `when_available`
- neutral/default

Behavior requirements:

- reset on duel start and duel end
- independent from stored profile settings
- available before the next `MSG_SELECT_CHAIN` arrives

This state is the web equivalent of:

- `ignore_chain`
- `always_chain`
- `chain_when_avail`

#### 3. Add visible chain mode controls to the duel UI

Target files:

- duel action-row component
- related duel styling files

Add three push-button controls equivalent to EDOPro:

- `Ignore`
- `Always`
- `When Available`

Display rules:

- hide them when `hide_hint_button` is true
- otherwise keep them visible during the duel, not only while a chain question is active
- place them on the `/ygopro` duel page near the other duel-side controls, not only inside the standalone settings screens

Implementation note:

- keyboard parity for `A`, `S`, and `D` should be included in the plan, but it can be a second pass after the visible button path is stable
- mouse-hold parity can be deferred if needed

#### 4. Replace the hardcoded `MSG_SELECT_CHAIN` shortcut with a dedicated chain-policy helper

Target files:

- `server/ui/services/game.service.js`
- optionally a new helper module under `server/ui/services/`

Create one helper that takes:

- `count`
- `specount`
- `forced`
- `select_trigger`
- duel-scoped chain mode
- stored settings

Return one of:

- `decline`
- `accept-first`
- `manual`

The helper should mirror the EDOPro formula from `duelclient.cpp:2186-2200`.

Important details:

- preserve `select_trigger` semantics
- preserve the `count == 0 || specount == 0` branch
- preserve the `count == 0 || !chain_when_avail` branch
- only auto-pick `0` for forced chains when `autochain` is enabled and neither `always` nor `when_available` is active

Expected outcome:

- `/ygopro` stops having ad hoc chain auto-response behavior
- future fixes can adjust one policy function instead of scattering exceptions

#### 5. Implement the `waitchain` timing behavior explicitly

Target files:

- `server/ui/services/game.service.js`

When the policy says auto-decline:

- if the effective mode is `ignore`, answer immediately
- otherwise, if `waitchain` is enabled, wait briefly before sending the decline

The goal is behavioral parity with the current EDOPro path, not naming parity with the checkbox label.

Implementation note:

- this should be cancellable if the question is replaced before the timer fires
- the timer should be tracked with the active question `uuid`

#### 6. Keep the current chain dialog for manual cases, but make it policy-driven

Target files:

- `server/ui/components/duel/chain.component.jsx`
- `server/ui/services/game.service.js`

The current dialog can remain the manual response surface for the first implementation slice.

Required follow-ups:

- continue showing the prompt only when the chain-policy helper returns `manual`
- preserve the current choice-click and `No` response behavior
- verify that overlay-material chain targets still render in the card-list flow instead of any field-zone shortcut

This avoids a large dialog rewrite in the first parity slice.

#### 7. Add `MSG_SORT_CHAIN` parity under the same settings family

Target files:

- `server/ui/services/game.service.js`

When `autochain` is enabled:

- auto-answer `MSG_SORT_CHAIN` the same way EDOPro does

Do not treat this as a separate unrelated feature.

It is controlled by the same stored preference in EDOPro and should stay coupled in the web implementation.

#### 8. Keep server-side changes minimal unless a later gap appears

Current assessment:

- `controller_core.js` already provides the fields the browser needs
- `controller_automatic.js` already provides normalized chain choice data

So the first implementation pass should stay client-side unless testing proves that one specific chain-mode field is still missing.

### Test Plan

#### Unit: chain policy helper

Add pure decision-table tests for these cases:

- neutral mode, `count == 0`, non-forced -> decline
- neutral mode, `specount == 0`, non-forced -> decline
- `always` mode suppresses the ordinary auto-decline path
- `when_available` mode suppresses the `count > 0` auto-decline path
- `ignore` mode forces decline when EDOPro would
- forced chain with `autochain = true` and no overriding live mode -> accept index `0`
- forced chain with `always` or `when_available` active -> manual
- trigger-selection chain -> manual

#### Browser: `MSG_SELECT_CHAIN`

Add parity tests that assert:

- no stored settings, no live mode, no chain availability -> auto-decline
- `always` mode prevents the auto-decline that neutral mode would take
- `ignore` mode declines immediately
- `when_available` changes the `count > 0` path
- forced chain with `autochain` enabled auto-picks `0`
- forced chain with `autochain` disabled opens the manual UI
- hidden chain buttons still preserve the underlying policy state

#### Browser: `MSG_SORT_CHAIN`

Add tests for:

- `autochain = true` -> automatic answer
- `autochain = false` -> normal sort UI still appears

#### Browser: settings persistence

Add tests for:

- `autochain`, `waitchain`, and `hide_hint_button` round-trip through `getStorage()`
- profile save includes those keys
- local settings screen updates those keys correctly

#### Browser: `/ygopro` duel-page settings UI

Add tests for:

- the automatic duel page renders the three chain-related checkboxes in its duel-side controls
- toggling those checkboxes updates the active stored settings
- the live chain mode buttons react immediately to `hide_hint_button`
- changing the checkbox on `/ygopro` affects the next `MSG_SELECT_CHAIN` policy decision without requiring a full page reload

#### Manual validation

Validate these duel cases in `/ygopro`:

- ordinary optional chain window with no live mode override
- hold or toggle `Ignore`, then confirm optional chain windows auto-decline
- toggle `Always`, then confirm the same optional chain window is surfaced manually
- toggle `When Available`, then confirm chains still appear when activations exist
- forced chain with `autochain` enabled auto-picks the first option
- `MSG_SORT_CHAIN` is auto-answered when `autochain` is enabled
- hiding chain buttons removes the controls from the duel UI without breaking stored policy

### Execution Order

1. Add web storage keys and settings UI for `autochain`, `waitchain`, and `hide_hint_button`.
2. Add the same three settings as in-duel checkboxes on the `/ygopro` page, using the duel-side controls surface.
3. Add duel-scoped chain mode state and visible duel controls.
4. Extract the `MSG_SELECT_CHAIN` decision table into a dedicated helper and swap the current hardcoded logic over to it.
5. Add `waitchain` timing and question-safe timer cancellation.
6. Add `MSG_SORT_CHAIN` parity under the same setting.
7. Add parity tests and manual validation.

### Deferred

- perfect mouse-hold parity for left-click / right-click chain mode switching can wait until after the visible button path is stable
- a full visual clone of the EDOPro query dialog is not required for the first parity slice
- server-side protocol changes should stay deferred unless a concrete missing field appears during implementation

### YGOPro Pile Click Parity Plan

Source label: `ygopro-pile-click-parity-plan.md`

### Summary

Bring `/ygopro` pile clicks for `EXTRA`, `GRAVE`, and `BANISHED` into parity with the EDOPro interaction model.

Current break:

- `/ygopro` opens the viewer immediately when the user clicks one of those piles.
- Because the command menu is skipped, the user never sees the zone-level action buttons.
- The viewer then has no clean distinction between "show everything" and "show only cards that can be acted on", which is why Special Summon / Activate flow is broken and Extra Deck art can still appear incomplete.

### EDOPro Reference Contract

These files define the parity target:

- `edopro/gframe/duelclient.cpp`
  - `COMMAND_ACTIVATE` is assigned to activatable cards, including cards in `GRAVE`, `REMOVED`, and `EXTRA` at `1741-1747`, `1898-1904`, and `2169-2176`.
  - `COMMAND_SPSUMMON` is assigned to special-summonable cards at `1806-1816`.
- `edopro/gframe/event_handler.cpp:1270-1329`
  - During `MSG_SELECT_IDLECMD`, `MSG_SELECT_BATTLECMD`, and `MSG_SELECT_CHAIN`, clicking `GRAVE`, `REMOVED`, or `EXTRA` does not open the list directly.
  - EDOPro ORs the `cmdFlag` value across every card in that pile, forces `COMMAND_LIST`, sets `list_command = 1`, and then calls `ShowMenu(...)`.
- `edopro/gframe/event_handler.cpp:630-675`
  - Once a filtered pile list is open, clicking a card resolves the pending `COMMAND_SPSUMMON` or `COMMAND_ACTIVATE` response directly.
  - It does not open a second card-specific popup first.

Parity implication:

- Non-empty pile: always expose `View` / list behavior.
- Any pile with at least one activatable card: expose `Activate`.
- Any pile with at least one special-summonable card: expose `Special Summon`.
- The available buttons are determined by card flags in that pile, not hardcoded by zone.
- Choosing `View` shows the full pile.
- Choosing `Activate` or `Special Summon` shows only the matching subset.

### Current `/ygopro` Divergence

- `server/ui/components/duel/duel.component.jsx:57-63`
  - Clicking `EXTRA`, `GRAVE`, or `BANISHED` bypasses the control menu and immediately dispatches `OPEN_IDLE_EXTRA_VIEWER`.
- `server/ui/components/duel/controls.component.jsx`
  - Per-card idle actions exist, but there is no zone-level action builder for piles.
  - `getActionableDeck()` only decorates cards after the viewer is already open.
- `server/ui/components/duel/idle.extra.viewer.component.jsx`
  - The viewer can already render face-up art and already closes on backdrop click.
  - It has no distinction between "inspect this pile" and "select a card to activate / special summon".
  - Its click path still routes through `DECK_CARD_CLICK`, which opens another control popup instead of resolving the pile action.
- `server/core/core/controller_core.js`, `server/ui/services/game.service.js`, and `server/ui/components/duel/field.component.jsx`
  - Extra Deck ids are already hydrated at least once per idle via `duelQueryLocation(EXTRA)`.
  - That path should remain the source of truth for pile art rather than adding a disconnected client-side cache.

### Implementation Plan

#### 1. Replace direct pile-view opening with a pile control target

- Remove the direct `OPEN_IDLE_EXTRA_VIEWER` shortcut from `duel.component.jsx` for `EXTRA`, `GRAVE`, and `BANISHED`.
- Route those clicks through `controls.enable(...)` instead.
- Introduce a pile-target query shape that includes:
  - `pile: true`
  - `player`
  - `location`
  - `deck`
  - any precomputed pile action metadata needed by the control row
- Keep the existing overlay-material `View` action separate. That is a per-card overlay inspection path, not a pile click path.

#### 2. Add EDOPro-style pile action aggregation in `controls.component.jsx`

- Reuse the existing idle/battle/chain command arrays already stored in `controls.state`.
- Add helpers that scan a pile and answer:
  - does any card in this pile have a matching `Activate` option?
  - does any card in this pile have a matching `Special Summon` option?
- Render pile buttons from those helpers:
  - `View` for any non-empty pile
  - `Activate` if the pile contains at least one activatable card
  - `Special Summon` if the pile contains at least one special-summonable card
- Do not hardcode:
  - `EXTRA -> Special Summon only`
  - `GRAVE/BANISHED -> Activate only`
- EDOPro bases this on card flags, so `/ygopro` should do the same. In normal duels that still produces the expected common case: Extra Deck usually exposes `Special Summon`, while Graveyard and Banished often expose `Activate`.

#### 3. Split the viewer into explicit modes

- Keep using the current revealer-style window, but make its mode explicit:
  - `view`
  - `activate`
  - `spsummon`
- `view` mode:
  - show the full pile
  - cards are informational only
  - no second popup on click
- `activate` mode:
  - show only cards from the pile that match an activate option
  - clicking a card should resolve that activate response
- `spsummon` mode:
  - show only cards from the pile that match a special summon option
  - clicking a card should resolve that summon response
- Preserve backdrop-click close behavior.

#### 4. Resolve actionable viewer clicks directly

- Do not route actionable pile-view clicks back through the generic per-card popup.
- Add a helper that maps:
  - selected viewer card
  - desired action kind (`activate` or `spsummon`)
  - current question state
  - into the same outbound `CONTROL_CLICK` payload the per-card button would have used.
- This mirrors the EDOPro contract in `event_handler.cpp:630-675`, where the filtered list is the final chooser.

#### 5. Keep Extra Deck art tied to the field snapshot

- When a pile viewer opens, populate it from `field.getDeck(player, location)`, not from the clicked zone stub.
- Continue relying on the existing idle `duelQueryLocation(EXTRA)` hydration path for Extra Deck ids.
- Verify that the viewer consumes the hydrated pile objects after `game.service.js` merges the idle snapshot into the field.
- If Extra art is still incomplete after that refactor, add a follow-up slice that refreshes the Extra Deck snapshot when the user opens the pile viewer. Reuse the existing ocgcore query path instead of inventing a second protocol.

#### 6. Match EDOPro scope across question types

- Apply the same pile action logic during:
  - `MSG_SELECT_IDLECMD`
  - `MSG_SELECT_BATTLECMD`
  - `MSG_SELECT_CHAIN`
- Do not limit the fix to idle only. EDOPro uses the same pile aggregation pattern in all three cases.

### Test Matrix

- Extra Deck, idle:
  - clicking the pile opens a command row, not the viewer
  - `View` appears when the pile is non-empty
  - `Special Summon` appears when at least one Extra Deck card is summonable
  - choosing `View` opens the full pile with visible art
  - choosing `Special Summon` opens only summonable cards
  - clicking a card in summon mode sends the correct duel answer immediately
- Graveyard, idle:
  - clicking the pile opens the command row
  - `View` appears when non-empty
  - `Activate` appears when at least one card is activatable
  - if a graveyard card is actually special-summonable, `Special Summon` also appears
- Banished, idle:
  - same as Graveyard
- Battle / chain:
  - pile clicks use the same aggregated button logic
- Art:
  - Extra Deck viewer shows card faces when idle hydration data is present
  - Graveyard and Banished viewer continue showing known ids
- Regression:
  - overlay-material `View` still works
  - regular per-card buttons such as `Attack`, `Flip`, and `Activate` still work
  - clicking outside the viewer closes it

### Execution Order

1. Refactor pile clicks in `duel.component.jsx` so they open the action row instead of the viewer.
2. Add pile action aggregation and pile-specific buttons in `controls.component.jsx`.
3. Add viewer modes for full-pile inspect versus actionable filtered selection.
4. Resolve actionable viewer clicks directly to duel answers.
5. Add parity tests for `EXTRA`, `GRAVE`, and `BANISHED`.
6. Revisit Extra Deck art only if the existing idle hydration path is still insufficient after the UI flow matches EDOPro.

### Deferred

- `DECK` should stay out of this slice. EDOPro treats deck listing differently and does not expose it the same way in normal duel flow.
- Spectator and replay list behavior can remain view-only unless we explicitly target those modes later.

### YGOPro `MSG_HINT` Handling Plan

Source label: `ygopro-msg-hint-implementation-plan.md`

### Verified Behavior

This document captures the verified behavior of `MSG_HINT` in the local duel stack and the implementation plan for making `/ygopro` understand it.

Verified against:

- `server/ocgcore/src/messages.ts`
- `server/ocgcore/src/type_core.ts`
- `server/ocgcore/src/type_serialize.ts`
- `server/ocgcore/dist/index.js`
- `server/core/core/controller_core.js`
- `server/core/core/controller_automatic.js`
- `server/ocgcore/cpp/ygo/playerop.cpp`
- `server/ocgcore/cpp/ygo/operations.cpp`
- `server/ocgcore/cpp/ygo/libduel.cpp`
- `EDOPro gframe/duelclient.cpp`

### What The Code Does Today

`MSG_HINT` is a real duel message in the local core pipeline.

- `server/ocgcore/src/messages.ts` parses `MSG_HINT` with:
  - `hint_type`
  - `player`
  - `hint`
- `server/ocgcore/src/type_core.ts` defines the hint subtypes:
  - `EVENT`
  - `MESSAGE`
  - `SELECTMSG`
  - `OPSELECTED`
  - `EFFECT`
  - `RACE`
  - `ATTRIB`
  - `CODE`
  - `NUMBER`
  - `CARD`
  - `ZONE`
- `server/core/core/controller_core.js` already normalizes numeric `hint_type` values into names such as `HINT_SELECTMSG`.
- `server/core/core/controller_automatic.js` forwards `MessageType.HINT` to the browser through `gameBoard.announcement(...)`.

Current gap:

- the browser runtime in `server/ui/services/game.service.js` does not interpret `MSG_HINT`
- hints are forwarded to `/ygopro`, but effectively dropped

### Important Constraint

The assumption that every interactive question is always preceded by `MSG_HINT` is too strong.

The verified behavior matches EDOPro more closely:

- `HINT_SELECTMSG` may arrive before a question
- the client caches it
- the next relevant question consumes it once
- if there is no cached hint, the client falls back to default system strings

`HINT_EVENT` is a second cached channel used as contextual text for effect and chain prompts.

### EDOPro Reference Behavior

Verified in `gframe/duelclient.cpp`:

- `MSG_HINT` caches:
  - `HINT_SELECTMSG` into `select_hint`
  - `HINT_EVENT` into `event_string`
- `MSG_SELECT_CARD`, `MSG_SELECT_TRIBUTE`, `MSG_SELECT_PLACE`, `MSG_SELECT_DISFIELD`, and the announce prompts consume `select_hint`
- `MSG_SELECT_EFFECTYN` and some chain flows use `event_string`
- when no hint exists, EDOPro falls back to built-in prompt ids

Important fallback ids observed in EDOPro:

- `531`: `Select monsters for Tribute Summon`
- `560`: `Select`
- `562`: `Declare an Attribute`
- `563`: `Declare a Type`
- `564`: `Declare a card name`
- `565`: `Declare a number`
- `569`: `Select the zone to place "%ls"`
- `570`: `Select the zone(s) to become unusable`

Important special case:

- `MSG_SELECT_PLACE` does not use a normal desc id when `HINT_SELECTMSG` is present
- the hint payload is commonly a card code
- EDOPro formats system string `569` with the card name

### Browser Data Requirement

Hint resolution needs two data sources:

1. system strings from `strings.conf` / `strings.json`
2. card-specific `str1..str16` values from the existing manifest

This matters because many desc ids are encoded through `Auxiliary.Stringid(code, id)` and point at card strings, not plain system strings.

### Implementation Plan

#### Phase 1


#### Phase 2

- add richer `HINT_MESSAGE` and `HINT_OPSELECTED` presentation
- extend prompt coverage to more question families
- add transcript-driven parity tests for hint and question sequencing

### First Implementation Slice

The first implementation slice should do the following:

1. load `strings.json` in the browser alongside `manifest_0-language-merged.json`
2. cache `HINT_SELECTMSG`
3. cache `HINT_EVENT`
4. resolve desc ids from:
   - `strings.system`
   - `card.str1..str16`
5. generate prompt text for:
   - `MSG_SELECT_CARD`
   - `MSG_SELECT_TRIBUTE`
   - `MSG_SELECT_SUM`
   - `MSG_SELECT_PLACE`
   - `MSG_SELECT_DISFIELD`
   - `MSG_ANNOUNCE_ATTRIB`
   - `MSG_ANNOUNCE_RACE`
   - `MSG_ANNOUNCE_NUMBER`
   - `MSG_SELECT_EFFECTYN`
   - `MSG_SELECT_YESNO`
   - `MSG_SELECT_CHAIN`
6. render that prompt inside the duel shell so the existing controls keep working

### Acceptance Criteria

The first slice is complete when:

- `/ygopro` no longer drops `MSG_HINT`
- `HINT_SELECTMSG` is consumed by the next relevant question
- `HINT_EVENT` is visible on effect or chain prompts
- prompt text falls back to EDOPro-compatible system strings when no hint exists
- `MSG_SELECT_PLACE` formats the target card name correctly when the hint payload is a card code
- parity tests cover both cached-hint and fallback behavior

### YGOPro Animation Parity Plan

Source label: `ygopro-animation-parity-plan.md`

### Summary

This document tracks the animation-parity implementation work for `/ygopro` against the behavior exercised by `edopro/gframe/duelclient.cpp`.

Audit result:

- `duelclient.cpp` animation families are: field movement/fade, pile shuffle, pile-top reveal, reveal panel popups, summon/showcard flashes, chain overlays, attack arrow animation, LP delta popups, coin/dice/RPS result overlays, phase/new-turn banners, counter/timing popups, and hover-based equip/target markers.
- `/ygopro` already has usable equivalents for card movement, hand layout, shuffle, summon flash, chain overlays, battle pulse, coin/dice/RPS overlays, field-disabled X markers, and hover-based equip/target glow.
- The biggest parity gaps are: no attack-arrow layer, no phase/new-turn banner animation, no LP delta animation, no location-specific reveal handling for `confirm_decktop` / `confirm_extratop` / `confirm_cards`, no fade-in/fade-out layer for add/remove, and stale CSS/runtime class mismatches.

Verified implementation facts:

- Card movement is already largely CSS-driven: card location/index changes alter `.pX.LOCATION.iN` classes and inline `left/transform`, and `.card` uses CSS transitions.
- Shuffle is already CSS plus JS helper driven through `doGuiShuffle`, `doGuiZoneShuffle`, and `doGuiTagSwap`.
- Reveal is split today between the generic `Revealer`, zone/field selectors, and the full-screen flash overlay, but `duelAction: "reveal"` currently ignores the server `call` and therefore cannot reproduce EDOPro's location-specific reveal behavior.

### Audit Baseline

Implement the plan against these parity targets:

- Equivalent enough today
  - Card movement between zones, hand spreading, overlay stack offsets
  - Deck/hand/extra shuffle jitter
  - Summon/special/flip full-card flash
  - Chain numbered overlays with queued/solving/solved/negated states
  - Battle source/target pulse
  - Coin, dice, and RPS result overlays
  - Hover target glow and equip icon overlay

- Partial and must be upgraded
  - `MSG_CONFIRM_DECKTOP`: EDOPro peeks cards from the deck pile in-place; `/ygopro` falls back to generic reveal routing
  - `MSG_CONFIRM_EXTRATOP`: EDOPro peeks from extra deck in-place; `/ygopro` falls back to generic reveal routing
  - `MSG_CONFIRM_CARDS`: EDOPro uses heuristics, sometimes field flip/highlight, sometimes popup panel; `/ygopro` mostly uses the generic revealer
  - `MSG_DECK_TOP`: EDOPro updates reversed/top card state with pile-local motion; `/ygopro` mostly flashes the card
  - LP changes: EDOPro shows colored delta pacing; `/ygopro` only updates the bar/value

- Missing
  - Attack arrow / travel animation
  - Phase and new-turn banner animation
  - Add/remove fade layer for spawned/removed cards
  - Counter popup/timing popup equivalents beyond text
  - Location-aware reveal presentation driven by `call`

- Concrete class/runtime mismatches to fix
  - `#attackanimation` exists in CSS but no DOM/runtime uses it
  - `.phaseindicatorslide` exists in CSS but no component renders it
  - `.revealedcard` styles are stale while the React revealer emits `.reveal-card`
  - `.reveal-marker`, `.reveal-counter`, `#revealcontrols`, `.ordered`, `.allocated` have no styles
  - Card root classes like `battle-active` and `chain-*` are emitted but have no meaningful CSS behavior today

### Implementation Changes

#### 1. Make the client consume reveal modes, not just raw reveal arrays

- Change `/ygopro` reveal handling so `duelAction: "reveal"` uses both `message.reveal` and `message.call`.
- Define reveal presentation modes:
  - `confirm_decktop`: animate from deck pile, then restore
  - `confirm_extratop`: animate from extra pile, then restore
  - `confirm_cards`: choose field-local reveal for on-field/hand cases and panel reveal for true panel cases
  - default: use the existing `Revealer`
- Keep the generic `Revealer` for sort/counter/select flows; do not overload it to fake all native reveal cases.
- Add browser-side helpers in the duel runtime for "peek from pile", "flip in place", and "temporary field reveal".

#### 2. Wire the missing animation layers already implied by CSS or assets

- Add an `AttackAnimationLayer` that renders a single attack arrow/beam using the existing `#attackanimation` hook and `attack.png`, driven by source/target coordinates from the current battle contract.
- Add a `PhaseBanner` component that renders the existing `.phaseindicatorslide` animation for `MSG_NEW_TURN` and `MSG_NEW_PHASE` equivalents.
- Add an LP delta overlay component near `LifepointDisplay` for damage, recover, pay-cost, and direct LP update pacing.
- Keep all of these as transient overlays; the authoritative board state remains in the field model.

#### 3. Close the CSS/runtime mismatch layer

- Replace stale `.revealedcard` assumptions with styles that match the current React output: `.reveal-card`, `.reveal-marker`, `.reveal-counter`, `.ordered`, `.allocated`, `#revealcontrols`.
- Either remove dead root classes like `battle-active` / `chain-*` or give them actual purpose; do not leave output-only classes with no styling contract.
- Keep movement CSS as the primary transport for zone changes. Do not replace movement with JS pixel animation except for transient overlays and pile-peek effects.

#### 4. Add the missing add/remove parity language

- Introduce a lightweight fade contract for:
  - card creation from nowhere
  - removal to nowhere
  - `MSG_REMOVE_CARDS`
  - destroy/banish-style exits
- Implement this as temporary CSS class/state on surviving DOM nodes before removal, or a short-lived ghost layer if the authoritative replace would otherwise remove the node too early.
- Do not block the authoritative field replace on long animation timing; animation must be best-effort and short.

#### 5. Keep the server/browser contract clear

- Continue doing message normalization on the server.
- If new animation-only contracts are needed, add them as explicit `ui.kind` variants instead of making the browser infer them from raw protocol fields.
- The browser should only normalize orientation and presentation timing; protocol meaning stays in `controller_automatic.js`.

### Test Plan

- Add parity tests for reveal routing:
  - `confirm_decktop` uses pile-peek mode, not generic panel mode
  - `confirm_extratop` uses extra-pile peek mode
  - `confirm_cards` chooses field-local reveal vs panel based on location/count
- Add component/parity tests for animation hooks:
  - attack layer mounts with source/target data and clears after timeout
  - phase banner mounts on turn/phase announcements and clears
  - LP delta overlay renders correct sign/color/text and clears
  - hover/equip/target visuals continue to coexist with the new overlays
- Add CSS/runtime regression checks:
  - revealed card classes now match actual SCSS selectors
  - no emitted runtime class remains completely unstyled unless intentionally dead and removed
- Manual acceptance pass on `/ygopro`:
  - move a card between zones and confirm CSS-driven motion remains intact
  - shuffle hand/deck/extra and confirm helper-driven jitter still works
  - confirm decktop/extratop visually peek from the correct pile
  - attack shows arrow plus battle pulse
  - damage/recover/pay-cost show LP delta overlay
  - phase change and new turn show banner animation without breaking input

### Assumptions

- Similar animation is acceptable; exact 3D Irrlicht parity is not required.
- The authoritative duel field remains server-driven and state-replaced; animations are short-lived overlays on top of that state.
- Existing summon flash, chain overlay, coin/dice/RPS overlays, shuffle helpers, and hover target/equip visuals remain in place and are not redesigned.
- This document is a fresh implementation plan and is not appended to the parity audit.

### YGOPro Summon And Activation Animation Parity Plan

Source label: `ygopro-summon-activation-animation-parity-plan.md`

### Summary

This document scopes the parity work for the summon and activation announcement layer used by `/ygopro`.

The target is not "more animation" in general. The target is closer behavioral parity with EDOPro for:

- normal summon presentation
- special summon presentation
- flip summon presentation
- effect activation presentation
- chain negation / disabled presentation

The main finding is that the browser currently has enough data and overlay infrastructure to support a much closer implementation, but the current `Flash` path collapses several distinct desktop behaviors into one generic full-screen card splash.

### Current State

#### Browser Announcement Layer

The current browser-side flasher is implemented in:

- [`Flasher`](../server/ui/components/duel/anouncement.component.jsx)
- [`DuelScreen`](../server/ui/components/duel/duel.component.jsx)
- [`#effectflasher`](../server/ui/styles/main.scss)

What it does today:

1. `Flasher.render()` only uses `this.state.id`.
2. It renders a fixed full-screen black scrim plus a large card image.
3. `Flasher.trigger()` stores any passed fields, but the renderer ignores everything except `id`.
4. The effect auto-closes after `500ms`.

That means these payload fields are effectively unused by the actual visual layer:

- `sound`
- `source`
- `target`
- `phase`
- `chainIndex`
- any summon-type distinction

#### Contract Resolution

The current message normalization path is in:

- [`resolveAnnouncementContract(...)`](../server/ui/services/game.service.js)
- [`announcement(...)`](../server/ui/services/game.service.js)

Current behavior:

1. `MSG_SUMMONING`
2. `MSG_SPSUMMONING`
3. `MSG_FLIPSUMMONING`
4. `MSG_SUMMONED`
5. `MSG_SPSUMMONED`
6. `MSG_FLIPSUMMONED`

all resolve to the same contract shape:

- `kind: 'flash'`
- `id`

Then `announcement()` turns that into:

- `duel.flash({ id: contract.id })`

So summon timing and summon type are both flattened before the browser animation layer sees them.

#### Chain Start And Negation

Chain messages do preserve more data:

- `MSG_CHAINING` resolves to `kind: 'chain'` with `phase`, `chainIndex`, `id`, `source`, and `sound`
- `MSG_CHAIN_NEGATED` and `MSG_CHAIN_DISABLED` also preserve chain metadata

But the rendering path still drops most of that information when it wants a "flash":

- chain start calls `duel.flash({ id: contract.id })`
- negated / disabled calls `duel.flash({ id: contract.id })`

So activation start and negation are visually indistinguishable from the summon splash, aside from any separate chain overlay state.

#### Existing Reusable Infrastructure

The field layer already exposes useful helpers in:

- [`Field.getViewportCenter(...)`](../server/ui/components/duel/field.component.jsx)
- [`Field.getPileViewportCenter(...)`](../server/ui/components/duel/field.component.jsx)
- [`Field.updateChainOverlay(...)`](../server/ui/components/duel/field.component.jsx)

The duel runtime already has a stack of dedicated transient overlays:

- attack animation
- phase banner
- field reveal
- revealer
- chain overlay

So summon / activation parity does not need a brand-new overlay architecture. It can fit into the pattern already used by the duel screen.

#### Current Audio Support

The browser already has distinct local sound mappings in:

- [`duelSoundFiles`](../server/ui/services/game.service.js)

Relevant entries already exist for:

- `summon`
- `specialsummon`
- `flip`
- `activate`

So the first parity pass does not require new audio plumbing.

### EDOPro Reference Behavior

Reference source:

- `https://GitHub.com/edo9300/edopro/blob/master/gframe/duelclient.cpp`
- `https://GitHub.com/edo9300/edopro/blob/master/gframe/drawing.cpp`
- `https://GitHub.com/edo9300/edopro/blob/master/gframe/sound_manager.cpp`

The relevant desktop behaviors are mode-based, not generic.

#### 1. Normal Summon

`MSG_SUMMONING` in EDOPro:

- plays a summon chant when available, otherwise summon SFX
- sets `showcard = 7`
- shows the card with the summon animation
- runs on `SUMMONING`, not only on `SUMMONED`

#### 2. Special Summon

`MSG_SPSUMMONING` in EDOPro:

- plays summon chant when available, otherwise special summon SFX
- sets `showcard = 5`
- uses a different visual treatment from normal summon

#### 3. Flip Summon

`MSG_FLIPSUMMONING` in EDOPro:

- plays summon chant when available, otherwise flip SFX
- reveals / updates the card state
- uses the summon-style visual instead of the generic activation reveal

#### 4. Effect Activation

`MSG_CHAINING` in EDOPro:

- plays activate chant when available, otherwise activate SFX
- sets `showcard = 1`
- highlights the activating source card
- uses a dedicated activation reveal mode

#### 5. Chain Negated / Disabled

`MSG_CHAIN_NEGATED` and `MSG_CHAIN_DISABLED` in EDOPro:

- set `showcard = 3`
- draw the activated card art
- place a negation stamp overlay on top

This is a distinct visual from both summon and activation.

### Main Gaps

#### Gap 1: Mode Collapse

The current browser path treats:

- summon
- special summon
- flip summon
- activation
- negation

as near-identical flashes.

That is the largest parity mismatch.

#### Gap 2: Timing Collapse

The browser treats both `*_SUMMONING` and `*_SUMMONED` as the same kind of visual event.

EDOPro does not. The main showcard animation happens on the `SUMMONING` packet.

#### Gap 3: Lost Spatial Context

The current flasher ignores:

- source card coordinates
- target coordinates
- chain source

That prevents:

- source card highlight during activation
- field-anchored flourish
- better continuity between board state and overlay state

#### Gap 4: No Negation Variant

Negation currently reuses the same image splash as everything else.

EDOPro uses a dedicated negation presentation, which is important because it communicates a rules outcome, not just a reveal.

#### Gap 5: Automatic Path Already Knows More Than The UI Uses

The automatic controller already remembers summon source state in:

- [`rememberPendingSummon(...)`](../server/core/core/controller_automatic.js)
- [`resolveCompletedSummon(...)`](../server/core/core/controller_automatic.js)

It also already orients `source`, `target`, `cards`, and `zones` for the viewer slot in:

- [`orientUiContractForSlot(...)`](../server/core/core/controller_automatic.js)

So the missing piece is mostly contract exposure and browser consumption, not raw protocol access.

### Target Contract

Replace the current "card id only" flash contract with a stable animation payload shape such as:

- `kind`
- `mode`
- `id`
- `source`
- `target`
- `sound`
- `phase`
- `chainIndex`
- `duration`
- `confirmation`

Suggested `mode` values:

- `summon`
- `special_summon`
- `flip_summon`
- `activate`
- `negated`
- `legacy_preview`

Suggested semantics:

1. `mode` chooses the visual animation family.
2. `id` chooses the displayed art.
3. `source` anchors source-card emphasis when available.
4. `target` is optional and only used when the animation meaningfully references a target.
5. `sound` remains explicit instead of inferred where possible.
6. `confirmation` can distinguish "main animation" from a smaller post-resolution pulse if the completed packet still needs UI feedback.

### Implementation Plan

#### 1. Enrich The Announcement Contract

Update the automatic UI contract builder in:

- [`controller_automatic.js`](../server/core/core/controller_automatic.js)

Target behavior:

- `MSG_SUMMONING` -> `mode: 'summon'`
- `MSG_SPSUMMONING` -> `mode: 'special_summon'`
- `MSG_FLIPSUMMONING` -> `mode: 'flip_summon'`
- `MSG_CHAINING` -> `mode: 'activate'`
- `MSG_CHAIN_NEGATED` / `MSG_CHAIN_DISABLED` -> `mode: 'negated'`

Each contract should preserve:

- `id`
- `source` when available
- `target` when useful
- `sound`

The summon path should carry `source` using the already-stored pending summon coordinate instead of exposing only `id`.

#### 2. Keep The Manual / Fallback Path Aligned

Update the browser fallback resolver in:

- [`resolveAnnouncementContract(...)`](../server/ui/services/game.service.js)

So it mirrors the same contract shape when `message.ui` is absent.

This matters for:

- manual-mode `effect`
- direct preview flows
- any older path that still reaches the browser without a fully enriched `ui` contract

#### 3. Separate SUMMONING From SUMMONED

Match EDOPro timing more closely:

- run the primary summon animation on `MSG_SUMMONING`, `MSG_SPSUMMONING`, `MSG_FLIPSUMMONING`
- do not replay the same full animation on `*_SUMMONED`
- if the completed packet still needs feedback, use a smaller confirmation pulse or no extra flash at all

This is the highest-value behavioral correction.

#### 4. Rework `Flasher` Into A Mode-Driven Overlay

Refactor:

- [`Flasher`](../server/ui/components/duel/anouncement.component.jsx)

from:

- one black overlay
- one large card image
- one fixed timeout

into:

- a small animation renderer keyed by `mode`
- mode-specific CSS classes and timing
- optional source-card emphasis

Recommended first-pass visual mapping:

- `activate`: centered card-art reveal / wipe
- `summon`: bottom-up or rising card-art entrance
- `special_summon`: zoom / fade burst
- `flip_summon`: summon entrance plus flip accent
- `negated`: activation card art plus negation stamp
- `legacy_preview`: current simple splash fallback

The first pass should prioritize semantic distinction over exact desktop geometry.

#### 5. Anchor The Overlay To The Field Where It Helps

Use existing helpers from:

- [`Field.getViewportCenter(...)`](../server/ui/components/duel/field.component.jsx)

to support source-aware emphasis.

Recommended behavior:

- activation should pulse or highlight the source card while the centered overlay runs
- summon can optionally echo the destination slot if `source` is available and reliable
- negation should stay visually centered but still reinforce the chained source card

This keeps the animation connected to the authoritative board state instead of feeling detached from it.

#### 6. Preserve The Existing Overlay Stack

Do not fold this work into unrelated overlays.

The preferred split is:

- `Flasher` handles summon / activation / negation card-art presentation
- existing chain overlay keeps chain numbering and queued / solving / solved state
- existing attack layer keeps attack travel
- existing reveal layer keeps reveal-specific cases

That keeps each overlay responsible for one type of communication.

#### 7. Keep Audio Explicit

Use the existing browser sound map so the mode names line up with the correct SFX:

- `summon`
- `specialsummon`
- `flip`
- `activate`

If card-specific chant support is ever added later, it should be an additive enhancement. It should not block the current parity pass.

### Validation Matrix

Validate these cases explicitly:

1. normal summon from hand
2. special summon from extra deck
3. special summon from graveyard or deck
4. flip summon from facedown field state
5. spell activation from hand
6. face-up monster effect activation on field
7. chain negated
8. chain disabled
9. manual-mode effect signal
10. announce-card preview flow

Expected results:

- summon, special summon, flip summon, activation, and negation are visually distinct
- activation start uses the activation presentation, not the summon presentation
- negation uses a negation-specific presentation
- the primary summon animation occurs on `SUMMONING`
- existing chain numbers and attack animations continue to work

### Recommended Execution Order

1. Enrich automatic and fallback animation contracts
2. Split `SUMMONING` from `SUMMONED` behavior
3. Refactor `Flasher` into a mode-driven overlay with legacy fallback
4. Add CSS for summon, special summon, flip summon, activation, and negation variants
5. Add source-card emphasis using existing field viewport helpers
6. Add tests and manual validation coverage

### Recommendation

Treat this as a focused parity slice under the larger animation plan.

The implementation should aim for:

- semantic parity first
- timing parity second
- exact visual mimicry only where it is low cost

The most important correction is not graphical polish. It is restoring the distinction between:

- summon vs special summon vs flip summon
- activation vs negation
- `SUMMONING` vs `SUMMONED`

Once those are modeled correctly in the contract and renderer, the remaining visual polish work becomes incremental instead of architectural.

### /ygopro Card Stat Modifier Plan

Source label: `ygopro-card-stat-modifier-plan.md`

### Goal

Bring `/ygopro` field stat rendering closer to EDOPro when OCGCore changes visible card metadata, with the main parity target being:

- current `ATK` / `DEF` values rendered from OCGCore instead of staying fixed to database values
- modified `ATK` / `DEF` drawn in the desktop-style highlight color instead of the default white
- level/rank/link text kept in sync with current queried metadata

Important parity note:

- EDOPro does color modified `ATK` / `DEF`
- EDOPro does **not** appear to color "modified level" separately from normal level
- the only yellow level text in desktop code is the tuner level color

So the desktop-parity implementation should treat "yellow modified level" as a separate product decision, not as an already-proven parity rule.

### Desktop Reference

The relevant EDOPro behavior is in:

- [`ClientCard::UpdateInfo(...)`](../edopro/gframe/client_card.cpp)
- [`Game::DrawStatus(...)`](../edopro/gframe/drawing.cpp)
- [`MSG_BATTLE` handling](../edopro/gframe/duelclient.cpp)
- [`ClientCard`](../edopro/gframe/client_card.h)
- [`custom_skin_enum.inl`](../edopro/gframe/custom_skin_enum.inl)

What desktop actually does:

1. `ClientCard` stores both current and base values:
   - `attack`, `defense`
   - `base_attack`, `base_defense`
   - `level`, `rank`, `link`
2. `UpdateInfo(...)` fills those from query flags:
   - `QUERY_ATTACK`
   - `QUERY_DEFENSE`
   - `QUERY_BASE_ATTACK`
   - `QUERY_BASE_DEFENSE`
   - `QUERY_LEVEL`
   - `QUERY_RANK`
   - `QUERY_LINK`
3. `DrawStatus(...)` compares current vs base:
   - higher `ATK` / `DEF`: yellow
   - lower `ATK` / `DEF`: pink/red
   - unchanged `ATK` / `DEF`: white
4. level color is not based on "modified vs original":
   - normal level: white
   - tuner level: yellow
   - rank: pink
   - link: white

### Current /ygopro State

#### Browser Rendering

The web UI currently renders stat text as string blobs in:

- [`CardImage`](../server/ui/components/common/card.component.jsx)
- [`animation.scss`](../server/ui/styles/animation.scss)

Specifically:

- `data-header` is used for level/rank/link text
- `data-footer` is used for `ATK / DEF`
- CSS pseudo-elements paint those strings in a single color

That means the browser currently cannot color only the changed parts of the metadata without first changing the DOM structure.

#### Field Data Flow

The current field sync path is:

- [`controller_core.js`](../server/core/core/controller_core.js)
- [`Field.syncField(...)`](../server/ui/components/duel/field.component.jsx)

Important details:

1. The browser does merge database metadata onto visible cards through [`getCardMetadata(...)`](../server/ui/components/duel/field.component.jsx).
   - this gives original printed `atk`, `def`, `level`, `type`
   - but it is static manifest data, not current duel-state data
2. The controller refresh/query path currently only forwards minimal card state for most field updates:
   - `CODE`
   - `POSITION`
   - `IS_PUBLIC`
3. The ocgcore JS reader already supports:
   - `attack`
   - `defense`
   - `baseAttack`
   - `baseDefense`
   - `level`
   - `rank`
   - `link`
   in [`queries.ts`](../server/ocgcore/src/queries.ts)
4. The general controller refresh paths do not currently expose those fields to the browser:
   - [`msg_update_data(...)`](../server/core/core/controller_core.js)
   - [`refreshSingle(...)`](../server/core/core/controller_core.js)
   - [`buildQueriedLocationCards(...)`](../server/core/core/controller_core.js)

### Main Gaps

#### Gap 1: Current/Base Stat Data Is Dropped

OCGCore query support exists, but the web controller does not forward the fields needed for modified-stat rendering.

Result:

- a card can have changed `ATK` / `DEF` in the duel state
- the web UI still renders the database/original values or incomplete values

#### Gap 2: Header/Footer Strings Are Too Coarse

Because header/footer are rendered as whole strings, the web UI cannot express:

- unchanged white `ATK`
- changed yellow `ATK`
- unchanged white slash
- changed white `DEF`

with desktop-level control.

#### Gap 3: "Modified Level" Is Not a Proven Desktop Rule

There is no `base level` query in the same style as `base attack` / `base defense`, and EDOPro does not compare current vs original level in `DrawStatus(...)`.

If the product requirement is "yellow when current level differs from printed level", that is a web feature decision, not strict EDOPro parity.

### Target Contract

For face-up public cards in `MONSTERZONE` and `SPELLZONE` where metadata is visible:

1. Browser card state should carry both:
   - current combat metadata from OCGCore
   - original/base metadata for comparison
2. Stat text should render in structured spans, not pseudo-element-only strings
3. Color rules should follow desktop parity first:
   - `ATK > base ATK`: yellow
   - `ATK < base ATK`: pink/red
   - `ATK == base ATK`: white
   - same for `DEF`
4. Level/rank/link text should reflect current queried values
5. If the product wants "modified level is yellow", ship that as an explicit follow-up decision after ATK/DEF parity lands

### Implementation Slices

#### 1. Expand Browser-Facing Query Payloads

Update the controller query masks and snapshot builders in [`controller_core.js`](../server/core/core/controller_core.js) to include:

- `TYPE`
- `LEVEL`
- `RANK`
- `LINK`
- `ATTACK`
- `DEFENSE`
- `BASE_ATTACK`
- `BASE_DEFENSE`

Primary touchpoints:

- `msg_update_data(...)`
- `refreshSingle(...)`
- any reload/catch-up snapshot builder that rebuilds visible field cards

Expected result:

- every visible field card refresh can carry the current/base values needed by the browser

#### 2. Normalize Current vs Base Metadata Once

Add one browser-facing normalization helper in the controller layer that produces a stable shape such as:

- `attack`
- `defense`
- `baseAttack`
- `baseDefense`
- `level`
- `rank`
- `linkRating`
- `type`
- `statState.atk`
- `statState.def`

Where `statState.atk` / `statState.def` are normalized enum-like values:

- `unchanged`
- `higher`
- `lower`
- `unknown`

Reason:

- this keeps color logic out of React string-building
- it also ensures refresh, reconnect, and reload use the same comparison rules

#### 3. Replace Header/Footer Pseudo-Only Rendering

Refactor [`card.component.jsx`](../server/ui/components/common/card.component.jsx) so visible stat text is rendered as explicit DOM nodes instead of only `data-header` / `data-footer`.

Suggested shape:

- header row:
  - level/rank/link span
- footer row:
  - `ATK` span
  - slash span
  - `DEF` span
  - counters/hint footer handled separately

Keep the existing hidden/overlay guards:

- no stat chrome for overlay materials
- no visible stats for facedown hidden cards where they should stay concealed

Expected result:

- CSS can color current values independently without hacks

#### 4. Add Desktop-Style Stat Color Classes

Add CSS classes in the duel styles for:

- `.card-stat.unchanged`
- `.card-stat.higher`
- `.card-stat.lower`
- `.card-stat.unknown`

Color targets should follow desktop defaults from [`custom_skin_enum.inl`](../edopro/gframe/custom_skin_enum.inl):

- unchanged: white
- higher: yellow
- lower: pink/red

This slice should also preserve the existing text-shadow treatment so the web field still reads cleanly over the board.

#### 5. Keep Battle/Announcement Paths Consistent

The browser already receives attack/defense values in normalized `BATTLE` announcements from [`controller_core.js`](../server/core/core/controller_core.js), but the regular card state should become authoritative.

Plan requirement:

- do not let transient battle messages be the only place where current combat values are known
- card state updates and battle overlays must agree

#### 6. Decide Level-Change Behavior Explicitly

Because EDOPro does not currently compare current level against a base level, choose one of these paths explicitly:

1. Strict parity:
   - only ATK/DEF get modified-value colors
   - level keeps current desktop behavior
2. Web extension:
   - compare current `level` / `rank` against manifest original values
   - color changed level/rank yellow

Recommendation:

- ship strict parity first
- if desired, add modified-level highlighting in a second pass behind an explicit UI rule

### Testing Plan

#### Server Unit Coverage

Add controller tests that prove refresh snapshots now include:

- `attack`
- `defense`
- `baseAttack`
- `baseDefense`
- `level`
- `rank`
- `link`

Suggested test location:

- [`tests/unit/server/controller-core.test.js`](../tests/unit/server/controller-core.test.js)

#### Browser/Parity Coverage

Add parity tests that:

1. start a duel with a face-up monster
2. deliver a field update where:
   - current `ATK` differs from `baseAttack`
   - current `DEF` differs from `baseDefense`
3. assert the DOM exposes:
   - current visible values
   - `higher` / `lower` classes
4. assert facedown and overlay-material cards do not show this chrome

Suggested test location:

- [`tests/parity/edopro/duel-client-contract.test.js`](../tests/parity/edopro/duel-client-contract.test.js)

#### Manual Validation Cases

Use cards/effects that visibly change stats on the field, for example:

- continuous ATK boost
- temporary battle-phase ATK change
- DEF reduction
- rank/level manipulation if the level-extension slice is approved

Manual success criteria:

- unchanged stats stay white
- boosted stats turn yellow
- reduced stats turn pink/red
- level/rank/link text stays synchronized with current duel state

### Recommended Execution Order

1. Expand controller query masks and normalized browser payloads
2. Add unit tests for current/base stat transport
3. Replace card stat pseudo-element rendering with explicit DOM
4. Add CSS color classes and parity tests for modified `ATK` / `DEF`
5. Decide whether modified level color is strict parity or web-only behavior

### Recommendation

Treat this as two separate deliverables:

- Deliverable A: EDOPro parity for current/base `ATK` / `DEF`
- Deliverable B: optional web extension for "modified level is yellow"

That keeps the first pass objective and source-backed, while still leaving room for the level behavior if you want it afterward.

### YGOPro XYZ Summon Implementation Plan

Source label: `ygopro-xyz-summon-implementation-plan.md`

### Verified Against

- `edopro/gframe/duelclient.cpp`
- `edopro/gframe/client_card.cpp`
- `edopro/gframe/client_field.cpp`
- `server/ocgcore/cpp/ygo/card.cpp`
- `server/ocgcore/cpp/ygo/field.cpp`
- `server/ocgcore/cpp/ygo/operations.cpp`
- `server/ocgcore/src/messages.ts`
- `server/ocgcore/src/queries.ts`
- `server/core/core/controller_core.js`
- `server/core/core/controller_automatic.js`
- `server/core/core/model_automatic_field.js`
- `server/ui/components/common/card.component.jsx`

### Verified Behavior

The local stack already has all of the primitives needed to display XYZ materials correctly, but the move-routing layer is not consuming the modern ocgcore packet shape correctly.

- EDOPro does not use a separate "XYZ summon move" packet for materials.
- During an XYZ summon, the core emits ordinary `MSG_MOVE` packets for each material.
- In `server/ocgcore/cpp/ygo/card.cpp`, `card::get_info_location()` encodes an overlay card as:
  - host controller
  - host location with `LOCATION_OVERLAY` ORed in
  - host sequence
  - material sequence under that host
- In `server/ocgcore/src/messages.ts`, `parseInfoLocation()` strips the overlay bit and exposes the fourth word as `overlay_sequence`.
- In `edopro/gframe/duelclient.cpp`, `MSG_MOVE` explicitly handles four overlay-aware cases:
  - normal move
  - card moved into overlay
  - card moved out of overlay
  - card moved from one overlay stack to another
- In `server/core/core/model_automatic_field.js`, a field pile already renders as:
  - `overlayindex: 0` for the host card
  - `overlayindex: 1..n` for attached materials
- In `server/ui/components/common/card.component.jsx`, cards with `overlayindex > 0` in `MONSTERZONE` already render offset underneath the host card.

Important constraint:

- The right fix is generic overlay-move parity, not an XYZ-summon-only special case.
- The same overlay move semantics also cover later attach and detach effects, not just the initial summon.
- `MSG_SPSUMMONING` and `MSG_SPSUMMONED` are only summon feedback packets for the summoned monster. They do not carry the material stack.

### Current Gap

The current break is in the server-side move controller, before the browser renders anything.

- `server/core/core/controller_core.js` normalizes `MSG_MOVE` into:
  - `previousController`
  - `previousLocation`
  - `previousIndex`
  - `currentController`
  - `currentLocation`
  - `currentIndex`
  - `currentPosition`
- Overlay information is still present on `message.from.overlay_sequence` and `message.to.overlay_sequence`, but the movement router does not use it.
- `server/core/core/controller_automatic.js` still branches on legacy raw-packet fields `pl`, `cl`, and `pp`.
- Those legacy fields are not populated by the normalized ocgcore move contract.
- Result: a material move into overlay is misclassified as a normal move into `MONSTERZONE`, so the material is moved as if it were the control card instead of being attached underneath it.

There is a second concrete gap in the same function:

- the attach-material branch returns without calling `ygoproUpdate()`
- even after overlay detection is fixed, the browser will not repaint the new stack unless that update is emitted

There is also a reload parity gap that is separate from the live summon bug:

- `RELOAD_FIELD` only carries `materials` counts, not the material card ids
- `server/core/core/model_automatic_field.js` rebuilds placeholder materials as `unknown`
- EDOPro fills overlay identities through `QUERY_OVERLAY_CARD`, but the local refresh path does not query that today

### Implementation Plan

#### 1. Make `MSG_MOVE` overlay-aware in the automatic controller

Preferred fix location:

- update `server/core/core/controller_automatic.js`
- stop branching on legacy `pl`, `cl`, and `pp`
- branch on the canonical ocgcore move contract instead:
  - `message.from`
  - `message.to`
  - `message.from.overlay_sequence`
  - `message.to.overlay_sequence`

Target move classification:

- spawn from nowhere:
  - `from.location === 0`
- remove to nowhere:
  - `to.location === 0`
- normal move:
  - neither side has `overlay_sequence`
- attach into overlay:
  - `to.overlay_sequence` is an integer and `from.overlay_sequence` is not
- detach from overlay:
  - `from.overlay_sequence` is an integer and `to.overlay_sequence` is not
- overlay-to-overlay transfer:
  - both sides have `overlay_sequence`

Important mapping rule:

- ocgcore `overlay_sequence` is zero-based within the material stack
- `model_automatic_field.js` uses `overlayindex: 0` for the host card and `1..n` for materials
- any detach or transfer call that addresses a material slot must use `overlay_sequence + 1`

#### 2. Keep the move contract explicit instead of reviving legacy fields

`controller_core.js` can stay backward-compatible for other consumers, but the overlay-aware movement path should use the canonical overlay fields rather than recreating raw YGOPro-era loc-info fields.

If review wants a cleaner contract, normalize `message.from` and `message.to` into browser-safe coordinates in `controller_core.js` and let `controller_automatic.js` consume those directly. Either way, the move router should not depend on `pl`, `cl`, or `pp` anymore.

#### 3. Emit field updates for overlay attach and transfer paths

After the move classification fix, ensure the automatic board controller emits a repaint for every overlay mutation:

- attach into overlay must call `ygoproUpdate()`
- detach from overlay must keep calling `ygoproUpdate()`
- overlay-to-overlay transfer must keep calling `ygoproUpdate()`

The live board should update from the authoritative field model, not from summon-flash packets.

#### 4. Audit the automatic field model for post-attach stability

`model_automatic_field.js` already has the right pile shape for rendering, but once overlay attach starts working again it needs one audit pass for source-zone stability.

Review these behaviors after enabling real attach traffic:

- a source pile that becomes empty after `attach()` must not block a later card from occupying the vacated zone
- location-based search should not keep treating an empty placeholder pile as the active card in that zone
- the origin-tracking behavior used by `detach()` must still be preserved so the material can be restored correctly later

This is not the primary XYZ bug, but it is the main follow-up risk once real overlay moves start flowing through the field model.

#### 5. Preserve reload and catch-up parity for overlay identities

The live summon fix should be implemented first, but review should treat reload parity as part of the same feature family.

Follow-up slice:

- when reloading or refreshing a host card in `MONSTERZONE` or `SPELLZONE`, query overlay identities with `OcgQueryFlags.OVERLAY_CARD`
- hydrate the placeholder material cards under that host with the returned ids
- keep `RELOAD_FIELD` material counts as the structural fallback

This makes spectator catch-up, reconnect, and replay-style refreshes consistent with EDOPro instead of showing only anonymous material counts.

#### 6. Do not add browser-only XYZ heuristics

Do not implement this as:

- "if the summoned monster is Xyz, manually stack the last two monsters"
- "infer materials from `MSG_SPSUMMONING`"
- "special-case Dante"

The correct source of truth is overlay-aware `MSG_MOVE` handling. Once that path is correct, the existing UI stack rendering should work for:

- XYZ summons
- Rank-Up style reattachments
- detach costs
- card effects that attach cards from deck, hand, graveyard, or banishment

### Test Plan

#### Unit: `controller_core.js`

Add a move-normalization test that proves `MSG_MOVE` preserves overlay pointers on both sides.

Minimum cases:

- `from.overlay_sequence` present
- `to.overlay_sequence` present
- both present

#### Unit: `controller_automatic.js`

Add direct board-controller tests for:

- field card attached under a host card
- material detached from a host card to a field zone
- material transferred from one host card to another
- attach path emits `ygoproUpdate()`

These tests should assert the controller calls:

- `attachMaterial(...)`
- `detachMaterial(...)`
- `takeMaterial(...)`
- `ygoproUpdate()`

with the expected zero-based to one-based slot conversion.

#### Unit: `model_automatic_field.js`

Extend the field-model tests to cover:

- two field monsters attached under one host render as one `overlayindex: 0` host plus `overlayindex: 1` and `overlayindex: 2` materials
- a vacated source monster zone can later receive a new card without colliding with the empty source placeholder
- detaching material slot `n` restores the correct card identity

#### Browser parity

Add a `/ygopro` parity test that renders a stacked zone and verifies:

- three cards exist at the same player/location/index
- the host card is `overlayindex: 0`
- the materials are `overlayindex: 1` and `overlayindex: 2`
- the host card remains visually on top

#### Manual validation

Use this concrete duel case:

- `Dante, Traveler of the Burning Abyss` `[83531441]`
- `Farfa, Malebranche of the Burning Abyss` `[36553319]`
- `Libic, Malebranche of the Burning Abyss` `[62957424]`

Expected result:

- Farfa and Libic start in separate monster zones
- the XYZ summon moves both materials into one shared monster zone as materials
- Dante moves from the Extra Deck into that same monster zone as the control card
- the final DOM state shows Dante on top with both materials offset underneath it

### Acceptance Criteria

The implementation is ready for review when all of the following are true:

- live XYZ summon material moves are driven by overlay-aware `MSG_MOVE` handling
- the `/ygopro` field ends the summon with one host card and the correct material stack in the same monster zone
- attach, detach, and overlay-to-overlay transfer all repaint immediately
- summon flash behavior still works and remains separate from board-state mutation
- no browser-side card-type heuristic is required for the stack to appear
- at least unit coverage exists for overlay attach and detach routing
- the Dante plus Farfa plus Libic scenario can be used as a deterministic manual acceptance pass

Optional but strongly recommended for the same review cycle:

- reload and catch-up flows hydrate actual overlay card ids instead of only material counts

### YGOPro Salvation Server Game Manager Microservice API 0.1.0

Source label: `game-manager-microservice.md`

##Preface
The main feature of second generation and beyond YGOPro servers is a gamelist, it is the key desirable feature. This is a collection of active and available duels that the end-user can join to duel or spectate in. It gives an overview of the server activity level and possibly health. To achieve this the server side instance of YGOPro needs to be able to communicate what is happening within the process, and route the end-user to the requested game because only one port is exposed to all end users to connect to, and YGOPro/YGOServers need unique ports to operate on. Salvation takes this a step farther beyond Percy Checkmate DevPro and MyCard in providing unique routing for alternative script, database, and banlist configurations.

##TCP and Websocket Connection
The game-manager-microservice provides a standard port for both standard YGOPro communications and websocket wrapped browser communications. 

##Shutdown Listener
On update the system will close the port listeners, but not shut down for 10 mins. 

##Understanding YGOPro
YGOPro has a rather complex network API compared to the working language of the server JavaScript. It features C++ structures printed to memory, and specifically crafted buffer streams. The game-manager-microservice can only understand a few of these natively and leaves the rest for the `ygoserver.exe` process to communicate to it. On new connection the game-manager-microservice listens to the first two message commands and gets a `roompass`. It then parses this room pass and starts `ygoserver.exe` on a new port, then patches the YGOPro of the end-user to `ygoserver.exe`. During the parsing the game-manager-microservice checks the security of verification of the user and will ignore the request of unverified users.

### YGOPro Salvation Server Gamelist Microservice API 0.1.0

Source label: `gamelist-microservice.md`

##Preface
The main feature of second generation and beyond YGOPro servers is a gamelist, it is the key desirable feature. This is a collection of active and available duels that the end-user can join to duel or spectate in. It gives an overview of the server activity level and possibly health. Third generation and beyond gamelist are in real time using TCP communications. Salvation's gamelist uses websockets to communicate with other microservices and both the end-users browser-client and server-client. This is the internal standard for internal communication across the architecture except to the forums which uses REST HTTP calls.

##Boot
On boot the gamelist will have a 10 second span where it will ask the internal servers for its gamelist, if one responds it will update its internal dictionary of users (registry) and the gamelist to match. On a cold boot these will be blank, or only contain the defaults. This process provides service crash recovery, the main pain process of the microservice will automatically restart the process on crash providing redunancy. End-users will detect a momentarily disconnection, but no lost of the gamelist.

##Gamelist Update Messages
The gamelist-microservice receives text inputs from the `routing-boot` subprocess of the game-manager-microservice. These inputs are documented with the `ygocore`. These are parsed and used to update the gamelist. Chat communications are logged to file and outputed to the IRC server in the `#public` room. If a game falls into a specific state it will remove it from the game list and try to kill the `ygoserver.exe` process associated with it in its records.

    - Zero players, and zero spectators.
    - Name of the room is not exactly 24 characters. This is managed else where but this is a contingency.
    - Game is older than 45 mins.

##Registry
To avoid bot nukes from malicious users with an understanding of second generation YGOPro server workings, a user must be registered to our forums and have logged into from their current IP address within the time of server restart to duel. This process is completely fluid to normal users but prove extra steps for attackers. This registry is an internal dictionary of users provided to all relevant microservices. 
The registry is distributed to the `routing-boot` subprocess of the game-manager-microservice. It compares the IP of incoming duels to those on the 'ok list' the registry provides and will disconnect any user not on it immediately. 

###Known issues

- There are some holes in this model that need to be patched in future releases where the system is subpar in comparison to DevPro's more active defenses. Salvation does not deregister users on disconnection.

- Repeated request to the forum for verification cause server instability and overload of the server, the gamelist-microprocess therefore limits redundant calls to one per minute.

##Admin Commands
For an admin command to be executed the user must be an administrator on the forums.

    * global : Global Message to all users, these are cached in memory and users logging in will get the previous message.
    * killgame : Takes a `pid` number, kills that process on the server indiscriminately. (Needs to be limited to YGOServer.exe processes)
    * murder : Disconnects a specific user.
    * genocide : Disconnects all users.
    * update : Forces all users to initiate their update system immediately without reloading the manifest.
    
These commands can be accessed via the launcher. DuelServ no longer provides these capabilities to avoid issues within the administration. Thes commands tap into the the gamelist-microservice's natural gamelist cleanup systems.
    
##Client-Server
The end-user's launcher application is two conceptual spaces, the client-browser and the client-server. Because we plan on going to a pure browser system the commands sent to the client-server have been encapsulated and do not directly communicate with the client-browser, the primary user interface provided by `http://ygopro.us`. The client-server uses `nwjs`'s nodejs and chromium hybrid nature to act as a unsandboxed application enviroment. It is able to access the user interface file system and network. To communicate internally the client-server generates a random identifier, then injects it into the client browser. The client-browser and client-server then connect to a private room within the gamelist communication system and are able to communicate. Metaphorically throwing a ball over a fence, the fence being the server. In the future when the system is purely browser based the client-server will be defuncted. For this reason the launcher does not work offline. The client-server provides a backup interface if accessed offline that ignores this separation of concerns and can communicate directly with it.

##Client-Browser
After render the client-browser will connect to the gamelist-microservice and receive gamelist updates. After login it will register its username and IP with the gamelist-microservice and start receiving global update messages along with communications from its paired client-server process. On connection there is usually an immediate update from the client-server and global cached and needing processing which the client-browser retrieves on its registration call.


### YGOPro Salvation Server Update Microservice API 0.1.0

Source label: `update-microservice.md`

### Preface
This feature is unique to Salvation and provides its extreme speed. Salvation manages individual files and keeps in a live deployment mode allowing the developers to quickly push updates without fear, and easily correct bugs in real time.

### Server Side
The production server is registered to GitHub and receives notifications via HTTP REST calls about updates to its source code. When it gets an update it will compile a manifest of all the file names and their sizes in the system the end-user needs to keep up to date. It then creates a JavaScript file that stores that manifest as a variable.

### Client Side
On boot the client-server will process the server manifest and compare it to its own files compiling a list of files within a 1KB error range. It then downloads each file one by one and self updates.

### Server Internal Update
Each microservice will listen for a manifest update then shut down and restart in a way that will not interrupt end-user gameplay significantly. (with the current exception of browser mode players).

### Features

Source label: `features.md`

- [ ] Automatic Dueling System (YGOPro): MacOSX support
- [ ] Mobile Compatible Web Based Manual Dueling System
- [ ] Real Time Game List Search and Filter
- [ ] Checkmate Server: Access
- [ ] Checkmate Server: Reporting
- [ ] Powerful Chat system (IRC): Honors
- [ ] Automatic editing and saving of YGOPro's `system.conf` file
  * [ ] YGOPro to Launcher
- [ ] Single Sign On with Social Media integration.
  * [ ] Ranking/Game Server
  * [ ] Chat
  * [ ] Forum
  * [ ] Facebook
  * [ ] Google+
  * [ ] Twitter
- [ ] Automatic Ranking System
- [ ] File management of Decks
- [ ] File management of Replays
- [ ] Client side Customization management
- [ ] Server Side Admin controls
- [ ] Web based Deck editing
  * [ ] Edit stored decks online
  * [ ] Import from DuelingNetwork
  * [ ] Export to DuelingNetwork
- [ ] Community Powered OnDemand Update System
  * [ ] Monitoring of TCG/Euro Code
  * [ ] Automatic Card database compile
  * [ ] Automatic Banlist compile
  * [ ] Automatic Art rendering
  * [ ] Automatic recompiling `OCGCORE`
- [ ] Accurate Formats Rulings and Card pools with era sensitivities.  
  * [ ] OCG Format & Rulings
  * [ ] Korean Format & Rulings
  * [ ] European Format & Rulings
- [ ] Full Language support
  * [ ] Spanish
  * [ ] Portuguese
  * [ ] German
  * [ ] Italian
  * [ ] French
  * [ ] Greek
  * [ ] Japanese
  * [ ] Korean
  * [ ] Russian.
- [ ] Ranking with Privacy settings
- [ ] Automatic Tournament System
  * [ ] Server initiated and managed
- [ ] Up&Coming Yugituber support
  * [ ] Rules
  * [ ] 1k/day View Gareentee 300/1000
- [ ] Vendor Support
- [ ] YGOPro MIME-Type Support and linked replay





