import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Users,
    Trophy,
    Settings,
    LogOut,
    PlusCircle,
    LayoutDashboard,
    Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Sidebar({ role }: { role: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('nivel, pontos')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
        }
        if (role === 'vendedor') {
            fetchProfile();
        }
    }, [role]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const menuItems = [
        { name: 'Dashboard', href: role === 'admin' ? '/dashboard/admin' : '/dashboard/vendedor', icon: LayoutDashboard },
        ...(role === 'admin' ? [
            { name: 'Equipe de Vendas', href: '/dashboard/admin/vendedores', icon: Users },
        ] : []),
        { name: 'Meus Prospects', href: '/prospects', icon: Users },
        { name: 'Placar de Ranking', href: '/dashboard/ranking', icon: Trophy },
    ];

    return (
        <div className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col p-4 overflow-y-auto">
            <div className="mb-10 px-2 shrink-0">
                <h1 className="text-2xl font-black text-gradient">ProspectHero</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:bg-slate-50",
                            pathname === item.href ? "bg-purple-50 text-purple-600 shadow-sm" : "text-slate-500"
                        )}
                    >
                        <item.icon size={20} />
                        {item.name}
                    </Link>
                ))}
            </nav>

            {role === 'vendedor' && profile && (
                <div className="px-2 mb-6 space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível</span>
                            <span className="text-xl font-black text-purple-600 leading-none">{profile.nivel}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded-lg border border-yellow-200">
                            <span className="text-[10px] font-black text-yellow-700">{profile.pontos} XP</span>
                            <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                        </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                            style={{ width: `${Math.min(100, (profile.pontos / (profile.nivel === 1 ? 100 : profile.nivel === 2 ? 300 : profile.nivel === 3 ? 600 : 1000)) * 100)}%` }}
                        />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-tighter">
                        Progresso para o Nível {profile.nivel + 1}
                    </p>
                </div>
            )}

            <div className="mt-auto shrink-0 pt-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 w-full transition-all"
                >
                    <LogOut size={20} />
                    Sair
                </button>
            </div>
        </div>
    );
}
