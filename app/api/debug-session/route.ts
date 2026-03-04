import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Nenhum usuário logado found in session.' });
    }

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

    return NextResponse.json({
        user_id: user.id,
        user_email: user.email,
        profiles_found: profiles?.length || 0,
        all_profiles_data: profiles,
        profile_error: error ? error.message : null,
        middleware_match: profiles?.some(p => p.role === 'admin') ? 'SUCCESS' : 'FAILURE'
    });
}
