
import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import { audio } from '../audio/Synth';
import VirtualKeyboard from './VirtualKeyboard';
import { useMidi } from '../hooks/useMidi';
import LoopingControls from './LoopingControls';
import { GraphicalNote } from 'opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/GraphicalNote';
import { VexFlowGraphicalNote } from 'opensheetmusicdisplay/build/dist/src/MusicalScore/Graphical/VexFlow/VexFlowGraphicalNote';
import { AccidentalEnum } from 'opensheetmusicdisplay/build/dist/src/Common/DataObjects/Pitch';

interface ScoreDisplayProps {
    xmlUrl?: string; // Optional: Load from URL
    xmlContent?: string; // Optional: Load from string content
    file?: File; // Optional: Load from File object (for MXL)
    isDarkMode?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ xmlUrl, xmlContent, file, isDarkMode = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OSMD | null>(null);
    const playbackRef = useRef<PlaybackEngine | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const { activeNotes: userActiveNotes } = useMidi();
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize OSMD if not already done
        if (!osmdRef.current) {
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

                playbackRef.current.setProgressCallback((curr, total) => {
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
        if (playbackRef.current) playbackRef.current.seek(val);
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
    };

    return (
        <div className="flex flex-col items-center w-full h-full bg-white p-4 rounded shadow-xl overflow-auto min-h-[500px]">
            {loading && <div className="text-blue-500 font-bold animate-pulse">Loading Score...</div>}
            {error && <div className="text-red-500 font-bold">Error: {error}</div>}

            {/* Controls Bar */}
            <div className={`w-full max-w-4xl p-4 rounded-xl shadow-lg border flex flex-col gap-4 mb-6 transition-colors duration-500
                 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}
            `}>
                {/* Top Row: Playback & File Info */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={togglePlayback}
                            disabled={loading}
                            className={`px-6 py-2 rounded-full font-bold uppercase text-sm tracking-wider transition-all
                                ${isPlaying
                                    ? 'bg-red-500 text-white shadow-red-500/50 hover:bg-red-600'
                                    : (isDarkMode ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-500 text-white shadow-emerald-500/50 hover:bg-emerald-600')}
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:scale-105 active:scale-95'}
                            `}
                        >
                            {loading ? 'Loading...' : isPlaying ? 'Stop' : 'Play'}
                        </button>
                        <button
                            onClick={stopPlayback}
                            disabled={loading}
                            className={`px-6 py-2 rounded-full font-bold uppercase text-sm tracking-wider transition-all
                                ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:scale-105 active:scale-95'}
                            `}
                        >
                            Reset
                        </button>
                    </div>
                    {/* Placeholder for file info / title */}
                    <div className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {/* Score Title */}
                    </div>
                </div>

                {/* Bottom Row: Toggles */}
                <div className={`flex flex-wrap items-center justify-center gap-6 p-4 rounded-lg border w-full max-w-4xl mb-4 font-sans text-sm transition-colors duration-500
                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}
                `}>
                    <div className={`font-serif font-bold mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Display:</div>

                    <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                        <input
                            type="checkbox"
                            checked={showKeyboard}
                            onChange={(e) => setShowKeyboard(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Virtual Piano</span>
                    </label>

                    <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                        <input
                            type="checkbox"
                            checked={showPianoLabels}
                            onChange={(e) => setShowPianoLabels(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Piano Labels</span>
                    </label>

                    <div className={`h-4 w-px mx-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-300'}`}></div>

                    <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                        <input
                            type="checkbox"
                            checked={highlightNotes}
                            onChange={(e) => setHighlightNotes(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Highlight Notes</span>
                    </label>

                    <label className={`flex items-center gap-2 cursor-pointer select-none transition ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}>
                        <input
                            type="checkbox"
                            checked={showNoteNames}
                            onChange={(e) => setShowNoteNames(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Score Labels</span>
                    </label>
                </div>
            </div>

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

            {showKeyboard && (
                <div className="w-full max-w-4xl mb-4">
                    <VirtualKeyboard
                        activeNotes={activeNotes}
                        userActiveNotes={userActiveNotes}
                        rangeStart={21}
                        rangeEnd={108}
                        showLabels={showPianoLabels}
                    />
                </div>
            )}

            <div ref={containerRef} className="w-full overflow-auto bg-white p-4 rounded shadow" style={{ minHeight: '400px' }} />
        </div>
    );
};
