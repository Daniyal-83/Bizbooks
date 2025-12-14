import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';
import { getProfile, getStructuredSummary } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Pages.css';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [structuredSummary, setStructuredSummary] = useState({});

  useEffect(() => {
    let pollCount = 0;
    let intervalId;

    const load = async () => {
      try {
        await getProfile();
        const sumResp = await getStructuredSummary();
        setStructuredSummary(sumResp.data?.summary || {});
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    const startPolling = () => {
      intervalId = setInterval(async () => {
        pollCount += 1;
        try {
          const sumResp = await getStructuredSummary();
          setStructuredSummary(sumResp.data?.summary || {});
        } catch (_) {}
        if (pollCount >= 10) {
          clearInterval(intervalId);
        }
      }, 3000);
    };

    load().then(() => startPolling());

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <ErrorMessage
          title="Failed to load dashboard"
          message={error}
          onRetry={() => window.location.reload()}
          onGoHome={() => window.location.href = '/'}
          showGoHome={true}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        
      </div>
      <div className="dashboard-content">
        <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
          {['salary','bank_statement','cash_flow','report','other'].map((key) => (
            <div key={key} className="section-card">
              <h3>{({salary:'Salary',bank_statement:'Bank Statements',cash_flow:'Cash Flow Statements',report:'Reports',other:'Other'})[key]}</h3>
              <p>{structuredSummary[key]?.count || 0} documents</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <h2>Structured Data by Category</h2>

          {['salary','bank_statement','cash_flow','report','other'].map((catKey) => {
            const displayName = { salary:'Salary', bank_statement:'Bank Statements', cash_flow:'Cash Flow Statements', report:'Reports', other:'Other' }[catKey];
            const sum = structuredSummary[catKey];
            const cumulativeTable = sum?.cumulativeTable;
            return (
              <div key={catKey} style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 8 }}>{displayName} ({sum?.count || 0} files)</h3>
                {!sum || (sum.count || 0) === 0 || !cumulativeTable ? (
                  <p style={{ color: '#6b7280' }}>No structured data yet. Upload files to see them here.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          {(cumulativeTable.columns || []).map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(cumulativeTable.rows || []).map((row, idx) => (
                          <tr key={idx}>
                            {(cumulativeTable.columns || []).map((c) => (
                              <td key={c}>{row?.[c] ?? ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
