import { useState, useEffect, useCallback } from 'react';
import { getLessonById } from '../utils/music/CourseData';

// Simple UUID generator if uuid package isn't available
const generateUUID = () => {
    return crypto.randomUUID();
};

export interface LibraryScore {
    id: string;
    title: string;
    composer?: string;
    dateAdded: number;
    tags: string[];
    fileName: string;
    fileData?: Blob;
    songUrl?: string;
    highScore?: number;
    rank?: string;
    notesHit?: number;
    maxNotes?: number;
}

export interface LessonProgress {
    lessonId: string;
    completed: boolean;
    dateCompleted: number;
    bestAccuracy: number;
    bestRank: string;
    xpEarned: number;
}

const PRESET_SCORES: LibraryScore[] = [
    {
        id: 'preset-au-clair-de-la-lune',
        title: 'Au Clair de la Lune',
        composer: 'Traditional',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Folk'],
        fileName: 'Au_Clair_De_La_Lune.musicxml',
        songUrl: '/scores/Au_Clair_De_La_Lune.musicxml'
    },
    {
        id: 'preset-jingle-bells',
        title: 'Jingle Bells',
        composer: 'James Lord Pierpont',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Holiday'],
        fileName: 'Jingle_Bells.musicxml',
        songUrl: '/scores/Jingle_Bells.musicxml'
    },
    {
        id: 'preset-mary-lamb',
        title: 'Mary Had a Little Lamb',
        composer: 'Traditional',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Folk'],
        fileName: 'Mary_Lamb.musicxml',
        songUrl: '/scores/Mary_Lamb.musicxml'
    },
    {
        id: 'preset-ode-to-joy',
        title: 'Ode to Joy',
        composer: 'Ludwig van Beethoven',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Classical'],
        fileName: 'Ode_to_Joy.musicxml',
        songUrl: '/scores/Ode_to_Joy.musicxml'
    },
    {
        id: 'preset-twinkle-twinkle',
        title: 'Twinkle Twinkle Little Star',
        composer: 'Traditional',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Folk'],
        fileName: 'Twinkle_Twinkle.musicxml',
        songUrl: '/scores/Twinkle_Twinkle.musicxml'
    },
    {
        id: 'preset-good-king-wenceslas',
        title: 'Good King Wenceslas',
        composer: 'Traditional',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Holiday'],
        fileName: 'Good_King_Wenceslas.musicxml',
        songUrl: '/scores/Good_King_Wenceslas.musicxml'
    },
    {
        id: 'preset-fur-elise-easy',
        title: 'Für Elise (Simplified)',
        composer: 'Ludwig van Beethoven',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Classical'],
        fileName: 'Fur_Elise_Simplified.musicxml',
        songUrl: '/scores/Fur_Elise_Simplified.musicxml'
    },
    {
        id: 'preset-minuet-g',
        title: 'Minuet in G Major',
        composer: 'Christian Petzold / J.S. Bach',
        dateAdded: 1718000000000,
        tags: ['Fundamentals', 'Beginner', 'Classical'],
        fileName: 'bach_minuet_g_major.musicxml',
        songUrl: '/scores/bach_minuet_g_major.musicxml'
    },
    {
        id: 'preset-ladygaga',
        title: 'Always Remember Us This Way',
        composer: 'Lady Gaga',
        dateAdded: 1718000000000,
        tags: ['Pop', 'Intermediate'],
        fileName: 'Always_remember_us_this_way__Lady_Gaga.mxl',
        songUrl: '/scores/Always_remember_us_this_way__Lady_Gaga.mxl'
    },
    {
        id: 'preset-runescape-autumn',
        title: 'Autumn Voyage',
        composer: 'RuneScape',
        dateAdded: 1718000000001,
        tags: ['Game', 'Intermediate'],
        fileName: 'Autumn_Voyage_-_Runescape.mxl',
        songUrl: '/scores/Autumn_Voyage_-_Runescape.mxl'
    },
    {
        id: 'preset-satie-reloaded',
        title: 'Gymnopédie No. 1 (Reloaded)',
        composer: 'Erik Satie',
        dateAdded: 1718000000002,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Erik_Satie_Gymnopedie_No._1_Reloaded.mxl',
        songUrl: '/scores/Erik_Satie_Gymnopedie_No._1_Reloaded.mxl'
    },
    {
        id: 'preset-bach-fugue',
        title: 'Fugue I in C Major',
        composer: 'J.S. Bach',
        dateAdded: 1718000000003,
        tags: ['Classical', 'Advanced'],
        fileName: 'Fugue_I_in_C_major_BWV_846_-_Well_Tempered_Clavier_First_Book.mxl',
        songUrl: '/scores/Fugue_I_in_C_major_BWV_846_-_Well_Tempered_Clavier_First_Book.mxl'
    },
    {
        id: 'preset-kpop',
        title: 'Golden (Demon Hunters OST)',
        composer: 'HUNTRX',
        dateAdded: 1718000000004,
        tags: ['K-Pop', 'Intermediate'],
        fileName: 'Golden__HUNTRX_KPOP_Demon_Hunters_OST.mxl',
        songUrl: '/scores/Golden__HUNTRX_KPOP_Demon_Hunters_OST.mxl'
    },
    {
        id: 'preset-satie',
        title: 'Gymnopédie No. 1',
        composer: 'Erik Satie',
        dateAdded: 1718000000005,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Gymnopdie_No._1__Satie.mxl',
        songUrl: '/scores/Gymnopdie_No._1__Satie.mxl'
    },
    {
        id: 'preset-yiruma',
        title: 'Kiss the Rain',
        composer: 'Yiruma',
        dateAdded: 1718000000006,
        tags: ['New Age', 'Intermediate'],
        fileName: 'Kiss_the_Rain_-_Yiruma.mxl',
        songUrl: '/scores/Kiss_the_Rain_-_Yiruma.mxl'
    },
    {
        id: 'preset-passenger',
        title: 'Let Her Go',
        composer: 'Passenger',
        dateAdded: 1718000000007,
        tags: ['Pop', 'Intermediate'],
        fileName: 'Let_Her_Go_Passenger.mxl',
        songUrl: '/scores/Let_Her_Go_Passenger.mxl'
    },
    {
        id: 'preset-clementi',
        title: 'Sonatina Op. 36 No. 1 (Part 1)',
        composer: 'Muzio Clementi',
        dateAdded: 1718000000008,
        tags: ['Classical', 'Intermediate'],
        fileName: 'MuzioClementi_SonatinaOpus36No1_Part1.xml',
        songUrl: '/scores/MuzioClementi_SonatinaOpus36No1_Part1.xml'
    },
    {
        id: 'preset-passacaglia',
        title: 'Passacaglia',
        composer: 'Handel / Halvorsen',
        dateAdded: 1718000000009,
        tags: ['Classical', 'Advanced'],
        fileName: 'Passacaglia.mxl',
        songUrl: '/scores/Passacaglia.mxl'
    },
    {
        id: 'preset-bach-prelude',
        title: 'Prelude No. 1 in C Major',
        composer: 'J.S. Bach',
        dateAdded: 1718000000010,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Prelude_No._1_in_C_Major_BWV_846_with_finger_suggestions_-_Johann_Sebastian_Bach.mxl',
        songUrl: '/scores/Prelude_No._1_in_C_Major_BWV_846_with_finger_suggestions_-_Johann_Sebastian_Bach.mxl'
    },
    {
        id: 'preset-runescape-shanty',
        title: 'Sea Shanty 2',
        composer: 'RuneScape',
        dateAdded: 1718000000011,
        tags: ['Game', 'Intermediate'],
        fileName: 'Sea_Shanty_2_-_Runescape.mxl',
        songUrl: '/scores/Sea_Shanty_2_-_Runescape.mxl'
    },
    {
        id: 'preset-solitude',
        title: 'Solitude of the Rain',
        composer: 'Unknown',
        dateAdded: 1718000000012,
        tags: ['New Age', 'Intermediate'],
        fileName: 'Solitude_of_the_Rain.xml',
        songUrl: '/scores/Solitude_of_the_Rain.xml'
    },
    {
        id: 'preset-runescape-autumn-xml',
        title: 'Autumn Voyage (XML)',
        composer: 'RuneScape',
        dateAdded: 1718000000045,
        tags: ['Game', 'Intermediate'],
        fileName: 'Autumn_Voyage_-_Runescape.musicxml',
        songUrl: '/scores/Autumn_Voyage_-_Runescape.musicxml'
    },
    {
        id: 'preset-minuet-g-traditional',
        title: 'Minuet in G Major (Traditional)',
        composer: 'Christian Petzold / J.S. Bach',
        dateAdded: 1718000000046,
        tags: ['Classical', 'Beginner'],
        fileName: 'Minuet_in_G.musicxml',
        songUrl: '/scores/Minuet_in_G.musicxml'
    },
    {
        id: 'preset-passacaglia-xml',
        title: 'Passacaglia (XML)',
        composer: 'Handel / Halvorsen',
        dateAdded: 1718000000047,
        tags: ['Classical', 'Advanced'],
        fileName: 'Passacaglia.musicxml',
        songUrl: '/scores/Passacaglia.musicxml'
    },
    {
        id: 'preset-bach-prelude-xml',
        title: 'Prelude No. 1 in C Major (XML)',
        composer: 'J.S. Bach',
        dateAdded: 1718000000048,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Prelude_No._1_in_C_Major_BWV_846_with_finger_suggestions_-_Johann_Sebastian_Bach.musicxml',
        songUrl: '/scores/Prelude_No._1_in_C_Major_BWV_846_with_finger_suggestions_-_Johann_Sebastian_Bach.musicxml'
    },
    {
        id: 'preset-vanzo',
        title: 'Sunlight',
        composer: 'Andrea Vanzo',
        dateAdded: 1718000000013,
        tags: ['Classical', 'Intermediate'],
        fileName: 'sunlight-andrea-vanzo.mxl',
        songUrl: '/scores/sunlight-andrea-vanzo.mxl'
    },
    {
        id: 'preset-canon',
        title: 'Canon in D',
        composer: 'Johann Pachelbel',
        dateAdded: 1718000000014,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Canon_in_D.mxl',
        songUrl: '/scores/Canon_in_D.mxl'
    },
    {
        id: 'preset-clairlune',
        title: 'Clair de Lune',
        composer: 'Claude Debussy',
        dateAdded: 1718000000015,
        tags: ['Classical', 'Advanced'],
        fileName: 'Clair_de_Lune__Debussy.mxl',
        songUrl: '/scores/Clair_de_Lune__Debussy.mxl'
    },
    {
        id: 'preset-chopin-nocturne92',
        title: 'Nocturne Op. 9 No. 2',
        composer: 'Frédéric Chopin',
        dateAdded: 1718000000016,
        tags: ['Classical', 'Advanced'],
        fileName: 'Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major.mxl',
        songUrl: '/scores/Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major.mxl'
    },
    {
        id: 'preset-liszt-liebestraum',
        title: 'Liebestraum No. 3',
        composer: 'Franz Liszt',
        dateAdded: 1718000000017,
        tags: ['Classical', 'Advanced'],
        fileName: 'Liebestraum_No._3_in_A_Major.mxl',
        songUrl: '/scores/Liebestraum_No._3_in_A_Major.mxl'
    },
    {
        id: 'preset-mozart-rondo',
        title: 'Rondo alla Turca',
        composer: 'W.A. Mozart',
        dateAdded: 1718000000018,
        tags: ['Classical', 'Advanced'],
        fileName: 'Piano_Sonata_No._11_K._331_3rd_Movement_Rondo_alla_Turca.mxl',
        songUrl: '/scores/Piano_Sonata_No._11_K._331_3rd_Movement_Rondo_alla_Turca.mxl'
    },
    {
        id: 'preset-beethoven-moonlight1',
        title: 'Moonlight Sonata (1st Movement)',
        composer: 'Ludwig van Beethoven',
        dateAdded: 1718000000019,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Sonate_No._14_Moonlight_1st_Movement.mxl',
        songUrl: '/scores/Sonate_No._14_Moonlight_1st_Movement.mxl'
    },
    {
        id: 'preset-beethoven-pathetique2',
        title: 'Pathétique Sonata (2nd Movement)',
        composer: 'Ludwig van Beethoven',
        dateAdded: 1718000000020,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Sonate_No._8_Pathetique_2nd_Movement.mxl',
        songUrl: '/scores/Sonate_No._8_Pathetique_2nd_Movement.mxl'
    },
    {
        id: 'preset-chopin-waltz-aminor',
        title: 'Waltz in A Minor',
        composer: 'Frédéric Chopin',
        dateAdded: 1718000000021,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Waltz_in_A_MinorChopin.mxl',
        songUrl: '/scores/Waltz_in_A_MinorChopin.mxl'
    },
    {
        id: 'preset-joplin-entertainer',
        title: 'The Entertainer',
        composer: 'Scott Joplin',
        dateAdded: 1718000000022,
        tags: ['Ragtime', 'Intermediate'],
        fileName: 'The_Entertainer_-_Scott_Joplin.mxl',
        songUrl: '/scores/The_Entertainer_-_Scott_Joplin.mxl'
    },
    {
        id: 'preset-tchaikovsky-swanlake',
        title: 'Swan Lake Theme',
        composer: 'Pyotr Ilyich Tchaikovsky',
        dateAdded: 1718000000023,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Swan_Lake.mxl',
        songUrl: '/scores/Swan_Lake.mxl'
    },
    {
        id: 'preset-bellaciao-filmtv',
        title: 'Bella Ciao (Money Heist)',
        composer: 'Traditional / Film & TV',
        dateAdded: 1718000000024,
        tags: ['Folk', 'Film & TV', 'Intermediate'],
        fileName: 'Bella_Ciao_-_La_Casa_de_Papel.mxl',
        songUrl: '/scores/Bella_Ciao_-_La_Casa_de_Papel.mxl'
    },
    {
        id: 'preset-carol-bells',
        title: 'Carol of the Bells',
        composer: 'Mykola Leontovych',
        dateAdded: 1718000000025,
        tags: ['Holiday', 'Intermediate'],
        fileName: 'Carol_of_the_Bells.mxl',
        songUrl: '/scores/Carol_of_the_Bells.mxl'
    },
    {
        id: 'preset-bumblebee',
        title: 'Flight of the Bumblebee',
        composer: 'Nikolai Rimsky-Korsakov',
        dateAdded: 1718000000026,
        tags: ['Classical', 'Advanced'],
        fileName: 'Flight_of_the_Bumblebee.mxl',
        songUrl: '/scores/Flight_of_the_Bumblebee.mxl'
    },
    {
        id: 'preset-mozart-lacrimosa',
        title: 'Lacrimosa (Requiem)',
        composer: 'W.A. Mozart',
        dateAdded: 1718000000027,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Lacrimosa_-_Requiem.mxl',
        songUrl: '/scores/Lacrimosa_-_Requiem.mxl'
    },
    {
        id: 'preset-sugarplum',
        title: 'Dance of the Sugar Plum Fairy',
        composer: 'Pyotr Ilyich Tchaikovsky',
        dateAdded: 1718000000028,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Dance_of_the_sugar_plum_fairy.mxl',
        songUrl: '/scores/Dance_of_the_sugar_plum_fairy.mxl'
    },
    {
        id: 'preset-mariagedamour',
        title: "Mariage d'Amour",
        composer: 'Paul de Senneville',
        dateAdded: 1718000000029,
        tags: ['New Age', 'Intermediate'],
        fileName: 'Mariage_dAmour.mxl',
        songUrl: '/scores/Mariage_dAmour.mxl'
    },
    {
        id: 'preset-debussy-arabesque1',
        title: 'Arabesque No. 1',
        composer: 'Claude Debussy',
        dateAdded: 1718000000030,
        tags: ['Classical', 'Advanced'],
        fileName: 'Arabesque_L._66_No._1_in_E_Major.mxl',
        songUrl: '/scores/Arabesque_L._66_No._1_in_E_Major.mxl'
    },
    {
        id: 'preset-bach-toccata',
        title: 'Toccata and Fugue in D Minor',
        composer: 'J.S. Bach',
        dateAdded: 1718000000031,
        tags: ['Classical', 'Advanced'],
        fileName: 'Bach_Toccata_and_Fugue_in_D_Minor_Piano_solo.mxl',
        songUrl: '/scores/Bach_Toccata_and_Fugue_in_D_Minor_Piano_solo.mxl'
    },
    {
        id: 'preset-beethoven-symphony5',
        title: 'Symphony No. 5 (1st Movement)',
        composer: 'Ludwig van Beethoven',
        dateAdded: 1718000000032,
        tags: ['Classical', 'Advanced'],
        fileName: 'Beethoven_Symphony_No._5_1st_movement_Piano_solo.mxl',
        songUrl: '/scores/Beethoven_Symphony_No._5_1st_movement_Piano_solo.mxl'
    },
    {
        id: 'preset-brahms-hungarian5',
        title: 'Hungarian Dance No. 5',
        composer: 'Johannes Brahms',
        dateAdded: 1718000000033,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Hungarian_Dance_No_5_in_G_Minor.mxl',
        songUrl: '/scores/Hungarian_Dance_No_5_in_G_Minor.mxl'
    },
    {
        id: 'preset-chopin-waltz-csharp',
        title: 'Waltz in C-sharp Minor (Op. 64 No. 2)',
        composer: 'Frédéric Chopin',
        dateAdded: 1718000000034,
        tags: ['Classical', 'Advanced'],
        fileName: 'Waltz_Opus_64_No._2_in_C_Minor.mxl',
        songUrl: '/scores/Waltz_Opus_64_No._2_in_C_Minor.mxl'
    },
    {
        id: 'preset-satie-gnossienne1',
        title: 'Gnossienne No. 1',
        composer: 'Erik Satie',
        dateAdded: 1718000000035,
        tags: ['Classical', 'Intermediate'],
        fileName: 'Gnossienne_No._1.mxl',
        songUrl: '/scores/Gnossienne_No._1.mxl'
    },
    {
        id: 'preset-schubert-serenade',
        title: 'Ständchen (Serenade)',
        composer: 'Franz Schubert / Franz Liszt',
        dateAdded: 1718000000036,
        tags: ['Classical', 'Advanced'],
        fileName: 'Schubert_Serenade_-_Standchen_-_By_Lizst.mxl',
        songUrl: '/scores/Schubert_Serenade_-_Standchen_-_By_Lizst.mxl'
    },
    {
        id: 'preset-bach-minuet-g-minor',
        title: 'Minuet in G Minor',
        composer: 'Christian Petzold / J.S. Bach',
        dateAdded: 1718000000041,
        tags: ['Classical', 'Beginner'],
        fileName: 'bach_minuet_g_minor.musicxml',
        songUrl: '/scores/bach_minuet_g_minor.musicxml'
    },
    {
        id: 'preset-tiersen-comptine',
        title: "Comptine d'un autre été : L'après-midi",
        composer: 'Yann Tiersen',
        dateAdded: 1718000000042,
        tags: ['Film & TV', 'New Age', 'Intermediate'],
        fileName: 'comptine_tiersen.musicxml',
        songUrl: '/scores/comptine_tiersen.musicxml'
    },
    {
        id: 'preset-burgmuller-arabesque',
        title: 'Arabesque (Op. 100 No. 2)',
        composer: 'Johann Friedrich Burgmüller',
        dateAdded: 1718000000043,
        tags: ['Classical', 'Intermediate'],
        fileName: 'arabesque_burgmuller.musicxml',
        songUrl: '/scores/arabesque_burgmuller.musicxml'
    },
    {
        id: 'preset-falling-apart',
        title: 'Falling Apart',
        composer: 'Unknown',
        dateAdded: 1718000000044,
        tags: ['New Age', 'Intermediate'],
        fileName: 'falling_apart.musicxml',
        songUrl: '/scores/falling_apart.musicxml'
    }
];

