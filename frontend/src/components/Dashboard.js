import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    loadDashboardMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardMetrics, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadDashboardMetrics = async () => {
    try {
      const response = await axios.get('/api/v1/analytics/dashboard');
      setMetrics(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Medical Scribe AI Dashboard</h1>
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'today' ? 'active' : ''}
            onClick={() => setSelectedPeriod('today')}
          >
            Today
          </button>
          <button 
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            This Week
          </button>
          <button 
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Encounters Today"
          value={metrics.encounters_today}
          icon="📝"
          trend={`${metrics.average_encounters_per_day} avg/day`}
        />
        <MetricCard
          title="Active Users"
          value={metrics.active_users_now}
          icon="👥"
          subtitle="Currently online"
        />
        <MetricCard
          title="In Progress"
          value={metrics.transcriptions_in_progress}
          icon="⏳"
          subtitle="Transcriptions"
        />
        <MetricCard
          title="This Month"
          value={metrics.encounters_this_month}
          icon="📈"
          trend={`${metrics.month_over_month_growth > 0 ? '+' : ''}${metrics.month_over_month_growth}%`}
          trendPositive={metrics.month_over_month_growth > 0}
        />
      </div>

      {/* System Health */}
      <div className="system-health">
        <h2>System Health</h2>
        <div className="health-indicators">
          <HealthIndicator 
            label="Status" 
            value={metrics.system_status} 
            status={metrics.system_status}
          />
          <HealthIndicator 
            label="API Response" 
            value={`${metrics.api_response_time}ms`}
            status={metrics.api_response_time < 500 ? 'healthy' : 'warning'}
          />
          <HealthIndicator 
            label="Error Rate" 
            value={`${metrics.error_rate}%`}
            status={metrics.error_rate < 1 ? 'healthy' : 'warning'}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Encounters</h2>
        <table className="activity-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Physician</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {metrics.recent_encounters.map((encounter, idx) => (
              <tr key={idx}>
                <td>{encounter.timestamp}</td>
                <td>{encounter.physician}</td>
                <td>{encounter.duration}</td>
                <td><span className="status-badge complete">Complete</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts */}
      {metrics.active_alerts && metrics.active_alerts.length > 0 && (
        <div className="alerts-section">
          <h2>⚠️ Active Alerts</h2>
          {metrics.active_alerts.map((alert, idx) => (
            <div key={idx} className={`alert alert-${alert.severity}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, subtitle, trend, trendPositive }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3>{title}</h3>
        <div className="metric-value">{value}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
        {trend && (
          <div className={`metric-trend ${trendPositive ? 'positive' : 'negative'}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function HealthIndicator({ label, value, status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="health-indicator">
      <div className="health-label">{label}</div>
      <div className="health-value" style={{ color: getStatusColor() }}>
        {value}
      </div>
    </div>
  );
}

export default Dashboard;
