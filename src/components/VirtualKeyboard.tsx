import React, { useMemo } from 'react';

interface VirtualKeyboardProps {
    activeNotes: Set<number>; // Playback notes (Blue)
    userActiveNotes?: Set<number>; // User input notes (Yellow/Green)
    expectedNotes?: number[]; // Hints for Wait Mode (Orange/Red?)
    rangeStart?: number; // MIDI note to start (default 21 - A0)
    rangeEnd?: number;   // MIDI note to end (default 108 - C8)
    showLabels?: boolean;
    showStaff?: boolean;
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
    expectedNotes = [],
    rangeStart = 21,
    rangeEnd = 108,
    showLabels = false,
    showStaff = false
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

    // Helper to render staff on key
    const renderStaffNote = (midi: number) => {
        const isTreble = midi >= 60; // 60 is Middle C
        // Base notes for calc:
        // C4 (60) is Middle C.
        // Treble Clef: Bottom line is E4 (64). Top line is F5 (77).
        // Bass Clef: Bottom line is G2 (43). Top line is A3 (57).

        // We need a simple way to map MIDI to "staff step".
        // White keys only for simplicity of "steps".
        // Step 0 = C4.

        // Calculate "diatonic step" from Middle C (C4 = 60)
        // C4=0, D4=1, E4=2...
        // We can look at offset in white keys from C4.

        // Let's use standard reference lines.
        // Treble Bottom Line = E4 (64). 
        // Bass Top Line = A3 (57).

        // Let's calculate offset from a reference "Bottom Line" note.
        const refMidi = isTreble ? 64 : 43; // E4 (Treble Bottom) or G2 (Bass Bottom)
        // Actually, just drawing lines is safer.

        // Get diatonic step difference between midi and Ref.
        // We need lookup of white key indices.
        const whiteKeysMap = [0, 2, 4, 5, 7, 9, 11];

        const getInd = (m: number) => {
            const oct = Math.floor(m / 12);
            const deg = whiteKeysMap.indexOf(m % 12);
            return oct * 7 + deg;
        };

        const currentInd = getInd(midi);
        const refInd = getInd(refMidi);
        const stepDiff = currentInd - refInd; // Positive = up, Negative = down.

        // Visuals
        const lineSpacing = 4;
        const radius = 3;

        // Note Y: 0 is bottom line? No, 0 is usually top in SVG.
        // Let's say Bottom line is Y=30.
        // Each step up is -lineSpacing/2 pixels.
        const bottomLineY = 30;
        const noteY = bottomLineY - (stepDiff * (lineSpacing / 2));

        return (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none opacity-80">
                <svg width="40" height="60" viewBox="0 0 40 60" className="overflow-visible">
                    {/* Staff Lines (5 lines) */}
                    {[0, 1, 2, 3, 4].map(i => (
                        <line
                            key={i}
                            x1="10"
                            y1={bottomLineY - (i * lineSpacing)}
                            x2="30"
                            y2={bottomLineY - (i * lineSpacing)}
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-gray-400"
                        />
                    ))}

                    {/* Clef Indication (Tiny) - Optional */}
                    {/* Note Head */}
                    <circle cx="20" cy={noteY} r={radius} fill="currentColor" className="text-gray-800 dark:text-gray-200" />

                    {/* Ledger Lines Logic */}
                    {/* If stepDiff < 0 (Below bottom line) or > 8 (Above top line) */}
                    {/* Determine which ledger lines to draw. 
                        Ledger lines are at even steps relative to lines.
                        Bottom line is index 0. Top line is index 8 (2 * 4 gaps).
                    */}
                </svg>
            </div>
        );
    };

    return (
        <div className="virtual-keyboard w-full h-32 bg-gray-900 p-2 rounded-lg flex relative overflow-hidden select-none">
            {keys.map((key) => {
                if (key.isBlack) return null; // Render black keys later overlaying white

                // White Key
                const isPlayback = activeNotes.has(key.midi);
                const isUser = userActiveNotes.has(key.midi);
                const isExpected = expectedNotes.includes(key.midi);

                let bgColor = 'bg-white';

                // Priority Logic:
                // 1. If it's expected AND user plays it: GREEN (Success/Holding)
                // 2. If it's expected AND user NOT playing: ORANGE (Target)
                // 3. If user plays it BUT not expected: RED (Wrong note) -> Optional, maybe just Yellow
                // 4. Playback (Blue) - only if not in Wait Mode context?

                // Wait Mode Logic
                if (expectedNotes.length > 0) {
                    if (isExpected && isUser) bgColor = 'bg-green-500';
                    else if (isExpected) bgColor = 'bg-orange-400';
                    else if (isUser) bgColor = 'bg-red-400'; // Wrong note
                } else {
                    // Standard Playback / Free Play Logic
                    if (isPlayback && isUser) bgColor = 'bg-green-400';
                    else if (isPlayback) bgColor = 'bg-blue-400';
                    else if (isUser) bgColor = 'bg-yellow-400';
                }

                return (
                    <div
                        key={key.midi}
                        className={`virtual-key-white flex-1 h-full border border-gray-400 rounded-b-sm relative transition-colors duration-75
                             ${bgColor}
                        `}
                        style={{ zIndex: 1 }}
                    >
                        {showStaff && renderStaffNote(key.midi)}
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
                    const isExpected = expectedNotes.includes(key.midi);

                    let bgColor = 'bg-black';

                    if (expectedNotes.length > 0) {
                        if (isExpected && isUser) bgColor = 'bg-green-600';
                        else if (isExpected) bgColor = 'bg-orange-600';
                        else if (isUser) bgColor = 'bg-red-600';
                    } else {
                        if (isPlayback && isUser) bgColor = 'bg-green-600';
                        else if (isPlayback) bgColor = 'bg-blue-600';
                        else if (isUser) bgColor = 'bg-yellow-500';
                    }

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
