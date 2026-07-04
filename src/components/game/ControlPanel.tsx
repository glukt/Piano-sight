import React from 'react';
import { Difficulty } from '../../engine/LevelGenerator';
import { Lesson } from '../../utils/music/CourseData';

interface ControlPanelProps {
    gameMode: 'both' | 'treble' | 'bass';
    setGameMode: (mode: 'both' | 'treble' | 'bass') => void;
    difficulty: Difficulty;
    onDifficultyChange: (diff: Difficulty) => void;
    isRhythmMode: boolean;
    onToggleRhythmMode: () => void;
    isDemoPlaying: boolean;
    onToggleDemo: () => void;
    onResetLesson: () => void;
    countDown: number | null;
    audioStarted: boolean;
    onTestAudio: () => void;
    showNoteLabels: boolean;
    setShowNoteLabels: (show: boolean) => void;
    showStaff: boolean;
    setShowStaff: (show: boolean) => void;
    currentLesson?: Lesson | null;
    showKeyboard: boolean;
    onToggleKeyboard: (show: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    gameMode,
    setGameMode,
    difficulty,
    onDifficultyChange,
    isRhythmMode,
    onToggleRhythmMode,
    isDemoPlaying,
    onToggleDemo,
    onResetLesson,
    countDown,
    audioStarted,
    onTestAudio,
    showNoteLabels,
    setShowNoteLabels,
    showStaff,
    setShowStaff,
    currentLesson,
    showKeyboard,
    onToggleKeyboard
}) => {
    const isLessonActive = !!currentLesson;
    const lessonTopic = currentLesson?.topic;

    // Determine lock statuses based on lesson topic
    const isTrebleLocked = isLessonActive && lessonTopic === 'treble';
    const isBassLocked = isLessonActive && lessonTopic === 'bass';

    return (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Settings */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Input & Mode</h3>
                
                {isTrebleLocked && (
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-100 dark:border-amber-900/30">
                        🔒 Locked to Right Hand (Treble Clef only)
                    </div>
                )}
                {isBassLocked && (
                    <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-100 dark:border-amber-900/30">
                        🔒 Locked to Left Hand (Bass Clef only)
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => setGameMode('both')}
                        disabled={isTrebleLocked || isBassLocked}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                            gameMode === 'both' 
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-40'
                        }`}
                    >
                        Both Hands
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setGameMode('treble')}
                        disabled={isBassLocked}
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition ${
                            gameMode === 'treble' 
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-40'
                        }`}
                    >
                        Right (Treble)
                    </button>
                    <button
                        onClick={() => setGameMode('bass')}
                        disabled={isTrebleLocked}
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition ${
                            gameMode === 'bass' 
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-40'
                        }`}
                    >
                        Left (Bass)
                    </button>
                </div>
            </div>

            {/* Difficulty or Active Lesson Info */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                {isLessonActive ? (
                    <>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Active Lesson</h3>
                        <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
                            {currentLesson?.name}
                        </div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-905/30 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-800/80 line-clamp-3">
                            <span className="font-bold text-indigo-500">Focus:</span> {currentLesson?.focus || currentLesson?.description}
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Difficulty</h3>
                        <div className="flex gap-2 flex-wrap">
                            {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map(k => (
                                <button
                                    key={k}
                                    onClick={() => onDifficultyChange(Difficulty[k])}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        difficulty === Difficulty[k]
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {k}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Actions & Display Toggles */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Actions</h3>
                {!audioStarted && (
                    <div className="w-full py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs font-medium text-center px-2">
                        Head to Settings ⚙️ to start Audio Engine
                    </div>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={onToggleRhythmMode}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm shadow-sm transition ${isRhythmMode
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                    >
                        {isRhythmMode ? (countDown ? 'Get Ready!' : 'Stop Rhythm') : 'Start Rhythm'}
                    </button>
                    <button
                        onClick={onToggleDemo}
                        disabled={!audioStarted}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm shadow-sm transition ${isDemoPlaying
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                            }`}
                    >
                        {isDemoPlaying ? 'Stop Demo' : 'Play Demo (Listen)'}
                    </button>
                </div>
                <button
                    onClick={onResetLesson}
                    className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold transition"
                >
                    Reset Lesson
                </button>
                
                {/* 2x2 Grid of Quick Display Options */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button 
                        onClick={onTestAudio} 
                        disabled={!audioStarted} 
                        className="py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50 transition"
                    >
                        🔊 Test Sound
                    </button>
                    <button 
                        onClick={() => onToggleKeyboard(!showKeyboard)} 
                        className="py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:text-blue-500 dark:hover:text-blue-400 transition"
                    >
                        🎹 {showKeyboard ? 'Hide Piano' : 'Show Piano'}
                    </button>
                    <button 
                        onClick={() => setShowNoteLabels(!showNoteLabels)} 
                        className="py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:text-blue-500 dark:hover:text-blue-400 transition"
                    >
                        🏷️ {showNoteLabels ? 'Hide Labels' : 'Show Labels'}
                    </button>
                    <button 
                        onClick={() => setShowStaff(!showStaff)} 
                        className="py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:text-blue-500 dark:hover:text-blue-400 transition"
                    >
                        🎼 {showStaff ? 'Hide Staff' : 'Show Staff'}
                    </button>
                </div>
            </div>
        </div>
    );
};
