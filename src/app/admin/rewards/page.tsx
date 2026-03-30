"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import styles from "@/components/AdminPanel.module.css";

interface Reward {
  id: string;
  customer_id: string;
  reward_name: string;
  reward_type: string;
  reward_value: number;
  status: string;
  issued_at: string;
  profiles?: { name: string; email: string };
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function AdminRewardsPage() {
  const { user, loading } = useAuth("/admin/login");
  const [activeTab, setActiveTab] = useState<'rewards' | 'coupons' | 'campaigns'>('rewards');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    rewardName: '',
    rewardType: 'Coupon',
    rewardValue: '',
    description: '',
    expiresAt: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [rewardsLoading, setRewardsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch all rewards
        const rewardsRes = await fetch('/api/admin/rewards');
        const rewardsData = await rewardsRes.json();
        setRewards(rewardsData);

        // Fetch all customers
        const { data: customersData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('role', 'customer');

        if (customersData) setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setRewardsLoading(false);
      }
    };

    fetchData();

    // Real-time subscription using correct Supabase API
    const channel = supabase
      .channel('admin-rewards')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rewards'
        },
        (payload: any) => {
          setRewards(prev => 
            prev.some(r => r.id === payload.new.id)
              ? prev.map(r => r.id === payload.new.id ? payload.new : r)
              : [payload.new, ...prev]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleIssueReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.rewardName || !formData.rewardValue) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: formData.customerId,
          reward_type: formData.rewardType,
          reward_name: formData.rewardName,
          reward_value: parseFloat(formData.rewardValue),
          description: formData.description,
          expires_at: formData.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      if (response.ok) {
        alert('Reward issued successfully!');
        setFormData({
          customerId: '',
          rewardName: '',
          rewardType: 'Coupon',
          rewardValue: '',
          description: '',
          expiresAt: ''
        });
      } else {
        throw new Error('Failed to issue reward');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error issuing reward');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-body)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{
          color: 'var(--primary)',
          marginBottom: '2rem',
          fontSize: '2rem'
        }}>
          🎁 Rewards Management
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '1rem'
        }}>
          {['rewards', 'coupons', 'campaigns'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '0.8rem 1.5rem',
                background: activeTab === tab ? 'var(--primary)' : 'var(--bg-card)',
                color: activeTab === tab ? 'white' : 'var(--text-main)',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}
            >
              {tab.toUpperCase()} {tab === 'rewards' && `(${rewards.length})`}
            </button>
          ))}
        </div>

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* Issue Reward Form */}
            <div style={{
              background: 'var(--bg-card)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              height: 'fit-content'
            }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Issue New Reward</h3>
              <form onSubmit={handleIssueReward} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Customer</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit'
                    }}
                    required
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Reward Type</label>
                  <select
                    value={formData.rewardType}
                    onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="Coupon">Coupon</option>
                    <option value="Points">Points</option>
                    <option value="Credit">Store Credit</option>
                    <option value="Badge">Badge</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Reward Name</label>
                  <input
                    type="text"
                    value={formData.rewardName}
                    onChange={(e) => setFormData({ ...formData, rewardName: e.target.value })}
                    placeholder="e.g., Eco-Warrior Coupon"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Value</label>
                  <input
                    type="number"
                    value={formData.rewardValue}
                    onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                    placeholder="500 or 50.00"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Reward details and terms"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit',
                      minHeight: '80px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Expires At (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-main)',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.8rem',
                    background: submitting ? 'var(--text-muted)' : 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {submitting ? 'Issuing...' : 'Issue Reward'}
                </button>
              </form>
            </div>

            {/* Rewards List */}
            <div style={{
              background: 'var(--bg-card)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Recent Rewards</h3>
              {rewardsLoading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
              ) : rewards.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No rewards issued yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '0.8rem', fontWeight: 600 }}>Customer</th>
                        <th style={{ textAlign: 'left', padding: '0.8rem', fontWeight: 600 }}>Reward Name</th>
                        <th style={{ textAlign: 'left', padding: '0.8rem', fontWeight: 600 }}>Type</th>
                        <th style={{ textAlign: 'left', padding: '0.8rem', fontWeight: 600 }}>Value</th>
                        <th style={{ textAlign: 'left', padding: '0.8rem', fontWeight: 600 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '0.8rem', fontWeight: 600 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.slice(0, 10).map(reward => (
                        <tr key={reward.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.8rem' }}>
                            <small style={{ color: 'var(--text-secondary)' }}>
                              {reward.profiles?.name || 'Unknown'}
                            </small>
                          </td>
                          <td style={{ padding: '0.8rem' }}>{reward.reward_name}</td>
                          <td style={{ padding: '0.8rem' }}>
                            <span style={{
                              background: reward.reward_type === 'Points' ? 'var(--primary)' : 'var(--accent)',
                              color: 'white',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}>
                              {reward.reward_type}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem', fontWeight: 600 }}>
                            {reward.reward_type === 'Points' ? `${reward.reward_value} pts` : `$${reward.reward_value.toFixed(2)}`}
                          </td>
                          <td style={{ padding: '0.8rem' }}>
                            <span style={{
                              background: reward.status === 'Issued' ? '#2d5016' : '#528a2f',
                              color: 'white',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}>
                              {reward.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {new Date(reward.issued_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <p>Coupons management coming soon...</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>You can manage coupons through the API or Supabase dashboard</p>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <p>Reward campaigns management coming soon...</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>Create and manage automated reward campaigns</p>
          </div>
        )}
      </div>
    </div>
  );
}
