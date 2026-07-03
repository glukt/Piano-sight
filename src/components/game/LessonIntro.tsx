import React from 'react';
import { Lesson } from '../../utils/music/CourseData';

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

const KeyboardGuide: React.FC<{ handPosition?: string }> = ({ handPosition }) => {
    if (!handPosition || !POSITION_MAPS[handPosition]) return null;
    const highlights = POSITION_MAPS[handPosition];

    const whiteKeys = [
        { note: 'f/2', label: 'F2' }, { note: 'g/2', label: 'G2' }, { note: 'a/2', label: 'A2' }, { note: 'b/2', label: 'B2' },
        { note: 'c/3', label: 'C3' }, { note: 'd/3', label: 'D3' }, { note: 'e/3', label: 'E3' }, { note: 'f/3', label: 'F3' }, { note: 'g/3', label: 'G3' }, { note: 'a/3', label: 'A3' }, { note: 'b/3', label: 'B3' },
        { note: 'c/4', label: 'C4' }, { note: 'd/4', label: 'D4' }, { note: 'e/4', label: 'E4' }, { note: 'f/4', label: 'F4' }, { note: 'g/4', label: 'G4' }, { note: 'a/4', label: 'A4' }, { note: 'b/4', label: 'B4' },
        { note: 'c/5', label: 'C5' }, { note: 'd/5', label: 'D5' }, { note: 'e/5', label: 'E5' }, { note: 'f/5', label: 'F5' }, { note: 'g/5', label: 'G5' }
    ];

    const blackKeys = [
        { note: 'f#/2', x: 13 }, { note: 'g#/2', x: 31 }, { note: 'a#/2', x: 49 },
        { note: 'c#/3', x: 85 }, { note: 'd#/3', x: 103 }, { note: 'f#/3', x: 139 }, { note: 'g#/3', x: 157 }, { note: 'a#/3', x: 175 },
        { note: 'c#/4', x: 211 }, { note: 'd#/4', x: 229 }, { note: 'f#/4', x: 265 }, { note: 'g#/4', x: 283 }, { note: 'a#/4', x: 301 },
        { note: 'c#/5', x: 337 }, { note: 'd#/5', x: 355 }, { note: 'f#/5', x: 391 }
    ];

    return (
        <div className="flex flex-col items-center justify-center p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-3">
                Keyboard Starting Hand Setup
            </h4>
            <div className="relative select-none overflow-x-auto max-w-full pb-2">
                <svg width="414" height="85" className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                    {whiteKeys.map((wk, idx) => {
                        const highlight = highlights[wk.note];
                        const isMiddleC = wk.note === 'c/4';
                        let fillClass = "fill-white dark:fill-gray-800";
                        if (highlight) {
                            fillClass = highlight.hand === 'RH' ? "fill-blue-50 dark:fill-blue-900/20" : "fill-emerald-50 dark:fill-emerald-900/20";
                        } else if (isMiddleC) {
                            fillClass = "fill-red-50/30 dark:fill-red-950/10";
                        }
                        return (
                            <g key={wk.note}>
                                <rect x={idx * 18} y="0" width="18" height="70" className={`${fillClass} stroke-gray-200 dark:stroke-gray-700`} />
                                {isMiddleC && <line x1={idx * 18} y1="67" x2={(idx + 1) * 18} y2="67" className="stroke-red-500 stroke-[2px]" />}
                                <text x={idx * 18 + 9} y="79" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[8px] font-bold">
                                    {isMiddleC ? "Mid C" : wk.label}
                                </text>
                                {highlight && (
                                    <>
                                        <circle cx={idx * 18 + 9} cy="48" r="6" className={highlight.hand === 'RH' ? "fill-blue-500" : "fill-emerald-500"} />
                                        <text x={idx * 18 + 9} y="51" textAnchor="middle" className="fill-white text-[8px] font-black">{highlight.finger}</text>
                                    </>
                                )}
                            </g>
                        );
                    })}
                    {blackKeys.map((bk) => {
                        const highlight = highlights[bk.note];
                        let fillClass = "fill-gray-800 dark:fill-gray-950";
                        if (highlight) {
                            fillClass = highlight.hand === 'RH' ? "fill-blue-600" : "fill-emerald-600";
                        }
                        return (
                            <g key={bk.note}>
                                <rect x={bk.x} y="0" width="10" height="40" className={`${fillClass} stroke-black`} rx="1" />
                                {highlight && (
                                    <>
                                        <circle cx={bk.x + 5} cy="28" r="4.5" className="fill-white" />
                                        <text x={bk.x + 5} y="31.5" textAnchor="middle" className={`text-[7px] font-black ${highlight.hand === 'RH' ? 'fill-blue-600' : 'fill-emerald-600'}`}>{highlight.finger}</text>
                                    </>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex gap-4 mt-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Right Hand (RH)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Left Hand (LH)
                </span>
            </div>
        </div>
    );
};

interface LessonIntroProps {
    lesson: Lesson;
    onStart: () => void;
    onBack: () => void;
}

export const LessonIntro: React.FC<LessonIntroProps> = ({ lesson, onStart, onBack }) => {
    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
                    <h2 className="text-3xl font-black tracking-tight mb-2">{lesson.name}</h2>
                    <p className="text-blue-100 font-medium">{lesson.description}</p>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col gap-8">
                    {/* Goal Area */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">🎯</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Your Objective</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                    {lesson.instruction}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Hand Setup Guide */}
                    {lesson.handPosition && (
                        <KeyboardGuide handPosition={lesson.handPosition} />
                    )}

                    {/* Focus Area */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-800">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">💡</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Focus Point</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                    {lesson.focus}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-8 py-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                            <span className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Reward</span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">+{lesson.xpReward} XP</span>
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Hands</span>
                            <span className="text-2xl font-black text-gray-800 dark:text-gray-200 capitalize">{lesson.topic}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onBack}
                            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all"
                        >
                            Back to Courses
                        </button>
                        <button
                            onClick={onStart}
                            className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                        >
                            Start Lesson 🎹
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
