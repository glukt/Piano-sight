import React from 'react';
import { PracticeModeType } from '../hooks/usePracticeMode';

interface PracticeOverlayProps {
    practiceMode: PracticeModeType;
    practiceSection: { startMeasure: number; endMeasure: number };
    practiceFeedback: string | null;
    onReplay: () => void;
    onNext: () => void;
    onPrev?: () => void;
    onExit: () => void;
    onModeChange?: (mode: PracticeModeType) => void;
}

export const PracticeOverlay: React.FC<PracticeOverlayProps> = ({
    practiceMode,
    practiceSection,
    practiceFeedback,
    onReplay,
    onNext,
    onPrev,
    onExit,
    onModeChange
}) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-32 w-auto md:w-80 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-white border border-slate-700/50 p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
            {/* Header / Info Section */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Practice Mode</span>
                    <span className={`font-black text-sm uppercase tracking-wider ${
                        practiceMode === 'wait' ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                        {practiceMode === 'play' ? 'Play & Grade' : `${practiceMode} Mode`}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Measures</span>
                    <span className="font-mono font-bold text-sm bg-slate-800/60 px-2 py-0.5 rounded text-sky-400">
                        {practiceSection.startMeasure + 1} – {practiceSection.endMeasure}
                    </span>
                </div>
            </div>

            {/* Mode Switch Selector */}
            <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/30 w-full justify-between items-center text-[10px]">
                {(['preview', 'wait', 'play'] as const).map(m => {
                    const isActive = practiceMode === m;
                    return (
                        <button
                            key={m}
                            onClick={() => onModeChange?.(m)}
                            className={`flex-grow py-1.5 font-black rounded-lg uppercase tracking-wider transition-all select-none ${
                                isActive
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'text-slate-450 hover:text-slate-200'
                            }`}
                        >
                            {m === 'play' ? 'Play' : m}
                        </button>
                    );
                })}
            </div>

            {/* Live Feedback Message */}
            <div className="min-h-12 flex items-center justify-center text-center bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-800/30">
                <span className="text-sm font-semibold text-slate-200 drop-shadow-sm">
                    {practiceFeedback || "Play the notes on screen to advance!"}
                </span>
            </div>

            {/* Action Button Row */}
            <div className="flex gap-2 justify-between items-center">
                {/* Previous Section */}
                <button
                    onClick={onPrev}
                    disabled={!onPrev || practiceSection.startMeasure === 0}
                    className="p-2.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 rounded-xl transition-all duration-150 active:scale-95 border border-slate-700/40"
                    title="Previous Section"
                >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </button>

                {/* Replay Section */}
                <button
                    onClick={onReplay}
                    className="flex-grow py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 border border-slate-700/40 flex items-center justify-center gap-1.5"
                >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-3.2"/>
                    </svg>
                    Restart
                </button>

                {/* Next Section */}
                <button
                    onClick={onNext}
                    className="flex-grow py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1"
                >
                    Next
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                </button>

                {/* Exit Practice */}
                <button
                    onClick={onExit}
                    className="p-2.5 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/50 text-slate-300 rounded-xl transition-all duration-150 active:scale-95 border border-slate-700/40"
                    title="Exit Practice"
                >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};
