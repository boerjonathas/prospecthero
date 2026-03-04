import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Você precisa estar logado para se promover a Admin. Faça login em /login primeiro.' }, { status: 401 });
    }

    // Verificar se a tabela existe
    const { error: tableError } = await supabase.from('profiles').select('id').limit(1);
    if (tableError && (tableError.message.includes('Public.profiles') || tableError.code === '42P01')) {
        return NextResponse.json({
            error: 'A tabela "profiles" ainda não foi criada no banco de dados ou o Supabase não a encontrou.',
            details: tableError.message
        }, { status: 500 });
    }

    // Usar upsert para garantir que o perfil exista e tenha a role admin
    const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email,
            nome: user.user_metadata?.nome || 'Admin Principal',
            role: 'admin',
            nivel: 10,
            pontos: 1000,
            meta_diaria: 20,
            meta_semanal: 100
        }, { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        return NextResponse.json({
            error: 'Falha ao promover/criar perfil: ' + error.message,
            code: error.code,
            user_id: user.id
        }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `Sucesso! O usuário ${user.email} (ID: ${user.id}) agora tem perfil de Administrador.`,
        profile_data: profile,
        next_step: 'Agora acesse http://localhost:3000/dashboard/admin e dê um F5 forte.'
    });
}
