import React from 'react';

interface StatisticsPanelProps {
    hitStats: Record<string, number>;
    errorStats: Record<string, number>;
    isDarkMode?: boolean;
    onReset?: () => void;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
    hitStats,
    errorStats,
    isDarkMode = false,
    onReset
}) => {

    // Process Stats
    const allNotes = new Set([...Object.keys(hitStats), ...Object.keys(errorStats)]);
    const sortedNotes = Array.from(allNotes).sort();

    // Calculate accuracy
    const totalHits = Object.values(hitStats).reduce((a, b) => a + b, 0);
    const totalErrors = Object.values(errorStats).reduce((a, b) => a + b, 0);
    const total = totalHits + totalErrors;
    const accuracy = total > 0 ? Math.round((totalHits / total) * 100) : 0;

    return (
        <div className={`w-full max-w-4xl p-6 rounded-xl shadow-lg border transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold uppercase tracking-wide">Session Statistics</h2>
                {onReset && (
                    <button
                        onClick={onReset}
                        className="text-xs text-red-500 hover:text-red-700 underline uppercase tracking-wider font-bold"
                    >
                        Reset All Progress
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Accuracy</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <div className="text-2xl font-bold text-green-600">{totalHits}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Perfect Hits</div>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                    <div className="text-2xl font-bold text-red-600">{totalErrors}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Misses</div>
                </div>
            </div>

            {sortedNotes.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">Note Breakdown</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {sortedNotes.map(note => {
                            const hits = hitStats[note] || 0;
                            const errors = errorStats[note] || 0;
                            const noteTotal = hits + errors;
                            const noteAcc = noteTotal > 0 ? Math.round((hits / noteTotal) * 100) : 0;

                            let colorClass = "text-gray-500";
                            if (noteTotal > 0) {
                                if (noteAcc >= 90) colorClass = "text-green-500";
                                else if (noteAcc >= 70) colorClass = "text-yellow-500";
                                else colorClass = "text-red-500";
                            }

                            return (
                                <div key={note} className={`p-2 rounded text-center text-xs border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="font-bold mb-1">{note}</div>
                                    <div className={colorClass}>{noteAcc}%</div>
                                    <div className="text-[10px] text-gray-400">{hits}/{noteTotal}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
