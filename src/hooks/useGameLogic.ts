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
import { Lesson, courses, isLessonCapstone } from '../utils/music/CourseData';

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

interface AlignedStep {
    time: number;
    duration: number;
    trebleNoteIndex: number | null;
    bassNoteIndex: number | null;
    trebleKeys: string[];
    bassKeys: string[];
    isTrebleOnset: boolean;
    isBassOnset: boolean;
}

const getDurationInBeats = (durationStr: string): number => {
    const clean = durationStr.replace('r', '');
    const isDotted = clean.endsWith('.');
    const base = isDotted ? clean.slice(0, -1) : clean;
    let beats = 1;
    if (base === 'w') beats = 4;
    else if (base === 'h') beats = 2;
    else if (base === 'q') beats = 1;
    else if (base === '8') beats = 0.5;
    else if (base === '16') beats = 0.25;
    return isDotted ? beats * 1.5 : beats;
};

const alignNotes = (treble: StaveNoteData[], bass: StaveNoteData[]): AlignedStep[] => {
    let tTime = 0;
    const trebleEvents = treble.map((note, index) => {
        const onset = tTime;
        const dur = getDurationInBeats(note.duration);
        tTime += dur;
        const isTied = index > 0 && treble[index - 1].tied === true;
        return { index, onset, dur, isTied, keys: note.duration.endsWith('r') ? [] : note.keys };
    });

    let bTime = 0;
    const bassEvents = bass.map((note, index) => {
        const onset = bTime;
        const dur = getDurationInBeats(note.duration);
        bTime += dur;
        const isTied = index > 0 && bass[index - 1].tied === true;
        return { index, onset, dur, isTied, keys: note.duration.endsWith('r') ? [] : note.keys };
    });

    const onsetsSet = new Set<number>();
    trebleEvents.forEach(e => onsetsSet.add(e.onset));
    bassEvents.forEach(e => onsetsSet.add(e.onset));
    const uniqueOnsets = Array.from(onsetsSet).sort((a, b) => a - b);

    const aligned: AlignedStep[] = [];
    for (let i = 0; i < uniqueOnsets.length; i++) {
        const t = uniqueOnsets[i];
        const nextT = i < uniqueOnsets.length - 1 ? uniqueOnsets[i + 1] : t + 1;
        const duration = nextT - t;

        const tEvent = trebleEvents.find(e => t >= e.onset && t < e.onset + e.dur);
        const bEvent = bassEvents.find(e => t >= e.onset && t < e.onset + e.dur);

        const isTrebleOnset = tEvent ? (Math.abs(t - tEvent.onset) < 0.01 && !tEvent.isTied) : false;
        const isBassOnset = bEvent ? (Math.abs(t - bEvent.onset) < 0.01 && !bEvent.isTied) : false;

        aligned.push({
            time: t,
            duration: duration,
            trebleNoteIndex: tEvent ? tEvent.index : null,
            bassNoteIndex: bEvent ? bEvent.index : null,
            trebleKeys: (isTrebleOnset && tEvent) ? tEvent.keys : [],
            bassKeys: (isBassOnset && bEvent) ? bEvent.keys : [],
            isTrebleOnset,
            isBassOnset
        });
    }
    return aligned;
};

const calculateDuration = (notesData: StaveNoteData[]): number => {
    return notesData.reduce((sum, current) => {
        const durStr = current.duration.replace('r', '');
        const isDotted = durStr.endsWith('.');
        const base = isDotted ? durStr.slice(0, -1) : durStr;
        let beats = 1;
        if (base === 'w') beats = 4;
        else if (base === 'h') beats = 2;
        else if (base === 'q') beats = 1;
        else if (base === '8') beats = 0.5;
        else if (base === '16') beats = 0.25;
        return sum + (isDotted ? beats * 1.5 : beats);
    }, 0);
};

