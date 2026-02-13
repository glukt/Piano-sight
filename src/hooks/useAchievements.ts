import { useState, useEffect, useCallback } from 'react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Emoji for now
    condition: {
        statId: string;
        target: number;
    };
}

export interface AchievementState {
    unlockedAt: string | null; // ISO Date or null
    isNew: boolean; // For notification popup
}

export interface UserStats {
    [statId: string]: number;
}

const ACHIEVEMENTS_DEF: Achievement[] = [
    {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Play your first 10 notes.',
        icon: '🎵',
        condition: { statId: 'totalNotes', target: 10 }
    },
    {
        id: 'dedicated',
        title: 'Dedicated',
        description: 'Play 1,000 notes.',
        icon: '🎹',
        condition: { statId: 'totalNotes', target: 1000 }
    },
    {
        id: 'virtuoso_training',
        title: 'Virtuoso Training',
        description: 'Play 10,000 notes.',
        icon: '🔥',
        condition: { statId: 'totalNotes', target: 10000 }
    },
    {
        id: 'session_master',
        title: 'Practice Routine',
        description: 'Complete 5 Practice Sessions.',
        icon: '⏱️',
        condition: { statId: 'sessionsCompleted', target: 5 }
    },
    {
        id: 'perfect_pitch',
        title: 'Sharpshooter',
        description: 'Get 50 Perfect/Green ratings.',
        icon: '🎯',
        condition: { statId: 'perfectNotes', target: 50 }
    },
    {
        id: 'level_5',
        title: 'Rising Star',
        description: 'Reach Level 5.',
        icon: '⭐',
        condition: { statId: 'level', target: 5 }
    }
];

const STORAGE_KEY_STATS = 'pianopilot_stats';
const STORAGE_KEY_ACHIEVEMENTS = 'pianopilot_achievements';

export function useAchievements() {
    const [stats, setStats] = useState<UserStats>({});
    const [achievementsState, setAchievementsState] = useState<Record<string, AchievementState>>({});
    const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

    // Load initial state safely
    useEffect(() => {
        try {
            const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
            if (savedStats) setStats(JSON.parse(savedStats));

            const savedAch = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
            if (savedAch) setAchievementsState(JSON.parse(savedAch));
        } catch (e) {
            console.error("Failed to load achievements", e);
        }
    }, []);

    // Persist Stats
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    }, [stats]);

    // Persist Achievements
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievementsState));
    }, [achievementsState]);

    const incrementStat = useCallback((statId: string, amount: number = 1) => {
        setStats(prev => ({
            ...prev,
            [statId]: (prev[statId] || 0) + amount
        }));
    }, []);

    // Check for Unlocks
    useEffect(() => {
        setAchievementsState(prevState => {
            const nextState = { ...prevState };
            const justUnlocked: Achievement[] = [];
            let localChanged = false;

            ACHIEVEMENTS_DEF.forEach(ach => {
                const currentVal = stats[ach.condition.statId] || 0;
                const isUnlocked = nextState[ach.id]?.unlockedAt != null;

                if (!isUnlocked && currentVal >= ach.condition.target) {
                    nextState[ach.id] = {
                        unlockedAt: new Date().toISOString(),
                        isNew: true
                    };
                    justUnlocked.push(ach);
                    localChanged = true;
                }
            });

            if (localChanged) {
                setNewUnlocks(prev => {
                    // Filter out any that are already in 'prev' to avoid duplicates
                    const existingIds = new Set(prev.map(a => a.id));
                    const uniqueNew = justUnlocked.filter(a => !existingIds.has(a.id));
                    if (uniqueNew.length === 0) return prev;
                    return [...prev, ...uniqueNew];
                });
                return nextState;
            }
            return prevState;
        });

    }, [stats]);

    const clearNewUnlocks = useCallback(() => {
        setNewUnlocks([]);
    }, []);

    const getProgress = (ach: Achievement) => {
        const current = stats[ach.condition.statId] || 0;
        return {
            current,
            target: ach.condition.target,
            percent: Math.min(100, Math.floor((current / ach.condition.target) * 100))
        };
    };

    return {
        achievements: ACHIEVEMENTS_DEF,
        achievementsState,
        stats,
        newUnlocks,
        incrementStat,
        clearNewUnlocks,
        getProgress
    };
}
