import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePreferences } from './usePreferences';
import { useMidi } from './useMidi';
import { useAudioInput } from './useAudioInput';
import { useGamification } from './useGamification';
import { useAchievements } from './useAchievements';
import { useDailyChallenges } from './useDailyChallenges';
import { useRhythmEngine } from './useRhythmEngine';
import { audio } from '../audio/Synth';
import { LevelGenerator, Difficulty } from '../engine/LevelGenerator';
import { StaveNoteData } from '../components/MusicDisplay';
import { midiToNoteName } from '../utils/midiUtils';
import { Lesson, courses } from '../utils/music/CourseData';

// Helper
const parseKeyToMidi = (key: string): number => {
    const [note, octave] = key.split('/');
    const baseNote = note.charAt(0).toLowerCase();
    const accidental = note.slice(1);
    const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    let midi = noteMap[baseNote] + (parseInt(octave) + 1) * 12;
    if (accidental === '#') midi += 1;
    else if (accidental === '##') midi += 2;
    else if (accidental === 'b') midi -= 1;
    else if (accidental === 'bb') midi -= 2;
    return midi;
};

// Pure helper to calculate playhead position at any given timestamp without React state
const getPlayheadPixelXAt = (elapsed: number, positions: number[]): number => {
    if (positions.length === 0) return 20;
    const RHYTHM_LEAD_IN = 2;
    if (elapsed < 0) {
        const firstNoteX = positions[0];
        const startX = 20;
        const progress = (elapsed + RHYTHM_LEAD_IN) / RHYTHM_LEAD_IN;
        return startX + (firstNoteX - startX) * progress;
    }
    const BPM = 60;
    const noteDuration = 60 / BPM;
    const currentIndex = Math.floor(elapsed / noteDuration);
    const segmentProgress = (elapsed % noteDuration) / noteDuration;
    const currentX = positions[currentIndex];
    const nextX = positions[currentIndex + 1];

    if (currentX !== undefined && nextX !== undefined) {
        return currentX + (nextX - currentX) * segmentProgress;
    } else if (currentX !== undefined) {
        const prevX = positions[currentIndex - 1] || 20;
        const width = currentX - prevX;
        return currentX + width * segmentProgress;
    }
    return 20;
};

