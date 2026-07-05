import React from 'react';

interface ScoreControlsProps {
    loading: boolean;
    isPlaying: boolean;
    isDarkMode: boolean;
    showKeyboard: boolean;
    showPianoLabels: boolean;
    highlightNotes: boolean;
    showNoteNames: boolean;
    isPracticeActive: boolean;
    layoutMode: 'standard' | 'scrolling';
    isMutedPlayback: boolean;
    isMutedKeys: boolean;
    onTogglePlayback: () => void;
    onReset: () => void;
    onToggleKeyboard: (val: boolean) => void;
    onTogglePianoLabels: (val: boolean) => void;
    onToggleHighlight: (val: boolean) => void;
    onToggleNoteNames: (val: boolean) => void;
    onTogglePractice: () => void;
    onChangeLayoutMode: (mode: 'standard' | 'scrolling') => void;
    onToggleMutedPlayback: (val: boolean) => void;
    onToggleMutedKeys: (val: boolean) => void;
    isLessonMode?: boolean; // NEW
    practicedHand?: 'both' | 'right' | 'left';
    onChangePracticedHand?: (hand: 'both' | 'right' | 'left') => void;
    tempoMultiplier?: number;
    onChangeTempoMultiplier?: (val: number) => void;
    isSpeedTrainerActive?: boolean;
    onToggleSpeedTrainer?: (val: boolean) => void;
}

export const ScoreControls: React.FC<ScoreControlsProps> = ({
    loading,
    isPlaying,
    isDarkMode,
    showKeyboard,
    showPianoLabels,
    highlightNotes,
    showNoteNames,
    isPracticeActive,
    layoutMode,
    isMutedPlayback,
    isMutedKeys,
    onTogglePlayback,
    onReset,
    onToggleKeyboard,
    onTogglePianoLabels,
    onToggleHighlight,
    onToggleNoteNames,
    onTogglePractice,
    onChangeLayoutMode,
    onToggleMutedPlayback,
    onToggleMutedKeys,
    isLessonMode = false, // NEW
    practicedHand = 'both',
    onChangePracticedHand,
    tempoMultiplier = 1.0,
    onChangeTempoMultiplier,
    isSpeedTrainerActive = false,
    onToggleSpeedTrainer
}) => {
    return (
        <div className={`w-full max-w-4xl p-4 rounded-xl shadow-lg border flex flex-col gap-4 mb-6 transition-colors duration-500
             ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}
        `}>
            {/* Top Row: Playback & File Info */}
            {!isLessonMode && (
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={onTogglePlayback}
                            disabled={loading}
                            className={`px-6 py-2 rounded-full font-bold uppercase text-sm tracking-wider transition-all
                                ${isPlaying
                                    ? 'bg-red-500 text-white shadow-red-500/50 hover:bg-red-600'
                                    : (isDarkMode ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-500 text-white shadow-emerald-500/50 hover:bg-emerald-600')}
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:scale-105 active:scale-95'}
                            `}
                        >
                            {loading ? 'Loading...' : isPlaying ? 'Stop' : 'Play'}
                        </button>
                        <button
                            onClick={onReset}
                            disabled={loading}
                            className={`px-6 py-2 rounded-full font-bold uppercase text-sm tracking-wider transition-all
                                ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:scale-105 active:scale-95'}
                            `}
                        >
                            Reset
                        </button>
                    </div>
                    {/* Placeholder for file info / title */}
                    <div className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {/* Score Title */}
                    </div>
                </div>
            )}

            {/* Bottom Row: Toggles */}
            <div className={`flex flex-wrap items-center justify-center gap-4 p-4 rounded-lg border w-full max-w-4xl mb-4 font-sans text-sm transition-colors duration-500
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}
            `}>
                {/* Layout Mode Segmented Picker */}
                <div className="flex bg-gray-200 dark:bg-gray-900 p-1 rounded-full mr-2 border border-gray-300 dark:border-gray-600">
                    <button
                        onClick={() => onChangeLayoutMode('standard')}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${layoutMode === 'standard' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                    >
                        Standard Page
                    </button>
                    <button
                        onClick={() => onChangeLayoutMode('scrolling')}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${layoutMode === 'scrolling' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                    >
                        <span>Scrolling View</span>
                        <span className="text-[9px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded-full leading-none">Auto</span>
                    </button>
                </div>

                {/* Practiced Hand Segmented Picker (only if practice mode is active!) */}
                {isPracticeActive && !isLessonMode && (
                    <div className="flex bg-gray-200 dark:bg-gray-900 p-1 rounded-full border border-gray-300 dark:border-gray-600 mr-2">
                        <button
                            onClick={() => onChangePracticedHand?.('both')}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${practicedHand === 'both' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            Both Hands
                        </button>
                        <button
                            onClick={() => onChangePracticedHand?.('right')}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${practicedHand === 'right' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            RH Only
                        </button>
                        <button
                            onClick={() => onChangePracticedHand?.('left')}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${practicedHand === 'left' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            LH Only
                        </button>
                    </div>
                )}

                <div className={`font-serif font-bold mr-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Display:</div>

                <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                    <input
                        type="checkbox"
                        checked={showKeyboard}
                        onChange={(e) => onToggleKeyboard(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Virtual Piano</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                    <input
                        type="checkbox"
                        checked={showPianoLabels}
                        onChange={(e) => onTogglePianoLabels(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Piano Labels</span>
                </label>

                <div className={`h-4 w-px mx-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>

                <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                    <input
                        type="checkbox"
                        checked={highlightNotes}
                        onChange={(e) => onToggleHighlight(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Highlight Notes</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                    <input
                        type="checkbox"
                        checked={showNoteNames}
                        onChange={(e) => onToggleNoteNames(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Score Labels</span>
                </label>

                <div className={`h-4 w-px mx-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>

                <div className={`font-serif font-bold mr-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Audio:</div>

                <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                    <input
                        type="checkbox"
                        checked={isMutedPlayback}
                        onChange={(e) => onToggleMutedPlayback(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Mute Playback</span>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                    <input
                        type="checkbox"
                        checked={isMutedKeys}
                        onChange={(e) => onToggleMutedKeys(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Mute Keys</span>
                </label>

                {/* Practice Mode Toggle */}
                {!isLessonMode && (
                    <button
                        onClick={onTogglePractice}
                        disabled={loading}
                        className={`ml-4 px-4 py-1 rounded-full text-xs font-bold border transition animate-pulse
                            ${isPracticeActive
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-rose-600 shadow-lg'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600 shadow-md hover:scale-105'}
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isPracticeActive ? 'Exit Practice' : '🎓 Learn to Play!'}
                    </button>
                )}
            </div>

            {/* Speed Trainer & Tempo Controls */}
            {isPracticeActive && (
                <div className={`flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border w-full font-sans text-sm transition-colors duration-500
                    ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}
                `}>
                    <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                        <span className="font-bold flex items-center gap-1">⏱️ Speed: {Math.round(tempoMultiplier * 100)}%</span>
                        <input
                            type="range"
                            min="0.4"
                            max="1.2"
                            step="0.05"
                            value={tempoMultiplier}
                            disabled={isSpeedTrainerActive}
                            onChange={(e) => onChangeTempoMultiplier?.(parseFloat(e.target.value))}
                            className="flex-1 max-w-[200px] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-gray-600 disabled:opacity-50"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isSpeedTrainerActive}
                            onChange={(e) => onToggleSpeedTrainer?.(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">🚀 Auto Speed Trainer (+10% on success)</span>
                    </label>
                </div>
            )}
        </div>
    );
};
