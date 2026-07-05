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
                    trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 62,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },

                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "h" },

                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["c/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "8" }, { keys: ["f/4"], duration: "8" }, { keys: ["e/4"], duration: "q" }, { keys: ["c/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "8" }, { keys: ["f/4"], duration: "8" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },

                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "h" }
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
                    trebleRange: ["g/4", "a/4", "b/4", "c/5", "d/5"], bassRange: [], rhythms: ["q", "h", "h."], maxJumps: 5, chordsAllowed: false, numNotes: 14,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["g/4"], duration: "hr" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["c/5"], duration: "h" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["g/4"], duration: "h" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["d/5"], duration: "h" }, { keys: ["c/5"], duration: "q" },
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
                    trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"], bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 2, chordsAllowed: false, numNotes: 47,
                    presetMelody: {
                        treble: [
                            { keys: ["d/4"], duration: 'q' }, { keys: ["c/4"], duration: 'h' }, { keys: ["c/4"], duration: 'q' },
                            { keys: ["e/4"], duration: 'q' }, { keys: ["f/4"], duration: 'q' }, { keys: ["g/4"], duration: 'q' }, { keys: ["a/4"], duration: 'q' },
                            { keys: ["b/4"], duration: 'q' }, { keys: ["c/5"], duration: 'q' }, { keys: ["b/4"], duration: 'q' }, { keys: ["a/4"], duration: 'q' },
                            { keys: ["a/4"], duration: 'h' }, { keys: ["a/4"], duration: 'q' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["a/4"], duration: 'q' }, { keys: ["b/4"], duration: 'q' }, { keys: ["a/4"], duration: 'q' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["f/4"], duration: 'q' }, { keys: ["a/4"], duration: 'q' }, { keys: ["g/4"], duration: 'h' },
                            { keys: ["f/4"], duration: 'w' },
                            { keys: ["g/4"], duration: 'q' }, { keys: ["f/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["d/4"], duration: 'q' },
                            { keys: ["c/4"], duration: 'h' }, { keys: ["e/4"], duration: 'q' }, { keys: ["g/4"], duration: 'q' },
                            { keys: ["a/4"], duration: 'h' }, { keys: ["f/4"], duration: 'q' }, { keys: ["a/4"], duration: 'q' },
                            { keys: ["g/4"], duration: 'q' }, { keys: ["f/4"], duration: 'q' }, { keys: ["e/4"], duration: 'q' }, { keys: ["d/4"], duration: 'q' },
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
                    trebleRange: [], bassRange: ["b/2", "c/3", "d/3", "e/3", "g/3"], rhythms: ["q", "h", "w"], maxJumps: 3, chordsAllowed: false, numNotes: 46,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["e/3"], duration: 'h' }, { keys: ["e/3"], duration: 'q' }, { keys: ["g/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'h' },
                            { keys: ["b/2"], duration: 'w' },
                            
                            { keys: ["e/3"], duration: 'h' }, { keys: ["e/3"], duration: 'q' }, { keys: ["g/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'h' },
                            { keys: ["b/2"], duration: 'w' },
                            
                            { keys: ["e/3"], duration: 'h' }, { keys: ["e/3"], duration: 'q' }, { keys: ["g/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
                            { keys: ["c/3"], duration: 'q' }, { keys: ["b/2"], duration: 'h.' },
                            
                            { keys: ["e/3"], duration: 'h' }, { keys: ["e/3"], duration: 'q' }, { keys: ["g/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'h' },
                            { keys: ["b/2"], duration: 'w' },
                            
                            { keys: ["e/3"], duration: 'h' }, { keys: ["e/3"], duration: 'q' }, { keys: ["g/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'h' },
                            { keys: ["b/2"], duration: 'w' },
                            
                            { keys: ["e/3"], duration: 'h' }, { keys: ["e/3"], duration: 'q' }, { keys: ["g/3"], duration: 'q' },
                            { keys: ["e/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' }, { keys: ["c/3"], duration: 'q' }, { keys: ["d/3"], duration: 'q' },
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
                    trebleRange: [], bassRange: ["f/2", "g/2", "a/2", "c/3", "d/3", "e/3"], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 32,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["c/3"], duration: "h" }, { keys: ["c/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["a/2"], duration: "h" }, { keys: ["a/2"], duration: "h" },
                            { keys: ["f/2"], duration: "h" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["c/3"], duration: "w" },
                            { keys: ["c/3"], duration: "h" }, { keys: ["c/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["a/2"], duration: "h" }, { keys: ["a/2"], duration: "h" },
                            { keys: ["f/2"], duration: "h" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["c/3"], duration: "w" },

                            { keys: ["c/3"], duration: "h" }, { keys: ["c/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["a/2"], duration: "h" }, { keys: ["a/2"], duration: "h" },
                            { keys: ["f/2"], duration: "h" }, { keys: ["g/2"], duration: "h" },
                            { keys: ["c/3"], duration: "w" },
                            { keys: ["c/3"], duration: "h" }, { keys: ["c/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["a/2"], duration: "h" }, { keys: ["a/2"], duration: "h" },
                            { keys: ["f/2"], duration: "h" }, { keys: ["g/2"], duration: "h" },
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
                    trebleRange: [], bassRange: ["g/2", "bb/2", "eb/2"], rhythms: ["q", "h", "w"], maxJumps: 4, chordsAllowed: false, numNotes: 11,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["eb/2"], duration: "q" },
                            { keys: ["bb/2"], duration: "q" }, { keys: ["g/2"], duration: "q" }, { keys: ["eb/2"], duration: "q" }, { keys: ["bb/2"], duration: "q" },
                            { keys: ["g/2"], duration: "w" }
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
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["c/4"], duration: "h" }, { keys: ["b/3"], duration: "h" },

                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" },
                            { keys: ["b/3"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["b/3"], duration: "q" },
                            { keys: ["c/4"], duration: "h" }, { keys: ["c/4"], duration: "h" }
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
        order: 9,
        lessons: [
            {
                id: 'c6-chord-l1', bpm: 80, courseId: "chords-harmony",
                name: "Triads: C & G Major Chords",
                description: "Form and play solid three-note C Major (C-E-G) and G Major (G-B-D) triads.",
                focus: "Keep your hand relaxed. Ensure all three notes sound exactly at the same instant.",
                instruction: "RH plays C triad (fingers 1-3-5 on C-E-G) and G triad (fingers 1-3-5 on G-B-D). Keep fingers close to the keys.",
                type: 'exercise', topic: 'chords', xpReward: 80, requiredXp: 6440,
                handPosition: 'RH_C_POS',
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
        order: 9,
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
                            { keys: ["b/4"], duration: "q" }, { keys: ["c/5"], duration: "q" }, { keys: ["c/4"], duration: "h" },
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
                    trebleRange: ["a/4", "d/5", "e/5", "f/5", "g/5", "a/5"], bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 5, chordsAllowed: false, numNotes: 21,
                    presetMelody: {
                        treble: [
                            { keys: ["a/4"], duration: "q" }, { keys: ["d/5"], duration: "q" }, { keys: ["f/5"], duration: "q" }, { keys: ["a/5"], duration: "q" },
                            { keys: ["g/5"], duration: "h" }, { keys: ["e/5"], duration: "h" },
                            { keys: ["d/5"], duration: "h" }, { keys: ["f/5"], duration: "q" }, { keys: ["e/5"], duration: "q" },
                            { keys: ["d/5"], duration: "w" },
                            { keys: ["a/4"], duration: "q" }, { keys: ["d/5"], duration: "q" }, { keys: ["f/5"], duration: "q" }, { keys: ["a/5"], duration: "q" },
                            { keys: ["g/5"], duration: "h" }, { keys: ["e/5"], duration: "h" },
                            { keys: ["d/5"], duration: "h" }, { keys: ["f/5"], duration: "q" }, { keys: ["e/5"], duration: "q" },
                            { keys: ["d/5"], duration: "w" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: 'c6-l5-song-popular', bpm: 85, courseId: 'expanding-positions',
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
        order: 9,
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
                    trebleRange: trebleSharps, bassRange: [], rhythms: ["q", "h", "h."], maxJumps: 4, chordsAllowed: false, numNotes: 27,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["e/5"], duration: "qr" }, { keys: ["e/5"], duration: "q" }, { keys: ["d#/5"], duration: "q" },
                            { keys: ["e/5"], duration: "q" }, { keys: ["d#/5"], duration: "q" }, { keys: ["e/5"], duration: "q" },
                            { keys: ["b/4"], duration: "q" }, { keys: ["d/5"], duration: "q" }, { keys: ["c/5"], duration: "q" },
                            { keys: ["a/4"], duration: "h." },
                            { keys: ["c/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["b/4"], duration: "h." },
                            { keys: ["e/4"], duration: "q" }, { keys: ["g#/4"], duration: "q" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["c/5"], duration: "h." },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/5"], duration: "q" }, { keys: ["d#/5"], duration: "q" },
                            { keys: ["e/5"], duration: "q" }, { keys: ["d#/5"], duration: "q" }, { keys: ["e/5"], duration: "q" },
                            { keys: ["b/4"], duration: "q" }, { keys: ["d/5"], duration: "q" }, { keys: ["c/5"], duration: "q" },
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
                    rhythms: ["q", "h", "h."],
                    maxJumps: 5,
                    chordsAllowed: false,
                    numNotes: 14,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["b/3"], duration: "hr" }, { keys: ["b/3"], duration: "q" },
                            { keys: ["e/4"], duration: "h" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["f#/4"], duration: "h" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["b/4"], duration: "h" }, { keys: ["a/4"], duration: "q" },
                            { keys: ["f#/4"], duration: "h." },
                            { keys: ["e/4"], duration: "h" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["f#/4"], duration: "h" }, { keys: ["d#/4"], duration: "q" },
                            { keys: ["f/4"], duration: "h" }, { keys: ["d/4"], duration: "q" },
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
                    trebleRange: ["a/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "bb/5"], bassRange: ["g/2", "a/2", "bb/2", "c/3", "d/3", "f/3"], rhythms: ["8", "q", "h", "qr"], maxJumps: 4, chordsAllowed: false, numNotes: 80,
                    timeSignature: "3/4",
                    presetMelody: {
                        treble: [
                            { keys: ["a/4"], duration: 'hr' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["d/5"], duration: 'q' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: 'q' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["g/5"], duration: '8' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["a/5"], duration: 'q' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["bb/5"], duration: '8' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["g/5"], duration: '8' },
                            { keys: ["f/5"], duration: 'q' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["d/5"], duration: 'q' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["a/4"], duration: '8' },
                            { keys: ["c/5"], duration: '8' },
                            { keys: ["d/5"], duration: 'q' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: 'q' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["g/5"], duration: '8' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["a/5"], duration: 'q' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["bb/5"], duration: '8' },
                            { keys: ["a/5"], duration: 'q' },
                            { keys: ["g/5"], duration: '8' },
                            { keys: ["a/5"], duration: 'q' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["d/5"], duration: 'q' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: 'q' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["g/5"], duration: '8' },
                            { keys: ["a/5"], duration: '8' },
                            { keys: ["a/5"], duration: 'q' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["d/5"], duration: '8' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["f/5"], duration: '8' },
                            { keys: ["g/5"], duration: 'q' },
                            { keys: ["e/5"], duration: '8' },
                            { keys: ["d/5"], duration: 'q' },
                            { keys: ["d/5"], duration: '8r' }
                        ],
                        bass: [
                            { keys: ["d/3"], duration: 'h.r' },
                            { keys: ["d/3"], duration: 'h' },
                            { keys: ["d/3"], duration: 'q' },
                            { keys: ["f/3"], duration: 'h' },
                            { keys: ["f/3"], duration: 'q' },
                            { keys: ["g/2"], duration: 'h' },
                            { keys: ["g/2"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' },
                            { keys: ["d/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' },
                            { keys: ["d/3"], duration: 'q' },
                            { keys: ["f/3"], duration: 'h' },
                            { keys: ["f/3"], duration: 'q' },
                            { keys: ["g/2"], duration: 'h' },
                            { keys: ["g/2"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' },
                            { keys: ["d/3"], duration: 'q' },
                            { keys: ["bb/2"], duration: 'h' },
                            { keys: ["bb/2"], duration: 'q' },
                            { keys: ["f/3"], duration: 'h' },
                            { keys: ["f/3"], duration: 'q' },
                            { keys: ["c/3"], duration: 'h' },
                            { keys: ["c/3"], duration: 'q' },
                            { keys: ["d/3"], duration: 'h' },
                            { keys: ["d/3"], duration: 'q' }
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

export const getLessonUnlockedStatus = (lesson: Lesson, completedIds: Set<string>, _userXp: number): boolean => {
    // Admin mode bypass
    if (typeof window !== 'undefined' && localStorage.getItem('adminMode') === 'true') return true;

    // Check custom prerequisites if defined
    if (lesson.prerequisites && lesson.prerequisites.length > 0) {
        return lesson.prerequisites.every(prereqId => completedIds.has(prereqId));
    }

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
