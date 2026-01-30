import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin Client (Server-Side Only)
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, fullName, role } = body;

        if (!email || !password || !fullName || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create User in Supabase Auth
        const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm email
            user_metadata: { full_name: fullName }
        });

        if (authError) throw authError;
        if (!userData.user) throw new Error("Failed to create user object");

        // 2. Insert into 'profiles' table
        // Note: Use 'upsert' to handle cases where a trigger might have already created it
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userData.user.id,
                email: email,
                full_name: fullName,
                role: role,
                created_at: new Date().toISOString()
            });

        if (profileError) {
            // Rollback: try to delete the auth user if profile creation fails (cleanup)
            await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
            throw profileError;
        }

        return NextResponse.json({ success: true, user: userData.user });

    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
