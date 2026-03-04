'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

export default function RankingPage() {
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ranking')
            .then(res => res.json())
            .then(d => {
                setRanking(d.data || []);
                setLoading(false);
            });
    }, []);

    if (loading) return <AppLayout><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div></AppLayout>;

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="text-center">
                    <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                        <Trophy className="text-yellow-500 fill-yellow-500" size={48} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800">Placar de Heróis 🏆</h1>
                    <p className="text-slate-500 font-medium">Quem são os melhores prospectores deste mês?</p>
                </header>

                <div className="space-y-4">
                    {ranking.map((user, index) => (
                        <div
                            key={user.id}
                            className={`glass p-6 rounded-3xl flex items-center gap-6 transition-all transform hover:scale-[1.01] ${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-2xl font-black text-slate-400">
                                {index === 0 ? <Crown className="text-yellow-500 fill-yellow-500" /> : index === 1 ? <Medal className="text-slate-400 fill-slate-400" /> : index === 2 ? <Medal className="text-orange-400 fill-orange-400" /> : index + 1}
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-xl border-4 border-white shadow-inner overflow-hidden">
                                {user.foto_url ? <img src={user.foto_url} alt={user.nome} /> : user.nome.charAt(0)}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800">{user.nome}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Nível {user.nivel}</span>
                                    <span className="text-slate-400 text-sm font-medium">{user.email}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-3xl font-black text-purple-600">{user.pontos}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pontos</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
