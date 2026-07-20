# TeachFlow Product Reset Implementation Plan

> **For Hermes:** execute this plan sequentially; do not restart outreach until the product story passes the cold-link test.

**Goal:** Replace the current abstract TeachFlow landing page with a concrete, truthful product story based on one real teaching workflow, then rebuild sales materials and only afterward resume outreach.

**Architecture:** Keep the current visual system and static deployment, but replace the narrative and decorative examples. Treat the landing page as the final output of product discovery, not its starting point. Separate current artifacts, prototype behavior, future vision, and pilot offer explicitly.

**Tech Stack:** Static HTML/CSS/JS, Playwright QA, GitHub repository `Topleess/teachflow`, Nginx container `teachflow-site`, Caddy.

---

## Operating decision

Pause outbound outreach. The existing seven verified leads remain research data only. Do not contact them until Tasks 1–8 are complete and the cold-link test passes.

The live site may remain online as an internal preview, but it must not be sent to prospects in its current form.

---

## Phase 1: Define the product before rewriting the site

### Task 1: Write the current-state product inventory

**Objective:** Establish what exists now and stop presenting future ideas as working functionality.

**Create:** `/opt/data/projects/teachflow-landing/product/current-state.md`

Record every product element under one of four labels:

1. `WORKING` — implemented and demonstrable now.
2. `PROTOTYPE` — clickable or visual prototype, not production-ready.
3. `PLANNED` — deliberately scoped but not implemented.
4. `HYPOTHESIS` — an idea requiring interviews or experiments.

For each item capture:

- what the teacher can do;
- what the student can do;
- what persists after the lesson;
- what must be done manually;
- known limitations;
- proof artifact: URL, screenshot, video or file.

**Acceptance criterion:** no feature appears on the next landing page without a label and evidence.

### Task 2: Select one initial user segment

**Objective:** Stop speaking simultaneously to tutors, schools, methodologists and educational teams.

**Create:** `/opt/data/projects/teachflow-landing/product/initial-segment.md`

Default segment to validate unless contradicted by evidence:

> Independent online tutors who teach recurring one-to-one lessons, prepare their own materials and currently combine video calls, documents/slides, a board and a messenger.

Specify:

- subject or small set of subjects;
- lesson format;
- number of active students;
- current tool stack;
- who pays;
- repeated pain;
- why this segment can test a prototype quickly.

**Decision gate:** choose one primary segment. Other audiences may appear only as future expansion.

### Task 3: Capture one real lesson end to end

**Objective:** Replace invented examples with an authentic workflow.

**Create:** `/opt/data/projects/teachflow-landing/research/lesson-case-01.md`

Use one real teacher and one anonymized real lesson. Collect:

- subject and lesson goal;
- preparation steps;
- all tools opened;
- source materials;
- what teacher and student do during the lesson;
- what is saved afterward;
- how homework is assigned and checked;
- where context or time is lost;
- screenshots or anonymized source artifacts with permission.

Required evidence:

- at least 3 concrete source artifacts;
- exact current workflow;
- explicit permission status for public use;
- no invented learner name, outcome or metric.

**Decision gate:** do not write new examples until this case exists.

### Task 4: Define the narrow first product scenario

**Objective:** Turn discovery into a single testable product promise.

**Create:** `/opt/data/projects/teachflow-landing/product/first-scenario.md`

Use this structure:

> When `[specific teacher]` prepares and conducts `[specific lesson]`, TeachFlow helps them `[specific job]` by `[actual mechanism]`, so that `[observable result without invented metrics]`.

Document:

- trigger;
- steps before, during and after the lesson;
- TeachFlow intervention at each step;
- what TeachFlow intentionally does not solve;
- difference from the current stack;
- what can be demonstrated today;
- smallest meaningful pilot.

**Acceptance criterion:** the scenario can be explained in under 60 seconds without words such as “ecosystem”, “all-in-one” or “revolutionary”.

---

## Phase 2: Produce proof before marketing copy

### Task 5: Build or capture a truthful product walkthrough

**Objective:** Give the landing page something real to show.

**Create:**

- `/opt/data/projects/teachflow-landing/assets/product/step-01.*`
- `/opt/data/projects/teachflow-landing/assets/product/step-02.*`
- `/opt/data/projects/teachflow-landing/assets/product/step-03.*`
- `/opt/data/projects/teachflow-landing/product/walkthrough.md`

The walkthrough must show one sequence, for example:

1. teacher opens the learner/lesson context;
2. teacher and student work through a concrete activity;
3. result or homework remains attached to that lesson.

Every frame must be labelled `working`, `prototype` or `concept`.

**Acceptance criterion:** a prospect can explain what happened in the walkthrough without verbal assistance.

### Task 6: Write the competitive alternative comparison

**Objective:** Explain why TeachFlow exists without pretending it replaces every tool.

**Create:** `/opt/data/projects/teachflow-landing/product/alternatives.md`

Compare the selected scenario against the actual current stack, likely:

- video call;
- Miro or another board;
- Google Docs/Slides/Notion;
- Telegram or another messenger;
- LMS if relevant.

Compare only:

- context continuity;
- lesson preparation;
- work during the lesson;
- saved result;
- homework handoff;
- setup cost and limitations.

Do not claim universal superiority. Explicitly state where existing tools remain better.

---

## Phase 3: Rewrite and rebuild the landing page

### Task 7: Create the new narrative specification

**Objective:** Approve content before changing HTML.

**Create:** `/opt/data/projects/teachflow-landing/content-v2.md`

Required page order:

