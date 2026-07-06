import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceReportCardProps {
    isOpen: boolean;
    onClose: () => void;
    onRetry: () => void;
    onNext?: () => void;
    onLoopPractice?: (weakMeasures: number[]) => void;
    songTitle: string;
    notesCorrect: number;
    notesMissed: number;
    errorMeasures: Record<number, number>;
    totalMeasures: number;
    isDarkMode: boolean;
    passed?: boolean;
    requiredAccuracy?: number;
    isCapstone?: boolean;
}

export const PerformanceReportCard: React.FC<PerformanceReportCardProps> = ({
    isOpen,
    onClose,
    onRetry,
    onNext,
    onLoopPractice,
    songTitle,
    notesCorrect,
    notesMissed,
    errorMeasures,
    totalMeasures,
    isDarkMode,
    passed,
    requiredAccuracy = 80,
    isCapstone = false
}) => {
    const hasPassed = passed !== undefined ? passed : true;

    // 1. Piano key strikes do NOT progress the card (prevents accidental skips while playing trailing notes)

    // 2. Listen for computer keyboard shortcuts (Enter/Space) to progress
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (onNext && hasPassed) {
                    onNext();
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onNext, hasPassed, onClose]);

    if (!isOpen) return null;

    const totalNotes = notesCorrect + notesMissed;
    const accuracy = totalNotes > 0 ? Math.round((notesCorrect / totalNotes) * 100) : 100;

    // Determine Grade
    let grade = 'F';
    let gradeColor = 'text-red-500';
    if (accuracy === 100) {
        grade = 'S';
        gradeColor = 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
    } else if (accuracy >= 90) {
        grade = 'A';
        gradeColor = 'text-green-500';
    } else if (accuracy >= 80) {
        grade = 'B';
        gradeColor = 'text-blue-500';
    } else if (accuracy >= 70) {
        grade = 'C';
        gradeColor = 'text-orange-500';
    }

    if (!hasPassed) {
        gradeColor = 'text-rose-500';
    }

    const xpEarned = notesCorrect * 2 + (accuracy >= 90 ? 100 : 20); // XP breakdown

    // Generate array of measure indices [1 ... totalMeasures]
    const measuresArray = Array.from({ length: totalMeasures || 8 }, (_, i) => i + 1);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`rounded-2xl shadow-2xl w-full max-w-xl p-8 border text-center relative overflow-hidden transition-colors duration-300 ${
                        isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-100 text-gray-900'
                    }`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Confetti background for high scores */}
                    {accuracy >= 90 && (
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/20 via-transparent to-transparent z-0"></div>
                    )}

                    <h2 className="text-3xl font-extrabold tracking-tight mb-2 z-10 relative">
                        {hasPassed 
                            ? (isCapstone ? '🏆 Capstone Mastered!' : '🎉 Lesson Completed!')
                            : (isCapstone ? '❌ Capstone Failed' : '💪 Keep Practicing!')
                        }
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-6 uppercase tracking-wider z-10 relative">
                        {songTitle}
                    </p>

                    {/* Grade & Score Circle */}
                    <div className="flex justify-center mb-6 relative z-10">
                        <div className={`w-36 h-36 rounded-full border-4 flex flex-col justify-center items-center relative ${
                            !hasPassed
                                ? 'border-rose-500/60 bg-rose-500/5'
                                : accuracy >= 90 
                                    ? 'border-yellow-400/60 bg-yellow-500/5' 
                                    : 'border-blue-500/40 bg-blue-500/5'
                        }`}>
                            <span className={`text-6xl font-black ${gradeColor}`}>
                                {grade}
                            </span>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                                {accuracy}% Accuracy
                            </span>
                            {passed !== undefined && (
                                <span className={`text-[10px] font-black mt-1.5 px-2 py-0.5 rounded-full ${
                                    hasPassed
                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                                        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20'
                                }`}>
                                    {hasPassed ? 'Mastered!' : `Min: ${requiredAccuracy}%`}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Breakdown Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6 z-10 relative">
                        <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Notes Played</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white mt-1">{notesCorrect}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Missed</div>
                            <div className="text-xl font-bold text-rose-500 mt-1">{notesMissed}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">XP Gained</div>
                            <div className="text-xl font-bold text-emerald-500 mt-1">+{xpEarned} XP</div>
                        </div>
                    </div>

                    {/* Mistakes Heatmap */}
                    <div className="mb-8 z-10 relative text-left">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 select-none">
                            📍 Measure Error Heatmap
                        </h4>
                        
                        <div className="grid grid-cols-8 gap-2.5 max-h-40 overflow-y-auto pr-1">
                            {measuresArray.map(measureNum => {
                                const mistakes = errorMeasures[measureNum] || 0;
                                
                                // Color code based on error density
                                let colorClass = 'bg-emerald-500 hover:bg-emerald-400';
                                if (mistakes >= 3) {
                                    colorClass = 'bg-rose-500 hover:bg-rose-400';
                                } else if (mistakes > 0) {
                                    colorClass = 'bg-yellow-500 hover:bg-yellow-400';
                                }

                                return (
                                    <div
                                        key={measureNum}
                                        className={`h-9 rounded-lg flex items-center justify-center text-[11px] font-black text-white cursor-help transition-all transform hover:scale-105 active:scale-95 ${colorClass}`}
                                        title={`Measure ${measureNum}: ${mistakes} mistake(s)`}
                                    >
                                        M{measureNum}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 z-10 relative">
                        {onLoopPractice && Object.keys(errorMeasures).length > 0 && (
                            <button
                                onClick={() => {
                                    const weakMeasures = Object.keys(errorMeasures).map(Number);
                                    onLoopPractice(weakMeasures);
                                }}
                                className="flex-grow flex-shrink py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700 transition active:scale-98"
                            >
                                ⚡ Loop Weak Measures ({Object.keys(errorMeasures).length})
                            </button>
                        )}
                        <button
                            onClick={onRetry}
                            className="flex-grow flex-shrink py-3 px-4 rounded-xl font-bold text-sm bg-gray-200 dark:bg-gray-750 text-gray-800 dark:text-gray-250 hover:bg-gray-300 dark:hover:bg-gray-650 transition active:scale-98 animate-none"
                        >
                            🔄 Practice Whole Lesson
                        </button>
                        {onNext && hasPassed && (
                            <button
                                onClick={onNext}
                                className="flex-grow flex-shrink py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition active:scale-98"
                            >
                                🎓 Next Lesson →
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-grow flex-shrink py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-indigo-650 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 transition active:scale-98"
                        >
                            {onNext ? 'Course Menu' : 'Return to Library'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
