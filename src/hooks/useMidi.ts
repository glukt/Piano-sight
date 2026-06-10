import { useState, useEffect, useCallback, useRef } from 'react';
import { audio } from '../audio/Synth';

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
        if (!message || !message.data || message.data.length < 3) return;
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

        // Control Change (usually 176-191)
        if (command >= 176 && command <= 191) {
            const controllerNumber = note;
            const value = velocity;
            if (controllerNumber === 64) {
                // CC#64: Sustain Pedal
                audio.setSustain(value >= 64);
            }
        }
    }, []);

    useEffect(() => {
        const boundInputs = new Set<WebMidi.MIDIInput>();

        const onMIDISuccess = (access: WebMidi.MIDIAccess) => {
            setIsEnabled(true);
            const updateDevices = () => {
                const inputList: WebMidi.MIDIInput[] = [];
                const outputList: WebMidi.MIDIOutput[] = [];

                access.inputs.forEach((input) => inputList.push(input));
                access.outputs.forEach((output) => outputList.push(output));

                setInputs(inputList);
                setOutputs(outputList);

                // Unbind from any inputs that are no longer present
                boundInputs.forEach(input => {
                    if (!inputList.includes(input)) {
                        input.removeEventListener('midimessage', handleMidiMessage);
                        boundInputs.delete(input);
                    }
                });

                // Bind to any new inputs
                inputList.forEach(input => {
                    if (!boundInputs.has(input)) {
                        input.addEventListener('midimessage', handleMidiMessage);
                        boundInputs.add(input);
                    }
                });
            };

            access.onstatechange = updateDevices;
            updateDevices();

            // Cleanup function for the device success callback
            return () => {
                boundInputs.forEach(input => {
                    input.removeEventListener('midimessage', handleMidiMessage);
                });
                boundInputs.clear();
                access.onstatechange = null;
            };
        };

        const onMIDIFailure = (err: any) => {
            console.warn('Could not access your MIDI devices.', err);
            setError("MIDI Access Failed.");
        };

        let cleanupDevices: (() => void) | null = null;

        if ((navigator as any).requestMIDIAccess) {
            (navigator as any).requestMIDIAccess({ sysex: false }).then((access: WebMidi.MIDIAccess) => {
                cleanupDevices = onMIDISuccess(access);
            }, onMIDIFailure);
        } else {
            setError("Web MIDI API not supported. Try Chrome or Edge.");
        }

        return () => {
            if (cleanupDevices) {
                cleanupDevices();
            }
        };
    }, [handleMidiMessage]);

    return { inputs, outputs, activeNotes, isEnabled, error };
}
