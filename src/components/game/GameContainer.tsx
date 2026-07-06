import React from 'react';
import { MusicDisplay } from '../MusicDisplay';
import VirtualKeyboard from '../VirtualKeyboard';
import { ControlPanel } from './ControlPanel';
import { PerformanceReportCard } from '../PerformanceReportCard';

// Import Types
import { useGameLogic } from '../../hooks/useGameLogic';
import { usePreferences } from '../../hooks/usePreferences';

interface ChordSpelling {
    name: string;
    notes: string[];
    fingers: string;
}

const recognizeChord = (keys: string[]): ChordSpelling | null => {
    if (keys.length < 3) return null;
    
    // Normalize keys to base note names (without octaves and deduplicated)
    const notes = Array.from(new Set(keys.map(k => k.split('/')[0].toUpperCase())));
    notes.sort();

    // Common chord combinations (sorted alphabetically)
    const chordMap: Record<string, ChordSpelling> = {
        // Triads
        "C,E,G": { name: "C Major", notes: ["C", "E", "G"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "D,F#,A": { name: "D Major", notes: ["D", "F#", "A"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "D,F,A": { name: "D minor (Dm)", notes: ["D", "F", "A"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "E,G#,B": { name: "E Major", notes: ["E", "G#", "B"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "E,G,B": { name: "E minor (Em)", notes: ["E", "G", "B"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "F,G,A,C": { name: "F Major", notes: ["F", "A", "C"], fingers: "RH: 1-2-4-5 | LH: 5-4-2-1" },
        "A,C,F": { name: "F Major", notes: ["F", "A", "C"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "C,F,A": { name: "F Major", notes: ["F", "A", "C"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "G,B,D": { name: "G Major", notes: ["G", "B", "D"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "A,C#,E": { name: "A Major", notes: ["A", "C#", "E"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        "A,C,E": { name: "A minor (Am)", notes: ["A", "C", "E"], fingers: "RH: 1-3-5 | LH: 5-3-1" },
        // Seventh Chords
        "B,D,F,G": { name: "G7 (Dominant 7th)", notes: ["G", "B", "D", "F"], fingers: "RH: 1-2-4-5 | LH: 5-4-2-1" },
        "C,E,G,B": { name: "Cmaj7 (Major 7th)", notes: ["C", "E", "G", "B"], fingers: "RH: 1-2-3-5 | LH: 5-3-2-1" },
        "A,C,E,G": { name: "Am7 (Minor 7th)", notes: ["A", "C", "E", "G"], fingers: "RH: 1-2-3-5 | LH: 5-3-2-1" },
        "D,F,A,C": { name: "Dm7 (Minor 7th)", notes: ["D", "F", "A", "C"], fingers: "RH: 1-2-3-5 | LH: 5-3-2-1" }
    };

    // Try perfect match
    const keyString = notes.join(',');
    if (chordMap[keyString]) return chordMap[keyString];

    // Try checking circular permutations (inversions)
    const isTriad = (n1: string, n2: string, n3: string, targetSpelling: ChordSpelling) => {
        const set = new Set([n1, n2, n3]);
        return targetSpelling.notes.every(n => set.has(n));
    };

    for (const key of Object.keys(chordMap)) {
        const spelling = chordMap[key];
        if (spelling.notes.length === 3 && notes.length === 3) {
            if (isTriad(notes[0], notes[1], notes[2], spelling)) {
                return spelling;
            }
        }
    }

    return null;
};

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
        isRhythmMode, isRhythmPlaying, currentBeat, beatsPerMeasure, countDown, streak, lastHitType,
        setNotePositions,
        showNoteLabels, setShowNoteLabels,
        showStaff, setShowStaff,
        showMicPopup, setShowMicPopup,
        score, difficulty, paddedLevelData, alignedSteps,

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

    const activeChord = React.useMemo(() => {
        const step = alignedSteps[cursorIndex];
        if (!step) return null;
        const allKeys = [...step.trebleKeys, ...step.bassKeys];
        return recognizeChord(allKeys);
    }, [alignedSteps, cursorIndex]);

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
                    {gameLogic.isMicListening && (
                        <div 
                            onClick={() => gameLogic.setShowMicPopup(true)}
                            className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-sm border border-gray-700/50 text-white text-[10px] font-bold shadow-lg hover:bg-gray-900 dark:hover:bg-gray-950 cursor-pointer transition active:scale-95 z-40 animate-in fade-in slide-in-from-top-2"
                            title="Microphone Tuner (Click to Calibrate)"
                        >
                            <span className="animate-pulse text-indigo-400">🎙️</span>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-gray-300">Level:</span>
                                    <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-75"
                                            style={{ width: `${Math.min(100, Math.round((gameLogic.micVolume / gameLogic.micSensitivity) * 50))}%` }}
                                        />
                                    </div>
                                </div>
                                {gameLogic.micNoteName && gameLogic.micNoteName !== 'None' ? (
                                    <div className="text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                                        🎯 {gameLogic.micNoteName} <span className="opacity-60 font-medium">({gameLogic.micFrequency} Hz)</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 font-medium mt-0.5">Listening...</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Visual Metronome */}
                    {isRhythmMode && isRhythmPlaying && (
                        <div className="flex items-center justify-center gap-3 py-2 bg-slate-900/60 backdrop-blur rounded-lg border border-slate-800/80 mb-3 px-4 shadow-inner max-w-sm mx-auto">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
                                Beat { (currentBeat % beatsPerMeasure) + 1 }
                            </div>
                            <div className="flex gap-2.5">
                                {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
                                    const isActive = (currentBeat % beatsPerMeasure) === idx;
                                    const isFirst = idx === 0;
                                    return (
                                        <div
                                            key={idx}
                                            className={`w-4 h-4 rounded-full transition-all duration-75 shadow-sm ${
                                                isActive
                                                    ? isFirst
                                                        ? 'bg-rose-500 scale-125 shadow-[0_0_12px_#f43f5e]'
                                                        : 'bg-emerald-400 scale-125 shadow-[0_0_12px_#34d399]'
                                                    : 'bg-slate-800 border border-slate-700/50'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                            {/* Pendulum Swing animation */}
                            <div className="relative w-8 h-4 overflow-hidden flex items-center justify-center border-l border-slate-800/80 pl-3">
                                <div 
                                    className="w-1.5 h-4 bg-indigo-400 rounded-full transition-transform duration-300 origin-bottom"
                                    style={{
                                        transform: `rotate(${(currentBeat % 2 === 0) ? '-30deg' : '30deg'})`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Visual Sustain Pedal Guide */}
                    {isRhythmMode && isRhythmPlaying && (
                        <div className="flex items-center justify-between gap-4 py-2 px-4 bg-slate-900/60 backdrop-blur rounded-lg border border-slate-800/80 mb-3 max-w-sm mx-auto shadow-md">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sustain Pedal Guide</span>
                                <span className="text-xs font-semibold text-slate-300 font-mono mt-0.5">
                                    { (currentBeat % beatsPerMeasure) === 0 ? (
                                        <span className="text-amber-400 font-extrabold animate-pulse">LIFT & PRESS 🔀</span>
                                    ) : (
                                        <span className="text-indigo-400 font-extrabold">HOLD SUSTAIN ⬇️</span>
                                    ) }
                                </span>
                            </div>
                            <div className="relative w-12 h-12 flex items-center justify-center bg-slate-950 rounded border border-slate-800">
                                {/* The metal foot pedal visual */}
                                <div 
                                    className={`w-3 h-8 bg-gradient-to-b from-slate-350 to-slate-500 rounded-b shadow transition-all duration-150 origin-top ${
                                        (currentBeat % beatsPerMeasure) === 0 
                                            ? 'transform -rotate-12 translate-y-[-2px] brightness-125' 
                                            : 'transform rotate-0 translate-y-0.5 brightness-90 shadow-[0_0_8px_rgba(99,102,241,0.5)] border-t border-indigo-400'
                                    }`}
                                    style={{
                                        boxShadow: (currentBeat % beatsPerMeasure) === 0 
                                            ? 'none' 
                                            : '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(99,102,241,0.5)'
                                    }}
                                />
                            </div>
                        </div>
                    )}

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
                        keySignature={gameLogic.currentLesson?.constraints?.keySignature}
                        timeSignature={gameLogic.currentLesson?.constraints?.timeSignature}
                        showFingering={preferences.showFingering}
                        noteLabelType={preferences.noteLabelType}
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
            {(() => {
                const timeSig = gameLogic.currentLesson?.constraints?.timeSignature || "4/4";
                const parts = timeSig.split('/');
                const num = parseInt(parts[0]) || 4;
                const den = parseInt(parts[1]) || 4;
                const beatsPerMeasure = num * (4 / den);
                const lastStep = gameLogic.alignedSteps[gameLogic.alignedSteps.length - 1];
                const totalMeasures = lastStep ? Math.max(1, Math.ceil((lastStep.time + lastStep.duration) / beatsPerMeasure)) : 4;

                return (
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
                        onLoopPractice={(weakMeasures) => {
                            gameLogic.startLoopPractice(weakMeasures);
                        }}
                        onNext={onNextLesson}
                        songTitle={gameLogic.currentLesson?.name || 'Exercise'}
                        notesCorrect={gameLogic.notesCorrect}
                        notesMissed={gameLogic.notesMissed}
                        errorMeasures={gameLogic.errorMeasures}
                        totalMeasures={totalMeasures}
                        isDarkMode={isDarkMode}
                        passed={gameLogic.lessonPassed}
                        requiredAccuracy={gameLogic.requiredAccuracy}
                        isCapstone={gameLogic.isCapstone}
                        tempoMultiplier={gameLogic.tempoMultiplier}
                        onTempoChange={gameLogic.setTempoMultiplier}
                    />
                );
            })()}

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
                        {activeChord && (
                            <div className="w-full max-w-lg mb-2 p-2 px-3 rounded-lg border flex flex-row items-center justify-between gap-3 bg-gray-800 dark:bg-gray-850 border-gray-700/50 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">🎼</span>
                                    <div className="text-left">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Active Chord Structure</div>
                                        <div className="text-xs font-black text-indigo-400">
                                            {activeChord.name} <span className="text-[10px] font-medium text-gray-400">({activeChord.notes.join(" - ")})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-[10px]">
                                    <span className="font-semibold text-gray-400">Recommended Fingers</span>
                                    <span className="font-black text-indigo-400 font-mono mt-0.5 block">{activeChord.fingers}</span>
                                </div>
                            </div>
                        )}
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
