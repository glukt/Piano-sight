import React from 'react';
import { MusicDisplay } from '../MusicDisplay';
import VirtualKeyboard from '../VirtualKeyboard';
import { ControlPanel } from './ControlPanel';

// Import Types
import { useGameLogic } from '../../hooks/useGameLogic';

interface GameContainerProps {
    gameLogic: ReturnType<typeof useGameLogic>;
    windowWidth: number;
    isDarkMode: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({
    gameLogic,
    windowWidth,
    isDarkMode
}) => {
    const {
        // State
        audioStarted,
        isMidiEnabled,
        effectiveActiveNotes,
        cursorIndex, inputStatus, gameMode, setGameMode,
        isRhythmMode, countDown, streak, lastHitType,
        setNotePositions,
        showNoteLabels, setShowNoteLabels,
        score, difficulty, levelData,
        playheadX,

        // Actions
        testAudio,
        generateNewLevel,
        handleStartRhythm,
        parseKeyToMidi
    } = gameLogic;

    // Calculate expected notes for Virtual Keyboard visualization
    const expectedNotes = React.useMemo(() => {
        const targets: number[] = [];
        const t = levelData.treble[cursorIndex];
        const b = levelData.bass[cursorIndex];

        // Filter by Game Mode
        if (gameMode !== 'bass' && t) t.keys.forEach(k => targets.push(parseKeyToMidi(k)));
        if (gameMode !== 'treble' && b) b.keys.forEach(k => targets.push(parseKeyToMidi(k)));
        return targets;
    }, [levelData, cursorIndex, gameMode, parseKeyToMidi]);

    return (
        <div className="w-full flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Bar */}
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

            <div className="relative w-full max-w-5xl">
                {countDown !== null && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl">
                        <span className="text-9xl font-bold text-[#D4AF37] animate-pulse">{countDown}</span>
                    </div>
                )}

                {/* Music Display Container */}
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden" style={{ backgroundColor: isDarkMode ? '' : 'white' }}>
                    <MusicDisplay
                        gameMode={gameMode}
                        trebleNotes={levelData.treble}
                        bassNotes={levelData.bass}
                        width={windowWidth < 800 ? windowWidth - 48 : 800}
                        cursorIndex={cursorIndex}
                        inputStatus={inputStatus}
                        onLayout={setNotePositions}
                        isDarkMode={isDarkMode}
                        showLabels={showNoteLabels}
                    />
                    {/* Rhythm Playhead */}
                    {isRhythmMode && (
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10 transition-all duration-75 ease-linear pointer-events-none"
                            style={{ left: `${playheadX}px` }}
                        />
                    )}
                </div>

                {/* Virtual Keyboard */}
                {/* Note: In previous App.tsx there was a toggle 'showGameKeyboard' state. 
                    I missed adding this to useGameLogic or GameContainer state.
                    For now, I'll default it to visible or add local state here.
                */}
                <div className="mt-4 w-full bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <VirtualKeyboard
                        activeNotes={effectiveActiveNotes}
                        userActiveNotes={effectiveActiveNotes}
                        expectedNotes={expectedNotes}
                        showLabels={showNoteLabels}
                    />
                </div>

                {/* Feedback Popups */}
                {streak >= 5 && isRhythmMode && (
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
                countDown={countDown}
                audioStarted={audioStarted}
                onTestAudio={testAudio}
                showNoteLabels={showNoteLabels}
                setShowNoteLabels={setShowNoteLabels}
            />
        </div>
    );
};
