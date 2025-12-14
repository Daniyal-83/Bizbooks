import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InvoiceList from '../components/Invoice/InvoiceList';
import InvoiceForm from '../components/Invoice/InvoiceForm';
import { useAuth } from '../context/AuthContext';
import '../styles/Invoice.css';

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockInvoices = [
      {
        _id: '1',
        number: 'INV-001',
        customerName: 'John Doe',
        userId: 1,
        items: [
          { description: 'Web Development', qty: 1, price: 2500 },
          { description: 'UI/UX Design', qty: 1, price: 800 }
        ],
        total: 3300,
        status: 'sent',
        createdAt: '2024-01-15T10:30:00Z',
        notes: 'Payment due within 30 days'
      },
      {
        _id: '2',
        number: 'INV-002',
        customerName: 'ABC Corporation',
        userId: 2,
        items: [
          { description: 'Consulting Services', qty: 10, price: 150 }
        ],
        total: 1500,
        status: 'paid',
        createdAt: '2024-01-10T14:20:00Z',
        notes: 'Thank you for your business'
      },
      {
        _id: '3',
        number: 'INV-003',
        customerName: 'Jane Smith',
        userId: 1,
        items: [
          { description: 'Mobile App Development', qty: 1, price: 5000 },
          { description: 'Backend API', qty: 1, price: 2000 }
        ],
        total: 7000,
        status: 'draft',
        createdAt: '2024-01-20T09:15:00Z',
        notes: 'Draft - pending client approval'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      if (user) {
        setInvoices(mockInvoices.filter(inv => inv.userId === user.id));
      } else {
        setInvoices([]);
      }
      setLoading(false);
    }, 1000);
  }, [user]);

  const handleInvoiceAction = (action, invoice) => {
    switch (action) {
      case 'create':
        setEditingInvoice(null);
        setShowForm(true);
        break;
      case 'edit':
        setEditingInvoice(invoice);
        setShowForm(true);
        break;
      case 'view':
        // Navigate to invoice view or open modal
        console.log('View invoice:', invoice);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this invoice?')) {
          setInvoices(prev => prev.filter(inv => inv._id !== invoice._id));
        }
        break;
      case 'download':
        // Implement download functionality
        console.log('Download invoice:', invoice);
        break;
      default:
        break;
    }
  };

  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      // Update existing invoice
      setInvoices(prev => 
        prev.map(inv => 
          inv._id === editingInvoice._id 
            ? { ...invoiceData, _id: editingInvoice._id }
            : inv
        )
      );
    } else {
      // Create new invoice
      const newInvoice = {
        ...invoiceData,
        _id: Date.now().toString(),
        userId: user.id,
        customerName: user.name
      };
      setInvoices(prev => [newInvoice, ...prev]);
    }
    
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  if (loading) {
    return (
      <div className="invoices-loading">
        <div className="loading-spinner"></div>
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="invoices-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {showForm ? (
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSaveInvoice}
          onCancel={handleCancelForm}
        />
      ) : (
        <InvoiceList
          invoices={invoices}
          onInvoiceAction={handleInvoiceAction}
        />
      )}
    </motion.div>
  );
}
