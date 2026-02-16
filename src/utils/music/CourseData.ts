export interface Lesson {
    id: string;
    title: string;
    description: string;
    type: 'sight-reading' | 'rhythm';
    difficulty: number; // 1-5 stars?

    // Content
    treble: string[]; // e.g. ["C/4", "D/4"]
    bass: string[];

    // Criteria for Stars
    criteria: {
        3: number; // e.g. 0.95 (95%)
        2: number; // 0.80
        1: number; // 0.60
    };

    // Unlock Requirement?
    requiredLessonId?: string;
}

export interface Module {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export const COURSES: Module[] = [
    {
        id: 'basics_1',
        title: 'Module 1: The Basics',
        description: 'Start your journey here. Learn Middle C and the right hand position.',
        lessons: [
            {
                id: 'm1_l1',
                title: 'Middle C',
                description: 'Play Middle C with your right thumb.',
                type: 'sight-reading',
                difficulty: 1,
                treble: ['c/4', 'c/4', 'c/4', 'c/4'],
                bass: [],
                criteria: { 3: 1, 2: 0.75, 1: 0.5 }
            },
            {
                id: 'm1_l2',
                title: 'Walking Up',
                description: 'C, D, E using fingers 1, 2, 3.',
                type: 'sight-reading',
                difficulty: 1,
                treble: ['c/4', 'd/4', 'e/4', 'd/4', 'c/4'],
                bass: [],
                criteria: { 3: 0.9, 2: 0.7, 1: 0.5 },
                requiredLessonId: 'm1_l1'
            },
            {
                id: 'm1_l3',
                title: 'First Five',
                description: 'C to G. Use all 5 fingers.',
                type: 'sight-reading',
                difficulty: 1,
                treble: ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'f/4', 'e/4', 'd/4', 'c/4'],
                bass: [],
                criteria: { 3: 0.9, 2: 0.7, 1: 0.5 },
                requiredLessonId: 'm1_l2'
            }
        ]
    },
    {
        id: 'basics_2',
        title: 'Module 2: Left Hand',
        description: 'Introduction to the Bass Clef.',
        lessons: [
            {
                id: 'm2_l1',
                title: 'Bass C Position',
                description: 'C3 to G3 with the left hand.',
                type: 'sight-reading',
                difficulty: 1,
                treble: [],
                bass: ['c/3', 'd/3', 'e/3', 'f/3', 'g/3'],
                criteria: { 3: 0.9, 2: 0.75, 1: 0.5 },
                requiredLessonId: 'm1_l3'
            }
        ]
    }
];
