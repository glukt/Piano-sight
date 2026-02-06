import { useEffect, useState } from 'react';
import { useMidi } from './hooks/useMidi';
import { audio } from './audio/Synth';
import { MusicDisplay, StaveNoteData } from './components/MusicDisplay';
import { WatermarkLayer } from './components/WatermarkLayer';
import { LevelGenerator, Difficulty } from './engine/LevelGenerator';

function App() {
    const { inputs, lastNote, activeNotes, error, isEnabled } = useMidi();
    const [audioStarted, setAudioStarted] = useState(false);
    const [history, setHistory] = useState<number[]>([]);
    const [showWatermark, setShowWatermark] = useState(true);
    const [showNoteLabels, setShowNoteLabels] = useState(false);

    // Game State
    const [cursorIndex, setCursorIndex] = useState(0);

    // Level State
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NOVICE);
    const [levelData, setLevelData] = useState<{ treble: StaveNoteData[], bass: StaveNoteData[] }>(
        LevelGenerator.generate(Difficulty.NOVICE)
    );

    const generateNewLevel = (diff: Difficulty) => {
        setDifficulty(diff);
        setLevelData(LevelGenerator.generate(diff));
        setCursorIndex(0); // Reset cursor
    };

    const startAudio = async () => {
        await audio.init();
        setAudioStarted(true);
    };

    // Note to MIDI Number Map (Simple C4=60)
    // Vexflow keys are like "c/4"
    const parseKeyToMidi = (key: string): number => {
        const [note, octave] = key.split('/');
        const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
        return noteMap[note.toLowerCase()] + (parseInt(octave) + 1) * 12;
    };

    useEffect(() => {
        if (lastNote && audioStarted) {
            audio.playNote(lastNote.note, lastNote.velocity);
            setHistory(prev => [...prev.slice(-8), lastNote.note]);

            // Release after a short duration if no NoteOff handled yet
            setTimeout(() => audio.releaseNote(lastNote.note), 500);

            // -------------------------------------------------------------------
            // GAME LOOP / VALIDATION
            // -------------------------------------------------------------------
            // Check current index
            if (cursorIndex < levelData.treble.length) {
                const targetTreble = levelData.treble[cursorIndex];
                const targetBass = levelData.bass[cursorIndex];

                // Collect all required MIDI numbers for this step
                const requiredNotes = new Set<number>();
                targetTreble.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
                targetBass.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));

                // Check if ALL required notes are pressed
                // NOTE: 'activeNotes' updates in real-time. 'lastNote' triggers this effect.
                // We might need to check strict set equality or subset.
                // For forgiveness, let's check if new note is ONE of the required notes.
                // Re-think: Real piano loop requires holding all notes? Or just pressing them?
                // Let's go with: If you play a correct note that is part of the chord, good. 
                // BUT to advance, you must hit ALL notes. 

                // Simple version: For single notes (Novice/Inter), simple check.
                // For chords: We check activeNotes.

                const isComplete = Array.from(requiredNotes).every(n => activeNotes.has(n));

                // OR simpler trigger: Does this NEW note complete the chord?
                // Let's assume user holds keys.
                // We check if the set of active notes contains needed notes.
                // But activeNotes inside this effect might be slightly stale if batching? 
                // Actually activeNotes is in dependency, so this effect runs on update.

                // Wait, this effect runs on `lastNote` change.
                // We should run validation on `activeNotes` change as well? 
                // Let's add activeNotes to dependecy if we want real-time chord validation.
            }
        }
    }, [lastNote, audioStarted]);

    // Separate Validation Effect to handle Multi-note (Chord) inputs
    useEffect(() => {
        if (!audioStarted) return;

        if (cursorIndex >= levelData.treble.length) {
            // Level Complete!
            // Auto-generate new after delay?
            // For now, let's just wait or loop?
            setTimeout(() => generateNewLevel(difficulty), 500);
            return;
        }

        const targetTreble = levelData.treble[cursorIndex];
        const targetBass = levelData.bass[cursorIndex];

        // Gather Target MIDI Numbers
        const requiredNotes = new Set<number>();
        targetTreble.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));
        targetBass.keys.forEach(k => requiredNotes.add(parseKeyToMidi(k)));

        // Check Agreement
        // Condition: Active notes must INCLUDE all required notes.
        // (We allow extra notes? Maybe strict for now to avoid mess)
        const allFound = Array.from(requiredNotes).every(n => activeNotes.has(n));

        if (allFound) {
            // SUCCESS
            setCursorIndex(prev => prev + 1);
            // Optional: Visual 'Flash' or sound?
        }

    }, [activeNotes, cursorIndex, levelData, difficulty, audioStarted]);



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 text-neutral-900 p-8 space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Piano Sight</h1>
                <p className="text-neutral-500">MIDI Sight-Reading Trainer</p>
            </header>

            {/* Main Display Area */}
            <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center space-y-6 overflow-hidden">

                {/* Watermark Overlay */}
                <WatermarkLayer visible={showWatermark} overlayText="C Major" />

                <MusicDisplay
                    width={800}
                    height={300}
                    trebleNotes={levelData.treble}
                    bassNotes={levelData.bass}
                    showLabels={showNoteLabels}
                    cursorIndex={cursorIndex}
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
                        <button onClick={() => setShowNoteLabels(!showNoteLabels)} className="px-4 py-2 border rounded hover:bg-gray-50 text-xs">
                            {showNoteLabels ? 'Hide' : 'Show'} Labels
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
