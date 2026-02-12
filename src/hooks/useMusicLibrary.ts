import { useState, useEffect, useCallback } from 'react';

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
    fileData: Blob;
}

const DB_NAME = 'PianoPilotDB';
const STORE_NAME = 'scores';
const VERSION = 1;

export function useMusicLibrary() {
    const [scores, setScores] = useState<LibraryScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize DB and load scores
    useEffect(() => {
        const initDB = async () => {
            try {
                const db = await openDB();
                const loadedScores = await getAllScoresFromDB(db);
                setScores(loadedScores);
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

    const addScore = useCallback(async (file: File, title?: string, composer?: string, tags: string[] = []) => {
        try {
            const db = await openDB();
            const newScore: LibraryScore = {
                id: generateUUID(),
                title: title || file.name.replace(/\.(xml|mxl|musicxml)$/i, ''),
                composer: composer || 'Unknown',
                dateAdded: Date.now(),
                tags,
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

    return {
        scores,
        loading,
        error,
        addScore,
        deleteScore,
        updateScoreMetadata
    };
}
