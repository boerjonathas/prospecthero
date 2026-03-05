'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles, Award, UserPlus, Map, Search, DollarSign, Zap, Flame, PieChart, ShieldCheck, CheckCircle, Database, Ghost } from 'lucide-react';

const ICON_MAP: any = {
    UserPlus, Map, Search, DollarSign, Zap, Flame, PieChart, ShieldCheck, CheckCircle, Database, Ghost, Trophy, Award
};

interface MedalCelebrationProps {
    badge: {
        nome: string;
        descricao: string;
        icon: string;
        tier: string;
        image_url?: string;
    };
    onClose: () => void;
}

export default function MedalCelebration({ badge, onClose }: MedalCelebrationProps) {
    const [mounted, setMounted] = useState(false);
    const Icon = ICON_MAP[badge.icon] || Award;

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const tierColors: any = {
        bronze: 'from-orange-400 to-orange-700',
        prata: 'from-slate-300 to-slate-500',
        ouro: 'from-yellow-300 to-yellow-600',
        roxo: 'from-purple-400 to-purple-700',
        vermelho: 'from-red-400 to-red-700'
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none p-16 md:p-4">
            {/* Overlay for interaction blocking */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto" onClick={onClose} />

            {/* ... confetti logic omitted ... */}

            {/* Modal */}
            <div className="relative pointer-events-auto w-full h-full md:h-auto max-h-full overflow-y-auto max-w-md p-10 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/60 text-center animate-in zoom-in-50 fade-in duration-500 custom-scroll">
                <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br ${tierColors[badge.tier] || tierColors.bronze} rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-6 animate-bounce overflow-hidden`}>
                    {badge.image_url ? (
                        <img src={badge.image_url} alt={badge.nome} className="w-full h-full object-contain p-2 drop-shadow-xl" />
                    ) : (
                        <Icon size={80} className="text-white drop-shadow-lg" />
                    )}
                    <div className="absolute top-2 right-2 bg-white text-slate-900 p-2 rounded-full shadow-lg z-10">
                        <Star size={20} fill="currentColor" className="text-yellow-400" />
                    </div>
                </div>

                <div className="mt-16 space-y-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em]">Nova Medalha Conquistada!</span>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">
                            {badge.nome}
                        </h2>
                        <div className="h-1.5 w-24 bg-purple-100 mx-auto rounded-full overflow-hidden mt-4">
                            <div className="h-full bg-purple-600 w-full animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-600 font-bold leading-relaxed px-4">
                            {badge.descricao}
                        </p>
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50 inline-block">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Categoria: <span className="text-slate-600">{badge.tier}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className={`w-full mt-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 group shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1`}
                    >
                        Colecionar Medalha
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
                    width: 10px;
                    height: 10px;
                    top: -15px;
                    border-radius: 2px;
                    animation: fall linear infinite;
                    z-index: 2001;
                }
            `}</style>
        </div>
    );
}
