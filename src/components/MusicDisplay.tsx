import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';

export interface StaveNoteData {
    keys: string[];
    duration: string;
}

interface MusicDisplayProps {
    trebleNotes?: StaveNoteData[];
    bassNotes?: StaveNoteData[];
    width?: number;
    height?: number;
    showLabels?: boolean;
    cursorIndex?: number;
    trebleCursorIndex?: number;
    bassCursorIndex?: number;
    isTrebleOnset?: boolean;
    isBassOnset?: boolean;
    inputStatus?: 'waiting' | 'correct' | 'incorrect' | 'perfect';
    onLayout?: (positions: number[]) => void;
    isDarkMode?: boolean;
    gameMode?: 'treble' | 'bass' | 'both';
    handPosition?: string;
    showFingering?: boolean;
    keySignature?: string;
    timeSignature?: string;
}

const VF = Vex.Flow;

const POSITION_MAPS: Record<string, Record<string, { hand: 'LH' | 'RH'; finger: number }>> = {
    'RH_MIDDLE_C': {
        'c/4': { hand: 'RH', finger: 1 }
    },
    'RH_C_3FINGER': {
        'c/4': { hand: 'RH', finger: 1 },
        'd/4': { hand: 'RH', finger: 2 },
        'e/4': { hand: 'RH', finger: 3 }
    },
    'LH_BASS_F_3FINGER': {
        'e/3': { hand: 'LH', finger: 3 },
        'f/3': { hand: 'LH', finger: 2 },
        'g/3': { hand: 'LH', finger: 1 }
    },
    'RH_C_POS': {
        'c/4': { hand: 'RH', finger: 1 },
        'd/4': { hand: 'RH', finger: 2 },
        'e/4': { hand: 'RH', finger: 3 },
        'f/4': { hand: 'RH', finger: 4 },
        'g/4': { hand: 'RH', finger: 5 }
    },
    'LH_C_POS': {
        'c/3': { hand: 'LH', finger: 5 },
        'd/3': { hand: 'LH', finger: 4 },
        'e/3': { hand: 'LH', finger: 3 },
        'f/3': { hand: 'LH', finger: 2 },
        'g/3': { hand: 'LH', finger: 1 }
    },
    'RH_HIGH_C_POS': {
        'c/5': { hand: 'RH', finger: 1 },
        'd/5': { hand: 'RH', finger: 2 },
        'e/5': { hand: 'RH', finger: 3 }
    },
    'LH_LOW_C_POS': {
        'c/3': { hand: 'LH', finger: 5 },
        'd/3': { hand: 'LH', finger: 4 },
        'e/3': { hand: 'LH', finger: 3 }
    },
    'RH_UPPER_TREBLE': {
        'f/4': { hand: 'RH', finger: 1 },
        'g/4': { hand: 'RH', finger: 2 },
        'a/4': { hand: 'RH', finger: 3 },
        'b/4': { hand: 'RH', finger: 4 },
        'c/5': { hand: 'RH', finger: 5 }
    },
    'LH_LOWER_BASS': {
        'f/2': { hand: 'LH', finger: 5 },
        'g/2': { hand: 'LH', finger: 4 },
        'a/2': { hand: 'LH', finger: 3 },
        'b/2': { hand: 'LH', finger: 2 },
        'c/3': { hand: 'LH', finger: 1 }
    },
    'GRAND_C_POS': {
        'c/3': { hand: 'LH', finger: 5 },
        'd/3': { hand: 'LH', finger: 4 },
        'e/3': { hand: 'LH', finger: 3 },
        'f/3': { hand: 'LH', finger: 2 },
        'g/3': { hand: 'LH', finger: 1 },
        'c/4': { hand: 'RH', finger: 1 },
        'd/4': { hand: 'RH', finger: 2 },
        'e/4': { hand: 'RH', finger: 3 },
        'f/4': { hand: 'RH', finger: 4 },
        'g/4': { hand: 'RH', finger: 5 }
    }
};

