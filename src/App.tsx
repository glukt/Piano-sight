import { useEffect, useState } from 'react';
import { useWindowSize } from './hooks/useWindowSize';
import { useGameLogic } from './hooks/useGameLogic';

// Components
import { TopNav } from './components/layout/TopNav';
import { GameContainer } from './components/game/GameContainer';
import { MusicLibrary } from './components/MusicLibrary';
import { ReferencePanel } from './components/ReferencePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { CourseSelection } from './components/game/CourseSelection';
import { AchievementsModal } from './components/AchievementsModal';
import { NotificationToast } from './components/NotificationToast';

function App() {
    const { width: windowWidth } = useWindowSize();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentView, setCurrentView] = useState<'game' | 'musicxml' | 'reference' | 'settings'>('game');
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Initialise Game Logic Hook
    const gameLogic = useGameLogic();
    const {
        playMode, currentLesson, lessonComplete, starsEarned, courseProgress,
        loadLesson, exitCourse, enterCourseSelection,
        gameState, newUnlocks,
        dailyChallenges, newDailyCompleted,
        audioStarted, isAudioLoading, startAudio,
        showNoteLabels, setShowNoteLabels,
        achievements, achievementsState, getProgress,
        clearNewUnlocks, clearNewDaily
    } = gameLogic;

    // Auto-Start Audio on First Interaction (Global Handler)
    useEffect(() => {
        const initAudioOnInteraction = async () => {
            if (!audioStarted && !isAudioLoading) {
                try {
                    await startAudio();
                } catch (e) {
                    // Ignore
                }
            }
        };

        const handleInteraction = () => {
            initAudioOnInteraction();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [audioStarted, isAudioLoading, startAudio]);


    // Handlers for MusicXML View
    const handleScoreSelect = (file: File) => {
        console.log("Score selected:", file.name);
        // TODO: Implement custom score loading in GameLogic
        setCurrentView('game');
    };

    // View State for Course Selection
    const showCourseSelection = playMode === 'COURSE' && !currentLesson;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} font-sans selection:bg-indigo-500 selection:text-white`}>

            <TopNav
                xp={gameState.xp}
                level={gameState.level}
                currentView={currentView}
                setCurrentView={setCurrentView}
                newUnlocksCount={newUnlocks.length}
                onOpenAchievements={() => setIsAchievementsOpen(true)}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                onOpenSettings={() => setShowSettings(true)}
            />

            <div className="container mx-auto px-4 py-8">

                {/* Main Content Switch */}
                {showCourseSelection ? (
                    <CourseSelection
                        onSelectLesson={loadLesson}
                        onBack={() => exitCourse()}
                        courseProgress={courseProgress}
                    />
                ) : (
                    <>
                        {/* Course Mode Header */}
                        {playMode === 'COURSE' && (
                            <div className="mb-4 flex items-center gap-4">
                                <button onClick={enterCourseSelection} className="text-gray-400 hover:text-white flex items-center gap-2">
                                    ← Back to Courses
                                </button>
                                <h2 className="text-xl font-bold">{currentLesson?.title}</h2>
                            </div>
                        )}

                        {!audioStarted ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="text-center space-y-4">
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-lg">
                                        PIANO SIGHT
                                    </h1>
                                    <p className="text-xl text-gray-400 max-w-lg mx-auto">
                                        Master sight-reading with real-time feedback. <br />
                                        Connect your MIDI keyboard or use your microphone.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={startAudio}
                                        disabled={isAudioLoading}
                                        className="group relative px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-indigo-500 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative flex items-center gap-3 text-lg">
                                            {isAudioLoading ? (
                                                <span className="animate-spin text-2xl">⟳</span>
                                            ) : (
                                                <span className="text-2xl">▶</span>
                                            )}
                                            {isAudioLoading ? 'Initializing...' : 'Start Practice'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <GameContainer
                                gameLogic={gameLogic}
                                windowWidth={windowWidth}
                                isDarkMode={isDarkMode}
                            />
                        )}

                        {/* Mode Switcher (Visible only when Audio Started) */}
                        {audioStarted && playMode === 'PRACTICE' && (
                            <div className="fixed bottom-6 right-6 z-50">
                                <button
                                    onClick={enterCourseSelection}
                                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition flex items-center gap-2"
                                >
                                    <span>🎓</span> Course Mode
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Lesson Complete Overlay */}
                {lessonComplete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-gray-900 border-2 border-gold-500/50 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />

                            <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">LESSON COMPLETE!</h2>
                            <div className="flex justify-center gap-2 mb-6 text-6xl my-8">
                                {[...Array(3)].map((_, i) => (
                                    <span key={i} className={`${i < starsEarned ? 'text-yellow-400' : 'text-gray-700'} animate-in zoom-in duration-500`} style={{ animationDelay: `${i * 200}ms` }}>★</span>
                                ))}
                            </div>

                            <p className="text-gray-300 mb-8 text-lg">Great job! You've mastered {currentLesson?.title}.</p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        enterCourseSelection();
                                    }}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg hover:shadow-indigo-500/50"
                                >
                                    Next Lesson
                                </button>
                                <button
                                    onClick={() => loadLesson(currentLesson!)}
                                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Music Library Panel */}
            <MusicLibrary
                isOpen={currentView === 'musicxml'}
                onClose={() => setCurrentView('game')}
                onSelectScore={handleScoreSelect}
            />

            {/* Reference Panel */}
            <ReferencePanel
                isOpen={currentView === 'reference'}
                onClose={() => setCurrentView('game')}
            />

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                showNoteLabels={showNoteLabels}
                onToggleLabels={() => setShowNoteLabels(!showNoteLabels)}
                audioStarted={audioStarted}
                isAudioLoading={isAudioLoading}
                onStartAudio={startAudio}
                onResetProgress={() => {
                    localStorage.removeItem('piano-sight-xp');
                    localStorage.removeItem('piano-sight-level');
                    localStorage.removeItem('piano-sight-achievements');
                    localStorage.removeItem('piano-sight-challenges');
                    localStorage.removeItem('piano-sight-stats');
                    localStorage.removeItem('pianoPilot_courseProgress');
                    window.location.reload();
                }}
            />

            {/* Hidden Components (Modals/Toasts) */}
            <AchievementsModal
                isOpen={isAchievementsOpen}
                onClose={() => setIsAchievementsOpen(false)}
                achievements={achievements}
                achievementsState={achievementsState}
                getProgress={getProgress}
                dailyChallenges={dailyChallenges}
            />

            <NotificationToast
                unlockedAchievements={newUnlocks}
                completedChallenges={newDailyCompleted}
                allChallenges={dailyChallenges}
                onClear={() => {
                    clearNewUnlocks();
                    clearNewDaily();
                }}
            />

            {/* Footer */}
            <div className="mt-8 text-center opacity-50 text-xs text-gray-500">
                Piano Sight v0.1.0 • Built with React & Vexflow
            </div>
        </div>
    );
}

export default App;
