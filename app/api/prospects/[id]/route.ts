import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
        nome, email, telefone, cidade, sexo, status,
        motivo_resultado_id, observacao_resultado
    } = body;

    const { data: oldProspect, error: fetchError } = await supabase
        .from('prospects')
        .select('status')
        .eq('id', id)
        .single();

    if (fetchError) {
        return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const updateData: any = {
        nome, email, telefone, cidade, sexo, status,
        motivo_resultado_id: motivo_resultado_id === '' ? null : motivo_resultado_id,
        observacao_resultado,
        data_resultado: status === 'convertido' || status === 'nao_interessado' ? new Date().toISOString() : null
    };

    // Remover campos undefined para não sobrescrever com null se não enviados
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: updatedProspect, error } = await supabase
        .from('prospects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Gamificação na mudança de status
    if (status !== oldProspect.status) {
        if (status === 'interessado') {
            await supabase.rpc('increment_points', { user_id: user.id, amount: 3, reason: 'Status: Interessado' });
        } else if (status === 'convertido') {
            await supabase.rpc('increment_points', { user_id: user.id, amount: 10, reason: 'Status: Convertido' });
        }
    }

    return NextResponse.json({ data: updatedProspect });
}
