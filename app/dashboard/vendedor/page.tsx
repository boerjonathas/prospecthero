'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
    Users,
    Target,
    Zap,
    Flame,
    TrendingUp,
    Clock,
    Download
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface DashData {
    metrics: {
        day: number;
        week: number;
        profile: any;
    };
    reasons: any[];
}

export default function VendedorDashboard() {
    const [data, setData] = useState<DashData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/dashboard/vendedor')
            .then(res => {
                if (!res.ok) throw new Error('Falha ao carregar dados');
                return res.json();
            })
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Erro ao carregar dashboard. Tente fazer login novamente.');
                setLoading(false);
            });
    }, []);

    const handleExport = () => {
        if (!data) return;

        const { metrics, reasons = [] } = data;
        let csv = 'Metrica,Valor\n';
        csv += `Prospects Hoje,${metrics.day}\n`;
        csv += `Prospects Semana,${metrics.week}\n`;
        csv += `Pontos Totais,${metrics.profile?.pontos || 0}\n`;
        csv += `Nivel,${metrics.profile?.nivel || 1}\n`;

        csv += '\nProspect,Status,Motivo\n';
        reasons.forEach((r: any) => {
            csv += `"${r.nome}","${r.status}","${r.motivos_resultado?.descricao || ''}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `seu_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <AppLayout><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div></AppLayout>;

    if (error) return <AppLayout><div className="p-10 text-center"><p className="text-red-500 font-bold">{error}</p></div></AppLayout>;

    if (!data) return null;

    const { metrics, reasons = [] } = data;
    const profile = metrics.profile;

    // Processar dados para o gráfico de motivos
    const safeReasons = Array.isArray(reasons) ? reasons : [];
    const lossReasons = safeReasons.filter(r => r.motivos_resultado?.tipo === 'perda');
    const conversionReasons = safeReasons.filter(r => r.motivos_resultado?.tipo === 'conversao');

    const chartData = {
        labels: ['Perda', 'Conversão'],
        datasets: [
            {
                data: [lossReasons.length, conversionReasons.length],
                backgroundColor: ['#ef4444', '#22c55e'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Olá, {profile?.nome || 'Herói'}! 👋</h1>
                        <p className="text-slate-500 font-medium">Você está no nível {profile?.nivel || 1}. Continue assim!</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={handleExport}
                            className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-slate-600 font-bold text-sm hover:bg-slate-50"
                        >
                            <Download size={18} /> Exportar
                        </button>
                        <div className="glass px-6 py-2 rounded-2xl flex items-center gap-2">
                            <Zap className="text-yellow-500 fill-yellow-500" size={24} />
                            <span className="text-2xl font-black text-slate-800">{profile?.pontos || 0} Pts</span>
                        </div>
                    </div>
                </header>

                {/* Grid de Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Prospects Hoje"
                        value={metrics.day}
                        subtitle={`Meta: ${profile?.meta_diaria || 10}`}
                        progress={(metrics.day / (profile?.meta_diaria || 10)) * 100}
                        icon={Clock}
                        color="purple"
                    />
                    <StatCard
                        title="Prospects Semana"
                        value={metrics.week}
                        subtitle={`Meta: ${profile?.meta_semanal || 50}`}
                        progress={(metrics.week / (profile?.meta_semanal || 50)) * 100}
                        icon={Target}
                        color="pink"
                    />
                    <StatCard
                        title="Sua Meta Diária"
                        value={profile?.meta_diaria || 10}
                        subtitle="Prospects por dia"
                        progress={100}
                        icon={Zap}
                        color="yellow"
                    />
                    <StatCard
                        title="Streak Atual"
                        value={`${profile?.streak || 0} dias`}
                        subtitle="Batendo metas"
                        progress={100}
                        icon={Flame}
                        color="orange"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gráfico de Conversão */}
                    <div className="glass p-6 rounded-3xl lg:col-span-1">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="text-purple-600" /> Conversão vs Perda
                        </h3>
                        <div className="h-64 flex items-center justify-center">
                            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    {/* Ranking Rápido ou Motivacional */}
                    <div className="glass p-6 rounded-3xl lg:col-span-2 card-gradient">
                        <h3 className="text-xl font-bold mb-4">Dica do Especialista 💡</h3>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            "Foque em entender a dor do cliente nos primeiros 30 segundos. Leads que demonstram interesse na primeira abordagem têm 40% mais chance de conversão."
                        </p>
                        <div className="flex gap-4">
                            <div className="p-4 bg-white/50 rounded-2xl border border-white/50 flex-1">
                                <p className="text-sm font-bold text-slate-500 mb-1">Total Prospectado</p>
                                <p className="text-3xl font-black text-slate-800">{reasons.length}</p>
                            </div>
                            <div className="p-4 bg-white/50 rounded-2xl border border-white/50 flex-1">
                                <p className="text-sm font-bold text-slate-500 mb-1">Taxa de Sucesso</p>
                                <p className="text-3xl font-black text-slate-800">
                                    {reasons.length > 0 ? ((conversionReasons.length / reasons.length) * 100).toFixed(0) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ title, value, subtitle, progress, icon: Icon, color }: any) {
    const colors: any = {
        purple: 'bg-purple-100 text-purple-600',
        pink: 'bg-pink-100 text-pink-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    const progressColors: any = {
        purple: 'bg-purple-500',
        pink: 'bg-pink-500',
        yellow: 'bg-yellow-500',
        orange: 'bg-orange-500',
    };

    return (
        <div className="glass p-6 rounded-3xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
            <div className="space-y-2 mt-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${progressColors[color]} transition-all duration-1000`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <p className="text-xs font-bold text-slate-400">{subtitle}</p>
            </div>
        </div>
    );
}
