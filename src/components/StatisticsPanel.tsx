import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getLessonById } from '../utils/music/CourseData';
import { PerformanceSessionLog } from '../hooks/useMusicLibrary';

interface StatisticsPanelProps {
    hitStats: Record<string, number>;
    errorStats: Record<string, number>;
    isDarkMode?: boolean;
    onReset?: () => void;
    getAllPerformanceAttempts: () => Promise<PerformanceSessionLog[]>;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
    hitStats,
    errorStats,
    isDarkMode = false,
    onReset,
    getAllPerformanceAttempts
}) => {
    const [attempts, setAttempts] = useState<PerformanceSessionLog[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tooltipData, setTooltipData] = useState<{ name: string; date: string; accuracy: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let active = true;
        getAllPerformanceAttempts().then(data => {
            if (active) {
                setAttempts(data);
            }
        });
        return () => { active = false; };
    }, [getAllPerformanceAttempts]);

    // Process Note Stats
    const allNotes = new Set([...Object.keys(hitStats), ...Object.keys(errorStats)]);
    const sortedNotes = Array.from(allNotes).sort();

    // Overall stats calculations
    const totalHits = Object.values(hitStats).reduce((a, b) => a + b, 0);
    const totalErrors = Object.values(errorStats).reduce((a, b) => a + b, 0);
    const totalHitsAndErrors = totalHits + totalErrors;
    const sessionAccuracy = totalHitsAndErrors > 0 ? Math.round((totalHits / totalHitsAndErrors) * 100) : 0;

    const summaryStats = useMemo(() => {
        if (attempts.length === 0) {
            return { avgAccuracy: 0, totalPracticeTime: '0 min', totalRuns: 0, streak: 0 };
        }

        const totalRuns = attempts.length;
        const avgAccuracy = Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalRuns);
        
        const totalSecs = attempts.reduce((sum, a) => sum + a.durationSeconds, 0);
        const totalPracticeTime = totalSecs < 60 ? `${totalSecs}s` : `${Math.round(totalSecs / 60)} min`;

        // Streak calculation
        const uniqueDays = Array.from(new Set(
            attempts.map(a => {
                const d = new Date(a.timestamp);
                return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            })
        )).map(dayStr => new Date(dayStr).getTime());

        uniqueDays.sort((a, b) => b - a); // latest first

        const oneDayMs = 24 * 60 * 60 * 1000;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const todayStart = new Date(todayStr).getTime();

        let streak = 0;
        if (uniqueDays.length > 0) {
            const latestPractice = uniqueDays[0];
            if (latestPractice === todayStart || latestPractice === todayStart - oneDayMs) {
                streak = 1;
                let expected = latestPractice - oneDayMs;
                for (let i = 1; i < uniqueDays.length; i++) {
                    if (uniqueDays[i] === expected) {
                        streak++;
                        expected -= oneDayMs;
                    } else if (uniqueDays[i] < expected) {
                        break;
                    }
                }
            }
        }

        return { avgAccuracy, totalPracticeTime, totalRuns, streak };
    }, [attempts]);

    // SVG Line Chart calculations
    const chartHeight = 200;
    const chartPadding = 30;
    const chartPoints = useMemo(() => {
        if (attempts.length < 2) return [];
        // Map last 15 attempts for clean plotting
        const recentAttempts = attempts.slice(-15);
        return recentAttempts.map((attempt, index) => {
            const x = chartPadding + (index / (recentAttempts.length - 1)) * (100 - chartPadding * 2); // Percentage based x
            const y = chartPadding + ((100 - attempt.accuracy) / 100) * (chartHeight - chartPadding * 2);
            
            const date = new Date(attempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const lesson = getLessonById(attempt.songId);
            const name = lesson ? lesson.name : (attempt.songId.startsWith('preset-') ? attempt.songId.replace('preset-', '').replace(/[-_]/g, ' ') : 'Custom Practice');

            return { x, y, accuracy: attempt.accuracy, date, name };
        });
    }, [attempts]);

    const linePath = useMemo(() => {
        if (chartPoints.length < 2) return '';
        return chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}`).join(' ');
    }, [chartPoints]);

    const fillPath = useMemo(() => {
        if (chartPoints.length < 2) return '';
        const base = chartHeight - chartPadding;
        const start = chartPoints[0];
        const end = chartPoints[chartPoints.length - 1];
        return `M ${start.x}% ${base} L ${chartPoints.map(p => `${p.x}% ${p.y}`).join(' L ')} L ${end.x}% ${base} Z`;
    }, [chartPoints]);

    const handleMouseMove = (_e: React.MouseEvent<SVGCircleElement>, index: number) => {
        const point = chartPoints[index];
        setHoveredIndex(index);
        setTooltipData({
            name: point.name,
            date: point.date,
            accuracy: point.accuracy
        });
    };

    return (
        <div ref={containerRef} className={`w-full max-w-4xl p-6 rounded-2xl shadow-xl border transition-all duration-500 relative ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-wide bg-gradient-to-r from-blue-500 to-indigo-650 bg-clip-text text-transparent">Conservatory Diagnostics</h2>
                    <p className="text-xs opacity-60 mt-0.5">Track your real-time accuracy and sight-reading progress over time</p>
                </div>
                {onReset && (
                    <button
                        onClick={onReset}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold transition uppercase tracking-wider hover:underline"
                    >
                        Reset Statistics
                    </button>
                )}
            </div>

            {/* Diagnostics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-xl text-center shadow-sm border transition ${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{summaryStats.avgAccuracy}%</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold">Avg Accuracy</div>
                </div>
                <div className={`p-4 rounded-xl text-center shadow-sm border transition ${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{summaryStats.totalPracticeTime}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold">Practice Time</div>
                </div>
                <div className={`p-4 rounded-xl text-center shadow-sm border transition ${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-purple-50/50 border-purple-100'}`}>
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{summaryStats.totalRuns}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold">Total Attempts</div>
                </div>
                <div className={`p-4 rounded-xl text-center shadow-sm border transition ${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-amber-50/50 border-amber-100'}`}>
                    <div className="text-3xl font-black text-amber-500 dark:text-amber-400">🔥 {summaryStats.streak}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold">Day Streak</div>
                </div>
            </div>

            {/* Chart Section */}
            <div className={`p-4 rounded-xl border mb-6 relative ${isDarkMode ? 'bg-gray-900 border-gray-750' : 'bg-gray-50 border-gray-150'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Accuracy Progress Chart</h3>
                {attempts.length < 2 ? (
                    <div className="h-[200px] flex items-center justify-center text-center p-6 text-sm text-gray-500 dark:text-gray-400">
                        🐢 Play at least two sessions to begin plotting your accuracy progression curve.
                    </div>
                ) : (
                    <div className="relative">
                        {/* Interactive Tooltip */}
                        {hoveredIndex !== null && tooltipData && (
                            <div className="absolute top-2 left-2 bg-gray-950/90 text-white text-xs p-2 rounded-lg shadow-xl border border-gray-800 pointer-events-none z-20 animate-in fade-in zoom-in-95 duration-150">
                                <div className="font-bold truncate max-w-[200px]">{tooltipData.name}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">{tooltipData.date}</div>
                                <div className="text-blue-400 font-extrabold mt-1 text-sm">{tooltipData.accuracy}% Accuracy</div>
                            </div>
                        )}

                        <svg className="w-full overflow-visible" height={chartHeight}>
                            <defs>
                                <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                                <linearGradient id="chartFillGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            {[0, 25, 50, 75, 100].map(val => {
                                const y = chartPadding + ((100 - val) / 100) * (chartHeight - chartPadding * 2);
                                return (
                                    <g key={val} className="opacity-20">
                                        <line x1={`${chartPadding}%`} y1={y} x2={`${100 - chartPadding}%`} y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
                                        <text x={`${chartPadding - 5}%`} y={y + 4} textAnchor="end" className="text-[9px] font-bold fill-current">{val}%</text>
                                    </g>
                                );
                            })}

                            {/* Chart Area Fill */}
                            <path d={fillPath} fill="url(#chartFillGrad)" />

                            {/* Chart Stroke Line */}
                            <path d={linePath} fill="none" stroke="url(#chartLineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Interactive Circle Dots */}
                            {chartPoints.map((p, i) => (
                                <circle
                                    key={i}
                                    cx={`${p.x}%`}
                                    cy={p.y}
                                    r={hoveredIndex === i ? 6 : 4}
                                    className="cursor-pointer transition-all duration-150 fill-white stroke-blue-500 dark:stroke-indigo-400 hover:fill-blue-500 dark:hover:fill-indigo-400"
                                    strokeWidth="3"
                                    onMouseEnter={(e) => handleMouseMove(e, i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                />
                            ))}
                        </svg>
                    </div>
                )}
            </div>

            {/* Note Breakdown Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Note breakdown left side list */}
                <div className="md:col-span-2">
                    <h3 className="text-sm font-black uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">Note Proficiency Breakdown</h3>
                    {sortedNotes.length === 0 ? (
                        <div className="text-center p-6 text-sm text-gray-500 dark:text-gray-400 border border-dashed rounded-xl">
                            No notes practiced yet in this session.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {sortedNotes.map(note => {
                                const hits = hitStats[note] || 0;
                                const errors = errorStats[note] || 0;
                                const noteTotal = hits + errors;
                                const noteAcc = noteTotal > 0 ? Math.round((hits / noteTotal) * 100) : 0;

                                let borderClass = "border-gray-150 dark:border-gray-750";
                                let textClass = "text-gray-500";
                                if (noteTotal > 0) {
                                    if (noteAcc >= 90) {
                                        borderClass = "border-emerald-500/20 bg-emerald-500/5";
                                        textClass = "text-emerald-500";
                                    } else if (noteAcc >= 70) {
                                        borderClass = "border-amber-500/20 bg-amber-500/5";
                                        textClass = "text-amber-500";
                                    } else {
                                        borderClass = "border-rose-500/20 bg-rose-500/5";
                                        textClass = "text-rose-500";
                                    }
                                }

                                return (
                                    <div key={note} className={`p-2 rounded-xl text-center text-xs border transition ${borderClass} ${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50/40'}`}>
                                        <div className="font-bold mb-0.5 text-gray-700 dark:text-gray-300">{note}</div>
                                        <div className={`font-black ${textClass}`}>{noteAcc}%</div>
                                        <div className="text-[9px] text-gray-400 font-semibold">{hits} / {noteTotal}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Session breakdown summary stats */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/30 border-gray-750' : 'bg-gray-50/30 border-gray-150'}`}>
                    <h3 className="text-sm font-black uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4">Current Session</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100 dark:border-gray-750">
                            <span className="opacity-60">Accuracy</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{sessionAccuracy}%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100 dark:border-gray-750">
                            <span className="opacity-60">Correct Notes</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalHits}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-2">
                            <span className="opacity-60">Missed Notes</span>
                            <span className="font-bold text-rose-500">{totalErrors}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
