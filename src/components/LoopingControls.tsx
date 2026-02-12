import React from 'react';

interface LoopingControlsProps {
    currentTimestamp: number;
    totalDuration: number;
    loopStart: number | null;
    loopEnd: number | null;
    onSeek: (value: number) => void;
    onSetLoopStart: () => void;
    onSetLoopEnd: () => void;
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
    // Format helper could go here if we had seconds, but we have "Musical Time"
    // Just displaying simpler number for now.

    const progressPercent = totalDuration > 0 ? (currentTimestamp / totalDuration) * 100 : 0;

    // Calculate loop visual positions
    const loopStartPercent = (loopStart !== null && totalDuration > 0) ? (loopStart / totalDuration) * 100 : null;
    const loopEndPercent = (loopEnd !== null && totalDuration > 0) ? (loopEnd / totalDuration) * 100 : null;

    return (
        <div className="w-full bg-gray-100 p-4 rounded-lg shadow-inner mb-4">
            <div className="flex flex-col space-y-2">

                {/* Progress Bar Container */}
                <div className="relative h-6 w-full cursor-pointer group">
                    {/* Background Track */}
                    <div className="absolute top-2 left-0 right-0 h-2 bg-gray-300 rounded"></div>

                    {/* Loop Highlight Region */}
                    {loopStartPercent !== null && loopEndPercent !== null && (
                        <div
                            className="absolute top-2 h-2 bg-yellow-200 opacity-50 pointer-events-none"
                            style={{
                                left: `${loopStartPercent}%`,
                                width: `${loopEndPercent - loopStartPercent}%`
                            }}
                        />
                    )}

                    {/* Loop Markers */}
                    {loopStartPercent !== null && (
                        <div
                            className="absolute top-0 w-1 h-6 bg-green-500 z-10"
                            style={{ left: `${loopStartPercent}%` }}
                            title="Loop Start"
                        />
                    )}
                    {loopEndPercent !== null && (
                        <div
                            className="absolute top-0 w-1 h-6 bg-red-500 z-10"
                            style={{ left: `${loopEndPercent}%` }}
                            title="Loop End"
                        />
                    )}

                    {/* Input Range for Scrubbing */}
                    <input
                        type="range"
                        min={0}
                        max={totalDuration || 100}
                        step={0.1}
                        value={currentTimestamp}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    {/* Visual Thumb/Progress */}
                    <div
                        className="absolute top-2 h-2 bg-blue-600 rounded pointer-events-none z-0"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex space-x-2">
                        <button
                            onClick={onSetLoopStart}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300 transition"
                        >
                            [A] Set Start
                        </button>
                        <button
                            onClick={onSetLoopEnd}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 border border-red-300 transition"
                        >
                            [B] Set End
                        </button>
                        {(loopStart !== null || loopEnd !== null) && (
                            <button
                                onClick={onClearLoop}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 border border-gray-300 transition"
                            >
                                Clear Loop
                            </button>
                        )}
                    </div>
                    <div className="font-mono text-gray-600">
                        {currentTimestamp.toFixed(1)} / {totalDuration.toFixed(1)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoopingControls;
