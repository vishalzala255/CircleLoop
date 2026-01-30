"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

interface ContactMessage {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    message_status: 'unread' | 'read' | 'archived';
    read_at?: string;
    read_by?: string;
}

export default function AdminMessages() {
    const { user, loading } = useAuth(true);
    const router = useRouter();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
    const [loadingMessages, setLoadingMessages] = useState(true);

    const fetchMessages = async () => {
        try {
            let query = supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('message_status', filter);
            }

            const { data, error } = await query;
            
            if (error) {
                console.error("Error fetching messages:", error);
                return;
            }
            
            setMessages(data || []);
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        
        fetchMessages();

        // Real-time subscription
        const channel = supabase
            .channel('admin-messages')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'contact_messages' 
            }, () => fetchMessages())
            .subscribe();

        return () => { 
            supabase.removeChannel(channel); 
        };
    }, [user, filter]);

    const handleMarkAsRead = async (id: string) => {
        const { error } = await supabase
            .from('contact_messages')
            .update({ 
                message_status: 'read', 
                read_at: new Date().toISOString(),
                read_by: user?.id 
            })
            .eq('id', id);

        if (error) {
            alert("Failed to mark as read: " + error.message);
        } else {
            setMessages(prev => prev.map(m => 
                m.id === id ? { ...m, message_status: 'read' as const, read_at: new Date().toISOString() } : m
            ));
        }
    };

    const handleArchive = async (id: string) => {
        const { error } = await supabase
            .from('contact_messages')
            .update({ message_status: 'archived' })
            .eq('id', id);

        if (error) {
            alert("Failed to archive: " + error.message);
        } else {
            setMessages(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this message?")) return;
        
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Failed to delete: " + error.message);
        } else {
            setMessages(prev => prev.filter(m => m.id !== id));
        }
    };

    if (loading || !user) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
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
                <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
                    Admin Messages
                </span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <Icon name="profile" size={18} /> Profile
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>|</span>
                    <Link href="/admin/dashboard" className="btn-outline" style={{ padding: '0.5rem 1.6rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '50px' }}>
                        Back to Dashboard
                    </Link>
                </div>
            </nav>

            <div className="container-max" style={{ padding: '3rem 2rem' }}>
                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    {(['all', 'unread', 'read', 'archived'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                borderBottom: filter === f ? '2px solid var(--primary)' : 'none',
                                padding: '0.5rem 1rem',
                                textTransform: 'capitalize'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Messages List */}
                {loadingMessages ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No {filter !== 'all' ? filter : ''} messages found
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className="glass-card"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderLeft: msg.message_status === 'unread' ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>
                                            {msg.name}
                                        </h3>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                                            {msg.email} • {msg.phone}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: msg.message_status === 'unread' ? 'rgba(37, 99, 235, 0.1)' : msg.message_status === 'read' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                            color: msg.message_status === 'unread' ? '#2563eb' : msg.message_status === 'read' ? '#22c55e' : 'var(--text-secondary)'
                                        }}>
                                            {msg.message_status}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--bg-body)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-main)',
                                    lineHeight: 1.6
                                }}>
                                    {msg.message}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {msg.message_status === 'unread' && (
                                        <button
                                            onClick={() => handleMarkAsRead(msg.id)}
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                    {msg.message_status !== 'archived' && (
                                        <button
                                            onClick={() => handleArchive(msg.id)}
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                        >
                                            Archive
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            fontSize: '0.8rem',
                                            color: 'var(--error)',
                                            background: 'none',
                                            border: '1px solid var(--error)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            opacity: 0.8
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
