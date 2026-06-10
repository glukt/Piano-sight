import React, { useMemo } from 'react';
import { Achievement, AchievementState } from '../hooks/useAchievements';
import { DailyChallenge } from '../hooks/useDailyChallenges';
import { motion, AnimatePresence } from 'framer-motion';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: Achievement[];
    achievementsState: Record<string, AchievementState>;
    getProgress: (ach: Achievement) => { current: number; target: number; percent: number; };
    dailyChallenges: DailyChallenge[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
    isOpen,
    onClose,
    achievements,
    achievementsState,
    getProgress,
    dailyChallenges
}) => {
    // Sort: Unlocked first, then by progress
    const sortedAchievements = useMemo(() => {
        return [...achievements].sort((a, b) => {
            const stateA = achievementsState[a.id];
            const stateB = achievementsState[b.id];
            const unlockedA = !!stateA?.unlockedAt;
            const unlockedB = !!stateB?.unlockedAt;

            // Prioritize unlocked achievements
            if (unlockedA && !unlockedB) return -1;
            if (!unlockedA && unlockedB) return 1;

            if (unlockedA && unlockedB) {
                // Both unlocked, sort by recency (newest first)
                return new Date(stateB.unlockedAt!).getTime() - new Date(stateA.unlockedAt!).getTime();
            }

            // Both locked, sort by progress % (Highest % first)
            const progA = getProgress(a).percent;
            const progB = getProgress(b).percent;
            return progB - progA;
        });
    }, [achievements, achievementsState, getProgress]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            🏆 Achievements
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            ✕
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Daily Challenges Section */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                📅 Daily Quests
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-normal border border-blue-200 dark:border-blue-800/40">Resets at Midnight</span>
                            </h3>
                            <div className="grid gap-3">
                                {dailyChallenges.map(challenge => (
                                    <div key={challenge.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 hover:shadow-sm ${challenge.isCompleted ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800/50 text-green-900 dark:text-green-200' : 'bg-gray-50 border-gray-100 dark:bg-gray-800/40 dark:border-gray-750 text-gray-800 dark:text-gray-100'}`}>
                                        <div className="flex-1 pr-4">
                                            <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                <span>{challenge.title}</span>
                                                {challenge.isCompleted && <span className="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-bold">Done</span>}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{challenge.description}</div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <div className="text-xs font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                                                {challenge.current} / {challenge.target}
                                            </div>
                                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${challenge.isCompleted ? 'bg-green-500 dark:bg-green-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                                    style={{ width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` }}
                                                ></div>
                                            </div>
                                            {challenge.isCompleted && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1.5">+{challenge.rewardXp} XP</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements Section */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">🏆 Trophies</h3>
                            <div className="space-y-4">
                                {sortedAchievements.map(ach => {
                                    const state = achievementsState[ach.id];
                                    const isUnlocked = !!state?.unlockedAt;
                                    const progress = getProgress(ach);

                                    return (
                                        <div
                                            key={ach.id}
                                            className={`relative p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${isUnlocked
                                                    ? 'border-yellow-400/80 bg-yellow-50/40 dark:bg-yellow-950/10 dark:border-yellow-600/50'
                                                    : 'border-gray-250 bg-gray-50/30 dark:border-gray-700/60 dark:bg-gray-800/30'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`text-4xl filter transition-all duration-300 select-none ${isUnlocked ? 'drop-shadow-md' : 'grayscale opacity-40'}`}>
                                                    {ach.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className={`font-bold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {ach.title}
                                                        </h3>
                                                        {isUnlocked && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-400 text-yellow-950 rounded-full shadow-sm">
                                                                Unlocked!
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                        {ach.description}
                                                    </p>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner">
                                                        <motion.div
                                                            className={`h-full rounded-full ${isUnlocked ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress.percent}%` }}
                                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                        {isUnlocked ? 'Completed' : `${progress.current} / ${progress.target} (${progress.percent}%)`}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
