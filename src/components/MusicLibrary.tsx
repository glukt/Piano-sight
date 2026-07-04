import React, { useState, useMemo, useEffect } from 'react';
import { useMusicLibrary } from '../hooks/useMusicLibrary';

interface MusicLibraryProps {
    onSelectScore: (file: File | null, url?: string, title?: string, id?: string) => void;
    library: ReturnType<typeof useMusicLibrary>;
}

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ onSelectScore, library }) => {
    const { scores, loading, error, addScore, deleteScore, updateScoreMetadata, bookmarkedIds, toggleBookmark } = library;
    const [searchTerm, setSearchTerm] = useState('');
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'fundamentals' | 'classical' | 'modern' | 'custom'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(localSearchTerm);
        }, 150);
        return () => clearTimeout(handler);
    }, [localSearchTerm]);

    const filteredScores = useMemo(() => {
        return scores.filter(score => {
            // Search filter
            const matchesSearch = 
                score.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                score.composer?.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            // Tab filter
            if (activeTab !== 'all') {
                if (activeTab === 'bookmarks') {
                    if (!bookmarkedIds.has(score.id)) return false;
                } else if (activeTab === 'custom') {
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
                const hasAnyDiffTag = tags.some(t => ['beginner', 'intermediate', 'advanced'].includes(t.toLowerCase()));
                if (hasAnyDiffTag) {
                    if (!tags.some(t => t.toLowerCase() === difficultyFilter)) return false;
                } else {
                    if (difficultyFilter !== 'beginner') return false;
                }
            }

            return true;
        });
    }, [scores, searchTerm, activeTab, difficultyFilter, bookmarkedIds]);

    const tabCounts = useMemo(() => {
        const counts = { all: 0, bookmarks: 0, fundamentals: 0, classical: 0, modern: 0, custom: 0 };
        scores.forEach(score => {
            // Apply search filter (relative to searchTerm)
            const matchesSearch = 
                score.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                score.composer?.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return;

            // Apply difficulty filter
            if (difficultyFilter !== 'all') {
                const tags = score.tags || [];
                const hasAnyDiffTag = tags.some(t => ['beginner', 'intermediate', 'advanced'].includes(t.toLowerCase()));
                if (hasAnyDiffTag) {
                    if (!tags.some(t => t.toLowerCase() === difficultyFilter)) return;
                } else {
                    if (difficultyFilter !== 'beginner') return;
                }
            }

            counts.all++;
            if (bookmarkedIds.has(score.id)) counts.bookmarks++;
            if (!score.id.startsWith('preset-')) counts.custom++;
            
            const tags = score.tags || [];
            if (tags.includes('Fundamentals')) counts.fundamentals++;
            if (tags.includes('Classical') || tags.includes('Ragtime')) counts.classical++;
            const modernGenres = ['Pop', 'Film & TV', 'Game', 'K-Pop', 'New Age', 'Holiday'];
            if (tags.some(t => modernGenres.includes(t))) counts.modern++;
        });
        return counts;
    }, [scores, searchTerm, difficultyFilter, bookmarkedIds]);

    const [visibleCount, setVisibleCount] = useState(12);

    // Reset pagination when search, tab, or difficulty changes
    useEffect(() => {
        setVisibleCount(12);
    }, [searchTerm, activeTab, difficultyFilter]);

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

    const getTagStyle = (tag: string) => {
        const lower = tag.toLowerCase();
        if (lower === 'beginner') {
            return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-900/40';
        }
        if (lower === 'intermediate') {
            return 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-500/20 dark:border-amber-900/40';
        }
        if (lower === 'advanced') {
            return 'bg-rose-500/10 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border-rose-500/20 dark:border-rose-900/40';
        }
        return 'bg-slate-100/50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/30 dark:border-slate-750/30';
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-bold">Loading Library...</div>;
    if (error) return <div className="p-8 text-center text-rose-500 font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl">{error}</div>;

    return (
        <div className="w-full max-w-6xl flex flex-col gap-6 p-4">
            {/* Header / Actions Card */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/60 dark:bg-slate-900/60 p-6 rounded-3xl shadow-xl shadow-slate-100/10 dark:shadow-none border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md transition-all duration-300">
                <div className="flex flex-col text-left">
                    <h2 className="text-2xl font-sans font-black text-slate-800 dark:text-white tracking-tight">Music Library</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{scores.length} scores stored</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Field */}
                    <div className="relative flex-grow min-w-[200px] md:w-64 md:flex-initial">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="M21 21l-4.35-4.35"/>
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search scores..."
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none font-semibold transition duration-200"
                        />
                    </div>

                    {/* Upload New Button */}
                    <label className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md cursor-pointer select-none active:scale-98 border flex-shrink-0 ${
                        isUploading 
                            ? 'opacity-50 pointer-events-none' 
                            : 'bg-sky-500 hover:bg-sky-600 text-white border-sky-600 shadow-sky-500/25 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-sky-400 dark:border-sky-900/40 dark:shadow-none'
                    }`}>
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                        <span>{isUploading ? 'Uploading...' : 'Upload XML'}</span>
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
                <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 backdrop-blur">
                    {[
                        { id: 'all', label: 'All Pieces' },
                        { id: 'bookmarks', label: 'Favorites' },
                        { id: 'fundamentals', label: 'Piano Basics' },
                        { id: 'classical', label: 'Classical & Ragtime' },
                        { id: 'modern', label: 'Pop & Screen' },
                        { id: 'custom', label: 'My Uploads' }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        const count = tabCounts[tab.id as keyof typeof tabCounts] || 0;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 select-none border ${
                                    isActive
                                        ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-md border-slate-200/50 dark:border-slate-700/60'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-850/60 hover:text-slate-700 dark:hover:text-slate-200 border-transparent'
                                }`}
                            >
                                {tab.id === 'bookmarks' ? (
                                    <svg className={`w-3.5 h-3.5 fill-current ${isActive ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ) : null}
                                <span>{tab.label}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                    isActive
                                        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Difficulty Filters */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/30 dark:bg-slate-950/10 rounded-2xl border border-slate-200/30 dark:border-slate-900/40 backdrop-blur">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold px-2.5 uppercase tracking-wider select-none">Difficulty</span>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'beginner', label: 'Beginner', color: 'text-green-600 dark:text-green-400 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-900/30' },
                        { id: 'intermediate', label: 'Intermediate', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 dark:border-amber-900/30' },
                        { id: 'advanced', label: 'Advanced', color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 dark:border-rose-900/30' }
                    ].map(diff => {
                        const isActive = difficultyFilter === diff.id;
                        return (
                            <button
                                key={diff.id}
                                onClick={() => setDifficultyFilter(diff.id as any)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border select-none ${
                                    isActive
                                        ? `${diff.id === 'all' ? 'bg-sky-500 border-sky-600 text-white shadow-sm' : `${diff.color} border shadow-sm`}`
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 border-transparent'
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
                {filteredScores.slice(0, visibleCount).map(score => (
                    <div
                        key={score.id}
                        onClick={() => {
                            if (score.songUrl) {
                                onSelectScore(null, score.songUrl, score.title, score.id);
                            } else if (score.fileData) {
                                onSelectScore(new File([score.fileData], score.fileName), undefined, undefined, score.id);
                            }
                        }}
                        className="group relative bg-white/70 dark:bg-slate-900/50 p-6 rounded-3xl shadow-md shadow-slate-100/10 dark:shadow-none border border-slate-200/60 dark:border-slate-800/80 hover:border-sky-400 dark:hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-4 backdrop-blur"
                    >
                        {/* Card Header (Icon + Actions) */}
                        <div className="flex justify-between items-start">
                            {/* Instrument Disk */}
                            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 text-white p-3 rounded-2xl shadow-md shadow-sky-500/20 w-fit">
                                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            
                            {/* Stashed Buttons */}
                            <div className="flex items-center gap-1.5 z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(score.id);
                                    }}
                                    className={`p-2 rounded-xl transition-all duration-200 border ${
                                        bookmarkedIds.has(score.id)
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm'
                                             : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 hover:text-amber-500 opacity-70 md:opacity-0 md:group-hover:opacity-100'
                                    }`}
                                    title={bookmarkedIds.has(score.id) ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                </button>
                                {!score.id.startsWith('preset-') && (
                                    <button
                                        onClick={(e) => handleDelete(e, score.id)}
                                        className="bg-slate-100 hover:bg-rose-500/10 hover:text-rose-500 dark:bg-slate-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-900/50 text-slate-400 transition-all duration-200 p-2 rounded-xl opacity-70 md:opacity-0 md:group-hover:opacity-100"
                                        title="Delete Score"
                                    >
                                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Title and Composer */}
                        <div className="text-left">
                            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition duration-150">{score.title}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{score.composer}</p>
                        </div>

                        {/* Meta Tags */}
                        <div className="flex gap-1.5 flex-wrap">
                            {/* Show a default Beginner tag for custom uploads that don't have any difficulty tag */}
                            {!score.tags?.some(t => ['beginner', 'intermediate', 'advanced'].includes(t.toLowerCase())) && (
                                <span 
                                    onClick={!score.id.startsWith('preset-') ? (e) => {
                                        e.stopPropagation();
                                        updateScoreMetadata(score.id, { tags: ['Beginner', ...(score.tags || [])] });
                                    } : undefined}
                                    className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg tracking-wider border select-none ${getTagStyle('Beginner')} ${!score.id.startsWith('preset-') ? 'cursor-pointer hover:bg-emerald-500/20 active:scale-95 transition-all' : ''}`}
                                    title={!score.id.startsWith('preset-') ? "Click to set difficulty" : undefined}
                                >
                                    Beginner
                                </span>
                            )}
                            {score.tags?.map(tag => {
                                const isDifficulty = ['beginner', 'intermediate', 'advanced'].includes(tag.toLowerCase());
                                const isCustom = !score.id.startsWith('preset-');
                                return (
                                    <span 
                                        key={tag} 
                                        onClick={isDifficulty && isCustom ? (e) => {
                                            e.stopPropagation();
                                            const diffs = ['Beginner', 'Intermediate', 'Advanced'];
                                            const currentIdx = diffs.findIndex(d => d.toLowerCase() === tag.toLowerCase());
                                            const nextDiff = diffs[(currentIdx + 1) % diffs.length];
                                            const otherTags = score.tags.filter(t => !diffs.some(d => d.toLowerCase() === t.toLowerCase()));
                                            updateScoreMetadata(score.id, { tags: [nextDiff, ...otherTags] });
                                        } : undefined}
                                        className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg tracking-wider border select-none ${getTagStyle(tag)} ${isDifficulty && isCustom ? 'cursor-pointer hover:scale-102 active:scale-95 transition-all' : ''}`}
                                        title={isDifficulty && isCustom ? "Click to change difficulty" : undefined}
                                    >
                                        {tag}
                                    </span>
                                );
                            })}
                            {score.highScore !== undefined && score.rank !== undefined && (
                                <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-lg tracking-wider border select-none ${
                                    score.rank === 'Gold' 
                                        ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-500/20 shadow-sm' 
                                        : score.rank === 'Silver'
                                            ? 'bg-slate-100/50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/30 dark:border-slate-700/30'
                                            : 'bg-orange-500/10 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border-orange-500/20 shadow-sm'
                                }`}>
                                    🏆 {score.rank} {score.notesHit !== undefined ? `(${score.notesHit}/${score.maxNotes})` : `(${score.highScore}%)`}
                                </span>
                            )}
                            {/* Auto File-type Tag */}
                            <span className="text-[9px] uppercase font-black bg-slate-100/50 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500 px-2.5 py-1 rounded-lg tracking-wider border border-slate-200/30 dark:border-slate-800/40 select-none">
                                {score.fileName.split('.').pop()}
                            </span>
                        </div>

                        {/* Card Footer (Added Date) */}
                        <div className="mt-auto pt-3 border-t border-slate-200/30 dark:border-slate-800/40 text-[10px] text-slate-400 dark:text-slate-500 font-bold text-left flex items-center gap-1 select-none">
                            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                            <span>Added: {new Date(score.dateAdded).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredScores.length === 0 && (
                    <div className="col-span-full py-16 px-4 text-center text-slate-400 dark:text-slate-500 bg-slate-50/20 dark:bg-slate-900/10 rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800 font-bold flex flex-col items-center justify-center gap-3">
                        <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 12h8M12 8v8"/>
                        </svg>
                        <span className="text-sm font-semibold select-none">
                            {searchTerm ? 'No scores found matching your search.' : 'Your library is empty. Upload a MusicXML file to get started!'}
                        </span>
                    </div>
                )}

                {/* Load More Button */}
                {filteredScores.length > visibleCount && (
                    <div className="col-span-full flex justify-center mt-6">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 12)}
                            className="px-6 py-3 bg-white/70 dark:bg-slate-900/50 text-sky-500 dark:text-sky-400 font-bold border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md transition hover:-translate-y-0.5 active:scale-98 hover:bg-sky-50 dark:hover:bg-slate-850/60 backdrop-blur"
                        >
                            Load More Pieces ({filteredScores.length - visibleCount} remaining)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
