'use client';

import { useEffect, useState } from 'react';
import styles from './SDGGoals.module.css';

interface SDGGoal {
  id: number;
  goal_number: number;
  title: string;
  description: string;
  color: string;
  targets: string[];
}

export default function SDGGoals() {
  const [goals, setGoals] = useState<SDGGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<SDGGoal | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch('/api/admin/sdg-goals');
        const { data } = await res.json();
        setGoals(data || []);
      } catch (error) {
        console.error('Failed to fetch SDG goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading SDG Goals...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🌍 UN Sustainable Development Goals</h1>
        <p>Aligned with CircleLoop's mission to promote sustainable e-waste management</p>
      </div>

      <div className={styles.goalsGrid}>
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={styles.goalCard}
            style={{ borderTop: `4px solid ${goal.color}` }}
            onClick={() => setSelectedGoal(goal)}
          >
            <div className={styles.goalNumber} style={{ backgroundColor: goal.color }}>
              {goal.goal_number}
            </div>
            <h3>{goal.title}</h3>
            <p className={styles.description}>{goal.description}</p>
          </div>
        ))}
      </div>

      {selectedGoal && (
        <div className={styles.modal} onClick={() => setSelectedGoal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedGoal(null)}>
              ✕
            </button>
            <div
              className={styles.modalHeader}
              style={{ backgroundColor: selectedGoal.color }}
            >
              <h2>{selectedGoal.title}</h2>
              <p>Goal {selectedGoal.goal_number}</p>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.description}>{selectedGoal.description}</p>
              <div className={styles.targets}>
                <h4>Targets:</h4>
                <ul>
                  {selectedGoal.targets?.map((target, idx) => (
                    <li key={idx}>{target}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.circleLoopAlign}>
                <h4>CircleLoop's Alignment:</h4>
                <p>
                  By promoting responsible e-waste management and resource recovery,
                  CircleLoop directly contributes to achieving this sustainable
                  development goal through collection, segregation, and recycling of
                  electronic waste.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