// Helper function to pad notes with rests until target duration is reached
const padNotes = (notesData: StaveNoteData[], targetDuration: number, clef: string, timeSignature: string = "4/4"): StaveNoteData[] => {
    const currentDuration = calculateDuration(notesData);
    if (Math.abs(currentDuration - targetDuration) < 0.01) {
        return [...notesData];
    }

    const paddedNotes = [...notesData];
    let remaining = targetDuration - currentDuration;
    const restKey = clef === 'bass' ? "d/3" : "b/4";

    const parts = timeSignature.split('/');
    const beatsPerMeasure = Number(parts[0]) || 4;
    const beatValue = Number(parts[1]) || 4;
    const measureDuration = beatsPerMeasure * (4 / beatValue);

    if (measureDuration === 3) {
        while (remaining >= 3) {
            paddedNotes.push({ keys: [restKey], duration: "h.r" });
            remaining -= 3;
        }
    } else {
        while (remaining >= 4) {
            paddedNotes.push({ keys: [restKey], duration: "wr" });
            remaining -= 4;
        }
    }
    while (remaining >= 2) {
        paddedNotes.push({ keys: [restKey], duration: "hr" });
        remaining -= 2;
    }
    while (remaining >= 1) {
        paddedNotes.push({ keys: [restKey], duration: "qr" });
        remaining -= 1;
    }
    while (remaining >= 0.5) {
        paddedNotes.push({ keys: [restKey], duration: "8r" });
        remaining -= 0.5;
    }
    while (remaining >= 0.25) {
        paddedNotes.push({ keys: [restKey], duration: "16r" });
        remaining -= 0.25;
    }

    return paddedNotes;
};

