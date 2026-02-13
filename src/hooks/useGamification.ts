import { useState, useEffect, useCallback } from 'react';

const XP_PER_LEVEL_BASE = 100;

export interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastPlayedDate: string | null; // ISO Date string
    totalNotesHit: number;
}

const DEFAULT_STATE: GamificationState = {
    xp: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: null,
    totalNotesHit: 0
};

export function useGamification() {
    const [state, setState] = useState<GamificationState>(() => {
        const saved = localStorage.getItem('piano_gamification');
        return saved ? JSON.parse(saved) : DEFAULT_STATE;
    });

    const [levelUp, setLevelUp] = useState<number | null>(null); // Level if just leveled up, else null

    useEffect(() => {
        localStorage.setItem('piano_gamification', JSON.stringify(state));
    }, [state]);

    const calculateLevel = (xp: number) => {
        // Simple quadratic curve: Level = sqrt(XP / 100)
        return Math.floor(Math.sqrt(xp / XP_PER_LEVEL_BASE)) + 1;
    };

    const addXp = useCallback((amount: number) => {
        setState(prev => {
            const newXp = prev.xp + amount;
            const newLevel = calculateLevel(newXp);
            const levelDiff = newLevel - prev.level;

            if (levelDiff > 0) {
                setLevelUp(newLevel);
                // Play level up sound? (handled by UI)
            }

            // Update Streak logic
            const today = new Date().toISOString().split('T')[0];
            let newStreak = prev.streak;

            if (prev.lastPlayedDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (prev.lastPlayedDate === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Reset or Start
                }
            }

            return {
                ...prev,
                xp: newXp,
                level: newLevel,
                streak: newStreak,
                lastPlayedDate: today,
                totalNotesHit: prev.totalNotesHit + 1 // Assuming 1 note per XP check roughly, or explicit
            };
        });
    }, []);

    const clearLevelUp = () => setLevelUp(null);

    return {
        state,
        addXp,
        levelUp,
        clearLevelUp
    };
}
