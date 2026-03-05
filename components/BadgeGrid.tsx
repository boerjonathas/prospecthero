'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Map, Search, DollarSign, Zap, Flame, PieChart, ShieldCheck, CheckCircle, Database, Ghost, Award, Lock } from 'lucide-react';
import BadgeDetailModal from './BadgeDetailModal';

const ICON_MAP: any = {
    UserPlus, Map, Search, DollarSign, Zap, Flame, PieChart, ShieldCheck, CheckCircle, Database, Ghost, Award, Lock
};

export default function BadgeGrid({ earnedBadges = [], allBadges = [] }: { earnedBadges: any[], allBadges: any[] }) {
    const [selectedBadge, setSelectedBadge] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const openBadgeDetail = (badge: any) => {
        setSelectedBadge(badge);
        setIsDetailOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Scrollable Container */}
            <div className="flex flex-nowrap overflow-x-auto gap-5 pb-8 px-2 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent custom-scroll -mx-4 sm:-mx-0">
                {allBadges.map((badge) => {
                    const isEarned = earnedBadges.some(eb => eb.badge_id === badge.id);
                    const Icon = ICON_MAP[badge.icon] || Award;

                    const tierStyles: any = {
                        bronze: 'border-orange-100 bg-white text-orange-700 shadow-[0_10px_30px_-10px_rgba(251,146,60,0.2)]',
                        prata: 'border-slate-100 bg-white text-slate-500 shadow-[0_10px_30px_-10px_rgba(148,163,184,0.2)]',
                        ouro: 'border-yellow-100 bg-white text-yellow-600 shadow-[0_10px_30px_-10px_rgba(234,179,8,0.2)]',
                        roxo: 'border-purple-100 bg-white text-purple-700 shadow-[0_10px_30px_-10px_rgba(168,85,247,0.2)]',
                        vermelho: 'border-red-100 bg-white text-red-600 shadow-[0_10px_30px_-10px_rgba(239,68,68,0.2)]'
                    };

                    return (
                        <div
                            key={badge.id}
                            onClick={() => openBadgeDetail(badge)}
                            className={`flex-shrink-0 relative flex flex-col p-6 rounded-[3.5rem] border-2 transition-all duration-500 w-[220px] ${isEarned
                                ? `${tierStyles[badge.tier]} border-opacity-100 ring-1 ring-white/50`
                                : 'border-slate-50 bg-slate-50/20 opacity-40 grayscale-[0.5]'
                                } hover:shadow-lg active:scale-95`}
                        >
                            {/* Status Label */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                                {isEarned ? (
                                    <span className="bg-green-100 text-green-700 text-[8px] font-black px-3 py-1 rounded-full border border-green-200 shadow-sm animate-pulse-slow">
                                        CONQUISTADO
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-3 py-1 rounded-full border border-slate-200">
                                        BLOQUEADO
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col items-center text-center space-y-5 mt-4">
                                {/* Image Container */}
                                <div className="w-40 h-40 flex-shrink-0 flex items-center justify-center relative -mt-4">
                                    {badge.image_url ? (
                                        <img src={badge.image_url} alt={badge.nome} className={`w-full h-full object-contain ${isEarned ? 'drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)]' : 'opacity-80 brightness-75'}`} />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Icon size={44} strokeWidth={isEarned ? 2 : 1.5} />
                                        </div>
                                    )}

                                    {/* Locked Overlay Icon */}
                                    {!isEarned && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 rounded-3xl backdrop-blur-[1px]">
                                            <div className="bg-white/90 p-2 rounded-full shadow-lg">
                                                <Lock size={16} className="text-slate-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="space-y-1 w-full">
                                    <h4 className="font-black uppercase tracking-widest text-[11px] leading-tight px-2 h-8 flex items-center justify-center">
                                        {badge.nome}
                                    </h4>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${isEarned ? 'bg-white border-current/10' : 'bg-slate-100 border-transparent'}`}>
                                            {badge.tier}
                                        </span>
                                        {isEarned && <CheckCircle size={10} className="text-green-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedBadge && (
                <BadgeDetailModal
                    badge={selectedBadge}
                    isEarned={earnedBadges.some(eb => eb.badge_id === selectedBadge.id)}
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                />
            )}

            <style jsx>{`
                .custom-scroll::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1) translateX(-50%); }
                    50% { opacity: 0.8; transform: scale(0.95) translateX(-52%); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}





