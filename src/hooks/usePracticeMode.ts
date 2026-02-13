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

    // Track held wrong notes to avoid counting the same press multiple times
    const heldWrongNotesRef = useRef<Set<number>>(new Set());

    const startPractice = useCallback(() => {
        setIsActive(true);
        setCurrentSection({ startMeasure: 0, endMeasure: 2 }); // Start with first 2 measures
        setMode('preview');
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback("Listen to this section...");
    }, []);

    const stopPractice = useCallback(() => {
        setIsActive(false);
        playbackEngine?.stop();
        playbackEngine?.setLoop(null, null);
    }, [playbackEngine]);

    const nextSection = useCallback(() => {
        const nextStart = currentSection.endMeasure;
        const nextEnd = Math.min(nextStart + 2, totalMeasures);

        if (nextStart >= totalMeasures) {
            setFeedback("Practice Complete! Great job!");
            setIsActive(false);
            return;
        }

        setCurrentSection({ startMeasure: nextStart, endMeasure: nextEnd });
        setMode('preview'); // Reset to preview for new section
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback("New Section! Listen first.");
    }, [currentSection, totalMeasures]);

    const retrySection = useCallback(() => {
        setFeedback("Let's try that again. Focus on accuracy.");
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();

        // Reset to wait mode directly or preview? User pattern suggests Preview might be helpful if they failed.
        // But let's go with user preference or default.
        // Let's reset to Preview to give them a refresher.
        setMode('preview');
        setPreviewLoopCount(0);

        const startTs = playbackEngine?.getMeasureTimestamp(currentSection.startMeasure);
        if (startTs !== null && startTs !== undefined) {
            playbackEngine?.seek(startTs);
        }
    }, [currentSection, playbackEngine]);

    // Effect to handle Mode Transitions & Looping
    useEffect(() => {
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
            setFeedback("Now you try! Play the notes.");
            playbackEngine?.stop();
            const startTs = playbackEngine?.getMeasureTimestamp(currentSection.startMeasure);
            if (startTs !== null && startTs !== undefined) {
                playbackEngine?.seek(startTs);
            }
        }
    }, [previewLoopCount, mode, playbackEngine, currentSection.startMeasure]);

    // Active Logic for Wait Mode
    useEffect(() => {
        if (!isActive || mode !== 'wait' || !playbackEngine) return;

        const checkInput = () => {
            const currentExpected = playbackEngine.getNotesAtCurrentPosition();

            // 1. Check for End of Section
            const currentTimestamp = playbackEngine.CurrentTimestamp;
            const endTimestamp = playbackEngine.getMeasureTimestamp(currentSection.endMeasure);

            if (endTimestamp !== null && currentTimestamp >= endTimestamp) {
                // End of Section Reached! Check Accuracy.
                const total = notesCorrect + notesMissed;
                // If total is 0 (empty section?), treat as 100%
                const acc = total > 0 ? (notesCorrect / total) * 100 : 100;
                setAccuracy(Math.round(acc));

                if (acc >= 90) {
                    setFeedback(`Great! Accuracy: ${Math.round(acc)}%. Moving on!`);
                    if (onSectionComplete) onSectionComplete(); // Major XP event
                    setTimeout(() => nextSection(), 1500);
                } else {
                    setFeedback(`Accuracy: ${Math.round(acc)}%. Let's try again.`);
                    setTimeout(() => retrySection(), 1500);
                }
                playbackEngine.stop(); // Stop checking
                return;
            }

            // 2. Handle Rests / Empty Steps
            if (currentExpected.length === 0) {
                playbackEngine.nextStep();
                setLastSuccessfulNotes(new Set());
                return;
            }

            // 3. Highlight Notes
            playbackEngine.highlightCurrentNotes();
            setExpectedNotes(currentExpected);

            // 4. Repeated Note Logic (Re-trigger check)
            // Identify notes that were correctly played in the PREVIOUS step
            // AND are still currently held by the user.
            // These notes must be released before they can count for the CURRENT step
            // (if the current step requires them).
            const stillHeldFromPrevious = currentExpected.filter(n => lastSuccessfulNotes.has(n) && userActiveNotes.has(n));

            if (stillHeldFromPrevious.length > 0) {
                // User must release these notes first.
                // Note: We don't block *other* notes, but "allNotesPressed" checks "every" expected note.
                // So effectively, we block advancement until these specific notes are released and re-pressed.

                // Cleanup: If user HAS released a note, remove it from lastSuccessfulNotes 
                // so we know it's "clearguard" for next press.
                const newLast = new Set(lastSuccessfulNotes);
                let changed = false;
                lastSuccessfulNotes.forEach(n => {
                    if (!userActiveNotes.has(n)) {
                        newLast.delete(n);
                        changed = true;
                    }
                });
                if (changed) setLastSuccessfulNotes(newLast);

                // Wait for release. Do not advance.
                return;
            }

            // 5. Check Input
            const allNotesPressed = currentExpected.every(note => userActiveNotes.has(note));

            if (allNotesPressed) {
                setFeedback("Good!");
                playbackEngine.nextStep();
                setNotesCorrect(prev => prev + 1);
                if (onNoteCorrect) onNoteCorrect(); // Minor XP event

                // Mark these notes as successful so we require re-trigger next time if needed
                setLastSuccessfulNotes(new Set(currentExpected));
            } else {
                // 6. Mistake Tracking
                // Count any active note that is NOT in expected notes
                const activeWrongNotes = [...userActiveNotes].filter(n => !currentExpected.includes(n));

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
                    if (!userActiveNotes.has(n)) {
                        heldWrongNotesRef.current.delete(n);
                    }
                });

                if (newMistakes > 0) {
                    setNotesMissed(prev => prev + newMistakes);
                    setFeedback("Careful!");
                }
            }
        };

        const interval = setInterval(checkInput, 50); // Poll 20Hz
        return () => clearInterval(interval);

    }, [isActive, mode, playbackEngine, userActiveNotes, currentSection, notesCorrect, notesMissed, lastSuccessfulNotes, nextSection, retrySection, onNoteCorrect, onSectionComplete]);


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
        retrySection,
        expectedNotes
    };
}
