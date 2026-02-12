import { useEffect, useState, useRef } from 'react';
import { useMidi } from './hooks/useMidi';
import { audio } from './audio/Synth';
import { MusicDisplay, StaveNoteData } from './components/MusicDisplay';
import { LevelGenerator, Difficulty } from './engine/LevelGenerator';
import { midiToNoteName } from './utils/midiUtils';
import { useRhythmEngine } from './hooks/useRhythmEngine';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ScoreDisplay } from './components/ScoreDisplay';
import { MusicLibrary } from './components/MusicLibrary';

function App() {
    // Audio Event Handlers (Direct Callbacks for Low Latency)
    const onNoteOn = useRef((note: number, velocity: number) => {
        if (audio.isInitialized) audio.playNote(note, velocity);
    });

    const onNoteOff = useRef((note: number) => {
        if (audio.isInitialized) audio.releaseNote(note);
    });

    // useMidi Hook with Callbacks
    const { activeNotes, error, isEnabled } = useMidi({
        onNoteOn: (n, v) => onNoteOn.current(n, v),
        onNoteOff: (n) => onNoteOff.current(n)
    });

    const [audioStarted, setAudioStarted] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [showNoteLabels, setShowNoteLabels] = useState(false);

    // Game State
    const [cursorIndex, setCursorIndex] = useState(0);
    const [inputStatus, setInputStatus] = useState<'waiting' | 'correct' | 'incorrect' | 'perfect'>('waiting');
    const [waitingForRelease, setWaitingForRelease] = useState(false);
    const [gameMode, setGameMode] = useState<'both' | 'treble' | 'bass'>('both');
    const [isRhythmMode, setIsRhythmMode] = useState(false);
    const [countDown, setCountDown] = useState<number | null>(null);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [lastHitType, setLastHitType] = useState<'perfect' | 'good' | 'okay' | null>(null);
    const [preHeld, setPreHeld] = useState(false); // To prevent auto-triggering held notes
    const [notePositions, setNotePositions] = useState<number[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode
    const [currentView, setCurrentView] = useState<'game' | 'xml'>('game');
    const [xmlData, setXmlData] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    // Scoring & Stats
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [errorStats, setErrorStats] = useState<Record<string, number>>({});
    const [hitStats, setHitStats] = useState<Record<string, number>>({});

    // Level State
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NOVICE);
    const [levelData, setLevelData] = useState<{ treble: StaveNoteData[], bass: StaveNoteData[] }>(
        LevelGenerator.generate(Difficulty.NOVICE, errorStats)
    );

    // Rhythm Engine (Depends on levelData)
    const BPM = 60;
    const RHYTHM_LEAD_IN = 2; // 2 Seconds of visual lead-in
    const { isPlaying: isRhythmPlaying, playheadX, elapsedTime, start: startRhythm, stop: stopRhythm } = useRhythmEngine(BPM, Math.ceil(levelData.treble.length / 4));

    const generateNewLevel = (diff: Difficulty, keepRhythm = false) => {
        setDifficulty(diff);
        setLevelData(LevelGenerator.generate(diff, errorStats));
        setCursorIndex(0); // Reset cursor
        setStreak(0);
        setInputStatus('waiting');
        setWaitingForRelease(false);
        if (keepRhythm) {
            startRhythm(RHYTHM_LEAD_IN); // Restart with lead-in
        } else {
            stopRhythm();
        }
    };

    const startAudio = async () => {
        setIsAudioLoading(true);
        try {
            await audio.init();
            setAudioStarted(true);
        } catch (e) {
            console.error("Audio failed to start", e);
            alert("Failed to load piano samples. Check console.");
        } finally {
            setIsAudioLoading(false);
        }
    };

    const testAudio = () => {
        if (!audioStarted) return;
        audio.playNote(60, 100); // Play C4
        setTimeout(() => audio.releaseNote(60), 500);
    };

    const handleStartRhythm = () => {
        if (isRhythmPlaying || isRhythmMode) {
            stopRhythm();
            setIsRhythmMode(false);
            setCursorIndex(0); // Reset position
            setInputStatus('waiting');
            setStreak(0);
            return;
        }

        // Auto-enable visual mode if starting rhythm
        if (!isRhythmMode) setIsRhythmMode(true);

        let count = 3;
        setCountDown(count);

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                setCountDown(count);
            } else {
                clearInterval(interval);
                setCountDown(null);
                startRhythm(RHYTHM_LEAD_IN);
            }
        }, 1000);
    };

    const handleScoreSelect = (file: File) => {
        setFileName(file.name);
        setUploadedFile(file);
        setXmlData(null);
    };

    const handleClearScore = () => {
        setXmlData(null);
        setUploadedFile(null);
        setFileName(null);
    };

    // Note to MIDI Number Map (Simple C4=60)
    // Vexflow keys are like "c/4"
    const parseKeyToMidi = (key: string): number => {
        const [note, octave] = key.split('/');
        const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
        return noteMap[note.toLowerCase()] + (parseInt(octave) + 1) * 12;
    };

    // Calculate Playhead X position in PIXELS based on time and note positions
    const getPlayheadPixelX = (): number => {
        if (notePositions.length === 0) return 20; // Default start

        // Case 1: Lead-in (Negative Time)
        // Interpolate linearly into the first note
        if (elapsedTime < 0) {
            const firstNoteX = notePositions[0];
            const startX = 20; // Stave start offset
            // Map -LEAD_IN -> 0 seconds to startX -> firstNoteX
            const progress = (elapsedTime + RHYTHM_LEAD_IN) / RHYTHM_LEAD_IN; // 0 to 1
            return startX + (firstNoteX - startX) * progress;
        }

        // Case 2: During Notes
        const noteDuration = 60 / BPM;

        // Find current note segment
        const currentIndex = Math.floor(elapsedTime / noteDuration);
        const segmentProgress = (elapsedTime % noteDuration) / noteDuration;

        const currentX = notePositions[currentIndex];
        const nextX = notePositions[currentIndex + 1];

        if (currentX !== undefined && nextX !== undefined) {
            // Interpolate between current and next note
            return currentX + (nextX - currentX) * segmentProgress;
        } else if (currentX !== undefined) {
            // Past last note? Extrapolate with previous width
            const prevX = notePositions[currentIndex - 1] || 20;
            const width = currentX - prevX;
            return currentX + width * segmentProgress;
        }

        return 20; // Fallback
    };

    // Note: Audio Playing is now handled by useMidi callbacks!

    // Effect: Prevent Holding Notes (Strict Attack)
    useEffect(() => {
        // When cursor moves to new note, check if we are ALREADY holding the required notes
        const targetTreble = levelData.treble[cursorIndex];
        const targetBass = levelData.bass[cursorIndex];
        const requiredNotes = new Set<number>();

        if (gameMode !== 'bass') targetTreble?.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        if (gameMode !== 'treble') targetBass?.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));

        // If any required note is currently active (held), flag it as PreHeld
        const isHolding = Array.from(requiredNotes).some(n => activeNotes.has(n));
        setPreHeld(isHolding);

    }, [cursorIndex, levelData, gameMode, activeNotes]); // Check whenever these change. Note: activeNotes dependency ensures we clear it when released!

    // Validation Effect
    useEffect(() => {
        if (!audioStarted) return;

        if (cursorIndex >= levelData.treble.length) {
            // Level Complete!
            setTimeout(() => generateNewLevel(difficulty, isRhythmMode), 500); // Continuous play in Rhythm Mode
            return;
        }

        const noteDuration = 60 / BPM;
        const targetTime = cursorIndex * noteDuration;
        const timeWindow = 0.35; // 350ms window (more forgiving)

        // RHYTHM MODE: Miss Detection (Time passed)
        // RHYTHM MODE: Miss Detection (Time passed)
        if (isRhythmMode && isRhythmPlaying) {
            // Pass condition: Time window expired (0.35s late)
            if (elapsedTime > targetTime + timeWindow) {
                // Must move on!
                setCursorIndex(prev => prev + 1);
                setInputStatus('waiting');
                setStreak(0);

                if (inputStatus !== 'incorrect') {
                    setInputStatus('incorrect');
                    setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                }
                return;
            }
        }

        const targetTreble = levelData.treble[cursorIndex];
        const targetBass = levelData.bass[cursorIndex];

        // Gather Target MIDI Numbers based on Game Mode
        const requiredNotes = new Set<number>();

        if (gameMode === 'both' || gameMode === 'treble') {
            targetTreble.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }
        if (gameMode === 'both' || gameMode === 'bass') {
            targetBass.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        }

        // Filter Played Notes based on Game Mode (Treble >= 60, Bass < 60)
        // Actually, simpler: Just check if 'requiredNotes' are present in 'activeNotes'.
        // BUT, we want to allow user to play anything? Or restrict?
        // If mode is Treble Only, and user plays Bass C3, should it fail?
        // Probably ignore it.

        // Define "Relevant" active notes
        const relevantActiveNotes = new Set<number>();
        activeNotes.forEach(n => {
            if (gameMode === 'both') relevantActiveNotes.add(n);
            else if (gameMode === 'treble' && n >= 60) relevantActiveNotes.add(n);
            else if (gameMode === 'bass' && n < 60) relevantActiveNotes.add(n);
        });

        // ----------------------------------------------------
        // Logic: Waiting for Release
        // ----------------------------------------------------
        if (waitingForRelease) {
            // Wait until ALL relevant notes are released
            if (relevantActiveNotes.size === 0) {
                setCursorIndex(prev => prev + 1);
                setInputStatus('waiting');
                setWaitingForRelease(false);
            }
            return;
        }

        // ----------------------------------------------------
        // Logic: Note Validation
        // ----------------------------------------------------

        if (requiredNotes.size === 0) {
            // Edge case: Rest? Auto advance.
            setCursorIndex(prev => prev + 1);
            return;
        }

        // Check if all needed notes are present
        const relevantArray = Array.from(relevantActiveNotes);
        const allFound = Array.from(requiredNotes).every(n => activeNotes.has(n));
        const hasIncorrect = relevantArray.some(n => !requiredNotes.has(n));

        // STRICT ATTACK CHECK: If pre-held, wait until release
        if (preHeld) {
            // Only clear PreHeld when the offending notes are released
            const stillHolding = Array.from(requiredNotes).some(n => activeNotes.has(n));
            if (!stillHolding) {
                // Released! Now we can accept input
                setPreHeld(false);
            }
            // Block validation while holding
            return;
        }

        // 1. Check for Incorrect Notes (in relevant range)
        // 1. Check for Incorrect Notes (in relevant range)
        if (hasIncorrect) {
            if (inputStatus !== 'incorrect') {
                setInputStatus('incorrect');
                setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
                setStreak(0);

                // Track Error Stats
                relevantArray.filter(n => !requiredNotes.has(n)).forEach(n => {
                    const name = midiToNoteName(n);
                    setErrorStats(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                });
            }
            return;
        }

        // 2. Check for All Correct Notes
        // allFound is already calculated above using activeNotes

        if (allFound) {
            // RHYTHM CHECK: Only allow if within time window
            if (isRhythmMode && isRhythmPlaying) {
                const diff = Math.abs(elapsedTime - targetTime);

                // Graded Scoring:
                // Perfect: < 0.1s
                // Good: < 0.25s
                // Okay: < 0.35s

                if (diff > timeWindow) {
                    // Too late/early (handled by auto-miss or just ignore if early)
                    return;
                }

                // We have a hit! determine grade
                if (diff <= 0.1) {
                    setLastHitType('perfect');
                    setScore(s => ({ ...s, correct: s.correct + 5 })); // Bonus points
                    setInputStatus('perfect');
                    setStreak(prev => prev + 1);
                } else if (diff <= 0.25) {
                    setLastHitType('good');
                    setScore(s => ({ ...s, correct: s.correct + 2 }));
                    setInputStatus('correct'); // Use Green for Good
                    setStreak(prev => prev + 1);
                } else {
                    setLastHitType('okay');
                    setScore(s => ({ ...s, correct: s.correct + 1 }));
                    setInputStatus('correct'); // Use Green for Okay
                    setStreak(prev => prev + 1);
                }

                // Track Hit Stats
                relevantArray.filter(n => requiredNotes.has(n)).forEach(n => {
                    const name = midiToNoteName(n);
                    setHitStats(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
                });

                if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
                setCursorIndex(prev => prev + 1);
                setWaitingForRelease(true);
                return;
            }

            // Normal Mode (Wait Mode) validation
            setScore(s => ({ ...s, correct: s.correct + 1 }));
            if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
            setStreak(prev => prev + 1);

            // Track Hit Stats
            relevantArray.filter(n => requiredNotes.has(n)).forEach(n => {
                const name = midiToNoteName(n);
                setHitStats(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
            });

            setCursorIndex(prev => prev + 1);
            setWaitingForRelease(true);

            // Visual Feedback
            setLastHitType('good');
            setInputStatus('correct');
        } else {
            if (inputStatus !== 'waiting') setInputStatus('waiting');
        }

    }, [activeNotes, cursorIndex, levelData, audioStarted, difficulty, waitingForRelease, gameMode, isRhythmMode, isRhythmPlaying, elapsedTime, inputStatus, preHeld, streak, maxStreak, score]);



    return (
        <div className={`min-h-screen flex flex-col items-center p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100/50 text-gray-900'}`}>
            <header className="mb-8 text-center relative w-full max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Piano Sight Reading</h1>

                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`absolute right-0 top-0 px-4 py-2 rounded-full border ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'} hover:scale-105 transition`}
                >
                    {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                </button>

                <div className="flex justify-center gap-4 text-lg items-center">
                    <span className={`text-xs uppercase tracking-wider ${isEnabled ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isEnabled ? '🎹 MIDI Active' : '🔌 No MIDI'}
                    </span>
                    <span className="w-px h-4 bg-gray-400/30"></span>
                    <span>Score: <span className="text-green-500">{score.correct}</span> / <span className="text-red-500">{score.incorrect}</span></span>
                    {isRhythmMode && (
                        <span className={`font-bold ${playheadX > 100 ? 'text-gray-400' : ''}`}>
                            ⏱ {(levelData.treble.length * (60 / BPM) - elapsedTime).toFixed(1)}s
                        </span>
                    )}
                </div>

                <div className="absolute left-0 top-0 flex gap-2">
                    <button
                        onClick={() => setCurrentView('game')}
                        className={`px-4 py-2 rounded-full border ${currentView === 'game' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'} font-bold text-xs uppercase transition`}
                    >
                        Game Mode
                    </button>
                    <button
                        onClick={() => setCurrentView('xml')}
                        className={`px-4 py-2 rounded-full border ${currentView === 'xml' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-200 text-gray-700 border-gray-300'} font-bold text-xs uppercase transition`}
                    >
                        MusicXML (Beta)
                    </button>
                </div>
            </header>

            {currentView === 'xml' ? (
                <div className="w-full max-w-6xl flex flex-col gap-4">
                    {uploadedFile || xmlData ? (
                        <>
                            <div className="bg-white p-4 rounded shadow flex items-center justify-between mb-4">
                                <span className="font-bold text-gray-700">Current Score: {fileName || 'Loaded Score'}</span>
                                <button
                                    onClick={handleClearScore}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold text-sm"
                                >
                                    Back to Library
                                </button>
                            </div>
                            <ScoreDisplay file={uploadedFile || undefined} xmlContent={xmlData || undefined} isDarkMode={isDarkMode} />
                        </>
                    ) : (
                        <div className="w-full">
                            <MusicLibrary onSelectScore={handleScoreSelect} />
                        </div>
                    )}
                </div>
            ) : (
                <>

                    {/* Main Display Area */}
                    <div className="relative w-full max-w-5xl flex flex-col items-center space-y-8">

                        {/* Count Down Overlay */}
                        {countDown !== null && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                                <span className="text-9xl font-bold text-[#D4AF37] animate-pulse">{countDown}</span>
                            </div>
                        )}

                        {/* Piano Sheet Display */}
                        <div className="relative">
                            <MusicDisplay
                                trebleNotes={levelData.treble}
                                bassNotes={levelData.bass}
                                width={window.innerWidth < 800 ? window.innerWidth - 32 : 800}
                                cursorIndex={cursorIndex}
                                inputStatus={inputStatus}
                                onLayout={setNotePositions}
                                isDarkMode={isDarkMode}
                                showLabels={showNoteLabels}
                            />

                            {/* Rhythm Playhead Overlay */}
                            {isRhythmMode && (
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-75 ease-linear pointer-events-none"
                                    style={{
                                        left: `${getPlayheadPixelX()}px`,
                                        // Remove percentage based left
                                    }}
                                />
                            )}

                            {/* Feedback Popups */}
                            {streak >= 5 && isRhythmMode && (
                                <div className="absolute top-[-40px] right-0 animate-bounce text-yellow-500 font-bold text-xl drop-shadow-md">
                                    🔥 {streak} Streak!
                                </div>
                            )}
                            {lastHitType === 'perfect' && (
                                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 animate-pop text-4xl text-gold font-black drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] z-50 pointer-events-none">
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
                        {/* Streak Counter */}
                        <div className="absolute top-4 right-8 flex flex-col items-center z-10">
                            <div className="text-xs text-gray-400 uppercase tracking-widest">Streak</div>
                            <div key={streak} className={`text-4xl font-bold transition-all ${streak >= 5 ? 'text-[#D4AF37] animate-pop' : 'text-gray-600'}`}>
                                {streak}
                            </div>
                            {maxStreak > 0 && <div className="text-[10px] text-gray-300 mt-1">BEST: {maxStreak}</div>}
                        </div>

                    </div>

                    {/* Controls */}
                    <div className={`mt-8 flex gap-4 p-6 rounded-xl shadow-lg border transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex flex-col gap-2">
                            <label className={`font-semibold text-sm uppercase tracking-wide opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Difficulty</label>
                            <div className="flex gap-2">
                                {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map(k => (
                                    <button
                                        key={k}
                                        onClick={() => generateNewLevel(Difficulty[k])}
                                        className={`px-4 py-2 rounded-lg transition-all ${difficulty === Difficulty[k]
                                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                                            : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                                            }`}
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`w-px mx-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200 self-center h-auto'}`}></div>

                        <div className="flex flex-col gap-2">
                            <label className={`font-semibold text-sm uppercase tracking-wide opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Game Mode</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleStartRhythm}
                                    className={`px-6 py-2 rounded-lg font-bold transition-all ${isRhythmMode
                                        ? 'bg-red-500 text-white shadow-lg scale-105 animate-pulse'
                                        : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                                        }`}
                                >
                                    {isRhythmMode ? (countDown ? `Starting...` : 'STOP RHYTHM') : 'START RHYTHM'}
                                </button>
                            </div>
                        </div>

                        <div className={`w-px mx-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200 self-center h-auto'}`}></div>

                        {/* Hand Selector */}
                        <div className="flex flex-col gap-2">
                            <label className={`font-semibold text-sm uppercase tracking-wide opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hand</label>
                            <div className="flex gap-2">
                                {(['both', 'treble', 'bass'] as const).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setGameMode(m)}
                                        className={`px-4 py-2 rounded-lg uppercase text-xs font-bold transition-all ${gameMode === m
                                            ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-800 text-white')
                                            : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={`w-px mx-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200 self-center h-auto'}`}></div>

                        {/* System Controls */}
                        <div className="flex flex-col gap-2 justify-center">
                            {!audioStarted ? (
                                <button
                                    onClick={startAudio}
                                    disabled={isAudioLoading}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${isDarkMode
                                        ? 'bg-emerald-900 text-emerald-100 hover:bg-emerald-800 border border-emerald-700'
                                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                                        }`}
                                >
                                    {isAudioLoading ? 'Loading...' : 'Init Audio'}
                                </button>
                            ) : (
                                <button
                                    onClick={testAudio}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide opacity-70 hover:opacity-100 transition-all ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    Test Sound
                                </button>
                            )}
                            <button
                                onClick={() => setShowNoteLabels(!showNoteLabels)}
                                className={`text-[10px] uppercase tracking-wider underline decoration-dotted ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {showNoteLabels ? 'Hide Labels' : 'Show Labels'}
                            </button>
                        </div>
                    </div>



                    <StatisticsPanel
                        hitStats={hitStats}
                        errorStats={errorStats}
                        isDarkMode={isDarkMode}
                    />

                    {
                        error && (
                            <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm">
                                {error}
                            </div>
                        )
                    }


                </>
            )}

        </div >
    );
}

export default App;
