import { useEffect, useState } from 'react';
import { useMidi } from './hooks/useMidi';
import { audio } from './audio/Synth';
import { MusicDisplay } from './components/MusicDisplay';

function App() {
    const { inputs, lastNote, error, isEnabled } = useMidi();
    const [audioStarted, setAudioStarted] = useState(false);
    const [history, setHistory] = useState<number[]>([]);

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

    // Manual Trigger for testing without MIDI
    const manualTrigger = (note: number) => {
        audio.playNote(note);
        setHistory(prev => [...prev.slice(-4), note]);
        setTimeout(() => audio.releaseNote(note), 500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 text-neutral-900 p-8 space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Piano Sight</h1>
                <p className="text-neutral-500">MIDI Sight-Reading Trainer</p>
            </header>

            {/* Main Display Area */}
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center space-y-6">
                <MusicDisplay
                    width={600}
                    height={200}
                    notes={[
                        { keys: ["c/4"], duration: "q" },
                        { keys: ["d/4"], duration: "q" },
                        { keys: ["e/4"], duration: "q" },
                        { keys: ["f/4"], duration: "q" }
                    ]}
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
                <div className="flex gap-2">
                    <button onClick={() => manualTrigger(60)} className="px-4 py-2 border rounded hover:bg-gray-50">C4</button>
                    <button onClick={() => manualTrigger(62)} className="px-4 py-2 border rounded hover:bg-gray-50">D4</button>
                    <button onClick={() => manualTrigger(64)} className="px-4 py-2 border rounded hover:bg-gray-50">E4</button>
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
