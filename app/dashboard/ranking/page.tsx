'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Trophy, Medal, Target, TrendingUp, User, Zap, Crown } from 'lucide-react';
import HeroDetailModal from '@/components/HeroDetailModal';

export default function RankingPage() {
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('geral');
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openHeroDetail = (id: string) => {
        setSelectedHeroId(id);
        setIsModalOpen(true);
    };

    useEffect(() => {
        setLoading(true);
        fetch(`/api/dashboard/ranking?type=${filter}`)
            .then(res => res.json())
            .then(data => {
                setRanking(data.ranking || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [filter]);

    const podium = ranking.slice(0, 3);
    const others = ranking.slice(3);

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-10">
                <header className="text-center space-y-4">
                    <div className="inline-flex p-3 bg-yellow-100 rounded-2xl mb-2">
                        <Trophy className="text-yellow-600 w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Hall da Fama</h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">
                        Os maiores heróis da prospecção reunidos em um só lugar. Quem será o mestre desta semana?
                    </p>
                </header>

                {/* Filtros */}
                <div className="flex justify-center">
                    <div className="glass p-1 rounded-2xl flex gap-1">
                        {['geral', 'semanal', 'mensal'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-white shadow-sm text-purple-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Podium */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-10">
                            {/* 2nd Place */}
                            {podium[1] && (
                                <div
                                    className="order-2 md:order-1 flex flex-col items-center space-y-4 cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
                                    onClick={() => openHeroDetail(podium[1].id)}
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300 shadow-xl overflow-hidden group-hover:border-slate-400 transition-colors">
                                            {podium[1].foto_url ? <img src={podium[1].foto_url} alt="" /> : <User className="text-slate-400 w-12 h-12" />}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-slate-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-white">2</div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-800">{podium[1].nome}</p>
                                        <p className="text-sm font-bold text-slate-400">{podium[1].pontos} pts</p>
                                    </div>
                                    <div className="w-full h-32 glass rounded-t-3xl border-b-0 flex items-center justify-center bg-gradient-to-t from-slate-100 to-white">
                                        <Medal className="text-slate-400 w-10 h-10 opa-50" />
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {podium[0] && (
                                <div
                                    className="order-1 md:order-2 flex flex-col items-center space-y-4 cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
                                    onClick={() => openHeroDetail(podium[0].id)}
                                >
                                    <div className="relative">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                            <Crown className="text-yellow-500 w-12 h-12 fill-yellow-500" />
                                        </div>
                                        <div className="w-32 h-32 rounded-full bg-yellow-50 flex items-center justify-center border-4 border-yellow-400 shadow-2xl overflow-hidden group-hover:border-yellow-500 transition-colors">
                                            {podium[0].foto_url ? <img src={podium[0].foto_url} alt="" /> : <User className="text-yellow-600 w-16 h-16" />}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-2 border-white text-lg">1</div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-800 text-xl">{podium[0].nome}</p>
                                        <p className="text-sm font-bold text-yellow-600">{podium[0].pontos} pts • Nível {podium[0].nivel}</p>
                                    </div>
                                    <div className="w-full h-48 glass rounded-t-3xl border-b-0 flex items-center justify-center bg-gradient-to-t from-yellow-100 to-white shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.3)]">
                                        <Trophy className="text-yellow-500 w-16 h-16" />
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {podium[2] && (
                                <div
                                    className="order-3 flex flex-col items-center space-y-4 cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
                                    onClick={() => openHeroDetail(podium[2].id)}
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center border-4 border-orange-300 shadow-xl overflow-hidden group-hover:border-orange-400 transition-colors">
                                            {podium[2].foto_url ? <img src={podium[2].foto_url} alt="" /> : <User className="text-orange-400 w-12 h-12" />}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-white">3</div>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-800">{podium[2].nome}</p>
                                        <p className="text-sm font-bold text-slate-400">{podium[2].pontos} pts</p>
                                    </div>
                                    <div className="w-full h-24 glass rounded-t-3xl border-b-0 flex items-center justify-center bg-gradient-to-t from-orange-50 to-white">
                                        <Medal className="text-orange-300 w-10 h-10" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* List - Others */}
                        {others.length > 0 && (
                            <div className="glass overflow-hidden rounded-3xl border-none shadow-xl">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Posição</th>
                                            <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Herói</th>
                                            <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Nível</th>
                                            <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Pontos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {others.map((user, idx) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                                onClick={() => openHeroDetail(user.id)}
                                            >
                                                <td className="px-8 py-4">
                                                    <span className="font-black text-slate-400">#{idx + 4}</span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 group-hover:border-purple-200 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                                                            {user.id.substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-slate-700 group-hover:text-purple-700 transition-colors">{user.nome}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-black">Lvl {user.nivel}</span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="font-black text-slate-800">{user.pontos}</span>
                                                        <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>



            <HeroDetailModal
                key={selectedHeroId || 'none'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={selectedHeroId || ''}
            />
        </AppLayout>
    );
}
