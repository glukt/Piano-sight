import React from 'react';


interface TopNavProps {
    currentView: 'game' | 'musicxml' | 'reference' | 'settings' | 'courseSelection' | 'intro';
    setCurrentView: (view: 'game' | 'musicxml' | 'reference' | 'settings' | 'courseSelection' | 'intro') => void;
    level: number;
    xp: number;
    newUnlocksCount: number;
    onOpenAchievements: () => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
    currentView,
    setCurrentView,
    level,
    xp,
    newUnlocksCount,
    onOpenAchievements,
    isDarkMode,
    setIsDarkMode
}) => {
    return (
        <nav className={`w-full max-w-6xl mb-8 flex justify-between items-center p-2 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    🎹
                </div>
                <div className="hidden md:block">
                    <h1 className="text-xl font-bold tracking-tight">Piano Sight</h1>
                    <div className="text-[10px] uppercase tracking-widest opacity-60 font-semibold">Virtuoso Training</div>
                </div>
            </div>

            {/* Center Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                {(['courseSelection', 'game', 'musicxml', 'reference', 'settings'] as const).map(view => (
                    <button
                        key={view}
                        onClick={() => setCurrentView(view)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${currentView === view
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {view === 'musicxml' ? 'Library' : view === 'courseSelection' ? 'Courses' : view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-2 cursor-pointer group" title="Current Level">
                    <div className="text-xs font-bold text-blue-500 group-hover:text-blue-400 transition">LVL {level}</div>
                    <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(xp % 100)}%` }}></div>
                    </div>
                </div>

                <button
                    onClick={onOpenAchievements}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-xl transition relative"
                    title="Achievements"
                >
                    🏆
                    {newUnlocksCount > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                </button>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-xl transition"
                    title="Toggle Theme"
                >
                    {isDarkMode ? '🌙' : '☀️'}
                </button>
            </div>
        </nav>
    );
};
