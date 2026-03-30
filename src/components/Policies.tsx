'use client';

import { useEffect, useState } from 'react';
import styles from './Policies.module.css';

interface Policy {
  id: string;
  policy_name: string;
  policy_type: 'International' | 'National' | 'Regional';
  country: string | null;
  category: string;
  description: string;
  effective_date: string | null;
  source_url: string | null;
  enforcement_body: string | null;
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const url = filterType === 'All' 
          ? '/api/admin/policies' 
          : `/api/admin/policies?type=${filterType}`;
        const res = await fetch(url);
        const { data } = await res.json();
        setPolicies(data || []);
      } catch (error) {
        console.error('Failed to fetch policies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [filterType]);

  if (loading) {
    return <div className={styles.loading}>Loading Policies...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>⚖️ E-Waste & Recycling Policies</h1>
        <p>International and National regulations for sustainable waste management</p>
      </div>

      <div className={styles.filterBar}>
        {['All', 'International', 'National', 'Regional'].map((type) => (
          <button
            key={type}
            className={`${styles.filterBtn} ${filterType === type ? styles.active : ''}`}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className={styles.policiesList}>
        {policies.length === 0 ? (
          <p className={styles.noData}>No policies found.</p>
        ) : (
          policies.map((policy) => (
            <div
              key={policy.id}
              className={styles.policyCard}
              onClick={() => setSelectedPolicy(policy)}
            >
              <div className={styles.policyHeader}>
                <div>
                  <h3>{policy.policy_name}</h3>
                  <div className={styles.meta}>
                    <span className={`${styles.badge} ${styles[policy.policy_type.toLowerCase()]}`}>
                      {policy.policy_type}
                    </span>
                    {policy.country && (
                      <span className={styles.country}>{policy.country}</span>
                    )}
                    <span className={styles.category}>{policy.category}</span>
                  </div>
                </div>
                <div className={styles.arrow}>→</div>
              </div>
              <p className={styles.preview}>{policy.description.substring(0, 100)}...</p>
            </div>
          ))
        )}
      </div>

      {selectedPolicy && (
        <div className={styles.modal} onClick={() => setSelectedPolicy(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedPolicy(null)}>
              ✕
            </button>
            <div className={styles.modalHeader}>
              <h2>{selectedPolicy.policy_name}</h2>
              <div className={styles.modalMeta}>
                <span className={`${styles.badge} ${styles[selectedPolicy.policy_type.toLowerCase()]}`}>
                  {selectedPolicy.policy_type}
                </span>
                {selectedPolicy.country && (
                  <span className={styles.country}>{selectedPolicy.country}</span>
                )}
                <span className={styles.category}>{selectedPolicy.category}</span>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.section}>
                <h4>Description</h4>
                <p>{selectedPolicy.description}</p>
              </div>

              {selectedPolicy.effective_date && (
                <div className={styles.section}>
                  <h4>Effective Date</h4>
                  <p>{new Date(selectedPolicy.effective_date).toLocaleDateString()}</p>
                </div>
              )}

              {selectedPolicy.enforcement_body && (
                <div className={styles.section}>
                  <h4>Enforcement Body</h4>
                  <p>{selectedPolicy.enforcement_body}</p>
                </div>
              )}

              {selectedPolicy.source_url && (
                <div className={styles.section}>
                  <h4>Official Source</h4>
                  <a href={selectedPolicy.source_url} target="_blank" rel="noopener noreferrer">
                    {selectedPolicy.source_url}
                  </a>
                </div>
              )}

              <div className={styles.complianceNote}>
                <strong>Note:</strong> CircleLoop complies with all applicable international and national
                e-waste management policies in the regions where it operates.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
