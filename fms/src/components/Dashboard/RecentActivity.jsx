import React from 'react';
import { motion } from 'framer-motion';
import { FaFileInvoice, FaUser, FaDollarSign, FaClock } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const ActivityItem = ({ type, description, time, amount, status, delay = 0 }) => {
  const getIcon = () => {
    switch (type) {
      case 'invoice': return <FaFileInvoice />;
      case 'customer': return <FaUser />;
      case 'payment': return <FaDollarSign />;
      default: return <FaClock />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#2ca01c';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <motion.div
      className="activity-item"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="activity-icon" style={{ color: getStatusColor(status) }}>
        {getIcon()}
      </div>
      <div className="activity-content">
        <p className="activity-description">{description}</p>
        <div className="activity-meta">
          <span className="activity-time">{time}</span>
          {amount && <span className="activity-amount">{amount}</span>}
        </div>
      </div>
      {status && (
        <div className="activity-status" style={{ backgroundColor: getStatusColor(status) }}>
          {status}
        </div>
      )}
    </motion.div>
  );
};

export default function RecentActivity({ activities = [] }) {
  const defaultActivities = [
    {
      type: 'invoice',
      description: 'Invoice #INV-001 created for John Doe',
      time: '2 hours ago',
      amount: '$1,250',
      status: 'pending'
    },
    {
      type: 'payment',
      description: 'Payment received from ABC Corp',
      time: '4 hours ago',
      amount: '$3,500',
      status: 'paid'
    },
    {
      type: 'customer',
      description: 'New customer registered: Jane Smith',
      time: '1 day ago',
      amount: null,
      status: null
    },
    {
      type: 'invoice',
      description: 'Invoice #INV-002 overdue',
      time: '2 days ago',
      amount: '$850',
      status: 'overdue'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <motion.div
      className="recent-activity"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="activity-header">
        <h3>Recent Activity</h3>
        <button className="view-all-btn">View All</button>
      </div>
      <div className="activity-list">
        {displayActivities.map((activity, index) => (
          <ActivityItem
            key={index}
            {...activity}
            delay={index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
}
