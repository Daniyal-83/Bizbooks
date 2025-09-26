// models/Invoice.js
const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  number: String,
  customerName: String,
  items: [{ description: String, qty: Number, price: Number }],
  total: Number,
  status: { type: String, enum: ['draft','sent','paid'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
