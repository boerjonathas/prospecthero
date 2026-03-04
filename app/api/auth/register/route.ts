import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { Resend } from 'resend';
import VendedorConviteEmail from '@/emails/vendedor-convite';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Enviar e-mail de convite se for um vendedor
    if (role === 'vendedor' && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
        try {
            const origin = new URL(request.url).origin;
            await resend.emails.send({
                from: 'ProspectHero <onboarding@resend.dev>',
                to: email,
                subject: 'Bem-vindo ao time ProspectHero! 🚀',
                react: VendedorConviteEmail({
                    nomeVendedor: nome,
                    emailVendedor: email,
                    senhaTemporaria: password,
                    loginUrl: `${origin}/login`
                }) as React.ReactElement,
            });
            console.log('E-mail de convite enviado para:', email);
        } catch (mailError) {
            console.error('Erro ao enviar e-mail via Resend:', mailError);
        }
    }

    return NextResponse.json({ data: authData.user }, { status: 201 });
}
