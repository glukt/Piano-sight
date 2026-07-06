import { useState, useMemo } from 'react';
import { useWindowSize } from './hooks/useWindowSize';
import { useGameLogic } from './hooks/useGameLogic';
import { useMusicLibrary } from './hooks/useMusicLibrary';
import { usePreferences } from './hooks/usePreferences';

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
import { SightReadingTrainer } from './components/game/SightReadingTrainer';
import { StatisticsPanel } from './components/StatisticsPanel';

function App() {
    const { width: windowWidth } = useWindowSize();
    const { preferences, updatePreference } = usePreferences();
    const isDarkMode = preferences.isDarkMode;
    const setIsDarkMode = (val: boolean) => updatePreference('isDarkMode', val);

    const [currentView, setCurrentView] = useState<'game' | 'musicxml' | 'reference' | 'settings' | 'courseSelection' | 'intro' | 'dailyWorkout' | 'trainer' | 'stats'>('courseSelection');
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [xmlData, setXmlData] = useState<string | null>(null);
    const [songUrl, setSongUrl] = useState<string | null>(null);
    const [workoutReview, setWorkoutReview] = useState<{ songUrl: string; measure: number } | null>(null);
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
    const [lessonSourceView, setLessonSourceView] = useState<'courseSelection' | 'dailyWorkout'>('courseSelection');

    // Initialize Music Library Hook
    const library = useMusicLibrary();

    const completedLessonIds = useMemo(() => {
        return new Set(Object.keys(library.lessonProgress));
    }, [library.lessonProgress]);

    // Initialize Game Logic Hook
    // This hook manages the game state, audio, and gamification
    const gameLogic = useGameLogic(library.saveHighScore, library.logAttempt);

    // We removed the global auto-start audio hook here. Audio is now explicitly started 
    // when a user clicks 'Start Lesson' or explicitly loads a custom song.


    // Handlers for MusicXML View
    const handleScoreSelect = (file: File | null, url?: string, title?: string, id?: string) => {
        if (id) {
            setSelectedSongId(id);
        } else {
            setSelectedSongId(null);
        }

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
        setSelectedSongId(null);
        gameLogic.exitLesson();
    };

    const handleNextLesson = () => {
        const nextLesson = gameLogic.goToNextLesson();
        if (nextLesson) {
            setSelectedLesson(nextLesson);
            setLessonSourceView('courseSelection');
            setCurrentView('intro');
        } else {
            setCurrentView('courseSelection');
        }
    };

    return (
        <div className={`min-h-screen flex flex-col items-center p-4 md:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

            {/* Top Navigation */}
            {!(currentView === 'game' || (currentView === 'musicxml' && (uploadedFile || xmlData || songUrl))) && (
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
            )}

            {/* Main Content Area */}
            <main className="w-full max-w-6xl flex flex-col items-center">

                {/* COURSE SELECTION VIEW */}
                {currentView === 'courseSelection' && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CourseSelection
                            userXp={gameLogic.gameState.xp}
                            completedLessonIds={completedLessonIds}
                            onSelectLesson={(lesson) => {
                                setSelectedLesson(lesson);
                                setLessonSourceView('courseSelection');
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
                            setCurrentView(lessonSourceView);
                        }}
                        isDemoPlaying={gameLogic.isDemoPlaying}
                        onToggleDemo={async () => {
                            if (gameLogic.isDemoPlaying) {
                                gameLogic.stopDemo();
                            } else {
                                // Resume or initialize audio context upon user gesture click
                                await gameLogic.testAudio();
                                gameLogic.loadLesson(selectedLesson);
                                gameLogic.startDemo();
                            }
                        }}
                        onStopDemo={() => {
                            gameLogic.stopDemo();
                        }}
                        onStart={() => {
                            gameLogic.loadLesson(selectedLesson);
                            if (selectedLesson.type === 'song' && selectedLesson.songUrl) {
                                setSongUrl(selectedLesson.songUrl);
                                setFileName(selectedLesson.name);
                                setSelectedSongId(selectedLesson.id);
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
                        onNextLesson={handleNextLesson}
                        onExitLesson={() => {
                            gameLogic.exitLesson();
                            setCurrentView(lessonSourceView);
                        }}
                    />
                )}

                {/* MUSICXML VIEW */}
                {currentView === 'musicxml' && (
                    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {uploadedFile || xmlData || songUrl ? (
                            <>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                    <span className="font-bold text-gray-700 dark:text-gray-200 truncate max-w-full sm:max-w-md">Current Score: {fileName || 'Loaded Score'}</span>
                                    <button
                                        onClick={() => {
                                            const targetView = workoutReview ? 'dailyWorkout' : 'musicxml';
                                            setWorkoutReview(null);
                                            handleClearScore();
                                            if (targetView !== 'musicxml') {
                                                setCurrentView(targetView);
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold text-sm transition w-full sm:w-auto text-center"
                                    >
                                        {workoutReview ? '← Back to Workout' : '← Back to Library'}
                                    </button>
                                </div>
                                <ScoreDisplay
                                    file={uploadedFile || undefined}
                                    xmlContent={xmlData || undefined}
                                    xmlUrl={songUrl || undefined}
                                    songId={selectedSongId}
                                    isDarkMode={isDarkMode}
                                    onAddXp={() => gameLogic.awardXp(10)} // Flat XP for custom practice
                                    userActiveNotes={gameLogic.effectiveActiveNotes}
                                    initialMeasure={workoutReview ? workoutReview.measure : undefined}
                                    isMutedKeys={gameLogic.isMutedKeys}
                                    onToggleMutedKeys={gameLogic.setIsMutedKeys}
                                    onNextLesson={gameLogic.currentLesson ? handleNextLesson : undefined}
                                    isLessonMode={!!gameLogic.currentLesson}
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
                                        const targetView = workoutReview ? 'dailyWorkout' : 'musicxml';
                                        setWorkoutReview(null);
                                        handleClearScore();
                                        setCurrentView(targetView);
                                    }}
                                />
                            </>
                        ) : (
                            <div className="w-full">
                                <MusicLibrary onSelectScore={handleScoreSelect} library={library} />
                            </div>
                        )}
                    </div>
                )}

                {/* DAILY WORKOUT VIEW */}
                {currentView === 'dailyWorkout' && (
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DailyWorkout
                            userXp={gameLogic.gameState.xp}
                            completedLessonIds={completedLessonIds}
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
                                setLessonSourceView('dailyWorkout');
                                setCurrentView('intro');
                            }}
                        />
                    </div>
                )}

                {/* DIAGNOSTICS VIEW */}
                {currentView === 'stats' && (
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <StatisticsPanel
                            hitStats={gameLogic.hitStats}
                            errorStats={gameLogic.errorStats}
                            isDarkMode={isDarkMode}
                            getAllPerformanceAttempts={library.getAllPerformanceAttempts}
                            onReset={() => {
                                localStorage.removeItem('pianopilot_stats');
                                window.location.reload();
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
                            audioStarted={gameLogic.audioStarted}
                            isAudioLoading={gameLogic.isAudioLoading}
                            onStartAudio={gameLogic.startAudio}
                            micVolume={gameLogic.micVolume}
                            micSensitivity={gameLogic.micSensitivity}
                            onMicSensitivityChange={gameLogic.setMicSensitivity}
                            midiInputs={gameLogic.midiInputs}
                            isMicCalibrating={gameLogic.isMicCalibrating}
                            micCalibrationProgress={gameLogic.micCalibrationProgress}
                            onCalibrateMic={gameLogic.calibrateMicrophone}
                            availableMics={gameLogic.availableMics}
                            selectedMicId={gameLogic.selectedMicId}
                            activeMicLabel={gameLogic.activeMicLabel}
                            onChangeMicrophone={gameLogic.changeMicrophone}
                            calibrationStep={gameLogic.calibrationStep}
                            calibrationTargetNote={gameLogic.calibrationTargetNote}
                            micNoteName={gameLogic.micNoteName}
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

                {/* SIGHT READING TRAINER VIEW */}
                {currentView === 'trainer' && (
                    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SightReadingTrainer
                            gameLogic={gameLogic}
                            onBackHome={() => setCurrentView('courseSelection')}
                        />
                    </div>
                )}
            </main>

            {/* Level Up Modal (deferred to selection screens only) */}
            {(currentView === 'courseSelection' || currentView === 'dailyWorkout' || currentView === 'trainer') && (
                <LevelUpModal
                    level={gameLogic.levelUp}
                    onClose={gameLogic.clearLevelUp}
                />
            )}

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
                levelUp={gameLogic.levelUp}
                onClear={() => {
                    gameLogic.clearNewUnlocks();
                    gameLogic.clearNewDaily();
                }}
            />

        </div>
    );
}

export default App;
