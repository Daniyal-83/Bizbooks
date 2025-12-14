import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaFileInvoice, FaUsers, FaChartLine } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="stat-icon" style={{ backgroundColor: color }}>
      <Icon />
    </div>
    <div className="stat-content">
      <h3 className="stat-title">{title}</h3>
      <p className="stat-value">{value}</p>
      {trend && (
        <div className={`stat-trend ${trend.type}`}>
          <FaChartLine />
          <span>{trend.value}%</span>
        </div>
      )}
    </div>
  </motion.div>
);

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalRevenue: { value: '$0', trend: { type: 'neutral', value: 0 } },
    totalInvoices: { value: '0', trend: { type: 'neutral', value: 0 } },
    totalCustomers: { value: '0', trend: { type: 'neutral', value: 0 } },
    pendingAmount: { value: '$0', trend: { type: 'neutral', value: 0 } },
  });

  useEffect(() => {
    const load = async () => {
      // TODO: fetch real stats from backend when endpoint exists
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="dashboard-stats">
      <StatCard
        title="Total Revenue"
        value={statsData.totalRevenue.value}
        icon={FaDollarSign}
        color="#2ca01c"
        trend={statsData.totalRevenue.trend}
        delay={0}
      />
      <StatCard
        title="Total Invoices"
        value={statsData.totalInvoices.value}
        icon={FaFileInvoice}
        color="#3b82f6"
        trend={statsData.totalInvoices.trend}
        delay={0.1}
      />
      <StatCard
        title="Total Customers"
        value={statsData.totalCustomers.value}
        icon={FaUsers}
        color="#8b5cf6"
        trend={statsData.totalCustomers.trend}
        delay={0.2}
      />
      <StatCard
        title="Pending Amount"
        value={statsData.pendingAmount.value}
        icon={FaChartLine}
        color="#f59e0b"
        trend={statsData.pendingAmount.trend}
        delay={0.3}
      />
    </div>
  );
}
