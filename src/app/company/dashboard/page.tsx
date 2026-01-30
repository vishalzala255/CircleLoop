"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icons";

export default function CompanyDashboard() {
    const { user, loading } = useAuth(true);
    const router = useRouter();
    const [stats, setStats] = useState({ available: 0, my_orders: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [initialLoad, setInitialLoad] = useState(true);

    const checkRoleAndFetchStats = useCallback(async () => {
        if (!user) return;
        
        try {
            // 1. Verify Role
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role !== 'company') {
                router.push('/');
                return;
            }

            // Parallel fetch for performance
            const [stockCount, orderCount, ordersData] = await Promise.all([
                supabase.from('inventory').select('*', { count: 'exact', head: true }).gt('qty', 0),
                supabase.from('company_orders').select('*', { count: 'exact', head: true }).eq('company_id', user.id),
                supabase.from('company_orders')
                    .select(`
                        *,
                        inventory:inventory_id ( item_name )
                    `)
                    .eq('company_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            setStats({
                available: stockCount.count || 0,
                my_orders: orderCount.count || 0
            });

            if (ordersData.data) setRecentOrders(ordersData.data);
        } finally {
            setInitialLoad(false);
        }
    }, [user, router]);

    useEffect(() => {
        if (!user) return;

        checkRoleAndFetchStats();

        // REAL-TIME
        const channel = supabase.channel('company-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => checkRoleAndFetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'company_orders', filter: `company_id=eq.${user.id}` }, () => checkRoleAndFetchStats())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, checkRoleAndFetchStats]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/company/login");
    };

    if (loading || !user) return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--bg-body)',
            color: 'var(--text-main)',
            fontSize: '1.2rem'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>🏢</div>
                <div>Loading...</div>
            </div>
        </div>
    );

    if (initialLoad) return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--bg-body)',
            color: 'var(--text-main)'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📈</div>
                <div>Loading dashboard...</div>
            </div>
        </div>
    );

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
                <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary)' }}>Partner Dashboard</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</span>
                    <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', borderRadius: '50px' }}>Logout</button>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem', flex: 1 }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)', fontSize: '2rem' }}>Company Overview</h2>

                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginBottom: '3rem',
                    flexWrap: 'wrap'
                }}>
                    <StatCard label="Available Stock" value={stats.available} icon={<Icon name="building" size={32} />} color="var(--primary)" />
                    <StatCard label="My Orders" value={stats.my_orders} icon={<Icon name="cart" size={32} />} color="var(--accent)" />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                    <Link href="/company/marketplace" className="btn btn-primary" style={{ padding: '0.8rem 2rem', textDecoration: 'none', borderRadius: '50px' }}>
                        Browse Marketplace
                    </Link>
                    <Link href="/company/orders" className="btn btn-outline" style={{ padding: '0.8rem 2rem', textDecoration: 'none', borderRadius: '50px' }}>
                        View Order History
                    </Link>
                </div>

                {/* Recent Orders Table */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>Recent Orders</h2>
                    
                    <div className="glass-card" style={{ 
                        background: 'var(--bg-card)', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        border: '1px solid var(--border-color)' 
                    }}>
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
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ 
                                                padding: '3rem', 
                                                textAlign: 'center', 
                                                color: 'var(--text-muted)' 
                                            }}>
                                                No orders yet. Visit the marketplace to place your first order!
                                            </td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((ord) => (
                                            <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover-row">
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                                        {ord.order_id}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>{ord.inventory?.item_name || ord.item_name || "N/A"}</td>
                                                <td style={tdStyle}>{ord.qty}</td>
                                                <td style={tdStyle}>
                                                    <b style={{ color: 'var(--text-main)' }}>₹{ord.total_price}</b>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        padding: '4px 12px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: 600,
                                                        background: ord.status === 'Requested' ? 'rgba(37, 99, 235, 0.1)' : 
                                                                   ord.status === 'Approved' ? 'rgba(34, 197, 94, 0.1)' : 
                                                                   'rgba(217, 108, 52, 0.1)',
                                                        color: ord.status === 'Requested' ? '#2563eb' : 
                                                               ord.status === 'Approved' ? '#22c55e' : 
                                                               'var(--accent)'
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

                    {recentOrders.length > 0 && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <Link href="/company/orders" style={{ 
                                color: 'var(--primary)', 
                                textDecoration: 'none', 
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>
                                View All Orders →
                            </Link>
                        </div>
                    )}
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

const thStyle = {
    textAlign: 'left' as const,
    padding: '1rem 1.2rem',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '1rem 1.2rem',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    borderBottom: '1px solid var(--border-color)'
};

function StatCard({ label, value, icon, color }: { label: string, value: number, icon?: React.ReactNode, color?: string }) {
    return (
        <div className="glass-card card-hover" style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            flex: 1,
            minWidth: '280px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
        }}>
            {icon && (
                <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '12px',
                    background: `color-mix(in srgb, ${color || 'var(--primary)'}, transparent 85%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem',
                    color: color || 'var(--primary)'
                }}>
                    {icon}
                </div>
            )}
            <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );
}
