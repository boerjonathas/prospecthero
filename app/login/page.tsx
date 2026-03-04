'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, nome }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                // Auto login apos registro
                await supabase.auth.signInWithPassword({ email, password });
            }

            // Força um refresh para garantir que o middleware e Server Components vejam o novo cookie
            router.refresh();

            // Pequeno delay para garantir sincronia do cookie antes do push
            setTimeout(() => {
                router.push('/dashboard');
            }, 100);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4" >
            <div className="max-w-md w-full glass p-8 rounded-2xl animate-in fade-in zoom-in duration-300" >
                <div className="text-center mb-8" >
                    <h1 className="text-4xl font-black text-gradient mb-2" > ProspectHero </h1>
                    < p className="text-slate-500 font-medium" >
                        {isLogin ? 'Bem-vindo de volta, Herói!' : 'Comece sua jornada agora!'}
                    </p>
                </div>

                < form onSubmit={handleAuth} className="space-y-4" >
                    {!isLogin && (
                        <div className="relative" >
                            <span className="absolute left-3 top-3 text-slate-400" >
                                <LogIn size={20} />
                            </span>
                            < input
                                type="text"
                                placeholder="Nome completo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-700"
                                required
                            />
                        </div>
                    )}

                    <div className="relative" >
                        <span className="absolute left-3 top-3 text-slate-400" >
                            <Mail size={20} />
                        </span>
                        < input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-700"
                            required
                        />
                    </div>

                    < div className="relative" >
                        <span className="absolute left-3 top-3 text-slate-400" >
                            <Lock size={20} />
                        </span>
                        < input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-700"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-semibold" > {error} </p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>

                < div className="mt-8 text-center" >
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-purple-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Criar uma nova conta' : 'Já tenho uma conta'}
                    </button>
                </div>
            </div>
        </div>
    );
}
