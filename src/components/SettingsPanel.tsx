import React from 'react';
import { usePreferences } from '../hooks/usePreferences';

interface SettingsPanelProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    audioStarted: boolean;
    isAudioLoading: boolean;
    onStartAudio: () => void;
    onResetProgress: () => void;
    micVolume?: number;
    micSensitivity?: number;
    onMicSensitivityChange?: (val: number) => void;
    midiInputs?: any[];
    isMicCalibrating?: boolean;
    micCalibrationProgress?: number;
    onCalibrateMic?: () => void;
    availableMics?: MediaDeviceInfo[];
    selectedMicId?: string;
    activeMicLabel?: string;
    onChangeMicrophone?: (deviceId: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isDarkMode,
    onToggleTheme,
    audioStarted,
    isAudioLoading,
    onStartAudio,
    onResetProgress,
    micVolume = 0,
    micSensitivity = 0.015,
    onMicSensitivityChange,
    midiInputs = [],
    isMicCalibrating = false,
    micCalibrationProgress = 0,
    onCalibrateMic,
    availableMics = [],
    selectedMicId = '',
    activeMicLabel = 'Default Microphone',
    onChangeMicrophone
}) => {
    const { preferences, updatePreference } = usePreferences();
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

                    {/* Microphone Device Selection */}
                    {availableMics.length > 0 ? (
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                Input Microphone Device
                            </label>
                            <select
                                value={selectedMicId}
                                onChange={(e) => onChangeMicrophone?.(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500"
                            >
                                {availableMics.map((mic) => (
                                    <option key={mic.deviceId} value={mic.deviceId}>
                                        {mic.label || `Microphone (${mic.deviceId.slice(0, 8)})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="mb-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Active Input: <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{activeMicLabel}</span>
                        </div>
                    )}

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

                    {/* Auto-Calibration Routine UI */}
                    <div className="mb-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/30">
                        {isMicCalibrating ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                        Listening to ambient room noise...
                                    </span>
                                    <span>{micCalibrationProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-250 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-650 transition-all duration-100"
                                        style={{ width: `${micCalibrationProgress}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-450 italic">
                                    Please remain completely quiet while calibration is in progress.
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={onCalibrateMic}
                                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-sm transition border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center gap-2"
                            >
                                🎙️ Auto-Calibrate Microphone
                            </button>
                        )}
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
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                        />
                        <div className="flex justify-between text-[10px] text-gray-450 mt-1">
                            <span>High Sensitivity (Quiet room)</span>
                            <span>Low Sensitivity (Noisy room)</span>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Appearance</h3>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Dark Mode</span>
                        <button
                            onClick={onToggleTheme}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Developer / Admin Settings */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">🧪 Developer Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Unlock all lessons and courses instantly to verify, test, and preview curriculum segments.
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Unlock All Lessons (Admin Mode)</span>
                        <button
                            onClick={() => {
                                const current = localStorage.getItem('adminMode') === 'true';
                                localStorage.setItem('adminMode', !current ? 'true' : 'false');
                                window.location.reload();
                            }}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none ${typeof window !== 'undefined' && localStorage.getItem('adminMode') === 'true' ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${typeof window !== 'undefined' && localStorage.getItem('adminMode') === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Tutor & Practice Preferences */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Tutor & Practice Preferences</h3>

                    {/* Show Keyboard */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium block">Show Virtual Keyboard</span>
                            <span className="text-xs text-gray-400">Display the on-screen interactive piano keyboard</span>
                        </div>
                        <button
                            onClick={() => updatePreference('showKeyboard', !preferences.showKeyboard)}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${preferences.showKeyboard ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${preferences.showKeyboard ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Show Piano Key Labels */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium block">Show Note Labels on Keys</span>
                            <span className="text-xs text-gray-400">Show C, D, E, etc., directly on the piano keys</span>
                        </div>
                        <button
                            onClick={() => updatePreference('showPianoLabels', !preferences.showPianoLabels)}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${preferences.showPianoLabels ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${preferences.showPianoLabels ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Show Fingering Guides */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium block">Show Fingering Guides</span>
                            <span className="text-xs text-gray-400">Display recommended finger numbers (1-5) above noteheads</span>
                        </div>
                        <button
                            onClick={() => updatePreference('showFingering', !preferences.showFingering)}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${preferences.showFingering ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${preferences.showFingering ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Sound Type Selection */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium block">Instrument Sound Type</span>
                            <span className="text-xs text-gray-400">Synthesizer waveforms vs realistic piano samples</span>
                        </div>
                        <select
                            value={preferences.soundType}
                            onChange={(e) => updatePreference('soundType', e.target.value as 'synth' | 'samples')}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500"
                        >
                            <option value="synth">Synthesizer</option>
                            <option value="samples">Grand Piano Samples</option>
                        </select>
                    </div>

                    {/* Hint Delay Dropdown */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium block">Tutor Hint Delay</span>
                            <span className="text-xs text-gray-400">How long to wait before highlighting target keys when stuck</span>
                        </div>
                        <select
                            value={preferences.hintDelay}
                            onChange={(e) => updatePreference('hintDelay', Number(e.target.value))}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500"
                        >
                            <option value={3000}>3 Seconds</option>
                            <option value={5000}>5 Seconds</option>
                            <option value={10000}>10 Seconds</option>
                            <option value={0}>Off (No Hints)</option>
                        </select>
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