export const useGameLogic = (saveHighScore?: (id: string, score: number, rank: string, notesHit: number, maxNotes: number) => Promise<void>) => {
    // -------------------------------------------------------------------------
    // 1. Audio & Input Initialization
    // -------------------------------------------------------------------------
    const { preferences, updatePreference } = usePreferences();
    const [audioStarted, setAudioStarted] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    // Muting & Completion
    const [isMutedKeys, setIsMutedKeys] = useState(false);
    const isMutedKeysRef = useRef(isMutedKeys);
    useEffect(() => {
        isMutedKeysRef.current = isMutedKeys;
    }, [isMutedKeys]);

    const [notesCorrect, setNotesCorrect] = useState(0);
    const [notesMissed, setNotesMissed] = useState(0);

    // Stats & Achievements Hooks
    const { state: gameState, addXp, levelUp, clearLevelUp } = useGamification();
    const {
        incrementStat,
        setStat,
        newUnlocks,
        clearNewUnlocks,
        achievements,
        achievementsState,
        getProgress
    } = useAchievements();

    useEffect(() => {
        if (gameState.level) {
            setStat('level', gameState.level);
        }
    }, [gameState.level, setStat]);

    const {
        challenges: dailyChallenges,
        updateChallengeProgress,
        newCompleted: newDailyCompleted,
        clearNewCompleted: clearNewDaily
    } = useDailyChallenges(addXp);

    // Stats Ref for Callback Access
    const statRefs = useRef({ incrementStat, updateChallengeProgress });
    useEffect(() => {
        statRefs.current = { incrementStat, updateChallengeProgress };
    }, [incrementStat, updateChallengeProgress]);

    // Audio Callbacks
    const onNoteOn = useRef((note: number, velocity: number) => {
        if (audio.isInitialized && !isMutedKeysRef.current) audio.playNote(note, velocity);
        statRefs.current.incrementStat('totalNotes', 1);
        statRefs.current.updateChallengeProgress('notes', 1);
    });

    const onNoteOff = useRef((note: number) => {
        if (audio.isInitialized) audio.releaseNote(note);
    });

    // MIDI & Mic
    const { activeNotes, isEnabled: isMidiEnabled, inputs: midiInputs } = useMidi({
        onNoteOn: (n, v) => onNoteOn.current(n, v),
        onNoteOff: (n) => onNoteOff.current(n)
    });
    const {
        detectedNote: micNote,
        isListening: isMicListening,
        startListening: startMic,
        stopListening: stopMic,
        volume: micVolume,
        sensitivity: micSensitivity,
        setSensitivity: setMicSensitivity
    } = useAudioInput();

    // Merge Inputs
    const effectiveActiveNotes = useMemo(() => {
        const notes = new Set(activeNotes);
        if (micNote !== null) notes.add(micNote);
        return notes;
    }, [activeNotes, micNote]);

    // Mic Attack Handling
    const prevMicNote = useRef<number | null>(null);
    useEffect(() => {
        if (micNote !== null && micNote !== prevMicNote.current) {
            if (audio.isInitialized && !isMutedKeys) audio.playNote(micNote, 100);
            statRefs.current.incrementStat('totalNotes', 1);
            statRefs.current.updateChallengeProgress('notes', 1);
        }
        prevMicNote.current = micNote;
    }, [micNote, isMutedKeys]);

    // MIDI / Mic Auto-Switching Logic
    useEffect(() => {
        // 1. If MIDI connects, disable Mic and notify (console for now, UI can reflect via state)
        if (isMidiEnabled && midiInputs.length > 0) {
            if (isMicListening) {
                stopMic();
                setShowMicPopup(false); // Close if open
                // Optional: Toast "MIDI Connected: Microphone disabled"
            }
        }
        // 2. If NO MIDI on startup (simulated by timeout or just effect run), ask for Mic
        // We need a flag to know if we've already checked/asked this session?
        // For now, if not enabled and no inputs, show popup.
        else if (!isMidiEnabled && !isMicListening) {
            // Wait a bit for MIDI to initialize?
            // Actually, useMidi might take a moment.
            // Let's rely on a timeout check or just check if isMidiEnabled is false after mount.
            const timer = setTimeout(() => {
                // Check refs or current state inside timeout closure? 
                // We need to be careful.
                // Simplification: logic inside existing component render cycle.
                // We'll set showMicPopup only if we haven't dismissed it? 
                // Let's add a "checkedMidi" state if needed, or just rely on:
                setShowMicPopup(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isMidiEnabled, midiInputs.length, isMicListening, stopMic]);

    // Cleanup Mic interaction when MIDI connects is handled above.
    // Confirm logic:
    // - App loads. isMidiEnabled=false initially.
    // - Effect 2 runs, sets timeout.
    // - 100ms later, useMidi might set isEnabled=true.
    // - Effect 1 runs. If inputs>0, we are good. Timeout from Effect 2 might still fire?
    // - If Effect 2 dependency changes, timeout is cleared.
    // - So if isMidiEnabled flips to true, the "Show Popup" timer is cancelled. Perfect.

    // Audio Auto-Start when MIDI device is detected/plugged in
    useEffect(() => {
        if (midiInputs.length > 0 && !audioStarted && !isAudioLoading) {
            console.log("MIDI device detected! Automatically initializing audio engine...");
            startAudio();
        }
    }, [midiInputs, audioStarted, isAudioLoading]);

    // Audio Auto-Start
    const startAudio = async () => {
        setIsAudioLoading(true);
        try {
            await audio.init();
            setAudioStarted(true);
        } catch (e) {
            console.error("Audio failed to start", e);
        } finally {
            setIsAudioLoading(false);
        }
    };

    const testAudio = () => {
        if (!audioStarted) return;
        audio.playNote(60, 100);
        setTimeout(() => audio.releaseNote(60), 500);
    };

    // -------------------------------------------------------------------------
    // 2. Game State
    // -------------------------------------------------------------------------
    const [cursorIndex, setCursorIndex] = useState(0);
    const [inputStatus, setInputStatus] = useState<'waiting' | 'correct' | 'incorrect' | 'perfect'>('waiting');
    const [gameMode, setGameMode] = useState<'both' | 'treble' | 'bass'>('both');
    const [isRhythmMode, setIsRhythmMode] = useState(false);
    const [countDown, setCountDown] = useState<number | null>(null);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [lastHitType, setLastHitType] = useState<'perfect' | 'good' | 'okay' | null>(null);
    const [preHeld, setPreHeld] = useState(false);
    const [notePositions, setNotePositions] = useState<number[]>([]);
    const showNoteLabels = preferences.showNoteNames;
    const setShowNoteLabels = useCallback((val: boolean) => updatePreference('showNoteNames', val), [updatePreference]);
    const showStaff = preferences.showPianoLabels;
    const setShowStaff = useCallback((val: boolean) => updatePreference('showPianoLabels', val), [updatePreference]);
    const [showMicPopup, setShowMicPopup] = useState(false);

    useEffect(() => {
        return () => {
            audio.releaseAll();
        };
    }, []);

    useEffect(() => {
        if (lastHitType) {
            const timer = setTimeout(() => {
                setLastHitType(null);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [lastHitType]);

    // Scoring
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [errorStats, setErrorStats] = useState<Record<string, number>>({});

    // Muting & Completion

    const [isLessonComplete, setIsLessonComplete] = useState(false);

    // Active Note Overlapping Protection
    const notesActiveAtStepStart = useRef<Set<number>>(new Set());

    // Update notes active at step start when cursor index changes
    useEffect(() => {
        notesActiveAtStepStart.current = new Set(effectiveActiveNotes);
    }, [cursorIndex]);

    // Keep notesActiveAtStepStart in sync with releases
    useEffect(() => {
        notesActiveAtStepStart.current = new Set(
            Array.from(notesActiveAtStepStart.current).filter(n => effectiveActiveNotes.has(n))
        );
    }, [effectiveActiveNotes]);

    // Level
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NOVICE);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [levelData, setLevelData] = useState<{ treble: StaveNoteData[], bass: StaveNoteData[] }>(
        LevelGenerator.generate(Difficulty.NOVICE, errorStats)
    );

    // Rhythm Engine with refs for low-latency visual-only DOM playhead updates
    const BPM = 60;
    const RHYTHM_LEAD_IN = 2;

    const levelDataRef = useRef(levelData);
    useEffect(() => { levelDataRef.current = levelData; }, [levelData]);

    const notePositionsRef = useRef(notePositions);
    useEffect(() => { notePositionsRef.current = notePositions; }, [notePositions]);

    const cursorIndexRef = useRef(cursorIndex);
    useEffect(() => { cursorIndexRef.current = cursorIndex; }, [cursorIndex]);

    const gameModeRef = useRef(gameMode);
    useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

    const isRhythmPlayingRef = useRef(false);

    const onAnimateRhythm = useCallback((elapsed: number) => {
        // 1. Direct visual DOM playhead update
        const playhead = document.getElementById('rhythm-playhead');
        if (playhead) {
            const x = getPlayheadPixelXAt(elapsed, notePositionsRef.current);
            playhead.style.left = `${x}px`;
        }

        // 2. Perform Timing Miss Checks at 60Hz (does not render unless a miss actually occurs)
        if (isRhythmMode && isRhythmPlayingRef.current) {
            const currentIdx = cursorIndexRef.current;
            const levelLength = levelDataRef.current.treble.length;
            if (currentIdx >= levelLength) return;

            const noteDuration = 60 / BPM;
            const targetTime = currentIdx * noteDuration;
            const timeWindow = 0.35;

            if (elapsed > targetTime + timeWindow) {
                const targetTreble = levelDataRef.current.treble[currentIdx];
                const targetBass = levelDataRef.current.bass[currentIdx];
                const requiredNotes = new Set<number>();
                const currentGameMode = gameModeRef.current;
                
                if (currentGameMode !== 'bass' && targetTreble && !targetTreble.duration.endsWith('r')) {
                    targetTreble.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
                }
                if (currentGameMode !== 'treble' && targetBass && !targetBass.duration.endsWith('r')) {
                    targetBass.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
                }

                if (requiredNotes.size === 0) {
                    setCursorIndex(prev => prev + 1);
                } else {
                    setCursorIndex(prev => prev + 1);
                    setInputStatus('incorrect');
                    setStreak(0);
                    setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                    setNotesMissed(prev => prev + 1);
                }
            }
        }
    }, [isRhythmMode]);

    const { isPlaying: isRhythmPlaying, elapsedTimeRef, start: startRhythm, stop: stopRhythm } = useRhythmEngine(
        BPM,
        Math.ceil(levelData.treble.length / 4),
        onAnimateRhythm
    );

    useEffect(() => {
        isRhythmPlayingRef.current = isRhythmPlaying;
    }, [isRhythmPlaying]);


    // -------------------------------------------------------------------------
    // 3. Game Logic Handlers
    // -------------------------------------------------------------------------
    const generateNewLevel = useCallback((diff: Difficulty, keepRhythm = false, lesson?: Lesson | null) => {
        setDifficulty(diff);
        const targetLesson = lesson !== undefined ? lesson : currentLesson;

        if (targetLesson?.constraints) {
            setLevelData(LevelGenerator.generateFromConstraints(targetLesson.constraints));
        } else {
            setLevelData(LevelGenerator.generate(diff, errorStats));
        }

        setIsLessonComplete(false);
        setCursorIndex(0);
        setStreak(0);
        setScore({ correct: 0, incorrect: 0 }); // Reset score for the new level/lesson!
        setNotesCorrect(0);
        setNotesMissed(0);
        setInputStatus('waiting');
        if (keepRhythm) {
            startRhythm(RHYTHM_LEAD_IN);
        } else {
            stopRhythm();
        }
    }, [errorStats, startRhythm, stopRhythm, currentLesson, setIsLessonComplete]); // errorStats? Refactor to ref if causes loop. LevelGenerator is external.

    const loadLesson = useCallback((lesson: Lesson) => {
        setCurrentLesson(lesson);
        // Switch hand mode based on topic
        if (lesson.topic === 'treble') setGameMode('treble');
        else if (lesson.topic === 'bass') setGameMode('bass');
        else setGameMode('both');

        generateNewLevel(difficulty, false, lesson);
    }, [difficulty, generateNewLevel]);

    const handleStartRhythm = useCallback(() => {
        if (isRhythmPlaying || isRhythmMode) {
            stopRhythm();
            setIsRhythmMode(false);
            setCursorIndex(0);
            setInputStatus('waiting');
            setStreak(0);
            return;
        }

        if (!isRhythmMode) setIsRhythmMode(true);
        let count = 3;
        setCountDown(count);
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                setCountDown(count);
            } else {
                clearInterval(interval);
                setCountDown(null);
                startRhythm(RHYTHM_LEAD_IN);
            }
        }, 1000);
    }, [isRhythmMode, isRhythmPlaying, startRhythm, stopRhythm]);

    const handleAddXp = useCallback((amount: number) => {
        addXp(amount);
        updateChallengeProgress('xp', amount);
        if (amount >= 50) {
            incrementStat('sessionsCompleted', 1);
            updateChallengeProgress('sections', 1);
        }
        if (amount === 10) {
            incrementStat('perfectNotes', 1);
            updateChallengeProgress('perfect', 1);
        }
    }, [addXp, updateChallengeProgress, incrementStat]);


    // -------------------------------------------------------------------------
    // 4. Effects (Validation & Loop)
    // -------------------------------------------------------------------------




    // Pre-Held Logic
    useEffect(() => {
        const targetTreble = levelData.treble[cursorIndex];
        const targetBass = levelData.bass[cursorIndex];
        const requiredNotes = new Set<number>();
        if (gameMode !== 'bass' && targetTreble && !targetTreble.duration.endsWith('r')) {
            targetTreble.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }
        if (gameMode !== 'treble' && targetBass && !targetBass.duration.endsWith('r')) {
            targetBass.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }
        const isHolding = Array.from(requiredNotes).some(n => effectiveActiveNotes.has(n));
        setPreHeld(isHolding);
    }, [cursorIndex, levelData, gameMode]);


    // Main Validation Loop (strictly event-driven, decoupled from rhythm 60Hz tick)
    useEffect(() => {
        if (!audioStarted) return;

        // End of Level
        const levelLength = levelData.treble.length;
        if (cursorIndex >= levelLength) {
            if (cursorIndex === levelLength && !isLessonComplete) {
                setIsLessonComplete(true);
                stopRhythm();
                handleAddXp(50);
                if (currentLesson) {
                    if (saveHighScore) {
                        const total = notesCorrect + notesMissed;
                        const finalAccuracy = total > 0 ? Math.round((notesCorrect / total) * 100) : 0;
                        let finalRank = 'Bronze';
                        if (finalAccuracy >= 95) finalRank = 'Gold';
                        else if (finalAccuracy >= 85) finalRank = 'Silver';
                        
                        saveHighScore(currentLesson.id, finalAccuracy, finalRank, notesCorrect, total);
                    }
                } else {
                    setTimeout(() => generateNewLevel(difficulty, isRhythmMode), 500);
                }
            }
            return;
        }

        const noteDuration = 60 / BPM;
        const targetTime = cursorIndex * noteDuration;
        const timeWindow = 0.35;

        const targetTreble = levelData.treble[cursorIndex];
        const targetBass = levelData.bass[cursorIndex];
        const requiredNotes = new Set<number>();
        if (gameMode !== 'bass' && targetTreble && !targetTreble.duration.endsWith('r')) {
            targetTreble.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }
        if (gameMode !== 'treble' && targetBass && !targetBass.duration.endsWith('r')) {
            targetBass.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }

        const relevantActiveNotes = new Set<number>();
        effectiveActiveNotes.forEach(n => {
            if (gameMode === 'both') relevantActiveNotes.add(n);
            else if (gameMode === 'treble' && n >= 60) relevantActiveNotes.add(n);
            else if (gameMode === 'bass' && n < 60) relevantActiveNotes.add(n);
        });

        // Filter out notes held continuously from the step start (legato overlap protection)
        const newlyPressedActiveNotes = Array.from(relevantActiveNotes).filter(
            n => !notesActiveAtStepStart.current.has(n)
        );

        // If it's a rest note, auto-advance if not in rhythm mode
        if (requiredNotes.size === 0) {
            if (!isRhythmMode) {
                setCursorIndex(prev => prev + 1);
            } else if (newlyPressedActiveNotes.length > 0) {
                // Penalize off-beat keys pressed during rest in rhythm mode
                if (inputStatus !== 'incorrect') {
                    setInputStatus('incorrect');
                    setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                    setNotesMissed(prev => prev + 1);
                    setStreak(0);
                }
            }
            return;
        }

        const hasIncorrect = newlyPressedActiveNotes.some(n => !requiredNotes.has(n));
        const allFound = requiredNotes.size > 0 && Array.from(requiredNotes).every(n => relevantActiveNotes.has(n));

        if (preHeld) {
            // Wait for user to completely release the chord before letting them try again
            // Or wait until they are no longer holding ALL required notes from the previous level
            const stillHoldingAll = Array.from(requiredNotes).every(n => effectiveActiveNotes.has(n));
            const pressedNewRequired = newlyPressedActiveNotes.some(n => requiredNotes.has(n));

            // To be safe, wait until they release at least one required note to break the pre-held lock
            // OR if they pressed a new correct note that is part of the required set
            if (!stillHoldingAll || pressedNewRequired) {
                setPreHeld(false);
            } else {
                return;
            }
        }

        // Penalty: Only if they press a WRONG note for their current Hand mode
        if (hasIncorrect) {
            if (inputStatus !== 'incorrect') {
                setInputStatus('incorrect');
                setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                setNotesMissed(prev => prev + 1);
                setStreak(0);
                newlyPressedActiveNotes.filter(n => !requiredNotes.has(n)).forEach(n => {
                    const name = midiToNoteName(n);
                    setErrorStats(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                });
            }
            return;
        }

        // Success: Only if they have pressed ALL required notes for their current Hand mode 
        if (allFound) {

            if (isRhythmMode && isRhythmPlayingRef.current) {
                const elapsed = elapsedTimeRef.current;
                const diff = Math.abs(elapsed - targetTime);
                if (diff > timeWindow) return;

                if (diff <= 0.1) {
                    setLastHitType('perfect');
                    setScore(s => ({ ...s, correct: s.correct + 5 }));
                    setNotesCorrect(prev => prev + 1);
                    setInputStatus('perfect');
                    setStreak(p => p + 1);
                    handleAddXp(10);
                } else if (diff <= 0.25) {
                    setLastHitType('good');
                    setScore(s => ({ ...s, correct: s.correct + 2 }));
                    setNotesCorrect(prev => prev + 1);
                    setInputStatus('correct');
                    setStreak(p => p + 1);
                    handleAddXp(5);
                } else {
                    setLastHitType('okay');
                    setScore(s => ({ ...s, correct: s.correct + 1 }));
                    setNotesCorrect(prev => prev + 1);
                    setInputStatus('correct');
                    setStreak(p => p + 1);
                    handleAddXp(2);
                }
                if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
                setCursorIndex(prev => prev + 1);
                return;
            }

            // Normal Mode
            setScore(s => ({ ...s, correct: s.correct + 1 }));
            setNotesCorrect(prev => prev + 1);
            if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
            setStreak(p => p + 1);
            handleAddXp(5);

            setLastHitType('good');
            setInputStatus('correct');

            // Progression Delay
            setTimeout(() => {
                setCursorIndex(prev => prev + 1);
                setInputStatus('waiting');
            }, 100);

        } else {
            if (inputStatus !== 'incorrect' && inputStatus !== 'waiting') setInputStatus('waiting');
        }

    }, [effectiveActiveNotes, cursorIndex, levelData, audioStarted, difficulty, gameMode, isRhythmMode, inputStatus, preHeld, streak, maxStreak, addXp, handleAddXp, levelUp, generateNewLevel, notesCorrect, notesMissed, saveHighScore, currentLesson, isLessonComplete]);


    const goToNextLesson = useCallback(() => {
        if (!currentLesson) return null;
        
        // Find current course and lesson
        const course = courses.find(c => c.id === currentLesson.courseId);
        if (!course) return null;
        
        const idx = course.lessons.findIndex(l => l.id === currentLesson.id);
        let nextLesson: Lesson | null = null;
        
        if (idx !== -1 && idx < course.lessons.length - 1) {
            nextLesson = course.lessons[idx + 1];
        } else {
            // Check next course
            const courseIdx = courses.findIndex(c => c.id === course.id);
            if (courseIdx !== -1 && courseIdx < courses.length - 1) {
                const nextCourse = courses[courseIdx + 1];
                if (nextCourse.lessons.length > 0) {
                    nextLesson = nextCourse.lessons[0];
                }
            }
        }
        
        if (nextLesson) {
            if (gameState.xp < nextLesson.requiredXp) {
                return null;
            }
            setIsLessonComplete(false);
            setCurrentLesson(nextLesson);
            // Switch hand mode based on topic
            if (nextLesson.topic === 'treble') setGameMode('treble');
            else if (nextLesson.topic === 'bass') setGameMode('bass');
            else setGameMode('both');
            
            // Generate new level
            setLevelData(nextLesson.constraints 
                ? LevelGenerator.generateFromConstraints(nextLesson.constraints)
                : LevelGenerator.generate(difficulty, errorStats)
            );
            setCursorIndex(0);
            setStreak(0);
            setScore({ correct: 0, incorrect: 0 }); // Reset score for the new lesson!
            setNotesCorrect(0);
            setNotesMissed(0);
            setInputStatus('waiting');
            stopRhythm();
            return nextLesson;
        }
        return null;
    }, [currentLesson, difficulty, errorStats, stopRhythm, gameState.xp]);

    return {
        // State
        audioStarted, isAudioLoading,
        gameState, levelUp, clearLevelUp,
        achievements, achievementsState, getProgress, dailyChallenges,
        newUnlocks, clearNewUnlocks,
        newDailyCompleted, clearNewDaily,
        isMidiEnabled,
        effectiveActiveNotes,
        cursorIndex, inputStatus, gameMode, setGameMode,
        isRhythmMode, countDown, streak, maxStreak, lastHitType,
        notePositions, setNotePositions,
        showNoteLabels, setShowNoteLabels,
        showStaff, setShowStaff,
        showMicPopup, setShowMicPopup,
        isMicListening, startMic, stopMic,
        micVolume,
        micSensitivity,
        setMicSensitivity,
        midiInputs, // Exposed to SettingsPanel for device name display
        score, difficulty, levelData,
        playheadX: 20, // Playhead position is updated directly in visual DOM playhead
        isMutedKeys,
        isLessonComplete,
        notesCorrect,
        notesMissed,

        // Actions
        startAudio, testAudio,
        generateNewLevel,
        handleStartRhythm,
        parseKeyToMidi,
        setIsMutedKeys,
        setIsLessonComplete,
        goToNextLesson,

        // Course specific
        currentLesson,
        loadLesson,
        exitLesson: () => {
            setCurrentLesson(null);
            setIsLessonComplete(false);
            audio.releaseAll();
        },

        // Progression
        awardXp: handleAddXp
    };
};
