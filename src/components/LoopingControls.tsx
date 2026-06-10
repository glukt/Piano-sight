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
}

const LoopingControls: React.FC<LoopingControlsProps> = ({
    currentTimestamp,
    totalDuration,
    loopStart,
    loopEnd,
    onSeek,
    onSetLoopStart,
    onSetLoopEnd,
    onClearLoop
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [draggingHandle, setDraggingHandle] = useState<'start' | 'end' | 'progress' | null>(null);

    const progressPercent = totalDuration > 0 ? (currentTimestamp / totalDuration) * 100 : 0;

    // Use current value or default edges for visual rendering of the drag handles
    const loopStartVal = loopStart !== null ? loopStart : 0;
    const loopEndVal = loopEnd !== null ? loopEnd : totalDuration;

    const loopStartPercent = totalDuration > 0 ? (loopStartVal / totalDuration) * 100 : 0;
    const loopEndPercent = totalDuration > 0 ? (loopEndVal / totalDuration) * 100 : 100;

    const getTimestampFromX = (clientX: number) => {
        if (!trackRef.current) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (x / rect.width) * totalDuration;
    };

    const handleTrackMouseDown = (e: React.MouseEvent) => {
        const ts = getTimestampFromX(e.clientX);
        onSeek(ts);
        setDraggingHandle('progress');
    };

    const handleStartMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggingHandle('start');
    };

    const handleEndMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggingHandle('end');
    };

    useEffect(() => {
        if (!draggingHandle) return;

        const handleMouseMove = (e: MouseEvent) => {
            const timestamp = getTimestampFromX(e.clientX);
            if (draggingHandle === 'start') {
                const maxStart = Math.max(0, loopEndVal - 0.1);
                const newStart = Math.min(timestamp, maxStart);
                onSetLoopStart(newStart);
            } else if (draggingHandle === 'end') {
                const minEnd = Math.min(totalDuration, loopStartVal + 0.1);
                const newEnd = Math.max(timestamp, minEnd);
                onSetLoopEnd(newEnd);
            } else if (draggingHandle === 'progress') {
                onSeek(timestamp);
            }
        };

        const handleMouseUp = () => {
            setDraggingHandle(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingHandle, loopStartVal, loopEndVal, totalDuration, onSeek, onSetLoopStart, onSetLoopEnd]);

    return (
        <div className="w-full bg-gray-150 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm transition-colors duration-300">
            <div className="flex flex-col space-y-3">
                {/* Drag-Instructions */}
                <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider select-none">
                    <span>Drag flags A / B to loop a section</span>
                    <span>Click progress bar to jump</span>
                </div>

                {/* Progress Bar Container */}
                <div 
                    ref={trackRef}
                    onMouseDown={handleTrackMouseDown}
                    className="relative h-8 w-full cursor-pointer select-none flex items-center"
                >
                    {/* Background Track */}
                    <div className="absolute left-0 right-0 h-3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

                    {/* Loop Highlight Region */}
                    <div
                        className="absolute h-3 bg-yellow-400/25 dark:bg-yellow-500/15 pointer-events-none"
                        style={{
                            left: `${loopStartPercent}%`,
                            width: `${loopEndPercent - loopStartPercent}%`
                        }}
                    />

                    {/* Visual Progress Fill */}
                    <div
                        className="absolute h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full pointer-events-none"
                        style={{ width: `${progressPercent}%` }}
                    />

                    {/* Loop Start Handle (A) */}
                    <div
                        onMouseDown={handleStartMouseDown}
                        className={`absolute -ml-2.5 w-5 h-7 border-2 rounded shadow-md z-30 cursor-ew-resize flex items-center justify-center text-[11px] font-black text-white transition-transform active:scale-110 ${
                            loopStart !== null 
                                ? 'bg-emerald-500 border-white dark:border-emerald-200' 
                                : 'bg-gray-400/80 hover:bg-emerald-500 border-white'
                        }`}
                        style={{ left: `${loopStartPercent}%` }}
                        title="Loop Start (A) - Drag to position"
                    >
                        A
                    </div>

                    {/* Loop End Handle (B) */}
                    <div
                        onMouseDown={handleEndMouseDown}
                        className={`absolute -ml-2.5 w-5 h-7 border-2 rounded shadow-md z-30 cursor-ew-resize flex items-center justify-center text-[11px] font-black text-white transition-transform active:scale-110 ${
                            loopEnd !== null 
                                ? 'bg-rose-500 border-white dark:border-rose-200' 
                                : 'bg-gray-400/80 hover:bg-rose-500 border-white'
                        }`}
                        style={{ left: `${loopEndPercent}%` }}
                        title="Loop End (B) - Drag to position"
                    >
                        B
                    </div>

                    {/* Playhead Progress Thumb */}
                    <div
                        className="absolute -ml-2 w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full border-2 border-white dark:border-gray-900 shadow-[0_0_8px_rgba(59,130,246,0.6)] z-20 pointer-events-none"
                        style={{ left: `${progressPercent}%` }}
                    />
                </div>

                {/* Looping Controls Actions */}
                <div className="flex justify-between items-center text-sm pt-1">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSetLoopStart(null)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                                loopStart !== null
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-250 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-750'
                            }`}
                        >
                            {loopStart !== null ? `Start: ${loopStart.toFixed(1)}` : 'Set [A]'}
                        </button>
                        <button
                            onClick={() => onSetLoopEnd(null)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                                loopEnd !== null
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-250 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-750'
                            }`}
                        >
                            {loopEnd !== null ? `End: ${loopEnd.toFixed(1)}` : 'Set [B]'}
                        </button>
                        {(loopStart !== null || loopEnd !== null) && (
                            <button
                                onClick={onClearLoop}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-full text-xs font-bold transition border border-gray-300 dark:border-gray-655"
                            >
                                Clear Loop
                            </button>
                        )}
                    </div>
                    <div className="font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                        {currentTimestamp.toFixed(1)} / {totalDuration.toFixed(1)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoopingControls;
