"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompanyRegister() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        type: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: any) => {
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
                    data: { full_name: formData.name, role: 'company' }
                }
            });

            if (authError) throw authError;
            if (!user) throw new Error("User creation failed");

            // 2. Insert into Profiles
            // Note: Assuming 'companies' table logic is merged into 'profiles' as per Single Table Design in migration plan,
            // OR we insert into specific 'companies' table if you strictly followed that. 
            // Based on my proposed SQL in guide, I put everything in `profiles` with `role`, `company_name`, `industry_type`.

            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: formData.email,
                    full_name: formData.name, // Using name as company name/contact
                    company_name: formData.name,
                    industry_type: formData.type,
                    phone: formData.phone,
                    role: 'company'
                });

            if (profileError) throw profileError;

            router.push("/company/dashboard");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)', padding: '1rem' }}>
            <div className="glass-card" style={{
                background: 'var(--bg-card)',
                padding: '2.5rem',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 30px var(--shadow-color)'
            }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: 800 }}>Partner Registration</h2>
                {error && <div style={{ color: 'var(--error)', textAlign: 'center', marginBottom: '1rem', background: 'rgba(193,69,61,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="Green Startups Inc." />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} required placeholder="partner@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" id="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 890" />
                    </div>
                    <div className="form-group">
                        <label>Industry Type</label>
                        <select id="type" value={formData.type} onChange={handleChange} required>
                            <option value="">Select Type</option>
                            <option value="Recycler">Recycler</option>
                            <option value="Logistics">Logistics</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" id="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="••••••••" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', borderRadius: '50px' }} disabled={loading}>
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link href="/company/login" style={{ color: 'var(--accent)' }}>Already a Partner?</Link>
                    <div style={{ marginTop: '0.8rem' }}>
                        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
