import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CustomerList from '../components/Customer/CustomerList';
import CustomerForm from '../components/Customer/CustomerForm';
import '../styles/Customer.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockCustomers = [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        company: 'Acme Corporation',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        status: 'active',
        invoiceCount: 5,
        totalSpent: 12500,
        createdAt: '2024-01-15T10:30:00Z',
        notes: 'Regular customer, prefers email communication'
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@techcorp.com',
        phone: '+1 (555) 987-6543',
        company: 'TechCorp Solutions',
        address: '456 Tech Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        status: 'vip',
        invoiceCount: 12,
        totalSpent: 45000,
        createdAt: '2023-11-20T14:20:00Z',
        notes: 'VIP customer, high-value projects'
      },
      {
        _id: '3',
        name: 'Mike Johnson',
        email: 'mike.j@startup.io',
        phone: '+1 (555) 456-7890',
        company: 'StartupCo',
        address: '789 Innovation Drive',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA',
        status: 'active',
        invoiceCount: 3,
        totalSpent: 8500,
        createdAt: '2024-01-05T09:15:00Z',
        notes: 'Startup client, flexible payment terms'
      },
      {
        _id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+1 (555) 321-0987',
        company: null,
        address: '321 Oak Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        status: 'inactive',
        invoiceCount: 1,
        totalSpent: 2500,
        createdAt: '2023-12-10T16:45:00Z',
        notes: 'Individual client, project completed'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCustomerAction = (action, customer) => {
    switch (action) {
      case 'create':
        setEditingCustomer(null);
        setShowForm(true);
        break;
      case 'edit':
        setEditingCustomer(customer);
        setShowForm(true);
        break;
      case 'view':
        // Navigate to customer view or open modal
        console.log('View customer:', customer);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this customer?')) {
          setCustomers(prev => prev.filter(c => c._id !== customer._id));
        }
        break;
      default:
        break;
    }
  };

  const handleSaveCustomer = (customerData) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => 
        prev.map(c => 
          c._id === editingCustomer._id 
            ? { ...customerData, _id: editingCustomer._id }
            : c
        )
      );
    } else {
      // Create new customer
      const newCustomer = {
        ...customerData,
        _id: Date.now().toString(),
        invoiceCount: 0,
        totalSpent: 0
      };
      setCustomers(prev => [newCustomer, ...prev]);
    }
    
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  if (loading) {
    return (
      <div className="customers-loading">
        <div className="loading-spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="customers-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {showForm ? (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={handleCancelForm}
        />
      ) : (
        <CustomerList
          customers={customers}
          onCustomerAction={handleCustomerAction}
        />
      )}
    </motion.div>
  );
}
