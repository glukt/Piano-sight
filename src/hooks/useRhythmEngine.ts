import { useState, useRef, useEffect, useCallback } from 'react';

export const useRhythmEngine = (
    bpm: number = 60,
    measures: number = 2,
    onAnimate?: (elapsed: number) => void
) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const elapsedTimeRef = useRef<number>(0);
    const onAnimateRef = useRef(onAnimate);

    // Sync callback ref to avoid effect recreation
    useEffect(() => {
        onAnimateRef.current = onAnimate;
    }, [onAnimate]);

    // Duration of entire phrase in seconds
    // 4 beats per measure * measures * (60/bpm)
    const totalDuration = (4 * measures * 60) / bpm;

    const animate = useCallback((time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;

        const elapsed = (time - startTimeRef.current) / 1000; // seconds
        elapsedTimeRef.current = elapsed;

        // Progress can be negative during lead-in
        const progress = Math.min(elapsed / totalDuration, 1);

        // Call the visual animation callback with direct DOM updates
        onAnimateRef.current?.(elapsed);

        if (progress < 1) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setIsPlaying(false);
        }
    }, [totalDuration]);

    const start = useCallback((leadInSeconds: number = 0) => {
        setIsPlaying(true);
        // Set start time in the future so elapsed starts negative
        startTimeRef.current = performance.now() + (leadInSeconds * 1000);
        elapsedTimeRef.current = -leadInSeconds;

        requestRef.current = requestAnimationFrame(animate);
    }, [animate]);

    const stop = useCallback(() => {
        setIsPlaying(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }, []);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return { isPlaying, elapsedTimeRef, start, stop };
};
