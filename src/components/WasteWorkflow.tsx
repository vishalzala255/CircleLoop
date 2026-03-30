'use client';

import { useEffect, useState } from 'react';
import styles from './WasteWorkflow.module.css';

interface WasteTracking {
  id: string;
  pickup_request_id: number;
  current_stage: 'Collection' | 'Transport' | 'Segregation' | 'Processing' | 'Dispatch';
  collection_date: string | null;
  transport_date_start: string | null;
  segregation_date_start: string | null;
  processing_date_start: string | null;
  dispatch_date: string | null;
  final_status: string;
}

interface WasteStage {
  stage_name: string;
  stage_order: number;
  description: string;
  estimated_duration_days: number;
}

const STAGES: Record<string, WasteStage> = {
  Collection: {
    stage_name: 'Collection',
    stage_order: 1,
    description: 'Customer initiates e-waste collection request. Collection team verifies and picks up items.',
    estimated_duration_days: 3,
  },
  Transport: {
    stage_name: 'Transport',
    stage_order: 2,
    description: 'Collected e-waste is transported to processing facility with proper handling.',
    estimated_duration_days: 2,
  },
  Segregation: {
    stage_name: 'Segregation',
    stage_order: 3,
    description: 'E-waste items are segregated by type and assessed for reusability or recycling.',
    estimated_duration_days: 5,
  },
  Processing: {
    stage_name: 'Processing',
    stage_order: 4,
    description: 'Items undergo processing: refurbishment or recycling. Hazardous components safely handled.',
    estimated_duration_days: 7,
  },
  Dispatch: {
    stage_name: 'Dispatch',
    stage_order: 5,
    description: 'Processed items dispatched to partners or refurbishment centers.',
    estimated_duration_days: 2,
  },
};

export default function WasteWorkflow({ trackingId }: { trackingId?: string }) {
  const [tracking, setTracking] = useState<WasteTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingId) {
      setLoading(false);
      return;
    }

    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/admin/waste-tracking/${trackingId}`);
        const { data } = await res.json();
        setTracking(data);
      } catch (error) {
        console.error('Failed to fetch waste tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [trackingId]);

  const getCurrentStageIndex = () => {
    if (!tracking) return 0;
    const stages = Object.keys(STAGES).sort(
      (a, b) => STAGES[a].stage_order - STAGES[b].stage_order
    );
    return stages.indexOf(tracking.current_stage);
  };

  if (loading) {
    return <div className={styles.loading}>Loading workflow...</div>;
  }

  const stageOrder = Object.values(STAGES)
    .sort((a, b) => a.stage_order - b.stage_order)
    .map((s) => s.stage_name);

  const currentIndex = tracking ? stageOrder.indexOf(tracking.current_stage) : -1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 E-Waste Management Workflow</h1>
        {tracking && (
          <p className={styles.status}>
            Status: <span className={styles.statusBadge}>{tracking.final_status}</span>
          </p>
        )}
      </div>

      <div className={styles.timeline}>
        {stageOrder.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const stageData = STAGES[stage];

          return (
            <div key={stage} className={styles.timelineItem}>
              <div
                className={`${styles.timelineNode} ${
                  isCompleted ? styles.completed : ''
                } ${isActive ? styles.active : ''}`}
              >
                <div className={styles.nodeNumber}>{stageData.stage_order}</div>
              </div>

              {index < stageOrder.length - 1 && (
                <div
                  className={`${styles.timelineConnector} ${
                    isCompleted ? styles.completed : ''
                  }`}
                />
              )}

              <div
                className={`${styles.stageCard} ${isActive ? styles.activeCard : ''}`}
                onClick={() => setExpandedStage(expandedStage === stage ? null : stage)}
              >
                <div className={styles.stageHeader}>
                  <h3>{stage}</h3>
                  {isActive && <span className={styles.activeBadge}>In Progress</span>}
                  {isCompleted && <span className={styles.completedBadge}>✓ Completed</span>}
                </div>

                {expandedStage === stage && (
                  <div className={styles.stageDetails}>
                    <p className={styles.description}>{stageData.description}</p>
                    <p className={styles.estimatedTime}>
                      ⏱️ Estimated Duration: {stageData.estimated_duration_days} days
                    </p>

                    {tracking && (
                      <div className={styles.stageTimeline}>
                        {stage === 'Collection' && tracking.collection_date && (
                          <p>
                            📍 Collected on:{' '}
                            {new Date(tracking.collection_date).toLocaleDateString()}
                          </p>
                        )}
                        {stage === 'Transport' && tracking.transport_date_start && (
                          <p>
                            🚚 Started on:{' '}
                            {new Date(tracking.transport_date_start).toLocaleDateString()}
                          </p>
                        )}
                        {stage === 'Segregation' && tracking.segregation_date_start && (
                          <p>
                            🔍 Started on:{' '}
                            {new Date(tracking.segregation_date_start).toLocaleDateString()}
                          </p>
                        )}
                        {stage === 'Processing' && tracking.processing_date_start && (
                          <p>
                            ⚙️ Started on:{' '}
                            {new Date(tracking.processing_date_start).toLocaleDateString()}
                          </p>
                        )}
                        {stage === 'Dispatch' && tracking.dispatch_date && (
                          <p>
                            📤 Dispatched on:{' '}
                            {new Date(tracking.dispatch_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.infoBox}>
        <h4>About This Workflow</h4>
        <p>
          This 5-stage process ensures comprehensive e-waste management from collection through final
          dispatch. Each stage is carefully tracked to maintain transparency and accountability.
        </p>
        <ul>
          <li><strong>Collection:</strong> Safe pickup from customer locations</li>
          <li><strong>Transport:</strong> Secure transportation to processing facility</li>
          <li><strong>Segregation:</strong> Classification and assessment of items</li>
          <li><strong>Processing:</strong> Refurbishment or recycling</li>
          <li><strong>Dispatch:</strong> Distribution to appropriate channels</li>
        </ul>
      </div>
    </div>
  );
}
