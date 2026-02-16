import React, { useState, useMemo } from 'react';
import { useMusicLibrary } from '../hooks/useMusicLibrary';

interface MusicLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectScore: (file: File) => void;
    uploadedFile?: File | null;
    fileName?: string | null;
    xmlData?: string | null;
    setXmlData?: (data: string | null) => void;
    onClearScore?: () => void;
}

export const MusicLibrary: React.FC<MusicLibraryProps> = ({
    isOpen,
    onClose,
    onSelectScore,
    uploadedFile,
    fileName,
    xmlData,
    setXmlData,
    onClearScore
}) => {
    const { scores, loading, error, addScore, deleteScore } = useMusicLibrary();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const filteredScores = useMemo(() => {
        return scores.filter(score =>
            score.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            score.composer?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [scores, searchTerm]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await addScore(file);
        } catch (e) {
            console.error(e);
            alert("Failed to upload score");
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this score?")) {
            await deleteScore(id);
        }
    };

    if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80"><div className="text-xl font-bold animate-pulse">Loading Library...</div></div>;
    if (error) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80"><div className="text-xl font-bold text-red-500">{error}</div></div>;

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="container mx-auto p-4 md:p-8">
                {/* Header / Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-2xl">←</button>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-white">Music Library</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{scores.length} scores stored</p>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search scores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-64"
                        />

                        <label className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span>{isUploading ? 'Uploading...' : 'Upload New'}</span>
                            <input
                                type="file"
                                accept=".xml,.musicxml,.mxl"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredScores.map(score => (
                        <div
                            key={score.id}
                            onClick={() => {
                                onSelectScore(new File([score.fileData], score.fileName));
                                onClose();
                            }}
                            className="group relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 transition cursor-pointer flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-start">
                                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, score.id)}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                                    title="Delete Score"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-blue-600 transition">{score.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{score.composer}</p>
                            </div>

                            <div className="mt-2 flex gap-1 flex-wrap">
                                {score.tags?.map(tag => (
                                    <span key={tag} className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                                <span className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-full">
                                    {score.fileName.split('.').pop()}
                                </span>
                            </div>

                            <div className="mt-auto pt-4 text-xs text-gray-400">
                                Added: {new Date(score.dateAdded).toLocaleDateString()}
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {filteredScores.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                            {searchTerm ? 'No scores found matching your search.' : 'Your library is empty. Upload a MusicXML file to get started!'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
