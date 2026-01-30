"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PartnerMarketplace() {
    const { user, loading } = useAuth(true);
    const [inventory, setInventory] = useState<any[]>([]);
    const [ordering, setOrdering] = useState("");
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchStock();

        // REAL-TIME
        const channel = supabase.channel('marketplace')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => fetchStock())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const fetchStock = async () => {
        setLoadingData(true);
        const { data } = await supabase
            .from('inventory')
            .select('*')
            .gt('qty', 0); // Only items with stock
        if (data) setInventory(data);
        setLoadingData(false);
    };

    const handleOrder = async (item: any) => {
        if (!confirm(`Buy 1 unit of ${item.item_name} for ₹${item.price_per_unit}?`)) return;
        setOrdering(item.id);

        try {
            // 1. Create Order ID
            const orderId = `ORD-${Date.now().toString().slice(-6)}`;

            // 2. Insert into company_orders
            const { error: orderError } = await supabase
                .from('company_orders')
                .insert({
                    order_id: orderId,
                    company_id: user?.id,
                    inventory_id: item.id,
                    qty: 1,
                    price_per_unit: item.price_per_unit,
                    total_price: item.price_per_unit,
                    status: 'Requested'
                });

            if (orderError) throw orderError;

            // 3. Decrement Inventory Qty
            const { error: invError } = await supabase
                .from('inventory')
                .update({ qty: item.qty - 1 })
                .eq('id', item.id);

            if (invError) throw invError;

            alert("Order placed successfully! Order ID: " + orderId);
            fetchStock();
        } catch (err: any) {
            alert("Order failed: " + err.message);
        } finally {
            setOrdering("");
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>Loading Marketplace...</div>;
    if (!user) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-main)' }}>Please log in to access marketplace.</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar" style={{
                background: 'var(--bg-card)', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Marketplace</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <ThemeToggle />
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <Link href="/company/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>Back to Dashboard</Link>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>Available Inventory</h2>

                {loadingData ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading inventory...</p>
                ) : inventory.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No items available at the moment.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            background: 'var(--bg-card)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-section-alt)', borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Item Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Description</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Price per Unit</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>In Stock</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, index) => (
                                    <tr key={item.id} style={{
                                        borderBottom: index !== inventory.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-section-alt)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1.2rem 1rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>
                                            {item.item_name}
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                                            {item.description || 'No description'}
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                                            ₹{item.price_per_unit || "0"}
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.3rem 0.8rem',
                                                background: item.qty > 5 ? 'rgba(45, 180, 50, 0.15)' : 'rgba(255, 150, 50, 0.15)',
                                                color: item.qty > 5 ? 'var(--success)' : 'var(--warning)',
                                                borderRadius: '20px',
                                                fontWeight: 600,
                                                fontSize: '0.9rem'
                                            }}>
                                                {item.qty}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleOrder(item)}
                                                disabled={ordering === item.id || item.qty <= 0}
                                                className="btn btn-primary"
                                                style={{
                                                    padding: '0.6rem 1.5rem',
                                                    fontSize: '0.9rem',
                                                    borderRadius: '50px',
                                                    opacity: ordering === item.id || item.qty <= 0 ? 0.6 : 1,
                                                    cursor: ordering === item.id || item.qty <= 0 ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {ordering === item.id ? "Processing..." : "Order Now"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