1. **First screen:** audience + concrete job + current status.
2. **Real workflow:** one recognizable lesson before/after comparison.
3. **Product walkthrough:** 3–5 actual screens with labels.
4. **Why current tools are insufficient for this scenario:** specific comparison.
5. **What exists now / what does not:** explicit boundary.
6. **Pilot:** participant, scenario, duration/format if known, mutual responsibilities and result.
7. **CTA:** interview or pilot conversation, not “start using”.
8. **FAQ:** readiness, subject scope, video/board replacement, price/pilot terms.

Content rules:

- no invented clients, metrics, testimonials or outcomes;
- no decorative educational examples;
- no generic “all teaching in one place” claim without mechanism;
- no feature displayed without readiness label;
- one primary audience and one primary CTA.

**Cold-link test:** show only the content draft to 3 people unfamiliar with TeachFlow. Ask:

1. What is it?
2. Who is it for?
3. What does it do in the demonstrated scenario?
4. What exists now?
5. What action are you being asked to take?

Pass threshold: at least 2 of 3 answer all five correctly without prompting.

### Task 8: Implement landing page v2

**Objective:** Replace the weak narrative while preserving the accepted visual direction.

**Modify:** `/opt/data/projects/teachflow-landing/index.html`

Keep:

- editorial visual system;
- responsive behavior;
- keyboard accessibility;
- focus states;
- reduced-motion support;
- static architecture.

Replace:

- abstract city/conversation example;
- generic audience grid;
- unproven “whole journey” claims;
- vague pilot wording;
- decorative cards not grounded in Task 3.

Add:

- real anonymized case;
- truthful product frames;
- readiness labels;
- current-stack comparison;
- explicit pilot boundaries.

### Task 9: Verify landing page v2

**Modify/Test:** `/opt/data/playwright-runner/verify-teachflow.js`

Verify:

- 1440, 900 and 390 px viewports;
- no horizontal overflow;
- no console errors or failed requests;
- keyboard modal operation and Escape;
- working Telegram link;
- visible readiness labels;
- visible current-status statement;
- all image alt text;
- no prohibited claims from Task 7.

Run:

```bash
cd /opt/data/playwright-runner
node verify-teachflow.js
```

Expected: all viewports `ok`, `issues []`.

Perform a visual QA pass on desktop and mobile screenshots. Fix at least one discovered issue and rerun affected checks.

---

## Phase 4: Publish only after comprehension passes

### Task 10: Review and publish

**Objective:** Deploy only an approved, understandable version.

Before deployment:

- user reviews `content-v2.md`;
- cold-link test passes;
- technical QA passes;
- Telegram CTA is verified;
- no unsupported claims remain.

Then:

```bash
cd /opt/data/projects/teachflow-landing
unset GIT_INDEX_FILE
git add .
git commit -m "Rebuild TeachFlow around a real teaching workflow"
git push origin main
```

Copy the verified `index.html` into `teachflow-site`, set public read permissions, and verify:

```bash
curl -fsSI https://teach-flow.as-shamshurin.xyz/
```

Expected: HTTPS `200`.

Run external Playwright checks against the public URL.

---

## Phase 5: Rebuild sales materials and resume outreach

### Task 11: Rebuild commercial materials from the approved story

**Modify/Create:**

- `/opt/data/projects/teachflow-materials/TeachFlow-one-pager-v2.md`
- `/opt/data/projects/teachflow-materials/TeachFlow-pilot-deck-v2.pptx`
- `/opt/data/projects/teachflow-materials/outreach-scripts-v2.md`

Use the same real scenario, screenshots and readiness boundaries as the landing page. The deck must not contain stronger claims than the site.

Verify PPTX structure, extract slide text and perform rendered visual QA before sending it externally.

### Task 12: Complete and segment the lead base

**Modify/Create:**

- `/opt/data/projects/teachflow-materials/leads-verified-30.csv`
- `/opt/data/projects/teachflow-materials/leads-verified-30.md`

Target mix:

- 12 independent tutors / author-led schools close to the initial segment;
- 10 small and medium schools;
- 5 methodologists or academic leaders;
- 3 communities or distribution partners.

For every row require:

- public source;
- verified contact channel;
- person or honest generic role;
- why the first scenario fits;
- personalized reason to contact;
- verification date;
- duplicate check.

### Task 13: Run a small validation wave

**Objective:** Learn before scaling outreach.

Send only after Tasks 1–12 pass.

First wave:

- 3 close-fit independent tutors/author schools;
- 2 small/medium schools;
- 1 methodologist/community contact.

Track:

- sent timestamp;
- channel;
- exact message;
- delivery evidence;
- reply;
- objection or confusion;
- interview booked;
- landing-page comprehension issue.

After six contacts, review responses before sending more. Update positioning based on repeated evidence, not one-off preferences.

---

## Immediate next action requiring user input

Complete Task 1 and Task 3 together in a 45–60 minute product evidence session. Required inputs from the project owner:

1. link or access to the current TeachFlow product/prototype;
2. list of what actually works now;
3. one real teacher or teaching workflow that may be anonymized;
4. real materials from one lesson;
5. intended pilot format, if already defined.

If no working prototype or real teacher case exists, the next deliverable is not a landing page. It is a narrow clickable prototype and 5–7 problem interviews.

---

## Success criteria

The reset is complete only when:

- an unfamiliar visitor can explain TeachFlow correctly;
- the page shows one real scenario rather than illustrative filler;
- current functionality and future vision are visibly separated;
- the difference from the actual tool stack is concrete;
- the pilot offer has clear boundaries;
- the landing page, deck and outreach say the same thing;
- outreach starts with a six-contact learning wave, not a mass campaign.
