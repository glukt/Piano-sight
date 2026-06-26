import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { TrainerStaff, TrainerNoteData } from './TrainerStaff';
import { TrainerInputs } from './TrainerInputs';

// Level stats schema
interface LevelStats {
    bestSpeed: number; // seconds per note
    bestAccuracy: number; // percentage
    medal: 'Gold' | 'Silver' | 'Bronze' | null;
    completed: boolean;
}

interface SightReadingTrainerProps {
    gameLogic: {
        effectiveActiveNotes: Set<number>;
        handleSimulatedNoteOn: (note: number, velocity?: number) => void;
        handleSimulatedNoteOff: (note: number) => void;
        awardXp: (xp: number) => void;
    };
    onBackHome: () => void;
}

const LEVELS = [
    {
        id: 1,
        title: 'Guide Notes Anchors',
        description: 'Master the visual landmarks: C3, F3, C4, G4, and C5. No guessing, just instant recognition.',
        badge: 'Flashcards',
        difficulty: 'Novice',
        clef: 'both' as const,
        notesCount: 10,
    },
    {
        id: 2,
        title: 'Steps (Seconds)',
        description: 'Read adjacent steps (line to space or space to line). Trains relative motion in 5-finger positions.',
        badge: 'Melodic 2nds',
        difficulty: 'Beginner',
        clef: 'both' as const,
        notesCount: 8,
    },
    {
        id: 3,
        title: 'Skips (Thirds)',
        description: 'Explore line-to-line and space-to-space skips. Learn to identify chord shapes and triads.',
        badge: 'Melodic 3rds',
        difficulty: 'Intermediate',
        clef: 'both' as const,
        notesCount: 8,
    },
    {
        id: 4,
        title: 'Grand Staff Leaps',
        description: 'Combine treble and bass clefs with wider jumps (4ths & 5ths) requiring mental agility.',
        badge: 'Full Staff',
        difficulty: 'Advanced',
        clef: 'both' as const,
        notesCount: 8,
    },
    {
        id: 5,
        title: 'Speed Time Attack',
        description: 'A 60-second high-energy race. Play as many correct notes as possible before the clock hits zero!',
        badge: 'Time Trial',
        difficulty: 'Expert',
        clef: 'both' as const,
        notesCount: 100, // dynamically grows
    },
];

const parseKeyToMidi = (key: string): number => {
    const [note, octave] = key.split('/');
    const baseNote = note.charAt(0).toLowerCase();
    const accidental = note.slice(1);
    const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    let midi = noteMap[baseNote] + (parseInt(octave, 10) + 1) * 12;
    if (accidental === '#') midi += 1;
    else if (accidental === '##') midi += 2;
    else if (accidental === 'b') midi -= 1;
    else if (accidental === 'bb') midi -= 2;
    return midi;
};

// Pools for note generation
const GUIDE_NOTES = [
    { key: 'c/3', clef: 'bass' as const },
    { key: 'f/3', clef: 'bass' as const },
    { key: 'c/4', clef: 'treble' as const },
    { key: 'c/4', clef: 'bass' as const },
    { key: 'g/4', clef: 'treble' as const },
    { key: 'c/5', clef: 'treble' as const },
];

const L2_TREBLE = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4'];
const L2_BASS = ['c/3', 'd/3', 'e/3', 'f/3', 'g/3'];

const L3_TREBLE = ['c/4', 'e/4', 'g/4', 'd/4', 'f/4', 'a/4'];
const L3_BASS = ['f/2', 'a/2', 'c/3', 'e/3', 'g/3', 'd/3', 'f/3'];

const L4_TREBLE = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5', 'g/5'];
const L4_BASS = ['c/2', 'd/2', 'e/2', 'f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3'];

