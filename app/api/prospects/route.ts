import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('prospects')
        .select('*, vendedor:profiles!prospects_vendedor_id_fkey(nome)')
        .order('data_prospeccao', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data: prospect, error } = await supabase
        .from('prospects')
        .insert([{ ...body, vendedor_id: user.id }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Lógica de Gamificação: +1 ponto por cadastrar prospect
    await supabase.rpc('increment_points', { user_id: user.id, amount: 1, reason: 'Cadastro de prospect' });

    return NextResponse.json({ data: prospect }, { status: 201 });
}
