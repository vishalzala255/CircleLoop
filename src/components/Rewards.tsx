"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './Rewards.module.css';

interface Reward {
  id: string;
  reward_name: string;
  reward_type: string;
  reward_value: number;
  description: string;
  status: string;
  issued_at: string;
  expires_at: string;
  redeemed_at?: string;
  redemption_code: string;
}

interface CustomerPoints {
  total_points: number;
  available_points: number;
  redeemed_points: number;
}

export default function RewardsComponent({ customerId }: { customerId: string }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState<CustomerPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'redeemed'>('all');

  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      try {
        // Fetch customer rewards
        const rewardsResponse = await fetch(`/api/admin/rewards?customer_id=${customerId}`);
        const rewardsData = await rewardsResponse.json();
        setRewards(rewardsData);

        // Fetch customer points
        const pointsResponse = await fetch(`/api/admin/customer-points?customer_id=${customerId}`);
        const pointsData = await pointsResponse.json();
        setPoints(pointsData);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates using correct Supabase API
    const rewardsChannel = supabase
      .channel('rewards-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rewards',
          filter: `customer_id=eq.${customerId}`
        },
        (payload: any) => {
          setRewards(prev => 
            activeTab === 'all' 
              ? [payload.new, ...prev.filter((r: any) => r.id !== payload.new.id)]
              : prev
          );
        }
      )
      .subscribe();

    const pointsChannel = supabase
      .channel('points-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_points',
          filter: `customer_id=eq.${customerId}`
        },
        (payload: any) => {
          setPoints(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rewardsChannel);
      supabase.removeChannel(pointsChannel);
    };
  }, [customerId, activeTab]);

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'Coupon':
        return '#d96c34'; // Orange
      case 'Points':
        return '#2d5016'; // Green
      case 'Credit':
        return '#4169E1'; // Royal Blue
      case 'Badge':
        return '#FFD700'; // Gold
      default:
        return 'var(--primary)';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Issued': '#2d5016',
      'Redeemed': '#528a2f',
      'Expired': '#888888',
      'Cancelled': '#c1453d'
    };
    return statusColors[status] || 'var(--primary)';
  };

  const filteredRewards = rewards.filter(reward => {
    if (activeTab === 'active') return reward.status === 'Issued';
    if (activeTab === 'redeemed') return reward.status === 'Redeemed';
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className={styles.rewardsContainer}>
      {/* Points Overview */}
      <div className={styles.pointsOverview}>
        <div className={styles.pointsCard}>
          <h3>Total Points</h3>
          <p className={styles.pointsValue}>{points?.total_points || 0}</p>
          <span className={styles.pointsLabel}>Lifetime Points</span>
        </div>
        <div className={styles.pointsCard}>
          <h3>Available Points</h3>
          <p className={styles.pointsValue} style={{ color: '#d96c34' }}>{points?.available_points || 0}</p>
          <span className={styles.pointsLabel}>Ready to Redeem</span>
        </div>
        <div className={styles.pointsCard}>
          <h3>Redeemed Points</h3>
          <p className={styles.pointsValue} style={{ color: '#528a2f' }}>{points?.redeemed_points || 0}</p>
          <span className={styles.pointsLabel}>Already Used</span>
        </div>
      </div>

      {/* Rewards Section */}
      <div className={styles.rewardsSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Rewards & Coupons</h2>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({rewards.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'active' ? styles.active : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({rewards.filter(r => r.status === 'Issued').length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'redeemed' ? styles.active : ''}`}
              onClick={() => setActiveTab('redeemed')}
            >
              Redeemed ({rewards.filter(r => r.status === 'Redeemed').length})
            </button>
          </div>
        </div>

        {filteredRewards.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No rewards yet. Start contributing e-waste to earn rewards!</p>
          </div>
        ) : (
          <div className={styles.rewardsGrid}>
            {filteredRewards.map(reward => (
              <div key={reward.id} className={styles.rewardCard}>
                <div className={styles.rewardHeader}>
                  <div className={styles.rewardType} style={{ backgroundColor: getRewardColor(reward.reward_type) }}>
                    {reward.reward_type.toUpperCase()}
                  </div>
                  <div
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusBadge(reward.status) }}
                  >
                    {reward.status}
                  </div>
                </div>

                <h3 className={styles.rewardName}>{reward.reward_name}</h3>
                <p className={styles.rewardDescription}>{reward.description}</p>

                <div className={styles.rewardValue}>
                  {reward.reward_type === 'Points' ? (
                    <span>{reward.reward_value} Points</span>
                  ) : (
                    <span>${reward.reward_value.toFixed(2)}</span>
                  )}
                </div>

                {reward.redemption_code && (
                  <div className={styles.rewardCode}>
                    <strong>Code:</strong>
                    <code>{reward.redemption_code}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(reward.redemption_code)}
                      title="Copy code"
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                )}

                <div className={styles.rewardDates}>
                  <small>Issued: {new Date(reward.issued_at).toLocaleDateString()}</small>
                  {reward.expires_at && (
                    <small>Expires: {new Date(reward.expires_at).toLocaleDateString()}</small>
                  )}
                  {reward.redeemed_at && (
                    <small>Redeemed: {new Date(reward.redeemed_at).toLocaleDateString()}</small>
                  )}
                </div>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
