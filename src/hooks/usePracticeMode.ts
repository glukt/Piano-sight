import { useState, useEffect, useCallback, useRef } from 'react';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import { usePreferences } from './usePreferences';
import { getLessonById, isLessonCapstone } from '../utils/music/CourseData';

const POSITION_MAPS: Record<string, Record<string, { hand: 'LH' | 'RH'; finger: number }>> = {
    'RH_MIDDLE_C': {
        'c/4': { hand: 'RH', finger: 1 }
    },
    'RH_C_3FINGER': {
        'c/4': { hand: 'RH', finger: 1 },
        'd/4': { hand: 'RH', finger: 2 },
        'e/4': { hand: 'RH', finger: 3 }
    },
    'LH_BASS_F_3FINGER': {
        'e/3': { hand: 'LH', finger: 3 },
        'f/3': { hand: 'LH', finger: 2 },
        'g/3': { hand: 'LH', finger: 1 }
    },
    'RH_C_POS': {
        'c/4': { hand: 'RH', finger: 1 },
        'd/4': { hand: 'RH', finger: 2 },
        'e/4': { hand: 'RH', finger: 3 },
        'f/4': { hand: 'RH', finger: 4 },
        'g/4': { hand: 'RH', finger: 5 }
    },
    'LH_C_POS': {
        'c/3': { hand: 'LH', finger: 5 },
        'd/3': { hand: 'LH', finger: 4 },
        'e/3': { hand: 'LH', finger: 3 },
        'f/3': { hand: 'LH', finger: 2 },
        'g/3': { hand: 'LH', finger: 1 }
    },
    'RH_HIGH_C_POS': {
        'c/5': { hand: 'RH', finger: 1 },
        'd/5': { hand: 'RH', finger: 2 },
        'e/5': { hand: 'RH', finger: 3 }
    },
    'LH_LOW_C_POS': {
        'c/3': { hand: 'LH', finger: 5 },
        'd/3': { hand: 'LH', finger: 4 },
        'e/3': { hand: 'LH', finger: 3 }
    },
    'RH_UPPER_TREBLE': {
        'f/4': { hand: 'RH', finger: 1 },
        'g/4': { hand: 'RH', finger: 2 },
        'a/4': { hand: 'RH', finger: 3 },
        'b/4': { hand: 'RH', finger: 4 },
        'c/5': { hand: 'RH', finger: 5 }
    },
    'LH_LOWER_BASS': {
        'f/2': { hand: 'LH', finger: 5 },
        'g/2': { hand: 'LH', finger: 4 },
        'a/2': { hand: 'LH', finger: 3 },
        'b/2': { hand: 'LH', finger: 2 },
        'c/3': { hand: 'LH', finger: 1 }
    },
    'GRAND_C_POS': {
        'c/3': { hand: 'LH', finger: 5 },
        'd/3': { hand: 'LH', finger: 4 },
        'e/3': { hand: 'LH', finger: 3 },
        'f/3': { hand: 'LH', finger: 2 },
        'g/3': { hand: 'LH', finger: 1 },
        'c/4': { hand: 'RH', finger: 1 },
        'd/4': { hand: 'RH', finger: 2 },
        'e/4': { hand: 'RH', finger: 3 },
        'f/4': { hand: 'RH', finger: 4 },
        'g/4': { hand: 'RH', finger: 5 }
    }
};

