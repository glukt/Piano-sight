# Project Guidelines & Context Memory - Piano Sight 🎹

This file is automatically loaded by the agent framework at the beginning of each coding session. It preserves project memory, core rules, and architectural constraints to prevent session drift and hallucinations.

---

## 1. Project Overview & Tech Stack
- **Framework**: React 18, TypeScript, Vite
- **Layout & Styling**: Tailwind CSS, Vanilla CSS
- **Sheet Music Rendering**: VexFlow (OSMD is imported for legacy scoring but VexFlow is the active engine for interactive lessons)
- **Audio synthesis**: SoundFont2 player synth with Web Audio API pitch detection

---

## 2. Core Architectural Rules

### 2.1 The Note Padding & Alignment Rule
> [!CRITICAL]
> - Treble and bass clef note arrays must always be padded with rests to match the exact same total duration *before* generating aligned evaluation steps or rendering staves.
> - Padding must occur at the hook level (`paddedLevelData` in `useGameLogic.ts`) so that VexFlow display staves and evaluation indices map 1-to-1.
> - Never pass unpadded staves to `alignNotes` or `<MusicDisplay>` as this causes cursor drift and note synchronization errors.

### 2.2 Lesson Reference Protection
> [!IMPORTANT]
> - JavaScript passes objects inside static lesson databases (like `CourseData.ts`) by reference.
> - When generating level data from preset melodies in `LevelGenerator.ts`, **always deep-clone** the staves:
>   ```typescript
>   let treble = presetMelody.treble.map(n => ({ keys: [...n.keys], duration: n.duration }));
>   ```
> - Mutating these arrays directly will corrupt the course database for subsequent runs.

### 2.3 Dynamic BPM / Tempo Control
> [!NOTE]
> - Each lesson has an optional `bpm` property.
> - The metronome, playhead, and demo playback speed must load this BPM dynamically: `const BPM = currentLesson?.bpm || 80;` instead of using a hardcoded global tempo.

### 2.4 Playback Cleanup on Exit
- Whenever leaving a lesson, the `exitLesson` callback must trigger both `stopDemo()` and `stopRhythm()` to immediately stop active synthesizer notes, metronome ticks, and animation loop playheads.

### 2.5 Viewport Centering & Scrolling Staff
- For long songs, the score renderer calculates a dynamic stave width based on note count (`noteCount * 55 + 100`) to prevent squishing.
- The score SVG is rendered inside a scrollable horizontal container.
- When `cursorIndex` changes, a scroll animation smoothly slides the container to center the active note in the viewport:
  ```typescript
  const scrollTarget = noteX - containerWidth / 2;
  container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
  ```

---

## 3. Directory Layout
- `public/scores/` - MusicXML library files (.mxl)
- `scripts/` - Python utility scripts (generators, converters)
- `src/audio/` - SoundFonts, synthesizer, and pitch detector
- `src/components/` - React components (gameplay, library, statistics)
- `src/engine/` - Level generation and VexFlow alignment utils
- `src/hooks/` - useGameLogic, useRhythmEngine, usePracticeMode
- `src/utils/` - CourseData, key signatures, constants

---

## 4. Automation Agent Rules

### 4.1 Wakeup Schedule
- Wake up every **30 minutes** via the `/schedule` system.
- Each wakeup should complete **2-3 tasks** from the backlog.
- Stability audit runs **once per calendar day** (check `auto_state.json → lastStabilityAuditDate`), not every 9 wakeups.

### 4.2 Model Selection Strategy
- **Primary**: `gemini-2.5-flash` for all tasks.
- **Fallback**: `claude-sonnet-4-6` (Claude Sonnet 4.6 with thinking) when Gemini token quota is exhausted.
- **Local LLM**: Route boilerplate code generation (new lesson data, repetitive TypeScript interfaces, JSON data) to `qwen2.5-coder:latest` via Ollama at `http://localhost:11434` to conserve cloud tokens.
- **Ollama invocation**: Call `POST http://localhost:11434/api/generate` with `{"model":"qwen2.5-coder:latest","prompt":"...","stream":false}`.

### 4.3 Priority Routing
- **#1 Priority**: Wait Mode overhaul (tasks 040-042 and future Wait Mode bugs).
- Audit iterations must focus improvement discovery on rhythm/wait mode UX before other areas.
- State file: `auto_state.json → priorities.topPriority`.

### 4.4 OSMD & Note Parsing Guards
- All `note.Pitch.getHalfTone()` calls must be wrapped in try/catch to guard against `NoteEnum[j.FundamentalNote] is undefined` errors from percussion/unpitched MXL tracks.
- OSMD constructor must include `percussionOneLinedStaves: false` and `skipOutputWhenFaceValueNull: true`.

### 4.5 Wait Mode Architecture
- **Hand filter**: In `gameMode='treble'`, only accept notes that are in `requiredNotes` OR in `trebleRangeMidi` AND have MIDI >= 48. Do NOT use raw `trebleRangeMidi.has(n)` alone — that set contains MIDI numbers from the whole song and can include bass-range notes.
- **Rest steps in Wait Mode**: Immediately call `advanceCursor()` synchronously when `requiredNotes.size === 0 && !isRhythmMode` — do NOT start a polling interval for rest notes.
- **Loop practice**: The loop start/end is stored in `loopRange` state; `advanceCursor()` wraps back to `loopRange.startStep` when it exceeds `loopRange.endStep`.
- **PreHeld guard**: After a cursor advance, `notesActiveAtStepStart` is reset to the current active notes to prevent the same held note from counting as the next note press.
