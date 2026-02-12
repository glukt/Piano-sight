import { useState, useEffect, useCallback } from 'react';
import { PlaybackEngine } from '../engine/PlaybackEngine';

interface PracticeSection {
    startMeasure: number; // 0-indexed
    endMeasure: number;   // Exclusive
}

export type PracticeModeType = 'preview' | 'wait' | 'tempo';

export function usePracticeMode(playbackEngine: PlaybackEngine | null, totalMeasures: number, userActiveNotes: Set<number>) {
    const [isActive, setIsActive] = useState(false);
    const [currentSection, setCurrentSection] = useState<PracticeSection>({ startMeasure: 0, endMeasure: 2 });
    const [mode, setMode] = useState<PracticeModeType>('preview');
    const [accuracy, setAccuracy] = useState(100);
    const [consecutiveSuccesses, setConsecutiveSuccesses] = useState(0);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [previewLoopCount, setPreviewLoopCount] = useState(0);
    const [expectedNotes, setExpectedNotes] = useState<number[]>([]);

    const startPractice = useCallback(() => {
        setIsActive(true);
        setCurrentSection({ startMeasure: 0, endMeasure: 2 }); // Start with first 2 measures
        setMode('preview');
        setPreviewLoopCount(0);
        setConsecutiveSuccesses(0);
        setFeedback("Listen to this section...");
    }, []);

    const stopPractice = useCallback(() => {
        setIsActive(false);
        playbackEngine?.stop();
        playbackEngine?.setLoop(null, null); // Use setLoop null instead of cancelLoop
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
        setConsecutiveSuccesses(0);
        setFeedback("New Section! Listen first.");
    }, [currentSection, totalMeasures]);

    const retrySection = useCallback(() => {
        setFeedback("Let's try that again. Focus on accuracy.");
        // Reset to wait mode
        setMode('wait');
    }, []);

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
                // We pass a callback that increments the counter state
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
            // Force stop immediately to prevent 3rd loop start
            playbackEngine?.stop();
            // Seek to start of section
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
            const expectedNotes = playbackEngine.getNotesAtCurrentPosition();

            if (expectedNotes.length === 0) {
                // Optimization: If no notes (e.g. rest), just wait a beat or advance immediately?
                // For now, let's advance to avoid getting stuck on rests.
                playbackEngine.nextStep();
                return;
            }

            // Highlighting!
            playbackEngine.highlightCurrentNotes();


            // Check if User is holding ALL required notes
            const allNotesPressed = expectedNotes.every(note => userActiveNotes.has(note));

            // Update state for UI visualization
            setExpectedNotes(expectedNotes);

            if (allNotesPressed) {
                setFeedback("Good!");
                // Advance cursor
                playbackEngine.nextStep();
                setConsecutiveSuccesses(prev => prev + 1);
                setAccuracy(100);
            }
        };

        const interval = setInterval(checkInput, 50); // Poll 20Hz
        return () => clearInterval(interval);

    }, [isActive, mode, playbackEngine, userActiveNotes]);


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
