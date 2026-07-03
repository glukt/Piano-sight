import { useState, useRef, useEffect, useCallback } from 'react';
import { PitchDetector } from '../audio/PitchDetector';

export function useAudioInput() {
    const [isListening, setIsListening] = useState(false);
    const [detectedNote, setDetectedNote] = useState<number | null>(null);
    const [volume, setVolume] = useState(0);
    const [sensitivity, setSensitivity] = useState(() => {
        const saved = localStorage.getItem('pianopilot_mic_sensitivity');
        return saved ? Number(saved) : 0.01;
    });

    const detectorRef = useRef<PitchDetector | null>(null);
    const requestRef = useRef<number>();
    const lastVolumeUpdate = useRef<number>(0);

    // Audio Context is usually suspended until user interaction
    const audioContextRef = useRef<AudioContext | null>(null);

    // Responsive smoothing references
    const consecutiveFramesRef = useRef<number>(0);
    const consecutiveSilenceRef = useRef<number>(0);
    const lastMidiNoteRef = useRef<number | null>(null);

    // Sync sensitivity to the pitch detector
    useEffect(() => {
        if (detectorRef.current) {
            detectorRef.current.noiseGateThreshold = sensitivity;
        }
        localStorage.setItem('pianopilot_mic_sensitivity', sensitivity.toString());
    }, [sensitivity]);

    const updatePitch = useCallback(() => {
        if (!detectorRef.current) return;

        const pitch = detectorRef.current.getPitch();
        let currentNote: number | null = null;
        if (pitch && pitch > 0) {
            const note = detectorRef.current.noteFromPitch(pitch);
            if (note >= 21 && note <= 108) {
                currentNote = note;
            }
        }

        // Responsive smoothing logic
        if (currentNote !== null) {
            consecutiveSilenceRef.current = 0;
            if (currentNote === lastMidiNoteRef.current) {
                consecutiveFramesRef.current++;
                if (consecutiveFramesRef.current >= 4) {
                    setDetectedNote(currentNote);
                }
            } else {
                lastMidiNoteRef.current = currentNote;
                consecutiveFramesRef.current = 1;
            }
        } else {
            consecutiveFramesRef.current = 0;
            consecutiveSilenceRef.current++;
            if (consecutiveSilenceRef.current >= 6) {
                setDetectedNote(null);
                lastMidiNoteRef.current = null;
            }
        }

        // Get volume from detector for UI feedback
        const now = performance.now();
        if (now - lastVolumeUpdate.current > 50) { // Faster updates (20Hz) for volume meter
            const vol = detectorRef.current.lastVolume;
            setVolume(vol);
            lastVolumeUpdate.current = now;
        }

        requestRef.current = requestAnimationFrame(updatePitch);
    }, []);

    const startListening = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (!detectorRef.current) {
                detectorRef.current = new PitchDetector(audioContextRef.current);
            }
            detectorRef.current.noiseGateThreshold = sensitivity;

            await detectorRef.current.init();
            setIsListening(true);
            requestRef.current = requestAnimationFrame(updatePitch);
        } catch (err) {
            console.error("Failed to start audio input", err);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setIsListening(false);
        setDetectedNote(null);
        consecutiveFramesRef.current = 0;
        consecutiveSilenceRef.current = 0;
        lastMidiNoteRef.current = null;
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return {
        isListening,
        detectedNote,
        volume,
        sensitivity,
        setSensitivity,
        startListening,
        stopListening
    };
}
