"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function PartnerOrders() {
    const { user, loading } = useAuth(true);
    const [orders, setOrders] = useState<any[]>([]);

    const fetchOrders = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('company_orders')
            .select(`
                *,
                inventory:inventory_id ( item_name )
            `)
            .eq('company_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setOrders(data);
    };

    useEffect(() => {
        if (!user) return;
        fetchOrders();

        // REAL-TIME
        const channel = supabase.channel('company-orders-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'company_orders',
                filter: `company_id=eq.${user.id}`
            }, () => fetchOrders())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    if (loading || !user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your orders...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar" style={{
                background: 'var(--bg-card)', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Purchase History</span>
                <Link href="/company/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>Back to Dashboard</Link>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>My Orders</h2>

                <div className="glass-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={thStyle}>Order ID</th>
                                    <th style={thStyle}>Item Name</th>
                                    <th style={thStyle}>Quantity</th>
                                    <th style={thStyle}>Total Price</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>You haven't placed any orders yet.</td></tr>
                                ) : (
                                    orders.map((ord) => (
                                        <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-row">
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600 }}>{ord.order_id}</div>
                                            </td>
                                            <td style={tdStyle}>{ord.inventory?.item_name || ord.item_name || "N/A"}</td>
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
                                            <td style={tdStyle}>
                                                {new Date(ord.created_at).toLocaleDateString()}
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
