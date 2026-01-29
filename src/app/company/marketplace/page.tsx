"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Icon } from "@/components/Icons";

export default function PartnerMarketplace() {
    const { user, loading } = useAuth(true);
    const [inventory, setInventory] = useState<any[]>([]);
    const [ordering, setOrdering] = useState("");

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
        const { data } = await supabase
            .from('inventory')
            .select('*')
            .gt('qty', 0); // Only items with stock
        if (data) setInventory(data);
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

    if (loading || !user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Marketplace...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar" style={{
                background: 'var(--bg-card)', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>Marketplace</span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <Link href="/company/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>Back to Dashboard</Link>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                <h2 style={{ marginBottom: '2rem' }}>Available Inventory</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {inventory.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No items available at the moment.</p>}
                    {inventory.map(item => (
                        <div key={item.id} className="glass-card card-hover" style={{
                            background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)',
                            display: 'flex', flexDirection: 'column', gap: '1rem'
                        }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{item.item_name}</h3>
                            {item.description && (
                                <p style={{ 
                                    fontSize: '0.85rem', 
                                    color: 'var(--text-secondary)', 
                                    lineHeight: 1.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {item.description}
                                </p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price per unit</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{item.price_per_unit || "0"}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>In Stock</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{item.qty}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleOrder(item)}
                                disabled={ordering === item.id || item.qty <= 0}
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1rem', borderRadius: '50px' }}
                            >
                                {ordering === item.id ? "Processing..." : "Order Now"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
