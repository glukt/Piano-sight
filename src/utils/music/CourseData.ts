export type LessonTopic = 'treble' | 'bass' | 'both' | 'chords';
export type LessonType = 'exercise' | 'song';

export interface LessonConstraints {
    trebleRange: string[]; // Allowed notes e.g., ['c/4', 'd/4', 'e/4']
    bassRange: string[];   // Allowed notes e.g., ['c/3', 'g/3']
    rhythms: string[];     // Allowed rhythm durations e.g., ['q', 'h']
    maxJumps: number;      // Maximum interval jump allowed (1 = steps only, 2 = skips, etc)
    chordsAllowed: boolean;// Whether to generate chords or single notes
    numNotes: number;      // How long the generated level should be
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
    xpReward: number;
    requiredXp: number; // XP required to unlock this lesson
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
const cPosTreble = ["c/4", "d/4", "e/4", "f/4", "g/4"];
const extendedTreble = ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"];
const highTreble = ["c/5", "d/5", "e/5", "f/5", "g/5"];

const cPosBass = ["c/3", "d/3", "e/3", "f/3", "g/3"];
const extendedBass = ["f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3"];

export const courses: Course[] = [
    {
        id: "basics-1",
        name: "Piano Basics 1 (Treble)",
        description: "Master the right hand. Start with Middle C and explore the treble clef all the way up to C5.",
        order: 1,
        lessons: [
            {
                id: "b1-l1", courseId: "basics-1", name: "Middle C and D", description: "Use your thumb and index finger to play C and D.",
                focus: "Find Middle C. It is located near the center of your keyboard, usually just to the left of the group of two black keys.",
                instruction: "Place your Right Hand Thumb (Finger 1) on Middle C, and your Index Finger (Finger 2) on D. Play the notes as they appear on the screen.",
                type: 'exercise', topic: 'treble', xpReward: 50, requiredXp: 0,
                constraints: { trebleRange: ["c/4", "d/4"], bassRange: [], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 12 }
            },
            {
                id: "b1-l2", courseId: "basics-1", name: "E, F, and G", description: "Complete the 5-finger position.",
                focus: "Keep your fingers curved as if holding a small ball. Don't let your knuckles collapse.",
                instruction: "Keep your Thumb on C. Let your other fingers fall naturally on the next white keys: E (Middle Finger), F (Ring Finger), and G (Pinky).",
                type: 'exercise', topic: 'treble', xpReward: 50, requiredXp: 50,
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: "b1-l3", courseId: "basics-1", name: "Treble Skips", description: "Skip notes to play 3rd intervals.",
                focus: "Look ahead at the next note while playing the current one. This helps you prepare for the jump.",
                instruction: "We will skip around between C and G! You'll need to jump from C to E, or D to F. Take it slow.",
                type: 'exercise', topic: 'treble', xpReward: 75, requiredXp: 100,
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: "b1-l4", courseId: "basics-1", name: "Treble Leaps", description: "Wider interval leaps in the right hand.",
                focus: "Maintain hand shape even while jumping from your thumb to your pinky.",
                instruction: "Get ready for wide jumps, including 4ths and 5ths, such as going straight from C up to G.",
                type: 'exercise', topic: 'treble', xpReward: 100, requiredXp: 175,
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q"], maxJumps: 4, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "b1-l5", courseId: "basics-1", name: "Song: Mary Had a Little Lamb", description: "Your first real song! Play a familiar melody.",
                focus: "Keep a steady rhythm and watch for the half notes holding twice as long.",
                instruction: "Now that you know the 5 notes of C position, you can play this classic tune. Have fun!",
                type: 'song', topic: 'treble', xpReward: 150, requiredXp: 275,
                songUrl: '/scores/Mary_Lamb.musicxml'
            },
            {
                id: "b1-l6", courseId: "basics-1", name: "Extended Treble", description: "Move past G up to High C.",
                focus: "Reposition your hand gently up the keyboard. You can place your thumb on F to reach the higher notes.",
                instruction: "We are adding A, B, and High C to your vocabulary. Familiarize yourself with their appearance on the upper staff.",
                type: 'exercise', topic: 'treble', xpReward: 100, requiredXp: 425,
                constraints: { trebleRange: extendedTreble, bassRange: [], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "b1-l7", courseId: "basics-1", name: "Half & Whole Rhythms", description: "Mix different node lengths.",
                focus: "Count beats out loud. 1-2-3-4. Hold half notes for 2 beats, and whole notes for 4.",
                instruction: "You'll see empty notes (half notes) and notes with no stems (whole notes). Make sure you hold the key down for their entire duration.",
                type: 'exercise', topic: 'treble', xpReward: 150, requiredXp: 375,
                constraints: { trebleRange: cPosTreble, bassRange: [], rhythms: ["q", "h", "w"], maxJumps: 2, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: "b1-l8", courseId: "basics-1", name: "High Treble Only", description: "Solidify reading notes above the staff.",
                focus: "Watch the ledger lines carefully. High C is on the second ledger line above the staff.",
                instruction: "This exercise exclusively tests your ability to read the upper register without the anchor of Middle C.",
                type: 'exercise', topic: 'treble', xpReward: 200, requiredXp: 525,
                constraints: { trebleRange: highTreble, bassRange: [], rhythms: ["q", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 30 }
            },
            {
                id: "b1-l9", courseId: "basics-1", name: "Basics Mastery", description: "A capstone rhythm and melody challenge.",
                focus: "You have learned the entire right hand treble! Keep a steady tempo.",
                instruction: "A longer generative exercise that combines all the right hand notes and rhythms you've learned.",
                type: 'exercise', topic: 'treble', xpReward: 300, requiredXp: 725,
                constraints: { trebleRange: extendedTreble, bassRange: [], rhythms: ["q", "h", "8"], maxJumps: 3, chordsAllowed: false, numNotes: 40 }
            },
            {
                id: "b1-l10", courseId: "basics-1", name: "Song: Ode to Joy", description: "Play the famous Beethoven melody with your right hand.",
                focus: "Play smoothly. Notice the rhythms at the end of the phrase - a dotted quarter followed by an eighth note.",
                instruction: "Congratulations on reaching the end of Basics 1! Use everything you've learned to play this real, iconic piece of music.",
                type: 'song', topic: 'treble', xpReward: 500, requiredXp: 1025,
                songUrl: '/scores/Ode_to_Joy.musicxml'
            }
        ]
    },
    {
        id: "basics-2",
        name: "Piano Basics 2 (Bass)",
        description: "Bring in your left hand. Learn the bass clef from the lower octaves up to Middle C.",
        order: 2,
        lessons: [
            {
                id: "b2-l1", courseId: "basics-2", name: "Bass C and B", description: "Locate Bass C and play with your left hand.",
                focus: "Focus on playing Bass C with the pinky (Finger 5). Don't crash the key, press with firm control.",
                instruction: "Find the C that is one octave below Middle C. Place your Left Hand Pinky there.",
                type: 'exercise', topic: 'bass', xpReward: 100, requiredXp: 1525,
                constraints: { trebleRange: [], bassRange: ["c/3", "d/3"], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 16 }
            },
            {
                id: "b2-l2", courseId: "basics-2", name: "Completing Bass C", description: "Learn the rest of the 5-finger bass position.",
                focus: "Make sure your left hand mirrors the curve of your right hand.",
                instruction: "Place your remaining left hand fingers on the keys ascending from Bass C up to G (Thumb).",
                type: 'exercise', topic: 'bass', xpReward: 100, requiredXp: 1625,
                constraints: { trebleRange: [], bassRange: cPosBass, rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 20 }
            },
            {
                id: "b2-l3", courseId: "basics-2", name: "Bass Skips", description: "Practice interval skips in the low register.",
                focus: "Reading the bass clef takes practice. Take your time to identify the line or space.",
                instruction: "Similar to the right hand skips, we will now practice jumping around the 5 notes of the Bass C position.",
                type: 'exercise', topic: 'bass', xpReward: 150, requiredXp: 1725,
                constraints: { trebleRange: [], bassRange: cPosBass, rhythms: ["q", "h"], maxJumps: 3, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "b2-l4", courseId: "basics-2", name: "Lower Bass Introduction", description: "Moving below the staff into ledger lines.",
                focus: "Memorize where Low F sits just under the staff.",
                instruction: "Shift your left hand down. Place your pinky on Low F (F2) and play up to Bass C.",
                type: 'exercise', topic: 'bass', xpReward: 150, requiredXp: 1875,
                constraints: { trebleRange: [], bassRange: ["f/2", "g/2", "a/2", "b/2", "c/3"], rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "b2-l5", courseId: "basics-2", name: "Extended Bass Ranges", description: "Combine lower bass and upper bass.",
                focus: "You'll have to stretch your hand or reposition to hit these intervals.",
                instruction: "This drill covers the entire bass clef. Read carefully and don't rush the jumps.",
                type: 'exercise', topic: 'bass', xpReward: 200, requiredXp: 2025,
                constraints: { trebleRange: [], bassRange: extendedBass, rhythms: ["q"], maxJumps: 2, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: "b2-l6", courseId: "basics-2", name: "Bass Rhythms", description: "Introduce eighth notes and varied timing.",
                focus: "Eighth notes (notes connected by a beam) are played twice as fast as quarter notes.",
                instruction: "Keep a heavy, steady pulse with your arm, while your fingers play the faster rhythms.",
                type: 'exercise', topic: 'bass', xpReward: 300, requiredXp: 2225,
                constraints: { trebleRange: [], bassRange: cPosBass, rhythms: ["q", "8", "h"], maxJumps: 2, chordsAllowed: false, numNotes: 36 }
            },
            {
                id: "b2-l7", courseId: "basics-2", name: "Song: Good King Wenceslas", description: "Play a classic holiday tune using your left hand alone.",
                focus: "Play with confidence and volume. Let the bass notes ring out.",
                instruction: "You have conquered the bass clef! Use your left hand to play this famous melody down in the depths.",
                type: 'song', topic: 'bass', xpReward: 500, requiredXp: 2525,
                songUrl: '/scores/Good_King_Wenceslas.musicxml'
            }
        ]
    },
    {
        id: "both-hands-1",
        name: "Two Hands Coordination",
        description: "The ultimate challenge: play with both hands together.",
        order: 3,
        lessons: [
            {
                id: "bh1-l1", courseId: "both-hands-1", name: "Trade-offs", description: "Alternate between right and left hand.",
                focus: "Count out loud. Keep your non-playing hand resting gently on the keys, ready for its turn.",
                instruction: "You will see notes jumping between the top staff (Right Hand) and bottom staff (Left Hand). Play them as they appear.",
                type: 'exercise', topic: 'both', xpReward: 150, requiredXp: 3025,
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "bh1-l2", courseId: "both-hands-1", name: "Simple Harmony", description: "Play a bass note while moving your right hand.",
                focus: "Listen to how the low bass notes support the melody in the right hand.",
                instruction: "Hold down the long notes in the Left Hand while your Right Hand continues to play the melody.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 3175,
                constraints: { trebleRange: cPosTreble, bassRange: ["c/3", "g/3"], rhythms: ["q", "h"], maxJumps: 1, chordsAllowed: true, numNotes: 28 }
            },
            {
                id: "bh1-l3", courseId: "both-hands-1", name: "Parallel Motion", description: "Both hands play the same notes an octave apart.",
                focus: "Your fingers should mirror each other perfectly.",
                instruction: "Play C with both hands, then D, and so on. Lock your rhythm together.",
                type: 'exercise', topic: 'both', xpReward: 200, requiredXp: 3375,
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q"], maxJumps: 1, chordsAllowed: true, numNotes: 24 }
            },
            {
                id: "bh1-l4", courseId: "both-hands-1", name: "Song: Au Clair de la Lune", description: "A simple French melody to practice hand coordination.",
                focus: "The left hand plays whole notes and half notes. Make sure they ring out while the right hand moves.",
                instruction: "A beautiful application of what you just learned. Play the melody while supporting it with bass notes.",
                type: 'song', topic: 'both', xpReward: 300, requiredXp: 3575,
                songUrl: '/scores/Au_Clair_De_La_Lune.musicxml'
            },
            {
                id: "bh1-l5", courseId: "both-hands-1", name: "Contrary Motion", description: "Hands moving in opposite directions.",
                focus: "As your right hand goes up, your left hand goes down.",
                instruction: "This builds independence. It feels weird at first, so take it slow.",
                type: 'exercise', topic: 'both', xpReward: 300, requiredXp: 3875,
                constraints: { trebleRange: cPosTreble, bassRange: cPosBass, rhythms: ["q"], maxJumps: 2, chordsAllowed: true, numNotes: 32 }
            },
            {
                id: "bh1-l6", courseId: "both-hands-1", name: "Song: Gymnopédie No. 1", description: "An authentic, slow piece of real sheet music.",
                focus: "Play smoothly and try to express the calm, melancholic mood of the piece.",
                instruction: "This is a real piece by Erik Satie! It requires moving the left hand quite a bit. Take your time.",
                type: 'song', topic: 'both', xpReward: 500, requiredXp: 3875,
                songUrl: '/scores/Gymnopdie_No._1__Satie.mxl'
            },
            {
                id: "bh1-l7", courseId: "both-hands-1", name: "Song: Jingle Bells", description: "A famous festive tune to master hand independence.",
                focus: "Hold the bass notes steady with your left hand while your right hand plays the melody.",
                instruction: "The left hand holds whole notes while the right hand sings the Jingle Bells chorus!",
                type: 'song', topic: 'both', xpReward: 500, requiredXp: 4375,
                songUrl: '/scores/Jingle_Bells.musicxml'
            },
            {
                id: "bh1-l8", courseId: "both-hands-1", name: "Song: Fur Elise (Simplified)", description: "Play the famous theme song with both hands.",
                focus: "Count in 3/4 time (1-2-3, 1-2-3). The right hand plays pick-up notes before the first full measure.",
                instruction: "Now that you have both hands moving independently, try this simplified arrangement of Beethoven's Fur Elise.",
                type: 'song', topic: 'both', xpReward: 400, requiredXp: 4875,
                songUrl: '/scores/Fur_Elise_Simplified.musicxml'
            }
        ]
    },
    {
        id: "chords-101",
        name: "Chords 101",
        description: "Play multiple notes at the same time to form rich harmonies.",
        order: 4,
        lessons: [
            {
                id: "ch1-l1", courseId: "chords-101", name: "C Major Triad", description: "Play C, E, and G together.",
                focus: "Press all three keys down exactly at the same time. Ensure your wrist isn't tense.",
                instruction: "A chord is 3 or more notes played together. Place your Right Hand on C, E, and G (Fingers 1, 3, and 5) and play them simultaneously.",
                type: 'exercise', topic: 'chords', xpReward: 200, requiredXp: 4875,
                constraints: { trebleRange: ["c/4", "e/4", "g/4"], bassRange: ["c/3"], rhythms: ["q", "h"], maxJumps: 0, chordsAllowed: true, numNotes: 16 }
            },
            {
                id: "ch1-l2", courseId: "chords-101", name: "Adding F Major", description: "Learn a second chord shape.",
                focus: "The F major chord uses F, A, and C.",
                instruction: "Move your hand up slightly to play F, A, and C together. We will alternate between C Major and F Major.",
                type: 'exercise', topic: 'chords', xpReward: 200, requiredXp: 5075,
                constraints: { trebleRange: ["c/4", "e/4", "f/4", "g/4", "a/4"], bassRange: ["c/3", "f/3"], rhythms: ["h", "w"], maxJumps: 0, chordsAllowed: true, numNotes: 20 }
            },
            {
                id: "ch1-l3", courseId: "chords-101", name: "Song: Minuet in G", description: "Bach's famous minuet played with melodic chords.",
                focus: "Play the block chords in the left hand cleanly while navigating the melody in the right.",
                instruction: "Practice reading the G Major and C Major chords in the bass clef.",
                type: 'song', topic: 'chords', xpReward: 400, requiredXp: 5275,
                songUrl: '/scores/Minuet_in_G.musicxml'
            },
            {
                id: "ch1-l4", courseId: "chords-101", name: "Pop Progression", description: "Practice jumping between common chord shapes.",
                focus: "Memorize the physical shape of the chord in your hand so you can jump between them quickly.",
                instruction: "We will introduce G Major and A minor, completing the classic 4-chord pop progression.",
                type: 'exercise', topic: 'chords', xpReward: 300, requiredXp: 5675,
                constraints: { trebleRange: extendedTreble, bassRange: extendedBass, rhythms: ["h", "w"], maxJumps: 0, chordsAllowed: true, numNotes: 32 }
            },
            {
                id: "ch1-l5", courseId: "chords-101", name: "Broken Chords", description: "Arpeggiate the chords by playing the notes individually.",
                focus: "Keep an even rhythm when breaking the chord apart.",
                instruction: "Instead of playing C-E-G together, you will play C, then E, then G in sequence.",
                type: 'exercise', topic: 'chords', xpReward: 300, requiredXp: 5975,
                constraints: { trebleRange: extendedTreble, bassRange: extendedBass, rhythms: ["8"], maxJumps: 2, chordsAllowed: false, numNotes: 48 }
            },
            {
                id: "ch1-l6", courseId: "chords-101", name: "Song: Twinkle Twinkle", description: "A famous melody accompanied by full chords.",
                focus: "Land the left hand chord exactly at the same time as the first melody note of each measure.",
                instruction: "Your left hand will play C Major, G Major, and F Major chords while your right hand plays the star's melody.",
                type: 'song', topic: 'chords', xpReward: 500, requiredXp: 6275,
                songUrl: '/scores/Twinkle_Twinkle.musicxml'
            }
        ]
    },
    {
        id: "scales-1",
        name: "Scales & Agility",
        description: "Build finger speed and dexterity with foundational scales.",
        order: 5,
        lessons: [
            {
                id: "s1-l1", courseId: "scales-1", name: "C Major Scale (RH)", description: "Learn the crossover technique to play a full octave.",
                focus: "The critical moment is crossing your thumb under your middle finger to reach F.",
                instruction: "Play C, D, E with fingers 1, 2, 3. Then tuck your thumb *under* finger 3 to play F, and continue up to C.",
                type: 'exercise', topic: 'treble', xpReward: 300, requiredXp: 6375,
                constraints: { trebleRange: [...cPosTreble, "a/4", "b/4", "c/5"], bassRange: [], rhythms: ["8"], maxJumps: 1, chordsAllowed: false, numNotes: 24 }
            },
            {
                id: "s1-l2", courseId: "scales-1", name: "G Major Scale (RH)", description: "Introduce the F# key in the G Major scale.",
                focus: "Remember to hit the black key (F#) just before you reach the top G.",
                instruction: "Start on G. The fingering is exactly the same as C Major (1-2-3-1-2-3-4-5).",
                type: 'exercise', topic: 'treble', xpReward: 300, requiredXp: 6675,
                constraints: { trebleRange: ["g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f#/5", "g/5"], bassRange: [], rhythms: ["8"], maxJumps: 1, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: "s1-l3", courseId: "scales-1", name: "Speed Drills", description: "Fast-paced eighth note drills.",
                focus: "Agility comes from relaxation. Do not tense your forearm.",
                instruction: "A long sequence of fast scalar runs. Play lightly but rhythmically.",
                type: 'exercise', topic: 'treble', xpReward: 500, requiredXp: 6975,
                constraints: { trebleRange: extendedTreble, bassRange: [], rhythms: ["16", "8"], maxJumps: 2, chordsAllowed: false, numNotes: 64 }
            }
        ]
    },
    {
        id: "interval-training",
        name: "Interval Training",
        description: "Drill recognizing exactly how far apart two notes are.",
        order: 6,
        lessons: [
            {
                id: "int-l1", courseId: "interval-training", name: "3rds and 4ths", description: "Recognize small skips visually.",
                focus: "A 3rd goes from line-to-line or space-to-space. A 4th goes from line-to-space.",
                instruction: "Focus on visually identifying the gap between the notes without reading the actual letter name.",
                type: 'exercise', topic: 'both', xpReward: 300, requiredXp: 7475,
                constraints: { trebleRange: extendedTreble, bassRange: extendedBass, rhythms: ["q"], maxJumps: 3, chordsAllowed: false, numNotes: 32 }
            },
            {
                id: "int-l2", courseId: "interval-training", name: "Octave Leaps", description: "Massive 8-note leaps.",
                focus: "Stretch your hand from pinky to thumb to play the octave instinctively.",
                instruction: "You will jump exactly one octave up or down. Get a feel for the distance on your keyboard.",
                type: 'exercise', topic: 'both', xpReward: 400, requiredXp: 7775,
                constraints: { trebleRange: extendedTreble, bassRange: extendedBass, rhythms: ["q"], maxJumps: 7, chordsAllowed: false, numNotes: 32 }
            }
        ]
    },
    {
        id: "sight-reading-bootcamp",
        name: "Sight Reading Bootcamp",
        description: "Pure, randomized drills stretching across the entire grand staff.",
        order: 7,
        lessons: [
            {
                id: "sr-l1", courseId: "sight-reading-bootcamp", name: "Random Encounters I", description: "Completely randomized notes and rhythms.",
                focus: "Do not stop. Even if you make a mistake, keep your eyes moving forward.",
                instruction: "This is a true test of your reading ability. It will combine everything you've learned into a highly chaotic, unpredictable piece.",
                type: 'exercise', topic: 'both', xpReward: 500, requiredXp: 8175,
                constraints: { trebleRange: extendedTreble, bassRange: extendedBass, rhythms: ["q", "8", "h"], maxJumps: 4, chordsAllowed: true, numNotes: 64 }
            },
            {
                id: "sr-l2", courseId: "sight-reading-bootcamp", name: "Endurance Test", description: "A very long sight reading marathon.",
                focus: "Maintain focus. Fatigue will lead to missed notes.",
                instruction: "An extensive, 100-note barrage of music. Good luck!",
                type: 'exercise', topic: 'both', xpReward: 1000, requiredXp: 8675,
                constraints: { trebleRange: extendedTreble.concat(highTreble), bassRange: extendedBass, rhythms: ["16", "8", "q"], maxJumps: 5, chordsAllowed: true, numNotes: 100 }
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