export const MusicDisplay: React.FC<MusicDisplayProps> = ({
    trebleNotes = [{ keys: ["c/4"], duration: "q" }],
    bassNotes = [{ keys: ["c/3"], duration: "q" }],
    width = 600,
    height = 300,
    showLabels = false,
    cursorIndex = 0,
    trebleCursorIndex,
    bassCursorIndex,
    isTrebleOnset,
    isBassOnset,
    inputStatus = 'waiting',
    onLayout,
    isDarkMode = false,
    handPosition,
    showFingering = true,
    keySignature,
    timeSignature
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevPositionsRef = useRef<number[] | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous SVG
        containerRef.current.innerHTML = '';

        // Calculate rendering width dynamically to prevent note overlapping in long songs
        const trebleNotesCount = trebleNotes ? trebleNotes.length : 0;
        const bassNotesCount = bassNotes ? bassNotes.length : 0;
        const noteCount = Math.max(trebleNotesCount, bassNotesCount);
        const renderWidth = Math.max(width, noteCount * 55 + 100);

        // Create Renderer
        const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
        renderer.resize(renderWidth, height);
        const context = renderer.getContext();

        // Dark Mode Styling
        const foregroundColor = isDarkMode ? "#e5e7eb" : "#000000"; // Gray-200 or Black
        context.setFillStyle(foregroundColor);
        context.setStrokeStyle(foregroundColor);

        // -----------------------------------------------------------------------
        // Create Staves
        // -----------------------------------------------------------------------
        const startX = 20;
        const startY = 40;
        const staveWidth = renderWidth - 40;

        // Treble Stave
        const trebleStave = new VF.Stave(startX, startY, staveWidth);
        trebleStave.addClef("treble");
        if (keySignature) {
            trebleStave.addKeySignature(keySignature);
        }
        if (timeSignature) {
            trebleStave.addTimeSignature(timeSignature);
        }
        trebleStave.setContext(context).draw();

        // Bass Stave
        const bassStave = new VF.Stave(startX, startY + 100, staveWidth);
        bassStave.addClef("bass");
        if (keySignature) {
            bassStave.addKeySignature(keySignature);
        }
        if (timeSignature) {
            bassStave.addTimeSignature(timeSignature);
        }
        bassStave.setContext(context).draw();


        // Connectors (Brace + Lines)
        new VF.StaveConnector(trebleStave, bassStave).setType(VF.StaveConnector.type.BRACE).setContext(context).draw();
        new VF.StaveConnector(trebleStave, bassStave).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
        new VF.StaveConnector(trebleStave, bassStave).setType(VF.StaveConnector.type.SINGLE_RIGHT).setContext(context).draw();

        // Helper function to calculate total beats (duration) of a set of notes/rests
        const calculateDuration = (notesData: StaveNoteData[]): number => {
            return notesData.reduce((sum, current) => {
                const durStr = current.duration.replace('r', '');
                const isDotted = durStr.endsWith('.');
                const base = isDotted ? durStr.slice(0, -1) : durStr;
                let beats = 1; // Default to quarter
                if (base === 'w') beats = 4;
                else if (base === 'h') beats = 2;
                else if (base === 'q') beats = 1;
                else if (base === '8') beats = 0.5;
                else if (base === '16') beats = 0.25;
                return sum + (isDotted ? beats * 1.5 : beats);
            }, 0);
        };

        // Helper function to pad notes with rests until target duration is reached
        const padNotes = (notesData: StaveNoteData[], targetDuration: number, clef: string): StaveNoteData[] => {
            let currentDuration = calculateDuration(notesData);
            if (Math.abs(currentDuration - targetDuration) < 0.01) {
                return [...notesData];
            }

            let paddedNotes = [...notesData];
            let remaining = targetDuration - currentDuration;
            const restKey = clef === 'bass' ? "d/3" : "b/4";

            // Greedy breakdown of remaining beats into standard rests
            while (remaining >= 4) {
                paddedNotes.push({ keys: [restKey], duration: "wr" });
                remaining -= 4;
            }
            while (remaining >= 2) {
                paddedNotes.push({ keys: [restKey], duration: "hr" });
                remaining -= 2;
            }
            while (remaining >= 1) {
                paddedNotes.push({ keys: [restKey], duration: "qr" });
                remaining -= 1;
            }
            while (remaining >= 0.5) {
                paddedNotes.push({ keys: [restKey], duration: "8r" });
                remaining -= 0.5;
            }
            while (remaining >= 0.25) {
                paddedNotes.push({ keys: [restKey], duration: "16r" });
                remaining -= 0.25;
            }

            return paddedNotes;
        };


        // -----------------------------------------------------------------------
        // Create Voices
        // -----------------------------------------------------------------------
        const createVoice = (notesData: StaveNoteData[], clef: string) => {
            const highlights = handPosition ? POSITION_MAPS[handPosition] : null;
            const staffCursorIndex = clef === "treble"
                ? (trebleCursorIndex !== undefined ? trebleCursorIndex : cursorIndex)
                : (bassCursorIndex !== undefined ? bassCursorIndex : cursorIndex);
            const isOnset = clef === "treble"
                ? (isTrebleOnset !== undefined ? isTrebleOnset : true)
                : (isBassOnset !== undefined ? isBassOnset : true);

            const notes = notesData.map((n, i) => {
                const staveNote = new VF.StaveNote({
                    clef: clef,
                    keys: n.keys,
                    duration: n.duration,
                });

                // Add fingering annotations if enabled and mapped
                if (showFingering && highlights && !n.duration.endsWith('r')) {
                    n.keys.forEach((key, keyIndex) => {
                        const info = highlights[key];
                        if (info) {
                            const justify = clef === 'bass' ? VF.Annotation.VerticalJustify.BOTTOM : VF.Annotation.VerticalJustify.TOP;
                            staveNote.addModifier(
                                new VF.Annotation(String(info.finger)).setVerticalJustification(justify),
                                keyIndex
                            );
                        }
                    });
                }

                // Apply Theme Styles (Default notes)
                staveNote.setStyle({ fillStyle: foregroundColor, strokeStyle: foregroundColor });
                n.keys.forEach((_, keyIndex) => {
                    staveNote.setKeyStyle(keyIndex, { fillStyle: foregroundColor, strokeStyle: foregroundColor });
                });

                const isRest = n.duration.endsWith('r');

                if (staffCursorIndex !== undefined && !isRest) {
                    if (i === staffCursorIndex) {
                        if (isOnset) {
                            // Color current note based on input status
                            let color = "#3b82f6"; // Default Blue (Waiting)
                            if (inputStatus === 'correct') color = "#22c55e"; // Green
                            if (inputStatus === 'incorrect') color = "#ef4444"; // Red
                            if (inputStatus === 'perfect') color = "#FFD700"; // Gold

                            staveNote.setStyle({ fillStyle: color, strokeStyle: color });
                            n.keys.forEach((_, keyIndex) => {
                                staveNote.setKeyStyle(keyIndex, { fillStyle: color, strokeStyle: color });
                            });
                        } else {
                            // Note is holding from a previous step, color it as past note (gray)
                            const pastColor = "#9ca3af";
                            staveNote.setStyle({ fillStyle: pastColor, strokeStyle: pastColor });
                            n.keys.forEach((_, keyIndex) => {
                                staveNote.setKeyStyle(keyIndex, { fillStyle: pastColor, strokeStyle: pastColor });
                            });
                        }
                    } else if (i < staffCursorIndex) {
                        const pastColor = "#9ca3af";
                        staveNote.setStyle({ fillStyle: pastColor, strokeStyle: pastColor }); // Gray 400
                        n.keys.forEach((_, keyIndex) => {
                            staveNote.setKeyStyle(keyIndex, { fillStyle: pastColor, strokeStyle: pastColor });
                        });
                    }
                }


                return staveNote;
            });

            // Calculate total beats to satisfy VexFlow using the dotted-aware function
            const totalBeats = calculateDuration(notesData);

            // We use beat_value 4 (quarter note as unit), so num_beats is the total beats in quarter note units
            const voice = new VF.Voice({ num_beats: Math.ceil(totalBeats), beat_value: 4 });
            voice.setStrict(false); // Allowing some flexibility prevents strict tick crashes when randomly generated
            voice.addTickables(notes);
            return voice;
        };

        // --- Padding Logic Start ---
        const trebleDuration = calculateDuration(trebleNotes);
        const bassDuration = calculateDuration(bassNotes);
        
        // Determine the target duration (the maximum of the two)
        const targetDuration = Math.max(trebleDuration, bassDuration);

        // Pad both arrays to match the target duration
        const finalTrebleNotes = padNotes(trebleNotes, targetDuration, "treble");
        const finalBassNotes = padNotes(bassNotes, targetDuration, "bass");
        // --- Padding Logic End ---


        const trebleVoice = createVoice(finalTrebleNotes, "treble");
        const bassVoice = createVoice(finalBassNotes, "bass");

        // -----------------------------------------------------------------------
        // Format & Draw
        // -----------------------------------------------------------------------
        new VF.Formatter()
            .joinVoices([trebleVoice])
            .joinVoices([bassVoice])
            // .format([trebleVoice, bassVoice], staveWidth - 50); // Original
            // To ensure linear spacing for rhythm, we might want to use a different format call?
            // But Formatter uses note durations.
            // Using a large available width ensures spacing.
            .format([trebleVoice, bassVoice], staveWidth - 50);


        trebleVoice.draw(context, trebleStave);



        bassVoice.draw(context, bassStave);


        // -----------------------------------------------------------------------
        // Extract Layout (for external synchronization)
        // -----------------------------------------------------------------------
        // -----------------------------------------------------------------------
        // Extract Layout & Draw Custom Watermarks
        // -----------------------------------------------------------------------
        const trebleTickables = trebleVoice.getTickables();
        const treblePositions = trebleTickables.map(t => (t as any).getAbsoluteX());

        const bassTickables = bassVoice.getTickables();
        const bassPositions = bassTickables.map(t => (t as any).getAbsoluteX());

        const positions = treblePositions;

        const svgElement = containerRef.current?.querySelector('svg');
        if (svgElement) {
            const oldCustom = svgElement.querySelectorAll('.custom-watermark');
            oldCustom.forEach(el => el.remove());

            const getTrebleY = (key: string) => {
                const [note, octaveStr] = key.split('/');
                const octave = parseInt(octaveStr);
                const noteMap: Record<string, number> = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 };
                const noteVal = noteMap[note.toLowerCase()[0]] ?? 0;
                const diatonic = noteVal + octave * 7;
                const stepDiff = diatonic - 34;
                return 60 - stepDiff * 5;
            };

            const getBassY = (key: string) => {
                const [note, octaveStr] = key.split('/');
                const octave = parseInt(octaveStr);
                const noteMap: Record<string, number> = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 };
                const noteVal = noteMap[note.toLowerCase()[0]] ?? 0;
                const diatonic = noteVal + octave * 7;
                const stepDiff = diatonic - 22;
                return 160 - stepDiff * 5;
            };

            if (showLabels) {
                finalTrebleNotes.forEach((tNote, i) => {
                    const x = treblePositions[i];
                    if (x !== undefined && tNote && tNote.keys && tNote.keys[0] !== 'b/4' && !tNote.duration.endsWith('r')) {
                        tNote.keys.forEach(k => {
                            const noteName = k.split('/')[0].toUpperCase();
                            const y = getTrebleY(k);

                            const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                            badge.setAttribute("class", "custom-watermark");
                            badge.setAttribute("cx", x.toString());
                            badge.setAttribute("cy", y.toString());
                            badge.setAttribute("r", "7.5");
                            badge.setAttribute("fill", isDarkMode ? "#4f46e5" : "#6366f1");
                            badge.setAttribute("stroke", "#ffffff");
                            badge.setAttribute("stroke-width", "1");
                            badge.setAttribute("pointer-events", "none");

                            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            label.setAttribute("class", "custom-watermark");
                            label.textContent = noteName.replace(/#/g, '♯').replace(/b/g, '♭');
                            label.setAttribute("x", x.toString());
                            label.setAttribute("y", (y + 3.5).toString());
                            label.setAttribute("fill", "#ffffff");
                            label.setAttribute("font-family", "Outfit, sans-serif");
                            label.setAttribute("font-weight", "900");
                            label.setAttribute("font-size", "10");
                            label.setAttribute("text-anchor", "middle");
                            label.setAttribute("pointer-events", "none");

                            svgElement.appendChild(badge);
                            svgElement.appendChild(label);
                        });
                    }
                });

                finalBassNotes.forEach((bNote, i) => {
                    const x = bassPositions[i];
                    if (x !== undefined && bNote && bNote.keys && bNote.keys[0] !== 'd/3' && !bNote.duration.endsWith('r')) {
                        bNote.keys.forEach(k => {
                            const noteName = k.split('/')[0].toUpperCase();
                            const y = getBassY(k);

                            const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                            badge.setAttribute("class", "custom-watermark");
                            badge.setAttribute("cx", x.toString());
                            badge.setAttribute("cy", y.toString());
                            badge.setAttribute("r", "7.5");
                            badge.setAttribute("fill", isDarkMode ? "#0d9488" : "#10b981"); // Teal/emerald for bass clef distinction
                            badge.setAttribute("stroke", "#ffffff");
                            badge.setAttribute("stroke-width", "1");
                            badge.setAttribute("pointer-events", "none");

                            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            label.setAttribute("class", "custom-watermark");
                            label.textContent = noteName.replace(/#/g, '♯').replace(/b/g, '♭');
                            label.setAttribute("x", x.toString());
                            label.setAttribute("y", (y + 3.5).toString());
                            label.setAttribute("fill", "#ffffff");
                            label.setAttribute("font-family", "Outfit, sans-serif");
                            label.setAttribute("font-weight", "900");
                            label.setAttribute("font-size", "10");
                            label.setAttribute("text-anchor", "middle");
                            label.setAttribute("pointer-events", "none");

                            svgElement.appendChild(badge);
                            svgElement.appendChild(label);
                        });
                    }
                });
            }
        }

        if (onLayout) {
            // Check if positions changed to avoid infinite loop
            // We use a simple element-wise check with prevPositionsRef.
            const isDifferent = !prevPositionsRef.current ||
                prevPositionsRef.current.length !== positions.length ||
                prevPositionsRef.current.some((p, i) => Math.abs(p - positions[i]) > 0.1);

            if (isDifferent) {
                prevPositionsRef.current = positions;
                onLayout(positions);
            }
        }

    }, [trebleNotes, bassNotes, width, height, showLabels, cursorIndex, inputStatus, isDarkMode, onLayout, handPosition, showFingering]);

    // Scroll active note into center of the viewport
    useEffect(() => {
        if (!scrollContainerRef.current || !prevPositionsRef.current || cursorIndex === undefined) return;
        const noteX = prevPositionsRef.current[cursorIndex];
        if (noteX === undefined) return;

        const container = scrollContainerRef.current;
        const containerWidth = container.clientWidth;
        const scrollTarget = noteX - containerWidth / 2;

        container.scrollTo({
            left: Math.max(0, scrollTarget),
            behavior: 'smooth'
        });
    }, [cursorIndex]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
            {/* Floating Scale Pill Badge */}
            <div className="absolute top-3 right-3 px-3 py-1 bg-blue-50/90 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full font-bold text-xs shadow-sm border border-blue-100 dark:border-blue-900/50 flex items-center gap-1.5 pointer-events-none select-none z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>🎵 C Major Scale</span>
            </div>
            
            <div 
                ref={scrollContainerRef} 
                className="w-full h-full overflow-x-auto overflow-y-hidden scroll-smooth flex items-center"
            >
                <div ref={containerRef} className="flex-shrink-0" />
            </div>
        </div>
    );
};
