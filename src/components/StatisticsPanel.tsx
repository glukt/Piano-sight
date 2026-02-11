import React from 'react';

interface StatisticsPanelProps {
    hitStats: Record<string, number>;
    errorStats: Record<string, number>;
    isDarkMode: boolean;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ hitStats, errorStats, isDarkMode }) => {

    // Process Stats
    const allNotes = new Set([...Object.keys(hitStats), ...Object.keys(errorStats)]);

    const stats = Array.from(allNotes).map(note => {
        const hits = hitStats[note] || 0;
        const misses = errorStats[note] || 0;
        const total = hits + misses;
        const accuracy = total > 0 ? (hits / total) * 100 : 0;
        return { note, hits, misses, total, accuracy };
    });

    // Determine "Hot Zones" (Low Accuracy, Min 3 attempts)
    const hotZones = stats
        .filter(s => s.total >= 3 && s.accuracy < 60)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3); // Top 3 worst

    // Determine "Strengths" (High Accuracy, Min 5 attempts)
    const strengths = stats
        .filter(s => s.total >= 5 && s.accuracy >= 90)
        .sort((a, b) => b.total - a.total) // Sorted by volume
        .slice(0, 3);

    return (
        <div className={`mt-8 p-6 rounded-xl shadow-lg border transition-colors duration-500 w-full max-w-4xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 text-center opacity-80 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Session Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hot Zones */}
                <div>
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 opacity-90">
                        🔥 Hot Zones
                    </h3>
                    {hotZones.length === 0 ? (
                        <p className={`text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No hot zones detected yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {hotZones.map(s => (
                                <div key={s.note} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{s.note}</span>
                                        <span className="text-red-400">{Math.round(s.accuracy)}%</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{ width: `${s.accuracy}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Strengths */}
                <div>
                    <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2 opacity-90">
                        💪 Strengths
                    </h3>
                    {strengths.length === 0 ? (
                        <p className={`text-xs italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Play more to identify strengths.</p>
                    ) : (
                        <div className="space-y-3">
                            {strengths.map(s => (
                                <div key={s.note} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide">
                                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{s.note}</span>
                                        <span className="text-emerald-400">{Math.round(s.accuracy)}%</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${s.accuracy}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Total Stats Summary */}
            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between text-[10px] uppercase tracking-wider opacity-60`}>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Total Notes: {stats.reduce((acc, curr) => acc + curr.total, 0)}
                </span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Accuracy: {(() => {
                        const totalHits = stats.reduce((acc, curr) => acc + curr.hits, 0);
                        const totalAttempts = stats.reduce((acc, curr) => acc + curr.total, 0);
                        return totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 0;
                    })()}%
                </span>
            </div>
        </div>
    );
};
