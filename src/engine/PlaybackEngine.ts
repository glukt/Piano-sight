
import { OpenSheetMusicDisplay, Cursor, Note } from "opensheetmusicdisplay";
import { GraphicalNote } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalNote";
import { audio } from "../audio/Synth";

export class PlaybackEngine {
    private osmd: OpenSheetMusicDisplay;
    private cursor: Cursor | null = null;
    private isPlaying: boolean = false;
    private intervalId: number | null = null;
    private noteTimeouts: number[] = [];
    private bpm: number = 100;
    // State to track playback
    private playbackCallback: ((isPlaying: boolean) => void) | null = null;
    private onNoteOn: ((midi: number) => void) | null = null;
    private onNoteOff: ((midi: number) => void) | null = null;
    private onProgress: ((current: number, total: number) => void) | null = null;
    private onLoop: (() => void) | null = null;
    private expectedNextStepTime: number = 0;

    private loopStart: number | null = null;
    private loopEnd: number | null = null;

    private highlightNotes: boolean = false;
    private currentStyledNotes: GraphicalNote[] = [];

    constructor(osmd: OpenSheetMusicDisplay) {
        this.osmd = osmd;
    }

    public get IsPlaying() {
        return this.isPlaying;
    }

    public setPlaybackCallback(cb: (isPlaying: boolean) => void) {
        this.playbackCallback = cb;
    }

    public setNoteCallbacks(onNoteOn: (midi: number) => void, onNoteOff: (midi: number) => void) {
        this.onNoteOn = onNoteOn;
        this.onNoteOff = onNoteOff;
    }

    public setProgressCallback(cb: (current: number, total: number) => void) {
        this.onProgress = cb;
    }

    public setLoopCallback(cb: () => void) {
        this.onLoop = cb;
    }

    public setLoop(start: number | null, end: number | null) {
        this.loopStart = start;
        this.loopEnd = end;
        console.log(`Loop set: ${start} - ${end}`);
    }

    public setHighlightSettings(enable: boolean) {
        this.highlightNotes = enable;
        if (!enable) {
            this.clearHighlights();
        }
    }

    private clearHighlights() {
        this.currentStyledNotes.forEach(gn => {
            // Revert to black (or original style if complex, but black is standard)
            // OSMD's setColor doesn't have a "revert" easily typically, but setting to black is safe for standard scores.
            gn.setColor("#000000", { applyToNoteheads: true, applyToStem: true, applyToBeams: true });
        });
        this.currentStyledNotes = [];
    }
    public highlightCurrentNotes() {
        if (!this.cursor) return;

        // 1. Clear previous highlights
        this.clearHighlights();

        // 2. Highlight notes under cursor
        const gNotes = this.cursor.GNotesUnderCursor();
        gNotes.forEach(gn => {
            // @ts-ignore
            if (gn.setColor) {
                // Use a distinct color for Wait Mode? Or standard Blue?
                // Let's use Orange/Yellow if we passed an argument, but for now standard Blue.
                // Wait, user wants "Wait Mode" highlighting.
                // Maybe add color argument.
                // @ts-ignore
                gn.setColor("#f59e0b", { applyToNoteheads: true, applyToStem: true, applyToBeams: true }); // Amber/Orange
                this.currentStyledNotes.push(gn as unknown as GraphicalNote);
            }
        });
    }

    public get TotalDuration(): number {
        // Return total duration in "XML Fraction Value"
        // This is a rough estimation of measure numbers / beats.
        if (!this.osmd.Sheet) return 0;
        // Use the timestamp of the last measure's end?
        const lastMeasure = this.osmd.Sheet.getLastSourceMeasure();
        if (lastMeasure) {
            return lastMeasure.AbsoluteTimestamp.RealValue + lastMeasure.Duration.RealValue;
        }
        return 0;
    }

    public get CurrentTimestamp(): number {
        if (!this.cursor) return 0;
        return this.cursor.Iterator.currentTimeStamp.RealValue;
    }

    public getMeasureTimestamp(measureIndex: number): number | null {
        if (!this.osmd.Sheet) return null;
        const measures = this.osmd.Sheet.SourceMeasures;
        if (measureIndex < 0 || measureIndex >= measures.length) return null;
        return measures[measureIndex].AbsoluteTimestamp.RealValue;
    }

