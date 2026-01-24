"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icons";

export default function CompanyDashboard() {
    const { user, loading } = useAuth(true);
    const router = useRouter();
    const [stats, setStats] = useState({ available: 0, my_orders: 0 });

    useEffect(() => {
        if (!user) return;

        const checkRoleAndFetchStats = async () => {
            // 1. Verify Role
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role !== 'company') {
                router.push('/');
                return;
            }

            // 1. Available Stock
            const { count: stockCount } = await supabase
                .from('inventory')
                .select('*', { count: 'exact', head: true })
                .gt('qty', 0);

            // 2. My Orders
            const { count: orderCount } = await supabase
                .from('company_orders')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', user.id);

            setStats({
                available: stockCount || 0,
                my_orders: orderCount || 0
            });
        };

        checkRoleAndFetchStats();

        // REAL-TIME
        const channel = supabase.channel('company-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => checkRoleAndFetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'company_orders', filter: `company_id=eq.${user.id}` }, () => checkRoleAndFetchStats())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/company/login");
    };

    if (loading || !user) return <div>Loading...</div>;

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

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/company/marketplace" className="btn btn-primary" style={{ padding: '0.8rem 2rem', textDecoration: 'none', borderRadius: '50px' }}>
                        Browse Marketplace
                    </Link>
                    <Link href="/company/orders" className="btn btn-outline" style={{ padding: '0.8rem 2rem', textDecoration: 'none', borderRadius: '50px' }}>
                        View Order History
                    </Link>
                </div>
            </div>
        </div>
    );
}

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
