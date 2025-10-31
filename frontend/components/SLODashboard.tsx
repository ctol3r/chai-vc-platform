'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Card from './Card';

// Lazy-load charts for performance
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface SLOMetrics {
  psvAccuracy: number;
  ttpDaysP90: number;
  fppeRate: number;
  adverseMisses: number;
  evidenceComplete: number;
}

interface SLODashboardProps {
  mockData?: boolean;
}

const SLODashboard: React.FC<SLODashboardProps> = ({ mockData = false }) => {
  const [metrics, setMetrics] = useState<SLOMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<SLOMetrics & { timestamp: string }>>([]);

  // SLO Thresholds
  const thresholds = {
    psvAccuracy: 0.95,
    ttpDays: 30,
    fppeRate: 0.1,
    adverseMisses: 0,
    evidenceComplete: 0.9,
  };

  const fetchMetrics = async () => {
    try {
      const url = mockData 
        ? '/api/metrics/slo?mock=1' 
        : '/api/metrics/slo';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch SLO metrics');
      }
      
      const data: SLOMetrics = await response.json();
      setMetrics(data);
      setError(null);
      
      // Add to history (keep last 30 data points)
      setHistory((prev) => {
        const newHistory = [
          ...prev,
          { ...data, timestamp: new Date().toISOString() },
        ];
        return newHistory.slice(-30);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch metrics');
      console.error('SLO fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [mockData]);

  // Check if any thresholds are breached
  const alerts = useMemo(() => {
    if (!metrics) return [];
    
    const alertsList: Array<{ metric: string; message: string; severity: 'warning' | 'critical' }> = [];
    
    if (metrics.psvAccuracy < thresholds.psvAccuracy) {
      alertsList.push({
        metric: 'PSV Accuracy',
        message: `PSV accuracy (${(metrics.psvAccuracy * 100).toFixed(1)}%) is below threshold (${(thresholds.psvAccuracy * 100).toFixed(0)}%)`,
        severity: metrics.psvAccuracy < thresholds.psvAccuracy * 0.9 ? 'critical' : 'warning',
      });
    }
    
    if (metrics.ttpDaysP90 > thresholds.ttpDays) {
      alertsList.push({
        metric: 'Time to Privilege',
        message: `TTP P90 (${metrics.ttpDaysP90.toFixed(1)} days) exceeds threshold (${thresholds.ttpDays} days)`,
        severity: metrics.ttpDaysP90 > thresholds.ttpDays * 1.5 ? 'critical' : 'warning',
      });
    }
    
    if (metrics.fppeRate > thresholds.fppeRate) {
      alertsList.push({
        metric: 'FPPE Rate',
        message: `FPPE trigger rate (${(metrics.fppeRate * 100).toFixed(1)}%) exceeds threshold (${(thresholds.fppeRate * 100).toFixed(0)}%)`,
        severity: 'warning',
      });
    }
    
    if (metrics.adverseMisses > thresholds.adverseMisses) {
      alertsList.push({
        metric: 'Adverse Misses',
        message: `Adverse finding misses (${metrics.adverseMisses}) exceed threshold (${thresholds.adverseMisses})`,
        severity: 'critical',
      });
    }
    
    if (metrics.evidenceComplete < thresholds.evidenceComplete) {
      alertsList.push({
        metric: 'Evidence Completeness',
        message: `Evidence completeness (${(metrics.evidenceComplete * 100).toFixed(1)}%) is below threshold (${(thresholds.evidenceComplete * 100).toFixed(0)}%)`,
        severity: 'warning',
      });
    }
    
    return alertsList;
  }, [metrics, thresholds]);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatDays = (value: number) => `${value.toFixed(1)} days`;

  const getStatusColor = (value: number, threshold: number, isLowerBetter: boolean = false) => {
    if (isLowerBetter) {
      return value <= threshold ? '#10b981' : value <= threshold * 1.5 ? '#f59e0b' : '#ef4444';
    }
    return value >= threshold ? '#10b981' : value >= threshold * 0.9 ? '#f59e0b' : '#ef4444';
  };

  if (loading && !metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading SLO metrics...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div style={{ padding: '2rem' }}>
        <Card>
          <div style={{ color: '#ef4444' }}>
            <strong>Error:</strong> {error}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>SLO Dashboard</h1>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <Card
          style={{
            backgroundColor: alerts.some((a) => a.severity === 'critical') ? '#fee2e2' : '#fef3c7',
            borderLeft: `4px solid ${alerts.some((a) => a.severity === 'critical') ? '#ef4444' : '#f59e0b'}`,
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#991b1b' }}>⚠️ SLO Threshold Alerts</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {alerts.map((alert, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem', color: alert.severity === 'critical' ? '#991b1b' : '#92400e' }}>
                <strong>{alert.metric}:</strong> {alert.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* SLO Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <Card title="PSV Accuracy">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatusColor(metrics!.psvAccuracy, thresholds.psvAccuracy) }}>
            {formatPercentage(metrics!.psvAccuracy)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Target: {formatPercentage(thresholds.psvAccuracy)}
          </div>
        </Card>

        <Card title="Time to Privilege (P90)">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatusColor(metrics!.ttpDaysP90, thresholds.ttpDays, true) }}>
            {formatDays(metrics!.ttpDaysP90)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Target: &lt;{thresholds.ttpDays} days
          </div>
        </Card>

        <Card title="FPPE Trigger Rate">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatusColor(metrics!.fppeRate, thresholds.fppeRate, true) }}>
            {formatPercentage(metrics!.fppeRate)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Target: &lt;{formatPercentage(thresholds.fppeRate)}
          </div>
        </Card>

        <Card title="Adverse Misses">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: metrics!.adverseMisses > thresholds.adverseMisses ? '#ef4444' : '#10b981' }}>
            {metrics!.adverseMisses}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Target: {thresholds.adverseMisses}
          </div>
        </Card>

        <Card title="Evidence Completeness">
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatusColor(metrics!.evidenceComplete, thresholds.evidenceComplete) }}>
            {formatPercentage(metrics!.evidenceComplete)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Target: {formatPercentage(thresholds.evidenceComplete)}
          </div>
        </Card>
      </div>

      {/* Trend Charts */}
      {history.length > 1 && (
        <Card title="Trends (Last 30 Updates)">
          <div style={{ width: '100%', height: '400px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="psvAccuracy"
                  name="PSV Accuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="ttpDaysP90"
                  name="TTP (Days)"
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="evidenceComplete"
                  name="Evidence Complete"
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Refresh Indicator */}
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
        Auto-refreshing every 30 seconds • Last updated: {metrics ? new Date().toLocaleTimeString() : 'Never'}
      </div>
    </div>
  );
};

export default SLODashboard;
