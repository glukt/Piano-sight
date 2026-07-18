import React, { useState, useEffect, useRef } from 'react';

interface LoopingControlsProps {
    currentTimestamp: number;
    totalDuration: number;
    loopStart: number | null;
    loopEnd: number | null;
    onSeek: (value: number) => void;
    onSetLoopStart: (value: number | null) => void;
    onSetLoopEnd: (value: number | null) => void;
    onClearLoop: () => void;
    measureTimestamps?: number[];
    disabled?: boolean;
}

const LoopingControls: React.FC<LoopingControlsProps> = ({
    currentTimestamp,
    totalDuration,
    loopStart,
    loopEnd,
    onSeek,
    onSetLoopStart,
    onSetLoopEnd,
    onClearLoop,
    measureTimestamps = [],
    disabled = false
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | 'progress' | null>(null);
    const [localLoopStart, setLocalLoopStart] = useState<number | null>(null);
    const [localLoopEnd, setLocalLoopEnd] = useState<number | null>(null);

    const progressPercent = totalDuration > 0 ? (currentTimestamp / totalDuration) * 100 : 0;

    // Use current value or default edges for visual rendering of the drag handles
    const loopStartVal = localLoopStart !== null ? localLoopStart : (loopStart !== null ? loopStart : 0);
    const loopEndVal = localLoopEnd !== null ? localLoopEnd : (loopEnd !== null ? loopEnd : totalDuration);

    const loopStartPercent = totalDuration > 0 ? (loopStartVal / totalDuration) * 100 : 0;
    const loopEndPercent = totalDuration > 0 ? (loopEndVal / totalDuration) * 100 : 100;

    const getTimestampFromX = (clientX: number) => {
        if (!trackRef.current) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (x / rect.width) * totalDuration;
    };

    const getSnappedTimestamp = (timestamp: number) => {
        if (!measureTimestamps || measureTimestamps.length === 0) return timestamp;

        // Find the closest measure timestamp
        let closest = measureTimestamps[0];
        let minDiff = Math.abs(timestamp - closest);

        for (let i = 1; i < measureTimestamps.length; i++) {
            const diff = Math.abs(timestamp - measureTimestamps[i]);
            if (diff < minDiff) {
                minDiff = diff;
                closest = measureTimestamps[i];
            }
        }

        // Also check if totalDuration is closer
        const diffEnd = Math.abs(timestamp - totalDuration);
        if (diffEnd < minDiff) {
            closest = totalDuration;
        }

        return closest;
    };

    const getMeasureNumber = (timestamp: number | null) => {
        if (timestamp === null || !measureTimestamps || measureTimestamps.length === 0) return null;

        let closestIndex = 0;
        let minDiff = Math.abs(timestamp - measureTimestamps[0]);

        for (let i = 1; i < measureTimestamps.length; i++) {
            const diff = Math.abs(timestamp - measureTimestamps[i]);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }

        // Check if close to end of song
        const diffEnd = Math.abs(timestamp - totalDuration);
        if (diffEnd < minDiff && diffEnd < 0.05) {
            return measureTimestamps.length;
        }

        return closestIndex + 1; // 1-based measure number
    };

    const handleTrackMouseDown = (e: React.MouseEvent) => {
        const ts = getTimestampFromX(e.clientX);
        const snapped = getSnappedTimestamp(ts);
        
        if (e.shiftKey) {
            onSetLoopStart(snapped);
            return;
        } else if (e.altKey || e.ctrlKey) {
            onSetLoopEnd(snapped);
            return;
        }
        
        onSeek(snapped);
        setDraggingHandle('progress');
    };

    const handleStartMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalLoopStart(loopStart !== null ? loopStart : 0);
        setLocalLoopEnd(loopEnd !== null ? loopEnd : totalDuration);
        setDraggingHandle('start');
    };

    const handleEndMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalLoopStart(loopStart !== null ? loopStart : 0);
        setLocalLoopEnd(loopEnd !== null ? loopEnd : totalDuration);
        setDraggingHandle('end');
    };

    useEffect(() => {
        if (!draggingHandle) return;

        const handleMouseMove = (e: MouseEvent) => {
            const timestamp = getTimestampFromX(e.clientX);
            const snapped = getSnappedTimestamp(timestamp);

            if (draggingHandle === 'start') {
                const maxStart = Math.max(0, loopEndVal - 0.01);
                const newStart = Math.min(snapped, maxStart);
                setLocalLoopStart(newStart);
            } else if (draggingHandle === 'end') {
                const minEnd = Math.min(totalDuration, loopStartVal + 0.01);
                const newEnd = Math.max(snapped, minEnd);
                setLocalLoopEnd(newEnd);
            } else if (draggingHandle === 'progress') {
                onSeek(snapped);
            }
        };

        const handleMouseUp = () => {
            if (draggingHandle === 'start' && localLoopStart !== null) {
                onSetLoopStart(localLoopStart);
            } else if (draggingHandle === 'end' && localLoopEnd !== null) {
                onSetLoopEnd(localLoopEnd);
            }
            setDraggingHandle(null);
            setLocalLoopStart(null);
            setLocalLoopEnd(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingHandle, loopStartVal, loopEndVal, totalDuration, measureTimestamps, localLoopStart, localLoopEnd, onSetLoopStart, onSetLoopEnd]);

    const currentMeasure = getMeasureNumber(currentTimestamp) || 1;
    const totalMeasures = measureTimestamps.length || 1;

    const startMeasureNum = getMeasureNumber(loopStart);
    const endMeasureNum = getMeasureNumber(loopEnd);

    // Filter measure ticks to prevent cluttering
    const showAllTicks = measureTimestamps.length <= 40;
    const tickInterval = showAllTicks ? 1 : (measureTimestamps.length <= 80 ? 5 : 10);

    return (
        <div className={`w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-100/10 dark:shadow-none transition-all duration-300 ${disabled ? 'opacity-85' : ''}`}>
            <div className="flex flex-col space-y-4">
                {/* Header Info */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest select-none">
                    <span>{disabled ? "Song Progress (Play & Grade)" : "Practice Loop (Measure Snapped)"}</span>
                    <span className="font-mono text-xs text-sky-600 dark:text-sky-400 normal-case bg-sky-50 dark:bg-sky-950/30 px-2.5 py-0.5 rounded-full">
                        Measure {currentMeasure} / {totalMeasures}
                    </span>
                </div>

                {/* Snapping Ruler track */}
                <div 
                    ref={trackRef}
                    onMouseDown={disabled ? undefined : handleTrackMouseDown}
                    className={`relative h-10 w-full select-none flex items-center ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    {/* Track Base */}
                    <div className="absolute left-0 right-0 h-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/30 dark:border-slate-700/30"></div>

                    {/* Measure Ticks */}
                    {measureTimestamps.map((ts, idx) => {
                        if (idx % tickInterval !== 0) return null;
                        const percent = (ts / totalDuration) * 100;
                        return (
                            <div 
                                key={idx}
                                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-slate-300 dark:bg-slate-600/80 rounded-full"
                                style={{ left: `${percent}%` }}
                                title={`Measure ${idx + 1}`}
                            />
                        );
                    })}

                    {/* Loop Highlight Region - Only when NOT disabled */}
                    {!disabled && (
                        <div
                            className="absolute h-2 bg-sky-500/10 dark:bg-sky-400/10 border-y border-sky-400/20 pointer-events-none"
                            style={{
                                left: `${loopStartPercent}%`,
                                width: `${loopEndPercent - loopStartPercent}%`
                            }}
                        />
                    )}

                    {/* Loop Start Handle (A) - Circular Pin - Only when NOT disabled */}
                    {!disabled && (
                        <div
                            onMouseDown={handleStartMouseDown}
                            className={`absolute -ml-3 w-6 h-6 rounded-full border-2 shadow-lg z-30 cursor-ew-resize flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 active:scale-120 ${
                                loopStart !== null 
                                    ? 'bg-emerald-500 border-white text-white shadow-emerald-500/30 dark:shadow-emerald-950/20' 
                                    : 'bg-slate-300 border-white text-slate-600 hover:bg-emerald-500 hover:text-white dark:bg-slate-700 dark:text-slate-300'
                            }`}
                            style={{ left: `${loopStartPercent}%` }}
                            title={startMeasureNum ? `Loop Start: Measure ${startMeasureNum}` : 'Set Loop Start'}
                        >
                            A
                        </div>
                    )}

                    {/* Loop End Handle (B) - Circular Pin - Only when NOT disabled */}
                    {!disabled && (
                        <div
                            onMouseDown={handleEndMouseDown}
                            className={`absolute -ml-3 w-6 h-6 rounded-full border-2 shadow-lg z-30 cursor-ew-resize flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 active:scale-120 ${
                                loopEnd !== null 
                                    ? 'bg-rose-500 border-white text-white shadow-rose-500/30 dark:shadow-rose-950/20' 
                                    : 'bg-slate-300 border-white text-slate-600 hover:bg-rose-500 hover:text-white dark:bg-slate-700 dark:text-slate-300'
                            }`}
                            style={{ left: `${loopEndPercent}%` }}
                            title={endMeasureNum ? `Loop End: Measure ${endMeasureNum}` : 'Set Loop End'}
                        >
                            B
                        </div>
                    )}

                    {/* Playhead Progress Thumb */}
                    <div
                        className="absolute -ml-1.5 w-3 h-5 bg-sky-600 dark:bg-sky-400 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.6)] z-20 pointer-events-none"
                        style={{ left: `${progressPercent}%` }}
                    />
                </div>

                {/* Looping Controls Actions - Only when NOT disabled */}
                {!disabled && (
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-wrap gap-2.5">
                            <button
                                onClick={() => onSetLoopStart(loopStart !== null ? null : currentTimestamp)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition duration-200 select-none ${
                                    loopStart !== null
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/60'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 dark:border-slate-700'
                                }`}
                            >
                                {startMeasureNum !== null ? `[A] Bar ${startMeasureNum}` : 'Set [A]'}
                            </button>
                            <button
                                onClick={() => onSetLoopEnd(loopEnd !== null ? null : currentTimestamp)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition duration-200 select-none ${
                                    loopEnd !== null
                                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/60'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 dark:border-slate-700'
                                }`}
                            >
                                {endMeasureNum !== null ? `[B] Bar ${endMeasureNum}` : 'Set [B]'}
                            </button>
                            {measureTimestamps.length > 0 && (
                                <button
                                    onClick={() => {
                                        const startTs = measureTimestamps[currentMeasure - 1];
                                        const endTs = measureTimestamps[currentMeasure] !== undefined 
                                            ? measureTimestamps[currentMeasure] 
                                            : totalDuration;
                                        onSetLoopStart(startTs);
                                        onSetLoopEnd(endTs);
                                    }}
                                    className="px-4 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 dark:bg-sky-950/20 rounded-xl text-xs font-bold transition duration-200 border border-sky-300/40 dark:border-sky-900/60 select-none"
                                >
                                    Loop Current Bar ({currentMeasure})
                                </button>
                            )}
                            {(loopStart !== null || loopEnd !== null) && (
                                <button
                                    onClick={onClearLoop}
                                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold transition duration-200 border border-slate-300/40 dark:border-slate-700 select-none"
                                >
                                    Clear Loop
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoopingControls;
