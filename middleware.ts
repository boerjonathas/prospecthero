import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // IMPORTANTE: getUser() é mais seguro que getSession() no middleware
    const { data: { user } } = await supabase.auth.getUser();
    const url = request.nextUrl.clone();

    // Redirecionamentos de Autenticação
    if (!user && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/prospects'))) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    if (user && url.pathname === '/login') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // Proteção de rotas Admin
    if (user && url.pathname.startsWith('/dashboard/admin')) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        // Só redireciona se tivermos o perfil e ele NÃO for admin
        // Se der erro na query, deixamos passar para a página tratar (ou darmos o erro lá)
        if (!error && profile && profile.role !== 'admin') {
            url.pathname = '/dashboard/vendedor';
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
