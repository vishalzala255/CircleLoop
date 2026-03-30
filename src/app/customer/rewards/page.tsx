"use client";

import { useAuth } from "@/hooks/useAuth";
import RewardsComponent from "@/components/Rewards";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RewardsPage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-body)'
      }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Loading your rewards...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-body)',
      paddingTop: '1rem'
    }}>
      {/* Navigation Header */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        marginBottom: '0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <Link href="/customer/dashboard" style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{
            color: 'var(--primary)',
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: '0',
            flex: 1,
            textAlign: 'center'
          }}>
            🎯 My Rewards & Coupons
          </h1>
          <div style={{ width: '120px' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <RewardsComponent customerId={user.id} />

      {/* Info Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '3rem auto',
        padding: '0 2rem'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>How to Earn Rewards</h3>
          <ul style={{
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '1.5rem'
          }}>
            <li>Submit e-waste for pickup - Get points and coupons</li>
            <li>Complete your pickup - Unlock reward coupons</li>
            <li>Admin approves e-waste - Receive coupon rewards</li>
            <li>Accumulate points - Reach higher tier levels</li>
            <li>Use coupons - Shop on our marketplace with discounts</li>
          </ul>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Reward Tiers</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #CD7F32, #8B4513)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4>🥉 Bronze</h4>
              <p>0 - 499 Points</p>
              <small>2% Cashback</small>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #C0C0C0, #808080)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4>🥈 Silver</h4>
              <p>500 - 1,499 Points</p>
              <small>3% Cashback</small>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              color: '#333',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4>🥇 Gold</h4>
              <p>1,500 - 4,999 Points</p>
              <small>5% Cashback</small>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #E5E4E2, #808080)',
              color: '#333',
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4>💎 Platinum</h4>
              <p>5,000+ Points</p>
              <small>7% Cashback + VIP</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
