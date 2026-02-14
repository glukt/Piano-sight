import React from 'react';

interface SettingsPanelProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    showNoteLabels: boolean;
    onToggleLabels: () => void;
    audioStarted: boolean;
    isAudioLoading: boolean;
    onStartAudio: () => void;
    onResetProgress: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isDarkMode,
    onToggleTheme,
    showNoteLabels,
    onToggleLabels,
    audioStarted,
    isAudioLoading,
    onStartAudio,
    onResetProgress
}) => {
    return (
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                ⚙️ Settings & Accessibility
            </h2>

            <div className="space-y-6">
                {/* Audio Engine */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Audio Engine</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Required for playback and piano synthesis. Start this to enable sound.
                    </p>
                    {audioStarted ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Audio Engine Active
                        </div>
                    ) : (
                        <button
                            onClick={onStartAudio}
                            disabled={isAudioLoading}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAudioLoading ? 'Initializing...' : 'Start Audio Engine'}
                        </button>
                    )}
                </div>

                {/* Appearance */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Appearance</h3>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Dark Mode</span>
                        <button
                            onClick={onToggleTheme}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Show Note Labels</span>
                        <button
                            onClick={onToggleLabels}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${showNoteLabels ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${showNoteLabels ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <h3 className="font-bold text-red-700 dark:text-red-300 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600/70 dark:text-red-300/70 mb-4">
                        Reset all progress, levels, and achievements. This cannot be undone.
                    </p>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
                                onResetProgress();
                            }
                        }}
                        className="px-6 py-2 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold rounded-lg transition"
                    >
                        Reset Progress
                    </button>
                </div>
            </div>
        </div>
    );
};
