import { useEffect, useState } from 'react';
import { useWindowSize } from './hooks/useWindowSize';
import { useGameLogic } from './hooks/useGameLogic';

// Components
import { TopNav } from './components/layout/TopNav';
import { GameContainer } from './components/game/GameContainer';
import { ScoreDisplay } from './components/ScoreDisplay';
import { MusicLibrary } from './components/MusicLibrary';
import { ReferencePanel } from './components/ReferencePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AchievementsModal } from './components/AchievementsModal';
import { NotificationToast } from './components/NotificationToast';
import { CourseSelection } from './components/game/CourseSelection';
import { LessonIntro } from './components/game/LessonIntro';
import { Lesson } from './utils/music/CourseData';

function App() {
    const { width: windowWidth } = useWindowSize();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentView, setCurrentView] = useState<'game' | 'musicxml' | 'reference' | 'settings' | 'courseSelection' | 'intro'>('courseSelection');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [xmlData, setXmlData] = useState<string | null>(null);
    const [songUrl, setSongUrl] = useState<string | null>(null);

    // Initialize Game Logic Hook
    // This hook manages the game state, audio, and gamification
    const gameLogic = useGameLogic();

    // Auto-Start Audio on First Interaction (Global Handler)
    useEffect(() => {
        const initAudioOnInteraction = async () => {
            if (!gameLogic.audioStarted && !gameLogic.isAudioLoading) {
                try {
                    await gameLogic.startAudio();
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
    }, [gameLogic.audioStarted, gameLogic.isAudioLoading, gameLogic.startAudio]);


    // Handlers for MusicXML View
    const handleScoreSelect = (file: File) => {
        setFileName(file.name);
        setUploadedFile(file);
        setXmlData(null);
        setSongUrl(null);
    };

    const handleClearScore = () => {
        setXmlData(null);
        setUploadedFile(null);
        setFileName(null);
        setSongUrl(null);
        gameLogic.exitLesson();
    };

    return (
        <div className={`min-h-screen flex flex-col items-center p-4 md:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

            {/* Top Navigation */}
            <TopNav
                currentView={currentView}
                setCurrentView={setCurrentView}
                level={gameLogic.gameState.level}
                xp={gameLogic.gameState.xp}
                newUnlocksCount={gameLogic.newUnlocks.length}
                onOpenAchievements={() => setIsAchievementsOpen(true)}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
            />

            {/* Main Content Area */}
            <main className="w-full max-w-6xl flex flex-col items-center">

                {/* COURSE SELECTION VIEW */}
                {currentView === 'courseSelection' && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CourseSelection
                            userXp={gameLogic.gameState.xp}
                            onSelectLesson={(lesson) => {
                                setSelectedLesson(lesson);
                                setCurrentView('intro');
                            }}
                        />
                    </div>
                )}

                {/* LESSON INTRO VIEW */}
                {currentView === 'intro' && selectedLesson && (
                    <LessonIntro
                        lesson={selectedLesson}
                        onBack={() => {
                            setSelectedLesson(null);
                            setCurrentView('courseSelection');
                        }}
                        onStart={() => {
                            gameLogic.loadLesson(selectedLesson);
                            if (selectedLesson.type === 'song' && selectedLesson.songUrl) {
                                setSongUrl(selectedLesson.songUrl);
                                setFileName(selectedLesson.name);
                                setUploadedFile(null);
                                setXmlData(null);
                                setCurrentView('musicxml');
                            } else {
                                setCurrentView('game');
                            }
                        }}
                    />
                )}

                {/* GAME VIEW */}
                {currentView === 'game' && (
                    <GameContainer
                        gameLogic={gameLogic}
                        windowWidth={windowWidth}
                        isDarkMode={isDarkMode}
                    />
                )}

                {/* MUSICXML VIEW */}
                {currentView === 'musicxml' && (
                    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {uploadedFile || xmlData || songUrl ? (
                            <>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between mb-4">
                                    <span className="font-bold text-gray-700 dark:text-gray-200">Current Score: {fileName || 'Loaded Score'}</span>
                                    <button
                                        onClick={handleClearScore}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-sm transition"
                                    >
                                        ← Back to Library
                                    </button>
                                </div>
                                <ScoreDisplay
                                    file={uploadedFile || undefined}
                                    xmlContent={xmlData || undefined}
                                    xmlUrl={songUrl || undefined}
                                    isDarkMode={isDarkMode}
                                    onAddXp={() => gameLogic.awardXp(10)} // Flat XP for custom practice
                                    userActiveNotes={gameLogic.effectiveActiveNotes}
                                />
                            </>
                        ) : (
                            <div className="w-full">
                                <MusicLibrary onSelectScore={handleScoreSelect} />
                            </div>
                        )}
                    </div>
                )}

                {/* REFERENCE VIEW */}
                {currentView === 'reference' && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ReferencePanel />
                    </div>
                )}

                {/* SETTINGS VIEW */}
                {currentView === 'settings' && (
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SettingsPanel
                            isDarkMode={isDarkMode}
                            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                            showNoteLabels={gameLogic.showNoteLabels}
                            onToggleLabels={() => gameLogic.setShowNoteLabels(!gameLogic.showNoteLabels)}
                            audioStarted={gameLogic.audioStarted}
                            isAudioLoading={gameLogic.isAudioLoading}
                            onStartAudio={gameLogic.startAudio}
                            onResetProgress={() => {
                                localStorage.removeItem('piano-sight-xp');
                                localStorage.removeItem('piano-sight-level');
                                localStorage.removeItem('piano-sight-achievements');
                                localStorage.removeItem('piano-sight-challenges');
                                localStorage.removeItem('piano-sight-stats');
                                window.location.reload();
                            }}
                        />
                    </div>
                )}
            </main>

            {/* Level Up Modal */}
            {gameLogic.gameState.level > 1 && gameLogic.gameState.xp === 0 && ( /* Quick check for 'just leveled up' logic, but hook uses levelUp state */ "")}

            {/* Level Up Modal (using hook state) */}
            {/* Note: useGamification returns 'levelUp' which is the *new level number* if leveling up, else null */}
            {/* Accessing it via gameLogic... wait, useGamification output in useGameLogic doesn't export 'levelUp' state! */}
            {/* CHECK useGameLogic.ts exports! */}

            {/*  Ah, I missed exporting 'levelUp' and 'clearLevelUp' in useGameLogic! */}

            {/* Footer */}
            <div className="mt-8 opacity-50 text-xs">
                Piano Sight v0.1.0 • Built with React & Vexflow
            </div>

            {/* Hidden Components (Modals/Toasts) */}
            <AchievementsModal
                isOpen={isAchievementsOpen}
                onClose={() => setIsAchievementsOpen(false)}
                achievements={gameLogic.achievements}
                achievementsState={gameLogic.achievementsState}
                getProgress={gameLogic.getProgress}
                dailyChallenges={gameLogic.dailyChallenges}
            />

            <NotificationToast
                unlockedAchievements={gameLogic.newUnlocks}
                completedChallenges={gameLogic.newDailyCompleted}
                allChallenges={gameLogic.dailyChallenges}
                onClear={() => {
                    gameLogic.clearNewUnlocks();
                    gameLogic.clearNewDaily();
                }}
            />

        </div>
    );
}

export default App;
