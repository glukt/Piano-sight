import { useState, useEffect } from 'react';
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
import { LevelUpModal } from './components/game/LevelUpModal';
import { DailyWorkout } from './components/DailyWorkout';

function App() {
    const { width: windowWidth } = useWindowSize();
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Sync dark mode class to HTML document root for Tailwind dark support
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const [currentView, setCurrentView] = useState<'game' | 'musicxml' | 'reference' | 'settings' | 'courseSelection' | 'intro' | 'dailyWorkout'>('courseSelection');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [xmlData, setXmlData] = useState<string | null>(null);
    const [songUrl, setSongUrl] = useState<string | null>(null);
    const [workoutReview, setWorkoutReview] = useState<{ songUrl: string; measure: number } | null>(null);

    // Initialize Game Logic Hook
    // This hook manages the game state, audio, and gamification
    const gameLogic = useGameLogic();

    // We removed the global auto-start audio hook here. Audio is now explicitly started 
    // when a user clicks 'Start Lesson' or explicitly loads a custom song.


    // Handlers for MusicXML View
    const handleScoreSelect = (file: File | null, url?: string, title?: string) => {
        if (url) {
            setSongUrl(url);
            setFileName(title || 'Loaded Score');
            setUploadedFile(null);
            setXmlData(null);
        } else if (file) {
            setFileName(file.name);
            setUploadedFile(file);
            setXmlData(null);
            setSongUrl(null);
        }
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
                                        onClick={() => {
                                            setWorkoutReview(null);
                                            handleClearScore();
                                        }}
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
                                    initialMeasure={workoutReview ? workoutReview.measure : undefined}
                                    onCloseScore={() => {
                                        // Remove this measure from weak measures upon completion!
                                        if (workoutReview) {
                                            try {
                                                const raw = localStorage.getItem('pianopilot_weak_measures');
                                                if (raw) {
                                                    const data = JSON.parse(raw);
                                                    if (data[workoutReview.songUrl]) {
                                                        delete data[workoutReview.songUrl][workoutReview.measure];
                                                        if (Object.keys(data[workoutReview.songUrl]).length === 0) {
                                                            delete data[workoutReview.songUrl];
                                                        }
                                                        localStorage.setItem('pianopilot_weak_measures', JSON.stringify(data));
                                                    }
                                                }
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }
                                        setWorkoutReview(null);
                                        handleClearScore();
                                        setCurrentView('dailyWorkout');
                                    }}
                                />
                            </>
                        ) : (
                            <div className="w-full">
                                <MusicLibrary onSelectScore={handleScoreSelect} />
                            </div>
                        )}
                    </div>
                )}

                {/* DAILY WORKOUT VIEW */}
                {currentView === 'dailyWorkout' && (
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DailyWorkout
                            userXp={gameLogic.gameState.xp}
                            userActiveNotes={gameLogic.effectiveActiveNotes}
                            isDarkMode={isDarkMode}
                            onAddXp={gameLogic.awardXp}
                            onStartReview={(song, measure) => {
                                setWorkoutReview({ songUrl: song, measure });
                                setSongUrl(song);
                                setFileName(song.split('/').pop()?.replace('.musicxml', '').replace('.mxl', '').replace(/[-_]/g, ' ') || 'Loaded Score');
                                setCurrentView('musicxml');
                            }}
                            onSelectLesson={(lesson) => {
                                setSelectedLesson(lesson);
                                setCurrentView('intro');
                            }}
                        />
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
                            micVolume={gameLogic.micVolume}
                            micSensitivity={gameLogic.micSensitivity}
                            onMicSensitivityChange={gameLogic.setMicSensitivity}
                            midiInputs={gameLogic.midiInputs}
                            onResetProgress={() => {
                                localStorage.removeItem('piano_gamification');
                                localStorage.removeItem('pianopilot_stats');
                                localStorage.removeItem('pianopilot_achievements');
                                localStorage.removeItem('pianopilot_daily_challenges');
                                localStorage.removeItem('pianopilot_last_login');
                                window.location.reload();
                            }}
                        />
                    </div>
                )}
            </main>

            {/* Level Up Modal (using hook state) */}
            <LevelUpModal
                level={gameLogic.levelUp}
                onClose={gameLogic.clearLevelUp}
            />

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
