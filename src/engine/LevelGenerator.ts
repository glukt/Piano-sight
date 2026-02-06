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

// Helper to get random element
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const LevelGenerator = {
    generate(difficulty: Difficulty, length: number = 4): LevelData {
        switch (difficulty) {
            case Difficulty.NOVICE:
                return this.generateNovice(length);
            case Difficulty.INTERMEDIATE:
                return this.generateIntermediate(length);
            case Difficulty.ADVANCED:
                return this.generateAdvanced(length);
            default:
                return this.generateNovice(length);
        }
    },

    generateNovice(length: number): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];

        for (let i = 0; i < length; i++) {
            // Treble: C4-G4 (5-finger position)
            const note = getRandom(["c", "d", "e", "f", "g"]);
            treble.push({ keys: [`${note}/4`], duration: "q" });

            // Bass: C3 (Constant anchor)
            bass.push({ keys: ["c/3"], duration: "q" });
        }
        return { treble, bass };
    },

    generateIntermediate(length: number): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];

        for (let i = 0; i < length; i++) {
            // Treble: C4-C5
            const tNote = getRandom(["c", "d", "e", "f", "g", "a", "b"]);
            const octave = Math.random() > 0.8 ? 5 : 4;
            treble.push({ keys: [`${tNote}/${octave}`], duration: "q" });

            // Bass: C3-G3
            const bNote = getRandom(["c", "d", "e", "f", "g"]);
            bass.push({ keys: [`${bNote}/3`], duration: "q" });
        }
        return { treble, bass };
    },

    generateAdvanced(length: number): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];

        for (let i = 0; i < length; i++) {
            // Randomly decide if Chord or Single Note
            const isChord = Math.random() > 0.5;

            if (isChord) {
                // Generate a simple triad within range
                const rootIdx = Math.floor(Math.random() * (RANGE_TREBLE.length - 4));
                const note1 = RANGE_TREBLE[rootIdx];
                const note2 = RANGE_TREBLE[rootIdx + 2]; // Third
                const note3 = RANGE_TREBLE[rootIdx + 4]; // Fifth
                treble.push({ keys: [note1, note2, note3], duration: "q" });
            } else {
                treble.push({ keys: [getRandom(RANGE_TREBLE)], duration: "q" });
            }

            // Bass: Active movement across 2 octaves
            bass.push({ keys: [getRandom(RANGE_BASS)], duration: "q" });
        }
        return { treble, bass };
    }
};
