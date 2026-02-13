import { useState, useEffect, useCallback } from 'react';

export interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    type: 'notes' | 'perfect' | 'sections' | 'xp';
    rewardXp: number;
    isCompleted: boolean;
}

const STORAGE_KEY_CHALLENGES = 'pianopilot_daily_challenges';
const STORAGE_KEY_LAST_LOGIN = 'pianopilot_last_login';

const CHALLENGE_TEMPLATES = [
    { id: 'notes_100', title: 'Warm Up', description: 'Play 100 notes', target: 100, type: 'notes', rewardXp: 20 },
    { id: 'notes_500', title: 'Dedicated', description: 'Play 500 notes', target: 500, type: 'notes', rewardXp: 50 },
    { id: 'perfect_10', title: 'Precision', description: 'Get 10 Perfect hits', target: 10, type: 'perfect', rewardXp: 30 },
    { id: 'perfect_50', title: 'Maestro', description: 'Get 50 Perfect hits', target: 50, type: 'perfect', rewardXp: 100 },
    { id: 'sections_3', title: 'Progress', description: 'Complete 3 sections', target: 3, type: 'sections', rewardXp: 40 },
    { id: 'xp_100', title: 'Learner', description: 'Gain 100 XP', target: 100, type: 'xp', rewardXp: 25 },
] as const;

export function useDailyChallenges() {
    const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
    const [newCompleted, setNewCompleted] = useState<string[]>([]); // IDs of newly completed challenges

    // Load or Generate Challenges
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY_CHALLENGES);
        const lastLogin = localStorage.getItem(STORAGE_KEY_LAST_LOGIN);
        const today = new Date().toDateString();

        if (lastLogin !== today || !stored) {
            // New Day or First Load -> Generate New Challenges
            const newChallenges = generateDailyChallenges();
            setChallenges(newChallenges);
            localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(newChallenges));
            localStorage.setItem(STORAGE_KEY_LAST_LOGIN, today);
        } else {
            // Same Day -> Load existing
            setChallenges(JSON.parse(stored));
        }
    }, []);

    // Persist on change
    useEffect(() => {
        if (challenges.length > 0) {
            localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(challenges));
        }
    }, [challenges]);

    const generateDailyChallenges = (): DailyChallenge[] => {
        // Randomly select 3 unique templates
        const shuffled = [...CHALLENGE_TEMPLATES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        return selected.map(t => ({
            ...t,
            current: 0,
            isCompleted: false
        }));
    };

    const updateChallengeProgress = useCallback((type: DailyChallenge['type'], amount: number = 1) => {
        setChallenges(prev => {
            let hasChange = false;
            const next = prev.map(ch => {
                if (ch.isCompleted || ch.type !== type) return ch;

                const newCurrent = Math.min(ch.current + amount, ch.target);
                if (newCurrent !== ch.current) {
                    hasChange = true;
                    // Check completion
                    if (newCurrent >= ch.target) {
                        setNewCompleted(c => [...c, ch.id]);
                        return { ...ch, current: newCurrent, isCompleted: true };
                    }
                    return { ...ch, current: newCurrent };
                }
                return ch;
            });
            return hasChange ? next : prev;
        });
    }, []);



    const clearNewCompleted = useCallback(() => {
        setNewCompleted([]);
    }, []);

    return {
        challenges,
        updateChallengeProgress,
        newCompleted,
        clearNewCompleted
    };
}
