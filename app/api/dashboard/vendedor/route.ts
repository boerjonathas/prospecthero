import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // Prospects do dia
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count: dayCount } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('vendedor_id', user.id)
        .gte('data_prospeccao', startOfDay.toISOString());

    // Prospects da semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const { count: weekCount } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('vendedor_id', user.id)
        .gte('data_prospeccao', startOfWeek.toISOString());

    // Motivos de perda e conversão (vendedor)
    const { data: reasons } = await supabase
        .from('prospects')
        .select('status, motivo_resultado_id, motivos_resultado(descricao, tipo)')
        .eq('vendedor_id', user.id)
        .not('motivo_resultado_id', 'is', null);

    // Funil do vendedor
    const { data: funnelData } = await supabase.rpc('get_vendedor_funnel_stats', { vendedor_uuid: user.id });

    const profileData = profile || {
        id: user.id,
        nome: user.user_metadata?.nome || 'Herói',
        email: user.email,
        nivel: 1,
        pontos: 0,
        meta_diaria: 10,
        meta_semanal: 50,
        role: 'vendedor'
    };

    return NextResponse.json({
        metrics: {
            day: dayCount || 0,
            week: weekCount || 0,
            profile: profileData,
        },
        reasons: reasons || [],
        funnelData: funnelData || [],
    });
}
