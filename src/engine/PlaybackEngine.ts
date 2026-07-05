
import { OpenSheetMusicDisplay, Cursor, Note } from "opensheetmusicdisplay";
import { GraphicalNote } from "opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalNote";
import { audio } from "../audio/Synth";

export class PlaybackEngine {
    private osmd: OpenSheetMusicDisplay;
    private cursor: Cursor | null = null;
    private isPlaying: boolean = false;
    private lastMeasureNumber: number = 0;

    private getCursor(): Cursor | null {
        if (!this.cursor) {
            this.cursor = this.osmd.cursor || null;
        }
        return this.cursor;
    }

    private shouldPlayWithPedal(): boolean {
        if (!this.osmd.Sheet) return false;
        const composer = (this.osmd.Sheet.ComposerString || "").toLowerCase();
        const title = (this.osmd.Sheet.TitleString || "").toLowerCase();
        
        // Composers whose piano pieces standardly use sustain pedal
        const pedalComposers = [
            "zimmer", "einaudi", "faulkner", "chopin", "debussy", "satie", 
            "yiruma", "vanzo", "schubert", "liszt", "pachelbel", "gaga", "beethoven"
        ];
        
        if (pedalComposers.some(c => composer.includes(c))) {
            return true;
        }
        
        // Specific titles or files that use sustain pedal
        const pedalTitles = [
            "nuvole", "interstellar", "ballade", "clair de lune", "nocturne", 
            "liebestraum", "rain", "sunlight", "canon", "always remember us"
        ];
        if (pedalTitles.some(t => title.includes(t))) {
            return true;
        }

        return false;
    }
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
    private onStep: ((midiNotes: number[]) => void) | null = null;

    public setStepCallback(cb: (midiNotes: number[]) => void) {
        this.onStep = cb;
    }

    private loopStart: number | null = null;
    private loopEnd: number | null = null;

    private highlightNotes: boolean = false;
    private currentStyledNotes: GraphicalNote[] = [];
    private activeVisualNotes: Map<number, number> = new Map();
    private isMuted: boolean = false;
    public practicedHand: 'both' | 'right' | 'left' = 'both';

    constructor(osmd: OpenSheetMusicDisplay) {
        this.osmd = osmd;
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
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
    }

    public setHighlightSettings(enable: boolean) {
        this.highlightNotes = enable;
        if (!enable) {
            this.clearHighlights();
        }
    }

