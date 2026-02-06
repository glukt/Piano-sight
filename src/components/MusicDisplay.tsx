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
}

const VF = Vex.Flow;

export const MusicDisplay: React.FC<MusicDisplayProps> = ({
    trebleNotes = [{ keys: ["c/4"], duration: "q" }],
    bassNotes = [{ keys: ["c/3"], duration: "q" }],
    width = 600,
    height = 300,
    showLabels = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous SVG
        containerRef.current.innerHTML = '';

        // Create Renderer
        const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
        renderer.resize(width, height);
        const context = renderer.getContext();

        // -----------------------------------------------------------------------
        // Create Staves
        // -----------------------------------------------------------------------
        const startX = 20;
        const startY = 40;
        const staveWidth = width - 40;

        // Treble Stave
        const trebleStave = new VF.Stave(startX, startY, staveWidth);
        trebleStave.addClef("treble"); // Removed explicit 4/4 to support variable lengths visually (or keep it if we want strict measures later)
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
            const notes = notesData.map(n => {
                const staveNote = new VF.StaveNote({
                    clef: clef,
                    keys: n.keys,
                    duration: n.duration,
                });

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
            const voice = new VF.Voice({ num_beats: notes.length, beat_value: 4 });
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
            .format([trebleVoice, bassVoice], staveWidth - 50);

        trebleVoice.draw(context, trebleStave);
        bassVoice.draw(context, bassStave);

    }, [trebleNotes, bassNotes, width, height, showLabels]);

    return <div ref={containerRef} className="bg-white p-4 rounded shadow flex justify-center" />;
};
