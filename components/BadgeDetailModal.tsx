'use client';

import { X, Award, Info, CheckCircle, Lock } from 'lucide-react';

interface BadgeDetailModalProps {
    badge: {
        nome: string;
        descricao: string;
        icon: string;
        tier: string;
        image_url?: string;
    };
    isEarned: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export default function BadgeDetailModal({ badge, isEarned, isOpen, onClose }: BadgeDetailModalProps) {
    if (!isOpen) return null;

    const tierColors: any = {
        bronze: 'from-orange-400/20 to-orange-700/20 text-orange-700 border-orange-200',
        prata: 'from-slate-300/20 to-slate-500/20 text-slate-600 border-slate-200',
        ouro: 'from-yellow-300/20 to-yellow-600/20 text-yellow-700 border-yellow-200',
        roxo: 'from-purple-400/20 to-purple-700/20 text-purple-700 border-purple-200',
        vermelho: 'from-red-400/20 to-red-700/20 text-red-700 border-red-200'
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-16 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Content - Absolute centering reinforced */}
            <div className="relative w-full h-full md:h-auto max-h-full overflow-y-auto max-w-lg bg-white rounded-[2rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 fade-in duration-300 border border-white/20 flex flex-col items-center custom-scroll">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 p-4 bg-white rounded-full shadow-2xl hover:bg-slate-50 transition-all z-[10001] text-slate-800 border border-slate-100"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                <div className="p-10 md:p-14 space-y-8 w-full flex flex-col items-center">
                    {/* Visual Header */}
                    <div className="flex flex-col items-center text-center space-y-8 w-full">
                        {/* THE MEDAL: TOTALLY CLEAN, NO CONTAINER BOX */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center p-0">
                            {badge.image_url ? (
                                <img
                                    src={badge.image_url}
                                    alt={badge.nome}
                                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                                />
                            ) : (
                                <Award size={120} className="text-current opacity-40" />
                            )}
                        </div>

                        <div className="space-y-4 w-full">
                            <div className="flex flex-col items-center gap-3">
                                {isEarned ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-5 py-2 rounded-2xl border border-green-200 shadow-sm flex items-center gap-2 uppercase tracking-[0.2em]">
                                        <CheckCircle size={14} />
                                        ITEM COLECIONADO
                                    </span>
                                ) : (
                                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-5 py-2 rounded-2xl border border-red-100 shadow-sm flex items-center gap-2 uppercase tracking-[0.2em]">
                                        <Lock size={14} />
                                        ESTÁ BLOQUEADA
                                    </span>
                                )}
                                <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-tight uppercase max-w-full">
                                    {badge.nome}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Mission Details */}
                    <div className="space-y-6 w-full">
                        <div className="bg-slate-50/80 p-8 md:p-10 rounded-[2.5rem] border border-slate-100/50 space-y-4 text-center">
                            <div className="flex items-center justify-center gap-3 text-slate-400">
                                <Info size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Missão de Herói</span>
                            </div>
                            <p className="text-slate-600 font-bold text-lg md:text-xl leading-relaxed">
                                {badge.descricao}
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <button
                        onClick={onClose}
                        className="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
