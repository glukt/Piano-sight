Specification Document: MIDI Sight-Reading Application

This specification outlines the technical requirements for a web-based MIDI-enabled sight-reading application. The application will leverage the Web MIDI API and Web Audio API to provide real-time feedback and pedagogical tools for musicians.
1. Core Architecture & Tech Stack

    Platform: Web-based (Responsive for Tablet/Desktop).

    Engine: Google Antigravity (AI-driven development).

    Key APIs: * Web MIDI API: To interface with external hardware.

        Web Audio API: For low-latency polyphonic synthesis.

        Canvas/SVG Rendering: For dynamic sheet music generation and overlays.

2. Functional Requirements
2.1 MIDI Interface & Playback

    Connectivity: Automated detection of MIDI input devices upon user gesture.

    Low-Latency Synthesis: Triggering high-fidelity piano samples or oscillator-based tones corresponding to NoteOn messages.

    Sustain Support: Integration of CC#64 (Sustain Pedal) to manage note release envelopes and visual duration.

2.2 Dynamic Sheet Music Engine

    Grand Staff Rendering: Visual display of Treble and Bass clefs.

    Note Highlighting: * Active Target: The current required note is highlighted (e.g., #007BFF).

        Real-time Validation: If the user plays the correct note, the highlight advances; if incorrect, the note flashes red (#FF0000).

    Scoring System: * Accumulation of Accuracy (percentage of correct vs. total notes).

        Latency tracking (time between visual prompt and MIDI input).

2.3 Visual Watermark Overlays (Toggled)

A key pedagogical feature involving a background "watermark" layer on the staff:

    Scale Identification: Faded, color-coded markers behind the staff lines representing the current scale/key.

    Note Labels: Large, semi-transparent alphanumeric characters (A, B, C, etc.) positioned behind the notes to aid identification without obstructing the notation.

    Sharp/Flat Indication: Context-aware visuals that shift based on the selected Key Signature.

2.4 Difficulty Scaling

The application shall implement a tiered difficulty system:

    Novice: Single staff (Treble), C-Major, rhythmic simplicity (whole/half notes).

    Intermediate: Grand staff, basic key signatures (up to 2 sharps/flats), eighth notes.

    Advanced: Complex key signatures, accidentals, syncopation, and polyphonic chords.

3. Data Flow & Event Logic
Event	Logic	Result
MIDI NoteOn	Compare midi_pitch vs target_note_pitch	Update UI (Green/Red) and play audio
Sustain CC Change	Check value >= 64	Extend AudioContext release phase
Toggle Overlay	CSS opacity shift on watermark layer	Shows/Hides background scale markers
4. MIDI Implementation Logic (Code Blueprint)
JavaScript

// High-level MIDI Input Handling Logic
async function initMIDI() {
  const access = await navigator.requestMIDIAccess();
  access.inputs.forEach(input => {
    input.onmidimessage = (message) => {
      const [status, note, velocity] = message.data;
      if (status === 144 && velocity > 0) { // Note On
        handleNoteInput(note);
      }
    };
  });
}

function handleNoteInput(playedNote) {
  const targetNote = currentPiece.getNextNote();
  if (playedNote === targetNote.midiValue) {
    triggerVisualFeedback(true);
    playSynthesis(playedNote);
    score.incrementCorrect();
    advancePointer();
  } else {
    triggerVisualFeedback(false);
    score.incrementIncorrect();
  }
}

5. UI/UX Design Goals

    Background: High-contrast white or "Sepia" for the staff, with low-opacity (10-15%) watermarks for the scale visuals.

    Feedback: Minimalist HUD (Heads-Up Display) showing current accuracy and difficulty level.

    Controls: Floating action buttons (FABs) for "Toggle Watermarks," "Reset Session," and "Difficulty Selector."