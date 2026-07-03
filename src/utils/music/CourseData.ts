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
        treble: { keys: string[]; duration: string }[];
        bass: { keys: string[]; duration: string }[];
    };
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
const lowerBass = ["f/2", "g/2", "a/2", "b/2", "c/3"];
const fullBass = ["f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4"];

// Accidentals & key signatures
const trebleSharps = ["c/4", "d/4", "e/4", "f#/4", "g/4", "a/4", "b/4", "c#/5"];
const trebleFlats = ["c/4", "d/4", "eb/4", "f/4", "g/4", "a/4", "bb/4", "c/5"];
const gMajorTreble = ["g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f#/5", "g/5"];

export const courses: Course[] = [
    {
        id: "keyboard-geography",
        name: "1. Keyboard Geography & Guide Notes",
        description: "Begin your journey by orienting yourself on the keyboard and learning the five primary guide notes on the staff.",
        order: 1,
        lessons: [
            {
                id: "c1-l1", courseId: "keyboard-geography",
                name: "Introduction to Middle C",
                description: "Locate Middle C using the pattern of two black keys.",
                focus: "Find Middle C in the center of your keyboard. It is directly to the left of the group of two black keys.",
                instruction: "Sit comfortably, and place your Right Hand Thumb (Finger 1) on Middle C. Play the notes as they appear on the screen.",
                type: 'exercise', topic: 'treble', xpReward: 50, requiredXp: 0,
                handPosition: 'RH_MIDDLE_C',
                constraints: { trebleRange: middleC, bassRange: [], rhythms: ["q", "h"], maxJumps: 0, chordsAllowed: false, numNotes: 10 }
            },
            {
                id: "c1-l2", courseId: "keyboard-geography",
                name: "Steps Above Middle C",
                description: "Play Middle C, D, and E in step-wise patterns.",
                focus: "Keep your knuckles elevated and your fingers naturally curved, as if holding a small ball.",
                instruction: "With your thumb on Middle C, place your index finger on D and middle finger on E. Play the steps as they ascend and descend.",
                type: 'exercise', topic: 'treble', xpReward: 50, requiredXp: 50,
                handPosition: 'RH_C_3FINGER',
                constraints: { trebleRange: trebleStepsD_E, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: "c1-l2-song", courseId: "keyboard-geography",
                name: "Melody: Mary Had a Little Lamb",
                description: "Play your first simple melody using notes C, D, E, and G.",
                focus: "Follow the rising and falling steps of the tune. Keep a steady pace.",
                instruction: "Place your Right Hand fingers in C Position. Follow the notes to play this classic nursery rhyme.",
                type: 'exercise', topic: 'treble', xpReward: 60, requiredXp: 100,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 26,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "h" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["g/4"], duration: "q" }, { keys: ["g/4"], duration: "h" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: "c1-l3", courseId: "keyboard-geography",
                name: "Treble Guide Note G",
                description: "Introduce the G4 landmark note on the second line of the treble staff.",
                focus: "The Treble Clef curl wraps around G4. Focus on identifying it instantly.",
                instruction: "Place your Right Hand Pinky (Finger 5) on G4. Practice playing steps surrounding this landmark note.",
                type: 'exercise', topic: 'treble', xpReward: 60, requiredXp: 160,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: "c1-l3-song", courseId: "keyboard-geography",
                name: "Melody: Ode to Joy Theme",
                description: "Play Beethoven's famous melody using all 5 notes in C Position.",
                focus: "Try to read ahead so you can play each note smoothly without pausing.",
                instruction: "Keep your hand in C Position. Play this simple and beautiful classical theme.",
                type: 'exercise', topic: 'treble', xpReward: 70, requiredXp: 220,
                handPosition: 'RH_C_POS',
                constraints: {
                    trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 15,
                    presetMelody: {
                        treble: [
                            { keys: ["e/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["g/4"], duration: "q" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["f/4"], duration: "q" }, { keys: ["e/4"], duration: "q" }, { keys: ["d/4"], duration: "q" },
                            { keys: ["c/4"], duration: "q" }, { keys: ["c/4"], duration: "q" }, { keys: ["d/4"], duration: "q" }, { keys: ["e/4"], duration: "q" },
                            { keys: ["e/4"], duration: "h" }, { keys: ["d/4"], duration: "q" }, { keys: ["d/4"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: "c1-l4", courseId: "keyboard-geography",
                name: "Bass Guide Note F",
                description: "Learn F3, the key landmark of the bass clef.",
                focus: "The Bass Clef's two dots surround F3. Press the keys using your left hand index finger.",
                instruction: "Place your Left Hand Index Finger (Finger 2) on F3. Play the step-wise notes centered around it.",
                type: 'exercise', topic: 'bass', xpReward: 60, requiredXp: 290,
                handPosition: 'LH_BASS_F_3FINGER',
                constraints: { trebleRange: [], bassRange: bassGuideF, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: "c1-l4-song", courseId: "keyboard-geography",
                name: "Melody: Aura Lea (Love Me Tender)",
                description: "Play a classic left-hand melody centered around Bass F3.",
                focus: "Let your left arm feel heavy and relaxed. Play with a steady beat.",
                instruction: "Place your Left Hand fingers in the Bass F anchor. Play the opening theme of Aura Lea.",
                type: 'exercise', topic: 'bass', xpReward: 70, requiredXp: 350,
                handPosition: 'LH_BASS_F_3FINGER',
                constraints: {
                    trebleRange: [], bassRange: bassGuideF, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 12,
                    presetMelody: {
                        treble: [],
                        bass: [
                            { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "h" },
                            { keys: ["g/3"], duration: "q" }, { keys: ["g/3"], duration: "q" }, { keys: ["f/3"], duration: "q" }, { keys: ["e/3"], duration: "q" },
                            { keys: ["f/3"], duration: "h" }
                        ]
                    }
                }
            },
            {
                id: "c1-l5", courseId: "keyboard-geography",
                name: "Landmark High C (C5)",
                description: "Read High C on the third space of the treble staff, playing from a High C Anchor.",
                focus: "High C (C5) is an octave above Middle C. Keep your wrist flexible and relaxed.",
                instruction: "Place your Right Hand Thumb (Finger 1) on High C (C5). Practice playing the notes stepping up from this landmark.",
                type: 'exercise', topic: 'treble', xpReward: 70, requiredXp: 420,
                handPosition: 'RH_HIGH_C_POS',
                constraints: { trebleRange: trebleHighC, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: "c1-l5-song", courseId: "keyboard-geography",
                name: "Melody: Over the Rainbow Jump",
                description: "Practice the famous octave leap from Middle C to High C.",
                focus: "Look at the high note first, then move your hand. Accurate jumps require look-before-you-leap!",
                instruction: "Follow the notation to play the iconic opening jump of Somewhere Over the Rainbow.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 490,
                handPosition: 'GRAND_C_POS',
                constraints: {
                    trebleRange: ["c/4", "c/5", "b/4", "g/4", "a/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 7,
                    presetMelody: {
                        treble: [
                            { keys: ["c/4"], duration: "h" }, { keys: ["c/5"], duration: "h" }, { keys: ["b/4"], duration: "h" },
                            { keys: ["g/4"], duration: "q" }, { keys: ["a/4"], duration: "q" }, { keys: ["b/4"], duration: "q" },
                            { keys: ["c/5"], duration: "h" }
                        ],
                        bass: []
                    }
                }
            },
            {
                id: "c1-l6", courseId: "keyboard-geography",
                name: "Landmark Bass C (C3)",
                description: "Read Low C on the second space of the bass staff.",
                focus: "Bass C (C3) is an octave below Middle C. Use your Left Hand Pinky (Finger 5) to play it.",
                instruction: "Place your Left Hand Pinky (Finger 5) on Bass C (C3). Practice playing notes stepping up from this landmark.",
                type: 'exercise', topic: 'bass', xpReward: 70, requiredXp: 570,
                handPosition: 'LH_LOW_C_POS',
                constraints: { trebleRange: [], bassRange: bassLowC, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: "c1-l7", courseId: "keyboard-geography",
                name: "Landmark Guide Notes Challenge",
                description: "Test your skills with a gentle stepwise capstone combining both hands in Middle C position.",
                focus: "Keep your hands anchored. Share the Middle C key or take turns playing it between hands.",
                instruction: "Play stepwise notes alternating between your left hand (A3-C4) and right hand (C4-E4). Focus on seamless transitions.",
                type: 'exercise', topic: 'both', xpReward: 100, requiredXp: 640,
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
                id: "c2-l1", courseId: "treble-clef-mastery",
                name: "Treble C Position Steps",
                description: "Read stepwise intervals (seconds) in Treble C Position (C4 to G4).",
                focus: "Read adjacent lines and spaces. Play smoothly without lifting your hands between notes.",
                instruction: "Place your right hand fingers on C4, D4, E4, F4, and G4. Play notes that step up and down.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 460,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: "c2-l2", courseId: "treble-clef-mastery",
                name: "Treble Skips (3rds)",
                description: "Read skips (thirds) in the Right Hand C Position.",
                focus: "A skip moves from line-to-line or space-to-space. Notice the visual gap on the staff.",
                instruction: "Play the skipping notes in C position. Maintain your hand shape and finger curve.",
                type: 'exercise', topic: 'treble', xpReward: 80, requiredXp: 540,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: "c2-l3", courseId: "treble-clef-mastery",
                name: "Treble Leaps (4ths & 5ths)",
                description: "Read wider interval leaps in the right hand.",
                focus: "Do not tense your fingers during wide leaps. Keep your hand relaxed.",
                instruction: "Play intervals of 4ths and 5ths, such as jumping directly from C4 up to F4 or G4.",
                type: 'exercise', topic: 'treble', xpReward: 90, requiredXp: 620,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c2-l4", courseId: "treble-clef-mastery",
                name: "Song: Mary Had a Little Lamb",
                description: "Play your first real song, using the C position.",
                focus: "Count the beats out loud. Pay special attention to the half notes holding for two beats.",
                instruction: "Apply your C position reading to play this traditional tune with your right hand.",
                type: 'song', topic: 'treble', xpReward: 120, requiredXp: 710,
                handPosition: 'RH_C_POS',
                songUrl: '/scores/Mary_Lamb.musicxml',
                presetId: 'preset-mary-lamb'
            },
            {
                id: "c2-l5", courseId: "treble-clef-mastery",
                name: "Upper Treble Register",
                description: "Expand past G4 up to High C (C5) in the right hand.",
                focus: "Transition your eyes to read notes placed higher on the treble staff.",
                instruction: "Position your right hand so that you can reach F4 up to C5. Read and play this register.",
                type: 'exercise', topic: 'treble', xpReward: 100, requiredXp: 830,
                handPosition: 'RH_UPPER_TREBLE',
                constraints: { trebleRange: upperTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c2-l6", courseId: "treble-clef-mastery",
                name: "Treble Clef Capstone",
                description: "Synthesize steps, skips, and leaps across the full treble range.",
                focus: "Read the entire treble clef from C4 to C5. Look ahead to prepare for intervals.",
                instruction: "Play this longer, generative exercise that combines all treble notes and rhythms you've learned.",
                type: 'exercise', topic: 'treble', xpReward: 150, requiredXp: 930,
                handPosition: 'RH_C_POS',
                constraints: { trebleRange: fullTreble, bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 3, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: "c2-l7", courseId: "treble-clef-mastery",
                name: "Song: Ode to Joy",
                description: "Play Beethoven's classic masterpiece with your right hand.",
                focus: "Maintain a steady pulse. Notice the stepwise motion followed by skips.",
                instruction: "Combine your treble reading skills to play this beautiful Beethoven melody.",
                type: 'song', topic: 'treble', xpReward: 200, requiredXp: 1080,
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
                id: "c3-l1", courseId: "bass-clef-mastery",
                name: "Bass C Position Steps",
                description: "Read stepwise intervals (seconds) in Left Hand C Position (C3 to G3).",
                focus: "Ensure your left hand fingers mirror the shape of your right hand. Play with even key weight.",
                instruction: "Place your Left Hand Pinky on C3, up to thumb on G3. Play the steps on the bass staff.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 1280,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: "c3-l2", courseId: "bass-clef-mastery",
                name: "Bass Skips (3rds)",
                description: "Read skips (thirds) in the Left Hand C Position.",
                focus: "Bass clef lines and spaces can be tricky. Look at whether the note jumps to an adjacent line/space.",
                instruction: "Practice skipping notes in the left hand C position. Take it slowly and ensure accuracy.",
                type: 'exercise', topic: 'bass', xpReward: 80, requiredXp: 1360,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: "c3-l3", courseId: "bass-clef-mastery",
                name: "Bass Leaps (4ths & 5ths)",
                description: "Read wider interval leaps in the left hand.",
                focus: "Keep your wrist loose. Use arm weight rather than finger tension to play leaps.",
                instruction: "Play intervals of 4ths and 5ths, leaping from C3 up to F3 or G3.",
                type: 'exercise', topic: 'bass', xpReward: 90, requiredXp: 1440,
                handPosition: 'LH_C_POS',
                constraints: { trebleRange: [], bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 4, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c3-l4", courseId: "bass-clef-mastery",
                name: "Song: Good King Wenceslas",
                description: "Play a classic holiday tune using your left hand.",
                focus: "Let the bass notes ring out strongly. Keep a solid, heavy pulse with your arm.",
                instruction: "Use your left hand alone to play this famous melody down on the bass clef.",
                type: 'song', topic: 'bass', xpReward: 150, requiredXp: 1530,
                handPosition: 'LH_C_POS',
                songUrl: '/scores/Good_King_Wenceslas.musicxml',
                presetId: 'preset-good-king-wenceslas'
            },
            {
                id: "c3-l5", courseId: "bass-clef-mastery",
                name: "Lower Bass Register",
                description: "Read notes below C3 down to Low F (F2) on ledger lines.",
                focus: "Memorize the ledger lines. Low F (F2) sits just below the bottom line of the bass staff.",
                instruction: "Shift your left hand down so your pinky rests on Low F (F2). Practice reading in this low register.",
                type: 'exercise', topic: 'bass', xpReward: 100, requiredXp: 1680,
                handPosition: 'LH_LOWER_BASS',
                constraints: { trebleRange: [], bassRange: lowerBass, rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c3-l6", courseId: "bass-clef-mastery",
                name: "Bass Clef Capstone",
                description: "Read across the entire bass clef from Low F (F2) to Middle C (C4).",
                focus: "Synthesize all left hand intervals and notes. Look ahead to prepare for shifts.",
                instruction: "A long, comprehensive generative exercise testing your reading across the whole bass staff.",
                type: 'exercise', topic: 'bass', xpReward: 150, requiredXp: 1780,
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
                id: "c4-l1", courseId: "grand-staff-coordination",
                name: "Clef Trade-offs",
                description: "Alternate playing between your right and left hands.",
                focus: "Look at the clefs. Keep your non-playing hand resting gently on the keys, ready for its turn.",
                instruction: "You will see the melody bounce between the treble clef (Right Hand) and bass clef (Left Hand). Trade off smoothly.",
                type: 'exercise', topic: 'both', xpReward: 100, requiredXp: 1930,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c4-l2", courseId: "grand-staff-coordination",
                name: "Simple Harmony (LH Drone)",
                description: "Play static bass notes in the left hand while the right hand plays a melody.",
                focus: "Lock the first beat of each measure. Make sure both hands play exactly together on beat one.",
                instruction: "Your left hand will hold long, stable bass notes (C3 or G3) while your right hand plays a stepwise melody.",
                type: 'exercise', topic: 'both', xpReward: 110, requiredXp: 2030,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: ["c/3", "g/3"], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: true, numNotes: 24 }
            },
            {
                id: "c4-l3", courseId: "grand-staff-coordination",
                name: "Song: Au Clair de la Lune",
                description: "Practice hand coordination with a simple French folk melody.",
                focus: "Hold the left-hand half notes and whole notes while the right-hand melody steps forward.",
                instruction: "Play this beautiful melody using both hands. The left hand provides harmonic support.",
                type: 'song', topic: 'both', xpReward: 150, requiredXp: 2140,
                handPosition: 'GRAND_C_POS',
                songUrl: '/scores/Au_Clair_De_La_Lune.musicxml',
                presetId: 'preset-au-clair-de-la-lune'
            },
            {
                id: "c4-l4", courseId: "grand-staff-coordination",
                name: "Contrary Motion",
                description: "Play notes that move in opposite directions in each hand.",
                focus: "Contrary motion is anatomically symmetrical, using the same fingers (e.g. both thumbs, both index fingers) at the same time. This is easier for your brain than parallel motion!",
                instruction: "Play notes moving in opposite directions (e.g. hands moving outwards). Tap into the symmetrical finger movement.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 2400,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q"], maxJumps: 1, chordsAllowed: true, numNotes: 20 }
            },
            {
                id: "c4-l5", courseId: "grand-staff-coordination",
                name: "Parallel Motion",
                description: "Play the same notes in both hands an octave apart.",
                focus: "Parallel motion is asymmetrical (e.g. RH Finger 1 plays with LH Finger 5). Align your movements carefully by sound.",
                instruction: "Play steps in both hands moving in the same direction. Lock your fingers together on the beat.",
                type: 'exercise', topic: 'both', xpReward: 110, requiredXp: 2290,
                handPosition: 'GRAND_C_POS',
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q"], maxJumps: 1, chordsAllowed: true, numNotes: 20 }
            },
            {
                id: "c4-l6", courseId: "grand-staff-coordination",
                name: "Song: Jingle Bells",
                description: "Master hand independence with the chorus of Jingle Bells.",
                focus: "Listen to the melody's rhythm against the long, steady whole notes in the left hand.",
                instruction: "Use both hands together to play this festive song. Keep the beat steady and strong.",
                type: 'song', topic: 'both', xpReward: 200, requiredXp: 2520,
                songUrl: '/scores/Jingle_Bells.musicxml',
                presetId: 'preset-jingle-bells'
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
                id: "c5-l1", courseId: "rhythm-mastery",
                name: "Introducing Eighth Notes",
                description: "Play eighth notes at twice the speed of quarter notes.",
                focus: "Count '1-and-2-and' to divide the beats. Keep your arm relaxed.",
                instruction: "Play exercises containing combinations of quarter notes and eighth notes.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 2720,
                constraints: { trebleRange: cPosTreble, bassRange: ["c/3", "g/3"], rhythms: ["q", "8"], maxJumps: 1, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: "c5-l2", courseId: "rhythm-mastery",
                name: "Dotted Half Notes & 3/4 Time",
                description: "Feel the triple meter waltz feel (3 beats per measure).",
                focus: "A dotted half note holds for 3 full beats. Count '1, 2, 3' for each measure.",
                instruction: "Play this waltz-style drill. Make sure you lift only after counting all 3 beats.",
                type: 'exercise', topic: 'both', xpReward: 120, requiredXp: 2840,
                constraints: { trebleRange: cPosTreble, bassRange: ["c/3", "g/3"], rhythms: ["q", "h", "w"], maxJumps: 2, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c5-l3", courseId: "rhythm-mastery",
                name: "Dotted Quarter Notes",
                description: "Read the syncopated 'dotted-quarter followed by an eighth' rhythm.",
                focus: "The dotted quarter holds for 1.5 beats. Feel the slight push into the next note.",
                instruction: "Focus on the syncopated rhythm. Count carefully to capture the uneven pulse.",
                type: 'exercise', topic: 'both', xpReward: 130, requiredXp: 2960,
                constraints: { trebleRange: cPosTreble, bassRange: ["c/3", "g/3"], rhythms: ["q", "8", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: "c5-l4", courseId: "rhythm-mastery",
                name: "Mixed Subdivisions Capstone",
                description: "A comprehensive rhythm challenge combining all note lengths.",
                focus: "Lock your timing while switching between half, quarter, and eighth notes across both clefs.",
                instruction: "Combine eighth notes and dotted rhythms in both hands in this rhythm test.",
                type: 'exercise', topic: 'both', xpReward: 140, requiredXp: 3090,
                constraints: { trebleRange: fullTreble, bassRange: cPosBass, rhythms: ["q", "8", "h"], maxJumps: 2, chordsAllowed: true, numNotes: 36 }
            }
        ]
    },
    {
        id: "expanding-positions",
        name: "6. Expanding Hand Positions",
        description: "Move past static 5-finger positions. Learn hand stretching, crossings, and arpeggios.",
        order: 6,
        lessons: [
            {
                id: "c6-l1", courseId: "expanding-positions",
                name: "Hand Extensions (6ths)",
                description: "Play 6th intervals by stretching fingers without shifting the hand.",
                focus: "Stretch your pinky to reach A4 while keeping C4 anchored with your thumb. Keep fingers loose.",
                instruction: "Practice playing intervals of 6ths by expanding your fingers without shifting your hand position.",
                type: 'exercise', topic: 'treble', xpReward: 120, requiredXp: 3230,
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4"], bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c6-l2", courseId: "expanding-positions",
                name: "Thumb-Under Crossings",
                description: "Cross your thumb under Finger 3 to shift positions up.",
                focus: "Tuck your thumb smoothly under Finger 3 as you pass from E4 to F4.",
                instruction: "Play C, D, E, then tuck the thumb to play F, and continue up to C5. Keep your wrist level.",
                type: 'exercise', topic: 'treble', xpReward: 130, requiredXp: 3350,
                constraints: { trebleRange: fullTreble, bassRange: [], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c6-l3", courseId: "expanding-positions",
                name: "Left Hand Crossings",
                description: "Cross Finger 3 over the thumb to shift positions down.",
                focus: "Cross your middle finger (Finger 3) over your thumb to play lower notes smoothly.",
                instruction: "Practice descending crossings in your left hand, expanding your range down to Low F (F2).",
                type: 'exercise', topic: 'bass', xpReward: 130, requiredXp: 3480,
                constraints: { trebleRange: [], bassRange: ["f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c6-l4", courseId: "expanding-positions",
                name: "Arpeggio Patterns",
                description: "Play broken triad chords sequentially up and down.",
                focus: "Keep a light, even touch. Feel your arm gliding horizontally across the keyboard.",
                instruction: "Play chord tones C, E, G, C sequentially. Relax your fingers between notes.",
                type: 'exercise', topic: 'both', xpReward: 140, requiredXp: 3610,
                constraints: { trebleRange: ["c/4", "e/4", "g/4", "c/5"], bassRange: ["c/3", "e/3", "g/3", "c/4"], rhythms: ["q", "8"], maxJumps: 3, chordsAllowed: false, numNotes: 28 }
            }
        ]
    },
    {
        id: "accidentals-key-sigs",
        name: "7. Accidentals & Key Signatures",
        description: "Explore the black keys, read sharps and flats, and play in new key signatures.",
        order: 7,
        lessons: [
            {
                id: "c7-l1", courseId: "accidentals-key-sigs",
                name: "Introducing Sharps (#)",
                description: "Read and play sharp accidentals on black keys.",
                focus: "Locate F#4 and C#5. Black keys sit higher, strike them centered.",
                instruction: "Play exercises containing F#4 and C#5. Sharps raise the pitch by one half-step.",
                type: 'exercise', topic: 'treble', xpReward: 130, requiredXp: 3750,
                constraints: { trebleRange: trebleSharps, bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c7-l2", courseId: "accidentals-key-sigs",
                name: "Introducing Flats (b)",
                description: "Read and play flat accidentals on black keys.",
                focus: "Locate Bb4 and Eb4. Watch for the flat symbol preceding the notes.",
                instruction: "Play exercises containing Bb4 and Eb4. Flats lower the pitch by one half-step.",
                type: 'exercise', topic: 'treble', xpReward: 130, requiredXp: 3880,
                constraints: { trebleRange: trebleFlats, bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "c7-l3", courseId: "accidentals-key-sigs",
                name: "Key Signature: G Major",
                description: "Play exercises in G Major, where all Fs are sharps.",
                focus: "Look at the sharp at the start of the staff. Remember to play all Fs as F# automatically.",
                instruction: "Practice reading with a G Major key signature. Sharps at the clef apply to the whole piece.",
                type: 'exercise', topic: 'both', xpReward: 140, requiredXp: 4010,
                constraints: { trebleRange: gMajorTreble, bassRange: ["g/3", "a/3", "b/3", "c/4", "d/4"], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: true, numNotes: 28 }
            },
            {
                id: "c7-l4", courseId: "accidentals-key-sigs",
                name: "Song: Minuet in G",
                description: "Play Bach's famous theme in G Major.",
                focus: "Coordinate the right-hand melody with the left-hand chord changes in 3/4 time.",
                instruction: "Play this beautiful classic. Pay attention to the F# in the key signature.",
                type: 'song', topic: 'chords', xpReward: 250, requiredXp: 4150,
                songUrl: '/scores/bach_minuet_g_major.musicxml',
                presetId: 'preset-minuet-g'
            },
            {
                id: "c7-l5", courseId: "accidentals-key-sigs",
                name: "Song: Für Elise (Simplified)",
                description: "Play Beethoven's classic theme featuring sharps and flats.",
                focus: "Navigate the chromatic transitions (Eb to D#) smoothly in 3/8 meter.",
                instruction: "Use both hands to play this famous, expressive Beethoven piece.",
                type: 'song', topic: 'both', xpReward: 250, requiredXp: 4400,
                songUrl: '/scores/Fur_Elise_Simplified.musicxml',
                presetId: 'preset-fur-elise-easy'
            }
        ]
    },
    {
        id: "intermediate-mastery",
        name: "8. Intermediate Mastery & Classical Repertoire",
        description: "Achieve fluency with full 1-octave scales, chord inversions, and advanced repertoire.",
        order: 8,
        lessons: [
            {
                id: "c8-l1", courseId: "intermediate-mastery",
                name: "C Major Scale (1-Octave)",
                description: "Play the full C Major scale up and down a complete octave.",
                focus: "Keep your crossings seamless. Make sure the thumb crossing does not disrupt the rhythm.",
                instruction: "Play C4 to C5 using finger crossing technique. Keep your tempo perfectly steady.",
                type: 'exercise', topic: 'treble', xpReward: 150, requiredXp: 4650,
                constraints: { trebleRange: fullTreble, bassRange: [], rhythms: ["8", "q"], maxJumps: 1, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: "c8-l2", courseId: "intermediate-mastery",
                name: "Triad Inversions",
                description: "Practice Root, 1st, and 2nd inversions of the C Major chord.",
                focus: "Press all three keys exactly together. Feel the shape changes in your palm.",
                instruction: "Alternate playing Root position (C-E-G), 1st inversion (E-G-C), and 2nd inversion (G-C-E).",
                type: 'exercise', topic: 'chords', xpReward: 160, requiredXp: 4800,
                constraints: { trebleRange: ["c/4", "e/4", "g/4", "e/4", "g/4", "c/5", "g/4", "c/5", "e/5"], bassRange: ["c/3", "g/3"], rhythms: ["h", "w"], maxJumps: 0, chordsAllowed: true, numNotes: 24 }
            },
            {
                id: "c8-l3", courseId: "intermediate-mastery",
                name: "Song: Twinkle Twinkle",
                description: "Play the melody accompanied by full chords in the left hand.",
                focus: "Coordinate the chord transitions on beat one of each measure with the melody.",
                instruction: "Your left hand will play full C, F, and G Major chords while your right hand plays the theme.",
                type: 'song', topic: 'chords', xpReward: 200, requiredXp: 4960,
                songUrl: '/scores/Twinkle_Twinkle.musicxml',
                presetId: 'preset-twinkle-twinkle'
            },
            {
                id: "c8-l4", courseId: "intermediate-mastery",
                name: "Song: Gymnopédie No. 1",
                description: "Play Satie's slow, expressive masterpiece.",
                focus: "Play very softly (piano) and smoothly. Take your time with the left-hand bass jumps.",
                instruction: "Use both hands together to play this atmospheric, beautiful piece by Erik Satie.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 5160,
                songUrl: '/scores/Gymnopdie_No._1__Satie.mxl',
                presetId: 'preset-satie'
            },
            {
                id: "c8-l5", courseId: "intermediate-mastery",
                name: "Grand Staff Mastery Capstone",
                description: "Test your skills with a long, mixed exercise across both staffs.",
                focus: "Read fluently across both clefs. Handle eighth notes, accidentals, and shifts smoothly.",
                instruction: "The ultimate generative sight-reading test. Take it slow and focus on rhythmic accuracy.",
                type: 'exercise', topic: 'both', xpReward: 250, requiredXp: 5460,
                constraints: { trebleRange: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5"], bassRange: ["f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3"], rhythms: ["q", "8", "h"], maxJumps: 4, chordsAllowed: true, numNotes: 48 }
            },
            {
                id: "c8-l6", courseId: "intermediate-mastery",
                name: "Song: Canon in D",
                description: "Play Pachelbel's famous theme in a beautiful two-handed arrangement.",
                focus: "Coordinate independent hand parts as the subdivisions speed up. Keep a rock-steady tempo.",
                instruction: "Your final capstone song! Use all the coordination, rhythm, and reading skills you've mastered.",
                type: 'song', topic: 'both', xpReward: 500, requiredXp: 5710,
                songUrl: '/scores/Canon_in_D.mxl',
                presetId: 'preset-canon'
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

export const getLessonUnlockedStatus = (lesson: Lesson, completedIds: Set<string>, _userXp: number): boolean => {
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
