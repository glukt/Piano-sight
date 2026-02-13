import React from 'react';
import { PracticeModeType } from '../hooks/usePracticeMode';

interface PracticeOverlayProps {
    practiceMode: PracticeModeType;
    practiceSection: { startMeasure: number; endMeasure: number };
    practiceFeedback: string | null;
    onReplay: () => void;
    onNext: () => void;
    onExit: () => void;
}

export const PracticeOverlay: React.FC<PracticeOverlayProps> = ({
    practiceMode,
    practiceSection,
    practiceFeedback,
    onReplay,
    onNext,
    onExit
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-900/90 backdrop-blur-md text-white border-t border-indigo-500 p-4 shadow-2xl z-50 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Mode</span>
                    <span className={`font-bold text-lg ${practiceMode === 'wait' ? 'text-yellow-400' : 'text-green-400'}`}>{practiceMode.toUpperCase()}</span>
                </div>
                <div className="h-8 w-px bg-indigo-700"></div>
                <div className="flex flex-col">
                    <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Section</span>
                    <span className="font-mono text-lg">{practiceSection.startMeasure + 1}-{practiceSection.endMeasure}</span>
                </div>
                <div className="h-8 w-px bg-indigo-700"></div>
                <div className="text-xl font-medium px-4">
                    {practiceFeedback}
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onReplay}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-sm font-bold shadow-lg transition"
                >
                    ↺ Replay
                </button>
                <button
                    onClick={onNext}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold shadow-lg transition"
                >
                    Next ➜
                </button>
                <button
                    onClick={onExit}
                    className="p-2 hover:bg-white/10 rounded-full transition ml-2"
                    title="Exit Practice"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};
