import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: ranking, error } = await supabase
        .from('profiles')
        .select('id, nome, email, pontos, nivel, foto_url')
        .order('pontos', { ascending: false })
        .limit(10);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: ranking });
}
