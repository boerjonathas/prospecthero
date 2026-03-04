'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
    Users,
    PlusCircle,
    Search,
    Phone,
    MapPin,
    Calendar,
    Edit2,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function ProspectsPage() {
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProspect, setCurrentProspect] = useState<any>(null);
    const [motivos, setMotivos] = useState<any[]>([]);

    // Form states
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cidade: '',
        sexo: 'M',
        status: 'novo',
        motivo_resultado_id: '',
        observacao_resultado: ''
    });

    const fetchData = async () => {
        const res = await fetch('/api/prospects');
        const d = await res.json();
        setProspects(d.data || []);
        setLoading(false);
    };

    const fetchMotivos = async () => {
        const { data: { user } } = await (await fetch('/api/prospects')).json(); // Just to get the fetch session
        // Motivos are public-viewable via Supabase directly or another API
        const res = await fetch('/api/relatorios/motivos'); // This is admin-locked, so let's use a simpler way or public motifs
        // Actually, motives should be fetched from a public-ish endpoint.
        // For now, I'll hardcode or fetch from a new endpoint.
    };

    useEffect(() => {
        fetchData();
        // Fetch motifs (simulated for now or fetched from a dedicated route if needed)
        fetch('/api/relatorios/motivos').then(res => res.json()).then(d => setMotivos(d.data || []));
    }, []);

    const handleOpenModal = (prospect: any = null) => {
        if (prospect) {
            setCurrentProspect(prospect);
            setFormData({
                nome: prospect.nome,
                email: prospect.email || '',
                telefone: prospect.telefone || '',
                cidade: prospect.cidade || '',
                sexo: prospect.sexo || 'M',
                status: prospect.status,
                motivo_resultado_id: prospect.motivo_resultado_id || '',
                observacao_resultado: prospect.observacao_resultado || ''
            });
        } else {
            setCurrentProspect(null);
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                cidade: '',
                sexo: 'M',
                status: 'novo',
                motivo_resultado_id: '',
                observacao_resultado: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = currentProspect ? 'PUT' : 'POST';
        const url = currentProspect ? `/api/prospects/${currentProspect.id}` : '/api/prospects';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setIsModalOpen(false);
            fetchData();
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Seus Prospects 👥</h1>
                        <p className="text-slate-500 font-medium">Gerencie e conquiste novos clientes.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-purple-200 hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        <PlusCircle size={20} /> Novo Prospect
                    </button>
                </header>

                {/* Busca e Filtros */}
                <div className="glass p-4 rounded-2xl flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou cidade..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-600"
                        />
                    </div>
                </div>

                {/* Lista de Prospects */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>
                    ) : prospects.map((p) => (
                        <div key={p.id} className="glass p-6 rounded-3xl space-y-4 relative group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-xl">
                                        {p.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 leading-none">{p.nome}</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.status}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenModal(p)}
                                    className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                                >
                                    <Edit2 size={20} />
                                </button>
                            </div>

                            <div className="space-y-2 text-slate-600 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-slate-400" /> {p.telefone || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" /> {p.cidade || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" /> {new Date(p.data_prospeccao).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <StatusBadge status={p.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-2xl font-black text-slate-800">
                                {currentProspect ? 'Editar Herói' : 'Novo Recruta'}
                            </h2>
                            <p className="text-slate-500 font-medium">Preencha as informações do seu prospect.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                            {/* Campos do form */}
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-500 mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2">WhatsApp / Telefone</label>
                                <input
                                    type="text"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2">Cidade</label>
                                <input
                                    type="text"
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>

                            <div className="col-span-2 grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-slate-700"
                                    >
                                        <option value="novo">Novo</option>
                                        <option value="contatado">Contatado</option>
                                        <option value="interessado">Interessado</option>
                                        <option value="nao_interessado">Não Interessado</option>
                                        <option value="convertido">Convertido</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-500 mb-2">
                                        {formData.status === 'convertido' ? 'Por que fechou negócio?' : formData.status === 'nao_interessado' ? 'Onde travou?' : 'Motivo / Detalhe'}
                                    </label>
                                    <select
                                        value={formData.motivo_resultado_id}
                                        onChange={(e) => setFormData({ ...formData, motivo_resultado_id: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-slate-700"
                                        required={formData.status === 'convertido' || formData.status === 'nao_interessado'}
                                    >
                                        <option value="">Selecione um motivo...</option>
                                        {motivos.map((m: any) => (
                                            <option key={m.id} value={m.id}>{m.motivos_resultado.descricao}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-500 mb-2">Observações do Resultado</label>
                                <textarea
                                    value={formData.observacao_resultado}
                                    onChange={(e) => setFormData({ ...formData, observacao_resultado: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all h-24"
                                    placeholder="Algum detalhe adicional sobre o fechamento ou perda?"
                                />
                            </div>

                            <div className="col-span-2 flex gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all transform hover:scale-[1.02]"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        novo: "bg-slate-100 text-slate-600",
        contatado: "bg-blue-100 text-blue-600",
        interessado: "bg-purple-100 text-purple-600",
        convertido: "bg-green-100 text-green-600",
        nao_interessado: "bg-red-100 text-red-600",
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${styles[status]}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
