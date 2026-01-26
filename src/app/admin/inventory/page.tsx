"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function AdminInventory() {
    const { user, loading } = useAuth(true); // Should ideally check for role='admin' specifically too
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [stock, setStock] = useState<any[]>([]);
    const [tab, setTab] = useState("requests");
    const [submitting, setSubmitting] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Fetch & Subscribe
    const fetchData = useCallback(async () => {
        try {
            const [reqResponse, invResponse] = await Promise.all([
                supabase
                    .from('pickup_requests')
                    .select('*, profiles:user_id ( full_name, email )')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('inventory')
                    .select('*')
                    .order('created_at', { ascending: false })
            ]);

            if (reqResponse.data) setRequests(reqResponse.data);
            if (invResponse.data) setStock(invResponse.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        fetchData();

        // ZERO-LAG REALTIME SUBSCRIPTION
        const channel = supabase.channel('admin-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => fetchData())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, fetchData]);

    const handleStatusUpdate = async (id: string, newStatus: string, item: any) => {
        setSubmitting(true);
        
        try {
            // 1. Update Status
            const { error } = await supabase
                .from('pickup_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) {
                alert("Update failed: " + error.message);
                return;
            }

            // 2. Log History (Legacy Audit Log)
            await supabase.from('request_status_history').insert({
                pickup_request_id: Number(id),
                status: newStatus,
                updated_by: 'admin'
            });

            // 3. Auto-Migrate to Inventory (Legacy: IF 'Collected')
            if (newStatus === "Collected") {
                const { error: invError } = await supabase
                    .from('inventory')
                    .insert({
                        item_name: item.ewaste_type || "Collected Item",
                        qty: Number(item.qty) || 1,
                        price_per_unit: 0,
                        source_request_id: Number(id)
                    });
                if (invError) {
                    console.error("Inventory Sync Error:", invError);
                    alert("Item collected but failed to add to inventory: " + invError.message);
                }
            }
            
            // Immediate local state update for better UX
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (newStatus === "Collected") {
                setStock(prev => [...prev, {
                    id: Date.now().toString(),
                    item_name: item.ewaste_type || "Collected Item",
                    qty: Number(item.qty) || 1,
                    price_per_unit: 0,
                    source_request_id: Number(id),
                    created_at: new Date().toISOString()
                }]);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleManualAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const name = (form.elements.namedItem('item_name') as HTMLInputElement).value;
        const q = (form.elements.namedItem('qty') as HTMLInputElement).value;
        const p = (form.elements.namedItem('price') as HTMLInputElement).value;

        setSubmitting(true);
        try {
            const newItem = {
                item_name: name,
                qty: Number(q),
                price_per_unit: Number(p),
                source_request_id: null // Manual entry
            };
            
            const { data, error } = await supabase
                .from('inventory')
                .insert(newItem)
                .select()
                .single();

            if (error) {
                alert("Add failed: " + error.message);
                return;
            }
            
            // Immediate local state update
            if (data) {
                setStock(prev => [data, ...prev]);
            }
            
            form.reset();
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePrice = async (invId: string, price: number) => {
        const { error } = await supabase
            .from('inventory')
            .update({ price_per_unit: price })
            .eq('id', invId);

        if (error) alert("Price update failed");
        else fetchData();
    };

    const handleDelete = async (table: string, id: string) => {
        if (!confirm(`Permanently delete this from ${table}?`)) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) alert(error.message);
        else fetchData();
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
                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⏳</div>
                <div>Loading Inventory...</div>
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
                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📦</div>
                <div>Loading data...</div>
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
                alignItems: 'center',
                position: 'sticky', top: 0, zIndex: 50
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Admin Inventory</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <Link href="/admin/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>Back to Dashboard</Link>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <button
                        onClick={() => setTab('requests')}
                        style={{ background: 'none', border: 'none', color: tab === 'requests' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', borderBottom: tab === 'requests' ? '2px solid var(--primary)' : 'none', padding: '0.5rem 1rem' }}
                    >
                        Pickup Requests
                    </button>
                    <button
                        onClick={() => setTab('stock')}
                        style={{ background: 'none', border: 'none', color: tab === 'stock' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', borderBottom: tab === 'stock' ? '2px solid var(--primary)' : 'none', padding: '0.5rem 1rem' }}
                    >
                        Priced Stock (Marketplace)
                    </button>
                </div>

                {tab === 'requests' ? (
                    <div className="glass-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={thStyle}>Request ID</th>
                                        <th style={thStyle}>Item</th>
                                        <th style={thStyle}>User</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>No requests found.</td></tr>}
                                    {requests.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 700 }}>{item.request_id || "Legacy"}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td style={tdStyle}>{item.ewaste_type} <br /><small>{item.qty} units</small></td>
                                            <td style={tdStyle}>{item.profiles?.full_name}</td>
                                            <td style={tdStyle}>
                                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--primary)' }}>{item.status}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    {item.status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(item.id, 'Accepted', item)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>Accept</button>
                                                            <button onClick={() => handleStatusUpdate(item.id, 'Rejected', item)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--error)', color: 'var(--error)' }}>Reject</button>
                                                        </>
                                                    )}
                                                    {item.status === 'Accepted' && (
                                                        <button onClick={() => handleStatusUpdate(item.id, 'Collected', item)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Recycle</button>
                                                    )}
                                                    <button onClick={() => handleDelete('pickup_requests', item.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                        {/* Manual Add Form */}
                        <div className="glass-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Add Manual Item</h4>
                            <form onSubmit={handleManualAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Item Name</label>
                                    <input name="item_name" required placeholder="e.g. Fridge, TV, Laptop" style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quantity</label>
                                        <input name="qty" type="number" required min="1" defaultValue="1" style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price (₹)</label>
                                        <input name="price" type="number" required min="0" step="0.01" defaultValue="0" style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }} />
                                    </div>
                                </div>
                                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    {submitting ? 'Adding...' : 'Add to Stock'}
                                </button>
                            </form>
                        </div>

                        {/* Stock Table - Full Width */}
                        <div className="glass-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'auto', width: '100%' }}>
                            <div style={{ overflowX: 'auto', width: '100%' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={thStyle}>No.</th>
                                            <th style={thStyle}>Item Name</th>
                                            <th style={thStyle}>Source</th>
                                            <th style={thStyle}>Qty</th>
                                            <th style={thStyle}>Price (₹)</th>
                                            <th style={thStyle}>Update Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stock.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No items in stock.</td></tr>}
                                        {stock.map((s, index) => (
                                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={tdStyle}>{index + 1}</td>
                                                <td style={tdStyle}><strong>{s.item_name}</strong></td>
                                                <td style={tdStyle}>
                                                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', background: s.source_request_id ? 'rgba(37, 99, 235, 0.1)' : 'rgba(156, 163, 175, 0.1)', color: s.source_request_id ? '#2563eb' : 'var(--text-secondary)' }}>
                                                        {s.source_request_id ? 'Auto' : 'Manual'}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>{s.qty}</td>
                                                <td style={tdStyle}>₹{s.price_per_unit || "0.00"}</td>
                                                <td style={tdStyle}>
                                                    <form onSubmit={(e) => {
                                                        e.preventDefault();
                                                        const p = (e.currentTarget.elements.namedItem('new_price') as HTMLInputElement).value;
                                                        handleUpdatePrice(s.id, Number(p));
                                                    }} style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input name="new_price" type="number" step="0.01" placeholder="₹" style={{ width: '80px', borderRadius: '4px', padding: '0.3rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                                                        <button type="submit" className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{` .hover-row:hover { background-color: var(--bg-section-alt); } `}</style>
        </div>
    );
}

const thStyle = { textAlign: 'left' as const, padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const tdStyle = { padding: '1.2rem 1.5rem', color: 'var(--text-main)', fontSize: '0.95rem' };
