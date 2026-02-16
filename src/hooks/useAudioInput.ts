import { useState, useRef, useEffect, useCallback } from 'react';
import { PitchDetector } from '../audio/PitchDetector';

export function useAudioInput() {
    const [isListening, setIsListening] = useState(false);
    const [detectedNote, setDetectedNote] = useState<number | null>(null);
    const [volume, setVolume] = useState(0);
    const detectorRef = useRef<PitchDetector | null>(null);
    const requestRef = useRef<number>();
    const lastVolumeUpdate = useRef<number>(0);

    // Audio Context is usually suspended until user interaction
    const audioContextRef = useRef<AudioContext | null>(null);

    // Smoothing State
    const historyRef = useRef<number[]>([]);
    const HISTORY_SIZE = 5; // Require consistent note for X frames

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

        // Add to history
        const history = historyRef.current;
        history.push(currentNote !== null ? currentNote : -1);
        if (history.length > HISTORY_SIZE) history.shift();

        // Check for consistency
        // If history is full and all values are equal (and not -1), setNote
        if (history.length === HISTORY_SIZE) {
            const candidate = history[0];
            if (candidate !== -1 && history.every(n => n === candidate)) {
                setDetectedNote(candidate);
            } else if (history.every(n => n === -1)) {
                // only clear if we have consistent silence? or clearer faster?
                // Fast release is better.
                setDetectedNote(null);
            }
        }

        // Get volume from detector for UI feedback
        const now = performance.now();
        if (now - lastVolumeUpdate.current > 100) {
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
        // We don't necessarily need to close the context/stream if we want to resume quickly,
        // but for battery/privacy, we probably should if the user explicitly stops.
        // For now, keep it simple.
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            // detectorRef.current?.stop(); // Optional cleanup
        };
    }, []);

    return {
        isListening,
        detectedNote,
        volume,
        startListening,
        stopListening
    };
}