    public getNotesAtCurrentPosition(): number[] {
        if (!this.cursor) return [];
        const notes = this.cursor.NotesUnderCursor();
        const midiNotes: number[] = [];
        notes.forEach(note => {
            if (!note.isRest() && note.Pitch) {
                midiNotes.push(note.Pitch.getHalfTone() + 12);
            }
        });
        return midiNotes;
    }

    public nextStep() {
        if (!this.cursor) return;
        this.cursor.next();
        this.cursor.update(); // Update visuals immediately
    }

    public get MeasureCount(): number {
        if (!this.osmd.Sheet) return 0;
        return this.osmd.Sheet.SourceMeasures.length;
    }

    public seek(targetRealValue: number) {
        if (!this.cursor) return;

        // Pause playback momentarily to prevent race conditions?
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.stop(); // Stop audio, clear timeouts

        this.cursor.reset();

        // Fast forward to target
        // This is efficient enough for small scores, might need optimization for large ones.
        while (!this.cursor.Iterator.EndReached &&
            this.cursor.Iterator.currentTimeStamp.RealValue < targetRealValue) {
            this.cursor.next();
        }

        this.cursor.update(); // Update visuals

        // Update progress callback immediately
        if (this.onProgress) {
            this.onProgress(this.cursor.Iterator.currentTimeStamp.RealValue, this.TotalDuration);
        }

        if (wasPlaying) {
            this.play();
        }
    }

    public async play() {
        if (this.isPlaying) return;

        if (!this.osmd.cursor) {
            // Check if cursor exists, if not it might be initialized on render.
            // But cursor property is on the instance.
            // Type definition says `cursor` property exists.
            this.osmd.cursor.show();
        }
        this.cursor = this.osmd.cursor;
        this.isPlaying = true;
        if (this.playbackCallback) this.playbackCallback(true);

        // Advance immediately to start/resume
        console.log("Playback started");
        this.expectedNextStepTime = Date.now();
        this.step();
    }

