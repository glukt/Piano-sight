import { useEffect, useState } from 'react';
import { useMidi } from './hooks/useMidi';
import { audio } from './audio/Synth';
import { MusicDisplay, StaveNoteData } from './components/MusicDisplay';
import { WatermarkLayer } from './components/WatermarkLayer';
import { LevelGenerator, Difficulty } from './engine/LevelGenerator';

function App() {
    const { inputs, lastNote, error, isEnabled } = useMidi();
    const [audioStarted, setAudioStarted] = useState(false);
    const [history, setHistory] = useState<number[]>([]);
    const [showWatermark, setShowWatermark] = useState(true);

    // Level State
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NOVICE);
    const [levelData, setLevelData] = useState<{ treble: StaveNoteData[], bass: StaveNoteData[] }>(
        LevelGenerator.generate(Difficulty.NOVICE)
    );

    const generateNewLevel = (diff: Difficulty) => {
        setDifficulty(diff);
        setLevelData(LevelGenerator.generate(diff));
    };

    const startAudio = async () => {
        await audio.init();
        setAudioStarted(true);
    };

    useEffect(() => {
        if (lastNote && audioStarted) {
            audio.playNote(lastNote.note, lastNote.velocity);
            setHistory(prev => [...prev.slice(-4), lastNote.note]);

            // Release after a short duration if no NoteOff handled yet
            // In real app, we handle NoteOff events properly
            setTimeout(() => audio.releaseNote(lastNote.note), 500);
        }
    }, [lastNote, audioStarted]);



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 text-neutral-900 p-8 space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Piano Sight</h1>
                <p className="text-neutral-500">MIDI Sight-Reading Trainer</p>
            </header>

            {/* Main Display Area */}
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center space-y-6 overflow-hidden">

                {/* Watermark Overlay */}
                <WatermarkLayer visible={showWatermark} overlayText="C Major" />

                <MusicDisplay
                    width={600}
                    height={300}
                    trebleNotes={levelData.treble}
                    bassNotes={levelData.bass}
                />

                {/* Feedback / HUD */}
                <div className="flex w-full justify-between items-center text-sm font-mono border-t pt-4">
                    <div>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        MIDI: {isEnabled ? `${inputs.length} Device(s)` : 'Not Connected'}
                    </div>
                    <div>
                        Last Note: <span className="font-bold text-lg">{lastNote?.note || '--'}</span>
                    </div>
                    <div>
                        Audio: {audioStarted ? 'Active' : 'Standby'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                {!audioStarted && (
                    <button
                        onClick={startAudio}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
                    >
                        Start Audio Engine
                    </button>
                )}

                {/* Test Controls */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 justify-center">
                        <button onClick={() => setShowWatermark(!showWatermark)} className="px-4 py-2 border rounded hover:bg-gray-50 text-xs">
                            {showWatermark ? 'Hide' : 'Show'} Overlay
                        </button>
                        <button onClick={() => generateNewLevel(difficulty)} className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 text-xs">
                            New Music
                        </button>
                    </div>

                    <div className="flex gap-2 justify-center text-xs">
                        {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((k) => (
                            <button
                                key={k}
                                onClick={() => generateNewLevel(Difficulty[k])}
                                className={`px-3 py-1 border rounded ${difficulty === Difficulty[k] ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <div className="text-xs text-gray-400">
                History: {history.join(', ')}
            </div>
        </div>
    );
}

export default App;
