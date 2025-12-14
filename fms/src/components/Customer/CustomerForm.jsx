import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaUser, FaBuilding } from 'react-icons/fa';
import Input from '../UI/Input';
import Button from '../UI/Button';
import '../../styles/Customer.css';

export default function CustomerForm({ customer = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        country: customer.country || '',
        status: customer.status || 'active',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const customerData = {
      ...formData,
      createdAt: customer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onSave) {
      onSave(customerData);
    }
  };

  return (
    <motion.div
      className="customer-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-header">
        <div className="form-title">
          <div className="title-icon">
            {formData.company ? <FaBuilding /> : <FaUser />}
          </div>
          <div>
            <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
            <p>{customer ? 'Update customer information' : 'Create a new customer profile'}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onCancel}
          icon={<FaTimes />}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="customer-form-content">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <Input
              label="Full Name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
              className="form-input"
            />
            <Input
              label="Email"
              type="email"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <Input
              label="Phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              className="form-input"
            />
            <Input
              label="Company"
              placeholder="Company name (optional)"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-row">
            <Input
              label="Address"
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="form-input"
            />
            <Input
              label="City"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <Input
              label="State/Province"
              placeholder="State or Province"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="form-input"
            />
            <Input
              label="ZIP/Postal Code"
              placeholder="ZIP or Postal Code"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <Input
              label="Country"
              placeholder="Country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="form-input"
            />
            <div className="form-group">
              <label className="input-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label className="input-label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="form-input"
              placeholder="Additional notes about this customer..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-footer">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<FaSave />}
          >
            {customer ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
