"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            if (!user) throw new Error("No user found");

            // Verify Admin Role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                throw new Error("Access Denied: Admins Only");
            }

            router.push("/admin/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Invalid credentials.");
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
            <div className="glass-card" style={{ background: 'var(--bg-card)', padding: '2.5rem 2rem', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 20px var(--shadow-color)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>Admin Access</h2>
                {error && <div style={{ color: 'var(--error)', textAlign: 'center', marginBottom: '1rem', background: 'rgba(193,69,61,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '50px' }}>Login as Admin</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="/" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
