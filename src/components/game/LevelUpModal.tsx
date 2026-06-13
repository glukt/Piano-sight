import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpModalProps {
    level: number | null;
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, onClose }) => {
    const [confetti, setConfetti] = useState<{ id: number; x: number; delay: number; color: string; duration: number; size: number }[]>([]);

    useEffect(() => {
        if (level !== null) {
            // Generate confetti particles
            const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            const particles = Array.from({ length: 80 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100, // percentage width
                delay: Math.random() * 2, // staggered delay
                color: colors[Math.floor(Math.random() * colors.length)],
                duration: 2 + Math.random() * 3, // fall duration
                size: 6 + Math.random() * 8, // size in px
            }));
            setConfetti(particles);

            // Optional: Play a Level Up sound!
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const now = audioCtx.currentTime;
                
                // Arpeggio sound
                const playBeep = (freq: number, start: number, duration: number) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, start);
                    
                    gain.gain.setValueAtTime(0, start);
                    gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
                    
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    
                    osc.start(start);
                    osc.stop(start + duration);
                };
                
                playBeep(261.63, now, 0.3); // C4
                playBeep(329.63, now + 0.1, 0.3); // E4
                playBeep(392.00, now + 0.2, 0.3); // G4
                playBeep(523.25, now + 0.3, 0.6); // C5
            } catch (e) {
                console.warn('Could not play level up sound:', e);
            }
        } else {
            setConfetti([]);
        }
    }, [level]);

    useEffect(() => {
        if (level === null) return;

        const handleKeyDown = () => {
            onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [level, onClose]);

    if (level === null) return null;

    const quotes = [
        "Your hands are learning the language of the keys!",
        "Every correct note is a step closer to mastery.",
        "Beautiful music is in your future. Keep it up!",
        "You are building actual brain pathways today!",
        "Sight reading is a superpower. You're unlocking it!",
        "Your fingers are starting to move by themselves!"
    ];

    const randomQuote = quotes[level % quotes.length];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md overflow-hidden">
                {/* Confetti Animation Layer */}
                <div className="absolute inset-0 pointer-events-none">
                    {confetti.map((p) => (
                        <div
                            key={p.id}
                            className="absolute rounded-full animate-fall"
                            style={{
                                left: `${p.x}%`,
                                top: `-20px`,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                backgroundColor: p.color,
                                animationDelay: `${p.delay}s`,
                                animationDuration: `${p.duration}s`,
                                animationIterationCount: 'infinite',
                                opacity: 0.8
                            }}
                        />
                    ))}
                </div>

                {/* Modal Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 50 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="relative bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(99,102,241,0.4)] border border-indigo-500/30 max-w-md w-full mx-4 text-center overflow-hidden"
                >
                    {/* Glowing background circle */}
                    <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Celebration Icon */}
                    <motion.div 
                        initial={{ rotate: -10, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-7xl md:text-8xl mb-6 select-none"
                    >
                        🎉
                    </motion.div>

                    {/* Level Badge */}
                    <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-full text-sm uppercase tracking-widest shadow-lg mb-4">
                        Level Up!
                    </div>

                    <h2 className="text-4xl md:text-5xl font-extrabold font-serif mb-2 tracking-tight bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                        Level {level}
                    </h2>

                    <p className="text-indigo-200 text-sm italic font-medium px-4 mb-8">
                        "{randomQuote}"
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">New Unlocks</h4>
                            <div className="text-sm font-semibold flex items-center justify-center gap-2">
                                🔓 <span className="text-white">Next Lesson Unlocked!</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-extrabold rounded-2xl shadow-xl transition transform hover:scale-[1.03] active:scale-[0.98] outline-none focus:ring-4 focus:ring-purple-500/30"
                    >
                        Keep Practicing!
                    </button>
                </motion.div>
            </div>
            
            {/* Custom falling animation css */}
            <style>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                    }
                    100% {
                        transform: translateY(105vh) rotate(720deg);
                    }
                }
                .animate-fall {
                    animation-name: fall;
                    animation-timing-function: linear;
                }
            `}</style>
        </AnimatePresence>
    );
};
