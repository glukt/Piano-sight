import React from 'react';
import { COURSES, Module, Lesson } from '../../utils/music/CourseData';

interface CourseSelectionProps {
    onSelectLesson: (lesson: Lesson) => void;
    onBack?: () => void;
    courseProgress: Record<string, { stars: number }>;
}

export const CourseSelection: React.FC<CourseSelectionProps> = ({ onSelectLesson, onBack, courseProgress }) => {

    const isLessonLocked = (lesson: Lesson) => {
        if (!lesson.requiredLessonId) return false;
        // Check if required lesson is completed (has stars > 0)
        return !courseProgress[lesson.requiredLessonId]?.stars;
    };

    const renderStars = (count: number) => { // Helper for star rendering
        return (
            <div className="flex gap-0.5 text-yellow-400">
                {[...Array(3)].map((_, i) => (
                    <span key={i} className={i < count ? "text-yellow-400" : "text-gray-600"}>★</span>
                ))}
            </div>
        );
    };
    return (
        <div className="w-full max-w-4xl mx-auto p-6 text-white animate-in fade-in duration-300">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                        Course Library
                    </h1>
                    <p className="text-gray-400">Master the piano, one step at a time.</p>
                </div>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                    >
                        Back to Practice
                    </button>
                )}
            </header>

            <div className="space-y-8">
                {COURSES.map((module: Module) => (
                    <div key={module.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-2 text-indigo-300">{module.title}</h2>
                        <p className="text-gray-400 mb-6">{module.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {module.lessons.map((lesson: Lesson) => {
                                const locked = isLessonLocked(lesson);
                                const stars = courseProgress[lesson.id]?.stars || 0;

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => !locked && onSelectLesson(lesson)}
                                        disabled={locked}
                                        className={`group relative flex flex-col items-start p-4 rounded-xl transition-all border border-transparent text-left
                                        ${locked
                                                ? 'bg-gray-800/30 border-gray-700 opacity-50 cursor-not-allowed grayscale'
                                                : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 hover:border-indigo-400 shadow-lg'
                                            }
                                    `}
                                    >
                                        {locked && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <span className="text-3xl filter drop-shadow-md">🔒</span>
                                            </div>
                                        )}

                                        <div className="flex w-full justify-between items-start mb-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${locked ? 'bg-gray-700 text-gray-500' : 'bg-indigo-900/50 text-indigo-300'}`}>
                                                {lesson.type.toUpperCase()}
                                            </span>
                                            {/* Stars */}
                                            {!locked && renderStars(stars)}
                                        </div>
                                        <h3 className={`text-lg font-bold mb-1 transition ${locked ? 'text-gray-500' : 'group-hover:text-indigo-200'}`}>{lesson.title}</h3>
                                        <p className="text-sm text-gray-400 line-clamp-2">{lesson.description}</p>

                                        {/* Difficulty Bar */}
                                        <div className="flex gap-1 mt-3 w-full opacity-75">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className={`h-1 flex-1 rounded-full ${i < lesson.difficulty ? (locked ? 'bg-gray-600' : 'bg-indigo-500') : 'bg-gray-700'}`} />
                                            ))}
                                        </div>
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
