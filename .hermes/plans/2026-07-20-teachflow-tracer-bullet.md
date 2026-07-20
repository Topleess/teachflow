# TeachFlow Tracer-Bullet Prototype Implementation Plan

> **Execution rule:** strict vertical TDD. Every production behavior starts with a failing test, then minimal implementation, then full-suite verification.

**Goal:** Create the first working TeachFlow product prototype: one Lesson Session, teacher/student entry, shared subject-neutral activity with presence and persistence, video adapter, and outcome snapshot.

**Architecture:** A separate `prototype/` application inside the existing repository. Payload + PostgreSQL own domain state. Hocuspocus/Yjs own collaborative document state behind an adapter. LiveKit owns media behind a backend token adapter. The first testable slice may use in-memory/fake adapters, but completion requires real local collaboration and a real two-party video room or an explicitly documented external credential blocker.

**Scope exclusions:** courses, billing, AI, homework, recording, universal whiteboard, production authentication, school tenancy, analytics, synthetic testimonials.

---

## Task 0 · Repository and environment baseline

- Add `prototype/README.md`, `.env.example`, package manifests and documented commands.
- Do not alter the existing static production landing page.
- Verify Node/package-manager versions and PostgreSQL/Docker availability.
- Acceptance: clean install command and `test`, `lint`, `build` scripts exist.

## Task 1 · Lesson Session domain

**RED**

- Test that a session has opaque ID, teacher, student, status, video room, collaboration document and optional outcome.
- Test role-based access: unrelated user cannot read/join.
- Test allowed state transitions: scheduled → live → ended.

**GREEN**

- Implement minimal schema/service.
- Prefer framework-independent domain functions first, then Payload collection mapping.

**Acceptance**

- Targeted tests and full suite pass.

## Task 2 · Invitation/join flow

**RED**

- Teacher receives a role-bound invitation URL.
- Student token cannot impersonate teacher.
- Expired/invalid token is rejected.

**GREEN**

- Implement short-lived signed join token and server validation.

**Acceptance**

- Two isolated browser contexts can open the same session with different roles.

## Task 3 · Collaboration document

**RED**

- Two clients load one document.
- Concurrent updates to different steps are preserved.
- Reload restores persisted state.
- Awareness disappears after disconnect and is not persisted.

**GREEN**

- Implement Yjs document model and Hocuspocus auth/persistence adapter.
- Initial object: equation `2x + 3 = 11` plus ordered solution steps.

**Acceptance**

- Integration test uses two real websocket clients.

## Task 4 · Shared activity UI

**RED**

- Browser test: teacher and student see the same initial object.
- Editing/adding a step in one context appears in the other.
- Two role-labelled cursors/presence indicators appear.
- No horizontal overflow at desktop/mobile.

**GREEN**

- Implement minimal accessible DOM/SVG activity, not a universal whiteboard.

**Acceptance**

- Playwright two-context test and screenshots.

## Task 5 · Video adapter

**RED**

- Only assigned participants receive room-scoped token grants.
- Secret never appears in client bundle.
- Room name is opaque and derived from session ID.

**GREEN**

- Implement `VideoAdapter` contract and LiveKit adapter.
- Use `LiveKitRoom`/components in the session UI.
- Recording remains disabled.

**Acceptance**

- Real teacher/student room connection when credentials are present.
- If credentials are absent, tests use fake adapter and README names the exact blocker; do not claim video complete.

## Task 6 · Outcome

**RED**

- Ending session creates immutable snapshot reference.
- Snapshot includes activity state and minimal metadata, not awareness.
- Re-ending is idempotent.

**GREEN**

- Implement end-session command and persisted outcome.

**Acceptance**

- End-to-end browser/API test verifies saved outcome.

## Task 7 · Verification and evidence

- Run unit, integration and Playwright suites.
- Run build/lint/typecheck.
- Exercise desktop and mobile.
- Capture proof artifacts:
  - two-client screenshot;
  - collaboration/reload test output;
  - video connection evidence or explicit blocker;
  - outcome JSON/read-back.
- Update `project/02-product/CURRENT-STATE.md` only for actually proven capabilities.

## Stop conditions

Stop and report rather than fabricate when:

- dependency license differs from audited assumption;
- Payload/Next compatibility blocks the selected versions;
- LiveKit credentials or network path are unavailable;
- BlockSuite is required to satisfy the slice and runtime spike fails;
- local Docker/PostgreSQL is unavailable without changing unrelated production services.
