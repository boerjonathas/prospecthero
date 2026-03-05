import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Fetch Earned Badges
    const { data: earnedBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
            *,
            badges (*)
        `)
        .eq('user_id', userId);

    if (badgesError) {
        return NextResponse.json({ error: badgesError.message }, { status: 500 });
    }

    // Fetch all badges to show progress (locked/unlocked)
    const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('data_criacao', { ascending: true });

    return NextResponse.json({
        profile,
        earnedBadges: earnedBadges || [],
        allBadges: allBadges || []
    });
}
