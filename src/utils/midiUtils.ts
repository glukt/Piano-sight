// MIDI Note Names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Converts a MIDI number to a note name (e.g., 60 -> C4)
 */
export const midiToNoteName = (midi: number): string => {
    const note = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
};

/**
 * Splits a list of MIDI numbers into Treble (>= 60) and Bass (< 60)
 * 60 (Middle C) is typically shared, but we'll assign it to Treble for this logic unless customized.
 */
export const splitNotes = (notes: number[]): { treble: number[], bass: number[] } => {
    const treble: number[] = [];
    const bass: number[] = [];

    notes.sort((a, b) => a - b).forEach(n => {
        if (n >= 60) {
            treble.push(n);
        } else {
            bass.push(n);
        }
    });

    return { treble, bass };
};
