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
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                📅 Daily Quests
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-normal">Resets at Midnight</span>
                            </h3>
                            <div className="grid gap-3">
                                {dailyChallenges.map(challenge => (
                                    <div key={challenge.id} className={`p-3 rounded-lg border flex items-center justify-between ${challenge.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                        <div>
                                            <div className="font-bold text-sm">{challenge.title}</div>
                                            <div className="text-xs text-gray-500">{challenge.description}</div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-xs font-bold mb-1">
                                                {challenge.current} / {challenge.target}
                                            </div>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${challenge.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` }}
                                                ></div>
                                            </div>
                                            {challenge.isCompleted && <span className="text-[10px] text-green-600 font-bold mt-1">COMPLETED (+{challenge.rewardXp} XP)</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements Section */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">🏆 Trophies</h3>
                            <div className="space-y-4">
                                {sortedAchievements.map(ach => {
                                    const state = achievementsState[ach.id];
                                    const isUnlocked = !!state?.unlockedAt;
                                    const progress = getProgress(ach);

                                    return (
                                        <div
                                            key={ach.id}
                                            className={`relative p-4 rounded-lg border-2 transition-all ${isUnlocked
                                                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600'
                                                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`text-4xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                                                    {ach.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className={`font-bold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {ach.title}
                                                        </h3>
                                                        {isUnlocked && (
                                                            <span className="text-xs font-medium px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full">
                                                                Unlocked!
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                        {ach.description}
                                                    </p>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${isUnlocked ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress.percent}%` }}
                                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end mt-1 text-xs text-gray-500 dark:text-gray-400">
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
