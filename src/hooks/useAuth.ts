"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export function useAuth(requireAuth = false) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const fetchedId = useRef<string | null>(null);

    const fetchProfile = async (uid: string) => {
        if (fetchedId.current === uid) return;
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
        if (data) {
            setProfile(data);
            fetchedId.current = uid;
        }
        return data;
    };

    const updateProfile = async (updates: any) => {
        if (!user) return { error: "No user logged in" };
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (!error && data) {
            setProfile(data);
        }
        return { data, error };
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                }
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                fetchedId.current = null;
                if (requireAuth) router.push("/customer/login");
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [requireAuth, router]);

    return { user, profile, loading, updateProfile, refreshProfile: () => { fetchedId.current = null; if (user) fetchProfile(user.id); } };
}
