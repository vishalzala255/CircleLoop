"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function CustomerDashboard() {
    const { user, loading } = useAuth(true);
    const router = useRouter();
    const [stats, setStats] = useState({ total_requests: 0, pending: 0, completed: 0 });
    const [rewards, setRewards] = useState<any[]>([]);
    const [trackId, setTrackId] = useState("");
    const [trackResult, setTrackResult] = useState<any>(null);
    const [trackError, setTrackError] = useState("");

    const checkRoleAndFetchStats = async () => {
        if (!user) return;
        // 1. Verify Role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'customer') {
            router.push('/');
            return;
        }

        // 2. Fetch all requests for this user
        const { data } = await supabase
            .from('pickup_requests')
            .select('status')
            .eq('user_id', user.id);

        if (data) {
            let total = data.length;
            let pending = data.filter(r => r.status === 'Pending').length;
            let completed = data.filter(r => r.status === 'Completed' || r.status === 'Collected').length;
            setStats({ total_requests: total, pending, completed });
        }

        // 3. Fetch recent rewards
        const { data: rewardsData } = await supabase
            .from('rewards')
            .select('*')
            .eq('customer_id', user.id)
            .eq('status', 'Issued')
            .order('created_at', { ascending: false })
            .limit(3);

        if (rewardsData) {
            setRewards(rewardsData);
        }
    };

    useEffect(() => {
        if (!user) return;
        checkRoleAndFetchStats();

        // ZERO-LAG REALTIME SUBSCRIPTION
        const channel = supabase.channel('customer-dashboard')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'pickup_requests',
                filter: `user_id=eq.${user.id}`
            }, () => {
                checkRoleAndFetchStats();
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'rewards',
                filter: `customer_id=eq.${user.id}`
            }, (payload) => {
                if (payload.new) {
                    setRewards(prev => [payload.new, ...prev].slice(0, 3));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/customer/login");
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setTrackError("");
        setTrackResult(null);

        if (!trackId) return;

        const { data, error } = await supabase
            .from('pickup_requests')
            .select('*')
            .eq('request_id', trackId)
            .eq('user_id', user?.id)
            .single();

        if (error) {
            setTrackError("Request ID not found or unauthorized.");
        } else {
            setTrackResult(data);
        }
    };

    if (loading || !user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

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
                <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary)' }}>My Dashboard</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <Link href="/" className="btn-outline" style={{ display: 'inline-block', color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', border: 'none', background: 'none', borderRadius: '50px' }}>Back to Home</Link>
                    <button
                        onClick={handleLogout}
                        className="btn-outline"
                        style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', borderRadius: '50px' }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem', flex: 1 }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)', fontSize: '2rem' }}>Overview</h2>

                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginBottom: '3rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem'
                }}>
                    <StatCard label="Total Requests" value={stats.total_requests} icon={<Icon name="box" size={32} />} color="var(--primary)" />
                    <StatCard label="Pending" value={stats.pending} icon={<Icon name="refresh" size={32} />} color="var(--accent)" />
                    <StatCard label="Completed" value={stats.completed} icon={<Icon name="check" size={32} />} color="var(--success)" />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
                    <Link href="/customer/request" className="btn btn-primary" style={{ borderRadius: '50px', padding: '0.8rem 2rem' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>+</span>
                        New Pickup Request
                    </Link>
                    <Link href="/customer/rewards" className="btn btn-primary" style={{ borderRadius: '50px', padding: '0.8rem 2rem', background: 'var(--accent)' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🎁</span>
                        View Rewards & Coupons
                    </Link>
                    <Link href="/customer/history" className="btn btn-outline" style={{ borderRadius: '50px', padding: '0.8rem 2rem' }}>
                        View Full History
                    </Link>
                </div>

                {/* Recent Rewards Section */}
                {rewards.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', color: 'var(--text-main)' }}>🎉 You've Earned Rewards!</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {rewards.map((reward) => (
                                <div key={reward.id} style={{
                                    padding: '1.5rem',
                                    background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.1) 0%, rgba(217, 108, 52, 0.08) 100%)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.8rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', margin: 0 }}>{reward.reward_name}</h4>
                                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--success)', color: 'white' }}>Earned</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{reward.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Value: <strong style={{ color: 'var(--accent)' }}>{reward.reward_value} {reward.reward_type}</strong></span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(reward.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tracking Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Search Panel */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Track a Request</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Enter your Request ID to see its current status in real-time.</p>
                        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                value={trackId}
                                onChange={(e) => setTrackId(e.target.value)}
                                placeholder="EW-XXXX-XXXX"
                                style={{ flex: 1, borderRadius: '50px', padding: '0.8rem 1.5rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.2rem', borderRadius: '50px' }}>Track</button>
                        </form>
                        {trackError && <p style={{ color: 'var(--error)', marginTop: '1rem', fontSize: '0.85rem' }}>{trackError}</p>}
                    </div>

                    {/* Result Panel */}
                    <div className="glass-card" style={{
                        padding: '2.5rem',
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: trackResult ? 'flex-start' : 'center',
                        alignItems: trackResult ? 'flex-start' : 'center',
                        minHeight: '200px'
                    }}>
                        {!trackResult ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <Icon name="search" size={48} />
                                </div>
                                <p>Search for a request to view details here.</p>
                            </div>
                        ) : (
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Tracking Details</h4>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--accent)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        {trackResult.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <DetailRow label="ID" value={trackResult.request_id} />
                                    <DetailRow label="Type" value={trackResult.ewaste_type} />
                                    <DetailRow label="Quantity" value={trackResult.qty} />
                                    <DetailRow label="Pickup" value={`${trackResult.pickup_date} (${trackResult.pickup_time})`} />
                                    <DetailRow label="Created" value={new Date(trackResult.created_at).toLocaleDateString()} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: any }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{value}</span>
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
            minWidth: '240px',
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
