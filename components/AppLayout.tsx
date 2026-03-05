'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from './Sidebar';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import LevelUpCelebration from './LevelUpCelebration';
import MedalCelebration from './MedalCelebration';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(0);
    const [newMedal, setNewMedal] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, nivel')
                .eq('id', user.id)
                .single();

            const currentLevel = profile?.nivel || 1;
            const currentRole = profile?.role || 'vendedor';
            setRole(currentRole);

            if (currentRole === 'vendedor') {
                const lastSeenLevel = localStorage.getItem(`last_level_${user.id}`);

                // Só mostra se já tinha um nível registrado e o novo é maior
                if (lastSeenLevel && parseInt(lastSeenLevel) < currentLevel) {
                    setNewLevel(currentLevel);
                    setShowLevelUp(true);
                }

                localStorage.setItem(`last_level_${user.id}`, currentLevel.toString());

                // Detecção de Novas Medalhas
                const { data: earnedBadges } = await supabase
                    .from('user_badges')
                    .select('*, badges(*)')
                    .eq('user_id', user.id);

                if (earnedBadges && earnedBadges.length > 0) {
                    const seenMedals = JSON.parse(localStorage.getItem(`seen_medals_${user.id}`) || '[]');
                    const newMedals = earnedBadges.filter(eb => !seenMedals.includes(eb.badge_id));

                    if (newMedals.length > 0) {
                        // Mostra a primeira medalha nova encontrada
                        setNewMedal(newMedals[0].badges);
                        // Marca como vista
                        const updatedSeen = [...seenMedals, ...newMedals.map(m => m.badge_id)];
                        localStorage.setItem(`seen_medals_${user.id}`, JSON.stringify(updatedSeen));
                    }
                }
            }

            setLoading(false);
        }
        getProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!role) return <>{children}</>;

    return (
        <div className="flex bg-slate-50 min-h-screen relative">
            <Sidebar
                role={role}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300">
                {/* Mobile/Laptop Hamburger Menu */}
                <div className="mb-4 shrink-0 2xl:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-3 bg-white shadow-sm rounded-xl border border-slate-200 text-slate-600 hover:text-purple-600 transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
                    >
                        <Menu size={20} />
                        <span className="hidden sm:inline">Menu</span>
                    </button>
                </div>

                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            {showLevelUp && (
                <LevelUpCelebration
                    newLevel={newLevel}
                    onClose={() => setShowLevelUp(false)}
                />
            )}

            {newMedal && (
                <MedalCelebration
                    badge={newMedal}
                    onClose={() => setNewMedal(null)}
                />
            )}
        </div>
    );
}
