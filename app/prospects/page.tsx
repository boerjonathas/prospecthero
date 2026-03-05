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
    XCircle,
    Trash2
} from 'lucide-react';

export default function ProspectsPage() {
    const [prospects, setProspects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProspect, setCurrentProspect] = useState<any>(null);
    const [motivos, setMotivos] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleLimits, setVisibleLimits] = useState<Record<string, number>>({
        novo: 5,
        contatado: 5,
        interessado: 5,
        convertido: 5,
        nao_interessado: 5
    });

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

    const filteredProspects = prospects.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
            p.nome?.toLowerCase().includes(search) ||
            p.telefone?.toLowerCase().includes(search) ||
            p.cidade?.toLowerCase().includes(search)
        );
    });

    useEffect(() => {
        fetchData();
        // Buscar a lista mestre de motivos
        fetch('/api/motivos')
            .then(res => res.json())
            .then(d => setMotivos(d.data || []));
    }, []);

    const handleOpenModal = (prospect: any = null) => {
        setSubmitError(null);
        if (prospect) {
            if (!prospect.id) console.warn('Modal aberto para prospect sem ID:', prospect);
            setCurrentProspect(prospect);
            setFormData({
                nome: prospect.nome,
                email: prospect.email || '',
                telefone: prospect.telefone || '',
                cidade: prospect.cidade || '',
                sexo: prospect.sexo || 'M',
                status: prospect.status,
                motivo_resultado_id: typeof prospect.motivo_resultado_id === 'string'
                    ? prospect.motivo_resultado_id
                    : (prospect.motivo_resultado_id?.id || ''),
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

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir este prospect? Esta ação não pode ser desfeita.')) return;

        try {
            const res = await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Erro ao excluir prospect');
            }
        } catch (err) {
            alert('Erro de conexão ao excluir prospect');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        const method = currentProspect?.id ? 'PUT' : 'POST';
        const url = currentProspect?.id ? `/api/prospects/${currentProspect.id}` : '/api/prospects';

        if (method === 'PUT' && (!currentProspect?.id || currentProspect.id === 'undefined')) {
            setSubmitError('ID do prospect inválido. Tente recarregar a página.');
            setIsSubmitting(false);
            return;
        }

        console.log(`Enviando ${method} para ${url}:`, formData);

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            } else {
                const errorData = await res.json();
                setSubmitError(errorData.error || 'Erro ao salvar informações');
            }
        } catch (err) {
            setSubmitError('Erro de conexão. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [draggedProspect, setDraggedProspect] = useState<any>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, prospect: any) => {
        if (!prospect?.id) {
            console.error('Tentativa de arrastar prospect sem ID:', prospect);
            return;
        }
        setDraggedProspect(prospect);
        // Usar dataTransfer como backup e para compatibilidade
        e.dataTransfer.setData('prospectId', prospect.id);
        e.dataTransfer.dropEffect = 'move';

        // Efeito visual no card original
        const target = e.currentTarget as HTMLElement;
        setTimeout(() => {
            target.style.opacity = '0.3';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';
        // Não limpamos o draggedProspect aqui, deixamos o handleDrop resolver
        // setDraggedProspect(null); // REMOVIDO para evitar race condition
        setDragOverStatus(null);
    };

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverStatus !== status) {
            setDragOverStatus(status);
        }
    };

    const handleDragLeave = () => {
        // Opcional: só limpar se sair da área das colunas
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const pId = e.dataTransfer.getData('prospectId');
        const prospect = draggedProspect || prospects.find(p => p.id === pId);

        setDragOverStatus(null);
        setDraggedProspect(null);

        if (!prospect || prospect.status === newStatus) return;

        // ATUALIZAÇÃO AUTOMÁTICA (Sem modal, para todos os status)
        console.log('Frontend: Iniciando Drop automático. ID:', prospect.id, 'Novo Status:', newStatus);
        const oldProspects = [...prospects];
        setProspects(prev => prev.map(p =>
            p.id === prospect.id ? { ...p, status: newStatus } : p
        ));

        try {
            console.log('Enviando PUT automático:', newStatus, 'ID:', prospect.id);
            const res = await fetch(`/api/prospects/${prospect.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Frontend: Erro na resposta da API:', res.status, errorText);
                throw new Error('Falha ao atualizar status');
            }
            console.log('Frontend: Sincronização concluída para ID:', prospect.id);
            // Recarrega para garantir sincronia total
            fetchData();
        } catch (err) {
            console.error(err);
            // Rollback em caso de erro
            setProspects(oldProspects);
            alert('Erro ao atualizar status. Tente novamente.');
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-600"
                        />
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto pb-8 min-h-[600px] scroll-smooth custom-scrollbar">
                    <div className="flex gap-4 pb-4">
                        {['novo', 'contatado', 'interessado', 'convertido', 'nao_interessado'].map((status) => (
                            <div
                                key={status}
                                className="w-72 sm:w-80 flex flex-col gap-4 shrink-0"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${status === 'novo' ? 'bg-slate-400' :
                                            status === 'contatado' ? 'bg-blue-400' :
                                                status === 'interessado' ? 'bg-purple-400' :
                                                    status === 'convertido' ? 'bg-green-400' :
                                                        'bg-red-400'
                                            }`} />
                                        <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm text-nowrap">
                                            {status.replace('_', ' ')}
                                        </h3>
                                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                                            {filteredProspects.filter(p => p.status === status).length}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    onDragOver={(e) => handleDragOver(e, status)}
                                    onDrop={(e) => handleDrop(e, status)}
                                    className={`flex flex-col gap-4 p-4 rounded-3xl border-2 border-dashed transition-all min-h-[550px] relative ${dragOverStatus === status
                                        ? 'bg-purple-100 border-purple-400 scale-[1.01]'
                                        : draggedProspect
                                            ? 'bg-purple-50/50 border-purple-200'
                                            : 'bg-slate-100/50 border-slate-200'
                                        }`}
                                >
                                    <div className="absolute inset-0 z-0"></div> {/* Hit area helper */}
                                    <div className="relative z-10 flex flex-col gap-4">
                                        {filteredProspects
                                            .filter(p => p.status === status)
                                            .slice(0, visibleLimits[status])
                                            .map((p) => (
                                                <div
                                                    key={p.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, p)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => handleOpenModal(p)}
                                                    className="glass p-5 rounded-2xl space-y-3 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all border-l-4 group shadow-sm hover:shadow-md bg-white"
                                                    style={{
                                                        borderLeftColor:
                                                            status === 'novo' ? '#94a3b8' :
                                                                status === 'contatado' ? '#38bdf8' :
                                                                    status === 'interessado' ? '#818cf8' :
                                                                        status === 'convertido' ? '#22c55e' :
                                                                            '#ef4444'
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-black text-slate-800 leading-tight group-hover:text-purple-600 transition-colors">{p.nome}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => handleDelete(e, p.id)}
                                                                className="p-1 text-slate-300 hover:text-red-500 transition-all focus:outline-none"
                                                                title="Excluir Prospect"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                            <Edit2 size={14} className="text-slate-300 group-hover:text-slate-400" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5 text-slate-500 text-xs font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <Phone size={14} className="text-slate-300" /> {p.telefone || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={14} className="text-slate-300" /> {p.cidade || 'N/A'}
                                                        </div>
                                                    </div>

                                                    {p.motivos_resultado && (
                                                        <div className="pt-2">
                                                            <span className="bg-white/50 text-[10px] px-2 py-0.5 rounded-md border border-slate-100 text-slate-400 italic">
                                                                {p.motivos_resultado.descricao}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                        <div className="flex flex-col gap-2 mt-2">
                                            {filteredProspects.filter(p => p.status === status).length > visibleLimits[status] && (
                                                <button
                                                    onClick={() => setVisibleLimits(prev => ({ ...prev, [status]: prev[status] + 5 }))}
                                                    className="w-full py-3 bg-white/50 hover:bg-white text-slate-500 text-[10px] font-black rounded-xl border border-dashed border-slate-200 transition-all hover:border-purple-300 hover:text-purple-600 group active:scale-95"
                                                >
                                                    VER MAIS +
                                                    <span className="block text-[8px] opacity-50 group-hover:opacity-100">
                                                        Mostrando {visibleLimits[status]} de {filteredProspects.filter(p => p.status === status).length}
                                                    </span>
                                                </button>
                                            )}

                                            {visibleLimits[status] > 5 && (
                                                <button
                                                    onClick={() => setVisibleLimits(prev => ({ ...prev, [status]: 5 }))}
                                                    className="w-full py-2 text-slate-400 text-[9px] font-black hover:text-purple-500 transition-all uppercase tracking-tighter active:scale-95"
                                                >
                                                    — Ver menos —
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {filteredProspects.filter(p => p.status === status).length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-40 text-slate-300 gap-2 relative z-10">
                                            <Users size={32} strokeWidth={1} />
                                            <span className="text-xs font-bold italic">Vazio</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
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
                                            <option key={m.id} value={m.id}>{m.descricao}</option>
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

                            {submitError && (
                                <div className="col-span-2 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold animate-pulse">
                                    ⚠️ {submitError}
                                </div>
                            )}

                            <div className="col-span-2 flex gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl shadow-xl hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
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
