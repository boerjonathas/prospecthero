'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
    Target,
    Zap,
    Flame,
    TrendingUp,
    Clock,
    Download,
    BarChart3,
    PieChart,
    Award,
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import BadgeGrid from '@/components/BadgeGrid';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface DashData {
    metrics: {
        day: number;
        week: number;
        profile: any;
    };
    reasons: any[];
    funnelData: any[];
    allBadges: any[];
    earnedBadges: any[];
}

export default function VendedorDashboard() {
    const [data, setData] = useState<DashData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/dashboard/vendedor')
            .then(res => res.json())
            .then(d => {
                if (d.error) throw new Error(d.error);
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

        const { metrics } = data;
        let csv = 'Metrica,Valor\n';
        csv += `Prospects Hoje,${metrics.day}\n`;
        csv += `Prospects Semana,${metrics.week}\n`;
        csv += `Pontos Totais,${metrics.profile?.pontos || 0}\n`;
        csv += `Nivel,${metrics.profile?.nivel || 1}\n`;

        csv += '\nFunil de Vendas,Quantidade\n';
        const funnelLabels = ['novo', 'contatado', 'interessado', 'convertido'];
        funnelLabels.forEach(label => {
            const item = data.funnelData?.find((f: any) => f.status === label);
            csv += `${label.toUpperCase()},${item ? item.count : 0}\n`;
        });

        csv += '\nMotivo de Perda,Leads\n';
        const lossCounts: any = data.reasons
            .filter((r: any) => r.motivos_resultado?.tipo === 'perda')
            .reduce((acc: any, curr: any) => {
                const desc = curr.motivos_resultado?.descricao || 'Não informado';
                acc[desc] = (acc[desc] || 0) + 1;
                return acc;
            }, {});

        Object.entries(lossCounts).forEach(([reason, count]) => {
            csv += `"${reason}",${count}\n`;
        });

        csv += '\nMotivo de Sucesso (Por que compraram?),Leads\n';
        const successCounts: any = data.reasons
            .filter((r: any) => r.motivos_resultado?.tipo === 'conversao')
            .reduce((acc: any, curr: any) => {
                const desc = curr.motivos_resultado?.descricao || 'Não informado';
                acc[desc] = (acc[desc] || 0) + 1;
                return acc;
            }, {});

        Object.entries(successCounts).forEach(([reason, count]) => {
            csv += `"${reason}",${count}\n`;
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

    const { metrics } = data;
    const profile = metrics.profile;

    // Funil
    const funnelLabelsForChart = ['novo', 'contatado', 'interessado', 'convertido'];
    const funnelValues = funnelLabelsForChart.map(label => {
        const item = data.funnelData?.find((f: any) => f.status === label);
        return item ? parseInt(item.count) : 0;
    });

    const funnelChartData = {
        labels: funnelLabelsForChart.map(l => l.toUpperCase()),
        datasets: [
            {
                label: 'Seus Leads no Funil',
                data: funnelValues,
                backgroundColor: ['#94a3b8', '#38bdf8', '#818cf8', '#22c55e'],
                borderRadius: 8,
            },
        ],
    };

    // Motivos de perda (Top 3)
    const lossCounts: any = data.reasons
        .filter((r: any) => r.motivos_resultado?.tipo === 'perda')
        .reduce((acc: any, curr: any) => {
            const desc = curr.motivos_resultado?.descricao || 'Não informado';
            acc[desc] = (acc[desc] || 0) + 1;
            return acc;
        }, {});

    const sortedLoss = Object.entries(lossCounts)
        .sort((a: any, b: any) => b[1] - a[1]);

    const top3Loss = sortedLoss.slice(0, 3);
    const othersLoss = sortedLoss.slice(3).reduce((acc: number, curr: any) => acc + curr[1], 0);

    const lossLabels = top3Loss.map(([label]) => label);
    const lossValues = top3Loss.map(([_, value]) => value);
    if (othersLoss > 0) {
        lossLabels.push('Outros');
        lossValues.push(othersLoss);
    }

    const lossChartData = {
        labels: lossLabels,
        datasets: [
            {
                data: lossValues,
                backgroundColor: ['#f43f5e', '#fb923c', '#fbbf24', '#94a3b8'],
                borderWidth: 0,
            },
        ],
    };

    // Motivos de sucesso
    const succCounts: any = data.reasons
        .filter((r: any) => r.motivos_resultado?.tipo === 'conversao')
        .reduce((acc: any, curr: any) => {
            const desc = curr.motivos_resultado?.descricao || 'Não informado';
            acc[desc] = (acc[desc] || 0) + 1;
            return acc;
        }, {});

    const sortedSuccess = Object.entries(succCounts)
        .sort((a: any, b: any) => b[1] - a[1]);

    const successChartData = {
        labels: sortedSuccess.map(([label]) => label),
        datasets: [
            {
                label: 'Seus Fechamentos',
                data: sortedSuccess.map(([_, value]) => value),
                backgroundColor: '#22c55e',
                borderRadius: 8,
            },
        ],
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-slate-800">Olá, {profile?.nome || 'Herói'}! 👋</h1>
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                Nível {profile?.nivel || 1}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                        <button
                            onClick={handleExport}
                            className="h-14 px-6 rounded-2xl flex items-center gap-2 text-slate-600 font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all w-full sm:w-auto justify-center"
                        >
                            <Download size={18} /> Exportar
                        </button>
                        <div className="h-14 px-6 rounded-2xl flex items-center gap-3 bg-white border border-slate-200 w-full sm:w-auto">
                            <div className="bg-yellow-100 p-2 rounded-xl">
                                <Zap className="text-yellow-500 fill-yellow-500" size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Seus Pontos</span>
                                <span className="text-xl font-black text-slate-800 leading-none">{profile?.pontos || 0}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
                        title="Meta Diária"
                        value={profile?.meta_diaria || 10}
                        subtitle="Foque no objetivo"
                        progress={100}
                        icon={Zap}
                        color="yellow"
                    />
                    <StatCard
                        title="Streak"
                        value={`${profile?.streak || 0} dias`}
                        subtitle={profile?.streak > 0 ? "Você está pegando fogo! 🔥" : "Comece sua sequência!"}
                        progress={profile?.streak > 0 ? 100 : 0}
                        icon={Flame}
                        color="orange"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <BarChart3 className="text-purple-600" /> Seu Funil de Vendas
                        </h3>
                        <div className="h-80">
                            <Bar
                                data={funnelChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
                                }}
                            />
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl card-gradient">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <PieChart className="text-pink-600" /> Seus Motivos de Perda
                        </h3>
                        <div className="h-72 flex items-center justify-center">
                            {lossValues.length > 0 ? (
                                <Pie
                                    data={lossChartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    font: { weight: 'bold' as any, family: 'Inter' },
                                                    padding: 20
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <p className="text-slate-400 italic">Sem registros de perda no momento.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="glass p-8 rounded-3xl lg:col-span-8">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <BarChart3 className="text-green-600" /> Por que você vende? (Sucesso)
                        </h3>
                        <div className="h-64">
                            {sortedSuccess.length > 0 ? (
                                <Bar
                                    data={successChartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 italic">Nenhuma conversão registrada ainda.</div>
                            )}
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl lg:col-span-4 bg-gradient-to-br from-slate-800 to-slate-900 border-none shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-white">Dica do Time 💡</h3>
                        <p className="text-slate-300 leading-relaxed mb-6">"Contatos rápidos têm <span className="text-purple-400 font-bold">9x mais chance</span> de avançar no funil."</p>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm font-bold text-slate-400 mb-1">Total Seu</p>
                                <p className="text-3xl font-black text-white">{data.reasons.length}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm font-bold text-slate-400 mb-1">Taxa de Conversão</p>
                                <p className="text-3xl font-black text-green-400">
                                    {data.reasons.length > 0 ? ((sortedSuccess.reduce((acc: number, curr: any) => acc + curr[1], 0) / data.reasons.length) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass p-8 rounded-3xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2"><Award className="text-yellow-600" /> Suas Conquistas</h3>
                        <span className="text-sm font-bold text-slate-400">{data.earnedBadges.length} de {data.allBadges.length} medalhas</span>
                    </div>
                    <BadgeGrid allBadges={data.allBadges} earnedBadges={data.earnedBadges} />
                </div>
            </div >
        </AppLayout >
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
            <div className={`p-3 rounded-2xl w-fit ${colors[color]}`}><Icon size={24} /></div>
            <div>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
            <div className="space-y-2 mt-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${progressColors[color]} transition-all duration-1000`} style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <p className="text-xs font-bold text-slate-400">{subtitle}</p>
            </div>
        </div>
    );
}
