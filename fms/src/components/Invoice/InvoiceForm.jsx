import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import '../../styles/Invoice.css';

const InvoiceItem = ({ item, index, onChange, onRemove }) => (
  <motion.div
    className="invoice-item"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="item-description">
      <input
        type="text"
        placeholder="Item description"
        value={item.description}
        onChange={(e) => onChange(index, 'description', e.target.value)}
        className="form-input"
      />
    </div>
    <div className="item-quantity">
      <input
        type="number"
        placeholder="Qty"
        value={item.qty}
        onChange={(e) => onChange(index, 'qty', parseInt(e.target.value) || 0)}
        className="form-input"
        min="0"
      />
    </div>
    <div className="item-price">
      <input
        type="number"
        placeholder="Price"
        value={item.price}
        onChange={(e) => onChange(index, 'price', parseFloat(e.target.value) || 0)}
        className="form-input"
        min="0"
        step="0.01"
      />
    </div>
    <div className="item-total">
      ${(item.qty * item.price).toFixed(2)}
    </div>
    <div className="item-actions">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="remove-item-btn"
        title="Remove item"
      >
        <FaTrash />
      </button>
    </div>
  </motion.div>
);

export default function InvoiceForm({ invoice = null, onSave, onCancel, customers = [] }) {
  const [formData, setFormData] = useState({
    customerName: '',
    items: [{ description: '', qty: 1, price: 0 }],
    status: 'draft',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        customerName: invoice.customerName || '',
        items: invoice.items?.length > 0 ? invoice.items : [{ description: '', qty: 1, price: 0 }],
        status: invoice.status || 'draft',
        notes: invoice.notes || ''
      });
    }
  }, [invoice]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', qty: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.qty * item.price), 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    const hasValidItems = formData.items.some(item => 
      item.description.trim() && item.qty > 0 && item.price > 0
    );

    if (!hasValidItems) {
      newErrors.items = 'At least one valid item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const invoiceData = {
      ...formData,
      total: calculateTotal(),
      number: invoice?.number || `INV-${Date.now()}`,
      createdAt: invoice?.createdAt || new Date().toISOString()
    };

    if (onSave) {
      onSave(invoiceData);
    }
  };

  return (
    <motion.div
      className="invoice-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-header">
        <h2>{invoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            <FaTimes style={{ marginRight: 8 }} />
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form-content">
        <div className="form-section">
          <h3>Invoice Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className={`form-input ${errors.customerName ? 'error' : ''}`}
                placeholder="Enter customer name"
              />
              {errors.customerName && <span className="error-message">{errors.customerName}</span>}
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-select"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary"
            >
              <FaPlus style={{ marginRight: 8 }} />
              Add Item
            </button>
          </div>
          
          {errors.items && <span className="error-message">{errors.items}</span>}
          
          <div className="items-list">
            {formData.items.map((item, index) => (
              <InvoiceItem
                key={index}
                item={item}
                index={index}
                onChange={handleItemChange}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-textarea"
            placeholder="Additional notes or terms..."
            rows="3"
          />
        </div>

        <div className="form-total">
          <div className="total-amount">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="form-footer">
          <button
            type="submit"
            className="btn-primary"
          >
            <FaSave style={{ marginRight: 8 }} />
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
