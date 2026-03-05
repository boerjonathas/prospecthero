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
    Zap,
    X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    role: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
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

    useEffect(() => {
        // Fechar sidebar ao mudar de rota
        onClose();
    }, [pathname]);

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
        <>
            {/* Overlay Backdoor */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[9998] transition-opacity duration-300 2xl:hidden"
                    onClick={onClose}
                />
            )}

            {/* Main Sidebar */}
            <div className={cn(
                "fixed top-0 left-0 h-screen w-full sm:w-80 bg-white border-r border-slate-200 flex flex-col p-6 z-[9999] transition-all duration-300 transform shadow-2xl 2xl:shadow-none overflow-y-auto 2xl:sticky 2xl:top-0 2xl:translate-x-0 2xl:z-0 2xl:h-screen 2xl:min-h-screen",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="mb-10 flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-black text-gradient">ProspectHero</h1>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all active:scale-95 2xl:hidden"
                    >
                        <X size={20} />
                    </button>
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
                    <div className="mt-8 px-2 mb-6 space-y-3 shrink-0">
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
        </>
    );
}

