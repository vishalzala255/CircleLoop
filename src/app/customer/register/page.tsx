"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Sign Up
            const { data: { user }, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { full_name: formData.name } // Stored in Auth Metadata
                }
            });

            if (authError) throw authError;
            if (!user) throw new Error("No user created");

            // 2. Insert into Profiles Table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: formData.email,
                    full_name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    role: 'customer'
                });

            if (profileError) throw profileError;

            router.push("/customer/dashboard");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Registration failed.");
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
                padding: '2.5rem 2rem',
                boxShadow: '0 20px 60px var(--shadow-color)',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.6rem', color: 'var(--primary)' }}>
                        CircleLoop
                    </div>
                    <div style={{ color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 600 }}>
                        Join the Green Revolution
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(193, 69, 61, 0.1)',
                        color: 'var(--error)',
                        padding: '0.8rem',
                        borderRadius: '6px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        border: '1px solid var(--error)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="text" id="phone" value={formData.phone} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input type="text" id="address" value={formData.address} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={formData.password} onChange={handleChange} required minLength={6} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: '50px' }} disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Already have an account? <Link href="/customer/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
                    </div>
                    <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
