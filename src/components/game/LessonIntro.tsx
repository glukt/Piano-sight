import React from 'react';
import { Lesson } from '../../utils/music/CourseData';

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
