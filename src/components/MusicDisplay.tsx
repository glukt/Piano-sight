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
    inputStatus?: 'waiting' | 'correct' | 'incorrect' | 'perfect';
    onLayout?: (positions: number[]) => void;
    isDarkMode?: boolean;
    gameMode?: 'treble' | 'bass' | 'both';
}

const VF = Vex.Flow;

export const MusicDisplay: React.FC<MusicDisplayProps> = ({
    trebleNotes = [{ keys: ["c/4"], duration: "q" }],
    bassNotes = [{ keys: ["c/3"], duration: "q" }],
    width = 600,
    height = 300,
    showLabels = false,
    cursorIndex = 0,
    inputStatus = 'waiting',
    onLayout,
    isDarkMode = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const prevPositionsRef = useRef<number[] | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous SVG
        containerRef.current.innerHTML = '';

        // Create Renderer
        const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
        renderer.resize(width, height);
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
        const staveWidth = width - 40;

        // Treble Stave

        const trebleStave = new VF.Stave(startX, startY, staveWidth);
        trebleStave.addClef("treble");

        // Ensure stave lines match theme
        // VexFlow Stave styling is tricky, we can set context prop before drawing
        trebleStave.setContext(context).draw();


        // Bass Stave

        const bassStave = new VF.Stave(startX, startY + 100, staveWidth);
        bassStave.addClef("bass");
        bassStave.setContext(context).draw();


        // Connectors (Brace + Lines)
        new VF.StaveConnector(trebleStave, bassStave).setType(VF.StaveConnector.type.BRACE).setContext(context).draw();
        new VF.StaveConnector(trebleStave, bassStave).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(context).draw();
        new VF.StaveConnector(trebleStave, bassStave).setType(VF.StaveConnector.type.SINGLE_RIGHT).setContext(context).draw();

        // -----------------------------------------------------------------------
        // Create Voices
        // -----------------------------------------------------------------------
        const createVoice = (notesData: StaveNoteData[], clef: string) => {
            const notes = notesData.map((n, i) => {
                const staveNote = new VF.StaveNote({
                    clef: clef,
                    keys: n.keys,
                    duration: n.duration,
                });

                // Apply Theme Styles (Default notes)
                staveNote.setStyle({ fillStyle: foregroundColor, strokeStyle: foregroundColor });

                if (cursorIndex !== undefined) {
                    if (i === cursorIndex) {
                        // Color current note based on input status
                        let color = "#3b82f6"; // Default Blue (Waiting)
                        if (inputStatus === 'correct') color = "#22c55e"; // Green
                        if (inputStatus === 'incorrect') color = "#ef4444"; // Red
                        if (inputStatus === 'perfect') color = "#FFD700"; // Gold

                        staveNote.setStyle({ fillStyle: color, strokeStyle: color });
                    } else if (i < cursorIndex) {
                        staveNote.setStyle({ fillStyle: "#9ca3af", strokeStyle: "#9ca3af" }); // Gray 400
                    }
                }

                if (showLabels) {
                    n.keys.forEach((key, index) => {
                        const noteName = key.split('/')[0].toUpperCase();
                        staveNote.addModifier(
                            new VF.Annotation(noteName)
                                .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM)
                                .setFont("Arial", 10, "")
                            , index
                        );
                    });
                }
                return staveNote;
            });

            // Calculate total beats to satisfy VexFlow
            const totalBeats = notesData.reduce((sum, current) => {
                const durStr = current.duration.replace('r', '');
                let beats = 1; // 'q'
                if (durStr === 'h') beats = 2;
                if (durStr === 'w') beats = 4;
                if (durStr === '8') beats = 0.5;
                if (durStr === '16') beats = 0.25;
                return sum + beats;
            }, 0);

            // VexFlow requires exact capacity. We use 4/4 time (beat_value 4), so num_beats is just total quarter notes
            const voice = new VF.Voice({ num_beats: Math.ceil(totalBeats), beat_value: 4 });
            voice.setStrict(false); // Allowing some flexibility prevents strict tick crashes when randomly generated
            voice.addTickables(notes);
            return voice;
        };

        const trebleVoice = createVoice(trebleNotes, "treble");
        const bassVoice = createVoice(bassNotes, "bass");

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
        const tickables = trebleVoice.getTickables();
        const positions = tickables.map(t => (t as any).getAbsoluteX());

        const svgElement = containerRef.current?.querySelector('svg');
        if (svgElement) {
            const oldCustom = svgElement.querySelectorAll('.custom-watermark');
            oldCustom.forEach(el => el.remove());

            const keyText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            keyText.textContent = "C Major";
            keyText.setAttribute("class", "custom-watermark");
            keyText.setAttribute("x", (width / 2).toString());
            keyText.setAttribute("y", (height / 2).toString());
            keyText.setAttribute("fill", isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(59, 130, 246, 0.04)");
            keyText.setAttribute("font-size", "64");
            keyText.setAttribute("font-weight", "900");
            keyText.setAttribute("text-anchor", "middle");
            keyText.setAttribute("transform", `rotate(-12, ${width / 2}, ${height / 2})`);
            keyText.setAttribute("pointer-events", "none");
            svgElement.insertBefore(keyText, svgElement.firstChild);

            const noteColors: Record<string, string> = {
                'C': 'rgba(239, 68, 68, 0.06)',
                'D': 'rgba(249, 115, 22, 0.06)',
                'E': 'rgba(234, 179, 8, 0.06)',
                'F': 'rgba(16, 185, 129, 0.06)',
                'G': 'rgba(59, 130, 246, 0.06)',
                'A': 'rgba(99, 102, 241, 0.06)',
                'B': 'rgba(168, 85, 247, 0.06)'
            };

            const getTrebleY = (key: string) => {
                const [note, octaveStr] = key.split('/');
                const octave = parseInt(octaveStr);
                const noteMap: Record<string, number> = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 };
                const noteVal = noteMap[note.toLowerCase()[0]] ?? 0;
                const diatonic = noteVal + octave * 7;
                const stepDiff = diatonic - 34;
                return 65 - stepDiff * 5;
            };

            const getBassY = (key: string) => {
                const [note, octaveStr] = key.split('/');
                const octave = parseInt(octaveStr);
                const noteMap: Record<string, number> = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 };
                const noteVal = noteMap[note.toLowerCase()[0]] ?? 0;
                const diatonic = noteVal + octave * 7;
                const stepDiff = diatonic - 22;
                return 165 - stepDiff * 5;
            };

            positions.forEach((x, i) => {
                const tNote = trebleNotes[i];
                const bNote = bassNotes[i];

                const firstTrebleKey = tNote?.keys[0];
                if (firstTrebleKey && !firstTrebleKey.includes('r') && firstTrebleKey !== 'b/4') {
                    const noteLetter = firstTrebleKey.split('/')[0][0].toUpperCase();
                    const laneColor = noteColors[noteLetter];

                    const lane = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    lane.setAttribute("class", "custom-watermark");
                    lane.setAttribute("x", (x - 10).toString());
                    lane.setAttribute("y", "20");
                    lane.setAttribute("width", "20");
                    lane.setAttribute("height", "180");
                    lane.setAttribute("rx", "4");
                    lane.setAttribute("fill", laneColor || "rgba(0,0,0,0.02)");
                    lane.setAttribute("pointer-events", "none");
                    svgElement.insertBefore(lane, svgElement.firstChild);
                }

                if (showLabels) {
                    if (tNote && tNote.keys && tNote.keys[0] !== 'b/4') {
                        tNote.keys.forEach(k => {
                            const noteName = k.split('/')[0].toUpperCase();
                            const y = getTrebleY(k);

                            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            label.setAttribute("class", "custom-watermark");
                            label.textContent = noteName.replace(/#/g, '♯').replace(/b/g, '♭');
                            label.setAttribute("x", x.toString());
                            label.setAttribute("y", (y + 8).toString());
                            label.setAttribute("fill", isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(59, 130, 246, 0.2)");
                            label.setAttribute("font-family", "Outfit, sans-serif");
                            label.setAttribute("font-weight", "900");
                            label.setAttribute("font-size", "24");
                            label.setAttribute("text-anchor", "middle");
                            label.setAttribute("pointer-events", "none");
                            svgElement.insertBefore(label, svgElement.firstChild);
                        });
                    }

                    if (bNote && bNote.keys && bNote.keys[0] !== 'd/3') {
                        bNote.keys.forEach(k => {
                            const noteName = k.split('/')[0].toUpperCase();
                            const y = getBassY(k);

                            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            label.setAttribute("class", "custom-watermark");
                            label.textContent = noteName.replace(/#/g, '♯').replace(/b/g, '♭');
                            label.setAttribute("x", x.toString());
                            label.setAttribute("y", (y + 8).toString());
                            label.setAttribute("fill", isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(59, 130, 246, 0.2)");
                            label.setAttribute("font-family", "Outfit, sans-serif");
                            label.setAttribute("font-weight", "900");
                            label.setAttribute("font-size", "24");
                            label.setAttribute("text-anchor", "middle");
                            label.setAttribute("pointer-events", "none");
                            svgElement.insertBefore(label, svgElement.firstChild);
                        });
                    }
                }
            });
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

    }, [trebleNotes, bassNotes, width, height, showLabels, cursorIndex, inputStatus, isDarkMode, onLayout]);

    return <div ref={containerRef} className="w-full h-full flex justify-center items-center relative" style={{ backgroundColor: isDarkMode ? '' : 'white' }} />;
};
