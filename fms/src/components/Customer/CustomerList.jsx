import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEdit, FaTrash, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import '../../styles/Customer.css';

const CustomerCard = ({ customer, onView, onEdit, onDelete, delay = 0 }) => (
  <motion.div
    className="customer-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
  >
    <div className="customer-header">
      <div className="customer-avatar">
        {customer.name?.charAt(0).toUpperCase() || 'C'}
      </div>
      <div className="customer-info">
        <h3 className="customer-name">{customer.name}</h3>
        <p className="customer-company">{customer.company || 'Individual'}</p>
      </div>
      <div className="customer-actions">
        <button onClick={() => onView(customer)} className="action-btn view" title="View">
          <FaEye />
        </button>
        <button onClick={() => onEdit(customer)} className="action-btn edit" title="Edit">
          <FaEdit />
        </button>
        <button onClick={() => onDelete(customer)} className="action-btn delete" title="Delete">
          <FaTrash />
        </button>
      </div>
    </div>
    
    <div className="customer-details">
      {customer.email && (
        <div className="detail-item">
          <FaEnvelope className="detail-icon" />
          <span>{customer.email}</span>
        </div>
      )}
      {customer.phone && (
        <div className="detail-item">
          <FaPhone className="detail-icon" />
          <span>{customer.phone}</span>
        </div>
      )}
      {customer.address && (
        <div className="detail-item">
          <FaMapMarkerAlt className="detail-icon" />
          <span>{customer.address}</span>
        </div>
      )}
    </div>
    
    <div className="customer-stats">
      <div className="stat">
        <span className="stat-label">Invoices</span>
        <span className="stat-value">{customer.invoiceCount || 0}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Total</span>
        <span className="stat-value">${customer.totalSpent || 0}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Status</span>
        <span className={`status-badge status-${customer.status || 'active'}`}>
          {customer.status || 'Active'}
        </span>
      </div>
    </div>
  </motion.div>
);

export default function CustomerList({ customers = [], onCustomerAction }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleAction = (action, customer) => {
    if (onCustomerAction) {
      onCustomerAction(action, customer);
    } else {
      console.log(`${action} customer:`, customer);
    }
  };

  const statusCounts = {
    all: customers.length,
    active: customers.filter(c => c.status === 'active' || !c.status).length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    vip: customers.filter(c => c.status === 'vip').length
  };

  return (
    <motion.div
      className="customer-list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="customer-header">
        <div className="customer-title">
          <h2>Customers</h2>
          <p>Manage your customer relationships</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => handleAction('create', null)}
        >
          <FaPlus style={{ marginRight: 8 }} />
          Add Customer
        </button>
      </div>

      <div className="customer-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="customers-grid">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, index) => (
            <CustomerCard
              key={customer._id || index}
              customer={customer}
              onView={(c) => handleAction('view', c)}
              onEdit={(c) => handleAction('edit', c)}
              onDelete={(c) => handleAction('delete', c)}
              delay={index * 0.1}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <p>No customers found</p>
              <button 
                className="btn-secondary"
                onClick={() => handleAction('create', null)}
              >
                Add your first customer
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