// Pure helper to calculate playhead position at any given timestamp without React state
const getPlayheadPixelXAt = (elapsed: number, positions: number[], bpm: number): number => {
    if (positions.length === 0) return 20;
    const RHYTHM_LEAD_IN = 2;
    if (elapsed < 0) {
        const firstNoteX = positions[0];
        const startX = 20;
        const progress = (elapsed + RHYTHM_LEAD_IN) / RHYTHM_LEAD_IN;
        return startX + (firstNoteX - startX) * progress;
    }
    const noteDuration = 60 / bpm;
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

export const useGameLogic = (
    saveHighScore?: (id: string, score: number, rank: string, notesHit: number, maxNotes: number) => Promise<void>,
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
    ) => Promise<any>
) => {
    const startTimeRef = useRef<number>(Date.now());

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

    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [notesCorrect, setNotesCorrect] = useState(0);
    const [notesMissed, setNotesMissed] = useState(0);

    const [errorMeasures, setErrorMeasures] = useState<Record<number, number>>({});
    const [loopRange, setLoopRange] = useState<{ startStep: number, endStep: number, startBeat: number, endBeat: number, measures: number[] } | null>(null);
    const loopRangeRef = useRef(loopRange);
    useEffect(() => { loopRangeRef.current = loopRange; }, [loopRange]);

    const currentLessonRef = useRef(currentLesson);
    useEffect(() => { currentLessonRef.current = currentLesson; }, [currentLesson]);

    const lastElapsedSecondsRef = useRef(0);

    const recordMiss = useCallback((idx: number) => {
        setNotesMissed(prev => prev + 1);
        const step = alignedStepsRef.current[idx];
        if (step) {
            const timeSig = currentLessonRef.current?.constraints?.timeSignature || "4/4";
            const parts = timeSig.split('/');
            const num = parseInt(parts[0]) || 4;
            const den = parseInt(parts[1]) || 4;
            const bpmUnit = num * (4 / den);
            const measure = Math.floor(step.time / bpmUnit) + 1;
            setErrorMeasures(prev => ({
                ...prev,
                [measure]: (prev[measure] || 0) + 1
            }));
        }
    }, []);

    const advanceCursor = useCallback(() => {
        setCursorIndex(prev => {
            const next = prev + 1;
            const limit = loopRangeRef.current ? loopRangeRef.current.endStep : alignedStepsRef.current.length;
            if (next >= limit) {
                if (loopRangeRef.current) {
                    return loopRangeRef.current.startStep;
                }
                return limit;
            }
            return next;
        });
    }, []);

    const startLoopPractice = useCallback((weakMeasures: number[]) => {
        if (!weakMeasures || weakMeasures.length === 0) {
            setLoopRange(null);
            setCursorIndex(0);
            return;
        }

        const sorted = weakMeasures.slice().sort((a, b) => a - b);
        const startMeasure = sorted[0];
        const endMeasure = sorted[sorted.length - 1];

        const timeSig = currentLessonRef.current?.constraints?.timeSignature || "4/4";
        const parts = timeSig.split('/');
        const num = parseInt(parts[0]) || 4;
        const den = parseInt(parts[1]) || 4;
        const bpmUnit = num * (4 / den);

        const startBeat = (startMeasure - 1) * bpmUnit;
        const endBeat = endMeasure * bpmUnit;

        // Find startStep and endStep in alignedStepsRef
        let startStep = 0;
        let endStep = alignedStepsRef.current.length;

        for (let i = 0; i < alignedStepsRef.current.length; i++) {
            if (alignedStepsRef.current[i].time >= startBeat) {
                startStep = i;
                break;
            }
        }
        for (let i = 0; i < alignedStepsRef.current.length; i++) {
            if (alignedStepsRef.current[i].time >= endBeat) {
                endStep = i;
                break;
            }
        }

        setLoopRange({ startStep, endStep, startBeat, endBeat, measures: sorted });
        
        // Reset state for loop practice
        setCursorIndex(startStep);
        setNotesCorrect(0);
        setNotesMissed(0);
        setErrorMeasures({});
        setIsLessonComplete(false);
    }, []);

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
    const currentExpectedNotesRef = useRef<number[]>([]);
    const {
        detectedNote: micNote,
        detectedNoteName: micNoteName,
        isListening: isMicListening,
        startListening: startMic,
        stopListening: stopMic,
        volume: micVolume,
        sensitivity: micSensitivity,
        setSensitivity: setMicSensitivity,
        isCalibrating,
        calibrationProgress,
        calibrateMicrophone,
        calibrationStep,
        calibrationTargetNote,
        availableMics,
        selectedMicId,
        activeMicLabel,
        changeMicrophone
    } = useAudioInput(currentExpectedNotesRef);

    // Audio Auto-Start on first user interaction (bypass browser autoplay limits)
    useEffect(() => {
        const handleInteraction = () => {
            if (!audioStarted && !isAudioLoading) {
                console.log("User interaction detected! Automatically starting audio engine...");
                startAudio();
            }
            cleanup();
        };
        const cleanup = () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        return cleanup;
    }, [audioStarted, isAudioLoading]);

    // Simulated active notes state for touch/screen piano interactions
    const [simulatedActiveNotes, setSimulatedActiveNotes] = useState<Set<number>>(new Set());

    const handleSimulatedNoteOn = useCallback((note: number, velocity: number = 100) => {
        setSimulatedActiveNotes(prev => {
            const next = new Set(prev);
            next.add(note);
            return next;
        });
        onNoteOn.current(note, velocity);
    }, []);

    const handleSimulatedNoteOff = useCallback((note: number) => {
        setSimulatedActiveNotes(prev => {
            const next = new Set(prev);
            next.delete(note);
            return next;
        });
        onNoteOff.current(note);
    }, []);

    // Merge Inputs
    const effectiveActiveNotes = useMemo(() => {
        const notes = new Set(activeNotes);
        if (micNote !== null) notes.add(micNote);
        simulatedActiveNotes.forEach(n => notes.add(n));
        return notes;
    }, [activeNotes, micNote, simulatedActiveNotes]);

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
        // 1. If MIDI connects, disable Mic and notify
        if (isMidiEnabled && midiInputs.length > 0) {
            if (isMicListening) {
                stopMic();
                setShowMicPopup(false); // Close if open
            }
        }
        // 2. If NO MIDI, check if mic was previously enabled
        else if (!isMidiEnabled && !isMicListening) {
            const wasMicEnabled = localStorage.getItem('pianopilot_mic_enabled') === 'true';
            if (wasMicEnabled) {
                console.log("Auto-enabling microphone: no MIDI device detected.");
                startMic();
            } else {
                const timer = setTimeout(() => {
                    setShowMicPopup(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [isMidiEnabled, midiInputs.length, isMicListening, stopMic, startMic]);

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
    const [lessonPassed, setLessonPassed] = useState(false);
    const [requiredAccuracy, setRequiredAccuracy] = useState(80);
    const [isCapstone, setIsCapstone] = useState(false);

    // Active Note Overlapping Protection
    const notesActiveAtStepStart = useRef<Set<number>>(new Set());
    const lastProcessedIndex = useRef<number>(-1);

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
    const [levelData, setLevelData] = useState<{ treble: StaveNoteData[], bass: StaveNoteData[] }>(
        LevelGenerator.generate(Difficulty.NOVICE, errorStats)
    );

    // Padding treble and bass staves to match target duration before alignment
    const paddedLevelData = useMemo(() => {
        const trebleDuration = calculateDuration(levelData.treble);
        const bassDuration = calculateDuration(levelData.bass);
        const targetDuration = Math.max(trebleDuration, bassDuration);
        const timeSig = currentLesson?.constraints?.timeSignature || "4/4";

        return {
            treble: padNotes(levelData.treble, targetDuration, "treble", timeSig),
            bass: padNotes(levelData.bass, targetDuration, "bass", timeSig)
        };
    }, [levelData, currentLesson]);

    const alignedSteps = useMemo(() => {
        return alignNotes(paddedLevelData.treble, paddedLevelData.bass);
    }, [paddedLevelData]);

    const alignedStepsRef = useRef(alignedSteps);
    useEffect(() => {
        alignedStepsRef.current = alignedSteps;
    }, [alignedSteps]);

    const trebleRangeMidi = useMemo(() => {
        const midiSet = new Set<number>();
        alignedSteps.forEach(step => {
            step.trebleKeys.forEach(k => midiSet.add(parseKeyToMidi(k)));
        });
        return midiSet;
    }, [alignedSteps]);

    const bassRangeMidi = useMemo(() => {
        const midiSet = new Set<number>();
        alignedSteps.forEach(step => {
            step.bassKeys.forEach(k => midiSet.add(parseKeyToMidi(k)));
        });
        return midiSet;
    }, [alignedSteps]);

    const activeNotesRef = useRef<Set<number>>(new Set());
    useEffect(() => {
        activeNotesRef.current = effectiveActiveNotes;
    }, [effectiveActiveNotes]);

    // Sync expected notes to mic detector ref
    useEffect(() => {
        const step = alignedSteps[cursorIndex];
        const notes: number[] = [];
        if (step) {
            if (gameMode !== 'bass' && step.isTrebleOnset) {
                step.trebleKeys.forEach(k => notes.push(parseKeyToMidi(k)));
            }
            if (gameMode !== 'treble' && step.isBassOnset) {
                step.bassKeys.forEach(k => notes.push(parseKeyToMidi(k)));
            }
        }
        currentExpectedNotesRef.current = notes;
    }, [alignedSteps, cursorIndex, gameMode]);

    // Rhythm Engine with refs for low-latency visual-only DOM playhead updates
    const BPM = currentLesson?.bpm || 80;
    const bpmRef = useRef(BPM);
    useEffect(() => { bpmRef.current = BPM; }, [BPM]);
    const RHYTHM_LEAD_IN = 2;

    const notePositionsRef = useRef(notePositions);
    useEffect(() => { notePositionsRef.current = notePositions; }, [notePositions]);

    const cursorIndexRef = useRef(cursorIndex);
    useEffect(() => { cursorIndexRef.current = cursorIndex; }, [cursorIndex]);

    const gameModeRef = useRef(gameMode);
    useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);

    const isRhythmPlayingRef = useRef(false);

    const onAnimateRhythm = useCallback((elapsed: number) => {
        // Handle playhead wrapping back in loop practice
        if (loopRangeRef.current) {
            const endSec = loopRangeRef.current.endBeat * (60 / bpmRef.current);
            if (elapsed < lastElapsedSecondsRef.current && elapsed < endSec) {
                let startStep = 0;
                for (let i = 0; i < alignedStepsRef.current.length; i++) {
                    if (alignedStepsRef.current[i].time >= loopRangeRef.current.startBeat) {
                        startStep = i;
                        break;
                    }
                }
                setCursorIndex(startStep);
            }
        }
        lastElapsedSecondsRef.current = elapsed;

        // 1. Direct visual DOM playhead update
        const playhead = document.getElementById('rhythm-playhead');
        if (playhead) {
            const x = getPlayheadPixelXAt(elapsed, notePositionsRef.current, bpmRef.current);
            playhead.style.left = `${x}px`;
        }

        // 2. Perform Timing Miss Checks at 60Hz (does not render unless a miss actually occurs)
        if (isRhythmMode && isRhythmPlayingRef.current) {
            const currentIdx = cursorIndexRef.current;
            const levelLength = loopRangeRef.current ? loopRangeRef.current.endStep : alignedStepsRef.current.length;
            if (currentIdx >= levelLength) return;

            const noteDuration = 60 / BPM;
            const step = alignedStepsRef.current[currentIdx];
            const targetTime = step ? step.time * noteDuration : 0;
            const timeWindow = 0.35;

            if (elapsed > targetTime + timeWindow) {
                const requiredNotes = new Set<number>();
                const currentGameMode = gameModeRef.current;
                
                if (currentGameMode !== 'bass' && step && step.isTrebleOnset) {
                    step.trebleKeys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
                }
                if (currentGameMode !== 'treble' && step && step.isBassOnset) {
                    step.bassKeys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
                }

                if (requiredNotes.size === 0) {
                    advanceCursor();
                } else {
                    advanceCursor();
                    setInputStatus('incorrect');
                    setStreak(0);
                    setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                    recordMiss(currentIdx);
                }
            }
        }
    }, [isRhythmMode, BPM, recordMiss, advanceCursor]);

    const lessonTimeSignature = currentLesson?.constraints?.timeSignature || "4/4";
    const lessonBeatsPerMeasure = Number(lessonTimeSignature.split('/')[0]) || 4;

    const { isPlaying: isRhythmPlaying, elapsedTimeRef, start: startRhythm, stop: stopRhythm } = useRhythmEngine(
        BPM,
        Math.ceil(calculateDuration(levelData.treble) / lessonBeatsPerMeasure),
        onAnimateRhythm,
        lessonTimeSignature,
        loopRange
    );

    useEffect(() => {
        isRhythmPlayingRef.current = isRhythmPlaying;
    }, [isRhythmPlaying]);

    // Demo Mode States & Handlers
    const [isDemoPlaying, setIsDemoPlaying] = useState(false);
    const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const demoActiveNotesRef = useRef<number[]>([]);

    const stopDemo = useCallback(() => {
        setIsDemoPlaying(false);
        if (demoTimerRef.current) {
            clearInterval(demoTimerRef.current);
            demoTimerRef.current = null;
        }
        // Release any playing demo notes
        demoActiveNotesRef.current.forEach(n => audio.releaseNote(n));
        demoActiveNotesRef.current = [];
        setCursorIndex(0);
        setInputStatus('waiting');
    }, []);

    const startDemo = useCallback(() => {
        if (isDemoPlaying) {
            stopDemo();
            return;
        }
        stopRhythm();
        setIsRhythmMode(false);
        setIsDemoPlaying(true);
        setCursorIndex(0);
        setInputStatus('waiting');

        let currentStepIdx = 0;
        
        // Helper to play step notes
        const playStep = (idx: number) => {
            // Release previous step notes
            demoActiveNotesRef.current.forEach(n => audio.releaseNote(n));
            demoActiveNotesRef.current = [];

            if (idx >= alignedStepsRef.current.length) {
                stopDemo();
                return;
            }

            const step = alignedStepsRef.current[idx];
            const notesToPlay: number[] = [];

            if (gameModeRef.current !== 'bass' && step.isTrebleOnset) {
                step.trebleKeys.forEach(k => notesToPlay.push(parseKeyToMidi(k)));
            }
            if (gameModeRef.current !== 'treble' && step.isBassOnset) {
                step.bassKeys.forEach(k => notesToPlay.push(parseKeyToMidi(k)));
            }

            notesToPlay.forEach(n => {
                audio.playNote(n, 100);
                demoActiveNotesRef.current.push(n);
            });

            setCursorIndex(idx);
            setInputStatus('perfect');
        };

        // Play the first step immediately
        playStep(0);

        const tickRateMs = 50; // 20Hz tick
        const startTime = performance.now();

        demoTimerRef.current = setInterval(() => {
            const now = performance.now();
            const elapsedSeconds = (now - startTime) / 1000;
            const elapsedBeats = elapsedSeconds * (BPM / 60);

            // Find the active step at this beat time
            let activeIdx = 0;
            for (let i = 0; i < alignedStepsRef.current.length; i++) {
                if (elapsedBeats >= alignedStepsRef.current[i].time) {
                    activeIdx = i;
                } else {
                    break;
                }
            }

            if (activeIdx !== currentStepIdx) {
                currentStepIdx = activeIdx;
                playStep(currentStepIdx);
            }

            // End condition
            const lastStep = alignedStepsRef.current[alignedStepsRef.current.length - 1];
            if (lastStep && elapsedBeats >= lastStep.time + lastStep.duration) {
                stopDemo();
            }
        }, tickRateMs);

    }, [isDemoPlaying, stopDemo, stopRhythm]);

    const resetLesson = useCallback(() => {
        stopDemo();
        stopRhythm();
        setIsRhythmMode(false);
        setCursorIndex(0);
        setStreak(0);
        setScore({ correct: 0, incorrect: 0 });
        setNotesCorrect(0);
        setNotesMissed(0);
        setInputStatus('waiting');
        lastProcessedIndex.current = -1;
    }, [stopDemo, stopRhythm]);


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

        if (targetLesson) {
            const isCap = isLessonCapstone(targetLesson);
            setIsCapstone(isCap);
            setRequiredAccuracy(isCap ? 85 : 80);
        } else {
            setIsCapstone(false);
            setRequiredAccuracy(80);
        }
        setLessonPassed(false);
        lastProcessedIndex.current = -1;

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
        startTimeRef.current = Date.now();
        // Switch hand mode based on topic
        if (lesson.topic === 'treble') setGameMode('treble');
        else if (lesson.topic === 'bass') setGameMode('bass');
        else setGameMode('both');

        generateNewLevel(difficulty, false, lesson);
    }, [difficulty, generateNewLevel]);

    const handleStartRhythm = useCallback(() => {
        stopDemo();
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
    }, [isRhythmMode, isRhythmPlaying, startRhythm, stopRhythm, stopDemo]);

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
        const step = alignedSteps[cursorIndex];
        const requiredNotes = new Set<number>();
        if (gameMode !== 'bass' && step && step.isTrebleOnset) {
            step.trebleKeys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }
        if (gameMode !== 'treble' && step && step.isBassOnset) {
            step.bassKeys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }
        const isHolding = Array.from(requiredNotes).some(n => effectiveActiveNotes.has(n));
        setPreHeld(isHolding);
    }, [cursorIndex, alignedSteps, gameMode, effectiveActiveNotes]);


    // Main Validation Loop (strictly event-driven, decoupled from rhythm 60Hz tick)
    useEffect(() => {
        if (!audioStarted) return;
        if (isDemoPlaying) return;
        if (cursorIndex === lastProcessedIndex.current) return;

        // End of Level
        const levelLength = alignedSteps.length;
        if (cursorIndex >= levelLength) {
            if (cursorIndex === levelLength && !isLessonComplete) {
                setIsLessonComplete(true);
                stopRhythm();
                if (currentLesson) {
                    const total = notesCorrect + notesMissed;
                    const finalAccuracy = total > 0 ? Math.round((notesCorrect / total) * 100) : 0;
                    const isCap = isLessonCapstone(currentLesson);
                    const reqAcc = isCap ? 85 : 80;
                    const passed = finalAccuracy >= reqAcc;

                    setIsCapstone(isCap);
                    setRequiredAccuracy(reqAcc);
                    setLessonPassed(passed);

                    if (passed) {
                        handleAddXp(50); // only award completion XP if passed!
                        if (saveHighScore) {
                            let finalRank = 'Bronze';
                            if (finalAccuracy >= 95) finalRank = 'Gold';
                            else if (finalAccuracy >= 85) finalRank = 'Silver';
                            
                            saveHighScore(currentLesson.id, finalAccuracy, finalRank, notesCorrect, total);
                        }
                    }

                    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
                    if (logAttempt) {
                        logAttempt(
                            currentLesson.id,
                            isRhythmMode ? 'play' : 'wait',
                            finalAccuracy,
                            notesCorrect,
                            notesMissed,
                            gameMode === 'treble' ? 'right' : (gameMode === 'bass' ? 'left' : 'both'),
                            1.0,
                            errorMeasures,
                            durationSeconds
                        );
                    }
                } else {
                    handleAddXp(50);
                    setTimeout(() => generateNewLevel(difficulty, isRhythmMode), 500);
                }
            }
            return;
        }

        const noteDuration = 60 / BPM;
        const step = alignedSteps[cursorIndex];
        const targetTime = step ? step.time * noteDuration : 0;
        const timeWindow = 0.35;

        const requiredNotes = new Set<number>();
        if (gameMode !== 'bass' && step && step.isTrebleOnset) {
            step.trebleKeys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }
        if (gameMode !== 'treble' && step && step.isBassOnset) {
            step.bassKeys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }

        const checkInterval = setInterval(() => {
            const currentRelevantActiveNotes = new Set<number>();
            activeNotesRef.current.forEach(n => {
                if (gameMode === 'both') {
                    currentRelevantActiveNotes.add(n);
                } else if (gameMode === 'treble') {
                    // Dynamic clef validation using notes present in treble signature, falling back to Middle C threshold
                    if (trebleRangeMidi.size > 0 ? trebleRangeMidi.has(n) : n >= 60) {
                        currentRelevantActiveNotes.add(n);
                    }
                } else if (gameMode === 'bass') {
                    // Dynamic clef validation using notes present in bass signature, falling back to Middle C threshold
                    if (bassRangeMidi.size > 0 ? bassRangeMidi.has(n) : n < 60) {
                        currentRelevantActiveNotes.add(n);
                    }
                }
            });

            const currentNewlyPressedActiveNotes = Array.from(currentRelevantActiveNotes).filter(
                n => !notesActiveAtStepStart.current.has(n)
            );

            // If it's a rest note, auto-advance if not in rhythm mode
            if (requiredNotes.size === 0) {
                if (!isRhythmMode) {
                    lastProcessedIndex.current = cursorIndex;
                    advanceCursor();
                } else if (currentNewlyPressedActiveNotes.length > 0) {
                    // Penalize off-beat keys pressed during rest in rhythm mode
                    if (inputStatus !== 'incorrect') {
                        setInputStatus('incorrect');
                        setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                        recordMiss(cursorIndex);
                        setStreak(0);
                    }
                }
                return;
            }

            const hasIncorrect = currentNewlyPressedActiveNotes.some(n => !requiredNotes.has(n));
            const allFound = requiredNotes.size > 0 && Array.from(requiredNotes).every(n => currentRelevantActiveNotes.has(n));

            let isPreHeldLocked = preHeld;
            if (isPreHeldLocked) {
                // Wait for user to completely release the chord before letting them try again
                const stillHoldingAll = Array.from(requiredNotes).every(n => activeNotesRef.current.has(n));
                const pressedNewRequired = currentNewlyPressedActiveNotes.some(n => requiredNotes.has(n));

                if (!stillHoldingAll || pressedNewRequired) {
                    setPreHeld(false);
                    isPreHeldLocked = false;
                }
            }

            if (isPreHeldLocked) {
                return;
            }

            if (allFound) {
                if (hasIncorrect) {
                    // Record a mistake, but still let them advance!
                    if (inputStatus !== 'incorrect') {
                        setInputStatus('incorrect');
                        setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                        recordMiss(cursorIndex);
                        setStreak(0);
                        currentNewlyPressedActiveNotes.filter(n => !requiredNotes.has(n)).forEach(n => {
                            const name = midiToNoteName(n);
                            setErrorStats(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                        });
                    }
                }

                if (isRhythmMode && isRhythmPlayingRef.current) {
                    const elapsedAtTrigger = elapsedTimeRef.current;
                    const diff = Math.abs(elapsedAtTrigger - targetTime);
                    if (diff > timeWindow) return;

                    lastProcessedIndex.current = cursorIndex;
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
                    advanceCursor();
                    return;
                }

                // Normal Mode
                if (!hasIncorrect) {
                    setScore(s => ({ ...s, correct: s.correct + 1 }));
                    setNotesCorrect(prev => prev + 1);
                    if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
                    setStreak(p => p + 1);
                    handleAddXp(5);
                    setLastHitType('good');
                    setInputStatus('correct');
                }

                lastProcessedIndex.current = cursorIndex;
                advanceCursor();
                setInputStatus('waiting');
                return;
            }

            // Penalty: Only if they press a WRONG note and did NOT hit the success notes
            if (hasIncorrect) {
                if (inputStatus !== 'incorrect') {
                    setInputStatus('incorrect');
                    setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                    recordMiss(cursorIndex);
                    setStreak(0);
                    currentNewlyPressedActiveNotes.filter(n => !requiredNotes.has(n)).forEach(n => {
                        const name = midiToNoteName(n);
                        setErrorStats(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                    });
                }
                return;
            }

            if (inputStatus !== 'incorrect' && inputStatus !== 'waiting') setInputStatus('waiting');
        }, 50);

        return () => {
            clearInterval(checkInterval);
        };

    }, [cursorIndex, alignedSteps, audioStarted, difficulty, gameMode, isRhythmMode, inputStatus, preHeld, streak, maxStreak, addXp, handleAddXp, levelUp, generateNewLevel, notesCorrect, notesMissed, saveHighScore, currentLesson, isLessonComplete, isDemoPlaying, trebleRangeMidi, bassRangeMidi]);


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
            setIsLessonComplete(false);
            
            // Set states for next lesson
            const isCap = isLessonCapstone(nextLesson);
            setIsCapstone(isCap);
            setRequiredAccuracy(isCap ? 85 : 80);
            setLessonPassed(false);
            
            setCurrentLesson(nextLesson);
            // Switch hand mode based on topic
            if (nextLesson.topic === 'treble') setGameMode('treble');
            else if (nextLesson.topic === 'bass') setGameMode('bass');
            else setGameMode('both');
            
            setLevelData(nextLesson.constraints 
                ? LevelGenerator.generateFromConstraints(nextLesson.constraints)
                : LevelGenerator.generate(difficulty, errorStats)
            );
            lastProcessedIndex.current = -1;
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
    }, [currentLesson, difficulty, errorStats, stopRhythm]);

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
        trebleCursorIndex: alignedSteps[cursorIndex]?.trebleNoteIndex ?? cursorIndex,
        bassCursorIndex: alignedSteps[cursorIndex]?.bassNoteIndex ?? cursorIndex,
        isTrebleOnset: alignedSteps[cursorIndex]?.isTrebleOnset ?? false,
        isBassOnset: alignedSteps[cursorIndex]?.isBassOnset ?? false,
        isDemoPlaying,
        isRhythmMode, countDown, streak, maxStreak, lastHitType,
        notePositions, setNotePositions,
        showNoteLabels, setShowNoteLabels,
        showStaff, setShowStaff,
        showMicPopup, setShowMicPopup,
        isMicListening, startMic, stopMic,
        micVolume,
        micNoteName,
        micSensitivity,
        setMicSensitivity,
        isMicCalibrating: isCalibrating,
        micCalibrationProgress: calibrationProgress,
        calibrateMicrophone,
        calibrationStep,
        calibrationTargetNote,
        availableMics,
        selectedMicId,
        activeMicLabel,
        changeMicrophone,
        midiInputs, // Exposed to SettingsPanel for device name display
        score, difficulty, levelData, paddedLevelData, alignedSteps,
        playheadX: 20, // Playhead position is updated directly in visual DOM playhead
        isMutedKeys,
        isLessonComplete,
        notesCorrect,
        notesMissed,
        lessonPassed,
        requiredAccuracy,
        isCapstone,

        // Actions
        startAudio, testAudio,
        generateNewLevel,
        handleStartRhythm,
        startDemo,
        stopDemo,
        resetLesson,
        parseKeyToMidi,
        setIsMutedKeys,
        setIsLessonComplete,
        goToNextLesson,
        handleSimulatedNoteOn,
        handleSimulatedNoteOff,

        // Course specific
        currentLesson,
        loadLesson,
        exitLesson: () => {
            setCurrentLesson(null);
            setIsLessonComplete(false);
            audio.releaseAll();
            stopDemo();
            stopRhythm();
        },

        // Progression
        awardXp: handleAddXp,

        // Looping and Weak Measures
        errorMeasures,
        loopRange,
        startLoopPractice
    };
};
