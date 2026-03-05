'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
    UserPlus,
    Mail,
    User,
    Shield,
    Search,
    Trash2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function VendedoresPage() {
    const [vendedores, setVendedores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchVendedores();
    }, []);

    async function fetchVendedores() {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'vendedor')
            .order('data_criacao', { ascending: false });

        if (!error) setVendedores(data || []);
        setLoading(false);
    }

    const handleAddVendedor = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, nome, role: 'vendedor' }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar');

            setMessage({ text: 'Vendedor cadastrado com sucesso! Ele receberá um e-mail de confirmação.', type: 'success' });
            setNome('');
            setEmail('');
            setPassword('');
            setShowForm(false);
            fetchVendedores();
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setFormLoading(false);
        }
    };

    const filteredVendedores = vendedores.filter(v =>
        v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="space-y-8">
                <header className="flex justify-between items-center text-gradient">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Gerenciar Vendedores 👥</h1>
                        <p className="text-slate-500 font-medium">Cadastre e acompanhe sua equipe de vendas.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all transform hover:scale-105"
                    >
                        <UserPlus size={20} />
                        Novo Vendedor
                    </button>
                </header>

                {showForm && (
                    <div className="glass p-8 rounded-3xl animate-in slide-in-from-top duration-300">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Shield className="text-purple-600" /> Cadastrar Novo Usuário
                        </h3>
                        <form onSubmit={handleAddVendedor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 px-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        placeholder="Ex: João Silva"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 px-1">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        placeholder="vendedor@empresa.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 px-1">Senha Temporária</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    {formLoading ? 'Processando...' : 'Confirmar Cadastro'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {message.text && (
                    <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 font-medium animate-in fade-in duration-300",
                        message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        {message.text}
                    </div>
                )}

                {/* Lista de Vendedores */}
                <div className="glass overflow-hidden rounded-3xl border border-slate-100">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-xl font-bold">Equipe de Vendas</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar vendedor..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Vendedor</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Status/Nível</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase">Pontos</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredVendedores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">
                                            Nenhum vendedor encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVendedores.map((v) => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 font-bold">
                                                        {v.nome.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{v.nome}</p>
                                                        <p className="text-sm text-slate-500">{v.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-black">
                                                    Nível {v.nivel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-700">
                                                {v.pontos} Pts
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Tem certeza que deseja excluir o vendedor ${v.nome}? Todos os seus prospects e dados também serão removidos.`)) {
                                                            try {
                                                                const res = await fetch(`/api/dashboard/admin/vendedores/${v.id}`, { method: 'DELETE' });
                                                                if (res.ok) {
                                                                    setMessage({ text: 'Vendedor excluído com sucesso!', type: 'success' });
                                                                    fetchVendedores();
                                                                } else {
                                                                    const d = await res.json();
                                                                    setMessage({ text: d.error || 'Erro ao excluir vendedor', type: 'error' });
                                                                }
                                                            } catch (err) {
                                                                setMessage({ text: 'Erro de conexão ao excluir', type: 'error' });
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
