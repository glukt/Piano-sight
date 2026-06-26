import React, { useState, useEffect, useMemo } from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import { MusicDisplay, StaveNoteData } from './MusicDisplay';
import { courses, Lesson } from '../utils/music/CourseData';

interface DailyWorkoutProps {
    userXp: number;
    completedLessonIds: Set<string>;
    userActiveNotes: Set<number>;
    isDarkMode: boolean;
    onAddXp: (amount: number) => void;
    onStartReview: (songUrl: string, measure: number) => void;
    onSelectLesson: (lesson: Lesson) => void;
}

const parseKeyToMidi = (key: string): number => {
    const [note, octave] = key.split('/');
    const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    return noteMap[note.toLowerCase()] + (parseInt(octave) + 1) * 12;
};

const WARMUP_NOTES: StaveNoteData[] = [
    { keys: ["c/4"], duration: "q" },
    { keys: ["d/4"], duration: "q" },
    { keys: ["e/4"], duration: "q" },
    { keys: ["f/4"], duration: "q" },
    { keys: ["g/4"], duration: "q" },
    { keys: ["e/4"], duration: "q" },
    { keys: ["d/4"], duration: "q" },
    { keys: ["f/4"], duration: "q" },
    { keys: ["e/4"], duration: "q" },
    { keys: ["g/4"], duration: "q" },
    { keys: ["f/4"], duration: "q" },
    { keys: ["c/4"], duration: "q" }
];

