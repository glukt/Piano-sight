import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';

export interface StaveNoteData {
    keys: string[];
    duration: string;
    tied?: boolean;
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
    'RH_B_POS': {
        'b/3': { hand: 'RH', finger: 1 },
        'c/4': { hand: 'RH', finger: 2 },
        'd/4': { hand: 'RH', finger: 3 },
        'e/4': { hand: 'RH', finger: 4 },
        'f/4': { hand: 'RH', finger: 5 }
    },
    'LH_B_POS': {
        'b/2': { hand: 'LH', finger: 5 },
        'c/3': { hand: 'LH', finger: 4 },
        'd/3': { hand: 'LH', finger: 3 },
        'e/3': { hand: 'LH', finger: 2 },
        'f/3': { hand: 'LH', finger: 1 }
    },
    'RH_G_POS': {
        'g/4': { hand: 'RH', finger: 1 },
        'a/4': { hand: 'RH', finger: 2 },
        'b/4': { hand: 'RH', finger: 3 },
        'c/5': { hand: 'RH', finger: 4 },
        'd/5': { hand: 'RH', finger: 5 }
    },
    'LH_G_POS': {
        'g/2': { hand: 'LH', finger: 5 },
        'a/2': { hand: 'LH', finger: 4 },
        'b/2': { hand: 'LH', finger: 3 },
        'c/3': { hand: 'LH', finger: 2 },
        'd/3': { hand: 'LH', finger: 1 }
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

const KEY_SIGNATURE_MAP: Record<string, string> = {
    'C': 'C Major', 'G': 'G Major', 'D': 'D Major', 'A': 'A Major', 'E': 'E Major', 'B': 'B Major', 'F#': 'F# Major',
    'F': 'F Major', 'Bb': 'Bb Major', 'Eb': 'Eb Major', 'Ab': 'Ab Major', 'Db': 'Db Major', 'Gb': 'Gb Major',
    'Am': 'A Minor', 'Em': 'E Minor', 'Bm': 'B Minor', 'Dm': 'D Minor', 'Gm': 'G Minor', 'Cm': 'C Minor'
};

interface LocalAlignedStep {
    trebleNoteIndex: number | null;
    bassNoteIndex: number | null;
}

const getChordName = (keys: string[]): string | null => {
    if (keys.length < 3) return null;
    const noteNames = keys.map(k => k.split('/')[0].toLowerCase());
    const notesSet = new Set(noteNames);
    const has = (n: string) => notesSet.has(n);

    if (has('c') && has('e') && has('g')) return "C";
    if (has('d') && has('f') && has('a')) return "Dm";
    if (has('e') && has('g') && has('b')) return "Em";
    if (has('f') && has('a') && has('c')) return "F";
    if (has('g') && has('b') && has('d')) {
        if (has('f')) return "G7";
        return "G";
    }
    if (has('a') && has('c') && has('e')) return "Am";
    if (has('b') && has('d') && has('f')) return "Bdim";
    if (has('b') && has('f') && has('g')) return "G7";
    if (has('g') && has('b') && has('f')) return "G7";

    return null;
};

const getDurationInBeats = (durationStr: string): number => {
    const clean = durationStr.replace('r', '');
    const isDotted = clean.endsWith('.');
    const base = isDotted ? clean.slice(0, -1) : clean;
    let beats = 1;
    if (base === 'w') beats = 4;
    else if (base === 'h') beats = 2;
    else if (base === 'q') beats = 1;
    else if (base === '8') beats = 0.5;
    else if (base === '16') beats = 0.25;
    return isDotted ? beats * 1.5 : beats;
};

const localAlignNotes = (treble: StaveNoteData[], bass: StaveNoteData[]): LocalAlignedStep[] => {
    let tTime = 0;
    const trebleEvents = treble.map((note, index) => {
        const onset = tTime;
        const dur = getDurationInBeats(note.duration);
        tTime += dur;
        return { index, onset, dur };
    });

    let bTime = 0;
    const bassEvents = bass.map((note, index) => {
        const onset = bTime;
        const dur = getDurationInBeats(note.duration);
        bTime += dur;
        return { index, onset, dur };
    });

    const onsetsSet = new Set<number>();
    trebleEvents.forEach(e => onsetsSet.add(e.onset));
    bassEvents.forEach(e => onsetsSet.add(e.onset));
    const uniqueOnsets = Array.from(onsetsSet).sort((a, b) => a - b);

    const aligned: LocalAlignedStep[] = [];
    for (let i = 0; i < uniqueOnsets.length; i++) {
        const t = uniqueOnsets[i];
        const tEvent = trebleEvents.find(e => t >= e.onset && t < e.onset + e.dur);
        const bEvent = bassEvents.find(e => t >= e.onset && t < e.onset + e.dur);

        aligned.push({
            trebleNoteIndex: tEvent ? tEvent.index : null,
            bassNoteIndex: bEvent ? bEvent.index : null
        });
    }
    return aligned;
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
        const padNotes = (notesData: StaveNoteData[], targetDuration: number, clef: string, timeSignature: string = "4/4"): StaveNoteData[] => {
            let currentDuration = calculateDuration(notesData);
            if (Math.abs(currentDuration - targetDuration) < 0.01) {
                return [...notesData];
            }

            let paddedNotes = [...notesData];
            let remaining = targetDuration - currentDuration;
            const restKey = clef === 'bass' ? "d/3" : "b/4";

            const parts = timeSignature.split('/');
            const beatsPerMeasure = Number(parts[0]) || 4;
            const beatValue = Number(parts[1]) || 4;
            const measureDuration = beatsPerMeasure * (4 / beatValue);

            if (measureDuration === 3) {
                while (remaining >= 3) {
                    paddedNotes.push({ keys: [restKey], duration: "h.r" });
                    remaining -= 3;
                }
            } else {
                while (remaining >= 4) {
                    paddedNotes.push({ keys: [restKey], duration: "wr" });
                    remaining -= 4;
                }
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
                const baseDuration = n.duration.replace('.', '');
                const staveNote = new VF.StaveNote({
                    clef: clef,
                    keys: n.keys,
                    duration: baseDuration,
                });

                if (n.duration.includes('.')) {
                    n.keys.forEach((_, keyIndex) => {
                        staveNote.addModifier(new VF.Dot(), keyIndex);
                    });
                }

                // Add Accidental Modifiers explicitly to draw sharps and flats
                n.keys.forEach((key, keyIndex) => {
                    const parts = key.split('/');
                    const noteName = parts[0];
                    const accidental = noteName.slice(1);
                    if (accidental === '#' || accidental === 'b' || accidental === '##' || accidental === 'bb' || accidental === 'n') {
                        staveNote.addModifier(new VF.Accidental(accidental), keyIndex);
                    }
                });

                // Add Chord Name Annotations
                if (n.keys.length >= 3) {
                    const chordName = getChordName(n.keys);
                    if (chordName) {
                        const justify = clef === 'bass' ? VF.Annotation.VerticalJustify.BOTTOM : VF.Annotation.VerticalJustify.TOP;
                        staveNote.addModifier(
                            new VF.Annotation(chordName)
                                .setFont("sans-serif", 10, "bold")
                                .setVerticalJustification(justify),
                            0
                        );
                    }
                }

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
        const finalTrebleNotes = padNotes(trebleNotes, targetDuration, "treble", timeSignature);
        const finalBassNotes = padNotes(bassNotes, targetDuration, "bass", timeSignature);
        // --- Padding Logic End ---


        const trebleVoice = createVoice(finalTrebleNotes, "treble");
        const bassVoice = createVoice(finalBassNotes, "bass");

        // -----------------------------------------------------------------------
        // Format & Draw
        // -----------------------------------------------------------------------
        new VF.Formatter()
            .joinVoices([trebleVoice, bassVoice])
            .format([trebleVoice, bassVoice], staveWidth - 50);

        const trebleTickables = trebleVoice.getTickables();
        const bassTickables = bassVoice.getTickables();

        trebleVoice.draw(context, trebleStave);
        bassVoice.draw(context, bassStave);

        // Draw ties connecting adjacent notes
        const trebleTies: any[] = [];
        finalTrebleNotes.forEach((n, i) => {
            const isCurrentRest = n.duration.endsWith('r');
            const isNextRest = finalTrebleNotes[i + 1]?.duration.endsWith('r');
            if (n.tied && i < trebleTickables.length - 1 && !isCurrentRest && !isNextRest) {
                const indices = n.keys.map((_, keyIdx) => keyIdx);
                const tie = new VF.StaveTie({
                    first_note: trebleTickables[i] as any,
                    last_note: trebleTickables[i + 1] as any,
                    first_indices: indices,
                    last_indices: indices
                });
                trebleTies.push(tie);
            }
        });
        trebleTies.forEach(t => t.setContext(context).draw());

        const bassTies: any[] = [];
        finalBassNotes.forEach((n, i) => {
            const isCurrentRest = n.duration.endsWith('r');
            const isNextRest = finalBassNotes[i + 1]?.duration.endsWith('r');
            if (n.tied && i < bassTickables.length - 1 && !isCurrentRest && !isNextRest) {
                const indices = n.keys.map((_, keyIdx) => keyIdx);
                const tie = new VF.StaveTie({
                    first_note: bassTickables[i] as any,
                    last_note: bassTickables[i + 1] as any,
                    first_indices: indices,
                    last_indices: indices
                });
                bassTies.push(tie);
            }
        });
        bassTies.forEach(t => t.setContext(context).draw());


        // -----------------------------------------------------------------------
        // Extract Layout (for external synchronization)
        // -----------------------------------------------------------------------
        // -----------------------------------------------------------------------
        // Extract Layout & Draw Custom Watermarks
        // -----------------------------------------------------------------------
        const treblePositions = trebleTickables.map(t => (t as any).getAbsoluteX());
        const bassPositions = bassTickables.map(t => (t as any).getAbsoluteX());

        const displaySteps = localAlignNotes(finalTrebleNotes, finalBassNotes);
        const positions = displaySteps.map(step => {
            if (step.trebleNoteIndex !== null && treblePositions[step.trebleNoteIndex] !== undefined) {
                return treblePositions[step.trebleNoteIndex];
            }
            if (step.bassNoteIndex !== null && bassPositions[step.bassNoteIndex] !== undefined) {
                return bassPositions[step.bassNoteIndex];
            }
            return 20; // Fallback
        });

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

    const targetScrollLeftRef = useRef<number>(0);

    // Scroll active note into center of the viewport (update target position)
    useEffect(() => {
        if (!scrollContainerRef.current || !prevPositionsRef.current || cursorIndex === undefined) return;
        const noteX = prevPositionsRef.current[cursorIndex];
        if (noteX === undefined) return;

        const container = scrollContainerRef.current;
        const containerWidth = container.clientWidth;
        const scrollTarget = noteX - containerWidth / 2;
        const maxScroll = container.scrollWidth - containerWidth;

        targetScrollLeftRef.current = Math.max(0, Math.min(scrollTarget, maxScroll));
    }, [cursorIndex]);

    // LERP animation frame loop for smooth scroll tracking
    useEffect(() => {
        let animationFrameId: number;

        const lerpScroll = () => {
            const container = scrollContainerRef.current;
            if (container) {
                const diff = targetScrollLeftRef.current - container.scrollLeft;
                if (Math.abs(diff) > 0.5) {
                    if (diff < -100 || diff > 300) {
                        container.scrollLeft = targetScrollLeftRef.current; // Snappy return
                    } else {
                        container.scrollLeft += diff * 0.15; // LERP tracking factor
                    }
                }
            }
            animationFrameId = requestAnimationFrame(lerpScroll);
        };

        animationFrameId = requestAnimationFrame(lerpScroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
            {/* Floating Scale Pill Badge */}
            <div className="absolute top-3 right-3 px-3 py-1 bg-blue-50/90 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full font-bold text-xs shadow-sm border border-blue-100 dark:border-blue-900/50 flex items-center gap-1.5 pointer-events-none select-none z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>🎵 {keySignature ? (KEY_SIGNATURE_MAP[keySignature] || `${keySignature} Key`) : 'C Major'}</span>
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
