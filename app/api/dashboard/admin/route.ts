import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Métricas gerais
    const { count: totalProspects } = await supabase.from('prospects').select('*', { count: 'exact', head: true });

    // Gráfico por status (Funil)
    const { data: funnelData } = await supabase.rpc('get_funnel_stats');

    // Leads por vendedor
    const { data: leadsByVendedor } = await supabase.from('profiles').select('nome, prospects(count)').eq('role', 'vendedor');

    // Motivos de perda (Geral)
    const { data: lossReasons } = await supabase
        .from('prospects')
        .select('motivos_resultado(descricao)')
        .eq('status', 'nao_interessado');

    return NextResponse.json({
        totalProspects: totalProspects || 0,
        funnelData: funnelData || [],
        leadsByVendedor: leadsByVendedor || [],
        lossReasons: lossReasons || [],
    });
}