export const SightReadingTrainer: React.FC<SightReadingTrainerProps> = ({ gameLogic, onBackHome }) => {
    const { preferences } = usePreferences();
    const { effectiveActiveNotes, handleSimulatedNoteOn, handleSimulatedNoteOff, awardXp } = gameLogic;

    // View States
    const [stage, setStage] = useState<'menu' | 'playing' | 'summary'>('menu');
    const [currentLevel, setCurrentLevel] = useState<number>(1);

    // Active Exercise State
    const [notes, setNotes] = useState<TrainerNoteData[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [showNoteNames, setShowNoteNames] = useState<boolean>(preferences.showNoteNames);

    // Score / Stats Tracking
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [incorrectCount, setIncorrectCount] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);
    const [maxStreak, setMaxStreak] = useState<number>(0);

    // Timing States
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(60); // for Level 5
    const [isShaking, setIsShaking] = useState<boolean>(false);

    // Persistent Local Storage Stats
    const [stats, setStats] = useState<Record<number, LevelStats>>({});

    const timerRef = useRef<any | null>(null);
    const prevActiveNotesRef = useRef<Set<number>>(new Set());

    // Load stats from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('pianopilot_trainer_stats');
        if (saved) {
            try {
                setStats(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse trainer stats:', e);
            }
        }
    }, [stage]);

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // -------------------------------------------------------------------------
    // Note Generator Logic
    // -------------------------------------------------------------------------
    const generateExercise = (levelId: number): TrainerNoteData[] => {
        const list: TrainerNoteData[] = [];

        if (levelId === 1) {
            // Flashcard Mode: 10 random guide notes (no immediate repetitions)
            let lastKey = '';
            for (let i = 0; i < 10; i++) {
                const candidates = GUIDE_NOTES.filter(n => n.key !== lastKey);
                const pick = candidates[Math.floor(Math.random() * candidates.length)];
                list.push({ ...pick, status: 'pending' });
                lastKey = pick.key;
            }
        } else if (levelId === 2) {
            // Steps Mode: stepwise motion (2nds)
            const isTreble = Math.random() > 0.5;
            const pool = isTreble ? L2_TREBLE : L2_BASS;
            const clef = isTreble ? 'treble' : 'bass';

            let currentIdx = Math.floor(Math.random() * pool.length);
            list.push({ key: pool[currentIdx], clef, status: 'pending' });

            for (let i = 1; i < 8; i++) {
                const moves: number[] = [];
                if (currentIdx > 0) moves.push(-1);
                if (currentIdx < pool.length - 1) moves.push(1);
                const move = moves[Math.floor(Math.random() * moves.length)];
                currentIdx += move;
                list.push({ key: pool[currentIdx], clef, status: 'pending' });
            }
        } else if (levelId === 3) {
            // Skips Mode: steps and skips (3rds)
            const isTreble = Math.random() > 0.5;
            const pool = isTreble ? L3_TREBLE : L3_BASS;
            const clef = isTreble ? 'treble' : 'bass';

            let currentIdx = Math.floor(Math.random() * pool.length);
            list.push({ key: pool[currentIdx], clef, status: 'pending' });

            for (let i = 1; i < 8; i++) {
                const candidates: number[] = [];
                for (let diff of [-2, -1, 1, 2]) {
                    const idx = currentIdx + diff;
                    if (idx >= 0 && idx < pool.length) {
                        candidates.push(idx);
                    }
                }
                currentIdx = candidates[Math.floor(Math.random() * candidates.length)];
                list.push({ key: pool[currentIdx], clef, status: 'pending' });
            }
        } else if (levelId === 4) {
            // Grand Staff: mixed steps/skips/leaps in both clefs
            for (let i = 0; i < 8; i++) {
                const isTreble = Math.random() > 0.5;
                const clef = isTreble ? 'treble' : 'bass';
                const pool = isTreble ? L4_TREBLE : L4_BASS;
                const key = pool[Math.floor(Math.random() * pool.length)];
                list.push({ key, clef, status: 'pending' });
            }
        } else if (levelId === 5) {
            // Time Attack: generate 20 start notes
            for (let i = 0; i < 20; i++) {
                const isTreble = Math.random() > 0.5;
                const clef = isTreble ? 'treble' : 'bass';
                const pool = isTreble ? L4_TREBLE : L4_BASS;
                const key = pool[Math.floor(Math.random() * pool.length)];
                list.push({ key, clef, status: 'pending' });
            }
        }

        return list;
    };

    // -------------------------------------------------------------------------
    // Start / Finish Exercise
    // -------------------------------------------------------------------------
    const startLevel = (levelId: number) => {
        const generated = generateExercise(levelId);
        setNotes(generated);
        setActiveIndex(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setStreak(0);
        setMaxStreak(0);
        setCurrentLevel(levelId);
        setStage('playing');
        setStartTime(Date.now());
        setTimeLeft(60);
        prevActiveNotesRef.current = new Set(effectiveActiveNotes);

        if (levelId === 5) {
            // Set up Time Attack Countdown
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        finishLevelTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const finishLevel = (correct: number, incorrect: number) => {
        const timeTaken = (Date.now() - startTime) / 1000;
        const total = correct + incorrect;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const speed = correct > 0 ? Number((timeTaken / correct).toFixed(2)) : 999;

        // Calculate medal
        let medal: 'Gold' | 'Silver' | 'Bronze' | null = null;
        if (accuracy >= 90 && speed <= 1.5) medal = 'Gold';
        else if (accuracy >= 80 && speed <= 2.5) medal = 'Silver';
        else if (accuracy >= 70 && speed <= 4.0) medal = 'Bronze';

        // Calculate XP
        let xpReward = 20; // default participation
        if (medal === 'Gold') xpReward = 100;
        else if (medal === 'Silver') xpReward = 70;
        else if (medal === 'Bronze') xpReward = 50;

        // Award XP
        awardXp(xpReward);

        // Save Stats
        saveStats(currentLevel, speed, accuracy, medal);

        setEndTime(Date.now());
        setStage('summary');
    };

    const finishLevelTimeout = () => {
        // Special finalizer for Time Attack
        const total = correctCount + incorrectCount;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        const speed = correctCount > 0 ? Number((60 / correctCount).toFixed(2)) : 999;

        let medal: 'Gold' | 'Silver' | 'Bronze' | null = null;
        if (correctCount >= 40 && accuracy >= 90) medal = 'Gold';
        else if (correctCount >= 28 && accuracy >= 80) medal = 'Silver';
        else if (correctCount >= 18 && accuracy >= 70) medal = 'Bronze';

        // Time attack awards 5 XP per correct note
        const xpReward = Math.min(150, correctCount * 5);
        awardXp(xpReward);

        saveStats(5, speed, accuracy, medal);
        setEndTime(Date.now());
        setStage('summary');
    };

    const saveStats = (levelId: number, speed: number, accuracy: number, medal: 'Gold' | 'Silver' | 'Bronze' | null) => {
        const saved = localStorage.getItem('pianopilot_trainer_stats');
        let currentStats: Record<number, LevelStats> = {};
        if (saved) {
            try {
                currentStats = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse trainer stats:', e);
            }
        }

        const prev = currentStats[levelId] || { bestSpeed: 999, bestAccuracy: 0, medal: null, completed: false };

        const rankValue = (m: string | null) => {
            if (m === 'Gold') return 3;
            if (m === 'Silver') return 2;
            if (m === 'Bronze') return 1;
            return 0;
        };

        const updated: LevelStats = {
            bestSpeed: speed < prev.bestSpeed ? speed : prev.bestSpeed,
            bestAccuracy: accuracy > prev.bestAccuracy ? accuracy : prev.bestAccuracy,
            medal: rankValue(medal) >= rankValue(prev.medal) ? medal : prev.medal,
            completed: true,
        };

        currentStats[levelId] = updated;
        localStorage.setItem('pianopilot_trainer_stats', JSON.stringify(currentStats));
        setStats(currentStats);
    };

    // -------------------------------------------------------------------------
    // Input Handler / Listener Hook
    // -------------------------------------------------------------------------
    const triggerShakeFeedback = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 350);
    };

    const evaluateNotePress = (midiNote: number) => {
        const activeNote = notes[activeIndex];
        if (!activeNote) return;

        const expectedMidi = parseKeyToMidi(activeNote.key);
        const cachedIndex = activeIndex;

        if (midiNote === expectedMidi) {
            // Correct pitch played!
            const updated = [...notes];
            updated[activeIndex] = { ...activeNote, status: 'correct' };
            setNotes(updated);

            const newCorrect = correctCount + 1;
            setCorrectCount(newCorrect);

            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak) setMaxStreak(newStreak);

            if (currentLevel === 5) {
                // Time Attack dynamically appends new notes to read
                const isTreble = Math.random() > 0.5;
                const clef = isTreble ? 'treble' : 'bass';
                const pool = isTreble ? L4_TREBLE : L4_BASS;
                const nextKey = pool[Math.floor(Math.random() * pool.length)];
                setNotes(prev => [...prev, { key: nextKey, clef, status: 'pending' }]);
                setActiveIndex(prev => prev + 1);
            } else if (activeIndex + 1 >= notes.length) {
                // Completed regular level!
                finishLevel(newCorrect, incorrectCount);
            } else {
                setActiveIndex(prev => prev + 1);
            }
        } else {
            // Incorrect pitch played!
            const updated = [...notes];
            updated[activeIndex] = { ...activeNote, status: 'incorrect' };
            setNotes(updated);

            setIncorrectCount(prev => prev + 1);
            setStreak(0);
            triggerShakeFeedback();

            if (currentLevel === 1) {
                // Flashcard Mode advances automatically after a brief red flash
                setTimeout(() => {
                    setActiveIndex(prev => {
                        if (prev === cachedIndex) {
                            if (prev + 1 >= notes.length) {
                                finishLevel(correctCount, incorrectCount + 1);
                                return prev;
                            }
                            return prev + 1;
                        }
                        return prev;
                    });
                }, 800);
            } else {
                // Melodic Mode lets the player try again on the same note
                setTimeout(() => {
                    setNotes(prev => {
                        const reset = [...prev];
                        if (reset[cachedIndex] && reset[cachedIndex].status === 'incorrect') {
                            reset[cachedIndex].status = 'pending';
                        }
                        return reset;
                    });
                }, 500);
            }
        }
    };

    // Evaluate input notes from MIDI / Mic
    useEffect(() => {
        if (stage !== 'playing') return;

        const currentNotes = Array.from(effectiveActiveNotes);
        if (currentNotes.length === 0) {
            prevActiveNotesRef.current = new Set();
            return;
        }

        // Find the newly pressed notes
        const newlyPressed = currentNotes.filter(n => !prevActiveNotesRef.current.has(n));
        prevActiveNotesRef.current = new Set(effectiveActiveNotes);

        if (newlyPressed.length > 0) {
            // Process the first note press
            evaluateNotePress(newlyPressed[0]);
        }
    }, [effectiveActiveNotes, stage]);

    // -------------------------------------------------------------------------
    // Summaries & Computations
    // -------------------------------------------------------------------------
    const summaryXpGained = useMemo(() => {
        if (currentLevel === 5) {
            return Math.min(150, correctCount * 5);
        }
        const total = correctCount + incorrectCount;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        const timeTaken = (endTime - startTime) / 1000;
        const speed = correctCount > 0 ? timeTaken / correctCount : 999;

        let medal: 'Gold' | 'Silver' | 'Bronze' | null = null;
        if (accuracy >= 90 && speed <= 1.5) medal = 'Gold';
        else if (accuracy >= 80 && speed <= 2.5) medal = 'Silver';
        else if (accuracy >= 70 && speed <= 4.0) medal = 'Bronze';

        if (medal === 'Gold') return 100;
        if (medal === 'Silver') return 70;
        if (medal === 'Bronze') return 50;
        return 20;
    }, [correctCount, incorrectCount, startTime, endTime, currentLevel]);

    const activeNote = notes[activeIndex];

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 min-h-[80vh]">
            <style>{`
                @keyframes trainer-shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-6px); }
                    40%, 80% { transform: translateX(6px); }
                }
                .trainer-shake-anim {
                    animation: trainer-shake 0.35s ease-in-out;
                }
            `}</style>

            {/* Stage 1: Level Selection Screen */}
            {stage === 'menu' && (
                <div className="w-full flex flex-col items-center">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
                            Sight Reading Trainer
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                            The Frances Clark Landmark & Intervallic reading system. Practice on the go, no physical piano required.
                        </p>
                    </div>

                    {/* Level Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-2">
                        {LEVELS.map((level) => {
                            const levelStat = stats[level.id];
                            return (
                                <div
                                    key={`level-${level.id}`}
                                    onClick={() => startLevel(level.id)}
                                    className="group relative flex flex-col p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-blue-500/50 hover:shadow-xl cursor-pointer transition-all duration-300 backdrop-blur-md"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
                                                Level {level.id} • {level.difficulty}
                                            </span>
                                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                                                {level.title}
                                            </h3>
                                        </div>
                                        {/* Badge */}
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {level.badge}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex-grow">
                                        {level.description}
                                    </p>

                                    {/* Stats Summary */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                                        {levelStat?.completed ? (
                                            <div className="flex items-center gap-3">
                                                <span>Best: <strong className="text-slate-600 dark:text-slate-300">{levelStat.bestAccuracy}%</strong></span>
                                                <span>Speed: <strong className="text-slate-600 dark:text-slate-300">{levelStat.bestSpeed}s/n</strong></span>
                                            </div>
                                        ) : (
                                            <span className="italic">Not played yet</span>
                                        )}

                                        {/* Medal Graphic */}
                                        {levelStat?.medal && (
                                            <span className={`flex items-center gap-1 font-bold text-xs ${
                                                levelStat.medal === 'Gold' ? 'text-amber-500' :
                                                levelStat.medal === 'Silver' ? 'text-slate-400' : 'text-amber-700'
                                            }`}>
                                                🏆 {levelStat.medal}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={onBackHome}
                        className="mt-8 px-6 py-2.5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-300/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        Back to Home
                    </button>
                </div>
            )}

            {/* Stage 2: Trainer Game Loop Screen */}
            {stage === 'playing' && (
                <div className="w-full flex flex-col items-center">
                    {/* Header Controls */}
                    <div className="w-full flex items-center justify-between mb-4 px-2">
                        <button
                            onClick={() => {
                                if (timerRef.current) clearInterval(timerRef.current);
                                setStage('menu');
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            ✕ Exit
                        </button>
                        
                        {/* Streak fire meter */}
                        <div className="flex items-center gap-1">
                            {streak >= 3 && <span className="animate-bounce">🔥</span>}
                            <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest">
                                Streak: {streak}
                            </span>
                        </div>

                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {currentLevel === 5 ? (
                                <span className={`font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse text-sm' : ''}`}>
                                    Time: {timeLeft}s
                                </span>
                            ) : (
                                <span>Note: {activeIndex + 1}/{notes.length}</span>
                            )}
                        </div>
                    </div>

                    {/* Quick Accuracy Display */}
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>Hit: <strong className="text-green-500">{correctCount}</strong></span>
                        <span>Miss: <strong className="text-red-400">{incorrectCount}</strong></span>
                    </div>

                    {/* Custom SVG Stave Card */}
                    <div className={`w-full max-w-md ${isShaking ? 'trainer-shake-anim' : ''}`}>
                        <TrainerStaff
                            notes={notes}
                            clef={LEVELS[currentLevel - 1].clef}
                            activeIndex={activeIndex}
                            isDarkMode={preferences.isDarkMode}
                            showNoteNames={showNoteNames}
                        />
                    </div>

                    {/* Hint / Note Name Toggle */}
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <label className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={showNoteNames}
                                onChange={(e) => setShowNoteNames(e.target.checked)}
                                className="mr-1.5 accent-blue-500"
                            />
                            Show Helper Labels
                        </label>
                    </div>

                    {/* Inputs Wrapper */}
                    {activeNote && (
                        <div className="w-full">
                            <TrainerInputs
                                expectedNoteKey={activeNote.key}
                                onNoteOn={handleSimulatedNoteOn}
                                onNoteOff={handleSimulatedNoteOff}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Stage 3: Summary / Achievement screen */}
            {stage === 'summary' && (
                <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col items-center text-center">
                    <div className="text-5xl mb-4">
                        {summaryXpGained >= 100 ? '🏆' : '⭐'}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">
                        Exercise Completed!
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        {LEVELS[currentLevel - 1].title}
                    </p>

                    {/* Metrics list */}
                    <div className="w-full space-y-2 mb-6 text-xs text-slate-500 dark:text-slate-400 px-4">
                        <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span>Correct Notes</span>
                            <span className="font-extrabold text-green-500">{correctCount}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span>Incorrect Notes</span>
                            <span className="font-extrabold text-red-500">{incorrectCount}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span>Accuracy</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                {correctCount + incorrectCount > 0
                                    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span>Average Speed</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                {currentLevel === 5 ? (
                                    <span>{(60 / Math.max(1, correctCount)).toFixed(2)}s/note</span>
                                ) : (
                                    <span>{((endTime - startTime) / 1000 / Math.max(1, correctCount)).toFixed(2)}s/note</span>
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between py-1.5">
                            <span>Max Streak</span>
                            <span className="font-extrabold text-orange-500">🔥 {maxStreak}</span>
                        </div>
                    </div>

                    {/* XP Rewarded display */}
                    <div className="w-full py-3 mb-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                            XP Reward
                        </span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            +{summaryXpGained} XP
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col w-full gap-2 px-2">
                        <button
                            onClick={() => startLevel(currentLevel)}
                            className="w-full py-3 rounded-full text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/25 transition-all"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => setStage('menu')}
                            className="w-full py-3 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
