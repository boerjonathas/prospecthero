'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from './Sidebar';
import { useRouter } from 'next/navigation';
import LevelUpCelebration from './LevelUpCelebration';
import MedalCelebration from './MedalCelebration';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(0);
    const [newMedal, setNewMedal] = useState<any>(null);
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
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar role={role} />
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
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
