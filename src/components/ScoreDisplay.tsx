
import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import { audio } from '../audio/Synth';
import VirtualKeyboard from './VirtualKeyboard';
// import { useMidi } from '../hooks/useMidi'; // Removed, passed as prop
import { usePracticeMode } from '../hooks/usePracticeMode';
import { useMusicLibrary } from '../hooks/useMusicLibrary';
import { usePreferences } from '../hooks/usePreferences';
import { midiToNoteName } from '../utils/midiUtils';
import LoopingControls from './LoopingControls';
import { VexFlowGraphicalNote } from 'opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowGraphicalNote';
import { ScoreControls } from './ScoreControls';
import { PracticeOverlay } from './PracticeOverlay';
import { PerformanceReportCard } from './PerformanceReportCard';

interface ScoreDisplayProps {
    xmlUrl?: string; // Optional: Load from URL
    xmlContent?: string; // Optional: Load from string content
    file?: File; // Optional: Load from File object (for MXL)
    isDarkMode?: boolean;
    onAddXp?: (amount: number) => void;
    userActiveNotes?: Set<number>; // NEW: Pass microphone/midi input from parent
    initialMeasure?: number; // NEW: starting measure for workout review (0-indexed)
    onCloseScore?: () => void; // NEW: handler to return to Library/Workout
    isMutedKeys?: boolean; // NEW: mute state for keys
    onToggleMutedKeys?: (val: boolean) => void; // NEW: callback to toggle mute keys
    onNextLesson?: () => void; // NEW: callback to transition to next lesson
    songId?: string | null;
    isLessonMode?: boolean; // NEW: true if launched as a course lesson
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
    xmlUrl,
    xmlContent,
    file,
    isDarkMode = false,
    onAddXp,
    userActiveNotes = new Set(),
    initialMeasure,
    onCloseScore,
    isMutedKeys = false,
    onToggleMutedKeys,
    onNextLesson,
    songId = null,
    isLessonMode = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const osmdCanvasRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OSMD | null>(null);
    const playbackRef = useRef<PlaybackEngine | null>(null);
    const lastCountdownRef = useRef<number | null>(null);
    const canvasAnimFrameRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const { preferences, updatePreference } = usePreferences();
    const [error, setError] = useState<string | null>(null);
    const layoutMode = preferences.layoutMode;
    const setLayoutMode = (val: 'standard' | 'scrolling') => updatePreference('layoutMode', val);

    const [isMutedPlayback, setIsMutedPlayback] = useState(false);

    useEffect(() => {
        if (playbackRef.current) {
            playbackRef.current.setMuted(isMutedPlayback);
        }
    }, [isMutedPlayback, loading]);

    const { saveHighScore } = useMusicLibrary();

    // Practice Mode
    const {
        isActive: isPracticeActive,
        currentSection: practiceSection,
        mode: practiceMode,
        feedback: practiceFeedback,
        startPractice,
        stopPractice,
        setMode: setPracticeMode,
        nextSection,
        prevSection,
        expectedNotes,
        showHint,
        isSongComplete,
        setIsSongComplete,
        errorMeasures,
        notesCorrect,
        notesMissed,
        playModeStarted,
        countdown,
        startPlayMode,
        passed,
        requiredAccuracy,
        isCapstone
    } = usePracticeMode({
        playbackEngine: playbackRef.current,
        totalMeasures: playbackRef.current?.MeasureCount || 0,
        userActiveNotes,
        onNoteCorrect: onAddXp ? () => onAddXp(2) : undefined, // 2 XP per note
        onSectionComplete: onAddXp ? () => onAddXp(50) : undefined, // 50 XP per section (~1/2 level early on)
        songId,
        saveHighScore
    });

    // ... (rest of code)



    // Looping & Progress State
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [loopStart, setLoopStart] = useState<number | null>(null);
    const [loopEnd, setLoopEnd] = useState<number | null>(null);
    const [measureTimestamps, setMeasureTimestamps] = useState<number[]>([]);

