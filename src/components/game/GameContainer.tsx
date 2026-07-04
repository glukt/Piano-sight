import React from 'react';
import { MusicDisplay } from '../MusicDisplay';
import VirtualKeyboard from '../VirtualKeyboard';
import { ControlPanel } from './ControlPanel';
import { PerformanceReportCard } from '../PerformanceReportCard';

// Import Types
import { useGameLogic } from '../../hooks/useGameLogic';
import { usePreferences } from '../../hooks/usePreferences';

interface GameContainerProps {
    gameLogic: ReturnType<typeof useGameLogic>;
    windowWidth: number;
    isDarkMode: boolean;
    onNextLesson?: () => void;
    onExitLesson?: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
    gameLogic,
    windowWidth,
    isDarkMode,
    onNextLesson,
    onExitLesson
}) => {
    const { preferences, updatePreference } = usePreferences();
    const {
        // State
        audioStarted,
        isMidiEnabled,
        effectiveActiveNotes,
        cursorIndex, inputStatus, gameMode, setGameMode,
        trebleCursorIndex, bassCursorIndex,
        isTrebleOnset, isBassOnset,
        isDemoPlaying,
        isRhythmMode, countDown, streak, lastHitType,
        setNotePositions,
        showNoteLabels, setShowNoteLabels,
        showStaff, setShowStaff,
        showMicPopup, setShowMicPopup,
        score, difficulty, paddedLevelData,

        // Actions
        testAudio,
        generateNewLevel,
        handleStartRhythm,
        startDemo,
        resetLesson,
        parseKeyToMidi,
        startMic,
        stopMic,
        isMicListening,
        micVolume,
        micNoteName,
        micSensitivity,
        isMicCalibrating,
        micCalibrationProgress,
        calibrateMicrophone,
        calibrationStep,
        calibrationTargetNote,
        availableMics,
        selectedMicId,
        activeMicLabel,
        changeMicrophone
    } = gameLogic;

    // Calculate expected notes for Virtual Keyboard visualization
    const expectedNotes = React.useMemo(() => {
        const targets: number[] = [];
        const tIndex = trebleCursorIndex !== undefined ? trebleCursorIndex : cursorIndex;
        const bIndex = bassCursorIndex !== undefined ? bassCursorIndex : cursorIndex;
        
        const t = paddedLevelData.treble[tIndex];
        const b = paddedLevelData.bass[bIndex];

        // Filter by Game Mode
        if (gameMode !== 'bass' && t) t.keys.forEach(k => targets.push(parseKeyToMidi(k)));
        if (gameMode !== 'treble' && b) b.keys.forEach(k => targets.push(parseKeyToMidi(k)));
        return targets;
    }, [paddedLevelData, cursorIndex, trebleCursorIndex, bassCursorIndex, gameMode, parseKeyToMidi]);

    const bottomPaddingClass = preferences.showKeyboard ? 'pb-44' : 'pb-10';

    return (
        <div className={`w-full flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${bottomPaddingClass}`}>
            {/* Header / Stats Bar wrapper */}
            <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                {onExitLesson ? (
                    <button
                        onClick={onExitLesson}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5 shadow-sm border border-gray-200/50 dark:border-gray-700/50 select-none active:scale-95"
                    >
                        ← Exit Lesson
                    </button>
                ) : (
                    <div />
                )}

                <div className="flex gap-8 text-sm font-bold bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMidiEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={isMidiEnabled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>{isMidiEnabled ? 'MIDI Connected' : 'No MIDI'}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 self-center"></div>
                    <div className="flex items-center gap-4">
                        <span className="text-green-600 dark:text-green-400">Correct: {score.correct}</span>
                        <span className="text-red-500 dark:text-red-400">Missed: {score.incorrect}</span>
                    </div>
                </div>
            </div>

            <div className="relative w-full max-w-5xl">
                {countDown !== null && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl">
                        <span className="text-9xl font-bold text-[#D4AF37] animate-pulse">{countDown}</span>
                    </div>
                )}
                {/* Microphone Setup Overlay */}
                {showMicPopup && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-sm rounded-xl p-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center border-2 border-indigo-500 animate-in zoom-in-95 duration-200">
                            <div className="text-4xl mb-3">🎙️</div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Microphone Input Setup</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                No MIDI keyboard detected. Let's calibrate your microphone to detect your acoustic piano strikes.
                            </p>

                            {!isMicListening ? (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => startMic()}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition"
                                    >
                                        Allow Microphone Access
                                    </button>
                                    <button
                                        onClick={() => setShowMicPopup(false)}
                                        className="w-full py-2 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs"
                                    >
                                        No, thanks (Use Free Play)
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 text-left">
                                    {/* Active Mic Indicator */}
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg border border-gray-200/20 flex justify-between items-center">
                                        <span>Active Mic:</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[200px]">{activeMicLabel}</span>
                                    </div>

                                    {/* Mic Dropdown Selector */}
                                    {availableMics.length > 1 && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Select Input Device
                                            </label>
                                            <select
                                                value={selectedMicId}
                                                onChange={(e) => changeMicrophone(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-indigo-500"
                                            >
                                                {availableMics.map((mic) => (
                                                    <option key={mic.deviceId} value={mic.deviceId}>
                                                        {mic.label || `Microphone (${mic.deviceId.slice(0, 8)})`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Live Input Meter */}
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                            <span>Input Level</span>
                                            <span>{Math.min(100, Math.round((micVolume / 0.1) * 100))}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-75"
                                                style={{ width: `${Math.min(100, Math.round((micVolume / 0.1) * 100))}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Auto-Calibrate */}
                                    <div className="border-t border-gray-200/50 dark:border-gray-750/30 pt-3">
                                        {isMicCalibrating ? (
                                            <div className="space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                                                {calibrationStep === 'silence' && (
                                                    <>
                                                        <div className="flex justify-between text-xs font-semibold text-indigo-650 dark:text-indigo-400">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                                                                Measuring Room Silence...
                                                            </span>
                                                            <span>{micCalibrationProgress}%</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500">Please remain completely quiet.</p>
                                                    </>
                                                )}
                                                {calibrationStep === 'strike' && (
                                                    <>
                                                        <div className="flex justify-between text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                                                            <span className="flex items-center gap-1.5">
                                                                🎹 Strike {calibrationTargetNote} Now!
                                                            </span>
                                                            <span>{micCalibrationProgress}%</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                                                            <span>Play Middle C firmly.</span>
                                                            <span className="font-bold text-indigo-650 dark:text-indigo-400">Hearing: {micNoteName}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {calibrationStep === 'success' && (
                                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-center py-1">
                                                        ✅ Calibration Successful!
                                                    </div>
                                                )}
                                                {calibrationStep === 'failed' && (
                                                    <div className="text-xs font-bold text-rose-600 dark:text-rose-450 flex items-center gap-1.5 justify-center py-1">
                                                        ⚠️ C4 not detected. Using fallback.
                                                    </div>
                                                )}

                                                {/* Progress Bar */}
                                                {(calibrationStep === 'silence' || calibrationStep === 'strike') && (
                                                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-650 transition-all duration-100"
                                                            style={{ width: `${micCalibrationProgress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => calibrateMicrophone()}
                                                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-xs transition border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center gap-1.5"
                                            >
                                                🎙️ Interactive Audio Calibration
                                            </button>
                                        )}
                                        {!isMicCalibrating && (
                                            <div className="flex justify-between text-[10px] text-gray-450 mt-1.5">
                                                <span>Noise Gate: <span className="font-mono">{micSensitivity.toFixed(4)}</span></span>
                                                <span>Middle C strike required for best results</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <button
                                            onClick={() => {
                                                stopMic();
                                                localStorage.removeItem('pianopilot_mic_enabled');
                                                setShowMicPopup(false);
                                            }}
                                            className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-xs border border-transparent hover:border-gray-200"
                                        >
                                            Disable Mic
                                        </button>
                                        <button
                                            onClick={() => {
                                                localStorage.setItem('pianopilot_mic_enabled', 'true');
                                                setShowMicPopup(false);
                                            }}
                                            className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition text-xs"
                                        >
                                            Confirm & Start
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Music Display Container */}
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden" style={{ backgroundColor: isDarkMode ? '' : 'white' }}>
                    <MusicDisplay
                        gameMode={gameMode}
                        trebleNotes={paddedLevelData.treble}
                        bassNotes={paddedLevelData.bass}
                        width={windowWidth < 800 ? windowWidth - 48 : 800}
                        cursorIndex={cursorIndex}
                        trebleCursorIndex={trebleCursorIndex}
                        bassCursorIndex={bassCursorIndex}
                        isTrebleOnset={isTrebleOnset}
                        isBassOnset={isBassOnset}
                        inputStatus={inputStatus}
                        onLayout={setNotePositions}
                        isDarkMode={isDarkMode}
                        showLabels={showNoteLabels}
                        handPosition={gameLogic.currentLesson?.handPosition}
                        showFingering={preferences.showFingering}
                    />
                    {/* Rhythm Playhead */}
                    {isRhythmMode && (
                        <div
                            id="rhythm-playhead"
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10 pointer-events-none"
                            style={{ left: '20px' }}
                        />
                    )}
                </div>

                {/* Feedback Popups */}
                {streak >= 5 && (
                    <div className="absolute top-[-40px] right-0 animate-bounce text-yellow-500 font-bold text-xl drop-shadow-md">
                        🔥 {streak} Streak!
                    </div>
                )}
                {lastHitType === 'perfect' && (
                    <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 animate-pop text-4xl text-yellow-400 font-black drop-shadow-lg z-50 pointer-events-none">
                        PERFECT!
                    </div>
                )}
                {lastHitType === 'good' && (
                    <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 animate-pop text-3xl text-green-400 font-bold drop-shadow-md z-50 pointer-events-none">
                        GOOD
                    </div>
                )}
                {lastHitType === 'okay' && (
                    <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 animate-fade-up text-2xl text-blue-400 font-bold drop-shadow-md z-50 pointer-events-none">
                        OKAY
                    </div>
                )}
            </div>

            {/* Control Panel */}
            <ControlPanel
                gameMode={gameMode}
                setGameMode={setGameMode}
                difficulty={difficulty}
                onDifficultyChange={generateNewLevel}
                isRhythmMode={isRhythmMode}
                onToggleRhythmMode={handleStartRhythm}
                isDemoPlaying={isDemoPlaying}
                onToggleDemo={startDemo}
                onResetLesson={resetLesson}
                countDown={countDown}
                audioStarted={audioStarted}
                onTestAudio={testAudio}
                showNoteLabels={showNoteLabels}
                setShowNoteLabels={setShowNoteLabels}
                showStaff={showStaff}
                setShowStaff={setShowStaff}
                currentLesson={gameLogic.currentLesson}
                showKeyboard={preferences.showKeyboard}
                onToggleKeyboard={(show) => updatePreference('showKeyboard', show)}
            />

            {/* Performance Report Card Modal */}
            <PerformanceReportCard
                isOpen={gameLogic.isLessonComplete}
                onClose={() => {
                    gameLogic.setIsLessonComplete(false);
                    if (onExitLesson) {
                        onExitLesson();
                    }
                }}
                onRetry={() => {
                    gameLogic.setIsLessonComplete(false);
                    gameLogic.generateNewLevel(difficulty, false, gameLogic.currentLesson);
                }}
                onNext={onNextLesson}
                songTitle={gameLogic.currentLesson?.name || 'Exercise'}
                notesCorrect={gameLogic.notesCorrect}
                notesMissed={gameLogic.notesMissed}
                errorMeasures={{}}
                totalMeasures={0}
                isDarkMode={isDarkMode}
                passed={gameLogic.lessonPassed}
                requiredAccuracy={gameLogic.requiredAccuracy}
                isCapstone={gameLogic.isCapstone}
                userActiveNotes={effectiveActiveNotes}
            />

            {/* Sticky Bottom Keyboard Overlay */}
            {preferences.showKeyboard && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 dark:bg-gray-950 p-2 border-t border-gray-700 dark:border-gray-800 shadow-[0_-8px_30px_rgb(0,0,0,0.4)] transition-all duration-500 group">
                    <div className="max-w-7xl mx-auto flex flex-col items-center relative">
                        {/* Close button - visible on hover or tap */}
                        <button
                            onClick={() => updatePreference('showKeyboard', false)}
                            title="Hide Keyboard"
                            className="absolute top-1 right-2 p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-50 shadow-md flex items-center justify-center w-7 h-7"
                        >
                            ✕
                        </button>
                        <VirtualKeyboard
                            activeNotes={new Set()}
                            userActiveNotes={effectiveActiveNotes}
                            expectedNotes={expectedNotes}
                            showLabels={showNoteLabels}
                            showStaff={showStaff}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
