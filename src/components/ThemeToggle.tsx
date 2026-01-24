"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease'
            }}
            aria-label="Toggle Theme"
            title="Toggle Dark Mode"
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
