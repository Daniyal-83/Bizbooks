import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEdit, FaTrash, FaDownload, FaPlus } from 'react-icons/fa';
import '../../styles/Invoice.css';

const InvoiceRow = ({ invoice, onView, onEdit, onDelete, onDownload, delay = 0 }) => (
  <motion.tr
    className="invoice-row"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ backgroundColor: '#f9fafb' }}
  >
    <td className="invoice-number">
      <span className="invoice-id">#{invoice.number}</span>
    </td>
    <td className="invoice-customer">{invoice.customerName}</td>
    <td className="invoice-date">{new Date(invoice.createdAt).toLocaleDateString()}</td>
    <td className="invoice-amount">${invoice.total?.toFixed(2) || '0.00'}</td>
    <td className="invoice-status">
      <span className={`status-badge status-${invoice.status}`}>
        {invoice.status}
      </span>
    </td>
    <td className="invoice-actions">
      <div className="action-buttons">
        <button onClick={() => onView(invoice)} className="action-btn view" title="View">
          <FaEye />
        </button>
        <button onClick={() => onEdit(invoice)} className="action-btn edit" title="Edit">
          <FaEdit />
        </button>
        <button onClick={() => onDownload(invoice)} className="action-btn download" title="Download">
          <FaDownload />
        </button>
        <button onClick={() => onDelete(invoice)} className="action-btn delete" title="Delete">
          <FaTrash />
        </button>
      </div>
    </td>
  </motion.tr>
);

export default function InvoiceList({ invoices = [], onInvoiceAction }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice => {
    const matchesFilter = filter === 'all' || invoice.status === filter;
    const matchesSearch = invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAction = (action, invoice) => {
    if (onInvoiceAction) {
      onInvoiceAction(action, invoice);
    } else {
      console.log(`${action} invoice:`, invoice);
    }
  };

  const statusCounts = {
    all: invoices.length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length
  };

  return (
    <motion.div
      className="invoice-list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="invoice-header">
        <div className="invoice-title">
          <h2>Invoices</h2>
          <p>Manage your invoices and payments</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => handleAction('create', null)}
        >
          <FaPlus style={{ marginRight: 8 }} />
          Create Invoice
        </button>
      </div>

      <div className="invoice-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice, index) => (
                <InvoiceRow
                  key={invoice._id || index}
                  invoice={invoice}
                  onView={(inv) => handleAction('view', inv)}
                  onEdit={(inv) => handleAction('edit', inv)}
                  onDelete={(inv) => handleAction('delete', inv)}
                  onDownload={(inv) => handleAction('download', inv)}
                  delay={index * 0.05}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-content">
                    <p>No invoices found</p>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleAction('create', null)}
                    >
                      Create your first invoice
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
