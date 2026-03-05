import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'geral'; // geral, semanal, mensal

    let query = supabase
        .from('profiles')
        .select('id, nome, pontos, nivel, role')
        .eq('role', 'vendedor')
        .order('pontos', { ascending: false })
        .limit(10);

    // Nota: Para semanal/mensal real, precisaríamos filtrar o points_log
    // Por enquanto, usaremos o total acumulado para o MVP de ranking

    const { data: ranking, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ranking });
}
