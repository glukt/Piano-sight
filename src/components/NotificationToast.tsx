import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../hooks/useAchievements';
import { DailyChallenge } from '../hooks/useDailyChallenges';

interface NotificationToastProps {
    unlockedAchievements: Achievement[];
    completedChallenges: string[]; // IDs
    allChallenges: DailyChallenge[];
    levelUp: number | null;
    onClear: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
    unlockedAchievements,
    completedChallenges,
    allChallenges,
    levelUp,
    onClear
}) => {
    const [showLevelUpToast, setShowLevelUpToast] = useState(false);

    useEffect(() => {
        if (levelUp !== null) {
            setShowLevelUpToast(true);
            const timer = setTimeout(() => {
                setShowLevelUpToast(false);
            }, 4000); // 4 seconds display
            return () => clearTimeout(timer);
        } else {
            setShowLevelUpToast(false);
        }
    }, [levelUp]);

    useEffect(() => {
        if (unlockedAchievements.length > 0 || completedChallenges.length > 0) {
            const timer = setTimeout(() => {
                onClear();
            }, 4000); // 4 seconds display
            return () => clearTimeout(timer);
        }
    }, [unlockedAchievements, completedChallenges, onClear]);

    if (unlockedAchievements.length === 0 && completedChallenges.length === 0 && !showLevelUpToast) return null;

    return (
        <div className="fixed top-24 left-4 right-4 md:left-auto md:right-8 z-[60] flex flex-col items-center md:items-end gap-2 pointer-events-none">
            <AnimatePresence>
                {showLevelUpToast && levelUp !== null && (
                    <motion.div
                        key={`level-${levelUp}`}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 border-l-4 border-indigo-500 shadow-xl rounded-lg p-4 flex items-center gap-4 w-full max-w-sm md:w-80 pointer-events-auto"
                    >
                        <div className="text-3xl">🎉</div>
                        <div>
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Level Up!</div>
                            <div className="font-bold text-gray-900 dark:text-white">Reached Level {levelUp}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Keep up the great work!</div>
                        </div>
                    </motion.div>
                )}

                {unlockedAchievements.map(ach => (
                    <motion.div
                        key={`ach-${ach.id}`}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 border-l-4 border-yellow-500 shadow-xl rounded-lg p-4 flex items-center gap-4 w-full max-w-sm md:w-80 pointer-events-auto"
                    >
                        <div className="text-3xl">{ach.icon}</div>
                        <div>
                            <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Achievement Unlocked</div>
                            <div className="font-bold text-gray-900 dark:text-white">{ach.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{ach.description}</div>
                        </div>
                    </motion.div>
                ))}

                {completedChallenges.map(id => {
                    const challenge = allChallenges.find(c => c.id === id);
                    if (!challenge) return null;
                    return (
                        <motion.div
                            key={`daily-${id}`}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 shadow-xl rounded-lg p-4 flex items-center gap-4 w-full max-w-sm md:w-80 pointer-events-auto"
                        >
                            <div className="text-3xl">📅</div>
                            <div>
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Daily Quest Complete</div>
                                <div className="font-bold text-gray-900 dark:text-white">{challenge.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">+{challenge.rewardXp} XP</div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
