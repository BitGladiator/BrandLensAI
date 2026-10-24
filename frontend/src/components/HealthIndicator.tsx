import React, { useEffect, useState, useCallback } from 'react';
import { checkHealth } from '../services/api';
import { ConnectionStatus, HealthResponse } from '../types/review';

interface HealthIndicatorProps {
  onStatusChange?: (status: ConnectionStatus, healthData?: HealthResponse) => void;
  className?: string;
  showFullLabelAlways?: boolean;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  onStatusChange,
  className = '',
  showFullLabelAlways = false,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);

  const performCheck = useCallback(async () => {
    setStatus('checking');
    try {
      const data = await checkHealth();
      setStatus('connected');
      setHealthData(data);
      onStatusChange?.('connected', data);
    } catch {
      setStatus('disconnected');
      setHealthData(null);
      onStatusChange?.('disconnected');
    }
  }, [onStatusChange]);

  useEffect(() => {
    performCheck();
    // Re-check periodically every 30 seconds
    const interval = setInterval(performCheck, 30000);
    return () => clearInterval(interval);
  }, [performCheck]);

  const label =
    status === 'connected'
      ? healthData?.ai_review_enabled
        ? 'API Connected (AI Enabled)'
        : 'API Connected'
      : status === 'disconnected'
      ? 'API Offline'
      : 'Checking...';

  const shortLabel =
    status === 'connected'
      ? healthData?.ai_review_enabled
        ? 'AI Ready'
        : 'API Live'
      : status === 'disconnected'
      ? 'Offline'
      : 'Checking';

  return (
    <button
      type="button"
      className={`health-pill ${className}`}
      onClick={performCheck}
      title={`${label} — Click to refresh`}
      aria-label={label}
    >
      <span className={`health-dot ${status}`} />
      {showFullLabelAlways ? (
        <span>{label}</span>
      ) : (
        <>
          <span className="health-pill-text-desktop">{label}</span>
          <span className="health-pill-text-mobile">{shortLabel}</span>
        </>
      )}
    </button>
  );
};
