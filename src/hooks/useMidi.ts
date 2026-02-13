import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseMidiProps {
    onNoteOn?: (note: number, velocity: number) => void;
    onNoteOff?: (note: number) => void;
}

export function useMidi({ onNoteOn, onNoteOff }: UseMidiProps = {}) {
    const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([]);
    const [outputs, setOutputs] = useState<WebMidi.MIDIOutput[]>([]);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [isEnabled, setIsEnabled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for callbacks to avoid effect dependencies
    const onNoteOnRef = useRef(onNoteOn);
    const onNoteOffRef = useRef(onNoteOff);

    useEffect(() => {
        onNoteOnRef.current = onNoteOn;
        onNoteOffRef.current = onNoteOff;
    });

    const handleMidiMessage = useCallback((message: WebMidi.MIDIMessageEvent) => {
        const [command, note, velocity] = message.data;

        // Note On (usually 144-159)
        if (command >= 144 && command <= 159) {
            if (velocity > 0) {
                setActiveNotes(prev => {
                    const next = new Set(prev);
                    next.add(note);
                    return next;
                });
                onNoteOnRef.current?.(note, velocity);
            } else {
                // Velocity 0 is often used as Note Off
                setActiveNotes(prev => {
                    const next = new Set(prev);
                    next.delete(note);
                    return next;
                });
                onNoteOffRef.current?.(note);
            }
        }

        // Note Off (usually 128-143)
        if (command >= 128 && command <= 143) {
            setActiveNotes(prev => {
                const next = new Set(prev);
                next.delete(note);
                return next;
            });
            onNoteOffRef.current?.(note);
        }
    }, []);

    useEffect(() => {
        const onMIDISuccess = (access: WebMidi.MIDIAccess) => {
            setIsEnabled(true);
            const updateDevices = () => {
                const inputList: WebMidi.MIDIInput[] = [];
                const outputList: WebMidi.MIDIOutput[] = [];

                access.inputs.forEach((input) => inputList.push(input));
                access.outputs.forEach((output) => outputList.push(output));

                setInputs(inputList);
                setOutputs(outputList);

                // Re-bind listeners to all inputs
                inputList.forEach(input => {
                    input.onmidimessage = handleMidiMessage;
                });
            };

            access.onstatechange = updateDevices;
            updateDevices();
        };

        const onMIDIFailure = (err: any) => {
            console.warn('Could not access your MIDI devices.', err);
            setError("MIDI Access Failed.");
        };

        if ((navigator as any).requestMIDIAccess) {
            (navigator as any).requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
        } else {
            setError("Web MIDI API not supported. Try Chrome or Edge.");
        }
    }, [handleMidiMessage]);

    return { inputs, outputs, activeNotes, isEnabled, error };
}
