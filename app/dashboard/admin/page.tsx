'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import {
    Users,
    BarChart3,
    PieChart,
    Filter,
    Download,
    Calendar
} from 'lucide-react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
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

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/dashboard/admin')
            .then(res => {
                if (!res.ok) throw new Error('Falha ao carregar dados do admin');
                return res.json();
            })
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Erro ao carregar dashboard admin. Verifique suas permissões.');
                setLoading(false);
            });
    }, []);

    const handleExport = () => {
        if (!data) return;

        let csv = 'Categoria,Quantidade\n';
        funnelLabels.forEach((label, i) => {
            csv += `${label.toUpperCase()},${funnelValues[i]}\n`;
        });

        csv += '\nMotivo de Perda,Leads\n';
        const lossCounts: any = data.lossReasons.reduce((acc: any, curr: any) => {
            const desc = curr.motivos_resultado?.descricao || 'Não informado';
            acc[desc] = (acc[desc] || 0) + 1;
            return acc;
        }, {});

        Object.entries(lossCounts).forEach(([reason, count]) => {
            csv += `"${reason}",${count}\n`;
        });

        csv += '\nMotivo de Sucesso (Por que compraram?),Leads\n';
        const successCounts: any = data.conversionReasons.reduce((acc: any, curr: any) => {
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
        link.setAttribute('download', `relatorio_admin_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <AppLayout><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div></AppLayout>;

    if (error) return <AppLayout><div className="p-10 text-center"><p className="text-red-500 font-bold">{error}</p></div></AppLayout>;

    if (!data) return null;

    const funnelLabels = ['novo', 'contatado', 'interessado', 'convertido'];
    const funnelValues = funnelLabels.map(label => {
        const item = data.funnelData?.find((f: any) => f.status === label);
        return item ? parseInt(item.count) : 0;
    });

    const funnelChartData = {
        labels: funnelLabels.map(l => l.toUpperCase()),
        datasets: [
            {
                label: 'Leads no Funil',
                data: funnelValues,
                backgroundColor: ['#94a3b8', '#38bdf8', '#818cf8', '#22c55e'],
                borderRadius: 8,
            },
        ],
    };

    // Processar motivos de perda (Top 3)
    const lossCounts: any = data.lossReasons.reduce((acc: any, curr: any) => {
        const desc = curr.motivos_resultado?.descricao || 'Não informado';
        acc[desc] = (acc[desc] || 0) + 1;
        return acc;
    }, {});

    const sortedReasons = Object.entries(lossCounts)
        .sort((a: any, b: any) => b[1] - a[1]);

    const top3 = sortedReasons.slice(0, 3);
    const others = sortedReasons.slice(3).reduce((acc: number, curr: any) => acc + curr[1], 0);

    const lossLabels = top3.map(([label]) => label);
    const lossValues = top3.map(([_, value]) => value);

    if (others > 0) {
        lossLabels.push('Outros');
        lossValues.push(others);
    }

    const lossChartData = {
        labels: lossLabels,
        datasets: [
            {
                data: lossValues,
                backgroundColor: ['#f43f5e', '#fb923c', '#fbbf24', '#94a3b8'],
                borderWidth: 0,
                hoverOffset: 10,
            },
        ],
    };

    // Processar motivos de sucesso (Conversão)
    const succCounts: any = data.conversionReasons.reduce((acc: any, curr: any) => {
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
                label: 'Leads Convertidos',
                data: sortedSuccess.map(([_, value]) => value),
                backgroundColor: '#22c55e',
                borderRadius: 8,
            },
        ],
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Pipeline Global 📊</h1>
                        <p className="text-slate-500 font-medium">Análise em tempo real de toda a operação.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/admin/vendedores" className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-purple-600 font-bold text-sm hover:bg-purple-50">
                            <Users size={18} /> Equipe
                        </Link>
                        <Link href="/prospects" className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-blue-600 font-bold text-sm hover:bg-blue-50">
                            <Filter size={18} /> Ver Todos Leads
                        </Link>
                        <button
                            onClick={handleExport}
                            className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-purple-200 hover:bg-purple-700"
                        >
                            <Download size={18} /> Exportar
                        </button>
                    </div>
                </header>

                {/* Resumo Rápido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-3xl">
                        <p className="text-slate-500 font-bold text-sm uppercase">Total de Leads</p>
                        <p className="text-4xl font-black text-slate-800">{data.totalProspects}</p>
                    </div>
                    <div className="glass p-6 rounded-3xl">
                        <p className="text-slate-500 font-bold text-sm uppercase">Convertidos</p>
                        <p className="text-4xl font-black text-green-600">{funnelValues[funnelValues.length - 1]}</p>
                    </div>
                    <div className="glass p-6 rounded-3xl">
                        <p className="text-slate-500 font-bold text-sm uppercase">Taxa de Conversão</p>
                        <p className="text-4xl font-black text-purple-600">
                            {data.totalProspects > 0 ? ((funnelValues[funnelValues.length - 1] / data.totalProspects) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Gráfico do Funil */}
                    <div className="glass p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <BarChart3 className="text-purple-600" /> Funil de Vendas (Quantidade)
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

                    {/* Motivos de Perda */}
                    <div className="glass p-8 rounded-3xl card-gradient">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <PieChart className="text-pink-600" /> Por que estamos perdendo leads? (Top 3)
                        </h3>
                        <div className="h-72 flex items-center justify-center">
                            {data.lossReasons?.length > 0 ? (
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

                {/* Motivos de Sucesso (Por que compraram?) */}
                <div className="glass p-8 rounded-3xl">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <BarChart3 className="text-green-600" /> Por que eles compraram? (Motivos de Sucesso)
                    </h3>
                    <div className="h-64">
                        {data.conversionReasons?.length > 0 ? (
                            <Bar
                                data={successChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { display: false } },
                                        x: { grid: { display: false } }
                                    }
                                }}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">
                                Nenhuma conversão registrada ainda.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
