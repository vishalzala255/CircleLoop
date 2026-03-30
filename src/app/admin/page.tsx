"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRoot() {
    const router = useRouter();
    const { user, loading } = useAuth("/admin/login");

    useEffect(() => {
        if (!loading && user) {
            router.replace("/admin/dashboard");
        }
    }, [user, loading, router]);

    return (
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
                <div>Redirecting to Admin Dashboard...</div>
            </div>
        </div>
    );
}
