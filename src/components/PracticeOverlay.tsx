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
    playModeStarted?: boolean;
    countdown?: number | null;
    onStartPlayMode?: () => void;
    totalMeasures?: number;
    onChangeSection?: (section: { startMeasure: number; endMeasure: number }) => void;
    loopSection?: boolean;
    onToggleLoopSection?: (val: boolean) => void;
    autoPreview?: boolean;
    onToggleAutoPreview?: (val: boolean) => void;
}

export const PracticeOverlay: React.FC<PracticeOverlayProps> = ({
    practiceMode,
    practiceSection,
    practiceFeedback,
    onReplay,
    onNext,
    onPrev,
    onExit,
    onModeChange,
    playModeStarted = false,
    countdown = null,
    onStartPlayMode,
    totalMeasures = 0,
    onChangeSection,
    loopSection = true,
    onToggleLoopSection,
    autoPreview = true,
    onToggleAutoPreview
}) => {
    const [isEditingRange, setIsEditingRange] = React.useState(false);
    const [tempStart, setTempStart] = React.useState(practiceSection.startMeasure + 1);
    const [tempEnd, setTempEnd] = React.useState(practiceSection.endMeasure);

    React.useEffect(() => {
        setTempStart(practiceSection.startMeasure + 1);
        setTempEnd(practiceSection.endMeasure);
    }, [practiceSection]);

    const handleApplyRange = () => {
        const start = Math.max(0, tempStart - 1);
        const end = Math.min(totalMeasures, Math.max(start + 1, tempEnd));
        onChangeSection?.({ startMeasure: start, endMeasure: end });
        setIsEditingRange(false);
    };

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
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        Measures
                        {loopSection && onChangeSection && totalMeasures > 0 && (
                            <button
                                onClick={() => setIsEditingRange(!isEditingRange)}
                                className={`transition-all hover:text-sky-400 ${isEditingRange ? 'text-sky-400' : 'text-slate-500'}`}
                                title="Edit Practice Range"
                            >
                                ⚙️
                            </button>
                        )}
                    </span>
                    <span className="font-mono font-bold text-sm bg-slate-800/60 px-2 py-0.5 rounded text-sky-400">
                        {loopSection ? `${practiceSection.startMeasure + 1} – ${practiceSection.endMeasure}` : `All (1 – ${totalMeasures})`}
                    </span>
                </div>
            </div>

            {isEditingRange && onChangeSection && totalMeasures > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/50 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Start Measure:</span>
                        <input
                            type="number"
                            min="1"
                            max={tempEnd}
                            value={tempStart}
                            onChange={e => setTempStart(Math.max(1, Math.min(totalMeasures, parseInt(e.target.value) || 1)))}
                            className="w-12 bg-slate-800 border border-slate-700 text-white text-center rounded py-0.5 text-xs font-mono font-bold"
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>End Measure:</span>
                        <input
                            type="number"
                            min={tempStart}
                            max={totalMeasures}
                            value={tempEnd}
                            onChange={e => setTempEnd(Math.max(tempStart, Math.min(totalMeasures, parseInt(e.target.value) || totalMeasures)))}
                            className="w-12 bg-slate-800 border border-slate-700 text-white text-center rounded py-0.5 text-xs font-mono font-bold"
                        />
                    </div>
                    <button
                        onClick={handleApplyRange}
                        className="w-full mt-1 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-[11px] rounded-lg shadow transition-all duration-150 active:scale-95"
                    >
                        Apply Practice Range
                    </button>
                </div>
            )}

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

            {/* Range & Preview Settings */}
            {practiceMode !== 'play' && (
                <div className="flex gap-2 justify-between items-center text-[10px] bg-slate-950/20 p-1.5 rounded-xl border border-slate-800/40 w-full">
                    {/* Loop Section Toggle */}
                    <button
                        onClick={() => onToggleLoopSection?.(!loopSection)}
                        className={`flex-grow py-1.5 font-bold rounded-lg border transition-all duration-150 flex items-center justify-center gap-1.5 select-none ${
                            loopSection
                                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                                : 'bg-slate-800/40 border-slate-700/30 text-slate-450 hover:text-slate-200'
                        }`}
                        title={loopSection ? "Looping a 2-measure section" : "Practicing the whole song"}
                    >
                        <span>🔁</span> {loopSection ? "Section Loop" : "Whole Song"}
                    </button>

                    {/* Auto Preview Toggle */}
                    <button
                        onClick={() => onToggleAutoPreview?.(!autoPreview)}
                        className={`flex-grow py-1.5 font-bold rounded-lg border transition-all duration-150 flex items-center justify-center gap-1.5 select-none ${
                            autoPreview
                                ? 'bg-sky-600/20 border-sky-500/30 text-sky-300'
                                : 'bg-slate-800/40 border-slate-700/30 text-slate-450 hover:text-slate-200'
                        }`}
                        title={autoPreview ? "Auto preview plays section twice before wait mode" : "Auto preview is disabled"}
                    >
                        <span>🎧</span> Preview: {autoPreview ? "ON" : "OFF"}
                    </button>
                </div>
            )}

            {/* Live Feedback Message */}
            <div className="min-h-12 flex items-center justify-center text-center bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-800/30">
                <span className="text-sm font-semibold text-slate-200 drop-shadow-sm">
                    {practiceFeedback || "Play the notes on screen to advance!"}
                </span>
            </div>

            {/* Action Button Row */}
            {practiceMode === 'play' ? (
                <div className="flex gap-2 justify-between items-center w-full">
                    {!playModeStarted && countdown === null ? (
                        <button
                            onClick={onStartPlayMode}
                            className="flex-grow py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black transition-all duration-150 active:scale-95 shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Start Grading
                        </button>
                    ) : (
                        <button
                            onClick={onReplay}
                            disabled={countdown !== null}
                            className="flex-grow py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 border border-slate-700/40 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-3.2"/>
                            </svg>
                            Restart
                        </button>
                    )}

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
            ) : (
                <div className="flex gap-2 justify-between items-center">
                    {/* Previous Section */}
                    {loopSection && (
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
                    )}

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
                    {loopSection && (
                        <button
                            onClick={onNext}
                            className="flex-grow py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1"
                        >
                            Next
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                            </svg>
                        </button>
                    )}

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
            )}
        </div>
    );
};
