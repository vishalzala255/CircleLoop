"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icons";

export default function AdminDashboard() {
    const { user, loading } = useAuth(true);
    const router = useRouter();
    const [stats, setStats] = useState({ users: 0, companies: 0, requests: 0 });
    const [userList, setUserList] = useState<any[]>([]);
    const [isDeleting, setIsDeleting] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ fullName: "", email: "", password: "", role: "customer" });
    const [creating, setCreating] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Fetch Stats & Users on Load
    const fetchData = useCallback(async () => {
        try {
            // Parallel fetch for better performance
            const [usersCount, companiesCount, requestsCount, profiles] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'company'),
                supabase.from('pickup_requests').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*').order('created_at', { ascending: false })
            ]);

            setStats({
                users: usersCount.count || 0,
                companies: companiesCount.count || 0,
                requests: requestsCount.count || 0
            });

            if (profiles.data) setUserList(profiles.data);
        } finally {
            setInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user, fetchData]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create user");

            alert("User created successfully!");
            setShowModal(false);
            setFormData({ fullName: "", email: "", password: "", role: "customer" });
            fetchData(); // Refresh list
        } catch (err: any) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This will also delete all their requests.")) return;
        setIsDeleting(userId);

        try {
            // 1. Delete associated requests first (to avoid FK constraint errors)
            const { error: reqError } = await supabase.from('pickup_requests').delete().eq('user_id', userId);
            if (reqError) throw reqError;

            // 2. Delete from profiles (effectively bans them)
            const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
            if (profileError) throw profileError;

            // 3. Refresh list locally
            setUserList(prev => prev.filter(u => u.id !== userId));

            // 4. Update stats
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert("Error deleting user: " + err.message);
        } finally {
            setIsDeleting("");
        }
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
                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⚙️</div>
                <div>Loading System...</div>
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
                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📊</div>
                <div>Loading dashboard...</div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav className="navbar" style={{
                background: 'var(--bg-card)',
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Admin Portal</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{user.email}</span>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Logout</button>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem', flex: 1 }}>

                {/* 1. Horizontal Stats Row */}
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>System Overview</h2>
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    marginBottom: '4rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem'
                }}>
                    <StatCard label="Total Users" value={stats.users} icon={<Icon name="users" size={32} />} color="var(--primary)" />
                    <StatCard label="Active Partners" value={stats.companies} icon={<Icon name="building" size={32} />} color="var(--accent)" />
                    <StatCard label="Total Requests" value={stats.requests} icon={<Icon name="recycling" size={32} />} color="#2563eb" />
                </div>

                {/* 2. Management Controls Section */}
                <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ color: 'var(--text-main)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Management Controls</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        <Link href="/admin/companies" className="btn btn-outline" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none', borderColor: 'var(--accent)', color: 'var(--accent)', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icon name="building" size={16} /> View Companies
                        </Link>
                        <Link href="/admin/sales" className="btn btn-outline" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icon name="money" size={16} /> Sales Report
                        </Link>
                        <Link href="/admin/inventory" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icon name="box" size={16} /> Inventory Management
                        </Link>
                        <Link href="/admin/messages" className="btn btn-outline" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                            <Icon name="mail" size={16} /> Contact Messages
                        </Link>
                        <button className="btn btn-outline" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={fetchData}>
                            <Icon name="refresh" size={16} /> Refresh Data
                        </button>
                        <button className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem', borderRadius: '50px', marginLeft: 'auto' }} onClick={() => setShowModal(true)}>
                            + Add User
                        </button>
                    </div>

                    <div className="glass-card" style={{
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px var(--shadow-color)'
                    }}>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={thStyle}>No.</th>
                                        <th style={thStyle}>Full Name</th>
                                        <th style={thStyle}>Email</th>
                                        <th style={thStyle}>Role</th>
                                        <th style={thStyle}>Access Level</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userList.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found in database.</td>
                                        </tr>
                                    ) : (
                                        userList.map((u, index) => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover-row">
                                                <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{index + 1}</span></td>
                                                <td style={{ ...tdStyle, fontWeight: 600 }}>{u.full_name || "N/A"}</td>
                                                <td style={tdStyle}>{u.email}</td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background: u.role === 'admin' ? 'rgba(217, 70, 239, 0.1)' : u.role === 'company' ? 'rgba(217, 108, 52, 0.1)' : 'rgba(45, 80, 22, 0.1)',
                                                        color: u.role === 'admin' ? '#d946ef' : u.role === 'company' ? 'var(--accent)' : 'var(--primary)',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                                        Active
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            disabled={isDeleting === u.id}
                                                            style={{
                                                                padding: '0.4rem 1rem',
                                                                background: 'rgba(193, 69, 61, 0.1)',
                                                                color: 'var(--error)',
                                                                border: 'none',
                                                                borderRadius: '50px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {isDeleting === u.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{
                        background: '#1e293b',
                        padding: '2.5rem',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '450px',
                        border: '1px solid #334155',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <h3 style={{ marginBottom: '2rem', color: '#4ade80', textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}>Add New User</h3>

                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label style={{ color: '#94a3b8' }}>Full Name</label>
                                <input
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="John Doe"
                                    style={{ background: '#0f172a', borderColor: '#334155', color: 'white' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#94a3b8' }}>Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    style={{ background: '#0f172a', borderColor: '#334155', color: 'white' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#94a3b8' }}>Password</label>
                                <input
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min 6 characters"
                                    minLength={6}
                                    style={{ background: '#0f172a', borderColor: '#334155', color: 'white' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#94a3b8' }}>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    style={{ background: '#0f172a', borderColor: '#334155', color: 'white' }}
                                    aria-label="User role"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="company">Company (Partner)</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn"
                                disabled={creating}
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    background: '#4ade80',
                                    color: '#0f172a',
                                    fontWeight: 700,
                                    border: 'none',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(74, 222, 128, 0.4)'
                                }}
                            >
                                {creating ? 'Creating...' : 'Create Account'}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .hover-row:hover {
                    background-color: var(--bg-section-alt);
                }
            `}</style>
        </div>
    );
}

// Sub-components
function StatCard({ label, value, icon, color }: any) {
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
            <div style={{
                width: '60px', height: '60px',
                borderRadius: '12px',
                background: `color-mix(in srgb, ${color}, transparent 85%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                color: color
            }}>
                {icon}
            </div>
            <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );
}

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
    fontSize: '0.95rem',
    borderBottom: '1px solid var(--border-color)'
};
