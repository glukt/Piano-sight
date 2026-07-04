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
