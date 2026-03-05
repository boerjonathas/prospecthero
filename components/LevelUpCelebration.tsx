'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface LevelUpCelebrationProps {
    newLevel: number;
    onClose: () => void;
}

export default function LevelUpCelebration({ newLevel, onClose }: LevelUpCelebrationProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none p-16 md:p-4">
            {/* ... confetti logic omitted for brevity in target search ... */}

            {/* Background Blur Overlay for Celeb Modal (Optional but helps contrast) */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            {/* Modal */}
            <div className="relative pointer-events-auto w-full h-full md:h-auto max-h-full overflow-y-auto max-w-md p-10 bg-white/95 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(168,85,247,0.4)] border border-white/60 text-center animate-in zoom-in-50 fade-in duration-500 custom-scroll">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-12 animate-bounce">
                    <Trophy size={56} className="text-white drop-shadow-lg" />
                </div>

                <div className="mt-12 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                            LEVEL <span className="text-purple-600">UP!</span>
                        </h2>
                        <div className="h-1.5 w-24 bg-purple-100 mx-auto rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 w-1/2 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-6 py-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Passado</span>
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-300">{newLevel - 1}</div>
                        </div>
                        <div className="text-purple-200 animate-pulse">
                            <Star size={40} fill="currentColor" />
                        </div>
                        <div className="flex flex-col items-center scale-110">
                            <span className="text-[10px] font-black text-purple-400 tracking-[0.2em] uppercase mb-1">Atual</span>
                            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-purple-200 border-2 border-white">{newLevel}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-600 font-bold leading-relaxed px-4">
                            Incrível! Você acaba de alcançar o <span className="text-purple-600 font-black">Nível {newLevel}</span>.
                            Seu desempenho está atraindo olhares de admiração! 🏆
                        </p>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Continue assim para desbloquear novas medalhas!
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 group shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                    >
                        Continuar Jornada
                        <Sparkles size={20} className="text-yellow-400 group-hover:scale-125 transition-transform" />
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                .confetti-piece {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    top: -15px;
                    border-radius: 3px;
                    animation: fall linear infinite;
                }
            `}</style>
        </div>
    );
}
