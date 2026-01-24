"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Icon } from "@/components/Icons";

export default function AdminSales() {
    const { user, loading } = useAuth(true);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            const { data } = await supabase
                .from('company_orders')
                .select(`
                    *,
                    profiles:company_id ( full_name, email ),
                    inventory:inventory_id ( item_name )
                `)
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
        };

        fetchOrders();

        // REAL-TIME
        const channel = supabase.channel('sales-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'company_orders' }, () => fetchOrders())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    if (loading || !user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Sales Data...</div>;

    const totalRevenue = orders.reduce((sum, ord) => sum + Number(ord.total_price), 0);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar" style={{
                background: 'var(--bg-card)', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Sales & Orders</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <Link href="/admin/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>Back to Dashboard</Link>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--text-main)' }}>Company Orders Report</h2>
                    <div style={{ background: 'var(--bg-card)', padding: '1rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Revenue</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{totalRevenue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={thStyle}>No.</th>
                                    <th style={thStyle}>Order ID</th>
                                    <th style={thStyle}>Company</th>
                                    <th style={thStyle}>Item</th>
                                    <th style={thStyle}>Qty</th>
                                    <th style={thStyle}>Total</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</td></tr>
                                ) : (
                                    orders.map((ord, index) => (
                                        <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-row">
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600 }}>{ord.order_id}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(ord.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td style={tdStyle}>{ord.profiles?.full_name}</td>
                                            <td style={tdStyle}>{ord.inventory?.item_name}</td>
                                            <td style={tdStyle}>{ord.qty}</td>
                                            <td style={tdStyle}><b>₹{ord.total_price}</b></td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                                                    background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb'
                                                }}>
                                                    {ord.status}
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
            <style jsx global>{` .hover-row:hover { background-color: var(--bg-section-alt); } `}</style>
        </div>
    );
}

const thStyle = { textAlign: 'left' as const, padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const tdStyle = { padding: '1.2rem 1.5rem', color: 'var(--text-main)', fontSize: '0.95rem' };
