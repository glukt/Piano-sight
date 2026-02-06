import React, { useEffect, useRef } from 'react';
import Vex from 'vexflow';

interface MusicDisplayProps {
    notes?: { keys: string[]; duration: string }[];
    width?: number;
    height?: number;
}

const VF = Vex.Flow;

export const MusicDisplay: React.FC<MusicDisplayProps> = ({
    notes = [{ keys: ["c/4"], duration: "q" }],
    width = 500,
    height = 200
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

        // Create Stave
        // Measure 1
        const stave = new VF.Stave(10, 40, width - 20);
        stave.addClef("treble").addTimeSignature("4/4");
        stave.setContext(context).draw();

        // Create Notes
        const vexNotes = notes.map(n => new VF.StaveNote({
            keys: n.keys,
            duration: n.duration,
        }));

        // Create Voice
        const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(vexNotes);

        // Format and justify
        new VF.Formatter().joinVoices([voice]).format([voice], width - 50);

        // Render voice
        voice.draw(context, stave);

    }, [notes, width, height]);

    return <div ref={containerRef} className="bg-white p-4 rounded shadow" />;
};
