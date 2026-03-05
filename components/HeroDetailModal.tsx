import { useState, useEffect } from 'react';
import { X, Award, Zap, Flame, Trophy, User } from 'lucide-react';
import BadgeGrid from './BadgeGrid';

interface HeroDetailModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function HeroDetailModal({ userId, isOpen, onClose }: HeroDetailModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            fetch(`/api/dashboard/ranking/hero?userId=${userId}`)
                .then(res => res.json())
                .then(d => {
                    setData(d);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const profile = data?.profile;
    const nextLevelXP = (profile?.nivel === 1 ? 100 : profile?.nivel === 2 ? 300 : profile?.nivel === 3 ? 600 : 1000);
    const progress = Math.min(100, ((profile?.pontos || 0) / nextLevelXP) * 100);

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 outline-none border border-white/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <X className="text-slate-400" size={24} />
                </button>

                {loading ? (
                    <div className="h-[500px] flex items-center justify-center bg-white">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            <p className="text-slate-400 font-bold animate-pulse">CARREGANDO HERÓI...</p>
                        </div>
                    </div>
                ) : !profile ? (
                    <div className="h-[400px] flex items-center justify-center bg-white p-10 text-center">
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                                <User size={40} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-bold">Infelizmente não encontramos os detalhes deste herói.</p>
                            <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold">Fechar</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full bg-white">
                        {/* Header Section */}
                        <div className="p-10 pb-6 bg-gradient-to-br from-slate-50 to-white">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-24 h-24 rounded-3xl bg-purple-100 flex items-center justify-center text-purple-600 border-2 border-purple-200 shadow-inner">
                                    <User size={48} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profile.nome}</h2>
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-200">
                                            HERÓI
                                        </span>
                                    </div>
                                    <p className="text-slate-500 font-bold flex items-center gap-2 italic">
                                        <Trophy size={16} className="text-yellow-500" />
                                        Membro desde {new Date(profile.data_criacao).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="glass p-4 rounded-2xl flex flex-col items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Nível</span>
                                    <span className="text-2xl font-black text-purple-600 leading-none">{profile.nivel}</span>
                                </div>
                                <div className="glass p-4 rounded-2xl flex flex-col items-center border-yellow-200/50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">XP Total</span>
                                    <div className="flex items-center gap-1 leading-none">
                                        <span className="text-2xl font-black text-slate-800">{profile.pontos}</span>
                                        <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                                    </div>
                                </div>
                                <div className="glass p-4 rounded-2xl flex flex-col items-center border-orange-200/50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Streak</span>
                                    <div className="flex items-center gap-1 leading-none">
                                        <span className="text-2xl font-black text-orange-600">{profile.streak}</span>
                                        <Flame size={14} className="text-orange-500 fill-orange-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Level Progress */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black text-slate-400">
                                    <span>EVOLUÇÃO PARA O NÍVEL {profile.nivel + 1}</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Badges Section */}
                        <div className="p-10 pt-0 flex-1 overflow-y-auto max-h-[450px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Award size={20} className="text-yellow-600" /> Medalhas de Herói
                                </h3>
                                <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {data.earnedBadges.length} / {data.allBadges.length}
                                </span>
                            </div>
                            <BadgeGrid
                                earnedBadges={data.earnedBadges}
                                allBadges={data.allBadges}
                            />
                        </div>

                        {/* Footer Decoration */}
                        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
