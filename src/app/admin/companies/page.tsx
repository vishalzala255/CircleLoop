"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Icon } from "@/components/Icons";

export default function AdminCompanies() {
    const { user, loading } = useAuth(true);
    const [companies, setCompanies] = useState<any[]>([]);

    const fetchCompanies = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'company')
            .order('created_at', { ascending: false });
        if (data) setCompanies(data);
    };

    useEffect(() => {
        if (!user) return;
        fetchCompanies();

        // Real-time subscription
        const channel = supabase.channel('companies-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchCompanies())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    if (loading || !user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Partners...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar" style={{
                background: 'var(--bg-card)', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Recycling Partners</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <Link href="/admin/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>Back to Dashboard</Link>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>Registered Companies</h2>

                <div className="glass-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Company Name</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Contact</th>
                                    <th style={thStyle}>Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No companies registered yet.</td></tr>
                                ) : (
                                    companies.map((co, index) => (
                                        <tr key={co.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-row">
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600 }}>{co.full_name || "N/A"}</div>
                                            </td>
                                            <td style={tdStyle}>{co.email}</td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '0.9rem' }}>{co.phone || "No phone"}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{co.address || "No address"}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                {new Date(co.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style jsx global>{` .hover-row:hover { background-color: var(--bg-section-alt); } `}</style>
        </div>
    );
}

const thStyle = { textAlign: 'left' as const, padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const tdStyle = { padding: '1.2rem 1.5rem', color: 'var(--text-main)', fontSize: '0.95rem' };
