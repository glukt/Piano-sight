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
    onTogglePlayback: () => void;
    onReset: () => void;
    onToggleKeyboard: (val: boolean) => void;
    onTogglePianoLabels: (val: boolean) => void;
    onToggleHighlight: (val: boolean) => void;
    onToggleNoteNames: (val: boolean) => void;
    onTogglePractice: () => void;
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
    onTogglePlayback,
    onReset,
    onToggleKeyboard,
    onTogglePianoLabels,
    onToggleHighlight,
    onToggleNoteNames,
    onTogglePractice
}) => {
    return (
        <div className={`w-full max-w-4xl p-4 rounded-xl shadow-lg border flex flex-col gap-4 mb-6 transition-colors duration-500
             ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}
        `}>
            {/* Top Row: Playback & File Info */}
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

            {/* Bottom Row: Toggles */}
            <div className={`flex flex-wrap items-center justify-center gap-6 p-4 rounded-lg border w-full max-w-4xl mb-4 font-sans text-sm transition-colors duration-500
                ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}
            `}>
                <div className={`font-serif font-bold mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Display:</div>

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

                {/* Practice Mode Toggle */}
                <button
                    onClick={onTogglePractice}
                    className={`ml-4 px-4 py-1 rounded-full text-xs font-bold border transition animate-pulse
                        ${isPracticeActive
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-rose-600 shadow-lg'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600 shadow-md hover:scale-105'}
                    `}
                >
                    {isPracticeActive ? 'Exit Practice' : '🎓 Learn to Play!'}
                </button>
            </div>
        </div>
    );
};
