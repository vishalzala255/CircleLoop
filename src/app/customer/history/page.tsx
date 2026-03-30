"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Icon } from "@/components/Icons";

export default function PickupHistory() {
    const { user, loading } = useAuth(true);
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
            const { data } = await supabase
                .from('pickup_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setRequests(data);
        };

        fetchHistory();
    }, [user]);

    if (loading || !user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading History...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar" style={{
                background: 'var(--bg-card)',
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Pickup History</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <Link href="/customer/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>Back to Dashboard</Link>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>My Activity</h2>

                <div className="glass-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={thStyle}>Request ID</th>
                                    <th style={thStyle}>Item Type</th>
                                    <th style={thStyle}>Qty</th>
                                    <th style={thStyle}>Scheduled Date</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No requests found.</td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-row">
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600 }}>{req.request_id || `REQ-${String(req.id).slice(0, 5)}`}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(req.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td style={tdStyle}>{req.ewaste_type || req.waste_type}</td>
                                            <td style={tdStyle}>{req.qty}</td>
                                            <td style={tdStyle}>{req.pickup_date} <br /><small>{req.pickup_time}</small></td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    background: getStatusBg(req.status),
                                                    color: getStatusColor(req.status),
                                                }}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .hover-row:hover {
                    background-color: var(--bg-section-alt);
                }
            `}</style>
        </div>
    );
}

const getStatusBg = (status: string) => {
    switch (status) {
        case 'Pending': return 'rgba(251, 146, 60, 0.1)';
        case 'Collected': return 'rgba(37, 99, 235, 0.1)';
        case 'Completed': return 'rgba(45, 80, 22, 0.1)';
        case 'Rejected': return 'rgba(193, 69, 61, 0.1)';
        default: return 'var(--bg-section-alt)';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pending': return 'var(--accent)';
        case 'Collected': return '#2563eb';
        case 'Completed': return 'var(--primary)';
        case 'Rejected': return 'var(--error)';
        default: return 'var(--text-secondary)';
    }
};

const thStyle = {
    textAlign: 'left' as const,
    padding: '1.2rem 1.5rem',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '1.2rem 1.5rem',
    color: 'var(--text-main)',
    fontSize: '0.95rem'
};
