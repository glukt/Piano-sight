import React from 'react';
import { courses, Lesson } from '../../utils/music/CourseData';

interface CourseSelectionProps {
    userXp: number;
    onSelectLesson: (lesson: Lesson) => void;
    onBack?: () => void;
}

export const CourseSelection: React.FC<CourseSelectionProps> = ({ userXp, onSelectLesson, onBack }) => {
    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Piano Path</h1>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Close
                    </button>
                )}
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Follow the curriculum to learn piano step-by-step. Earn XP to unlock advanced lessons and master new techniques.
            </p>

            <div className="flex flex-col gap-12 mt-4">
                {courses.sort((a, b) => a.order - b.order).map(course => (
                    <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{course.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">{course.description}</p>
                            </div>

                            {/* Course Progress Bar */}
                            <div className="w-full md:w-64">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                    <span>Course Progress</span>
                                    <span>
                                        {Math.round(
                                            (course.lessons.filter((l, i) => {
                                                const nextLesson = course.lessons[i + 1];
                                                return nextLesson ? userXp >= nextLesson.requiredXp : userXp >= l.requiredXp + l.xpReward;
                                            }).length / course.lessons.length) * 100
                                        )}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${Math.round(
                                                (course.lessons.filter((l, i) => {
                                                    const nextLesson = course.lessons[i + 1];
                                                    return nextLesson ? userXp >= nextLesson.requiredXp : userXp >= l.requiredXp + l.xpReward;
                                                }).length / course.lessons.length) * 100
                                            )}%`
                                        }}>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {course.lessons.map((lesson, index) => {
                                const isUnlocked = userXp >= lesson.requiredXp;
                                const nextLesson = course.lessons[index + 1];
                                // A lesson is considered "completed" if the user has enough XP to unlock the *next* lesson in this course.
                                // If it's the last lesson, assume completed if user XP >= this lesson's requirement + its reward.
                                const isCompleted = nextLesson ? userXp >= nextLesson.requiredXp : userXp >= lesson.requiredXp + lesson.xpReward;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => {
                                            if (isUnlocked) onSelectLesson(lesson);
                                        }}
                                        disabled={!isUnlocked}
                                        className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200
                                            ${isCompleted
                                                ? 'border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/10 hover:border-green-300 dark:hover:border-green-700 cursor-pointer group'
                                                : isUnlocked
                                                    ? 'border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 hover:shadow-md cursor-pointer group shadow-[0_0_15px_rgba(79,70,229,0.1)]'
                                                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-black uppercase tracking-wider ${isCompleted ? 'text-green-600 dark:text-green-400' : isUnlocked ? 'text-indigo-500' : 'text-gray-400'}`}>
                                                Lesson {index + 1}
                                            </span>
                                            {isCompleted && (
                                                <span className="text-green-500 text-lg" title="Completed">
                                                    ✓
                                                </span>
                                            )}
                                            {!isUnlocked && (
                                                <span className="text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    🔒 {lesson.requiredXp} XP
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                            {lesson.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {lesson.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