export const DailyWorkout: React.FC<DailyWorkoutProps> = ({
    userXp,
    completedLessonIds,
    userActiveNotes,
    isDarkMode,
    onAddXp,
    onStartReview,
    onSelectLesson
}) => {
    const { width: windowWidth } = useWindowSize();
    const [activeStep, setActiveStep] = useState<'select' | 'warmup'>('select');
    
    // Warmup State
    const [warmupCursor, setWarmupCursor] = useState(0);
    const [warmupStatus, setWarmupStatus] = useState<'waiting' | 'correct' | 'incorrect'>('waiting');
    const [warmupComplete, setWarmupComplete] = useState(() => {
        const today = new Date().toISOString().split('T')[0];
        return localStorage.getItem('pianopilot_workout_warmup_date') === today;
    });

    // Parse Weak Measures
    const [weakMeasures, setWeakMeasures] = useState<Array<{ song: string; measure: number; mistakes: number }>>([]);

    const loadWeakMeasures = () => {
        try {
            const raw = localStorage.getItem('pianopilot_weak_measures');
            if (raw) {
                const data: Record<string, Record<number, number>> = JSON.parse(raw);
                const list: Array<{ song: string; measure: number; mistakes: number }> = [];
                for (const [song, measures] of Object.entries(data)) {
                    for (const [measureStr, mistakes] of Object.entries(measures)) {
                        list.push({
                            song,
                            measure: parseInt(measureStr),
                            mistakes
                        });
                    }
                }
                setWeakMeasures(list);
            } else {
                setWeakMeasures([]);
            }
        } catch (e) {
            console.error("Failed to load weak measures:", e);
        }
    };

    useEffect(() => {
        loadWeakMeasures();
    }, []);

    const deleteWeakMeasure = (song: string, measure: number) => {
        try {
            const raw = localStorage.getItem('pianopilot_weak_measures');
            if (raw) {
                const data: Record<string, Record<number, number>> = JSON.parse(raw);
                if (data[song]) {
                    delete data[song][measure];
                    if (Object.keys(data[song]).length === 0) {
                        delete data[song];
                    }
                    localStorage.setItem('pianopilot_weak_measures', JSON.stringify(data));
                    loadWeakMeasures();
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Warmup Validation Logic
    useEffect(() => {
        if (activeStep !== 'warmup' || warmupComplete) return;

        const targetNote = WARMUP_NOTES[warmupCursor];
        if (!targetNote) return;

        const requiredMidi = parseKeyToMidi(targetNote.keys[0]);
        if (userActiveNotes.has(requiredMidi)) {
            setWarmupStatus('correct');
            const timer = setTimeout(() => {
                setWarmupCursor(prev => {
                    const next = prev + 1;
                    if (next >= WARMUP_NOTES.length) {
                        setWarmupComplete(true);
                        onAddXp(25);
                        localStorage.setItem('pianopilot_workout_warmup_date', new Date().toISOString().split('T')[0]);
                        setActiveStep('select');
                    }
                    return next;
                });
                setWarmupStatus('waiting');
            }, 180);
            return () => clearTimeout(timer);
        } else if (userActiveNotes.size > 0) {
            const hasWrong = Array.from(userActiveNotes).some(n => n !== requiredMidi);
            if (hasWrong) {
                setWarmupStatus('incorrect');
            }
        } else {
            setWarmupStatus('waiting');
        }
    }, [userActiveNotes, warmupCursor, activeStep, warmupComplete, onAddXp]);

    // Next Lesson Progression Recommendation
    const recommendedLesson = useMemo(() => {
        const allLessons = courses.flatMap(c => c.lessons);
        // Find first incomplete unlocked lesson
        const firstIncompleteUnlocked = allLessons.find(
            l => userXp >= l.requiredXp && !completedLessonIds.has(l.id)
        );
        if (firstIncompleteUnlocked) return firstIncompleteUnlocked;

        // If all unlocked lessons are completed, recommend the first locked lesson
        const firstLocked = allLessons.find(l => l.requiredXp > userXp);
        if (firstLocked) return firstLocked;

        // Fallback to the last lesson in the curriculum
        return allLessons[allLessons.length - 1] || courses[0].lessons[0];
    }, [userXp, completedLessonIds]);

    return (
        <div className="w-full max-w-4xl flex flex-col gap-8 p-4">
            
            {/* Header */}
            <div className={`p-8 rounded-2xl border text-left shadow-lg relative overflow-hidden transition-all duration-300 ${
                isDarkMode 
                    ? 'bg-gray-800/80 border-gray-700/60 text-white' 
                    : 'bg-white border-gray-150 text-gray-900'
            }`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">🔥 Guided Daily Workout</h2>
                <p className="text-sm opacity-75 max-w-xl font-medium">
                    Maintain your daily streak and build muscle memory. Complete these three bite-sized steps to finish your workout today.
                </p>
            </div>

            {activeStep === 'warmup' ? (
                /* Interactive Warmup Interface */
                <div className={`p-4 md:p-8 rounded-2xl border text-center shadow-lg transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-150'
                }`}>
                    <h3 className="text-xl font-bold mb-1">🪵 Step 1: Sight-Reading Warmup</h3>
                    <p className="text-xs text-gray-500 mb-6 font-semibold uppercase tracking-wider">
                        Play the highlighted notes in sequence (C position)
                    </p>

                    <div className="flex justify-center mb-6">
                        <div className="w-full max-w-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                            <MusicDisplay
                                trebleNotes={WARMUP_NOTES}
                                bassNotes={[]}
                                width={Math.max(280, windowWidth < 640 ? windowWidth - 96 : 600)}
                                height={180}
                                cursorIndex={warmupCursor}
                                inputStatus={warmupStatus}
                                isDarkMode={isDarkMode}
                                showLabels={true}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center max-w-md mx-auto">
                        <span className="text-sm font-bold text-gray-500">
                            Progress: {warmupCursor} / {WARMUP_NOTES.length} notes
                        </span>
                        <button
                            onClick={() => {
                                setWarmupCursor(0);
                                setActiveStep('select');
                            }}
                            className="px-4 py-2 text-xs font-bold bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Cancel Warmup
                        </button>
                    </div>
                </div>
            ) : (
                /* Workout Steps Pathway */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* WARMUP STEP CARD */}
                    <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-md transition-all ${
                        warmupComplete 
                            ? 'opacity-80 bg-green-500/5 border-green-500/20' 
                            : isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-white border-gray-150'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-2xl font-bold ${warmupComplete ? 'text-green-500' : 'text-blue-500'}`}>
                                    {warmupComplete ? '✅' : '01'}
                                </span>
                                <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 tracking-wider">
                                    +25 XP
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Sight-Reading Warmup</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                                A simple 12-note sight-reading exercise. Quick finger activation to stretch and prep your hands.
                            </p>
                        </div>
                        {warmupComplete ? (
                            <div className="w-full text-center py-2.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl font-bold text-xs select-none">
                                Completed Today
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setWarmupCursor(0);
                                    setActiveStep('warmup');
                                }}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/10 transition active:scale-98"
                            >
                                Start Warmup
                            </button>
                        )}
                    </div>

                    {/* WEAKNESS REVIEW CARD */}
                    <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-md transition-all ${
                        weakMeasures.length === 0 
                            ? 'opacity-80 bg-green-500/5 border-green-500/20' 
                            : isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-white border-gray-150'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-2xl font-bold ${weakMeasures.length === 0 ? 'text-green-500' : 'text-blue-500'}`}>
                                    {weakMeasures.length === 0 ? '✅' : '02'}
                                </span>
                                <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 tracking-wider">
                                    Spaced Rep
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Weakness Review</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                                Practice measures where you recently made mistakes. Repeat loops until you achieve high accuracy.
                            </p>
                        </div>

                        {weakMeasures.length === 0 ? (
                            <div className="w-full text-center py-2.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl font-bold text-xs select-none">
                                All Clear! No Weaknesses
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                {weakMeasures.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700/50">
                                        <div className="text-left">
                                            <div className="text-[10px] font-black text-blue-500 truncate max-w-[120px]">
                                                {item.song.split('/').pop()?.replace('.musicxml', '').replace('.mxl', '') || 'Song'}
                                            </div>
                                            <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                Measure {item.measure} ({item.mistakes} err)
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => deleteWeakMeasure(item.song, item.measure)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition"
                                                title="Dismiss review"
                                            >
                                                🗑️
                                            </button>
                                            <button
                                                onClick={() => onStartReview(item.song, item.measure)}
                                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[10px] font-black tracking-wide uppercase transition"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {weakMeasures.length > 3 && (
                                    <div className="text-[10px] text-gray-400 font-semibold text-center italic mt-1">
                                        + {weakMeasures.length - 3} more measures
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PROGRESSION CARD */}
                    <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-md transition-all ${
                        isDarkMode ? 'bg-gray-800/60 border-gray-700/60' : 'bg-white border-gray-150'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-2xl font-bold text-blue-500">03</span>
                                <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 tracking-wider">
                                    Curriculum
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Curriculum Lesson</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium leading-relaxed">
                                Move forward in your learning path. Recommended next topic:
                            </p>
                            
                            {/* Recomended Lesson Detail Panel */}
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-755 border border-gray-100 dark:border-gray-700/50 mb-6 text-left">
                                <div className="text-xs font-black text-purple-500 uppercase tracking-widest leading-none mb-1.5">
                                    {recommendedLesson.type === 'song' ? '🎵 Song' : '🪵 Exercise'}
                                </div>
                                <h4 className="text-sm font-black text-gray-800 dark:text-white mb-1 leading-snug">
                                    {recommendedLesson.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 leading-snug truncate">
                                    {recommendedLesson.description}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onSelectLesson(recommendedLesson)}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/10 transition active:scale-98"
                        >
                            Start Recommended Lesson
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};
