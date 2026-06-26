import React from 'react';
import VirtualKeyboard from '../VirtualKeyboard';
import { useWindowSize } from '../../hooks/useWindowSize';

interface TrainerInputsProps {
    expectedNoteKey: string; // e.g., "c/4", "f#/3"
    onNoteOn: (midi: number) => void;
    onNoteOff: (midi: number) => void;
}

const NOTE_NAME_BUTTONS = [
    { label: 'C', letter: 'c', color: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' },
    { label: 'D', letter: 'd', color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700' },
    { label: 'E', letter: 'e', color: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700' },
    { label: 'F', letter: 'f', color: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700' },
    { label: 'G', letter: 'g', color: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700' },
    { label: 'A', letter: 'a', color: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700' },
    { label: 'B', letter: 'b', color: 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700' },
];

const parseKeyToMidi = (key: string): number => {
    const [note, octave] = key.split('/');
    const baseNote = note.charAt(0).toLowerCase();
    const accidental = note.slice(1);
    const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    let midi = noteMap[baseNote] + (parseInt(octave, 10) + 1) * 12;
    if (accidental === '#') midi += 1;
    else if (accidental === '##') midi += 2;
    else if (accidental === 'b') midi -= 1;
    else if (accidental === 'bb') midi -= 2;
    return midi;
};

export const TrainerInputs: React.FC<TrainerInputsProps> = ({
    expectedNoteKey,
    onNoteOn,
    onNoteOff,
}) => {
    const { width } = useWindowSize();
    const isLandscape = width > 550; // Use landscape virtual keyboard if screen is wide enough

    const parseExpectedNote = (key: string) => {
        const [notePart, octavePart] = key.split('/');
        const letter = notePart.charAt(0).toLowerCase();
        const accidental = notePart.slice(1);
        const octave = parseInt(octavePart, 10);
        return { letter, accidental, octave };
    };

    const handleButtonTap = (btnLetter: string) => {
        const { letter, octave } = parseExpectedNote(expectedNoteKey);

        if (btnLetter === letter) {
            // Correct note name button tapped.
            // Play the exact MIDI pitch of the expected note (including accidental)
            const targetMidi = parseKeyToMidi(expectedNoteKey);
            onNoteOn(targetMidi);
            setTimeout(() => onNoteOff(targetMidi), 150);
        } else {
            // Incorrect button tapped.
            // Play the wrong letter in the expected note's octave (without the expected accidental)
            const wrongKey = `${btnLetter}/${octave}`;
            const wrongMidi = parseKeyToMidi(wrongKey);
            onNoteOn(wrongMidi);
            setTimeout(() => onNoteOff(wrongMidi), 150);
        }
    };

    // Determine virtual keyboard range dynamically centered around expected note
    const keyboardRange = React.useMemo(() => {
        const { octave } = parseExpectedNote(expectedNoteKey);
        if (octave >= 5) {
            return { start: 60, end: 84 }; // C4 to C6 (Treble upper)
        } else if (octave <= 2) {
            return { start: 36, end: 60 }; // C2 to C4 (Bass lower)
        } else {
            return { start: 48, end: 72 }; // C3 to C5 (Standard grand range)
        }
    }, [expectedNoteKey]);

    return (
        <div className="w-full mt-4 transition-all duration-300">
            {isLandscape ? (
                <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">
                        Virtual Keyboard Input (Landscape)
                    </span>
                    <div className="w-full max-w-lg p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                        <VirtualKeyboard
                            activeNotes={new Set()}
                            userActiveNotes={new Set()}
                            rangeStart={keyboardRange.start}
                            rangeEnd={keyboardRange.end}
                            showLabels={true}
                            showStaff={false}
                            interactive={true}
                            onNoteOn={onNoteOn}
                            onNoteOff={onNoteOff}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">
                        Tap Note Name Input
                    </span>
                    {/* Note Name Buttons Circular Flex Container */}
                    <div className="flex flex-wrap justify-center gap-3 w-full max-w-md px-4">
                        {NOTE_NAME_BUTTONS.map((btn) => (
                            <button
                                key={`btn-${btn.letter}`}
                                onClick={() => handleButtonTap(btn.letter)}
                                className={`flex items-center justify-center w-[21%] aspect-square rounded-full text-xl font-black text-white shadow-lg active:scale-95 active:shadow-md transition-all duration-100 ${btn.color}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
