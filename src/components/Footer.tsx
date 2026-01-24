import Link from "next/link";

export default function Footer() {
    return (
        <footer style={{
            background: '#1a1a1a', // Darker than var(--dark) for footer specifically
            color: 'rgba(255,255,255,0.8)',
            padding: '4rem 2rem 2rem',
            textAlign: 'center',
            marginTop: 'auto'
        }}>
            <div className="container-max">
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>CircleLoop.</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        Building a circular economy, one device at a time.
                        Join us in our mission to reduce e-waste and create a sustainable future.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    <Link href="/company/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Partner Login</Link>
                    <Link href="/admin/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Admin Portal</Link>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', fontSize: '0.85rem' }}>
                    © {new Date().getFullYear()} CircleLoop Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
