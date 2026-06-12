import React, { useState, useMemo } from 'react';
import { useMusicLibrary } from '../hooks/useMusicLibrary';

interface MusicLibraryProps {
    onSelectScore: (file: File | null, url?: string, title?: string) => void;
}

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ onSelectScore }) => {
    const { scores, loading, error, addScore, deleteScore } = useMusicLibrary();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'fundamentals' | 'classical' | 'modern' | 'custom'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

    const filteredScores = useMemo(() => {
        return scores.filter(score => {
            // Search filter
            const matchesSearch = 
                score.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                score.composer?.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            // Tab filter
            if (activeTab !== 'all') {
                if (activeTab === 'custom') {
                    if (score.id.startsWith('preset-')) return false;
                } else {
                    const tags = score.tags || [];
                    if (activeTab === 'fundamentals') {
                        if (!tags.includes('Fundamentals')) return false;
                    } else if (activeTab === 'classical') {
                        if (!tags.includes('Classical') && !tags.includes('Ragtime')) return false;
                    } else if (activeTab === 'modern') {
                        const modernGenres = ['Pop', 'Film & TV', 'Game', 'K-Pop', 'New Age', 'Holiday'];
                        if (!tags.some(t => modernGenres.includes(t))) return false;
                    }
                }
            }

            // Difficulty filter
            if (difficultyFilter !== 'all') {
                const tags = score.tags || [];
                const diffTag = difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1);
                if (!tags.includes(diffTag)) return false;
            }

            return true;
        });
    }, [scores, searchTerm, activeTab, difficultyFilter]);

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
            // Reset input
            event.target.value = '';
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this score?")) {
            await deleteScore(id);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Library...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="w-full max-w-6xl flex flex-col gap-6 p-4">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800/80 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 backdrop-blur transition-all duration-300">
                <div className="flex flex-col text-left">
                    <h2 className="text-2xl font-sans font-black text-gray-800 dark:text-white tracking-tight">Music Library</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{scores.length} scores stored</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search scores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-64 font-medium transition"
                    />

                    <label className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/15 active:scale-98 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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

            {/* Category Tabs & Difficulty Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/80 dark:bg-gray-800/40 rounded-2xl border border-gray-200/50 dark:border-gray-700/40 backdrop-blur">
                    {[
                        { id: 'all', label: 'All Pieces' },
                        { id: 'fundamentals', label: 'Piano Basics' },
                        { id: 'classical', label: 'Classical & Ragtime' },
                        { id: 'modern', label: 'Pop & Screen' },
                        { id: 'custom', label: 'My Uploads' }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        const count = scores.filter(score => {
                            if (tab.id === 'all') return true;
                            if (tab.id === 'custom') return !score.id.startsWith('preset-');
                            const tags = score.tags || [];
                            if (tab.id === 'fundamentals') return tags.includes('Fundamentals');
                            if (tab.id === 'classical') return tags.includes('Classical') || tags.includes('Ragtime');
                            if (tab.id === 'modern') {
                                const modernGenres = ['Pop', 'Film & TV', 'Game', 'K-Pop', 'New Age', 'Holiday'];
                                return tags.some(t => modernGenres.includes(t));
                            }
                            return true;
                        }).length;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 select-none ${
                                    isActive
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md shadow-gray-200/50 dark:shadow-none'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-750 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                                    isActive
                                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                        : 'bg-gray-200/70 dark:bg-gray-750 text-gray-500 dark:text-gray-450'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Difficulty Filters */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/40 dark:bg-gray-800/20 rounded-2xl border border-gray-200/30 dark:border-gray-700/20 backdrop-blur">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-bold px-2 uppercase tracking-wider">Difficulty:</span>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'beginner', label: 'Beginner', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/30' },
                        { id: 'intermediate', label: 'Intermediate', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30' },
                        { id: 'advanced', label: 'Advanced', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30' }
                    ].map(diff => {
                        const isActive = difficultyFilter === diff.id;
                        return (
                            <button
                                key={diff.id}
                                onClick={() => setDifficultyFilter(diff.id as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                                    isActive
                                        ? `${diff.id === 'all' ? 'bg-blue-600 text-white shadow-sm' : `${diff.color} border shadow-sm`}`
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-750'
                                }`}
                            >
                                {diff.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredScores.map(score => (
                    <div
                        key={score.id}
                        onClick={() => {
                            if (score.songUrl) {
                                onSelectScore(null, score.songUrl, score.title);
                            } else if (score.fileData) {
                                onSelectScore(new File([score.fileData], score.fileName));
                            }
                        }}
                        className="group relative bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/60 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col gap-3 backdrop-blur"
                    >
                        <div className="flex justify-between items-start">
                            <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-2.5 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            {!score.id.startsWith('preset-') && (
                                <button
                                    onClick={(e) => handleDelete(e, score.id)}
                                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750"
                                    title="Delete Score"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="text-left">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{score.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{score.composer}</p>
                        </div>

                        <div className="mt-1 flex gap-1.5 flex-wrap">
                            {score.tags?.map(tag => (
                                <span key={tag} className="text-[9px] uppercase font-extrabold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-450 px-2.5 py-1 rounded-full tracking-wider">
                                    {tag}
                                </span>
                            ))}
                            {/* Auto-tag file type */}
                            <span className="text-[9px] uppercase font-extrabold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-450 px-2.5 py-1 rounded-full tracking-wider">
                                {score.fileName.split('.').pop()}
                            </span>
                        </div>

                        <div className="mt-auto pt-4 text-[10px] text-gray-400 dark:text-gray-500 font-semibold text-left select-none">
                            Added: {new Date(score.dateAdded).toLocaleDateString()}
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredScores.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border-dashed border-2 border-gray-200 dark:border-gray-750 font-bold">
                        {searchTerm ? 'No scores found matching your search.' : 'Your library is empty. Upload a MusicXML file to get started!'}
                    </div>
                )}
            </div>
        </div>
    );
};
