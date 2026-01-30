"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Icon } from "@/components/Icons";

export default function ProfilePage() {
    const { user, profile, loading, updateProfile } = useAuth(true);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({ full_name: "", phone: "", address: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setEditData({
                full_name: profile.full_name || "",
                phone: profile.phone || "",
                address: profile.address || ""
            });
        }
    }, [profile]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await updateProfile(editData);
        if (error) {
            const msg = typeof error === 'string' ? error : error.message;
            alert(msg);
        } else {
            setIsEditing(false);
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading || !user) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', color: 'var(--text-main)' }}>Loading Profile...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main className="container-max" style={{ padding: '4rem 2rem', flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ maxWidth: '800px', width: '100%' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Personal Profile</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and account settings.</p>
                    </div>

                    <div className="glass-card" style={{
                        background: 'var(--bg-card)',
                        padding: '3rem',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 20px 50px var(--shadow-color)',
                        display: 'grid',
                        gap: '2.5rem'
                    }}>
                        {/* Profile Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2.5rem' }}>
                            <div style={{
                                width: '100px', height: '100px',
                                borderRadius: '50%',
                                background: 'rgba(45, 80, 22, 0.1)',
                                color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--border-color)'
                            }}>
                                <Icon name="profile" size={48} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{profile?.full_name || "Member"}</h2>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    background: 'rgba(45, 80, 22, 0.1)',
                                    color: 'var(--primary)',
                                    marginTop: '0.5rem',
                                    textTransform: 'uppercase'
                                }}>
                                    {profile?.role || "User"}
                                </span>
                            </div>
                        </div>

                        {/* Details / Edit Form */}
                        {isEditing ? (
                            <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} placeholder="+91 ..." />
                                </div>
                                {profile?.role === 'customer' && (
                                    <div className="form-group">
                                        <label>Pickup Address</label>
                                        <textarea value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} rows={3} placeholder="Your default collection address" />
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{saving ? "Saving..." : "Save Changes"}</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                {/* Details Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                    <DetailItem label="Full Name" value={profile?.full_name} />
                                    <DetailItem label="Email Address" value={user.email} />
                                    <DetailItem label="Phone Number" value={profile?.phone || "Not provided"} />
                                    <DetailItem label="Account Created" value={new Date(profile?.created_at).toLocaleDateString()} />

                                    {profile?.role === 'customer' && (
                                        <DetailItem label="Pickup Address" value={profile?.address || "No address saved"} fullWidth />
                                    )}

                                    {profile?.role === 'company' && (
                                        <>
                                            <DetailItem label="Company Name" value={profile?.company_name} />
                                            <DetailItem label="Industry" value={profile?.industry_type} />
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                                    <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>
                                        Edit Profile
                                    </button>
                                    <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.8rem 2.5rem', color: 'var(--error)', borderColor: 'var(--error)' }}>
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function DetailItem({ label, value, fullWidth = false }: { label: string, value?: string, fullWidth?: boolean }) {
    return (
        <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 500 }}>{value || "N/A"}</div>
        </div>
    );
}