    public stop() {
        this.isPlaying = false;
        if (this.intervalId) {
            window.clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        this.clearNoteTimeouts();

        if (this.playbackCallback) this.playbackCallback(false);

        if (this.onProgress) {
            this.onProgress(0, this.TotalDuration);
        }

        // Reset Audio
        audio.releaseAll();
        audio.setSustain(false);
    }

    public pause() {
        this.isPlaying = false;
        if (this.intervalId) {
            window.clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        this.clearNoteTimeouts();

        if (this.playbackCallback) this.playbackCallback(false);
        audio.releaseAll();
    }

    private clearNoteTimeouts() {
        this.noteTimeouts.forEach(id => window.clearTimeout(id));
        this.noteTimeouts = [];
        this.clearHighlights();
    }

    private step() {
        if (!this.isPlaying || !this.cursor) return;

        // 1. Get Notes at current position
        const notes: Note[] = this.cursor.NotesUnderCursor();

        // -------------------------------------------------------------
        // Visual Feedback: Note Highlighting
        // -------------------------------------------------------------
        this.clearHighlights(); // Clear previous step

        if (this.highlightNotes) {
            // Get Graphical Notes
            const gNotes = this.cursor.GNotesUnderCursor();
            gNotes.forEach(gn => {
                // Determine highlight color? (e.g. blue for playback)
                // Use type assertion if necessary, but GraphicalNote should be available.
                // We need to validte if setColor exists (it should per d.ts)
                // @ts-ignore
                if (gn.setColor) {
                    // @ts-ignore
                    gn.setColor("#3b82f6", { applyToNoteheads: true, applyToStem: true, applyToBeams: true });
                    this.currentStyledNotes.push(gn as unknown as GraphicalNote);
                }
            });
        }
        // -------------------------------------------------------------

        // 2. Determine Duration of this step

        // 2. Determine Duration of this step
        // We look at the shortest note duration to determine when to call next() ??
        // Actually, the cursor iterates through "VoiceEntries". 
        // We need to look at the iterator's current timestamp difference to the next timestamp.

        const iterator = this.cursor.Iterator;

        // Loop Check
        if (this.loopEnd !== null && this.loopStart !== null) {
            if (iterator.currentTimeStamp.RealValue >= this.loopEnd) {
                if (this.onLoop) this.onLoop();
                this.stop(); // Clear current notes
                this.seek(this.loopStart);
                this.play(); // Resume
                return;
            }
        }

        if (iterator.EndReached) {
            this.stop();
            this.cursor.reset();
            return;
        }

        // 3. Play Notes
        // We need to group them by "Voice" or just play all?
        // Play all 
        const midiNotes: number[] = [];
        notes.forEach(note => {
            // Check if it's a rest
            if (note.isRest()) return;

            // Calculate MIDI note
            // Debug note object to find correct pitch property
            // console.log("Note:", note);

            // Access pitch safely
            // Note: note.halfTone should be correct for OSMD.
            // But let's verify if 'Pitch' object exists.
            let midi = 0;
            if (note.halfTone !== undefined) {
                midi = note.halfTone + 12;
            } else if (note.Pitch) {
                midi = note.Pitch.getHalfTone() + 12;
            } else {
                console.warn("Note has no pitch/halfTone:", note);
                return;
            }

            console.log(`Playing Note: MIDI ${midi}`);
            midiNotes.push(midi);

            // Synth.ts expects MIDI velocity (0-127) because it divides by 127.
            // Passing 0.7 resulted in 0.005 (silent).
            // Sending 85 (~0.67) for mezzo-forte.
            // Calculate duration in seconds
            // Duration (Whole Notes) * (240 / BPM) = Seconds
            // e.g. Quarter (0.25) * 240 / 60 (4s) = 1s.
            const noteDuration = note.Length.RealValue * (240 / this.bpm);

            // Schedule Release
            // Subtract a tiny amount to ensure release happens before next attack of same note?
            // "Gate" time: 95% of duration
            const releaseTime = noteDuration * 1000 * 0.95;

            const timeoutId = window.setTimeout(() => {
                audio.releaseNote(midi);
                if (this.onNoteOff) this.onNoteOff(midi);
            }, releaseTime);
            this.noteTimeouts.push(timeoutId);

            audio.playNote(midi, 85);
            if (this.onNoteOn) this.onNoteOn(midi);
        });

        // Report Progress
        if (this.onProgress) {
            this.onProgress(iterator.currentTimeStamp.RealValue, this.TotalDuration);
        }

        // Detect Tempo from Iteartor
        // OSMD Iterator has "CurrentBpm" property!
        // It might return 0 if not set, so default to 100.
        // @ts-ignore
        const iteratorBpm = iterator.CurrentBpm || 100;
        this.bpm = iteratorBpm; // Update current BPM for reference

        const currentBpm = this.bpm;

        // 4. Calculate Delay to next step
        // ... (existing heuristic for stepDuration) ...
        let stepDuration = 0.05; // Fallback

        if (notes.length > 0) {
            let minDuration = 100;
            notes.forEach(n => {
                const d = n.Length.RealValue;
                if (d < minDuration && d > 0) minDuration = d;
            });
            stepDuration = minDuration;
        } else {
            stepDuration = 0.125; // 8th note
        }

        // Convert Whole Note duration to seconds for NEXT STEP
        // Duration * (240 / BPM)

        // Use the currentBpm we parse
        const secondsPerWhole = 240 / currentBpm;
        const stepDelaySeconds = stepDuration * secondsPerWhole;

        // Calculate expected time for NEXT step
        this.expectedNextStepTime += stepDelaySeconds * 1000;

        // Calculate actual delay for setTimeout, accounting for processing time drift
        const now = Date.now();
        const delayMs = this.expectedNextStepTime - now;

        // If we are significantly behind (e.g. debugging caused lag), reset expected time
        if (delayMs < -100) {
            this.expectedNextStepTime = now;
        }

        this.intervalId = window.setTimeout(() => {
            // Advance
            this.cursor?.next();
            this.step();

            // Do NOT releaseAll() here. Individual notes handle their own release.

        }, Math.max(0, delayMs));
    }
}
