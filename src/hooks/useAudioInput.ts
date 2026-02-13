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

    const updatePitch = useCallback(() => {
        if (!detectorRef.current) return;

        const pitch = detectorRef.current.getPitch();
        if (pitch && pitch > 0) {
            const note = detectorRef.current.noteFromPitch(pitch);
            // Basic smoothing/range check: Piano range 21 (A0) to 108 (C8)
            if (note >= 21 && note <= 108) {
                setDetectedNote(note);
            } else {
                setDetectedNote(null);
            }
        } else {
            setDetectedNote(null);
        }

        // Get volume from detector for UI feedback
        // Throttle volume updates to avoid excessive re-renders (e.g., every 100ms)
        const now = performance.now();
        if (now - lastVolumeUpdate.current > 100) {
            const vol = detectorRef.current.lastVolume;
            // Only update if changes significantly to further reduce renders? 
            // For smoothing, we might want regular updates, but 10fps is enough for visual meter.
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
