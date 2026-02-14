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
                    // Remove old listener if any (though handleMidiMessage changes ref, we need stable cleanup?)
                    // For simplicity in this effect, we just add. Cleanup is hard without tracking.
                    // Actually, the effect re-runs on handleMidiMessage change.
                    input.addEventListener('midimessage', handleMidiMessage);
                });
            };

            access.onstatechange = updateDevices;
            updateDevices();

            // Cleanup function for the effect
            return () => {
                // We need to access the LATEST inputs to remove listeners?
                // accesses inputs from closure scope of 'updateDevices' call? No.
                // We can't easily cleanup here because 'inputs' state might not be up to date or we need access.
                // BUT, since we set local vars inputList, we can define cleanup logic inside updateDevices or return a cleanup from the effect.
                if (access) {
                    access.inputs.forEach(input => {
                        input.removeEventListener('midimessage', handleMidiMessage);
                    });
                }
            };
        };

        const onMIDIFailure = (err: any) => {
            console.warn('Could not access your MIDI devices.', err);
            setError("MIDI Access Failed.");
        };

        let accessObj: WebMidi.MIDIAccess | null = null;

        if ((navigator as any).requestMIDIAccess) {
            (navigator as any).requestMIDIAccess({ sysex: false }).then((access: WebMidi.MIDIAccess) => {
                accessObj = access;
                onMIDISuccess(access);
                // We need to store cleanup?
                // The Effect return should call cleanup.
            }, onMIDIFailure);
        } else {
            setError("Web MIDI API not supported. Try Chrome or Edge.");
        }

        return () => {
            if (accessObj) {
                accessObj.inputs.forEach(input => {
                    input.removeEventListener('midimessage', handleMidiMessage);
                });
            }
        };
    }, [handleMidiMessage]);

    return { inputs, outputs, activeNotes, isEnabled, error };
}
