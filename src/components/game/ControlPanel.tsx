import React from 'react';
import { Difficulty } from '../../engine/LevelGenerator';

interface ControlPanelProps {
    gameMode: 'both' | 'treble' | 'bass';
    setGameMode: (mode: 'both' | 'treble' | 'bass') => void;
    difficulty: Difficulty;
    onDifficultyChange: (diff: Difficulty) => void;
    isRhythmMode: boolean;
    onToggleRhythmMode: () => void;
    countDown: number | null;
    audioStarted: boolean;
    onTestAudio: () => void;
    showNoteLabels: boolean;
    setShowNoteLabels: (show: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    gameMode,
    setGameMode,
    difficulty,
    onDifficultyChange,
    isRhythmMode,
    onToggleRhythmMode,
    countDown,
    audioStarted,
    onTestAudio,
    showNoteLabels,
    setShowNoteLabels
}) => {
    return (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Settings */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Input & Mode</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setGameMode('both')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold ${gameMode === 'both' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Both Hands
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setGameMode('treble')}
                        className={`flex-1 py-1 rounded text-xs font-bold ${gameMode === 'treble' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Right (Treble)
                    </button>
                    <button
                        onClick={() => setGameMode('bass')}
                        className={`flex-1 py-1 rounded text-xs font-bold ${gameMode === 'bass' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Left (Bass)
                    </button>
                </div>
            </div>

            {/* Difficulty */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Difficulty</h3>
                <div className="flex gap-2 flex-wrap">
                    {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map(k => (
                        <button
                            key={k}
                            onClick={() => onDifficultyChange(Difficulty[k])}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${difficulty === Difficulty[k]
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {k}
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Actions</h3>
                {!audioStarted && (
                    <div className="w-full py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs font-medium text-center px-2">
                        Head to Settings ⚙️ to start Audio Engine
                    </div>
                )}
                <button
                    onClick={onToggleRhythmMode}
                    className={`w-full py-2 rounded-lg font-bold text-sm shadow-sm transition ${isRhythmMode
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                >
                    {isRhythmMode ? (countDown ? 'Get Ready!' : 'Stop Rhythm Mode') : 'Start Rhythm Mode'}
                </button>
                <div className="flex gap-2 mt-auto">
                    <button onClick={onTestAudio} disabled={!audioStarted} className="flex-1 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200">
                        Test Sound
                    </button>
                    <button onClick={() => setShowNoteLabels(!showNoteLabels)} className="flex-1 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200">
                        {showNoteLabels ? 'Hide Labels' : 'Show Labels'}
                    </button>
                </div>
            </div>
        </div>
    );
};
