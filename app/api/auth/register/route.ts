import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
    const { email, password, nome, role = 'vendedor' } = await request.json();
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nome,
                role
            }
        }
    });

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ data: authData.user }, { status: 201 });
}
