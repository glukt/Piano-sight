import React from 'react';

interface WatermarkLayerProps {
    visible: boolean;
    scale?: string[]; // e.g., ["C", "D", "E", "F", "G", "A", "B"]
    overlayText?: string;
}

export const WatermarkLayer: React.FC<WatermarkLayerProps> = ({
    visible,
    scale = ["C", "D", "E", "F", "G", "A", "B"],
    overlayText
}) => {
    if (!visible) return null;

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* Background Scale Markers (Abstract representation) */}
            <div className="absolute inset-0 opacity-10 flex justify-around w-full h-full">
                {/* Render vertical bars for scale degrees? Or just a subtle texture */}
                {scale.map((_, i) => (
                    <div key={i} className="h-full w-px bg-blue-500" />
                ))}
            </div>

            {/* Large Overlay Text (Key Signature or Learning Aid) */}
            {overlayText && (
                <div className="text-9xl font-black text-blue-900 opacity-5 rotate-12 select-none">
                    {overlayText}
                </div>
            )}

            {/* Note Labels Overlay - intended to align with stave eventually */}
            {/* This requires precise coordination with VexFlow, currently just a placeholder visual */}
        </div>
    );
};
