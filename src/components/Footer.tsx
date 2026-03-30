import Link from "next/link";

export default function Footer() {
    return (
        <footer style={{
            background: '#1a1a1a',
            color: 'rgba(255,255,255,0.8)',
            padding: 'clamp(2rem, 6vw, 4rem) clamp(0.75rem, 2vw, 2rem)',
            textAlign: 'center',
            marginTop: 'auto'
        }}>
            <div className="container-max">
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'white', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '0.5rem' }}>CircleLoop.</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto', color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', lineHeight: 1.6 }}>
                        Building a circular economy, one device at a time.
                        Join us in our mission to reduce e-waste and create a sustainable future.
                    </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>
                    © {new Date().getFullYear()} CircleLoop Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