    private clearHighlights() {
        const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
        const defaultColor = isDark ? "#f3f4f6" : "#000000";
        this.currentStyledNotes.forEach(gn => {
            gn.setColor(defaultColor, { applyToNoteheads: true, applyToStem: true, applyToBeams: true });
        });
        this.currentStyledNotes = [];
    }
    public highlightCurrentNotes(correctSet?: Set<number>, incorrectSet?: Set<number>) {
        const cursor = this.getCursor();
        if (!cursor) return;

        // 1. Clear previous highlights
        this.clearHighlights();

        // 2. Highlight notes under cursor
        const gNotes = cursor.GNotesUnderCursor();
        gNotes.forEach(gn => {
            // @ts-ignore
            if (gn.setColor) {
                let color = "#f59e0b"; // Default expected: Amber
                
                // Extract MIDI key if structurally present to map to correct/incorrect sets
                // @ts-ignore
                if (gn.sourceNote && gn.sourceNote.Pitch) {
                    // @ts-ignore
                    const midi = gn.sourceNote.Pitch.getHalfTone() + 12;
                    if (correctSet?.has(midi)) {
                        color = "#10b981"; // Correct: Emerald Green
                    } else if (incorrectSet?.has(midi)) {
                        color = "#ef4444"; // Incorrect: Rose Red
                    }
                }

                // @ts-ignore
                gn.setColor(color, { applyToNoteheads: true, applyToStem: true, applyToBeams: true });
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
        const cursor = this.getCursor();
        if (!cursor) return 0;
        return cursor.Iterator.currentTimeStamp.RealValue;
    }

    public get CurrentMeasureNumber(): number {
        const cursor = this.getCursor();
        if (!cursor || !cursor.Iterator || !cursor.Iterator.CurrentMeasure) return 1;
        return cursor.Iterator.CurrentMeasure.MeasureNumber;
    }

    public getMeasureTimestamp(measureIndex: number): number | null {
        if (!this.osmd.Sheet || !this.osmd.Sheet.SourceMeasures) return null;
        const measures = this.osmd.Sheet.SourceMeasures;

        // Handle end of score (exclusive index == count)
        if (measureIndex === measures.length) {
            return this.TotalDuration;
        }

        if (measureIndex < 0 || measureIndex >= measures.length || !measures[measureIndex]) return null;
        return measures[measureIndex].AbsoluteTimestamp.RealValue;
    }

    public getMeasureAtTimestamp(timestamp: number): number {
        if (!this.osmd.Sheet || !this.osmd.Sheet.SourceMeasures) return 0;
        const measures = this.osmd.Sheet.SourceMeasures;
        if (measures.length === 0) return 0;

        // Find the measure whose start timestamp is closest to, or just before, the given timestamp
        for (let i = 0; i < measures.length; i++) {
            const currentVal = measures[i]?.AbsoluteTimestamp?.RealValue ?? 0;
            const nextVal = (i + 1 < measures.length && measures[i + 1])
                ? measures[i + 1].AbsoluteTimestamp.RealValue
                : this.TotalDuration;
            
            if (timestamp >= currentVal && timestamp < nextVal) {
                return i;
            }
        }

        if (timestamp >= this.TotalDuration) {
            return measures.length - 1;
        }

        return 0;
    }

    public getNotesAtCurrentPosition(): { midi: number, isTied: boolean }[] {
        const cursor = this.getCursor();
        if (!cursor) return [];
        const notes = cursor.NotesUnderCursor();
        const result: { midi: number, isTied: boolean }[] = [];
        notes.forEach(note => {
            if (!note.isRest() && note.Pitch) {
                // Filter by practicedHand clef if selected
                // Staff index is 1-based. Id === 1 is treble (RH), Id === 2 is bass (LH)
                if (this.practicedHand === 'right' && note.ParentStaff?.Id !== 1) {
                    return;
                }
                if (this.practicedHand === 'left' && note.ParentStaff?.Id !== 2) {
                    return;
                }

                // Check if this note is a tied note (continuation)
                // If NoteTie exists, check if we are the StartNote.
                // If we are NOT the StartNote, then we are a continuation (isTied = true).
                let isTied = false;
                if (note.NoteTie) {
                    // NoteTie exists. 
                    // If StartNote is this note, we are the start (isTied = false, fresh attack needed).
                    // If StartNote is DIFFERENT, we are continuation (isTied = true).
                    if (note.NoteTie.StartNote !== note) {
                        isTied = true;
                    }
                }

                result.push({
                    midi: note.Pitch.getHalfTone() + 12,
                    isTied: isTied
                });
            }
        });
        return result;
    }

    public nextStep() {
        const cursor = this.getCursor();
        if (!cursor) return;
        cursor.next();
        cursor.update(); // Update visuals immediately
    }

    public get MeasureCount(): number {
        if (!this.osmd.Sheet) return 0;
        return this.osmd.Sheet.SourceMeasures.length;
    }

    public seek(targetRealValue: number) {
        const cursor = this.getCursor();
        if (!cursor) return;

        // Pause playback momentarily to prevent race conditions?
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.stop(); // Stop audio, clear timeouts

        cursor.reset();

        // Fast forward to target
        // This is efficient enough for small scores, might need optimization for large ones.
        while (!cursor.Iterator.EndReached &&
            cursor.Iterator.currentTimeStamp.RealValue < targetRealValue) {
            cursor.next();
        }

        cursor.update(); // Update visuals

        // Update progress callback immediately
        if (this.onProgress) {
            this.onProgress(cursor.Iterator.currentTimeStamp.RealValue, this.TotalDuration);
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
            (this.osmd.cursor as any)?.show();
        }
        this.cursor = this.osmd.cursor || null;
        this.isPlaying = true;
        if (this.playbackCallback) this.playbackCallback(true);

        this.lastMeasureNumber = 0;
        if (this.shouldPlayWithPedal()) {
            audio.setSustain(true);
        }

        // Advance immediately to start/resume
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
        this.lastMeasureNumber = 0;
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
        audio.setSustain(false);
        this.lastMeasureNumber = 0;
    }

    private clearNoteTimeouts() {
        this.noteTimeouts.forEach(id => window.clearTimeout(id));
        this.noteTimeouts = [];
        this.activeVisualNotes.clear();
        this.clearHighlights();
    }

    private step() {
        const cursor = this.getCursor();
        if (!this.isPlaying || !cursor) return;

        // 1. Get Notes and Play them immediately with a lookahead to decouple from UI thread blockages
        const notes: Note[] = cursor.NotesUnderCursor();
        const stepMidis = notes
            .map(n => n.halfTone !== undefined ? n.halfTone + 12 : n.Pitch ? n.Pitch.getHalfTone() + 12 : 0)
            .filter(n => n > 0);

        if (this.onStep) {
            this.onStep(stepMidis);
        }
        const lookahead = 0.035; // 35ms audio scheduling lookahead
        const startTime = audio.now() + lookahead;

        notes.forEach(note => {
            if (note.isRest()) return;

            let midi = 0;
            if (note.halfTone !== undefined) {
                midi = note.halfTone + 12;
            } else if (note.Pitch) {
                midi = note.Pitch.getHalfTone() + 12;
            } else {
                return;
            }

            const noteDuration = note.Length.RealValue * (240 / this.bpm);

            // Schedule visual key press and release on keyboard overlay aligned to lookahead start
            const pressTime = lookahead * 1000;
            const releaseTime = (noteDuration * 1000 * 0.95) + pressTime;

            const pressTimeoutId = window.setTimeout(() => {
                const currentCount = this.activeVisualNotes.get(midi) || 0;
                this.activeVisualNotes.set(midi, currentCount + 1);
                if (currentCount === 0 && this.onNoteOn) {
                    this.onNoteOn(midi);
                }
            }, pressTime);
            this.noteTimeouts.push(pressTimeoutId);

            const releaseTimeoutId = window.setTimeout(() => {
                const currentCount = this.activeVisualNotes.get(midi) || 0;
                if (currentCount <= 1) {
                    this.activeVisualNotes.delete(midi);
                    if (this.onNoteOff) this.onNoteOff(midi);
                } else {
                    this.activeVisualNotes.set(midi, currentCount - 1);
                }
            }, releaseTime);
            this.noteTimeouts.push(releaseTimeoutId);

            // Mute playback for notes on the hand we are practicing!
            let isNoteMuted = this.isMuted;
            if (this.practicedHand === 'right' && note.ParentStaff?.Id === 1) {
                isNoteMuted = true;
            }
            if (this.practicedHand === 'left' && note.ParentStaff?.Id === 2) {
                isNoteMuted = true;
            }

            // Play the note in Tone.js with the scheduled startTime if not muted
            if (!isNoteMuted) {
                if (this.shouldPlayWithPedal()) {
                    audio.playNote(midi, 85, undefined, startTime);
                    const releaseTimeout = window.setTimeout(() => {
                        audio.releaseNote(midi);
                    }, (noteDuration + lookahead) * 1000);
                    this.noteTimeouts.push(releaseTimeout);
                } else {
                    audio.playNote(midi, 85, noteDuration, startTime);
                }
            }
        });

        // 2. Visual Feedback & UI Updates
        // Sustain Pedal measure boundary check
        const currentMeasure = this.CurrentMeasureNumber;
        if (this.shouldPlayWithPedal() && currentMeasure !== this.lastMeasureNumber) {
            audio.setSustain(false);
            audio.setSustain(true);
            this.lastMeasureNumber = currentMeasure;
        }

        // Highlight notes under cursor, but skip heavy notehead recoloring at high tempos (BPM > 150)
        // to prevent rendering lag from ruining the audio timing loop.
        this.clearHighlights();
        const shouldVisualHighlight = this.highlightNotes && this.bpm <= 150;

        if (shouldVisualHighlight) {
            const gNotes = cursor.GNotesUnderCursor();
            gNotes.forEach(gn => {
                // @ts-ignore
                if (gn.setColor) {
                    // @ts-ignore
                    gn.setColor("#3b82f6", { applyToNoteheads: true, applyToStem: true, applyToBeams: true });
                    this.currentStyledNotes.push(gn as unknown as GraphicalNote);
                }
            });
        }

        // Report Progress
        const iterator = cursor.Iterator;
        if (this.onProgress) {
            this.onProgress(iterator.currentTimeStamp.RealValue, this.TotalDuration);
        }

        // Detect Tempo from CurrentMeasure's TempoInBPM
        if (iterator && iterator.CurrentMeasure) {
            const mBpm = iterator.CurrentMeasure.TempoInBPM;
            if (mBpm && mBpm > 0) {
                this.bpm = mBpm;
            }
        }
        const currentBpm = this.bpm;

        // Loop Check
        if (this.loopEnd !== null && this.loopStart !== null) {
            if (iterator.currentTimeStamp.RealValue >= this.loopEnd) {
                if (this.onLoop) this.onLoop();
                // Clear current step timeouts and seek back without fully releasing audio synth
                if (this.intervalId) {
                    window.clearTimeout(this.intervalId);
                    this.intervalId = null;
                }
                this.clearNoteTimeouts();
                this.seek(this.loopStart);
                this.isPlaying = true;
                this.expectedNextStepTime = Date.now();
                this.step();
                return;
            }
        }

        if (iterator.EndReached) {
            this.stop();
            const curs = this.getCursor();
            if (curs) curs.reset();
            return;
        }

        // 3. Calculate Delay to next step
        let stepDuration = 0.05; // Fallback

        if (iterator) {
            try {
                const nextIterator = iterator.clone();
                nextIterator.moveToNext();
                if (!nextIterator.EndReached) {
                    const currentVal = iterator.currentTimeStamp.RealValue;
                    const nextVal = nextIterator.currentTimeStamp.RealValue;
                    const diff = nextVal - currentVal;
                    if (diff > 0) {
                        stepDuration = diff;
                    }
                } else {
                    // Fallback for the final step of the score
                    if (notes.length > 0) {
                        let maxDuration = 0;
                        notes.forEach(n => {
                            const d = n.Length.RealValue;
                            if (d > maxDuration) maxDuration = d;
                        });
                        stepDuration = maxDuration > 0 ? maxDuration : 0.25;
                    } else {
                        stepDuration = 0.25;
                    }
                }
            } catch (e) {
                console.warn("Failed to calculate exact step duration via iterator clone:", e);
                // Fallback to legacy note-based heuristic
                if (notes.length > 0) {
                    let minDuration = 100;
                    notes.forEach(n => {
                        const d = n.Length.RealValue;
                        if (d < minDuration && d > 0) minDuration = d;
                    });
                    stepDuration = minDuration;
                } else {
                    stepDuration = 0.125;
                }
            }
        }

        // Convert Whole Note duration to seconds for NEXT STEP
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
            const curs = this.getCursor();
            if (curs) curs.next();
            this.step();
        }, Math.max(0, delayMs));
    }

    public getExpectedNotesList(startTs: number, endTs: number): { midi: number; timeOffset: number; duration: number }[] {
        const cursor = this.getCursor();
        if (!cursor) return [];

        const originalTs = cursor.Iterator.currentTimeStamp.RealValue;
        
        // Reset to start of section
        cursor.reset();
        while (!cursor.Iterator.EndReached && cursor.Iterator.currentTimeStamp.RealValue < startTs) {
            cursor.next();
        }

        const list: { midi: number; timeOffset: number; duration: number }[] = [];
        let currentRealTime = 0; // Relative seconds from start of loop

        while (!cursor.Iterator.EndReached && cursor.Iterator.currentTimeStamp.RealValue < endTs) {
            const notes = cursor.NotesUnderCursor();
            const currentBpm = cursor.Iterator.CurrentMeasure?.TempoInBPM || this.bpm;
            
            let stepDuration = 0.05;
            try {
                const nextIterator = cursor.Iterator.clone();
                nextIterator.moveToNext();
                if (!nextIterator.EndReached) {
                    stepDuration = nextIterator.currentTimeStamp.RealValue - cursor.Iterator.currentTimeStamp.RealValue;
                } else {
                    stepDuration = 0.25;
                }
            } catch (e) {
                stepDuration = 0.25;
            }

            const secondsPerWhole = 240 / currentBpm;
            const stepDurationSec = stepDuration * secondsPerWhole;

            notes.forEach(note => {
                if (note.isRest()) return;
                const midi = note.halfTone !== undefined ? note.halfTone + 12 : (note.Pitch ? note.Pitch.getHalfTone() + 12 : 0);
                if (midi > 0) {
                    list.push({
                        midi,
                        timeOffset: currentRealTime,
                        duration: stepDurationSec
                    });
                }
            });

            currentRealTime += stepDurationSec;
            cursor.next();
        }

        // Restore original cursor position
        cursor.reset();
        while (!cursor.Iterator.EndReached && cursor.Iterator.currentTimeStamp.RealValue < originalTs) {
            cursor.next();
        }
        cursor.update();

        return list;
    }
}
