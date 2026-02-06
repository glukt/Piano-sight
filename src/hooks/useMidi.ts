import { useEffect, useState, useCallback } from 'react';

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

export const useMidi = () => {
    const [inputs, setInputs] = useState<MidiInputDevice[]>([]);
    const [lastNote, setLastNote] = useState<MidiNote | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEnabled, setIsEnabled] = useState(false);

    // Helper to parse MIDI message
    const handleMidiMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
        const [status, note, velocity] = event.data;
        const command = status >> 4;
        const channel = status & 0xf;

        // Note On (144) or Note Off (128)
        if (command === 9 && velocity > 0) {
            setLastNote({ note, velocity, channel });
        } else if (command === 8 || (command === 9 && velocity === 0)) {
            // NOTE: We could track Note Off here if needed for duration/sustain
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

    return { inputs, lastNote, error, isEnabled };
};
