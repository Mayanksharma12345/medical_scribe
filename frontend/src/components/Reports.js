import React, { useState } from 'react';
import axios from 'axios';
import './Reports.css';

function Reports() {
  const [reportType, setReportType] = useState('physician_productivity');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPhysician, setSelectedPhysician] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'physician_productivity', label: '👨‍⚕️ Physician Productivity' },
    { value: 'encounter_summary', label: '📋 Encounter Summary' },
    { value: 'compliance_audit', label: '🔒 Compliance Audit' },
    { value: 'usage_statistics', label: '📊 Usage Statistics' },
    { value: 'billing_summary', label: '💰 Billing Summary' },
    { value: 'quality_metrics', label: '⭐ Quality Metrics' },
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/analytics/reports', {
        report_type: reportType,
        date_range_start: dateFrom,
        date_range_end: dateTo,
        physician_ids: selectedPhysician !== 'all' ? [selectedPhysician] : null,
        format: 'json'
      });
      setReportData(response.data);
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    // Trigger download
    const url = `/api/v1/analytics/reports/${reportData.report_id}/export?format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <div className="reports">
      <h1>📊 Reports & Analytics</h1>

      <div className="report-generator">
        <h2>Generate Report</h2>
        
        <div className="report-form">
          <div className="form-row">
            <div className="form-group">
              <label>Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Physician</label>
              <select value={selectedPhysician} onChange={(e) => setSelectedPhysician(e.target.value)}>
                <option value="all">All Physicians</option>
                <option value="dr_smith">Dr. Smith</option>
                <option value="dr_jones">Dr. Jones</option>
                <option value="dr_williams">Dr. Williams</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From Date</label>
              <input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>To Date</label>
              <input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={generateReport} 
            className="btn btn-primary"
            disabled={loading || !dateFrom || !dateTo}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="report-results">
          <div className="report-header">
            <h2>Report Results</h2>
            <div className="export-buttons">
              <button onClick={() => exportReport('csv')} className="btn btn-secondary">
                📄 Export CSV
              </button>
              <button onClick={() => exportReport('pdf')} className="btn btn-secondary">
                📑 Export PDF
              </button>
            </div>
          </div>

          <div className="report-metadata">
            <p><strong>Report ID:</strong> {reportData.report_id}</p>
            <p><strong>Generated:</strong> {new Date(reportData.generated_at).toLocaleString()}</p>
            <p><strong>Period:</strong> {reportData.date_range_start} to {reportData.date_range_end}</p>
            <p><strong>Records:</strong> {reportData.record_count}</p>
          </div>

          <ReportDisplay reportType={reportType} data={reportData.data} />
        </div>
      )}
    </div>
  );
}

function ReportDisplay({ reportType, data }) {
  switch (reportType) {
    case 'physician_productivity':
      return <PhysicianProductivityDisplay data={data} />;
    case 'encounter_summary':
      return <EncounterSummaryDisplay data={data} />;
    case 'compliance_audit':
      return <ComplianceAuditDisplay data={data} />;
    default:
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }
}

function PhysicianProductivityDisplay({ data }) {
  return (
    <div className="report-content">
      <h3>Physician: {data.physician_name}</h3>
      
      <div className="metrics-summary">
        <div className="metric">
          <label>Total Encounters</label>
          <value>{data.total_encounters}</value>
        </div>
        <div className="metric">
          <label>Encounters/Day</label>
          <value>{data.encounters_per_day.toFixed(1)}</value>
        </div>
        <div className="metric">
          <label>Avg Documentation Time</label>
          <value>{data.average_documentation_time.toFixed(1)} min</value>
        </div>
        <div className="metric">
          <label>Time Saved</label>
          <value>{data.documentation_time_saved.toFixed(0)} min</value>
        </div>
      </div>

      <div className="quality-section">
        <h4>Quality Metrics</h4>
        <div className="progress-bar">
          <label>Note Completeness</label>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${data.average_note_completeness}%` }}>
              {data.average_note_completeness.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="progress-bar">
          <label>Coding Accuracy</label>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${data.coding_accuracy_rate}%` }}>
              {data.coding_accuracy_rate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EncounterSummaryDisplay({ data }) {
  return (
    <div className="report-content">
      <h3>Total Encounters: {data.total_encounters}</h3>
      
      <div className="chart-section">
        <h4>Top Chief Complaints</h4>
        <ul className="ranking-list">
          {data.top_chief_complaints.map(([complaint, count], idx) => (
            <li key={idx}>
              <span className="rank">#{idx + 1}</span>
              <span className="item">{complaint}</span>
              <span className="count">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="chart-section">
        <h4>Top ICD-10 Codes</h4>
        <ul className="ranking-list">
          {data.top_icd10_codes.map(([code, count], idx) => (
            <li key={idx}>
              <span className="rank">#{idx + 1}</span>
              <span className="item code">{code}</span>
              <span className="count">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComplianceAuditDisplay({ data }) {
  return (
    <div className="report-content">
      <div className="compliance-score">
        <h3>Compliance Score</h3>
        <div className="score-circle">
          <span className="score">{data.overall_compliance_score.toFixed(1)}</span>
          <span className="score-label">/ 100</span>
        </div>
      </div>

      <div className="audit-metrics">
        <div className="metric">
          <label>PHI Access Events</label>
          <value>{data.total_phi_access_events}</value>
        </div>
        <div className="metric">
          <label>Security Violations</label>
          <value className={data.security_violations > 0 ? 'warning' : 'success'}>
            {data.security_violations}
          </value>
        </div>
        <div className="metric">
          <label>Encryption Rate</label>
          <value>{data.encrypted_records_percentage}%</value>
        </div>
      </div>

      {data.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommendations</h4>
          <ul>
            {data.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Reports;
