# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A dedicated NEET 2027 medical entrance aspirant preparing over a multi-year cycle targeting a top medical college (AIIMS / Top Government Medical Colleges) with a score of 700+ out of 720.

Operating situation: High-intensity, rigorous daily deep-work sessions (6–12 hours/day) across Physics, Chemistry, and Biology. Requires high scanability, rapid task logging, distraction-free environment, and fast progress tracking across desktop and mobile.

## Product Purpose

A personalized, high-performance mission-control dashboard engineered specifically for NEET 2027 preparation. It eliminates decision fatigue by consolidating syllabus progress, daily high-yield task queues, mock test analytics, active-recall trap cards, and focus-enhancing ambient audio into a single, cohesive dashboard.

Success means zero friction in logging prep daily, objective clarity on weak areas and high-yield chapters, unwavering study consistency, and measurable score improvement leading up to May 2027.

## Positioning

Unlike generic habit trackers or clunky coaching LMS portals, NEET 2027 Prep Command Center is custom-built around the specific reality of the NEET exam:
- NTA NEET chapter breakdown by Class 11 and 12 across Physics, Chemistry, and Biology.
- Triple-checkpoint mastery tracking (NCERT Reading, PYQ Practice, Multi-stage Revision) with chapter-level difficulty weighting.
- Integrated high-yield Smart Focus Queue to counter procrastination on hard topics.
- Built-in study audio engine with synced Spotify/YouTube lo-fi and binaural focus streams that stay persistent during navigation.

## Operating Context

- Used daily during long study blocks on desktop/laptop and on mobile during quick revision or breaks.
- Ambient focus rituals: Lo-Fi/Alpha Waves study stream running in background while solving NCERT back-exercises and previous years' questions (PYQs).
- Periodic mock test logging: inputting scores across Physics, Chemistry, Botany, and Zoology to inspect score trajectories, accuracy ratios, and error distribution.

## Capabilities and Constraints

- **Syllabus Roadmap:** Complete Class 11 & 12 NEET syllabus with 2-column subject grid, interactive difficulty selector (Easy, Medium, Hard), search & filter pills, and granular progress toggles.
- **Deep Settings & Customization (Primary focus):** Configurable daily study hours, target score (e.g., 700+, 710+), custom exam date countdown, timer presets (Pomodoro intervals / stopwatch targets), and audio/notification preferences.
- **Focus Engine:** Dual-mode timer (Pomodoro & Stopwatch), Daily To-Do list with priority filtering (High/Med/Low), and NEET 2027 target countdown.
- **Trap Cards:** Spaced active-recall deck for high-frequency trick questions, exceptions, and common negative-marking pitfalls.
- **Audio Hub:** YouTube Music & Binaural focus audio with dual interface (embedded screen player + synchronized floating bottom player pill).
- **Persistence & Cloud Sync:** Transitioning to full Cloud-first sync (Firebase Auth + Firestore/Database) across devices with local caching fallback and JSON import/export backup.

## Brand Commitments

- Name: NEET 2027 Prep Command Center ("NEET27 Target 700+").
- Aesthetic commitment: Obsidian dark mission-control palette (`#0e1013` dark canvas, `#1a1d24` frosted cards, neon green `#55e357` accent, orange `#f97316` badges, clean rounded capsule geometry `rounded-3xl` / `rounded-full`).
- Voice: Focused, motivating, no-nonsense, disciplined.

## Evidence on Hand

- Real syllabus catalog in `src/data/syllabus.json` containing comprehensive Class 11 & 12 Physics, Chemistry, and Biology chapters.
- Default NEET trap card database in `src/data/defaultTraps.json`.
- Live Firebase integration configured in `src/utils/firebase.js` with Google OAuth and Email Authentication.
- Existing codebase in `src/` running on Vite + React 18 + Tailwind CSS.

## Product Principles

1. **Frictionless Action over Administrative Overhead:** Adding a task, toggling a chapter revision, or starting a study session must take exactly one click or tap.
2. **Ruthless High-Yield Prioritization:** Always surface what moves the needle most (unmastered high-yield topics, repeat traps, negative-marking causes) ahead of low-yield busywork.
3. **Immersive Focus Flow:** The dashboard is a calm, dark cockpit that supports deep concentration rather than distracting from it; audio and timers integrate seamlessly without interrupting study.
4. **Data Integrity & Continuity:** Every minute studied, question logged, and chapter mastered is securely recorded and synced so progress is never lost over the 2-year preparation journey.
