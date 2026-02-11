import { StaveNoteData } from '../components/MusicDisplay';

export enum Difficulty {
    NOVICE = 'NOVICE',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

interface LevelData {
    treble: StaveNoteData[];
    bass: StaveNoteData[];
}

const RANGE_BASS = [
    "c/2", "d/2", "e/2", "f/2", "g/2", "a/2", "b/2",
    "c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3"
];

const RANGE_TREBLE = [
    "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4",
    "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "b/5",
    "c/6"
];

// Helper to get random element (Removed unused)

// Helper to get weighted random element based on error stats
const getWeightedRandom = (arr: string[], errorStats?: Record<string, number>): string => {
    if (!errorStats) return arr[Math.floor(Math.random() * arr.length)];

    const weights = arr.map(note => {
        // Parse key "c/4" -> "C4"
        const [n, o] = note.split('/');
        const key = `${n.toUpperCase()}${o}`;
        const errorCount = errorStats[key] || 0;
        // Base weight 1. Increase significantly with errors.
        return 1 + (errorCount * 10);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < arr.length; i++) {
        random -= weights[i];
        if (random < 0) return arr[i];
    }
    return arr[arr.length - 1];
};

export const LevelGenerator = {
    generate(difficulty: Difficulty, errorStats: Record<string, number> = {}, length: number = 8): LevelData {
        switch (difficulty) {
            case Difficulty.NOVICE:
                return this.generateNovice(length, errorStats);
            case Difficulty.INTERMEDIATE:
                return this.generateIntermediate(length, errorStats);
            case Difficulty.ADVANCED:
                return this.generateAdvanced(length, errorStats);
            default:
                return this.generateNovice(length, errorStats);
        }
    },

    generateNovice(length: number, errorStats: Record<string, number>): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];

        // Novice: Five-Finger Patterns within C Maj (C4-G4, F4-C5, G4-D5)
        // Randomly pick a "Position" for the level to keep it structured
        const positions = [
            ["c/4", "d/4", "e/4", "f/4", "g/4"], // C Pos
            ["f/4", "g/4", "a/4", "b/4", "c/5"], // F Pos
            ["g/4", "a/4", "b/4", "c/5", "d/5"]  // G Pos
        ];
        const selectedPos = positions[Math.floor(Math.random() * positions.length)];

        let lastNote = "";
        let repeatCount = 0;

        for (let i = 0; i < length; i++) {
            let note = getWeightedRandom(selectedPos, errorStats);

            // Prevent >2 repeats
            if (note === lastNote) {
                repeatCount++;
                if (repeatCount >= 2) {
                    while (note === lastNote) {
                        note = selectedPos[Math.floor(Math.random() * selectedPos.length)];
                    }
                    repeatCount = 0;
                }
            } else {
                repeatCount = 0;
            }
            lastNote = note;

            treble.push({ keys: [note], duration: "q" });

            // Simple Bass: Root of position (e.g. C3, F3, G3)
            const root = selectedPos[0].split('/')[0] + "/3";
            bass.push({ keys: [root], duration: "q" });
        }
        return { treble, bass };
    },

    generateIntermediate(length: number, errorStats: Record<string, number>): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];
        const range = RANGE_TREBLE.slice(0, 10); // C4-E5/F5

        let currentIndex = Math.floor(Math.random() * range.length);

        while (treble.length < length) {
            // 30% Chance for Scale Run (3-4 notes)
            if (treble.length <= length - 3 && Math.random() > 0.7) {
                const runLen = Math.floor(Math.random() * 2) + 3; // 3 or 4
                const direction = Math.random() > 0.5 ? 1 : -1;

                // Ensure bounds
                if (currentIndex + (runLen * direction) < 0) currentIndex = 0;
                if (currentIndex + (runLen * direction) >= range.length) currentIndex = range.length - runLen - 1;

                for (let j = 0; j < runLen; j++) {
                    currentIndex += direction;
                    if (currentIndex < 0) currentIndex = 0;
                    if (currentIndex >= range.length) currentIndex = range.length - 1;

                    treble.push({ keys: [range[currentIndex]], duration: "q" });

                    const bNote = getWeightedRandom(RANGE_BASS.slice(0, 7));
                    bass.push({ keys: [bNote], duration: "q" });
                }
            } else {
                // Determine Jump
                const jump = Math.floor(Math.random() * 4) + 1; // 1-4
                const direction = Math.random() > 0.5 ? 1 : -1;
                let nextIndex = currentIndex + (jump * direction);

                if (nextIndex < 0) nextIndex = 1;
                if (nextIndex >= range.length) nextIndex = range.length - 2;
                currentIndex = nextIndex;

                treble.push({ keys: [range[currentIndex]], duration: "q" });
                const bNote = getWeightedRandom(RANGE_BASS.slice(0, 7), errorStats);
                bass.push({ keys: [bNote], duration: "q" });
            }
        }
        return { treble, bass };
    },

    generateAdvanced(length: number, errorStats: Record<string, number>): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];

        while (treble.length < length) {
            const rand = Math.random();

            if (treble.length <= length - 3 && rand > 0.7) {
                // 30% Arpeggio (Root, 3rd, 5th)
                const rootIdx = Math.floor(Math.random() * (RANGE_TREBLE.length - 5));
                const arpNotes = [RANGE_TREBLE[rootIdx], RANGE_TREBLE[rootIdx + 2], RANGE_TREBLE[rootIdx + 4]];

                arpNotes.forEach(note => {
                    treble.push({ keys: [note], duration: "q" });
                    // Static bass for arp
                    bass.push({ keys: [RANGE_BASS[Math.floor(Math.random() * 7)]], duration: "q" });
                });

            } else if (treble.length <= length - 4 && rand > 0.45) {
                // 25% Scale Run (4 notes)
                let startIdx = Math.floor(Math.random() * (RANGE_TREBLE.length - 4));
                for (let k = 0; k < 4; k++) {
                    treble.push({ keys: [RANGE_TREBLE[startIdx + k]], duration: "q" });
                    bass.push({ keys: [RANGE_BASS[Math.floor(Math.random() * 7)]], duration: "q" });
                }
            } else {
                // Chord or Single weighted
                if (Math.random() > 0.5) {
                    const rootIdx = Math.floor(Math.random() * (RANGE_TREBLE.length - 4));
                    treble.push({ keys: [RANGE_TREBLE[rootIdx], RANGE_TREBLE[rootIdx + 2], RANGE_TREBLE[rootIdx + 4]], duration: "q" });
                } else {
                    treble.push({ keys: [getWeightedRandom(RANGE_TREBLE, errorStats)], duration: "q" });
                }
                bass.push({ keys: [getWeightedRandom(RANGE_BASS, errorStats)], duration: "q" });
            }
        }
        return { treble, bass };
    }
};
