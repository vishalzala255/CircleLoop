"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Icon } from './Icons';

export default function Navbar() {
    const pathname = usePathname();
    const { user, profile, loading } = useAuth();

    const getDashboardLink = () => {
        if (profile?.role === 'admin') return '/admin/dashboard';
        if (profile?.role === 'company') return '/company/dashboard';
        return '/customer/dashboard';
    };

    return (
        <nav className="navbar" style={{
            background: 'var(--bg-glass)', // Uses theme variable
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-color)',
            padding: '1.2rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background-color 0.3s ease'
        }}>
            <div className="container-max" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" className="navbar-brand" style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: 'var(--primary)',
                    letterSpacing: '-0.5px'
                }}>
                    CircleLoop<span style={{ color: 'var(--accent)' }}>.</span>
                </Link>
                <div style={{ display: 'flex', gap: 'calc(0.5rem + 1vw)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link href="/" className="nav-link" style={linkStyle(pathname === '/')}>Home</Link>
                    <Link href="/customer/request" className="nav-link" style={linkStyle(pathname.startsWith('/customer/request'))}>Recycle</Link>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Auth Links / Dynamic Profile */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {!loading && user ? (
                            <>
                                <Link href="/profile" className="nav-link" style={linkStyle(pathname === '/profile')}>
                                    <Icon name="profile" size={18} style={{ marginRight: '0.5rem' }} /> Profile
                                </Link>
                                <Link href={getDashboardLink()} style={{
                                    padding: '0.6rem 1.4rem',
                                    background: 'var(--primary)',
                                    color: 'var(--btn-text)', // Theme sensitive text
                                    borderRadius: '50px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    transition: 'transform 0.2s',
                                }} className="btn-primary">
                                    Dashboard
                                </Link>
                            </>
                        ) : !loading ? (
                            <>
                                <Link href="/customer/login" className="nav-link" style={linkStyle(pathname.startsWith('/customer/login'))}>Login</Link>
                                <Link href="/customer/register" style={{
                                    padding: '0.6rem 1.4rem',
                                    background: 'var(--primary)',
                                    color: 'var(--btn-text)', // Theme sensitive text
                                    borderRadius: '50px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    transition: 'transform 0.2s',
                                }} className="btn-primary">
                                    Join Now
                                </Link>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function linkStyle(isActive: boolean) {
    return {
        color: isActive ? 'var(--primary)' : 'var(--text-main)', // Theme sensitive
        fontWeight: isActive ? 700 : 500,
        fontSize: '0.95rem',
        position: 'relative' as const,
        transition: 'color 0.2s ease',
        cursor: 'pointer'
    };
}
