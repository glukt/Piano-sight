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
    micVolume?: number;
    micSensitivity?: number;
    onMicSensitivityChange?: (val: number) => void;
    midiInputs?: any[];
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isDarkMode,
    onToggleTheme,
    showNoteLabels,
    onToggleLabels,
    audioStarted,
    isAudioLoading,
    onStartAudio,
    onResetProgress,
    micVolume = 0,
    micSensitivity = 0.01,
    onMicSensitivityChange,
    midiInputs = []
}) => {
    // Normalize volume for progress bar (RMS ranges roughly 0 to 0.1 for typical input)
    const volumePercentage = Math.min(100, Math.round((micVolume / 0.1) * 100));

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

                {/* MIDI Connection Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">MIDI Keyboard Devices</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Connect a digital keyboard via USB-MIDI to enable low-latency practice.
                    </p>
                    {midiInputs.length > 0 ? (
                        <div className="space-y-2">
                            {midiInputs.map((input, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg font-medium text-sm">
                                    🎹 {input.name || `MIDI Device ${idx + 1}`} ({input.manufacturer || 'Generic'})
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 px-3 py-2 rounded-lg font-medium">
                            ⚠️ No MIDI Keyboard detected. (Free play and Acoustic Mic modes remain available)
                        </div>
                    )}
                </div>

                {/* Acoustic Piano Mic Calibration */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Acoustic Piano Calibration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Calibrate your microphone sensitivity to filter out room noise and detect key strikes correctly.
                    </p>

                    {/* Live Input Meter */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            <span>Microphone Level</span>
                            <span>{volumePercentage}%</span>
                        </div>
                        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-75"
                                style={{ width: `${volumePercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Sensitivity Slider */}
                    <div>
                        <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            <span>Noise Gate Sensitivity</span>
                            <span className="font-mono">{micSensitivity.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.001"
                            max="0.05"
                            step="0.001"
                            value={micSensitivity}
                            onChange={(e) => onMicSensitivityChange?.(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>High Sensitivity (Quiet room)</span>
                            <span>Low Sensitivity (Noisy room)</span>
                        </div>
                    </div>
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
