
import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import { audio } from '../audio/Synth';
import VirtualKeyboard from './VirtualKeyboard';
import { useMidi } from '../hooks/useMidi';
import { usePracticeMode } from '../hooks/usePracticeMode';
import LoopingControls from './LoopingControls';
import { VexFlowGraphicalNote } from 'opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowGraphicalNote';
import { ScoreControls } from './ScoreControls';
import { PracticeOverlay } from './PracticeOverlay';

interface ScoreDisplayProps {
    xmlUrl?: string; // Optional: Load from URL
    xmlContent?: string; // Optional: Load from string content
    file?: File; // Optional: Load from File object (for MXL)
    isDarkMode?: boolean;
    onAddXp?: (amount: number) => void;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ xmlUrl, xmlContent, file, isDarkMode = false, onAddXp }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OSMD | null>(null);
    const playbackRef = useRef<PlaybackEngine | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const { activeNotes: userActiveNotes } = useMidi();
    const [error, setError] = useState<string | null>(null);

    // Practice Mode
    const {
        isActive: isPracticeActive,
        currentSection: practiceSection,
        mode: practiceMode,
        feedback: practiceFeedback,
        startPractice,
        stopPractice,
        nextSection,
        expectedNotes,
        showHint // NEW
    } = usePracticeMode({
        playbackEngine: playbackRef.current,
        totalMeasures: playbackRef.current?.MeasureCount || 0,
        userActiveNotes,
        onNoteCorrect: onAddXp ? () => onAddXp(2) : undefined, // 2 XP per note
        onSectionComplete: onAddXp ? () => onAddXp(50) : undefined // 50 XP per section (~1/2 level early on)
    });

    // ... (rest of code)



    // Looping & Progress State
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [loopStart, setLoopStart] = useState<number | null>(null);
    const [loopEnd, setLoopEnd] = useState<number | null>(null);

    // Visual Preferences
    const [showKeyboard, setShowKeyboard] = useState(true);
    const [highlightNotes, setHighlightNotes] = useState(true);
    const [showNoteNames, setShowNoteNames] = useState(false);
    const [showPianoLabels, setShowPianoLabels] = useState(false);

    // Determine if we should show keyboard
    // Show if: User manually toggled ON OR (Practice Mode AND Hint is Active)
    const effectiveShowKeyboard = showKeyboard || (isPracticeActive && showHint);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize OSMD if not already done
        if (!osmdRef.current) {
            // @ts-ignore - OSMD constructor types might be loose
            osmdRef.current = new OSMD(containerRef.current, {
                autoResize: true,
                backend: "svg",
                drawingParameters: "compacttight", // Try to fit well
            });
        }

        const loadScore = async () => {
            if (!osmdRef.current) return;
            setLoading(true);
            setError(null);

            try {
                if (file) {
                    // If file is provided (e.g. .mxl), load it directly. 
                    // OSMD load() supports File objects. 
                    // It handles unzipping .mxl internally if strict mode is off or proper file type is detected.
                    await osmdRef.current.load(file);
                } else if (xmlContent) {
                    await osmdRef.current.load(xmlContent);
                } else if (xmlUrl) {
                    await osmdRef.current.load(xmlUrl);
                } else {
                    // Default fallback (maybe a hardcoded simple XML for demo)
                    // For now, just return
                    setLoading(false);
                    return;
                }

                osmdRef.current.render();

                // Init Playback Engine
                playbackRef.current = new PlaybackEngine(osmdRef.current);
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
            } finally {
                // setLoading(false); // Moved above
            }
        };

        loadScore();

        // Cleanup? OSMD doesn't have a strict destroy, but we can clear container
        // However, react might handle this fine.

    }, [xmlUrl, xmlContent, file]);


    // Helper to draw/remove note labels
    useEffect(() => {
        if (!osmdRef.current || !osmdRef.current.GraphicSheet) return;

        // Container for labels
        const container = containerRef.current?.querySelector('svg');
        if (!container) return;

        // Clear existing labels
        const existingLabels = container.querySelectorAll('.osmd-note-label');
        existingLabels.forEach(el => el.remove());

        if (showNoteNames) {
            // Iterate all notes and draw labels
            // This requires traversing the GraphicalSheet
            try {
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

                                            // Get Note ID/Position
                                            // VexFlowGraphicalNote has getSVGGElement
                                            const svgEl = note.getSVGGElement();
                                            if (!svgEl) return;

                                            // Calculate position
                                            // Use getBoundingClientRect? No, relative to SVG.
                                            // We can append text straight to the note's group or calculate offset.

                                            // Simpler: note.PositionAndShape
                                            // But that is relative to System/Staff.

                                            // Best check: Just append text to the note's SVG group?
                                            // If we append to `svgEl` (which is a <g>), it moves with the note.

                                            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");

                                            // Determine Note Name
                                            // note.sourceNote.Pitch
                                            const pitch = note.sourceNote.Pitch;
                                            let text = pitch.ToString(); // e.g. "C4"

                                            // Simplify text? "C" vs "C4"
                                            text = text.replace(/\d/, ''); // Remove octave for cleaner look? User asked for "labels", usually just Note Name is enough, but Octave helps beginners.
                                            // Let's keep it short: "C", "C#"
                                            // Actually Pitch.ToString() is "C4".

                                            label.textContent = text;
                                            label.setAttribute("class", "osmd-note-label");
                                            label.setAttribute("fill", "#555");
                                            label.setAttribute("font-family", "Lato, sans-serif"); // Use our Sans font
                                            label.setAttribute("font-size", "10");
                                            label.setAttribute("text-anchor", "middle");

                                            // Position: Above or Below?
                                            // Generally above for visual clarity, or inside notehead?
                                            // Inside is hard for black notes.
                                            // Let's put it slightly above.
                                            label.setAttribute("y", "-15"); // Relative to note group center

                                            svgEl.appendChild(label);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            } catch (e) {
                console.warn("Error drawing labels:", e);
            }
        }
    }, [showNoteNames, loading]); // Re-run when toggle changes or load finishes

    // Update Highlight Settings when toggled
    useEffect(() => {
        if (playbackRef.current) {
            playbackRef.current.setHighlightSettings(highlightNotes);
        }
    }, [highlightNotes, loading]); // loading dependency ensures it sets after init


    useEffect(() => {
        return () => {
            playbackRef.current?.stop();
        };
    }, []);

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
        }
    };

    const handleSetLoopStart = () => {
        if (!playbackRef.current) return;
        const current = playbackRef.current.CurrentTimestamp;
        setLoopStart(current);
        playbackRef.current.setLoop(current, loopEnd);
    };

    const handleSetLoopEnd = () => {
        if (!playbackRef.current) return;
        const current = playbackRef.current.CurrentTimestamp;

        // Validate logic: End must be > Start??
        // For now just set it.
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

    return (
        <div className="flex flex-col items-center w-full h-full bg-white p-4 rounded shadow-xl overflow-auto min-h-[500px]">
            {loading && <div className="text-blue-500 font-bold animate-pulse">Loading Score...</div>}
            {error && <div className="text-red-500 font-bold">Error: {error}</div>}

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
                onTogglePlayback={togglePlayback}
                onReset={stopPlayback}
                onToggleKeyboard={setShowKeyboard}
                onTogglePianoLabels={setShowPianoLabels}
                onToggleHighlight={setHighlightNotes}
                onToggleNoteNames={setShowNoteNames}
                onTogglePractice={isPracticeActive ? stopPractice : startPractice}
            />

            {/* Practice Mode Overlay - Compact Bottom Bar */}
            {isPracticeActive && (
                <PracticeOverlay
                    practiceMode={practiceMode}
                    practiceSection={practiceSection}
                    practiceFeedback={practiceFeedback}
                    onReplay={() => playbackRef.current?.seek(playbackRef.current.getMeasureTimestamp(practiceSection.startMeasure) || 0)}
                    onNext={nextSection}
                    onExit={stopPractice}
                />
            )}

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
                />
            </div>

            {effectiveShowKeyboard && (
                <div className={`w-full max-w-4xl mb-4 transition-all duration-500 ${isPracticeActive && showHint ? 'animate-bounce shadow-2xl ring-4 ring-yellow-400 rounded-xl' : ''}`}>
                    <VirtualKeyboard
                        activeNotes={activeNotes}
                        userActiveNotes={userActiveNotes}
                        expectedNotes={isPracticeActive && practiceMode === 'wait' ? expectedNotes : []}
                        showLabels={showPianoLabels}
                    />
                    {isPracticeActive && showHint && (
                        <div className="text-center text-sm font-bold text-yellow-600 animate-pulse">
                            👇 Hint: Play these notes!
                        </div>
                    )}
                </div>
            )}

            <div ref={containerRef} className="w-full overflow-auto bg-white p-4 rounded shadow" style={{ minHeight: '400px' }} />
        </div>
    );
};
