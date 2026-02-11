import { useState, useRef, useEffect, useCallback } from 'react';

export type RhythmState = {
    isPlaying: boolean;
    playheadX: number; // 0 to 100 (%)
    currentBeat: number;
    startTime: number;
};

export const useRhythmEngine = (bpm: number = 60, measures: number = 2) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playheadX, setPlayheadX] = useState(0); // 0-100% position
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>(0);
    const [beat, setBeat] = useState(0);

    const [elapsedTime, setElapsedTime] = useState(0);

    // Duration of entire phrase in seconds
    // 4 beats per measure * measures * (60/bpm)
    const totalDuration = (4 * measures * 60) / bpm;

    const animate = useCallback((time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;

        const elapsed = (time - startTimeRef.current) / 1000; // seconds

        // Progress can be negative during lead-in
        const progress = Math.min(elapsed / totalDuration, 1);

        setPlayheadX(progress * 100);
        setElapsedTime(elapsed);

        // Calculate current beat (approx)
        const currentBeat = Math.floor(elapsed / (60 / bpm));
        setBeat(currentBeat);

        if (progress < 1) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setIsPlaying(false);
            setPlayheadX(100);
        }
    }, [bpm, measures, totalDuration]);

    const start = useCallback((leadInSeconds: number = 0) => {
        setIsPlaying(true);
        // Set start time in the future so elapsed starts negative
        startTimeRef.current = performance.now() + (leadInSeconds * 1000);

        setPlayheadX((-leadInSeconds / totalDuration) * 100);
        setElapsedTime(-leadInSeconds);

        requestRef.current = requestAnimationFrame(animate);
    }, [animate, totalDuration]);

    const stop = useCallback(() => {
        setIsPlaying(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }, []);

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return { isPlaying, playheadX, beat, elapsedTime, start, stop };
};