    // Visual Preferences
    const showKeyboard = preferences.showKeyboard;
    const setShowKeyboard = (val: boolean) => updatePreference('showKeyboard', val);
    const [highlightNotes, setHighlightNotes] = useState(true);
    const showNoteNames = preferences.showNoteNames;
    const setShowNoteNames = (val: boolean) => updatePreference('showNoteNames', val);
    const showPianoLabels = preferences.showPianoLabels;
    const setShowPianoLabels = (val: boolean) => updatePreference('showPianoLabels', val);

    // Determine if we should show keyboard
    // Show if: User manually toggled ON OR (Practice Mode AND Hint is Active)
    const effectiveShowKeyboard = showKeyboard || (isPracticeActive && showHint);

    useEffect(() => {
        if (!containerRef.current || !osmdCanvasRef.current) return;

        // Clear previous container contents to re-initialize layout cleanly
        osmdCanvasRef.current.innerHTML = '';

        // Initialize OSMD
        // @ts-ignore - OSMD constructor types might be loose
        osmdRef.current = new OSMD(osmdCanvasRef.current, {
            autoResize: true,
            backend: "svg",
            drawingParameters: "compacttight", // Try to fit well
            renderSingleHorizontalStaffline: layoutMode === 'scrolling',
        });

        const loadScore = async () => {
            if (!osmdRef.current) return;
            setLoading(true);
            setError(null);

            try {
                if (file) {
                    await osmdRef.current.load(file);
                } else if (xmlContent) {
                    await osmdRef.current.load(xmlContent);
                } else if (xmlUrl) {
                    let resolvedUrl = xmlUrl;
                    if (xmlUrl.startsWith('/')) {
                        const baseUrl = import.meta.env.BASE_URL; // e.g. "/Piano-sight/" or "/"
                        if (baseUrl !== '/' && !xmlUrl.startsWith(baseUrl)) {
                            resolvedUrl = `${baseUrl}${xmlUrl.substring(1)}`;
                        }
                    }
                    await osmdRef.current.load(resolvedUrl);
                } else {
                    setLoading(false);
                    return;
                }

                osmdRef.current.render();

                // Show cursor immediately on load
                osmdRef.current.cursor.show();
                osmdRef.current.cursor.reset();

                // Init Playback Engine
                playbackRef.current = new PlaybackEngine(osmdRef.current);
                const count = playbackRef.current.MeasureCount;
                const timestamps: number[] = [];
                for (let i = 0; i < count; i++) {
                    const ts = playbackRef.current.getMeasureTimestamp(i);
                    if (ts !== null) {
                        timestamps.push(ts);
                    }
                }
                setMeasureTimestamps(timestamps);

                playbackRef.current.setPlaybackCallback((playing) => {
                    setIsPlaying(playing);
                });

                // Apply initial highlight settings immediately
                playbackRef.current.setHighlightSettings(highlightNotes);

                // Set note callbacks for visual feedback
                playbackRef.current.setNoteCallbacks(
                    (midi) => setActiveNotes(prev => {
                        const newSet = new Set(prev);
                        newSet.add(midi);
                        return newSet;
                    }),
                    (midi) => setActiveNotes(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(midi);
                        return newSet;
                    })
                );

                // Init Audio
                await audio.init();

                setTotalDuration(playbackRef.current.TotalDuration);

                playbackRef.current.setProgressCallback((curr) => {
                    setCurrentTimestamp(curr);
                });

                setLoading(false);

            } catch (e: any) {
                console.error("OSMD Load Error:", e);
                setError(e.message || "Failed to load score.");
            }
        };

        loadScore();

    }, [xmlUrl, xmlContent, file, layoutMode]);


    // Combined OSMD styling, rendering, and interaction handler
    useEffect(() => {
        if (!osmdRef.current || loading) return;

        try {
            // Apply theme options and re-render
            osmdRef.current.setOptions({
                darkMode: isDarkMode,
                defaultColorMusic: isDarkMode ? "#f3f4f6" : "#000000",
                drawFingerings: preferences.showFingering
            });
            osmdRef.current.render();

            // Ensure cursor stays shown
            osmdRef.current.cursor.show();

            const container = osmdCanvasRef.current?.querySelector('svg');
            if (!container) return;

            // Clear existing labels
            const existingLabels = container.querySelectorAll('.osmd-note-label');
            existingLabels.forEach(el => el.remove());

            // Traverse graphical notes to attach clicks, hover states, and draw optional note name labels
            // @ts-ignore - Accessing internal structure
            const pages = osmdRef.current.GraphicSheet.MusicPages;
            pages.forEach((page: any) => {
                page.MusicSystems.forEach((system: any) => {
                    system.StaffLines.forEach((staff: any) => {
                        staff.Measures.forEach((measure: any) => {
                            measure.staffEntries.forEach((se: any) => {
                                se.graphicalVoiceEntries.forEach((ve: any) => {
                                    ve.notes.forEach((note: VexFlowGraphicalNote) => {
                                        if (!note.sourceNote || note.sourceNote.isRest()) return;

                                        const svgEl = note.getSVGGElement();
                                        if (!svgEl) return;

                                        // 1. Pointer style and hover highlights
                                        svgEl.style.cursor = 'pointer';

                                        const onMouseEnter = () => {
                                            const paths = svgEl.querySelectorAll('path');
                                            paths.forEach(path => {
                                                if (!path.hasAttribute('data-original-fill')) {
                                                    path.setAttribute('data-original-fill', path.getAttribute('fill') || (isDarkMode ? '#f3f4f6' : '#000000'));
                                                }
                                                if (!path.hasAttribute('data-original-stroke')) {
                                                    path.setAttribute('data-original-stroke', path.getAttribute('stroke') || (isDarkMode ? '#f3f4f6' : '#000000'));
                                                }
                                                path.setAttribute('fill', '#3b82f6'); // Highlight blue
                                                path.setAttribute('stroke', '#3b82f6');
                                            });
                                        };

                                        const onMouseLeave = () => {
                                            const paths = svgEl.querySelectorAll('path');
                                            paths.forEach(path => {
                                                const origFill = path.getAttribute('data-original-fill') || (isDarkMode ? '#f3f4f6' : '#000000');
                                                const origStroke = path.getAttribute('data-original-stroke') || (isDarkMode ? '#f3f4f6' : '#000000');
                                                path.setAttribute('fill', origFill);
                                                path.setAttribute('stroke', origStroke);
                                            });
                                        };

                                        const onClick = () => {
                                            if (note.sourceNote) {
                                                const absTs = note.sourceNote.getAbsoluteTimestamp();
                                                if (absTs) {
                                                    handleSeek(absTs.RealValue);
                                                }
                                            }
                                        };

                                        // Bind interactions
                                        svgEl.addEventListener('mouseenter', onMouseEnter);
                                        svgEl.addEventListener('mouseleave', onMouseLeave);
                                        svgEl.addEventListener('click', onClick);

                                        // 2. Note Name Labels
                                        if (showNoteNames) {
                                            const pitch = note.sourceNote.Pitch;
                                            if (pitch) {
                                                const midiVal = pitch.getHalfTone() + 12;
                                                const noteName = midiToNoteName(midiVal);
                                                let text = noteName.replace(/\d/g, '');
                                                text = text.replace(/#/g, '♯').replace(/b/g, '♭');

                                                const paths = Array.from(svgEl.querySelectorAll('path'));
                                                let noteheadPath = paths.find(path => path.getAttribute('data-is-notehead') === 'true');

                                                if (!noteheadPath) {
                                                    noteheadPath = paths.find(path => {
                                                        try {
                                                            const bbox = path.getBBox();
                                                            const isMatch = bbox.width > 6 && bbox.width < 22 && bbox.height > 4 && bbox.height < 15;
                                                            if (isMatch) {
                                                                path.setAttribute('data-is-notehead', 'true');
                                                            }
                                                            return isMatch;
                                                        } catch (e) {
                                                            return false;
                                                        }
                                                    }) || svgEl.querySelector('path') || undefined;
                                                }

                                                if (noteheadPath) {
                                                    try {
                                                        let centerX = parseFloat(noteheadPath.getAttribute('data-cx') || '');
                                                        let centerY = parseFloat(noteheadPath.getAttribute('data-cy') || '');
                                                        let isTrebleAttr = noteheadPath.getAttribute('data-istreble');
                                                        
                                                        if (isNaN(centerX) || isNaN(centerY) || !isTrebleAttr) {
                                                            const bbox = noteheadPath.getBBox();
                                                            centerX = bbox.x + bbox.width / 2;
                                                            centerY = bbox.y + bbox.height / 2;
                                                            
                                                            const staffIndex = system.StaffLines.indexOf(staff);
                                                            const isTrebleVal = staff.ParentStaff?.Header?.Clef?.ClefType === 0 
                                                                || staff.ParentStaff?.id === 1 
                                                                || staffIndex === 0 
                                                                || centerY < 110;
                                                            
                                                            isTrebleAttr = isTrebleVal ? 'true' : 'false';
                                                            noteheadPath.setAttribute('data-cx', centerX.toString());
                                                            noteheadPath.setAttribute('data-cy', centerY.toString());
                                                            noteheadPath.setAttribute('data-istreble', isTrebleAttr);
                                                        }
                                                        
                                                        const isTreble = isTrebleAttr === 'true';

                                                        // Render a background badge to cover staff lines
                                                        const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                                                        badge.setAttribute("class", "osmd-note-label");
                                                        badge.setAttribute("cx", centerX.toString());
                                                        badge.setAttribute("cy", centerY.toString());
                                                        badge.setAttribute("r", "7.5");
                                                        badge.setAttribute("fill", isTreble 
                                                            ? (isDarkMode ? "#4f46e5" : "#6366f1") // Indigo for treble
                                                            : (isDarkMode ? "#0d9488" : "#10b981") // Teal/emerald for bass
                                                        );
                                                        badge.setAttribute("stroke", "#ffffff");
                                                        badge.setAttribute("stroke-width", "1");
                                                        badge.setAttribute("pointer-events", "none");

                                                        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                                                        label.textContent = text;
                                                        label.setAttribute("class", "osmd-note-label");
                                                        label.setAttribute("x", centerX.toString());
                                                        label.setAttribute("y", (centerY + 3.5).toString());
                                                        label.setAttribute("fill", "#ffffff"); // Always white text for high contrast on badge
                                                        label.setAttribute("font-family", "Outfit, sans-serif");
                                                        label.setAttribute("font-weight", "950");
                                                        label.setAttribute("font-size", "10");
                                                        label.setAttribute("text-anchor", "middle");
                                                        label.setAttribute("pointer-events", "none");

                                                        svgEl.appendChild(badge);
                                                        svgEl.appendChild(label); // Append last to render on top
                                                    } catch (e) {
                                                        console.error("Error setting note label coords:", e);
                                                    }
                                                }
                                            }
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } catch (e) {
            console.error("Error drawing labels or binding interactions:", e);
        }
    }, [showNoteNames, loading, isDarkMode, layoutMode]);

    // Update Highlight Settings when toggled
    useEffect(() => {
        if (playbackRef.current) {
            playbackRef.current.setHighlightSettings(highlightNotes);
        }
    }, [highlightNotes, loading]); // loading dependency ensures it sets after init

    // Smooth scroll interpolation loop
    useEffect(() => {
        if (layoutMode !== 'scrolling' || !osmdRef.current || loading) return;

        const container = containerRef.current;
        if (!container) return;

        let animationFrameId: number;
        let targetScrollLeft = container.scrollLeft;

        const updateScroll = () => {
            if (!container || !osmdRef.current) {
                animationFrameId = requestAnimationFrame(updateScroll);
                return;
            }

            const isCountdownActive = isPracticeActive && practiceMode === 'play' && !playModeStarted;

            if (isCountdownActive) {
                targetScrollLeft = 0;
            } else {
                const cursor = osmdRef.current.cursor;
                const cursorEl = cursor?.cursorElement;
                if (cursorEl) {
                    try {
                        const containerRect = container.getBoundingClientRect();
                        const cursorRect = cursorEl.getBoundingClientRect();

                        // Align center of cursor with 25% playhead
                        const computedTarget = container.scrollLeft + (cursorRect.left + cursorRect.width / 2 - containerRect.left) - (containerRect.width * 0.25);
                        
                        const maxScroll = container.scrollWidth - containerRect.width;
                        targetScrollLeft = Math.max(0, Math.min(computedTarget, maxScroll));
                    } catch (e) {
                        // Bounding box query might fail if element not mounted
                    }
                }
            }

            // Interpolate scroll position smoothly
            const diff = targetScrollLeft - container.scrollLeft;
            if (Math.abs(diff) > 0.5) {
                // If it's a huge difference (e.g. initial start, seek, loop reset), snap instantly to prevent lag
                if (Math.abs(diff) > 300) {
                    container.scrollLeft = targetScrollLeft;
                } else {
                    container.scrollLeft += diff * 0.08; // Buttery smooth LERP factor (8% of remaining distance per frame)
                }
            }

            animationFrameId = requestAnimationFrame(updateScroll);
        };

        animationFrameId = requestAnimationFrame(updateScroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [layoutMode, loading, isPracticeActive, practiceMode, playModeStarted]);

    // Handle sliding scroll runway animation using GPU transform translate during Play Mode countdown
    useEffect(() => {
        if (practiceMode !== 'play') {
            if (canvasAnimFrameRef.current) {
                cancelAnimationFrame(canvasAnimFrameRef.current);
                canvasAnimFrameRef.current = null;
            }
            if (osmdCanvasRef.current) {
                osmdCanvasRef.current.style.transform = '';
            }
            lastCountdownRef.current = null;
            return;
        }

        // Trigger animation when countdown goes from non-3 to 3
        if (countdown === 3 && lastCountdownRef.current !== 3) {
            const container = containerRef.current;
            const canvas = osmdCanvasRef.current;
            if (container && canvas) {
                // Instantly reset scroll to 0 so the first note aligns with the 25% playhead as start reference
                container.scrollLeft = 0;
                
                const containerRect = container.getBoundingClientRect();
                // We start the first note at the right edge of the screen (100%) and animate it leftward to the playhead (25%)
                // So the initial translateX should shift it by 75% of the container width to the right
                const startTranslateX = containerRect.width * 0.75;
                const duration = 3000; // 3 seconds countdown
                const startTime = performance.now();

                const animate = (currentTime: number) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Nice easeOutCubic to start fast and slow down as it approaches the playhead
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const translateX = startTranslateX * (1 - ease);

                    canvas.style.transform = `translateX(${translateX}px)`;

                    if (progress < 1) {
                        canvasAnimFrameRef.current = requestAnimationFrame(animate);
                    } else {
                        canvas.style.transform = '';
                        canvasAnimFrameRef.current = null;
                    }
                };

                if (canvasAnimFrameRef.current) {
                    cancelAnimationFrame(canvasAnimFrameRef.current);
                }
                canvasAnimFrameRef.current = requestAnimationFrame(animate);
            }
        }

        lastCountdownRef.current = countdown;
    }, [countdown, practiceMode]);

    useEffect(() => {
        return () => {
            playbackRef.current?.stop();
            if (canvasAnimFrameRef.current) {
                cancelAnimationFrame(canvasAnimFrameRef.current);
            }
        };
    }, []);

    // Auto-start workout review loops if initial measure is passed, or auto-start wait-mode if in lesson mode
    useEffect(() => {
        if (!loading && playbackRef.current) {
            if (initialMeasure !== undefined) {
                const timer = setTimeout(() => {
                    startPractice(initialMeasure);
                }, 500);
                return () => clearTimeout(timer);
            } else if (isLessonMode && !isPracticeActive) {
                const timer = setTimeout(() => {
                    startPractice(0, 'wait');
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [loading, initialMeasure, isLessonMode, isPracticeActive, startPractice]);

    // Save weak measures on song completion
    useEffect(() => {
        if (isSongComplete) {
            const songId = xmlUrl || (file ? file.name : '') || 'Custom Score';
            if (songId) {
                try {
                    const raw = localStorage.getItem('pianopilot_weak_measures');
                    const weakData: Record<string, Record<number, number>> = raw ? JSON.parse(raw) : {};
                    
                    const songErrors: Record<number, number> = {};
                    for (const [mStr, count] of Object.entries(errorMeasures)) {
                        const m = parseInt(mStr);
                        if (count > 0) {
                            songErrors[m] = count;
                        }
                    }

                    if (Object.keys(songErrors).length > 0) {
                        weakData[songId] = {
                            ...(weakData[songId] || {}),
                            ...songErrors
                        };
                        localStorage.setItem('pianopilot_weak_measures', JSON.stringify(weakData));
                    }
                } catch (e) {
                    console.error("Error saving weak measures:", e);
                }
            }
        }
    }, [isSongComplete, xmlUrl, file, errorMeasures]);

    const togglePlayback = async () => {
        if (!playbackRef.current) return;

        // Ensure Audio Context is running (browser requirement)
        await audio.init();

        if (isPlaying) {
            playbackRef.current.pause();
        } else {
            playbackRef.current.play();
        }
    };

    const handleSeek = (val: number) => {
        if (playbackRef.current) {
            setActiveNotes(new Set());
            playbackRef.current.seek(val);
            if (isPracticeActive) {
                const seekedMeasure = playbackRef.current.getMeasureAtTimestamp(val);
                if (seekedMeasure >= practiceSection.startMeasure && seekedMeasure < practiceSection.endMeasure) {
                    startPractice(practiceSection.startMeasure);
                } else {
                    startPractice(seekedMeasure);
                }
            }
        }
    };

    const handleSetLoopStart = (val?: number | null) => {
        if (!playbackRef.current) return;
        const current = val !== undefined && val !== null ? val : playbackRef.current.CurrentTimestamp;
        setLoopStart(current);
        playbackRef.current.setLoop(current, loopEnd);
    };

    const handleSetLoopEnd = (val?: number | null) => {
        if (!playbackRef.current) return;
        const current = val !== undefined && val !== null ? val : playbackRef.current.CurrentTimestamp;
        setLoopEnd(current);
        playbackRef.current.setLoop(loopStart, current);
    };

    const handleClearLoop = () => {
        if (!playbackRef.current) return;
        setLoopStart(null);
        setLoopEnd(null);
        playbackRef.current.setLoop(null, null);
    };

    const stopPlayback = () => {
        playbackRef.current?.stop();
        osmdRef.current?.cursor?.reset();
        setCurrentTimestamp(0);
        setActiveNotes(new Set());
    };

    const bottomPaddingClass = effectiveShowKeyboard ? 'pb-44' : '';

    return (
        <div className={`flex flex-col items-center w-full h-full p-4 rounded-xl shadow-xl overflow-auto min-h-[500px] transition-colors duration-300 ${bottomPaddingClass} ${isDarkMode ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white border border-gray-100 text-gray-900'}`}>
            {loading && <div className="text-blue-500 font-bold animate-pulse mb-2">Loading Score...</div>}
            {error && <div className="text-red-500 font-bold mb-2">Error: {error}</div>}

            {/* Controls Bar */}
            <ScoreControls
                loading={loading}
                isPlaying={isPlaying}
                isDarkMode={isDarkMode}
                showKeyboard={showKeyboard}
                showPianoLabels={showPianoLabels}
                highlightNotes={highlightNotes}
                showNoteNames={showNoteNames}
                isPracticeActive={isPracticeActive}
                layoutMode={layoutMode}
                isMutedPlayback={isMutedPlayback}
                isMutedKeys={isMutedKeys}
                onTogglePlayback={togglePlayback}
                onReset={stopPlayback}
                onToggleKeyboard={setShowKeyboard}
                onTogglePianoLabels={setShowPianoLabels}
                onToggleHighlight={setHighlightNotes}
                onToggleNoteNames={setShowNoteNames}
                onTogglePractice={isPracticeActive ? stopPractice : () => startPractice()}
                onChangeLayoutMode={setLayoutMode}
                onToggleMutedPlayback={setIsMutedPlayback}
                onToggleMutedKeys={onToggleMutedKeys || (() => {})}
                isLessonMode={isLessonMode}
            />

            {/* Practice Mode Overlay - Compact Bottom Bar */}
            {isPracticeActive && (
                <PracticeOverlay
                    practiceMode={practiceMode}
                    practiceSection={practiceSection}
                    practiceFeedback={practiceFeedback}
                    onReplay={practiceMode === 'play' ? startPlayMode : () => playbackRef.current?.seek(playbackRef.current.getMeasureTimestamp(practiceSection.startMeasure) || 0)}
                    onNext={nextSection}
                    onPrev={prevSection}
                    onExit={stopPractice}
                    onModeChange={setPracticeMode}
                    playModeStarted={playModeStarted}
                    countdown={countdown}
                    onStartPlayMode={startPlayMode}
                />
            )}

            {!isLessonMode && (
                <div className="w-full max-w-4xl mb-4">
                    <LoopingControls
                        currentTimestamp={currentTimestamp}
                        totalDuration={totalDuration}
                        loopStart={loopStart}
                        loopEnd={loopEnd}
                        onSeek={handleSeek}
                        onSetLoopStart={handleSetLoopStart}
                        onSetLoopEnd={handleSetLoopEnd}
                        onClearLoop={handleClearLoop}
                        measureTimestamps={measureTimestamps}
                        disabled={isPracticeActive && practiceMode === 'play'}
                    />
                </div>
            )}

            {effectiveShowKeyboard && (
                <div className={`fixed bottom-0 left-0 right-0 z-40 bg-gray-900 dark:bg-gray-950 p-2 border-t border-gray-700 dark:border-gray-800 shadow-[0_-8px_30px_rgb(0,0,0,0.4)] transition-all duration-500 group ${isPracticeActive && showHint ? 'ring-4 ring-yellow-400' : ''}`}>
                    <div className="max-w-7xl mx-auto flex flex-col items-center relative">
                        {/* Close button - visible on hover or tap */}
                        <button
                            onClick={() => setShowKeyboard(false)}
                            title="Hide Keyboard"
                            className="absolute top-1 right-2 p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-50 shadow-md flex items-center justify-center w-7 h-7"
                        >
                            ✕
                        </button>
                        <VirtualKeyboard
                            activeNotes={activeNotes}
                            userActiveNotes={userActiveNotes}
                            expectedNotes={isPracticeActive && (practiceMode === 'wait' || practiceMode === 'play') ? expectedNotes : []}
                            showLabels={showPianoLabels}
                        />
                        {isPracticeActive && showHint && (
                            <div className="text-center text-xs font-bold text-yellow-500 mt-1 animate-pulse select-none">
                                👇 Hint: Play these notes!
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sheet Music Rendering Container */}
            <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 mb-4">
                {/* Continuous Playhead Line Overlay */}
                {layoutMode === 'scrolling' && (
                    <>
                        <style>{`
                            .scrolling-score-inner {
                                margin-left: 25% !important;
                                margin-right: 75% !important;
                                display: inline-block;
                            }
                        `}</style>
                        <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)] z-20 pointer-events-none"
                            style={{ left: '25%' }}
                        >
                            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow whitespace-nowrap uppercase tracking-widest leading-none pointer-events-none select-none">
                                Playhead
                            </div>
                        </div>
                    </>
                )}

                <div 
                    ref={containerRef} 
                    className={`w-full overflow-auto ${layoutMode === 'scrolling' ? 'no-scrollbar scrolling-score-container p-0' : 'p-4'}`} 
                    style={{ minHeight: '400px' }} 
                >
                    <div 
                        ref={osmdCanvasRef}
                        className={layoutMode === 'scrolling' ? 'scrolling-score-inner' : 'w-full'}
                    />
                </div>
            </div>

            {/* Performance Report Card Modal */}
            <PerformanceReportCard
                isOpen={isSongComplete}
                onClose={() => {
                    setIsSongComplete(false);
                    if (onCloseScore) {
                        onCloseScore();
                    }
                }}
                onRetry={() => {
                    setIsSongComplete(false);
                    startPractice(initialMeasure);
                }}
                onNext={onNextLesson ? () => {
                    setIsSongComplete(false);
                    onNextLesson();
                } : undefined}
                songTitle={xmlUrl ? xmlUrl.split('/').pop()?.replace('.musicxml', '').replace('.mxl', '').replace(/[-_]/g, ' ') || 'Loaded Score' : (file ? file.name : 'Practice Piece')}
                notesCorrect={notesCorrect}
                notesMissed={notesMissed}
                errorMeasures={errorMeasures}
                totalMeasures={playbackRef.current?.MeasureCount || 8}
                isDarkMode={isDarkMode}
                passed={passed}
                requiredAccuracy={requiredAccuracy}
                isCapstone={isCapstone}
            />
        </div>
    );
};
