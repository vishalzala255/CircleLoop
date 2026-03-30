"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Icon } from './Icons';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const { user, profile, loading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getDashboardLink = () => {
        if (profile?.role === 'admin') return '/admin/dashboard';
        if (profile?.role === 'company') return '/company/dashboard';
        return '/customer/dashboard';
    };

    const handleNavClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar" style={{
            background: 'var(--bg-glass)',
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
                    fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
                    color: 'var(--primary)',
                    letterSpacing: '-0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem'
                }}>
                    <img src="/logo.svg" alt="CircleLoop Logo" style={{ width: '32px', height: '32px' }} />
                    <span>CircleLoop<span style={{ color: 'var(--accent)' }}>.</span></span>
                </Link>

                {/* Desktop Navigation */}
                <div style={{ display: 'none' }} className="desktop-nav" id="desktop-nav">
                    <div style={{ display: 'flex', gap: 'calc(0.5rem + 1vw)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Link href="/" className="nav-link" style={linkStyle(pathname === '/')}>Home</Link>
                        <Link href="/customer/request" className="nav-link" style={linkStyle(pathname.startsWith('/customer/request'))}>Recycle</Link>
                        <Link href="/sdg-goals" className="nav-link" style={linkStyle(pathname === '/sdg-goals')}>SDG Goals</Link>
                        <Link href="/policies" className="nav-link" style={linkStyle(pathname === '/policies')}>Policies</Link>
                        <Link href="/waste-workflow" className="nav-link" style={linkStyle(pathname === '/waste-workflow')}>Workflow</Link>

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
                                        color: 'var(--btn-text)',
                                        borderRadius: '50px',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        transition: 'transform 0.2s',
                                    }} className="btn-primary navbar-btn">
                                        Dashboard
                                    </Link>
                                </>
                            ) : !loading ? (
                                <>
                                    <Link href="/customer/register" style={{
                                        padding: '0.6rem 1.4rem',
                                        background: 'var(--primary)',
                                        color: 'var(--btn-text)',
                                        borderRadius: '50px',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        transition: 'transform 0.2s',
                                    }} className="btn-primary navbar-btn">
                                        Join Now
                                    </Link>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Toggle + Theme Toggle */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-main)',
                            fontSize: '1.5rem'
                        }}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-color)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    zIndex: 99
                }}>
                    <div className="container-max" style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Link href="/" className="nav-link" style={{ ...linkStyle(pathname === '/'), padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={handleNavClick}>Home</Link>
                        <Link href="/customer/request" className="nav-link" style={{ ...linkStyle(pathname.startsWith('/customer/request')), padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={handleNavClick}>Recycle</Link>
                        <Link href="/sdg-goals" className="nav-link" style={{ ...linkStyle(pathname === '/sdg-goals'), padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={handleNavClick}>SDG Goals</Link>
                        <Link href="/policies" className="nav-link" style={{ ...linkStyle(pathname === '/policies'), padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={handleNavClick}>Policies</Link>
                        <Link href="/waste-workflow" className="nav-link" style={{ ...linkStyle(pathname === '/waste-workflow'), padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }} onClick={handleNavClick}>Workflow</Link>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                            {!loading && user ? (
                                <>
                                    <Link href="/profile" className="nav-link" style={{ ...linkStyle(pathname === '/profile'), padding: '0.75rem 0' }} onClick={handleNavClick}>
                                        <Icon name="profile" size={18} style={{ marginRight: '0.5rem' }} /> Profile
                                    </Link>
                                    <Link href={getDashboardLink()} className="btn btn-primary" style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem', textAlign: 'center', width: '100%' }} onClick={handleNavClick}>
                                        Dashboard
                                    </Link>
                                </>
                            ) : !loading ? (
                                <>
                                    <Link href="/customer/register" className="btn btn-primary" style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem', textAlign: 'center', width: '100%' }} onClick={handleNavClick}>
                                        Join Now
                                    </Link>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for Desktop View */}
            <style>{`
                @media (min-width: 769px) {
                    #desktop-nav {
                        display: flex !important;
                    }
                    
                    button[aria-label="Toggle menu"] {
                        display: none !important;
                    }
                    
                    .Navbar_ThemeToggle__* {
                        display: flex !important;
                    }
                }

                @media (max-width: 768px) {
                    #desktop-nav {
                        display: none !important;
                    }
                    
                    .nav-link {
                        display: block !important;
                    }
                }
            `}</style>
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