const DB_NAME = 'PianoPilotDB';
const STORE_NAME = 'scores';
const LESSON_PROGRESS_STORE = 'lesson_progress';
const VERSION = 2; // Bumped to 2 for lesson progress tracking

export function useMusicLibrary() {
    const [scores, setScores] = useState<LibraryScore[]>([]);
    const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize DB and load scores
    useEffect(() => {
        const initDB = async () => {
            try {
                const db = await openDB();
                const loadedScores = await getAllScoresFromDB(db);
                const loadedProgress = await getLessonProgressFromDB(db);
                
                // Merge preset scores with preset definitions in IndexedDB
                const mergedPresets = PRESET_SCORES.map(preset => {
                    const dbRecord = loadedScores.find(s => s.id === preset.id);
                    if (dbRecord) {
                        return {
                            ...preset,
                            highScore: dbRecord.highScore,
                            rank: dbRecord.rank,
                            notesHit: dbRecord.notesHit,
                            maxNotes: dbRecord.maxNotes
                        };
                    }
                    return preset;
                });

                // Filter out preset records from the database loads to avoid duplicates
                const customScores = loadedScores.filter(s => !s.id.startsWith('preset-'));

                setScores([...mergedPresets, ...customScores]);

                // Map lesson progress array to keyed dictionary
                const progressMap = loadedProgress.reduce((acc, curr) => {
                    acc[curr.lessonId] = curr;
                    return acc;
                }, {} as Record<string, LessonProgress>);
                setLessonProgress(progressMap);

                setLoading(false);
            } catch (err: any) {
                console.error("Failed to init DB:", err);
                setError("Failed to load music library.");
                setLoading(false);
            }
        };

        initDB();
    }, []);

    const openDB = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('dateAdded', 'dateAdded', { unique: false });
                    store.createIndex('title', 'title', { unique: false });
                }
                if (!db.objectStoreNames.contains(LESSON_PROGRESS_STORE)) {
                    db.createObjectStore(LESSON_PROGRESS_STORE, { keyPath: 'lessonId' });
                }
            };
        });
    };

    const getAllScoresFromDB = (db: IDBDatabase): Promise<LibraryScore[]> => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by date added (newest first) by default
                const result = request.result as LibraryScore[];
                result.sort((a, b) => b.dateAdded - a.dateAdded);
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    };

    const getLessonProgressFromDB = (db: IDBDatabase): Promise<LessonProgress[]> => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(LESSON_PROGRESS_STORE, 'readonly');
            const store = transaction.objectStore(LESSON_PROGRESS_STORE);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result as LessonProgress[]);
            request.onerror = () => reject(request.error);
        });
    };

    const addScore = useCallback(async (file: File, title?: string, composer?: string, tags: string[] = []) => {
        try {
            const db = await openDB();
            const hasDifficulty = tags.some(t => ['beginner', 'intermediate', 'advanced'].includes(t.toLowerCase()));
            const finalTags = hasDifficulty ? tags : ['Beginner', ...tags];

            const newScore: LibraryScore = {
                id: generateUUID(),
                title: title || file.name.replace(/\.(xml|mxl|musicxml)$/i, ''),
                composer: composer || 'Unknown',
                dateAdded: Date.now(),
                tags: finalTags,
                fileName: file.name,
                fileData: file
            };

            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            await new Promise<void>((resolve, reject) => {
                const request = store.add(newScore);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            // Refresh list
            setScores(prev => [newScore, ...prev]);
            return newScore;

        } catch (err: any) {
            console.error("Failed to add score:", err);
            setError("Failed to save score.");
            throw err;
        }
    }, []);

    const deleteScore = useCallback(async (id: string) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            await new Promise<void>((resolve, reject) => {
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            setScores(prev => prev.filter(s => s.id !== id));

        } catch (err: any) {
            console.error("Failed to delete score:", err);
            setError("Failed to delete score.");
        }
    }, []);

    const updateScoreMetadata = useCallback(async (id: string, updates: Partial<Pick<LibraryScore, 'title' | 'composer' | 'tags'>>) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const score = await new Promise<LibraryScore>((resolve, reject) => {
                const req = store.get(id);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });

            if (!score) throw new Error("Score not found");

            const updatedScore = { ...score, ...updates };

            await new Promise<void>((resolve, reject) => {
                const req = store.put(updatedScore);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });

            setScores(prev => prev.map(s => s.id === id ? updatedScore : s));

        } catch (err: any) {
            console.error("Failed to update score:", err);
            setError("Failed to update score details.");
        }
    }, []);

    const savePresetOrCustomScoreInDB = async (db: IDBDatabase, targetId: string, score: number, rank: string, notesHit: number, maxNotes: number) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const existing = await new Promise<LibraryScore | undefined>((resolve, reject) => {
            const req = store.get(targetId);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });

        let updatedScore: LibraryScore;
        const isNewHighScore = score > (existing?.highScore || 0);

        if (existing) {
            updatedScore = {
                ...existing,
                highScore: isNewHighScore ? score : existing.highScore,
                rank: isNewHighScore ? rank : existing.rank,
                notesHit: isNewHighScore ? notesHit : existing.notesHit,
                maxNotes: isNewHighScore ? maxNotes : existing.maxNotes
            };
        } else {
            const preset = PRESET_SCORES.find(p => p.id === targetId);
            if (preset) {
                updatedScore = {
                    ...preset,
                    highScore: score,
                    rank,
                    notesHit,
                    maxNotes
                };
            } else {
                throw new Error("Score details not found in presets or custom database.");
            }
        }

        await new Promise<void>((resolve, reject) => {
            const req = store.put(updatedScore);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });

        setScores(prev => prev.map(s => {
            if (s.id === targetId) {
                return {
                    ...s,
                    highScore: isNewHighScore ? score : s.highScore,
                    rank: isNewHighScore ? rank : s.rank,
                    notesHit: isNewHighScore ? notesHit : s.notesHit,
                    maxNotes: isNewHighScore ? maxNotes : s.maxNotes
                };
            }
            return s;
        }));
    };

    const saveHighScore = useCallback(async (id: string, score: number, rank: string, notesHit: number, maxNotes: number) => {
        try {
            const db = await openDB();
            const lesson = getLessonById(id);

            if (lesson) {
                // 1. Save lesson completion progress
                const progressTx = db.transaction(LESSON_PROGRESS_STORE, 'readwrite');
                const progressStore = progressTx.objectStore(LESSON_PROGRESS_STORE);
                
                const existingProgress = await new Promise<LessonProgress | undefined>((resolve, reject) => {
                    const req = progressStore.get(id);
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });

                const isNewBestAccuracy = score > (existingProgress?.bestAccuracy || 0);
                const updatedProgress: LessonProgress = {
                    lessonId: id,
                    completed: true,
                    dateCompleted: Date.now(),
                    bestAccuracy: isNewBestAccuracy ? score : (existingProgress?.bestAccuracy || score),
                    bestRank: isNewBestAccuracy ? rank : (existingProgress?.bestRank || rank),
                    xpEarned: (existingProgress?.xpEarned || 0) + lesson.xpReward
                };

                await new Promise<void>((resolve, reject) => {
                    const req = progressStore.put(updatedProgress);
                    req.onsuccess = () => resolve();
                    req.onerror = () => reject(req.error);
                });

                setLessonProgress(prev => ({
                    ...prev,
                    [id]: updatedProgress
                }));

                // 2. If it is a song lesson with a linked presetId, save to the scores store as well
                if (lesson.type === 'song' && lesson.presetId) {
                    await savePresetOrCustomScoreInDB(db, lesson.presetId, score, rank, notesHit, maxNotes);
                }
            } else {
                // It is a standard library song (preset or custom upload)
                await savePresetOrCustomScoreInDB(db, id, score, rank, notesHit, maxNotes);
            }
        } catch (err: any) {
            console.error("Failed to save high score:", err);
        }
    }, []);

    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            const raw = localStorage.getItem('pianopilot_bookmarks');
            if (raw) {
                setBookmarkedIds(new Set(JSON.parse(raw)));
            }
        } catch (e) {
            console.error("Failed to load bookmarks:", e);
        }
    }, []);

    const toggleBookmark = useCallback((id: string) => {
        setBookmarkedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            localStorage.setItem('pianopilot_bookmarks', JSON.stringify(Array.from(next)));
            return next;
        });
    }, []);

    return {
        scores,
        loading,
        error,
        addScore,
        deleteScore,
        updateScoreMetadata,
        saveHighScore,
        bookmarkedIds,
        toggleBookmark,
        lessonProgress
    };
}