const midiToKeyString = (midi: number): string => {
    const MIDI_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    const name = MIDI_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}/${octave}`;
};

const getNoteName = (midi: number): string => {
    const MIDI_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const name = MIDI_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
};

interface PracticeSection {
    startMeasure: number; // 0-indexed
    endMeasure: number;   // Exclusive
}

export type PracticeModeType = 'preview' | 'wait' | 'tempo' | 'play';

interface UsePracticeModeProps {
    playbackEngine: PlaybackEngine | null;
    totalMeasures: number;
    userActiveNotes: Set<number>;
    onNoteCorrect?: () => void;
    onSectionComplete?: () => void;
    songId?: string | null;
    saveHighScore?: (id: string, score: number, rank: string, notesHit: number, maxNotes: number) => Promise<void>;
    logAttempt?: (
        songId: string,
        mode: 'preview' | 'wait' | 'tempo' | 'play',
        accuracy: number,
        notesCorrect: number,
        notesMissed: number,
        handPracticed: 'both' | 'right' | 'left',
        tempoPercentage: number,
        errorMeasures: Record<number, number>,
        durationSeconds: number
    ) => Promise<any>;
    practicedHand?: 'both' | 'right' | 'left';
}

export function usePracticeMode({
    playbackEngine,
    totalMeasures,
    userActiveNotes,
    onNoteCorrect,
    onSectionComplete,
    songId,
    saveHighScore,
    logAttempt,
    practicedHand = 'both'
}: UsePracticeModeProps) {
    const { preferences, updatePreference } = usePreferences();
    const hintDelay = preferences.hintDelay;
    const autoPreview = preferences.autoPreview !== false; // default to true
    
    const [mode, setMode] = useState<PracticeModeType>('preview');
    const [feedback, setFeedback] = useState<string | null>(null);

    const setAutoPreview = useCallback((val: boolean) => {
        updatePreference('autoPreview', val);
        if (!val && mode === 'preview') {
            setMode('wait');
            setFeedback("Now you try! Play the notes.");
        }
    }, [updatePreference, mode]);

    const [loopSection, setLoopSectionState] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [currentSection, setCurrentSection] = useState<PracticeSection>({ startMeasure: 0, endMeasure: 2 });
    const [accuracy, setAccuracy] = useState(100);
    const [previewLoopCount, setPreviewLoopCount] = useState(0);
    const [tempoMultiplier, setTempoMultiplierState] = useState(1.0);
    const [isSpeedTrainerActive, setIsSpeedTrainerActive] = useState(false);

    const setLoopSection = useCallback((val: boolean) => {
        setLoopSectionState(val);
        if (!val) {
            // Whole Song
            setCurrentSection({ startMeasure: 0, endMeasure: totalMeasures });
        } else {
            // Restore to a 2-measure section starting at the current measure
            const currentMeasure = playbackEngine?.CurrentMeasureNumber || 0;
            const start = Math.floor(currentMeasure / 2) * 2;
            const end = Math.min(start + 2, totalMeasures);
            setCurrentSection({ startMeasure: start, endMeasure: end });
        }
    }, [totalMeasures, playbackEngine]);

    useEffect(() => {
        if (playbackEngine) {
            playbackEngine.setTempoMultiplier(tempoMultiplier);
        }
    }, [playbackEngine, tempoMultiplier]);

    // Sync practicedHand changes directly to the playback engine
    useEffect(() => {
        if (playbackEngine) {
            playbackEngine.practicedHand = practicedHand;
            playbackEngine.mutePracticedHand = (practicedHand !== 'both');
        }
    }, [playbackEngine, practicedHand]);

    useEffect(() => {
        if (isSpeedTrainerActive) {
            setTempoMultiplierState(0.6);
        } else {
            setTempoMultiplierState(1.0);
        }
    }, [isSpeedTrainerActive]);

    const changeTempoMultiplier = useCallback((val: number) => {
        setTempoMultiplierState(val);
        if (playbackEngine) {
            playbackEngine.setTempoMultiplier(val);
        }
    }, [playbackEngine]);
    const [expectedNotes, setExpectedNotes] = useState<number[]>([]);

    // Accuracy Tracking
    const [notesCorrect, setNotesCorrect] = useState(0);
    const [notesMissed, setNotesMissed] = useState(0);
    const [lastSuccessfulNotes, setLastSuccessfulNotes] = useState<Set<number>>(new Set());
    const [errorMeasures, setErrorMeasures] = useState<Record<number, number>>({});
    const [isSongComplete, setIsSongComplete] = useState(false);

    // Play Mode Grading State
    const [overallCorrect, setOverallCorrect] = useState(0);
    const [overallMissed, setOverallMissed] = useState(0);
    const [playModeStarted, setPlayModeStarted] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const [passed, setPassed] = useState(false);
    const [requiredAccuracy, setRequiredAccuracy] = useState(80);
    const [isCapstone, setIsCapstone] = useState(false);

    interface ExpectedNoteEvent {
        midi: number;
        expectedTime: number; // absolute ms timestamp
        duration: number;     // ms
        status: 'pending' | 'hit' | 'missed';
    }

    const expectedEventsRef = useRef<ExpectedNoteEvent[]>([]);
    const startTimeRef = useRef<number>(0);
    const practiceSessionStartTimeRef = useRef<number>(Date.now());

    // Track held wrong notes to avoid counting the same press multiple times
    const heldWrongNotesRef = useRef<Set<number>>(new Set());

    const isTransitioningRef = useRef(false);
    const transitionTimeoutRef = useRef<any>(null);
    const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoAdvanceTimerRef = useRef<any>(null);

    const startPractice = useCallback((startMeasure?: number, initialMode?: 'wait' | 'preview') => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
        }
        isTransitioningRef.current = false;
        setIsActive(true);
        practiceSessionStartTimeRef.current = Date.now();
        
        let start = startMeasure !== undefined ? startMeasure : 0;
        let end = Math.min(start + 2, totalMeasures);
        if (!loopSection) {
            start = 0;
            end = totalMeasures;
        }
        
        setCurrentSection({ startMeasure: start, endMeasure: end });
        const defaultStartMode = autoPreview ? 'preview' : 'wait';
        const finalMode = initialMode || (startMeasure !== undefined ? 'wait' : defaultStartMode);
        setMode(finalMode);
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setOverallCorrect(0);
        setOverallMissed(0);
        setPlayModeStarted(false);
        setCountdown(null);
        expectedEventsRef.current = [];
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback(finalMode === 'wait' ? "Play the notes on the screen..." : "Listen to this section...");
        setErrorMeasures({});
        setIsSongComplete(false);
        lastExpectedStrRef.current = "";
        notesActiveAtStepStartRef.current.clear();
    }, [totalMeasures, loopSection, autoPreview]);

    const stopPractice = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
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
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
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
        const defaultStartMode = autoPreview ? 'preview' : 'wait';
        setMode(defaultStartMode);
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback(defaultStartMode === 'wait' ? "New Section! Play the notes." : "New Section! Listen first.");
        lastExpectedStrRef.current = "";
        notesActiveAtStepStartRef.current.clear();
    }, [currentSection, totalMeasures, playbackEngine, autoPreview]);

    const retrySection = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
        }
        isTransitioningRef.current = false;

        setFeedback("Let's try that again. Focus on accuracy.");
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();

        // Reset to wait mode immediately so the user can play without preview delay
        setMode('wait');
        setPreviewLoopCount(0);
        lastExpectedStrRef.current = "";
        notesActiveAtStepStartRef.current.clear();
    }, []);

    const prevSection = useCallback(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
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
        const defaultStartMode = autoPreview ? 'preview' : 'wait';
        setMode(defaultStartMode);
        setPreviewLoopCount(0);
        setNotesCorrect(0);
        setNotesMissed(0);
        setLastSuccessfulNotes(new Set());
        heldWrongNotesRef.current.clear();
        setFeedback(defaultStartMode === 'wait' ? "Previous Section! Play the notes." : "Previous Section! Listen first.");
        lastExpectedStrRef.current = "";
        notesActiveAtStepStartRef.current.clear();
    }, [currentSection, playbackEngine, autoPreview, totalMeasures]);

    // Effect to handle Mode Transitions & Looping
    useEffect(() => {
        // cleanup when NOT active
        if (!isActive && playbackEngine) {
            playbackEngine.stop();
            playbackEngine.setLoop(null, null);
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
            }
            return;
        }

        if (!isActive || !playbackEngine) return;

        // Clear any running auto-advance timers immediately when section or mode changes
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
        }

        const setupLoop = () => {
            // Reset step change checks and held start keys to prevent ghost auto-evals and key match skips
            lastExpectedStrRef.current = "";
            notesActiveAtStepStartRef.current = new Set(userActiveNotesRef.current);
            // Get Timestamps from Engine
            const startTs = playbackEngine.getMeasureTimestamp(currentSection.startMeasure);
            const endTs = playbackEngine.getMeasureTimestamp(currentSection.endMeasure);

            if (startTs !== null && endTs !== null) {
                if (mode === 'play') {
                    playbackEngine.setLoop(null, null);
                } else {
                    playbackEngine.setLoop(startTs, endTs);
                }

                // Handle Loop Callback for Preview Counter
                playbackEngine.setLoopCallback(() => {
                    setPreviewLoopCount(prev => prev + 1);
                });

                // If in preview or tempo mode, start playing
                if (mode === 'preview' || mode === 'tempo') {
                    playbackEngine.mutePracticedHand = false;
                    playbackEngine.seek(startTs);
                    playbackEngine.play();
                } else if (mode === 'wait') {
                    // Wait mode: Stop and wait for input
                    playbackEngine.mutePracticedHand = true;
                    playbackEngine.stop();
                    playbackEngine.seek(startTs);
                    playbackEngine.playAccompanimentForCurrentPosition();
                    setFeedback("Play the notes to advance!");
                } else if (mode === 'play' && !playModeStarted) {
                    // Play mode: Stop and wait for Start click
                    playbackEngine.mutePracticedHand = true;
                    playbackEngine.stop();
                    playbackEngine.seek(startTs);
                    setFeedback("Ready to grade? Click Start to begin!");
                }
            }
        };

        setupLoop();

    }, [isActive, currentSection, mode, playbackEngine, playModeStarted, practicedHand]);

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
            if (loopSection) {
                setCurrentSection(prev => ({
                    ...prev,
                    endMeasure: Math.min(prev.startMeasure + 2, totalMeasures)
                }));
            } else {
                setCurrentSection({ startMeasure: 0, endMeasure: totalMeasures });
            }
        }
    }, [totalMeasures, isActive, currentSection.endMeasure, loopSection]);

    const [showHint, setShowHint] = useState(false);
    const stuckTimerRef = useRef(0);
    const prevExpectedNotesRef = useRef<string>("");

    const [preHeld, setPreHeld] = useState(false);
    const preHeldRef = useRef(preHeld);

    // Active Note Overlapping / Legato Protection for Wait Mode
    const notesActiveAtStepStartRef = useRef<Set<number>>(new Set());
    const lastExpectedStrRef = useRef<string>("");
    const recentPressesRef = useRef<Map<number, number>>(new Map());

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
    const playModeStartedRef = useRef(playModeStarted);

    useEffect(() => {
        // Detect new press events to populate recentPressesRef
        const now = Date.now();
        userActiveNotes.forEach(midi => {
            if (!userActiveNotesRef.current.has(midi)) {
                recentPressesRef.current.set(midi, now);
            }
        });

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
        playModeStartedRef.current = playModeStarted;
        preHeldRef.current = preHeld;
    });

    const startPlayMode = useCallback(() => {
        if (mode !== 'play' || !playbackEngine) return;

        setNotesCorrect(0);
        setNotesMissed(0);
        setOverallCorrect(0);
        setOverallMissed(0);
        setErrorMeasures({});
        expectedEventsRef.current = [];
        heldWrongNotesRef.current.clear();
        isTransitioningRef.current = false;
        practiceSessionStartTimeRef.current = Date.now();

        const startTs = playbackEngine.getMeasureTimestamp(0) || 0;
        playbackEngine.seek(startTs);
        playbackEngine.stop();

        setCountdown(3);
        setFeedback("Get ready... 3");
    }, [mode, playbackEngine]);

    // Effect to handle Play Mode countdown ticking
    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                const next = countdown - 1;
                setCountdown(next);
                if (next > 0) {
                    setFeedback(`Get ready... ${next}`);
                } else {
                    setFeedback("GO!");
                }
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setPlayModeStarted(true);
            setCountdown(null);
        }
    }, [countdown]);

    // Active Logic for Wait Mode - useCallback hook
    const checkInput = useCallback((isFromPoll = false) => {
        if (isTransitioningRef.current || !playbackEngine) return;
        const currentExpectedObjs = playbackEngine.getNotesAtCurrentPosition();
        const currentExpectedMidis = currentExpectedObjs.map(n => n.midi);
        const currentExpectedStr = currentExpectedMidis.slice().sort().join(',');

        // Clear auto-advance timer if we have notes the user needs to play
        if (currentExpectedMidis.length > 0 && autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
        }

        // Detect step change to capture currently held keys as "legato safety"
        let stepChanged = false;
        if (currentExpectedStr !== lastExpectedStrRef.current) {
            notesActiveAtStepStartRef.current = new Set(userActiveNotesRef.current);
            lastExpectedStrRef.current = currentExpectedStr;
            stepChanged = true;

            // Initialize preHeld: if user is holding any expected note at step start
            const isHoldingAny = currentExpectedMidis.some(m => userActiveNotesRef.current.has(m));
            setPreHeld(isHoldingAny);
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
                if (hintDelay > 0 && stuckTimerRef.current > hintDelay && !showHintRef.current) {
                    setShowHint(true);

                    const lesson = songId ? getLessonById(songId) : null;
                    const handPosition = lesson?.handPosition;
                    let fingerAdvice = '';
                    if (handPosition && POSITION_MAPS[handPosition]) {
                        const map = POSITION_MAPS[handPosition];
                        const advices = currentExpectedMidis.map(m => {
                            const keyStr = midiToKeyString(m);
                            const info = map[keyStr];
                            if (info) {
                                const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
                                return `${info.hand} Finger ${info.finger} (${fingerNames[info.finger - 1]})`;
                            }
                            return null;
                        }).filter(Boolean);
                        if (advices.length > 0) {
                            fingerAdvice = ` - Use ${advices.join(' + ')}`;
                        }
                    }
                    const expectedNoteNames = currentExpectedMidis.map(getNoteName).join(' + ');
                    setFeedback(`💡 Stuck? Play ${expectedNoteNames}${fingerAdvice}`);
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

        // If we are just polling for the stuck timer, we exit early here!
        if (isFromPoll && !stepChanged) return;

        // 1. Check for End of Section
        const currentTimestamp = playbackEngine.CurrentTimestamp;
        const endTimestamp = playbackEngine.getMeasureTimestamp(currentSectionRef.current.endMeasure);

        if (endTimestamp !== null && currentTimestamp >= endTimestamp) {
            isTransitioningRef.current = true;
            // End of Section Reached! Check Accuracy.
            const total = notesCorrectRef.current + notesMissedRef.current;
            const acc = total > 0 ? (notesCorrectRef.current / total) * 100 : 100;
            setAccuracy(Math.round(acc));

            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }

            if (acc >= 90) {
                if (isSpeedTrainerActive) {
                    if (tempoMultiplier < 1.0) {
                        const nextMult = Math.min(1.0, tempoMultiplier + 0.1);
                        setTempoMultiplierState(nextMult);
                        if (playbackEngine) playbackEngine.setTempoMultiplier(nextMult);
                        setFeedback(`🚀 Speed increased to ${Math.round(nextMult * 100)}%! Let's practice again.`);
                        transitionTimeoutRef.current = setTimeout(() => retrySectionRef.current(), 1500);
                    } else {
                        setFeedback(`🎉 Section mastered at 100% speed! Moving on!`);
                        setTempoMultiplierState(0.6); // Reset for next section
                        if (playbackEngine) playbackEngine.setTempoMultiplier(0.6);
                        if (onSectionCompleteRef.current) onSectionCompleteRef.current();
                        transitionTimeoutRef.current = setTimeout(() => nextSectionRef.current(), 1500);
                    }
                } else {
                    setFeedback(`Great! Accuracy: ${Math.round(acc)}%. Moving on!`);
                    if (onSectionCompleteRef.current) onSectionCompleteRef.current(); // Major XP event
                    transitionTimeoutRef.current = setTimeout(() => nextSectionRef.current(), 1500);
                }
            } else {
                setFeedback(`Accuracy: ${Math.round(acc)}%. Let's try again.`);
                transitionTimeoutRef.current = setTimeout(() => retrySectionRef.current(), 1500);
            }
            playbackEngine.stop(); // Stop checking
            setShowHint(false);
            return;
        }

        // 2. Handle Rests / Empty Steps (Auto-advance accompaniment-only steps in Wait Mode)
        if (currentExpectedMidis.length === 0) {
            if (!autoAdvanceTimerRef.current) {
                const stepDurationMs = playbackEngine.getCurrentStepDuration() * 1000;
                autoAdvanceTimerRef.current = setTimeout(() => {
                    if (isTransitioningRef.current) return;
                    autoAdvanceTimerRef.current = null;
                    playbackEngine.nextStep();
                    playbackEngine.playAccompanimentForCurrentPosition();
                    setExpectedNotes([]);
                }, stepDurationMs);
            }
            setLastSuccessfulNotes(new Set());
            return;
        }

        // 3. Highlight Notes with correct and wrong subsets passed
        const userPressedMidis = new Set(userActiveNotesRef.current);
        const correctSet = new Set(currentExpectedMidis.filter(m => userPressedMidis.has(m)));
        const incorrectSet = new Set(Array.from(heldWrongNotesRef.current));
        
        playbackEngine.highlightCurrentNotes(correctSet, incorrectSet);
        setExpectedNotes(currentExpectedMidis);

        // PreHeld Guard: block evaluation if preHeld is true
        let isPreHeldLocked = preHeldRef.current;
        if (isPreHeldLocked) {
            const stillHoldingAll = currentExpectedMidis.length > 0 && currentExpectedMidis.every(m => userActiveNotesRef.current.has(m));
            const newlyPressed = currentExpectedMidis.filter(m => !notesActiveAtStepStartRef.current.has(m));
            const pressedNewRequired = newlyPressed.some(m => userActiveNotesRef.current.has(m));

            if (!stillHoldingAll || pressedNewRequired) {
                setPreHeld(false);
                isPreHeldLocked = false;
            }
        }

        if (isPreHeldLocked) {
            return;
        }

        // Debounce the validation logic (Steps 4, 5, and 6)
        if (!isFromPoll || stepChanged) {
            if (validationTimerRef.current) {
                clearTimeout(validationTimerRef.current);
            }

            validationTimerRef.current = setTimeout(() => {
                if (isTransitioningRef.current || !playbackEngine) return;

                const checkTime = Date.now();
                recentPressesRef.current.forEach((timestamp, midi) => {
                    if (checkTime - timestamp > 150) {
                        recentPressesRef.current.delete(midi);
                    }
                });

                const freshExpectedObjs = playbackEngine.getNotesAtCurrentPosition();
                const freshExpectedMidis = freshExpectedObjs.map(n => n.midi);
                if (freshExpectedObjs.length === 0) return;

                // 4. Repeated Note Logic (Re-trigger check)
                const stillHeldFromPrevious = freshExpectedObjs.filter(n => {
                    if (n.isTied) return false;
                    return lastSuccessfulNotesRef.current.has(n.midi) && userActiveNotesRef.current.has(n.midi);
                });

                if (stillHeldFromPrevious.length > 0) {
                    const newLast = new Set(lastSuccessfulNotesRef.current);
                    let changed = false;
                    lastSuccessfulNotesRef.current.forEach(n => {
                        if (!userActiveNotesRef.current.has(n)) {
                            newLast.delete(n);
                            changed = true;
                        }
                    });
                    if (changed) setLastSuccessfulNotes(newLast);
                    return;
                }

                // 5. Check Input
                const allNotesPressed = freshExpectedObjs.every(noteObj => {
                    const isCurrentlyHeld = userActiveNotesRef.current.has(noteObj.midi);
                    const lastPressedTime = recentPressesRef.current.get(noteObj.midi);
                    const isPressedRecently = lastPressedTime !== undefined && (checkTime - lastPressedTime < 150);
                    
                    return isCurrentlyHeld || isPressedRecently;
                });

                if (allNotesPressed) {
                    if (autoAdvanceTimerRef.current) {
                        clearTimeout(autoAdvanceTimerRef.current);
                        autoAdvanceTimerRef.current = null;
                    }
                    setFeedback("Good!");
                    playbackEngine.nextStep();
                    playbackEngine.playAccompanimentForCurrentPosition();
                    setNotesCorrect(prev => prev + 1);
                    if (onNoteCorrectRef.current) onNoteCorrectRef.current();

                    setLastSuccessfulNotes(new Set(freshExpectedMidis));
                    setShowHint(false);
                } else {
                    // 6. Mistake Tracking
                    const activeWrongNotes = [...userActiveNotesRef.current].filter(n => {
                        // Hand filtering: Ignore wrong notes outside the range of the practiced hand
                        if (practicedHand === 'right' && n < 60) return false;
                        if (practicedHand === 'left' && n >= 60) return false;

                        if (freshExpectedMidis.includes(n)) return false;
                        if (lastSuccessfulNotesRef.current.has(n)) return false;
                        if (notesActiveAtStepStartRef.current.has(n)) return false;
                        return true;
                    });

                    let newMistakes = 0;
                    activeWrongNotes.forEach(n => {
                        if (!heldWrongNotesRef.current.has(n)) {
                            heldWrongNotesRef.current.add(n);
                            newMistakes++;
                        }
                    });

                    [...heldWrongNotesRef.current].forEach(n => {
                        if (!userActiveNotesRef.current.has(n)) {
                            heldWrongNotesRef.current.delete(n);
                        }
                    });

                    if (newMistakes > 0) {
                        setNotesMissed(prev => prev + newMistakes);

                        const measureNum = playbackEngine.CurrentMeasureNumber;
                        setErrorMeasures(prev => ({
                            ...prev,
                            [measureNum]: (prev[measureNum] || 0) + newMistakes
                        }));

                        const lesson = songId ? getLessonById(songId) : null;
                        const handPosition = lesson?.handPosition;
                        let fingerAdvice = '';
                        if (handPosition && POSITION_MAPS[handPosition]) {
                            const map = POSITION_MAPS[handPosition];
                            const advices = freshExpectedMidis.map(m => {
                                const keyStr = midiToKeyString(m);
                                const info = map[keyStr];
                                if (info) {
                                    const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
                                    return `${info.hand} Finger ${info.finger} (${fingerNames[info.finger - 1]})`;
                                }
                                return null;
                            }).filter(Boolean);
                            if (advices.length > 0) {
                                fingerAdvice = ` - Use ${advices.join(' + ')}`;
                            }
                        }

                        const wrongNoteName = getNoteName(activeWrongNotes[0]);
                        const expectedNoteName = freshExpectedMidis.map(getNoteName).join(' + ');
                        setFeedback(`❌ Played ${wrongNoteName}, expected ${expectedNoteName}${fingerAdvice}`);
                    }
                }
            }, 50);
        }
    }, [playbackEngine, practicedHand, songId, hintDelay]);

    // Effect to run Polling interval for Wait Mode stuck timer and rests
    useEffect(() => {
        if (!isActive || mode !== 'wait' || !playbackEngine) return;

        const interval = setInterval(() => checkInput(true), 50); // Poll 20Hz
        return () => {
            clearInterval(interval);
            if (validationTimerRef.current) {
                clearTimeout(validationTimerRef.current);
            }
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
            }
        };
    }, [isActive, mode, playbackEngine, checkInput]);

    // Separate effect to trigger checkInput immediately on user input change for zero-latency response
    useEffect(() => {
        if (isActive && mode === 'wait') {
            checkInput(false);
        }
    }, [userActiveNotes, isActive, mode, checkInput]);


    const changeMode = useCallback((newMode: PracticeModeType) => {
        if (newMode === 'play') {
            setCurrentSection({ startMeasure: 0, endMeasure: totalMeasures });
            setPlayModeStarted(false);
            setCountdown(null);
            setFeedback("Ready to grade? Click Start to begin!");
            if (playbackEngine) {
                playbackEngine.stop();
                playbackEngine.seek(0);
            }
        } else if (mode === 'play') {
            const currentMeasure = playbackEngine?.CurrentMeasureNumber || 0;
            const start = Math.floor(currentMeasure / 2) * 2;
            const end = Math.min(start + 2, totalMeasures);
            setCurrentSection({ startMeasure: start, endMeasure: end });
            setPlayModeStarted(false);
            setCountdown(null);
        }
        setMode(newMode);
        setNotesCorrect(0);
        setNotesMissed(0);
        setOverallCorrect(0);
        setOverallMissed(0);
        setErrorMeasures({});
        expectedEventsRef.current = [];
        heldWrongNotesRef.current.clear();
        isTransitioningRef.current = false;
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
        }
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = null;
        }
        lastExpectedStrRef.current = "";
        notesActiveAtStepStartRef.current.clear();
    }, [totalMeasures, mode, playbackEngine]);

    // Effect to build event timeline for Play Mode
    useEffect(() => {
        if (!isActive || mode !== 'play' || !playbackEngine || !playModeStarted) return;

        const startTs = playbackEngine.getMeasureTimestamp(currentSection.startMeasure);
        const endTs = playbackEngine.getMeasureTimestamp(currentSection.endMeasure);

        if (startTs !== null && endTs !== null) {
            const rawEvents = playbackEngine.getExpectedNotesList(startTs, endTs);
            startTimeRef.current = Date.now();

            expectedEventsRef.current = rawEvents.map(e => ({
                midi: e.midi,
                expectedTime: startTimeRef.current + e.timeOffset * 1000,
                duration: e.duration * 1000,
                status: 'pending'
            }));

            playbackEngine.setStepCallback((midis) => {
                setExpectedNotes(midis);
            });

            playbackEngine.mutePracticedHand = true;
            playbackEngine.seek(startTs);
            playbackEngine.play();
        }

        return () => {
            if (playbackEngine) {
                playbackEngine.setStepCallback(() => {});
            }
        };
    }, [isActive, currentSection, mode, playbackEngine, playModeStarted, practicedHand]);

    const prevActiveNotesRef = useRef<Set<number>>(new Set());

    // Effect to grade user inputs in real-time for Play Mode
    useEffect(() => {
        if (!isActive || mode !== 'play' || expectedEventsRef.current.length === 0) return;

        const current = userActiveNotes;
        const prev = prevActiveNotesRef.current;

        // Detect new key presses
        const newlyPressed = [...current].filter(n => !prev.has(n));

        if (newlyPressed.length > 0) {
            const now = Date.now();
            newlyPressed.forEach(midi => {
                const windowBefore = 200; // Early tolerance
                const windowAfter = 250;  // Late tolerance

                const match = expectedEventsRef.current.find(event => 
                    event.midi === midi &&
                    event.status === 'pending' &&
                    now >= event.expectedTime - windowBefore &&
                    now <= event.expectedTime + windowAfter
                );

                if (match) {
                    match.status = 'hit';
                    setOverallCorrect(prev => prev + 1);
                    onNoteCorrect?.();
                } else {
                    setOverallMissed(prev => prev + 1);
                    
                    const measureNum = playbackEngine?.CurrentMeasureNumber || 1;
                    setErrorMeasures(prev => ({
                        ...prev,
                        [measureNum]: (prev[measureNum] || 0) + 1
                    }));
                }
            });
        }

        prevActiveNotesRef.current = new Set(current);
    }, [userActiveNotes, isActive, mode, onNoteCorrect, playbackEngine]);

    // Polling interval to tag missed expected notes and detect when playback ends
    useEffect(() => {
        if (!isActive || mode !== 'play' || !playbackEngine) return;

        const checkMissedAndEnd = () => {
            if (isTransitioningRef.current) return;
            const now = Date.now();
            const windowAfter = 250;

            // 1. Tag Missed Notes
            expectedEventsRef.current.forEach(event => {
                if (event.status === 'pending' && now > event.expectedTime + windowAfter) {
                    event.status = 'missed';
                    setOverallMissed(prev => prev + 1);

                    const elapsedSec = (event.expectedTime - startTimeRef.current) / 1000;
                    const startMeasureTs = playbackEngine.getMeasureTimestamp(0) || 0;
                    const eventTs = startMeasureTs + elapsedSec;
                    const measureNum = playbackEngine.getMeasureAtTimestamp(eventTs);
                    setErrorMeasures(prev => ({
                        ...prev,
                        [measureNum]: (prev[measureNum] || 0) + 1
                    }));
                }
            });

            // 2. End of Song Detection (Stopped status check with a 2s start safety buffer)
            const elapsed = Date.now() - startTimeRef.current;
            if (!playbackEngine.IsPlaying && playModeStartedRef.current && elapsed > 2000) {
                isTransitioningRef.current = true;
                playbackEngine.stop();

                const total = expectedEventsRef.current.length;
                const correct = expectedEventsRef.current.filter(e => e.status === 'hit').length;
                const acc = total > 0 ? (correct / total) * 100 : 100;
                const finalAccuracy = Math.round(acc);
                setAccuracy(finalAccuracy);

                let finalRank = 'Bronze';
                if (finalAccuracy >= 95) finalRank = 'Gold';
                else if (finalAccuracy >= 85) finalRank = 'Silver';

                const lesson = songId ? getLessonById(songId) : undefined;
                const isCap = lesson ? isLessonCapstone(lesson) : false;
                const reqAcc = isCap ? 85 : 80;
                const hasPassed = finalAccuracy >= reqAcc;

                setIsCapstone(isCap);
                setRequiredAccuracy(reqAcc);
                setPassed(hasPassed);

                if (saveHighScore && songId && hasPassed) {
                    saveHighScore(songId, finalAccuracy, finalRank, correct, total);
                }

                const durationSeconds = Math.round((Date.now() - practiceSessionStartTimeRef.current) / 1000);
                if (logAttempt && songId) {
                    logAttempt(
                        songId,
                        mode,
                        finalAccuracy,
                        correct,
                        total - correct,
                        practicedHand,
                        playbackEngine ? playbackEngine.TempoMultiplier : 1.0,
                        errorMeasures,
                        durationSeconds
                    );
                }

                setFeedback(`Play Mode Complete! Accuracy: ${finalAccuracy}%.`);
                setIsSongComplete(true);
            }
        };

        const interval = setInterval(checkMissedAndEnd, 50);
        return () => clearInterval(interval);
    }, [isActive, mode, playbackEngine, saveHighScore, logAttempt, songId, practicedHand, errorMeasures]);

    // Overall cleanup on unmount to prevent background playback leaks
    useEffect(() => {
        return () => {
            if (playbackEngine) {
                playbackEngine.stop();
            }
        };
    }, [playbackEngine]);

    return {
        isActive,
        currentSection,
        setCurrentSection,
        mode,
        accuracy,
        feedback,
        startPractice,
        stopPractice,
        setMode: changeMode,
        nextSection,
        prevSection,
        retrySection,
        expectedNotes,
        showHint,
        errorMeasures,
        isSongComplete,
        setIsSongComplete,
        notesCorrect: mode === 'play' ? overallCorrect : notesCorrect,
        notesMissed: mode === 'play' ? overallMissed : notesMissed,
        overallCorrect,
        overallMissed,
        playModeStarted,
        countdown,
        startPlayMode,
        passed,
        requiredAccuracy,
        isCapstone,
        tempoMultiplier,
        setTempoMultiplier: changeTempoMultiplier,
        isSpeedTrainerActive,
        setIsSpeedTrainerActive,
        loopSection,
        setLoopSection,
        autoPreview,
        setAutoPreview
    };
}
