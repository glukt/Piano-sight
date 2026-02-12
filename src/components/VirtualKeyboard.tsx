import React, { useMemo } from 'react';

interface VirtualKeyboardProps {
    activeNotes: Set<number>; // Playback notes (Blue)
    userActiveNotes?: Set<number>; // User input notes (Yellow/Green)
    rangeStart?: number; // MIDI note to start (default 21 - A0)
    rangeEnd?: number;   // MIDI note to end (default 108 - C8)
    showLabels?: boolean;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getNoteLabel = (midi: number) => {
    const note = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
};

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    activeNotes,
    userActiveNotes = new Set(),
    rangeStart = 21,
    rangeEnd = 108,
    showLabels = false
}) => {
    // Generate keys
    const keys = useMemo(() => {
        const k = [];
        for (let i = rangeStart; i <= rangeEnd; i++) {
            const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
            k.push({ midi: i, isBlack });
        }
        return k;
    }, [rangeStart, rangeEnd]);

    // calculate white keys for width
    const whiteKeyCount = keys.filter(k => !k.isBlack).length;

    return (
        <div className="virtual-keyboard w-full h-32 bg-gray-900 p-2 rounded-lg flex relative overflow-hidden select-none">
            {keys.map((key) => {
                if (key.isBlack) return null; // Render black keys later overlaying white

                // White Key
                const isPlayback = activeNotes.has(key.midi);
                const isUser = userActiveNotes.has(key.midi);

                let bgColor = 'bg-white';
                if (isPlayback && isUser) bgColor = 'bg-green-400'; // Match
                else if (isPlayback) bgColor = 'bg-blue-400'; // Playback only
                else if (isUser) bgColor = 'bg-yellow-400'; // User only (Wrong?)

                return (
                    <div
                        key={key.midi}
                        className={`virtual-key-white flex-1 h-full border border-gray-400 rounded-b-sm relative transition-colors duration-75
                             ${bgColor}
                        `}
                        style={{ zIndex: 1 }}
                    >
                        {showLabels && (
                            <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-gray-500 font-sans pointer-events-none">
                                {getNoteLabel(key.midi)}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Render Black Keys Overlay */}
            <div className="absolute top-2 left-2 right-2 h-20 flex pointer-events-none" style={{ zIndex: 2 }}>
                {keys.map((key) => {
                    if (!key.isBlack) return null;

                    // Calculate position
                    let offset = 0;
                    for (let i = rangeStart; i < key.midi; i++) {
                        if (![1, 3, 6, 8, 10].includes(i % 12)) offset++;
                    }

                    const isPlayback = activeNotes.has(key.midi);
                    const isUser = userActiveNotes.has(key.midi);

                    let bgColor = 'bg-black';
                    if (isPlayback && isUser) bgColor = 'bg-green-600'; // Match
                    else if (isPlayback) bgColor = 'bg-blue-600'; // Playback only
                    else if (isUser) bgColor = 'bg-yellow-500'; // User only

                    // Center on the crack (offset is the white key AFTER the crack, so subtract half-width)
                    const keyWidthRatio = 0.7;
                    const leftPercent = ((offset - (keyWidthRatio / 2)) / whiteKeyCount) * 100;
                    const widthPercent = (1 / whiteKeyCount) * 100 * keyWidthRatio;

                    return (
                        <div
                            key={key.midi}
                            className={`absolute top-0 h-full rounded-b-sm transition-colors duration-75
                                ${bgColor}
                             `}
                            style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default VirtualKeyboard;
