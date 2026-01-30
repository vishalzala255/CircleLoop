"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: 'var(--bg-card)',
                border: '2px solid var(--border-color)',
                borderRadius: '50px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
            <span style={{ fontSize: '1.2rem' }}>
                {theme === 'light' ? '🌙' : '☀️'}
            </span>
            <span style={{ fontSize: '0.85rem' }}>
                {theme === 'light' ? 'Dark' : 'Light'}
            </span>
        </button>
    );
}
