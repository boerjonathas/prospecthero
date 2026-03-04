'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Users,
    Trophy,
    Settings,
    LogOut,
    PlusCircle,
    LayoutDashboard
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
        { name: 'Placar de Ranking', href: '/ranking', icon: Trophy },
    ];

    return (
        <div className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col p-4">
            <div className="mb-10 px-2">
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

            <div className="pt-4 border-t border-slate-100">
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
