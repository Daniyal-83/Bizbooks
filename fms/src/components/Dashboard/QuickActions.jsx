import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaFileInvoice, FaUser, FaChartBar, FaCog } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const QuickAction = ({ icon: Icon, title, description, onClick, color, delay = 0 }) => (
  <motion.button
    className="quick-action"
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="action-icon" style={{ backgroundColor: color }}>
      <Icon />
    </div>
    <div className="action-content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    <FaPlus className="action-plus" />
  </motion.button>
);

export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      icon: FaFileInvoice,
      title: 'Create Invoice',
      description: 'Generate new invoice',
      color: '#2ca01c',
      action: 'create-invoice'
    },
    {
      icon: FaUser,
      title: 'Add Customer',
      description: 'Register new customer',
      color: '#3b82f6',
      action: 'add-customer'
    },
    {
      icon: FaChartBar,
      title: 'View Reports',
      description: 'Analytics & insights',
      color: '#8b5cf6',
      action: 'view-reports'
    },
    {
      icon: FaCog,
      title: 'Settings',
      description: 'Account preferences',
      color: '#6b7280',
      action: 'settings'
    }
  ];

  const handleActionClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      console.log(`Action clicked: ${action}`);
    }
  };

  return (
    <motion.div
      className="quick-actions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action, index) => (
          <QuickAction
            key={action.action}
            {...action}
            delay={index * 0.1}
            onClick={() => handleActionClick(action.action)}
          />
        ))}
      </div>
    </motion.div>
  );
}
