"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompanyLogin() {
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

            // Verify Role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'company') {
                throw new Error("Not a company account");
            }

            router.push("/company/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Invalid credentials.");
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
            <div className="glass-card" style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '8px', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px var(--shadow-color)' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>Partner Login</h2>
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
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '50px' }}>Sign In</button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link href="/company/register" style={{ color: 'var(--accent)' }}>Join as Partner</Link>
                    <br /><br />
                    <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
