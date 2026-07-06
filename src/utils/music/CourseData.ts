export type LessonTopic = 'treble' | 'bass' | 'both' | 'chords';
export type LessonType = 'exercise' | 'song';

export interface LessonConstraints {
    trebleRange: string[]; // Allowed notes e.g., ['c/4', 'd/4', 'e/4']
    bassRange: string[];   // Allowed notes e.g., ['c/3', 'g/3']
    rhythms: string[];     // Allowed rhythm durations e.g., ['q', 'h', 'w', '8']
    maxJumps: number;      // Maximum interval jump allowed (1 = steps only, 2 = skips, etc)
    chordsAllowed: boolean;// Whether to generate chords or single notes
    numNotes: number;      // How long the generated level should be
    presetMelody?: {
        treble: { keys: string[]; duration: string; tied?: boolean }[];
        bass: { keys: string[]; duration: string; tied?: boolean }[];
    };
    keySignature?: string;  // e.g., "G", "F"
    timeSignature?: string; // e.g., "3/4", "6/8"
}

export interface Lesson {
    id: string;
    courseId: string;
    name: string;          // e.g., "Middle C & D"
    description: string;   // Short summary for the card
    focus: string;         // e.g., "Focus on keeping your wrist elevated."
    instruction: string;   // e.g., "Place your thumb on Middle C..."
    type: LessonType;
    topic: LessonTopic;
    constraints?: LessonConstraints; // Used if type === 'exercise'
    songUrl?: string;                // Used if type === 'song' (path to .mxl)
    presetId?: string;               // Links to corresponding preset ID in useMusicLibrary.ts
    xpReward: number;
    requiredXp: number; // XP required to unlock this lesson
    handPosition?: string;           // Hand position key for visual keyboard guide
    bpm?: number;                    // Target BPM for playback
    prerequisites?: string[];        // Custom prerequisite lesson IDs
    chords?: string[];               // Custom chord names for chord guide display
}

export interface Course {
    id: string;
    name: string;          // e.g., "Piano Basics 1"
    description: string;
    lessons: Lesson[];
    order: number;
}


// --- Curriculum Data ---

// Common Note Sets
const middleC = ["c/4"];
const trebleStepsD_E = ["c/4", "d/4", "e/4"];
const bassGuideF = ["e/3", "f/3", "g/3"];
const trebleHighC = ["c/5", "d/5", "e/5"];
const bassLowC = ["c/3", "d/3", "e/3"];

const cPosTreble = ["c/4", "d/4", "e/4", "f/4", "g/4"];
const upperTreble = ["f/4", "g/4", "a/4", "b/4", "c/5"];
const fullTreble = ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"];

const cPosBass = ["c/3", "d/3", "e/3", "f/3", "g/3"];
const fullBass = ["f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4"];

// Accidentals & key signatures
const trebleSharps = ["c/4", "d/4", "e/4", "f#/4", "g/4", "a/4", "b/4", "c#/5"];
const trebleFlats = ["c/4", "d/4", "eb/4", "f/4", "g/4", "a/4", "bb/4", "c/5"];
const gMajorTreble = ["g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f#/5", "g/5"];

