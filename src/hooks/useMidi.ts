import { useEffect, useState, useCallback, useRef } from 'react';

export type MidiNote = {
    note: number;
    velocity: number;
    channel: number;
};

export type MidiInputDevice = {
    id: string;
    name: string;
    manufacturer: string;
};

type MidiCallbacks = {
    onNoteOn?: (note: number, velocity: number) => void;
    onNoteOff?: (note: number) => void;
};

export const useMidi = ({ onNoteOn, onNoteOff }: MidiCallbacks = {}) => {
    const [inputs, setInputs] = useState<MidiInputDevice[]>([]);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [lastNote, setLastNote] = useState<MidiNote | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEnabled, setIsEnabled] = useState(false);

    // Refs for callbacks to avoid effect dependencies
    const onNoteOnRef = useRef(onNoteOn);
    const onNoteOffRef = useRef(onNoteOff);

    useEffect(() => {
        onNoteOnRef.current = onNoteOn;
        onNoteOffRef.current = onNoteOff;
    }, [onNoteOn, onNoteOff]);

    // Helper to parse MIDI message
    const handleMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
        const [status, note, velocity] = event.data;
        const command = status >> 4;
        const channel = status & 0xf;

        // Note On (144)
        if (command === 9 && velocity > 0) {
            setLastNote({ note, velocity, channel });
            setActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.add(note);
                return newSet;
            });
            onNoteOnRef.current?.(note, velocity);
        }
        // Note Off (128) or Note On with 0 velocity
        else if (command === 8 || (command === 9 && velocity === 0)) {
            setActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(note);
                return newSet;
            });
            onNoteOffRef.current?.(note);
        }
    }, []);

    useEffect(() => {
        if (!navigator.requestMIDIAccess) {
            setError('Web MIDI API is not supported in this browser.');
            return;
        }

        let midiAccess: WebMidi.MIDIAccess | null = null;

        const onStateChange = () => {
            if (!midiAccess) return;
            const inputsList: MidiInputDevice[] = [];
            midiAccess.inputs.forEach((input) => {
                inputsList.push({
                    id: input.id,
                    name: input.name || 'Unknown Device',
                    manufacturer: input.manufacturer || '',
                });
            });
            setInputs(inputsList);
        };

        navigator.requestMIDIAccess().then(
            (access) => {
                midiAccess = access;
                setIsEnabled(true);
                onStateChange();

                // Listen for connection changes
                midiAccess.onstatechange = onStateChange;

                // Attach listeners to all inputs
                midiAccess.inputs.forEach((input) => {
                    input.onmidimessage = handleMidiMessage;
                });
            },
            (err) => {
                setError(`MIDI Access Failed: ${err}`);
            }
        );

        return () => {
            // Cleanup listeners if possible (though often unnecessary for global MIDI access in React components)
            if (midiAccess) {
                midiAccess.onstatechange = null;
                midiAccess.inputs.forEach(input => {
                    input.onmidimessage = null;
                });
            }
        };
    }, [handleMidiMessage]);

    return { inputs, lastNote, activeNotes, error, isEnabled };
};
