import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// Helper
const parseKeyToMidi = (key: string): number => {
    const [note, octave] = key.split('/');
    const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    return noteMap[note.toLowerCase()] + (parseInt(octave) + 1) * 12;
};

export const useGameLogic = () => {
    // -------------------------------------------------------------------------
    // 1. Audio & Input Initialization
    // -------------------------------------------------------------------------
    const [audioStarted, setAudioStarted] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    // Stats & Achievements Hooks
    const { state: gameState, addXp, levelUp, clearLevelUp } = useGamification();
    const {
        incrementStat,
        newUnlocks,
        clearNewUnlocks,
        achievements,
        achievementsState,
        getProgress
    } = useAchievements();

    const {
        challenges: dailyChallenges,
        updateChallengeProgress,
        newCompleted: newDailyCompleted,
        clearNewCompleted: clearNewDaily
    } = useDailyChallenges();

    // Stats Ref for Callback Access
    const statRefs = useRef({ incrementStat, updateChallengeProgress });
    useEffect(() => {
        statRefs.current = { incrementStat, updateChallengeProgress };
    }, [incrementStat, updateChallengeProgress]);

    // Audio Callbacks
    const onNoteOn = useRef((note: number, velocity: number) => {
        if (audio.isInitialized) audio.playNote(note, velocity);
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
    const { detectedNote: micNote, isListening: isMicListening, startListening: startMic, stopListening: stopMic } = useAudioInput();

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
            if (audio.isInitialized) audio.playNote(micNote, 100);
            statRefs.current.incrementStat('totalNotes', 1);
            statRefs.current.updateChallengeProgress('notes', 1);
        }
        prevMicNote.current = micNote;
    }, [micNote]);

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
    const [showNoteLabels, setShowNoteLabels] = useState(false);
    const [showStaff, setShowStaff] = useState(false);
    const [showMicPopup, setShowMicPopup] = useState(false);

    // Scoring
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [errorStats, setErrorStats] = useState<Record<string, number>>({});

    // Level
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NOVICE);
    const [levelData, setLevelData] = useState<{ treble: StaveNoteData[], bass: StaveNoteData[] }>(
        LevelGenerator.generate(Difficulty.NOVICE, errorStats)
    );

    // Rhythm Engine
    const BPM = 60;
    const RHYTHM_LEAD_IN = 2;
    const { isPlaying: isRhythmPlaying, elapsedTime, start: startRhythm, stop: stopRhythm } = useRhythmEngine(BPM, Math.ceil(levelData.treble.length / 4));


    // -------------------------------------------------------------------------
    // 3. Game Logic Handlers
    // -------------------------------------------------------------------------
    const generateNewLevel = useCallback((diff: Difficulty, keepRhythm = false) => {
        setDifficulty(diff);
        setLevelData(LevelGenerator.generate(diff, errorStats));
        setCursorIndex(0);
        setStreak(0);
        setInputStatus('waiting');
        if (keepRhythm) {
            startRhythm(RHYTHM_LEAD_IN);
        } else {
            stopRhythm();
        }
    }, [errorStats, startRhythm, stopRhythm]); // errorStats? Refactor to ref if causes loop. LevelGenerator is external.

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

    // Playhead Calculation
    const getPlayheadPixelX = useCallback((): number => {
        if (notePositions.length === 0) return 20;
        if (elapsedTime < 0) {
            const firstNoteX = notePositions[0];
            const startX = 20;
            const progress = (elapsedTime + RHYTHM_LEAD_IN) / RHYTHM_LEAD_IN;
            return startX + (firstNoteX - startX) * progress;
        }
        const noteDuration = 60 / BPM;
        const currentIndex = Math.floor(elapsedTime / noteDuration);
        const segmentProgress = (elapsedTime % noteDuration) / noteDuration;
        const currentX = notePositions[currentIndex];
        const nextX = notePositions[currentIndex + 1];

        if (currentX !== undefined && nextX !== undefined) {
            return currentX + (nextX - currentX) * segmentProgress;
        } else if (currentX !== undefined) {
            const prevX = notePositions[currentIndex - 1] || 20;
            const width = currentX - prevX;
            return currentX + width * segmentProgress;
        }
        return 20;
    }, [elapsedTime, notePositions, BPM, RHYTHM_LEAD_IN]);


    // Pre-Held Logic
    useEffect(() => {
        const targetTreble = levelData.treble[cursorIndex];
        const targetBass = levelData.bass[cursorIndex];
        const requiredNotes = new Set<number>();
        if (gameMode !== 'bass') targetTreble?.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        if (gameMode !== 'treble') targetBass?.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        const isHolding = Array.from(requiredNotes).some(n => effectiveActiveNotes.has(n));
        setPreHeld(isHolding);
    }, [cursorIndex, levelData, gameMode, effectiveActiveNotes]);


    // Main Validation Loop
    useEffect(() => {
        if (!audioStarted || levelUp) return;

        // End of Level
        const levelLength = levelData.treble.length;
        if (cursorIndex >= levelLength) {
            if (cursorIndex === levelLength) {
                handleAddXp(50);
                setTimeout(() => generateNewLevel(difficulty, isRhythmMode), 500);
            }
            return;
        }

        const noteDuration = 60 / BPM;
        const targetTime = cursorIndex * noteDuration;
        const timeWindow = 0.35;

        // Rhythm Mode Miss
        if (isRhythmMode && isRhythmPlaying) {
            if (elapsedTime > targetTime + timeWindow) {
                setCursorIndex(prev => prev + 1);
                setInputStatus('waiting');
                setStreak(0);
                if (inputStatus !== 'incorrect') {
                    setInputStatus('incorrect');
                    setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                }
                return;
            }
        }

        const targetTreble = levelData.treble[cursorIndex];
        const targetBass = levelData.bass[cursorIndex];
        const requiredNotes = new Set<number>();
        if (gameMode !== 'bass') targetTreble?.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        if (gameMode !== 'treble') targetBass?.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));

        const relevantActiveNotes = new Set<number>();
        effectiveActiveNotes.forEach(n => {
            if (gameMode === 'both') relevantActiveNotes.add(n);
            else if (gameMode === 'treble' && n >= 60) relevantActiveNotes.add(n);
            else if (gameMode === 'bass' && n < 60) relevantActiveNotes.add(n);
        });

        if (requiredNotes.size === 0) {
            setCursorIndex(prev => prev + 1);
            return;
        }

        const relevantArray = Array.from(relevantActiveNotes);
        const allFound = Array.from(requiredNotes).every(n => effectiveActiveNotes.has(n));
        const hasIncorrect = relevantArray.some(n => !requiredNotes.has(n));

        if (preHeld) {
            const stillHolding = Array.from(requiredNotes).some(n => effectiveActiveNotes.has(n));
            if (!stillHolding) setPreHeld(false);
            return;
        }

        if (hasIncorrect) {
            if (inputStatus !== 'incorrect') {
                setInputStatus('incorrect');
                setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                setStreak(0);
                relevantArray.filter(n => !requiredNotes.has(n)).forEach(n => {
                    const name = midiToNoteName(n);
                    setErrorStats(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                });
            }
            return;
        }

        if (allFound) {
            if (requiredNotes.size === 0 || relevantActiveNotes.size === 0) return;

            if (isRhythmMode && isRhythmPlaying) {
                const diff = Math.abs(elapsedTime - targetTime);
                if (diff > timeWindow) return;

                if (diff <= 0.1) {
                    setLastHitType('perfect');
                    setScore(s => ({ ...s, correct: s.correct + 5 }));
                    setInputStatus('perfect');
                    setStreak(p => p + 1);
                    handleAddXp(10);
                } else if (diff <= 0.25) {
                    setLastHitType('good');
                    setScore(s => ({ ...s, correct: s.correct + 2 }));
                    setInputStatus('correct');
                    setStreak(p => p + 1);
                    handleAddXp(5);
                } else {
                    setLastHitType('okay');
                    setScore(s => ({ ...s, correct: s.correct + 1 }));
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

    }, [effectiveActiveNotes, cursorIndex, levelData, audioStarted, difficulty, gameMode, isRhythmMode, isRhythmPlaying, elapsedTime, inputStatus, preHeld, streak, maxStreak, addXp, handleAddXp, levelUp, generateNewLevel]);


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
        score, difficulty, levelData,
        playheadX: getPlayheadPixelX(),

        // Actions
        startAudio, testAudio,
        generateNewLevel,
        handleStartRhythm,
        parseKeyToMidi
    };
};