export const courses: Course[] = [
    {
        id: "keyboard-geography",
        name: "1. Keyboard Geography & Guide Notes",
        description: "Begin your journey by orienting yourself on the keyboard and learning the primary guide notes on the staff.",
        order: 1,
        lessons: [
            {
                id: 'c1-l1', bpm: 80, courseId: "keyboard-geography",
                name: "Introduction to Middle C",
                description: "Locate Middle C using the pattern of two black keys.",
                focus: "Find Middle C in the center of your keyboard. It is directly to the left of the group of two black keys.",
                instruction: "Sit comfortably, and place your Right Hand Thumb (Finger 1) on Middle C. Play the notes as they appear on the screen.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 0,
                handPosition: 'RH_MIDDLE_C',
                constraints: { trebleRange: middleC, bassRange: [], rhythms: ["q", "h"], maxJumps: 0, chordsAllowed: false, numNotes: 10 }
            },
            {
                id: 'c1-l2', bpm: 80, courseId: "keyboard-geography",
                name: "Steps Above Middle C",
                description: "Play Middle C, D, and E in step-wise patterns.",
                focus: "Keep your knuckles elevated and your fingers naturally curved, as if holding a small ball.",
                instruction: "With your thumb on Middle C, place your index finger on D and middle finger on E. Play the steps as they ascend and descend.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 80,
                handPosition: 'RH_C_3FINGER',
                constraints: { trebleRange: trebleStepsD_E, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c1-l2-song', bpm: 90, courseId: "keyboard-geography",
                name: "Melody: Mary Had a Little Lamb",
                description: "Play your first simple melody using notes C, D, and E.",
                focus: "Follow the rising and falling steps of the tune. Keep a steady pace.",
                instruction: "Place your Right Hand fingers in C Position. Follow the notes to play this classic nursery rhyme.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 160,
                handPosition: 'RH_C_3FINGER',
                constraints: {
                    trebleRange: trebleStepsD_E, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 26,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q", tied: true }, { keys: ["e/4"], duration: "h" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "w" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c1-l3', bpm: 80, courseId: "keyboard-geography",
                name: "Treble Guide Note G",
                description: "Introduce the G4 landmark note on the second line of the treble staff.",
                focus: "The Treble Clef curl wraps around G4. Focus on identifying it instantly.",
                instruction: "Place your Right Hand Pinky (Finger 5) on G4. Practice playing steps surrounding this landmark note.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 240,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c1-l3-song', bpm: 90, courseId: "keyboard-geography",
                name: "Melody: Ode to Joy Theme",
                description: "Play Beethoven's famous melody using all 5 notes in C Position.",
                focus: "Try to read ahead so you can play each note smoothly without pausing.",
                instruction: "Keep your hand in C Position. Play this simple and beautiful classical theme.",
                type: 'exercise', topic: 'treble', xpReward: 120, requiredXp: 320,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: cPosTreble, bassRange: [], rhythms: ["8", "q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 62,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q." }, { keys: ["d/4"], duration: "8" }, { keys: ["d/4"], duration: "h" },

                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q." }, { keys: ["c/4"], duration: "8" }, { keys: ["c/4"], duration: "h" },

                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["c/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "8" }, { keys: ["f/4"], duration: "8" }, { keys: ["e/4"], duration: "q" }, { keys: ["c/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "8" }, { keys: ["f/4"], duration: "8" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },

                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q." }, { keys: ["c/4"], duration: "8" }, { keys: ["c/4"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c1-l4', bpm: 80, courseId: "keyboard-geography",
                name: "Bass Guide Note F",
                description: "Learn F3, the key landmark of the bass clef.",
                focus: "The Bass Clef's two dots surround F3. Press the keys using your left hand index finger.",
                instruction: "Place your Left Hand Index Finger (Finger 2) on F3. Play the step-wise notes centered around it.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 440,
                handPosition: 'LH_BASS_F_3FINGER',
                constraints: { trebleRange: [], bassRange: bassGuideF, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c1-l4-song', bpm: 90, courseId: "keyboard-geography",
                name: "Melody: Aura Lea (Love Me Tender)",
                description: "Play a classic left-hand melody centered around Bass F3.",
                focus: "Let your left arm feel heavy and relaxed. Play with a steady beat.",
                instruction: "Place your Left Hand fingers in the Bass F anchor. Play the opening theme of Aura Lea.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 520,
                handPosition: 'LH_BASS_F_3FINGER',
                constraints: {
                    trebleRange: [], bassRange: bassGuideF, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 25,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "h" },
                            { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f/3"], duration: "h" }, { keys: ["f/3"], duration: "h" },
                            { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "h" },
                            { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f/3"], duration: "w" }
                        ]
                    }
                }
            },
            {
                id: 'c1-l5', bpm: 80, courseId: "keyboard-geography",
                name: "Landmark High C (C5)",
                description: "Read High C on the third space of the treble staff.",
                focus: "High C (C5) is an octave above Middle C. Keep your wrist flexible and relaxed.",
                instruction: "Place your Right Hand Thumb (Finger 1) on High C (C5). Practice playing the notes stepping up from this landmark.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 600,
                handPosition: 'RH_HIGH_C_POS',
                constraints: { trebleRange: trebleHighC, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c1-l5b', bpm: 80, courseId: "keyboard-geography",
                name: "Landmark Treble High G (G5)",
                description: "Locate and play Treble High G, the top line of the treble staff.",
                focus: "Treble High G (G5) lies on the very top line of the treble staff. Use your Right Hand Pinky (Finger 5) to play this note.",
                instruction: "Place your Right Hand Pinky on High G (G5). Practice playing notes stepping down from this landmark.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 680,
                handPosition: 'RH_HIGH_G_POS',
                constraints: { trebleRange: ["e/5", "f/5", "g/5"], bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c1-l5b-song-birthday', bpm: 80, courseId: "keyboard-geography",
                name: "Melody: Happy Birthday Hook",
                description: "Play the famous celebratory melody to practice the High C landmark note.",
                focus: "Read the leap up to High C (C5) and High D (D5) smoothly in triple meter.",
                instruction: "Place your Right Hand in C Position. Start with your thumb on G4 and stretch up for the high notes.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 760,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["g/4", "a/4", "b/4", "c/5", "d/5"], bassRange: [], rhythms: ["8", "q", "h", "h."], maxJumps: 5, chordsAllowed: false, numNotes: 14,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["g/4"], duration: "hr" }, { keys: ["g/4"], duration: "8" }, { keys: ["g/4"], duration: "8" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["c/5"], duration: "q" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["g/4"], duration: "8" }, { keys: ["g/4"], duration: "8" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["d/5"], duration: "q" },
                            { keys: ["c/5"], duration: "h." }
                        ],
                        bass: []
                    }
                }
            },

            {
                id: 'c1-l6', bpm: 80, courseId: "keyboard-geography",
                name: "Landmark Bass C (C3)",
                description: "Read Low C on the second space of the bass staff.",
                focus: "Bass C (C3) is an octave below Middle C. Use your Left Hand Pinky (Finger 5) to play it.",
                instruction: "Place your Left Hand Pinky (Finger 5) on Bass C (C3). Practice playing notes stepping up from this landmark.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 840,
                handPosition: 'LH_LOW_C_POS',
                constraints: { trebleRange: [], bassRange: bassLowC, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c1-l6b', bpm: 80, courseId: "keyboard-geography",
                name: "Landmark Bass Low F (F2)",
                description: "Learn Low F, the lowest line of the bass staff.",
                focus: "Bass Low F (F2) is the bottom line of the bass staff. Play it with your Left Hand Pinky (Finger 5).",
                instruction: "Place your Left Hand Pinky on Bass Low F (F2). Practice playing stepwise notes ascending from Low F.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 920,
                handPosition: 'LH_LOW_F_POS',
                constraints: { trebleRange: [], bassRange: ["f/2", "g/2", "a/2"], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c1-l6c', bpm: 80, courseId: "keyboard-geography",
                name: "Landmark Note Speedrun",
                description: "Test your instant recognition of all five primary guide notes.",
                focus: "Do not look at your hands! Identify Bass C3, Bass F3, Middle C4, Treble G4, and Treble C5 instantly.",
                instruction: "Play the guide notes as they appear. The notes will jump directly between landmarks, so focus on reading the lines and spaces.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 1000,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "g/4", "c/5"], bassRange: ["c/3", "f/3", "c/4"], rhythms: ["q", "h"], maxJumps: 5, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c1-l7', bpm: 80, courseId: "keyboard-geography",
                name: "Landmark Guide Notes Challenge",
                description: "Test your skills with a gentle stepwise capstone combining both hands in Middle C position.",
                focus: "Keep your hands anchored. Share the Middle C key or take turns playing it between hands.",
                instruction: "Play stepwise notes alternating between your left hand (A3-C4) and right hand (C4-E4). Focus on seamless transitions.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 1080,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4"], bassRange: ["c/4", "b/3", "a/3"], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 12 }
            }
        ]
    },
    {
        id: "treble-clef-mastery",
        name: "2. Right Hand Treble Clef Steps & Skips",
        description: "Master reading notes in the treble clef. Move from basic steps to wide skips and leaps.",
        order: 2,
        lessons: [
            {
                id: 'c2-l1', bpm: 80, courseId: "treble-clef-mastery",
                name: "Treble C Position Steps",
                description: "Read stepwise intervals (seconds) in Treble C Position (C4 to G4).",
                focus: "Read adjacent lines and spaces. Play smoothly without lifting your hands between notes.",
                instruction: "Place your right hand fingers on C4, D4, E4, F4, and G4. Play notes that step up and down.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 1280,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c2-l1-song-popular', bpm: 90, courseId: 'treble-clef-mastery',
                name: "Melody: Baby Shark Theme",
                description: "Play the famous catchy hook using simple steps and repeated notes.",
                focus: "Keep a steady pulse on the repeated E4 notes, making sure each tap is distinct and light.",
                instruction: "Place your Right Hand in C Position. This melody uses only C4, D4, and E4, focusing on repeated note coordination.",
                type: 'exercise', topic: 'treble', xpReward: 120, requiredXp: 1360,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4"], bassRange: [], rhythms: ["8", "q", "h", "w"], maxJumps: 1, chordsAllowed: false, numNotes: 48,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: 'q' }, { keys: ["d/4"], duration: 'q' }, { keys: ["e/4"], duration: 'h' },
                            { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: 'q' },
                            { keys: ["c/4"], duration: 'q' }, { keys: ["d/4"], duration: 'q' }, { keys: ["e/4"], duration: 'h' },
                            { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: 'q' },
                            { keys: ["c/4"], duration: 'q' }, { keys: ["d/4"], duration: 'q' }, { keys: ["e/4"], duration: 'h' },
                            { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["e/4"], duration: 'q' },
                            { keys: ["e/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["d/4"], duration: 'h' },
                            { keys: ["c/4"], duration: 'w' }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c2-l2', bpm: 80, courseId: "treble-clef-mastery",
                name: "Melody: Lightly Row",
                description: "Play a classic step-and-skip melody in Right Hand C Position.",
                focus: "Recognize thirds (skips). Skip over fingers smoothly without pausing.",
                instruction: "Keep your hand in C Position. Follow the steps and skips of Lightly Row.",
                type: 'exercise', topic: 'treble', xpReward: 120, requiredXp: 1480,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 52,
                    presetMelody: {
                        treble: [
                            { keys: ["g/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },

                            { keys: ["g/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["c/4"], duration: "h." }, { keys: ["c/4"], duration: "qr" },

                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },

                            { keys: ["g/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["c/4"], duration: "h." }, { keys: ["c/4"], duration: "qr" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c2-l2b', bpm: 80, courseId: "treble-clef-mastery",
                name: "Jumping Fourths in Treble",
                description: "Identify and play the interval of a fourth (line to space or space to line).",
                focus: "A fourth skips two adjacent notes (e.g. C to F, or D to G). Visually, it always goes from a line to a space, or a space to a line.",
                instruction: "Play the stepwise melodies combined with leaps of a fourth. Keep your hand relaxed as you skip fingers.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 1600,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 3, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c2-l3', bpm: 80, courseId: "treble-clef-mastery",
                name: "Melody: Twinkle Twinkle",
                description: "Play a beautiful melody featuring 5th leaps.",
                focus: "Leap directly from Middle C to G4. Do not tense your hand.",
                instruction: "Keep your hand in C Position. Play the opening of Twinkle Twinkle.",
                type: 'exercise', topic: 'treble', xpReward: 120, requiredXp: 1680,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 42,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "h" },

                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },

                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c2-l3b', bpm: 80, courseId: "treble-clef-mastery",
                name: "Jumping Fifths in Treble",
                description: "Master the wide interval of a fifth (line to line or space to space).",
                focus: "A fifth skips three notes (e.g. C to G, or D to A). It always goes from line to line, or space to space. Your thumb and pinky will play these notes.",
                instruction: "Play the fifth-interval jumps. Stretch your hand to feel the outer borders of the C Position.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 1800,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c2-l4', bpm: 80, courseId: "treble-clef-mastery",
                name: "Song: Mary Had a Little Lamb",
                description: "Play your first real song, using the C position.",
                focus: "Count the beats out loud. Pay special attention to the half notes holding for two beats.",
                instruction: "Apply your C position reading to play this traditional tune with your right hand.",
                type: 'song', topic: 'treble', xpReward: 120, requiredXp: 1880,
                handPosition: 'RH_C_POS',
                songUrl: '/scores/Mary_Lamb.musicxml',
                presetId: 'preset-mary-lamb'
            },
            {
                id: 'c2-l5', bpm: 80, courseId: "treble-clef-mastery",
                name: "Melody: Jingle Bells Chorus",
                description: "Play Jingle Bells in the upper treble register (up to C5).",
                focus: "Play repeated notes with a steady, bouncy touch.",
                instruction: "Prepare your hand in C Position. Follow the rhythm to play Jingle Bells.",
                type: 'exercise', topic: 'treble', xpReward: 120, requiredXp: 2000,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: upperTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 3, chordsAllowed: false, numNotes: 49,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["e/4"], duration: "w" },

                            { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "h" }, { keys: ["g/4"], duration: "h" },

                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["e/4"], duration: "w" },

                            { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "w" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c2-l5-song-popular', bpm: 76, courseId: 'treble-clef-mastery',
                name: "Melody: Yesterday (The Beatles)",
                description: "Play the famous opening melody of Yesterday, focusing on steps in the upper register.",
                focus: "Read the stepwise ascent into the upper register smoothly up to High C (C5).",
                instruction: "Place your Right Hand in C Position. You will need to stretch or transition your hand to play the stepwise line up to High C.",
                type: 'exercise', topic: 'treble', xpReward: 120, requiredXp: 2120,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"], bassRange: [], rhythms: ["8", "q", "h", "w"], maxJumps: 2, chordsAllowed: false, numNotes: 39,
                    presetMelody: {
                        treble: [
                            { keys: ["d/4"], duration: '8' }, { keys: ["c/4"], duration: '8' }, { keys: ["c/4"], duration: 'h' }, { keys: ["qr"], duration: 'q' },
                            { keys: ["8r"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["f/4"], duration: '8' }, { keys: ["g/4"], duration: '8' }, { keys: ["a/4"], duration: '8' }, { keys: ["b/4"], duration: '8' }, { keys: ["c/5"], duration: '8' }, { keys: ["b/4"], duration: '8' },
                            { keys: ["a/4"], duration: 'h' }, { keys: ["8r"], duration: '8' }, { keys: ["a/4"], duration: '8' }, { keys: ["a/4"], duration: '8' }, { keys: ["g/4"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }, { keys: ["b/4"], duration: '8' }, { keys: ["a/4"], duration: '8' }, { keys: ["g/4"], duration: '8' }, { keys: ["f/4"], duration: '8' }, { keys: ["a/4"], duration: '8' }, { keys: ["g/4"], duration: 'q' }, { keys: ["qr"], duration: 'q' },
                            { keys: ["f/4"], duration: 'w' },
                            { keys: ["g/4"], duration: '8' }, { keys: ["f/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["d/4"], duration: '8' }, { keys: ["c/4"], duration: 'h' },
                            { keys: ["e/4"], duration: 'q' }, { keys: ["g/4"], duration: 'q' }, { keys: ["a/4"], duration: 'h' },
                            { keys: ["f/4"], duration: 'q' }, { keys: ["a/4"], duration: 'q' }, { keys: ["g/4"], duration: '8' }, { keys: ["f/4"], duration: '8' }, { keys: ["e/4"], duration: '8' }, { keys: ["d/4"], duration: '8' },
                            { keys: ["c/4"], duration: 'h' }, { keys: ["d/4"], duration: 'h' },
                            { keys: ["c/4"], duration: 'w' }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c2-l5b', bpm: 80, courseId: "treble-clef-mastery",
                name: "Ledger Lines: B3 & A3 in Treble",
                description: "Read notes that sit below the treble staff on ledger lines.",
                focus: "B3 sits right below the first ledger line (Middle C). A3 sits directly on the first ledger line below Middle C. Practice reading these lower tones in the Right Hand.",
                instruction: "Shift your Right Hand down slightly or stretch your thumb to reach B3 and A3. Read carefully below the staff lines.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 2240,
                handPosition: 'RH_LOWER_C_POS',
                constraints: { trebleRange: ["a/3", "b/3", "c/4", "d/4", "e/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c2-l6', bpm: 80, courseId: "treble-clef-mastery",
                name: "Treble Clef Capstone",
                description: "Synthesize steps, skips, and leaps across the full treble range.",
                focus: "Read the entire treble clef from C4 to C5. Look ahead to prepare for intervals.",
                instruction: "Play this longer, generative exercise that combines all treble notes and rhythms you've learned.",
                type: 'exercise', topic: 'treble', xpReward: 200, requiredXp: 2320,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: fullTreble, bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 3, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: 'c2-l7', bpm: 80, courseId: "treble-clef-mastery",
                name: "Song: Ode to Joy",
                description: "Play Beethoven's classic masterpiece with your right hand.",
                focus: "Maintain a steady pulse. Notice the stepwise motion followed by skips.",
                instruction: "Combine your treble reading skills to play this beautiful Beethoven melody.",
                type: 'song', topic: 'treble', xpReward: 200, requiredXp: 2520,
                handPosition: 'RH_C_POS',
                songUrl: '/scores/Ode_to_Joy.musicxml',
                presetId: 'preset-ode-to-joy'
            }
        ]
    },
    {
        id: "bass-clef-mastery",
        name: "3. Left Hand Bass Clef Steps & Skips",
        description: "Master reading notes in the bass clef. Train your left hand to play steps, skips, and low registers.",
        order: 3,
        lessons: [
            {
                id: 'c3-l1', bpm: 80, courseId: "bass-clef-mastery",
                name: "Bass C Position Steps",
                description: "Read stepwise intervals (seconds) in Left Hand C Position (C3 to G3).",
                focus: "Ensure your left hand fingers mirror the shape of your right hand. Play with even key weight.",
                instruction: "Place your Left Hand Pinky on C3, up to thumb on G3. Play the steps on the bass staff.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 2720,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c3-l2', bpm: 80, courseId: "bass-clef-mastery",
                name: "Melody: Lightly Row (LH)",
                description: "Play Lightly Row in the bass clef using Left Hand C Position.",
                focus: "Keep your Left Hand relaxed. Feel the skipped thirds in the bass clef.",
                instruction: "Place your Left Hand in Bass C position. Play the complete Lightly Row melody.",
                type: 'exercise', topic: 'bass', xpReward: 120, requiredXp: 2800,
                handPosition: 'LH_C_POS',
                constraints: {
                    trebleRange: [], bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 52,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["g/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "h" },
                            { keys: ["f/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "h" },
                            { keys: ["c/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["f/3"], duration: "q" },
                            { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "h" },

                            { keys: ["g/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "h" },
                            { keys: ["f/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "h" },
                            { keys: ["c/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" },
                            { keys: ["c/3"], duration: "h." }, { keys: ["c/3"], duration: "qr" },

                            { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "q" },
                            { keys: ["d/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["f/3"], duration: "h" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "h" },

                            { keys: ["g/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "h" },
                            { keys: ["f/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "h" },
                            { keys: ["c/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" },
                            { keys: ["c/3"], duration: "h." }, { keys: ["c/3"], duration: "qr" }
                        ]
                    }
                }
            },
            {
                id: 'c3-l3', bpm: 80, courseId: "bass-clef-mastery",
                name: "Melody: London Bridge (LH)",
                description: "Read left hand leaps in the bass clef.",
                focus: "Play leaps cleanly. Lift your fingers only slightly to transition.",
                instruction: "Place your Left Hand in Bass C position. Play the tune of London Bridge.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 2920,
                handPosition: 'LH_C_POS',
                constraints: {
                    trebleRange: [], bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 24,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["g/3"], duration: "q" }, { keys: ["a/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "h" },
                            { keys: ["d/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["f/3"], duration: "h" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "h" },

                            { keys: ["g/3"], duration: "q" }, { keys: ["a/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "h" },
                            { keys: ["d/3"], duration: "h" }, { keys: ["g/3"], duration: "h" },
                            { keys: ["e/3"], duration: "h" }, { keys: ["c/3"], duration: "h" }
                        ]
                    }
                }
            },
            {
                id: 'c3-l3b', bpm: 80, courseId: "bass-clef-mastery",
                name: "Fourths and Fifths in Bass",
                description: "Practice jumping leaps of 4ths and 5ths in your left hand.",
                focus: "Identify lines to lines (fifths) and lines to spaces (fourths) in the bass staff. Keep your wrist flexible to absorb the leaps.",
                instruction: "Play the leaps as they appear. Focus on maintaining a steady weight in your Left Hand thumb and pinky.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 3000,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: ["c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c3-l3-song-popular', bpm: 120, courseId: 'bass-clef-mastery',
                name: "Melody: Seven Nation Army Bassline",
                description: "Play the world-famous rock riff in the bass clef.",
                focus: "Master skips and leaps on the bass clef. Feel the steady driving rhythm.",
                instruction: "Place your Left Hand in Bass C position. Move your fingers down to play B2 on the second line.",
                type: 'exercise', topic: 'bass', xpReward: 120, requiredXp: 3080,
                handPosition: 'LH_LOW_C_POS',
                constraints: {
                    trebleRange: [], bassRange: ["b/2", "c/3", "d/3", "e/3", "g/3"], rhythms: ["8", "q", "h", "w"], maxJumps: 3, chordsAllowed: false, numNotes: 34,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["e/3"], duration: 'q.' }, { keys: ["e/3"], duration: '8' }, { keys: ["g/3"], duration: 'q' }, { keys: ["e/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' }, { keys: ["c/3"], duration: 'h' },
                            { keys: ["b/2"], duration: 'w' },
                            
                            { keys: ["e/3"], duration: 'q.' }, { keys: ["e/3"], duration: '8' }, { keys: ["g/3"], duration: 'q' }, { keys: ["e/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' }, { keys: ["c/3"], duration: 'h' },
                            { keys: ["b/2"], duration: 'w' },
                            
                            { keys: ["e/3"], duration: 'q.' }, { keys: ["e/3"], duration: '8' }, { keys: ["g/3"], duration: 'q' }, { keys: ["e/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'q.' }, { keys: ["d/3"], duration: '8' }, { keys: ["c/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["c/3"], duration: 'q' }, { keys: ["b/2"], duration: 'h.' }
                        ]
                    }
                }
            },
            {
                id: 'c3-l4', bpm: 80, courseId: "bass-clef-mastery",
                name: "Song: Good King Wenceslas",
                description: "Play a classic holiday tune using your left hand.",
                focus: "Let the bass notes ring out strongly. Keep a solid, heavy pulse with your arm.",
                instruction: "Use your left hand alone to play this famous melody down on the bass clef.",
                type: 'song', topic: 'bass', xpReward: 150, requiredXp: 3200,
                handPosition: 'LH_C_POS',
                songUrl: '/scores/Good_King_Wenceslas.musicxml',
                presetId: 'preset-good-king-wenceslas'
            },
            {
                id: 'c3-l5', bpm: 80, courseId: "bass-clef-mastery",
                name: "Melody: Old MacDonald (LH)",
                description: "Explore the lower register of the bass clef down to C3.",
                focus: "Coordinate low guide notes C3 and G2.",
                instruction: "Shift your Left Hand to the Low C Position. Play the lower bass melody of Old MacDonald.",
                type: 'exercise', topic: 'bass', xpReward: 100, requiredXp: 3350,
                handPosition: 'LH_LOW_C_POS',
                constraints: {
                    trebleRange: [], bassRange: bassLowC, rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 31,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["c/3"], duration: "q" }, { keys: ["c/3"], duration: "q" }, { keys: ["c/3"], duration: "q" }, { keys: ["g/2"], duration: "q" },
                            { keys: ["a/2"], duration: "q" }, { keys: ["a/2"], duration: "q" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "q" },
                            { keys: ["c/3"], duration: "h" }, { keys: ["c/3"], duration: "h" },

                            { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["c/3"], duration: "q" }, { keys: ["c/3"], duration: "q" },
                            { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["c/3"], duration: "h" },
                            { keys: ["c/3"], duration: "q" }, { keys: ["c/3"], duration: "q" }, { keys: ["c/3"], duration: "q" }, { keys: ["g/2"], duration: "q" },
                            { keys: ["a/2"], duration: "q" }, { keys: ["a/2"], duration: "q" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["e/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["d/3"], duration: "q" },
                            { keys: ["c/3"], duration: "w" }
                        ]
                    }
                }
            },
            {
                id: 'c3-l5-song-popular', bpm: 125, courseId: 'bass-clef-mastery',
                name: "Melody: Bad Guy Bassline",
                description: "Play Billie Eilish's dark, groovy minor bassline in the bass clef.",
                focus: "Maintain a solid, steady pulse while navigating the minor third leaps.",
                instruction: "Position your Left Hand to reach G2 on the bottom line. Follow the rhythm carefully.",
                type: 'exercise', topic: 'bass', xpReward: 120, requiredXp: 3450,
                handPosition: 'LH_LOW_C_POS',
                constraints: {
                    trebleRange: [], bassRange: ["g/2", "a/2", "c/3", "d/3", "e/3", "f/3"], rhythms: ["q", "h", "w"], maxJumps: 3, chordsAllowed: false, numNotes: 63,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' },
                            { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' }, { keys: ["c/3"], duration: 'q' }, { keys: ["a/2"], duration: 'q' },
                            { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["f/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'q' },
                            { keys: ["a/2"], duration: 'w' },
                            
                            { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' },
                            { keys: ["a/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' }, { keys: ["c/3"], duration: 'q' }, { keys: ["a/2"], duration: 'q' },
                            { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["f/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'q' },
                            { keys: ["a/2"], duration: 'w' },
                            
                            { keys: ["g/2"], duration: 'q' }, { keys: ["g/2"], duration: 'q' }, { keys: ["g/2"], duration: 'q' }, { keys: ["g/2"], duration: 'q' },
                            { keys: ["g/2"], duration: 'q' }, { keys: ["g/2"], duration: 'q' }, { keys: ["c/3"], duration: 'q' }, { keys: ["g/2"], duration: 'q' },
                            { keys: ["g/2"], duration: 'q' }, { keys: ["g/2"], duration: 'q' }, { keys: ["a/2"], duration: 'q' }, { keys: ["c/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["f/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'q' },
                            { keys: ["a/2"], duration: 'w' }
                        ]
                    }
                }
            },
            {
                id: 'c3-l5-song-stand-by-me', bpm: 110, courseId: 'bass-clef-mastery',
                name: 'Melody: Stand By Me Bassline',
                description: 'Play the iconic, soul-stirring bassline of Ben E. King\'s classic.',
                focus: 'Focus on the root movement of the chords. Keep a steady, relaxed pulse in your left arm.',
                instruction: 'Place your Left Hand in Low C Position. You will step down to A2 and F2, then rise back up to G2 and C3.',
                type: 'exercise', topic: 'bass', xpReward: 100, requiredXp: 3570,
                handPosition: 'LH_LOW_C_POS',
                constraints: {
                    trebleRange: [], bassRange: ["f/2", "g/2", "a/2", "c/3", "d/3", "e/3"], rhythms: ["8", "q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 34,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["c/3"], duration: "h." }, { keys: ["c/3"], duration: "8" }, { keys: ["d/3"], duration: "8" },
                            { keys: ["e/3"], duration: "q." }, { keys: ["d/3"], duration: "8" }, { keys: ["c/3"], duration: "q" }, { keys: ["b/2"], duration: "q" },
                            { keys: ["a/2"], duration: "h." }, { keys: ["a/2"], duration: "8" }, { keys: ["b/2"], duration: "8" },
                            { keys: ["c/3"], duration: "q." }, { keys: ["a/2"], duration: "8" }, { keys: ["f/2"], duration: "h" },
                            { keys: ["f/2"], duration: "q." }, { keys: ["f/2"], duration: "8" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["c/3"], duration: "w" },

                            { keys: ["c/3"], duration: "h." }, { keys: ["c/3"], duration: "8" }, { keys: ["d/3"], duration: "8" },
                            { keys: ["e/3"], duration: "q." }, { keys: ["d/3"], duration: "8" }, { keys: ["c/3"], duration: "q" }, { keys: ["b/2"], duration: "q" },
                            { keys: ["a/2"], duration: "h." }, { keys: ["a/2"], duration: "8" }, { keys: ["b/2"], duration: "8" },
                            { keys: ["c/3"], duration: "q." }, { keys: ["a/2"], duration: "8" }, { keys: ["f/2"], duration: "h" },
                            { keys: ["f/2"], duration: "q." }, { keys: ["f/2"], duration: "8" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["c/3"], duration: "w" }
                        ]
                    }
                }
            },
            {
                id: 'c3-l6-song-vader', bpm: 100, courseId: "bass-clef-mastery",
                name: "Melody: Imperial March Bassline",
                description: "Play the driving dark theme from Star Wars in the bass clef.",
                focus: "Practice low bass leaps between G2, Eb2, and Bb2.",
                instruction: "Place your Left Hand in Low G position. Maintain a steady, marching pulse.",
                type: 'exercise', topic: 'bass', xpReward: 100, requiredXp: 3670,
                handPosition: 'LH_G_POS',
                constraints: {
                    trebleRange: [], bassRange: ["g/2", "bb/2", "eb/2"], rhythms: ["8", "q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 18,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["eb/2"], duration: "8" }, { keys: ["bb/2"], duration: "8" },
                            { keys: ["g/2"], duration: "q" }, { keys: ["eb/2"], duration: "8" }, { keys: ["bb/2"], duration: "8" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["eb/2"], duration: "8" }, { keys: ["bb/2"], duration: "8" },
                            { keys: ["g/2"], duration: "q" }, { keys: ["eb/2"], duration: "8" }, { keys: ["bb/2"], duration: "8" }, { keys: ["g/2"], duration: "h" }
                        ]
                    }
                }
            },
            {
                id: 'c3-l5b', bpm: 80, courseId: "bass-clef-mastery",
                name: "Ledger Lines: Middle C & D4 in Bass",
                description: "Read notes sitting above the bass staff using ledger lines.",
                focus: "Middle C (C4) sits on the ledger line above the bass staff. D4 sits above that ledger line. Train your Left Hand to read these high notes.",
                instruction: "Position your Left Hand thumb to reach up to Middle C and D4. Read these ledger line notes in the bass clef.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 3770,
                handPosition: 'LH_HIGH_C_POS',
                constraints: { trebleRange: [], bassRange: ["g/3", "a/3", "b/3", "c/4", "d/4"], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c3-l6', bpm: 80, courseId: "bass-clef-mastery",
                name: "Bass Clef Capstone",
                description: "Read across the entire bass clef from Low F (F2) to Middle C (C4).",
                focus: "Synthesize all left hand intervals and notes. Look ahead to prepare for shifts.",
                instruction: "A long, comprehensive generative exercise testing your reading across the whole bass staff.",
                type: 'exercise', topic: 'bass', xpReward: 200, requiredXp: 3850,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: fullBass, rhythms: ["q", "h", "w"], maxJumps: 3, chordsAllowed: false, numNotes: 32 }
            }
        ]
    },
    {
        id: "grand-staff-coordination",
        name: "4. Grand Staff Coordination",
        description: "Coordinate both hands together on the grand staff. Play hand trade-offs and simple harmonies.",
        order: 4,
        lessons: [
            {
                id: 'c4-l1', bpm: 80, courseId: "grand-staff-coordination",
                name: "Clef Trade-offs",
                description: "Alternate playing between your right and left hands.",
                focus: "Look at the clefs. Keep your non-playing hand resting gently on the keys, ready for its turn.",
                instruction: "You will see the melody bounce between the treble clef (Right Hand) and bass clef (Left Hand). Trade off smoothly.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 4050,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c4-l4', bpm: 80, courseId: "grand-staff-coordination",
                name: "Contrary Motion",
                description: "Play notes that move in opposite directions in each hand.",
                focus: "Contrary motion is anatomically symmetrical, using the same fingers (e.g. both thumbs, both index fingers) at the same time. This is easier for your brain than parallel motion!",
                instruction: "Play notes moving in opposite directions (e.g. hands moving outwards). Tap into the symmetrical finger movement.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 4130,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q"], maxJumps: 1, chordsAllowed: true, numNotes: 20 }
            },
            {
                id: 'c4-l1-song-popular', bpm: 95, courseId: 'grand-staff-coordination',
                name: 'Melody: Let It Go Chorus (Frozen)',
                description: 'Play the iconic Frozen chorus, coordinating both hands together.',
                focus: 'Align the left-hand whole notes with the first beat of the right-hand melody in each measure.',
                instruction: 'Your left hand plays solid bass notes while the right hand plays the iconic ascending and descending melody.',
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 4210,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: ["f/2", "g/2", "a/2", "c/3"], rhythms: ["q", "h", "w"], maxJumps: 3, chordsAllowed: false, numNotes: 44,
                    presetMelody: {
                        treble: [
                            { keys: ["g/4"], duration: 'h' },
                            { keys: ["g/4"], duration: 'h' },
                            { keys: ["d/4"], duration: 'h' },
                            { keys: ["d/4"], duration: 'h' },
                            { keys: ["e/4"], duration: 'q' },
                            { keys: ["e/4"], duration: 'q' },
                            { keys: ["d/4"], duration: 'q' },
                            { keys: ["c/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'h' },
                            { keys: ["e/4"], duration: 'q' },
                            { keys: ["d/4"], duration: 'q' },
                            { keys: ["g/4"], duration: 'h' },
                            { keys: ["g/4"], duration: 'h' },
                            { keys: ["d/4"], duration: 'h' },
                            { keys: ["d/4"], duration: 'h' },
                            { keys: ["e/4"], duration: 'q' },
                            { keys: ["e/4"], duration: 'q' },
                            { keys: ["d/4"], duration: 'q' },
                            { keys: ["c/4"], duration: 'q' },
                            { keys: ["g/4"], duration: 'h' },
                            { keys: ["g/4"], duration: 'h' },
                            { keys: ["c/4"], duration: 'q' },
                            { keys: ["c/4"], duration: 'q' },
                            { keys: ["d/4"], duration: 'q' },
                            { keys: ["e/4"], duration: 'q' },
                            { keys: ["d/4"], duration: 'h' },
                            { keys: ["c/4"], duration: 'h' },
                            { keys: ["c/4"], duration: 'q' },
                            { keys: ["d/4"], duration: 'q' },
                            { keys: ["e/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'q' },
                            { keys: ["g/4"], duration: 'w' }
                        ],
                        bass: [
                            { keys: ["c/3"], duration: 'w' },
                            { keys: ["g/2"], duration: 'w' },
                            { keys: ["a/2"], duration: 'w' },
                            { keys: ["f/2"], duration: 'w' },
                            { keys: ["c/3"], duration: 'w' },
                            { keys: ["g/2"], duration: 'w' },
                            { keys: ["a/2"], duration: 'w' },
                            { keys: ["f/2"], duration: 'w' },
                            { keys: ["c/3"], duration: 'w' },
                            { keys: ["g/2"], duration: 'w' },
                            { keys: ["a/2"], duration: 'w' },
                            { keys: ["f/2"], duration: 'w' }
                        ]
                    }
                }
            },
            {
                id: 'c4-l2', bpm: 80, courseId: "grand-staff-coordination",
                name: "Duet: Heart and Soul",
                description: "Play the iconic pop duet combining right-hand melody and left-hand root chord drones.",
                focus: "Play chords exactly together. Align the first beat of each measure.",
                instruction: "RH plays the C position melody. LH plays drone root chords C, A, F, G. Play them together.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 4330,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: true, numNotes: 40,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "h" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["b/3"], duration: "q" }, { keys: ["a/3"], duration: "q" }, { keys: ["b/3"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["b/4"], duration: "h" },
                            { keys: ["b/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["c/5"], duration: "w" }
                        ],
                        bass: [
                            { keys: ["c/3"], duration: "w" },
                            { keys: ["a/2"], duration: "w" },
                            { keys: ["f/2"], duration: "w" },
                            { keys: ["g/2"], duration: "w" },
                            { keys: ["c/3"], duration: "w" },
                            { keys: ["a/2"], duration: "w" },
                            { keys: ["f/2"], duration: "w" },
                            { keys: ["g/2"], duration: "w" },
                            { keys: ["c/3"], duration: "w" }
                        ]
                    }
                }
            },
            {
                id: 'c4-l2b', bpm: 80, courseId: "grand-staff-coordination",
                name: "Melody and Countermelody",
                description: "Coordinate independent stepping movements in both hands at the same time.",
                focus: "Your Left Hand will play slow stepping notes (half notes) while your Right Hand plays faster steps (quarters). Keep your hands relaxed and listen to the alignment.",
                instruction: "Play both hands together. Concentrate on the slower, steady countermelody in your left hand.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 4450,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: ["c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c4-l2c', bpm: 80, courseId: "grand-staff-coordination",
                name: "Sharing Middle C",
                description: "Navigate both hands playing in the same central register.",
                focus: "Middle C (C4) is shared by both treble and bass clefs. Watch which hand is designated to play it by looking at the stem direction or clef.",
                instruction: "Play Middle C with your Right Hand thumb when in the treble staff, and with your Left Hand thumb when in the bass staff.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 4530,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4"], bassRange: ["a/3", "b/3", "c/4"], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c4-l3', bpm: 80, courseId: "grand-staff-coordination",
                name: "Song: Au Clair de la Lune",
                description: "Practice hand coordination with a simple French folk melody.",
                focus: "Hold the left-hand half notes and whole notes while the right-hand melody steps forward.",
                instruction: "Play this beautiful melody using both hands. The left hand provides harmonic support.",
                type: 'song', topic: 'both', xpReward: 150, requiredXp: 4610,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Au_Clair_De_La_Lune.musicxml',
                presetId: 'preset-au-clair-de-la-lune'
            },

            {
                id: 'c4-l5', bpm: 80, courseId: "grand-staff-coordination",
                name: "Parallel Motion",
                description: "Play the same notes in both hands an octave apart.",
                focus: "Parallel motion is asymmetrical (e.g. RH Finger 1 plays with LH Finger 5). Align your movements carefully by sound.",
                instruction: "Play steps in both hands moving in the same direction. Lock your fingers together on the beat.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 4760,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q"], maxJumps: 1, chordsAllowed: true, numNotes: 20 }
            },
            {
                id: 'c4-l5b', bpm: 80, courseId: "grand-staff-coordination",
                name: "Alternating Bass Accompaniment",
                description: "Play a rocking left-hand bass pattern against a right-hand melody.",
                focus: "LH plays alternating fifths (C3 then G3) in a rocking pattern. RH plays a simple melody. This builds independence of touch.",
                instruction: "Maintain a steady rocking motion in your left hand. Do not let it speed up or slow down when the right hand plays.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 4840,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: ["c/3", "g/3"], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c4-l6', bpm: 80, courseId: "grand-staff-coordination",
                name: "Song: Jingle Bells",
                description: "Master hand independence with the chorus of Jingle Bells.",
                focus: "Listen to the melody's rhythm against the long, steady whole notes in the left hand.",
                instruction: "Use both hands together to play this festive song. Keep the beat steady and strong.",
                type: 'song', topic: 'both', xpReward: 200, requiredXp: 4920,
                songUrl: '/scores/Jingle_Bells.musicxml',
                presetId: 'preset-jingle-bells'
            },
            {
                id: 'c4-l7', bpm: 80, courseId: "grand-staff-coordination",
                name: "Triads: C Major Chord",
                description: "Form and play a solid three-note C Major triad (C, E, G).",
                focus: "Ensure all three notes (C4, E4, G4) sound exactly at the same time. Press with even weight.",
                instruction: "Place your Right Hand in C Position. Use fingers 1, 3, and 5 to play C, E, and G together.",
                type: 'exercise', topic: 'chords', xpReward: 80, requiredXp: 5120,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "e/4", "g/4"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 0,
                    chordsAllowed: true,
                    numNotes: 10
                }
            },
            {
                id: 'c4-l8', bpm: 80, courseId: "grand-staff-coordination",
                name: "Chord Changes (C to G7)",
                description: "Practice transitioning between C Major (C-E-G) and G7 (B-F-G) triads.",
                focus: "Keep your hand relaxed. Shift fingers smoothly to change chord shapes.",
                instruction: "RH plays C triad (1-3-5) then shifts to G7 triad (1-4-5 on B-F-G). Transition slowly.",
                type: 'exercise', topic: 'chords', xpReward: 80, requiredXp: 5200,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["b/3", "c/4", "d/4", "e/4", "f/4", "g/4"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 2,
                    chordsAllowed: true,
                    numNotes: 12
                }
            },
            {
                id: 'c4-l9', bpm: 90, courseId: "grand-staff-coordination",
                name: "Melody: Lean On Me Chords",
                description: "Play the chord progression of the classic song Lean On Me using parallel triads.",
                focus: "Maintain a steady tempo while moving the triad shape stepwise up and down.",
                instruction: "Move your 1-3-5 triad shape stepwise: C Major, D minor, E minor, F Major, and back.",
                type: 'song', topic: 'chords', xpReward: 80, requiredXp: 5280,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"],
                    bassRange: [],
                    rhythms: ["q", "h"],
                    maxJumps: 2,
                    chordsAllowed: true,
                    numNotes: 16,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4", "e/4", "g/4"], duration: "q" },
                            { keys: ["d/4", "f/4", "a/4"], duration: "q" },
                            { keys: ["e/4", "g/4", "b/4"], duration: "q" },
                            { keys: ["f/4", "a/4", "c/5"], duration: "q" },

                            { keys: ["f/4", "a/4", "c/5"], duration: "q" },
                            { keys: ["e/4", "g/4", "b/4"], duration: "q" },
                            { keys: ["d/4", "f/4", "a/4"], duration: "q" },
                            { keys: ["c/4", "e/4", "g/4"], duration: "q" },

                            { keys: ["c/4", "e/4", "g/4"], duration: "q" },
                            { keys: ["d/4", "f/4", "a/4"], duration: "q" },
                            { keys: ["e/4", "g/4", "b/4"], duration: "h" },

                            { keys: ["d/4", "f/4", "a/4"], duration: "h" },
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            }
        ]
    },
    {
        id: "rhythm-mastery",
        name: "5. Rhythmic Mastery & Time Signatures",
        description: "Introduce faster eighth notes, waltz meter (3/4 time), and syncopated dotted rhythms.",
        order: 5,
        lessons: [
            {
                id: 'c5-l1', bpm: 80, courseId: "rhythm-mastery",
                name: "Melody: Yankee Doodle",
                description: "Practice brisk eighth notes in 4/4 time.",
                focus: "Count the eighth notes evenly. Feel the division of the beat.",
                instruction: "Keep your hand in C position. Play the eighth note runs of Yankee Doodle.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 5360,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "8"], maxJumps: 1, chordsAllowed: false, numNotes: 27,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: "8" }, { keys: ["c/4"], duration: "8" }, { keys: ["d/4"], duration: "8" }, { keys: ["e/4"], duration: "8" },
                            { keys: ["c/4"], duration: "8" }, { keys: ["e/4"], duration: "8" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "8" }, { keys: ["c/4"], duration: "8" }, { keys: ["d/4"], duration: "8" }, { keys: ["e/4"], duration: "8" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["b/3"], duration: "q" },
 
                            { keys: ["c/4"], duration: "8" }, { keys: ["c/4"], duration: "8" }, { keys: ["d/4"], duration: "8" }, { keys: ["e/4"], duration: "8" },
                            { keys: ["f/4"], duration: "8" }, { keys: ["e/4"], duration: "8" }, { keys: ["d/4"], duration: "8" }, { keys: ["c/4"], duration: "8" },
                            { keys: ["b/3"], duration: "8" }, { keys: ["c/4"], duration: "8" }, { keys: ["d/4"], duration: "8" }, { keys: ["b/3"], duration: "8" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c5-l2', bpm: 80, courseId: "rhythm-mastery",
                name: "Melody: Amazing Grace",
                description: "Learn 3/4 waltz time using dotted half notes.",
                focus: "Count in 3. Play the pickup note on beat three before the first full measure.",
                instruction: "Place your Right Hand in C Position. Stretch Finger 5 up to reach A4 and B4, and play the dotted half notes.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 5440,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["d/4", "e/4", "g/4", "a/4", "b/4", "d/5"], bassRange: [], rhythms: ["q", "h", "h.", "qr", "hr"], maxJumps: 4, chordsAllowed: false, numNotes: 25,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["d/4"], duration: "hr" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["g/4"], duration: "h" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["g/4"], duration: "h" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "h" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["g/4"], duration: "h" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["d/5"], duration: "h" }, { keys: ["d/5"], duration: "q" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["d/5"], duration: "q" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "h" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "h" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["g/4"], duration: "h" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["g/4"], duration: "h." },
                            { keys: ["g/4"], duration: "h" }, { keys: ["g/4"], duration: "qr" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c5-l2-song-blue-danube',
                bpm: 90,
                courseId: 'rhythm-mastery',
                name: 'Melody: The Blue Danube Waltz',
                description: 'Play Strauss\'s famous waltz theme in 3/4 time.',
                focus: 'Feel the triple meter. Play the first beat (downbeat) slightly stronger, followed by two lighter beats.',
                instruction: 'Place your Right Hand in C Position. Count "1, 2, 3" steadily and hold the dotted half notes for all three beats.',
                type: 'exercise',
                topic: 'treble',
                xpReward: 80,
                requiredXp: 5520,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "g/4", "a/4"],
                    bassRange: [],
                    rhythms: ["q", "h", "h.", "w"],
                    maxJumps: 3,
                    chordsAllowed: false,
                    numNotes: 21,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "h" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["b/3"], duration: "q" }, { keys: ["b/3"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c5-l2b', bpm: 80, courseId: "rhythm-mastery",
                name: "Tied Notes & Syncopation",
                description: "Learn to hold notes across beats and bar lines using ties.",
                focus: "A tie connects two notes of the same pitch. Play the first note and hold it for the duration of both notes. Do not restrike the second note!",
                instruction: "Play the exercises focusing on holding the tied notes. Notice how it shifts the accent to the off-beat.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 5600,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: ["c/3", "g/3"], rhythms: ["q", "h", "w"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c5-l2c', bpm: 80, courseId: "rhythm-mastery",
                name: "Upbeats & Pickups (Anacrusis)",
                description: "Start playing before the first downbeat of the piece.",
                focus: "A pickup measure is an incomplete measure at the start of a song. Count the silent beats first, then start playing on the upbeat.",
                instruction: "Listen to the metronome count-in. Start playing precisely on the pickup beat (e.g. beat 4 in a 4/4 meter).",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 5680,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: 'c5-l3', bpm: 80, courseId: "rhythm-mastery",
                name: "Dotted Quarter Notes",
                description: "Read the syncopated 'dotted-quarter followed by an eighth' rhythm.",
                focus: "The dotted quarter holds for 1.5 beats. Feel the slight push into the next note.",
                instruction: "Focus on the syncopated rhythm. Count carefully to capture the uneven pulse.",
                type: 'exercise', topic: 'both', xpReward: 100, requiredXp: 5760,
                constraints: { trebleRange: cPosTreble, bassRange: ["c/3", "g/3"], rhythms: ["q", "q.", "8", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: 'c5-l3-song-mario-fanfare',
                bpm: 120,
                courseId: 'rhythm-mastery',
                name: 'Melody: Super Mario Overworld Fanfare',
                description: 'Play the iconic syncopated opening hook of the Super Mario Bros. theme.',
                focus: 'Feel the syncopation. Ensure the short notes are played crisply and the rests are silent.',
                instruction: 'Place your Right Hand in C Position. Watch the rhythm carefully as notes fall off the main beats.',
                type: 'exercise',
                topic: 'treble',
                xpReward: 80,
                requiredXp: 5860,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "c/5"],
                    bassRange: [],
                    rhythms: ["8", "q", "8r", "qr"],
                    maxJumps: 4,
                    chordsAllowed: false,
                    numNotes: 15,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "8" }, { keys: ["e/4"], duration: "8" },
                            { keys: ["e/4"], duration: "8r" }, { keys: ["e/4"], duration: "8" },
                            { keys: ["e/4"], duration: "8r" }, { keys: ["c/4"], duration: "8" },
                            { keys: ["e/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "qr" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "qr" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["b/4"], duration: "q" }, { keys: ["b/4"], duration: "qr" }, { keys: ["b/4"], duration: "hr" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c5-l3b', bpm: 80, courseId: "rhythm-mastery",
                name: "Playing on the Off-Beat",
                description: "Synchronize your hands with eighth notes that fall between the beats.",
                focus: "LH plays steady quarter-note pulses on the beats, while RH plays eighth notes on the 'and' of the beat. Keep your hands decoupled.",
                instruction: "Play slowly. Make sure your right-hand off-beats fall exactly halfway between the left-hand beats.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 5940,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: ["c/3", "g/3"], rhythms: ["q", "8"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c5-l3-song-wellerman', bpm: 100, courseId: "rhythm-mastery",
                name: "Melody: Wellerman",
                description: "Play the famous rhythmic sea shanty melody in A minor.",
                focus: "Keep a driving rhythmic pulse and look ahead to cross scalar intervals smoothly.",
                instruction: "Place your Right Hand in C Position. Reach smoothly to play A4 up to E5.",
                type: 'exercise', topic: 'treble', xpReward: 100, requiredXp: 6020,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["a/4", "b/4", "c/5", "d/5", "e/5"], bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 21,
                    presetMelody: {
                        treble: [
                            { keys: ["a/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["d/5"], duration: "q" },
                            { keys: ["d/5"], duration: "h" }, { keys: ["e/5"], duration: "q" }, { keys: ["e/5"], duration: "q" },
                            { keys: ["e/5"], duration: "q" }, { keys: ["c/5"], duration: "q" }, { keys: ["d/5"], duration: "h" },
                            { keys: ["d/5"], duration: "w" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["d/5"], duration: "q" },
                            { keys: ["d/5"], duration: "h" }, { keys: ["e/5"], duration: "q" }, { keys: ["e/5"], duration: "q" },
                            { keys: ["c/5"], duration: "q" }, { keys: ["b/4"], duration: "q" }, { keys: ["a/4"], duration: "h" },
                            { keys: ["a/4"], duration: "w" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c5-l4', bpm: 80, courseId: "rhythm-mastery",
                name: "Mixed Subdivisions Capstone",
                description: "A comprehensive rhythm challenge combining all note lengths.",
                focus: "Lock your timing while switching between half, quarter, and eighth notes across both clefs.",
                instruction: "Combine eighth notes and dotted rhythms in both hands in this rhythm test.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 6120,
                constraints: { trebleRange: fullTreble, bassRange: cPosBass, rhythms: ["q", "8", "h"], maxJumps: 2, chordsAllowed: true, numNotes: 36 }
            },
            {
                id: 'c5-l5-song-popular', bpm: 120, courseId: 'rhythm-mastery',
                name: 'Song: Clocks',
                description: 'Practice Coldplay\'s famous syncopated 3+3+2 eighth note pattern.',
                focus: 'Master the 3+3+2 subdivision. Keep your rhythm steady and your hands synchronized.',
                instruction: 'Your right hand plays a syncopated three-note pattern in the G4-E5 range, while your left hand holds steady bass notes in the G2-D3 range.',
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 6320,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["g/4", "a/4", "b/4", "c/5", "d/5", "e/5"], bassRange: ["g/2", "a/2", "b/2", "c/3", "d/3"], rhythms: ["8", "q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 72,
                    presetMelody: {
                        treble: [
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }
                        ],
                        bass: [
                            { keys: ["g/2"], duration: 'w' },
                            { keys: ["c/3"], duration: 'w' },
                            { keys: ["a/2"], duration: 'w' },
                            { keys: ["d/3"], duration: 'w' },
                            { keys: ["g/2"], duration: 'w' },
                            { keys: ["c/3"], duration: 'w' },
                            { keys: ["a/2"], duration: 'w' },
                            { keys: ["d/3"], duration: 'w' }
                        ]
                    }
                }
            }
        ]
    },
    {
        id: "chords-harmony",
        name: "6. Chords & Harmony",
        description: "Learn to read and play multiple notes simultaneously. Master triads, common chord shapes, inversions, and pop progressions.",
        order: 6,
        lessons: [
            {
                id: 'c6-chord-l1', bpm: 80, courseId: "chords-harmony",
                name: "Triads: C & G Major Chords",
                description: "Form and play solid three-note C Major (C-E-G) and G Major (G-B-D) triads.",
                focus: "Keep your hand relaxed. Ensure all three notes sound exactly at the same instant.",
                instruction: "RH plays C triad (fingers 1-3-5 on C-E-G) and G triad (fingers 1-3-5 on G-B-D). Keep fingers close to the keys.",
                type: 'exercise', topic: 'chords', xpReward: 80, requiredXp: 6440,
                handPosition: 'RH_C_POS',
                chords: ["C Major", "G Major"],
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 4,
                    chordsAllowed: true,
                    numNotes: 24
                }
            },
            {
                id: 'c6-chord-l2', bpm: 80, courseId: "chords-harmony",
                name: "Smooth Voice Leading (F Inversion)",
                description: "Practice smooth chord transitions using F Major in first inversion (C-F-A).",
                focus: "Transition from C Major (C-E-G) to F Major first inversion (C-F-A) by keeping your thumb on C and shifting others.",
                instruction: "Play C Major (1-3-5) then F Major inversion (1-4-5 on C-F-A). This minimises hand movement for seamless playing.",
                type: 'exercise', topic: 'chords', xpReward: 80, requiredXp: 6520,
                handPosition: 'RH_C_POS',
                chords: ["C Major", "F Major"],
                constraints: {
                    trebleRange: ["c/4", "e/4", "f/4", "g/4", "a/4"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 2,
                    chordsAllowed: true,
                    numNotes: 24
                }
            },
            {
                id: 'c6-chord-l3', bpm: 80, courseId: "chords-harmony",
                name: "Minor Triads: A Minor & D Minor",
                description: "Introduce the emotional colors of minor triads (Am and Dm).",
                focus: "Listen to the change in quality from major (happy) to minor (sad). Maintain a steady hand shape.",
                instruction: "Play Am triad (A-C-E) and Dm triad (D-F-A) using fingers 1-3-5. Press all keys with even weight.",
                type: 'exercise', topic: 'chords', xpReward: 80, requiredXp: 6600,
                handPosition: 'RH_C_POS',
                chords: ["A minor (Am)", "D minor (Dm)"],
                constraints: {
                    trebleRange: ["d/4", "f/4", "a/4", "c/5", "e/5"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 3,
                    chordsAllowed: true,
                    numNotes: 24
                }
            },
            {
                id: 'c6-chord-l4', bpm: 85, courseId: "chords-harmony",
                name: "The 4-Chord Pop Progression",
                description: "Master the most famous chord progression in pop music history: C - G - Am - F.",
                focus: "Anticipate the next chord shape in your mind before shifting. Keep the pulse steady.",
                instruction: "RH plays: C Major (C-E-G), G Major (G-B-D), A minor (A-C-E), F Major first inversion (C-F-A).",
                type: 'exercise', topic: 'chords', xpReward: 100, requiredXp: 6680,
                handPosition: 'RH_C_POS',
                chords: ["C Major", "G Major", "A minor (Am)", "F Major"],
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 4,
                    chordsAllowed: true,
                    numNotes: 32
                }
            },
            {
                id: 'c6-chord-l5', bpm: 80, courseId: "chords-harmony",
                name: "Melody: Let It Be Chords",
                description: "Play the legendary introductory chords of The Beatles' Let It Be.",
                focus: "Ensure the transition to the minor chord is smooth and aligned with the beat.",
                instruction: "Play the progression: C Major, G Major, A minor, F Major, C Major, G Major, F Major, C Major.",
                type: 'song', topic: 'chords', xpReward: 100, requiredXp: 6780,
                handPosition: 'RH_C_POS',
                chords: ["C Major", "G Major", "A minor (Am)", "F Major"],
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 4,
                    chordsAllowed: true,
                    numNotes: 32,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["g/4", "b/4", "d/5"], duration: "h" },
                            { keys: ["a/4", "c/5", "e/5"], duration: "h" }, { keys: ["c/4", "f/4", "a/4"], duration: "h" },
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["g/4", "b/4", "d/5"], duration: "h" },
                            { keys: ["c/4", "f/4", "a/4"], duration: "q" }, { keys: ["c/4", "e/4", "g/4"], duration: "q" }, { keys: ["c/4", "e/4", "g/4"], duration: "h" },

                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["g/4", "b/4", "d/5"], duration: "h" },
                            { keys: ["a/4", "c/5", "e/5"], duration: "h" }, { keys: ["c/4", "f/4", "a/4"], duration: "h" },
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["g/4", "b/4", "d/5"], duration: "h" },
                            { keys: ["c/4", "f/4", "a/4"], duration: "q" }, { keys: ["c/4", "e/4", "g/4"], duration: "q" }, { keys: ["c/4", "e/4", "g/4"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c6-chord-l6', bpm: 80, courseId: "chords-harmony",
                name: "Black Keys: D, A, and E Major",
                description: "Form major triads using black keys (accidentals F#, C#, and G#).",
                focus: "Locate and slide your fingers up into the black keys smoothly. Keep wrists flexible.",
                instruction: "Play D Major (D-F#-A), A Major (A-C#-E), and E Major (E-G#-B). Watch for the sharp signs.",
                type: 'exercise', topic: 'chords', xpReward: 80, requiredXp: 6880,
                handPosition: 'RH_C_POS',
                chords: ["D Major", "A Major", "E Major"],
                constraints: {
                    trebleRange: ["d/4", "f#/4", "g#/4", "a/4", "c#/5", "e/5"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 4,
                    chordsAllowed: true,
                    numNotes: 24
                }
            },
            {
                id: 'c6-chord-l7', bpm: 75, courseId: "chords-harmony",
                name: "Melody: Imagine Progression",
                description: "Play John Lennon's iconic, gentle chord transitions.",
                focus: "Slide smoothly between C Major (C-E-G) and F Major first inversion (C-F-A). Keep touch light.",
                instruction: "RH plays: C Major triad (C-E-G), then F Major first inversion (C-F-A). Maintain a peaceful pulse.",
                type: 'song', topic: 'chords', xpReward: 80, requiredXp: 6960,
                handPosition: 'RH_C_POS',
                chords: ["C Major", "F Major"],
                constraints: {
                    trebleRange: ["c/4", "e/4", "f/4", "g/4", "a/4"],
                    bassRange: [],
                    rhythms: ["h", "w"],
                    maxJumps: 2,
                    chordsAllowed: true,
                    numNotes: 24,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["c/4", "e/4", "g/4"], duration: "h" },
                            { keys: ["c/4", "f/4", "a/4"], duration: "h" }, { keys: ["c/4", "f/4", "a/4"], duration: "h" },
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["c/4", "e/4", "g/4"], duration: "h" },
                            { keys: ["c/4", "f/4", "a/4"], duration: "h" }, { keys: ["c/4", "f/4", "a/4"], duration: "h" },
                            
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["c/4", "e/4", "g/4"], duration: "h" },
                            { keys: ["c/4", "f/4", "a/4"], duration: "h" }, { keys: ["c/4", "f/4", "a/4"], duration: "h" },
                            { keys: ["c/4", "e/4", "g/4"], duration: "h" }, { keys: ["c/4", "e/4", "g/4"], duration: "h" },
                            { keys: ["c/4", "f/4", "a/4"], duration: "h" }, { keys: ["c/4", "f/4", "a/4"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c6-chord-l8', bpm: 80, courseId: "chords-harmony",
                name: "Chord Capstone: Pop Anthem",
                description: "Coordinate left hand root chord changes against a right hand chord melody.",
                focus: "Align the left-hand root bass note perfectly on Beat 1 with the right-hand triad.",
                instruction: "LH plays root notes C, G, A, F as whole notes. RH plays corresponding chord triads. Focus on coordination.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 7040,
                handPosition: 'GRAND_C_POS',
                chords: ["C Major", "G Major", "A minor (Am)", "F Major"],
                constraints: {
                    trebleRange: ["c/4", "e/4", "g/4", "b/4", "c/5", "d/5", "e/5"],
                    bassRange: ["c/3", "g/2", "a/2", "f/2"],
                    rhythms: ["h", "w"],
                    maxJumps: 4,
                    chordsAllowed: true,
                    numNotes: 32
                }
            }
        ]
    },
    {
        id: "expanding-positions",
        name: "7. Expanding Hand Positions",
        description: "Move past static 5-finger positions. Learn hand stretching, crossings, and arpeggios.",
        order: 7,
        lessons: [
            {
                id: 'c6-l1', bpm: 80, courseId: "expanding-positions",
                name: "Melody: Chopsticks",
                description: "Stretch your hands to play thirds and sixths simultaneously.",
                focus: "Keep your hand expanded. Move both hands together.",
                instruction: "Play the classic Chopsticks theme using expanded intervals.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 7240,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["f/4", "g/4"], bassRange: ["f/3", "g/3"], rhythms: ["q"], maxJumps: 1, chordsAllowed: true, numNotes: 20,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["f/4", "g/4"], duration: "q" }, { keys: ["f/4", "g/4"], duration: "q" }, { keys: ["f/4", "g/4"], duration: "q" },
                            { keys: ["e/4", "g/4"], duration: "q" }, { keys: ["e/4", "g/4"], duration: "q" }, { keys: ["e/4", "g/4"], duration: "q" },
                            { keys: ["d/4", "b/4"], duration: "q" }, { keys: ["d/4", "b/4"], duration: "q" }, { keys: ["d/4", "b/4"], duration: "q" },
                            { keys: ["c/4", "c/5"], duration: "h." },

                            { keys: ["f/4", "g/4"], duration: "q" }, { keys: ["f/4", "g/4"], duration: "q" }, { keys: ["f/4", "g/4"], duration: "q" },
                            { keys: ["e/4", "g/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4", "g/4"], duration: "q" },
                            { keys: ["d/4", "b/4"], duration: "q" }, { keys: ["d/4", "b/4"], duration: "q" }, { keys: ["d/4", "b/4"], duration: "q" },
                            { keys: ["c/4", "c/5"], duration: "h." }
                        ],
                        bass: [
                            { keys: ["f/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["f/3"], duration: "q" },
                            { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" },
                            { keys: ["b/3"], duration: "q" }, { keys: ["b/3"], duration: "q" }, { keys: ["b/3"], duration: "q" },
                            { keys: ["c/3"], duration: "h." },

                            { keys: ["f/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["f/3"], duration: "q" },
                            { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" },
                            { keys: ["b/3"], duration: "q" }, { keys: ["b/3"], duration: "q" }, { keys: ["b/3"], duration: "q" },
                            { keys: ["c/3"], duration: "h." }
                        ]
                    }
                }
            },
            {
                id: 'c6-l1b', bpm: 80, courseId: "expanding-positions",
                name: "Stretching for Sixths",
                description: "Extend your hand range to play sixths without shifting positions.",
                focus: "A sixth spans six notes (e.g. C to A). Open your thumb and pinky slightly wider than C Position. Avoid tensing your hand.",
                instruction: "Play the exercises requiring you to reach one note beyond the standard 5-finger position. Return to normal C position after.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 7320,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 5, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c6-l1-song-star-wars', bpm: 108, courseId: 'expanding-positions',
                name: "Melody: Star Wars Main Theme",
                description: "Play the legendary heroic theme featuring a large leap from G to High C.",
                focus: "Focus on the quick leap from G4 to High C (C5). Keep your hand relaxed as you expand your reach.",
                instruction: "Place your Right Hand in C Position. Start with your thumb on C, and stretch to reach the high C5.",
                type: 'exercise', topic: 'treble', xpReward: 100, requiredXp: 7400,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "c/5"], bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 33,
                    presetMelody: {
                        treble: [
                            { keys: ["g/4"], duration: 'q' }, { keys: ["g/4"], duration: 'q' }, { keys: ["g/4"], duration: 'h' },
                            { keys: ["c/5"], duration: 'h.' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["d/4"], duration: 'h' },
                            { keys: ["c/5"], duration: 'h.' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["d/4"], duration: 'h' },
                            { keys: ["c/5"], duration: 'h.' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["f/4"], duration: 'h' },
                            { keys: ["d/4"], duration: 'w' },
                            { keys: ["g/4"], duration: 'q' }, { keys: ["g/4"], duration: 'q' }, { keys: ["g/4"], duration: 'h' },
                            { keys: ["c/5"], duration: 'h.' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["d/4"], duration: 'h' },
                            { keys: ["c/5"], duration: 'h.' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["d/4"], duration: 'h' },
                            { keys: ["c/5"], duration: 'w' }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c6-l1-song-rainbow', bpm: 90, courseId: "expanding-positions",
                name: "Melody: Over the Rainbow Jump",
                description: "Practice the famous octave leap from Middle C to High C.",
                focus: "Look at the high note first, then move your hand. Accurate jumps require look-before-you-leap!",
                instruction: "Follow the notation to play the iconic opening jump of Somewhere Over the Rainbow.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 7500,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"], bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 21,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: "h" }, { keys: ["c/5"], duration: "h" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["g/4"], duration: "q" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["b/4"], duration: "q" }, { keys: ["c/5"], duration: "q" }, { keys: ["a/4"], duration: "h" },
                            { keys: ["a/4"], duration: "h" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["b/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["f/4"], duration: "h" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["c/4"], duration: "q" },
                            { keys: ["d/4"], duration: "w" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c6-l2', bpm: 80, courseId: "expanding-positions",
                name: "Melody: Joy to the World (Scale)",
                description: "Practice thumb crossing techniques on a descending C major scale.",
                focus: "Tuck Finger 3 over your thumb smoothly as you play descending notes.",
                instruction: "Start on High C. Follow the descending scale of Joy to the World.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 7580,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: fullTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 12,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["c/5"], duration: "q" }, { keys: ["b/4"], duration: "h" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "h." },
                            { keys: ["g/4"], duration: "h" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["a/4"], duration: "h." },
                            { keys: ["a/4"], duration: "h" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["b/4"], duration: "h." },
                            { keys: ["c/5"], duration: "h." }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c6-l2b', bpm: 80, courseId: "expanding-positions",
                name: "Thumb Under Crossing (RH)",
                description: "Master tucking your thumb under Finger 3 to play ascending scales.",
                focus: "Tuck your thumb (Finger 1) under your middle finger (Finger 3) smoothly when moving from E4 to F4. Keep your wrist level.",
                instruction: "Play the ascending stepwise patterns. Tucking your thumb allows you to play 8 notes in a row without running out of fingers!",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 7660,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"], bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c6-l3', bpm: 80, courseId: "expanding-positions",
                name: "Left Hand Crossings",
                description: "Cross Finger 3 over the thumb to shift positions down.",
                focus: "Cross your middle finger (Finger 3) over your thumb to play lower notes smoothly.",
                instruction: "Practice descending crossings in your left hand, expanding your range down to Low F (F2).",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 7740,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: ["f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c6-l3b', bpm: 80, courseId: "expanding-positions",
                name: "Thumb Under Crossing (LH)",
                description: "Learn the thumb tuck technique in the left hand to shift positions up.",
                focus: "Tuck your thumb (Finger 1) under Finger 3 or 4 in the Left Hand while moving up the scale. Keep your hand relaxed.",
                instruction: "Play the ascending exercise in the left hand, crossing your thumb under Finger 3 as you move from G3 to A3.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 7820,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4"], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c6-l4', bpm: 80, courseId: "expanding-positions",
                name: "Arpeggio Patterns",
                description: "Play broken triad chords sequentially up and down.",
                focus: "Keep a light, even touch. Feel your arm gliding horizontally across the keyboard.",
                instruction: "Play chord tones C, E, G, C sequentially. Relax your fingers between notes.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 7900,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "e/4", "g/4", "c/5"], bassRange: ["c/3", "e/3", "g/3", "c/4"], rhythms: ["q", "8"], maxJumps: 3, chordsAllowed: false, numNotes: 40 }
            },
            {
                id: 'c6-l4-song-swan-lake', bpm: 80, courseId: "expanding-positions",
                name: "Melody: Swan Lake Theme",
                description: "Play Tchaikovsky's beautiful expanding minor theme.",
                focus: "Stretch your hand smoothly to reach across the full octave from A4 to A5.",
                instruction: "Place your Right Hand in A Position. Stretch Finger 5 to reach the high notes without losing your hand alignment.",
                type: 'exercise', topic: 'treble', xpReward: 100, requiredXp: 8020,
                handPosition: 'RH_G_POS',
                constraints: {
                    trebleRange: ["a/4", "d/5", "e/5", "f/5", "g/5", "a/5"], bassRange: [], rhythms: ["8", "q", "h", "w"], maxJumps: 5, chordsAllowed: false, numNotes: 20,
                    presetMelody: {
                        treble: [
                            { keys: ["a/4"], duration: "h." }, { keys: ["d/5"], duration: "8" }, { keys: ["f/5"], duration: "8" },
                            { keys: ["a/5"], duration: "h." }, { keys: ["g/5"], duration: "8" }, { keys: ["f/5"], duration: "8" },
                            { keys: ["g/5"], duration: "q" }, { keys: ["e/5"], duration: "h" }, { keys: ["f/5"], duration: "q" },
                            { keys: ["d/5"], duration: "w" },
                            { keys: ["a/4"], duration: "h." }, { keys: ["d/5"], duration: "8" }, { keys: ["f/5"], duration: "8" },
                            { keys: ["a/5"], duration: "h." }, { keys: ["g/5"], duration: "8" }, { keys: ["f/5"], duration: "8" },
                            { keys: ["g/5"], duration: "q" }, { keys: ["e/5"], duration: "h" }, { keys: ["f/5"], duration: "q" },
                            { keys: ["d/5"], duration: "w" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c6-l5-song-popular', bpm: 65, courseId: 'expanding-positions',
                name: "Song: Perfect",
                description: "Play Ed Sheeran's romantic ballad with a flowing 6/8 arpeggiated movement.",
                focus: "Practice expanding your hand beyond the 5-finger position to sweep across the octave.",
                instruction: "Your right hand will play arpeggiated chords spanning an octave in 6/8 meter, while your left hand plays supporting bass notes.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 8120,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["c/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5"], bassRange: ["f/2", "g/2", "a/2", "c/3"], rhythms: ["8", "q", "h"], maxJumps: 5, chordsAllowed: false, numNotes: 64,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: '8' },
                            { keys: ["e/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["e/4"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["f/4"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["g/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["c/4"], duration: '8' },
                            { keys: ["e/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["e/4"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["f/4"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["g/4"], duration: '8' },
                            { keys: ["b/4"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["g/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' }
                        ],
                        bass: [
                            { keys: ["c/3"], duration: 'h' },
                            { keys: ["c/3"], duration: 'q' },
                            { keys: ["a/2"], duration: 'h' },
                            { keys: ["a/2"], duration: 'q' },
                            { keys: ["f/2"], duration: 'h' },
                            { keys: ["f/2"], duration: 'q' },
                            { keys: ["g/2"], duration: 'h' },
                            { keys: ["g/2"], duration: 'q' },
                            { keys: ["c/3"], duration: 'h' },
                            { keys: ["c/3"], duration: 'q' },
                            { keys: ["a/2"], duration: 'h' },
                            { keys: ["a/2"], duration: 'q' },
                            { keys: ["f/2"], duration: 'h' },
                            { keys: ["f/2"], duration: 'q' },
                            { keys: ["g/2"], duration: 'h' },
                            { keys: ["g/2"], duration: 'q' }
                        ]
                    }
                }
            }
        ]
    },
    {
        id: "accidentals-key-sigs",
        name: "8. Accidentals & Key Signatures",
        description: "Explore the black keys, read sharps and flats, and play in new key signatures.",
        order: 8,
        lessons: [
            {
                id: 'c7-l1', bpm: 80, courseId: "accidentals-key-sigs",
                name: "Melody: Für Elise Hook",
                description: "Play the chromatic opening theme of Für Elise.",
                focus: "Navigate the alternating chromatic notes E5 and D#5 smoothly.",
                instruction: "Place your Right Hand index and middle fingers on E5 and D#5. Follow the classic Beethoven theme.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 8240,
                handPosition: 'RH_HIGH_C_POS',
                constraints: {
                    trebleRange: trebleSharps, bassRange: [], rhythms: ["8", "q", "h", "h."], maxJumps: 4, chordsAllowed: false, numNotes: 27,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["e/5"], duration: "hr" }, { keys: ["e/5"], duration: "8" }, { keys: ["d#/5"], duration: "8" },
                            { keys: ["e/5"], duration: "8" }, { keys: ["d#/5"], duration: "8" }, { keys: ["e/5"], duration: "8" }, { keys: ["b/4"], duration: "8" }, { keys: ["d/5"], duration: "8" }, { keys: ["c/5"], duration: "8" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["a/4"], duration: "8r" }, { keys: ["c/4"], duration: "8" }, { keys: ["e/4"], duration: "8" }, { keys: ["a/4"], duration: "8" },
                            { keys: ["b/4"], duration: "q" }, { keys: ["b/4"], duration: "8r" }, { keys: ["e/4"], duration: "8" }, { keys: ["g#/4"], duration: "8" }, { keys: ["b/4"], duration: "8" },
                            { keys: ["c/5"], duration: "q" }, { keys: ["c/5"], duration: "8r" }, { keys: ["e/4"], duration: "8" }, { keys: ["e/5"], duration: "8" }, { keys: ["d#/5"], duration: "8" },
                            { keys: ["e/5"], duration: "8" }, { keys: ["d#/5"], duration: "8" }, { keys: ["e/5"], duration: "8" }, { keys: ["b/4"], duration: "8" }, { keys: ["d/5"], duration: "8" }, { keys: ["c/5"], duration: "8" },
                            { keys: ["a/4"], duration: "h." }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c7-l1b', bpm: 80, courseId: "accidentals-key-sigs",
                name: "Harmonic Minor & The Raised 7th",
                description: "Learn the sound of the harmonic minor scale with its signature raised 7th accidental.",
                focus: "In A minor, the 7th note (G) is often raised to G# using a sharp accidental. This creates a beautiful, exotic step-and-a-half leap.",
                instruction: "Play the A minor melody. Keep your index finger ready to strike the G# black key.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 8320,
                handPosition: 'RH_HIGH_C_POS',
                constraints: { trebleRange: ["a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g#/5", "a/5"], bassRange: [], rhythms: ["q", "h"], maxJumps: 3, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c7-l1-song-hedwigs-theme',
                bpm: 80,
                courseId: 'accidentals-key-sigs',
                name: "Melody: Hedwig's Theme (Harry Potter)",
                description: "Play the magical, mysterious theme of the Wizarding World.",
                focus: "Identify the chromatic alteration from F# to F natural, and practice leaps of a fifth.",
                instruction: "Place your Right Hand in B Position (thumb on B3). Follow the rising and falling leaps smoothly.",
                type: 'exercise',
                topic: 'treble',
                xpReward: 80,
                requiredXp: 8400,
                handPosition: 'RH_B_POS',
                constraints: {
                    trebleRange: ["b/3", "d/4", "d#/4", "e/4", "f/4", "f#/4", "g/4", "a/4", "b/4"],
                    bassRange: [],
                    rhythms: ["8", "q", "h", "h."],
                    maxJumps: 5,
                    chordsAllowed: false,
                    numNotes: 15,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["b/3"], duration: "hr" }, { keys: ["b/3"], duration: "q" },
                            { keys: ["e/4"], duration: "q." }, { keys: ["g/4"], duration: "8" }, { keys: ["f#/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q." }, { keys: ["b/4"], duration: "8" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["f#/4"], duration: "h." },
                            { keys: ["e/4"], duration: "q." }, { keys: ["g/4"], duration: "8" }, { keys: ["f#/4"], duration: "q" },
                            { keys: ["d#/4"], duration: "q." }, { keys: ["f/4"], duration: "8" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["b/3"], duration: "h." }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c7-l2-song-popular', bpm: 110, courseId: 'accidentals-key-sigs',
                name: "Song: He's a Pirate",
                description: "Play the driving, syncopated theme from Pirates of the Caribbean in D minor.",
                focus: "Navigate the flat accidental (Bb) while maintaining a fast, driving triple pulse.",
                instruction: "Play the iconic syncopated D minor melody with the right hand, matched with simple bass changes.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 8480,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["a/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "bb/5"], bassRange: ["g/2", "a/2", "bb/2", "c/3", "d/3", "f/3"], rhythms: ["8", "q", "h", "qr"], maxJumps: 4, chordsAllowed: false, numNotes: 61,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["a/4"], duration: 'hr' }, { keys: ["a/4"], duration: '8' }, { keys: ["c/5"], duration: '8' },
                            { keys: ["d/5"], duration: 'q' }, { keys: ["d/5"], duration: '8' }, { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' }, { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: 'q' }, { keys: ["f/5"], duration: '8' }, { keys: ["f/5"], duration: '8' }, { keys: ["g/5"], duration: '8' }, { keys: ["a/5"], duration: '8' },
                            { keys: ["a/5"], duration: 'q' }, { keys: ["a/5"], duration: '8' }, { keys: ["bb/5"], duration: '8' }, { keys: ["a/5"], duration: '8' }, { keys: ["g/5"], duration: '8' },
                            { keys: ["f/5"], duration: 'q' }, { keys: ["e/5"], duration: '8' }, { keys: ["d/5"], duration: '8' }, { keys: ["a/4"], duration: '8' }, { keys: ["c/5"], duration: '8' },
                            
                            { keys: ["d/5"], duration: 'q' }, { keys: ["d/5"], duration: '8' }, { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' }, { keys: ["f/5"], duration: '8' },
                            { keys: ["e/5"], duration: 'q' }, { keys: ["f/5"], duration: '8' }, { keys: ["f/5"], duration: '8' }, { keys: ["f/5"], duration: '8' }, { keys: ["g/5"], duration: '8' },
                            { keys: ["a/5"], duration: 'q' }, { keys: ["a/5"], duration: '8' }, { keys: ["a/5"], duration: '8' }, { keys: ["bb/5"], duration: '8' }, { keys: ["a/5"], duration: '8' },
                            { keys: ["g/5"], duration: 'q' }, { keys: ["g/5"], duration: '8' }, { keys: ["a/5"], duration: '8' }, { keys: ["f/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["d/5"], duration: 'q' }, { keys: ["qr"], duration: 'q' }, { keys: ["a/4"], duration: '8' }, { keys: ["c/5"], duration: '8' },
                            
                            { keys: ["d/5"], duration: 'q' }, { keys: ["d/5"], duration: '8' }, { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' }, { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: 'q' }, { keys: ["f/5"], duration: '8' }, { keys: ["f/5"], duration: '8' }, { keys: ["g/5"], duration: '8' }, { keys: ["a/5"], duration: '8' },
                            { keys: ["g/5"], duration: 'q' }, { keys: ["e/5"], duration: '8' }, { keys: ["d/5"], duration: 'q' }, { keys: ["d/5"], duration: '8r' }
                        ],
                        bass: [
                            { keys: ["d/3"], duration: 'h.r' },
                            { keys: ["d/3"], duration: 'h' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["f/3"], duration: 'h' }, { keys: ["f/3"], duration: 'q' },
                            { keys: ["g/2"], duration: 'h' }, { keys: ["g/2"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["f/3"], duration: 'h' }, { keys: ["f/3"], duration: 'q' },
                            { keys: ["g/2"], duration: 'h' }, { keys: ["g/2"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["bb/2"], duration: 'h' }, { keys: ["bb/2"], duration: 'q' },
                            { keys: ["f/3"], duration: 'h' }, { keys: ["f/3"], duration: 'q' },
                            { keys: ["c/3"], duration: 'h' }, { keys: ["c/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' }, { keys: ["d/3"], duration: 'q' }
                        ]
                    }
                }
            },
            {
                id: 'c7-l2-song-mountain-king',
                bpm: 88,
                courseId: 'accidentals-key-sigs',
                name: 'Melody: In the Hall of the Mountain King',
                description: "Play Grieg's dark and mysterious classical theme featuring sharps.",
                focus: "Watch for the sharp accidentals (F# and C#). Keep a crisp, steady staccato touch.",
                instruction: "Place your Left Hand in B Position (pinky on B2). Play the climbing theme as it creeps up the keyboard.",
                type: 'exercise',
                topic: 'bass',
                xpReward: 80,
                requiredXp: 8600,
                handPosition: 'LH_B_POS',
                constraints: {
                    trebleRange: [],
                    bassRange: ["b/2", "c#/3", "d/3", "e/3", "f#/3", "g/3", "a/3", "b/3"],
                    rhythms: ["q", "h"],
                    maxJumps: 2,
                    chordsAllowed: false,
                    numNotes: 22,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["b/2"], duration: "q" }, { keys: ["c#/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f#/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["f#/3"], duration: "h" },
                            { keys: ["e/3"], duration: "q" }, { keys: ["c#/3"], duration: "q" }, { keys: ["e/3"], duration: "h" },
                            { keys: ["d/3"], duration: "q" }, { keys: ["b/2"], duration: "q" }, { keys: ["d/3"], duration: "h" },
                            { keys: ["b/2"], duration: "q" }, { keys: ["c#/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f#/3"], duration: "q" }, { keys: ["d/3"], duration: "q" }, { keys: ["b/3"], duration: "q" }, { keys: ["a/3"], duration: "q" },
                            { keys: ["f#/3"], duration: "w" }
                        ]
                    }
                }
            },
            {
                id: 'c7-l2-song-godfather', bpm: 84, courseId: "accidentals-key-sigs",
                name: "Melody: The Godfather Theme",
                description: "Play the famous chromatic, moving melody from The Godfather.",
                focus: "Read the sharp accidental (G#) and navigate the stepwise motion with minor skips.",
                instruction: "Place your Right Hand in C Position. Transition your fingers to reach the G# accidental on the black key.",
                type: 'exercise', topic: 'treble', xpReward: 100, requiredXp: 8680,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["d/4", "e/4", "f/4", "g/4", "g#/4", "a/4", "b/4", "c/5"], bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 25,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["c/5"], duration: "q" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["c/5"], duration: "q" }, { keys: ["b/4"], duration: "q" }, { keys: ["g#/4"], duration: "q" },
                            { keys: ["a/4"], duration: "w" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["c/5"], duration: "q" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["c/5"], duration: "q" }, { keys: ["b/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["f/4"], duration: "h" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["d/4"], duration: "w" },
                            { keys: ["e/4"], duration: "w" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c7-l2', bpm: 80, courseId: "accidentals-key-sigs",
                name: "Introducing Flats (b)",
                description: "Read and play flat accidentals on black keys.",
                focus: "Locate Bb4 and Eb4. Watch for the flat symbol preceding the notes.",
                instruction: "Play exercises containing Bb4 and Eb4. Flats lower the pitch by one half-step.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 8780,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: trebleFlats, bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c7-l2b', bpm: 80, courseId: "accidentals-key-sigs",
                name: "The Natural Sign (♮)",
                description: "Learn to read natural signs that cancel sharps and flats.",
                focus: "A natural sign (♮) cancels a sharp or flat that was in the key signature or earlier in the measure. Return to playing the white key!",
                instruction: "Watch the staff closely. When you see a natural sign, play the white key instead of the flat or sharp.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 8860,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "f#/4", "g/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c7-l3', bpm: 80, courseId: "accidentals-key-sigs",
                name: "Key Signature: G Major",
                description: "Play exercises in G Major, where all Fs are sharps.",
                focus: "Look at the sharp at the start of the staff. Remember to play all Fs as F# automatically.",
                instruction: "Practice reading with a G Major key signature. Sharps at the clef apply to the whole piece.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 8940,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: gMajorTreble, bassRange: ["g/3", "a/3", "b/3", "c/4", "d/4"], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: true, numNotes: 40 }
            },
            {
                id: 'c7-l3b', bpm: 80, courseId: "accidentals-key-sigs",
                name: "Key Signature: F Major",
                description: "Read and play exercises in F Major, where all Bs are flat (Bb).",
                focus: "Look at the flat symbol on the B line at the start of the staff. Remember to automatically play all Bs as Bb.",
                instruction: "Position your hands in the F Major scale region. Play Bb with Finger 4 in the right hand.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 9060,
                handPosition: 'GRAND_F_POS',
                constraints: {
                    trebleRange: ["f/4", "g/4", "a/4", "bb/4", "c/5", "d/5", "e/5", "f/5"],
                    bassRange: ["f/2", "g/2", "a/2", "bb/2", "c/3", "d/3", "e/3", "f/3"],
                    rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 24
                }
            },
            {
                id: 'c7-l4', bpm: 80, courseId: "accidentals-key-sigs",
                name: "Song: Minuet in G",
                description: "Play Bach's famous theme in G Major.",
                focus: "Coordinate the right-hand melody with the left-hand chord changes in 3/4 time.",
                instruction: "Play this beautiful classic. Pay attention to the F# in the key signature.",
                type: 'song', topic: 'chords', xpReward: 250, requiredXp: 9140,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/bach_minuet_g_major.musicxml',
                presetId: 'preset-minuet-g'
            },
            {
                id: 'c7-l5', bpm: 80, courseId: "accidentals-key-sigs",
                name: "Song: Für Elise (Simplified)",
                description: "Play Beethoven's classic theme featuring sharps and flats.",
                focus: "Navigate the chromatic transitions (Eb to D#) smoothly in 3/8 meter.",
                instruction: "Use both hands to play this famous, expressive Beethoven piece.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 9390,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Fur_Elise_Simplified.musicxml',
                presetId: 'preset-fur-elise-easy'
            }
        ]
    },
    {
        id: "intermediate-mastery",
        name: "9. Intermediate Mastery & Classical Repertoire",
        description: "Achieve fluency with full 1-octave scales, chord inversions, and advanced repertoire.",
        order: 9,
        lessons: [
            {
                id: 'c8-l1', bpm: 80, courseId: "intermediate-mastery",
                name: "C Major Scale (1-Octave)",
                description: "Play the full C Major scale up and down a complete octave.",
                focus: "Keep your crossings seamless. Make sure the thumb crossing does not disrupt the rhythm.",
                instruction: "Play C4 to C5 using finger crossing technique. Keep your tempo perfectly steady.",
                type: 'exercise', topic: 'treble', xpReward: 200, requiredXp: 9640,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: fullTreble, bassRange: [], rhythms: ["8", "q"], maxJumps: 1, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: 'c8-l1b', bpm: 80, courseId: "intermediate-mastery",
                name: "Block vs Broken Triads",
                description: "Learn the difference between playing a chord together or broken.",
                focus: "Block chords require pressing all notes at the exact same instant. Broken chords play them one by one. Keep your fingers resting on the keys before striking.",
                instruction: "Alternate between playing blocked C major chords and broken C major chords. Keep your hand shape steady.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 9840,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "e/4", "g/4"], bassRange: ["c/3", "e/3", "g/3"], rhythms: ["q", "h", "w"], maxJumps: 3, chordsAllowed: true, numNotes: 24 }
            },
            {
                id: 'c8-l1c', bpm: 80, courseId: "intermediate-mastery",
                name: "Treble Chord Inversions",
                description: "Play C Major triads in Root, 1st, and 2nd inversions.",
                focus: "Root position is C-E-G. First inversion is E-G-C (finger 1-2-5). Second inversion is G-C-E (finger 1-3-5). Relax your wrist between shifts.",
                instruction: "Play the inverted C Major chords. Look at the spacing of the notes on the staff to identify the inversion.",
                type: 'exercise', topic: 'treble', xpReward: 200, requiredXp: 10040,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: ["c/4", "e/4", "g/4", "c/5", "e/5"], bassRange: [], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: true, numNotes: 16 }
            },
            {
                id: 'c8-l1d', bpm: 80, courseId: "intermediate-mastery",
                name: "G Major Scale (1-Octave)",
                description: "Play the full G Major scale with its F sharp (F#).",
                focus: "Ascend from G4 to G5, tucking your thumb under Finger 3. Descend crossing Finger 3 over your thumb. Strike the F# with Finger 4.",
                instruction: "Play the G Major scale up and down. Focus on the smooth thumb crossing and hitting the black key.",
                type: 'exercise', topic: 'treble', xpReward: 200, requiredXp: 10240,
                handPosition: 'RH_G_POS',
                constraints: { trebleRange: ["g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f#/5", "g/5"], bassRange: [], rhythms: ["q", "8"], maxJumps: 1, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: 'c8-l1e', bpm: 80, courseId: "intermediate-mastery",
                name: "A Natural Minor Scale",
                description: "Play the natural minor scale starting and ending on A.",
                focus: "A minor has no sharps or flats, sharing a key signature with C Major. Cross your thumb under Finger 3 on the way up.",
                instruction: "Play the A minor scale (A4 to A5) up and down. Feel the minor third interval (A to C) which gives it its sad character.",
                type: 'exercise', topic: 'treble', xpReward: 200, requiredXp: 10440,
                handPosition: 'RH_A_POS',
                constraints: { trebleRange: ["a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5"], bassRange: [], rhythms: ["q", "8"], maxJumps: 1, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: 'c8-l2', bpm: 80, courseId: "intermediate-mastery",
                name: "Melody: Canon in D Theme",
                description: "Coordinate left hand bass notes with right hand harmony inversions.",
                focus: "Change chords precisely on the first beat of each measure.",
                instruction: "Your left hand plays the descending ground bass of Pachelbel's Canon while your right hand supports with triads.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 10640,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["c/4", "e/4", "g/4"], bassRange: ["c/3", "g/3"], rhythms: ["w"], maxJumps: 0, chordsAllowed: true, numNotes: 16,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4", "e/4", "g/4"], duration: "w" }, { keys: ["g/3", "b/3", "d/4"], duration: "w" }, { keys: ["a/3", "c/4", "e/4"], duration: "w" },
                            { keys: ["e/3", "g/3", "b/3"], duration: "w" }, { keys: ["f/3", "a/3", "c/4"], duration: "w" }, { keys: ["c/3", "e/3", "g/3"], duration: "w" },
                            { keys: ["f/3", "a/3", "c/4"], duration: "w" }, { keys: ["g/3", "b/3", "d/4"], duration: "w" },
                            { keys: ["c/4", "e/4", "g/4"], duration: "w" }, { keys: ["g/3", "b/3", "d/4"], duration: "w" }, { keys: ["a/3", "c/4", "e/4"], duration: "w" },
                            { keys: ["e/3", "g/3", "b/3"], duration: "w" }, { keys: ["f/3", "a/3", "c/4"], duration: "w" }, { keys: ["c/3", "e/3", "g/3"], duration: "w" },
                            { keys: ["f/3", "a/3", "c/4"], duration: "w" }, { keys: ["g/3", "b/3", "d/4"], duration: "w" }
                        ],
                        bass: [
                            { keys: ["c/3"], duration: "w" }, { keys: ["b/2"], duration: "w" }, { keys: ["a/2"], duration: "w" }, { keys: ["g/2"], duration: "w" },
                            { keys: ["f/2"], duration: "w" }, { keys: ["e/2"], duration: "w" }, { keys: ["f/2"], duration: "w" }, { keys: ["g/2"], duration: "w" },
                            { keys: ["c/3"], duration: "w" }, { keys: ["b/2"], duration: "w" }, { keys: ["a/2"], duration: "w" }, { keys: ["g/2"], duration: "w" },
                            { keys: ["f/2"], duration: "w" }, { keys: ["e/2"], duration: "w" }, { keys: ["f/2"], duration: "w" }, { keys: ["g/2"], duration: "w" }
                        ]
                    }
                }
            },
            {
                id: 'c8-l2b', bpm: 80, courseId: "intermediate-mastery",
                name: "I - IV - V7 Progression",
                description: "Master the most common chord progression using C, F, and G7 chords.",
                focus: "LH plays C Major (C-E-G), F Major (C-F-A), and G7 (B-F-G) with minimal hand movement. This is called voice leading.",
                instruction: "Play the chord progression in your left hand while your right hand holds simple melody notes.",
                type: 'exercise', topic: 'both', xpReward: 80, requiredXp: 10720,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: ["b/2", "c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["h", "w"], maxJumps: 3, chordsAllowed: true, numNotes: 20
                }
            },
            {
                id: 'c8-l2-song-popular', bpm: 96, courseId: 'intermediate-mastery',
                name: "Song: Interstellar Theme",
                description: "Play Hans Zimmer's atmospheric masterpiece featuring moving arpeggios and coordination.",
                focus: "Coordinate the repeating right-hand pattern with the rising left-hand arpeggios.",
                instruction: "Your right hand plays a constant, mesmerizing two-note motif, while your left hand plays ascending broken chords.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 10800,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["e/4", "a/4", "b/4", "c/5", "d/5", "e/5"], bassRange: ["g/2", "a/2", "c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["8", "h", "qr", "hr"], maxJumps: 8, chordsAllowed: true, numNotes: 48,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            // Measure 1
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 2
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 3
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["a/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 4
                            { keys: ["b/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 5
                            { keys: ["b/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["b/4"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 6
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 7
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 8
                            { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 9
                            { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            // Measure 10
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' },
                            { keys: ["c/5"], duration: '8' }, { keys: ["e/5"], duration: '8' }
                        ],
                        bass: [
                            // Measure 1
                            { keys: ["d/3"], duration: 'hr' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 2
                            { keys: ["d/3"], duration: 'hr' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 3
                            { keys: ["d/3"], duration: 'hr' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 4
                            { keys: ["a/2", "e/3"], duration: 'h' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 5
                            { keys: ["a/2", "e/3"], duration: 'h' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 6
                            { keys: ["c/3", "g/3"], duration: 'h' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 7
                            { keys: ["c/3", "g/3"], duration: 'h' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 8
                            { keys: ["g/2", "d/3"], duration: 'h' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 9
                            { keys: ["g/2", "d/3"], duration: 'h' }, { keys: ["d/3"], duration: 'qr' },
                            // Measure 10
                            { keys: ["f/2", "c/3"], duration: 'h' }, { keys: ["d/3"], duration: 'qr' }
                        ]
                    }
                }
            },
            {
                id: 'c8-l3', bpm: 80, courseId: "intermediate-mastery",
                name: "Song: Twinkle Twinkle",
                description: "Play the melody accompanied by full chords in the left hand.",
                focus: "Coordinate the chord transitions on beat one of each measure with the melody.",
                instruction: "Your left hand will play full C, F, and G Major chords while your right hand plays the theme.",
                type: 'song', topic: 'chords', xpReward: 200, requiredXp: 10920,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Twinkle_Twinkle.musicxml',
                presetId: 'preset-twinkle-twinkle'
            },
            {
                id: 'c8-l4', bpm: 80, courseId: "intermediate-mastery",
                name: "Song: Gymnopédie No. 1",
                description: "Play Satie's slow, expressive masterpiece.",
                focus: "Play very softly (piano) and smoothly. Take your time with the left-hand bass jumps.",
                instruction: "Use both hands together to play this atmospheric, beautiful piece by Erik Satie.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 11120,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Gymnopdie_No._1__Satie.mxl',
                presetId: 'preset-satie'
            },
            {
                id: 'c8-l5', bpm: 80, courseId: "intermediate-mastery",
                name: "Grand Staff Mastery Capstone",
                description: "Test your skills with a long, mixed exercise across both staffs.",
                focus: "Read fluently across both clefs. Handle eighth notes, accidentals, and shifts smoothly.",
                instruction: "The ultimate generative sight-reading test. Take it slow and focus on rhythmic accuracy.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 11420,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5"], bassRange: ["f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["q", "8", "h"], maxJumps: 4, chordsAllowed: true, numNotes: 48 }
            },
            {
                id: 'c8-l6', bpm: 80, courseId: "intermediate-mastery",
                name: "Song: Canon in D",
                description: "Play Pachelbel's famous theme in a beautiful two-handed arrangement.",
                focus: "Coordinate independent hand parts as the subdivisions speed up. Keep a rock-steady tempo.",
                instruction: "Your final capstone song! Use all the coordination, rhythm, and reading skills you've mastered.",
                type: 'song', topic: 'both', xpReward: 500, requiredXp: 11620,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Canon_in_D.mxl',
                presetId: 'preset-canon'
            },
            {
                id: 'c8-l7-song-alla-turca', bpm: 100, courseId: "intermediate-mastery",
                name: "Melody: Turkish March (Mozart)",
                description: "Play the famous classical opening theme in 2/4 time.",
                focus: "Master quick scalar runs and rest coordination in duple meter.",
                instruction: "Place your Right Hand in A Position. Keep a crisp, steady classical touch.",
                type: 'song', topic: 'treble', xpReward: 120, requiredXp: 12120,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: ["g#/4", "a/4", "b/4", "c/5", "d/5"], bassRange: [], rhythms: ["8", "q", "qr"], maxJumps: 4, chordsAllowed: false, numNotes: 14,
                    timeSignature: "2/4",
                    presetMelody: {
                        treble: [
                            { keys: ["b/4"], duration: "8" }, { keys: ["a/4"], duration: "8" }, { keys: ["g#/4"], duration: "8" }, { keys: ["a/4"], duration: "8" },
                            { keys: ["c/5"], duration: "q" }, { keys: ["c/5"], duration: "qr" },
                            { keys: ["c/5"], duration: "8" }, { keys: ["b/4"], duration: "8" }, { keys: ["a/4"], duration: "8" }, { keys: ["b/4"], duration: "8" },
                            { keys: ["d/5"], duration: "q" }, { keys: ["d/5"], duration: "qr" }
                        ],
                        bass: []
                    }
                }
            },        ]
    },
    {
        id: "reading-intervals",
        name: "Course 9: Reading Musical Intervals",
        order: 9,
        description: "Master the visual shapes and physical transitions of seconds, thirds, fourths, fifths, and octaves.",
        lessons: [
            {
                id: 'c9-l1', bpm: 80, courseId: "reading-intervals",
                name: "Melodic & Harmonic Seconds",
                description: "Identify and play seconds (steps next to each other on the staff).",
                focus: "Seconds transition directly from a line to an adjacent space (or space to line).",
                instruction: "Play stepwise motions up and down the C position.",
                type: 'exercise', topic: 'both', xpReward: 100, requiredXp: 12500,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4"], bassRange: ["c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c9-l2', bpm: 80, courseId: "reading-intervals",
                name: "Melodic & Harmonic Thirds",
                description: "Identify and play thirds (skips on the staff).",
                focus: "Thirds skip a note, going from line to line, or space to space.",
                instruction: "Skip over fingers smoothly. Recognize the parallel visual shape.",
                type: 'exercise', topic: 'both', xpReward: 100, requiredXp: 12700,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "e/4", "g/4"], bassRange: ["c/3", "e/3", "g/3"], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: 'c9-l3', bpm: 80, courseId: "reading-intervals",
                name: "Melodic & Harmonic Fourths",
                description: "Identify and play fourths (three-step leaps).",
                focus: "Fourths leap from a line to a space, skipping two staff degrees.",
                instruction: "Keep your hand relaxed as you leap fingers. Watch the line-to-space shift.",
                type: 'exercise', topic: 'both', xpReward: 100, requiredXp: 12900,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "f/4", "g/4"], bassRange: ["c/3", "f/3", "g/3"], rhythms: ["q", "h"], maxJumps: 3, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c9-l4', bpm: 80, courseId: "reading-intervals",
                name: "Melodic & Harmonic Fifths",
                description: "Identify and play fifths (wide leaps line-to-line or space-to-space).",
                focus: "Fifths anchor basic triads. Look for the parallel shape.",
                instruction: "Stretch your hand to reach the 5th interval cleanly.",
                type: 'exercise', topic: 'both', xpReward: 100, requiredXp: 13100,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "g/4"], bassRange: ["c/3", "g/3"], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: 'c9-l5', bpm: 80, courseId: "reading-intervals",
                name: "Intervals Capstone",
                description: "Test your visual recognition of all intervals up to an octave.",
                focus: "Identify leaps and steps quickly without hesitation.",
                instruction: "The ultimate intervals test. Maintain even finger weight.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 13300,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"], bassRange: ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4"], rhythms: ["q", "h", "8"], maxJumps: 7, chordsAllowed: true, numNotes: 32 }
            }
        ]
    },
    {
        id: "classical-conservatory-1",
        name: "Course 10: Classical Conservatory Level 1",
        order: 10,
        description: "Dive into authentic classical masterworks. Practice reading accidentals, key signatures, and polyphony.",
        lessons: [
            {
                id: 'c10-l1', bpm: 80, courseId: "classical-conservatory-1",
                name: "Song: Ode to Joy (Beethoven)",
                description: "Play the famous theme from Beethoven's Ninth Symphony.",
                focus: "Master stepwise movement and rhythm in both hands.",
                instruction: "Coordinate both hands together to play this masterpiece.",
                type: 'song', topic: 'both', xpReward: 200, requiredXp: 13500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Ode_to_Joy.musicxml',
                presetId: 'preset-ode-to-joy'
            },
            {
                id: 'c10-l2', bpm: 80, courseId: "classical-conservatory-1",
                name: "Song: Minuet in G (Bach)",
                description: "Play Bach's famous keyboard piece in G Major.",
                focus: "Practice the G Major key signature (F#). Keep eighth notes even.",
                instruction: "Play the elegant Bach melody. Remember to sharp all F notes.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 13800,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/bach_minuet_g_major.musicxml',
                presetId: 'preset-minuet-g'
            },
            {
                id: 'c10-l3', bpm: 80, courseId: "classical-conservatory-1",
                name: "Song: Für Elise (Beethoven - Simplified)",
                description: "Play a beautiful simplified arrangement of Beethoven's theme.",
                focus: "Navigate the chromatic movement and registers smoothly.",
                instruction: "Practice the Right Hand melody transitions carefully.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 14100,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Fur_Elise_Simplified.musicxml',
                presetId: 'preset-fur-elise-simple'
            },
            {
                id: 'c10-l4', bpm: 80, courseId: "classical-conservatory-1",
                name: "Song: Prelude in C Major (Bach)",
                description: "Play Bach's legendary arpeggiated prelude.",
                focus: "Play even flowing broken chords. Keep a steady tempo.",
                instruction: "Focus on finger coordination to keep arpeggios flowing.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 14400,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Prelude_No._1_in_C_Major_BWV_846_with_finger_suggestions_-_Johann_Sebastian_Bach.mxl',
                presetId: 'preset-bach-prelude'
            },
            {
                id: 'c10-l5', bpm: 80, courseId: "classical-conservatory-1",
                name: "Song: Waltz in A Minor (Chopin)",
                description: "Play Chopin's expressive romantic waltz.",
                focus: "Practice the 3/4 waltz rhythm. Emphasize the romantic styling.",
                instruction: "Combine Right Hand melody with Left Hand bass-chord accompaniment.",
                type: 'song', topic: 'both', xpReward: 500, requiredXp: 15000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Waltz_in_A_MinorChopin.mxl',
                presetId: 'preset-chopin-waltz'
            }
        ]
    },
    {
        id: "scales-mastery",
        name: "Course 11: Scales & Key Signatures Mastery",
        order: 11,
        description: "Master the linear finger patterns, hand transitions, and key signatures of major and minor scales.",
        lessons: [
            {
                id: 'c11-l1', bpm: 75, courseId: "scales-mastery",
                name: "C Major Scale & Coordination",
                description: "Play a full one-octave C Major scale up and down, practicing finger crossings (thumb tucks and finger cross-overs).",
                focus: "Cross thumb under finger 3 (RH ascending / LH descending) and finger 3 over thumb (RH descending / LH ascending).",
                instruction: "Play stepwise motions up and down the C position.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 15500,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"], bassRange: ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4"], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: 'c11-l2', bpm: 75, courseId: "scales-mastery",
                name: "G Major Scale (F# Accidental)",
                description: "Practice G Major, introducing the F# accidental in both clefs with longer scalar runs.",
                focus: "Smoothly cross under after the 3rd note. Keep all F notes sharp.",
                instruction: "Cross fingers cleanly. Notice the G Major key signature active in both clefs.",
                type: 'exercise', topic: 'both', xpReward: 150, requiredXp: 15800,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f#/5", "g/5"], bassRange: ["g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f#/4", "g/4"], rhythms: ["q", "h", "8"], maxJumps: 1, chordsAllowed: false, numNotes: 48, keySignature: "G" }
            },
            {
                id: 'c11-l3', bpm: 70, courseId: "scales-mastery",
                name: "F Major Scale (Bb Accidental)",
                description: "Navigate F Major, which uses Bb. Note that the Right Hand crosses on the 4th note (F-G-A-Bb, cross thumb under to C).",
                focus: "RH thumb tucks under finger 4 on Bb to reach C. Do not use finger 5 on Bb.",
                instruction: "Smoothly transition. Watch for the Bb flat sign in both clefs.",
                type: 'exercise', topic: 'both', xpReward: 150, requiredXp: 16100,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["f/4", "g/4", "a/4", "bb/4", "c/5", "d/5", "e/5", "f/5"], bassRange: ["f/3", "g/3", "a/3", "bb/3", "c/4", "d/4", "e/4", "f/4"], rhythms: ["q", "h", "8"], maxJumps: 1, chordsAllowed: false, numNotes: 48, keySignature: "F" }
            },
            {
                id: 'c11-l4', bpm: 70, courseId: "scales-mastery",
                name: "A Minor Scale (Natural & Harmonic)",
                description: "Learn A Minor. Contrast the natural minor scale with the harmonic minor (which raises G to G#).",
                focus: "Listen for the wide step-and-a-half leap between F and G# in the harmonic minor.",
                instruction: "Watch for the G# accidental. Read and play the intervals carefully.",
                type: 'exercise', topic: 'both', xpReward: 180, requiredXp: 16400,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g#/5", "a/5"], bassRange: ["a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g#/4", "a/4"], rhythms: ["q", "h", "8"], maxJumps: 2, chordsAllowed: false, numNotes: 48 }
            },
            {
                id: 'c11-l5', bpm: 75, courseId: "scales-mastery",
                name: "Scales Mastery Capstone",
                description: "A long, challenging exercise combining C Major, G Major, and F Major scalar runs in both hands.",
                focus: "Transition between different key signatures and scale structures fluidly.",
                instruction: "The ultimate scales test. Keep your fingers curved and play evenly.",
                type: 'exercise', topic: 'both', xpReward: 250, requiredXp: 16800,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5"], bassRange: ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4"], rhythms: ["q", "h", "8"], maxJumps: 2, chordsAllowed: true, numNotes: 64 }
            }
        ]
    },
    {
        id: "arpeggios-mastery",
        name: "Course 12: Arpeggios & Broken Triads",
        order: 12,
        description: "Learn to play sweeping, fluid arpeggios and broken chord patterns across multiple registers.",
        lessons: [
            {
                id: 'c12-l1', bpm: 75, courseId: "arpeggios-mastery",
                name: "C Major Arpeggios (Basic)",
                description: "Play sweeping C Major arpeggios (C-E-G-C) up and down using tucks and crossovers.",
                focus: "Cross thumb under finger 3 to reach the higher octave. Play evenly and smoothly.",
                instruction: "Focus on finger coordination to keep arpeggios flowing.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 17200,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "e/4", "g/4", "c/5"], bassRange: ["c/3", "e/3", "g/3", "c/4"], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: 'c12-l2', bpm: 75, courseId: "arpeggios-mastery",
                name: "G Major & F Major Arpeggios",
                description: "Practice arpeggiating G Major (G-B-D-G) and F Major (F-A-C-F) triads.",
                focus: "Adapt to the slightly wider physical shapes of these major chords.",
                instruction: "Maintain hand relaxation as you expand your finger spacing.",
                type: 'exercise', topic: 'both', xpReward: 150, requiredXp: 17500,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "g/5"], bassRange: ["f/3", "g/3", "a/3", "b/3", "c/4", "d/4", "g/4"], rhythms: ["q", "h", "8"], maxJumps: 4, chordsAllowed: false, numNotes: 48 }
            },
            {
                id: 'c12-l3', bpm: 70, courseId: "arpeggios-mastery",
                name: "Minor Triad Arpeggios",
                description: "Play arpeggios of minor triads: A minor (A-C-E-A), E minor (E-G-B-E), and D minor (D-F-A-D).",
                focus: "Notice the darker quality of minor thirds in the chord shapes.",
                instruction: "Keep your finger weight even as you move across the keys.",
                type: 'exercise', topic: 'both', xpReward: 180, requiredXp: 17800,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["a/4", "c/5", "d/5", "e/5", "f/5", "a/5"], bassRange: ["a/3", "c/4", "d/4", "e/4", "f/4", "a/4"], rhythms: ["q", "h", "8"], maxJumps: 4, chordsAllowed: false, numNotes: 48 }
            },
            {
                id: 'c12-l4', bpm: 70, courseId: "arpeggios-mastery",
                name: "Seventh Chord Arpeggios",
                description: "Navigate four-note chord arpeggios: C Major 7 (C-E-G-B) and Dominant 7 (G-B-D-F).",
                focus: "Four-note arpeggios require using finger 4 to stretch across the full chord width before crossing.",
                instruction: "Align your wrist rotation to keep the thumb crossover fluid.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 18100,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "e/4", "f/4", "g/4", "b/4", "d/5", "f/5"], bassRange: ["c/3", "e/3", "f/3", "g/3", "b/3", "d/4", "f/4"], rhythms: ["q", "h", "8"], maxJumps: 4, chordsAllowed: false, numNotes: 48 }
            },
            {
                id: 'c12-l5', bpm: 75, courseId: "arpeggios-mastery",
                name: "Arpeggios Mastery Capstone",
                description: "A comprehensive exercise combining major, minor, and seventh arpeggios across multiple octaves.",
                focus: "Perform sweeping run transitions smoothly without letting the hand tense up.",
                instruction: "The ultimate arpeggio challenge. Keep your hand completely fluid.",
                type: 'exercise', topic: 'both', xpReward: 300, requiredXp: 18500,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: ["c/4", "e/4", "g/4", "b/4", "c/5", "e/5", "g/5", "b/5"], bassRange: ["c/3", "e/3", "g/3", "b/3", "c/4", "e/4", "g/4", "b/4"], rhythms: ["q", "h", "8"], maxJumps: 4, chordsAllowed: true, numNotes: 64 }
            }
        ]
    },
    {
        id: "baroque-chopin",
        name: "Course 13: Baroque Polyphony & Chopin Etudes",
        order: 13,
        description: "Master two-part contrapuntal voicing, rubato expression, and complex romantic arpeggiated accompaniments.",
        lessons: [
            {
                id: 'c13-l1', bpm: 80, courseId: "baroque-chopin",
                name: "Song: Minuet in G Minor (Bach)",
                description: "Navigate Bach's beautiful G minor minuet with counterpoint lines.",
                focus: "Keep both hands independent. Remember to flat B and E notes according to the key signature.",
                instruction: "Focus on voice leading: listen to how treble and bass voices interact.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 19000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/bach_minuet_g_minor.musicxml',
                presetId: 'preset-bach-minuet-g-minor'
            },
            {
                id: 'c13-l2', bpm: 80, courseId: "baroque-chopin",
                name: "Song: Waltz in A Minor (Chopin)",
                description: "Embellish Chopin's nostalgic romantic waltz theme.",
                focus: "Coordinate left-hand bass jumps with right-hand triplets and expressive trills.",
                instruction: "Focus on phrasing and slight tempo flexibility (rubato) for romantic styling.",
                type: 'song', topic: 'both', xpReward: 280, requiredXp: 19500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Waltz_in_A_MinorChopin.mxl',
                presetId: 'preset-chopin-waltz-aminor'
            },
            {
                id: 'c13-l3', bpm: 75, courseId: "baroque-chopin",
                name: "Song: Fugue No. 1 in C Major (Bach)",
                description: "Practice the opening portion of Bach's C Major Fugue from the Well-Tempered Clavier.",
                focus: "Polyphony requires voicing: project the main fugal subject whenever it enters in a new voice.",
                instruction: "Maintain a completely steady pulse. Bach's fugues require absolute precision.",
                type: 'song', topic: 'both', xpReward: 320, requiredXp: 20000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Fugue_I_in_C_major_BWV_846_-_Well_Tempered_Clavier_First_Book.mxl',
                presetId: 'preset-bach-fugue'
            },
            {
                id: 'c13-l4', bpm: 70, courseId: "baroque-chopin",
                name: "Song: Nocturne in Eb Major (Chopin)",
                description: "Perform Chopin's famous lyrical Nocturne Op. 9 No. 2.",
                focus: "Navigate the wide-spanning left-hand arpeggios that support the expressive right-hand melody.",
                instruction: "Voicing is key. Keep the accompaniment soft while the melody sings out.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 20500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major.mxl',
                presetId: 'preset-chopin-nocturne92'
            },
            {
                id: 'c13-l5', bpm: 70, courseId: "baroque-chopin",
                name: "Song: Toccata & Fugue in D Minor (Bach)",
                description: "The ultimate baroque capstone. Coordinate counterpoint and rapid runs.",
                focus: "Manage dramatic voicing shifts and coordinate polyphonic textures across both hands.",
                instruction: "Perform with power and precision. Coordinate the dramatic thematic returns.",
                type: 'song', topic: 'both', xpReward: 400, requiredXp: 21000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Bach_Toccata_and_Fugue_in_D_Minor_Piano_solo.mxl',
                presetId: 'preset-bach-toccata'
            }
        ]
    },
    {
        id: "romantic-impressionism",
        name: "Course 14: Romantic Lyricism & Impressionism",
        order: 14,
        description: "Master Debussy's impressionist textures, Einaudi's modern minimalism, and Chopin's late-romantic phrasing.",
        lessons: [
            {
                id: 'c14-l1', bpm: 80, courseId: "romantic-impressionism",
                name: "Song: Nuvole Bianche (Einaudi)",
                description: "Play Einaudi's famous contemporary minimalist masterwork.",
                focus: "Practice maintaining a constant flowing left-hand pattern with right-hand syncopation.",
                instruction: "Focus on even tempo and lyrical phrasing of the repeating motifs.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 21500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Nuvole_Bianche.mxl',
                presetId: 'preset-nuvole-bianche-easy'
            },
            {
                id: 'c14-l2', bpm: 75, courseId: "romantic-impressionism",
                name: "Song: Arabesque No. 1 (Debussy)",
                description: "Navigate Debussy's beautiful impressionist Arabesque in E Major.",
                focus: "Practice playing polyrhythms (3 against 2) smoothly between hands.",
                instruction: "Keep your touch light and airy to evoke Debussy's impressionist textures.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 22000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Arabesque_L._66_No._1_in_E_Major.mxl',
                presetId: 'preset-debussy-arabesque1'
            },
            {
                id: 'c14-l3', bpm: 75, courseId: "romantic-impressionism",
                name: "Song: Waltz in C# Minor (Chopin)",
                description: "Play Chopin's famous lyrical C# minor waltz (Op. 64 No. 2).",
                focus: "Practice the syncopated tempo change (più lento) and rapid runs.",
                instruction: "Listen to the voice leading of the inner lines in the waltz accompaniment.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 22500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Waltz_Opus_64_No._2_in_C_Minor.mxl',
                presetId: 'preset-chopin-waltz-csharp'
            },
            {
                id: 'c14-l4', bpm: 70, courseId: "romantic-impressionism",
                name: "Song: Clair de Lune (Debussy)",
                description: "The ultimate impressionist masterpiece. Perform Clair de Lune.",
                focus: "Practice wide hand stretches, compound time signature (9/8), and delicate dynamics.",
                instruction: "Focus on color and atmosphere. Keep the accompaniment extremely soft.",
                type: 'song', topic: 'both', xpReward: 400, requiredXp: 23000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Clair_de_Lune__Debussy.mxl',
                presetId: 'preset-clairlune'
            }
        ]
    },
    {
        id: "classical-sonatas",
        name: "Course 15: Classical Sonatas & Symphonies",
        order: 15,
        description: "Master symphonic reductions, classical sonata structures, dynamic contrast, and classical precision.",
        lessons: [
            {
                id: 'c15-l1', bpm: 60, courseId: "classical-sonatas",
                name: "Song: Moonlight Sonata (Beethoven)",
                description: "Perform the famous triplet-driven Adagio Sostenuto first movement.",
                focus: "Keep the triplet accompaniment completely quiet while projecting the dotted melody line.",
                instruction: "Focus on long-held bass octaves and slow, singing melody voicing.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 23500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Sonate_No._14_Moonlight_1st_Movement.mxl',
                presetId: 'preset-beethoven-moonlight1'
            },
            {
                id: 'c15-l2', bpm: 65, courseId: "classical-sonatas",
                name: "Song: Ständchen / Serenade (Schubert)",
                description: "Play Liszt's famous piano transcription of Schubert's vocal Serenade.",
                focus: "Practice coordinating the alternating chord accompaniment with the vocal melody.",
                instruction: "Focus on singing tone quality and steady triplet pulse coordination.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 24000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Schubert_Serenade_-_Standchen_-_By_Lizst.mxl',
                presetId: 'preset-schubert-serenade'
            },
            {
                id: 'c15-l3', bpm: 60, courseId: "classical-sonatas",
                name: "Song: Pathetique Sonata - Adagio (Beethoven)",
                description: "Navigate the expressive slow movement from Beethoven's Pathetique Sonata.",
                focus: "Voicing is critical: separate the melody, middle-register accompaniment, and bass lines.",
                instruction: "Keep your wrists completely relaxed to achieve a warm, singing piano tone.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 24500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Sonate_No._8_Pathetique_2nd_Movement.mxl',
                presetId: 'preset-beethoven-pathetique2'
            },
            {
                id: 'c15-l4', bpm: 80, courseId: "classical-sonatas",
                name: "Song: Rondo alla Turca (Mozart)",
                description: "Play Mozart's famous Turkish March theme from Sonata K. 331.",
                focus: "Master quick sixteenth note runs, ornamentation, and clean rolled left-hand chords.",
                instruction: "Maintain a light, crisp, and driving classical articulation throughout.",
                type: 'song', topic: 'both', xpReward: 400, requiredXp: 25000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Piano_Sonata_No._11_K._331_3rd_Movement_Rondo_alla_Turca.mxl',
                presetId: 'preset-mozart-rondo'
            },
            {
                id: 'c15-l5', bpm: 90, courseId: "classical-sonatas",
                name: "Song: Symphony No. 5 (Beethoven)",
                description: "The ultimate sonata capstone. Perform the dramatic opening movement.",
                focus: "Coordinate the famous four-note opening motif and manage rapid symphonic-style leaps.",
                instruction: "Perform with massive dramatic power and absolute rhythmic precision.",
                type: 'song', topic: 'both', xpReward: 450, requiredXp: 25500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Beethoven_Symphony_No._5_1st_movement_Piano_solo.mxl',
                presetId: 'preset-beethoven-symphony5'
            }
        ]
    },
    {
        id: "pop-standards",
        name: "Course 16: Pop, Folk, & Ragtime Standards",
        order: 16,
        description: "Explore contemporary pop structures, lively ragtime syncopations, and iconic folk and game music.",
        lessons: [
            {
                id: 'c16-l1', bpm: 75, courseId: "pop-standards",
                name: "Song: Canon in D (Pachelbel)",
                description: "Perform Pachelbel's famous ground-bass classical-pop crossover standard.",
                focus: "Practice coordinating repeating left-hand chord progressions with flowing right-hand scales.",
                instruction: "Keep your left hand extremely steady as the right hand builds complexity.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 26000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Canon_in_D.mxl',
                presetId: 'preset-canon'
            },
            {
                id: 'c16-l2', bpm: 110, courseId: "pop-standards",
                name: "Song: Sea Shanty 2 (RuneScape)",
                description: "Perform Jagex's nostalgic maritime track from RuneScape.",
                focus: "Practice driving syncopated melodies and jumping chords at a brisk, dancing tempo.",
                instruction: "Focus on clean hand coordination and articulation to bring out the bright folk texture.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 26500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Sea_Shanty_2_-_Runescape.mxl',
                presetId: 'preset-runescape-shanty'
            },
            {
                id: 'c16-l3', bpm: 80, courseId: "pop-standards",
                name: "Song: Always Remember Us This Way (Lady Gaga)",
                description: "Play Lady Gaga's emotional piano ballad from A Star Is Born.",
                focus: "Practice playing lyrical pop syncopations, block chord changes, and rubato phrasing.",
                instruction: "Listen closely to lead-in beats and keep the melodic vocal phrasing expressive.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 27000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Always_remember_us_this_way__Lady_Gaga.mxl',
                presetId: 'preset-ladygaga'
            },
            {
                id: 'c16-l4', bpm: 75, courseId: "pop-standards",
                name: "Song: Let Her Go (Passenger)",
                description: "Play Passenger's beautiful acoustic-folk guitar transition standard.",
                focus: "Practice arpeggiated pop chords and smooth, singing right-hand runs.",
                instruction: "Keep the tempo flowing and use a gentle touch for the accompaniment register.",
                type: 'song', topic: 'both', xpReward: 380, requiredXp: 27500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Let_Her_Go_Passenger.mxl',
                presetId: 'preset-passenger'
            },
            {
                id: 'c16-l5', bpm: 85, courseId: "pop-standards",
                name: "Song: The Entertainer (Joplin)",
                description: "The ultimate ragtime capstone. Perform Scott Joplin's famous syncopation.",
                focus: "Coordinate the stride left-hand bass jumps with syncopated right-hand octaves.",
                instruction: "Do not play too fast. Keep the ragtime swing rhythm light and strictly in time.",
                type: 'song', topic: 'both', xpReward: 450, requiredXp: 28000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/The_Entertainer_-_Scott_Joplin.mxl',
                presetId: 'preset-joplin-entertainer'
            }
        ]
    },
    {
        id: "contemporary-neoclassical",
        name: "Course 17: Contemporary Neo-Classical & Ballads",
        order: 17,
        description: "Master modern minimalist patterns, rich left-hand arpeggios, and expressive cinematic themes.",
        lessons: [
            {
                id: 'c17-l1', bpm: 70, courseId: "contemporary-neoclassical",
                name: "Song: Kiss the Rain (Yiruma)",
                description: "Play Yiruma's famous warm and lyrical contemporary piano ballad.",
                focus: "Practice smooth weight transfers and singing right-hand phrasing with rolled chords.",
                instruction: "Focus on legato connections and keeping the emotional melody prominent.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 28500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Kiss_the_Rain_-_Yiruma.mxl',
                presetId: 'preset-yiruma'
            },
            {
                id: 'c17-l2', bpm: 75, courseId: "contemporary-neoclassical",
                name: "Song: Sunlight (Andrea Vanzo)",
                description: "Perform Andrea Vanzo's beautiful, flowing neo-classical composition.",
                focus: "Practice maintaining a constant, flowing eighth note left-hand arpeggiated movement.",
                instruction: "Focus on absolute rhythmic evenness and a light, singing tone.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 29000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/sunlight-andrea-vanzo.mxl',
                presetId: 'preset-vanzo'
            },
            {
                id: 'c17-l3', bpm: 80, courseId: "contemporary-neoclassical",
                name: "Song: Comptine d'un autre été (Yann Tiersen)",
                description: "Play the famous theme from Amélie. Master structured minimalist phrasing.",
                focus: "Practice the repeating left-hand chordal pattern while building right-hand themes.",
                instruction: "Keep your left hand extremely steady and use subtle dynamic waves to shape the piece.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 29500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/comptine_tiersen.musicxml',
                presetId: 'preset-tiersen-comptine'
            },
            {
                id: 'c17-l4', bpm: 75, courseId: "contemporary-neoclassical",
                name: "Song: Mariage d'Amour (Clayderman)",
                description: "The contemporary capstone. Perform this beloved romantic piano standard.",
                focus: "Coordinate wide-spanning left-hand runs with syncopated right-hand octaves and turns.",
                instruction: "Perform with expressive phrasing (rubato) and keep the middle-register voicing clean.",
                type: 'song', topic: 'both', xpReward: 400, requiredXp: 30000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Mariage_dAmour.mxl',
                presetId: 'preset-mariagedamour'
            }
        ]
    },
    {
        id: "virtuoso-drama",
        name: "Course 18: Virtuoso Showpieces & Drama",
        order: 18,
        description: "Develop technical finger dexterity, deep emotional expression, and handle rapid chromatic runs.",
        lessons: [
            {
                id: 'c18-l1', bpm: 60, courseId: "virtuoso-drama",
                name: "Song: Gnossienne No. 1 (Satie)",
                description: "Perform Satie's hauntingly mystical, rhythmic Gnossienne.",
                focus: "Practice coordinating the block left-hand chords with the exotic, free-flowing right-hand melody.",
                instruction: "Keep the tempo completely open and free-flowing. Let the silences ring.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 30500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Gnossienne_No._1.mxl',
                presetId: 'preset-satie'
            },
            {
                id: 'c18-l2', bpm: 70, courseId: "virtuoso-drama",
                name: "Song: Swan Lake (Tchaikovsky)",
                description: "Play Tchaikovsky's legendary, dramatic orchestral theme on piano.",
                focus: "Practice large dynamic swells (crescendo/decrescendo) and coordinate thick chordal textures.",
                instruction: "Play with intense dramatic weight. Make the theme soar in the right hand.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 31000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Swan_Lake.mxl',
                presetId: 'preset-tchaikovsky-swanlake'
            },
            {
                id: 'c18-l3', bpm: 75, courseId: "virtuoso-drama",
                name: "Song: Dance of the Sugar Plum Fairy (Tchaikovsky)",
                description: "Play the whimsical and syncopated winter holiday theme.",
                focus: "Master crisp, staccato articulation and quick right-hand jumps.",
                instruction: "Keep your fingers light and bouncy to evoke the sound of the celeste.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 31500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Dance_of_the_sugar_plum_fairy.mxl',
                presetId: 'preset-sugarplum'
            },
            {
                id: 'c18-l4', bpm: 60, courseId: "virtuoso-drama",
                name: "Song: Lacrimosa (Mozart)",
                description: "Perform the tragic, chorale-textured Lacrimosa from Mozart's Requiem.",
                focus: "Coordinate the weeping violin string pattern and full four-voice vocal chord structures.",
                instruction: "Keep the tempo slow and heavy. Voicing must sound warm and vocal.",
                type: 'song', topic: 'both', xpReward: 400, requiredXp: 32000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Lacrimosa_-_Requiem.mxl',
                presetId: 'preset-mozart-lacrimosa'
            },
            {
                id: 'c18-l5', bpm: 120, courseId: "virtuoso-drama",
                name: "Song: Flight of the Bumblebee (Rimsky-Korsakov)",
                description: "The ultimate capstone showpiece. Navigate rapid chromatic runs.",
                focus: "Practice rapid, continuous sixteenth note chromatic runs and quick hand interchanges.",
                instruction: "Start extremely slow. Build speed only when your fingers are completely relaxed.",
                type: 'song', topic: 'both', xpReward: 500, requiredXp: 32500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Flight_of_the_Bumblebee.mxl',
                presetId: 'preset-bumblebee'
            }
        ]
    },
    {
        id: "epic-standards",
        name: "Course 19: Epic Film, Gaming, & Holiday Masterworks",
        order: 19,
        description: "Explore dramatic cinematic themes, nostalgic game music, and intense classical dances.",
        lessons: [
            {
                id: 'c19-l1', bpm: 90, courseId: "epic-standards",
                name: "Song: Bella Ciao (Money Heist)",
                description: "Perform this lively, dramatic Italian protest and cinematic standard.",
                focus: "Coordinate the syncopated right-hand melody with dry left-hand chords.",
                instruction: "Focus on crisp staccato chords and maintaining a steady, driving march beat.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 33000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Bella_Ciao_-_La_Casa_de_Papel.mxl',
                presetId: 'preset-bellaciao-filmtv'
            },
            {
                id: 'c19-l2', bpm: 75, courseId: "epic-standards",
                name: "Song: Autumn Voyage (RuneScape)",
                description: "Journey through RuneScape's legendary, nostalgic fantasy soundtrack.",
                focus: "Practice coordinating clean left-hand bass intervals with the whimsical right-hand melody.",
                instruction: "Play with a warm, steady, and storybook-like fantasy expression.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 33500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Autumn_Voyage_-_Runescape.mxl',
                presetId: 'preset-runescape-autumn'
            },
            {
                id: 'c19-l3', bpm: 80, courseId: "epic-standards",
                name: "Song: Carol of the Bells",
                description: "Master the hypnotic, rapidly cascading holiday classic.",
                focus: "Practice the repeating four-note ostinato pattern and coordinating sweeping left-hand responses.",
                instruction: "Keep your tempo perfectly steady. Let the dynamic waves build like ringing bells.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 34000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Carol_of_the_Bells.mxl',
                presetId: 'preset-carol-bells'
            },
            {
                id: 'c19-l4', bpm: 100, courseId: "epic-standards",
                name: "Song: Hungarian Dance No. 5 (Brahms) [Capstone]",
                description: "The epic capstone. Play Brahms' dramatic and fiery dance.",
                focus: "Coordinate sudden tempo fluctuations (rubato), rapid jumps, and intense chordal peaks.",
                instruction: "Exaggerate the contrast between slow, heavy sections and rapid, light, bouncy sections.",
                type: 'song', topic: 'both', xpReward: 450, requiredXp: 34500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Hungarian_Dance_No_5_in_G_Minor.mxl',
                presetId: 'preset-brahms-hungarian5'
            }
        ]
    },
    {
        id: "virtuoso-conservatory",
        name: "Course 20: Virtuoso Conservatory Level 2",
        order: 20,
        description: "The ultimate advanced piano curriculum. Conquer Chopin's lyricism, Liszt's sweep, and Bach's polyphonic counterpoint.",
        lessons: [
            {
                id: 'c20-l1', bpm: 90, courseId: "virtuoso-conservatory",
                name: "Song: Arabesque (Burgmüller)",
                description: "Play Burgmüller's rapid, flowing Romantic study in A minor.",
                focus: "Practice rapid, even five-finger patterns and dynamic left-hand accompaniment.",
                instruction: "Keep your wrists flexible. Accentuate the sudden shifts between minor mystery and major light.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 35000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/arabesque_burgmuller.musicxml',
                presetId: 'preset-burgmuller-arabesque'
            },
            {
                id: 'c20-l2', bpm: 80, courseId: "virtuoso-conservatory",
                name: "Song: Waltz in C# Minor (Chopin)",
                description: "Perform Chopin's melancholic, elegant, and complex late Romantic masterpiece.",
                focus: "Master the rapid right-hand running themes and coordination of wide left-hand bass-chord jumps.",
                instruction: "Let the tempo breathe (rubato) during the lyrical melodies. Keep the running theme completely even.",
                type: 'song', topic: 'both', xpReward: 350, requiredXp: 35500,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Waltz_Opus_64_No._2_in_C_Minor.mxl',
                presetId: 'preset-chopin-waltz-csharp'
            },
            {
                id: 'c20-l3', bpm: 70, courseId: "virtuoso-conservatory",
                name: "Song: Liebestraum No. 3 (Liszt)",
                description: "Navigate Franz Liszt's famous, soaring romantic dream of love.",
                focus: "Coordinate the cross-hand accompaniment lines and broad, arpeggiated rolls.",
                instruction: "Voicing is critical: bring out the inner melody in the thumbs. Play arpeggios gracefully.",
                type: 'song', topic: 'both', xpReward: 400, requiredXp: 36000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Liebestraum_No._3_in_A_Major.mxl',
                presetId: 'preset-liszt-liebestraum'
            },
            {
                id: 'c20-l4', bpm: 80, courseId: "virtuoso-conservatory",
                name: "Song: Toccata & Fugue in D Minor (Bach) [Grand Capstone]",
                description: "The ultimate peak of the conservatory. Play Bach's dramatic, thundering organ masterwork.",
                focus: "Coordinate massive, thundering double-hand block chords, rapid runs, and dramatic pauses.",
                instruction: "Play with immense, thundering power. Articulate every run with crisp baroque clarity.",
                type: 'song', topic: 'both', xpReward: 500, requiredXp: 37000,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Bach_Toccata_and_Fugue_in_D_Minor_Piano_solo.mxl',
                presetId: 'preset-bach-toccata'
            }
        ]
    }
];
export const getLessonById = (id: string): Lesson | undefined => {
    for (const course of courses) {
        const found = course.lessons.find((l) => l.id === id);
        if (found) return found;
    }
    return undefined;
};

export const isLessonCapstone = (lesson: Lesson): boolean => {
    const course = courses.find(c => c.id === lesson.courseId);
    if (!course) return false;
    const idx = course.lessons.findIndex(l => l.id === lesson.id);
    return idx === course.lessons.length - 1;
};

export const getLessonUnlockedStatus = (lesson: Lesson, completedIds: Set<string>, userXp: number): boolean => {
    // Admin mode bypass
    if (typeof window !== 'undefined' && localStorage.getItem('adminMode') === 'true') return true;

    // Check custom prerequisites if defined - they MUST be met
    if (lesson.prerequisites && lesson.prerequisites.length > 0) {
        const prerequisitesMet = lesson.prerequisites.every(prereqId => completedIds.has(prereqId));
        if (!prerequisitesMet) return false;
    }

    // Hybrid XP Unlock: if user has reached the required XP, they bypass sequential course progression
    if (userXp >= lesson.requiredXp) return true;

    const courseIndex = courses.findIndex(c => c.id === lesson.courseId);
    if (courseIndex === -1) return false;
    
    const course = courses[courseIndex];
    const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id);
    if (lessonIndex === -1) return false;
    
    // First lesson of the first course is unlocked by default
    if (courseIndex === 0 && lessonIndex === 0) return true;
    
    // If it's not the first lesson of this course, the previous lesson in this course must be completed
    if (lessonIndex > 0) {
        return completedIds.has(course.lessons[lessonIndex - 1].id);
    }
    
    // If it's the first lesson of a subsequent course, the last lesson of the previous course must be completed
    if (courseIndex > 0) {
        const prevCourse = courses[courseIndex - 1];
        const lastLessonOfPrevCourse = prevCourse.lessons[prevCourse.lessons.length - 1];
        return completedIds.has(lastLessonOfPrevCourse.id);
    }
    
    return false;
};
