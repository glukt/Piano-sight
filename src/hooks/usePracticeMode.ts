import { useState, useEffect, useCallback, useRef } from 'react';
import { PlaybackEngine } from '../engine/PlaybackEngine';

interface PracticeSection {
    startMeasure: number; // 0-indexed
    endMeasure: number;   // Exclusive
}

export type PracticeModeType = 'preview' | 'wait' | 'tempo';

interface UsePracticeModeProps {
    playbackEngine: PlaybackEngine | null;
    totalMeasures: number;
    userActiveNotes: Set<number>;
    onNoteCorrect?: () => void;
    onSectionComplete?: () => void;
}

export function usePracticeMode({
    playbackEngine,
    totalMeasures,
    userActiveNotes,
    onNoteCorrect,
    onSectionComplete
}: UsePracticeModeProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentSection, setCurrentSection] = useState<PracticeSection>({ startMeasure: 0, endMeasure: 2 });
    const [mode, setMode] = useState<PracticeModeType>('preview');
    const [accuracy, setAccuracy] = useState(100);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [previewLoopCount, setPreviewLoopCount] = useState(0);
    const [expectedNotes, setExpectedNotes] = useState<number[]>([]);

    // Accuracy Tracking
    const [notesCorrect, setNotesCorrect] = useState(0);
    const [notesMissed, setNotesMissed] = useState(0);
    const [lastSuccessfulNotes, setLastSuccessfulNotes] = useState<Set<number>>(new Set());
    const [errorMeasures, setErrorMeasures] = useState<Record<number, number>>({});
    const [isSongComplete, setIsSongComplete] = useState(false);

    // Track held wrong notes to avoid counting the same press multiple times
    const heldWrongNotesRef = useRef<Set<number>>(new Set());

    const isTransitioningRef = useRef(false);
    const transitionTimeoutRef = useRef<any>(null);

    const startPractice = useCallback((startMeasure?: number) => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        isTransitioningRef.current = false;
        setIsActive(true);
        const start = startMeasure !== undefined ? startMeasure : 0;
        const end = Math.min(start + 2, totalMeasures);
        setCurrentSection({ startMeasure: start, endMeasure: end });
        setMode(startMeasure !== undefined ? 'wait' : 'preview');
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback(startMeasure !== undefined ? "Review Session! Play these notes." : "Listen to this section...");
        setErrorMeasures({});
        setIsSongComplete(false);
    }, [totalMeasures]);

    const stopPractice = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        isTransitioningRef.current = false;
        setIsActive(false);
        playbackEngine?.stop();
        playbackEngine?.setLoop(null, null);
    }, [playbackEngine]);

    const nextSection = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        isTransitioningRef.current = false;

        const nextStart = currentSection.endMeasure;
        const nextEnd = Math.min(nextStart + 2, totalMeasures);

        if (nextStart >= totalMeasures) {
            setFeedback("Practice Complete! Great job!");
            setIsActive(false);
            setIsSongComplete(true);
            playbackEngine?.stop();
            return;
        }

        // Force stop to clear notes and visuals immediately
        playbackEngine?.stop();

        setCurrentSection({ startMeasure: nextStart, endMeasure: nextEnd });
        setMode('preview'); // Reset to preview for new section
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback("New Section! Listen first.");
    }, [currentSection, totalMeasures, playbackEngine]);

    const retrySection = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        isTransitioningRef.current = false;

        setFeedback("Let's try that again. Focus on accuracy.");
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();

        // Reset to preview mode. The useEffect will handle stopping and seeking.
        setMode('preview');
        setPreviewLoopCount(0);
    }, []);

    const prevSection = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        isTransitioningRef.current = false;

        const currentStart = currentSection.startMeasure;
        const prevStart = Math.max(0, currentStart - 2);
        const prevEnd = currentStart;

        if (currentStart === 0) {
            setFeedback("Already at the beginning!");
            return;
        }

        // Force stop to clear notes and visuals immediately
        playbackEngine?.stop();

        setCurrentSection({ startMeasure: prevStart, endMeasure: prevEnd });
        setMode('preview'); // Reset to preview for new section
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback("Previous Section! Listen first.");
    }, [currentSection, playbackEngine]);

    // Effect to handle Mode Transitions & Looping
    useEffect(() => {
        // cleanup when NOT active
        if (!isActive && playbackEngine) {
            playbackEngine.stop();
            playbackEngine.setLoop(null, null);
            return;
        }

        if (!isActive || !playbackEngine) return;

        const setupLoop = () => {
            // Get Timestamps from Engine
            const startTs = playbackEngine.getMeasureTimestamp(currentSection.startMeasure);
            const endTs = playbackEngine.getMeasureTimestamp(currentSection.endMeasure);

            if (startTs !== null && endTs !== null) {
                playbackEngine.setLoop(startTs, endTs);

                // Handle Loop Callback for Preview Counter
                playbackEngine.setLoopCallback(() => {
                    setPreviewLoopCount(prev => prev + 1);
                });

                // If in preview or tempo mode, start playing
                if (mode === 'preview' || mode === 'tempo') {
                    playbackEngine.seek(startTs);
                    playbackEngine.play();
                } else {
                    // Wait mode: Stop and wait for input
                    playbackEngine.stop();
                    playbackEngine.seek(startTs);
                    setFeedback("Play the notes to advance!");
                }
            }
        };

        setupLoop();

    }, [isActive, currentSection, mode, playbackEngine]);

    // Effect to auto-transition from Preview to Wait
    useEffect(() => {
        if (mode === 'preview' && previewLoopCount >= 2) {
            setMode('wait');
            // Stop immediately when switching to wait
            // playbackEngine?.stop(); // This is called in cleanup/effect but let's be explicit if needed.
            // Actually, useEffect above handles "Wait mode: Stop and wait".
            // So just setting mode is enough.
            setFeedback("Now you try! Play the notes.");
            // We do NOT need to seek here, the loop effect will do it.
            // But let's verify if 'wait' mode triggers loop effect seeking.
            // Yes: mode change -> useEffect -> setupLoop -> if mode != preview/tempo -> stop & seek.
            // So we can remove manual stop/seek here to avoid double seek.
        }
    }, [previewLoopCount, mode, playbackEngine, currentSection.startMeasure]);

    // Safety Effect to update endMeasure when totalMeasures finishes loading asynchronously
    useEffect(() => {
        if (isActive && currentSection.endMeasure === 0 && totalMeasures > 0) {
            setCurrentSection(prev => ({
                ...prev,
                endMeasure: Math.min(prev.startMeasure + 2, totalMeasures)
            }));
        }
    }, [totalMeasures, isActive, currentSection.endMeasure]);

    const [showHint, setShowHint] = useState(false);
    const stuckTimerRef = useRef(0);
    const prevExpectedNotesRef = useRef<string>("");

    // Active Note Overlapping / Legato Protection for Wait Mode
    const notesActiveAtStepStartRef = useRef<Set<number>>(new Set());
    const lastExpectedStrRef = useRef<string>("");

    // Refs to avoid constant cleanup/restart of the 50ms check interval
    const userActiveNotesRef = useRef(userActiveNotes);
    const lastSuccessfulNotesRef = useRef(lastSuccessfulNotes);
    const notesCorrectRef = useRef(notesCorrect);
    const notesMissedRef = useRef(notesMissed);
    const showHintRef = useRef(showHint);
    const currentSectionRef = useRef(currentSection);
    const onSectionCompleteRef = useRef(onSectionComplete);
    const nextSectionRef = useRef(nextSection);
    const retrySectionRef = useRef(retrySection);
    const onNoteCorrectRef = useRef(onNoteCorrect);

    useEffect(() => {
        userActiveNotesRef.current = userActiveNotes;
        lastSuccessfulNotesRef.current = lastSuccessfulNotes;
        notesCorrectRef.current = notesCorrect;
        notesMissedRef.current = notesMissed;
        showHintRef.current = showHint;
        currentSectionRef.current = currentSection;
        onSectionCompleteRef.current = onSectionComplete;
        nextSectionRef.current = nextSection;
        retrySectionRef.current = retrySection;
        onNoteCorrectRef.current = onNoteCorrect;
    });

    // Active Logic for Wait Mode
    useEffect(() => {
        if (!isActive || mode !== 'wait' || !playbackEngine) return;

        const checkInput = () => {
            if (isTransitioningRef.current) return;
            const currentExpectedObjs = playbackEngine.getNotesAtCurrentPosition();
            const currentExpectedMidis = currentExpectedObjs.map(n => n.midi);
            const currentExpectedStr = currentExpectedMidis.slice().sort().join(',');

            // Detect step change to capture currently held keys as "legato safety"
            if (currentExpectedStr !== lastExpectedStrRef.current) {
                notesActiveAtStepStartRef.current = new Set(userActiveNotesRef.current);
                lastExpectedStrRef.current = currentExpectedStr;
            } else {
                // Keep notesActiveAtStepStartRef in sync with releases
                const currentActive = userActiveNotesRef.current;
                notesActiveAtStepStartRef.current.forEach(n => {
                    if (!currentActive.has(n)) {
                        notesActiveAtStepStartRef.current.delete(n);
                    }
                });
            }

            // Check Stuck Timer
            if (currentExpectedObjs.length > 0) {
                if (currentExpectedStr === prevExpectedNotesRef.current) {
                    stuckTimerRef.current += 50; // Add 50ms
                    if (stuckTimerRef.current > 30000 && !showHintRef.current) {
                        setShowHint(true);
                    }
                } else {
                    // New notes! Reset.
                    stuckTimerRef.current = 0;
                    prevExpectedNotesRef.current = currentExpectedStr;
                    setShowHint(false);
                }
            } else {
                stuckTimerRef.current = 0;
                setShowHint(false);
            }


            // 1. Check for End of Section
            const currentTimestamp = playbackEngine.CurrentTimestamp;
            const endTimestamp = playbackEngine.getMeasureTimestamp(currentSectionRef.current.endMeasure);

            if (endTimestamp !== null && currentTimestamp >= endTimestamp) {
                isTransitioningRef.current = true;
                // End of Section Reached! Check Accuracy.
                const total = notesCorrectRef.current + notesMissedRef.current;
                // If total is 0 (empty section?), treat as 100%
                const acc = total > 0 ? (notesCorrectRef.current / total) * 100 : 100;
                setAccuracy(Math.round(acc));

                if (transitionTimeoutRef.current) {
                    clearTimeout(transitionTimeoutRef.current);
                }

                if (acc >= 90) {
                    setFeedback(`Great! Accuracy: ${Math.round(acc)}%. Moving on!`);
                    if (onSectionCompleteRef.current) onSectionCompleteRef.current(); // Major XP event
                    transitionTimeoutRef.current = setTimeout(() => nextSectionRef.current(), 1500);
                } else {
                    setFeedback(`Accuracy: ${Math.round(acc)}%. Let's try again.`);
                    transitionTimeoutRef.current = setTimeout(() => retrySectionRef.current(), 1500);
                }
                playbackEngine.stop(); // Stop checking
                setShowHint(false);
                return;
            }

            // 2. Handle Rests / Empty Steps
            if (currentExpectedObjs.length === 0) {
                playbackEngine.nextStep();
                setLastSuccessfulNotes(new Set());
                return;
            }

            // 3. Highlight Notes
            playbackEngine.highlightCurrentNotes();
            setExpectedNotes(currentExpectedMidis);

            // 4. Repeated Note Logic (Re-trigger check)
            // Identify notes that were correctly played in the PREVIOUS step
            // AND are still currently held by the user.
            // These notes must be released before they can count for the CURRENT step
            // UNLESS they are tied notes (isTied = true).
            const stillHeldFromPrevious = currentExpectedObjs.filter(n => {
                // If it is TIED, we ignore the "must release" rule.
                if (n.isTied) return false;

                // Otherwise, check if it was last successful AND is still held
                return lastSuccessfulNotesRef.current.has(n.midi) && userActiveNotesRef.current.has(n.midi);
            });

            if (stillHeldFromPrevious.length > 0) {
                // User must release these notes first.
                // Note: We don't block *other* notes, but "allNotesPressed" checks "every" expected note.
                // So effectively, we block advancement until these specific notes are released and re-pressed.

                // Cleanup: If user HAS released a note, remove it from lastSuccessfulNotes 
                // so we know it's "clearguard" for next press.
                const newLast = new Set(lastSuccessfulNotesRef.current);
                let changed = false;
                lastSuccessfulNotesRef.current.forEach(n => {
                    if (!userActiveNotesRef.current.has(n)) {
                        newLast.delete(n);
                        changed = true;
                    }
                });
                if (changed) setLastSuccessfulNotes(newLast);

                // Wait for release. Do not advance.
                return;
            }


            // 5. Check Input
            const allNotesPressed = currentExpectedObjs.every(noteObj => {
                // If tied, and we are holding it (from previous success or just holding), it counts?
                // Wait, if it IS tied, we still require it to be ACTIVE.
                // But we filtered out the "blocker" above.
                return userActiveNotesRef.current.has(noteObj.midi);
            });

            if (allNotesPressed) {
                setFeedback("Good!");
                playbackEngine.nextStep();
                setNotesCorrect(prev => prev + 1);
                if (onNoteCorrectRef.current) onNoteCorrectRef.current(); // Minor XP event

                // Mark these notes as successful so we require re-trigger next time if needed
                setLastSuccessfulNotes(new Set(currentExpectedMidis));
                // Reset hint immediately on success
                // (though next tick will do it too via currentExpected change, this feels snappier)
                setShowHint(false);
            } else {
                // 6. Mistake Tracking
                // Count any active note that is NOT in expected notes
                // LEGATO FIX: Ignore notes that are in existing "lastSuccessfulNotes" (trailing notes from previous step)
                // Also ignore any notes that were already active when the step started.
                const activeWrongNotes = [...userActiveNotesRef.current].filter(n => {
                    // If it's in the current expected set, it's correct (or at least valid).
                    if (currentExpectedMidis.includes(n)) return false;

                    // If it was correct in the PREVIOUS step (and held over), ignore it (Legato tolerance).
                    if (lastSuccessfulNotesRef.current.has(n)) return false;

                    // If it was already active when this step started, ignore it.
                    if (notesActiveAtStepStartRef.current.has(n)) return false;

                    // Otherwise, it's a wrong note.
                    return true;
                });

                let newMistakes = 0;

                // Add new wrong notes to heldWrongNotes
                activeWrongNotes.forEach(n => {
                    if (!heldWrongNotesRef.current.has(n)) {
                        heldWrongNotesRef.current.add(n);
                        newMistakes++;
                    }
                });

                // Remove released key from heldWrongNotes
                // (Convert to array to avoid modification during iteration issues if any)
                [...heldWrongNotesRef.current].forEach(n => {
                    if (!userActiveNotesRef.current.has(n)) {
                        heldWrongNotesRef.current.delete(n);
                    }
                });

                if (newMistakes > 0) {
                    setNotesMissed(prev => prev + newMistakes);

                    // Track errors per measure for performance report card heatmap
                    const measureNum = playbackEngine.CurrentMeasureNumber;
                    setErrorMeasures(prev => ({
                        ...prev,
                        [measureNum]: (prev[measureNum] || 0) + newMistakes
                    }));
                    
                    // Convert MIDI values to note names for explicit user correction feedback
                    const MIDI_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                    const getNoteName = (midi: number) => {
                        const name = MIDI_NAMES[midi % 12];
                        const octave = Math.floor(midi / 12) - 1;
                        return `${name}${octave}`;
                    };

                    const wrongNoteName = getNoteName(activeWrongNotes[0]);
                    const expectedNoteName = currentExpectedMidis.map(getNoteName).join(' + ');
                    setFeedback(`❌ Played ${wrongNoteName}, expected ${expectedNoteName}`);
                }
            }
        };

        const interval = setInterval(checkInput, 50); // Poll 20Hz
        return () => clearInterval(interval);

    }, [isActive, mode, playbackEngine]);


    return {
        isActive,
        currentSection,
        mode,
        accuracy,
        feedback,
        startPractice,
        stopPractice,
        setMode,
        nextSection,
        prevSection,
        retrySection,
        expectedNotes,
        showHint,
        errorMeasures,
        isSongComplete,
        setIsSongComplete,
        notesCorrect,
        notesMissed
    };
}
