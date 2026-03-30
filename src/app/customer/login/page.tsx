"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            if (!user) throw new Error("No user found");

            // Verify Customer Role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'customer') {
                await supabase.auth.signOut(); // Ensure they are logged out if role mismatch
                throw new Error("Access Denied: Please use the correct login portal for your role.");
            }

            router.push("/customer/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg-hero-gradient)',
            padding: '1rem'
        }}>
            <div className="glass-card" style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                padding: '2.5rem 2rem',
                boxShadow: '0 20px 60px var(--shadow-color)',
                width: '100%',
                maxWidth: '420px',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: '1.6rem',
                        color: 'var(--primary)',
                        marginBottom: '0.3rem'
                    }}>
                        CircleLoop
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                        Customer Access
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(193, 69, 61, 0.1)',
                        border: '1px solid var(--error)',
                        color: 'var(--error)',
                        padding: '0.8rem',
                        borderRadius: '6px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.85rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '50px' }} disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        New to CircleLoop? <Link href="/customer/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create Account</Link>
                    </div>
                    <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
