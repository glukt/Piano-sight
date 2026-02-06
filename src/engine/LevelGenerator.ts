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

const SCALE_C_MAJOR = ["c", "d", "e", "f", "g", "a", "b"];

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
            // Treble: Middle C (C4) to G4
            const note = getRandom(SCALE_C_MAJOR.slice(0, 5));
            treble.push({ keys: [`${note}/4`], duration: "q" });

            // Bass: Simple C3 drone or rest (using z for rest in VexFlow if needed, but lets stick to simple notes)
            // For Novice, maybe just C3
            bass.push({ keys: ["c/3"], duration: "q" });
        }
        return { treble, bass };
    },

    generateIntermediate(length: number): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];

        for (let i = 0; i < length; i++) {
            // Treble: Full Octave C4-C5
            const tNote = getRandom(SCALE_C_MAJOR);
            const octave = Math.random() > 0.8 ? 5 : 4;
            treble.push({ keys: [`${tNote}/${octave}`], duration: "q" });

            // Bass: C3-G3
            const bNote = getRandom(SCALE_C_MAJOR.slice(0, 5));
            bass.push({ keys: [`${bNote}/3`], duration: "q" });
        }
        return { treble, bass };
    },

    generateAdvanced(length: number): LevelData {
        const treble: StaveNoteData[] = [];
        const bass: StaveNoteData[] = [];

        for (let i = 0; i < length; i++) {
            // Treble: Chords (Triads)
            const root = getRandom(SCALE_C_MAJOR);
            // Simple logic for C Major chords (roughly)
            // e.g., C -> C E G
            // Note: This is very primitive chord gen
            treble.push({ keys: [`${root}/4`, `e/4`, `g/4`], duration: "q" });

            // Bass: Octaves
            const bassRoot = getRandom(SCALE_C_MAJOR);
            bass.push({ keys: [`${bassRoot}/2`, `${bassRoot}/3`], duration: "q" });
        }
        return { treble, bass };
    }
};
